# -*- coding: utf-8 -*-
"""
Escort Gaming — Office
Լոկալ վեբ օֆիս. Slack-ի պես չաթ + թասկերի բորդ։

Ճշմարտության աղբյուրը ֆայլերն են՝ office/chat/*.md ու
office/board/tasks/<status>/*.md։ Այս սերվերը դրանք կարդում ու գրում ա,
ուրիշ բազա չկա — git history-ն մնում ա արխիվը (CLAUDE.md)։

Աշխատացնել՝  py tools/office/server.py
"""

import json
import mimetypes
import os
import re
import shutil
import sys
import threading
import webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))

CHAT_DIR = os.path.join(ROOT, "office", "chat")
TASKS_DIR = os.path.join(ROOT, "office", "board", "tasks")
CITIZENS_DIR = os.path.join(ROOT, "office", "citizens")
AVATAR_DIR = os.path.join(CITIZENS_DIR, "avatars")

STATUSES = ["proposed", "approved", "doing", "review", "done"]

CHANNELS = [
    {"id": "general",   "name": "general",   "topic": "բոլորը + Aram"},
    {"id": "dev",       "name": "dev",       "topic": "ղեկավար, developer, QA + Aram"},
    {"id": "product",   "name": "product",   "topic": "ղեկավար, PM, դիզայներ"},
    {"id": "club96",    "name": "club96",    "topic": "ազատ գոտի — երգեր, կատակներ, գաղափարներ"},
    {"id": "decisions", "name": "decisions", "topic": "միայն վավերացված որոշումներ"},
]

REACTIONS_PATH = os.path.join(CHAT_DIR, "reactions.json")
ALLOWED_EMOJI = ["❤️", "😂", "👍", "🔥", "👏", "😮", "🎉", "💪"]

# [2026-09-07 15:30] Անուն (դեր)   ու decisions.md-ի տարբերակը՝ առանց ժամի,
# պիտակով. [2026-09-07] D-001 — Aram (founder)
MSG_HEAD = re.compile(
    r"^\[(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?\]\s+(.+?)\s*(?:\((.+?)\))?\s*$")
TAGGED = re.compile(r"^([A-Z]+-\d+)\s*[—-]\s*(.+)$")
FIELD = re.compile(r"^-\s+\*\*(.+?)\.?\*\*\s*(.*)$")

_write_lock = threading.Lock()


# ---------------------------------------------------------------- utilities

def read(path):
    with open(path, "r", encoding="utf-8") as fh:
        return fh.read()


def write(path, text):
    """Միշտ UTF-8 ու LF — ռեպոն LF ա, Windows-ի CRLF-ը չխառնենք։"""
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(text)


def now_stamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def today():
    return datetime.now().strftime("%Y-%m-%d")


def safe_name(part):
    """Ֆայլի անուն API-ից — ոչ մի path traversal։"""
    part = os.path.basename(unquote(part or ""))
    if not part or part.startswith("."):
        raise ValueError("bad name: %r" % part)
    return part


# ------------------------------------------------------------------- chat

def parse_chat(path):
    """Append-only md-ը ջարդում ա գրառումների։

    Ֆայլի սկիզբը (մինչև առաջին `---`) վերնագիրն ա։ Ամեն հաջորդ բլոկի
    առաջին տողը `[ամսաթիվ ժամ] Անուն (դեր)` ա։
    """
    if not os.path.exists(path):
        return "", []
    raw = read(path).replace("\r\n", "\n")
    blocks = re.split(r"(?m)^---\s*$", raw)
    header = blocks[0].strip()
    messages = []
    for block in blocks[1:]:
        lines = block.strip("\n").split("\n")
        while lines and not lines[0].strip():
            lines.pop(0)
        if not lines:
            continue
        head = MSG_HEAD.match(lines[0].strip())
        if not head:
            # Ձևաչափին չհամապատասխանող բլոկ — ցույց ենք տալիս ինչպես կա,
            # ոչ թե կուլ ենք տալիս։ Հորինելը արգելված ա։
            messages.append({
                "date": "", "time": "", "author": "?", "role": "", "tag": "",
                "text": block.strip(), "malformed": True,
            })
            continue
        date, time, author, role = head.groups()
        author = author.strip()
        tag = ""
        tagged = TAGGED.match(author)
        if tagged:
            tag, author = tagged.group(1), tagged.group(2).strip()
        messages.append({
            "date": date, "time": time or "",
            "author": author,
            "role": (role or "").strip(),
            "tag": tag,
            "text": "\n".join(lines[1:]).strip(),
            "malformed": False,
        })
    return header, messages


def append_message(channel_id, author, role, text):
    path = os.path.join(CHAT_DIR, "%s.md" % safe_name(channel_id))
    if not os.path.exists(path):
        raise ValueError("no such channel")
    text = text.replace("\r\n", "\n").strip()
    if not text:
        raise ValueError("empty message")
    who = "%s (%s)" % (author, role) if role else author
    entry = "\n---\n[%s] %s\n%s\n" % (now_stamp(), who, text)
    with _write_lock:
        body = read(path).replace("\r\n", "\n").rstrip("\n") + "\n"
        write(path, body + entry)


# ------------------------------------------------------------------ board

def parse_task(path, status):
    raw = read(path).replace("\r\n", "\n")
    lines = raw.split("\n")
    title = os.path.basename(path)[:-3]
    tid = ""
    for line in lines:
        if line.startswith("# "):
            title = line[2:].strip()
            m = re.match(r"(T-\d+)\s*[—-]\s*(.*)", title)
            if m:
                tid, title = m.group(1), m.group(2).strip()
            break
    fields = {}
    for line in lines:
        m = FIELD.match(line)
        if m:
            fields[m.group(1).strip().rstrip(".").lower()] = m.group(2).strip()
        elif line.startswith("## "):
            break
    # «— (PM)» = դեռ ազատ ա, բայց ուզում ա PM։ Փակագծայինը դեր ա, ոչ անուն։
    assignee = fields.get("assignee", "")
    if assignee.startswith("—"):
        assignee = assignee.lstrip("— ").strip()
    wanted = ""
    m = re.match(r"^\((.+)\)$", assignee)
    if m:
        wanted, assignee = m.group(1).strip(), ""
    return {
        "wanted": wanted,
        "file": os.path.basename(path),
        "id": tid,
        "title": title,
        "status": status,
        "author": fields.get("author", ""),
        "assignee": assignee,
        "opened": fields.get("opened", ""),
        "priority": fields.get("priority", ""),
        "body": raw,
    }


def load_board():
    board = {s: [] for s in STATUSES}
    for status in STATUSES:
        folder = os.path.join(TASKS_DIR, status)
        if not os.path.isdir(folder):
            continue
        for name in sorted(os.listdir(folder)):
            if not name.endswith(".md"):
                continue
            board[status].append(parse_task(os.path.join(folder, name), status))
    return board


def find_task(file_name):
    for status in STATUSES:
        path = os.path.join(TASKS_DIR, status, file_name)
        if os.path.exists(path):
            return status, path
    return None, None


def append_log(raw, line):
    raw = raw.replace("\r\n", "\n").rstrip("\n")
    if re.search(r"(?m)^## Log\s*$", raw):
        return raw + "\n" + line + "\n"
    return raw + "\n\n## Log\n" + line + "\n"


def move_task(file_name, to_status, actor):
    file_name = safe_name(file_name)
    if to_status not in STATUSES:
        raise ValueError("bad status")
    with _write_lock:
        frm, path = find_task(file_name)
        if not path:
            raise ValueError("task not found")
        if frm == to_status:
            return
        raw = append_log(read(path), "- [%s] %s. %s → %s" % (today(), actor, frm, to_status))
        dest_dir = os.path.join(TASKS_DIR, to_status)
        os.makedirs(dest_dir, exist_ok=True)
        write(path, raw)
        shutil.move(path, os.path.join(dest_dir, file_name))


def set_assignee(file_name, assignee, actor):
    file_name = safe_name(file_name)
    with _write_lock:
        _, path = find_task(file_name)
        if not path:
            raise ValueError("task not found")
        raw = read(path).replace("\r\n", "\n")
        shown = assignee if assignee else "—"
        new, n = re.subn(r"(?m)^-\s+\*\*Assignee\.?\*\*.*$",
                         "- **Assignee.** %s" % shown, raw, count=1)
        if not n:
            raise ValueError("no Assignee field in task file")
        new = append_log(new, "- [%s] %s. assignee → %s" % (today(), actor, shown))
        write(path, new)


def next_task_id():
    used = []
    for status in STATUSES:
        folder = os.path.join(TASKS_DIR, status)
        if not os.path.isdir(folder):
            continue
        for name in os.listdir(folder):
            m = re.match(r"T-(\d+)", name)
            if m:
                used.append(int(m.group(1)))
    return "T-%04d" % ((max(used) + 1) if used else 1)


def slugify(title):
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", title).strip("-").lower()
    return slug[:40] or "task"


def create_task(title, author, priority, need, context):
    title = (title or "").strip()
    need = (need or "").strip()
    if not title or not need:
        raise ValueError("title and need are required")
    with _write_lock:
        tid = next_task_id()
        name = "%s-%s.md" % (tid, slugify(title))
        body = (
            "# %s — %s\n\n"
            "- **Author.** %s\n"
            "- **Assignee.** —\n"
            "- **Opened.** %s\n"
            "- **Priority.** %s\n\n"
            "## Ինչ ա պետք\n%s\n\n"
            "## Կոնտեքստ\n%s\n\n"
            "## Log\n- [%s] %s. բացվեց։\n"
        ) % (tid, title, author, today(), priority or "P2", need,
             (context or "").strip() or "—", today(), author)
        folder = os.path.join(TASKS_DIR, "proposed")
        os.makedirs(folder, exist_ok=True)
        write(os.path.join(folder, name), body)
        return name


# -------------------------------------------------------------- reactions

def load_reactions():
    if not os.path.exists(REACTIONS_PATH):
        return {}
    try:
        return json.loads(read(REACTIONS_PATH))
    except Exception:
        return {}


def toggle_reaction(channel_id, msg_index, emoji, name):
    """Ռեակցիա դնել/հանել. պահվում ա reactions.json-ում՝ չաթի md-ները
    append-only թողնելով։ Բանալին գրառման ինդեքսն ա (append-only ⇒ կայուն)։"""
    channel_id = safe_name(channel_id)
    if emoji not in ALLOWED_EMOJI:
        raise ValueError("emoji not allowed")
    name = (name or "").strip()
    if not name:
        raise ValueError("name required")
    msg_index = int(msg_index)
    with _write_lock:
        data = load_reactions()
        ch = data.setdefault(channel_id, {})
        msg = ch.setdefault(str(msg_index), {})
        who = msg.setdefault(emoji, [])
        if name in who:
            who.remove(name)
            if not who:
                del msg[emoji]
            if not msg:
                del ch[str(msg_index)]
        else:
            who.append(name)
        write(REACTIONS_PATH, json.dumps(data, ensure_ascii=False, indent=1))


# --------------------------------------------------------------- citizens

def load_citizens():
    people = []
    if not os.path.isdir(CITIZENS_DIR):
        return people
    for fname in sorted(os.listdir(CITIZENS_DIR)):
        if not fname.endswith(".md") or fname == "README.md":
            continue
        path = os.path.join(CITIZENS_DIR, fname)
        raw = read(path).replace("\r\n", "\n")
        slug = fname[:-3]
        name = slug
        for line in raw.split("\n"):
            if line.startswith("# "):
                name = line[2:].strip()
                break
        fields = {}
        for line in raw.split("\n"):
            m = FIELD.match(line)
            if m:
                fields[m.group(1).strip().rstrip(".").lower()] = m.group(2).strip()
        role = fields.get("դեր", "") or fields.get("role", "")
        avatar = None
        for ext in (".png", ".jpg", ".jpeg", ".webp"):
            if os.path.exists(os.path.join(AVATAR_DIR, slug + ext)):
                avatar = "/avatar/" + slug + ext
                break
        people.append({
            "slug": slug, "name": name, "role": role,
            "kind": fields.get("տեսակ", ""),
            "since": fields.get("քաղաքացիություն", ""),
            "avatar": avatar, "body": raw,
        })
    return people


def load_state():
    channels = []
    for ch in CHANNELS:
        header, messages = parse_chat(os.path.join(CHAT_DIR, ch["id"] + ".md"))
        channels.append(dict(ch, header=header, messages=messages))
    return {
        "studio": "Escort Gaming",
        "now": now_stamp(),
        "channels": channels,
        "board": load_board(),
        "statuses": STATUSES,
        "citizens": load_citizens(),
        "reactions": load_reactions(),
        "emoji": ALLOWED_EMOJI,
    }


# ------------------------------------------------------------------ server

class Handler(BaseHTTPRequestHandler):
    server_version = "EscortOffice/1.0"

    def log_message(self, fmt, *args):
        pass  # լոգը մաքուր պահենք

    # -- helpers

    def send_json(self, payload, code=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, path, ctype=None):
        if not os.path.exists(path):
            self.send_json({"error": "not found"}, 404)
            return
        with open(path, "rb") as fh:
            body = fh.read()
        ctype = ctype or (mimetypes.guess_type(path)[0] or "application/octet-stream")
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        if not length:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    # -- routes

    def do_GET(self):
        path = urlparse(self.path).path
        try:
            if path in ("/", "/index.html"):
                self.send_file(os.path.join(HERE, "index.html"), "text/html; charset=utf-8")
            elif path == "/api/state":
                self.send_json(load_state())
            elif path.startswith("/avatar/"):
                self.send_file(os.path.join(AVATAR_DIR, safe_name(path[8:])))
            else:
                self.send_json({"error": "not found"}, 404)
        except Exception as exc:
            self.send_json({"error": str(exc)}, 500)

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            data = self.read_json()
            if path == "/api/message":
                append_message(data.get("channel"), data.get("author"),
                               data.get("role"), data.get("text"))
            elif path == "/api/task/move":
                move_task(data.get("file"), data.get("to"), data.get("actor") or "?")
            elif path == "/api/task/assign":
                set_assignee(data.get("file"), (data.get("assignee") or "").strip(),
                             data.get("actor") or "?")
            elif path == "/api/react":
                toggle_reaction(data.get("channel"), data.get("msg"),
                                data.get("emoji"), data.get("name"))
            elif path == "/api/task/create":
                create_task(data.get("title"), data.get("author") or "?",
                            data.get("priority"), data.get("need"), data.get("context"))
            else:
                self.send_json({"error": "not found"}, 404)
                return
            self.send_json(load_state())
        except ValueError as exc:
            self.send_json({"error": str(exc)}, 400)
        except Exception as exc:
            self.send_json({"error": str(exc)}, 500)


class OfficeServer(ThreadingHTTPServer):
    # Windows-ում SO_REUSEADDR-ը թույլ ա տալիս ԵՐԿՈՒ պրոցես նստի նույն
    # պորտին — երկրորդ double-click-ից ամեն ինչ խառնվում էր։ Անջատում ենք,
    # որ երկրորդ բացելը ազնիվ սխալ տա, ու մենք բռնենք ներքևում։
    allow_reuse_address = False


def already_running(port):
    """Արդեն աշխատող օֆի՞ս ա նստած պորտին։"""
    import urllib.request
    try:
        with urllib.request.urlopen("http://127.0.0.1:%d/api/state" % port, timeout=2) as r:
            return json.loads(r.read().decode("utf-8")).get("studio") == "Escort Gaming"
    except Exception:
        return False


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 7777
    if not os.path.isdir(CHAT_DIR):
        print("Chem gtnum office/chat/ — server must run inside the repo.")
        print("Expected root: %s" % ROOT)
        return 1
    url = "http://127.0.0.1:%d/" % port
    try:
        httpd = OfficeServer(("127.0.0.1", port), Handler)
    except OSError:
        if already_running(port):
            print("Office arden ashxatum a -> %s (bacum em brauzery)" % url)
            webbrowser.open(url)
            return 0
        print("Port %d-y zbaghvats a urish tsragrov. Pordzir` py tools/office/server.py %d"
              % (port, port + 1))
        return 1
    print("Escort Gaming - Office")
    print("  %s" % url)
    print("  root: %s" % ROOT)
    print("  stop: Ctrl+C")
    threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nOffice closed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

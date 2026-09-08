# -*- coding: utf-8 -*-
"""Չաթի ու բորդի հսկիչ Claude Code session-ի համար։

Ամեն 2 վրկ նայում ա office/chat/*.md ու office/board/tasks/*/ ֆայլերը։
Ամեն ՆՈՐ գրառում (բացի SELF_NAME-ի գրածներից) ու բորդի ամեն փոփոխություն
տպում ա stdout-ում մեկ տողով — Monitor-ը դա դարձնում ա ծանուցում,
ագենտը արթնանում ա ու պատասխանում չաթում։

    py -X utf8 -u tools/office/watch.py [self-name]
"""
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CHAT_DIR = os.path.join(ROOT, "office", "chat")
TASKS_DIR = os.path.join(ROOT, "office", "board", "tasks")
STATUSES = ["proposed", "approved", "doing", "review", "done"]

SELF_NAME = sys.argv[1] if len(sys.argv) > 1 else "Սևակ"
HEAD = re.compile(r"^\[(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?\]\s+(.+?)\s*(?:\((.+?)\))?\s*$")


def emit(line):
    print(line.replace("\n", " "), flush=True)


def chat_files():
    out = []
    if os.path.isdir(CHAT_DIR):
        out += sorted(f for f in os.listdir(CHAT_DIR) if f.endswith(".md"))
    dm = os.path.join(CHAT_DIR, "dm")
    if os.path.isdir(dm):
        out += sorted("dm/" + f for f in os.listdir(dm) if f.endswith(".md"))
    return out


def read_tail(path, offset):
    with open(path, "rb") as fh:
        fh.seek(offset)
        return fh.read().decode("utf-8", errors="replace")


def new_messages(chunk):
    """Հավելված կտորից հանում ա (author, role, text) եռյակները։"""
    out = []
    for block in re.split(r"(?m)^---\s*$", chunk):
        lines = [l for l in block.strip("\n").split("\n")]
        while lines and not lines[0].strip():
            lines.pop(0)
        if not lines:
            continue
        m = HEAD.match(lines[0].strip())
        if m:
            out.append((m.group(3).strip(), (m.group(4) or "").strip(),
                        " ".join(l.strip() for l in lines[1:] if l.strip())))
    return out


def board_snapshot():
    snap = {}
    for status in STATUSES:
        folder = os.path.join(TASKS_DIR, status)
        if os.path.isdir(folder):
            for name in os.listdir(folder):
                if name.endswith(".md"):
                    snap[name] = status
    return snap


def main():
    offsets = {}
    for f in chat_files():
        offsets[f] = os.path.getsize(os.path.join(CHAT_DIR, f))
    board = board_snapshot()
    emit("WATCH STARTED: office chat + board (self=%s)" % SELF_NAME)

    while True:
        time.sleep(2)
        try:
            # --- չաթեր
            for f in chat_files():
                path = os.path.join(CHAT_DIR, f)
                size = os.path.getsize(path)
                prev = offsets.get(f, 0)
                if size < prev:          # ֆայլը վերագրվել ա (խմբագրում)
                    offsets[f] = size
                    continue
                if size > prev:
                    time.sleep(0.3)      # թող գրողը ավարտի
                    size = os.path.getsize(path)
                    chunk = read_tail(path, prev)
                    offsets[f] = size
                    for author, role, text in new_messages(chunk):
                        if author == SELF_NAME:
                            continue
                        short = text if len(text) <= 300 else text[:300] + "…"
                        emit("CHAT %s | %s (%s): %s" % (f[:-3], author, role, short))
            # --- բորդ
            cur = board_snapshot()
            for name, status in cur.items():
                if name not in board:
                    emit("BOARD new in %s/: %s" % (status, name))
                elif board[name] != status:
                    emit("BOARD %s: %s -> %s" % (name, board[name], status))
            for name in board:
                if name not in cur:
                    emit("BOARD removed: %s" % name)
            board = cur
        except Exception as exc:         # մի սխալից չմեռնի
            emit("WATCH ERROR: %r" % exc)
            time.sleep(3)


if __name__ == "__main__":
    main()

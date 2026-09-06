# -*- coding: utf-8 -*-
"""Ինքնաստուգում. գրում ա, կարդում, հետո ամեն բան հետ ա բերում git-ով։

    py tools/office/selftest.py [port]

Աշխատացնել ՄԻԱՅՆ մաքուր working tree-ի վրա — վերջում անում ա
`git checkout -- office/` ու ջնջում իր ստեղծած թասկը։
"""
import json
import os
import subprocess
import sys
import urllib.request

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 7778
BASE = "http://127.0.0.1:%d" % PORT
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

ok = True


def check(label, cond, extra=""):
    global ok
    print(("  PASS  " if cond else "  FAIL  ") + label + (("  " + extra) if extra else ""))
    if not cond:
        ok = False


def call(path, payload=None):
    url = BASE + path
    if payload is None:
        req = urllib.request.Request(url)
    else:
        req = urllib.request.Request(
            url, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as err:
        return err.code, json.loads(err.read().decode("utf-8"))


def main():
    print("Office selftest -> %s" % BASE)

    code, state = call("/api/state")
    check("GET /api/state", code == 200)
    check("4 channels", len(state["channels"]) == 4)
    check("3 approved tasks", len(state["board"]["approved"]) == 3)
    check("citizens found", len(state["citizens"]) >= 2)
    dec = [c for c in state["channels"] if c["id"] == "decisions"][0]
    check("decisions D-001 parsed", dec["messages"][0].get("tag") == "D-001",
          repr(dec["messages"][0].get("tag")))

    # -- message with Armenian text
    text = "Ինքնաստուգում՝ հայերեն, `կոդ`, **թանձր**, @Aram"
    code, state = call("/api/message", {"channel": "general", "author": "Սևակ",
                                        "role": "lead", "text": text})
    check("POST /api/message", code == 200, str(state)[:120])
    gen = [c for c in state["channels"] if c["id"] == "general"][0]
    last = gen["messages"][-1]
    check("message text round-trips", last["text"] == text, repr(last["text"])[:80])
    check("author round-trips", last["author"] == "Սևակ", repr(last["author"]))
    check("role round-trips", last["role"] == "lead")
    with open(os.path.join(ROOT, "office", "chat", "general.md"), "r", encoding="utf-8") as fh:
        raw = fh.read()
    check("file is real UTF-8 on disk", "Ինքնաստուգում" in raw)
    check("no CRLF introduced", "\r\n" not in raw)

    # -- empty message rejected
    code, _ = call("/api/message", {"channel": "general", "author": "Ս", "role": "lead", "text": "  "})
    check("empty message rejected", code == 400)

    # -- task lifecycle
    code, state = call("/api/task/create", {"title": "Selftest task", "author": "Սևակ",
                                            "priority": "P1", "need": "Ստուգում՝ թասկ սարքելը",
                                            "context": "Ջնջվում ա տեստի վերջում։"})
    check("POST /api/task/create", code == 200, str(state)[:160])
    created = [t for t in state["board"]["proposed"] if t["title"] == "Selftest task"]
    check("task appears in proposed", len(created) == 1)
    if not created:
        return finish()
    task = created[0]
    check("task id auto-numbered", task["id"] == "T-0004", task["id"])

    code, state = call("/api/task/assign", {"file": task["file"], "assignee": "Սևակ", "actor": "Սևակ"})
    check("POST /api/task/assign", code == 200, str(state)[:120])
    found = [t for t in state["board"]["proposed"] if t["file"] == task["file"]]
    check("assignee saved", found and found[0]["assignee"] == "Սևակ",
          repr(found[0]["assignee"]) if found else "")

    code, state = call("/api/task/move", {"file": task["file"], "to": "doing", "actor": "Սևակ"})
    check("POST /api/task/move", code == 200, str(state)[:120])
    check("moved to doing", any(t["file"] == task["file"] for t in state["board"]["doing"]))
    check("gone from proposed", not any(t["file"] == task["file"] for t in state["board"]["proposed"]))
    moved = [t for t in state["board"]["doing"] if t["file"] == task["file"]][0]
    check("move logged", "proposed → doing" in moved["body"])

    code, _ = call("/api/task/move", {"file": task["file"], "to": "nowhere", "actor": "x"})
    check("bad status rejected", code == 400)
    code, _ = call("/api/task/move", {"file": "../../../CLAUDE.md", "to": "done", "actor": "x"})
    check("path traversal blocked", code == 400)
    check("CLAUDE.md untouched", os.path.exists(os.path.join(ROOT, "CLAUDE.md")))

    return finish(task["file"])


def finish(task_file=None):
    print("\nմաքրում…")
    if task_file:
        for status in ("proposed", "approved", "doing", "review", "done"):
            path = os.path.join(ROOT, "office", "board", "tasks", status, task_file)
            if os.path.exists(path):
                os.remove(path)
                print("  ջնջվեց %s/%s" % (status, task_file))
    subprocess.run(["git", "checkout", "--", "office/"], cwd=ROOT, check=False)
    dirty = subprocess.run(["git", "status", "--porcelain", "office/"], cwd=ROOT,
                           capture_output=True, text=True).stdout.strip()
    check("working tree restored", dirty == "", repr(dirty))
    print("\n%s" % ("ԱՄԵՆ ԻՆՉ ԱՆՑԱՎ" if ok else "ԿԱՆ ԸՆԿԱԾ ՍՏՈՒԳՈՒՄՆԵՐ"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())

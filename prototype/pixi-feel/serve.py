"""Static server pixi-feel-ի համար (ES module-ներ). Windows-ի python -m http.server-ը .js-ը
text/plain ա տալիս (registry mimetypes) — module script-ը դրանից չի բեռնվում։ Սա ուղղում ա։
Օգտագործում. py serve.py [port]   (default 7788), հետո http://127.0.0.1:7788/
"""
import sys, os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

class H(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".mjs": "text/javascript",
                      ".webp": "image/webp", ".json": "application/json"}
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def log_message(self, fmt, *args):
        pass  # լուռ

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 7788
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    if hasattr(sys.stdout, "reconfigure"):  # pipe-ի տակ (cp1252) հայերեն print-ը չընկնի
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    print(f"pixi-feel → http://127.0.0.1:{port}/  (Ctrl+C՝ կանգնեցնել)")
    ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()

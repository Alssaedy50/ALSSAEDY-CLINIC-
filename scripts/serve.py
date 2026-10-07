#!/usr/bin/env python3
"""ALSSAEDY CLINIC — static file server + lightweight cloud-sync API.

Serves the receipt app from the repository root and adds a keyed backup endpoint
so the clinic can synchronise receipts/patients between devices without any
external service.

Endpoints:
    GET  /api/clinic-sync?key=<clinic-key>   -> latest snapshot (or {found:false})
    PUT  /api/clinic-sync?key=<clinic-key>   -> store a snapshot, version-checked
    GET  /api/health                    -> {ok:true}

Storage: output/sync/<key-hash>.json  (outside the served app, git-ignored).

Usage:  python3 scripts/serve.py [port]
"""
import hashlib
import json
import os
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORE_DIR = os.path.join(ROOT, "output", "sync")
MAX_BODY = 25 * 1024 * 1024  # 25 MB per clinic snapshot
_lock = threading.Lock()


def _key_file(key: str) -> str:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()[:32]
    return os.path.join(STORE_DIR, digest + ".json")


def _read(key: str):
    path = _key_file(key)
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return None


def _write(key: str, record: dict):
    os.makedirs(STORE_DIR, exist_ok=True)
    tmp = _key_file(key) + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(record, fh, ensure_ascii=False)
    os.replace(tmp, _key_file(key))


class ClinicHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):  # keep the console readable
        if "/api/" in (self.path or ""):
            super().log_message(fmt, *args)

    def _json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_OPTIONS(self):
        self._json({"ok": True})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            return self._json({"ok": True, "service": "alssaedy-sync"})
        if parsed.path in ("/api/backup", "/api/clinic-sync"):
            key = (parse_qs(parsed.query).get("key") or [""])[0].strip()
            if not key:
                return self._json({"error": "missing_key"}, 400)
            with _lock:
                record = _read(key)
            if not record:
                return self._json({"found": False, "record": None})
            return self._json({"found": True, "record": record})
        return super().do_GET()

    def do_HEAD(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            return self.do_GET()
        return super().do_HEAD()

    def do_PUT(self):
        parsed = urlparse(self.path)
        if parsed.path not in ("/api/backup", "/api/clinic-sync"):
            return self._json({"error": "not_found"}, 404)
        key = (parse_qs(parsed.query).get("key") or [""])[0].strip()
        if not key:
            return self._json({"error": "missing_key"}, 400)
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY:
            return self._json({"error": "invalid_size"}, 413)
        try:
            body = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return self._json({"error": "invalid_json"}, 400)
        payload = body.get("payload")
        if not isinstance(payload, dict):
            return self._json({"error": "invalid_payload"}, 400)

        with _lock:
            current = _read(key) or {}
            current_version = int(current.get("version") or 0)
            base_version = int(body.get("baseVersion") or 0)
            if current and base_version != current_version:
                return self._json({"error": "sync_conflict", "record": current}, 409)
            record = {
                "version": current_version + 1,
                "updatedAt": body.get("updatedAt") or "",
                "clientId": str(body.get("clientId") or "unknown")[:120],
                "payload": payload,
            }
            _write(key, record)
        return self._json({"ok": True, "record": record})


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 12000
    os.makedirs(STORE_DIR, exist_ok=True)
    server = ThreadingHTTPServer(("0.0.0.0", port), ClinicHandler)
    print(f"ALSSAEDY CLINIC serving {ROOT} on http://0.0.0.0:{port} (sync at /api/clinic-sync)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    main()

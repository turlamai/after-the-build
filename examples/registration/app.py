"""Local-only teaching application; not a production HTTP server."""
import json
import sqlite3
from contextlib import closing
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re

CAPACITY = 20
MAX_BODY = 4096
ROOT = Path(__file__).resolve().parent


def connect(path):
    return sqlite3.connect(path, timeout=10)


def initialize(path):
    with closing(connect(path)) as db, db:
        db.execute("""CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY,
            request_id TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL
        )""")


def status(path):
    with closing(connect(path)) as db:
        count = db.execute("SELECT COUNT(*) FROM registrations").fetchone()[0]
    return {"capacity": CAPACITY, "registered": count, "remaining": CAPACITY - count}


def register(path, name, request_id):
    if not isinstance(name, str) or not name.strip() or len(name.strip()) > 80:
        return 400, {"error": "invalid_name"}
    if not isinstance(request_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", request_id):
        return 400, {"error": "invalid_request_id"}
    name = name.strip()
    with closing(connect(path)) as db, db:
        db.execute("BEGIN IMMEDIATE")
        previous = db.execute(
            "SELECT id, name FROM registrations WHERE request_id = ?", (request_id,)
        ).fetchone()
        if previous:
            if previous[1] != name:
                return 409, {"error": "request_conflict"}
            return 200, {"id": previous[0], "repeated": True}
        count = db.execute("SELECT COUNT(*) FROM registrations").fetchone()[0]
        if count >= CAPACITY:
            return 409, {"error": "capacity_full"}
        cursor = db.execute(
            "INSERT INTO registrations(request_id, name) VALUES (?, ?)", (request_id, name)
        )
        return 201, {"id": cursor.lastrowid, "repeated": False}


def make_server(path, port=8000):
    initialize(path)

    class Handler(BaseHTTPRequestHandler):
        def respond(self, code, data, content_type):
            self.send_response(code)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(data)

        def json_response(self, code, value):
            self.respond(code, json.dumps(value, ensure_ascii=False).encode("utf-8"),
                         "application/json; charset=utf-8")

        def do_GET(self):
            if self.path == "/":
                self.respond(200, (ROOT / "index.html").read_bytes(), "text/html; charset=utf-8")
            elif self.path == "/api/status":
                try:
                    self.json_response(200, status(path))
                except sqlite3.Error:
                    self.json_response(503, {"error": "database_unavailable"})
            else:
                self.json_response(404, {"error": "not_found"})

        def do_POST(self):
            if self.path != "/api/registrations":
                return self.json_response(404, {"error": "not_found"})
            if self.headers.get_content_type() != "application/json":
                return self.json_response(415, {"error": "unsupported_content_type"})
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if not 0 < size <= MAX_BODY:
                    raise ValueError("invalid length")
                value = json.loads(self.rfile.read(size).decode("utf-8"))
                if not isinstance(value, dict):
                    raise ValueError("expected object")
            except (ValueError, UnicodeError):
                return self.json_response(400, {"error": "invalid_body"})
            try:
                code, result = register(path, value.get("name"), value.get("request_id"))
            except sqlite3.Error:
                return self.json_response(503, {"error": "database_unavailable"})
            self.json_response(code, result)

    return ThreadingHTTPServer(("127.0.0.1", port), Handler)


if __name__ == "__main__":
    with make_server(ROOT / "registration.db") as server:
        print("Local demonstration: http://127.0.0.1:8000/")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass

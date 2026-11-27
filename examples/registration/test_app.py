import json
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from app import initialize, status, register, make_server


class RegistrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "test.db"
        initialize(self.path)

    def test_repeated_and_conflicting_requests(self):
        code, first = register(self.path, "小林", "request-1")
        self.assertEqual(code, 201)
        self.assertEqual(register(self.path, "小林", "request-1"),
                         (200, {"id": first["id"], "repeated": True}))
        self.assertEqual(register(self.path, "小王", "request-1")[0], 409)
        self.assertEqual(status(self.path)["registered"], 1)

    def test_invalid_input(self):
        for name, token in [("", "x"), (None, "x"), ("a" * 81, "x"), ("小林", "")]:
            self.assertEqual(register(self.path, name, token)[0], 400)
        self.assertEqual(status(self.path)["registered"], 0)

    def test_capacity_and_concurrency(self):
        for i in range(19):
            self.assertEqual(register(self.path, "测试人员", f"seed-{i}")[0], 201)
        gate = threading.Barrier(2)

        def attempt(token):
            gate.wait(timeout=5)
            return register(self.path, "测试人员", token)[0]

        with ThreadPoolExecutor(max_workers=2) as pool:
            self.assertEqual(sorted(pool.map(attempt, ["a", "b"])), [201, 409])
        self.assertEqual(status(self.path), {"capacity": 20, "registered": 20, "remaining": 0})
        self.assertEqual(register(self.path, "测试人员", "extra")[0], 409)

    def test_concurrent_same_request(self):
        gate = threading.Barrier(2)

        def attempt(_):
            gate.wait(timeout=5)
            return register(self.path, "小林", "same-request")

        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(attempt, range(2)))
        self.assertEqual(sorted(code for code, _ in results), [200, 201])
        self.assertEqual(results[0][1]["id"], results[1][1]["id"])
        self.assertEqual(status(self.path)["registered"], 1)

    def test_retry_after_capacity_full(self):
        code, first = register(self.path, "小林", "first")
        self.assertEqual(code, 201)
        for i in range(19):
            self.assertEqual(register(self.path, "测试人员", f"fill-{i}")[0], 201)
        self.assertEqual(register(self.path, " 小林 ", "first"),
                         (200, {"id": first["id"], "repeated": True}))
        self.assertEqual(register(self.path, "其他", "first"),
                         (409, {"error": "request_conflict"}))
        self.assertEqual(status(self.path)["registered"], 20)

    def test_persistence(self):
        register(self.path, "小林", "persist")
        initialize(self.path)
        self.assertEqual(status(self.path)["registered"], 1)

    def test_http(self):
        server = make_server(self.path, 0)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        self.addCleanup(server.server_close)
        self.addCleanup(worker.join, 5)
        self.addCleanup(server.shutdown)
        base = f"http://127.0.0.1:{server.server_port}"
        with urlopen(base + "/", timeout=5) as response:
            self.assertIn("活动报名", response.read().decode("utf-8"))
        request = Request(base + "/api/registrations",
                          data=json.dumps({"name": "小林", "request_id": "http-1"}).encode(),
                          headers={"Content-Type": "application/json"}, method="POST")
        with urlopen(request, timeout=5) as response:
            self.assertEqual(response.status, 201)
        with urlopen(base + "/api/status", timeout=5) as response:
            self.assertEqual(json.load(response)["registered"], 1)
        bad = Request(base + "/api/registrations", data=b"{}",
                      headers={"Content-Type": "application/json"}, method="POST")
        with self.assertRaises(HTTPError) as error:
            urlopen(bad, timeout=5)
        self.assertEqual(error.exception.code, 400)
        error.exception.close()

    def test_http_rejects_invalid_requests(self):
        server = make_server(self.path, 0)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        self.addCleanup(server.server_close)
        self.addCleanup(worker.join, 5)
        self.addCleanup(server.shutdown)
        base = f"http://127.0.0.1:{server.server_port}"
        cases = [
            ("/api/registrations", b"{}", "text/plain", 415, "unsupported_content_type"),
            ("/api/registrations", b"{", "application/json", 400, "invalid_body"),
            ("/api/registrations", b"[]", "application/json", 400, "invalid_body"),
            ("/api/registrations", b" " * 4097, "application/json", 400, "invalid_body"),
            ("/api/registrations", b"{}", "application/json", 400, "invalid_name"),
            ("/unknown", b"{}", "application/json", 404, "not_found"),
        ]
        for route, data, content_type, expected, detail in cases:
            with self.subTest(route=route, detail=detail):
                request = Request(base + route, data=data,
                                  headers={"Content-Type": content_type}, method="POST")
                with self.assertRaises(HTTPError) as error:
                    urlopen(request, timeout=5)
                with error.exception as response:
                    self.assertEqual(response.code, expected)
                    self.assertEqual(json.load(response)["error"], detail)
        self.assertEqual(status(self.path)["registered"], 0)


if __name__ == "__main__":
    unittest.main()

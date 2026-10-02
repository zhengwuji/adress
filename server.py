# -*- coding: utf-8 -*-
"""
美国地址生成器 - 本地服务（推荐启动方式）

    python server.py            # 打开 http://127.0.0.1:8765/

在静态文件服务之外提供数据更新接口：
    GET  /api/ping            探测更新服务是否可用
    POST /api/update          触发数据更新（重新下载 GeoNames 全部国家并重建）
    GET  /api/update/status   查询更新进度 {running, started, ok, log[]}
"""
import json
import subprocess
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = 8765

_state = {"running": False, "started": False, "ok": None, "log": []}
_lock = threading.Lock()


def run_update():
    with _lock:
        _state.update({"running": True, "started": True, "ok": None, "log": []})
    try:
        proc = subprocess.Popen(
            [sys.executable, "-u", str(ROOT / "tools" / "build_data.py"), "--force"],
            cwd=str(ROOT), stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, encoding="utf-8", errors="replace")
        for line in proc.stdout:
            with _lock:
                _state["log"].append(line.rstrip())
                _state["log"] = _state["log"][-200:]
        code = proc.wait()
        with _lock:
            _state["ok"] = (code == 0)
            _state["log"].append(f"[exit {code}]")
    except Exception as e:
        with _lock:
            _state["ok"] = False
            _state["log"].append(f"ERROR: {e}")
    finally:
        with _lock:
            _state["running"] = False


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, fmt, *args):
        pass  # 静默访问日志

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/ping":
            return self._json({"ok": True, "updater": True})
        if self.path == "/api/update/status":
            with _lock:
                return self._json({k: (list(v) if isinstance(v, list) else v) for k, v in _state.items()})
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/update":
            with _lock:
                if _state["running"]:
                    return self._json({"ok": False, "error": "already running"}, 409)
                threading.Thread(target=run_update, daemon=True).start()
            return self._json({"ok": True, "started": True})
        return self._json({"ok": False, "error": "not found"}, 404)


if __name__ == "__main__":
    addr = ("127.0.0.1", PORT)
    print(f"美国地址生成器已启动: http://127.0.0.1:{PORT}/")
    print(f"数据更新接口已启用（页面右上角「更新数据」按钮可用）")
    print("按 Ctrl+C 停止")
    ThreadingHTTPServer(addr, Handler).serve_forever()

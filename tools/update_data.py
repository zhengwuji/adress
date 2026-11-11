# -*- coding: utf-8 -*-
"""
手动更新数据：强制重新下载 GeoNames 全部国家邮编数据并重建 js/countries_data.js。

用法：
    python tools/update_data.py        # 或 python tools/build_data.py --force
    python tools/update_data.py --bump-only   # 只递增 index.html 的静态资源缓存版本号
"""
import re
import subprocess
import sys
import pathlib
import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTML_FILES = [ROOT / "index.html", ROOT / "Workers 和 Pages" / "index.html"]
VERSION_RE = re.compile(r"(\.(?:css|js)\?v=)(\d{8}[a-z]?)")


def bump_versions():
    today = datetime.date.today().strftime("%Y%m%d")
    for html in HTML_FILES:
        if not html.exists():
            continue
        text = html.read_text(encoding="utf-8")
        # 取当前版本序列尾字母（a→b→c…），跨天则重置为 a
        letters = VERSION_RE.findall(text)
        if letters and letters[0][1][:8] == today and letters[0][1][8:]:
            suffix = chr(min(ord(letters[0][1][8:]) + 1, ord("z")))
        else:
            suffix = "a"
        new_ver = today + suffix
        new_text = VERSION_RE.sub(lambda m: m.group(1) + new_ver, text)
        if new_text != text:
            html.write_text(new_text, encoding="utf-8", newline="\n")
            print(f"✓ {html.name}: 缓存版本 → {new_ver}")
        else:
            print(f"- {html.name}: 无需变更")


if __name__ == "__main__":
    if "--bump-only" in sys.argv:
        bump_versions()
        sys.exit(0)
    cmd = [sys.executable, str(ROOT / "tools" / "build_data.py"), "--force"]
    print("更新数据中（GeoNames 每日更新，36 国重新下载约需 1-3 分钟）...\n")
    r = subprocess.run(cmd)
    if r.returncode == 0:
        bump_versions()
        print("\n✓ 数据更新完成！请刷新浏览器页面（或重启服务后刷新）。")
    else:
        print("\n✗ 更新失败，请检查网络后重试。")
    sys.exit(r.returncode)

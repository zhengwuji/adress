# -*- coding: utf-8 -*-
"""
手动更新数据：强制重新下载 GeoNames 全部国家邮编数据并重建 js/countries_data.js。

用法：
    python tools/update_data.py        # 或 python tools/build_data.py --force
"""
import subprocess
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

if __name__ == "__main__":
    cmd = [sys.executable, str(ROOT / "tools" / "build_data.py"), "--force"]
    print("更新数据中（GeoNames 每日更新，36 国重新下载约需 1-3 分钟）...\n")
    r = subprocess.run(cmd)
    if r.returncode == 0:
        print("\n✓ 数据更新完成！请刷新浏览器页面（或重启服务后刷新）。")
    else:
        print("\n✗ 更新失败，请检查网络后重试。")
    sys.exit(r.returncode)

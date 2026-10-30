#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_stamp.py — 静态站点资源指纹构建（发布前执行）

作用：
  平台对 HTML 返回 Cache-Control: no-cache（每次都拉最新），
  但对 js/css/图片 返回 max-age=3600（浏览器强缓存 1 小时）。
  导致更新后打开"原链接"看到的是新 HTML + 浏览器缓存里的旧 JS/CSS。

方案（链接永不变，也无版本号）：
  构建时把 HTML 里每个本地静态资源引用改写成 "xxx.js?v=<内容hash>"。
  内容一变 hash 就变 → 浏览器视为新 URL 必须重新下载；
  内容没变 hash 不变 → 继续命中缓存，不多余流量。
  对外访问地址始终是 https://.../hq-console/ ，用户不需要任何参数。

用法：
  python build_stamp.py <源目录> <输出目录>
"""
import hashlib
import os
import re
import shutil
import sys

ASSET_EXT = ("js", "css", "png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "woff", "woff2", "ttf")
HTML_EXT = (".html", ".htm")

# 匹配 src="..." / href="..."，只处理本地静态资源
REF_RE = re.compile(
    r'(?P<attr>\b(?:src|href)\s*=\s*["\'])(?P<url>[^"\']+?)(?P<close>["\'])',
    re.IGNORECASE,
)

EXCLUDE = {"README.md", ".dsh", "__pycache__", ".git", ".gitignore"}


def is_local_asset(url: str) -> bool:
    """只处理本地静态资源：排除 http(s)、协议相对、data:、锚点、纯查询"""
    u = url.strip()
    if not u or u.startswith(("http://", "https://", "//", "data:", "mailto:", "javascript:", "#")):
        return False
    path = u.split("?")[0].split("#")[0].lower()
    return path.endswith("." + e for e in ASSET_EXT) if False else path.endswith(tuple("." + e for e in ASSET_EXT))


def file_hash(path: str) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()[:8]


def copy_tree(src: str, dst: str) -> None:
    if os.path.isdir(dst):
        shutil.rmtree(dst)
    shutil.copytree(
        src,
        dst,
        ignore=shutil.ignore_patterns(*EXCLUDE),
    )


def stamp_html(html_path: str, root: str, cache: dict) -> int:
    """改写一个 HTML 内的本地资源引用，返回改写条数"""
    with open(html_path, "r", encoding="utf-8") as f:
        original = f.read()

    changed = [0]

    def repl(m):
        url = m.group("url")
        if not is_local_asset(url):
            return m.group(0)
        rel = url.split("?")[0].split("#")[0]
        target = os.path.normpath(os.path.join(root, rel))
        if not os.path.isfile(target):
            print(f"  !! 引用文件不存在，跳过: {rel}  (in {os.path.basename(html_path)})")
            return m.group(0)
        h = cache.get(target)
        if h is None:
            h = file_hash(target)
            cache[target] = h
        changed[0] += 1
        return f'{m.group("attr")}{rel}?v={h}{m.group("close")}'

    new = REF_RE.sub(repl, original)
    if new != original:
        with open(html_path, "w", encoding="utf-8", newline="") as f:
            f.write(new)
    return changed[0]


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    src, out = sys.argv[1], sys.argv[2]

    if not os.path.isdir(src):
        print(f"ERROR: 源目录不存在: {src}")
        return 1

    copy_tree(src, out)
    print(f"已复制到构建目录: {out}")

    cache: dict = {}
    total, files = 0, 0
    for base, _, names in os.walk(out):
        for n in names:
            if n.lower().endswith(HTML_EXT):
                p = os.path.join(base, n)
                c = stamp_html(p, out, cache)
                total += c
                files += 1
                print(f"  {n}: 打指纹 {c} 条")

    print(f"完成：{files} 个 HTML，共 {total} 条资源引用已加内容指纹（?v=hash），{len(cache)} 个资源参与计算")
    return 0


if __name__ == "__main__":
    sys.exit(main())

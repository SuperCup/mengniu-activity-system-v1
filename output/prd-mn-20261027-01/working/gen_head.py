# -*- coding: utf-8 -*-
"""md -> formatted html（business-report 版式，doc-typeset 规则落地）"""
import re, json, html, sys, os

SRC = r"D:/Project/蒙牛-原型-ds-harness/output/prd-mn-20261027-01/stage1/final_draft.md"
OUT = r"D:/Project/蒙牛-原型-ds-harness/output/prd-mn-20261027-01/stage2/formatted-蒙牛活动管理平台一期产品需求文档.html"
TOK = r"D:/Project/蒙牛-原型-ds-harness/output/prd-mn-20261027-01/stage2/design_tokens.json"

lines = open(SRC, encoding='utf8').read().split('\n')

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
    return t

def is_tbl(ln): return ln.strip().startswith('|')
def split_row(ln):
    s = ln.strip()
    if s.startswith('|'): s = s[1:]
    if s.endswith('|'): s = s[:-1]
    return [c.strip() for c in s.split('|')]

body = []          # html blocks
toc = []           # (level, id, text)
sec_no = 0
sub_no = [0]
i = 0
n = len(lines)
title = None

while i < n:
    ln = lines[i]
    s = ln.strip()
    if not s:
        i += 1; continue

    if s.startswith('# ') and title is None:
        title = s[2:].strip()
        i += 1; continue

    if s.startswith('## '):
        sec_no += 1
        txt = s[3:].strip()
        sid = f"section-{sec_no}"
        body.append(f'<h1 class="section-header" id="{sid}">{inline(txt)}</h1>')
        toc.append((1, sid, txt))
        i += 1; continue

    if s.startswith('### '):
        sub_no[0] += 1
        txt = s[4:].strip()
        sid2 = f"sub-{sub_no[0]}"
        body.append(f'<h2 id="{sid2}">{inline(txt)}</h2>')
        toc.append((2, sid2, txt))
        i += 1; continue

    # 表格
    if is_tbl(s):
        head = split_row(s)
        i += 1
        # 分隔行
        if i < n and re.match(r'^\|[\s:\|=-]+\|?$', lines[i].strip()):
            i += 1
        rows = []
        while i < n and is_tbl(lines[i]):
            rows.append(split_row(lines[i]))
            i += 1
        rows = [(r + [''] * len(head))[:len(head)] for r in rows]
        colmax = [0] * len(head)
        for r in [head] + rows:
            for ci, c in enumerate(r):
                colmax[ci] = max(colmax[ci], len(c))
        nw = {i for i, v in enumerate(colmax) if 0 < v <= 6}
        th = ''.join(('<th class="nw">' if i in nw else '<th>') + inline(c) + '</th>'
                     for i, c in enumerate(head))
        trs = []
        for r in rows:
            tds = ''.join(('<td class="nw">' if i in nw else '<td>') + (inline(c) or '&nbsp;') + '</td>'
                          for i, c in enumerate(r))
            trs.append('<tr>' + tds + '</tr>')
        body.append(f'<table class="tbl"><thead><tr>{th}</tr></thead><tbody>{"".join(trs)}</tbody></table>')
        continue

    # 引用块
    if s.startswith('>'):
        buf = []
        while i < n and lines[i].strip().startswith('>'):
            buf.append(lines[i].strip()[1:].strip())
            i += 1
        body.append('<p class="note">' + inline(' '.join(buf)) + '</p>')
        continue

    # 列表
    if re.match(r'^(\d+\.|[-*])\s+', s):
        ordered = bool(re.match(r'^\d+\.', s))
        items = []
        while i < n and re.match(r'^(\d+\.|[-*])\s+', lines[i].strip()):
            it = re.sub(r'^(\d+\.|[-*])\s+', '', lines[i].strip())
            items.append(it)
            i += 1
        tag = 'ol' if ordered else 'ul'
        body.append(f'<{tag} class="lst">' + ''.join(f'<li>{inline(x)}</li>' for x in items) + f'</{tag}>')
        continue

    # 段落（合并连续非空行）
    buf = [s]
    i += 1
    while i < n:
        nx = lines[i].strip()
        if not nx or nx.startswith('#') or is_tbl(nx) or nx.startswith('>') or re.match(r'^(\d+\.|[-*])\s+', nx):
            break
        buf.append(nx); i += 1
    body.append('<p class="body">' + inline(''.join(buf)) + '</p>')

# ---------- TOC（章级，与目录域条目一一对应） ----------
toc_html = []
for lvl, sid, txt in toc:
    if lvl != 1:
        continue
    toc_html.append('<li><a href="#%s">%s</a></li>' % (sid, inline(txt)))
toc_items = ''.join(toc_html)

tokens = json.load(open(r"C:/Users/PC/.workbuddy/plugins/cache/workbuddy-builtin/workbuddy-docx/5.9.2-wb.42136757.g0b5051be.hd4338c001c60/skills/design-token/tokens/compiled/business-report.json", encoding='utf8'))
json.dump(tokens, open(TOK, 'w', encoding='utf8'), ensure_ascii=False, indent=2)

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
        txt = s[4:].strip()
        body.append(f'<h2>{inline(txt)}</h2>')
        toc.append((2, None, txt))
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
        th = ''.join(f'<th>{inline(c)}</th>' for c in head)
        trs = []
        for r in rows:
            r = (r + [''] * len(head))[:len(head)]
            trs.append('<tr>' + ''.join(f'<td>{inline(c) or "&nbsp;"}</td>' for c in r) + '</tr>')
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

# ---------- TOC ----------
toc_html = []
cur_sub = None
for lvl, sid, txt in toc:
    if lvl == 1:
        if cur_sub is not None:
            toc_html.append('</ol></li>')
            cur_sub = None
        toc_html.append(f'<li><a href="#{sid}">{inline(txt)}</a>')
    else:
        if cur_sub is None:
            toc_html.append('<ol class="toc-sub">')
            cur_sub = True
        toc_html.append(f'<li>{inline(txt)}</li>')
if cur_sub is not None:
    toc_html.append('</ol></li>')
toc_items = ''.join(toc_html)

tokens = json.load(open(r"C:/Users/PC/.workbuddy/plugins/cache/workbuddy-builtin/workbuddy-docx/5.9.2-wb.42136757.g0b5051be.hd4338c001c60/skills/design-token/tokens/compiled/business-report.json", encoding='utf8'))
json.dump(tokens, open(TOK, 'w', encoding='utf8'), ensure_ascii=False, indent=2)

HTML = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="docx-page-size" content="A4">
<title>{title}</title>
<style>
@page {{
  @top-right {{ content: "一期产品需求文档 V7.0"; }}
  @bottom-center {{ content: "第 " counter(page) " 页"; }}
}}
@page cover {{ @top-right {{ content: none; }} @bottom-center {{ content: none; }} }}
section[role="cover"] {{ page: cover; }}

:root {{
  --fs-body: 12pt;
  --ff-body: "宋体", SimSun, serif;
  --ff-head: "黑体", SimHei, sans-serif;
  --c-primary: #096C52;
  --c-primary-soft: #E6F1EE;
  --c-ink: #141E35;
  --c-muted: #5C6B66;
  --c-border: #C9D6D1;
  --c-surface: #F4F8F6;
  --lh: 1.62;
  --page-w: 15.6cm;
}}
* {{ box-sizing: border-box; }}
body {{ width: var(--page-w); margin: 0 auto; font-family: var(--ff-body); font-size: var(--fs-body);
       line-height: var(--lh); color: var(--c-ink); background: #fff; }}

/* 封面 */
.cover-wrap {{ padding-top: 5.2cm; }}
.cover-eyebrow {{ font-family: var(--ff-head); font-size: 12pt; color: var(--c-primary); letter-spacing: 0.18em; text-align: left; margin-bottom: 1.4em; }}
.cover-title {{ font-family: var(--ff-head); font-size: 26pt; font-weight: 700; color: #0B3B2E; line-height: 1.32; text-align: left; margin-bottom: 0.35em; }}
.cover-sub {{ font-family: var(--ff-head); font-size: 15pt; color: var(--c-primary); text-align: left; margin-bottom: 2.6em; }}
.cover-meta {{ width: 100%; border-collapse: collapse; margin-top: 1.2em; }}
.cover-meta td {{ border-top: 1px solid var(--c-border); padding: 7px 0; font-size: 10.5pt; color: var(--c-muted); text-align: left; }}
.cover-meta td.k {{ width: 3.6cm; color: #2F4A41; }}
.cover-note {{ margin-top: 2.2em; font-size: 9.5pt; color: var(--c-muted); text-align: left; line-height: 1.7; }}

/* 目录 */
.toc-page {{ padding: 0; }}
.toc-title {{ font-family: var(--ff-head); font-size: 18pt; color: var(--c-primary); text-align: center; margin: 0 0 1.2em 0; letter-spacing: 0.2em; }}
.toc-list, .toc-list ol {{ list-style: none; padding-left: 0; margin: 0; }}
.toc-list > li {{ font-family: var(--ff-head); font-size: 11.5pt; color: #123B30; margin: 4px 0 2px 0; text-indent: 0; }}
.toc-list a {{ color: #123B30; text-decoration: none; }}
.toc-sub {{ padding-left: 1.6em !important; margin: 2px 0 4px 0 !important; }}
.toc-sub li {{ font-family: var(--ff-body); font-size: 10.5pt; color: var(--c-muted); text-indent: 0; margin: 1px 0; line-height: 1.5; }}

/* 正文 */
.body-sec {{ padding: 0; }}
h1.section-header {{ font-family: var(--ff-head); font-size: 17pt; font-weight: 700; color: var(--c-primary);
  margin: 1.5em 0 0.7em 0; padding-bottom: 0.34em; border-bottom: 2px solid var(--c-primary); text-indent: 0; }}
h2 {{ font-family: var(--ff-head); font-size: 12.5pt; font-weight: 700; color: #0B3B2E;
  margin: 1.25em 0 0.5em 0; padding-left: 0.5em; border-left: 3px solid var(--c-primary); text-indent: 0; }}
p.body {{ font-family: var(--ff-body); font-size: var(--fs-body); line-height: var(--lh); text-indent: 2em; margin: 0 0 0.55em 0; }}
p.note {{ font-family: var(--ff-body); font-size: 10.5pt; color: #24413A; background: var(--c-surface);
  border-left: 3px solid var(--c-primary); padding: 8px 10px; margin: 0.6em 0 0.8em 0; text-indent: 0; line-height: 1.6; }}
ol.lst, ul.lst {{ margin: 0.3em 0 0.7em 0; padding-left: 2.2em; }}
ol.lst li, ul.lst li {{ font-family: var(--ff-body); font-size: var(--fs-body); line-height: var(--lh); margin-bottom: 0.24em; text-indent: 0; }}
code {{ font-family: Consolas, monospace; font-size: 10.5pt; background: #F0F4F2; padding: 0 2px; }}

/* 表格 */
table.tbl {{ width: 100%; border-collapse: collapse; margin: 0.5em 0 1em 0; table-layout: auto; }}
table.tbl th {{ background: var(--c-primary); color: #FFFFFF; font-family: var(--ff-head); font-size: 9.5pt;
  font-weight: 700; padding: 5px 6px; border: 1px solid #0B5A45; text-align: left; line-height: 1.42; }}
table.tbl td {{ font-family: var(--ff-body); font-size: 9.5pt; color: #1B2B26; padding: 5px 6px;
  border: 1px solid var(--c-border); line-height: 1.5; vertical-align: top; }}
table.tbl tbody tr:nth-child(even) td {{ background: #F7FAF9; }}
strong {{ font-weight: 700; }}
</style>
</head>
<body>

<section role="cover">
  <div class="cover-wrap">
    <p class="cover-eyebrow">蒙牛活动管理平台 · 券中台</p>
    <p class="cover-title">一期产品需求文档</p>
    <p class="cover-sub">客户确认与验收版</p>
    <table class="cover-meta">
      <tr><td class="k">文档版本</td><td>V7.0</td></tr>
      <tr><td class="k">编制日期</td><td>2026 年 10 月 27 日</td></tr>
      <tr><td class="k">文档状态</td><td>待客户确认（确认后作为一期验收基线）</td></tr>
      <tr><td class="k">目标上线</td><td>2026-12-29 发布，12-30 监控，12-31 资料归档</td></tr>
      <tr><td class="k">适用范围</td><td>总部端管理端、服务商操作页、两类开放 API、后台任务与公共模块</td></tr>
    </table>
    <p class="cover-note">本文档用于与客户逐项确认一期产品的功能实现、业务流程与功能细节逻辑，<br>并在一期开发完成后作为验收依据使用。</p>
  </div>
</section>

<section role="cover" class="toc-page">
  <nav class="doc-toc" aria-label="文档目录">
    <p class="toc-title">目　录</p>
    <ol class="toc-list">{toc_items}</ol>
  </nav>
</section>

<section role="body" class="body-sec" data-page-restart="1">
{''.join(body)}
</section>

</body>
</html>
'''

open(OUT, 'w', encoding='utf8').write(HTML)
print('ok', OUT, len(HTML), 'toc', len(toc))

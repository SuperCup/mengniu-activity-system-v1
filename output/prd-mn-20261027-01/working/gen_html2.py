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
  --ff-head: "黑体", SimHei, sans-serif;
  --ff-body: "宋体", SimSun, serif;
  --ff-code: Consolas, monospace;

  --fs-cover-kicker: 12pt;
  --fs-cover-title: 26pt;
  --fs-cover-sub: 15pt;
  --fs-cover-meta: 10.5pt;
  --fs-cover-note: 9.5pt;
  --fs-toc-title: 18pt;
  --fs-toc-l1: 11.5pt;
  --fs-toc-l2: 10.5pt;
  --fs-h1: 17pt;
  --fs-h2: 12.5pt;
  --fs-body: 12pt;
  --fs-note: 10.5pt;
  --fs-th: 9.5pt;
  --fs-td: 9.5pt;
  --fs-code: 10.5pt;
  --fs-sum-title: 12pt;
  --fs-sum-body: 11pt;

  --color-primary: #096C52;
  --color-primary-deep: #0B3B2E;
  --color-primary-line: #0B5A45;
  --color-heading: #123B30;
  --color-text: #141E35;
  --color-muted: #5C6B66;
  --color-note: #24413A;
  --color-border: #C9D6D1;
  --color-surface: #F4F8F6;
  --color-surface-alt: #F7FAF9;
  --color-code-bg: #F0F4F2;
  --color-white: #FFFFFF;
  --color-bg: #FFFFFF;

  --spacing-none: 0;
  --spacing-hair: 1px;
  --spacing-tiny: 2px;
  --spacing-xs: 4px;
  --spacing-sm: 5px;
  --spacing-sn: 6px;
  --spacing-md: 7px;
  --spacing-lg: 8px;
  --spacing-xl: 10px;
  --spacing-em1: 0.24em;
  --spacing-em2: 0.34em;
  --spacing-em3: 0.35em;
  --spacing-em4: 0.5em;
  --spacing-em5: 0.55em;
  --spacing-em6: 0.6em;
  --spacing-em7: 0.7em;
  --spacing-em8: 1.2em;
  --spacing-em9: 1.25em;
  --spacing-em10: 1.4em;
  --spacing-em11: 1.6em;
  --spacing-em12: 2.2em;
  --spacing-em13: 2.6em;
  --spacing-cover-top: 5.2cm;
  --spacing-page-w: 15.6cm;
}}
* {{ box-sizing: border-box; }}
body {{ width: var(--spacing-page-w); margin-left: auto; margin-right: auto; font-family: var(--ff-body);
       font-size: var(--fs-body); line-height: 1.62; color: var(--color-text); background: var(--color-bg); }}

.cover-wrap {{ padding-top: var(--spacing-cover-top); }}
.cover-eyebrow {{ font-family: var(--ff-head); font-size: var(--fs-cover-kicker); color: var(--color-primary);
  letter-spacing: 0.18em; text-align: left; margin-bottom: var(--spacing-em10); text-indent: var(--spacing-none); }}
.cover-title {{ font-family: var(--ff-head); font-size: var(--fs-cover-title); font-weight: 700; color: var(--color-primary-deep);
  line-height: 1.32; text-align: left; margin-bottom: var(--spacing-em3); }}
.cover-sub {{ font-family: var(--ff-head); font-size: var(--fs-cover-sub); color: var(--color-primary);
  text-align: left; margin-bottom: var(--spacing-em13); }}
.cover-meta {{ font-family: var(--ff-body); font-size: var(--fs-cover-meta); color: var(--color-muted);
  text-align: left; margin-bottom: var(--spacing-em1); padding-top: var(--spacing-md); border-top: var(--spacing-hair) solid var(--color-border); }}
.cover-note {{ font-family: var(--ff-body); font-size: var(--fs-cover-note); color: var(--color-muted);
  text-align: left; line-height: 1.7; margin-top: var(--spacing-em12); text-indent: var(--spacing-none); }}

.toc-title {{ font-family: var(--ff-head); font-size: var(--fs-toc-title); color: var(--color-primary);
  text-align: center; margin-bottom: var(--spacing-em8); letter-spacing: 0.2em; }}
.toc-list, .toc-list ol {{ list-style: none; padding-left: var(--spacing-none); margin-left: var(--spacing-none); }}
.toc-list > li {{ font-family: var(--ff-head); font-size: var(--fs-toc-l1); color: var(--color-heading);
  margin-top: var(--spacing-xs); margin-bottom: var(--spacing-tiny); text-indent: var(--spacing-none); }}
.toc-list a {{ color: var(--color-heading); text-decoration: none; }}

h1.section-header {{ font-family: var(--ff-head); font-size: var(--fs-h1); font-weight: 700; color: var(--color-primary);
  margin-top: var(--spacing-em11); margin-bottom: var(--spacing-em7); padding-bottom: var(--spacing-em2);
  border-bottom: var(--spacing-tiny) solid var(--color-primary); text-indent: var(--spacing-none); }}
h2 {{ font-family: var(--ff-head); font-size: var(--fs-h2); font-weight: 700; color: var(--color-primary-deep);
  margin-top: var(--spacing-em9); margin-bottom: var(--spacing-em4); padding-left: var(--spacing-em4);
  border-left: var(--spacing-xs) solid var(--color-primary); text-indent: var(--spacing-none); }}
p.body {{ font-family: var(--ff-body); font-size: var(--fs-body); line-height: 1.62; text-indent: 2em;
  margin-bottom: var(--spacing-em5); }}
p.note {{ font-family: var(--ff-body); font-size: var(--fs-note); color: var(--color-note); background: var(--color-surface);
  border-left: var(--spacing-xs) solid var(--color-primary); padding: var(--spacing-lg) var(--spacing-xl);
  margin-top: var(--spacing-em6); margin-bottom: var(--spacing-em7); text-indent: var(--spacing-none); line-height: 1.6; }}
ol.lst, ul.lst {{ margin-top: var(--spacing-em3); margin-bottom: var(--spacing-em7); padding-left: var(--spacing-em12); }}
ol.lst li, ul.lst li {{ font-family: var(--ff-body); font-size: var(--fs-body); line-height: 1.62;
  margin-bottom: var(--spacing-em1); text-indent: var(--spacing-none); }}
code {{ font-family: var(--ff-code); font-size: var(--fs-code); background: var(--color-code-bg); }}

table.tbl {{ width: 100%; border-collapse: collapse; margin-top: var(--spacing-em4); margin-bottom: var(--spacing-em11); }}
table.tbl th {{ background: var(--color-primary); color: var(--color-white); font-family: var(--ff-head);
  font-size: var(--fs-th); font-weight: 700; padding: var(--spacing-sm) var(--spacing-sn);
  border: var(--spacing-hair) solid var(--color-primary-line); text-align: left; line-height: 1.42; }}
table.tbl td {{ font-family: var(--ff-body); font-size: var(--fs-td); color: var(--color-text);
  padding: var(--spacing-sm) var(--spacing-sn); border: var(--spacing-hair) solid var(--color-border);
  line-height: 1.5; vertical-align: top; }}
table.tbl tbody tr:nth-child(even) td {{ background: var(--color-surface-alt); }}
table.tbl .nw {{ white-space: nowrap; }}
strong {{ font-weight: 700; }}

table.summary-card {{ width: 100%; border-collapse: collapse; margin-top: var(--spacing-em4); margin-bottom: var(--spacing-em11); }}
table.summary-card {{ border: var(--spacing-hair) solid var(--color-border); }}
table.summary-card th.sum-th {{ background: var(--color-primary); color: var(--color-white);
  font-family: var(--ff-head); font-size: var(--fs-sum-title); font-weight: 700;
  padding: var(--spacing-lg) var(--spacing-xl); text-align: left; }}
table.summary-card td {{ background: var(--color-surface); padding: var(--spacing-lg) var(--spacing-xl); }}
p.sum-body {{ font-family: var(--ff-body); font-size: var(--fs-sum-body); color: var(--color-note);
  line-height: 1.7; margin-bottom: var(--spacing-em4); text-indent: var(--spacing-none); }}
</style>
</head>
<body>

<section role="cover">
  <div class="cover-wrap">
    <p class="cover-eyebrow">蒙牛活动管理平台 · 券中台</p>
    <p class="cover-title">一期产品需求文档</p>
    <p class="cover-sub">客户确认与验收版</p>
    <p class="cover-meta">文档版本　V7.0　　编制日期　2026 年 10 月 27 日</p>
    <p class="cover-meta">文档状态　待客户确认（确认后作为一期验收基线）</p>
    <p class="cover-meta">目标上线　2026-12-29 发布，12-30 监控，12-31 资料归档</p>
    <p class="cover-meta">适用范围　总部端管理端、服务商操作页、两类开放 API、后台任务与公共模块</p>
    <p class="cover-note">本文档用于与客户逐项确认一期产品的功能实现、业务流程与功能细节逻辑，并在一期开发完成后作为验收依据使用。</p>
  </div>
</section>

<section role="cover">
  <nav class="doc-toc" aria-label="文档目录">
    <p class="toc-title">目　录</p>
    <ol class="toc-list">{toc_items}</ol>
  </nav>
</section>

<section role="body" data-page-restart="1">
<table class="summary-card executive-summary">
<thead><tr><th class="sum-th">阅读摘要 · 一页看懂本期要交付什么</th></tr></thead>
<tbody><tr><td>
<p class="sum-body">一、一期范围：总部端 12 个模块、发券小程序 5 个开放接口、制券服务商 6 个开放接口、5 项后台任务、7 项公共模块。消费者页面、计划变更、第三方埋点、直连微信建券与拉单不在本期。</p>
<p class="sum-body">二、主链路：报批 → 审批 → 补批次配置 → 推送服务商 → 服务商回传批次 → 推送渠道发券 → 核销与账单回流。项目六状态、计划三态与动作矩阵见第七章。</p>
<p class="sum-body">三、验收方式：每条功能需求（FR）配可判定验收标准，按第十三章 48 项核对清单逐项实测；P0 项须 100% 通过，致命与严重缺陷为 0。</p>
<p class="sum-body">四、需客户确认：第十四章 10 项待确认事项（审批方式、数据回流路径、预算强校验等）直接决定实现口径，请于需求确认会一次性定稿。</p>
</td></tr></tbody></table>

{"".join(body)}
</section>

</body>
</html>
'''

open(OUT, 'w', encoding='utf8').write(HTML)
print('ok', OUT, len(HTML), 'toc', len(toc))

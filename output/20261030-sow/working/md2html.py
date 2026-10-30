# -*- coding: utf-8 -*-
"""SOW final_draft.md -> 排版 HTML（legal-contract 版式）"""
import io, re, html

SRC = r"D:/Project/蒙牛-原型-ds-harness/output/20261030-sow/stage1/final_draft.md"
DST = r"D:/Project/蒙牛-原型-ds-harness/output/20261030-sow/stage2/formatted-SOW.html"


def inline(t):
    t = html.escape(t.strip(), quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"`(.+?)`", r"<code>\1</code>", t)
    return t


lines = io.open(SRC, encoding="utf-8").read().split("\n")

sections = []   # (title, id, [html blocks])
cur = None
buf = []


def flush_para():
    global buf
    if buf:
        sections[-1][2].append("<p>%s</p>" % inline("".join(buf)))
        buf = []


i = 0
sec_no = 0
while i < len(lines):
    raw = lines[i]
    line = raw.rstrip()
    s = line.strip()

    if s.startswith("# ") and not s.startswith("## "):
        i += 1
        continue  # 文档主标题由封面与正文 h1 承担

    if s.startswith("## "):
        flush_para()
        sec_no += 1
        title = s[3:].strip()
        sections.append((title, "section-%d" % sec_no, []))
        i += 1
        continue

    if s.startswith("### "):
        flush_para()
        sections[-1][2].append("<h3>%s</h3>" % inline(s[4:]))
        i += 1
        continue

    if s.startswith("|"):
        flush_para()
        rows = []
        while i < len(lines) and lines[i].strip().startswith("|"):
            cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
            if not all(re.match(r"^:?-{2,}:?$", c) for c in cells):
                rows.append(cells)
            i += 1
        if rows:
            head = rows[0]
            body = rows[1:]
            t = ['<table class="doc-table">', "<thead><tr>"]
            t += ["<th>%s</th>" % inline(c) for c in head]
            t.append("</tr></thead><tbody>")
            for r in body:
                t.append("<tr>" + "".join("<td>%s</td>" % inline(c) for c in r) + "</tr>")
            t.append("</tbody></table>")
            sections[-1][2].append("".join(t))
        continue

    if s.startswith("- "):
        flush_para()
        items = []
        while i < len(lines) and lines[i].strip().startswith("- "):
            items.append(lines[i].strip()[2:].strip())
            i += 1
        sections[-1][2].append("<ul>" + "".join("<li>%s</li>" % inline(x) for x in items) + "</ul>")
        continue

    if re.match(r"^\d+\.\s", s):
        flush_para()
        items = []
        while i < len(lines) and re.match(r"^\d+\.\s", lines[i].strip()):
            items.append(re.sub(r"^\d+\.\s", "", lines[i].strip()))
            i += 1
        sections[-1][2].append("<ol>" + "".join("<li>%s</li>" % inline(x) for x in items) + "</ol>")
        continue

    if not s:
        flush_para()
        i += 1
        continue

    # 普通段落：累积到空行为止（中文不补空格）
    buf.append(s)
    i += 1

flush_para()

# ---------------- 目录 ----------------
toc = ['<nav class="doc-toc" aria-label="文档目录">', '<p class="toc-title">目　录</p>',
       '<ol class="toc-list">']
for title, sid, _ in sections:
    toc.append('<li><a href="#%s">%s</a></li>' % (sid, html.escape(title, quote=False)))
toc.append("</ol></nav>")

# ---------------- 正文 ----------------
body = ['<h1 class="doc-title">蒙牛活动管理平台一期项目工作说明书（SOW）</h1>']
for title, sid, blocks in sections:
    body.append('<h2 id="%s">%s</h2>' % (sid, html.escape(title, quote=False)))
    body.extend(blocks)

body.append("""<table class="signature-block">
<thead><tr><th>甲方（盖章）</th><th>乙方（盖章）</th></tr></thead>
<tbody><tr>
<td class="signature-party">内蒙古蒙牛乳业（集团）股份有限公司<br><br><br>授权代表（签字）：<br><br>日期：　　　年　　月　　日</td>
<td class="signature-party">（乙方名称）<br><br><br>授权代表（签字）：<br><br>日期：　　　年　　月　　日</td>
</tr></tbody></table>""")

CSS = """
  /* 页面规则：正文页脚居中显示当前页码，封面不显示 */
  @page { @bottom-center { content: "第 " counter(page) " 页"; } }
  @page cover { @bottom-center { content: none; } }
  section[role="cover"] { page: cover; }

  :root {
    --ff-body: "SimSun", "宋体", serif;
    --ff-heading: "SimHei", "黑体", sans-serif;
    --fs-body: 12pt;
    --fs-h1: 19pt;
    --fs-h2: 15pt;
    --fs-h3: 12.5pt;
    --fs-small: 10pt;
    --fs-table: 9.5pt;
    --fs-cover-title: 30pt;
    --fs-cover-sub: 18pt;
    --fs-cover-eyebrow: 10pt;
    --color-text: #1a1a1a;
    --color-primary: #1f3a5f;
    --color-muted: #666666;
    --color-border: #c2cad3;
    --color-bg: #ffffff;
    --color-th-bg: #eef2f6;
    --color-note-bg: #f5f7fa;
    --spacing-paragraph: 0.55em;
    --spacing-block: 0.8em;
    --spacing-section: 1.3em;
    --spacing-li: 0.25em;
    --spacing-list: 1.8em;
    --spacing-cell: 5pt;
    --spacing-page: 2.2cm;
    --spacing-cover-top: 2.6em;
    --spacing-cover-gap: 2.4em;
    --spacing-rule: 4pt;
    --page-width: 15.6cm;
  }

  * { box-sizing: border-box; }
  body {
    font-family: var(--ff-body);
    font-size: var(--fs-body);
    line-height: 1.75;
    color: var(--color-text);
    background: var(--color-bg);
    max-width: var(--page-width);
    margin: 0 auto;
    padding: var(--spacing-page);
    text-align: justify;
  }

  p { margin: 0 0 var(--spacing-paragraph) 0; text-indent: 2em; }
  section[role="cover"] p { text-indent: 0; }

  h1.doc-title {
    font-family: var(--ff-heading);
    font-size: var(--fs-h1);
    color: var(--color-primary);
    font-weight: 700;
    text-align: center;
    text-indent: 0;
    margin: 0 0 var(--spacing-section) 0;
  }
  h2 {
    font-family: var(--ff-heading);
    font-size: var(--fs-h2);
    color: var(--color-primary);
    font-weight: 700;
    text-indent: 0;
    margin: var(--spacing-section) 0 var(--spacing-block) 0;
    padding-bottom: var(--spacing-rule);
    border-bottom: 1.2pt solid var(--color-primary);
  }
  h3 {
    font-family: var(--ff-heading);
    font-size: var(--fs-h3);
    color: var(--color-primary);
    font-weight: 700;
    text-indent: 0;
    margin: var(--spacing-block) 0 var(--spacing-paragraph) 0;
  }

  table.doc-table, table.party-info, table.signature-block {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--fs-table);
    line-height: 1.55;
    margin: 0 0 var(--spacing-section) 0;
  }
  table.doc-table th, table.doc-table td,
  table.party-info th, table.party-info td,
  table.signature-block th, table.signature-block td {
    border: 0.75pt solid var(--color-border);
    padding: var(--spacing-cell);
    text-indent: 0;
    text-align: left;
    vertical-align: top;
  }
  table.doc-table th, table.party-info th, table.signature-block th {
    background: var(--color-th-bg);
    font-family: var(--ff-heading);
    font-weight: 700;
    color: var(--color-primary);
  }
  table.signature-block td { line-height: 2.1; }

  ul, ol { margin: 0 0 var(--spacing-paragraph) var(--spacing-list); padding-left: 0; }
  li { margin: 0 0 var(--spacing-li) 0; text-indent: 0; }

  code { font-family: var(--ff-body); }

  .cover-eyebrow {
    text-align: center;
    text-indent: 0;
    font-family: var(--ff-heading);
    font-size: var(--fs-cover-eyebrow);
    color: var(--color-muted);
    letter-spacing: 0.2em;
    margin: var(--spacing-cover-top) 0 var(--spacing-block) 0;
  }
  .cover-title {
    text-align: center;
    text-indent: 0;
    font-family: var(--ff-heading);
    font-size: var(--fs-cover-title);
    color: var(--color-primary);
    font-weight: 700;
    margin: 0 0 var(--spacing-block) 0;
  }
  .cover-subtitle {
    text-align: center;
    text-indent: 0;
    font-family: var(--ff-heading);
    font-size: var(--fs-cover-sub);
    color: var(--color-text);
    margin: 0 0 var(--spacing-cover-gap) 0;
  }
  .cover-meta {
    text-align: center;
    text-indent: 0;
    font-size: var(--fs-small);
    color: var(--color-muted);
    margin: var(--spacing-cover-gap) 0 0 0;
  }

  nav.doc-toc { margin: 0; }
  .toc-title {
    text-align: center;
    text-indent: 0;
    font-family: var(--ff-heading);
    font-size: var(--fs-h2);
    color: var(--color-primary);
    font-weight: 700;
    margin: 0 0 var(--spacing-section) 0;
  }
  .toc-list, .toc-list ol, .toc-list ul { list-style: none; margin: 0; padding: 0; }
  .toc-list li { margin: 0 0 var(--spacing-li) 0; text-indent: 0; line-height: 1.9; }
  .toc-list a { color: var(--color-text); text-decoration: none; }
"""

COVER = """<section role="cover">
<div class="cover-eyebrow" style="text-align: center;">STATEMENT OF WORK</div>
<div class="cover-title" style="text-align: center;">蒙牛活动管理平台一期项目</div>
<div class="cover-subtitle" style="text-align: center;">工作说明书（SOW）</div>
<table class="party-info">
<thead><tr><th>项　目</th><th>内　容</th></tr></thead>
<tbody>
<tr><td>文档名称</td><td>蒙牛活动管理平台一期项目工作说明书（SOW）</td></tr>
<tr><td>文档版本</td><td>V1.1</td></tr>
<tr><td>编制日期</td><td>2026 年 10 月 30 日</td></tr>
<tr><td>甲方</td><td>内蒙古蒙牛乳业（集团）股份有限公司</td></tr>
<tr><td>乙方</td><td>（乙方名称，以正式合同签署主体为准）</td></tr>
<tr><td>项目周期</td><td>2026-10-12 至 2026-12-31</td></tr>
<tr><td>文档用途</td><td>约定建设范围、交付物、里程碑、双方职责、验收标准与质保运维边界</td></tr>
</tbody></table>
<div class="cover-meta" style="text-align: center;">本文件为主合同的工作范围与交付附件，与主合同一并签署生效</div>
</section>"""

html_out = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="docx-page-size" content="A4">
<title>蒙牛活动管理平台一期项目工作说明书（SOW）</title>
<style>%s</style>
</head>
<body>
%s
<section role="cover">
%s
</section>
<section role="body" data-page-restart="1">
%s
</section>
</body>
</html>
""" % (CSS, COVER, "\n".join(toc), "\n".join(body))

io.open(DST, "w", encoding="utf-8").write(html_out)
print("sections:", len(sections))
print("html bytes:", len(html_out.encode("utf-8")))
print("tables:", html_out.count("<table"))

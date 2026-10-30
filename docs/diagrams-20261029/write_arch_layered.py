# -*- coding: utf-8 -*-
"""分层系统架构图（参考用户提供的蓝图结构，聚焦一期能力）。"""
from pathlib import Path

out = Path(__file__).parent

# 色板：对齐参考图「分层 + 色块」，一期统一用青绿；外部对接用浅蓝灰区分
C = {
    "bg": "#ffffff",
    "title": "#075e4c",
    "muted": "#58756e",
    "ink": "#163d37",
    "line": "#72a69a",
    "band": "#e8f3ef",
    "chip": "#d7ebe3",
    "chip2": "#fff",
    "accent": "#0b715a",
    "ext": "#e8eef5",
    "ext_line": "#7a93ad",
    "label_bg": "#0b715a",
    "label_fg": "#ffffff",
}


def chip(x, y, w, h, text, fill=None, stroke=None, fs=15):
    fill = fill or C["chip"]
    stroke = stroke or C["line"]
    return f'''<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>
    <text x="{x + w/2}" y="{y + h/2 + 5}" text-anchor="middle" font-size="{fs}" fill="{C['ink']}">{text}</text>'''


def row_label(x, y, w, h, text):
    return f'''<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{C['label_bg']}"/>
    <text x="{x + w/2}" y="{y + h/2 + 6}" text-anchor="middle" font-size="16" font-weight="700" fill="{C['label_fg']}">{text}</text>'''


def band(x, y, w, h):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{C["band"]}" stroke="{C["line"]}" stroke-width="1.5"/>'


parts = []
W, H = 1680, 1180
parts.append(f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="100%" height="100%" fill="{C['bg']}"/>
  <g font-family="Microsoft YaHei, sans-serif">
    <text x="48" y="48" font-size="34" fill="{C['title']}" font-weight="700">系统架构图</text>
    <text x="48" y="80" font-size="18" fill="{C['muted']}">蒙牛活动管理平台 · 一期分层架构（事业部 → 场景 → 用户 → 产品 → 模块 → 外部对接）</text>
''')

# ---- 1 事业部 ----
y = 105
parts.append(band(48, y, 1584, 78))
parts.append(row_label(60, y + 16, 100, 46, "事业部"))
chips = ["华北事业部", "华东事业部", "华南事业部", "西南事业部", "其他事业部"]
cx = 180
for t in chips:
    parts.append(chip(cx, y + 18, 150, 42, t))
    cx += 162
parts.append(f'<text x="1020" y="{y + 46}" font-size="14" fill="{C["muted"]}">业务运营按本人创建项目使用，覆盖各事业部活动提报</text>')

# ---- 2 业务场景 ----
y = 200
parts.append(band(48, y, 1584, 78))
parts.append(row_label(60, y + 16, 100, 46, "业务场景"))
scenes = [
    (180, "微信支付满减活动"),
    (370, "减至 / 换购券活动"),
    (560, "会员小程序领券投放"),
    (770, "服务商制券与回传"),
    (980, "活动执行数据查询"),
]
for x, t in scenes:
    parts.append(chip(x, y + 18, 175, 42, t, fs=14))

# ---- 3 建设目标 ----
y = 295
parts.append(f'''<rect x="48" y="{y}" width="1584" height="88" rx="10" fill="#f7faf8" stroke="{C['line']}" stroke-width="1.5"/>
    <text x="72" y="{y + 32}" font-size="16" font-weight="700" fill="{C['title']}">一期建设目标</text>
    <text x="72" y="{y + 58}" font-size="15" fill="{C['ink']}">打通「项目报批 → 计划批次配置 → 服务商制券回传 → 小程序投放 → 核销数据回看」闭环；内部登录走钉钉，审批走 BPM，预算来源对接 TPM / MEM。</text>
    <text x="72" y="{y + 78}" font-size="14" fill="{C['muted']}">一期投放平台以微信支付券为主，对接既有会员小程序与制券服务商。</text>''')

# ---- 4 用户 ----
y = 400
parts.append(band(48, y, 1584, 78))
parts.append(row_label(60, y + 16, 100, 46, "用户"))
users = [
    (180, 200, "业务运营"),
    (400, 200, "管理员"),
    (620, 200, "审批人（BPM）"),
    (840, 260, "制券服务商（专属入口）"),
]
for x, w, t in users:
    parts.append(chip(x, y + 18, w, 42, t))

# ---- 5 产品形态 ----
y = 495
parts.append(band(48, y, 1584, 78))
parts.append(row_label(60, y + 16, 100, 46, "产品形态"))
forms = [
    (180, 280, "PC · 总部端（钉钉登录）"),
    (480, 260, "PC · 服务商专属操作页"),
    (760, 280, "C 端 · 既有会员小程序（对接）"),
]
for x, w, t in forms:
    parts.append(chip(x, y + 18, w, 42, t, fill="#fff", fs=14))

# ---- 6 产品模块 ----
y = 590
parts.append(band(48, y, 1584, 280))
parts.append(row_label(60, y + 16, 100, 46, "产品模块"))

modules = [
    ("活动项目", ["项目创建", "项目审批", "项目管理", "六态流转"]),
    ("计划与批次", ["计划列表", "补充批次配置", "满减 / 减至", "零售商与商品明细"]),
    ("服务商协作", ["推送邮件", "确认接收", "批次回传", "核销 / 账单"]),
    ("投放对接", ["领券小程序", "发券任务", "批次推送"]),
    ("主数据", ["门店与商户号", "商品维护"]),
    ("数据与留痕", ["数据看板", "系统日志"]),
    ("系统管理", ["角色权限", "服务商配置"]),
]

mx = 180
for title, items in modules:
    mw = 190 if len(items) >= 4 else 170
    parts.append(f'''<rect x="{mx}" y="{y + 78}" width="{mw}" height="176" rx="8" fill="#fff" stroke="{C['accent']}" stroke-width="1.8"/>
    <rect x="{mx}" y="{y + 78}" width="{mw}" height="34" rx="8" fill="{C['accent']}"/>
    <rect x="{mx}" y="{y + 96}" width="{mw}" height="16" fill="{C['accent']}"/>
    <text x="{mx + mw/2}" y="{y + 100}" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">{title}</text>''')
    iy = y + 126
    for it in items:
        parts.append(chip(mx + 10, iy, mw - 20, 26, it, fill=C["chip"], fs=13))
        iy += 30
    mx += mw + 12

# ---- 7 外部系统对接 ----
y = 895
parts.append(f'''<rect x="48" y="{y}" width="1584" height="230" rx="10" fill="{C['ext']}" stroke="{C['ext_line']}" stroke-width="1.5"/>''')
parts.append(row_label(60, y + 16, 120, 46, "外部对接"))

exts = [
    ("钉钉", ["内部人员登录", "用户身份"]),
    ("BPM", ["发起 / 查询审批", "审批结果回写"]),
    ("TPM", ["预算来源", "预算单校验"]),
    ("MEM", ["预算来源", "预算单校验"]),
    ("制券服务商", ["确认 / 回传批次", "核销与账单"]),
    ("会员小程序", ["鉴权 / 发券", "核销事件"]),
    ("微信支付", ["券批次能力", "卡包展示"]),
]
ex = 200
for title, items in exts:
    ew = 188
    parts.append(f'''<rect x="{ex}" y="{y + 78}" width="{ew}" height="130" rx="8" fill="#fff" stroke="{C['ext_line']}" stroke-width="1.5"/>
    <text x="{ex + ew/2}" y="{y + 106}" text-anchor="middle" font-size="15" font-weight="700" fill="{C['title']}">{title}</text>''')
    iy = y + 122
    for it in items:
        parts.append(f'<text x="{ex + ew/2}" y="{iy}" text-anchor="middle" font-size="13" fill="{C["ink"]}">{it}</text>')
        iy += 24
    # arrows hint
    parts.append(f'<text x="{ex + ew/2}" y="{y + 70}" text-anchor="middle" font-size="11" fill="{C["ext_line"]}">↕</text>')
    ex += ew + 14

parts.append(f'''
    <text x="48" y="1155" font-size="13" fill="{C['muted']}">说明：色块表示一期范围；外部系统以联调集成为准。本图仅描述逻辑分层，不限定部署拓扑与技术栈。</text>
  </g>
</svg>
''')

svg = "\n".join(parts)
(out / "系统架构图_分层版.svg").write_text(svg, encoding="utf-8")
print("wrote", out / "系统架构图_分层版.svg", len(svg))

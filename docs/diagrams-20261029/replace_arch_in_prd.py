# -*- coding: utf-8 -*-
"""Replace system architecture figure in PRD docx files."""
from pathlib import Path
from copy import deepcopy
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC_IMG = Path(__file__).parent / "系统架构图.png"
DOCS = [
    ROOT / "deliverables/蒙牛活动管理平台_客户交付文档_20261027/蒙牛活动管理平台_产品需求文档_排版优化_V7.0.docx",
    ROOT / "deliverables/蒙牛活动管理平台_客户交付文档_20261027/蒙牛活动管理平台_产品需求文档_排版优化.docx",
]
NOTE = "范围说明：展示一期逻辑架构与外部系统协作；登录钉钉、审批 BPM、预算 TPM/MEM；微信支付能力独立于客户现有系统。不限定技术栈或部署拓扑。"

# Prepare a clean frame for Word (width-capped, light border)
FRAME_W = 1680
im = Image.open(SRC_IMG).convert("RGB")
if im.width != FRAME_W:
    h = round(im.height * FRAME_W / im.width)
    im = im.resize((FRAME_W, h), Image.Resampling.LANCZOS)
from PIL import ImageDraw
canvas = Image.new("RGB", (im.width + 4, im.height + 4), "white")
canvas.paste(im, (2, 2))
ImageDraw.Draw(canvas).rectangle((0, 0, canvas.width - 1, canvas.height - 1), outline="#DFE5E2", width=2)
framed = Path(__file__).parent / "_arch_for_docx.png"
canvas.save(framed, optimize=True)
aspect = canvas.height / canvas.width
width_cm = 16.0
height_cm = width_cm * aspect


def fmt(p, size=10, bold=False, color=None):
    f = p.paragraph_format
    f.line_spacing = 1.1
    f.space_before = Pt(0)
    f.space_after = Pt(6)
    for run in p.runs:
        run.font.name = "微软雅黑"
        run.font.size = Pt(size)
        run.bold = bold
        if color:
            run.font.color.rgb = RGBColor.from_string(color)
        rp = run._r.get_or_add_rPr()
        rf = OxmlElement("w:rFonts")
        for k in ["ascii", "hAnsi", "eastAsia", "cs"]:
            rf.set(qn("w:" + k), "微软雅黑")
        for old in list(rp.findall(qn("w:rFonts"))):
            rp.remove(old)
        rp.insert(0, rf)


def replace_one(path: Path):
    d = Document(str(path))
    paras = list(d.paragraphs)
    cap = next(p for p in paras if p.text.startswith("示意图 · 系统架构图"))
    # caption next: note, then image para
    note = None
    img_para = None
    el = cap._p.getnext()
    while el is not None:
        txt = "".join(el.xpath(".//w:t/text()"))
        if el.tag == qn("w:p") and txt.startswith("范围说明"):
            note = el
        if el.tag == qn("w:p") and el.xpath(".//a:blip"):
            img_para = el
            break
        if el.tag == qn("w:p") and el.xpath("./w:pPr/w:pStyle/@w:val") in [["1"], ["2"], ["3"], ["Heading1"], ["Heading2"]]:
            break
        el = el.getnext()
    assert img_para is not None, "architecture image paragraph not found"

    # Update note text
    if note is not None:
        # clear runs text via python-docx wrapper if possible
        for p in paras:
            if p._p is note:
                for r in p.runs:
                    r.text = ""
                if p.runs:
                    p.runs[0].text = NOTE
                else:
                    p.add_run(NOTE)
                fmt(p, 9)
                break

    # Drop old image rel after clearing drawing
    old_rids = img_para.xpath(".//a:blip/@r:embed")
    for child in list(img_para):
        if child.tag != qn("w:pPr"):
            img_para.remove(child)
    for rid in set(old_rids):
        if not d.element.xpath('.//a:blip[@r:embed="%s"]' % rid):
            try:
                d.part.drop_rel(rid)
            except Exception:
                pass

    # Rebuild image paragraph via a temporary paragraph API then move element
    # Use the existing empty paragraph: find corresponding Paragraph object
    target = next(p for p in d.paragraphs if p._p is img_para)
    target.alignment = WD_ALIGN_PARAGRAPH.CENTER
    f = target.paragraph_format
    f.line_spacing = 1.0
    f.space_before = Pt(0)
    f.space_after = Pt(10)
    run = target.add_run()
    run.font.size = Pt(1)
    run.add_picture(str(framed), width=Cm(width_cm), height=Cm(height_cm))

    d.core_properties.last_modified_by = "服务商"
    tmp = path.with_name(path.stem + "._tmp.docx")
    d.save(str(tmp))
    try:
        tmp.replace(path)
        print("updated", path.name, f"{width_cm:.1f}x{height_cm:.1f}cm")
    except Exception as e:
        alt = path.with_name(path.stem + "_架构更新.docx")
        tmp.replace(alt)
        print("locked, wrote", alt.name, "|", e)


for doc in DOCS:
    if doc.exists():
        replace_one(doc)
    else:
        print("skip missing", doc)
print("done")

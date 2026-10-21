
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import pymupdf
p = r'D:\Project\蒙牛\一期\蒙牛MTL平台视觉规范.pdf'
doc = pymupdf.open(p)
for n in [7,9,14,17]:
    page = doc[n-1]
    pix = page.get_pixmap(dpi=110)
    out = r'D:\Project\蒙牛-原型-ds-harness\_analysis\spec_p%d.png' % n
    pix.save(out)
    print(out, pix.width, pix.height)

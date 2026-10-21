
# -*- coding: utf-8 -*-
import sys, json, io
sys.stdout.reconfigure(encoding='utf-8')
import fitz
p = r'D:\Project\蒙牛\一期\蒙牛MTL平台视觉规范.pdf'
doc = fitz.open(p)
print('pages', doc.page_count)
out = []
for i, page in enumerate(doc):
    t = page.get_text('text')
    out.append('===== PAGE %d =====\n' % (i+1) + t.strip())
txt = '\n'.join(out)
open(r'D:\Project\蒙牛-原型-ds-harness\_analysis\spec.txt','w',encoding='utf-8').write(txt)
print('chars', len(txt))
print(txt[:6000])

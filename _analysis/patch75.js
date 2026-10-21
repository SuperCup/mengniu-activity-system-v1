
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* ---------- 计划与批次：表头 ---------- */
let b=fs.readFileSync(R+'js/pages/plan-batch.js','utf8');
b=b.replace('            <th style="width:120px">计划名称</th>','            <th style="width:150px">计划 / 券名称</th>');
b=b.replace('            <th style="width:112px">对应批次</th>','            <th style="width:112px">批次号</th>');
fs.writeFileSync(R+'js/pages/plan-batch.js', b, 'utf8');
console.log('ok plan-batch header');

/* ---------- 计划行：计划名称下带券名称 ---------- */
let l=fs.readFileSync(R+'js/components/plan-list.js','utf8');
l=l.replace("          + '<td>' + pnEsc(p.name) + '</td>'\n          + '<td>¥' + p.face + ' / 满 ' + p.thr + '</td>'",
"          + '<td><b>' + pnEsc(p.name) + '</b>'\n"
+ "            + (p.coupon ? '<div class=\"muted\" style=\"font-size:11.6px\">' + pnEsc(p.coupon) + (p.grant ? ' · ' + pnEsc(p.grant) : '') + '</div>' : '')\n"
+ "          + '</td>'\n"
+ "          + '<td>¥' + p.face + ' / 满 ' + p.thr + '</td>'");
fs.writeFileSync(R+'js/components/plan-list.js', l, 'utf8');
console.log('ok plan-list row');

/* ---------- 计划明细抽屉：补券名称与发券方式 ---------- */
l=fs.readFileSync(R+'js/components/plan-list.js','utf8');
l=l.replace("    + '<div class=\"r\"><span class=\"k\">计划名</span><span class=\"v\">' + pnEsc(p.name) + '</span></div>'",
"    + '<div class=\"r\"><span class=\"k\">计划名</span><span class=\"v\">' + pnEsc(p.name) + '</span></div>'\n"
+ "    + '<div class=\"r\"><span class=\"k\">券名称</span><span class=\"v\">' + pnEsc(p.coupon || p.bat || '—') + '</span></div>'\n"
+ "    + '<div class=\"r\"><span class=\"k\">发券方式</span><span class=\"v\">' + pnEsc(p.grant || '领券') + '</span></div>'");
fs.writeFileSync(R+'js/components/plan-list.js', l, 'utf8');
console.log('ok plan detail');

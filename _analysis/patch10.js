
const fs=require('fs');
const p='D:/Project/蒙牛-原型-ds-harness/hq-console/js/components/plan-list.js';
let s=fs.readFileSync(p,'utf8');

const retBlock = "      var rn = p.ret.length\n"
  + "        ? pnEsc(p.ret[0]) + (p.ret.length > 1 ? '<span class=\"muted\"> +' + (p.ret.length-1) + '</span>' : '')\n"
  + "        : '<span class=\"muted\">未导入</span>';\n"
  + "      var sn = p.sku.length\n"
  + "        ? pnEsc(p.sku[0]) + (p.sku.length > 1 ? '<span class=\"muted\"> +' + (p.sku.length-1) + '</span>' : '')\n"
  + "        : '<span class=\"muted\">未导入</span>';\n";

const newBlock = "      var rn = planLabel(p, 'ret');\n"
  + "      var sn = planLabel(p, 'sku');\n";

const n1 = s.split(retBlock).length - 1;
s = s.split(retBlock).join(newBlock);

/* 审批页缩进不同，单独处理 */
const apBlock = "    var rn = p.ret.length\n"
  + "      ? pnEsc(p.ret[0]) + (p.ret.length > 1 ? '<span class=\"muted\"> +' + (p.ret.length-1) + '</span>' : '')\n"
  + "      : '<span class=\"muted\">未导入</span>';\n"
  + "    var sn = p.sku.length\n"
  + "      ? pnEsc(p.sku[0]) + (p.sku.length > 1 ? '<span class=\"muted\"> +' + (p.sku.length-1) + '</span>' : '')\n"
  + "      : '<span class=\"muted\">未导入</span>';\n";
const n2 = s.split(apBlock).length - 1;
s = s.split(apBlock).join("    var rn = planLabel(p, 'ret');\n    var sn = planLabel(p, 'sku');\n");

/* 插入统一的标签生成函数 */
if(s.indexOf('function planLabel')<0){
  s = s.replace('/* ---------- 计划表（计划与批次 → 计划列表） ---------- */',
    "/* ---------- 计划里的零售商 / 商品摘要（优先用导入结果，保持与详情页一致） ---------- */\n"
  + "function planLabel(p, kind){\n"
  + "  var rows = kind === 'ret' ? (p.retRows || []) : (p.skuRows || []);\n"
  + "  var names = rows.length\n"
  + "    ? rows.map(function(r){ return kind === 'ret' ? (r.ret || r.store || '') : (r.name || ''); })\n"
  + "    : (kind === 'ret' ? (p.ret || []) : (p.sku || []));\n"
  + "  names = names.filter(Boolean);\n"
  + "  if(!names.length) return '<span class=\"muted\">未导入</span>';\n"
  + "  return pnEsc(names[0]) + (names.length > 1 ? '<span class=\"muted\"> +' + (names.length - 1) + '</span>' : '');\n"
  + "}\n\n"
  + "/* ---------- 计划表（计划与批次 → 计划列表） ---------- */");
}
fs.writeFileSync(p,s,'utf8');
console.log('replaced blocks:', n1, n2);

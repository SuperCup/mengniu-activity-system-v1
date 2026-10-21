
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* 1. projCard 支持审批模式 */
let m=fs.readFileSync(R+'js/pages/project-manage.js','utf8');
if(m.indexOf('function projCard(p, mode)')<0) m=m.replace("function projCard(p){","function projCard(p, mode){");
if(m.indexOf('approveButtons(p)')<0) m=m.replace("  var btns = projButtons(p);","  var btns = (mode === 'approve') ? approveButtons(p) : projButtons(p);");
if(m.indexOf('function approveButtons')<0){
  m=m.replace('/* ---------- 按状态给动作按钮（不加任何说明文字） ---------- */',
              fs.readFileSync(A+'approve-btns.js','utf8')+'/* ---------- 按状态给动作按钮（不加任何说明文字） ---------- */');
}
fs.writeFileSync(R+'js/pages/project-manage.js', m, 'utf8');
console.log('ok manage card: mode='+(m.indexOf('function projCard(p, mode)')>=0)+' btn='+(m.indexOf('approveButtons(p)')>=0));

/* 2. 审批页整体替换 */
fs.writeFileSync(R+'js/pages/project-approve.js', fs.readFileSync(A+'approve-page.js','utf8'), 'utf8');
console.log('ok approve page');

/* 3. 有效期统一为年月日（YYYY-MM-DD） */
let l=fs.readFileSync(R+'js/components/plan-list.js','utf8');
l=l.replace("+ p.s.slice(5) + ' ~ ' + p.e.slice(5) +","+ mnDate(p.s) + ' ~ ' + mnDate(p.e) +");
fs.writeFileSync(R+'js/components/plan-list.js', l, 'utf8');
console.log('ok plan-list date: '+(l.indexOf('mnDate(p.s)')>=0));

let b=fs.readFileSync(R+'js/components/batch-drawer.js','utf8');
b=b.replace("(start ? start.slice(5) : '—') + ' 至 ' + (end ? end.slice(5) : '—')","(start ? mnDate(start) : '—') + ' 至 ' + (end ? mnDate(end) : '—')");
fs.writeFileSync(R+'js/components/batch-drawer.js', b, 'utf8');
console.log('ok batch date: '+(b.indexOf('mnDate(start)')>=0));

let c=fs.readFileSync(R+'js/pages/coupon-page.js','utf8');
c=c.replace("exp:(p.bs?p.bs.slice(5):'')+'-'+(p.be?p.be.slice(5):'')+' 有效',","exp:(p.bs?mnDate(p.bs):'')+' 至 '+(p.be?mnDate(p.be):'')+' 有效',");
fs.writeFileSync(R+'js/pages/coupon-page.js', c, 'utf8');
console.log('ok coupon date: '+(c.indexOf('mnDate(p.bs)')>=0));

let v=fs.readFileSync(R+'js/pages/vendor-portal.js','utf8');
v=v.replace('批次有效期 12-30 起，与计划一致','批次有效期 2026-12-30 起，与计划一致');
fs.writeFileSync(R+'js/pages/vendor-portal.js', v, 'utf8');
console.log('ok portal date');

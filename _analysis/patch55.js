
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'js/components/plan-list.js';
let s=fs.readFileSync(P,'utf8');

/* 1) 替换 renderPlans，并删除 renderCreatePlans 整块 */
const a=s.indexOf('/* ---------- 计划表（计划与批次 → 计划列表） ---------- */');
const b=s.indexOf('/* ---------- 批次表：与计划严格 1:1');
if(a<0||b<0) throw new Error('renderPlans anchors');
s=s.slice(0,a)+fs.readFileSync(A+'render-plans.js','utf8')+'\n'+s.slice(b);

/* 2) gotoPlan 按作用域计算 */
const g=s.indexOf('function gotoPlan(n){');
const ge=s.indexOf('function delPlan(i){');
if(g<0||ge<0) throw new Error('gotoPlan anchors');
s=s.slice(0,g)+fs.readFileSync(A+'goto-plan.js','utf8')+'\n'+s.slice(ge);

fs.writeFileSync(P,s,'utf8');
console.log('plan-list paging updated; renderCreatePlans removed:', s.indexOf('renderCreatePlans')<0);

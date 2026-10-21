
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

let p=fs.readFileSync(R+'js/data/plans.js','utf8');
const anchor="\n\n/* ---------- 已批准但未补配置的示例（0044 元旦乳品满减） ---------- */";
if(p.indexOf('0044 下 4 个计划')<0){
  if(p.indexOf(anchor)<0) throw new Error('plans anchor');
  p=p.replace(anchor, '\n' + fs.readFileSync(A+'plans-bind.js','utf8') + anchor);
  fs.writeFileSync(R+'js/data/plans.js', p, 'utf8');
  console.log('ok plans bind');
}

/* store 迁移：旧数据结构补券名称 / 发券方式 */
let s=fs.readFileSync(R+'js/core/store.js','utf8');
if(s.indexOf('x.coupon')<0){
  s=s.replace("      if(!p.version) p.version = 1;",
"      if(p.coupon == null) p.coupon = p.bat || '';\n      if(!p.grant) p.grant = '领券';\n      if(!p.version) p.version = 1;");
  fs.writeFileSync(R+'js/core/store.js', s, 'utf8');
  console.log('ok store migrate plans');
}


const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* 1) projects.js 追加展示helper */
let p=fs.readFileSync(R+'js/data/projects.js','utf8');
if(p.indexOf('briefCellTxt')<0){
  const i=p.indexOf('PROJECTS.forEach(function(p){ p.planBrief');
  p=p.slice(0,i)+fs.readFileSync(A+'brief-helper.js','utf8')+'\n'+p.slice(i);
  fs.writeFileSync(R+'js/data/projects.js',p,'utf8');
  console.log('helper added');
}

/* 2) 项目详情：零售商 / 商品列改成摘要 */
const P=R+'js/components/project-drawer.js';
let d=fs.readFileSync(P,'utf8');
const i=d.indexOf("pnEsc(b.ret)");
if(i<0){ console.log('!! drawer line not found'); }
else{
  const ls=d.lastIndexOf('\n', i)+1;
  let le=d.indexOf('\n', i); if(le<0) le=d.length;
  d=d.slice(0,ls)+fs.readFileSync(A+'drawer-line.txt','utf8')+d.slice(le);
  fs.writeFileSync(P,d,'utf8');
  console.log('drawer row updated');
}

/* 3) .bcell 样式 */
const C=R+'css/components.css';
let c=fs.readFileSync(C,'utf8');
if(c.indexOf('.bcell')<0){
  c=c+'\n/* ---------- 计划概况：多值单元格 ---------- */\n'
   + '.bcell{display:flex;align-items:center;gap:8px;min-width:0}\n'
   + '.bcell .bv{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.1px;color:var(--ink)}\n'
   + '.bcell .lnk{flex:0 0 auto;font-size:11.8px}\n';
  fs.writeFileSync(C,c,'utf8');
  console.log('bcell css added');
}

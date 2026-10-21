const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* 1) 创建页：计划概况必填校验 */
let c=fs.readFileSync(R+'js/pages/project-create.js','utf8');
if(c.indexOf('CRE_BRIEF.filter')<0){
  const guard=fs.readFileSync(A+'cre-guard.txt','utf8');
  const marker="  if(missing.length){ MT.toast('提交前请补充：' + missing.join('、'), 'err'); return; }";
  const i=c.indexOf(marker);
  if(i<0) throw new Error('submit marker not found');
  c=c.slice(0,i)+guard+c.slice(i);
  c=c.replace('按上面 1 个概况补成 1 个计划 + 1 个批次，填写预算分配与券规则（面额 / 门槛 / 发放数量 / 有效期），',
              '按上面的计划概况逐个补成「计划 + 批次」，填写预算分配与券规则（面额 / 门槛 / 发放数量 / 有效期），');
  fs.writeFileSync(R+'js/pages/project-create.js',c,'utf8');
  console.log('guard inserted');
}

/* 2) 项目详情：计划概况 */
let d=fs.readFileSync(R+'js/components/project-drawer.js','utf8');
if(d.indexOf('计划概况')<0){
  const sec=fs.readFileSync(A+'drawer-sec.txt','utf8');
  const m='  /* 四、状态时间线 */';
  const i=d.indexOf(m);
  if(i<0) throw new Error('drawer marker not found');
  d=d.slice(0,i)+sec+d.slice(i);
  fs.writeFileSync(R+'js/components/project-drawer.js',d,'utf8');
  console.log('drawer section inserted');
}

/* 3) 启动渲染 */
let a=fs.readFileSync(R+'js/app.js','utf8');
if(a.indexOf('renderProjBrief')<0){
  a=a.replace("    safe(window.initProjVendor,     'initProjVendor');",
              "    safe(window.initProjVendor,     'initProjVendor');\n    safe(window.renderProjBrief,    'renderProjBrief');");
  fs.writeFileSync(R+'js/app.js',a,'utf8');
  console.log('boot wired');
}

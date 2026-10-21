
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'js/pages/project-create.js';
let s=fs.readFileSync(P,'utf8');

/* 1) 删除「活动机制 / 零售商范围」整行（含两条灰色提示） */
const hint='报批只填范围；门店级明细在审批通过后导入';
const hi=s.indexOf(hint);
if(hi<0){ console.log('!! 活动机制行未找到'); }
else{
  const start=s.lastIndexOf('      <div class="fg c2">', hi);
  let e=s.indexOf('\n', hi)+1;      // 结束 hint 行
  e=s.indexOf('\n', e)+1;           // 结束 内层 </div>
  e=s.indexOf('\n', e)+1;           // 结束 外层 </div>
  const removed=s.slice(start,e);
  console.log('--- 将删除 ---');
  console.log(removed);
  s=s.slice(0,start)+s.slice(e);
}

/* 2) 四、计划概况：换成无说明、无第五节的新块 */
const bStart=s.indexOf('      <!-- 四、计划概况（报批阶段只写做什么） -->');
const bEnd=s.indexOf('      <div class="panel-f">');
if(bStart<0||bEnd<0) throw new Error('block anchors '+bStart+' '+bEnd);
s=s.slice(0,bStart)+fs.readFileSync(A+'cre-block2.html','utf8')+s.slice(bEnd);

/* 3) 计划概况逻辑整段替换 */
const fStart=s.indexOf('/* ---------- 计划概况（报批阶段）：只写做什么，不写预算与规则 ---------- */');
const fEnd=s.indexOf('/* ---------- 注册模块 ---------- */');
if(fStart<0||fEnd<0) throw new Error('fn anchors');
s=s.slice(0,fStart)+fs.readFileSync(A+'cre-fn2.js','utf8')+s.slice(fEnd);

/* 4) submitProject 整段替换 */
const sStart=s.indexOf('/** 提交审批：报批前的前置校验提示 */');
const sEnd=s.indexOf('/* ---------- 模板：v-create ---------- */');
if(sStart<0||sEnd<0) throw new Error('submit anchors');
s=s.slice(0,sStart)+fs.readFileSync(A+'submit-fn.txt','utf8')+'\n'+s.slice(sEnd);

fs.writeFileSync(P,s,'utf8');
console.log('create page rebuilt');

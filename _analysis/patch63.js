
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const rd=function(f){ return fs.readFileSync(A+f,'utf8'); };
const w=function(f,s){ fs.writeFileSync(R+f,s,'utf8'); console.log('ok '+f); };

/* ---------- 1. 项目管理 ---------- */
let s=fs.readFileSync(R+'js/pages/project-manage.js','utf8');
const oldAct='function projAct(act, id){\n  var p = projByAny(id);\n  if(!p) return;';
if(s.indexOf(oldAct)>=0){ s=s.replace(oldAct, rd('mg-act.txt')); console.log('ok projAct'); }
else console.log('!! projAct marker');

let L=s.split('\n');
let ti=L.findIndex(function(x){ return x.indexOf('审批已通过，待推送')>=0; });
if(ti>=0){
  L.splice(ti+2,0, rd('mg-tags.txt'));
  console.log('ok cfg tag');
}
L=L.map(function(x){
  return x.indexOf('补充计划明细')>=0 ? rd('mg-btn.txt') : x;
});
w('js/pages/project-manage.js', L.join('\n'));

/* ---------- 2. 计划表：配置状态列 ---------- */
let p=fs.readFileSync(R+'js/components/plan-list.js','utf8');
let PL=p.split('\n');
let ci=PL.findIndex(function(x){ return x.indexOf("ck.txt + '</span></td>'")>=0; });
if(ci>=0){ PL.splice(ci,0, rd('cfg-cell.txt')); console.log('ok cfg cell'); }
let li=PL.findIndex(function(x){ return x.indexOf('明细</a>')>=0 && x.indexOf('openPlanDetail')>=0; });
if(li>=0){ PL.splice(li+1,0, rd('cfg-link.txt')); console.log('ok cfg link'); }
p=PL.join('\n').replace('colspan="9" class="empty-row"','colspan="10" class="empty-row"');
w('js/components/plan-list.js', p);

/* ---------- 3. 计划表表头 ---------- */
let b=fs.readFileSync(R+'js/pages/plan-batch.js','utf8');
let BL=b.split('\n');
let hi=BL.findIndex(function(x){ return x.indexOf('width:88px">校验')>=0; });
if(hi>=0){ BL.splice(hi+1,0, rd('plan-th.txt')); console.log('ok plan th'); }
w('js/pages/plan-batch.js', BL.join('\n'));

/* ---------- 4. 工作台待办 ---------- */
let hs=fs.readFileSync(R+'js/pages/home.js','utf8');
const a1=hs.indexOf('function todoDefs(){');
const b1=hs.indexOf('function renderTodos(){');
if(a1<0||b1<0) throw new Error('home anchors');
hs=hs.slice(0,a1)+rd('todo-defs.js')+'\n\n'+hs.slice(b1);
w('js/pages/home.js', hs);

/* ---------- 5. workflow 追加 ---------- */
fs.appendFileSync(R+'js/core/workflow.js', '\n'+rd('workflow-add.js'), 'utf8');
console.log('ok workflow add');

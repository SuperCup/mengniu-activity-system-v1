
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
function rep(f,a,b){ let s=fs.readFileSync(R+f,'utf8'); if(s.indexOf(a)<0){ console.log('!! MISS '+f+' :: '+a.slice(0,40)); return false; } fs.writeFileSync(R+f, s.replace(a,b),'utf8'); console.log('ok '+f); return true; }
function repLine(f, needle, newFile, after){
  let s=fs.readFileSync(R+f,'utf8');
  const i=s.indexOf(needle);
  if(i<0){ console.log('!! LINE MISS '+f+' :: '+needle.slice(0,40)); return; }
  const ls=s.lastIndexOf('\n', i)+1;
  let le=s.indexOf('\n', i); if(le<0) le=s.length;
  const add=fs.readFileSync(A+newFile,'utf8');
  s = after ? s.slice(0,le+1)+add+s.slice(le+1) : s.slice(0,ls)+add+s.slice(le);
  fs.writeFileSync(R+f,s,'utf8'); console.log('ok line '+f);
}

/* 1. 项目管理：动作委托 + 待补配置标签 + 按钮 */
rep('js/pages/project-manage.js',
  'function projAct(act, id){\n  var p = projByAny(id);\n  if(!p) return;',
  'function projAct(act, id){\n  return wfAct(act, id);\n}\n\nfunction projActLegacy(act, id){\n  var p = projByAny(id);\n  if(!p) return;');

rep('js/pages/project-manage.js',
  "  if(p.state === 'approved' && p.pushTo){\n    tags += '<span class=\"tg tg-a\">审批已通过，待推送</span>';\n  }\n",
  "  if(p.state === 'approved' && p.pushTo){\n    tags += '<span class=\"tg tg-a\">审批已通过，待推送</span>';\n  }\n"
  + "  if(p.state === 'approved' || p.state === 'confirmed'){\n"
  + "    var cfg = (typeof projConfigStat === 'function') ? projConfigStat(p.id) : null;\n"
  + "    if(cfg && cfg.total){\n"
  + "      tags += '<span class=\"tg ' + (cfg.todo ? 'tg-a' : 'tg-g') + '\">待补配置 ' + cfg.ready + '/' + cfg.total + '</span>';\n"
  + "    }\n"
  + "  }\n");

repLine('js/pages/project-manage.js', '补充计划明细', 'mg-btn.txt');

/* 2. 计划表：配置状态列 + 继续配置入口 */
repLine('js/components/plan-list.js', "ck.txt + '</span></td>'", 'cfg-cell.txt', false);
repLine('js/components/plan-list.js', "openPlanDetail(' + i + ')">明细</a>'", 'cfg-link.txt', true);
rep('js/components/plan-list.js', 'colspan="9" class="empty-row"', 'colspan="10" class="empty-row"');

/* 3. 计划表表头 */
rep('js/pages/plan-batch.js',
  '<th style="width:88px">校验</th>',
  '<th style="width:88px">校验</th>\n                <th style="width:86px">配置状态</th>');

/* 4. 工作台待办 */
let hs=fs.readFileSync(R+'js/pages/home.js','utf8');
const a1=hs.indexOf('function todoDefs(){');
const b1=hs.indexOf('function renderTodos(){');
if(a1<0||b1<0) throw new Error('home anchors');
hs=hs.slice(0,a1)+fs.readFileSync(A+'todo-defs.js','utf8')+'\n\n'+hs.slice(b1);
fs.writeFileSync(R+'js/pages/home.js',hs,'utf8');
console.log('ok home todoDefs');

/* 5. workflow 追加 wfGoFirstConfig */
fs.appendFileSync(R+'js/core/workflow.js', '\n'+fs.readFileSync(A+'workflow-add.js','utf8'), 'utf8');
console.log('ok workflow add');

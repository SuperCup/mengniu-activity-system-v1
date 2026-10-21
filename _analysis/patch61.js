
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
function rep(f,a,b){ let s=fs.readFileSync(R+f,'utf8'); if(s.indexOf(a)<0){ console.log('!! MISS '+f); return; } fs.writeFileSync(R+f, s.replace(a,b),'utf8'); console.log('ok '+f); }

/* router.js：替换 fromHash 段，并让 go() 在带参数时不抹掉参数 */
let r=fs.readFileSync(R+'js/core/router.js','utf8');
const a=r.indexOf('/* ---------- 支持 #v-xxx 直达 ---------- */');
const b=r.indexOf('/* ---------- 侧边栏图标');
if(a<0||b<0) throw new Error('router anchors');
r=r.slice(0,a)+fs.readFileSync(A+'router-hash.js','utf8')+'\n'+r.slice(b);
fs.writeFileSync(R+'js/core/router.js',r,'utf8');
console.log('ok router hash');

rep('js/core/router.js',
  "  if(location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);",
  "  if(MT.parseHash().page !== id) MT.setHash(id, {});");

/* index.html：workflow.js 放在 pages 之后、app.js 之前 */
rep('index.html',
  '<script src="js/pages/vendor-portal.js"></script>',
  '<script src="js/pages/vendor-portal.js"></script>\n\n<!-- ---------- 业务流程动作 ---------- -->\n<script src="js/core/workflow.js"></script>');

/* 三个入口改为调用真实动作 */
rep('js/pages/project-create.js',
  "  if(missing.length){ MT.toast('提交前请补充：' + missing.join('、'), 'err'); return; }\n  MT.toast('已提交审批。审批通过后请在「项目管理 → 计划与批次」补充预算与券规则');",
  "  if(missing.length){ MT.toast('提交前请补充：' + missing.join('、'), 'err'); return; }\n  wfSubmit();");

rep('js/pages/project-approve.js',
  "function projApprove(id, act){\n  var p = projByAny(id); if(!p) return;",
  "function projApprove(id, act){\n  return wfApprove(id, act);\n}\n\nfunction projApproveLegacy(id, act){\n  var p = projByAny(id); if(!p) return;");

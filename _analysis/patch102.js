
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* ---------- 1. 新文件 ---------- */
fs.writeFileSync(R+'js/data/logs.js', fs.readFileSync(A+'logs.js','utf8'), 'utf8');
fs.writeFileSync(R+'js/core/audit.js', fs.readFileSync(A+'audit.js','utf8'), 'utf8');
fs.writeFileSync(R+'js/pages/log-page.js', fs.readFileSync(A+'log-page.js','utf8'), 'utf8');
console.log('ok files');

/* ---------- 2. index.html 挂脚本 ---------- */
let h=fs.readFileSync(R+'index.html','utf8');
if(h.indexOf('js/data/logs.js')<0){
  h=h.replace('<script src="js/data/roles.js"></script>',
              '<script src="js/data/logs.js"></script>\n<script src="js/data/roles.js"></script>');
}
if(h.indexOf('js/core/audit.js')<0){
  h=h.replace('<script src="js/core/store.js"></script>',
              '<script src="js/core/store.js"></script>\n<script src="js/core/audit.js"></script>');
}
if(h.indexOf('js/pages/log-page.js')<0){
  h=h.replace('<script src="js/pages/system-admin.js"></script>',
              '<script src="js/pages/system-admin.js"></script>\n<script src="js/pages/log-page.js"></script>');
}
fs.writeFileSync(R+'index.html', h, 'utf8');
console.log('ok index: '+['js/data/logs.js','js/core/audit.js','js/pages/log-page.js'].every(function(x){return h.indexOf(x)>=0;}));

/* ---------- 3. store：日志入本地仓库 ---------- */
let st=fs.readFileSync(R+'js/core/store.js','utf8');
st=st.replace('var SCHEMA = 4;','var SCHEMA = 5;');
st=st.replace("      projects: plain(window.PROJECTS || []),\n      plans: plain(window.PLANS || [])",
              "      projects: plain(window.PROJECTS || []),\n      plans: plain(window.PLANS || []),\n      logs: plain((window.SYS_LOGS || []).slice(0, 500))");
st=st.replace("    if(Array.isArray(data.plans) && data.plans.length){\n      window.PLANS.length = 0;\n      data.plans.forEach(function(p){ window.PLANS.push(p); });\n    }",
              "    if(Array.isArray(data.plans) && data.plans.length){\n      window.PLANS.length = 0;\n      data.plans.forEach(function(p){ window.PLANS.push(p); });\n    }\n    if(Array.isArray(data.logs) && data.logs.length){\n      window.SYS_LOGS.length = 0;\n      data.logs.forEach(function(r){ window.SYS_LOGS.push(r); });\n    }");
fs.writeFileSync(R+'js/core/store.js', st, 'utf8');
console.log('ok store: '+(st.indexOf('logs: plain')>=0)+' / '+(st.indexOf('SYS_LOGS.push')>=0));

/* ---------- 4. 侧边栏图标 ---------- */
let rt=fs.readFileSync(R+'js/core/router.js','utf8');
if(rt.indexOf("'v-log':")<0){
  rt=rt.replace("  'v-vendor':",
    "  'v-log': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.6\" y=\"2\" width=\"10.8\" height=\"12\" rx=\"1.4\"/><path d=\"M5.2 5.6h5.6M5.2 8h5.6M5.2 10.4h3.4\"/></svg>',\n  'v-vendor':");
}
/* 进入日志页时刷新列表 */
rt=rt.replace("  if(id === 'v-board' && typeof renderDbAll === 'function'){ try{ renderDbAll(); }catch(e){} }",
              "  if(id === 'v-board' && typeof renderDbAll === 'function'){ try{ renderDbAll(); }catch(e){} }\n\n  /* 系统日志每次进入按当前筛选重绘 */\n  if(id === 'v-log' && typeof renderLogs === 'function'){ renderLogs(); }");
fs.writeFileSync(R+'js/core/router.js', rt, 'utf8');
console.log('ok router: '+(rt.indexOf("'v-log'")>=0));

/* ---------- 5. 业务动作写日志 ---------- */
let w=fs.readFileSync(R+'js/core/workflow.js','utf8');
function ins(anchor, add){
  if(w.indexOf(anchor)<0) throw new Error('anchor missing: '+anchor.slice(0,50));
  w=w.replace(anchor, anchor+'\n'+add);
}
ins("  window.PROJECTS.push(proj);",
    "  sysLog('项目管理', '提交审批', proj.name, proj.id, '提交后进入待审批，审批人：数字化中心 张明');");
ins("    p.approvedBy = '数字化中心 · 张明';",
    "    sysLog('项目审批', '审批通过', p.name, p.id, '第 1 级审批通过；待补执行配置 ' + projConfigStat(p.id).todo + ' 个计划');");
ins("    p.rejectLog.push({ at:now, by:'数字化中心 · 张明', note:'方案信息不足，退回修改' });",
    "    sysLog('项目审批', '审批驳回', p.name, p.id, '驳回原因：方案信息不足，退回修改');");
ins("    p.state = 'pending'; p.submitted = now; p.saved = now;",
    "    sysLog('项目管理', '提交审批', p.name, p.id, '草稿提交，进入待审批');");
ins("    p.state = 'draft'; p.saved = now;",
    "    sysLog('项目管理', '撤回审批', p.name, p.id, '撤回后回到草稿');");
ins("    p.handoff = { at:now, by:mnCurrentUser().name, plans:stat.list.map(function(x){ return x.id; }) };",
    "    sysLog('项目管理', '推送服务商', p.name, p.id, '推送至 ' + (p.vendor || '服务商') + '，共 ' + stat.list.length + ' 个计划（本地记录）');");
ins("    if(!p.handoff){ MT.toast('还没有推送记录，无法重发', 'err'); return; }",
    "    sysLog('项目管理', '重发确认邮件', p.name, p.id, '重发至 ' + (p.vendorMail || '服务商邮箱') + '（本地模拟）');");
ins("    p.state = 'stopped'; p.saved = now; p.stoppedAt = now;",
    "    sysLog('项目管理', '终止项目', p.name, p.id, '终止后释放未核销预算额度');");
ins("    if(i >= 0) window.PROJECTS.splice(i, 1);",
    "    sysLog('项目管理', '删除草稿', p.name, p.id, '草稿已删除');");
ins("    window.PROJECTS.push(cp);",
    "    sysLog('项目管理', '复制项目', cp.name, cp.id, '由 ' + p.id + ' 复制为新草稿');");
fs.writeFileSync(R+'js/core/workflow.js', w, 'utf8');
console.log('ok workflow logs: '+(w.match(/sysLog\(/g)||[]).length);

/* ---------- 6. 批次配置 / 计划保存也留痕 ---------- */
let b=fs.readFileSync(R+'js/components/batch-drawer.js','utf8');
if(b.indexOf("sysLog('计划与批次', '保存批次配置'")<0){
  b=b.replace("  p.updatedAt = (typeof wfNow === 'function') ? wfNow() : '';",
    "  p.updatedAt = (typeof wfNow === 'function') ? wfNow() : '';\n\n"
  + "  sysLog('计划与批次', '保存批次配置', p.name, p.id,\n"
  + "    '券名称 ' + name + '；面额 ' + face + ' 元；门槛 ' + thr + ' 元；可用 ' + start + ' ~ ' + end\n"
  + "    + '；零售商 ' + PN.ret.length + ' 条；商品 ' + PN.sku.length + ' 条');");
  fs.writeFileSync(R+'js/components/batch-drawer.js', b, 'utf8');
}
console.log('ok batch log: '+(b.indexOf('保存批次配置')>=0));

let pd=fs.readFileSync(R+'js/components/plan-drawer.js','utf8');
if(pd.indexOf("sysLog('计划与批次'")<0){
  pd=pd.replace("  if(typeof mnPersist === 'function') mnPersist();\n  renderPlans();\n  closeDrawer();",
    "  sysLog('计划与批次', (PN.idx >= 0 ? '编辑计划' : '创建计划'), name,\n"
  + "    (PN.idx >= 0 ? PLANS[PN.idx].id : obj.id),\n"
  + "    '机制 ' + mech + '；生效 ' + s + ' ~ ' + e + '；零售商 ' + PN.ret.length + ' 条；商品 ' + PN.sku.length + ' 条');\n\n"
  + "  if(typeof mnPersist === 'function') mnPersist();\n  renderPlans();\n  closeDrawer();");
  fs.writeFileSync(R+'js/components/plan-drawer.js', pd, 'utf8');
}
console.log('ok plan log: '+(pd.indexOf("sysLog('计划与批次'")>=0));

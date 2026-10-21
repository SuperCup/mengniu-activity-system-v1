
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 1) index.html 引入 roles 数据 */
let h=fs.readFileSync(R+'index.html','utf8');
if(h.indexOf('js/data/roles.js')<0){
  h=h.replace('<script src="js/data/projects.js"></script>',
    '<script src="js/data/projects.js"></script>\n<script src="js/data/roles.js"></script>');
  fs.writeFileSync(R+'index.html',h,'utf8');
  console.log('roles.js included');
}

/* 2) app.js 启动渲染补齐 */
let a=fs.readFileSync(R+'js/app.js','utf8');
if(a.indexOf('renderRoles')<0){
  a=a.replace("    safe(window.renderProjCards,    'renderProjCards');",
    "    safe(window.renderProjCards,    'renderProjCards');\n"
  + "    safe(window.renderApproveList,  'renderApproveList');\n"
  + "    safe(window.renderRoles,        'renderRoles');\n"
  + "    safe(window.renderOrgs,         'renderOrgs');");
  fs.writeFileSync(R+'js/app.js',a,'utf8');
  console.log('app boot extended');
}

/* 3) 移除已不再使用的审批-计划表渲染（审批页只做列表） */
let p=fs.readFileSync(R+'js/components/plan-list.js','utf8');
const s1=p.indexOf('/* ---------- 审批详情：批次计划（与项目创建共用 PLANS） ---------- */');
const s2=p.indexOf('function delPlan(');
if(s1>0 && s2>s1){
  p = p.slice(0,s1) + p.slice(s2);
  p = p.replace('  renderApprovePlans();\n','');
  fs.writeFileSync(R+'js/components/plan-list.js',p,'utf8');
  console.log('renderApprovePlans removed');
}

/* 4) 页签样式 */
let c=fs.readFileSync(R+'css/components.css','utf8');
if(c.indexOf('.atab')<0){
  c += "\n/* ---------- 页签（系统管理等） ---------- */\n"
   + ".steps .atab{\n"
   + "  flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;\n"
   + "  padding:9px 16px;cursor:pointer;font-size:var(--fs-sm);color:var(--ink-60);\n"
   + "  border-bottom:2px solid transparent;transition:.16s;\n"
   + "}\n"
   + ".steps .atab:hover{color:var(--brand-d);background:var(--brand-ll)}\n"
   + ".steps .atab.on{color:var(--brand-d);font-weight:700;border-bottom-color:var(--brand);background:transparent}\n"
   + ".steps .atab .c{\n"
   + "  font-size:11px;color:var(--ink-40);background:var(--bg-soft);\n"
   + "  border-radius:8px;padding:0 6px;line-height:16px;min-width:16px;text-align:center;\n"
   + "}\n"
   + ".steps .atab.on .c{background:var(--brand-l);color:var(--brand-d)}\n"
   + "\n/* 卡片左下角保存时间 + 右上按钮组 */\n"
   + ".pcard-f .savet{font-size:11.6px;color:var(--ink-40)}\n"
   + ".pcard-f .pcard-btns{margin-left:auto;display:flex;align-items:center;gap:8px}\n";
  fs.writeFileSync(R+'css/components.css',c,'utf8');
  console.log('tabs css added');
}

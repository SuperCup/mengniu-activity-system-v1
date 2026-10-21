
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/pages/plan-batch.js';
let s=fs.readFileSync(P,'utf8');

/* 1) 作用域说明文案按状态区分 */
s=s.replace("  var canEdit = (p.state === 'approved' || p.state === 'running');",
  "  var blocked = (p.state === 'draft' || p.state === 'pending');\n"
+ "  var ended = (p.state === 'stopped');");

s=s.replace("  if(!bar) return;\n\n  if(!p){\n    bar.style.display = 'none';\n    if(tip) tip.innerHTML = '全部项目';\n    return;\n  }",
  "  if(!bar) return;\n\n  if(!p){\n    bar.style.display = 'none';\n    if(tip) tip.innerHTML = '全部项目';\n    if(typeof renderPlans === 'function') renderPlans();\n    return;\n  }");

s=s.replace("    + (canEdit ? '' : '<div class=\"note b\" style=\"margin-top:10px\">该项目当前为「' + st.label + '」，审批通过后才可补充计划明细。</div>')",
  "    + (blocked ? '<div class=\"note b\" style=\"margin-top:10px\">该项目当前为「' + st.label + '」，审批通过后才可补充计划明细。</div>' : '')\n"
+ "    + (ended ? '<div class=\"note b\" style=\"margin-top:10px\">该项目已终止，计划与批次仅可查看，不可新增。</div>' : '')");

s=s.replace("  if(tip) tip.innerHTML = '当前项目：<b>' + pnEsc(p.name) + '</b>';\n}",
  "  if(tip) tip.innerHTML = '当前项目：<b>' + pnEsc(p.name) + '</b>';\n\n"
+ "  /* 作用域变化后重算表格 */\n"
+ "  if(typeof renderPlans === 'function') renderPlans();\n}");

/* 2) 入口只调一处 */
s=s.replace("function goPlanAll(){\n  PLAN_SCOPE = null;\n  renderPlanScope();\n  renderPlans();\n}",
  "function goPlanAll(){\n  PLAN_SCOPE = null;\n  renderPlanScope();\n}");

fs.writeFileSync(P,s,'utf8');
console.log('scope render fixed');

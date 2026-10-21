
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 1) 计划归属项目 */
let p=fs.readFileSync(R+'js/data/plans.js','utf8');
if(p.indexOf('.proj =')<0 && p.indexOf('p.proj')<0){
  p += "\n/* 计划归属的项目（用于「计划与批次」按项目看） */\n"
    + "PLANS.forEach(function(x){ if(!x.proj) x.proj = 'MN-WX-202612-0041'; });\n";
  fs.writeFileSync(R+'js/data/plans.js',p,'utf8');
  console.log('plans proj added');
}

/* 2) 视图切换时刷新计划页作用域 */
let r=fs.readFileSync(R+'js/core/router.js','utf8');
if(r.indexOf('renderPlanScope')<0){
  r=r.replace("  /* 数据看板每次进入重算指标，保证与计划/批次数据同源 */",
    "  /* 计划与批次：菜单进入看全部，由项目管理进入看当前项目 */\n"
  + "  if(id === 'v-plan'){\n"
  + "    if(typeof PLAN_SCOPE !== 'undefined' && !PLAN_SCOPE_KEEP) PLAN_SCOPE = null;\n"
  + "    if(typeof renderPlanScope === 'function') renderPlanScope();\n"
  + "  }\n\n"
  + "  /* 数据看板每次进入重算指标，保证与计划/批次数据同源 */");
  fs.writeFileSync(R+'js/core/router.js',r,'utf8');
  console.log('router scope hook added');
}


const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let a=fs.readFileSync(R+'js/app.js','utf8');
a=a.split("'[MTL] 模块初始化失败：'").join("'[蒙牛活动管理平台] 模块初始化失败：'");
if(a.indexOf('renderPlanScope')<0){
  a=a.replace("    safe(window.renderPlans,        'renderPlans');",
    "    safe(window.renderPlanScope,    'renderPlanScope');\n"
  + "    safe(window.renderPlans,        'renderPlans');");
}
fs.writeFileSync(R+'js/app.js',a,'utf8');
console.log('app patched');

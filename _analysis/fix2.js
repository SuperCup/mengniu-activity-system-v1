
const fs=require('fs');
const p='D:/Project/蒙牛-原型-ds-harness/hq-console/js/pages/plan-batch.js';
let s=fs.readFileSync(p,'utf8');
if(s.indexOf('MT.definePage')<0){
  s += "\n/* ---------- 注册模块 ---------- */\n"
     + "MT.definePage({\n"
     + "  id: \"v-plan\",\n"
     + "  title: \"计划与批次\",\n"
     + "  crumb: \"活动运营 / 计划与批次\",\n"
     + "  group: \"活动运营\",\n"
     + "  template: tplPageplan\n"
     + "});\n";
  fs.writeFileSync(p,s,'utf8');
  console.log('re-registered v-plan');
} else console.log('already ok');

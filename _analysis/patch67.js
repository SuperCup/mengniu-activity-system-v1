
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let a=fs.readFileSync(R+'js/app.js','utf8');
const old='    go(MT.fromHash(\'v-plan\'));';
if(a.indexOf('wfOpenFromRoute')<0 && a.indexOf(old)>=0){
  a=a.replace(old, '    go(MT.fromHash(\'v-plan\'));\n\n    /* 带上下文进入：#v-plan?projectId=..&planId=..&tab=config → 定位到原计划 */\n    var q = MT.parseHash().q;\n    if(q && (q.planId || q.projectId) && typeof wfOpenFromRoute === \'function\'){\n      setTimeout(function(){ wfOpenFromRoute(q); }, 120);\n    }');
  fs.writeFileSync(R+'js/app.js', a, 'utf8');
  console.log('ok deep link boot');
} else console.log('!! app boot marker');

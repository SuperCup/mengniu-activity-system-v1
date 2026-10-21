
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/pages/home.js';
let s=fs.readFileSync(P,'utf8');
s=s.replace("{ n: noBat,                  l: '待补充批次',      r: '计划缺对应批次',        cls: 'err',  act: \"go('v-plan')\" },",
            "{ n: noBat,                  l: '待补充批次',      r: '计划缺对应批次',        cls: noBat ? 'err' : '', act: \"go('v-plan')\" },");
fs.writeFileSync(P,s,'utf8');
console.log('cls conditional');

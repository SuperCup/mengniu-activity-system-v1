
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/components/plan-drawer.js';
let p=fs.readFileSync(P,'utf8');
p=p.replace('机制、起止时间、零售商明细、商品明细都在这里填报，报批阶段不填写。','机制、起止时间、活动零售商、活动商品都在这里填报，创建项目时不填写。');
fs.writeFileSync(P,p,'utf8');
console.log('ok plan drawer wording: ' + (p.indexOf('创建项目时不填写') >= 0));

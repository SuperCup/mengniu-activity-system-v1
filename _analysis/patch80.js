
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let p=fs.readFileSync(R+'js/components/plan-drawer.js','utf8');
p=p.replace('机制、起止时间、零售商明细、商品明细都在这里填报，报批阶段不填写。','机制、起止时间、活动零售商、活动商品都在这里填报，创建项目时不填写。');
fs.writeFileSync(p,'utf8' in p ? R : R+'js/components/plan-drawer.js', p, 'utf8');
console.log('ok plan drawer wording');

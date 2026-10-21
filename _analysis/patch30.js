
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let p=fs.readFileSync(R+'js/pages/project-create.js','utf8');
p=p.replace('报批只填范围；门店级明细在第二段「创建计划」中导入','报批只填范围；门店级明细在审批通过后导入');
fs.writeFileSync(R+'js/pages/project-create.js',p,'utf8');

try{ fs.unlinkSync(R+'_probe.html'); console.log('probe removed'); }catch(e){}
console.log('create hint updated');

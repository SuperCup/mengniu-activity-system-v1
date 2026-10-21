
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
fs.writeFileSync(R+'js/pages/project-approve.js', fs.readFileSync(A+'approve-page2.js','utf8'), 'utf8');
console.log('ok approve page v2');


const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'README.md';
let s=fs.readFileSync(P,'utf8');
if(s.indexOf('所有列表单页 15 条')>=0){ console.log('rows exist'); process.exit(0); }
const lines=s.split('\n');
const i=lines.findIndex(function(x){ return x.indexOf('| 14 | 不要 UI 原型 / 数据免责声明 |')===0; });
if(i<0) throw new Error('row14 not found');
const add=fs.readFileSync(A+'readme-rows.txt','utf8').trim().split('\n');
lines.splice(i+1,0,...add);
fs.writeFileSync(P, lines.join('\n'),'utf8');
console.log('README rows added');

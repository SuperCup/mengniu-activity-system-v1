
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'README.md';
let s=fs.readFileSync(P,'utf8');
const rows=s.split('\n');
const i=rows.findIndex(function(x){ return x.indexOf('| 2 | 项目创建的分段含义 |')===0; });
if(i<0) throw new Error('row2 not found');
rows[i]=fs.readFileSync(A+'readme-row2.txt','utf8').trim();
fs.writeFileSync(P, rows.join('\n'),'utf8');
console.log('README row2 updated');

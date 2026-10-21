
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'js/data/projects.js';
let s=fs.readFileSync(P,'utf8');
if(s.indexOf('p.vendorContact')<0){
  s += fs.readFileSync(A+'proj-extra.js','utf8');
  fs.writeFileSync(P,s,'utf8');
  console.log('ok appended');
} else console.log('already');

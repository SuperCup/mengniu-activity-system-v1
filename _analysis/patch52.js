
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'js/data/projects.js';
let s=fs.readFileSync(P,'utf8');
const i=s.indexOf('/* =============================================================================\n * 计划概况');
if(i<0) throw new Error('brief block not found');
s=s.slice(0,i)+fs.readFileSync(A+'brief-new.js','utf8');
fs.writeFileSync(P,s,'utf8');
console.log('PROJ_BRIEF restructured');

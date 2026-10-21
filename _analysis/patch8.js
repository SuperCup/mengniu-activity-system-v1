
const fs=require('fs');
const p='D:/Project/蒙牛-原型-ds-harness/hq-console/js/data/plans.js';
let s=fs.readFileSync(p,'utf8');
if(s.indexOf('RET_SEED')<0){
  s += fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/plans.append.js','utf8');
  fs.writeFileSync(p,s,'utf8');
  console.log('plans appended');
} else console.log('already');

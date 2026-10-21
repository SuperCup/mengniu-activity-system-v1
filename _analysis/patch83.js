
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/core/workflow.js';
let s=fs.readFileSync(P,'utf8');
const before=s;
s=s.replace("      face: 0, thr: 0, qty: 0, budget: 0, coupon: '',","      face: 0, thr: 0, qty: 0, budget: 0,");
if(s===before) throw new Error('coupon dup anchor');
fs.writeFileSync(P,s,'utf8');
console.log('ok remove dup coupon key');


const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'js/pages/plan-batch.js';
let s=fs.readFileSync(P,'utf8');
if(s.indexOf('planPager')>=0){ console.log('pager exists'); process.exit(0); }
const i=s.indexOf('id="pbPlanBody"');
if(i<0) throw new Error('no pbPlanBody');
const t=s.indexOf('</table>', i);
const close=s.indexOf('    </div>\n', t);
if(t<0||close<0) throw new Error('table close not found');
s=s.slice(0,close)+fs.readFileSync(A+'plan-pager.html','utf8')+s.slice(close);
fs.writeFileSync(P,s,'utf8');
console.log('pager inserted');

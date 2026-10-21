
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const cp=fs.readFileSync(R+'js/pages/coupon-page.js','utf8').split('\n');
const line=cp[479]||'';
const re=/(?<![0-9-])(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(?![0-9-])/;
const m=line.match(re);
console.log('line480 match:', m ? line.slice(Math.max(0,m.index-60), m.index+40) : 'none');
const db=fs.readFileSync(R+'js/pages/dashboard.js','utf8').split('\n');
const l353=db[352]||'';
const i=l353.indexOf('aria-label');
console.log('dashboard353:', l353.slice(i, i+200));

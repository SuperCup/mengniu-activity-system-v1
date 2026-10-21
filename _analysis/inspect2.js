
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const s=fs.readFileSync(R+'js/data/projects.js','utf8');
const i=s.indexOf('p.vendorContact');
console.log('vendorContact at', i);
console.log(s.slice(Math.max(0,i-400), i+300));
const html=fs.readFileSync(R+'index.html','utf8');
const m=html.match(/js\/data\/[a-z-]+\.js/g);
console.log('load order:', m ? m.join(' -> ') : 'none');

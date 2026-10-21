
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const s=fs.readFileSync(R+'js/data/projects.js','utf8');
const i=s.indexOf('p.goal');
console.log('goal at', i);
console.log(JSON.stringify(s.slice(Math.max(0,i-300), i+160)));

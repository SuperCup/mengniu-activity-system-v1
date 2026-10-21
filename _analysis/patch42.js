const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let p=fs.readFileSync(R+'js/data/projects.js','utf8');
const add=fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/brief.append.js','utf8');
if(p.indexOf('PROJ_BRIEF')<0){ p=p.trimEnd()+'\n'+add; fs.writeFileSync(R+'js/data/projects.js',p,'utf8'); console.log('brief added'); }
else console.log('brief already there');

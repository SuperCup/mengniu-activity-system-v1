const fs=require('fs');const base='D:/Project/蒙牛-原型-ds-harness/hq-console/css/';
const add=JSON.parse(fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/css_extra.json','utf8'));
Object.keys(add).forEach(function(k){fs.appendFileSync(base+k, add[k], 'utf8'); console.log('appended', k, add[k].length);});

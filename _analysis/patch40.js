const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let cm=fs.readFileSync(R+'css/components.css','utf8');
const a=cm.indexOf('/* ---------- 两段式进度条');
const b=cm.indexOf('/* ---------- 紧凑表格 ---------- */');
if(a<0||b<0||b<a) throw new Error('anchors '+a+' '+b);
cm=cm.slice(0,a)+cm.slice(b);
fs.writeFileSync(R+'css/components.css',cm,'utf8');
console.log('stagebar css removed:', cm.indexOf('.stagebar')<0);

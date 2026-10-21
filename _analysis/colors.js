
const fs=require('fs');
const p='D:/Project/蒙牛/一期/蒙牛活动管理平台_一期总部端UI_V5.html';
const s=fs.readFileSync(p,'utf8');
const a=s.indexOf('<style data-page-node-id="HBbUjHhBR9jVkLSTU8z2DO"');
const b=s.indexOf('</style>', a);
let css=s.slice(s.indexOf('>',a)+1, b);
fs.writeFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/app.orig.css', css,'utf8');
const hex=(css.match(/#[0-9A-Fa-f]{3,6}\b/g)||[]);
const counts={};
hex.forEach(h=>{ const k=h.toUpperCase(); counts[k]=(counts[k]||0)+1; });
const list=Object.keys(counts).sort((x,y)=>counts[y]-counts[x]);
console.log('distinct hex:', list.length);
console.log(list.map(k=>k+' ×'+counts[k]).join('  '));
const rgba=(css.match(/rgba?\([^)]*\)/g)||[]);
const rc={}; rgba.forEach(h=>rc[h]=(rc[h]||0)+1);
console.log('--- rgba ---');
console.log(Object.keys(rc).map(k=>k+' ×'+rc[k]).join('  '));

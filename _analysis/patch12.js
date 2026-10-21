
const fs=require('fs');
const p='D:/Project/蒙牛-原型-ds-harness/hq-console/README.md';
let s=fs.readFileSync(p,'utf8');
s=s.replace('   │  ├─ picker.js                通用浮层\n','');
fs.writeFileSync(p,s,'utf8');
console.log('picker line in readme:', s.indexOf('picker.js'));

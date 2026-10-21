
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/app.js';
let s=fs.readFileSync(P,'utf8');
s=s.replace("    safe(window.renderApprovePlans, 'renderApprovePlans');\n", '');
fs.writeFileSync(P,s,'utf8');
console.log(s.indexOf('renderApprovePlans')<0 ? 'cleaned' : 'still there');

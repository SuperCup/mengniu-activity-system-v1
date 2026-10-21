
const fs=require('fs');
const p='D:/Project/蒙牛-原型-ds-harness/hq-console/index.html';
let h=fs.readFileSync(p,'utf8');
h=h.replace('<script src="js/components/page-builder.js"></script>\n','');
h=h.replace('<script src="js/components/page-editor.js"></script>\n','');
fs.writeFileSync(p,h,'utf8');
const srcs=[...h.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
console.log('includes now:', srcs.length);
console.log(srcs.join('\n'));

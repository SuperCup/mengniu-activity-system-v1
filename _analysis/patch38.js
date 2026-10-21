const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/README.md';
let s=fs.readFileSync(P,'utf8');
s=s.replace('内部样式前缀同步改成 `mn-`，不再出现 MTL 字样',
  '内部样式前缀同步改成 `mn-`。MTL 仅保留在 tokens.css 引用视觉规范文件名的一行注释里');
fs.writeFileSync(P,s,'utf8');
console.log('readme tweak ok');

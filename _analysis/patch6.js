
const fs=require('fs');
const p='D:/Project/蒙牛-原型-ds-harness/hq-console/css/layout.css';
let s=fs.readFileSync(p,'utf8');
s=s.replace(".sider a.item .ic{\n  width:16px;height:16px;flex:0 0 auto;border-radius:3px;\n  background:rgba(255,255,255,.3);\n}",
  ".sider a.item .ic{\n  width:16px;height:16px;flex:0 0 16px;\n  display:inline-flex;align-items:center;justify-content:center;\n  color:inherit;opacity:.82;\n}");
s=s.replace(".sider a.item.on .ic{background:var(--aux-green)}",
  ".sider a.item.on .ic{opacity:1;color:var(--brand)}");
fs.writeFileSync(p,s,'utf8');
console.log(s.indexOf('background:rgba(255,255,255,.3)')<0 ? 'cleaned' : 'still has bg');


const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/pages/project-manage.js';
let s=fs.readFileSync(P,'utf8');

/* 右上角只保留项目单号，状态时间进详情时间线，避免与左下角保存时间重复 */
const a=s.indexOf("  /* 右上角：项目单号 + 该状态对应的时间 */");
const b=s.indexOf("  var kv = ''");
if(a<0||b<0) throw new Error('anchors');
s = s.slice(0,a) + s.slice(b);

s = s.replace("    +   '<div class=\"rt\"><span class=\"sx-mono\">' + pnEsc(p.orderNo) + '</span><br>' + pnEsc(when) + '</div>'",
              "    +   '<div class=\"rt\"><span class=\"sx-mono\">' + pnEsc(p.orderNo) + '</span></div>'");

fs.writeFileSync(P,s,'utf8');
console.log('rt simplified');

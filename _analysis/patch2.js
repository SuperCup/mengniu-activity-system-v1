
const fs=require('fs');
const p='D:/Project/蒙牛-原型-ds-harness/hq-console/js/components/qr-drawer.js';
let s=fs.readFileSync(p,'utf8');
const bad = s.indexOf('function qrDl(fmt){');
const end = s.indexOf('function qrCopy(){');
if(bad<0||end<0){ console.log('not found'); process.exit(1); }
const fixed = "function qrDl(fmt){\n"
 + "  var c = qrCur.item;\n"
 + "  if(!c){ MT.toast('请先在左侧选择一枚二维码', 'err'); return; }\n"
 + "  MT.toast('下载 ' + fmt + ' · ' + qrCur.px + 'px · ' + qrCodeName(qrCur.key, c) + ' · https://' + c.link + '（演示环境不实际下载）');\n"
 + "}\n\n";
s = s.slice(0,bad) + fixed + s.slice(end);
fs.writeFileSync(p,s,'utf8');
console.log('patched');

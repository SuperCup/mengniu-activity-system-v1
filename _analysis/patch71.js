
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const P=R+'js/core/format.js';
let s=fs.readFileSync(P,'utf8');
const old="MT.toast = function(msg, type){\n  var box = document.getElementById('mnToast');";
const add="MT.toast = function(msg, type){\n  /* 空消息不弹，避免出现空白提示框 */\n  if(msg == null || String(msg).trim() === '') return;\n  var box = document.getElementById('mnToast');";
if(s.indexOf(old)<0) throw new Error('toast anchor');
s=s.replace(old, add);
fs.writeFileSync(P,s,'utf8');
console.log('ok format.js');

const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
console.log('hintbar 残留文本:', h.indexOf('用于确认栏目结构')>=0);
console.log('hintbar class:', h.indexOf('hintbar'));
let css=fs.readFileSync(R+'css/layout.css','utf8');
const i=css.indexOf('.hintbar');
console.log('hintbar css at', i);
if(i>=0){
  const seg=css.slice(i, i+400);
  console.log(JSON.stringify(seg.slice(0,260)));
}
let cm=fs.readFileSync(R+'css/components.css','utf8');
console.log('stagebar css:', cm.indexOf('.stagebar'));

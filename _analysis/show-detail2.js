const fs=require('fs');
const h=fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/shots/p-detail3.html','utf8');
const i=h.indexOf('id="projDwBody"');
console.log('projDwBody idx:', i);
const seg=h.slice(i, i+6000);
const k=seg.indexOf('计划概况');
console.log('计划概况 idx in seg:', k);
if(k>=0) console.log(seg.slice(k, k+1200).replace(/\s+/g,' '));

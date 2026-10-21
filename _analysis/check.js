
const fs=require('fs');
const dir='D:/Project/蒙牛-原型-ds-harness/_analysis/shots/';
const s=fs.readFileSync(dir+'v-manage.dom.html','utf8').replace(/<script[\s\S]*?<\/script>/g,'');
const m=[]; const re=/活动周期<\/span><span class="v">([^<]*)</g; let x;
while((x=re.exec(s))!==null) m.push(x[1]);
console.log('活动周期样例:', m.slice(0,4).join(' | '));
const s2=fs.readFileSync(dir+'v-h5.dom.html','utf8').replace(/<script[\s\S]*?<\/script>/g,'');
const re2=/2026-\d\d-\d\d/gy; const d=(s2.match(/2026-\d\d-\d\d/g)||[]).length;
console.log('h5 完整日期出现次数:', d);
const re3=/有效期/g; let c=0; while(re3.exec(s2)!==null) c++;
console.log('h5 有效期字样:', c);

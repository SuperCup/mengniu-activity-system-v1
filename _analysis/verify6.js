
const fs=require('fs');
const S='D:/Project/蒙牛-原型-ds-harness/_analysis/shots/';
function view(html,id){ const i=html.indexOf('id="'+id+'"'); if(i<0)return ''; const j=html.indexOf('<div class="view', i+10); return html.slice(i, j<0?undefined:j); }
function c(s,re){ return (s.match(re)||[]).length; }
const mg=view(fs.readFileSync(S+'v-manage.dom.html','utf8'),'v-manage');
console.log('卡片:', c(mg,/<div class="pcard"/g));
console.log('最近保存 出现次数:', c(mg,/最近保存/g), '(应 = 卡片数)');
console.log('状态标签:', c(mg,/nmst/g));
console.log('进度标签:', c(mg,/进度：/g));
const first=/<div class="pcard"[\s\S]{0,1400}?<\/div>\s*<\/div>/.exec(mg);
console.log('--- 首张卡片片段 ---');
console.log((mg.slice(mg.indexOf('<div class="pcard"'), mg.indexOf('<div class="pcard"')+900)).replace(/\s+/g,' '));

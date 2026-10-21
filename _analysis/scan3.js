
const fs=require('fs');
const p='D:/Project/蒙牛/一期/蒙牛活动管理平台_一期总部端UI_V5.html';
const s=fs.readFileSync(p,'utf8');
const lines=s.split(/\r?\n/);
const clean=t=>t.replace(/ data-page-node-id="[^"]*"/g,'').replace(/\s+/g,' ').trim();
console.log('--- views ---');
lines.forEach((l,i)=>{ if(/class="view"/.test(l)) console.log((i+1)+': '+clean(l).slice(0,160)); });
console.log('--- nav ---');
lines.forEach((l,i)=>{ if(/<nav|class="brand|class="grp|data-crumb="/.test(l)) console.log((i+1)+': '+clean(l).slice(0,200)); });


const fs=require('fs');
const p='D:/Project/蒙牛/一期/蒙牛活动管理平台_一期总部端UI_V5.html';
const s=fs.readFileSync(p,'utf8');
const lines=s.split(/\r?\n/);
console.log('lines',lines.length);
// report tag balance of top level sections
const out=[];
lines.forEach((l,i)=>{
  const t=l.trim();
  if(/^<(section|nav|aside|main|header|footer|style|script)\b/.test(t)) out.push((i+1)+': '+t.slice(0,200));
});
console.log('--- top-level markers ---');
console.log(out.join('\n'));

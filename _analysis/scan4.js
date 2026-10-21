
const fs=require('fs');
const p='D:/Project/蒙牛/一期/蒙牛活动管理平台_一期总部端UI_V5.html';
const s=fs.readFileSync(p,'utf8');
const lines=s.split(/\r?\n/);
const start=2144;
// list top-level function declarations and var declarations in script region
for(let i=start-1;i<lines.length;i++){
  const l=lines[i];
  if(/^(function |var |const |let |\/\*|  \/\*)/.test(l.trim()) || /^(function|var|const|let)\s/.test(l)) console.log((i+1)+': '+l.trim().slice(0,140));
}

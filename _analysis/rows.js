
const fs=require('fs');
const data=JSON.parse(fs.readFileSync('D:/Project/蒙牛/一期/_excel_dump.json','utf8'));
const sh=data.find(d=>d.sheet==='业务与产品待确认');
sh.rows.forEach((row,ri)=>{
  const parts=row.map(c=>c.coord+'='+String(c.val==null?'':c.val).replace(/\s+/g,' ').slice(0,220));
  if(parts.length) console.log('R'+(ri+1)+': '+parts.join(' | '));
});

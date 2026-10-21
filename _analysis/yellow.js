
const fs=require('fs');
const data=JSON.parse(fs.readFileSync('D:/Project/蒙牛/一期/_excel_dump.json','utf8'));
console.log('sheets:', data.map(d=>d.sheet).join(' | '));
function isYellow(rgb){
  if(!rgb || typeof rgb!=='string' || rgb.length<6) return false;
  const h=rgb.slice(-6).toUpperCase();
  if(h==='FFFF00'||h==='FFFFCC'||h==='FFF2CC'||h==='FFEB9C'||h==='FFD966'||h==='FFC000') return true;
  const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
  return r>200 && g>170 && b<160;
}
let hits=[];
for(const sh of data){
  for(const row of sh.rows){
    for(const c of row){
      const rgb=c.fill&&c.fill.rgb;
      if(isYellow(rgb)){
        hits.push({sheet:sh.sheet,coord:c.coord,rgb:String(rgb),val:String(c.val==null?'':c.val).slice(0,300)});
      }
    }
  }
}
console.log('yellow cells:', hits.length);
hits.forEach(h=>console.log(h.sheet+'!'+h.coord+' ['+h.rgb+'] '+h.val));

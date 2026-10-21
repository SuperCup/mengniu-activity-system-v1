
const fs=require('fs');
const p='D:/Project/蒙牛/一期/蒙牛活动管理平台_一期总部端UI_V5.html';
let s=fs.readFileSync(p,'utf8');
const bodyStart=s.indexOf('<body');
const scriptStart=s.indexOf('<script');
const markup=s.slice(bodyStart, scriptStart);
const lines=markup.split('\n');
lines.forEach((l,i)=>{
  const m=l.match(/<(\w+)([^>]*\bid="([^"]+)"[^>]*)>/g);
  if(m && /class="(view|drawer|modal|toast|picker|mask)|id="(dw-|v-|pk-)/.test(l)){
    m.forEach(x=>{ if(/id="(dw-|v-|pk|mask|toast)/.test(x)) console.log((bodyStart>=0? 'L?':'')+x.slice(0,120)); });
  }
});

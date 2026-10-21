
const fs=require('fs');
const p='D:/Project/蒙牛/一期/蒙牛活动管理平台_一期总部端UI_V5.html';
const s=fs.readFileSync(p,'utf8');
const lines=s.split(/\r?\n/);
function dump(re,label,limit=400){
  const out=[];
  lines.forEach((l,i)=>{ if(re.test(l)) out.push((i+1)+': '+l.trim().slice(0,220)); });
  console.log('=== '+label+' ('+out.length+') ===');
  console.log(out.slice(0,limit).join('\n'));
}
dump(/<!--/,'comments',200);
dump(/\bid="[^"]+"/,'ids',500);

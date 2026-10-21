
const fs=require('fs');
const p='D:/Project/蒙牛/一期/蒙牛活动管理平台_一期总部端UI_V5.html';
const s=fs.readFileSync(p,'utf8');
const a=s.indexOf('<script');
const b=s.lastIndexOf('</script>');
let js=s.slice(a+8,b).replace(/^[^>]*>/,'');
fs.writeFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/app.orig.js', js,'utf8');
const lines=js.split('\n');
console.log('js lines', lines.length, 'chars', js.length);
const segs=[];
for(let i=0;i<lines.length;i++){
  const t=lines[i];
  if(/^(function\s+[\w$]+\s*\(|var\s+[\w$]+\s*=|let\s+|const\s+|document\.addEventListener|window\.|\(function)/.test(t)){
    segs.push((i+1)+': '+t.trim().slice(0,110));
  } else if(/^\/\*/.test(t.trim())){
    segs.push('   --- '+t.trim().slice(0,100));
  }
}
console.log(segs.join('\n'));

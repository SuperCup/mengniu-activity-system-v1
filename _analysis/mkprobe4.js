const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
if(h.indexOf('openProjDetail(')<0 || h.indexOf('QA_PROBE')<0){
  const probe = "\n<script>\n/* QA_PROBE */\nsetTimeout(function(){ try{ openProjDetail('MN-WX-202612-0041'); }catch(e){ document.title='ERR: '+e.message; } }, 800);\n</script>\n</body>";
  h=h.replace('</body>', probe);
  fs.writeFileSync(R+'_probe2.html', h, 'utf8');
}
console.log('probe2 ready');
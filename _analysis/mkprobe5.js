const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const probe = "\n<script>\nsetTimeout(function(){ try{ openProjPlans('MN-WX-202612-0044'); }catch(e){ document.title='ERR: '+e.message; } }, 800);\n</script>\n</body>";
h=h.replace('</body>', probe);
fs.writeFileSync(R+'_probe3.html', h, 'utf8');
console.log('probe3 ready');
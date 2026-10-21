const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
h=h.replace('</body>', "\n<script>\nsetTimeout(function(){ try{ openProjDetail('MN-WX-202612-0041'); }catch(e){ document.title='ERR: '+e.message; } }, 800);\n</script>\n</body>");
fs.writeFileSync(R+'_probe5.html', h, 'utf8');
console.log('probe5 ready');
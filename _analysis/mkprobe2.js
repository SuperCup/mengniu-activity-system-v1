
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const probe = "\n<script>\n"
 + "setTimeout(function(){\n"
 + "  var m = location.search.match(/[?&]d=([a-z]+)/);\n"
 + "  var d = m ? m[1] : '';\n"
 + "  try{\n"
 + "    if(d==='page') openPageDrawer();\n"
 + "    else if(d==='edit') openPageEdit(0);\n"
 + "    else if(d==='batch') openBatch(0);\n"
 + "  }catch(e){ document.title = 'ERR: ' + e.message; }\n"
 + "}, 600);\n"
 + "</script>\n</body>";
h=h.replace('</body>', probe);
fs.writeFileSync(R+'_probe.html', h, 'utf8');
console.log('probe ok');

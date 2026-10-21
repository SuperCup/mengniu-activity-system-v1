
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const probe = "\n<script>\n"
 + "/* QA 探针：仅用于原型回归截图，不参与正式页面 */\n"
 + "setTimeout(function(){\n"
 + "  var m = location.search.match(/[?&]d=([a-z]+)/);\n"
 + "  var d = m ? m[1] : '';\n"
 + "  try{\n"
 + "    if(d==='batch') openBatch(0);\n"
 + "    else if(d==='import') openImp('ret',0);\n"
 + "    else if(d==='qr') openQr('r1');\n"
 + "    else if(d==='plannew') openPlanNew(0);\n"
 + "    else if(d==='pdetail') openPlanDetail(0);\n"
 + "    else if(d==='vendor') openVs(0);\n"
 + "  }catch(e){ document.title = 'ERR: ' + e.message; }\n"
 + "}, 500);\n"
 + "</script>\n</body>";
h=h.replace('</body>', probe);
fs.writeFileSync(R+'_probe.html', h, 'utf8');
console.log('probe written');

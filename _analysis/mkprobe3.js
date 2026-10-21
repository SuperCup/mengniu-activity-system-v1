
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
if(h.indexOf('_probe')<0){
  const probe = "\n<script>\n"
  + "/* QA 探针：仅用于回归，不参与正式页面 */\n"
  + "setTimeout(function(){\n"
  + "  var m = location.search.match(/[?&]d=([a-z0-9]+)/);\n"
  + "  var d = m ? m[1] : '';\n"
  + "  try{\n"
  + "    if(d==='projplans') openProjPlans('MN-WX-202612-0041');\n"
  + "    else if(d==='approveplans') openProjPlans('MN-WX-202612-0044');\n"
  + "    else if(d==='projdetail') openProjDetail('MN-WX-202612-0041');\n"
  + "    else if(d==='flow') openFlow();\n"
  + "    else if(d==='role') openRole('biz');\n"
  + "    else if(d==='vendor') openVs(0);\n"
  + "  }catch(e){ document.title='ERR: '+e.message; }\n"
  + "}, 600);\n"
  + "</script>\n</body>";
  h=h.replace('</body>', probe);
  fs.writeFileSync(R+'_probe.html', h, 'utf8');
}
console.log('probe ready');

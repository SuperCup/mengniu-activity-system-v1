
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let s=fs.readFileSync(R+'js/components/config-drawer.js','utf8');
const old='  if(!p){ MT.toast(\'未找到该计划\', \'err\'); return; }\n  CFG.pid = p.id;';
const add='  if(!p){ MT.toast(\'未找到该计划\', \'err\'); return; }\n\n'
 + '  /* 状态与归属校验：草稿 / 待审批 / 已终止的项目不能补执行配置 */\n'
 + '  var proj = (window.PROJECTS || []).filter(function(x){ return x.id === (p.projectId || p.proj); })[0];\n'
 + '  if(!proj){ MT.toast(\'该计划没有关联项目，无法补配置\', \'err\'); return; }\n'
 + '  if(proj.state !== \'approved\' && proj.state !== \'confirmed\' && proj.state !== \'running\'){\n'
 + '    var st = (window.PROJ_STATES || {})[proj.state] || { label:proj.state };\n'
 + '    MT.toast(\'项目当前是「\' + st.label + \'」，只有审批通过后才能补充执行配置\', \'err\');\n'
 + '    return;\n'
 + '  }\n\n'
 + '  CFG.pid = p.id;';
if(s.indexOf(old)<0) throw new Error('guard anchor');
s=s.replace(old, add);
fs.writeFileSync(R+'js/components/config-drawer.js', s, 'utf8');
console.log('ok config guard');

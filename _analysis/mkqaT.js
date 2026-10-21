const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    wfEnterConfig('MN-WX-202612-0044');",
"    out.push('onView='+document.querySelector('.view.on').id);",
"    out.push('scope='+(window.PLAN_SCOPE?PLAN_SCOPE.id:'null'));",
"    var dw=document.getElementById('dw-config');",
"    out.push('抽屉='+(dw?dw.classList.contains('on'):'none'));",
"    out.push('三块='+document.querySelectorAll('#planProjBar .pinfo-sec').length);",
"    var hs=[]; document.querySelectorAll('#planProjBar .pinfo-sec h5').forEach(function(e){ hs.push(txt(e)); });",
"    out.push('标题='+hs.join(' / '));",
"    var rows=[]; document.querySelectorAll('#planProjBar .pinfo-row').forEach(function(e){ rows.push(txt(e.querySelector('.k'))+'='+txt(e.querySelector('.v'))); });",
"    out.push('前5行='+rows.slice(0,5).join(' | '));",
"    out.push('服务商='+rows.slice(-3).join(' | '));",
"    var btns=[]; document.querySelectorAll('#planProjBar button').forEach(function(e){ btns.push(txt(e)); });",
"    out.push('按钮='+btns.join('/'));",
"    out.push('头部='+txt(document.getElementById('planProjBar').querySelector('h3')));",
"    openPlanConfig('PL-04');",
"    var cfg=document.getElementById('cfgBody').textContent;",
"    out.push('配置页含所属项目='+(cfg.indexOf('所属项目')>=0));",
"    var kv=[]; document.querySelectorAll('#cfgBody .cfg-head .cfg-kv span').forEach(function(e){ kv.push(e.textContent); });",
"    out.push('配置页快照头='+kv.join('/'));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaT'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaT.html', h, 'utf8');
console.log('ok');
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    openProjPlans('MN-WX-202612-0044');",
"    var ops=[]; document.querySelectorAll('#pbPlanBody .ops').forEach(function(e){ ops.push(txt(e)); });",
"    out.push('操作='+ops.join(' | '));",
"    var rows=[]; document.querySelectorAll('#planProjBar .pinfo-row').forEach(function(e){ rows.push(txt(e.querySelector('.k'))+'='+txt(e.querySelector('.v'))); });",
"    out.push('服务商块='+rows.slice(-3).join(' | '));",
"    var g=document.querySelector('#planProjBar .pinfo');",
"    var r=g.getBoundingClientRect();",
"    out.push('信息块='+Math.round(r.width)+'x'+Math.round(r.height)+' 列='+getComputedStyle(g).gridTemplateColumns);",
"    out.push('横向溢出='+(document.documentElement.scrollWidth>window.innerWidth));",
"    openPlanConfig('PL-04');",
"    var t=document.getElementById('cfgTitle');",
"    out.push('配置页标题='+txt(t));",
"    out.push('配置页tabs='+document.querySelectorAll('.cfg-tab').length);",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaU'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaU.html', h, 'utf8');
console.log('ok');
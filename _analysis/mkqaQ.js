const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  try{",
"    var p41=PROJECTS.filter(function(x){return x.id==='MN-WX-202612-0041';})[0];",
"    out.push('0041 state='+p41.state+' brief='+p41.planBrief.length);",
"    openPlanConfig('PL-01');",
"    out.push('tabs='+document.querySelectorAll('.cfg-tab').length);",
"    var heads=[]; document.querySelectorAll('#cfgBody .cfg-head .cfg-kv span').forEach(function(e){ heads.push(e.textContent.trim()); });",
"    out.push('快照='+heads.join('/'));",
"    var labels=[]; document.querySelectorAll('#cfgBody .fr label').forEach(function(e){ labels.push(e.textContent.replace('*','').trim()); });",
"    out.push('字段='+labels.join('/'));",
"    out.push('含归属商户号='+(labels.indexOf('归属商户号')>=0));",
"    closeDrawer();",
"    openProjDetail('MN-WX-202612-0044');",
"    var pd=document.getElementById('dw-proj');",
"    var ths=[]; pd.querySelectorAll('.bt thead th').forEach(function(e){ ths.push(e.textContent.trim()); });",
"    out.push('详情表头='+ths.join('/'));",
"    var first=pd.querySelector('.bt tbody tr');",
"    out.push('详情首行='+(first?first.textContent.replace(/\\s+/g,' ').trim():'-'));",
"    closeDrawer();",
"    var m=document.getElementById('projList')||document.body;",
"    out.push('卡片标签='+((m.textContent.match(/批次计划 \\d+ 个/g)||[]).slice(0,3).join(',')));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaQ'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1700);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaQ.html', h, 'utf8');
console.log('ok');
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    go('v-plan');",
"    var rows=[];",
"    document.querySelectorAll('#pbPlanBody tr').forEach(function(tr){",
"      var tds=tr.querySelectorAll('td'); if(tds.length<9) return;",
"      rows.push(txt(tds[0])+' 状态='+txt(tds[8])+' 操作='+txt(tds[9]||''));",
"    });",
"    out.push('计划表：'+rows.join(' || '));",
"    var i=PLANS.map(function(x){return x.id;}).indexOf('PL-01');",
"    openPlanDetail(i);",
"    out.push('PL-01 详情含补充配置按钮='+(document.getElementById('pdBody').innerHTML.indexOf('补充配置')>=0));",
"    closeDrawer();",
"    var j=PLANS.map(function(x){return x.id;}).indexOf('PL-04');",
"    openPlanDetail(j);",
"    out.push('PL-04 详情含补充配置按钮='+(document.getElementById('pdBody').innerHTML.indexOf('补充配置')>=0));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaY'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaY.html', h, 'utf8');
console.log('ok');
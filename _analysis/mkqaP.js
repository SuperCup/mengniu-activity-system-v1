const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  try{",
"    var list=PLANS.filter(function(x){return (x.projectId||x.proj)==='MN-WX-202612-0044';});",
"    out.push('0044计划数='+list.length+' 券名='+list.map(function(x){return x.coupon||'-';}).join('|'));",
"    openPlanConfig('PL-04');",
"    out.push('tabs='+document.querySelectorAll('.cfg-tab').length);",
"    var tabs=[]; document.querySelectorAll('.cfg-tab').forEach(function(e){ tabs.push(e.querySelector('b').textContent.trim()+'('+e.querySelector('i').textContent.trim()+')'); });",
"    out.push('tab内容='+tabs.join(' '));",
"    out.push('说明='+(document.querySelector('#cfgBody .note')?document.querySelector('#cfgBody .note').textContent.slice(0,20):'无'));",
"    cfgSwitch('PL-02');",
"    out.push('切到PL-02后='+document.getElementById('cfgTitle').textContent.slice(0,22));",
"    closeDrawer();",
"    openProjDetail('MN-WX-202612-0044');",
"    var pd=document.getElementById('dw-proj');",
"    var ths=[]; pd.querySelectorAll('.bt thead th').forEach(function(e){ ths.push(e.textContent.trim()); });",
"    out.push('详情表头='+ths.join('/'));",
"    var first=pd.querySelector('.bt tbody tr');",
"    out.push('详情首行='+(first?first.textContent.replace(/\\s+/g,' ').trim().slice(0,60):'-'));",
"    closeDrawer();",
"    var stat=projConfigStat('MN-WX-202612-0044');",
"    out.push('配置统计='+stat.ready+'/'+stat.total);",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaP'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1600);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaP.html', h, 'utf8');
console.log('ok');
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  try{",
"    openPlanConfig('PL-04');",
"    var body=document.getElementById('cfgBody');",
"    out.push('归属商户号='+(body.textContent.indexOf('归属商户号')>=0?'仍在':'已移除'));",
"    out.push('计划切换tabs='+document.querySelectorAll('.cfg-tab').length);",
"    var tabs=[]; document.querySelectorAll('.cfg-tab b').forEach(function(e){ tabs.push(e.textContent.trim()); });",
"    out.push('tabs='+tabs.join('|'));",
"    var note=body.querySelector('.note');",
"    out.push('说明='+(note?note.textContent.slice(0,28):'无'));",
"    out.push('券名称字段='+(body.textContent.indexOf('券名称')>=0));",
"    var heads=[]; body.querySelectorAll('.cfg-head .cfg-kv span').forEach(function(e){ heads.push(e.textContent.trim()); });",
"    out.push('快照头='+heads.join('/'));",
"    cfgSwitch('PL-01');",
"    out.push('切换后标题='+document.getElementById('cfgTitle').textContent.slice(0,24));",
"    closeDrawer();",
"    openProjDrawer('MN-WX-202612-0044');",
"    var pd=document.getElementById('dw-proj');",
"    var idx=pd.textContent.indexOf('批次计划');",
"    out.push('详情有批次计划='+(idx>=0));",
"    var ths=[]; pd.querySelectorAll('.bt thead th').forEach(function(e){ ths.push(e.textContent.trim()); });",
"    out.push('详情表头='+ths.join('/'));",
"    closeDrawer();",
"    document.getElementById('projName').value='字段验证项目';",
"    document.getElementById('projOwner').value='李雪 · 15269175821';",
"    document.getElementById('poNo').value='POCN68-0000014722';",
"    document.getElementById('projVendor').value='1';",
"    var n0=PROJECTS.length;",
"    wfSubmit();",
"    var np=PROJECTS[PROJECTS.length-1];",
"    var pls=PLANS.filter(function(x){return x.projectId===np.id;});",
"    out.push('提交='+(PROJECTS.length>n0)+' 计划数='+pls.length+' 券名='+pls[0].coupon+' 方式='+pls[0].grant+' brief.coupon='+np.planBrief[0].coupon);",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaN'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1700);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaN.html', h, 'utf8');
console.log('ok');
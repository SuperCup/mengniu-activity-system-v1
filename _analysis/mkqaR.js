const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  try{",
"    var wrap=document.querySelector('#briefBody').closest('.tw');",
"    out.push('表宽='+wrap.scrollWidth+'/'+wrap.clientWidth+' 溢出='+(wrap.scrollWidth>wrap.clientWidth+2));",
"    var t=document.querySelector('#briefBody').closest('table');",
"    out.push('表格宽='+Math.round(t.getBoundingClientRect().width));",
"    document.getElementById('projName').value='最终验证项目';",
"    document.getElementById('projOwner').value='李雪 · 15269175821';",
"    document.getElementById('poNo').value='POCN68-0000014722';",
"    document.getElementById('projVendor').value='1';",
"    var n0=PROJECTS.length;",
"    wfSubmit();",
"    var np=PROJECTS[PROJECTS.length-1];",
"    var pls=PLANS.filter(function(x){return x.projectId===np.id;});",
"    out.push('提交='+(PROJECTS.length>n0)+' state='+np.state+' plans='+pls.length);",
"    out.push('p1='+pls[0].name+'/'+pls[0].coupon+'/'+pls[0].grant);",
"    out.push('brief1='+np.planBrief[0].name+'/'+np.planBrief[0].coupon+'/'+np.planBrief[0].grant);",
"    out.push('snapshot='+np.snapshot.plans[0].coupon+'/'+np.snapshot.plans[0].grant);",
"    out.push('表单已重置='+(CRE_BRIEF.length===1 && CRE_BRIEF[0].name===''));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaR'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1600);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaR.html', h, 'utf8');
console.log('ok');
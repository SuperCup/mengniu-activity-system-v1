const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function log(s){ out.push(s); }",
"  try{",
"    var before=PROJECTS.length;",
"    document.getElementById('projName').value='链路验证项目';",
"    document.getElementById('projOwner').value='李雪 · 15269175821';",
"    document.getElementById('poNo').value='POCN68-0000014722';",
"    document.getElementById('projVendor').value='1';",
"    wfSubmit();",
"    var np=PROJECTS[PROJECTS.length-1];",
"    log('submit: projects '+before+'->'+PROJECTS.length+', state='+np.state+', plans='+PLANS.filter(function(x){return x.projectId===np.id;}).length);",
"    log('snapshot plans='+(np.snapshot?np.snapshot.plans.length:'none'));",
"    wfApprove(np.id,'agree');",
"    log('approve: state='+np.state);",
"    var pls=PLANS.filter(function(x){return x.projectId===np.id;});",
"    var st=projConfigStat(np.id);",
"    log('config stat: '+st.ready+'/'+st.total);",
"    wfAct('push', np.id);",
"    log('push while incomplete: state='+np.state);",
"    var pid=pls[0].id;",
"    openPlanConfig(pid);",
"    cfgSet('name','链路验证券'); cfgSet('mch','1603482917'); cfgSet('fund','预充值');",
"    cfgSet('face','10'); cfgSet('thr','59'); cfgSet('pay','微信支付'); cfgSet('skuLimit','不限商品');",
"    cfgSet('qty','1000'); cfgSet('perLimit','1'); cfgSet('notice','测试须知'); cfgSet('mchAuth','已核验');",
"    log('missing after fill='+planMissing(pls[0]).length);",
"    cfgDone();",
"    var st2=projConfigStat(np.id);",
"    log('config stat after done: '+st2.ready+'/'+st2.total);",
"    wfAct('push', np.id);",
"    log('push after ready: state='+np.state+', handoff='+(np.handoff?np.handoff.at:'none'));",
"    log('storage bytes='+MT.store.info().bytes);",
"  }catch(e){ log('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaC'; pre.textContent=out.join(' | '); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaC.html', h, 'utf8');
console.log('probe ready');
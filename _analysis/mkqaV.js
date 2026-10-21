const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    openProjPlans('MN-WX-202612-0044');",
"    var states=[]; document.querySelectorAll('#pbPlanBody tr').forEach(function(tr){ var t=tr.querySelector('td:nth-child(9)'); if(t) states.push(txt(t)); });",
"    out.push('配置状态='+states.join(','));",
"    var ops=[]; document.querySelectorAll('#pbPlanBody .ops').forEach(function(e){ ops.push(txt(e)); });",
"    out.push('操作='+ops.join(' | '));",
"    var i=PLANS.map(function(x){return x.id;}).indexOf('PL-04');",
"    openBatch(i);",
"    out.push('抽屉='+(document.getElementById('dw-batch').classList.contains('on')?'dw-batch':'其他'));",
"    out.push('标题='+txt(document.getElementById('batTitle')));",
"    var f=[]; document.querySelectorAll('#dw-batch .fr label').forEach(function(e){ f.push(txt(e)); });",
"    out.push('字段='+f.join(' / '));",
"    document.getElementById('bfName').value='元旦常温奶满减券';",
"    document.getElementById('bfFace').value='15';",
"    document.getElementById('bfThr').value='99';",
"    document.getElementById('bfCap').value='8000';",
"    document.getElementById('bfUser').value='2';",
"    batchSave();",
"    out.push('保存后状态='+planConfigState(PLANS[i]).txt);",
"    out.push('缺失项='+planMissing(PLANS[i]).map(function(m){return m.label;}).join('；'));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaV'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaV.html', h, 'utf8');
console.log('ok');
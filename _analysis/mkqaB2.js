const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    var i=PLANS.map(function(x){return x.id;}).indexOf('PL-04');",
"    openPlanDetail(i);",
"    var hs=[]; document.querySelectorAll('#pdBody .dsec h5').forEach(function(e){ hs.push(txt(e)); });",
"    out.push('详情章节='+hs.join(' / '));",
"    out.push('详情零售商行='+document.querySelectorAll('#pdBody table tbody tr').length);",
"    closeDrawer();",
"    openBatch(i);",
"    document.getElementById('bfName').value='元旦常温奶满减券';",
"    document.getElementById('bfFace').value='15'; document.getElementById('bfThr').value='99';",
"    document.getElementById('bfCap').value='8000'; document.getElementById('bfUser').value='2';",
"    batchSave();",
"    out.push('保存后 ret='+PLANS[i].retRows.length+' sku='+PLANS[i].skuRows.length);",
"    openPlanDetail(i);",
"    out.push('保存后详情章节='+[].map.call(document.querySelectorAll('#pdBody .dsec h5'),function(e){return txt(e);}).join(' / '));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaB2'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaB2.html', h, 'utf8');
console.log('ok');
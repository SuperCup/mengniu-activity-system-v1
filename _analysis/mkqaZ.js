const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    var i=PLANS.map(function(x){return x.id;}).indexOf('PL-04');",
"    openBatch(i);",
"    out.push('零售商行数='+document.querySelectorAll('#bfRetBody tr').length+' 计数='+txt(document.getElementById('bfRetCnt')));",
"    out.push('商品行数='+document.querySelectorAll('#bfSkuBody tr').length+' 计数='+txt(document.getElementById('bfSkuCnt')));",
"    out.push('零售商首行='+txt(document.querySelector('#bfRetBody tr')));",
"    out.push('商品首行='+txt(document.querySelector('#bfSkuBody tr')));",
"    out.push('导入入口='+[].map.call(document.querySelectorAll('#dw-batch .imp-row'),function(e){return txt(e).slice(0,10);}).join(' | '));",
"    out.push('章节='+[].map.call(document.querySelectorAll('#dw-batch .psec h4'),function(e){return txt(e);}).join(' / '));",
"    document.getElementById('bfName').value='元旦常温奶满减券';",
"    document.getElementById('bfFace').value='15'; document.getElementById('bfThr').value='99';",
"    document.getElementById('bfCap').value='8000'; document.getElementById('bfUser').value='2';",
"    batchSave();",
"    var p=PLANS[i];",
"    out.push('保存后 retRows='+p.retRows.length+' skuRows='+p.skuRows.length+' 状态='+planConfigState(p).txt);",
"    out.push('保存后抽屉关闭='+!document.getElementById('dw-batch').classList.contains('on'));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaZ'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaZ.html', h, 'utf8');
console.log('ok');
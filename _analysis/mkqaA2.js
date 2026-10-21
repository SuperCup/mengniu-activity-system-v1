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
"    openImp('ret');",
"    out.push('导入抽屉='+(document.getElementById('dw-imp').classList.contains('on'))+' fromBatch='+IMP.fromBatch);",
"    impDemo();",
"    out.push('预览行='+document.querySelectorAll('#impPreview tbody tr').length);",
"    impOk();",
"    out.push('回到批次页='+(document.getElementById('dw-batch').classList.contains('on')));",
"    out.push('导入后零售商='+document.querySelectorAll('#bfRetBody tr').length+' 计数='+txt(document.getElementById('bfRetCnt')));",
"    openImp('sku');",
"    impDemo();",
"    impOk();",
"    out.push('导入后商品='+document.querySelectorAll('#bfSkuBody tr').length);",
"    var t=document.querySelector('#dw-batch table.bt.mini');",
"    var r=t.getBoundingClientRect();",
"    out.push('表格宽='+Math.round(r.width)+' 溢出='+(t.scrollWidth>t.clientWidth+1));",
"    var dwb=document.querySelector('#dw-batch .dw-b');",
"    out.push('抽屉内容滚动宽='+dwb.scrollWidth+' 可见宽='+dwb.clientWidth+' 横向溢出='+(dwb.scrollWidth>dwb.clientWidth+1));",
"    closeDrawer();",
"    openPlanNew(i);",
"    out.push('计划抽屉零售商行='+document.querySelectorAll('#pnRetBody tr').length+' 商品行='+document.querySelectorAll('#pnSkuBody tr').length);",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaA2'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaA2.html', h, 'utf8');
console.log('ok');
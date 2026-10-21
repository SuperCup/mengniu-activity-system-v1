const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  try{",
"    openBatch(0);",
"    document.getElementById('bfBatNo').value='23020102';",
"    var before=PLANS[0].bat;",
"    batchSave();",
"    out.push('dup batNo: '+before+' -> '+PLANS[0].bat+' (unchanged='+(before===PLANS[0].bat)+')');",
"    openBatch(0);",
"    document.getElementById('bfBatNo').value='23020999';",
"    batchSave();",
"    out.push('new batNo: '+PLANS[0].bat+' status='+PLANS[0].bstat);",
"    out.push('money(123.45)='+money(123.45));",
"    out.push('money(0)='+money(0));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaE'; pre.textContent=out.join(' | '); document.body.appendChild(pre);",
"},1600);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaE.html', h, 'utf8');
console.log('ok');
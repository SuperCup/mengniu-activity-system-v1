const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    var tags=[]; document.querySelectorAll('#projList .pcard').forEach(function(c){ var n=c.querySelector('h4 b'); var t=[]; c.querySelectorAll('.tags .tg').forEach(function(x){ t.push(txt(x)); }); if(t.length) tags.push(txt(c.querySelector('h4')).slice(0,16)+' -> '+t.join(',')); });",
"    out.push('管理页标签='+tags.slice(0,6).join(' || '));",
"    out.push('0044统计='+JSON.stringify(projConfigStat('MN-WX-202612-0044')).slice(0,80));",
"    out.push('0041统计='+JSON.stringify(projConfigStat('MN-WX-202612-0041')).slice(0,80));",
"    var i=PLANS.map(function(x){return x.id;}).indexOf('PL-01');",
"    out.push('PL-01 状态='+planConfigState(PLANS[i]).txt+' 批次表单='+(!!PLANS[i].batchForm));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaW'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaW.html', h, 'utf8');
console.log('ok');
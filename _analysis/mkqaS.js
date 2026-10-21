const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  try{",
"    var tabs=[]; document.querySelectorAll('#apSteps .s').forEach(function(e){ tabs.push(e.textContent.replace(/\\s+/g,' ').trim()); });",
"    out.push('审批筛选='+tabs.join(' | '));",
"    out.push('列表卡片='+document.querySelectorAll('#apList .pcard').length+' 分页='+document.getElementById('apInfo').textContent+' 页码数='+document.querySelectorAll('#apPager span').length);",
"    var kws=[]; document.querySelectorAll('#apList .pcard .kv .k').forEach(function(e){ if(kws.indexOf(e.textContent.trim())<0) kws.push(e.textContent.trim()); });",
"    out.push('审批卡片字段='+kws.join('/'));",
"    var mkw=[]; document.querySelectorAll('#projList .pcard .kv .k').forEach(function(e){ if(mkw.indexOf(e.textContent.trim())<0) mkw.push(e.textContent.trim()); });",
"    out.push('管理卡片字段='+mkw.join('/'));",
"    out.push('字段一致='+(JSON.stringify(kws)===JSON.stringify(mkw)));",
"    apState('approved');",
"    out.push('已通过tab='+document.querySelectorAll('#apList .pcard').length+' 信息='+document.getElementById('apInfo').textContent);",
"    apState('');",
"    out.push('全部tab='+document.querySelectorAll('#apList .pcard').length);",
"    var btns=[]; document.querySelectorAll('#apList .pcard').forEach(function(e){ if(e.querySelector('.pcard-btns')) btns.push(e.querySelector('.pcard-btns').textContent.trim()); });",
"    out.push('按钮样例='+btns.slice(0,2).join(' || '));",
"    var txt=document.body.textContent;",
"    var mm=(txt.match(/(^|[^0-9-])(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])([^0-9-]|$)/g)||[]).slice(0,6);",
"    out.push('疑似MM-DD='+mm.join(','));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaS'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1600);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaS.html', h, 'utf8');
console.log('ok');
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  out.push('view='+document.querySelector('.view.on').id);",
"  var rows=document.querySelectorAll('#pbPlanBody tr');",
"  out.push('planRows='+rows.length);",
"  var cfg=[];",
"  for(var i=0;i<rows.length;i++){ var tds=rows[i].querySelectorAll('td'); cfg.push(tds[8]?tds[8].textContent.trim():'-'); }",
"  out.push('cfg='+cfg.join('|'));",
"  var mg=document.getElementById('projList');",
"  out.push('cards='+(mg?mg.querySelectorAll('.pcard').length:0));",
"  var html=document.body.innerHTML;",
"  out.push('hasTag='+(html.indexOf('待补配置')>=0));",
"  out.push('homeTodo='+(html.indexOf('待我补充执行配置')>=0));",
"  try{ openPlanConfig('PL-04'); }catch(e){ out.push('OPENERR='+e.message); }",
"  var b=document.getElementById('cfgBody');",
"  if(b){",
"    out.push('groups='+b.querySelectorAll('.dsec h5').length);",
"    out.push('inputs='+b.querySelectorAll('input,select').length);",
"    out.push('head='+b.querySelector('.cfg-head').textContent.replace(/\\s+/g,' ').slice(0,120));",
"  }",
"  var f=document.getElementById('cfgFoot'); if(f) out.push('foot='+f.textContent.replace(/\\s+/g,' ').slice(0,140));",
"  var wx=document.querySelector('.cfg-wx'); if(wx) out.push('wx='+wx.textContent.slice(0,60));",
"  var pre=document.createElement('pre'); pre.id='qaA'; pre.textContent=out.join(' || '); document.body.appendChild(pre);",
"},1400);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaA.html', h, 'utf8');
console.log('probe ready');
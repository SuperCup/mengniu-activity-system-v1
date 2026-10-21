const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    var nav='无';",
"    document.querySelectorAll('#sider a.item').forEach(function(a){ if(a.getAttribute('data-view')==='v-log') nav=txt(a); });",
"    out.push('导航='+nav);",
"    go('v-log');",
"    out.push('页签on='+document.querySelector('.view.on').id);",
"    out.push('总数='+txt(document.getElementById('logCnt')));",
"    out.push('首行='+txt(document.querySelector('#logTbody tr')));",
"    out.push('分页='+txt(document.getElementById('logInfo'))+' 页码数='+document.querySelectorAll('#logPager span').length);",
"    document.getElementById('logMod').value='项目审批'; renderLogs();",
"    out.push('模块=项目审批 行数='+document.querySelectorAll('#logTbody tr').length);",
"    document.getElementById('logRes').value='失败'; logQuery();",
"    out.push('结果=失败 行数='+document.querySelectorAll('#logTbody tr').length);",
"    logReset();",
"    out.push('重置后='+txt(document.getElementById('logInfo')));",
"    wfAct('submit','MN-WX-202612-0046');",
"    renderLogs();",
"    out.push('提交后首行='+txt(document.querySelector('#logTbody tr')).slice(0,90));",
"    out.push('日志总数='+SYS_LOGS.length);",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaD2'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1600);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaD2.html', h, 'utf8');
console.log('ok');
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    go('v-log');",
"    out.push('总数='+txt(document.getElementById('logCnt'))+' 首行时间='+txt(document.querySelector('#logTbody tr td')));",
"    document.getElementById('logMod').value='项目审批'; renderLogs();",
"    out.push('模块=项目审批 行数='+document.querySelectorAll('#logTbody tr').length+' 信息='+txt(document.getElementById('logInfo')));",
"    document.getElementById('logRes').value='失败'; renderLogs();",
"    out.push('审批+失败 行数='+document.querySelectorAll('#logTbody tr').length);",
"    logReset();",
"    out.push('重置='+txt(document.getElementById('logInfo')));",
"    var t0=txt(document.querySelector('#logTbody tr td'));",
"    wfAct('submit','MN-WX-202612-0046');",
"    renderLogs();",
"    var t1=txt(document.querySelector('#logTbody tr td'));",
"    out.push('提交前首行='+t0+' 提交后首行='+t1+' 更新='+(t1!==t0));",
"    out.push('提交后首行内容='+txt(document.querySelector('#logTbody tr')).slice(0,70));",
"    document.getElementById('logKw').value='批次'; renderLogs();",
"    out.push('关键字=批次 行数='+document.querySelectorAll('#logTbody tr').length);",
"    logReset();",
"    document.getElementById('logFrom').value='2026-10-20'; document.getElementById('logTo').value='2026-10-21'; renderLogs();",
"    out.push('时间 10-20~10-21 行数='+document.querySelectorAll('#logTbody tr').length);",
"    logReset();",
"    out.push('导出函数='+(typeof logExport));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaE2'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1600);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaE2.html', h, 'utf8');
console.log('ok');
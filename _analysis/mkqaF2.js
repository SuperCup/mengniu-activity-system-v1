const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  try{",
"    sysLog('系统管理','测试写入','测试对象','T-1','验证本地持久化');",
"    var raw=localStorage.getItem(MT.store.KEY)||'';",
"    var d=JSON.parse(raw);",
"    out.push('schema='+d.v+' 日志条数='+((d.logs||[]).length)+' 首条='+((d.logs||[])[0]||{}).act);",
"    out.push('内存条数='+SYS_LOGS.length);",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaF2'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1400);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaF2.html', h, 'utf8');
console.log('ok');
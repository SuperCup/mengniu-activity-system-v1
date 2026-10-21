const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const block = '<script>try{ Object.defineProperty(window,"localStorage",{get:function(){ throw new Error("denied"); }}); }catch(e){}</'+'script>';
h=h.replace('<script src="js/core/format.js"></script>', block + '\n<script src="js/core/format.js"></script>');
const code = [
"setTimeout(function(){",
"  var t=document.getElementById('mnToast');",
"  var out=[];",
"  out.push('toastExists='+!!t+(t?(' class='+t.className):''));",
"  var w=document.getElementById('mnStoreWarn');",
"  out.push('warnbar='+(w?('yes ['+w.textContent.trim().slice(0,30)+']'):'none'));",
"  var pre=document.createElement('pre'); pre.id='qaL'; pre.textContent=out.join(' | '); document.body.appendChild(pre);",
"},1200);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaL.html', h, 'utf8');
console.log('ok');
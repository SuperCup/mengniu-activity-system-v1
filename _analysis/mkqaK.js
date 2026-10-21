const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
/* 模拟浏览器禁用 localStorage */
const block = '<script>try{ Object.defineProperty(window,"localStorage",{get:function(){ throw new Error("denied"); }}); }catch(e){}</'+'script>';
h=h.replace('<script src="js/core/format.js"></script>', block + '\n<script src="js/core/format.js"></script>');
const code = [
"setTimeout(function(){",
"  var t=document.getElementById('mnToast');",
"  var out=[];",
"  out.push('toastExists='+!!t);",
"  if(t){ var c=getComputedStyle(t), r=t.getBoundingClientRect(); out.push('toast text=['+t.textContent+'] class='+t.className+' rect='+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' bg='+c.backgroundColor+' op='+c.opacity); }",
"  out.push('mnErr='+(document.getElementById('mnErr')?document.getElementById('mnErr').textContent:'none'));",
"  var pre=document.createElement('pre'); pre.id='qaK'; pre.textContent=out.join(' | '); document.body.appendChild(pre);",
"},1200);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaK.html', h, 'utf8');
console.log('ok');
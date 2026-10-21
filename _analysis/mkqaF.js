const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  var all=document.querySelectorAll('body *');",
"  for(var i=0;i<all.length;i++){",
"    var el=all[i], cs=getComputedStyle(el);",
"    var bg=cs.backgroundColor||'', bc=cs.borderTopColor||'';",
"    var redish = (bg.indexOf('192, 57, 43')>=0)||(bc.indexOf('192, 57, 43')>=0)||(bg.indexOf('251, 236, 234')>=0);",
"    if(!redish) continue;",
"    var r=el.getBoundingClientRect();",
"    var txt=(el.textContent||'').trim();",
"    out.push(el.tagName+'.'+(el.className||'')+' | rect '+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' | txt='+(txt?txt.slice(0,20):'(empty)')+' | bg='+bg+' bc='+bc);",
"  }",
"  out.push('mnErr='+!!document.getElementById('mnErr')+' | toast='+!!document.getElementById('mnToast'));",
"  if(document.getElementById('mnToast')) out.push('toast class='+document.getElementById('mnToast').className+' text='+document.getElementById('mnToast').textContent);",
"  out.push('bodyScrollHeight='+document.body.scrollHeight+' innerHeight='+window.innerHeight);",
"  var pre=document.createElement('pre'); pre.id='qaF'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},2500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaF.html', h, 'utf8');
console.log('ok');
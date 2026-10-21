const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  var all=document.querySelectorAll('body *');",
"  for(var i=0;i<all.length;i++){",
"    var el=all[i], cs=getComputedStyle(el), r=el.getBoundingClientRect();",
"    if(r.width*r.height < 300) continue;",
"    var red = ['backgroundColor','borderTopColor','borderBottomColor','borderLeftColor','borderRightColor','outlineColor','color'].map(function(k){ return cs[k]||''; }).join(' ');",
"    if(red.indexOf('192, 57, 43')<0 && red.indexOf('251, 236, 234')<0) continue;",
"    var txt=(el.textContent||'').trim();",
"    out.push(el.tagName+'#'+(el.id||'')+'.'+(el.className||'')+' ['+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+'] txt='+(txt?txt.slice(0,16):'(EMPTY)'));",
"  }",
"  out.push('mnErr exists='+!!document.getElementById('mnErr'));",
"  out.push('toast exists='+!!document.getElementById('mnToast')+' class='+(document.getElementById('mnToast')?document.getElementById('mnToast').className:'-')+' text=['+(document.getElementById('mnToast')?document.getElementById('mnToast').textContent:'')+']');",
"  var tb=document.querySelector('.mn-toast');",
"  if(tb){ var c=getComputedStyle(tb); out.push('toast rect='+JSON.stringify(tb.getBoundingClientRect())+' op='+c.opacity+' bg='+c.backgroundColor); }",
"  var pre=document.createElement('pre'); pre.id='qaG'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},2600);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaG.html', h, 'utf8');
console.log('ok');
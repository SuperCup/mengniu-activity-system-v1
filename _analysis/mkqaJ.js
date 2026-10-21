const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  var all=document.querySelectorAll('body *');",
"  for(var i=0;i<all.length;i++){",
"    var el=all[i], cs=getComputedStyle(el), r=el.getBoundingClientRect();",
"    if(cs.position!=='fixed') continue;",
"    out.push('FIXED '+el.tagName+'#'+(el.id||'')+'.'+(el.className||'')+' rect='+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' bg='+cs.backgroundColor+' txt=['+(el.textContent||'').trim().slice(0,20)+']');",
"  }",
"  var H=document.documentElement.scrollHeight;",
"  var box=[];",
"  for(var j=0;j<all.length;j++){",
"    var e=all[j], c=getComputedStyle(e), rr=e.getBoundingClientRect();",
"    if(rr.width*rr.height<200) continue;",
"    var bh=c.borderBottomWidth, bb=c.borderBottomColor, bt=c.borderTopWidth, bt2=c.borderTopColor;",
"    var redEdge=((bh!=='0px')&&bb.indexOf('192, 57, 43')>=0)||((bt!=='0px')&&bt2.indexOf('192, 57, 43')>=0);",
"    if(redEdge) box.push(e.tagName+'.'+(e.className||'')+' rect='+Math.round(rr.left)+','+Math.round(rr.top)+' '+Math.round(rr.width)+'x'+Math.round(rr.height)+' bd='+bt+'/'+bt2+' bb='+bh+'/'+bb);",
"  }",
"  out.push('REDEDGE: '+(box.length?box.join(' ;; '):'none'));",
"  out.push('docH='+H);",
"  var pre=document.createElement('pre'); pre.id='qaJ'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},2200);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaJ.html', h, 'utf8');
console.log('ok');
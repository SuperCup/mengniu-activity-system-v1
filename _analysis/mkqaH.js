const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  out.push('storage='+MT.store.info().bytes+' writable='+MT.store.info().writable+' err='+MT.store.info().err);",
"  out.push('projects='+PROJECTS.length+' plans='+PLANS.length);",
"  out.push('mnErr='+(document.getElementById('mnErr')?document.getElementById('mnErr').textContent:'none'));",
"  var tail=document.body.lastElementChild;",
"  out.push('lastChild='+tail.tagName+'#'+tail.id+'.'+tail.className);",
"  var pre=document.createElement('pre'); pre.id='qaH'; pre.textContent=out.join(' | '); document.body.appendChild(pre);",
"},2000);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaH.html', h, 'utf8');
console.log('ok');
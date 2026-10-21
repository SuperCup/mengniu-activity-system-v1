const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  var ths=document.querySelectorAll('#pbPlanBody')[0].closest('table').querySelectorAll('thead th');",
"  out.push('th='+[].map.call(ths,function(t){return t.textContent.trim();}).join('/'));",
"  var rows=document.querySelectorAll('#pbPlanBody tr');",
"  for(var i=0;i<rows.length;i++){",
"    var td=rows[i].querySelectorAll('td');",
"    out.push('r'+(i+1)+'='+td[1].textContent.trim()+' -> cfg:'+(td[7]?td[7].textContent.trim():'-')+' | check:'+(td[8]?td[8].textContent.trim():'-'));",
"  }",
"  var pre=document.createElement('pre'); pre.id='qaB'; pre.textContent=out.join(' || '); document.body.appendChild(pre);",
"},1300);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaB.html', h, 'utf8');
console.log('ok');
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
h=h.replace('</body>', "\n<script>\nsetTimeout(function(){var out=[];['v-create','v-plan','v-manage'].forEach(function(id){var box=document.getElementById(id);if(!box){out.push(id+' 缺失');return;}var bad=[];box.querySelectorAll('*').forEach(function(el){if(el.scrollWidth>el.clientWidth+3&&getComputedStyle(el).overflowX!=='visible'&&el.tagName!=='TD'&&el.tagName!=='INPUT'){bad.push((el.className||el.tagName)+'|'+el.scrollWidth+'>'+el.clientWidth);}});out.push(id+' 溢出:'+(bad.length?bad.slice(0,3).join(' , '):'无'));});var pre=document.createElement('pre');pre.id='qa9';pre.textContent=out.join(' | ');document.body.appendChild(pre);},1300);\n</script>\n</body>");
fs.writeFileSync(R+'_qa9.html', h, 'utf8');
console.log('qa9 ready');
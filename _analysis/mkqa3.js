const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const probe = "\n<script>\nsetTimeout(function(){var out=[];var box=document.querySelector('#v-create');if(box){var bad=[];box.querySelectorAll('*').forEach(function(el){if(el.scrollWidth>el.clientWidth+3&&getComputedStyle(el).overflowX!=='visible'&&el.tagName!=='TD'&&el.tagName!=='INPUT'){bad.push((el.className||el.tagName)+'|'+el.scrollWidth+'>'+el.clientWidth);}});out.push('v-create 溢出:'+(bad.length?bad.slice(0,3).join(' , '):'无'));}var rows=document.querySelectorAll('#briefBody tr');out.push('概况行:'+rows.length);if(rows.length){var inp=rows[0].querySelector('input');out.push('首格宽:'+Math.round(inp.getBoundingClientRect().width)+' 值:'+inp.value);}var pre=document.createElement('pre');pre.id='qa3';pre.textContent=out.join(' | ');document.body.appendChild(pre);},1200);\n</script>\n</body>";
h=h.replace('</body>', probe);
fs.writeFileSync(R+'_qa3.html', h, 'utf8');
console.log('qa3 ready');
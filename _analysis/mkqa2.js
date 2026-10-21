const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const probe = '\n<script>\n'
+ "setTimeout(function(){var c=document.getElementById('crumb').getBoundingClientRect();var p=document.querySelector('#v-create .panel').getBoundingClientRect();var box=document.getElementById('viewRoot').getBoundingClientRect();var o=['crumb.bottom='+Math.round(c.bottom),'panel.top='+Math.round(p.top),'gap='+Math.round(p.top-c.bottom),'viewRoot.width='+Math.round(box.width),'panel.width='+Math.round(p.width)];var pre=document.createElement('pre');pre.id='qa2';pre.textContent=o.join(' | ');document.body.appendChild(pre);},1200);\n"
+ '</script>\n</body>';
h=h.replace('</body>', probe);
fs.writeFileSync(R+'_qa2.html', h, 'utf8');
console.log('qa2 ready');

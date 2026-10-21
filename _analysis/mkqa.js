
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
if(h.indexOf('qaOut')<0){
  const probe = "\n<script>\n"
  + "setTimeout(function(){\n"
  + "  var out=[];\n"
  + "  function ov(sel){\n"
  + "    var box=document.querySelector(sel); if(!box){ out.push(sel+' 缺失'); return; }\n"
  + "    var bad=[];\n"
  + "    box.querySelectorAll('*').forEach(function(el){\n"
  + "      if(el.scrollWidth > el.clientWidth+3 && getComputedStyle(el).overflowX!=='visible' && el.tagName!=='TD'){\n"
  + "        bad.push(el.className+'|'+el.scrollWidth+'>'+el.clientWidth);\n"
  + "      }\n"
  + "    });\n"
  + "    out.push(sel+' 溢出:'+(bad.length?bad.slice(0,4).join(' , '):'无'));\n"
  + "  }\n"
  + "  var f=document.querySelector('#v-manage .pcard-f');\n"
  + "  if(f){\n"
  + "    var s=f.querySelector('.savet').getBoundingClientRect();\n"
  + "    var b=f.querySelector('.pcard-btns').getBoundingClientRect();\n"
  + "    out.push('卡片底栏 savet.left='+Math.round(s.left)+' buttons.left='+Math.round(b.left)+' 左对齐='+(s.left<b.left));\n"
  + "  }\n"
  + "  var st=document.querySelectorAll('#v-manage .steps .s');\n"
  + "  out.push('状态项='+st.length+' 宽度='+Math.round(st[0].getBoundingClientRect().width));\n"
  + "  ov('#v-manage'); ov('#v-admin'); ov('#v-approve'); ov('#v-plan'); ov('#v-create');\n"
  + "  var pre=document.createElement('pre'); pre.id='qaOut'; pre.textContent=out.join('\\n');\n"
  + "  document.body.appendChild(pre);\n"
  + "}, 1200);\n"
  + "</script>\n</body>";
  h=h.replace('</body>', probe);
  fs.writeFileSync(R+'_qa.html', h, 'utf8');
}
console.log('qa page ready');

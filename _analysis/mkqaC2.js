const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    go('v-approve');",
"    out.push('还有状态页签='+(document.querySelectorAll('#v-approve .steps').length));",
"    var sel=document.getElementById('apStat');",
"    out.push('筛选项='+[].map.call(sel.options,function(o){return o.text+'='+o.value;}).join(',')+' 默认='+sel.value);",
"    out.push('默认列表='+document.querySelectorAll('#apList .pcard').length+' 信息='+txt(document.getElementById('apInfo')));",
"    sel.value='approved'; renderApproveList();",
"    out.push('已通过='+document.querySelectorAll('#apList .pcard').length);",
"    sel.value=''; renderApproveList();",
"    out.push('全部='+document.querySelectorAll('#apList .pcard').length);",
"    document.getElementById('apKw').value='年货'; renderApproveList();",
"    out.push('关键字年货='+document.querySelectorAll('#apList .pcard').length+' 信息='+txt(document.getElementById('apInfo')));",
"    apReset();",
"    out.push('重置后状态='+sel.value+' 关键字='+document.getElementById('apKw').value+' 列表='+document.querySelectorAll('#apList .pcard').length);",
"    out.push('徽标='+txt(document.getElementById('apCnt')));",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaC2'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1500);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaC2.html', h, 'utf8');
console.log('ok');
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  try{",
"    var sec=document.querySelectorAll('.st');",
"    var t4=''; for(var i=0;i<sec.length;i++){ if(sec[i].textContent.indexOf('批次计划')>=0){ t4=sec[i].textContent.replace(/\\s+/g,' ').trim(); } }",
"    out.push('标题='+t4);",
"    var th=document.querySelectorAll('#briefBody')[0]?'':'x';",
"    var heads=[]; document.querySelectorAll('.bt thead th').forEach(function(e){ var t=e.textContent.trim(); if(heads.indexOf(t)<0) heads.push(t); });",
"    out.push('表头='+heads.slice(0,12).join('/'));",
"    out.push('行数='+document.querySelectorAll('#briefBody tr').length);",
"    var r1=document.querySelector('#briefBody tr');",
"    if(r1){ out.push('首行inputs='+r1.querySelectorAll('input').length+' selects='+r1.querySelectorAll('select').length+' selVal='+(r1.querySelector('select')?r1.querySelector('select').value:'-')); }",
"    out.push('创建计划按钮='+(document.querySelector('button[onclick=\"briefAdd()\"]')?'有':'无'));",
"    openBriefItems(0,'ret');",
"    var dw=document.getElementById('dw-brief');",
"    out.push('明细抽屉='+dw.classList.contains('on')+' 导入按钮='+(document.getElementById('briefImpFile')?'有':'无')+' 模板按钮='+(document.querySelector('[onclick=\"briefImpTpl()\"]')?'有':'无'));",
"    var before=CRE_BRIEF[0].ret.length;",
"    briefImpText('永辉超市,重庆永辉超市观音桥店,重庆市,重庆,12345678901');",
"    out.push('导入后='+before+'->'+CRE_BRIEF[0].ret.length);",
"    closeDrawer();",
"    out.push('briefSummary='+briefSummary(CRE_BRIEF[0].ret,'ret').txt);",
"  }catch(e){ out.push('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaM'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"},1600);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaM.html', h, 'utf8');
console.log('ok');
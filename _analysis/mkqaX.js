const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function txt(e){ return e.textContent.replace(/\\s+/g,' ').trim(); }",
"  try{",
"    wfOpenFromRoute({projectId:'MN-WX-202612-0044', planId:'PL-04'});",
"    setTimeout(function(){",
"      out.push('深链接抽屉='+(document.getElementById('dw-batch').classList.contains('on')?'dw-batch':'未打开'));",
"      out.push('标题='+txt(document.getElementById('batTitle')));",
"      out.push('推送前 todo='+projConfigStat('MN-WX-202612-0044').todo);",
"      var i=PLANS.map(function(x){return x.id;}).indexOf('PL-04');",
"      var p=PLANS[i];",
"      p.batchForm={name:'元旦常温奶满减券',face:15,thr:99,start:'2026-12-28',end:'2027-01-05',cap:8000,user:2,desc:'限指定商品使用',batNo:''};",
"      out.push('补齐后 todo='+projConfigStat('MN-WX-202612-0044').todo+' 状态='+planConfigState(p).txt);",
"      closeDrawer();",
"      wfAct('push','MN-WX-202612-0044');",
"      out.push('推送后状态='+(PROJECTS.filter(function(x){return x.id==='MN-WX-202612-0044';})[0]||{}).state);",
"      var pre=document.createElement('pre'); pre.id='qaX'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre);",
"    }, 400);",
"  }catch(e){ out.push('ERR '+e.message); var pre=document.createElement('pre'); pre.id='qaX'; pre.textContent=out.join(String.fromCharCode(10)); document.body.appendChild(pre); }",
"},1400);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaX.html', h, 'utf8');
console.log('ok');
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let h=fs.readFileSync(R+'index.html','utf8');
const NL = '" + String.fromCharCode(10) + "';
const code = [
"setTimeout(function(){",
"  var out=[];",
"  function log(s){ out.push(s); }",
"  try{",
"    log('hash='+location.hash);",
"    log('view='+document.querySelector('.view.on').id);",
"    log('scope='+(window.PLAN_SCOPE||'null'));",
"    var dw=document.getElementById('dw-config');",
"    log('drawer='+(dw && dw.classList.contains('on')));",
"    if(dw && dw.classList.contains('on')) log('title='+document.getElementById('cfgTitle').textContent.slice(0,30));",
"    IMP.type='ret';",
"    impParse('永辉,门店A,重庆,重庆,12345678901');",
"    log('noHeader1='+IMP.rows.length+'/'+IMP.errs.length);",
"    impParse('永辉,重庆永辉超市观音桥店,重庆,重庆,');",
"    log('noHeader2='+IMP.rows.length+'/'+IMP.rows[0].__err.length);",
"    impParse('零售商名称,门店名称,省份,城市,微信商户号' + String.fromCharCode(10) + '永辉,重庆永辉超市观音桥店,重庆,重庆,1236057802');",
"    log('withHeader='+IMP.rows.length+'/err0='+IMP.errors);",
"    impParse('零售商名称,门店名称,省份,城市,微信商户号' + String.fromCharCode(10) + '永辉,重庆永辉超市观音桥店,重庆,重庆,1236057802' + String.fromCharCode(10) + '永辉,重庆永辉超市观音桥店,重庆,重庆,1236057802');",
"    log('dup='+IMP.rows.length+'/'+IMP.errs.length);",
"  }catch(e){ log('ERR '+e.message); }",
"  var pre=document.createElement('pre'); pre.id='qaD'; pre.textContent=out.join(' | '); document.body.appendChild(pre);",
"},2000);"
].join('\n');
h=h.replace('</body>', '\n<script>\n'+code+'\n</script>\n</body>');
fs.writeFileSync(R+'_qaD.html', h, 'utf8');
console.log('ok');
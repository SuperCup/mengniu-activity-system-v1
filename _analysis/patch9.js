
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 1) index.html：钉钉登录守卫（同一标签页内登录一次） */
let h=fs.readFileSync(R+'index.html','utf8');
if(h.indexOf('mn_ding_login')<0){
  h=h.replace('<title>蒙牛活动管理平台 · 一期总部端</title>',
    '<title>蒙牛活动管理平台 · 一期总部端</title>\n\n'
  + '<!-- 钉钉扫码登录守卫：本标签页登录过才放行；加 ?nologin 可跳过（仅演示用） -->\n'
  + '<script>\n'
  + '(function(){\n'
  + "  var skip = location.search.indexOf('nologin') >= 0;\n"
  + "  if(!skip && sessionStorage.getItem('mn_ding_login') !== '1'){ location.replace('login.html'); }\n"
  + '})();\n'
  + '</script>');
  fs.writeFileSync(R+'index.html', h, 'utf8');
  console.log('index guard added');
}

/* 2) login.html：补一个演示跳过入口 */
let l=fs.readFileSync(R+'login.html','utf8');
if(l.indexOf('skip')<0){
  l=l.replace('  <div class="note">',
    '  <p class="skip"><a href="index.html?nologin=1" id="skip">原型演示：暂不登录，直接进入</a></p>\n\n  <div class="note">');
  l=l.replace('  .note{\n    margin-top:16px;',
    '  .skip{margin:12px 0 0;text-align:center;font-size:11.8px}\n'
  + '  .skip a{color:var(--brand-d);text-decoration:none;border-bottom:1px dashed rgba(9,108,82,.4)}\n'
  + '  .skip a:hover{color:var(--brand)}\n\n  .note{\n    margin-top:16px;');
  fs.writeFileSync(R+'login.html', l, 'utf8');
  console.log('login skip added');
}


const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const files=['login.html','css/components.css','css/layout.css','css/tokens.css','js/app.js','js/core/format.js','js/core/router.js'];
files.forEach(function(f){
  let s=fs.readFileSync(R+f,'utf8');
  s=s.split('mtl-').join('mn-').split('mtlToast').join('mnToast').split('mtlErr').join('mnErr')
     .split('mtlKw').join('mnKw').split('mtlSearchReset').join('mnSearchReset')
     .split('mtlSearch').join('mnSearch').split('mtlHelp').join('mnHelp');
  fs.writeFileSync(R+f,s,'utf8');
});

/* 顶栏搜索：删除样式与逻辑 */
let c=fs.readFileSync(R+'css/layout.css','utf8');
c=c.replace(/\/\* 搜索：白底输入 \+ 深绿按钮[^]*?\.mn-search button:hover\{background:var\(--brand-d\)\}\n\n/, '');
c=c.replace('  .mn-search{flex:1 1 auto}\n','');
c=c.replace(/\/\* ---------- 搜索命中提示 ---------- \*\/[\s\S]*?(?=\n\/\*|\n@media)/, '');
fs.writeFileSync(R+'css/layout.css',c,'utf8');

let r=fs.readFileSync(R+'js/core/router.js','utf8');
r=r.replace(/\/\* ---------- 全局搜索：过滤当前视图内的卡片 \/ 表格行 ---------- \*\/[\s\S]*?function mnHelp\(\)/, 'function mnHelp()');
fs.writeFileSync(R+'js/core/router.js',r,'utf8');

/* 登录页文案 */
let l=fs.readFileSync(R+'login.html','utf8');
l=l.split('蒙牛MTL数字化工作台').join('蒙牛活动管理平台').split('<span class="mn-mark">MTL</span>').join('<span class="mn-mark">蒙牛</span>');
fs.writeFileSync(R+'login.html',l,'utf8');

console.log('renamed');
console.log('search refs left layout:', (fs.readFileSync(R+'css/layout.css','utf8').match(/mn-search/g)||[]).length);
console.log('search refs left router:', (fs.readFileSync(R+'js/core/router.js','utf8').match(/mnSearch|mnKw/g)||[]).length);

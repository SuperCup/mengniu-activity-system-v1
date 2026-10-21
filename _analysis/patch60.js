
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
function rep(f, a, b, once){
  let s=fs.readFileSync(R+f,'utf8');
  if(s.indexOf(a)<0){ console.log('!! MISS '+f+' :: '+a.slice(0,50)); return; }
  fs.writeFileSync(R+f, once===false ? s.split(a).join(b) : s.replace(a,b), 'utf8');
  console.log('ok '+f);
}

/* index.html：新增 core/store、core/readiness、components/config-drawer */
rep('index.html',
  '<script src="js/data/dashboard.js"></script>',
  '<script src="js/data/dashboard.js"></script>\n\n<!-- ---------- 数据仓库 / 就绪计算 ---------- -->\n<script src="js/core/store.js"></script>\n<script src="js/core/readiness.js"></script>');
rep('index.html',
  '<script src="js/components/vendor-drawer.js"></script>',
  '<script src="js/components/vendor-drawer.js"></script>\n<script src="js/components/config-drawer.js"></script>');

/* app.js：先装载本地数据 */
rep('js/app.js',
  '  function boot(){\n    MT.mountDrawers();',
  '  function boot(){\n    /* 先装载本地数据（有则覆盖种子，没有则落库），再渲染任何视图 */\n    safe(function(){ MT.store.load(); }, "store.load");\n\n    MT.mountDrawers();');

/* format.js：金额格式化不再硬拼 .00 */
let f=fs.readFileSync(R+'js/core/format.js','utf8');
let lines=f.split('\n');
let mi=lines.findIndex(function(x){ return x.indexOf('function money(n)')===0; });
lines[mi]=fs.readFileSync(A+'money-fn.txt','utf8');
fs.writeFileSync(R+'js/core/format.js', lines.join('\n'), 'utf8');
console.log('ok format.js money');

/* plans.js / projects.js 追加模型字段 */
fs.appendFileSync(R+'js/data/plans.js', '\n'+fs.readFileSync(A+'plans-model.js','utf8'), 'utf8');
fs.appendFileSync(R+'js/data/projects.js', '\n'+fs.readFileSync(A+'projects-model.js','utf8'), 'utf8');
console.log('ok data models appended');

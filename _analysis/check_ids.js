
const fs=require('fs'), path=require('path');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
function walk(dir, out){
  fs.readdirSync(dir).forEach(function(f){
    const p=path.join(dir,f);
    const st=fs.statSync(p);
    if(st.isDirectory()) walk(p,out); else out.push(p.replace(/\\/g,'/'));
  });
  return out;
}
const files = walk(R, []);
const js = files.filter(f=>f.endsWith('.js'));
const markup = files.filter(f=>f.endsWith('.js')||f.endsWith('.html')||f.endsWith('.css')).map(f=>fs.readFileSync(f,'utf8')).join('\n');

const defined = new Set();
const defRe = /id="([A-Za-z0-9_\-]+)"/g;
let m;
while((m=defRe.exec(markup))) defined.add(m[1]);

const used = new Map();
js.forEach(function(f){
  const s=fs.readFileSync(f,'utf8');
  const re=/getElementById\(\s*['"]([A-Za-z0-9_\-]+)['"]/g;
  let k;
  while((k=re.exec(s))){
    if(!used.has(k[1])) used.set(k[1], []);
    used.get(k[1]).push(path.basename(f));
  }
});

const missing=[];
used.forEach(function(v,k){ if(!defined.has(k)) missing.push(k+'  <- '+Array.from(new Set(v)).join(', ')); });
console.log('JS 文件数: '+js.length+' / 全部文件: '+files.length);
console.log('模板中存在的 id: '+defined.size+' / JS 引用的 id: '+used.size);
console.log('--- 引用但模板里找不到的 id（可能是运行时生成的，需人工确认）---');
console.log(missing.length? missing.join('\n') : '（无）');

/* 单文件体积排行，防止某个模块又变成巨石 */
const sizes = files.map(f=>({f:f.replace(R,''), n:fs.statSync(f).size}))
  .sort((a,b)=>b.n-a.n).slice(0,10);
console.log('--- 最大文件（字节）---');
sizes.forEach(function(x){ console.log(String(x.n).padStart(7)+'  '+x.f); });

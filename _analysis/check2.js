
const fs=require('fs'),path=require('path');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const js=[];(function w(d){fs.readdirSync(d).forEach(f=>{const p=path.join(d,f);fs.statSync(p).isDirectory()?w(p):(p.endsWith('.js')&&js.push(p));});})(R+'js');
const all=js.map(f=>fs.readFileSync(f,'utf8')).join('\n')+fs.readFileSync(R+'index.html','utf8');
const defined=new Set([...all.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(/g)].map(m=>m[1]));
[...all.matchAll(/window\.([A-Za-z0-9_]+)\s*=/g)].forEach(m=>defined.add(m[1]));
const called=new Set([...all.matchAll(/on(?:click|change|input)="([A-Za-z0-9_]+)\(/g)].map(m=>m[1]));
const undef=[...called].filter(c=>!defined.has(c));
console.log('onclick 未定义:', undef.length?undef.join(', '):'(none)');
const legacy=['PROJ_CARDS','PROJ_TOTAL','renderApprovePlans','apPlanBody','mtlKw','mtlSearch'];
legacy.forEach(k=>{ if(all.indexOf(k)>=0) console.log('遗留引用:',k); });

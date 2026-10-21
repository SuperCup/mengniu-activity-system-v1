
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const h=fs.readFileSync(R+'index.html','utf8');
const srcs=[...h.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
const missing=srcs.filter(s=>!fs.existsSync(R+s));
console.log('includes:', srcs.length);
console.log('missing:', missing.length? missing.join(', ') : '(none)');
const css=[...h.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m=>m[1]);
console.log('css missing:', css.filter(s=>!fs.existsSync(R+s)).join(', ')||'(none)');
/* 检查被删/不存在函数是否仍被 onclick 调用 */
const jsFiles=[];
(function walk(d){fs.readdirSync(d).forEach(f=>{const p=d+'/'+f; fs.statSync(p).isDirectory()?walk(p):(p.endsWith('.js')&&jsFiles.push(p));});})(R+'js');
const all=jsFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n')+h;
const defined=new Set([...(all.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(/g))].map(m=>m[1]));
[...all.matchAll(/window\.([A-Za-z0-9_]+)\s*=/g)].forEach(m=>defined.add(m[1]));
const called=new Set([...(all.matchAll(/on(?:click|change|input)="([A-Za-z0-9_]+)\(/g))].map(m=>m[1]));
const undef=[...called].filter(c=>!defined.has(c));
console.log('onclick 调用但未定义的函数:', undef.length? undef.join(', ') : '(none)');

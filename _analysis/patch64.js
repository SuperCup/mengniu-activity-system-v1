
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const P=R+'js/pages/plan-batch.js';
let L=fs.readFileSync(P,'utf8').split('\n');
/* 删掉误加在校验之后的表头 */
L=L.filter(function(x){ return x.indexOf('width:86px">配置状态')<0; });
/* 插到「校验」之前，与数据列顺序保持一致 */
const i=L.findIndex(function(x){ return x.indexOf('width:88px">校验')>=0; });
if(i<0) throw new Error('校验 th not found');
L.splice(i,0,'                <th style="width:86px">配置状态</th>');
fs.writeFileSync(P, L.join('\n'), 'utf8');
console.log('header fixed at line', i+1);

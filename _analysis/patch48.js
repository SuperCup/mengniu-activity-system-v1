
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'js/pages/plan-batch.js';
let s=fs.readFileSync(P,'utf8');
if(s.indexOf('计划概况')>=0){ console.log('already'); process.exit(0); }

function insertAfter(marker, txtFile){
  const i=s.indexOf(marker);
  if(i<0) throw new Error('marker not found: '+marker);
  const lineEnd=s.indexOf('\n', i);
  const add=fs.readFileSync(txtFile,'utf8');
  s=s.slice(0,lineEnd+1)+add+'\n'+s.slice(lineEnd+1);
}

insertAfter("  var batchN = plans.filter(function(x){ return !!x.bat; }).length;", A+'pb-l1.txt');
insertAfter("    + (ended ? '<div class=\"note b\" style=\"margin-top:10px\">该项目已终止，计划与批次仅可查看，不可新增。</div>' : '')", A+'pb-l2.txt');
fs.writeFileSync(P,s,'utf8');
console.log('plan-batch brief note inserted');

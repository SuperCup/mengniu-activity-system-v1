
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const P=R+'js/pages/plan-batch.js';
let s=fs.readFileSync(P,'utf8');
if(s.indexOf('var canEdit =')<0){
  const marker="  var ended = (p.state === 'stopped');";
  const i=s.indexOf(marker);
  if(i<0) throw new Error('marker');
  const lineEnd=s.indexOf('\n', i);
  s=s.slice(0,lineEnd+1)+"  var canEdit = (p.state === 'approved' || p.state === 'running');\n"+s.slice(lineEnd+1);
  fs.writeFileSync(P,s,'utf8');
  console.log('canEdit restored');
} else console.log('canEdit exists');

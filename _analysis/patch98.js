
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
let l=fs.readFileSync(R+'js/components/plan-list.js','utf8');
if(l.indexOf('活动零售商明细 <span class="muted">')<0){
  const anchor = "  h += '</div>';\n\n  document.getElementById('pdTitle')";
  if(l.indexOf(anchor)<0) throw new Error('pd anchor');
  l = l.replace(anchor, "  h += '</div>';\n" + fs.readFileSync(A+'pd-detail.js','utf8') + "\n  document.getElementById('pdTitle')");
  fs.writeFileSync(R+'js/components/plan-list.js', l, 'utf8');
  console.log('ok pd detail sections');
}

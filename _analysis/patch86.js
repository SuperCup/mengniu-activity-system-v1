
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

function editJs(file, pairs){
  const p=R+file;
  let s=fs.readFileSync(p,'utf8');
  let n=0;
  pairs.forEach(function(pr){ if(s.indexOf(pr[0])>=0){ s=s.split(pr[0]).join(pr[1]); n++; } });
  fs.writeFileSync(p,s,'utf8');
  console.log(file+' '+n+'/'+pairs.length);
}

editJs('js/pages/coupon-page.js',[
  ['12-20 ~ 01-05','2026-12-20 ~ 2027-01-05'],
  ['12-30 ~ 01-05','2026-12-30 ~ 2027-01-05'],
  ['data-exp="12-20-12-27 有效"','data-exp="2026-12-20 至 2026-12-27 有效"'],
  ['<small>12-20 ~ 12-27</small>','<small>2026-12-20 ~ 2026-12-27</small>']
]);

editJs('js/components/flow-drawer.js',[
  ['10-20 09:15','2026-10-20 09:15'],
  ['10-19 15:30','2026-10-19 15:30'],
  ['10-21 10:02','2026-10-21 10:02']
]);

/* 页面数据里的有效期 */
['js/components/pagedata.js','js/data/coupon-pages.js'].forEach(function(f){
  if(!fs.existsSync(R+f)) return;
  editJs(f,[
    ['12-20-12-27','2026-12-20 至 2026-12-27'],
    ['12-20 ~ 01-05','2026-12-20 ~ 2027-01-05'],
    ['12-30 ~ 01-05','2026-12-30 ~ 2027-01-05'],
    ['12-28 ~ 01-05','2026-12-28 ~ 2027-01-05']
  ]);
});

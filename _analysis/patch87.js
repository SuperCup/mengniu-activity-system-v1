
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
  ['<small>12-28 ~ 01-05</small>','<small>2026-12-28 ~ 2027-01-05</small>'],
  ['<small>12-20 ~ 12-27</small>','<small>2026-12-20 ~ 2026-12-27</small>']
]);

editJs('js/data/coupon-pages.js',[
  ["exp:'12-20 ~ 12-27'","exp:'2026-12-20 ~ 2026-12-27'"],
  ["cardExp:'12.20-12.27 有效'","cardExp:'2026-12-20 至 2026-12-27 有效'"],
  ["exp:'12-28 ~ 01-05'","exp:'2026-12-28 ~ 2027-01-05'"]
]);

editJs('js/pages/vendor-portal.js',[
  ['已完成 10-19 15:30','已完成 2026-10-19 15:30'],
  ['3 个计划 · 10-20 09:15','3 个计划 · 2026-10-20 09:15'],
  ['3 个批次 · 10-21 10:20','3 个批次 · 2026-10-21 10:20'],
  ['已通过校验 · 10-20 09:15','已通过校验 · 2026-10-20 09:15'],
  ['一一对应校验通过 · 10-21 10:20','一一对应校验通过 · 2026-10-21 10:20'],
  ['3 个批次均已归属 · 10-21 10:25','3 个批次均已归属 · 2026-10-21 10:25']
]);


const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
function rp(f, a, b){ let s=fs.readFileSync(R+f,'utf8'); if(s.indexOf(a)<0){ console.log('!! miss '+f+': '+a); return; } fs.writeFileSync(R+f, s.split(a).join(b),'utf8'); console.log('ok '+f); }
rp('js/data/plans.js','var PLAN_PAGE=1, PLAN_SIZE=5;','var PLAN_PAGE=1, PLAN_SIZE=15;');
rp('js/data/projects.js','var PROJ_PAGE = 1, PROJ_SIZE = 5;','var PROJ_PAGE = 1, PROJ_SIZE = 15;');
rp('js/pages/coupon-page.js','var BPAGE = 1, BSIZE = 4;','var BPAGE = 1, BSIZE = 15;');
rp('js/pages/coupon-page.js','每页 4 条','每页 15 条');
rp('js/pages/project-manage.js','每页 5 条','每页 15 条');

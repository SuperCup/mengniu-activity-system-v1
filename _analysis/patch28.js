
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/pages/project-manage.js';
let s=fs.readFileSync(P,'utf8');
s=s.replace('placeholder="活动名称 / 活动 ID / 项目单号 / 服务商"','placeholder="活动名称 / 项目单号 / 服务商"');
s=s.replace('每页 4 条','每页 5 条');
s=s.replace('PROJ_SIZE = 4;','PROJ_SIZE = 5;');
fs.writeFileSync(P,s,'utf8');

const D='D:/Project/蒙牛-原型-ds-harness/hq-console/js/data/projects.js';
let d=fs.readFileSync(D,'utf8');
d=d.replace('var PROJ_PAGE = 1, PROJ_SIZE = 4;','var PROJ_PAGE = 1, PROJ_SIZE = 5;');
fs.writeFileSync(D,d,'utf8');
console.log('page size -> 5');

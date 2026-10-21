
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 1. 计划行：补充配置 → 配置页 */
let l=fs.readFileSync(R+'js/components/plan-list.js','utf8');
const oldOps="            + (life.txt === '待完善' ? '<a onclick=\"openBatch(' + i + ')\">补充配置</a>' : '')\n            + '<a onclick=\"openPlanDetail(' + i + ')\">明细</a></div></td>'";
const newOps="            + '<a onclick=\"openPlanConfig(\\'' + p.id + '\\')\">' + (life.txt === '待完善' ? '补充配置' : '配置') + '</a>'\n            + '<a onclick=\"openPlanDetail(' + i + ')\">明细</a></div></td>'";
if(l.indexOf(oldOps)<0) throw new Error('ops anchor');
l=l.replace(oldOps,newOps);
fs.writeFileSync(R+'js/components/plan-list.js', l, 'utf8');
console.log('ok plan ops');

/* 2. 项目补服务商联系人与邮箱 */
let p=fs.readFileSync(R+'js/data/projects.js','utf8');
if(p.indexOf('p.vendorContact')<0){
  p=p.replace("PROJECTS.forEach(function(p){ if(!p.goal) p.goal = '拉新 + 复购'; });",
"PROJECTS.forEach(function(p){\n"
+ "  if(!p.goal) p.goal = '拉新 + 复购';\n"
+ "  /* 服务商对接联系人与邮箱：从服务商档案带出，保持与创建页一致 */\n"
+ "  if(!p.vendorContact || !p.vendorMail){\n"
+ "    var v = (window.VENDORS || []).filter(function(x){ return x.name === p.vendor; })[0];\n"
+ "    if(v && v.cms && v.cms[0]){\n"
+ "      if(!p.vendorContact) p.vendorContact = v.cms[0].n;\n"
+ "      if(!p.vendorMail) p.vendorMail = v.cms[0].e;\n"
+ "    }\n"
+ "  }\n"
+ "});");
  fs.writeFileSync(R+'js/data/projects.js', p, 'utf8');
  console.log('ok vendor contact');
} else console.log('!! contact already');

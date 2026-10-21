
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const P=R+'js/components/project-drawer.js';
let s=fs.readFileSync(P,'utf8');

const oldH = "'<h5>计划概况 <span class=\"muted\" style=\"font-weight:400;font-size:11.6px\">报批时填写；预算与券规则在审批通过后补充</span></h5>'";
const newH = "'<h5>批次计划 <span class=\"muted\" style=\"font-weight:400;font-size:11.6px\">一个计划对应一个批次（一批次=一张券）；预算与券规则在审批通过后补充</span></h5>'";
if(s.indexOf(oldH)<0) throw new Error('h5 anchor');
s=s.replace(oldH,newH);

const oldTh = "      + '<th style=\"width:16%\">计划名称</th><th style=\"width:16%\">批次名称</th>'\n      + '<th style=\"width:18%\">活动机制</th><th style=\"width:22%\">涉及零售商</th><th style=\"width:20%\">活动商品</th>'";
const newTh = "      + '<th style=\"width:14%\">计划名称</th><th style=\"width:16%\">券名称</th>'\n      + '<th style=\"width:14%\">机制</th><th style=\"width:9%\">发券方式</th><th style=\"width:22%\">活动零售商</th><th style=\"width:25%\">活动商品</th>'";
if(s.indexOf(oldTh)<0) throw new Error('th anchor');
s=s.replace(oldTh,newTh);
fs.writeFileSync(P,s,'utf8');
console.log('ok drawer th');

/* 计划归属回到与计划概况一致：0041 三个计划，0044 一个计划 */
const Q=R+'js/data/plans.js';
let p=fs.readFileSync(Q,'utf8');
p=p.replace("  if(x.id === 'PL-01' || x.id === 'PL-02' || x.id === 'PL-03' || x.id === 'PL-04'){\n    x.projectId = 'MN-WX-202612-0044';\n    x.proj = 'MN-WX-202612-0044';\n  }",
"  if(x.id === 'PL-01' || x.id === 'PL-02' || x.id === 'PL-03'){\n    x.projectId = 'MN-WX-202612-0041';\n    x.proj = 'MN-WX-202612-0041';\n  }\n  if(x.id === 'PL-04'){\n    x.projectId = 'MN-WX-202612-0044';\n    x.proj = 'MN-WX-202612-0044';\n  }");
fs.writeFileSync(Q,p,'utf8');
console.log('ok plans revert');

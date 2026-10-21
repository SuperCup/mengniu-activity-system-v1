
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const P=R+'js/components/project-drawer.js';
let s=fs.readFileSync(P,'utf8');

if(s.indexOf('<h5>计划概况 <span class="muted"')>=0){
  s=s.replace('<h5>计划概况 <span class="muted"','<h5>批次计划 <span class="muted"');
  s=s.replace('报批时填写；预算与券规则在审批通过后补充','一个计划对应一个批次（一批次=一张券）；预算与券规则在审批通过后补充');
  console.log('ok h5');
}

const oldTh = '+ \'<th style="width:16%">计划名称</th><th style="width:16%">批次名称</th>\'';
const newTh = '+ \'<th style="width:14%">计划名称</th><th style="width:16%">券名称</th>\'';
if(s.indexOf(oldTh)>=0){ s=s.replace(oldTh,newTh); console.log('ok th1'); }

const oldTh2 = '+ \'<th style="width:18%">活动机制</th><th style="width:22%">涉及零售商</th><th style="width:20%">活动商品</th>\'';
const newTh2 = '+ \'<th style="width:14%">机制</th><th style="width:9%">发券方式</th><th style="width:22%">活动零售商</th><th style="width:25%">活动商品</th>\'';
if(s.indexOf(oldTh2)>=0){ s=s.replace(oldTh2,newTh2); console.log('ok th2'); }

fs.writeFileSync(P,s,'utf8');

const Q=R+'js/data/plans.js';
let p=fs.readFileSync(Q,'utf8');
const oldBind="  if(x.id === 'PL-01' || x.id === 'PL-02' || x.id === 'PL-03' || x.id === 'PL-04'){\n    x.projectId = 'MN-WX-202612-0044';\n    x.proj = 'MN-WX-202612-0044';\n  }";
const newBind="  if(x.id === 'PL-01' || x.id === 'PL-02' || x.id === 'PL-03'){\n    x.projectId = 'MN-WX-202612-0041';\n    x.proj = 'MN-WX-202612-0041';\n  }\n  if(x.id === 'PL-04'){\n    x.projectId = 'MN-WX-202612-0044';\n    x.proj = 'MN-WX-202612-0044';\n  }";
if(p.indexOf(oldBind)>=0){ p=p.replace(oldBind,newBind); fs.writeFileSync(Q,p,'utf8'); console.log('ok plans'); }
else console.log('!! plans bind marker');

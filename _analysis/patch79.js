
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

function edit(file, pairs){
  const p=R+file;
  let s=fs.readFileSync(p,'utf8');
  let n=0;
  pairs.forEach(function(pr){
    if(s.indexOf(pr[0])>=0){ s=s.split(pr[0]).join(pr[1]); n++; }
  });
  fs.writeFileSync(p,s,'utf8');
  console.log(file+' -> '+n+'/'+pairs.length);
}

edit('js/components/batch-drawer.js',[
  ['批次名称最多 9 个汉字','券名称最多 9 个汉字'],
  ["'批次名称'","'券名称'"],
  ["请填写批次名称","请填写券名称"],
  ['<label>批次名称<em>*</em></label>','<label>券名称<em>*</em></label>'],
  ['1. 批次名称 → 2. 商户号','1. 券名称 → 2. 商户号']
]);

edit('js/components/plan-drawer.js',[
  ['请填写活动机制','请填写机制'],
  ['<label>活动机制<em>*</em></label>','<label>机制<em>*</em></label>'],
  ['活动机制、起止时间、零售商明细、商品明细都在这里填报，报批阶段不填写。','机制、起止时间、零售商明细、商品明细都在这里填报，报批阶段不填写。'],
  ['*   · 2 审批通过后补充计划明细：活动机制、开始时间、结束时间、','*   · 2 审批通过后补充计划明细：机制、开始时间、结束时间、']
]);

edit('js/components/plan-list.js',[
  ['<span class="k">活动机制</span>','<span class="k">机制</span>']
]);

edit('js/pages/plan-batch.js',[
  ['报批时的计划概况：','报批时创建的批次计划：'],
  ['<th style="width:130px">批次名称</th>','<th style="width:130px">券名称</th>']
]);

edit('js/core/workflow.js',[
  ["missing.push('至少 1 个计划概况')","missing.push('至少 1 个计划')"],
  ["missing.push('计划概况的名称 / 机制 / 零售商明细 / 商品明细')","missing.push('计划的名称 / 券名称 / 机制 / 活动零售商 / 活动商品')"]
]);

edit('js/pages/project-create.js',[
  ['*   状态①提交审批（本页）：活动基本信息、预算、活动机制（满减金额）、零售商范围','*   状态①提交审批（本页）：活动基本信息 + 批次计划（计划名称、券名称、机制、发券方式、活动零售商、活动商品）']
]);

edit('js/data/plans.js',[
  ['* 标黄项 2：活动机制、开始时间、结束时间、零售商明细、商品明细都在「创建计划」里填写。','* 标黄项 2：机制、开始时间、结束时间、活动零售商、活动商品都在「创建计划」里填写。']
]);

edit('css/components.css',[
  ['/* ---------- 计划概况：多值单元格 ---------- */','/* ---------- 批次计划：多值单元格 ---------- */']
]);

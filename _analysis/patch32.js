
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

let p=fs.readFileSync(R+'js/pages/project-create.js','utf8');
p=p.replace(' * pages/project-create.js — 项目创建（两段式：① 报批 ② 补信息）',
            ' * pages/project-create.js — 项目创建（提交审批）');
p=p.replace(' * 对应待确认清单标黄项 2：两段式「补信息」环节归属——',
            ' * 对应待确认清单标黄项 2：计划明细在审批通过后补充，不在报批阶段填写——');
fs.writeFileSync(R+'js/pages/project-create.js',p,'utf8');

let d=fs.readFileSync(R+'js/components/plan-drawer.js','utf8');
d=d.replace(' *   · 2 两段式「补信息」环节归属：活动机制、开始时间、结束时间、',
            ' *   · 2 审批通过后补充计划明细：活动机制、开始时间、结束时间、');
d=d.replace('<b>两段式补信息：</b>审批通过后，券名称、文案等细节在本计划内补齐。活动机制、起止时间、零售商明细、商品明细均在此填报，报批阶段不填写。',
            '<b>审批通过后补充：</b>券名称、文案等细节在本计划内补齐。活动机制、起止时间、零售商明细、商品明细都在这里填报，报批阶段不填写。');
fs.writeFileSync(R+'js/components/plan-drawer.js',d,'utf8');
console.log('wording unified');

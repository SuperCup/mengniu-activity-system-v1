
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/pages/project-create.js';
let s=fs.readFileSync(P,'utf8');
s=s.replace(' *   第一段（报批，本页）：活动基本信息、预算、活动机制（满减金额）、零售商范围\n *   第二段（补信息）：创建项目 → 创建计划，含活动机制、开始时间、结束时间、\n *   零售商明细（导入）、商品明细（导入），见 components/plan-drawer.js',
 ' *   状态①提交审批（本页）：活动基本信息、预算、活动机制（满减金额）、零售商范围\n *   状态②审批通过后补充：计划明细（机制、起止时间、零售商门店、商品），见 components/plan-drawer.js');
s=s.replace('报批只需给出机制口径，具体券文案在第二段补齐','报批只需给出机制口径，具体券文案在审批通过后补齐');
fs.writeFileSync(P,s,'utf8');
console.log('wording cleaned:', s.indexOf('第二段')<0);

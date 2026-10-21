
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/pages/home.js';
let s=fs.readFileSync(P,'utf8');
const a=s.indexOf('function todoDefs(){');
const b=s.indexOf('function renderTodos(){');
const body = "function todoDefs(){\n"
+ "  var noPlan = PROJECTS.filter(function(p){ return p.state === 'running' && p.progress && p.progress.plan === 0; }).length;\n"
+ "  var noBat = PLANS.filter(function(p){ return !p.bat; }).length;\n"
+ "\n"
+ "  return [\n"
+ "    { n: projCount('pending'),   l: '待我审批',        r: '数字化中心',            act: \"go('v-approve')\" },\n"
+ "    { n: projCount('approved'),  l: '待推送服务商',    r: '已通过未推送',          cls: 'warn', act: \"gotoProjState('approved')\" },\n"
+ "    { n: projCount('confirmed'), l: '待服务商确认',    r: '推送后等待确认',        cls: 'warn', act: \"gotoProjState('confirmed')\" },\n"
+ "    { n: noPlan,                 l: '待补充计划明细',  r: '执行中但计划为 0',      act: \"gotoProjState('running')\" },\n"
+ "    { n: noBat,                  l: '待补充批次',      r: '计划缺对应批次',        cls: 'err',  act: \"go('v-plan')\" },\n"
+ "    { n: projCount('running'),   l: '执行中活动',      r: '本月进行中',            act: \"gotoProjState('running')\" },\n"
+ "    { n: projCount('stopped'),   l: '已终止项目',      r: '预算已释放',            act: \"gotoProjState('stopped')\" }\n"
+ "  ];\n"
+ "}\n\n";
s = s.slice(0,a) + body + s.slice(b);
s = s.replace('「双节常温奶满减」计划金额合计 ¥420,000 超出核销预算 ¥400,000，已拒绝，差异清单可下载',
              '「双节常温奶满减」计划金额合计 ¥420,000 超出核销预算 ¥400,000，已拒绝；差异清单已下载，等待服务商重新上传');
fs.writeFileSync(P,s,'utf8');
console.log('todos redefined');

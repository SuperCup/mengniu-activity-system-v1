
const fs=require('fs');
const S='D:/Project/蒙牛-原型-ds-harness/_analysis/shots/';
function dom(v){ return fs.readFileSync(S+v+'.dom.html','utf8'); }
function count(s,re){ return (s.match(re)||[]).length; }

/* 先重新 dump 需要的视图 */
console.log('== v-manage ==');
let m=dom('v-manage');
console.log('卡片数:', count(m,/<div class="pcard"/g));
console.log('状态标签 nmst 数:', count(m,/nmst/g));
console.log('活动 ID 字样:', count(m,/活动 ID：/g), '(应为 0)');
console.log('noa 说明:', count(m,/class="noa"/g), '(应为 0)');
console.log('savet 左下角:', count(m,/class="savet"/g));
console.log('执行进度标签:', count(m,/进度：/g));
console.log('顶部状态项:', count(m,/onclick="projState\(/g));
console.log('流程说明按钮:', m.indexOf('openFlow()')>0 ? 'yes':'no');

console.log('== v-admin ==');
let a=dom('v-admin');
console.log('页签:', count(a,/class="atab/g));
console.log('角色行:', count(a,/onclick="openRole\(/g));
console.log('服务商行:', count(a,/onclick="openVs\(/g));
console.log('权限矩阵是否外露(roleMenuBody 表行):', count(a,/data-menu=/g), '(应为 0)');
console.log('旧的多联系人标记 vc-n:', count(a,/vc-n/g), '(应为 0)');

console.log('== v-approve ==');
let ap=dom('v-approve');
console.log('审批卡片:', count(ap,/class="pcard"/g));
console.log('内嵌审批详情块:', ap.indexOf('审批详情 ·')>0?'仍存在':'已移除');
console.log('apPlanBody 残留:', ap.indexOf('apPlanBody')>0?'有':'无');

console.log('== v-plan ==');
let pl=dom('v-plan');
console.log('项目信息条 display:', /id="planProjBar"[^>]*style="([^"]*)"/.exec(pl)[1]);
console.log('scopeTip:', /id="planScopeTip">([^<]*)/.exec(pl)[1]);
console.log('计划行:', count(pl,/<td><b>ZS-HD/g));
console.log('批次行:', count(pl,/openBatch\(\d+\)/g));

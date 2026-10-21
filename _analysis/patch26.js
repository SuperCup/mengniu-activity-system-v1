
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/components/flow-drawer.js';
let s=fs.readFileSync(P,'utf8');
s=s.replace('<div class="nd"><span class="ar">›</span><div class="nm"><span class="no">03</span>待推送服务商</div><div class="ds">审批已通过<br>可推送（邮件）/ 可终止</div></div>',
  '<div class="nd"><span class="ar">›</span><div class="nm"><span class="no">03</span>待推送服务商</div><div class="ds">审批已通过<br>补计划明细 → 推送（邮件）/ 终止</div></div>');
s=s.replace('<tr><td><b>待推送服务商</b></td><td>审批已通过，尚未生成免登录令牌链接</td><td>推送（邮件）、终止</td></tr>',
  '<tr><td><b>待推送服务商</b></td><td>审批已通过；计划明细由创建人在此状态补充（审批人看不到计划明细）</td><td>补充计划明细、推送（邮件）、终止</td></tr>');
s=s.replace('<h3>项目状态流转 <span class="sub">六个状态与各自可执行动作</span></h3>',
  '<h3>项目状态流转 <span class="sub">六个状态与各自可执行动作</span></h3>');
fs.writeFileSync(P,s,'utf8');
console.log('flow updated');


const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/README.md';
let s=fs.readFileSync(P,'utf8');
const old='2. 顶部增加状态筛选：待审批 / 已通过 / 已终止 / 全部，带数量；默认停在「待审批」。';
const neu='2. 顶部不放状态页签，改为筛选条件：审批状态（待审批 / 已通过 / 已终止 / 全部，默认「待审批」）+ 关键字（项目名称 / 项目单号 / 提报人），配查询与重置。';
if(s.indexOf(old)>=0){ s=s.replace(old,neu); fs.writeFileSync(P,s,'utf8'); console.log('ok readme'); }
else console.log('!! anchor');

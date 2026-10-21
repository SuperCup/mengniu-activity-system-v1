
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/README.md';
let s=fs.readFileSync(P,'utf8');
if(s.indexOf('5. 只有计划状态为「待完善」时')<0){
  s=s.replace('4. 项目管理「继续完善计划」仍然只跳到该项目的计划与批次页，由用户挑计划点「补充配置」。',
'4. 项目管理「继续完善计划」仍然只跳到该项目的计划与批次页，由用户挑计划点「补充配置」。\n5. 只有计划状态为「待完善」（还没有批次号）时，计划行与计划详情里才有「补充配置」入口；待配置、进行中、已结束、已中止的计划只保留「明细」。');
  fs.writeFileSync(P,s,'utf8');
  console.log('ok readme');
}

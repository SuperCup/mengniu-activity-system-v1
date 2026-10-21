
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

let l=fs.readFileSync(R+'js/components/plan-list.js','utf8');

/* 1. 计划表：只有「待完善」才有补充配置入口 */
const cur = l.match(/\+ \(planBatFilled\(p\)[\s\S]{0,140}?\)\n/);
if(cur){
  l = l.replace(cur[0], "+ (life.txt === '待完善' ? '<a onclick=\"openBatch(' + i + ')\">补充配置</a>' : '')\n");
} else if(l.indexOf("(planBatFilled(p) ?")>=0){
  throw new Error('ops pattern not matched');
}
/* 兼容旧写法（万一还留着 openPlanConfig） */
l = l.replace("+ '<a onclick=\"openPlanConfig(\\'' + p.id + '\\')\">' + (life.txt === '待完善' ? '补充配置' : '配置') + '</a>'",
              "+ (life.txt === '待完善' ? '<a onclick=\"openBatch(' + i + ')\">补充配置</a>' : '')");

/* 2. 计划详情：待完善才给补充配置按钮 */
l = l.replace("      + '<button class=\"btn btn-p btn-xs\" type=\"button\" onclick=\"closeDrawer();openBatch(' + i + ')\">补充配置</button>';",
              "      + (life.txt === '待完善' ? '<button class=\"btn btn-p btn-xs\" type=\"button\" onclick=\"closeDrawer();openBatch(' + i + ')\">补充配置</button>' : '');");

fs.writeFileSync(R+'js/components/plan-list.js', l, 'utf8');
console.log('ops ok: '+(l.indexOf("life.txt === '待完善' ? '<a onclick=\"openBatch(' + i + ')\">补充配置</a>'")>=0));
console.log('detail ok: '+(l.indexOf('openBatch(\' + i + \')">补充配置</button>\' : \'\')')>=0));
console.log('leftover planBatFilled: '+(l.indexOf('planBatFilled')>=0));

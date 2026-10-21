const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
let c=fs.readFileSync(R+'js/pages/project-create.js','utf8');
if(c.indexOf('briefBody')>=0){ console.log('already inserted'); process.exit(0); }
const block=fs.readFileSync(A+'brief-block.html','utf8');
const fn=fs.readFileSync(A+'brief-fn.js','utf8');
c=c.replace('      <!-- 四、提交后下一步 -->', block+'      <!-- 五、提交后的下一步 -->');
c=c.replace('<div class="st" style="margin-top:26px">四、提交后的下一步</div>','<div class="st" style="margin-top:26px">五、提交后的下一步</div>');
c=c.replace('        审批通过后，在「项目管理」找到本项目，点<b>「补充计划明细」</b>进入「计划与批次」：\n        填写活动机制、起止时间，并用<strong>导入名单</strong>录入零售商门店与商品明细（不再按零售商 + 区域圈选）。',
  '        审批通过后，在「项目管理」找到本项目，点<b>「补充计划明细」</b>进入「计划与批次」：\n        按上面 1 个概况补成 1 个计划 + 1 个批次，填写预算分配与券规则（面额 / 门槛 / 发放数量 / 有效期），\n        并用<strong>导入名单</strong>录入零售商门店与商品明细；补完再点「推送服务商」。');
c=c.replace('/* ---------- 注册模块 ---------- */', fn+'\n/* ---------- 注册模块 ---------- */');
fs.writeFileSync(R+'js/pages/project-create.js',c,'utf8');
console.log('create page: brief section inserted');

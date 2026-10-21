
const fs=require('fs');
const P='D:/Project/蒙牛-原型-ds-harness/hq-console/js/pages/project-create.js';
let s=fs.readFileSync(P,'utf8');

/* ---- A：两段式 → 项目两个状态 ---- */
const aStart=s.indexOf('<!-- 两段式进度 -->');
const aEnd=s.indexOf('<!-- 一、基本信息 -->');
const newA = '<!-- 两个状态：提交审批 / 审批通过后补充 -->\n'
+ '      <div class="stagebar">\n'
+ '        <div class="sg on"><span class="n">1</span><div><b>提交审批</b><small>本页只填预算、部门、服务商与机制口径</small></div></div>\n'
+ '        <div class="sg"><span class="n">2</span><div><b>审批通过后补充计划明细</b><small>在「项目管理 → 计划与批次」补计划、批次与页面</small></div></div>\n'
+ '      </div>\n'
+ '      <div class="note b">\n'
+ '        <b>两个状态：</b>① 提交审批 —— 审批人只看预算与项目基本信息，<b>不看计划明细</b>；② 审批通过 —— 项目进入「待推送服务商」，由创建人在「计划与批次」中补充计划明细，再推送服务商执行。<br>\n'
+ '        因此本页不填零售商清单、商品明细与券文案，这些都在审批通过后补充。\n'
+ '      </div>\n\n      ';
s = s.slice(0,aStart) + newA + s.slice(aEnd);

/* ---- B：去掉创建页的批次计划表 ---- */
const bStart=s.indexOf('<!-- 四、批次计划（第二段补信息） -->');
const bEnd=s.indexOf('<div class="panel-f">');
if(bStart<0||bEnd<0) throw new Error('block B anchors');
const newB = '<!-- 四、提交后下一步 -->\n'
+ '      <div class="st" style="margin-top:26px">四、提交后的下一步</div>\n'
+ '      <div class="note" style="margin-top:0">\n'
+ '        审批通过后，在「项目管理」找到本项目，点<b>「补充计划明细」</b>进入「计划与批次」：\n'
+ '        填写活动机制、起止时间，并用<strong>导入名单</strong>录入零售商门店与商品明细（不再按零售商 + 区域圈选）。\n'
+ '      </div>\n\n      ';
s = s.slice(0,bStart) + newB + s.slice(bEnd);

/* ---- C：提交校验不再强制要求计划 ---- */
s = s.replace("  if(!PLANS.length) missing.push('至少一个批次计划');\n", '');
s = s.replace("  MT.toast('已提交审批。审批通过后进入第二段「补信息」，在计划内补齐券文案等细节');",
  "  MT.toast('已提交审批。审批通过后请在「项目管理 → 计划与批次」补充计划明细');");

fs.writeFileSync(P,s,'utf8');
console.log('create page updated');

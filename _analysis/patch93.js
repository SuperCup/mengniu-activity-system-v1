
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* 1. readiness 换成批次口径 */
fs.writeFileSync(R+'js/core/readiness.js', fs.readFileSync(A+'readiness-new.js','utf8'), 'utf8');
console.log('ok readiness');

/* 2. 计划行「补充配置」→ 批次信息页 */
let l=fs.readFileSync(R+'js/components/plan-list.js','utf8');
l=l.replace("+ '<a onclick=\"openPlanConfig(\\'' + p.id + '\\')\">' + (life.txt === '待完善' ? '补充配置' : '配置') + '</a>'",
            "+ (planBatFilled(p) ? '<a onclick=\"openBatch(' + i + ')\">修改批次</a>' : '<a onclick=\"openBatch(' + i + ')\">补充配置</a>')");
fs.writeFileSync(R+'js/components/plan-list.js', l, 'utf8');
console.log('ok plan link: '+ (l.indexOf('修改批次')>=0));

/* 3. 批次抽屉：按计划 ID 打开 */
let b=fs.readFileSync(R+'js/components/batch-drawer.js','utf8');
if(b.indexOf('function openBatchById')<0){
  b=b.replace('/* ---------- 右侧示例图',
'/** 按计划 ID 打开批次信息页（深链接 / 工作台入口用） */\n'
+ 'function openBatchById(pid){\n'
+ '  var i = PLANS.map(function(x){ return x.id; }).indexOf(pid);\n'
+ '  if(i < 0){ MT.toast(\'未找到对应计划\', \'err\'); return; }\n'
+ '  openBatch(i);\n'
+ '}\n\n'
+ '/* ---------- 右侧示例图');
  fs.writeFileSync(R+'js/components/batch-drawer.js', b, 'utf8');
  console.log('ok openBatchById');
}

/* 4. workflow 深链接 + 提示语 */
let w=fs.readFileSync(R+'js/core/workflow.js','utf8');
w=w.replace('setTimeout(function(){ openPlanConfig(planId); }, 160);','setTimeout(function(){ openBatchById(planId); }, 160);');
w=w.replace('MT.toast(\'在计划列表中点「补充配置」，逐个计划/批次完善执行配置\');','MT.toast(\'点计划后的「补充配置」，填写该批次的券信息\');');
fs.writeFileSync(R+'js/core/workflow.js', w, 'utf8');
console.log('ok workflow: '+(w.indexOf('openBatchById')>=0));

/* 5. 删除旧配置抽屉 */
if(fs.existsSync(R+'js/components/config-drawer.js')) fs.unlinkSync(R+'js/components/config-drawer.js');
let h=fs.readFileSync(R+'index.html','utf8');
h=h.replace(/\s*<script src="js\/components\/config-drawer\.js"><\/script>/, '');
fs.writeFileSync(R+'index.html', h, 'utf8');
console.log('ok drop config drawer: '+(h.indexOf('config-drawer')<0));

/* 6. 计划数据：已有批次的补一份批次表单，避免历史计划全部显示待完善 */
let pj=fs.readFileSync(R+'js/data/plans.js','utf8');
if(pj.indexOf('p.batchForm =')<0){
  pj += [
  '',
  '/* =============================================================================',
  ' * 已有批次的计划补一份批次信息表单（与「补充批次信息」页保存的结构一致）',
  ' * ========================================================================== */',
  'PLANS.forEach(function(p){',
  '  if(p.batchForm || !p.bat || !p.bs || !p.be) return;',
  '  p.batchForm = {',
  '    name: p.btitle || p.coupon || p.name,',
  '    face: p.face, thr: p.thr,',
  '    start: p.bs, end: p.be,',
  '    cap: p.bqty || p.qty || 0,',
  '    user: 2,',
  '    desc: \'限指定商品使用，不可兑换现金，可在微信支付卡包查看。\',',
  '    batNo: p.bat',
  '  };',
  '});',
  ''
  ].join('\n');
  fs.writeFileSync(R+'js/data/plans.js', pj, 'utf8');
  console.log('ok plans backfill');
}

/* 7. 页内提示语 */
let pb=fs.readFileSync(R+'js/pages/plan-batch.js','utf8');
pb=pb.replace('按计划逐个点「补充配置」完善执行信息（券名称、面额、门槛、数量、有效期等），全部完成后才可推送服务商。',
              '按计划逐个点「补充配置」填写该批次的券名称、面额、门槛、可用时间、发放上限，全部补齐后才可推送服务商。');
fs.writeFileSync(R+'js/pages/plan-batch.js', pb, 'utf8');
console.log('ok note');

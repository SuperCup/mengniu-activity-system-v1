
const fs=require('fs'), path=require('path');
const ROOT='D:/Project/蒙牛-原型-ds-harness/hq-console';
const buckets=JSON.parse(fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/css_buckets.json','utf8'));
const HEAD={
 'components.css':['components.css — 通用组件样式','面板/卡片/标签/按钮/表格/表单/抽屉/浮层/分页等跨模块复用的组件。\n只允许引用 tokens.css 中的变量，禁止出现字面色值。'],
 'pages/home.css':['pages/home.css — 工作台','待办卡与消息流。'],
 'pages/project.css':['pages/project.css — 项目域（创建 / 审批 / 项目管理）','区块标题、表单、提示条、上传、流程与状态说明等。'],
 'pages/plan-batch.css':['pages/plan-batch.css — 计划与批次','计划表、批次表、分页、创建计划抽屉、导入抽屉、补充批次抽屉。'],
 'pages/coupon.css':['pages/coupon.css — 领券页面','批次勾选、手机预览、券位排序、背景图、分渠道二维码。'],
 'pages/dashboard.css':['pages/dashboard.css — 数据看板','指标卡、折线、环形、条形、热力图与表格密度。'],
 'pages/admin.css':['pages/admin.css — 系统管理','服务商配置表与服务商抽屉。']
};
Object.keys(buckets).forEach(function(file){
  var h=HEAD[file];
  var out='/* =============================================================================\n * '+h[0]+'\n';
  h[1].split('\n').forEach(function(l){ out+=' * '+l+'\n'; });
  out+=' * ========================================================================== */\n\n';
  out+=buckets[file].join('\n');
  out+='\n';
  fs.writeFileSync(path.join(ROOT,'css',file), out,'utf8');
  console.log(file, buckets[file].length, 'rules', out.length, 'chars');
});

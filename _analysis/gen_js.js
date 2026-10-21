
const fs=require('fs'), path=require('path');
const ROOT='D:/Project/蒙牛-原型-ds-harness/hq-console';
const BLOCKS='D:/Project/蒙牛-原型-ds-harness/_analysis/blocks';
const segs=JSON.parse(fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/segments.json','utf8'));

function header(title, desc){
  return '/* =============================================================================\n'
    + ' * ' + title + '\n'
    + (desc ? desc.split('\n').map(function(l){ return ' * ' + l; }).join('\n') + '\n' : '')
    + ' * ========================================================================== */\n';
}
function readBlock(id){
  var f = path.join(BLOCKS, id + '.html');
  if(!fs.existsSync(f)) return null;
  return fs.readFileSync(f,'utf8');
}
var BACKTICK=String.fromCharCode(96);
var DOLLAR_BRACE='$'+'{';
function toTemplate(html){
  var t = html.replace(/\\/g,'\\\\').split(BACKTICK).join('\\'+BACKTICK);
  t = t.split(DOLLAR_BRACE).join('\\'+DOLLAR_BRACE);
  return BACKTICK + t + BACKTICK;
}
function tplName(bid){
  var base = bid.replace(/^v-/, 'Page').replace(/^dw-/, 'Drawer').replace(/^pk/, 'Picker');
  return 'tpl' + base.replace(/(^|-)([a-z0-9])/g, function(m,a,b){ return b.toUpperCase(); });
}

var PAGE_META = {
  'v-home':    {id:'v-home',    title:'工作台',       crumb:'概览 / 工作台',              group:'概览'},
  'v-create':  {id:'v-create',  title:'项目创建',     crumb:'活动运营 / 项目创建',        group:'活动运营'},
  'v-approve': {id:'v-approve', title:'项目审批',     crumb:'活动运营 / 项目审批',        group:'活动运营'},
  'v-manage':  {id:'v-manage',  title:'项目管理',     crumb:'活动运营 / 项目管理',        group:'活动运营'},
  'v-plan':    {id:'v-plan',    title:'计划与批次',   crumb:'活动运营 / 计划与批次',      group:'活动运营'},
  'v-h5':      {id:'v-h5',      title:'领券页面',     crumb:'运营执行 / 领券页面',        group:'运营执行'},
  'v-board':   {id:'v-board',   title:'数据看板',     crumb:'数据分析 / 数据看板',        group:'数据分析'},
  'v-admin':   {id:'v-admin',   title:'系统管理',     crumb:'系统设置 / 系统管理',        group:'配置'},
  'v-vendor':  {id:'v-vendor',  title:'服务商操作页', crumb:'示例 / 服务商操作页',        group:'示例', nav:true, isNew:true}
};

const FILES = [
  {p:'js/data/vendors.js',       t:'data/vendors.js — 服务商数据', d:'标黄项 12：「一个服务商仅一个对接联系人/邮箱」\n每条记录只有一组 cms（姓名 + 邮箱），项目创建时选公司自动带出。'},
  {p:'js/data/retailers.js',     t:'data/retailers.js — 零售商 / 门店主数据（示例）', d:'一期不对接门店库，页面不再从此处「圈选」，仅作为导入后的校验参照。'},
  {p:'js/data/products.js',      t:'data/products.js — 商品数据（示例）', d:'一期不对接商品库；导入模板列为 69码/店内码 + 商品名称 + 店内码所属零售商。'},
  {p:'js/data/plans.js',         t:'data/plans.js — 批次计划数据（创建项目时填报）', d:'标黄项 2：活动机制、开始时间、结束时间、零售商明细、商品明细都在「创建计划」里填写。\n全站计划与批次共此一份数据，领券页面、看板均由它派生。'},
  {p:'js/data/po.js',            t:'data/po.js — PO 单号与预算带出数据', d:'PO 单号录入后自动带出核销预算 / 费用科目 / 承担主体 / 预算来源。'},
  {p:'js/data/coupon-pages.js',  t:'data/coupon-pages.js — 领券页面与消费者状态映射', d:''},
  {p:'js/data/qr.js',            t:'data/qr.js — 页面二维码数据', d:'标黄项 16：一个活动按分发渠道各生成一枚码，用于分渠道统计发券量。'},
  {p:'js/data/projects.js',      t:'data/projects.js — 项目列表卡片数据', d:''},
  {p:'js/data/dashboard.js',     t:'data/dashboard.js — 数据看板示例数据', d:'标黄项 17：指标口径沿用呼市 / 河南已对齐版本，此处仅作示例体量。'},

  {p:'js/components/picker.js',        t:'components/picker.js — 零售商 / 商品多选浮层', d:'注意：标黄项 10 已把「圈选」改为「导入」，「创建计划」内的零售商 / 商品明细\n不再使用本浮层，保留给批量勾选等历史场景。', blk:'pkLayer'},
  {p:'js/components/import-drawer.js', t:'components/import-drawer.js — 名单导入抽屉（标黄项 10 / 11）', d:'零售商明细导入列：零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号\n商品明细导入列：69码或店内码 / 商品名称 / 店内码所属零售商\n支持模板下载、CSV 上传、粘贴解析、逐行校验提示。', blk:'dw-imp'},
  {p:'js/components/plan-drawer.js',   t:'components/plan-drawer.js — 创建 / 编辑计划抽屉（标黄项 2）', d:'两段式「补信息」的落点：活动机制、开始时间、结束时间、\n零售商明细（导入）、商品明细（导入）都在这里填报。', blk:'dw-plannew'},
  {p:'js/components/plan-list.js',     t:'components/plan-list.js — 计划 / 批次表格渲染与计划详情', d:'被「项目创建」「项目审批」「计划与批次」三个模块共用，保证全站同源。', blk:'dw-pdetail'},
  {p:'js/components/batch-drawer.js',  t:'components/batch-drawer.js — 补充批次信息抽屉（标黄项 3）', d:'字段与校验规则 1:1 复刻微信支付商户平台「创建代金券批次」，\n每个字段附示例说明，避免业务误填。', blk:null},
  {p:'js/components/qr-drawer.js',     t:'components/qr-drawer.js — 二维码抽屉（标黄项 16）', d:'一个活动按渠道（线下物料 / 公众号 / 私域）各生成一枚码，命名规则见抽屉内说明。', blk:'dw-qr'},
  {p:'js/components/pagedata.js',      t:'components/pagedata.js — 页面数据弹窗', d:'', blk:'dw-pgdata'},
  {p:'js/components/flow-drawer.js',   t:'components/flow-drawer.js — 项目状态流转说明', d:'', blk:'dw-flow'},
  {p:'js/components/vendor-drawer.js', t:'components/vendor-drawer.js — 服务商新增 / 编辑抽屉（标黄项 12）', d:'一个服务商只维护唯一对接联系人 + 邮箱，保存后项目创建自动带出。', blk:'dw-vs'},

  {p:'js/pages/home.js',            t:'pages/home.js — 工作台', d:'入口页：待办 + 消息与提醒，待办数字与各模块角标同源。', blk:'v-home'},
  {p:'js/pages/project-create.js',  t:'pages/project-create.js — 项目创建（两段式第一段：报批）', d:'标黄项 2：报批阶段只填基本信息 / 预算 / 服务商；活动机制、起止时间、\n零售商明细、商品明细移到「创建计划」，由第二段补信息。', blk:'v-create'},
  {p:'js/pages/project-approve.js', t:'pages/project-approve.js — 项目审批', d:'审批以批次计划为判断依据，与项目创建共用 PLANS 数据。', blk:'v-approve'},
  {p:'js/pages/project-manage.js',  t:'pages/project-manage.js — 项目管理', d:'', blk:'v-manage'},
  {p:'js/pages/plan-batch.js',      t:'pages/plan-batch.js — 计划与批次', d:'标黄项 3：支持为计划补充批次信息，校验规则对标微信支付后台。', blk:'v-plan'},
  {p:'js/pages/coupon-page.js',     t:'pages/coupon-page.js — 领券页面（建页 / 编辑 / 预览 / 分渠道二维码）', d:'标黄项 16：一个活动多分发渠道生成多个二维码。', blk:'v-h5'},
  {p:'js/pages/dashboard.js',       t:'pages/dashboard.js — 数据看板', d:'标黄项 17：指标口径沿用呼市 / 河南已对齐版本，模块与拆分维度直接平移。', blk:'v-board'},
  {p:'js/pages/system-admin.js',    t:'pages/system-admin.js — 系统管理', d:'角色与权限、服务商配置、字典维护。', blk:'v-admin'},
  {p:'js/pages/vendor-portal.js',   t:'pages/vendor-portal.js — 服务商操作页（示意）', d:'服务商端不在总部端原型的交付范围，此处仅示意确认 / 提报动作。', blk:'v-vendor'}
];

var EXTRA_BLOCKS = {
  'js/pages/coupon-page.js': ['dw-page','dw-edit'],
  'js/pages/plan-batch.js': ['dw-plan']
};

var missing=[];
FILES.forEach(function(f){
  var body = (segs[f.p]||[]).join('\n\n');
  var parts=[header(f.t, f.d)];
  if(body.trim()) parts.push('/* ---------- 逻辑 ---------- */\n' + body + '\n');

  var blockIds = [];
  if(f.blk) blockIds.push(f.blk);
  if(EXTRA_BLOCKS[f.p]) blockIds = blockIds.concat(EXTRA_BLOCKS[f.p]);

  blockIds.forEach(function(bid){
    var html = readBlock(bid);
    if(!html){ missing.push(f.p+' <- '+bid); return; }
    parts.push('/* ---------- 模板：' + bid + ' ---------- */\n'
      + 'function ' + tplName(bid) + '(){\n  return ' + toTemplate(html) + ';\n}\n');
  });

  if(f.blk && f.blk.indexOf('v-') === 0){
    var meta = PAGE_META[f.blk];
    parts.push('/* ---------- 注册模块 ---------- */\n'
      + 'MT.definePage({\n'
      + '  id: ' + JSON.stringify(meta.id) + ',\n'
      + '  title: ' + JSON.stringify(meta.title) + ',\n'
      + '  crumb: ' + JSON.stringify(meta.crumb) + ',\n'
      + '  group: ' + JSON.stringify(meta.group) + ',\n'
      + (meta.isNew ? '  isNew: true,\n' : '')
      + '  template: ' + tplName(f.blk) + '\n'
      + '});\n');
  }
  blockIds.forEach(function(bid){
    if(bid.indexOf('dw-') === 0){
      parts.push('MT.defineDrawer(' + JSON.stringify(bid) + ', ' + tplName(bid) + ');\n');
    }
  });

  fs.writeFileSync(path.join(ROOT, f.p), parts.join('\n'), 'utf8');
});
console.log('missing blocks:', missing.join(', ') || 'none');
console.log('files written:', FILES.length);

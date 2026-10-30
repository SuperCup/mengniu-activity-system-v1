/* =============================================================================
 * data/projects.js — 项目主数据 + 状态定义
 * 说明：
 *   · 项目列表、项目详情两处共用本文件，字段只改一处
 *   · 状态流转见 components/flow-drawer.js（项目管理页「状态流转与执行动作」）
 *   · 「保存时间」用于卡片左下角；各状态时间用于详情时间线
 * ========================================================================== */

/* ---------- 节点 + 状态定义（V7.3：4 个节点 / 11 个状态） ---------- */
var PROJ_STATES = {
  editing:    { key:'editing',    label:'草稿',   stage:'draft',    code:'EDITING',         cls:'tg-n' },
  approving:  { key:'approving',  label:'审批中', stage:'approval', code:'APPROVING',       cls:'tg-t' },
  passed:     { key:'passed',     label:'已通过', stage:'approval', code:'APPROVED',        cls:'tg-g' },
  rejected:   { key:'rejected',   label:'未通过', stage:'approval', code:'REJECTED',        cls:'tg-r' },
  to_push:    { key:'to_push',    label:'待推送', stage:'push',     code:'PENDING_PUSH',    cls:'tg-a' },
  pushed:     { key:'pushed',     label:'已推送', stage:'push',     code:'PUSHED',          cls:'tg-g' },
  to_confirm: { key:'to_confirm', label:'待确认', stage:'push',     code:'PENDING_CONFIRM', cls:'tg-a' },
  confirmed:  { key:'confirmed',  label:'已确认', stage:'push',     code:'CONFIRMED',       cls:'tg-g' },
  configured: { key:'configured', label:'已配置', stage:'exec',     code:'CONFIGURED',      cls:'tg-g' },
  running:    { key:'running',    label:'执行中', stage:'exec',     code:'RUNNING',         cls:'tg-s' },
  finished:   { key:'finished',   label:'已结束', stage:'exec',     code:'FINISHED',        cls:'tg-n' }
};
var PROJ_STATE_ORDER = ['editing','approving','passed','rejected','to_push','pushed','to_confirm','confirmed','configured','running','finished'];

var PROJ_STAGES = {
  draft:    { key:'draft',    label:'草稿阶段', short:'草稿' },
  approval: { key:'approval', label:'审批阶段', short:'审批' },
  push:     { key:'push',     label:'推送阶段', short:'推送' },
  exec:     { key:'exec',     label:'执行阶段', short:'执行' }
};
var PROJ_STAGE_ORDER = ['draft','approval','push','exec'];

function projStage(p){
  var s = p && PROJ_STATES[p.state];
  return s ? s.stage : 'draft';
}
function projStageIndex(p){ return Math.max(0, PROJ_STAGE_ORDER.indexOf(projStage(p))); }

/* ---------- 维度状态（只读展示，审批动作已全部移除） ---------- */
function projApprovalStatus(p){
  if(!p) return { txt:'—', cls:'tg-n' };
  if(p.state === 'editing')   return { txt:'草稿',   cls:'tg-n' };
  if(p.state === 'approving') return { txt:'审批中', cls:'tg-t' };
  if(p.state === 'rejected')  return { txt:'未通过', cls:'tg-r' };
  return { txt:'已通过', cls:'tg-g' };
}
function projPushStatus(p){
  if(!p) return { txt:'—', cls:'tg-n' };
  var s = p.state;
  if(s === 'to_push')    return { txt:'待推送',   cls:'tg-a' };
  if(s === 'pushed')     return { txt:'已推送 · 待回执', cls:'tg-t' };
  if(s === 'to_confirm') return { txt:'待确认',   cls:'tg-a' };
  if(s === 'confirmed' || s === 'configured' || s === 'running' || s === 'finished') return { txt:'已确认', cls:'tg-g' };
  return { txt:'—', cls:'tg-n' };
}
function projExecStatus(p){
  if(!p) return { txt:'—', cls:'tg-n' };
  if(p.state === 'configured') return { txt:'已配置 · 批次号已上传', cls:'tg-g' };
  if(p.state === 'running')    return { txt:'执行中', cls:'tg-s' };
  if(p.state === 'finished')   return { txt:'已结束', cls:'tg-n' };
  return { txt:'未开始', cls:'tg-n' };
}
/* 邮件回执：推送阶段的演示字段 */
function projMailStatus(p){
  if(!p) return { txt:'—', cls:'tg-n' };
  var s = p.state;
  if(s === 'pushed') return { txt:'已发送 · 待回执', cls:'tg-t' };
  if(s === 'to_confirm' || s === 'confirmed' || s === 'configured' || s === 'running' || s === 'finished')
    return { txt:'已回执', cls:'tg-g' };
  return { txt:'—', cls:'tg-n' };
}

/** 项目下的计划数与计划金额合计（计划批次金额口径） */
function projPlanStat(projId){
  var list = (window.PLANS || []).filter(function(x){ return (x.projectId || x.proj) === projId; });
  var amt = 0;
  list.forEach(function(x){ var v = Number(x.budget); if(isFinite(v)) amt += v; });
  /* 草稿阶段计划还没落成批次记录：按创建页计划条数计，金额为 0 */
  if(!list.length){
    var pr = (window.PROJECTS || []).filter(function(x){ return x.id === projId; })[0];
    if(pr && pr.state === 'editing' && (pr.planBrief || []).length){
      return { n:pr.planBrief.length, amt:0 };
    }
  }
  return { n:list.length, amt:amt };
}

/* ---------- 数据边界：创建人 / 审批人 / 活动负责人可见对应活动 ---------- */
function projVisible(p){
  var u = (typeof mnCurrentUser === 'function') ? mnCurrentUser() : null;
  if(!u) return true;
  if(u.role === 'admin') return true;
  if(p.creator && p.creator.id && p.creator.id === u.id) return true;
  if(p.ownerUser && p.ownerUser.id && p.ownerUser.id === u.id) return true;
  if(!p.creator && !p.ownerUser) return true;
  return (p.approvers || []).some(function(a){ return a && a.id === u.id; });
}
function projAll(){
  return (window.PROJECTS || []).filter(projVisible);
}

/* ---------- 项目主数据 ---------- */
var PROJECTS = [
  {
    id:'MN-WX-202612-0046', orderNo:'SO2026100046-01', name:'春节礼盒预售',
    state:'editing', platform:'微信支付', source:'BU 自投',
    bu:'BU02 华北事业部', budget:'¥180,000.00', period:'2027-01-10 ~ 2027-02-10',
    vendor:'智选数字技术（广州）股份有限公司北京分公司',
    mech:'礼盒满 199 减 30', owner:'王磊 · 13701234567',
    po:'POCN68-0000014712', subject:'市场推广费-促销费用', bearer:'BU02 华北事业部',
    saved:'2026-10-19 16:48', submitted:'', approvedAt:'', confirmedAt:'', stoppedAt:'',
    progress:null,
    todos:['机制附件缺「零售商说明」','提交前预校验 3 项中 2 项通过']
  },
  {
    id:'MN-WX-202612-0043', orderNo:'SO2026100038-02', name:'年货节乳品礼盒',
    state:'approving', platform:'微信支付', source:'BU 自投',
    bu:'BU01 华北事业部', budget:'¥125,000.00', period:'2026-12-28 ~ 2027-01-10',
    vendor:'智选数字技术（广州）股份有限公司北京分公司',
    mech:'礼盒满 129 减 20', owner:'赵琳 · 13611112222',
    po:'POCN68-0000014708', subject:'市场推广费-促销费用', bearer:'BU01 华北事业部',
    saved:'2026-10-19 14:20', submitted:'2026-10-19 14:20', approvedAt:'', confirmedAt:'', stoppedAt:'',
    progress:null,
    approver:'数字化中心 · 张明、马超'
  },
  {
    id:'MN-WX-202612-0044', orderNo:'SO2026100040-03', name:'元旦乳品满减',
    state:'passed', platform:'微信支付', source:'BU 自投',
    bu:'BU01 华北事业部', budget:'¥125,000.00', period:'2026-12-28 ~ 2027-01-10',
    vendor:'智选数字技术（广州）股份有限公司北京分公司',
    mech:'常温奶满 99 减 15', owner:'赵琳 · 13611112222',
    po:'POCN68-0000014710', subject:'市场推广费-促销费用', bearer:'BU01 华北事业部',
    saved:'2026-10-19 11:30', submitted:'2026-10-19 09:05', approvedAt:'2026-10-19 11:30', confirmedAt:'', stoppedAt:'',
    progress:null,
    pushTo:'zhaolin@xingchen-dm.com（业务对接人）'
  },
  {
    id:'MN-WX-202612-0047', orderNo:'SO2026100042-04', name:'跨年暖冬饮品券',
    state:'to_push', platform:'微信支付', source:'集团统投',
    bu:'BU03 华东事业部', budget:'¥260,000.00', period:'2026-12-28 ~ 2027-01-10',
    vendor:'上海智士网络科技有限公司',
    vendorContact:'胡味芝', vendorMail:'huwz@zhishi.com',
    mech:'饮品满 59 减 10', owner:'陈曦 · 13900001111',
    po:'POCN68-0000014715', subject:'市场推广费-促销费用', bearer:'BU03 华东事业部',
    saved:'2026-10-17 10:12', submitted:'2026-10-16 16:40', approvedAt:'2026-10-17 09:50', confirmedAt:'', stoppedAt:'',
    progress:null,
    pushTo:'huwz@zhishi.com（业务对接人）'
  },
  {
    id:'MN-WX-202612-0041', orderNo:'SO2026100041-01', name:'双节常温奶满减',
    state:'running', platform:'微信支付', source:'集团统投',
    bu:'BU03 华东事业部', budget:'¥400,000.00', period:'2026-12-20 ~ 2027-01-05',
    vendor:'上海智士网络科技有限公司',
    vendorContact:'胡味芝', vendorMail:'huwz@zhishi.com',
    mech:'常温奶满 99 减 15', owner:'李雪 · 15269175821',
    po:'POCN68-0000014722', subject:'市场推广费-促销费用', bearer:'BU03 华东事业部',
    saved:'2026-10-19 15:30', submitted:'2026-10-18 10:00', approvedAt:'2026-10-18 15:10', confirmedAt:'2026-10-19 15:30', stoppedAt:'',
    progress:{ plan:4, batch:4, todo:'待回传第 2 次账单' }
  },
  {
    id:'MN-WX-202612-0039', orderNo:'SO2026100039-05', name:'早餐场景券（12月）',
    state:'pushed', platform:'微信支付', source:'BU 自投',
    bu:'BU05 华南事业部', budget:'¥210,000.00', period:'2026-12-01 ~ 2026-12-31',
    vendor:'广州智曹数字技术有限公司',
    mech:'早餐组合满 39 减 8', owner:'黄伟 · 13512345678',
    po:'POCN68-0000014699', subject:'市场推广费-促销费用', bearer:'BU05 华南事业部',
    saved:'2026-10-18 16:10', submitted:'2026-10-17 11:20', approvedAt:'2026-10-18 09:30', confirmedAt:'2026-10-18 16:10', stoppedAt:'',
    pushTo:'huangwei@zhicao-tech.com（业务对接人）', mailAt:'2026-10-18 16:12',
    progress:null
  },
  {
    id:'MN-WX-202611-0028', orderNo:'SO2026100028-06', name:'夏季冰品联合促销',
    state:'finished', platform:'微信支付', source:'BU 自投',
    bu:'BU04 西南事业部', budget:'¥96,000.00', period:'2026-10-01 ~ 2026-10-31',
    vendor:'武汉智赢数图科技有限公司',
    mech:'冰品满 49 减 8', owner:'周涛 · 13300009999',
    po:'POCN68-0000014601', subject:'市场推广费-促销费用', bearer:'BU04 西南事业部',
    saved:'2026-10-16 09:40', submitted:'2026-10-10 09:00', approvedAt:'2026-10-11 10:20', confirmedAt:'2026-10-12 14:00', stoppedAt:'2026-10-16 09:40',
    progress:null,
    stopReason:'业务调整，KPI 口径变更', released:'预算额度 ¥96,000.00 已释放回部门池'
  },
  {
    id:'MN-WX-202612-0051', orderNo:'SO2026100051-07', name:'圣诞礼盒预热',
    state:'rejected', platform:'微信支付', source:'BU 自投',
    bu:'BU02 华北事业部', budget:'¥88,000.00', period:'2026-12-15 ~ 2026-12-25',
    vendor:'智选数字技术（广州）股份有限公司北京分公司',
    mech:'礼盒满 159 减 25', owner:'王磊 · 13701234567',
    po:'POCN68-0000014730', subject:'市场推广费-促销费用', bearer:'BU02 华北事业部',
    saved:'2026-10-21 10:05', submitted:'2026-10-21 09:40', approvedAt:'', confirmedAt:'', stoppedAt:'',
    progress:null,
    approvalNote:'预算单剩余额度不足，退回调整计划金额后再报'
  },
  {
    id:'MN-WX-202612-0052', orderNo:'SO2026100052-08', name:'年货节坚果礼盒',
    state:'to_confirm', platform:'微信支付', source:'集团统投',
    bu:'BU01 华北事业部', budget:'¥150,000.00', period:'2027-01-05 ~ 2027-01-20',
    vendor:'上海智士网络科技有限公司',
    vendorContact:'胡味芝', vendorMail:'huwz@zhishi.com',
    mech:'坚果礼盒满 129 减 20', owner:'赵琳 · 13611112222',
    po:'POCN68-0000014731', subject:'市场推广费-促销费用', bearer:'BU01 华北事业部',
    saved:'2026-10-22 14:20', submitted:'2026-10-22 10:00', approvedAt:'2026-10-22 13:40', confirmedAt:'', stoppedAt:'',
    pushTo:'huwz@zhishi.com（业务对接人）', mailAt:'2026-10-22 14:22',
    progress:null
  },
  {
    id:'MN-WX-202612-0053', orderNo:'SO2026100053-09', name:'岁末焕新饮品',
    state:'confirmed', platform:'微信支付', source:'BU 自投',
    bu:'BU03 华东事业部', budget:'¥120,000.00', period:'2026-12-26 ~ 2027-01-06',
    vendor:'上海智士网络科技有限公司',
    vendorContact:'胡味芝', vendorMail:'huwz@zhishi.com',
    mech:'饮品满 69 减 12', owner:'陈曦 · 13900001111',
    po:'POCN68-0000014732', subject:'市场推广费-促销费用', bearer:'BU03 华东事业部',
    saved:'2026-10-23 09:35', submitted:'2026-10-23 08:50', approvedAt:'2026-10-23 09:20', confirmedAt:'2026-10-23 09:35', stoppedAt:'',
    pushTo:'huwz@zhishi.com（业务对接人）', mailAt:'2026-10-23 09:22', confirmAt:'2026-10-23 09:35',
    progress:null
  },
  {
    id:'MN-WX-202612-0054', orderNo:'SO2026100054-10', name:'元旦早餐组合券',
    state:'configured', platform:'微信支付', source:'BU 自投',
    bu:'BU05 华南事业部', budget:'¥96,000.00', period:'2027-01-01 ~ 2027-01-15',
    vendor:'广州智曹数字技术有限公司',
    mech:'早餐组合满 39 减 8', owner:'黄伟 · 13512345678',
    po:'POCN68-0000014733', subject:'市场推广费-促销费用', bearer:'BU05 华南事业部',
    saved:'2026-10-23 15:50', submitted:'2026-10-23 11:00', approvedAt:'2026-10-23 14:10', confirmedAt:'2026-10-23 15:20', stoppedAt:'',
    pushTo:'huangwei@zhicao-tech.com（业务对接人）', mailAt:'2026-10-23 14:12', confirmAt:'2026-10-23 15:10',
    configuredAt:'2026-10-23 15:50',
    progress:null
  }
];

var PROJ_PAGE = 1, PROJ_SIZE = 15;
var PROJ_FILTER = '';

/** 按节点或状态筛选后的项目（PROJ_FILTER 可以是节点 key，也可以是状态 key） */
function projFiltered(){
  var list = (typeof projAll === 'function') ? projAll() : PROJECTS.slice();
  if(!PROJ_FILTER) return list;
  if(PROJ_STAGES[PROJ_FILTER]) return list.filter(function(p){ return projStage(p) === PROJ_FILTER; });
  return list.filter(function(p){ return p.state === PROJ_FILTER; });
}

/** 某节点 / 状态的项目数（按当前演示身份可见范围统计） */
function projCount(key){
  var list = (typeof projAll === 'function') ? projAll() : PROJECTS;
  if(!key) return list.length;
  if(PROJ_STAGES[key]) return list.filter(function(p){ return projStage(p) === key; }).length;
  return list.filter(function(p){ return p.state === key; }).length;
}

/** 筛选条目的显示名 */
function projFilterLabel(){
  if(!PROJ_FILTER) return '';
  if(PROJ_STAGES[PROJ_FILTER]) return PROJ_STAGES[PROJ_FILTER].label;
  return (PROJ_STATES[PROJ_FILTER] || {}).label || '';
}

/** 按活动 ID / 项目编号 / 项目名称查项目 */
function projByAny(key){
  if(!key) return null;
  return PROJECTS.filter(function(p){ return p.id === key || p.code === key || p.orderNo === key || p.name === key; })[0] || null;
}

/* ---------- 项目编号：年月日 + 8 位纯数字，全系统唯一 ---------- */
function projToday8(){
  var d = new Date();
  return '' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
}

/** 老数据 / 演示数据补项目编号（按创建日期 + 序号，保证唯一） */
function projEnsureCodes(){
  var used = {}, added = 0;
  (PROJECTS || []).forEach(function(p){ if(p.code) used[p.code] = 1; });
  (PROJECTS || []).forEach(function(p, i){
    if(p.code) return;
    var raw = String(p.createdAt || p.submitted || p.saved || '').slice(0, 10).replace(/\D/g, '');
    var base = /^\d{8}$/.test(raw) ? raw : '20261029';
    var n = 10000001 + i;
    var c = base + String(n);
    while(used[c]){ n++; c = base + String(n); }
    used[c] = 1;
    p.code = c;
    added++;
  });
  /* 补出来的编号落库，避免下次启动按位置重算漂移 */
  if(added && typeof mnPersist === 'function') mnPersist();
}

/** 新项目生成唯一项目编号：YYYYMMDD + 8 位数字 */
function newProjCode(){
  projEnsureCodes();
  var base = projToday8();
  var used = {};
  (PROJECTS || []).forEach(function(p){ if(p.code) used[p.code] = 1; });
  for(var i = 0; i < 300; i++){
    var c = base + String(10000000 + Math.floor(Math.random() * 90000000));
    if(!used[c]) return c;
  }
  return base + String(Date.now()).slice(-8);
}

/** 列表 / 详情 / 关联页统一展示项目编号（无编号时退回内部 ID） */
function projCodeText(id){
  var p = (typeof projByAny === 'function') ? projByAny(id) : null;
  return p ? (p.code || p.id) : (id || '');
}

function projCodeOf(p){ return p && p.code ? p.code : ''; }

/* =============================================================================
 * 批次计划（一个计划 = 一个批次 = 一张券）
 *   报批只写计划名称、券名称、机制、发券方式、活动零售商、活动商品；
 *   预算、券面额与门槛、发放数量、有效期等规则在审批通过后补充。
 *   零售商与活动商品都是多项，明细字段与「名单导入」模板一致：
 *     零售商：零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号
 *     商品：  69码或店内码 / 商品名称 / 店内码所属零售商
 * ========================================================================== */
function briefRet(ret, store, prov, city, mch){
  return { ret:ret, store:store, prov:prov, city:city, mch:mch || '' };
}
function briefSku(code, name, owner){
  return { code:code, name:name, owner:owner };
}

var PROJ_BRIEF = {
  'MN-WX-202612-0046': [
    { name:'春节礼盒主推', coupon:'春节礼盒主推', grant:'过机立减', mech:'礼盒满 199 减 30',
      ret:[ briefRet('永辉超市','永辉超市（重庆观音桥店）','重庆市','重庆','1236057802'),
            briefRet('华润万家','华润万家（深圳万象城店）','广东省','深圳','1603482917') ],
      sku:[ briefSku('6923644288221','特仑苏精选礼盒 12 盒装','永辉超市 / 华润万家') ] }
  ],
  'MN-WX-202612-0043': [
    { name:'年货节礼盒主推', coupon:'年货节礼盒主推', grant:'领券', mech:'礼盒满 129 减 20',
      ret:[ briefRet('永辉超市','永辉超市（重庆观音桥店）','重庆市','重庆','1236057802'),
            briefRet('特易购','特易购（广州天河城店）','广东省','广州','1603482917') ],
      sku:[ briefSku('6923644288221','特仑苏精选礼盒 12 盒装','永辉超市 / 特易购') ] },
    { name:'年货节常温奶承接', coupon:'年货节常温奶承接', grant:'领券', mech:'常温奶满 99 减 15',
      ret:[ briefRet('永辉超市','永辉超市（重庆观音桥店）','重庆市','重庆','1236057802'),
            briefRet('华润万家','华润万家（深圳万象城店）','广东省','深圳','1252436002') ],
      sku:[ briefSku('6923644223456','特仑苏纯牛奶 250ml×12','永辉超市 / 华润万家') ] }
  ],
  'MN-WX-202612-0044': [
    { name:'元旦常温奶满减', coupon:'元旦常温奶满减', grant:'领券', mech:'常温奶满 99 减 15',
      ret:[ briefRet('永辉超市','永辉超市（重庆观音桥店）','重庆市','重庆','1236057802'),
            briefRet('特易购','特易购（广州天河城店）','广东省','广州','1603482917') ],
      sku:[ briefSku('6923644223456','特仑苏纯牛奶 250ml×12','永辉超市 / 特易购') ] }
  ],
  'MN-WX-202612-0047': [
    { name:'暖冬饮品主推', coupon:'暖冬饮品主推', grant:'过机立减', mech:'饮品满 59 减 10',
      ret:[ briefRet('全家','上海福满家便利有限公司','上海市','上海','1252436002'),
            briefRet('罗森','上海罗森便利有限公司','上海市','上海','1603482918') ],
      sku:[ briefSku('6923644123450','蒙牛真果粒 250ml×12','全家 / 罗森') ] }
  ],
  'MN-WX-202612-0041': [
    { name:'双节满减主推', coupon:'双节满减主推', grant:'领券', mech:'常温奶满 99 减 15',
      ret:[ briefRet('永辉超市','永辉超市（重庆观音桥店）','重庆市','重庆','1236057802'),
            briefRet('特易购','特易购（广州天河城店）','广东省','广州','1603482917') ],
      sku:[ briefSku('6923644223456','特仑苏纯牛奶 250ml×12','永辉超市 / 特易购') ] },
    { name:'跨年场景承接', coupon:'跨年场景承接', grant:'领券', mech:'常温奶满 99 减 15',
      ret:[ briefRet('永辉超市','永辉超市（重庆观音桥店）','重庆市','重庆','1236057802'),
            briefRet('特易购','特易购（广州天河城店）','广东省','广州','1603482917') ],
      sku:[ briefSku('6923644223456','特仑苏纯牛奶 250ml×12','永辉超市 / 特易购') ] },
    { name:'高端礼盒拉新', coupon:'高端礼盒拉新', grant:'领券', mech:'高端礼盒满 129 减 20',
      ret:[ briefRet('盒马鲜生','盒马鲜生（杭州西湖银泰店）','浙江省','杭州','1457820366') ],
      sku:[ briefSku('6923644288221','特仑苏精选礼盒 12 盒装','盒马鲜生') ] }
  ],
  'MN-WX-202612-0039': [
    { name:'早餐场景主推', coupon:'早餐场景主推', grant:'过机立减', mech:'早餐组合满 39 减 8',
      ret:[ briefRet('钱大妈','钱大妈（广州天河店）','广东省','广州',''),
            briefRet('美宜佳','美宜佳（深圳南山店）','广东省','深圳','') ],
      sku:[ briefSku('6923644123450','蒙牛真果粒 250ml×12','钱大妈 / 美宜佳') ] }
  ],
  'MN-WX-202612-0054': [
    { name:'元旦早餐组合', coupon:'元旦早餐组合', grant:'领券', mech:'早餐组合满 39 减 8',
      ret:[ briefRet('永辉超市','永辉超市（重庆观音桥店）','重庆市','重庆','1236057802') ],
      sku:[ briefSku('6923644223456','特仑苏纯牛奶 250ml×12','永辉超市') ] }
  ],
  'MN-WX-202611-0028': [
    { name:'冰品联合促销', coupon:'冰品联合促销', grant:'领券', mech:'冰品满 49 减 8',
      ret:[ briefRet('武汉中百','中百仓储（武汉光谷店）','湖北省','武汉',''),
            briefRet('Today 便利店','Today（武汉江汉路店）','湖北省','武汉','') ],
      sku:[ briefSku('6923644567890','蒙牛随变冰淇淋','武汉中百 / Today') ] }
  ]
};

/** 零售商 / 商品明细的展示摘要（列表里只给「前 2 项 等 N 项」） */
function briefSummary(arr, kind){
  var list = arr || [];
  var names;
  if(kind === 'ret'){
    names = list.map(function(x){ return x.ret || x.store; }).filter(function(x){ return !!x; });
  } else {
    /* 同一个店内码可能对应多个零售商（多行），摘要里带上零售商才好区分 */
    var rows = list.filter(function(x){ return !!(x.name || x.code); });
    var cnt = {};
    rows.forEach(function(x){ var n = x.name || x.code; cnt[n] = (cnt[n] || 0) + 1; });
    names = rows.map(function(x){
      var n = x.name || x.code;
      return (cnt[n] > 1 && x.owner) ? (n + '（' + x.owner + '）') : n;
    });
  }
  if(!names.length) return { txt:'', n:0 };
  var head = names.slice(0, 2).join('、');
  return { txt: names.length > 2 ? head + ' 等 ' + names.length + ' 项' : head, n: names.length };
}


/** 明细的单元格文本：前 2 项 + 数量 */
function briefCellTxt(arr, kind){
  var s = briefSummary(arr, kind);
  if(!s.n) return '<span class="mut">—</span>';
  return pnEsc(s.txt) + '（' + s.n + (kind === 'ret' ? ' 家' : ' 个') + '）';
}

PROJECTS.forEach(function(p){ p.planBrief = PROJ_BRIEF[p.id] || []; });


/* ---------- 模型扩展：版本 / 审批快照 / 驳回留痕 ---------- */
PROJECTS.forEach(function(p){
  if(p.version == null) p.version = 1;
  if(p.rejectLog == null) p.rejectLog = [];
  if(p.snapshot === undefined) p.snapshot = null;
});

/* 执行中的项目补一份审批快照，用于「补参页顶部只读方案」 */
(function(){
  var proj = PROJECTS.filter(function(x){ return x.id === 'MN-WX-202612-0041'; })[0];
  if(!proj) return;
  proj.snapshot = {
    version: 1,
    at: '2026-10-18 15:10',
    project: { name:proj.name, budget:proj.budget, vendor:proj.vendor },
    plans: (proj.planBrief || []).map(function(b){
      var hit = (window.PLANS || []).filter(function(x){ return x.name === b.name; })[0] || {};
      return { id:hit.id || '', name:b.name, mech:b.mech, s:hit.s || '', e:hit.e || '', budget:hit.budget || 0 };
    })
  };
})();

/* =============================================================================
 * 演示数据补全：项目目标、服务商对接联系人 / 邮箱
 *   创建页只填服务商时联系人自动带出，列表与详情按同一口径展示
 * ========================================================================== */
PROJECTS.forEach(function(p){
  if(!p.goal) p.goal = '拉新 + 复购';
  if(!p.vendorContact || !p.vendorMail){
    var v = (typeof vendorByName === 'function') ? vendorByName(p.vendor) : null;
    if(v && v.cms && v.cms[0]){
      if(!p.vendorContact) p.vendorContact = v.cms[0].n;
      if(!p.vendorMail)    p.vendorMail    = v.cms[0].e;
    }
  }
});

/* =============================================================================
 * V7.2 人员与商户号：活动创建人 / 活动负责人（1 人）/ 项目审批人（N 人）/ 归属商户号
 *   · 三个角色都来自通讯录，创建项目时勾选
 *   · 数据边界：创建人、审批人、负责人可见对应活动（见 projVisible）
 * ========================================================================== */
var PROJ_PEOPLE = {
  'MN-WX-202612-0046': { creator:'U-01', owner:'U-04', approvers:['U-02','U-08'] },
  'MN-WX-202612-0043': { creator:'U-01', owner:'U-03', approvers:['U-02','U-09'] },
  'MN-WX-202612-0044': { creator:'U-01', owner:'U-03', approvers:['U-02'] },
  'MN-WX-202612-0047': { creator:'U-05', owner:'U-11', approvers:['U-02'] },
  'MN-WX-202612-0041': { creator:'U-01', owner:'U-01', approvers:['U-02','U-08'] },
  'MN-WX-202612-0039': { creator:'U-12', owner:'U-12', approvers:['U-02'] },
  'MN-WX-202611-0028': { creator:'U-13', owner:'U-13', approvers:['U-02'] },
  'MN-WX-202612-0051': { creator:'U-04', owner:'U-04', approvers:['U-02','U-08'] },
  'MN-WX-202612-0052': { creator:'U-01', owner:'U-03', approvers:['U-02'] },
  'MN-WX-202612-0053': { creator:'U-11', owner:'U-11', approvers:['U-02'] },
  'MN-WX-202612-0054': { creator:'U-12', owner:'U-12', approvers:['U-02','U-09'] }
};

/* 审批人结果与意见：BPM 回写；未列出的项目按状态给出兜底 */
var PROJ_APPROVAL_DETAIL = {
  'MN-WX-202612-0043': {
    'U-02': { result:'审批中', at:'2026-10-19 14:20', note:'' },
    'U-09': { result:'审批中', at:'2026-10-19 14:20', note:'' }
  },
  'MN-WX-202612-0041': {
    'U-02': { result:'通过', at:'2026-10-18 15:10', note:'预算与活动方案已核对，同意执行。' },
    'U-08': { result:'通过', at:'2026-10-18 15:08', note:'预算额度充足，费用科目无误。' }
  },
  'MN-WX-202612-0051': {
    'U-02': { result:'未通过', at:'2026-10-21 10:05', note:'预算单剩余额度不足，退回调整计划金额后再报。' },
    'U-08': { result:'通过', at:'2026-10-21 10:02', note:'费用科目与承担主体无误。' }
  },
  'MN-WX-202612-0054': {
    'U-02': { result:'通过', at:'2026-10-23 14:10', note:'活动方案与预算已确认，同意推送。' },
    'U-09': { result:'通过', at:'2026-10-23 14:12', note:'挂券配置与门店范围无异议。' }
  }
};

PROJECTS.forEach(function(p){
  var m = PROJ_PEOPLE[p.id];
  if(!m) return;
  var cr = (typeof contactById === 'function') ? contactById(m.creator) : null;
  var ow = (typeof contactById === 'function') ? contactById(m.owner) : null;
  if(cr) p.creator = { id:cr.id, name:cr.name, dept:cr.dept, phone:cr.phone };
  if(ow) p.ownerUser = { id:ow.id, name:ow.name, dept:ow.dept, phone:ow.phone };
  p.approvers = (m.approvers || []).map(function(id){
    var c = (typeof contactById === 'function') ? contactById(id) : null;
    return c ? { id:c.id, name:c.name, dept:c.dept, title:c.title } : null;
  }).filter(Boolean);
  if(!p.vendorMch && typeof vendorMch === 'function') p.vendorMch = vendorMch(p.vendor);
  if(!p.approvalNote) p.approvalNote = '';
});

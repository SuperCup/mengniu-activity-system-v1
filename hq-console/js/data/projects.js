/* =============================================================================
 * data/projects.js — 项目主数据 + 状态定义
 * 说明：
 *   · 项目列表、项目详情、项目审批三处共用本文件，字段只改一处
 *   · 状态流转见 components/flow-drawer.js（项目管理页「状态流转与执行动作」）
 *   · 「保存时间」用于卡片左下角；各状态时间用于详情时间线
 * ========================================================================== */

/* ---------- 状态定义：label 与颜色集中在此，页面不再各写一套 ---------- */
var PROJ_STATES = {
  draft:    { key:'draft',    label:'草稿',          cls:'tg-n' },
  pending:  { key:'pending',  label:'待审批',        cls:'tg-t' },
  approved: { key:'approved', label:'待推送服务商',  cls:'tg-t' },
  confirmed:{ key:'confirmed',label:'待服务商确认',  cls:'tg-a' },
  running:  { key:'running',  label:'执行中',        cls:'tg-g' },
  stopped:  { key:'stopped',  label:'已终止',        cls:'tg-r' }
};

/* 顶部状态筛选顺序（与状态流转一致） */
var PROJ_STATE_ORDER = ['draft','pending','approved','confirmed','running','stopped'];

/* ---------- 项目主数据 ---------- */
var PROJECTS = [
  {
    id:'MN-WX-202612-0046', orderNo:'SO2026100046-01', name:'春节礼盒预售',
    state:'draft', platform:'微信支付', source:'BU 自投',
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
    state:'pending', platform:'微信支付', source:'BU 自投',
    bu:'BU01 华北事业部', budget:'¥125,000.00', period:'2026-12-28 ~ 2027-01-10',
    vendor:'智选数字技术（广州）股份有限公司北京分公司',
    mech:'礼盒满 129 减 20', owner:'赵琳 · 13611112222',
    po:'POCN68-0000014708', subject:'市场推广费-促销费用', bearer:'BU01 华北事业部',
    saved:'2026-10-19 14:20', submitted:'2026-10-19 14:20', approvedAt:'', confirmedAt:'', stoppedAt:'',
    progress:null,
    approver:'数字化中心 · 张明（第 1 级）'
  },
  {
    id:'MN-WX-202612-0044', orderNo:'SO2026100040-03', name:'元旦乳品满减',
    state:'approved', platform:'微信支付', source:'BU 自投',
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
    state:'confirmed', platform:'微信支付', source:'集团统投',
    bu:'BU03 华东事业部', budget:'¥260,000.00', period:'2026-12-28 ~ 2027-01-10',
    vendor:'上海智士网络科技有限公司',
    vendorContact:'胡味芝', vendorMail:'huwz@zhishi.com',
    mech:'饮品满 59 减 10', owner:'陈曦 · 13900001111',
    po:'POCN68-0000014715', subject:'市场推广费-促销费用', bearer:'BU03 华东事业部',
    saved:'2026-10-17 10:12', submitted:'2026-10-16 16:40', approvedAt:'2026-10-17 09:50', confirmedAt:'', stoppedAt:'',
    progress:null,
    pushTo:'huwz@zhishi.com（业务对接人）', waitText:'2 天 6 小时未确认', overdue:true
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
    progress:{ plan:4, batch:4, page:1, pageOn:1, todo:'待建页面' }
  },
  {
    id:'MN-WX-202612-0039', orderNo:'SO2026100039-05', name:'早餐场景券（12月）',
    state:'running', platform:'微信支付', source:'BU 自投',
    bu:'BU05 华南事业部', budget:'¥210,000.00', period:'2026-12-01 ~ 2026-12-31',
    vendor:'广州智曹数字技术有限公司',
    mech:'早餐组合满 39 减 8', owner:'黄伟 · 13512345678',
    po:'POCN68-0000014699', subject:'市场推广费-促销费用', bearer:'BU05 华南事业部',
    saved:'2026-10-18 16:10', submitted:'2026-10-17 11:20', approvedAt:'2026-10-18 09:30', confirmedAt:'2026-10-18 16:10', stoppedAt:'',
    progress:{ plan:0, batch:0, page:0, pageOn:0, todo:'待传计划' }
  },
  {
    id:'MN-WX-202611-0028', orderNo:'SO2026100028-06', name:'夏季冰品联合促销',
    state:'stopped', platform:'微信支付', source:'BU 自投',
    bu:'BU04 西南事业部', budget:'¥96,000.00', period:'2026-10-01 ~ 2026-10-31',
    vendor:'武汉智赢数图科技有限公司',
    mech:'冰品满 49 减 8', owner:'周涛 · 13300009999',
    po:'POCN68-0000014601', subject:'市场推广费-促销费用', bearer:'BU04 西南事业部',
    saved:'2026-10-16 09:40', submitted:'2026-10-10 09:00', approvedAt:'2026-10-11 10:20', confirmedAt:'2026-10-12 14:00', stoppedAt:'2026-10-16 09:40',
    progress:null,
    stopReason:'业务调整，KPI 口径变更', released:'预算额度 ¥96,000.00 已释放回部门池'
  }
];

var PROJ_PAGE = 1, PROJ_SIZE = 15;
var PROJ_FILTER = '';

/** 按状态筛选后的项目 */
function projFiltered(){
  if(!PROJ_FILTER) return PROJECTS.slice();
  return PROJECTS.filter(function(p){ return p.state === PROJ_FILTER; });
}

/** 某状态的项目数 */
function projCount(state){
  if(!state) return PROJECTS.length;
  return PROJECTS.filter(function(p){ return p.state === state; }).length;
}

/** 按活动 ID 或项目单号查项目 */
function projByAny(key){
  if(!key) return null;
  return PROJECTS.filter(function(p){ return p.id === key || p.orderNo === key || p.name === key; })[0] || null;
}

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
  var names = list.map(function(x){ return kind === 'ret' ? (x.ret || x.store) : (x.name || x.code); })
                  .filter(function(x){ return !!x; });
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

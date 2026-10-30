/* =============================================================================
 * data/plans.js — 批次计划数据（创建项目时填报）
 * 标黄项 2：机制、开始时间、结束时间、活动零售商、活动商品都在「创建计划」里填写。
 * 全站计划与批次共此一份数据，挂券与配置、看板均由它派生。
 * ========================================================================== */

/* ---------- 逻辑 ---------- */
var PLANS=[
  {id:'PL-01',pid:'ZS-HD-202612-A',name:'双节满减主推',mech:'常温奶满 99 减 15',
   s:'2026-12-20',e:'2026-12-27',ret:['重庆永辉超市有限公司','广东特易购商业有限公司'],sku:['特仑苏纯牛奶 250ml\u00d712'],
   budget:135000,coupon:'\u6ee1 99 \u5143\u51cf 15 \u5143',face:15,thr:99,qty:9000,limit:'\u6bcf\u4eba\u9650\u9886 2 \u5f20',valid:'2026-12-20 ~ 2026-12-27',
   bat:'23020101',bstat:'\u5df2\u5ba1\u6838',btitle:'\u53cc\u8282\u6ee1\u51cf\u4e3b\u63a8',bmech:'\u6ee199\u5143\u51cf15\u5143',
   bs:'2026-12-20',be:'2026-12-27',bchannel:'\u626b\u7801\u9886\u5238',bqty:9000,used:6320,usedAmt:94800},
  {id:'PL-02',pid:'ZS-HD-202612-B',name:'\u8de8\u5e74\u573a\u666f\u627f\u63a5',mech:'\u5e38\u6e29\u5976\u6ee1 99 \u51cf 15',
   s:'2026-12-28',e:'2027-01-05',ret:['\u91cd\u5e86\u6c38\u8f89\u8d85\u5e02\u6709\u9650\u516c\u53f8','\u5e7f\u4e1c\u7279\u6613\u8d2d\u5546\u4e1a\u6709\u9650\u516c\u53f8'],sku:['\u7279\u4ed1\u82cf\u7eaf\u725b\u5976 250ml\u00d712'],
   budget:105000,coupon:'\u6ee1 99 \u5143\u51cf 15 \u5143',face:15,thr:99,qty:7000,limit:'\u6bcf\u4eba\u9650\u9886 2 \u5f20',valid:'2026-12-28 ~ 2027-01-05',
   bat:'23020102',bstat:'\u5df2\u5ba1\u6838',btitle:'\u8de8\u5e74\u573a\u666f\u627f\u63a5',bmech:'\u6ee199\u5143\u51cf15\u5143',
   bs:'2026-12-28',be:'2027-01-05',bchannel:'\u626b\u7801\u9886\u5238',bqty:7000,used:3610,usedAmt:54150},
  {id:'PL-03',pid:'ZS-HD-202612-C',name:'\u9ad8\u7aef\u793c\u76d2\u62c9\u65b0',mech:'\u9ad8\u7aef\u793c\u76d2\u6ee1 129 \u51cf 20',
   s:'2026-12-20',e:'2027-01-05',ret:['\u676d\u5dde\u76d2\u9a6c\u7f51\u7edc\u79d1\u6280\u6709\u9650\u516c\u53f8'],sku:['\u7279\u4ed1\u82cf / \u7cbe\u9009\u793c\u76d2'],
   budget:100000,coupon:'\u6ee1 129 \u5143\u51cf 20 \u5143',face:20,thr:129,qty:5000,limit:'\u6bcf\u4eba\u9650\u9886 1 \u5f20',valid:'2026-12-20 ~ 2027-01-05',
   bat:'23020103',bstat:'\u5df2\u5ba1\u6838',btitle:'\u9ad8\u7aef\u793c\u76d2\u62c9\u65b0',bmech:'\u6ee1129\u5143\u51cf20\u5143',
   bs:'2026-12-20',be:'2027-01-05',bchannel:'\u626b\u7801\u9886\u5238',bqty:5000,used:2498,usedAmt:49960},
  {id:'PL-09',pid:'NHJ-202612-A',proj:'MN-WX-202612-0043',projectId:'MN-WX-202612-0043',name:'年货节礼盒主推',mech:'礼盒满 129 减 20',
   s:'2026-12-28',e:'2027-01-10',ret:['杭州盒马网络科技有限公司'],sku:['特仑苏 / 精选礼盒'],
   budget:65000,coupon:'满 129 元减 20 元',face:20,thr:129,qty:3250,limit:'每人限领 1 张',valid:'2026-12-28 ~ 2027-01-10',type:'voucher'},
  {id:'PL-10',pid:'NHJ-202612-B',proj:'MN-WX-202612-0043',projectId:'MN-WX-202612-0043',name:'年货节常温奶加推',mech:'常温奶满 99 减 15',
   s:'2026-12-28',e:'2027-01-10',ret:['重庆永辉超市有限公司'],sku:['特仑苏纯牛奶 250ml×12'],
   budget:60000,coupon:'满 99 元减 15 元',face:15,thr:99,qty:4000,limit:'每人限领 2 张',valid:'2026-12-28 ~ 2027-01-10',type:'voucher'},
  {id:'PL-11',pid:'YD-202612-A',proj:'MN-WX-202612-0044',projectId:'MN-WX-202612-0044',name:'元旦跨年满减',mech:'常温奶满 99 减 15',
   s:'2026-12-28',e:'2027-01-10',ret:['重庆永辉超市有限公司'],sku:['特仑苏纯牛奶 250ml×12'],
   budget:105000,coupon:'满 99 元减 15 元',face:15,thr:99,qty:7000,limit:'每人限领 2 张',valid:'2026-12-28 ~ 2027-01-10',type:'voucher'},
  {id:'PL-12',pid:'SD-202612-A',proj:'MN-WX-202612-0051',projectId:'MN-WX-202612-0051',name:'圣诞礼盒预热',mech:'礼盒满 159 减 25',
   s:'2026-12-15',e:'2026-12-25',ret:['杭州盒马网络科技有限公司'],sku:['特仑苏 / 精选礼盒'],
   budget:88000,coupon:'满 159 元减 25 元',face:25,thr:159,qty:3520,limit:'每人限领 1 张',valid:'2026-12-15 ~ 2026-12-25',type:'voucher'},
  {id:'PL-13',pid:'JG-202612-A',proj:'MN-WX-202612-0052',projectId:'MN-WX-202612-0052',name:'坚果礼盒年货',mech:'坚果礼盒满 129 减 20',
   s:'2027-01-05',e:'2027-01-20',ret:['重庆永辉超市有限公司'],sku:['特仑苏纯牛奶 250ml×12'],
   budget:150000,coupon:'满 129 元减 20 元',face:20,thr:129,qty:7500,limit:'每人限领 2 张',valid:'2027-01-05 ~ 2027-01-20',type:'voucher'},
  {id:'PL-14',pid:'SM-202612-A',proj:'MN-WX-202612-0053',projectId:'MN-WX-202612-0053',name:'岁末饮品焕新',mech:'饮品满 69 减 12',
   s:'2026-12-26',e:'2027-01-06',ret:['重庆永辉超市有限公司'],sku:['特仑苏纯牛奶 250ml×12'],
   budget:120000,coupon:'满 69 元减 12 元',face:12,thr:69,qty:10000,limit:'每人限领 2 张',valid:'2026-12-26 ~ 2027-01-06',type:'voucher'},
  {id:'PL-15',pid:'YD-202701-A',proj:'MN-WX-202612-0054',projectId:'MN-WX-202612-0054',name:'元旦早餐组合',mech:'早餐组合满 39 减 8',
   s:'2027-01-01',e:'2027-01-15',ret:['重庆永辉超市有限公司'],sku:['特仑苏纯牛奶 250ml×12'],
   budget:96000,coupon:'满 39 元减 8 元',face:8,thr:39,qty:12000,limit:'每人限领 3 张',valid:'2027-01-01 ~ 2027-01-15',type:'voucher',
   bat:'23020115',bstat:'已审核',btitle:'元旦早餐组合',bmech:'满39元减8元',
   bs:'2027-01-01',be:'2027-01-15',bchannel:'扫码领券',bqty:12000,used:0,usedAmt:0},
  {id:'PL-16',pid:'NW-202612-A',proj:'MN-WX-202612-0047',projectId:'MN-WX-202612-0047',name:'暖冬饮品主推',mech:'饮品满 59 减 10',
   s:'2026-12-28',e:'2027-01-10',ret:['上海福满家便利有限公司'],sku:['蒙牛真果粒 250ml×12'],
   budget:260000,coupon:'满 59 元减 10 元',face:10,thr:59,qty:26000,limit:'每人限领 2 张',valid:'2026-12-28 ~ 2027-01-10',type:'voucher',
   bat:'23020110',bstat:'已审核',btitle:'暖冬饮品主推',bmech:'满59元减10元',
   bs:'2026-12-28',be:'2027-01-10',bchannel:'扫码领券',bqty:26000,used:0,usedAmt:0},
  {id:'PL-17',pid:'ZC-202612-A',proj:'MN-WX-202612-0039',projectId:'MN-WX-202612-0039',name:'早餐场景券',mech:'早餐满 29 减 5',
   s:'2026-12-01',e:'2026-12-31',ret:['重庆永辉超市有限公司'],sku:['蒙牛早餐奶 250ml×24'],
   budget:210000,coupon:'满 29 元减 5 元',face:5,thr:29,qty:42000,limit:'每人限领 1 张',valid:'2026-12-01 ~ 2026-12-31',type:'voucher',
   bat:'23020105',bstat:'已审核',btitle:'早餐场景券',bmech:'满29元减5元',
   bs:'2026-12-01',be:'2026-12-31',bchannel:'扫码领券',bqty:42000,used:120,usedAmt:600}
];

var PLAN_PAGE=1, PLAN_SIZE=15;

/* ============================================================
   计划与批次（1 : 1）
   - 计划是唯一记录，批次挂在计划下，一个计划最多一个批次
   - 数据源统一为 PLANS：项目创建页 / 审批页 / 计划与批次页同源
   ============================================================ */

/* 批次与计划的对应校验 */

/* ============================================================
   导入明细的初始值
   一期零售商 / 门店与商品改为「导入名单」录入（标黄项 10 / 11），
   因此每个计划都带 retRows / skuRows（与导入结果同结构）。
   已存在则不覆盖，保证页面刷新与二次编辑口径一致。
   ============================================================ */
var RET_SEED = {
  '重庆永辉超市有限公司': { sid:'MD000001', ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802', lng:106.5330, lat:29.5710 },
  '广东特易购商业有限公司': { sid:'MD000101', ret:'特易购', store:'特易购（广州天河城店）', prov:'广东省', city:'广州', mch:'1603482917', lng:113.3240, lat:23.1350 },
  '杭州盒马网络科技有限公司': { sid:'MD000102', ret:'盒马鲜生', store:'盒马鲜生（杭州西湖银泰店）', prov:'浙江省', city:'杭州', mch:'1457820366', lng:120.1690, lat:30.2560 }
};

var SKU_SEED = {
  '特仑苏纯牛奶 250ml×12': { code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', inCode:'', owner:'永辉超市' },
  '特仑苏 / 精选礼盒': { code:'', name:'特仑苏精选礼盒 12 盒装', inCode:'HM-77120', owner:'盒马鲜生' }
};

PLANS.forEach(function(p){
  if(!p.retRows){
    p.retRows = (p.ret || []).map(function(n){
      var s = RET_SEED[n] || {};
      return { sid:s.sid || '', ret:s.ret || n, store:s.store || n, prov:s.prov || '—', city:s.city || '—', mch:s.mch || '', lng:s.lng != null ? s.lng : null, lat:s.lat != null ? s.lat : null };
    });
  }
  if(!p.skuRows){
    p.skuRows = (p.sku || []).map(function(n){
      var s = SKU_SEED[n] || {};
      return { code:s.code || '', name:s.name || n, inCode:s.inCode || '', owner:s.owner || '' };
    });
  }
  if(p.bat){
    if(p.bqty == null) p.bqty = p.qty;
    if(p.used == null) p.used = 0;
    if(p.usedAmt == null) p.usedAmt = 0;
  }
});

/* 计划归属的项目（用于「计划与批次」按项目看） */
PLANS.forEach(function(x){ if(!x.proj) x.proj = 'MN-WX-202612-0041'; });

/* ---------- 模型扩展：活动类型 / 执行配置 / 配置状态 / 版本 ---------- */
PLANS.forEach(function(p){
  if(!p.projectId) p.projectId = p.proj || 'MN-WX-202612-0041';
  if(!p.proj) p.proj = p.projectId;
  if(p.version == null) p.version = 1;
  if(p.assignee == null) p.assignee = '李雪';
  if(p.configState == null) p.configState = 'todo';
  if(p.type == null) p.type = 'voucher';
});

/* 同一项目下三种不同类型的计划，便于验证按类型显字段 */
PLANS[0].type = 'voucher';
PLANS[1].type = 'fixed';
PLANS[2].type = 'discount';

/* 审批通过后补的执行配置示例：01 待补一项、02 已完整、03 待补一项 */
PLANS[0].exec = { name:'双节满减主推', mch:'1603482917', fund:'预充值', face:15, thr:99,
  pay:'微信支付', skuLimit:'指定商品', qty:9000, perLimit:2, risk:'关闭',
  notice:'每人限领 2 张，领取后 7 天内有效', savedAt:'2026-10-19 15:30' };
PLANS[1].exec = { name:'跨年场景承接', fund:'免充值', face:15, thr:99,
  pay:'微信支付', skuLimit:'不限商品', qty:7000, perJoin:1, risk:'关闭',
  notice:'活动期间每人参与 1 次，先到先得', mchAuth:'已核验', svc:'服务商已确认',
  savedAt:'2026-10-19 16:02' };
PLANS[2].exec = { name:'高端礼盒拉新', fund:'预充值', discount:8.5, cap:20, thr:129,
  pay:'微信支付', skuLimit:'指定商品', qty:5000, perJoin:1,
  notice:'折扣不与其他优惠叠加', savedAt:'2026-10-19 16:20' };


/* 计划归属与券信息：0044 下 4 个计划 = 4 个批次（一个计划对应一个批次） */
PLANS.forEach(function(x){
  if(x.id === 'PL-01' || x.id === 'PL-02' || x.id === 'PL-03'){
    x.projectId = 'MN-WX-202612-0041';
    x.proj = 'MN-WX-202612-0041';
  }
  if(x.id === 'PL-04'){
    x.projectId = 'MN-WX-202612-0044';
    x.proj = 'MN-WX-202612-0044';
  }
  if(x.coupon == null) x.coupon = '';
  if(!x.grant) x.grant = '领券';
});
PLANS[0].coupon = '双节常温奶满减券';
PLANS[1].coupon = '跨年常温奶满减券';
PLANS[2].coupon = '礼盒满减券';
PLANS[2].grant  = '过机立减';


/* ---------- 已批准但未补配置的示例（0044 元旦乳品满减） ---------- */
PLANS[0].exec.mchAuth = '已核验';
PLANS[2].exec.mchAuth = '已核验';

PLANS.push({
  id:'PL-04', pid:'ZS-HD-202612-D',
  projectId:'MN-WX-202612-0044', proj:'MN-WX-202612-0044',
  name:'元旦常温奶满减', mech:'常温奶满 99 减 15', mechType:'满减', bat:'',
  s:'2026-12-28', e:'2027-01-05',
  ret:['重庆永辉超市有限公司'], sku:['特仑苏纯牛奶 250ml×12'],
  budget:0, coupon:'', face:15, thr:99, qty:0, limit:'', valid:'',
  retRows:[{ ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802' }],
  skuRows:[{ code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', owner:'永辉超市' }],
  type:'voucher', exec:null, configState:'todo',
  assignee:'李雪', version:1, updatedAt:'2026-10-20 09:00',
  bstat:'', bqty:0, used:0, usedAmt:0
});

/* 同项目多条待完善，用来验证配置工作台：左侧切换、上一份对照、下一份 */
window.DEMO_TODO_PLANS = [
  { id:'PL-05', pid:'ZS-HD-202612-E', projectId:'MN-WX-202612-0044', proj:'MN-WX-202612-0044',
    name:'元旦饮品满减', mech:'饮品满 59 减 10', mechType:'满减', bat:'',
    s:'2026-12-28', e:'2027-01-08', face:10, thr:59, qty:0, budget:0, coupon:'',
    retRows:[{ ret:'全家', store:'全家（南京西路店）', prov:'上海', city:'上海', mch:'1252436002' }],
    skuRows:[{ code:'6923644123450', name:'蒙牛真果粒 250ml×12', owner:'全家' }],
    type:'voucher', exec:null, configState:'todo', assignee:'李雪', version:1, updatedAt:'2026-10-20 09:10', bstat:'', bqty:0, used:0, usedAmt:0 },
  { id:'PL-06', pid:'ZS-HD-202612-F', projectId:'MN-WX-202612-0044', proj:'MN-WX-202612-0044',
    name:'元旦礼盒满减', mech:'礼盒满 199 减 30', mechType:'满减', bat:'',
    s:'2026-12-30', e:'2027-01-10', face:30, thr:199, qty:0, budget:0, coupon:'',
    retRows:[{ ret:'盒马鲜生', store:'盒马鲜生（杭州西湖银泰店）', prov:'浙江', city:'杭州', mch:'1457820366' }],
    skuRows:[{ code:'6923644288221', name:'特仑苏精选礼盒 12 盒装', owner:'盒马鲜生' }],
    type:'voucher', exec:null, configState:'todo', assignee:'李雪', version:1, updatedAt:'2026-10-20 09:20', bstat:'', bqty:0, used:0, usedAmt:0 },
  { id:'PL-07', pid:'ZS-HD-202612-G', projectId:'MN-WX-202612-0044', proj:'MN-WX-202612-0044',
    name:'元旦 1 元乐享', mech:'减至 1 元', mechType:'减至', bat:'',
    s:'2027-01-01', e:'2027-01-10', face:1, thr:0, maxPrice:15, qty:0, budget:0, coupon:'',
    retRows:[{ ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆', city:'重庆', mch:'1236057802' }],
    skuRows:[{ code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', owner:'永辉超市' }],
    type:'voucher', exec:null, configState:'todo', assignee:'李雪', version:1, updatedAt:'2026-10-20 09:30', bstat:'', bqty:0, used:0, usedAmt:0 },
  { id:'PL-08', pid:'ZS-HD-202612-H', projectId:'MN-WX-202612-0044', proj:'MN-WX-202612-0044',
    name:'元旦尝鲜价', mech:'减至 0.1 元', mechType:'减至', bat:'',
    s:'2027-01-02', e:'2027-01-10', face:0.1, thr:0, maxPrice:12, qty:0, budget:0, coupon:'',
    retRows:[{ ret:'特易购', store:'特易购（广州天河城店）', prov:'广东', city:'广州', mch:'1603482917' }],
    skuRows:[{ code:'', name:'特仑苏 / 精选礼盒', inCode:'SPU-2318', owner:'特易购' }],
    type:'voucher', exec:null, configState:'todo', assignee:'李雪', version:1, updatedAt:'2026-10-20 09:40', bstat:'', bqty:0, used:0, usedAmt:0 }
];
window.DEMO_TODO_PLANS.forEach(function(p){ PLANS.push(p); });

/* =============================================================================
 * 已有批次的计划补一份批次信息表单（与「补充批次信息」页保存的结构一致）
 * ========================================================================== */
PLANS.forEach(function(p){
  if(p.batchForm || !p.bat || !p.bs || !p.be) return;
  p.batchForm = {
    name: p.btitle || p.coupon || p.name,
    face: p.face, thr: p.thr,
    start: p.bs, end: p.be,
    cap: p.bqty || p.qty || 0,
    user: 2,
    desc: '限指定商品使用，不可兑换现金，可在微信支付卡包查看。',
    batNo: p.bat
  };
});
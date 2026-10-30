/* =============================================================================
 * core/readiness.js — 计划类型 + 「批次信息是否补齐」的计算
 * 设计要点：
 *   · 报批阶段只填业务方案；审批通过后到「计划与批次」点「补充配置」，
 *     在「补充批次信息」页填写对齐微信支付后台的批次字段
 *   · 就绪状态由批次字段实时推导（缺失项列表），不存百分比
 *   · 零售商 / 商品明细来自报批时导入或计划明细，纳入校验
 * ========================================================================== */
window.MT = window.MT || {};

/* ---------- 微信产品类型（一期支持四种全场类型） ---------- */
var PLAN_TYPES = {
  voucher: { key:'voucher',  name:'全场代金券（固定面额）', short:'代金券',   needCouponPage:true  },
  fixed:   { key:'fixed',    name:'全场定额立减',           short:'定额立减', needCouponPage:false },
  random:  { key:'random',   name:'全场随机立减',           short:'随机立减', needCouponPage:false },
  discount:{ key:'discount', name:'全场折扣',               short:'折扣',     needCouponPage:false }
};
var PLAN_TYPE_ORDER = ['voucher','fixed','random','discount'];

function planTypeMeta(t){ return PLAN_TYPES[t] || PLAN_TYPES.voucher; }
function planType(p){ return (p && PLAN_TYPES[p.type]) ? p.type : 'voucher'; }

/** 批次信息表单（补充批次信息页保存的对象） */
function planBat(p){ return (p && p.batchForm) || {}; }
function planBatFilled(p){
  var b = planBat(p);
  return !!(p && p.batchForm && (b.name || b.face != null || b.start));
}

/* ---------- 字段 schema（与「补充批次信息」页一致） ---------- */
function planFieldGroups(p){
  return [
    { k:'base', name:'券与优惠', fields:[
      { k:'name', label:'券名称',        req:true,  kind:'text' },
      { k:'face', label:'券面额（元）',  req:true,  kind:'num',  min:0.01 },
      { k:'thr',  label:'使用门槛（元）', req:true,  kind:'num',  min:0 }
    ]},
    { k:'time', name:'可用时间', fields:[
      { k:'start', label:'可用开始日', req:true, kind:'date' },
      { k:'end',   label:'可用结束日', req:true, kind:'date' }
    ]},
    { k:'limit', name:'发放限制', fields:[
      { k:'cap',  label:'发放总上限（张）',   req:true, kind:'int', min:1 },
      { k:'user', label:'单个用户可领（张）', req:true, kind:'int', min:1 }
    ]},
    { k:'show', name:'使用须知', fields:[
      { k:'desc', label:'使用须知', req:true, kind:'text' }
    ]},
    { k:'handoff', name:'批次交接', fields:[
      { k:'batNo', label:'批次号', req:false, kind:'text' }
    ]}
  ];
}

function batFieldVal(p, k){
  var b = planBat(p);
  if(k === 'batNo') return p.bat || b.batNo || '';
  var v = b[k];
  return v == null ? '' : v;
}

function numOk(v, f){
  if(v === '' || v == null) return true;
  var n = Number(v);
  if(!isFinite(n)) return false;
  if(f.min != null && n < f.min) return false;
  if(f.kind === 'int' && Math.abs(n - Math.round(n)) > 1e-9) return false;
  return true;
}

/** 缺失 / 不合法项：驱动配置状态、项目卡片计数与推送校验 */
function planMissing(p){
  var out = [];
  if(!planBatFilled(p)){
    out.push({ group:'批次信息', k:'batchForm', label:'批次信息还没有补充（券名称、面额、门槛、可用时间、发放上限）' });
  } else {
    planFieldGroups(p).forEach(function(g){
      g.fields.forEach(function(f){
        if(!f.req) return;
        var v = batFieldVal(p, f.k);
        if(v === '' || v == null){ out.push({ group:g.name, k:f.k, label:f.label + ' 未填写' }); return; }
        if((f.kind === 'num' || f.kind === 'int') && !numOk(v, f)){
          out.push({ group:g.name, k:f.k, label:f.label + ' 不合法' });
        }
      });
    });
    var b = planBat(p);
    if(b.start && b.end && String(b.start) > String(b.end)){
      out.push({ group:'可用时间', k:'end', label:'可用结束日不能早于开始日' });
    }
  }

  var rets = (p.retRows || []).length ? p.retRows : (p.ret || []);
  if(!rets.length){
    out.push({ group:'活动范围', k:'retRows', label:'还没有零售商 / 门店明细' });
  }
  return out;
}

function planReady(p){ return planMissing(p).length === 0; }

/** 配置状态：待完善 / 完善中 / 校验通过 */
function planConfigState(p){
  var m = planMissing(p);
  if(!m.length) return { k:'ready', txt:'校验通过', cls:'tg-g' };
  return planBatFilled(p)
    ? { k:'doing', txt:'完善中', cls:'tg-a' }
    : { k:'todo',  txt:'待完善', cls:'tg-n' };
}

/** 某项目下计划的配置统计：待补配置 ready/total */
function projConfigStat(projId){
  var list = (window.PLANS || []).filter(function(p){ return (p.projectId || p.proj) === projId; });
  var ready = list.filter(function(p){ return planReady(p); }).length;
  return { total:list.length, ready:ready, todo:list.length - ready, list:list };
}

/** 当前登录人（演示）：用于「待我补充执行配置」 */
function mnCurrentUser(){
  try{
    var u = window.MN_USER;
    if(u && u.name) return u;
  }catch(e){}
  return { name:'张明', role:'biz', dept:'数字化中心' };
}

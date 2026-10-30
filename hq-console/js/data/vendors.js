/* =============================================================================
 * data/vendors.js — 服务商数据
 * 标黄项 12：「一个服务商仅一个对接联系人/邮箱」
 * 每条记录只有一组 cms（姓名 + 邮箱），项目创建时选公司自动带出。
 * ========================================================================== */

/* ---------- 逻辑 ---------- */
var VENDORS=[
  {code:'SVC-0001', name:'智选数字技术（广州）股份有限公司', mch:'1035891372',
   cms:[{n:'周敏',e:'zhoumin@zhixuan-digital.com'},{n:'赵宇',e:'zhaoyu@zhixuan-digital.com'},
        {n:'刘思远',e:'liusy@zhixuan-digital.com'}],
   remark:'集团级主服务商，承接全国总部统投项目；对账周期 T+3'},
  {code:'SVC-0002', name:'上海智士网络科技有限公司', mch:'1252436002',
   cms:[{n:'胡味芝',e:'huwz@zhishi.com'},{n:'钱磊',e:'qianlei@zhishi.com'}],
   remark:'华东区主要执行方；券码异常需 2 小时内响应'},
  {code:'SVC-0003', name:'武汉智赢数图科技有限公司', mch:'1457820366',
   cms:[{n:'李航',e:'lihang@zhiying-shutu.com'}],
   remark:'华中区执行方；支持门店物料代发'},
  {code:'SVC-0004', name:'广州智曹数字技术有限公司', mch:'1603482917',
   cms:[{n:'陈嘉明',e:'chenjm@zhicao-tech.com'},{n:'林晓彤',e:'linxt@zhicao-tech.com'}],
   remark:'华南区执行方；负责便利店渠道核销对接'},
  {code:'SVC-0005', name:'智选数字技术（广州）股份有限公司北京分公司', mch:'1035891372',
   cms:[{n:'王琳',e:'wanglin@zhixuan-digital.com'},{n:'孙皓',e:'sunhao@zhixuan-digital.com'}],
   remark:'华北区执行方；与总部共用券模板，独立结算'}
];


/** 按全称或简称找服务商（项目里有时只写了简称） */
function vendorByName(name){
  var list = window.VENDORS || [];
  if(!name) return null;
  var hit = null;
  list.forEach(function(x){
    if(hit) return;
    if(x.name === name || x.name.indexOf(name) === 0 || name.indexOf(x.name) === 0) hit = x;
  });
  return hit;
}

/* 标黄项 12：一个服务商只保留一个对接联系人，避免「取第一条」时静默丢数据 */
VENDORS.forEach(function(x){
  if(Array.isArray(x.cms) && x.cms.length > 1){
    x.cmsExtra = x.cms.slice(1);
    x.cms = [x.cms[0]];
  }
});
/** 服务商的归属商户号（选服务商时自动带出） */
function vendorMch(name){
  var v = (typeof vendorByName === 'function') ? vendorByName(name) : null;
  return v ? (v.mch || '') : '';
}

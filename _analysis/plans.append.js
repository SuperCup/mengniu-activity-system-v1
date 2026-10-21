
/* ============================================================
   导入明细的初始值
   一期零售商 / 门店与商品改为「导入名单」录入（标黄项 10 / 11），
   因此每个计划都带 retRows / skuRows（与导入结果同结构）。
   已存在则不覆盖，保证页面刷新与二次编辑口径一致。
   ============================================================ */
var RET_SEED = {
  '重庆永辉超市有限公司': { ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802' },
  '广东特易购商业有限公司': { ret:'特易购', store:'特易购（广州天河城店）', prov:'广东省', city:'广州', mch:'1603482917' },
  '杭州盒马网络科技有限公司': { ret:'盒马鲜生', store:'盒马鲜生（杭州西湖银泰店）', prov:'浙江省', city:'杭州', mch:'1457820366' }
};

var SKU_SEED = {
  '特仑苏纯牛奶 250ml×12': { code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', owner:'永辉超市 / 特易购' },
  '特仑苏 / 精选礼盒': { code:'6923644288221', name:'特仑苏精选礼盒 12 盒装', owner:'盒马鲜生' }
};

PLANS.forEach(function(p){
  if(!p.retRows){
    p.retRows = (p.ret || []).map(function(n){
      var s = RET_SEED[n] || {};
      return { ret:s.ret || n, store:s.store || n, prov:s.prov || '—', city:s.city || '—', mch:s.mch || '' };
    });
  }
  if(!p.skuRows){
    p.skuRows = (p.sku || []).map(function(n){
      var s = SKU_SEED[n] || {};
      return { code:s.code || '', name:s.name || n, owner:s.owner || '' };
    });
  }
  if(p.bat){
    if(p.bqty == null) p.bqty = p.qty;
    if(p.used == null) p.used = 0;
    if(p.usedAmt == null) p.usedAmt = 0;
  }
});

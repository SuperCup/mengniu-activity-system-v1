/* =============================================================================
 * data/products.js — 商品主数据（全平台通用）
 *   来源：活动投放过程中导入 / 手工新增；店内码所属零售商来自计划创建时维护的
 *         「内码 ↔ 零售商」对应关系，每遇到一个新名称就追加，不覆盖历史。
 *   字段：code 69码 / n 商品名称 / inCode 店内码 / rets 店内码所属零售商（数组）/
 *        spec 规格 / status 状态 / src 来源
 *   注：品牌、品类已按客户要求删除，不再维护。
 * ========================================================================== */

var SKU_DB = [
  { code:'6901234500011', n:'特仑苏纯牛奶 250ml×12',  inCode:'',        rets:[],                       spec:'250ml×12',  status:'启用', src:'导入' },
  { code:'6901234500028', n:'蒙牛纯甄酸奶 200g×12',   inCode:'',        rets:[],                       spec:'200g×12',   status:'启用', src:'导入' },
  { code:'6901234500035', n:'未来星儿童奶 190ml×12',  inCode:'',        rets:[],                       spec:'190ml×12',  status:'启用', src:'导入' },
  { code:'6901234500042', n:'纯甄果粒礼盒装 200g×10', inCode:'',        rets:[],                       spec:'200g×10',   status:'启用', src:'导入' },
  { code:'',              n:'特仑苏 / 精选礼盒',      inCode:'SPU-2318', rets:['永辉超市','特易购'],     spec:'2 款组合',  status:'启用', src:'导入' },
  { code:'',              n:'随变 / 蒂兰圣雪冰品',    inCode:'SPU-2601', rets:['华润万家','永辉超市'],   spec:'64 SKU',    status:'停用', src:'导入' }
];

/* 兼容历史数据：老版本只有 ret 字符串 */
SKU_DB.forEach(function(s){
  if(!s.rets){
    s.rets = [];
    if(s.ret) String(s.ret).split(/[、,，\/]/).forEach(function(x){ x = x.trim(); if(x) s.rets.push(x); });
  }
  delete s.ret;
  delete s.brand;
  delete s.cat;
});

/** 追加店内码所属零售商：同名不重复，新名称追加到末尾（名称不同就追加显示） */
function skuAddRet(s, name){
  if(!s || !name) return false;
  s.rets = s.rets || [];
  var n = String(name).trim();
  if(!n || s.rets.indexOf(n) >= 0) return false;
  s.rets.push(n);
  return true;
}

/** 多个零售商统一用「、」拼接展示 */
function skuRetsText(s){ return (s && s.rets ? s.rets : []).join('、'); }

/** 按 69码 / 店内码 找商品（先 69码，再店内码） */
function skuFind(code, inCode){
  var db = window.SKU_DB || [];
  if(code){ for(var i=0;i<db.length;i++){ if(db[i].code === code) return db[i]; } }
  if(inCode){ for(var j=0;j<db.length;j++){ if(db[j].inCode === inCode) return db[j]; } }
  return null;
}

/* 计划数据（创建时填写） */

var PN_SKU_PRESET=[
  {n:'特仑苏 / 精选礼盒', c:'SPU-2318', p:'¥128.00', q:'3,200'},
  {n:'蒙牛纯甄酸奶 200g', c:'SKU-230512', p:'¥4.80', q:'6,000'},
  {n:'未来星儿童奶 190ml', c:'SKU-230708', p:'¥3.60', q:'4,500'},
  {n:'纯甄果粒礼盒装', c:'SPU-2415', p:'¥88.00', q:'2,000'},
  {n:'特仑苏纯牛奶 250ml×12', c:'SKU-230101', p:'¥68.00', q:'5,600'},
  {n:'随变 / 蒂兰圣雪冰品', c:'SPU-2601', p:'¥3.80', q:'2,400'}
];

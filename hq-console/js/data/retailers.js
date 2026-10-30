/* =============================================================================
 * data/retailers.js — 门店与商户号主数据（全平台通用）
 *   一个零售商可有多个门店；一个门店对应一个微信商户号。
 *   来源：活动投放过程中导入 / 手工新增；旧门店库不迁移，以本平台真实投放数据为准。
 *   字段：sid 门店编码 / ret 零售商 / name 门店名称 / prov 省份 / city 城市
 *        mch 微信商户号 / lng 经度 / lat 纬度 / status 状态 / src 来源
 * ========================================================================== */

var RET_DB = [
  { sid:'MD000001', ret:'永辉',     name:'永辉超市（观音桥店）',        prov:'重庆', city:'重庆', mch:'1236057802', lng:106.5516, lat:29.5630, status:'启用', src:'导入' },
  { sid:'MD000002', ret:'娇兰佳人', name:'娇兰佳人（江汉路店）',        prov:'湖北', city:'武汉', mch:'1454028602', lng:114.2955, lat:30.5890, status:'启用', src:'导入' },
  { sid:'MD000003', ret:'娇兰佳人', name:'娇兰佳人（汉阳摩尔城店）',    prov:'湖北', city:'武汉', mch:'1461722002', lng:114.2180, lat:30.5540, status:'启用', src:'导入' },
  { sid:'MD000004', ret:'舞东风',   name:'舞东风超市（春熙路店）',      prov:'四川', city:'成都', mch:'1491611462', lng:104.0810, lat:30.6580, status:'启用', src:'导入' },
  { sid:'MD000005', ret:'壹加壹',   name:'壹加壹（中山石岐店）',        prov:'广东', city:'中山', mch:'1500278692', lng:113.3926, lat:22.5170, status:'启用', src:'导入' },
  { sid:'MD000006', ret:'壹加壹',   name:'壹加壹（中山小榄店）',        prov:'广东', city:'中山', mch:'1500279152', lng:113.2470, lat:22.6710, status:'启用', src:'导入' },
  { sid:'MD000007', ret:'精明购',   name:'精明购（深圳南山店）',        prov:'广东', city:'深圳', mch:'1493487682', lng:113.9300, lat:22.5330, status:'启用', src:'导入' },
  { sid:'MD000008', ret:'华润万家', name:'华润万家（广州天河店）',      prov:'广东', city:'广州', mch:'1246429601', lng:113.3610, lat:23.1350, status:'启用', src:'导入' },
  { sid:'MD000009', ret:'华润万家', name:'华润万家（佛山顺德店）',      prov:'广东', city:'佛山', mch:'1246444301', lng:113.2930, lat:22.8050, status:'启用', src:'导入' },
  { sid:'MD000010', ret:'华润万家', name:'华润万家（中山东区店）',      prov:'广东', city:'中山', mch:'1246552201', lng:113.4100, lat:22.5260, status:'启用', src:'导入' },
  { sid:'MD000011', ret:'华润万家', name:'华润万家（南宁青秀店）',      prov:'广西', city:'南宁', mch:'1246565301', lng:108.3665, lat:22.8170, status:'启用', src:'导入' },
  { sid:'MD000012', ret:'华润万家', name:'华润万家（珠海吉大店）',      prov:'广东', city:'珠海', mch:'1246568101', lng:113.5760, lat:22.2710, status:'启用', src:'导入' },
  { sid:'MD000013', ret:'华润万家', name:'华润万家（江门蓬江店）',      prov:'广东', city:'江门', mch:'1246642801', lng:113.0815, lat:22.5780, status:'启用', src:'导入' },
  { sid:'MD000014', ret:'华润万家', name:'华润万家（深圳福田店）',      prov:'广东', city:'深圳', mch:'1247444201', lng:114.0550, lat:22.5390, status:'启用', src:'导入' },
  { sid:'MD000015', ret:'华润万家', name:'华润万家（东莞厚街店）',      prov:'广东', city:'东莞', mch:'1247453101', lng:113.6710, lat:22.9360, status:'启用', src:'导入' },
  { sid:'MD000016', ret:'苏果超市', name:'苏果超市（南京新街口店）',    prov:'江苏', city:'南京', mch:'1251328801', lng:118.7780, lat:32.0410, status:'启用', src:'导入' },
  { sid:'MD000017', ret:'全家便利', name:'全家便利（上海静安店）',      prov:'上海', city:'上海', mch:'1252436002', lng:121.4470, lat:31.2290, status:'启用', src:'导入' },
  { sid:'MD000018', ret:'物美',     name:'物美超市（北京朝阳店）',      prov:'北京', city:'北京', mch:'1253041102', lng:116.4860, lat:39.9210, status:'启用', src:'导入' },
  { sid:'MD000019', ret:'物美',     name:'物美便利（天津和平店）',      prov:'天津', city:'天津', mch:'1253041305', lng:117.2010, lat:39.1170, status:'启用', src:'导入' },
  { sid:'MD000020', ret:'盒马',     name:'盒马鲜生（杭州西湖店）',      prov:'浙江', city:'杭州', mch:'1254189203', lng:120.1300, lat:30.2590, status:'启用', src:'导入' },
  { sid:'MD000021', ret:'钱大妈',   name:'钱大妈（昆明五华店）',        prov:'云南', city:'昆明', mch:'1255203406', lng:102.7040, lat:25.0460, status:'停用', src:'导入' }
];

/* ---------- 门店编码（必填）----------
 * 编码来自客户系统，当前不限定格式；仅去除首尾空格，保留原值。
 * 不自动补齐、不自动生成；录入 / 导入 / 保存时只做必填与重复校验。
 * ------------------------------------------------------------ */
/** 清洗门店编码：只去首尾空格，不做格式归一 */
function retNormSid(sid){
  return String(sid == null ? '' : sid).trim();
}

function retSidOf(x){
  if(!x) return '';
  if(x.sid) return retNormSid(x.sid);
  var db = window.RET_DB || [];
  var hit = db.filter(function(s){
    return (x.mch && s.mch === x.mch)
      || (x.store && s.name === x.store)
      || (x.ret && s.ret && (x.ret.indexOf(s.ret) === 0 || s.ret.indexOf(x.ret) === 0));
  })[0];
  return hit ? retNormSid(hit.sid) : '';
}

function retEnsureSids(){
  (window.RET_DB || []).forEach(function(s){ if(s.sid) s.sid = retNormSid(s.sid); });
  var fill = function(r){
    if(!r) return;
    if(r.sid){ r.sid = retNormSid(r.sid); return; }
    var s = retSidOf(r);
    if(s) r.sid = s;
  };
  (window.PLANS || []).forEach(function(p){ (p.retRows || []).forEach(fill); });
  (window.PROJECTS || []).forEach(function(p){ (p.planBrief || []).forEach(function(b){ (b.ret || []).forEach(fill); }); });
}

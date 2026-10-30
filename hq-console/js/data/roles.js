/* =============================================================================
 * data/roles.js — 角色、菜单权限、组织架构
 * 系统管理页的列表数据：列表只放列表，权限矩阵在角色配置抽屉里（避免列表与详情混显）
 * ========================================================================== */

var MENUS = [
  { key:'v-home',    name:'工作台' },
  { key:'v-create',  name:'项目创建' },
  { key:'v-manage',  name:'项目管理' },
  { key:'v-plan',    name:'计划与批次' },
  { key:'v-h5',      name:'挂券与配置' },
  { key:'v-board',   name:'数据看板' },
  { key:'v-admin',   name:'系统管理' }
];

var ROLES = [
  {
    key:'admin', name:'管理员', owner:'数字化中心',
    desc:'全部菜单，可维护角色与字典；可见全部项目',
    status:'启用',
    menus:MENUS.map(function(m){ return m.key; }),
    noAccount:false
  },
  {
    key:'biz', name:'业务运营', owner:'总部市场部 / 事业部 / 区域 / 经销商',
    desc:'可创建项目；默认仅见自己创建、担任负责人或作为审批人的项目，不可进入系统管理',
    status:'启用',
    menus:['v-home','v-create','v-manage','v-plan','v-h5','v-board'],
    noAccount:false
  }
];

var ORGS = [
  { level:'集团',      name:'蒙牛集团',                     up:'—',            down:'6 个事业部',            status:'启用' },
  { level:'事业部',    name:'BU03 华东事业部',              up:'蒙牛集团',      down:'4 个区域',              status:'启用' },
  { level:'区域',      name:'华东-上海区域',                up:'BU03 华东事业部', down:'12 个经销商',          status:'启用' },
  { level:'经销商',    name:'上海某某商贸有限公司',          up:'华东-上海区域',  down:'—',                    status:'启用' },
  { level:'事业部',    name:'BU01 华北事业部',              up:'蒙牛集团',      down:'3 个区域',              status:'启用' }
];

function roleByKey(k){
  return ROLES.filter(function(r){ return r.key === k; })[0] || null;
}

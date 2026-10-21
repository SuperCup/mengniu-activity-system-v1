/* =============================================================================
 * data/roles.js — 角色、菜单权限、组织架构
 * 系统管理页的列表数据：列表只放列表，权限矩阵在角色配置抽屉里（避免列表与详情混显）
 * ========================================================================== */

var MENUS = [
  { key:'v-home',    name:'工作台' },
  { key:'v-create',  name:'项目创建' },
  { key:'v-approve', name:'项目审批' },
  { key:'v-manage',  name:'项目管理' },
  { key:'v-plan',    name:'计划与批次' },
  { key:'v-h5',      name:'领券页面' },
  { key:'v-board',   name:'数据看板' },
  { key:'v-admin',   name:'系统管理' }
];

var ROLES = [
  {
    key:'admin', name:'管理员', owner:'数字化中心',
    desc:'全部菜单，全量数据，可维护角色与字典',
    scope:'全量', status:'启用',
    menus:MENUS.map(function(m){ return m.key; }),
    noAccount:false
  },
  {
    key:'biz', name:'业务运营', owner:'总部市场部 / 事业部 / 区域 / 经销商',
    desc:'按组织架构收窄数据范围，不可进入系统管理',
    scope:'本级及下级', status:'启用',
    menus:['v-home','v-create','v-approve','v-manage','v-plan','v-h5','v-board'],
    noAccount:false
  },
  {
    key:'fin', name:'财务', owner:'财务部',
    desc:'只看数据，不参与创建与审批',
    scope:'全量（只读）', status:'启用',
    menus:['v-home','v-manage','v-board'],
    noAccount:false
  },
  {
    key:'svc', name:'服务商', owner:'第三方服务公司',
    desc:'不发账号、不进系统，通过邮件链接免登录访问活动操作页',
    scope:'—', status:'不适用',
    menus:[],
    noAccount:true
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

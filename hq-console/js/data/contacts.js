/* =============================================================================
 * data/contacts.js — 通讯录示例（活动负责人单选 / 项目审批人多选）
 * 字段与通讯录对齐：员工 ID、姓名、手机号、部门、岗位
 * ========================================================================== */
var CONTACTS = [
  { id:'U-01', name:'李雪', phone:'15269175821', dept:'数字化中心', title:'活动运营' },
  { id:'U-02', name:'张明', phone:'13800138001', dept:'数字化中心', title:'中心负责人' },
  { id:'U-03', name:'赵琳', phone:'13611112222', dept:'华北事业部', title:'区域经理' },
  { id:'U-04', name:'王磊', phone:'13701234567', dept:'华北事业部', title:'品牌经理' },
  { id:'U-05', name:'陈晨', phone:'13912345678', dept:'华东事业部', title:'市场主管' },
  { id:'U-06', name:'周倩', phone:'15800001111', dept:'华东事业部', title:'活动执行' },
  { id:'U-07', name:'刘洋', phone:'18611112233', dept:'华南事业部', title:'渠道经理' },
  { id:'U-08', name:'孙悦', phone:'13566667777', dept:'财务共享中心', title:'预算专员' },
  { id:'U-09', name:'马超', phone:'13388889999', dept:'数字化中心', title:'产品经理' },
  { id:'U-10', name:'何静', phone:'15922223333', dept:'品牌部', title:'传播经理' },
  { id:'U-11', name:'陈曦', phone:'13900001111', dept:'华东事业部', title:'省区经理' },
  { id:'U-12', name:'黄伟', phone:'13512345678', dept:'华南事业部', title:'区域经理' },
  { id:'U-13', name:'周涛', phone:'13300009999', dept:'西南事业部', title:'区域经理' },
  { id:'U-14', name:'吴敏', phone:'13655556666', dept:'数字化中心', title:'项目经理' }
];

function contactById(id){
  return (window.CONTACTS || []).filter(function(c){ return c.id === id; })[0] || null;
}

function contactByName(name){
  var n = String(name || '').trim();
  if(!n) return null;
  return (window.CONTACTS || []).filter(function(c){ return c.name === n; })[0] || null;
}

function contactSearch(kw){
  var q = String(kw || '').trim().toLowerCase();
  var list = window.CONTACTS || [];
  if(!q) return list.slice();
  return list.filter(function(c){
    return [c.id, c.name, c.phone, c.dept, c.title].join(' ').toLowerCase().indexOf(q) >= 0;
  });
}

/** 从任意实体（项目 / 计划）上取人员快照，兼容旧数据只有姓名的情况 */
function personOf(v, fallbackName){
  if(v && typeof v === 'object' && v.name) return v;
  var n = String(v || fallbackName || '').split('·')[0].trim();
  var c = contactByName(n);
  if(c) return { id:c.id, name:c.name, phone:c.phone, dept:c.dept, title:c.title };
  return n ? { id:'', name:n, phone:'', dept:'', title:'' } : null;
}

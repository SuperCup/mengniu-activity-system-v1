/* =============================================================================
 * core/identity.js — 演示身份（数据边界）
 *   创建人 / 审批人 / 活动负责人 各自只能看到对应活动；管理员看全量。
 *   真机上这些身份来自钉钉扫码登录，这里用于原型演示切换。
 * ========================================================================== */
window.MT = window.MT || {};

var MN_USERS = [
  { id:'U-02', name:'张明', role:'admin',  dept:'数字化中心', label:'管理员 · 看全量' },
  { id:'U-01', name:'李雪', role:'biz',   dept:'数字化中心', label:'创建人' },
  { id:'U-03', name:'赵琳', role:'biz',   dept:'华北事业部', label:'活动负责人' },
  { id:'U-04', name:'王磊', role:'biz',   dept:'华北事业部', label:'活动负责人' },
  { id:'U-05', name:'陈晨', role:'biz',   dept:'华东事业部', label:'创建人' },
  { id:'U-09', name:'马超', role:'biz',   dept:'数字化中心', label:'项目审批人' },
  { id:'U-08', name:'孙悦', role:'biz',   dept:'财务共享中心', label:'项目审批人' }
];

function mnSetUser(id){
  var u = MN_USERS.filter(function(x){ return x.id === id; })[0];
  if(!u) return;
  window.MN_USER = { id:u.id, name:u.name, role:u.role, dept:u.dept };
  try{ sessionStorage.setItem('mn_demo_user', id); }catch(e){}
  renderIdentityBar();
  if(typeof renderProjCards === 'function') renderProjCards();
  if(typeof renderTodos === 'function') renderTodos();
  if(typeof renderPlans === 'function') renderPlans();
  if(typeof renderPlanScope === 'function') renderPlanScope();
  if(typeof renderDbAll === 'function'){ try{ renderDbAll(); }catch(e){} }
  MT.toast('已切换为「' + u.name + ' · ' + u.label + '」，项目列表按可见范围过滤');
}

function renderIdentityBar(){
  var sel = document.getElementById('mnUserSel');
  if(sel){
    sel.innerHTML = MN_USERS.map(function(u){
      return '<option value="' + u.id + '"' + (mnCurrentUser().id === u.id ? ' selected' : '') + '>'
        + u.name + ' · ' + u.label + '</option>';
    }).join('');
  }
  var av = document.getElementById('mnUserAv');
  var nm = document.getElementById('mnUserName');
  var dp = document.getElementById('mnUserDept');
  var u = mnCurrentUser();
  if(av) av.textContent = (u.name || '张').slice(0, 1);
  if(nm) nm.textContent = u.name || '张明';
  if(dp) dp.textContent = (u.dept || '数字化中心') + (u.role === 'admin' ? ' · 管理员' : '');
}

/** 启动时恢复身份（会话内），默认管理员 */
function mnInitIdentity(){
  var id = '';
  try{ id = sessionStorage.getItem('mn_demo_user') || ''; }catch(e){}
  var u = MN_USERS.filter(function(x){ return x.id === id; })[0] || MN_USERS[0];
  window.MN_USER = { id:u.id, name:u.name, role:u.role, dept:u.dept };
  renderIdentityBar();
}

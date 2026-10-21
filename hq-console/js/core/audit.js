/* =============================================================================
 * core/audit.js — 系统日志写入
 *   · 业务动作统一调用 sysLog(模块, 操作, 对象, 对象编号, 说明, 结果)
 *   · 只在本机记录；不调用任何外部服务
 * ========================================================================== */

var SYS_LOG_MAX = 500;

/** 日志时间：年-月-日 时:分:秒 */
function logNow(){
  var d = new Date();
  function two(n){ return ('0' + n).slice(-2); }
  return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate())
    + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds());
}

function sysRoleLabel(u){
  if(!u) return '业务人员';
  if(u.roleLabel) return u.roleLabel;
  var map = { biz:'业务人员', approve:'审批人', admin:'系统管理员', vendor:'服务商', sys:'系统管理员' };
  return map[u.role] || u.role || '业务人员';
}

/**
 * 写一条系统日志
 * @param {string} mod    模块：项目管理 / 项目审批 / 计划与批次 / 领券页面 / 系统管理 / 登录
 * @param {string} act    操作：提交审批 / 审批通过 / 保存批次配置 ...
 * @param {string} obj    对象名称
 * @param {string} [objId] 对象编号
 * @param {string} [detail] 说明
 * @param {string} [result] 成功 / 失败
 */
function sysLog(mod, act, obj, objId, detail, result){
  var u = (typeof mnCurrentUser === 'function') ? mnCurrentUser() : { name:'李雪', role:'biz', dept:'数字化中心' };
  var at = logNow();
  var rec = {
    at: at,
    user: u.name || '—',
    role: sysRoleLabel(u),
    dept: u.dept || '数字化中心',
    mod: mod || '系统',
    act: act || '操作',
    obj: obj || '—',
    objId: objId || '',
    detail: detail || '',
    result: result || '成功',
    ip: '10.20.31.' + (10 + ((window.__mnIpSeed = (window.__mnIpSeed || 0) + 7) % 80))
  };
  if(!window.SYS_LOGS) window.SYS_LOGS = [];
  window.SYS_LOGS.unshift(rec);
  if(window.SYS_LOGS.length > SYS_LOG_MAX) window.SYS_LOGS.length = SYS_LOG_MAX;

  if(typeof mnPersist === 'function') mnPersist();
  if(document.getElementById('logTbody') && typeof renderLogs === 'function'){
    LOG_PAGE = 1;
    renderLogs();
  }
  return rec;
}

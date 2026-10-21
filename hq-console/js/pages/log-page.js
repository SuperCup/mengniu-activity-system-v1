/* =============================================================================
 * pages/log-page.js — 系统日志
 *   · 记录项目、审批、计划批次、领券页、系统管理等关键动作与结果
 *   · 筛选：模块 / 结果 / 时间范围 / 关键字；每页 15 条
 *   · 只读，不提供编辑与删除
 * ========================================================================== */

var LOG_SIZE = 15;
var LOG_PAGE = 1;
var LOG_F = { mod:'', res:'', from:'', to:'' };

function logList(){
  var mod = (document.getElementById('logMod') || {}).value;
  var res = (document.getElementById('logRes') || {}).value;
  var from = (document.getElementById('logFrom') || {}).value || '';
  var to = (document.getElementById('logTo') || {}).value || '';
  var kw = String((document.getElementById('logKw') || {}).value || '').trim().toLowerCase();
  LOG_F = { mod: mod || '', res: res || '', from: from, to: to };

  var rows = (window.SYS_LOGS || []).filter(function(r){
    if(LOG_F.mod && r.mod !== LOG_F.mod) return false;
    if(LOG_F.res && r.result !== LOG_F.res) return false;
    var day = String(r.at || '').slice(0, 10);
    if(LOG_F.from && day < LOG_F.from) return false;
    if(LOG_F.to && day > LOG_F.to) return false;
    if(kw){
      var hay = (r.user + ' ' + r.obj + ' ' + r.objId + ' ' + r.detail + ' ' + r.act + ' ' + r.mod).toLowerCase();
      if(hay.indexOf(kw) < 0) return false;
    }
    return true;
  });

  /* 时间倒序：新写入的日志永远在最上面 */
  rows.sort(function(a, b){ return String(b.at).localeCompare(String(a.at)); });
  return rows;
}

function logQuery(){
  LOG_F.mod = (document.getElementById('logMod') || {}).value || '';
  LOG_F.res = (document.getElementById('logRes') || {}).value || '';
  LOG_F.from = (document.getElementById('logFrom') || {}).value || '';
  LOG_F.to = (document.getElementById('logTo') || {}).value || '';
  LOG_PAGE = 1;
  renderLogs();
}

function logReset(){
  ['logMod','logRes','logFrom','logTo','logKw'].forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    if(el.tagName === 'SELECT') el.value = '';
    else el.value = '';
  });
  LOG_F = { mod:'', res:'', from:'', to:'' };
  LOG_PAGE = 1;
  renderLogs();
}

function gotoLog(n){
  var rows = logList();
  var pages = Math.max(1, Math.ceil(rows.length / LOG_SIZE));
  if(n < 1 || n > pages) return;
  LOG_PAGE = n;
  renderLogs();
}

function renderLogs(){
  var body = document.getElementById('logTbody'); if(!body) return;
  var rows = logList();

  var pages = Math.max(1, Math.ceil(rows.length / LOG_SIZE));
  if(LOG_PAGE > pages) LOG_PAGE = pages;
  var st = (LOG_PAGE - 1) * LOG_SIZE, en = Math.min(st + LOG_SIZE, rows.length);

  var h = '';
  for(var i = st; i < en; i++){
    var r = rows[i];
    h += '<tr>'
      + '<td class="sx-mono" style="font-size:11.8px;white-space:nowrap">' + pnEsc(r.at) + '</td>'
      + '<td>' + pnEsc(r.user) + '<div class="muted" style="font-size:11px">' + pnEsc(r.role) + '</div></td>'
      + '<td>' + pnEsc(r.mod) + '</td>'
      + '<td><b>' + pnEsc(r.act) + '</b></td>'
      + '<td>' + pnEsc(r.obj) + (r.objId ? '<div class="muted sx-mono" style="font-size:11px">' + pnEsc(r.objId) + '</div>' : '') + '</td>'
      + '<td class="mut" style="font-size:12px">' + pnEsc(r.detail || '—') + '</td>'
      + '<td><span class="tg ' + (r.result === '失败' ? 'tg-r' : 'tg-g') + ' xs">' + pnEsc(r.result) + '</span></td>'
      + '<td class="sx-mono mut" style="font-size:11.4px">' + pnEsc(r.ip) + '</td>'
      + '</tr>';
  }
  body.innerHTML = h || '<tr><td colspan="8" class="empty-row">没有符合条件的日志</td></tr>';

  var cnt = document.getElementById('logCnt');
  if(cnt) cnt.textContent = rows.length + ' 条';

  var info = document.getElementById('logInfo');
  if(info) info.textContent = '共 ' + rows.length + ' 条，每页 15 条';

  var pg = '<span class="' + (LOG_PAGE <= 1 ? 'dis' : '') + '" onclick="gotoLog(' + (LOG_PAGE - 1) + ')">上一页</span>';
  for(var k = 1; k <= pages; k++){
    pg += '<span class="' + (k === LOG_PAGE ? 'on' : '') + '" onclick="gotoLog(' + k + ')">' + k + '</span>';
  }
  pg += '<span class="' + (LOG_PAGE >= pages ? 'dis' : '') + '" onclick="gotoLog(' + (LOG_PAGE + 1) + ')">下一页</span>';
  var pb = document.getElementById('logPager');
  if(pb) pb.innerHTML = pg;
}

/** 导出当前筛选结果（CSV，本机生成） */
function logExport(){
  var rows = logList();
  if(!rows.length){ MT.toast('当前筛选结果为空', 'err'); return; }
  var head = ['时间','操作人','角色','部门','模块','操作','对象','对象编号','说明','结果','来源IP'];
  var lines = [head.join(',')].concat(rows.map(function(r){
    return [r.at, r.user, r.role, r.dept, r.mod, r.act, r.obj, r.objId, r.detail, r.result, r.ip]
      .map(function(v){ return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(',');
  }));
  var blob = new Blob(['\uFEFF' + lines.join('\n')], { type:'text/csv;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '系统日志_' + rows[0].at.slice(0,10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
  MT.toast('已导出 ' + rows.length + ' 条日志（本机生成）');
}

/* ---------- 模板：v-log ---------- */
function tplPagelog(){
  return `<div class="view" id="v-log">
  <div class="panel">
    <div class="panel-h">
      <h3>系统日志 <span class="tg tg-n" id="logCnt">0 条</span></h3>
      <div class="flex" style="gap:8px">
        <span class="muted">记录项目、审批、计划批次、领券页与系统管理的关键操作，只读留痕</span>
        <button class="btn btn-o btn-xs" onclick="logExport()">导出当前结果</button>
      </div>
    </div>
    <div class="panel-b" style="border-top:1px solid var(--line2)">
      <div class="flex" style="gap:8px;flex-wrap:wrap;align-items:center">
        <span class="mut" style="font-size:12.2px">模块</span>
        <select class="inp" id="logMod" style="max-width:140px" onchange="logQuery()">
          <option value="">全部模块</option>
          <option>项目管理</option>
          <option>项目审批</option>
          <option>计划与批次</option>
          <option>领券页面</option>
          <option>服务商门户</option>
          <option>系统管理</option>
          <option>登录</option>
        </select>
        <span class="mut" style="font-size:12.2px">结果</span>
        <select class="inp" id="logRes" style="max-width:110px" onchange="logQuery()">
          <option value="">全部</option>
          <option>成功</option>
          <option>失败</option>
        </select>
        <span class="mut" style="font-size:12.2px">时间</span>
        <input class="inp" id="logFrom" type="date" style="max-width:150px" onchange="logQuery()">
        <span class="mut">至</span>
        <input class="inp" id="logTo" type="date" style="max-width:150px" onchange="logQuery()">
        <input class="inp" id="logKw" placeholder="操作人 / 对象 / 说明" style="max-width:230px" oninput="LOG_PAGE=1;renderLogs()">
        <button class="btn btn-p btn-xs" onclick="logQuery()">查询</button>
        <button class="btn btn-g btn-xs" onclick="logReset()">重置</button>
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-b" style="padding:0">
      <table class="bt mini" style="table-layout:fixed">
        <thead><tr>
          <th style="width:146px">时间</th>
          <th style="width:96px">操作人</th>
          <th style="width:92px">模块</th>
          <th style="width:104px">操作</th>
          <th style="width:230px">对象</th>
          <th>说明</th>
          <th style="width:66px">结果</th>
          <th style="width:110px">来源 IP</th>
        </tr></thead>
        <tbody id="logTbody"><tr><td colspan="8" class="empty-row">加载中…</td></tr></tbody>
      </table>
    </div>
  </div>

  <div class="pager">
    <div class="pg-info" id="logInfo">共 0 条，每页 15 条</div>
    <div class="pg-btns" id="logPager"></div>
  </div>
</div>`;
}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-log",
  title: "系统日志",
  crumb: "系统配置 / 系统日志",
  group: "配置",
  template: tplPagelog,
  init: function(){ renderLogs(); }
});

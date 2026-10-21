/* =============================================================================
 * pages/project-approve.js — 项目审批
 *   1. 卡片与「项目管理」使用同一个 projCard，字段完全一致
 *   2. 顶部不放状态页签，改为筛选条件：审批状态（默认待审批）+ 关键字
 *   3. 每页 15 条，底部分页
 * ========================================================================== */

var AP_SIZE = 15;
var AP_PAGE = 1;
var AP_FILTER = 'pending';

function apMatch(p, k){
  if(!k) return true;
  if(k === 'pending')  return p.state === 'pending';
  if(k === 'approved') return p.state === 'approved' || p.state === 'confirmed' || p.state === 'running';
  return p.state === k;
}

function apRows(k, kw){
  var q = String(kw || '').trim().toLowerCase();
  return (window.PROJECTS || []).filter(function(p){
    if(!apMatch(p, k || '')) return false;
    if(!q) return true;
    return (p.name + ' ' + p.id + ' ' + p.orderNo + ' ' + p.owner + ' ' + p.bu).toLowerCase().indexOf(q) >= 0;
  });
}

function apState(k){
  AP_FILTER = k || 'pending';
  var sel = document.getElementById('apStat');
  if(sel) sel.value = AP_FILTER;
  AP_PAGE = 1;
  renderApproveList();
}

function apReset(){
  var sel = document.getElementById('apStat');
  if(sel) sel.value = 'pending';
  var kw = document.getElementById('apKw');
  if(kw) kw.value = '';
  AP_FILTER = 'pending';
  AP_PAGE = 1;
  renderApproveList();
}

function gotoApprove(n){
  var rows = apRows(AP_FILTER, (document.getElementById('apKw') || {}).value);
  var pages = Math.max(1, Math.ceil(rows.length / AP_SIZE));
  if(n < 1 || n > pages) return;
  AP_PAGE = n;
  renderApproveList();
}

function renderApproveList(){
  if(!document.getElementById('apList')) return;

  var sel = document.getElementById('apStat');
  if(sel) AP_FILTER = sel.value;
  var box = document.getElementById('apList');
  var rows = apRows(AP_FILTER, (document.getElementById('apKw') || {}).value);

  var pages = Math.max(1, Math.ceil(rows.length / AP_SIZE));
  if(AP_PAGE > pages) AP_PAGE = pages;
  var st = (AP_PAGE - 1) * AP_SIZE, en = Math.min(st + AP_SIZE, rows.length);

  if(!rows.length){
    box.innerHTML = '<div class="panel"><div class="panel-b" style="padding:28px;text-align:center;color:var(--ink-40);font-size:12.6px">'
      + (AP_FILTER === 'pending' ? '当前没有待审批项目' : '没有符合条件的项目') + '</div></div>';
  } else {
    var h = '';
    for(var i = st; i < en; i++) h += projCard(rows[i], 'approve');
    box.innerHTML = h;
  }

  var cnt = document.getElementById('apCnt');
  if(cnt) cnt.textContent = apRows('pending', '').length;

  var pg = '<span class="' + (AP_PAGE <= 1 ? 'dis' : '') + '" onclick="gotoApprove(' + (AP_PAGE - 1) + ')">上一页</span>';
  for(var k = 1; k <= pages; k++){
    pg += '<span class="' + (k === AP_PAGE ? 'on' : '') + '" onclick="gotoApprove(' + k + ')">' + k + '</span>';
  }
  pg += '<span class="' + (AP_PAGE >= pages ? 'dis' : '') + '" onclick="gotoApprove(' + (AP_PAGE + 1) + ')">下一页</span>';
  var pb = document.getElementById('apPager');
  if(pb) pb.innerHTML = pg;

  var info = document.getElementById('apInfo');
  if(info) info.textContent = '共 ' + rows.length + ' 条，每页 15 条';
}

function projApprove(id, act){
  return wfApprove(id, act);
}

/* ---------- 模板：v-approve ---------- */
function tplPageapprove(){
  return `<div class="view" id="v-approve">
  <div class="panel">
    <div class="panel-h">
      <h3>项目审批 <span class="tg tg-a" id="apCnt">0</span></h3>
      <div class="flex" style="gap:8px">
        <span class="muted">审批只看报批信息，计划明细在审批通过后由创建人补充</span>
        <button class="btn btn-o btn-xs" onclick="openFlow()">状态流转与执行动作</button>
      </div>
    </div>
    <div class="panel-b" style="border-top:1px solid var(--line2)">
      <div class="flex" style="gap:8px;flex-wrap:wrap;align-items:center">
        <span class="mut" style="font-size:12.2px">审批状态</span>
        <select class="inp" id="apStat" style="max-width:150px" onchange="AP_PAGE=1;renderApproveList()">
          <option value="pending" selected>待审批</option>
          <option value="approved">已通过</option>
          <option value="stopped">已终止</option>
          <option value="">全部</option>
        </select>
        <input class="inp" id="apKw" placeholder="项目名称 / 项目单号 / 提报人" style="max-width:280px" oninput="AP_PAGE=1;renderApproveList()">
        <button class="btn btn-p btn-xs" onclick="AP_PAGE=1;renderApproveList()">查询</button>
        <button class="btn btn-g btn-xs" onclick="apReset()">重置</button>
      </div>
    </div>
  </div>

  <div id="apList"></div>

  <div class="pager">
    <div class="pg-info" id="apInfo">共 0 条，每页 15 条</div>
    <div class="pg-btns" id="apPager"></div>
  </div>
</div>`;
}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-approve",
  title: "项目审批",
  crumb: "活动运营 / 项目审批",
  group: "活动运营",
  template: tplPageapprove
});

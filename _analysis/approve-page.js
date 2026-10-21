/* =============================================================================
 * pages/project-approve.js — 项目审批
 *   1. 卡片与「项目管理」使用同一个 projCard，字段完全一致
 *   2. 增加状态筛选：待审批 / 已通过 / 已终止 / 全部
 *   3. 每页 15 条，底部分页
 * ========================================================================== */

var AP_SIZE = 15;
var AP_PAGE = 1;
var AP_FILTER = 'pending';

var AP_TABS = [
  { k:'pending',  label:'待审批' },
  { k:'approved', label:'已通过' },
  { k:'stopped',  label:'已终止' },
  { k:'',         label:'全部' }
];

function apMatch(p, k){
  if(!k) return true;
  if(k === 'pending')  return p.state === 'pending';
  if(k === 'approved') return p.state === 'approved' || p.state === 'confirmed' || p.state === 'running';
  return p.state === k;
}

function apRows(k){
  return (window.PROJECTS || []).filter(function(p){ return apMatch(p, k); });
}

function renderApproveSteps(){
  var box = document.getElementById('apSteps'); if(!box) return;
  var h = '';
  AP_TABS.forEach(function(t){
    var n = apRows(t.k).length;
    h += '<div class="s' + (AP_FILTER === t.k ? ' on' : '') + '" onclick="apState(&quot;' + t.k + '&quot;)">'
       + '<span class="c' + (n ? '' : ' mut') + '">' + n + '</span>' + t.label + '</div>';
  });
  box.innerHTML = h;
}

function apState(k){
  AP_FILTER = k || '';
  AP_PAGE = 1;
  renderApproveList();
}

function gotoApprove(n){
  var rows = apRows(AP_FILTER);
  var pages = Math.max(1, Math.ceil(rows.length / AP_SIZE));
  if(n < 1 || n > pages) return;
  AP_PAGE = n;
  renderApproveList();
}

function renderApproveList(){
  if(!document.getElementById('apList')) return;
  renderApproveSteps();

  var box = document.getElementById('apList');
  var rows = apRows(AP_FILTER);

  var pages = Math.max(1, Math.ceil(rows.length / AP_SIZE));
  if(AP_PAGE > pages) AP_PAGE = pages;
  var st = (AP_PAGE - 1) * AP_SIZE, en = Math.min(st + AP_SIZE, rows.length);

  if(!rows.length){
    box.innerHTML = '<div class="panel"><div class="panel-b" style="padding:28px;text-align:center;color:var(--ink-40);font-size:12.6px">'
      + (AP_FILTER === 'pending' ? '当前没有待审批项目' : '该状态下暂无项目') + '</div></div>';
  } else {
    var h = '';
    for(var i = st; i < en; i++) h += projCard(rows[i], 'approve');
    box.innerHTML = h;
  }

  var cnt = document.getElementById('apCnt');
  if(cnt) cnt.textContent = apRows('pending').length;

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
    <div id="apSteps" class="steps"></div>
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

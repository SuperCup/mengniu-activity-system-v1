/* =============================================================================
 * pages/project-manage.js — 项目管理
 * 规则（本次调整）：
 *   1. 顶部状态与列表联动：点状态即筛选，计数由 PROJECTS 实时统计
 *   2. 卡片字段与「项目详情」完全一致（创建业务部门 / 核销预算 / 活动周期 /
 *      服务商 / 机制 / PO 单号）
 *   3. 状态标签只在标题后出现一次，tags 行不再重复状态
 *   4. 执行进度仅「执行中」显示
 *   5. 最近保存时间放卡片左下角；活动 ID 字样与草稿号不再展示
 *   6. 操作按钮后不再跟说明文字
 * ========================================================================== */

/* ---------- 统一进度条：4 个节点（草稿 / 审批 / 推送 / 执行） ---------- */
var PROJ_STEPS = ['草稿', '审批', '推送', '执行'];

/** 卡片 / 详情共用：当前节点 + 当前状态 */
function projDisplay(p){
  var base = (typeof PROJ_STATES !== 'undefined' && PROJ_STATES[p.state]) ? PROJ_STATES[p.state] : { label:'—', cls:'tg-n' };
  var d = { label:base.label, cls:base.cls, step:projStageIndex(p), stage:projStage(p), cfg:null, cfgDone:false };
  if(p.state === 'passed'){
    d.cfg = (typeof projConfigStat === 'function') ? projConfigStat(p.id) : null;
    d.cfgDone = !!(d.cfg && d.cfg.total && !d.cfg.todo);
  }
  return d;
}

function projStepIdx(p){ return projStageIndex(p); }

function projProgress(p){
  var idx = projStageIndex(p);
  var st = PROJ_STATES[p.state] || {};
  var h = '<div class="psteps' + (p.state === 'rejected' ? ' rej' : (p.state === 'finished' ? ' stop' : '')) + '">';
  /* 已走过的节点显示该节点的最终状态（如 审批 → 已通过、推送 → 已确认） */
  var doneLabel = ['草稿', '已通过', '已确认', '已结束'];
  PROJ_STEPS.forEach(function(t, i){
    var cls = i < idx ? 'done' : (i === idx ? 'on' : 's-todo');
    var lab = (i < idx) ? doneLabel[i] : ((i === idx && st.label) ? st.label : t);
    h += '<div class="pstep ' + cls + '"><i class="dot"></i><span>' + lab + '</span></div>';
  });
  h += '</div>';
  return h;
}

/* ---------- 卡片 ---------- */
function projCard(p, mode){
  var d = projDisplay(p);

  var stat = (typeof projPlanStat === 'function') ? projPlanStat(p.id) : { n:0, amt:0 };
  var kv = ''
    + '<div class="kv-i"><span class="k">创建业务部门</span><span class="v">' + pnEsc(p.bu) + '</span></div>'
    + '<div class="kv-i"><span class="k">投放平台</span><span class="v">' + pnEsc(p.platform || '—') + '</span></div>'
    + '<div class="kv-i"><span class="k">预算来源</span><span class="v">' + pnEsc(p.source || '—') + '</span></div>'
    + '<div class="kv-i"><span class="k">核销预算</span><span class="v">' + pnEsc(p.budget) + '</span></div>'
    + '<div class="kv-i"><span class="k">活动周期</span><span class="v">' + pnEsc(p.period) + '</span></div>'
    + '<div class="kv-i"><span class="k">服务商</span><span class="v">' + pnEsc(p.vendor) + '</span></div>'
    + '<div class="kv-i"><span class="k">计划批次数</span><span class="v">' + stat.n + ' 个</span></div>'
    + '<div class="kv-i"><span class="k">计划批次金额</span><span class="v">' + money(stat.amt) + '</span></div>'
    + '<div class="kv-i"><span class="k">预算单号</span><span class="v sx-mono">' + pnEsc(p.po) + '</span></div>';

  var btns = projButtons(p);

  return '<div class="pcard" data-state="' + p.state + '">'
    + '<div class="pcard-h">'
    +   '<div><h4>' + pnEsc(p.name) + '</h4></div>'
    +   '<div class="rt"><span class="muted" style="font-size:11.5px">项目编号</span> <span class="sx-mono">' + pnEsc(p.code || '—') + '</span></div>'
    + '</div>'
    + '<div class="kv">' + kv + '</div>'
    + projProgress(p)
    + '<div class="pcard-f"><span class="savet">最近保存 ' + pnEsc(p.saved) + '</span>'
    +   '<div class="pcard-btns">' + btns + '</div></div>'
    + '</div>';
}

/* ---------- 按状态给动作按钮（不加任何说明文字） ---------- */
function projButtons(p){
  var q = '\'' + p.id + '\'';
  var detail = '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">详情</button>';
  var stop   = '<button class="btn btn-d btn-xs" onclick="projAct(\'stop\',' + q + ')">终止</button>';
  var resend = '<button class="btn btn-o btn-xs" onclick="projAct(\'resend\',' + q + ')">重发邮件</button>'
             + '<button class="btn btn-o btn-xs" onclick="projAct(\'copy\',' + q + ')">复制确认链接</button>';
  switch(p.state){
    /* 草稿：只有编辑与提交审批（无详情、无批次计划） */
    case 'editing':
      return '<button class="btn btn-o btn-xs" onclick="openProjEdit(' + q + ')">编辑</button>'
           + '<button class="btn btn-p btn-xs" onclick="projAct(\'submit\',' + q + ')">提交审批</button>';
    case 'approving':
      return detail;
    case 'rejected':
      return detail
           + '<button class="btn btn-o btn-xs" onclick="openProjEdit(' + q + ')">编辑</button>'
           + '<button class="btn btn-p btn-xs" onclick="projAct(\'submit\',' + q + ')">提交审批</button>';
    case 'passed':
      return detail
           + '<button class="btn btn-o btn-xs" onclick="wfEnterConfig(' + q + ')">完善批次计划</button>';
    case 'to_push':
      return detail
           + '<button class="btn btn-p btn-xs" onclick="projAct(\'push\',' + q + ')">推送服务商</button>'
           + stop;
    case 'pushed':
    case 'to_confirm':
      return detail + resend + stop;
    case 'confirmed':
      return detail + resend + stop;
    case 'configured':
      return detail
           + '<button class="btn btn-o btn-xs" onclick="openProjPlans(' + q + ')">计划与批次</button>'
           + stop;
    case 'running':
      return detail
           + '<button class="btn btn-o btn-xs" onclick="openProjPlans(' + q + ')">计划与批次</button>'
           + '<button class="btn btn-o btn-xs" onclick="go(\'v-h5\')">挂券与配置</button>'
           + '<button class="btn btn-p btn-xs" onclick="go(\'v-board\')">数据看板</button>'
           + stop;
    case 'finished':
      return '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">详情</button>'
           + '<button class="btn btn-g btn-xs" onclick="projAct(\'copyNew\',' + q + ')">复制为新项目</button>';
  }
  return '';
}

/* ---------- 状态筛选：按 4 个节点分组 ---------- */
function renderProjStateFilter(){
  var sel = document.getElementById('projFState'); if(!sel) return;
  var h = '<option value="">全部状态</option>';
  PROJ_STAGE_ORDER.forEach(function(k){
    h += '<optgroup label="' + PROJ_STAGES[k].label + '">';
    PROJ_STATE_ORDER.forEach(function(sid){
      if(PROJ_STATES[sid].stage !== k) return;
      h += '<option value="' + sid + '"' + (PROJ_FILTER === sid ? ' selected' : '') + '>'
        + PROJ_STATES[sid].label + '（' + projCount(sid) + '）</option>';
    });
    h += '</optgroup>';
  });
  sel.innerHTML = h;
}

function gotoProjState(k){
  PROJ_FILTER = k || '';
  PROJ_PAGE = 1;
  renderProjCards();
  go('v-manage');
}

function projState(k){
  PROJ_FILTER = k || '';
  PROJ_PAGE = 1;
  renderProjStateFilter();
  renderProjCards();
}

/* ---------- 列表 ---------- */
function renderProjCards(){
  renderProjStateFilter();

  var box = document.getElementById('projList'); if(!box) return;
  var rows = projFiltered();

  /* 关键词过滤（活动名称 / 项目编号 / 服务商 / 部门） */
  var kw = ((document.getElementById('projKw') || {}).value || '').trim().toLowerCase();
  if(kw){
    rows = rows.filter(function(p){
      return (p.name + ' ' + p.id + ' ' + (p.code || '') + ' ' + p.vendor + ' ' + p.bu).toLowerCase().indexOf(kw) >= 0;
    });
  }

  var pages = Math.max(1, Math.ceil(rows.length / PROJ_SIZE));
  if(PROJ_PAGE > pages) PROJ_PAGE = pages;
  var st = (PROJ_PAGE - 1) * PROJ_SIZE, en = Math.min(st + PROJ_SIZE, rows.length);

  if(!rows.length){
    box.innerHTML = '<div class="panel"><div class="panel-b" style="padding:28px;text-align:center;color:var(--ink-40);font-size:12.6px">该状态下暂无项目</div></div>';
  } else {
    var h = '';
    for(var i=st;i<en;i++) h += projCard(rows[i]);
    box.innerHTML = h;
  }

  var cnt = document.getElementById('projCnt');
  if(cnt) cnt.textContent = (PROJ_FILTER ? projFilterLabel() + ' ' : '') + rows.length + ' 个项目';

  var pg = '';
  pg += '<span class="' + (PROJ_PAGE <= 1 ? 'dis' : '') + '" onclick="gotoProj(' + (PROJ_PAGE-1) + ')">上一页</span>';
  for(var k=1;k<=pages;k++) pg += '<span class="' + (k === PROJ_PAGE ? 'on' : '') + '" onclick="gotoProj(' + k + ')">' + k + '</span>';
  pg += '<span class="' + (PROJ_PAGE >= pages ? 'dis' : '') + '" onclick="gotoProj(' + (PROJ_PAGE+1) + ')">下一页</span>';
  var pb = document.getElementById('projPager'); if(pb) pb.innerHTML = pg;
}

function gotoProj(n){
  var rows = projFiltered();
  var pages = Math.max(1, Math.ceil(rows.length / PROJ_SIZE));
  if(n < 1 || n > pages) return;
  PROJ_PAGE = n; renderProjCards();
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ---------- 动作（原型内只做状态推进提示） ---------- */
function projAct(act, id){
  return wfAct(act, id);
}

/* ---------- 模板：v-manage ---------- */
function tplPagemanage(){
  return `<div class="view" id="v-manage">
  <div class="panel">
    <div class="panel-h">
      <h3>项目列表 <span class="tg tg-n" id="projCnt">7 个项目</span></h3>
      <div class="flex" style="gap:8px">
        <button class="btn btn-o btn-xs" onclick="openFlow()">项目节点与状态</button>
        <button class="btn btn-p btn-xs" onclick="go('v-create')">＋ 创建项目</button>
      </div>
    </div>
    <div class="panel-b" style="border-top:1px solid var(--line2)">
      <div class="flex">
        <span class="muted" style="font-size:12.4px;white-space:nowrap">状态</span>
        <select class="inp" id="projFState" aria-label="按节点筛选项目状态" title="状态筛选（按节点分组）" style="max-width:170px" onchange="projState(this.value)"></select>
        <input class="inp" id="projKw" placeholder="活动名称 / 项目编号 / 服务商" style="max-width:300px" oninput="PROJ_PAGE=1;renderProjCards()">
        <button class="btn btn-p btn-xs" onclick="renderProjCards()">查询</button>
        <button class="btn btn-g btn-xs" onclick="document.getElementById('projKw').value='';projState('')">重置</button>
      </div>
    </div>
  </div>

  <div id="projList"></div>

  <div class="pager">
    <div class="pg-info">按创建时间倒序，每页 15 条</div>
    <div class="pg-btns" id="projPager"></div>
  </div>
</div>`;
}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-manage",
  title: "项目管理",
  crumb: "活动运营 / 项目管理",
  group: "活动运营",
  template: tplPagemanage
});

/* ---------- 推送服务商前确认 ---------- */
var PUSH_ID = '';
function openPushConfirm(id){
  var p = projByAny(id); if(!p) return;
  PUSH_ID = id;
  var el = document.getElementById('pushProjName');
  if(el) el.textContent = p.name + ' · 项目编号 ' + (p.code || p.id) + ' · 共 ' + (projConfigStat(p.id).list || []).length + ' 个计划';
  openDrawer('dw-push');
}
function pushConfirmDo(){
  closeDrawer();
  if(PUSH_ID) wfPushDo(PUSH_ID);
  PUSH_ID = '';
}
MT.defineDrawer('dw-push', function(){
  return '<div class="drawer" id="dw-push" style="width:560px">'
    + '<div class="dw-h"><h3>推送服务商前确认</h3><span class="dw-x" onclick="closeDrawer()">×</span></div>'
    + '<div class="dw-b">'
    + '<div class="note b" style="margin-top:0"><b id="pushProjName"></b></div>'
    + '<div style="font-size:13.4px;line-height:1.95;color:#2f3a36;margin-top:14px">'
    + '请确认：与本项目配置名单中的零售商已达成合作，且已通知零售商打开单品回传操作。避免因名单信息错漏，或合作尚未达成、后续中止等原因产生消费者客诉，或其他数据披露风险。'
    + '</div>'
    + '<div class="note" style="margin-top:16px">确认后将向服务商发送活动链接与批次计划邮件，推送后计划批次与机制字段不可再修改。</div>'
    + '</div>'
    + '<div class="dw-f"><div class="lft">请核对名单后再推送</div><div class="rgt">'
    + '<button class="btn btn-g" onclick="closeDrawer()">暂不推送</button>'
    + '<button class="btn btn-p" onclick="pushConfirmDo()">确认推送</button>'
    + '</div></div></div>';
});
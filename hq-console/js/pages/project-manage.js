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

/* ---------- 卡片 ---------- */
function projCard(p, mode){
  var st = PROJ_STATES[p.state];
  /* 状态标签右侧：超时未确认、执行中的计划/批次/页面数量 */
  var beside = '';
  if(p.waitText){
    beside += '<span class="tg tg-r">' + pnEsc(p.waitText) + '</span>';
  }
  if(p.state === 'running' && p.progress){
    beside += '<span class="tg tg-s" style="background:var(--brand-l);color:var(--brand-d)">'
      + '计划 ' + p.progress.plan + ' / 批次 ' + p.progress.batch + ' / 页面 ' + p.progress.page + ' 启用</span>';
  }
  if(p.state === 'approved' && p.pushTo){
    beside += '<span class="tg tg-a">审批已通过，待推送</span>';
  }
  if(p.state === 'approved' || p.state === 'confirmed'){
    var cfg = (typeof projConfigStat === 'function') ? projConfigStat(p.id) : null;
    if(cfg && cfg.total){
      beside += '<span class="tg ' + (cfg.todo ? 'tg-a' : 'tg-g') + '">待补配置 ' + cfg.ready + '/' + cfg.total + '</span>';
    }
  }

  var kv = ''
    + '<div class="kv-i"><span class="k">创建业务部门</span><span class="v">' + pnEsc(p.bu) + '</span></div>'
    + '<div class="kv-i"><span class="k">投放平台</span><span class="v">' + pnEsc(p.platform || '—') + '</span></div>'
    + '<div class="kv-i"><span class="k">预算来源</span><span class="v">' + pnEsc(p.source || '—') + '</span></div>'
    + '<div class="kv-i"><span class="k">核销预算</span><span class="v">' + pnEsc(p.budget) + '</span></div>'
    + '<div class="kv-i"><span class="k">活动周期</span><span class="v">' + pnEsc(p.period) + '</span></div>'
    + '<div class="kv-i"><span class="k">服务商</span><span class="v">' + pnEsc(p.vendor) + '</span></div>'
    + '<div class="kv-i"><span class="k">机制</span><span class="v">' + pnEsc(p.mech) + '</span></div>'
    + '<div class="kv-i"><span class="k">PO 单号</span><span class="v sx-mono">' + pnEsc(p.po) + '</span></div>';

  var btns = (mode === 'approve') ? approveButtons(p) : projButtons(p);

  return '<div class="pcard" data-state="' + p.state + '">'
    + '<div class="pcard-h">'
    +   '<div><h4>' + pnEsc(p.name) + ' <span class="tg ' + st.cls + ' nmst">' + st.label + '</span>' + beside + '</h4></div>'
    +   '<div class="rt"><span class="sx-mono">' + pnEsc(p.orderNo) + '</span></div>'
    + '</div>'
    + '<div class="kv">' + kv + '</div>'
    + '<div class="pcard-f"><span class="savet">最近保存 ' + pnEsc(p.saved) + '</span>'
    +   '<div class="pcard-btns">' + btns + '</div></div>'
    + '</div>';
}

/* ---------- 审批列表用按钮：与项目管理同一张卡片，只换动作 ---------- */
function approveButtons(p){
  var q = "'" + p.id + "'";
  if(p.state === 'pending'){
    return '<button class="btn btn-d btn-xs" onclick="projApprove(' + q + ',\'reject\')">驳回</button>'
         + '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">查看详情</button>'
         + '<button class="btn btn-p btn-xs" onclick="projApprove(' + q + ',\'agree\')">同意</button>';
  }
  return '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">查看详情</button>';
}

/* ---------- 按状态给动作按钮（不加任何说明文字） ---------- */
function projButtons(p){
  var q = '\'' + p.id + '\'';
  switch(p.state){
    case 'draft':
      return '<button class="btn btn-o btn-xs" onclick="go(\'v-create\')">继续编辑</button>'
           + '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">活动详情</button>'
           + '<button class="btn btn-d btn-xs" onclick="projAct(\'del\',' + q + ')">删除草稿</button>'
           + '<button class="btn btn-p btn-xs" onclick="projAct(\'submit\',' + q + ')">提交审批</button>';
    case 'pending':
      return '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">活动详情</button>'
           + '<button class="btn btn-d btn-xs" onclick="projAct(\'withdraw\',' + q + ')">撤回</button>';
    case 'approved':
      return '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">活动详情</button>'
            + '<button class="btn btn-o btn-xs" onclick="wfEnterConfig(' + q + ')">完善批次计划</button>'
           + '<button class="btn btn-d btn-xs" onclick="projAct(\'stop\',' + q + ')">终止</button>'
           + '<button class="btn btn-p btn-xs" onclick="projAct(\'push\',' + q + ')">推送服务商</button>';
    case 'confirmed':
      return '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">活动详情</button>'
           + '<button class="btn btn-o btn-xs" onclick="projAct(\'resend\',' + q + ')">重发邮件</button>'
           + '<button class="btn btn-o btn-xs" onclick="projAct(\'copy\',' + q + ')">复制确认链接</button>'
           + '<button class="btn btn-d btn-xs" onclick="projAct(\'stop\',' + q + ')">终止</button>';
    case 'running':
      return '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">活动详情</button>'
           + '<button class="btn btn-o btn-xs" onclick="openProjPlans(' + q + ')">计划与批次</button>'
           + '<button class="btn btn-o btn-xs" onclick="go(\'v-h5\')">领券页面</button>'
           + '<button class="btn btn-p btn-xs" onclick="go(\'v-board\')">数据看板</button>';
    case 'stopped':
      return '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">活动详情（只读）</button>'
           + '<button class="btn btn-g btn-xs" onclick="projAct(\'copyNew\',' + q + ')">复制为新项目</button>';
  }
  return '';
}

/* ---------- 顶部状态条：与列表联动 ---------- */
function renderProjSteps(){
  var box = document.getElementById('projSteps'); if(!box) return;
  var h = '<div class="s' + (PROJ_FILTER === '' ? ' on' : '') + '" onclick="projState(\'\')">'
        + '<span class="c">' + projCount('') + '</span>全部</div>';
  PROJ_STATE_ORDER.forEach(function(k){
    var n = projCount(k);
    h += '<div class="s' + (PROJ_FILTER === k ? ' on' : '') + '" onclick="projState(\'' + k + '\')">'
       + '<span class="c' + (n ? '' : ' mut') + '">' + n + '</span>' + PROJ_STATES[k].label + '</div>';
  });
  box.innerHTML = h;
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
  renderProjCards();
}

/* ---------- 列表 ---------- */
function renderProjCards(){
  renderProjSteps();

  var box = document.getElementById('projList'); if(!box) return;
  var rows = projFiltered();

  /* 关键词过滤（活动名称 / 活动 ID / 项目单号 / 服务商 / 部门） */
  var kw = ((document.getElementById('projKw') || {}).value || '').trim().toLowerCase();
  if(kw){
    rows = rows.filter(function(p){
      return (p.name + ' ' + p.id + ' ' + p.orderNo + ' ' + p.vendor + ' ' + p.bu).toLowerCase().indexOf(kw) >= 0;
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
  if(cnt) cnt.textContent = (PROJ_FILTER ? PROJ_STATES[PROJ_FILTER].label + ' ' : '') + rows.length + ' 个项目';

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

function projActLegacy(act, id){
  var p = projByAny(id);
  if(!p) return;
  var map = {
    submit:'已提交审批，等待数字化中心审批',
    withdraw:'已撤回，项目回到草稿',
    push:'已推送服务商，等待服务商确认',
    resend:'确认邮件已重发',
    copy:'确认链接已复制',
    stop:'已终止；预算额度将释放回部门池',
    del:'草稿已删除',
    copyNew:'已复制为新草稿'
  };
  MT.toast(map[act] ? map[act] + '（' + p.name + '）' : '已执行');
}

/* ---------- 模板：v-manage ---------- */
function tplPagemanage(){
  return `<div class="view" id="v-manage">
  <div class="panel">
    <div class="panel-h">
      <h3>项目列表 <span class="tg tg-n" id="projCnt">7 个项目</span></h3>
      <div class="flex" style="gap:8px">
        <button class="btn btn-o btn-xs" onclick="openFlow()">状态流转与执行动作</button>
        <button class="btn btn-p btn-xs" onclick="go('v-create')">＋ 创建项目</button>
      </div>
    </div>
    <div id="projSteps" class="steps"></div>
    <div class="panel-b" style="border-top:1px solid var(--line2)">
      <div class="flex">
        <input class="inp" id="projKw" placeholder="活动名称 / 项目单号 / 服务商" style="max-width:300px" oninput="PROJ_PAGE=1;renderProjCards()">
        <button class="btn btn-p btn-xs" onclick="renderProjCards()">查询</button>
        <button class="btn btn-g btn-xs" onclick="document.getElementById('projKw').value='';PROJ_PAGE=1;renderProjCards()">重置</button>
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

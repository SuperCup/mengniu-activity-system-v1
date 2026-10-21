/* =============================================================================
 * pages/plan-batch.js — 计划与批次
 * 进入方式（本次调整）：
 *   · 从左侧菜单进入：不显示项目信息，展示全部计划，并按所属项目 / 计划状态 / 关键字筛选；不提供创建
 *   · 从项目管理点「计划与批次」进入：带出该项目，只看该项目，可在此创建计划
 * ========================================================================== */

/** 当前作用域项目；null 表示全部 */
var PLAN_SCOPE = null;
var PLAN_SCOPE_KEEP = false;

/* ---------- 入口 ---------- */
function openProjPlans(id){
  PLAN_SCOPE = projByAny(id);
  if(!PLAN_SCOPE){ MT.toast('未找到该项目', 'err'); return; }
  PLAN_SCOPE_KEEP = true;
  go('v-plan');
  PLAN_SCOPE_KEEP = false;
}

/** 项目三项基本信息（与创建页一、二、三一致），只读展示在计划与批次页 */
function planProjInfo(p){
  var own = String(p.owner || '').split('·');
  var oname = (own[0] || '').trim();
  var ophone = (own[1] || '').trim();
  var vend = (typeof vendorByName === 'function') ? vendorByName(p.vendor) : null;
  var cms = vend && vend.cms && vend.cms[0];
  var contact = {
    n: p.vendorContact || (cms && cms.n) || '',
    e: p.vendorMail || (cms && cms.e) || ''
  };

  function row(k, v){
    return '<div class="pinfo-row"><span class="k">' + k + '</span><span class="v">' + (v ? pnEsc(v) : '—') + '</span></div>';
  }

  return '<div class="pinfo">'
    + '<div class="pinfo-sec"><h5>一、基本信息</h5>'
      + row('项目名称', p.name)
      + row('项目目标', p.goal || '拉新 + 复购')
      + row('投放平台', p.platform)
      + row('活动周期', p.period)
      + row('活动负责人', oname)
      + row('联系方式', ophone)
    + '</div>'
    + '<div class="pinfo-sec"><h5>二、预算与费用科目</h5>'
      + row('PO 单号', p.po)
      + row('核销预算（元）', p.budget)
      + row('费用科目', p.subject)
      + row('承担主体', p.bearer || p.bu)
      + row('预算来源', p.source)
    + '</div>'
    + '<div class="pinfo-sec"><h5>三、服务商信息</h5>'
      + row('服务商', p.vendor)
      + row('对接联系人', contact.n)
      + row('邮箱', contact.e)
    + '</div>'
    + '</div>';
}

/** 当前作用域下的计划 */
function planScoped(){
  if(!PLAN_SCOPE) return PLANS.slice();
  return PLANS.filter(function(p){ return p.proj === PLAN_SCOPE.id; });
}

/* ---------- 顶部项目信息条 ---------- */
function renderPlanScope(){
  var bar = document.getElementById('planProjBar');
  var p = PLAN_SCOPE;
  if(!bar) return;

  var filterBar = document.getElementById('planFilterBar');
  if(!p){
    bar.style.display = 'none';
    if(filterBar) filterBar.style.display = '';
    planFillProjFilter();
    if(typeof renderPlans === 'function') renderPlans();
    return;
  }
  bar.style.display = '';
  if(filterBar) filterBar.style.display = 'none';

  var st = PROJ_STATES[p.state];
  var blocked = (p.state === 'draft' || p.state === 'pending');
  var ended = (p.state === 'stopped');
  var canEdit = (p.state === 'approved' || p.state === 'running');
  var canCreate = !blocked && !ended;
  var plans = planScoped();
  var briefs = (p.planBrief || []).map(function(b){ return b.name; }).join('、');

  bar.innerHTML = '<div class="panel-h">'
    + '<h3>' + pnEsc(p.name) + ' <span class="tg ' + st.cls + '">' + st.label + '</span></h3>'
    + '<div class="flex" style="gap:8px">'
    +   (canCreate ? '<button class="btn btn-p btn-xs" onclick="openPlanNew()">＋ 创建计划</button>' : '')
    + '</div>'
    + '</div><div class="panel-b">'
    + planProjInfo(p)
    + (blocked ? '<div class="note b" style="margin-top:12px">该项目当前为「' + st.label + '」，审批通过后才可补充计划明细。</div>' : '')
    + (ended ? '<div class="note b" style="margin-top:12px">该项目已终止，计划与批次仅可查看，不可新增。</div>' : '')
    + (canEdit && !plans.length && briefs ? '<div class="note b" style="margin-top:12px">报批时创建的批次计划：<b>' + briefs + '</b>。按计划逐个补充执行配置，补完再推送服务商。</div>' : '')
    + (canEdit && plans.length ? '<div class="note b" style="margin-top:12px">按计划逐个点「补充配置」填写该批次的券名称、面额、门槛、可用时间、发放上限，全部补齐后才可推送服务商。</div>' : '')
    + '</div>';

  /* 作用域变化后重算表格 */
  if(typeof renderPlans === 'function') renderPlans();
}

function goPlanAll(){
  PLAN_SCOPE = null;
  renderPlanScope();
}

/** 菜单进入时，所属项目下拉只列当前计划里出现过的项目 */
function planFillProjFilter(){
  var sel = document.getElementById('planFProj');
  if(!sel) return;
  var cur = sel.value;
  var seen = {};
  var h = '<option value="">全部项目</option>';
  PLANS.forEach(function(p){
    var id = p.projectId || p.proj || '';
    if(!id || seen[id]) return;
    seen[id] = 1;
    var proj = (typeof projByAny === 'function') ? projByAny(id) : null;
    h += '<option value="' + pnEsc(id) + '">' + pnEsc(proj ? proj.name : id) + '</option>';
  });
  sel.innerHTML = h;
  sel.value = cur;
}

/* ---------- 模板：v-plan ---------- */
function tplPageplan(){
  return `<div class="view" id="v-plan">
  <div class="panel" id="planProjBar" style="display:none"></div>

  <div class="panel">
    <div class="panel-h">
      <h3>计划与批次 <span class="tg tg-n" id="pbPlanCnt">3 个计划</span></h3>
    </div>
    <div class="bf" id="planFilterBar">
      <div class="fi"><label>所属项目</label>
        <select id="planFProj" onchange="PLAN_PAGE=1;renderPlans()"><option value="">全部项目</option></select>
      </div>
      <div class="fi"><label>计划状态</label>
        <select id="planFStat" onchange="PLAN_PAGE=1;renderPlans()">
          <option value="">全部状态</option>
          <option value="待完善">待完善</option>
          <option value="待配置">待配置</option>
          <option value="进行中">进行中</option>
          <option value="已结束">已结束</option>
          <option value="已中止">已中止</option>
        </select>
      </div>
      <div class="fi"><label>关键字</label>
        <input id="planFKw" placeholder="计划名称 / 计划 ID / 批次号" oninput="PLAN_PAGE=1;renderPlans()">
      </div>
    </div>
    <div class="panel-b" style="padding:0">
      <div class="tw scroll" style="border:none;box-shadow:none;border-radius:0">
        <table class="bt pb-plan">
          <thead><tr>
            <th style="width:128px">计划 ID</th>
            <th style="width:140px">所属项目</th>
            <th style="width:140px">计划 / 券名称</th>
            <th style="width:96px">券面额 / 门槛</th>
            <th style="width:80px">发放数量</th>
            <th style="width:96px">计划金额</th>
            <th style="width:108px">有效期</th>
            <th style="width:100px">批次号</th>
            <th style="width:80px">计划状态</th>
            <th style="width:72px">操作</th>
          </tr></thead>
          <tbody id="pbPlanBody"></tbody>
        </table>
        <div class="pager">
        <div class="pg-info">共 <b id="planTotal">0</b> 条计划，每页 15 条</div>
        <div class="pg-btns" id="planPager"></div>
      </div>
    </div>
    </div>
  </div>
</div>`;
}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-plan",
  title: "计划与批次",
  crumb: "活动运营 / 计划与批次",
  group: "活动运营",
  template: tplPageplan
});

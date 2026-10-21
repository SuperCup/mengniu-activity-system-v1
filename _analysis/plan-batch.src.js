/* =============================================================================
 * pages/plan-batch.js — 计划与批次
 * 进入方式（本次调整）：
 *   · 从左侧菜单进入：不显示项目信息，展示全部计划与批次
 *   · 从项目管理点「计划与批次 / 补充计划明细」进入：带出该项目基础信息，只看该项目
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

/** 当前作用域下的计划 */
function planScoped(){
  if(!PLAN_SCOPE) return PLANS.slice();
  return PLANS.filter(function(p){ return p.proj === PLAN_SCOPE.id; });
}

/* ---------- 顶部项目信息条 ---------- */
function renderPlanScope(){
  var bar = document.getElementById('planProjBar');
  var tip = document.getElementById('planScopeTip');
  var p = PLAN_SCOPE;
  if(!bar) return;

  if(!p){
    bar.style.display = 'none';
    if(tip) tip.innerHTML = '全部项目';
    return;
  }
  bar.style.display = '';

  var st = PROJ_STATES[p.state];
  var canEdit = (p.state === 'approved' || p.state === 'running');
  var plans = planScoped();
  var batchN = plans.filter(function(x){ return !!x.bat; }).length;

  bar.innerHTML = '<div class="panel-h">'
    + '<h3>' + pnEsc(p.name) + ' <span class="tg ' + st.cls + '">' + st.label + '</span></h3>'
    + '<div class="flex" style="gap:8px">'
    +   '<button class="btn btn-o btn-xs" onclick="openProjDetail(\'' + p.id + '\')">项目详情</button>'
    +   '<button class="btn btn-g btn-xs" onclick="goPlanAll()">查看全部计划</button>'
    + '</div>'
    + '</div><div class="panel-b"><div class="projbar">'
    + '<div class="pi"><span class="k">项目单号</span><span class="v sx-mono">' + pnEsc(p.orderNo) + '</span></div>'
    + '<div class="pi"><span class="k">活动 ID</span><span class="v sx-mono">' + pnEsc(p.id) + '</span></div>'
    + '<div class="pi"><span class="k">创建业务部门</span><span class="v">' + pnEsc(p.bu) + '</span></div>'
    + '<div class="pi"><span class="k">服务商</span><span class="v">' + pnEsc(p.vendor) + '</span></div>'
    + '<div class="pi"><span class="k">核销预算</span><span class="v">' + pnEsc(p.budget) + '</span></div>'
    + '<div class="pi"><span class="k">计划 / 批次</span><span class="v"><b>' + plans.length + ' / ' + batchN + '</b></span></div>'
    + '</div>'
    + (canEdit ? '' : '<div class="note b" style="margin-top:10px">该项目当前为「' + st.label + '」，审批通过后才可补充计划明细。</div>')
    + '</div>';

  if(tip) tip.innerHTML = '当前项目：<b>' + pnEsc(p.name) + '</b>';
}

function goPlanAll(){
  PLAN_SCOPE = null;
  renderPlanScope();
  renderPlans();
}

/* ---------- 模板：v-plan ---------- */
function tplPageplan(){
  return `<div class="view" id="v-plan">
  <div class="panel" id="planProjBar" style="display:none"></div>

  <div class="panel">
    <div class="panel-h">
      <h3>计划与批次 <span class="tg tg-n" id="pbPlanCnt">3 个计划</span></h3>
      <div class="flex" style="gap:8px">
        <span class="muted" id="planScopeTip">全部项目</span>
        <button class="btn btn-p btn-xs" onclick="openPlanNew()">＋ 创建计划</button>
      </div>
    </div>
    <div class="panel-b" style="padding:0">
      <div class="tw scroll" style="border:none;box-shadow:none;border-radius:0">
        <table class="bt pb-plan">
          <thead><tr>
            <th style="width:150px">计划 ID</th>
            <th style="width:120px">计划名称</th>
            <th style="width:104px">券面额 / 门槛</th>
            <th style="width:88px">发放数量</th>
            <th style="width:104px">计划金额</th>
            <th style="width:120px">有效期</th>
            <th style="width:112px">对应批次</th>
            <th style="width:88px">校验</th>
            <th style="width:120px">操作</th>
          </tr></thead>
          <tbody id="pbPlanBody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-h">
      <h3>批次明细 <span class="tg tg-n" id="pbBatCnt">3 个批次</span></h3>
      <div class="flex">
        <span class="muted">批次与计划一一对应，批次不可多于计划</span>
        <button class="btn btn-o btn-xs">导出</button>
      </div>
    </div>
    <div class="bf">
      <div class="fi"><label>对应计划：</label>
        <select id="pbBatPlan" onchange="renderBatches()"><option value="">全部计划</option></select>
      </div>
      <div class="fi"><label>状态：</label>
        <select id="pbBatStat" onchange="renderBatches()">
          <option value="">全部状态</option>
          <option value="待补充批次">待补充批次</option>
          <option value="已审核">已审核</option>
          <option value="已终止">已终止</option>
        </select>
      </div>
      <div class="fi"><label>关键字：</label>
        <input class="inp" id="pbBatRet" placeholder="批次号 / 计划名 / 零售商" style="max-width:220px" oninput="renderBatches()">
      </div>
    </div>
    <div class="panel-b" style="padding:0">
      <div class="tw scroll" style="border:none;box-shadow:none;border-radius:0">
        <table class="bt">
          <thead><tr>
            <th style="width:112px">批次号</th>
            <th style="width:130px">对应计划 ID</th>
            <th style="width:130px">批次名称</th>
            <th style="width:150px">券规则</th>
            <th style="width:120px">有效期</th>
            <th style="width:92px">状态</th>
            <th style="width:88px">发放上限</th>
            <th style="width:110px">已核销</th>
            <th style="width:120px">操作</th>
          </tr></thead>
          <tbody id="batBody"></tbody>
        </table>
      </div>
    </div>
    <div class="panel-b" style="border-top:1px solid var(--line2);padding-top:12px">
      <div class="note b" style="margin:0"><b>一一对应规则：</b>每个计划只对应一个批次，批次数量必须等于计划数量；服务商上传的批次表须含「计划 ID」列，与计划表的计划 ID 严格匹配。批次明细与核销订单由服务商按批次同步回传，平台以批次为最小统计单位。</div>
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

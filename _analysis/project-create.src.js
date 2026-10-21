/* =============================================================================
 * pages/project-create.js — 项目创建（两段式：① 报批 ② 补信息）
 * 对应待确认清单标黄项 2：两段式「补信息」环节归属——
 *   第一段（报批，本页）：活动基本信息、预算、活动机制（满减金额）、零售商范围
 *   第二段（补信息）：创建项目 → 创建计划，含活动机制、开始时间、结束时间、
 *   零售商明细（导入）、商品明细（导入），见 components/plan-drawer.js
 * 另含标黄项 12：服务商选定后自动带出唯一对接联系人 / 邮箱，不再让人挑。
 * ========================================================================== */

/* ---------- 服务商 → 唯一联系人自动带出 ---------- */
function initProjVendor(){
  var sel = document.getElementById('projVendor');
  if(!sel) return;
  var h = '<option value="">请选择服务商</option>';
  VENDORS.forEach(function(v, i){ h += '<option value="' + i + '">' + v.name + '</option>'; });
  sel.innerHTML = h;
  projVendorChange('');
  if(VENDORS.length > 1){ sel.value = '1'; projVendorChange('1'); }
  else if(VENDORS.length){ sel.value = '0'; projVendorChange('0'); }
}

/** 选公司 → 自动带出唯一联系人（只读，不提供下拉选择） */
function projVendorChange(v){
  var nameEl = document.getElementById('projContactName');
  var mailEl = document.getElementById('projContactMail');
  var tipEl  = document.getElementById('projContactTip');
  if(!nameEl) return;

  if(v === '' || v == null){
    nameEl.textContent = '请先选择服务商';
    if(mailEl) mailEl.textContent = '';
    if(tipEl) tipEl.textContent = '一个服务商只维护一个对接联系人 / 邮箱';
    return;
  }
  var d = VENDORS[parseInt(v, 10)];
  var c = d && d.cms && d.cms[0];
  if(!c || !c.n){
    nameEl.textContent = '该服务商未配置对接人';
    if(mailEl) mailEl.textContent = '';
    if(tipEl){
      tipEl.innerHTML = '请先到「系统管理 → 服务商配置」补充对接人';
      tipEl.className = 'fld-hint err';
    }
    return;
  }
  nameEl.textContent = c.n;
  if(mailEl) mailEl.textContent = c.e;
  if(tipEl){
    tipEl.innerHTML = '审批通过后，活动链接与推送邮件只发送到该邮箱；联系人由服务商内部自行分配跟进，不在本系统体现';
    tipEl.className = 'fld-hint';
  }
}

/* ---------- PO 单号 → 预算信息带出 ---------- */
function poLookup(){
  var i = document.getElementById('poNo'); if(!i) return;
  var tag = document.getElementById('poTag');
  var b = document.getElementById('poBudget'), sj = document.getElementById('poSubj'),
      og = document.getElementById('poOrg'), sr = document.getElementById('poSrc');
  var key = (i.value || '').trim().toUpperCase();
  var d = PO_DB[key];
  if(d){
    b.value = d.budget; sj.value = d.subj; og.value = d.org; sr.value = d.src;
    document.getElementById('poHint').textContent = '由 PO 单带出 · 金额池剩余 ' + d.left;
    tag.className = 'tg tg-g'; tag.textContent = '✓ 已校验';
  } else if(key === ''){
    b.value = ''; sj.value = ''; og.value = ''; sr.value = '';
    document.getElementById('poHint').textContent = '由 PO 单带出';
    tag.className = 'tg tg-n'; tag.textContent = '待填写 PO 单号';
  } else {
    b.value = ''; sj.value = ''; og.value = ''; sr.value = '';
    document.getElementById('poHint').textContent = '由 PO 单带出';
    tag.className = 'tg tg-r'; tag.textContent = '✗ PO 单不存在或未审批';
  }
}

/** 提交审批：报批前的前置校验提示 */
function submitProject(){
  var missing = [];
  if(!(document.getElementById('projName').value || '').trim()) missing.push('项目名称');
  if(!(document.getElementById('projOwner').value || '').trim()) missing.push('活动负责人');
  if(!(document.getElementById('poNo').value || '').trim()) missing.push('PO 单号');
  if(!PLANS.length) missing.push('至少一个批次计划');
  if(missing.length){ MT.toast('提交前请补充：' + missing.join('、'), 'err'); return; }
  MT.toast('已提交审批。审批通过后进入第二段「补信息」，在计划内补齐券文案等细节');
}

/* ---------- 模板：v-create ---------- */
function tplPagecreate(){
  return `<div class="view" id="v-create">
  <div class="panel">
    <div class="panel-h">
      <h3>新建项目</h3>
      <div class="flex">
        <span class="muted">项目单号：提交后自动生成</span>
        <span class="tg tg-n">草稿</span>
      </div>
    </div>
    <div class="panel-b">

      <!-- 两段式进度 -->
      <div class="stagebar">
        <div class="sg on"><span class="n">1</span><div><b>报批</b><small>本页：基本信息 / 预算 / 机制 / 服务商</small></div></div>
        <div class="sg"><span class="n">2</span><div><b>补信息</b><small>审批通过后：在「创建计划」内补券文案与明细</small></div></div>
      </div>
      <div class="note b">
        <b>两段式说明：</b>报批阶段只填最小审批字段集（项目基本信息、预算、活动机制与零售商范围）；券名称、文案等细节与零售商 / 商品明细在审批通过后的第二段「补信息」中补齐，入口为本页「四、批次计划 → 创建计划」。
      </div>

      <!-- 一、基本信息 -->
      <div class="st">一、基本信息</div>
      <div class="fg c2">
        <div class="fr"><label>项目名称<em>*</em></label><input class="inp" id="projName" value="双节常温奶满减"></div>
        <div class="fr"><label>项目目标<em>*</em></label><input class="inp" value="拉新 + 复购"></div>
      </div>
      <div class="fr">
        <label>投放平台<em>*</em></label>
        <div class="locked"><b>微信支付</b>　一期仅支持微信支付单平台</div>
      </div>
      <div class="fg c2">
        <div class="fr"><label>活动周期<em>*</em></label>
          <div class="flex" style="gap:8px"><input class="inp" value="2026-12-20" style="flex:1"><span class="muted">至</span><input class="inp" value="2027-01-05" style="flex:1"></div>
        </div>
        <div class="fr"><label>活动负责人 / 联系方式<em>*</em></label><input class="inp" id="projOwner" value="李雪 · 15269175821"></div>
      </div>
      <div class="fg c2">
        <div class="fr">
          <label>活动机制（满减金额）<em>*</em></label>
          <input class="inp" value="常温奶满 99 减 15 / 礼盒满 129 减 20">
          <div class="fld-hint">报批只需给出机制口径，具体券文案在第二段补齐</div>
        </div>
        <div class="fr">
          <label>零售商范围<em>*</em></label>
          <input class="inp" value="华东区 · 商超渠道">
          <div class="fld-hint">报批只填范围；门店级明细在第二段「创建计划」中导入</div>
        </div>
      </div>

      <!-- 二、预算与费用科目 -->
      <div class="st" style="margin-top:26px">二、预算与费用科目</div>
      <div class="fr"><label>PO 单号<em>*</em></label>
        <div class="flex" style="gap:8px;align-items:center">
          <input class="inp" id="poNo" value="POCN68-0000014722" style="flex:1;max-width:340px" oninput="poLookup()">
          <span class="tg tg-g" id="poTag">✓ 已校验</span>
        </div>
        <div class="fld-hint">输入 PO 单号后自动带出下方预算信息；PO 单须已审批通过且剩余可用额度充足</div>
      </div>
      <div class="fg c2" style="margin-top:15px" id="poAuto">
        <div class="fr"><label>核销预算（元）</label><input class="inp" id="poBudget" value="400,000.00" readonly style="background:var(--bg-soft);color:var(--ink-60)"><div class="fld-hint" id="poHint">由 PO 单带出</div></div>
        <div class="fr"><label>费用科目</label><input class="inp" id="poSubj" value="市场推广费-促销费用" readonly style="background:var(--bg-soft);color:var(--ink-60)"></div>
        <div class="fr"><label>承担主体（创建业务部门）</label><input class="inp" id="poOrg" value="BU03 华东事业部" readonly style="background:var(--bg-soft);color:var(--ink-60)"></div>
        <div class="fr"><label>预算来源</label><input class="inp" id="poSrc" value="集团统投" readonly style="background:var(--bg-soft);color:var(--ink-60)"></div>
      </div>

      <!-- 三、服务商信息 -->
      <div class="st" style="margin-top:26px">三、服务商信息</div>
      <div class="fg c2">
        <div class="fr"><label>服务商<em>*</em></label>
          <select class="inp" id="projVendor" onchange="projVendorChange(this.value)"></select>
        </div>
        <div class="fr">
          <label>对接联系人 / 邮箱<em>*</em></label>
          <div class="locked" style="justify-content:flex-start;gap:10px">
            <b id="projContactName">请先选择服务商</b>
            <span class="mut" id="projContactMail"></span>
            <span class="lk">自动带出</span>
          </div>
          <div class="fld-hint" id="projContactTip">一个服务商只维护一个对接联系人 / 邮箱，不可选择</div>
        </div>
      </div>

      <!-- 四、批次计划（第二段补信息） -->
      <div class="st" style="margin-top:26px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span>四、批次计划 <span class="tg tg-a xs">第二段 · 补信息</span></span>
        <span class="flex right" style="gap:8px">
          <button class="btn btn-o btn-xs" onclick="openPlanNew()">＋ 创建计划</button>
        </span>
      </div>
      <div class="note" style="margin-top:0">
        计划的「活动机制 / 开始时间 / 结束时间 / 零售商明细 / 商品明细」都在创建计划时填写，其中零售商与商品通过<strong>导入名单</strong>录入（不再按零售商 + 区域圈选）。
      </div>
      <div class="panel" style="margin-top:12px">
        <table class="bt" id="planTbl" style="table-layout:fixed">
          <thead><tr>
            <th style="width:4%">序号</th>
            <th style="width:10.5%">计划名</th>
            <th style="width:14%">机制</th>
            <th style="width:17.5%">起止时间</th>
            <th style="width:14%">零售商门店</th>
            <th style="width:15%">活动商品</th>
            <th style="width:11%">预算分配</th>
            <th style="width:14%">操作</th>
          </tr></thead>
          <tbody id="planBody"></tbody>
        </table>
        <div class="pager">
          <div class="pg-info">共 <b id="planTotal">0</b> 条计划，每页 5 条</div>
          <div class="pg-btns" id="planPager"></div>
        </div>
      </div>

      <div class="panel-f">
        <button class="btn btn-g">保存草稿</button>
        <button class="btn btn-o" onclick="openFlow()">流程说明</button>
        <button class="btn btn-p" onclick="submitProject()">提交审批</button>
      </div>
    </div>
  </div>
</div>`;
}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-create",
  title: "项目创建",
  crumb: "活动运营 / 项目创建",
  group: "活动运营",
  template: tplPagecreate
});

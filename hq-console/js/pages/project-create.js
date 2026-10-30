/* =============================================================================
 * pages/project-create.js — 项目创建（提交审批）
 * 对应待确认清单标黄项 2：计划明细在审批通过后补充，不在报批阶段填写——
 *   状态①提交审批（本页）：活动基本信息 + 批次计划（计划名称、券名称、机制、发券方式、活动零售商、活动商品）
 *   状态②审批通过后补充：计划明细（机制、起止时间、零售商门店、商品），见 components/plan-drawer.js
 * 另含标黄项 12：服务商选定后自动带出唯一对接联系人 / 邮箱，不再让人挑。
 * ========================================================================== */

/* ---------- 活动负责人：通讯录搜索选中，联系方式自动带出 ---------- */
/** 默认填充创建人（当前登录人） */
function initProjOwner(){
  var nameEl = document.getElementById('projOwner');
  var phoneEl = document.getElementById('projOwnerPhone');
  if(!nameEl || !phoneEl) return;
  var u = (typeof mnCurrentUser === 'function') ? mnCurrentUser() : { name:'张明' };
  var c = (typeof contactByName === 'function') ? contactByName(u.name) : null;
  if(!c && window.CONTACTS && CONTACTS[0]) c = CONTACTS[0];
  if(!c) return;
  nameEl.value = c.name || '';
  phoneEl.value = c.phone || '';
  var idEl = document.getElementById('projOwnerId');
  if(idEl) idEl.value = c.id || '';
}

function ownerPickOpen(){
  var box = document.getElementById('ownerPicker');
  var kw = document.getElementById('ownerKw');
  if(!box) return;
  if(kw) kw.value = '';
  ownerPickRender();
  box.classList.add('on');
  setTimeout(function(){ if(kw) kw.focus(); }, 30);
}

function ownerPickClose(){
  var box = document.getElementById('ownerPicker');
  if(box) box.classList.remove('on');
}

function ownerPickRender(){
  var list = document.getElementById('ownerList');
  if(!list) return;
  var kw = (document.getElementById('ownerKw') || {}).value || '';
  var cur = (document.getElementById('projOwner') || {}).value || '';
  var rows = (typeof contactSearch === 'function') ? contactSearch(kw) : [];
  if(!rows.length){
    list.innerHTML = '<div class="empty-row" style="padding:24px 8px;text-align:center">没有匹配的联系人</div>';
    return;
  }
  list.innerHTML = rows.map(function(c){
    var on = c.name === cur ? ' on' : '';
    return '<div class="pk-i' + on + '" onclick="ownerPickSelect(\'' + pnEsc(c.id) + '\')">'
      + '<span><b>' + pnEsc(c.name) + '</b>　<span class="mut">' + pnEsc(c.title || '') + '</span></span>'
      + '<span class="d">' + pnEsc(c.dept || '') + ' · ' + pnEsc(c.phone || '') + '</span>'
      + '</div>';
  }).join('');
}

function ownerPickSelect(id){
  var c = (typeof contactById === 'function') ? contactById(id) : null;
  if(!c){ MT.toast('未找到该联系人', 'err'); return; }
  var nameEl = document.getElementById('projOwner');
  var phoneEl = document.getElementById('projOwnerPhone');
  if(nameEl) nameEl.value = c.name || '';
  if(phoneEl) phoneEl.value = c.phone || '';
  var idEl = document.getElementById('projOwnerId');
  if(idEl) idEl.value = c.id || '';
  ownerPickClose();
}

/* ---------- 项目审批人：通讯录多选（N 人） ---------- */
var CRE_APPROVERS = [];

function approverPickOpen(){
  var box = document.getElementById('apvPicker');
  if(!box) return;
  var kw = document.getElementById('apvKw');
  if(kw) kw.value = '';
  approverPickRender();
  box.classList.add('on');
  setTimeout(function(){ if(kw) kw.focus(); }, 30);
}
function approverPickClose(){
  var box = document.getElementById('apvPicker');
  if(box) box.classList.remove('on');
}
function approverPickRender(){
  var list = document.getElementById('apvList');
  if(!list) return;
  var kw = (document.getElementById('apvKw') || {}).value || '';
  var rows = (typeof contactSearch === 'function') ? contactSearch(kw) : [];
  if(!rows.length){
    list.innerHTML = '<div class="empty-row" style="padding:24px 8px;text-align:center">没有匹配的员工</div>';
    return;
  }
  list.innerHTML = rows.map(function(c){
    var on = CRE_APPROVERS.some(function(x){ return x.id === c.id; });
    return '<label class="apv-i' + (on ? ' on' : '') + '">'
      + '<input type="checkbox"' + (on ? ' checked' : '') + ' onchange="approverToggle(\'' + pnEsc(c.id) + '\')">'
      + '<span class="apv-n"><b>' + pnEsc(c.name) + '</b><span class="mut">' + pnEsc(c.id) + '</span></span>'
      + '<span class="apv-d">' + pnEsc(c.dept || '') + ' · ' + pnEsc(c.title || '') + '</span>'
      + '</label>';
  }).join('');
}
function approverToggle(id){
  var c = (typeof contactById === 'function') ? contactById(id) : null;
  if(!c) return;
  var i = -1;
  CRE_APPROVERS.forEach(function(x, k){ if(x.id === id) i = k; });
  if(i >= 0) CRE_APPROVERS.splice(i, 1);
  else CRE_APPROVERS.push({ id:c.id, name:c.name, dept:c.dept, title:c.title, phone:c.phone });
  approverPickRender();
  renderApproverTags();
}
function renderApproverTags(){
  var box = document.getElementById('apvTags');
  var cnt = document.getElementById('apvCnt');
  if(cnt) cnt.textContent = CRE_APPROVERS.length + ' 人';
  var cnt2 = document.getElementById('apvCnt2');
  if(cnt2) cnt2.textContent = CRE_APPROVERS.length;
  if(!box) return;
  if(!CRE_APPROVERS.length){
    box.innerHTML = '<span class="mut" style="font-size:12px">尚未选择审批人</span>';
    return;
  }
  box.innerHTML = CRE_APPROVERS.map(function(c){
    return '<span class="apv-tag"><b>' + pnEsc(c.name) + '</b><span>' + pnEsc(c.dept || '') + '</span>'
      + '<i onclick="approverToggle(\'' + pnEsc(c.id) + '\')">×</i></span>';
  }).join('');
}
function getApprovers(){ return CRE_APPROVERS.slice(); }

/* ---------- 服务商 → 唯一联系人自动带出 ---------- */
function initProjVendor(){
  var sel = document.getElementById('projVendor');
  if(!sel) return;
  var h = '<option value="">请选择服务商</option>';
  VENDORS.forEach(function(v, i){ h += '<option value="' + i + '">' + v.name + '</option>'; });
  sel.innerHTML = h;
  /* 保留当前已选服务商，只有空选时才用第一家兜底 */
  var keep = sel.value;
  if(keep === '' && VENDORS.length){ keep = '0'; }
  sel.value = keep;
  projVendorChange(keep);
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
    var mchEmpty = document.getElementById('projVendorMch');
    if(mchEmpty) mchEmpty.value = '';
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
  var mchEl = document.getElementById('projVendorMch');
  if(mchEl) mchEl.value = (d && d.mch) || '';
  if(tipEl){
    tipEl.innerHTML = '审批通过后，活动链接与推送邮件只发送到该邮箱；联系人由服务商内部自行分配跟进，不在本系统体现';
    tipEl.className = 'fld-hint';
  }
}

/* ---------- 预算系统：TPM / MEM / 其他都要上传预算凭证 ---------- */
var BUDGET_VOUCHERS = [];

function budgetFilePick(inp){
  var files = inp.files ? Array.prototype.slice.call(inp.files) : [];
  BUDGET_VOUCHERS = files.map(function(f){ return f.name; });
  var list = document.getElementById('budgetFileList');
  if(list) list.textContent = BUDGET_VOUCHERS.length ? BUDGET_VOUCHERS.join('、') : '未选择文件';
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
    document.getElementById('poHint').textContent = '由预算单带出，可修改 · 金额池剩余 ' + d.left;
    tag.className = 'tg tg-g'; tag.textContent = '✓ 已校验';
  } else if(key === ''){
    sj.value = ''; og.value = ''; sr.value = '';
    document.getElementById('poHint').textContent = '由预算单带出，可修改';
    tag.className = 'tg tg-n'; tag.textContent = '待填写预算单号';
  } else {
    sj.value = ''; og.value = ''; sr.value = '';
    document.getElementById('poHint').textContent = '由预算单带出，可修改';
    tag.className = 'tg tg-r'; tag.textContent = '✗ 预算单不存在或未审批';
  }
}

/** 提交审批：报批前的前置校验提示 */
function submitProject(){
  var missing = [];
  if(!(document.getElementById('projName').value || '').trim()) missing.push('项目名称');
  if(!(document.getElementById('projOwner').value || '').trim()) missing.push('活动负责人');
  if(!(document.getElementById('projOwnerPhone').value || '').trim()) missing.push('联系方式');
  if(!(document.getElementById('poNo').value || '').trim()) missing.push('预算单号');
  if(!(document.getElementById('poBudget').value || '').trim()) missing.push('核销预算');
  if(!CRE_APPROVERS.length) missing.push('项目审批人（至少 1 人）');
  if(!BUDGET_VOUCHERS.length) missing.push('预算凭证');

  var ps = (document.getElementById('creStart') || {}).value || '';
  var pe = (document.getElementById('creEnd') || {}).value || '';
  if(!ps || !pe) missing.push('活动周期起止日期');
  else if(ps > pe) missing.push('活动周期（开始不能晚于结束）');

  if(!CRE_BRIEF.length) missing.push('至少 1 个计划');
  var bad = CRE_BRIEF.filter(function(b){
    return !(b.ret || []).length || !(b.sku || []).length;
  });
  if(bad.length) missing.push('活动零售商 / 活动商品');

  /* 活动商品：店内码所属零售商唯一；同一店内码换了零售商必须分行 */
  var skuBad = '';
  CRE_BRIEF.forEach(function(b){
    if(skuBad) return;
    var seen = {};
    (b.sku || []).forEach(function(r){
      if(skuBad) return;
      var ic = String(r.inCode || '').trim(), cd = String(r.code || '').trim(), ow = String(r.owner || '').trim();
      if(!ic && !cd){ skuBad = '商品明细缺少 69码 / 店内码'; return; }
      if(ic && !ow){ skuBad = '店内码 ' + ic + ' 未填所属零售商'; return; }
      var k = (ic || cd) + '|' + ow;
      if(seen[k]){ skuBad = '商品明细「' + (ic || cd) + ' + ' + ow + '」重复，同一零售商只需一行'; return; }
      seen[k] = 1;
    });
  });
  if(skuBad) missing.push(skuBad);

  var mechErr = '';
  CRE_BRIEF.forEach(function(b, i){
    if(mechErr) return;
    var e = mechCheck(b);
    if(e) mechErr = '计划 ' + (i + 1) + '：' + e;
    else if((b.mechType || '满减') === '减至' && !(Number(b.maxPrice) > 0)){
      mechErr = '计划 ' + (i + 1) + '：请填写商品单价最高';
    }
  });
  if(mechErr) missing.push(mechErr);

  if(missing.length){ MT.toast('提交前请补充：' + missing.join('、'), 'err'); return; }
  wfSubmit();
}

/* ---------- 编辑草稿 / 未通过项目：回填创建页，提交时复用原单号 ---------- */
function resetCreateMode(){
  window.CRE_EDIT_ID = '';
  var t = document.getElementById('creTitle'); if(t) t.textContent = '新建项目';
  var n = document.getElementById('creNoTip'); if(n) n.textContent = '项目编号：提交后生成';
  var m = document.getElementById('creMode'); if(m) m.textContent = '草稿';
}

function openProjEdit(id){
  var p = (typeof projByAny === 'function') ? projByAny(id) : null;
  if(!p){ MT.toast('未找到该项目', 'err'); return; }
  if(p.state !== 'editing' && p.state !== 'rejected'){ MT.toast('只有草稿或未通过项目可以编辑', 'err'); return; }
  window.CRE_EDIT_ID = p.id;

  function set(id, v){ var el = document.getElementById(id); if(el) el.value = (v == null ? '' : v); }

  set('projName', p.name);
  set('projGoal', p.goal || '');
  var per = String(p.period || '').split('~');
  set('creStart', (per[0] || '').trim());
  set('creEnd', (per[1] || '').trim());

  var ow = p.ownerUser || {};
  var ownerTxt = String(p.owner || '');
  set('projOwnerId', ow.id || '');
  set('projOwner', ow.name || ownerTxt.split('·')[0].trim());
  set('projOwnerPhone', ow.phone || (ownerTxt.split('·')[1] || '').trim());

  var vi = (window.VENDORS || []).map(function(v){ return v.name; }).indexOf(p.vendor);
  var vs = document.getElementById('projVendor');
  if(vs){ vs.value = vi >= 0 ? String(vi) : ''; projVendorChange(vs.value); }

  set('poNo', p.po || '');
  set('poBudget', String(p.budget || '').replace(/[¥,\s]/g, ''));
  set('poSubj', p.subject || '');
  set('poOrg', p.bearer || '');
  set('poSrc', p.source || '');
  /* 编辑已存在项目：预算单是历史已校验状态，不再按演示库重查 */
  var poTag = document.getElementById('poTag');
  if(poTag){ poTag.className = 'tg tg-g'; poTag.textContent = '✓ 已校验'; }
  var poHint = document.getElementById('poHint');
  if(poHint) poHint.textContent = '沿用项目已校验的预算单';

  var bs = document.getElementById('budgetSys'); if(bs) bs.value = p.budgetSys || 'TPM';
  BUDGET_VOUCHERS = (p.budgetFiles && p.budgetFiles.length) ? p.budgetFiles.slice() : ['沿用原预算凭证'];
  var bfl = document.getElementById('budgetFileList'); if(bfl) bfl.textContent = BUDGET_VOUCHERS.join('、');

  CRE_APPROVERS.length = 0;
  (p.approvers || []).forEach(function(a){ CRE_APPROVERS.push({ id:a.id, name:a.name, dept:a.dept, title:a.title }); });
  if(typeof renderApproverTags === 'function') renderApproverTags();

  if(p.planBrief && p.planBrief.length){
    /* 旧数据的机制只有文案：从「满 99 减 15」「减至 1 元」里还原门槛 / 面额 */
    function parseMech(txt){
      var s = String(txt || '');
      var m1 = /满\s*([0-9.]+)\s*减\s*([0-9.]+)/.exec(s);
      if(m1) return { thr:Number(m1[1]), face:Number(m1[2]) };
      var m2 = /减至\s*([0-9.]+)/.exec(s);
      if(m2) return { thr:0, face:Number(m2[1]) };
      return { thr:'', face:'' };
    }
    CRE_BRIEF.length = 0;
    p.planBrief.forEach(function(b){
      var pm = parseMech(b.mech);
      CRE_BRIEF.push({
        mechType: b.mechType || '满减',
        thr: (b.thr !== '' && b.thr != null) ? b.thr : pm.thr,
        face: (b.face !== '' && b.face != null) ? b.face : pm.face,
        maxPrice: b.maxPrice || '', mech: b.mech || '',
        ret: (b.ret || []).slice(), sku: (b.sku || []).slice()
      });
    });
    if(typeof renderProjBrief === 'function') renderProjBrief();
  }

  var t = document.getElementById('creTitle'); if(t) t.textContent = '编辑项目';
  var n = document.getElementById('creNoTip'); if(n) n.textContent = '项目编号：' + (p.code || '—');
  var m = document.getElementById('creMode'); if(m) m.textContent = (PROJ_STATES[p.state] || {}).label || '草稿';

  go('v-create', null, true);
  MT.toast('已载入「' + p.name + '」，修改后提交审批');
}

/* ---------- 模板：v-create ---------- */
function tplPagecreate(){
  return `<div class="view" id="v-create">
  <div class="panel">
    <div class="panel-h">
      <h3 id="creTitle">新建项目</h3>
      <div class="flex">
        <span class="muted" id="creNoTip">项目编号：提交后生成</span>
        <span class="tg tg-n" id="creMode">草稿</span>
      </div>
    </div>
    <div class="panel-b">

      <!-- 一、基本信息 -->
      <div class="st">一、基本信息</div>
      <div class="fg c2">
        <div class="fr"><label>项目名称<em>*</em></label><input class="inp" id="projName" value="双节常温奶满减"></div>
        <div class="fr"><label>项目目标<em>*</em></label><input class="inp" id="projGoal" value="拉新 + 复购"></div>
      </div>
      <div class="fr">
        <label>投放平台<em>*</em></label>
        <div class="locked"><b>微信支付</b>　一期仅支持微信支付单平台</div>
      </div>
      <div class="fg c2">
        <div class="fr"><label>活动周期<em>*</em></label>
          <div class="flex" style="gap:8px"><input class="inp" id="creStart" value="2026-12-20" style="flex:1"><span class="muted">至</span><input class="inp" id="creEnd" value="2027-01-05" style="flex:1"></div>
           <div class="fld-hint">批次计划的可用时间（补充批次信息时填写）必须落在这个活动周期内，超出会拦截保存</div>
        </div>
        <div class="fr" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label>活动负责人<em>*</em></label>
            <div class="ct-field" onclick="ownerPickOpen()">
              <input type="hidden" id="projOwnerId">
              <input class="inp" id="projOwner" readonly placeholder="点击从通讯录选择" tabindex="0">
              <span class="ct-ico" aria-hidden="true" title="通讯录"></span>
            </div>
            <div class="fld-hint">1 人，从通讯录勾选，自动带出姓名与电话</div>
          </div>
          <div>
            <label>联系方式<em>*</em></label>
            <input class="inp" id="projOwnerPhone" readonly style="background:var(--bg-soft);color:var(--ink-60)">
            <div class="fld-hint">选中负责人后自动带出</div>
          </div>
        </div>
        <div class="picker" id="ownerPicker" onclick="if(event.target===this) ownerPickClose()">
          <div class="pk-box" style="width:520px" role="dialog" aria-modal="true">
            <div class="pk-h"><h4>通讯录</h4><span class="x" onclick="ownerPickClose()">×</span></div>
            <div class="pk-s"><input id="ownerKw" placeholder="搜索姓名 / 手机 / 部门 / 岗位" oninput="ownerPickRender()" autocomplete="off"></div>
            <div class="pk-b" id="ownerList"></div>
            <div class="pk-f"><span class="cnt">点选后代入负责人，并自动带出联系方式</span><button class="btn btn-g btn-xs" type="button" onclick="ownerPickClose()">取消</button></div>
          </div>
        </div>
      </div>

      <!-- 二、预算与费用科目 -->
      <div class="st" style="margin-top:26px">二、预算与费用科目</div>
      <div class="fr"><label>预算系统<em>*</em></label>
        <select class="inp" id="budgetSys" style="max-width:340px">
          <option>TPM</option><option>MEM</option><option>其他</option>
        </select>
      </div>
      <div class="fr" id="budgetFileBox" style="margin-top:12px">
        <label>预算凭证<em>*</em></label>
        <div class="flex" style="gap:8px;align-items:center">
          <input type="file" id="budgetFile" multiple accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx" style="display:none" onchange="budgetFilePick(this)">
          <button class="btn btn-o btn-xs" type="button" onclick="document.getElementById('budgetFile').click()">上传附件</button>
          <span class="mut" id="budgetFileList">未选择文件</span>
        </div>
        <div class="fld-hint">可上传多个预算凭证</div>
      </div>
      <div class="fr" style="margin-top:12px"><label>预算单号<em>*</em></label>
        <div class="flex" style="gap:8px;align-items:center">
          <input class="inp" id="poNo" value="POCN68-0000014722" style="flex:1;max-width:340px" oninput="poLookup()">
          <span class="tg tg-g" id="poTag">✓ 已校验</span>
        </div>
        <div class="fld-hint">预算单须已审批通过且剩余可用额度充足</div>
      </div>
      <div class="fg c2" style="margin-top:15px" id="poAuto">
        <div class="fr"><label>核销预算（元）</label><input class="inp" id="poBudget" value="400,000.00"><div class="fld-hint" id="poHint">由预算单带出，可修改</div></div>
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

      <!-- 四、审批与协作：审批在 BPM 完成，系统只记录审批人 -->
      <div class="st" style="margin-top:26px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span>四、审批与协作</span>
        <span class="tg tg-n" id="apvCnt">0 人</span>
      </div>
      <div class="fr">
        <label>项目审批人<em>*</em></label>
        <div class="apv-box">
          <div class="apv-tags" id="apvTags"><span class="mut" style="font-size:12px">尚未选择审批人</span></div>
          <button class="btn btn-o btn-xs" type="button" onclick="approverPickOpen()">＋ 从通讯录选择</button>
        </div>
        <div class="fld-hint">可多选（N 人）；审批人之间无先后、无分级，全部同意后通过；系统只提交 BPM 审批并回写结果</div>
      </div>
      <div class="picker" id="apvPicker" onclick="if(event.target===this) approverPickClose()">
        <div class="pk-box" style="width:640px" role="dialog" aria-modal="true">
          <div class="pk-h"><h4>通讯录 · 选择项目审批人</h4><span class="x" onclick="approverPickClose()">×</span></div>
          <div class="pk-s"><input id="apvKw" placeholder="搜索员工 ID / 姓名 / 部门 / 岗位" oninput="approverPickRender()" autocomplete="off"></div>
          <div class="pk-b" id="apvList"></div>
          <div class="pk-f"><span class="cnt">已选 <b id="apvCnt2">0</b> 人 · 可多选，无先后顺序，全部同意后通过</span><button class="btn btn-p btn-xs" type="button" onclick="approverPickClose()">完成</button></div>
        </div>
      </div>

      <!-- 五、批次计划：一个计划对应一个批次（一批次=一张券） -->
      <div class="st" style="margin-top:26px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span>五、批次计划</span>
        <span class="flex" style="gap:8px;margin-left:auto">
          <span class="tg tg-n" id="briefCnt">0 个计划</span>
          <button class="btn btn-o btn-xs" type="button" onclick="briefAdd()">＋ 创建计划</button>
        </span>
      </div>
      <div class="panel" style="margin-top:12px">
        <div class="tw scroll" style="border:none;box-shadow:none;border-radius:0">
          <table class="bt" style="table-layout:fixed">
            <thead><tr>
              <th style="width:5%">序号</th><th style="width:12%">机制类型</th><th style="width:34%">机制</th><th style="width:18%">活动零售商</th><th style="width:22%">活动商品</th><th style="width:9%">操作</th>
            </tr></thead>
            <tbody id="briefBody"></tbody>
          </table>
        </div>
      </div>

      <div class="panel-f">
        <button class="btn btn-g" onclick="wfSubmit('draft')">保存草稿</button>
        <button class="btn btn-o" onclick="openFlow()">项目节点与状态</button>
        <button class="btn btn-p" onclick="submitProject()">提交审批</button>
      </div>
    </div>
  </div>
</div>`;
}


/* ---------- 批次计划：一个计划 = 一个批次 = 一张券，机制类型 + 具体机制 ---------- */
function briefRow(type, thr, face, ret, sku, maxPrice){
  var b = { mechType:type, thr:thr, face:face, maxPrice:maxPrice || '', ret:ret, sku:sku };
  b.mech = mechText(b);
  return b;
}

var CRE_BRIEF = [
  briefRow('满减', 99, 15,
    [ { ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802' },
      { ret:'特易购',   store:'特易购（广州天河城店）',     prov:'广东省', city:'广州', mch:'1603482917' } ],
    [ { code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', inCode:'YH-88921', owner:'永辉超市' },
      { code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', inCode:'TE-10233', owner:'特易购' } ]),
  briefRow('减至', '', 1,
    [ { ret:'盒马鲜生', store:'盒马鲜生（杭州西湖银泰店）', prov:'浙江省', city:'杭州', mch:'1457820366' } ],
    [ { code:'6923644288221', name:'特仑苏精选礼盒 12 盒装', inCode:'HM-30712', owner:'盒马鲜生' } ], 15),
  briefRow('减至', '', 0.1,
    [ { ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802' } ],
    [ { code:'', name:'特仑苏 / 精选礼盒', inCode:'SPU-2318', owner:'永辉超市' },
      { code:'', name:'特仑苏 / 精选礼盒', inCode:'SPU-2318', owner:'特易购' } ], 12)
];

/* ---------- 表格单元格 ---------- */
function briefCell(i, k, v, ph){
  return '<td><input class="inp" style="width:100%" value="' + vsEsc(v || '') + '"'
       + (ph ? ' placeholder="' + pnEsc(ph) + '"' : '')
       + ' oninput="briefSet(' + i + ',\'' + k + '\',this.value)"></td>';
}

/* 发券方式已按客户要求删除，不再在创建时选择 */

function briefAmt(i, k, v, ph){
  return '<input class="inp" type="number" min="0" step="0.01" style="width:72px" value="' + vsEsc(v === 0 || v ? v : '') + '"'
    + ' placeholder="' + pnEsc(ph) + '" oninput="briefSet(' + i + ',\'' + k + '\',this.value)">';
}

/** 机制金额：满减填门槛和减免额；减至填减至价和商品单价最高 */
function briefMechCell(i, b){
  var t = b.mechType || '满减';
  var h = '<td><div class="flex" style="gap:4px;flex-wrap:wrap">';
  if(t === '减至'){
    h += '<span class="mut" style="font-size:12px">减至</span>' + briefAmt(i, 'face', b.face, '1')
      + '<span class="mut" style="font-size:12px">商品单价最高</span>' + briefAmt(i, 'maxPrice', b.maxPrice, '15');
  } else {
    h += '<span class="mut" style="font-size:12px">满</span>' + briefAmt(i, 'thr', b.thr, '99')
      + '<span class="mut" style="font-size:12px">减</span>' + briefAmt(i, 'face', b.face, '15');
  }
  return h + '</div></td>';
}

/** 机制类型单元格：满减 / 减至，与机制文案配套 */
function briefTypeCell(i, b){
  var t = b.mechType || '满减';
  return '<td><select class="inp" style="width:100%" onchange="briefSet(' + i + ',\'mechType\',this.value)">'
    + MECH_TYPES.map(function(o){ return '<option' + (o === t ? ' selected' : '') + '>' + o + '</option>'; }).join('')
    + '</select></td>';
}

function briefCellItems(i, kind){
  var list = (CRE_BRIEF[i] || {})[kind] || [];
  var s = briefSummary(list, kind);
  var txt = s.n
    ? '<span class="bv">' + pnEsc(s.txt) + '</span>'
    : '<span class="mut">未添加</span>';
  return '<td><div class="bcell">' + txt
       + '<a class="lnk" onclick="openBriefItems(' + i + ',\'' + kind + '\')">'
       + (s.n ? '明细 ' + s.n : '添加') + '</a></div></td>';
}

function renderProjBrief(){
  var body = document.getElementById('briefBody');
  if(!body) return;
  var h = '';
  CRE_BRIEF.forEach(function(b, i){
    h += '<tr>'
      + '<td style="text-align:center">' + (i + 1) + '</td>'
      + briefTypeCell(i, b)
      + briefMechCell(i, b)
      + briefCellItems(i, 'ret')
      + briefCellItems(i, 'sku')
      + '<td><div class="ops"><a onclick="briefDel(' + i + ')">删除</a></div></td>'
      + '</tr>';
  });
  if(!CRE_BRIEF.length){
    h = '<tr><td colspan="6" class="empty-row">至少创建 1 个计划</td></tr>';
  }
  body.innerHTML = h;
  var c = document.getElementById('briefCnt');
  if(c) c.textContent = CRE_BRIEF.length + ' 个计划';
}

function briefSet(i, k, v){
  var b = CRE_BRIEF[i];
  if(!b) return;
  b[k] = v;
  if(k === 'mechType' && v === '减至') b.thr = '';
  if(k === 'mechType' || k === 'thr' || k === 'face') b.mech = mechText(b);
  if(k === 'mechType') renderProjBrief();
}

function briefAdd(){
  if(CRE_BRIEF.length >= 10){ MT.toast('一个项目最多 10 个计划', 'err'); return; }
  CRE_BRIEF.push(briefRow('满减', '', '', [], []));
  renderProjBrief();
}

function briefDel(i){
  if(CRE_BRIEF.length <= 1){ MT.toast('至少保留 1 个计划', 'err'); return; }
  CRE_BRIEF.splice(i, 1);
  renderProjBrief();
}

/* ---------- 明细抽屉：零售商 / 活动商品 ---------- */
var BRIEF_EDIT = { i:0, kind:'ret' };

function openBriefItems(i, kind){
  var b = CRE_BRIEF[i];
  if(!b) return;
  BRIEF_EDIT = { i:i, kind:kind };
  var title = document.getElementById('briefDwTitle');
  if(title){
    title.innerHTML = (kind === 'ret' ? '活动零售商明细' : '活动商品明细')
      + ' <span class="sub">计划 ' + (BRIEF_EDIT.i + 1) + '</span>';
  }
  var tip = document.getElementById('briefDwTip');
  if(tip){
    tip.innerHTML = kind === 'ret'
      ? '直接添加或导入：门店编码（必填，来自客户系统，格式不限）/ 零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号 / 经度 / 纬度'
      : '直接添加或导入：69码 / 商品名称 / 店内码 / 店内码所属零售商；同一店内码换了零售商要分多行，一行只对应一个零售商';
  }
  briefItemRender();
  openDrawer('dw-brief');
}

function briefItemInput(j, f, v, ph){
  return '<td><input class="inp" style="width:100%" value="' + vsEsc(v || '') + '" placeholder="' + pnEsc(ph) + '"'
       + ' oninput="briefItemSet(' + j + ',\'' + f + '\',this.value)"></td>';
}

function briefItemRender(){
  var body = document.getElementById('briefDwBody');
  if(!body) return;
  var b = CRE_BRIEF[BRIEF_EDIT.i];
  if(!b) return;
  var kind = BRIEF_EDIT.kind;
  var list = b[kind] || (b[kind] = []);
  var h = '';

  if(kind === 'ret'){
    h += '<table class="bt mini" style="table-layout:fixed"><thead><tr>'
      + '<th style="width:4%">#</th><th style="width:12%">门店编码<em style="color:var(--red)">*</em></th><th style="width:16%">零售商名称<em style="color:var(--red)">*</em></th>'
      + '<th style="width:22%">门店名称</th><th style="width:9%">省份<em style="color:var(--red)">*</em></th>'
      + '<th style="width:8%">城市<em style="color:var(--red)">*</em></th><th style="width:13%">微信商户号</th>'
      + '<th style="width:8%">经纬度</th><th style="width:8%">操作</th></tr></thead><tbody>';
    list.forEach(function(r, j){
      h += '<tr><td style="text-align:center">' + (j + 1) + '</td>'
        + briefItemInput(j, 'sid',   r.sid,   '客户系统编码')
        + briefItemInput(j, 'ret',   r.ret,   '永辉')
        + briefItemInput(j, 'store', r.store, '永辉超市（重庆观音桥店）')
        + briefItemInput(j, 'prov',  r.prov,  '重庆')
        + briefItemInput(j, 'city',  r.city,  '重庆')
        + briefItemInput(j, 'mch',   r.mch,   '1236057802')
        + '<td class="sx-mono mut" style="font-size:11px">' + (r.lng != null && r.lat != null ? r.lng + ', ' + r.lat : '—') + '</td>'
        + '<td><div class="ops"><a onclick="briefItemDel(' + j + ')">删除</a></div></td></tr>';
    });
  } else {
    h += '<table class="bt mini" style="table-layout:fixed"><thead><tr>'
      + '<th style="width:4%">#</th><th style="width:22%">69码</th>'
      + '<th style="width:34%">商品名称</th><th style="width:16%">店内码</th>'
      + '<th style="width:20%">店内码所属零售商</th>'
      + '<th style="width:4%">操作</th></tr></thead><tbody>';
    list.forEach(function(r, j){
      h += '<tr><td style="text-align:center">' + (j + 1) + '</td>'
        + briefItemInput(j, 'code',  r.code,  '6923644223456')
        + briefItemInput(j, 'name',  r.name,  '特仑苏纯牛奶 250ml×12')
        + briefItemInput(j, 'inCode', r.inCode, 'YH-88921')
        + briefItemInput(j, 'owner', r.owner, '永辉超市')
        + '<td><div class="ops"><a onclick="briefItemDel(' + j + ')">删除</a></div></td></tr>';
    });
  }

  if(!list.length){
    h += '<tr><td colspan="' + (kind === 'ret' ? 9 : 6) + '" class="empty-row">还没有明细，可「添加一行」或「导入文件」</td></tr>';
  }
  h += '</tbody></table>';
  body.innerHTML = h;
}

function briefItemSet(j, f, v){
  var b = CRE_BRIEF[BRIEF_EDIT.i];
  if(!b) return;
  var list = b[BRIEF_EDIT.kind];
  if(!list || !list[j]) return;
  list[j][f] = v;
}

function briefItemAdd(){
  var b = CRE_BRIEF[BRIEF_EDIT.i];
  if(!b) return;
  var list = b[BRIEF_EDIT.kind] || (b[BRIEF_EDIT.kind] = []);
  if(list.length >= 50){ MT.toast('最多 50 行', 'err'); return; }
  list.push(BRIEF_EDIT.kind === 'ret'
    ? { sid:'', ret:'', store:'', prov:'', city:'', mch:'', lng:null, lat:null }
    : { code:'', name:'', inCode:'', owner:'' });
  briefItemRender();
}

function briefItemDel(j){
  var b = CRE_BRIEF[BRIEF_EDIT.i];
  if(!b) return;
  b[BRIEF_EDIT.kind].splice(j, 1);
  briefItemRender();
}

function briefItemDone(){
  var b = CRE_BRIEF[BRIEF_EDIT.i];
  if(b && BRIEF_EDIT.kind === 'ret'){
    var list = b.ret || [];
    var badNo = -1, lackMsg = '', badMch = [], seenSid = {}, dupSid = '';
    list.forEach(function(r, i){
      if(r.sid && typeof retNormSid === 'function') r.sid = retNormSid(r.sid);
      if(r.sid){ if(seenSid[r.sid]) dupSid = '第 ' + seenSid[r.sid] + ' 行与第 ' + (i + 1) + ' 行'; else seenSid[r.sid] = i + 1; }
      r.mch = String(r.mch || '').trim();
      if(r.mch === '—') r.mch = '';
      var hasData = r.sid || r.ret || r.store || r.prov || r.city || r.mch;
      if(!hasData) return;
      var blank = function(v){ var s = String(v == null ? '' : v).trim(); return !s || s === '—'; };
      var lack = [];
      if(blank(r.sid)) lack.push('门店编码');
      if(blank(r.ret)) lack.push('零售商名称');
      if(blank(r.prov)) lack.push('省份');
      if(blank(r.city)) lack.push('城市');
      if(lack.length && !lackMsg) lackMsg = '第 ' + (i + 1) + ' 行缺' + lack.join('、');
      if(r.mch && !/^\d{8,10}$/.test(r.mch)) badMch.push('第 ' + (i + 1) + ' 行「' + r.mch + '」');
    });
    if(lackMsg){ MT.toast('活动零售商必填：' + lackMsg, 'err'); return; }
    if(dupSid){ MT.toast('门店编码重复：' + dupSid, 'err'); return; }
    if(badMch.length && !confirm('以下微信商户号不是 8~10 位数字：\n' + badMch.join('\n') + '\n\n请确认是否仍要保存？')) return;
    briefItemRender();
  }
  closeDrawer();
  renderProjBrief();
}

/* 从主数据库选择门店 / 商品 */
function briefPick(){
  mdPick(BRIEF_EDIT.kind, function(rows){
    var b = CRE_BRIEF[BRIEF_EDIT.i];
    if(!b) return;
    var list = b[BRIEF_EDIT.kind] || (b[BRIEF_EDIT.kind] = []);
    rows.forEach(function(r){
      if(BRIEF_EDIT.kind === 'ret'){
        if(list.some(function(x){ return (r.sid && x.sid === r.sid) || (r.mch && x.mch === r.mch); })) return;
        list.push({ sid:r.sid, ret:r.ret, store:r.name, prov:r.prov, city:r.city, mch:r.mch, lng:r.lng, lat:r.lat });
      } else {
        /* 一个店内码登记了几个零售商，就展开成几行；同行同零售商不重复 */
        var rts = (r.rets && r.rets.length) ? r.rets : [''];
        rts.forEach(function(ow){
          var k = (r.inCode || r.code) + '|' + ow;
          if(list.some(function(x){ return (x.inCode || x.code) + '|' + (x.owner || '') === k; })) return;
          list.push({ code:r.code, name:r.n, inCode:r.inCode, owner:ow });
        });
      }
    });
    briefItemRender();
  });
}

/* ---------- 明细按模板导入：字段与「名单导入」一致 ---------- */
function briefImpCols(kind){
  return kind === 'ret'
    ? [['sid','门店编码'],['ret','零售商名称'],['store','门店名称'],['prov','省份'],['city','城市'],['mch','微信商户号'],['lng','经度'],['lat','纬度']]
    : [['code','69码或店内码'],['name','商品名称'],['owner','店内码所属零售商']];
}

function briefImpTpl(){
  var kind = BRIEF_EDIT.kind, cols = briefImpCols(kind);
  var sample = kind === 'ret'
    ? 'CQ001,永辉超市,永辉超市（重庆观音桥店）,重庆市,重庆,1236057802,106.5507,29.5647'
    : '6923644223456,特仑苏纯牛奶 250ml×12,永辉超市';
  var csv = '\ufeff' + cols.map(function(c){ return c[1]; }).join(',') + '\r\n' + sample + '\r\n';
  var blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = kind === 'ret' ? '活动零售商明细模板.csv' : '活动商品明细模板.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 900);
  MT.toast('模板已下载，按列填写后再导入');
}

function briefImpFile(inp){
  var f = inp.files && inp.files[0];
  if(!f) return;
  var rd = new FileReader();
  rd.onload = function(){ briefImpText(String(rd.result || '')); };
  rd.readAsText(f, 'utf-8');
  inp.value = '';
}

function briefImpText(text){
  var kind = BRIEF_EDIT.kind;
  var cols = briefImpCols(kind);
  var b = CRE_BRIEF[BRIEF_EDIT.i];
  if(!b) return;
  var list = b[kind] || (b[kind] = []);

  var lines = String(text || '').split(/\r?\n/).map(function(s){ return s.trim(); }).filter(Boolean);
  if(!lines.length){ MT.toast('没有可导入的内容', 'err'); return; }

  var split = (typeof impSplit === 'function') ? impSplit : function(s){
    return s.split(',').map(function(x){ return x.replace(/^"|"$/g, '').trim(); });
  };
  var norm = function(s){ return String(s == null ? '' : s).replace(/[\s*＊]/g, ''); };
  var head = split(lines[0]);
  var isHead = norm(head[0]) === norm(cols[0][1])
    || cols.every(function(c, i){ return norm(head[i]) === norm(c[1]); });

  var added = 0, dup = 0;
  for(var i = isHead ? 1 : 0; i < lines.length; i++){
    var cs = split(lines[i]);
    var row = {};
    var empty = true;
    cols.forEach(function(c, ci){
      row[c[0]] = (cs[ci] || '').trim();
      if(row[c[0]]) empty = false;
    });
    if(empty) continue;
    var same = list.some(function(x){
      return kind === 'ret'
        ? (x.store === row.store && x.ret === row.ret)
        : ((x.inCode || x.code) + '|' + (x.owner || '')) === ((row.inCode || row.code) + '|' + (row.owner || ''));
    });
    if(same){ dup++; continue; }
    list.push(row);
    added++;
  }

  var noSid = (kind === 'ret') ? list.filter(function(x){ return (x.ret || x.store || x.mch) && !String(x.sid || '').trim(); }).length : 0;
  var cnt = document.getElementById('briefImpCnt');
  if(cnt) cnt.textContent = '已追加 ' + added + ' 行' + (dup ? '，跳过重复 ' + dup + ' 行' : '') + (noSid ? '，其中 ' + noSid + ' 行缺门店编码' : '');
  briefItemRender();
  if(!added) MT.toast('没有新增行' + (dup ? '（全部重复）' : ''), 'err');
}

/* ---------- 模板：dw-brief ---------- */
function tplDrawerbrief(){
  return `<div class="drawer" id="dw-brief" style="width:960px">
  <div class="dw-h">
    <h3 id="briefDwTitle">明细</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">
    <div class="note b" id="briefDwTip" style="margin-top:0">明细字段与「名单导入」模板一致</div>

    <div id="briefDwBody" style="margin-top:12px"></div>
  </div>
  <div class="dw-f">
    <div class="lft">支持「下载模板 → 填写 → 导入文件」</div>
    <div class="rgt">
      <input type="file" id="briefImpFile" accept=".csv,.txt" style="display:none" onchange="briefImpFile(this)">
      <button class="btn btn-g btn-xs" type="button" onclick="briefImpTpl()">下载模板</button>
      <button class="btn btn-g btn-xs" type="button" onclick="document.getElementById('briefImpFile').click()">导入文件</button>
      <button class="btn btn-o" type="button" onclick="briefItemAdd()">＋ 添加一行</button>
      <button class="btn btn-g" type="button" onclick="closeDrawer()">取消</button>
      <button class="btn btn-p" type="button" onclick="briefItemDone()">完成</button>
    </div>
  </div>
</div>`;
}

MT.defineDrawer('dw-brief', tplDrawerbrief);

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-create",
  title: "项目创建",
  crumb: "活动运营 / 项目创建",
  group: "活动运营",
  template: tplPagecreate
});

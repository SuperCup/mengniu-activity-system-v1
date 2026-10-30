/* =============================================================================
 * components/batch-drawer.js — 补充计划批次信息
 * 对应待确认清单标黄项 3：「支持补充计划批次信息，复制微信支付后台的必填字段
 * 和规则规划，展示字段使用示例图」。
 * 字段、单位、长度与校验规则 1:1 对齐微信支付商户平台「代金券 / 商家券批次」创建页，
 * 每个字段下方给出填写示例，右侧给出消费者卡包里的示例图。
 * ========================================================================== */

/** 微信支付后台批次字段限制（校验规则集中在此，便于和商户平台台账对齐） */
var BATCH_FIELDS = {
  nameMax: 9,          // 券名称最多 9 个汉字
  spanMax: 90,         // 可用时间跨度最多 90 天
  userMin: 1, userMax: 100,
  capMin: 6,           // 发放总上限：6 张及以上
  descMax: 1024,       // 使用说明最多 1024 字
  imgMinW: 537, imgMinH: 202, imgMaxMB: 5
};

/* 券详情图：dataURL 只放内存，避免 5MB 图片把 localStorage 撑爆；计划上只存元信息 */
window.PLAN_IMG_DATA = window.PLAN_IMG_DATA || {};

var BAT_EDIT = { idx:-1 };
var BAT_IMG = { state:'none', name:'', type:'', data:'', removed:false };
var BAT_TABS = [];
var BAT_CUR = '';
var BAT_DRAFTS = {};
var BAT_CLEAN = {};
var BAT_SKIP_STASH = false;

/* 切走当前页面前，把未保存的表单留在标签草稿里 */
function batchStash(){
  if(BAT_SKIP_STASH){ BAT_SKIP_STASH = false; return; }
  if(!BAT_CUR || !document.getElementById('bfName')) return;
  BAT_DRAFTS[BAT_CUR] = {
    name: document.getElementById('bfName').value,
    face: document.getElementById('bfFace').value,
    thr: document.getElementById('bfThr').value,
    start: document.getElementById('bfStart').value,
    end: document.getElementById('bfEnd').value,
    cap: document.getElementById('bfCap').value,
    user: document.getElementById('bfUser').value,
    desc: document.getElementById('bfDesc').value,
    batNo: document.getElementById('bfBatNo').value,
    mechType: document.getElementById('bfMechType').value,
    validMode: batchRadio('bfValidMode', 'any'),
    validDays: (document.getElementById('bfValidDays') || {}).value || '',
    thrMode: batchRadio('bfThrMode', 'none'),
    maxPrice: (document.getElementById('bfMaxPrice') || {}).value || '',
    overBudget: batchRadio('bfOver', 'stop'),
    img: BAT_IMG.state === 'ready' ? { name:BAT_IMG.name, type:BAT_IMG.type, at:'', data:BAT_IMG.data } : (BAT_IMG.removed ? null : undefined),
    ret: (PN.ret || []).map(function(x){ return Object.assign({}, x); }),
    sku: (PN.sku || []).map(function(x){ return Object.assign({}, x); })
  };
}

/** 项目状态：draft / pending / approved / rejected / confirmed / running / stopped */
function batchProjState(p){
  var pr = (window.PROJECTS || []).filter(function(x){ return x.id === (p && (p.projectId || p.proj)); })[0];
  return pr ? pr.state : 'editing';
}

/** 锁定规则：审批通过后不能改机制类型/周期；推送后不能改任何机制详细字段 */
function batchLockForm(p){
  var st = batchProjState(p);
  var pushed = (['pushed','to_confirm','confirmed','configured','running','finished'].indexOf(st) >= 0);
  var approved = (st === 'passed' || st === 'to_push');
  var all = ['bfName','bfFace','bfThr','bfStart','bfEnd','bfCap','bfUser','bfDesc','bfMechType','bfValidDays','bfMaxPrice'];
  var lock = pushed ? all.slice() : (approved ? ['bfMechType','bfStart','bfEnd'] : []);
  all.forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    var on = lock.indexOf(id) >= 0;
    el.disabled = on;
    el.classList.toggle('ro', on);
  });
  ['bfImgBtn','bfImgDel'].forEach(function(id){
    var b = document.getElementById('bf' + (id === 'bfImgBtn' ? 'ImgBtn' : 'ImgDel'));
    if(b){ b.disabled = pushed; b.classList.toggle('disabled', pushed); }
  });
  var note = document.getElementById('batLockNote');
  if(note){
    if(pushed){
      note.style.display = '';
      note.innerHTML = '<b>已推送服务商：</b>计划批次、机制类型与机制详细字段均不可再修改，仅可查看。';
    } else if(approved){
      note.style.display = '';
      note.innerHTML = '<b>审批已通过：</b>不能增减计划批次、不能改机制类型与活动周期，只能补充面额、门槛、发放上限等机制详细字段。';
    } else {
      note.style.display = 'none';
      note.innerHTML = '';
    }
  }
}

function batchShow(idx){
  var p = PLANS[idx];
  if(!p) return;
  BAT_EDIT.idx = idx;
  PN.idx = idx;
  BAT_IMG = { state:'none', name:'', type:'', data:'', removed:false };
  var d = BAT_DRAFTS[p.id];
  if(d){
    PN.ret = (d.ret || []).map(function(x){ return Object.assign({}, x); });
    PN.sku = (d.sku || []).map(function(x){ return Object.assign({}, x); });
    document.getElementById('bfName').value = d.name || '';
    document.getElementById('bfFace').value = d.face;
    document.getElementById('bfThr').value = d.thr;
    document.getElementById('bfStart').value = d.start || '';
    document.getElementById('bfEnd').value = d.end || '';
    document.getElementById('bfCap').value = d.cap;
    document.getElementById('bfUser').value = d.user;
    document.getElementById('bfDesc').value = d.desc || '';
    document.getElementById('bfBatNo').value = d.batNo || '';
    document.getElementById('bfMechType').value = d.mechType || '满减';
    batchSetRadio('bfValidMode', d.validMode || 'any');
    document.getElementById('bfValidDays').value = d.validDays || '';
    batchSetRadio('bfThrMode', d.thrMode || 'none');
    document.getElementById('bfMaxPrice').value = d.maxPrice || '';
    batchSetRadio('bfOver', d.overBudget || 'stop');
  } else {
    pnLoadRows(p);
    var b = p.batchForm || {};
    var fromList = planMechAmounts(p);
    document.getElementById('bfName').value  = b.name || (p.name || '').slice(0, BATCH_FIELDS.nameMax);
    document.getElementById('bfFace').value  = batchTakeAmount(b.face, p.face, fromList.face);
    document.getElementById('bfThr').value   = batchTakeAmount(b.thr, p.thr, fromList.thr);
    document.getElementById('bfStart').value = b.start || p.s;
    document.getElementById('bfEnd').value   = b.end || p.e;
    document.getElementById('bfCap').value   = b.cap != null ? b.cap : p.qty;
    document.getElementById('bfUser').value  = b.user != null ? b.user : 2;
    document.getElementById('bfDesc').value  = b.desc || '限指定商品使用，不可兑换现金，可在微信支付卡包查看。';
    document.getElementById('bfBatNo').value = b.batNo || (p.bat || '');
    document.getElementById('bfMechType').value = b.mechType || p.mechType || '满减';
    batchSetRadio('bfValidMode', b.validMode || 'any');
    document.getElementById('bfValidDays').value = b.validDays || '';
    batchSetRadio('bfThrMode', b.thrMode || 'none');
    document.getElementById('bfMaxPrice').value = b.maxPrice != null && b.maxPrice !== '' ? b.maxPrice : (p.maxPrice || '');
    batchSetRadio('bfOver', b.overBudget || 'stop');
  }
  var imgMeta = d ? (d.img === null ? null : (d.img || p.img)) : p.img;
  if(d && d.img === null){
    BAT_IMG.removed = true;
  } else if(imgMeta){
    BAT_IMG.state = 'ready';
    BAT_IMG.name = imgMeta.name || '';
    BAT_IMG.type = imgMeta.type || '';
    BAT_IMG.data = imgMeta.data || PLAN_IMG_DATA[p.id] || '';
  }
  batchMechToggle();
  pnRender();
  batchImgRender();
  batchLockForm(p);
  if(!d || !BAT_CLEAN[p.id]) batchMarkClean();
  batchRenderTabs();
}

function batchReadNow(){
  if(!document.getElementById('bfName')) return '';
  return JSON.stringify({
    name: document.getElementById('bfName').value,
    face: document.getElementById('bfFace').value,
    thr: document.getElementById('bfThr').value,
    start: document.getElementById('bfStart').value,
    end: document.getElementById('bfEnd').value,
    cap: document.getElementById('bfCap').value,
    user: document.getElementById('bfUser').value,
    desc: document.getElementById('bfDesc').value,
    batNo: document.getElementById('bfBatNo').value,
    mechType: document.getElementById('bfMechType').value,
    validMode: batchRadio('bfValidMode', 'any'),
    validDays: (document.getElementById('bfValidDays') || {}).value || '',
    thrMode: batchRadio('bfThrMode', 'none'),
    maxPrice: (document.getElementById('bfMaxPrice') || {}).value || '',
    overBudget: batchRadio('bfOver', 'stop'),
    ret: PN.ret || [],
    sku: PN.sku || []
  });
}

function batchMarkClean(){
  if(BAT_CUR) BAT_CLEAN[BAT_CUR] = batchReadNow();
}

function batchIsDirty(){
  if(!BAT_CUR || !BAT_CLEAN[BAT_CUR]) return false;
  return batchReadNow() !== BAT_CLEAN[BAT_CUR];
}

function batchAskLeave(done){
  if(!batchIsDirty()){ done(); return; }
  var bar = document.getElementById('batLeave');
  if(!bar){ done(); return; }
  bar.style.display = 'flex';
  bar._done = done;
}

function batLeaveAct(act){
  var bar = document.getElementById('batLeave');
  var done = bar && bar._done;
  if(bar) bar.style.display = 'none';
  if(act === 'stay' || !done) return;
  if(act === 'save'){
    if(!batchSave()){
      if(bar) bar.style.display = 'flex';
      return;
    }
    done();
    return;
  }
  BAT_SKIP_STASH = true;
  delete BAT_DRAFTS[BAT_CUR];
  delete BAT_CLEAN[BAT_CUR];
  done();
}

function batchTabTitle(p){
  if(!p) return '';
  var d = BAT_DRAFTS[p.id];
  var type = (d && d.mechType) || p.mechType || '';
  var face = d && d.face != null && d.face !== '' ? d.face : '';
  var thr = d && d.thr != null && d.thr !== '' ? d.thr : '';
  if(face === '' && Number(p.face) > 0) face = p.face;
  if(thr === '' && Number(p.thr) > 0) thr = p.thr;
  if(face === '' || thr === ''){
    var parsed = planMechAmounts(p);
    if(face === '') face = parsed.face;
    if(thr === '') thr = parsed.thr;
    if(!type) type = /减至/.test(p.mech || '') ? '减至' : '满减';
  }
  if(face !== '' && face != null) return mechText({ mechType: type || '满减', thr: thr || 0, face: face });
  return p.mech || p.name || p.id;
}

function batchPlanById(id){
  return PLANS.filter(function(x){ return x.id === id; })[0] || null;
}

function batchQueueFor(p){
  var pid = (p && (p.projectId || p.proj)) || '';
  return PLANS.filter(function(x){ return (x.projectId || x.proj || '') === pid; }).map(function(x){ return x.id; });
}

function batchFillState(id){
  if(BAT_DRAFTS[id]) return '未保存';
  var p = batchPlanById(id);
  if(p && p.batchForm && p.batchForm.name) return '已保存';
  return '待填写';
}

function batchSnap(id){
  var p = batchPlanById(id);
  if(!p) return null;
  var d = BAT_DRAFTS[id];
  var b = p.batchForm || {};
  var from = planMechAmounts(p);
  var face = d && d.face != null && d.face !== '' ? d.face : batchTakeAmount(b.face, p.face, from.face);
  var thr = d && d.thr != null && d.thr !== '' ? d.thr : batchTakeAmount(b.thr, p.thr, from.thr);
  var type = (d && d.mechType) || b.mechType || p.mechType || (/减至/.test(p.mech || '') ? '减至' : '满减');
  var mech = (face !== '' && face != null) ? mechText({ mechType:type, thr:thr || 0, face:face }) : (p.mech || '—');
  var ret = d ? (d.ret || []) : (p.retRows || []);
  var sku = d ? (d.sku || []) : (p.skuRows || []);
  return {
    mech: mech,
    name: (d && d.name) || b.name || p.name || '—',
    face: face === '' || face == null ? '—' : face,
    thr: thr === '' || thr == null ? '—' : thr,
    start: (d && d.start) || b.start || p.s || '—',
    end: (d && d.end) || b.end || p.e || '—',
    ret: ret.length,
    sku: sku.length
  };
}

function batchRenderTabs(){
  var pills = document.getElementById('planBatTabs');
  if(pills) pills.innerHTML = '';
  batchRenderProj();
  var box = document.getElementById('batQueue');
  if(box){
    var todo = BAT_TABS.filter(function(id){
      var p = batchPlanById(id);
      return p && typeof planLifeState === 'function' && planLifeState(p).txt === '待完善';
    }).length;
    box.innerHTML = '<div class="bat-q-h">同项目批次 <b>' + BAT_TABS.length + '</b>'
      + (todo ? '<span class="mut"> · 待完善 ' + todo + '</span>' : '') + '</div>'
      + BAT_TABS.map(function(id, i){
        var p = batchPlanById(id);
        return '<button type="button" class="bat-q' + (id === BAT_CUR ? ' on' : '') + '" onclick="batchTabGo(\'' + id + '\')">'
          + '<span class="n">' + (i + 1) + '</span>'
          + '<span class="t">' + pnEsc(batchTabTitle(p)) + '</span>'
          + '<span class="s">' + batchFillState(id) + '</span>'
          + '</button>';
      }).join('');
  }
  var prev = document.getElementById('batPrevCard');
  if(!prev) return;
  var at = BAT_TABS.indexOf(BAT_CUR);
  if(at <= 0){
    prev.innerHTML = '<div class="bat-prev-h">上一份批次</div><div class="mut">这是同项目的第一份，没有更早的批次可对照。</div>';
    return;
  }
  var pid = BAT_TABS[at - 1];
  var s = batchSnap(pid);
  prev.innerHTML = '<div class="bat-prev-h">上一份批次 <a onclick="batchTabGo(\'' + pid + '\')">查看完整配置</a></div>'
    + '<b>' + pnEsc(s.mech) + '</b>'
    + '<div class="mut" style="margin-top:4px">' + pnEsc(s.name) + '</div>'
    + '<div class="bat-prev-kv"><span>面额</span><b>' + pnEsc(s.face) + '</b><span>门槛</span><b>' + pnEsc(s.thr) + '</b></div>'
    + '<div class="mut">' + pnEsc(s.start) + ' ~ ' + pnEsc(s.end) + '</div>'
    + '<div class="mut">零售商 ' + s.ret + ' 条 · 商品 ' + s.sku + ' 条</div>';
}

function batchRenderProj(){
  var box = document.getElementById('batProjBar');
  if(!box) return;
  var cur = batchPlanById(BAT_CUR);
  var pid = cur ? (cur.projectId || cur.proj) : '';
  var proj = (window.PROJECTS || []).filter(function(x){ return x.id === pid; })[0];
  var st = proj && window.PROJ_STATES && PROJ_STATES[proj.state];
  var opts = (window.PROJECTS || []).filter(function(pr){
    return (pr.state === 'passed' || pr.state === 'to_push')
      && PLANS.some(function(pl){ return (pl.projectId || pl.proj) === pr.id; });
  }).map(function(pr){
    var n = PLANS.filter(function(pl){ return (pl.projectId || pl.proj) === pr.id; }).length;
    return '<option value="' + pnEsc(pr.id) + '"' + (pr.id === pid ? ' selected' : '') + '>'
      + pnEsc(pr.name) + '（' + n + '）</option>';
  }).join('');
  var from = (typeof PLAN_ENTRY !== 'undefined' && PLAN_ENTRY === 'manage') ? '项目管理' : '计划与批次';
  box.innerHTML = '<div class="bat-crumb"><a onclick="batchBack()">' + from + '</a><span> / </span><b>'
    + pnEsc(proj ? proj.name : '当前项目') + '</b><span> / </span><span>补充配置</span></div>'
    + '<div class="bat-proj-row">'
    + '<label>项目</label><select class="inp" onchange="batchSwitchProj(this.value)">' + opts + '</select>'
    + '</div>'
    + '<div class="bat-proj-kv">'
    + '<span>' + pnEsc(proj ? (proj.code || proj.id) : '') + '</span>'
    + '<span>' + pnEsc(st ? st.label : '') + '</span>'
    + '<span>' + pnEsc(proj ? (proj.period || '') : '') + '</span>'
    + '<span>' + pnEsc(proj ? (proj.budget || '') : '') + '</span>'
    + '<span>' + pnEsc(proj ? (proj.vendor || '') : '') + '</span>'
    + '</div>';
}

function batchNext(){
  var i = BAT_TABS.indexOf(BAT_CUR);
  if(i < 0 || i >= BAT_TABS.length - 1){ MT.toast('已经是同项目最后一份'); return; }
  batchTabGo(BAT_TABS[i + 1]);
}

function batchTabGo(id){
  if(!id) return;
  var idx = PLANS.map(function(x){ return x.id; }).indexOf(id);
  if(idx < 0) return;
  if(id !== BAT_CUR){
    batchStash();
    BAT_CUR = id;
    batchShow(idx);
  }
  batchPage(true);
}

function batchPage(show){
  var el = document.getElementById('dw-batch');
  var host = document.getElementById('planCfg');
  var list = document.getElementById('planListBox');
  var view = document.getElementById('v-plan');
  if(show && view && !view.classList.contains('on') && typeof go === 'function'){
    if(typeof PLAN_SCOPE_KEEP !== 'undefined') PLAN_SCOPE_KEEP = true;
    go('v-plan');
    if(typeof PLAN_SCOPE_KEEP !== 'undefined') PLAN_SCOPE_KEEP = false;
  }
  if(el && host && el.parentNode !== host){
    el.classList.remove('drawer');
    el.classList.add('inpage');
    host.appendChild(el);
  }
  var bar = document.getElementById('planProjBar');
  if(show){
    if(list) list.style.display = 'none';
    if(host) host.style.display = '';
    if(el) el.classList.add('on');
    if(bar) bar.style.display = 'none';
    if(typeof planApplyCrumb === 'function') planApplyCrumb('config');
  } else {
    if(list) list.style.display = '';
    if(host) host.style.display = 'none';
    if(el) el.classList.remove('on');
    if(typeof renderPlanScope === 'function') renderPlanScope();
    if(typeof planApplyCrumb === 'function') planApplyCrumb('list');
  }
}

function batchBack(){
  batchAskLeave(function(){
    batchStash();
    batchPage(false);
  });
}

function batchSwitchProj(id){
  if(!id) return;
  var cur = batchPlanById(BAT_CUR);
  if(cur && (cur.projectId || cur.proj) === id) return;
  batchAskLeave(function(){
    var plans = PLANS.filter(function(x){ return (x.projectId || x.proj) === id; });
    if(!plans.length){ MT.toast('该项目还没有批次计划', 'err'); return; }
    var prefer = plans.filter(function(x){
      return typeof planLifeState === 'function' && planLifeState(x).txt === '待完善';
    })[0] || plans[0];
    BAT_TABS = [];
    openBatch(PLANS.indexOf(prefer));
  });
}

function batchTabClose(id, ev){
  if(ev){ ev.preventDefault(); ev.stopPropagation(); }
  if(id === BAT_CUR) batchStash();
  delete BAT_DRAFTS[id];
  BAT_TABS = BAT_TABS.filter(function(x){ return x !== id; });
  if(!BAT_TABS.length){
    BAT_CUR = '';
    batchPage(false);
    return;
  }
  if(BAT_CUR === id){
    BAT_CUR = BAT_TABS[BAT_TABS.length - 1];
    var idx = PLANS.map(function(x){ return x.id; }).indexOf(BAT_CUR);
    if(idx >= 0) batchShow(idx);
  } else {
    batchRenderTabs();
  }
}

/* ---------- 打开抽屉 ---------- */
function openBatch(idx){
  idx = (typeof idx === 'number') ? idx : parseInt(idx, 10);
  var p = PLANS[idx];
  if(!p){ MT.toast('未找到对应计划', 'err'); return; }
  if(typeof planCanConfig === 'function' && !planCanConfig(p)){
    MT.toast('项目已推送服务商，批次配置已锁定，仅可查看明细', 'err');
    return;
  }
  batchStash();
  var qPid = p.projectId || p.proj || '';
  var first = BAT_TABS.length ? batchPlanById(BAT_TABS[0]) : null;
  var sameProj = first && (first.projectId || first.proj || '') === qPid;
  if(!sameProj) BAT_TABS = batchQueueFor(p);
  if(BAT_TABS.indexOf(p.id) < 0) BAT_TABS.push(p.id);
  BAT_CUR = p.id;
  batchShow(idx);
  batchPage(true);
}

/** 从计划列表的机制文案取出门槛、面额，如「满 99 减 15」「减至 1 元」 */
function planMechAmounts(p){
  var s = String((p && p.mech) || '');
  var cut = s.match(/减至\s*([0-9]+(?:\.[0-9]+)?)/);
  var full = s.match(/满\s*([0-9]+(?:\.[0-9]+)?)\s*(?:元)?\s*减\s*([0-9]+(?:\.[0-9]+)?)/);
  var thrOnly = s.match(/满\s*([0-9]+(?:\.[0-9]+)?)/);
  var out = { face:'', thr:'' };
  if((p && p.mechType) === '减至' || cut){
    if(cut) out.face = Number(cut[1]);
    if(thrOnly && /减至/.test(s)) out.thr = Number(thrOnly[1]);
    return out;
  }
  if(full){ out.thr = Number(full[1]); out.face = Number(full[2]); }
  return out;
}

function batchTakeAmount(saved, planVal, parsed){
  if(saved != null && saved !== '') return saved;
  if(planVal != null && planVal !== '' && Number(planVal) > 0) return planVal;
  if(parsed != null && parsed !== '') return parsed;
  return '';
}

/** 按计划 ID 打开批次信息页（深链接 / 工作台入口用） */
function openBatchById(pid){
  var i = PLANS.map(function(x){ return x.id; }).indexOf(pid);
  if(i < 0){ MT.toast('未找到对应计划', 'err'); return; }
  openBatch(i);
}

/* ---------- 机制类型联动 ---------- */
function batchMechFields(){
  var t = (document.getElementById('bfMechType') || {}).value || '满减';
  return {
    mechType: t,
    thr: (document.getElementById('bfThr') || {}).value || '',
    face: (document.getElementById('bfFace') || {}).value || ''
  };
}

/** 项目活动周期（批次可用时间必须落在其中） */
function projPeriodRange(p){
  var pr = (window.PROJECTS || []).filter(function(x){ return x.id === (p && p.projectId); })[0];
  var per = String((pr && pr.period) || '').split('~');
  var s = String(per[0] || '').trim();
  var e = String(per[1] || '').trim();
  return { s: s ? mnDate(s) : '', e: e ? mnDate(e) : '' };
}

function batchRadio(name, fallback){
  var el = document.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : fallback;
}
function batchSetRadio(name, val){
  var list = document.querySelectorAll('input[name="' + name + '"]');
  for(var i = 0; i < list.length; i++) list[i].checked = list[i].value === val;
}
function batchValidToggle(){
  var after = batchRadio('bfValidMode', 'any') === 'after';
  var inp = document.getElementById('bfValidDays');
  if(inp) inp.disabled = !after;
}
function batchHgThr(){
  var exch = (document.getElementById('bfMechType') || {}).value === '减至';
  var amt = batchRadio('bfThrMode', 'none') === 'amt';
  var inp = document.getElementById('bfThr');
  if(!inp) return;
  if(!exch){ inp.disabled = false; return; }
  inp.disabled = !amt;
  if(!amt) inp.value = '';
}

function batchMechToggle(){
  var t = (document.getElementById('bfMechType') || {}).value || '满减';
  var exch = t === '减至';
  var mj = document.getElementById('bfMjWrap');
  var hg = document.getElementById('bfHgWrap');
  if(mj) mj.style.display = exch ? 'none' : '';
  if(hg) hg.style.display = exch ? '' : 'none';
  var thrWrap = document.getElementById('bfThrWrap');
  if(thrWrap) thrWrap.style.display = exch ? 'none' : '';
  var face = document.getElementById('bfFace');
  var thr = document.getElementById('bfThr');
  var faceSlot = document.getElementById(exch ? 'bfHgFaceSlot' : 'bfMjFaceSlot');
  var thrSlot = document.getElementById(exch ? 'bfHgThrSlot' : 'bfMjThrSlot');
  if(face && faceSlot) faceSlot.appendChild(face);
  if(thr && thrSlot) thrSlot.appendChild(thr);
  if(face) face.placeholder = exch ? '10' : '15';
  batchHgThr();
  batchValidToggle();
  batchMechText();
  batchPreview();
}

function batchMechText(){
  var f = batchMechFields();
  var box = document.getElementById('bfMechTxt');
  if(box){
    var blank = (f.mechType === '减至') ? !String(f.face) : (!String(f.thr) || !String(f.face));
    box.innerHTML = blank
      ? '机制：<b>待填写</b>'
      : ('机制：<b>' + pnEsc(mechText(f)) + '</b>' + (mechCheck(f) ? '　<span class="err">' + pnEsc(mechCheck(f)) + '</span>' : ''));
  }
  batchPeriodTip();
}

/** 可用时间展示为年月日，实际值仍是 YYYY-MM-DD */
function batchDateText(iso){
  var s = mnDate(iso);
  if(!s) return '';
  var p = s.split('-');
  return p[0] + '年' + p[1] + '月' + p[2] + '日';
}

function batchDatePaint(){
  ['bfStart', 'bfEnd'].forEach(function(id){
    var show = document.getElementById(id + 'Show');
    var el = document.getElementById(id);
    if(show && el) show.value = el.value ? batchDateText(el.value) : '';
  });
}

function batchOpenDate(id){
  var el = document.getElementById(id);
  if(!el) return;
  try{
    if(typeof el.showPicker === 'function'){ el.showPicker(); return; }
  }catch(e){}
  el.focus();
  el.click();
}

/** 可用时间超出项目活动周期时才提示 */
function batchPeriodTip(){
  var tip = document.getElementById('bfPeriodTip');
  if(!tip) return;
  var p = PLANS[BAT_EDIT.idx];
  var pr = p ? projPeriodRange(p) : { s:'', e:'' };
  var start = mnDate((document.getElementById('bfStart') || {}).value || '');
  var end = mnDate((document.getElementById('bfEnd') || {}).value || '');
  var over = (pr.s && start && start < pr.s)
    || (pr.e && end && end > pr.e)
    || (pr.e && start && start > pr.e)
    || (pr.s && end && end < pr.s);
  if(over && pr.s && pr.e){
    tip.style.display = '';
    tip.className = 'fld-hint err';
    tip.innerHTML = '可用时间须落在项目活动周期 <b>' + batchDateText(pr.s) + ' ~ ' + batchDateText(pr.e) + '</b> 内';
  } else {
    tip.style.display = 'none';
    tip.innerHTML = '';
  }
}

/* ---------- 右侧示例图：券在消费者卡包里的样子 ---------- */
function batchPreview(){
  if(typeof batchMechText === 'function') batchMechText();
  var face  = document.getElementById('bfFace').value || 0;
  var thr   = document.getElementById('bfThr').value || 0;
  var start = document.getElementById('bfStart').value || '';
  var end   = document.getElementById('bfEnd').value || '';
  batchDatePaint();
  var name  = document.getElementById('bfName').value || '券名称';
  var desc  = document.getElementById('bfDesc').value || '';
  var m = function(v){ return String(Number(v) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };

  var mt = (document.getElementById('bfMechType') || {}).value || '满减';
  var box = document.getElementById('batPreviewCard');
  if(box){
    var sub = thr ? ('满 ' + m(thr) + ' 元可用') : (mt === '减至' ? '减至价 · 无门槛' : '无门槛');
    var left = '<div class="wxcard-l"><span class="amt">¥<b>' + m(face) + '</b></span>'
      + '<span class="thr">' + sub + '</span></div>';
    box.innerHTML = '<div class="wxcard">'
      + left
      + '<div class="wxcard-r"><b>' + pnEsc(name) + '</b>'
      +   '<small>' + (start ? mnDate(start) : '—') + ' 至 ' + (end ? mnDate(end) : '—') + '</small>'
      +   '<small class="mut">' + pnEsc(desc.slice(0, 26)) + (desc.length > 26 ? '…' : '') + '</small></div>'
      + '</div>';
  }
  var span = 0;
  if(start && end) span = Math.round((new Date(end) - new Date(start)) / 86400000);
  var sp = document.getElementById('bfSpan');
  if(sp){
    sp.innerHTML = start && end ? ('可用时间跨度 <b>' + span + '</b> 天（上限 ' + BATCH_FIELDS.spanMax + ' 天）') : '';
    sp.className = span > BATCH_FIELDS.spanMax ? 'mut err' : 'mut';
  }
  var nm = document.getElementById('bfNameLen');
  if(nm){
    var len = (document.getElementById('bfName').value || '').length;
    nm.textContent = len + ' / ' + BATCH_FIELDS.nameMax + ' 个汉字';
    nm.className = len > BATCH_FIELDS.nameMax ? 'mut err' : 'mut';
  }
  var dc = document.getElementById('bfDescLen');
  if(dc){
    var dl = (document.getElementById('bfDesc').value || '').length;
    dc.textContent = dl + ' / ' + BATCH_FIELDS.descMax + ' 字';
    dc.className = dl > BATCH_FIELDS.descMax ? 'mut err' : 'mut';
  }
}

/* ---------- 券详情图 ---------- */
function batchImgRender(){
  var box = document.getElementById('bfImgBox'); if(!box) return;
  var btn = document.getElementById('bfImgBtn'), del = document.getElementById('bfImgDel');
  if(btn) btn.textContent = (BAT_IMG.state === 'ready') ? '更换图片' : '上传图片';
  if(del) del.style.display = (BAT_IMG.state === 'ready' || BAT_IMG.removed) ? '' : 'none';
  if(BAT_IMG.state === 'ready' && BAT_IMG.data){
    box.innerHTML = '<img src="' + BAT_IMG.data + '" alt="券详情图" style="max-width:100%;max-height:150px;border-radius:8px;border:1px solid var(--line);display:block">'
      + '<div class="mut" style="font-size:11.5px;margin-top:4px">' + pnEsc(BAT_IMG.name || '券详情图') + '</div>';
  } else if(BAT_IMG.state === 'ready'){
    box.innerHTML = '<div class="mut" style="padding:12px;border:1px dashed var(--line);border-radius:8px;font-size:12px">已上传：' + pnEsc(BAT_IMG.name || '券详情图') + '<br><span style="font-size:11.4px">刷新后需重新上传图片文件，计划上的记录仍保留</span></div>';
  } else {
    box.innerHTML = '<div class="mut" style="padding:12px;border:1px dashed var(--line);border-radius:8px;font-size:12px">尚未上传</div>';
  }
}

function batchImgPick(inp){
  var f = inp.files && inp.files[0];
  inp.value = '';
  if(!f) return;
  if(!/^image\/(jpeg|png)$/.test(f.type)){ MT.toast('券详情图只支持 JPG / PNG', 'err'); return; }
  if(f.size > BATCH_FIELDS.imgMaxMB * 1024 * 1024){ MT.toast('券详情图不能超过 ' + BATCH_FIELDS.imgMaxMB + 'MB', 'err'); return; }
  var rd = new FileReader();
  rd.onload = function(){
    var url = String(rd.result || '');
    var im = new Image();
    im.onload = function(){
      if(im.naturalWidth < BATCH_FIELDS.imgMinW || im.naturalHeight < BATCH_FIELDS.imgMinH){
        MT.toast('券详情图尺寸不能小于 ' + BATCH_FIELDS.imgMinW + '×' + BATCH_FIELDS.imgMinH + '（当前 ' + im.naturalWidth + '×' + im.naturalHeight + '）', 'err');
        return;
      }
      BAT_IMG = { state:'ready', name:f.name, type:f.type, data:url, removed:false };
      batchImgRender();
      MT.toast('券详情图已选择，保存后生效');
    };
    im.onerror = function(){ MT.toast('图片读取失败，请换一张', 'err'); };
    im.src = url;
  };
  rd.readAsDataURL(f);
}

function batchImgClear(){
  BAT_IMG = { state:'none', name:'', type:'', data:'', removed:true };
  batchImgRender();
}

/* ---------- 保存：校验后写回计划，批次与计划 1:1 ---------- */
function batchSave(goNext){
  var p = PLANS[BAT_EDIT.idx];
  if(!p) return false;
  var pst = batchProjState(p);
  if(['pushed','to_confirm','confirmed','configured','running','finished'].indexOf(pst) >= 0){
    MT.toast('项目已推送服务商，计划批次与机制详细字段不可再修改', 'err');
    return false;
  }

  var name  = (document.getElementById('bfName').value || '').trim();
  var face  = Number(document.getElementById('bfFace').value);
  var thr   = Number(document.getElementById('bfThr').value);
  var start = document.getElementById('bfStart').value;
  var end   = document.getElementById('bfEnd').value;
  var capRaw = document.getElementById('bfCap').value;
  var userRaw = document.getElementById('bfUser').value;
  var desc  = (document.getElementById('bfDesc').value || '').trim();
  var batNo = (document.getElementById('bfBatNo').value || '').trim();

  /* 只做确定性校验：不强制「门槛大于面额」，也不限制 90 天 / 100 张 / 100 字
     —— 这些上限在不同产品与账号下并不一致，统一登记在 docs/微信执行字段待核验.md */
  var mechType = (document.getElementById('bfMechType').value || '满减');
  if((pst === 'passed' || pst === 'to_push') && p.mechType && mechType !== p.mechType){
    MT.toast('审批已通过，不能修改机制类型（' + p.mechType + '）', 'err');
    return false;
  }

  if(!name){ MT.toast('请填写券名称', 'err'); return false; }
  var validMode = batchRadio('bfValidMode', 'any');
  var validDays = Number(document.getElementById('bfValidDays').value);
  var maxPrice = Number(document.getElementById('bfMaxPrice').value);
  var thrMode = batchRadio('bfThrMode', 'none');
  var overBudget = batchRadio('bfOver', 'stop');
  if(mechType === '减至'){
    if(!isFinite(face) || face <= 0){ MT.toast('换购价必须大于 0', 'err'); return false; }
    if(!(maxPrice > 0)){ MT.toast('请填写商品单价最高', 'err'); return false; }
    if(thrMode === 'amt'){
      if(!isFinite(thr) || thr <= 0){ MT.toast('请填写订单优惠门槛', 'err'); return false; }
    } else thr = 0;
  } else if(!isFinite(face) || face <= 0){ MT.toast('券面额必须大于 0', 'err'); return false; }
  if(mechType !== '减至' && (!isFinite(thr) || thr < 0)){ MT.toast('使用门槛必须是不小于 0 的数字', 'err'); return false; }
  if(!start || !end || start > end){ MT.toast('可用时间开始日不能晚于结束日', 'err'); return false; }
  if(validMode === 'after' && (!isFinite(validDays) || validDays <= 0 || Math.abs(validDays - Math.round(validDays)) > 1e-9)){
    MT.toast('请填写领券后可用天数', 'err'); return false;
  }

  /* 批次可用时间必须落在项目活动周期内 */
  var pr = projPeriodRange(p);
  if(pr.s && mnDate(start) < pr.s){ MT.toast('可用开始时间不能早于项目活动周期（' + pr.s + '）', 'err'); return false; }
  if(pr.e && mnDate(end) > pr.e){ MT.toast('可用结束时间不能晚于项目活动周期（' + pr.e + '）', 'err'); return false; }

  if(!desc){ MT.toast('请填写使用说明（消费者可见）', 'err'); return false; }
  if(desc.length > BATCH_FIELDS.descMax){ MT.toast('使用说明不能超过 ' + BATCH_FIELDS.descMax + ' 字', 'err'); return false; }
  var cap = Number(capRaw);
  if(!isFinite(cap) || cap < BATCH_FIELDS.capMin || Math.abs(cap - Math.round(cap)) > 1e-9){
    MT.toast('发放总上限必须是 ' + BATCH_FIELDS.capMin + ' 张及以上的整数', 'err'); return false;
  }
  var user = Number(userRaw);
  if(!isFinite(user) || user < 1 || Math.abs(user - Math.round(user)) > 1e-9){
    MT.toast('单个用户可领个数必须是正整数', 'err'); return false;
  }
  if(user > cap){ MT.toast('单人可领个数不能超过发放总上限（' + cap + ' 张）', 'err'); return false; }

  /* 批次号全局唯一：同一批次不能绑定到两个计划 */
  if(batNo){
    var clash = PLANS.filter(function(x){ return x !== p && x.bat === batNo; })[0];
    if(clash){ MT.toast('批次号 ' + batNo + ' 已被计划「' + clash.name + '」占用，不能重复绑定', 'err'); return false; }
  }

  var retRows = PN.ret.filter(function(x){ return x.sid || x.ret || x.store || x.prov || x.city || x.mch; });
  if(!retRows.length){ MT.toast('请至少添加 1 条活动零售商明细', 'err'); return false; }
  var missRet = [];
  retRows.forEach(function(x, i){
    var lack = [];
    var blank = function(v){ var s = String(v == null ? '' : v).trim(); return !s || s === '—'; };
    if(blank(x.sid)) lack.push('门店编码');
    if(blank(x.ret)) lack.push('零售商名称');
    if(blank(x.prov)) lack.push('省份');
    if(blank(x.city)) lack.push('城市');
    if(lack.length) missRet.push('第 ' + (i + 1) + ' 行缺' + lack.join('、'));
  });
  if(missRet.length){ MT.toast(missRet.join('；'), 'err'); return false; }
  var seenSid = {}, dupSid = '';
  retRows.forEach(function(x, i){
    if(!x.sid) return;
    if(seenSid[x.sid]) dupSid = '第 ' + seenSid[x.sid] + ' 行与第 ' + (i + 1) + ' 行';
    else seenSid[x.sid] = i + 1;
  });
  if(dupSid){ MT.toast('门店编码重复：' + dupSid, 'err'); return false; }
  var badMch = [];
  retRows.forEach(function(x, i){
    x.mch = String(x.mch || '').trim();
    if(x.mch === '—') x.mch = '';
    if(x.mch && !/^\d{8,10}$/.test(x.mch)) badMch.push('第 ' + (i + 1) + ' 行「' + x.mch + '」');
  });
  if(badMch.length && !confirm('以下微信商户号不是 8~10 位数字：\n' + badMch.join('\n') + '\n\n请确认是否仍要保存？')) return false;
  if(typeof miniMchPool === 'function'){
    var pool = miniMchPool();
    if(pool.length){
      var notIn = retRows.filter(function(x){ return x.mch && pool.indexOf(x.mch) < 0; });
      if(notIn.length){
        MT.toast('有 ' + notIn.length + ' 行商户号不在小程序「可发券商户号」列表中，请先在挂券与配置中提供', 'err');
        return false;
      }
    }
  }

  var skuRows = PN.sku.filter(function(x){ return x.code || x.name || x.inCode; });
  if(!skuRows.length){ MT.toast('请至少添加 1 条活动商品明细', 'err'); return false; }
  var skuMax = mechType === '减至' ? 5000 : 15000;
  if(skuRows.length > skuMax){
    MT.toast('活动商品超过上限：' + (mechType === '减至' ? '换购' : '满减') + '最多 ' + skuMax + ' 个（当前 ' + skuRows.length + ' 个）', 'err');
    return false;
  }
  var seenCode = {}, seenIn = {}, dupMsg = '';
  skuRows.forEach(function(x, i){
    var code = String(x.code || '').trim(), inc = String(x.inCode || '').trim();
    if(code && seenCode[code]){ if(!dupMsg) dupMsg = '第 ' + (i + 1) + ' 行 69码「' + code + '」与第 ' + seenCode[code] + ' 行重复'; }
    else if(code) seenCode[code] = i + 1;
    if(inc && seenIn[inc]){ if(!dupMsg) dupMsg = '第 ' + (i + 1) + ' 行 店内码「' + inc + '」与第 ' + seenIn[inc] + ' 行重复'; }
    else if(inc) seenIn[inc] = i + 1;
  });
  if(dupMsg){ MT.toast(dupMsg + '，请去重后再保存', 'err'); return false; }
  /* 门店编码来自客户系统，只去首尾空格，不限定格式 */
  PN.ret.forEach(function(x){ if(x.sid) x.sid = String(x.sid).trim(); });
  var noSid = PN.ret.filter(function(x){ return x.ret || x.store || x.mch; }).filter(function(x){ return !String(x.sid || '').trim(); });
  if(noSid.length){ MT.toast('活动零售商有 ' + noSid.length + ' 行未填门店编码', 'err'); return false; }

  p.batchForm = { name:name, face:face, thr:thr, start:start, end:end,
                  cap:cap, user:user, desc:desc, batNo:batNo,
                  validMode:validMode, validDays: validMode === 'after' ? validDays : '',
                  thrMode:thrMode, maxPrice: mechType === '减至' ? maxPrice : '',
                  overBudget:overBudget };
  if(mechType === '减至') p.maxPrice = maxPrice;

  /* 零售商门店 / 活动商品明细：保存到计划，供计划详情、挂券与配置与推送使用 */
  p.retRows = PN.ret.map(function(x){ return Object.assign({}, x); });
  p.skuRows = PN.sku.map(function(x){ return Object.assign({}, x); });
  p.ret = PN.ret.map(function(x){ return x.store || x.n; }).filter(Boolean);
  p.sku = PN.sku.map(function(x){ return x.name || x.n; }).filter(Boolean);
  p.bs = start; p.be = end; p.bqty = cap;
  p.btitle = name;
  p.mechType = mechType;
  p.rate = 0;
  p.mech = mechText({ mechType:mechType, thr:thr, face:face });
  p.bmech = p.mech;

  /* 计划方案与批次分层保存：已产生核销的计划不再被批次表单改掉面额与数量 */
  if(!p.used){
    p.face = face; p.thr = thr; p.qty = cap;
  } else if(p.face !== face || p.qty !== cap){
    MT.toast('该计划已有核销记录，面额/数量沿用原审批方案，差异请走变更审批');
  }

  /* 不再自动编造外部批次号，也不再自动标记为「已审核」 */
  if(BAT_IMG.removed){
    delete p.img; delete PLAN_IMG_DATA[p.id];
  } else if(BAT_IMG.state === 'ready'){
    p.img = { name: BAT_IMG.name || '券详情图', type: BAT_IMG.type || 'image/png', at: (typeof wfNow === 'function') ? wfNow() : '' };
    if(BAT_IMG.data) PLAN_IMG_DATA[p.id] = BAT_IMG.data;
  }
  p.bat = batNo || '';
  p.bstat = batNo ? '待提报' : '待补充批次';
  p.updatedAt = (typeof wfNow === 'function') ? wfNow() : '';

  sysLog('计划与批次', '保存批次配置', p.name, p.id,
    '券名称 ' + name + '；面额 ' + face + ' 元；门槛 ' + thr + ' 元；可用 ' + start + ' ~ ' + end
    + '；零售商 ' + PN.ret.length + ' 条；商品 ' + PN.sku.length + ' 条');

  if(typeof mnPersist === 'function') mnPersist();
  delete BAT_DRAFTS[p.id];
  batchMarkClean();
  renderPlans();
  if(typeof renderProjCards === 'function') renderProjCards();
  batchRenderTabs();
  MT.toast(batNo
    ? '批次信息已保存，等待服务商在商户后台创建后回填审核结果'
    : '批次信息已保存（未填批次号，保持未提报状态）');
  if(goNext) batchNext();
  return true;
}

/* ---------- 模板：dw-batch ---------- */
function tplDrawerBatch(){
  return `<div class="drawer dw-batch" id="dw-batch">
  <div class="dw-h">
    <h3 id="batTitle">补充批次信息</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">
    <div style="margin-bottom:10px"><a class="btn btn-g btn-xs" onclick="batchBack()">← 返回计划与批次</a></div>
    <div class="bat-leave" id="batLeave" style="display:none" onclick="if(event.target===this) batLeaveAct('stay')">
      <div class="bat-leave-box" role="dialog" aria-modal="true">
        <h4>尚未保存</h4>
        <p>当前批次配置已修改，尚未保存。</p>
        <div class="bat-leave-acts">
          <button class="btn btn-g" type="button" onclick="batLeaveAct('stay')">继续编辑</button>
          <button class="btn btn-o" type="button" onclick="batLeaveAct('drop')">不保存离开</button>
          <button class="btn btn-p" type="button" onclick="batLeaveAct('save')">保存并离开</button>
        </div>
      </div>
    </div>
    <div class="bat-proj" id="batProjBar"></div>
    <div class="note b" id="batLockNote" style="display:none;margin:10px 18px 0"></div>
    <div class="bat-work">
    <aside class="bat-queue" id="batQueue"></aside>
    <div class="bat-grid">
      <div class="bat-main">
      <div class="bat-form">
        <div class="psec"><h4>一、批次必填字段</h4><span class="psec-r">对标微信支付后台</span></div>

        <div class="fr">
          <label>券名称<em>*</em></label>
          <input class="inp" id="bfName" maxlength="20" oninput="batchPreview()" placeholder="如：双节满减券">
          <div class="fld-hint"><span id="bfNameLen" class="mut">0 / 9 个汉字</span> · 例：双节满减券（不超过 9 个汉字，超长商户平台直接拒绝）</div>
        </div>

        <div class="fr">
          <label>批次号</label>
          <input class="inp" id="bfBatNo" readonly placeholder="待服务商上传" style="background:var(--bg-soft);color:var(--ink-60)">
          <div class="fld-hint">由服务商在微信支付后台生成后回传，创建人不用填写</div>
        </div>

                <div class="fg c2">
          <div class="fr">
            <label>机制类型<em>*</em></label>
            <select class="inp" id="bfMechType" onchange="batchMechToggle()">
              <option value="满减">满减</option>
              <option value="减至">减至（换购券）</option>
            </select>
            <div class="fld-hint">减至对应微信支付换购券</div>
          </div>
          <div class="fr" id="bfMjWrap">
            <label>券面额（元）<em>*</em></label>
            <span id="bfMjFaceSlot"><input class="inp" id="bfFace" type="number" min="0.01" step="0.01" oninput="batchPreview()" placeholder="15"></span>
            <div class="fld-hint">例：15　即为消费者实际抵扣金额</div>
          </div>
        </div>

        <div class="fr" id="bfThrWrap">
          <label>使用门槛（元）</label>
          <span id="bfMjThrSlot"><input class="inp" id="bfThr" type="number" min="0" oninput="batchPreview()" placeholder="99"></span>
          <div class="fld-hint">满减需填</div>
        </div>

        <div id="bfHgWrap" style="display:none">
          <div class="fr">
            <label>优惠门槛<em>*</em></label>
            <label class="bat-radio"><input type="radio" name="bfThrMode" value="none" checked onchange="batchHgThr()"> 不限制订单优惠门槛</label>
            <label class="bat-radio">
              <input type="radio" name="bfThrMode" value="amt" onchange="batchHgThr()"> 订单金额满
              <span id="bfHgThrSlot"></span> 元可享受优惠
            </label>
          </div>
          <div class="fr">
            <label>最高单价<em>*</em></label>
            <div class="bat-inline">商品单价最高 <input class="inp" id="bfMaxPrice" type="number" min="0.01" step="0.01" placeholder="12" style="width:88px"> 元</div>
            <div class="fld-hint">商品单价超过最高单价则不享受优惠</div>
          </div>
          <div class="fr">
            <label>优惠规则<em>*</em></label>
            <div class="bat-inline"><span id="bfHgFaceSlot"></span> 元换购指定商品（减至固定优惠价）</div>
          </div>
        </div>
        <div class="fld-hint" id="bfMechTxt"></div>

        <div class="fg c2">
          <div class="fr">
            <label>可用开始时间<em>*</em></label>
            <div class="bat-date" onclick="batchOpenDate('bfStart')">
              <input class="inp bat-date-show" id="bfStartShow" readonly placeholder="年 / 月 / 日" tabindex="-1">
              <span class="bat-date-ico" aria-hidden="true"></span>
              <input class="bat-date-pick" id="bfStart" type="date" onchange="batchPreview()" onclick="event.stopPropagation()">
            </div>
          </div>
          <div class="fr">
            <label>可用结束时间<em>*</em></label>
            <div class="bat-date" onclick="batchOpenDate('bfEnd')">
              <input class="inp bat-date-show" id="bfEndShow" readonly placeholder="年 / 月 / 日" tabindex="-1">
              <span class="bat-date-ico" aria-hidden="true"></span>
              <input class="bat-date-pick" id="bfEnd" type="date" onchange="batchPreview()" onclick="event.stopPropagation()">
            </div>
          </div>
        </div>
        <div class="fr" style="margin-top:4px">
          <label class="bat-radio"><input type="radio" name="bfValidMode" value="any" checked onchange="batchValidToggle()"> 有效期内，任意时间可用</label>
          <label class="bat-radio">
            <input type="radio" name="bfValidMode" value="after" onchange="batchValidToggle()"> 有效期内，用户领券后
            <input class="inp" id="bfValidDays" type="number" min="1" step="1" placeholder="请输入" style="width:88px" disabled> 天内可用
          </label>
          <div class="fld-hint" id="bfValidDaysTip">用户在活动有效期开始前领券，从有效期第一天起算；在有效期内领券，从领取当天起算。无论何时领取，有效期结束后都不可用。</div>
        </div>
        <div class="fld-hint" id="bfSpan"></div>
        <div class="fld-hint" id="bfPeriodTip" style="display:none"></div>

        <div class="psec"><h4>二、发放控制</h4></div>
        <div class="fg c2">
          <div class="fr">
            <label>发放总上限（张）<em>*</em></label>
            <input class="inp" id="bfCap" type="number" min="6" step="1" placeholder="9000">
            <div class="fld-hint">必填，6 张及以上；单人可领不能超过此值</div>
          </div>
          <div class="fr">
            <label>单人可领个数<em>*</em></label>
            <input class="inp" id="bfUser" type="number" min="1" max="100" placeholder="2">
            <div class="fld-hint">至少 1，且不得超过发放总上限</div>
          </div>
        </div>

        <div class="fr">
          <label>使用说明（消费者可见）<em>*</em></label>
          <textarea class="inp" id="bfDesc" rows="3" oninput="batchPreview()" maxlength="1024"></textarea>
          <div class="fld-hint"><span id="bfDescLen" class="mut">0 / 1024 字</span> · 限 1024 字；例：限指定商品使用，不可兑换现金，可在微信支付卡包查看。</div>
        </div>

        <div class="fr">
          <label>券详情图</label>
          <div class="bat-imgbox" id="bfImgBox"></div>
          <input type="file" id="bfImgFile" accept="image/jpeg,image/png" style="display:none" onchange="batchImgPick(this)">
          <div class="flex" style="gap:8px;margin-top:8px">
            <button class="btn btn-g btn-xs" type="button" id="bfImgBtn" onclick="document.getElementById('bfImgFile').click()">上传图片</button>
            <button class="btn btn-o btn-xs" type="button" id="bfImgDel" onclick="batchImgClear()">移除</button>
          </div>
          <div class="fld-hint">选填；JPG/PNG，尺寸不小于 537×202，建议同比例 2x/3x（如 1074×404），单张不超过 5MB</div>
        </div>
      </div>

      </div>

      <div class="bat-side">
        <div class="psec"><h4>字段示例图</h4><span class="psec-r">消费者卡包</span></div>
        <div id="batPreviewCard"></div>
        <div class="note b" style="margin-top:10px">消费者领券卡片预览</div>
      </div>
    <div class="bat-lines">
    <div class="bat-line">
    <div class="psec"><h4>三、活动零售商</h4><span class="psec-r"><b id="bfRetCnt">0</b> 条</span></div>
    <div class="bat-line-scroll">
    <table class="bt mini" style="table-layout:fixed">
      <thead><tr>
        <th style="width:4%">#</th>
        <th style="width:11%">门店编码<em>*</em></th>
        <th style="width:12%">零售商名称<em>*</em></th>
        <th style="width:21%">门店名称</th>
        <th style="width:7%">省份<em>*</em></th>
        <th style="width:7%">城市<em>*</em></th>
        <th style="width:13%">微信商户号</th>
        <th style="width:8%">经度</th>
        <th style="width:9%">纬度</th>
        <th style="width:8%">操作</th>
      </tr></thead>
      <tbody id="bfRetBody"><tr><td colspan="10" class="empty-row">尚未添加</td></tr></tbody>
    </table>
    </div>
    <div class="flex" style="gap:8px;margin-top:8px">
      <input type="file" id="bfRetFile" accept=".csv,.txt" style="display:none" onchange="bfImpFile(this,'ret')">
      <button class="btn btn-g btn-xs" type="button" onclick="bfImpTpl('ret')">下载模板</button>
      <button class="btn btn-g btn-xs" type="button" onclick="document.getElementById('bfRetFile').click()">导入</button>
      <button class="btn btn-o btn-xs" type="button" onclick="bfItemAdd('ret')">＋ 添加</button>
      <span class="mut" id="bfMchTip" style="margin-left:auto;font-size:12px"></span>
    </div>
    </div>
    <div class="bat-line">
    <div class="psec"><h4>四、活动商品</h4><span class="psec-r"><b id="bfSkuCnt">0</b> 条</span></div>
    <div class="bat-line-scroll">
    <table class="bt mini" style="table-layout:fixed">
      <thead><tr>
        <th style="width:4%">#</th>
        <th style="width:17%">69码</th>
        <th>商品名称</th>
        <th style="width:13%">店内码</th>
        <th style="width:14%">所属零售商</th>
        <th style="width:7%">操作</th>
      </tr></thead>
      <tbody id="bfSkuBody"><tr><td colspan="6" class="empty-row">尚未添加</td></tr></tbody>
    </table>
    </div>
    <div class="flex" style="gap:8px;margin-top:8px">
      <input type="file" id="bfSkuFile" accept=".csv,.txt" style="display:none" onchange="bfImpFile(this,'sku')">
      <button class="btn btn-g btn-xs" type="button" onclick="bfImpTpl('sku')">下载模板</button>
      <button class="btn btn-g btn-xs" type="button" onclick="document.getElementById('bfSkuFile').click()">导入</button>
      <button class="btn btn-o btn-xs" type="button" onclick="bfItemAdd('sku')">＋ 添加</button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
  <div class="dw-f">
    <div class="rgt" style="margin-left:auto">
      <button class="btn btn-o" onclick="batchNext()">下一份</button>
      <button class="btn btn-p" onclick="batchSave(true)">保存并下一份</button>
      <button class="btn btn-p" onclick="batchSave()">保存</button>
    </div>
  </div>
</div>`;
}

function bfItemAdd(kind){
  var list = kind === 'ret' ? PN.ret : PN.sku;
  if(list.length >= 50){ MT.toast('最多 50 行', 'err'); return; }
  if(kind === 'ret') list.push({ sid:'', ret:'', store:'', prov:'', city:'', mch:'', lng:null, lat:null });
  else list.push({ code:'', name:'', inCode:'', owner:'' });
  pnRender();
}

function bfImpCols(kind){
  return kind === 'ret'
    ? [['sid','门店编码'],['ret','零售商名称'],['store','门店名称'],['prov','省份'],['city','城市'],['mch','微信商户号'],['lng','经度'],['lat','纬度']]
    : [['code','69码或店内码'],['name','商品名称'],['owner','店内码所属零售商']];
}

function bfImpTpl(kind){
  var cols = bfImpCols(kind);
  var sample = kind === 'ret'
    ? 'MD000100,永辉超市,永辉超市（重庆观音桥店）,重庆市,重庆,1236057802,106.5507,29.5647'
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

function bfImpFile(inp, kind){
  var f = inp.files && inp.files[0];
  if(!f) return;
  var rd = new FileReader();
  rd.onload = function(){ bfImpText(String(rd.result || ''), kind); };
  rd.readAsText(f, 'utf-8');
  inp.value = '';
}

function bfImpText(text, kind){
  var cols = bfImpCols(kind);
  var list = kind === 'ret' ? PN.ret : PN.sku;
  var lines = String(text || '').split(/\r?\n/).map(function(s){ return s.trim(); }).filter(Boolean);
  if(!lines.length){ MT.toast('没有可导入的内容', 'err'); return; }
  var split = (typeof impSplit === 'function') ? impSplit : function(s){
    return s.split(',').map(function(x){ return x.replace(/^"|"$/g, '').trim(); });
  };
  var norm = function(s){ return String(s == null ? '' : s).replace(/[\s*＊]/g, ''); };
  var head = split(lines[0]);
  var isHead = norm(head[0]) === norm(cols[0][1])
    || cols.every(function(c, i){ return norm(head[i]) === norm(c[1]); });
  var added = 0, dup = 0, noSid = 0;
  for(var i = isHead ? 1 : 0; i < lines.length; i++){
    var cs = split(lines[i]);
    var row = kind === 'ret'
      ? { sid:'', ret:'', store:'', prov:'', city:'', mch:'', lng:null, lat:null }
      : { code:'', name:'', inCode:'', owner:'' };
    var empty = true;
    cols.forEach(function(c, ci){
      row[c[0]] = (cs[ci] || '').trim();
      if(row[c[0]]) empty = false;
    });
    if(empty) continue;
    /* 门店编码必填，来自客户系统，不限定格式 */
    if(kind === 'ret' && !row.sid){ noSid++; continue; }
    var same = list.some(function(x){
      return kind === 'ret'
        ? (x.store === row.store && x.ret === row.ret)
        : ((x.inCode || x.code) + '|' + (x.owner || '')) === ((row.inCode || row.code) + '|' + (row.owner || ''));
    });
    if(same){ dup++; continue; }
    if(list.length >= 50) break;
    list.push(row);
    added++;
  }
  pnRender();
  if(!added) MT.toast('没有新增行' + (dup ? '（全部重复）' : '') + (noSid ? '（' + noSid + ' 行缺门店编码）' : ''), 'err');
  else MT.toast('已追加 ' + added + ' 行' + (dup ? '，跳过重复 ' + dup + ' 行' : '') + (noSid ? '，' + noSid + ' 行缺门店编码未导入' : ''));
}

MT.defineDrawer('dw-batch', tplDrawerBatch);

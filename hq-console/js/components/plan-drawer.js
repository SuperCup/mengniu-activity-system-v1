/* =============================================================================
 * components/plan-drawer.js — 创建 / 编辑活动计划抽屉
 * 对应待确认清单标黄项：
 *   · 2 审批通过后补充计划明细：机制、开始时间、结束时间、
 *       零售商明细（导入）、商品明细（导入）都在本抽屉内填报
 *   · 10 零售商 / 门店：导入
 *   · 11 商品：导入（69码或店内码 + 商品名称 + 店内码所属零售商）
 * ========================================================================== */

/** 当前编辑中的计划草稿（不落库，保存时写回 PLANS） */
var PN = { idx:-1, ret:[], sku:[] };

/* ---------- 打开抽屉 ---------- */
function openPlanNew(idx){
  PN.idx = (typeof idx === 'number') ? idx : -1;
  var editing = PN.idx >= 0;
  var p = editing ? PLANS[PN.idx] : null;

  /* 新建计划只挂到从项目列表带进来的那个项目 */
  var scope = window.PLAN_SCOPE;
  var scopeId = scope && scope.id ? scope.id : '';
  var projId = p ? (p.projectId || p.proj) : scopeId;
  if(!projId){
    MT.toast('请从项目列表进入该项目的计划与批次后再创建', 'err');
    return;
  }
  PN.projId = projId;
  var proj = (window.PROJECTS || []).filter(function(x){ return x.id === projId; })[0];

  document.getElementById('pnTitle').innerHTML = (editing ? '编辑活动计划' : '创建活动计划')
    + ' <span class="sub">' + (proj ? '项目：' + proj.name + ' · ' + proj.id : '请先选择项目') + '</span>';

  document.getElementById('pnName').value   = p ? p.name : '';
  document.getElementById('pnMech').value   = p ? p.mech : '';
  document.getElementById('pnStart').value  = p ? p.s : '2026-12-20';
  document.getElementById('pnEnd').value    = p ? p.e : '2027-01-05';
  document.getElementById('pnBudget').value = p ? pnFmt(p.budget) : 0;
  document.getElementById('pnQty').value    = p ? pnFmt(p.qty) : 0;
  document.getElementById('pnFace').value   = p ? p.face : 0;
  document.getElementById('pnThr').value    = p ? p.thr : 0;
  document.getElementById('pnLimit').value  = p ? p.limit : '每人限领 2 张';
  document.getElementById('pnValid').value  = p ? p.valid : '随批次有效期';

  pnLoadRows(p);

  pnRender();
  openDrawer('dw-plannew');
}

/* ---------- 明细草稿：从计划带出（计划抽屉与批次抽屉共用） ---------- */
function pnLoadRows(p){
  PN.ret = [];
  PN.sku = [];
  if(p && p.retRows && p.retRows.length){
    PN.ret = p.retRows.map(function(r){ return Object.assign({}, r); });
  } else if(p && p.ret && p.ret.length){
    p.ret.forEach(function(n){ PN.ret.push({ ret:'—', store:n, prov:'—', city:'—', mch:'', n:n }); });
  }
  if(p && p.skuRows && p.skuRows.length){
    PN.sku = p.skuRows.map(function(r){ return Object.assign({}, r); });
  } else if(p && p.sku && p.sku.length){
    p.sku.forEach(function(n){ PN.sku.push({ code:'—', name:n, owner:'—', n:n }); });
  }
}

/* ---------- 渲染两张明细表：计划抽屉（pn*）与批次抽屉（bf*）共用同一份草稿 ---------- */
function pnRender(){
  /* 零售商明细：零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号 */
  var retHtml = '';
  if(!PN.ret.length){
    retHtml = '<tr><td colspan="9" class="empty-row">尚未导入零售商 / 门店，点下方「导入零售商门店名单」</td></tr>';
  } else {
    PN.ret.forEach(function(it, i){
      retHtml += '<tr>'
        + '<td class="idx">' + (i+1) + '</td>'
        + '<td><span class="ro sx-mono" style="font-size:11.4px">' + pnEsc(it.sid || '—') + '</span></td>'
        + '<td><span class="ro">' + pnEsc(it.ret || '—') + '</span></td>'
        + '<td><span class="ro">' + pnEsc(it.store || it.n || '—') + '</span></td>'
        + '<td><span class="ro mut">' + pnEsc(it.prov || '—') + '</span></td>'
        + '<td><span class="ro mut">' + pnEsc(it.city || '—') + '</span></td>'
        + '<td><span class="ro mut sx-mono" style="font-size:11.6px">' + (it.mch ? pnEsc(it.mch) : '<span class="tg tg-a">待服务商补充</span>') + '</span></td>'
        + '<td><span class="ro mut sx-mono" style="font-size:11px">' + ((it.lng != null && it.lat != null) ? (it.lng + ', ' + it.lat) : '—') + '</span></td>'
        + '<td><span class="del" onclick="pnDel(\'ret\',' + i + ')">移除</span></td>'
        + '</tr>';
    });
  }
  var pnRet = document.getElementById('pnRetBody');
  if(pnRet) pnRet.innerHTML = retHtml;
  var bfRet = document.getElementById('bfRetBody');
  if(bfRet) bfRet.innerHTML = bfDetailHtml('ret');

  /* 商品明细：69码或店内码 / 商品名称 / 店内码所属零售商 */
  var skuHtml = '';
  if(!PN.sku.length){
    skuHtml = '<tr><td colspan="6" class="empty-row">尚未导入商品，点下方「导入商品明细」</td></tr>';
  } else {
    PN.sku.forEach(function(it, i){
      skuHtml += '<tr>'
        + '<td class="idx">' + (i+1) + '</td>'
        + '<td><span class="ro sx-mono" style="font-size:11.8px">' + pnEsc(it.code || '—') + '</span></td>'
        + '<td><span class="ro">' + pnEsc(it.name || it.n || '—') + '</span></td>'
        + '<td><span class="ro mut sx-mono" style="font-size:11.6px">' + pnEsc(it.inCode || '—') + '</span></td>'
        + '<td><span class="ro mut">' + pnEsc(it.owner || '—') + '</span></td>'
        + '<td><span class="del" onclick="pnDel(\'sku\',' + i + ')">移除</span></td>'
        + '</tr>';
    });
  }
  var pnSku = document.getElementById('pnSkuBody');
  if(pnSku) pnSku.innerHTML = skuHtml;
  var bfSku = document.getElementById('bfSkuBody');
  if(bfSku) bfSku.innerHTML = bfDetailHtml('sku');

  var set = function(ids, v){
    ids.forEach(function(id){ var el = document.getElementById(id); if(el) el.textContent = v; });
  };
  set(['pnRetCnt','bfRetCnt','pnFRet'], PN.ret.length);
  set(['pnSkuCnt','bfSkuCnt','pnFSku'], PN.sku.length);

  /* 未填商户号的条目数提示：销售没有则由服务商提报时补充 */
  var miss = PN.ret.filter(function(x){ return !x.mch; }).length;
  ['pnMchTip','bfMchTip'].forEach(function(id){
    var tip = document.getElementById(id); if(!tip) return;
    tip.innerHTML = miss
      ? ('其中 <b>' + miss + '</b> 家门店未填微信商户号，推送服务商后由服务商提报时补充')
      : '门店微信商户号已全部填写';
    tip.className = 'note' + (miss ? '' : ' g');
  });
}

function bfIn(type, i, k, v, ph){
  return '<input class="inp" style="width:100%" value="' + vsEsc(v || '') + '" placeholder="' + pnEsc(ph) + '"'
    + ' oninput="pnSet(\'' + type + '\',' + i + ',\'' + k + '\',this.value)">';
}
function bfCell(type, i, k, v, ph){
  return '<td>' + bfIn(type, i, k, v, ph) + '</td>';
}

/* 批次抽屉里的零售商 / 商品：与创建项目的明细一样，逐行填写、导入文件，不从库选择 */
function bfDetailHtml(kind){
  var h = '';
  if(kind === 'ret'){
    if(!PN.ret.length){
      return '<tr><td colspan="8" class="empty-row">还没有明细，可添加或导入</td></tr>';
    }
    PN.ret.forEach(function(it, i){
      h += '<tr><td class="idx">' + (i + 1) + '</td>'
        + bfCell('ret', i, 'sid', it.sid, '客户系统编码')
        + bfCell('ret', i, 'ret', it.ret, '永辉')
        + bfCell('ret', i, 'store', it.store || it.n, '永辉超市（重庆观音桥店）')
        + bfCell('ret', i, 'prov', it.prov, '重庆')
        + bfCell('ret', i, 'city', it.city, '重庆')
        + bfCell('ret', i, 'mch', it.mch, '1236057802')
        + bfCell('ret', i, 'lng', it.lng, '106.5507')
        + bfCell('ret', i, 'lat', it.lat, '29.5647')
        + '<td><span class="del" onclick="pnDel(\'ret\',' + i + ')">删除</span></td></tr>';
    });
    return h;
  }
  if(!PN.sku.length){
    return '<tr><td colspan="6" class="empty-row">还没有明细，可「添加一行」或「导入文件」</td></tr>';
  }
  PN.sku.forEach(function(it, i){
    h += '<tr><td class="idx">' + (i + 1) + '</td>'
      + bfCell('sku', i, 'code', it.code, '6923644223456')
      + bfCell('sku', i, 'name', it.name || it.n, '特仑苏纯牛奶 250ml×12')
      + bfCell('sku', i, 'inCode', it.inCode, 'YH-88921')
      + bfCell('sku', i, 'owner', it.owner, '永辉超市')
      + '<td><span class="del" onclick="pnDel(\'sku\',' + i + ')">删除</span></td></tr>';
  });
  return h;
}

function pnSet(type, i, k, v){
  var arr = type === 'ret' ? PN.ret : PN.sku;
  if(!arr[i]) return;
  arr[i][k] = v;
}

function pnDel(type, i){
  var arr = type === 'ret' ? PN.ret : PN.sku;
  arr.splice(i, 1);
  pnRender();
}

/* 保留旧调用点：明细新增统一走导入 */
function pnAddSku(){ openImp('sku'); }
function pnSum(){ return; }

/* ---------- 保存：写回 PLANS ---------- */
function pnSave(again){
  var name = (document.getElementById('pnName').value || '').trim();
  var mech = (document.getElementById('pnMech').value || '').trim();
  if(!name){ MT.toast('请填写计划名称', 'err'); document.getElementById('pnName').focus(); return; }
  if(!mech){ MT.toast('请填写机制', 'err'); document.getElementById('pnMech').focus(); return; }

  var s = document.getElementById('pnStart').value;
  var e = document.getElementById('pnEnd').value;
  if(!s || !e || s > e){ MT.toast('开始时间不能晚于结束时间', 'err'); return; }

  /* 计划时间必须落在项目活动周期内 */
  var pr = (window.PROJECTS || []).filter(function(x){ return x.id === PN.projId; })[0];
  var per = String((pr && pr.period) || '').split('~');
  var ps = per[0] ? mnDate(String(per[0]).trim()) : '';
  var pe = per[1] ? mnDate(String(per[1]).trim()) : '';
  if(ps && mnDate(s) < ps){ MT.toast('开始时间不能早于项目活动周期（' + ps + '）', 'err'); return; }
  if(pe && mnDate(e) > pe){ MT.toast('结束时间不能晚于项目活动周期（' + pe + '）', 'err'); return; }

  var budget = pnNum(document.getElementById('pnBudget').value);
  var face   = pnNum(document.getElementById('pnFace').value);
  var thr    = pnNum(document.getElementById('pnThr').value);
  var qty    = pnNum(document.getElementById('pnQty').value);

  /* 只校验确定性规则（有限、非负、数量为整数），不套用「门槛必须大于面额」等未经核验的猜测 */
  if(!isFinite(budget) || budget < 0){ MT.toast('计划预算必须是不小于 0 的数字', 'err'); return; }
  if(!isFinite(face) || face < 0){ MT.toast('券面额必须是不小于 0 的数字', 'err'); return; }
  if(!isFinite(thr) || thr < 0){ MT.toast('门槛必须是不小于 0 的数字', 'err'); return; }
  if(!isFinite(qty) || qty < 0 || Math.abs(qty - Math.round(qty)) > 1e-9){
    MT.toast('发放数量必须是非负整数', 'err'); return;
  }

  var now = (typeof wfNow === 'function') ? wfNow() : '';
  var obj = {
    name: name, mech: mech, s: s, e: e,
    ret: PN.ret.map(function(x){ return x.store || x.n; }),
    sku: PN.sku.map(function(x){ return x.name || x.n; }),
    retRows: PN.ret.map(function(x){ return Object.assign({}, x); }),
    skuRows: PN.sku.map(function(x){ return Object.assign({}, x); }),
    budget: budget,
    coupon: '满 ' + thr + ' 元减 ' + face + ' 元',
    face: face, thr: thr, qty: qty,
    limit: document.getElementById('pnLimit').value,
    valid: document.getElementById('pnValid').value
  };

  if(PN.idx >= 0){
    var p = PLANS[PN.idx];
    for(var k in obj) p[k] = obj[k];
    p.version = (p.version || 1) + 1;
    p.updatedAt = now;
    MT.toast('计划已保存（版本 v' + p.version + '）');
  } else {
    var maxN = 0;
    PLANS.forEach(function(x){
      var m = /(\d+)$/.exec(x.id || '');
      if(m) maxN = Math.max(maxN, parseInt(m[1], 10));
    });
    obj.id = 'PL-' + (maxN + 1);
    obj.pid = 'ZS-HD-202612-' + String.fromCharCode(65 + (PLANS.length % 26));
    obj.projectId = PN.projId || '';
    obj.proj = obj.projectId;
    obj.type = 'voucher';
    obj.exec = null;
    obj.configState = 'todo';
    obj.assignee = (typeof mnCurrentUser === 'function') ? mnCurrentUser().name : '李雪';
    obj.version = 1;
    obj.updatedAt = now;
    obj.bat = ''; obj.bstat = '待补充批次';
    obj.btitle = ''; obj.bmech = ''; obj.bs = ''; obj.be = '';
    obj.bchannel = ''; obj.bqty = 0; obj.used = 0; obj.usedAmt = 0;
    PLANS.push(obj);
    MT.toast('计划已创建，可在「计划与批次」补充批次信息');
  }

  sysLog('计划与批次', (PN.idx >= 0 ? '编辑计划' : '创建计划'), name,
    (PN.idx >= 0 ? PLANS[PN.idx].id : obj.id),
    '机制 ' + mech + '；生效 ' + s + ' ~ ' + e + '；零售商 ' + PN.ret.length + ' 条；商品 ' + PN.sku.length + ' 条');

  if(typeof mnPersist === 'function') mnPersist();
  renderPlans();
  closeDrawer();
  if(typeof renderProjCards === 'function') renderProjCards();

  if(again){
    setTimeout(function(){ openPlanNew(-1); }, 180);
  }
}

/** 兼容旧入口：直接新增一条空计划 */
function addPlan(){
  PLANS.push({
    id:'PL-' + ('0' + (PLANS.length+1)).slice(-2),
    pid:'ZS-HD-202612-' + String.fromCharCode(65 + PLANS.length),
    name:'新建计划（未命名）', mech:'待填写',
    s:'2026-12-20', e:'2027-01-05',
    ret:[], sku:[], retRows:[], skuRows:[],
    budget:0, coupon:'待填写', face:0, thr:0, qty:0,
    limit:'待填写', valid:'随批次有效期',
    bat:'', bstat:'待补充批次', btitle:'', bmech:'', bs:'', be:'', bchannel:'', bqty:0, used:0, usedAmt:0
  });
  PLAN_PAGE = Math.ceil(PLANS.length / PLAN_SIZE);
  renderPlans();
}

/* ---------- 模板：dw-plannew ---------- */
function tplDrawerplannew(){
  return `<div class="drawer" id="dw-plannew" style="width:1040px">
  <div class="dw-h">
    <h3 id="pnTitle">创建活动计划 <span class="sub">项目：双节常温奶满减 · 2026101810000005</span></h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">

    <div class="note b" style="margin-top:0">
      <b>审批通过后补充：</b>券名称、文案等细节在本计划内补齐。机制、起止时间、活动零售商、活动商品都在这里填报，创建项目时不填写。
    </div>

    <!-- 一、计划基础信息 -->
    <div class="psec"><h4>一、计划基础信息</h4></div>
    <div class="fr">
      <label>计划名称<em>*</em></label><input class="inp" id="pnName" placeholder="如：双节满减主推">
    </div>
    <div class="fr">
      <label>机制<em>*</em></label><input class="inp" id="pnMech" placeholder="如：常温奶满 99 减 15">
    </div>
    <div class="fg c2">
      <div class="fr"><label>开始时间<em>*</em></label><input class="inp" id="pnStart" type="date" value="2026-12-20"></div>
      <div class="fr"><label>结束时间<em>*</em></label><input class="inp" id="pnEnd" type="date" value="2027-01-05"></div>
    </div>

    <!-- 二、零售商明细 -->
    <div class="psec"><h4>二、零售商 / 门店明细</h4><span class="psec-r"><b id="pnRetCnt">0</b> 条</span></div>
    <table class="bt" style="table-layout:fixed">
      <thead><tr>
        <th style="width:4%">#</th>
        <th style="width:10%">门店编码</th>
        <th style="width:15%">零售商名称</th>
        <th style="width:21%">门店名称</th>
        <th style="width:8%">省份</th>
        <th style="width:8%">城市</th>
        <th style="width:14%">微信商户号</th>
        <th style="width:11%">经纬度</th>
        <th style="width:9%">操作</th>
      </tr></thead>
      <tbody id="pnRetBody"><tr><td colspan="9" class="empty-row">尚未导入零售商 / 门店</td></tr></tbody>
    </table>
    <div class="imp-row" onclick="openImp('ret')">
      <span class="ic">⇪</span> 导入零售商门店名单
      <span class="hint">门店编码 / 零售商 / 门店名称 / 省份 / 城市 / 商户号 / 经纬度</span>
    </div>
    <div class="note" id="pnMchTip" style="margin-top:10px">门店微信商户号可空，由服务商提报时补充</div>

    <!-- 三、商品明细 -->
    <div class="psec"><h4>三、活动商品明细</h4><span class="psec-r"><b id="pnSkuCnt">0</b> 条</span></div>
    <table class="bt" style="table-layout:fixed">
      <thead><tr>
        <th style="width:4%">#</th>
        <th style="width:20%">69码</th>
        <th style="width:34%">商品名称</th>
        <th style="width:14%">店内码</th>
        <th style="width:20%">店内码所属零售商</th>
        <th style="width:8%">操作</th>
      </tr></thead>
      <tbody id="pnSkuBody"><tr><td colspan="6" class="empty-row">尚未导入商品</td></tr></tbody>
    </table>
    <div class="imp-row" onclick="openImp('sku')">
      <span class="ic">⇪</span> 导入商品明细
      <span class="hint">69码 / 商品名称 / 店内码 / 店内码所属零售商</span>
    </div>

    <!-- 四、预算与优惠发放规则 -->
    <div class="psec"><h4>四、预算与优惠发放规则</h4></div>
    <div class="fg c2">
      <div class="fr"><label>计划预算（元）<em>*</em></label><input class="inp" id="pnBudget" value="0" oninput="pnSum()"><div class="mut" style="font-size:11.6px;margin-top:4px">独立填写，不随零售商明细变动</div></div>
      <div class="fr"><label>发放数量（张）<em>*</em></label><input class="inp" id="pnQty" value="0"></div>
      <div class="fr"><label>券面额（元）<em>*</em></label><input class="inp" id="pnFace" value="0"></div>
      <div class="fr"><label>使用门槛（元）<em>*</em></label><input class="inp" id="pnThr" value="0"></div>
      <div class="fr"><label>领取限制</label><input class="inp" id="pnLimit" value="每人限领 2 张"></div>
      <div class="fr"><label>券有效期</label><input class="inp" id="pnValid" value="随批次有效期"></div>
    </div>

  </div>
  <div class="dw-f">
    <div class="lft">门店 <b id="pnFRet">0</b> 条 · 商品 <b id="pnFSku">0</b> 条 · 带 <span style="color:var(--red)">*</span> 为必填</div>
    <div class="rgt">
      <button class="btn btn-g" onclick="closeDrawer()">取消</button>
      <button class="btn btn-o" onclick="pnSave(true)">保存并继续创建</button>
      <button class="btn btn-p" onclick="pnSave(false)">保存</button>
    </div>
  </div>
</div>`;
}

MT.defineDrawer('dw-plannew', tplDrawerplannew);

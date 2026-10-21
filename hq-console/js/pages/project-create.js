/* =============================================================================
 * pages/project-create.js — 项目创建（提交审批）
 * 对应待确认清单标黄项 2：计划明细在审批通过后补充，不在报批阶段填写——
 *   状态①提交审批（本页）：活动基本信息 + 批次计划（计划名称、券名称、机制、发券方式、活动零售商、活动商品）
 *   状态②审批通过后补充：计划明细（机制、起止时间、零售商门店、商品），见 components/plan-drawer.js
 * 另含标黄项 12：服务商选定后自动带出唯一对接联系人 / 邮箱，不再让人挑。
 * ========================================================================== */

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
  if(!(document.getElementById('projOwnerPhone').value || '').trim()) missing.push('联系方式');
  if(!(document.getElementById('poNo').value || '').trim()) missing.push('PO 单号');

  if(!CRE_BRIEF.length) missing.push('至少 1 个计划');
  var bad = CRE_BRIEF.filter(function(b){
    return !(b.mech || '').trim()
        || !(b.ret || []).length || !(b.sku || []).length;
  });
  if(bad.length) missing.push('计划的机制 / 活动零售商 / 活动商品');

  if(missing.length){ MT.toast('提交前请补充：' + missing.join('、'), 'err'); return; }
  wfSubmit();
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
        <div class="fr" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label>活动负责人<em>*</em></label><input class="inp" id="projOwner" value="李雪"></div>
          <div><label>联系方式<em>*</em></label><input class="inp" id="projOwnerPhone" value="15269175821"></div>
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

      <!-- 四、批次计划：一个计划对应一个批次（一批次=一张券） -->
      <div class="st" style="margin-top:26px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span>四、批次计划</span>
        <span class="flex" style="gap:8px;margin-left:auto">
          <span class="tg tg-n" id="briefCnt">0 个计划</span>
          <button class="btn btn-o btn-xs" type="button" onclick="briefAdd()">＋ 创建计划</button>
        </span>
      </div>
      <div class="panel" style="margin-top:12px">
        <div class="tw scroll" style="border:none;box-shadow:none;border-radius:0">
          <table class="bt" style="table-layout:fixed">
            <thead><tr>
              <th style="width:6%">序号</th>
              <th style="width:22%">机制</th>
              <th style="width:32%">活动零售商</th>
              <th style="width:32%">活动商品</th>
              <th style="width:8%">操作</th>
            </tr></thead>
            <tbody id="briefBody"></tbody>
          </table>
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


/* ---------- 批次计划：一个计划 = 一个批次 = 一张券，零售商 / 商品均为多项 ---------- */
var CRE_BRIEF = [
  {
    name:'双节满减主推', coupon:'双节常温奶满减券', mech:'满 99 减 15', grant:'领券',
    ret:[ { ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802' },
          { ret:'特易购',   store:'特易购（广州天河城店）',     prov:'广东省', city:'广州', mch:'1603482917' } ],
    sku:[ { code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', owner:'永辉超市 / 特易购' } ]
  },
  {
    name:'跨年场景承接', coupon:'跨年常温奶满减券', mech:'满 99 减 15', grant:'领券',
    ret:[ { ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802' },
          { ret:'特易购',   store:'特易购（广州天河城店）',     prov:'广东省', city:'广州', mch:'1603482917' } ],
    sku:[ { code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', owner:'永辉超市 / 特易购' } ]
  },
  {
    name:'高端礼盒拉新', coupon:'礼盒满减券', mech:'满 129 减 20', grant:'过机立减',
    ret:[ { ret:'盒马鲜生', store:'盒马鲜生（杭州西湖银泰店）', prov:'浙江省', city:'杭州', mch:'1457820366' } ],
    sku:[ { code:'6923644288221', name:'特仑苏精选礼盒 12 盒装', owner:'盒马鲜生' } ]
  }
];

/* ---------- 表格单元格 ---------- */
function briefCell(i, k, v, ph){
  return '<td><input class="inp" style="width:100%" value="' + vsEsc(v || '') + '"'
       + (ph ? ' placeholder="' + pnEsc(ph) + '"' : '')
       + ' oninput="briefSet(' + i + ',\'' + k + '\',this.value)"></td>';
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
      + briefCell(i, 'mech',   b.mech,   '满 99 减 15')
      + briefCellItems(i, 'ret')
      + briefCellItems(i, 'sku')
      + '<td><div class="ops"><a onclick="briefDel(' + i + ')">删除</a></div></td>'
      + '</tr>';
  });
  if(!CRE_BRIEF.length){
    h = '<tr><td colspan="5" class="empty-row">至少创建 1 个计划</td></tr>';
  }
  body.innerHTML = h;
  var c = document.getElementById('briefCnt');
  if(c) c.textContent = CRE_BRIEF.length + ' 个计划';
}

function briefSet(i, k, v){
  if(!CRE_BRIEF[i]) return;
  CRE_BRIEF[i][k] = v;
}

function briefAdd(){
  if(CRE_BRIEF.length >= 10){ MT.toast('一个项目最多 10 个计划', 'err'); return; }
  CRE_BRIEF.push({ name:'', coupon:'', mech:'', grant:'领券', ret:[], sku:[] });
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
      + ' <span class="sub">' + pnEsc(b.name || '未命名计划') + '</span>';
  }
  var tip = document.getElementById('briefDwTip');
  if(tip){
    tip.innerHTML = kind === 'ret'
      ? '字段与「名单导入」的零售商模板一致：零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号；可用「下载模板 / 导入文件」批量导入'
      : '字段与「名单导入」的商品模板一致：69码或店内码 / 商品名称 / 店内码所属零售商；可用「下载模板 / 导入文件」批量导入';
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
    h += '<table class="bt" style="table-layout:fixed"><thead><tr>'
      + '<th style="width:5%">#</th><th style="width:22%">零售商名称</th>'
      + '<th style="width:30%">门店名称</th><th style="width:12%">省份</th>'
      + '<th style="width:12%">城市</th><th style="width:14%">微信商户号</th>'
      + '<th style="width:5%">操作</th></tr></thead><tbody>';
    list.forEach(function(r, j){
      h += '<tr><td style="text-align:center">' + (j + 1) + '</td>'
        + briefItemInput(j, 'ret',   r.ret,   '永辉超市')
        + briefItemInput(j, 'store', r.store, '永辉超市（重庆观音桥店）')
        + briefItemInput(j, 'prov',  r.prov,  '重庆市')
        + briefItemInput(j, 'city',  r.city,  '重庆')
        + briefItemInput(j, 'mch',   r.mch,   '1236057802')
        + '<td><div class="ops"><a onclick="briefItemDel(' + j + ')">删除</a></div></td></tr>';
    });
  } else {
    h += '<table class="bt" style="table-layout:fixed"><thead><tr>'
      + '<th style="width:5%">#</th><th style="width:26%">69码或店内码</th>'
      + '<th style="width:38%">商品名称</th><th style="width:26%">店内码所属零售商</th>'
      + '<th style="width:5%">操作</th></tr></thead><tbody>';
    list.forEach(function(r, j){
      h += '<tr><td style="text-align:center">' + (j + 1) + '</td>'
        + briefItemInput(j, 'code',  r.code,  '6923644223456 或 YH-88921')
        + briefItemInput(j, 'name',  r.name,  '特仑苏纯牛奶 250ml×12')
        + briefItemInput(j, 'owner', r.owner, '永辉超市')
        + '<td><div class="ops"><a onclick="briefItemDel(' + j + ')">删除</a></div></td></tr>';
    });
  }

  if(!list.length){
    h += '<tr><td colspan="' + (kind === 'ret' ? 7 : 5) + '" class="empty-row">还没有明细，点下方「添加一行」</td></tr>';
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
    ? { ret:'', store:'', prov:'', city:'', mch:'' }
    : { code:'', name:'', owner:'' });
  briefItemRender();
}

function briefItemDel(j){
  var b = CRE_BRIEF[BRIEF_EDIT.i];
  if(!b) return;
  b[BRIEF_EDIT.kind].splice(j, 1);
  briefItemRender();
}

function briefItemDone(){
  closeDrawer();
  renderProjBrief();
}


/* ---------- 明细按模板导入：字段与「名单导入」一致 ---------- */
function briefImpCols(kind){
  return kind === 'ret'
    ? [['ret','零售商名称'],['store','门店名称'],['prov','省份'],['city','城市'],['mch','微信商户号']]
    : [['code','69码或店内码'],['name','商品名称'],['owner','店内码所属零售商']];
}

function briefImpTpl(){
  var kind = BRIEF_EDIT.kind, cols = briefImpCols(kind);
  var sample = kind === 'ret'
    ? '永辉超市,永辉超市（重庆观音桥店）,重庆市,重庆,1236057802'
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
        : (x.code === row.code && x.owner === row.owner);
    });
    if(same){ dup++; continue; }
    list.push(row);
    added++;
  }

  var cnt = document.getElementById('briefImpCnt');
  if(cnt) cnt.textContent = '已追加 ' + added + ' 行' + (dup ? '，跳过重复 ' + dup + ' 行' : '');
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

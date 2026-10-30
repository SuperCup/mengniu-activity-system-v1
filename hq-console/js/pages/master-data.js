/* =============================================================================
 * pages/master-data.js — 主数据维护（全平台通用）
 *   1. 门店与商户号：一个零售商可有多个门店，一个门店对应一个微信商户号
 *   2. 商品：69码 / 商品名称 / 店内码 / 店内码所属零售商 / 品牌 / 品类
 *   3. 一期只读：不提供导入、新增、编辑和启停
 *   4. 旧门店库不迁移，以本平台真实投放过程中导入的数据为准
 * ========================================================================== */

var ST_SIZE = 15, ST_PAGE = 1, ST_EDIT = -1;
var SK_SIZE = 15, SK_PAGE = 1, SK_EDIT = -1;
var MD_ST = { prov:'', status:'' };
var MD_SK = { ret:'', status:'' };

/* ---------- 门店与商户号 ---------- */
function stRows(){
  var kw = String((document.getElementById('stKw') || {}).value || '').trim().toLowerCase();
  MD_ST.prov = (document.getElementById('stProv') || {}).value || '';
  return (window.RET_DB || []).filter(function(s){
    if(MD_ST.prov && s.prov !== MD_ST.prov) return false;
    if(!kw) return true;
    return (s.sid + ' ' + s.ret + ' ' + s.name + ' ' + s.prov + s.city + ' ' + s.mch).toLowerCase().indexOf(kw) >= 0;
  });
}

function renderStores(){
  var body = document.getElementById('stBody'); if(!body) return;
  var rows = stRows();
  var provs = [];
  (window.RET_DB || []).forEach(function(s){ if(provs.indexOf(s.prov) < 0) provs.push(s.prov); });
  var sel = document.getElementById('stProv');
  if(sel && sel.options.length <= 1){
    sel.innerHTML = '<option value="">全部省份</option>' + provs.map(function(p){
      return '<option>' + p + '</option>';
    }).join('');
  }

  var pages = Math.max(1, Math.ceil(rows.length / ST_SIZE));
  if(ST_PAGE > pages) ST_PAGE = pages;
  var st = (ST_PAGE - 1) * ST_SIZE, en = Math.min(st + ST_SIZE, rows.length);

  var h = '';
  for(var i = st; i < en; i++){
    var s = rows[i];
    h += '<tr>'
      + '<td class="sx-mono" style="white-space:normal;word-break:break-all">' + pnEsc(s.sid) + '</td>'
      + '<td><b>' + pnEsc(s.ret) + '</b></td>'
      + '<td>' + pnEsc(s.name) + '</td>'
      + '<td>' + pnEsc(s.prov) + ' · ' + pnEsc(s.city) + '</td>'
      + '<td class="sx-mono">' + pnEsc(s.mch) + '</td>'
      + '<td class="sx-mono mut" style="font-size:11.4px">' + (s.lng == null ? '—' : s.lng + ', ' + s.lat) + '</td>'
      + '</tr>';
  }
  body.innerHTML = h || '<tr><td colspan="6" class="empty-row">没有符合条件的门店</td></tr>';

  var cnt = document.getElementById('stCnt'); if(cnt) cnt.textContent = (window.RET_DB || []).length + ' 家门店';
  var info = document.getElementById('stInfo'); if(info) info.textContent = '共 ' + rows.length + ' 条，每页 15 条';

  var pg = '<span class="' + (ST_PAGE <= 1 ? 'dis' : '') + '" onclick="gotoSt(' + (ST_PAGE - 1) + ')">上一页</span>';
  for(var k = 1; k <= pages; k++) pg += '<span class="' + (k === ST_PAGE ? 'on' : '') + '" onclick="gotoSt(' + k + ')">' + k + '</span>';
  pg += '<span class="' + (ST_PAGE >= pages ? 'dis' : '') + '" onclick="gotoSt(' + (ST_PAGE + 1) + ')">下一页</span>';
  var pb = document.getElementById('stPager'); if(pb) pb.innerHTML = pg;
}

function stQuery(){ ST_PAGE = 1; renderStores(); }
function stReset(){
  ['stKw','stProv'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
  MD_ST = { prov:'', status:'' };
  ST_PAGE = 1;
  renderStores();
}
function gotoSt(n){
  var pages = Math.max(1, Math.ceil(stRows().length / ST_SIZE));
  if(n < 1 || n > pages) return;
  ST_PAGE = n; renderStores();
}

function openSt(i){
  ST_EDIT = (typeof i === 'number') ? i : -1;
  var s = ST_EDIT >= 0 ? window.RET_DB[ST_EDIT] : null;
  document.getElementById('stTitle').textContent = s ? '编辑门店与商户号' : '新增门店与商户号';
  document.getElementById('stSid').value = s ? s.sid : '';
  document.getElementById('stRet').value = s ? s.ret : '';
  document.getElementById('stName').value = s ? s.name : '';
  document.getElementById('stProvince').value = s ? s.prov : '';
  document.getElementById('stCity').value = s ? s.city : '';
  document.getElementById('stMch').value = s ? s.mch : '';
  document.getElementById('stLng').value = s && s.lng != null ? s.lng : '';
  document.getElementById('stLat').value = s && s.lat != null ? s.lat : '';
  document.getElementById('stSrc').value = s ? s.src : '手工';
  openDrawer('dw-store');
}

function stSave(){
  var sid = (document.getElementById('stSid').value || '').trim();
  var ret = (document.getElementById('stRet').value || '').trim();
  var name = (document.getElementById('stName').value || '').trim();
  var prov = (document.getElementById('stProvince').value || '').trim();
  var city = (document.getElementById('stCity').value || '').trim();
  var mch = (document.getElementById('stMch').value || '').trim();
  var lng = (document.getElementById('stLng').value || '').trim();
  var lat = (document.getElementById('stLat').value || '').trim();

  if(!sid){ MT.toast('请填写门店编码', 'err'); return; }
  if(!ret){ MT.toast('请填写零售商名称', 'err'); return; }
  if(!name){ MT.toast('请填写门店名称', 'err'); return; }
  if(!prov || !city){ MT.toast('请填写省份与城市', 'err'); return; }
  if(!/^\d{8,10}$/.test(mch)){ MT.toast('微信商户号应为 8~10 位数字', 'err'); return; }

  var dupSid = (window.RET_DB || []).some(function(s, i){ return i !== ST_EDIT && s.sid === sid; });
  if(dupSid){ MT.toast('该门店编码已存在', 'err'); return; }
  var dup = (window.RET_DB || []).some(function(s, i){ return i !== ST_EDIT && s.mch === mch; });
  if(dup){ MT.toast('该微信商户号已被其他门店占用', 'err'); return; }

  if(lng !== '' || lat !== ''){
    var x = Number(lng), y = Number(lat);
    if(!isFinite(x) || !isFinite(y)){ MT.toast('经纬度需为数字', 'err'); return; }
    if(x < -180 || x > 180 || y < -90 || y > 90){ MT.toast('经纬度超出范围：经度 -180~180，纬度 -90~90', 'err'); return; }
    if(lng === '' || lat === ''){ MT.toast('经度与纬度需成对填写', 'err'); return; }
  }

  var rec = {
    sid: sid,
    ret: ret, name: name, prov: prov, city: city, mch: mch,
    lng: lng === '' ? null : Number(lng),
    lat: lat === '' ? null : Number(lat),
    status: ST_EDIT >= 0 ? window.RET_DB[ST_EDIT].status : '启用',
    src: ST_EDIT >= 0 ? window.RET_DB[ST_EDIT].src : '手工'
  };

  if(ST_EDIT >= 0) window.RET_DB[ST_EDIT] = rec;
  else window.RET_DB.unshift(rec);

  mnPersist();
  closeDrawer();
  renderStores();
  sysLog('主数据', ST_EDIT >= 0 ? '编辑门店' : '新增门店', rec.name, rec.sid, '零售商 ' + rec.ret + '；商户号 ' + rec.mch + '；' + rec.prov + rec.city);
  MT.toast((ST_EDIT >= 0 ? '已保存' : '已新增') + '：' + rec.name);
}

function stToggle(i){
  var s = window.RET_DB[i]; if(!s) return;
  s.status = s.status === '启用' ? '停用' : '启用';
  mnPersist(); renderStores();
  sysLog('主数据', s.status === '启用' ? '启用门店' : '停用门店', s.name, s.sid, '门店 ' + s.name + ' 置为' + s.status);
  MT.toast(s.name + ' 已' + s.status);
}

/* ---------- 商品 ---------- */
function skRows(){
  var kw = String((document.getElementById('skKw') || {}).value || '').trim().toLowerCase();
  MD_SK.ret = (document.getElementById('skRet') || {}).value || '';
  return (window.SKU_DB || []).filter(function(s){
    if(MD_SK.ret && (s.rets || []).indexOf(MD_SK.ret) < 0) return false;
    if(!kw) return true;
    return (s.code + ' ' + s.n + ' ' + s.inCode + ' ' + (s.rets || []).join('、')).toLowerCase().indexOf(kw) >= 0;
  });
}

function renderSkus(){
  var body = document.getElementById('skBody'); if(!body) return;
  var rows = skRows();

  var rets = [];
  (window.SKU_DB || []).forEach(function(s){ (s.rets || []).forEach(function(r){ if(r && rets.indexOf(r) < 0) rets.push(r); }); });
  var sel = document.getElementById('skRet');
  if(sel){
    sel.innerHTML = '<option value="">全部零售商</option>' + rets.map(function(r){ return '<option>' + pnEsc(r) + '</option>'; }).join('');
    sel.value = MD_SK.ret || '';
  }

  var pages = Math.max(1, Math.ceil(rows.length / SK_SIZE));
  if(SK_PAGE > pages) SK_PAGE = pages;
  var st = (SK_PAGE - 1) * SK_SIZE, en = Math.min(st + SK_SIZE, rows.length);

  var h = '';
  for(var i = st; i < en; i++){
    var s = rows[i];
    var rtag = (s.rets || []).length
      ? (s.rets || []).map(function(r){ return '<span class="tg tg-n" style="margin:1px 3px 1px 0;font-size:11px">' + pnEsc(r) + '</span>'; }).join('')
      : '<span class="mut">—</span>';
    h += '<tr>'
      + '<td class="sx-mono">' + (s.code ? pnEsc(s.code) : '<span class="mut">—</span>') + '</td>'
      + '<td><b>' + pnEsc(s.n) + '</b>' + (s.spec ? '<div class="muted" style="font-size:11.4px">' + pnEsc(s.spec) + '</div>' : '') + '</td>'
      + '<td class="sx-mono">' + (s.inCode ? pnEsc(s.inCode) : '<span class="mut">—</span>') + '</td>'
      + '<td>' + rtag + '</td>'
      + '</tr>';
  }
  body.innerHTML = h || '<tr><td colspan="4" class="empty-row">没有符合条件的商品</td></tr>';

  var cnt = document.getElementById('skCnt'); if(cnt) cnt.textContent = (window.SKU_DB || []).length + ' 个商品';
  var info = document.getElementById('skInfo'); if(info) info.textContent = '共 ' + rows.length + ' 条，每页 15 条';

  var pg = '<span class="' + (SK_PAGE <= 1 ? 'dis' : '') + '" onclick="gotoSk(' + (SK_PAGE - 1) + ')">上一页</span>';
  for(var k = 1; k <= pages; k++) pg += '<span class="' + (k === SK_PAGE ? 'on' : '') + '" onclick="gotoSk(' + k + ')">' + k + '</span>';
  pg += '<span class="' + (SK_PAGE >= pages ? 'dis' : '') + '" onclick="gotoSk(' + (SK_PAGE + 1) + ')">下一页</span>';
  var pb = document.getElementById('skPager'); if(pb) pb.innerHTML = pg;
}

function skQuery(){ SK_PAGE = 1; renderSkus(); }
function skReset(){
  ['skKw','skRet'].forEach(function(id){ var el = document.getElementById(id); if(el) el.value = ''; });
  MD_SK = { ret:'', status:'' };
  SK_PAGE = 1; renderSkus();
}
function gotoSk(n){
  var pages = Math.max(1, Math.ceil(skRows().length / SK_SIZE));
  if(n < 1 || n > pages) return;
  SK_PAGE = n; renderSkus();
}

var SK_RETS = [];

function openSku(i){
  SK_EDIT = (typeof i === 'number') ? i : -1;
  var s = SK_EDIT >= 0 ? window.SKU_DB[SK_EDIT] : null;
  document.getElementById('skTitle').textContent = s ? '编辑商品' : '新增商品';
  document.getElementById('sfCode').value = s ? s.code : '';
  document.getElementById('sfName').value = s ? s.n : '';
  document.getElementById('sfInCode').value = s ? s.inCode : '';
  document.getElementById('sfSpec').value = s ? (s.spec || '') : '';
  SK_RETS = s ? (s.rets || []).slice() : [];
  var inp = document.getElementById('sfRetAdd'); if(inp) inp.value = '';
  skRetRender();
  openDrawer('dw-sku');
}

/** 抽屉内：已登记的零售商（来自计划维护，名称不同就追加） */
function skRetRender(){
  var box = document.getElementById('sfRetList'); if(!box) return;
  box.innerHTML = SK_RETS.length
    ? SK_RETS.map(function(r, j){ return '<span class="tg tg-n" style="margin:2px 6px 2px 0">' + pnEsc(r) + ' <a style="cursor:pointer;margin-left:4px" onclick="skRetDel(' + j + ')">×</a></span>'; }).join('')
    : '<span class="mut" style="font-size:12px">还没有登记零售商；计划里维护的内码零售商会自动追加到这里</span>';
}

function skRetAdd(){
  var inp = document.getElementById('sfRetAdd'); if(!inp) return;
  var v = String(inp.value || '').trim();
  if(!v){ MT.toast('请填写零售商名称', 'err'); return; }
  var added = 0;
  v.split(/[、,，\/]/).forEach(function(x){ x = x.trim(); if(x && SK_RETS.indexOf(x) < 0){ SK_RETS.push(x); added++; } });
  inp.value = '';
  skRetRender();
  if(!added) MT.toast('该零售商已在列表中');
}

function skRetDel(j){
  SK_RETS.splice(j, 1);
  skRetRender();
}

function skuSave(){
  var code = (document.getElementById('sfCode').value || '').trim();
  var name = (document.getElementById('sfName').value || '').trim();
  var inCode = (document.getElementById('sfInCode').value || '').trim();
  var spec = (document.getElementById('sfSpec').value || '').trim();

  if(!name){ MT.toast('请填写商品名称', 'err'); return; }
  if(!code && !inCode){ MT.toast('69码与店内码至少填一个', 'err'); return; }
  if(code && !/^\d{8,14}$/.test(code)){ MT.toast('69码应为 8~14 位数字', 'err'); return; }
  if(inCode && !SK_RETS.length){ MT.toast('店内码商品至少要有一个所属零售商', 'err'); return; }

  var dup = (window.SKU_DB || []).some(function(s, i){
    if(i === SK_EDIT) return false;
    return (code && s.code === code) || (inCode && s.inCode === inCode);
  });
  if(dup){ MT.toast('该 69码 / 店内码 已存在', 'err'); return; }

  var rec = {
    code: code, n: name, inCode: inCode, rets: SK_RETS.slice(), spec: spec,
    status: SK_EDIT >= 0 ? window.SKU_DB[SK_EDIT].status : '启用',
    src: SK_EDIT >= 0 ? window.SKU_DB[SK_EDIT].src : '手工'
  };

  if(SK_EDIT >= 0) window.SKU_DB[SK_EDIT] = rec;
  else window.SKU_DB.unshift(rec);

  mnPersist();
  closeDrawer();
  renderSkus();
  sysLog('主数据', SK_EDIT >= 0 ? '编辑商品' : '新增商品', rec.n, rec.code || rec.inCode, '店内码所属零售商 ' + (rec.rets.join('、') || '—'));
  MT.toast((SK_EDIT >= 0 ? '已保存' : '已新增') + '：' + rec.n);
}

function skuToggle(i){
  var s = window.SKU_DB[i]; if(!s) return;
  s.status = s.status === '启用' ? '停用' : '启用';
  mnPersist(); renderSkus();
  sysLog('主数据', s.status === '启用' ? '启用商品' : '停用商品', s.n, s.code || s.inCode, '置为' + s.status);
  MT.toast(s.n + ' 已' + s.status);
}
/* ---------- 抽屉：门店 ---------- */
function tplDrawerstore(){
  return `<div class="drawer" id="dw-store">
  <div class="dr-mask" onclick="closeDrawer()"></div>
  <div class="dr-panel" style="width:520px">
    <div class="dr-h"><h4 id="stTitle">新增门店与商户号</h4><span class="x" onclick="closeDrawer()">×</span></div>
    <div class="dr-b">
      <div class="fgrid">
        <label>门店编码</label><input class="inp" id="stSid" placeholder="客户系统门店编码，如 CQ001">
        <label>零售商名称</label><input class="inp" id="stRet" placeholder="如：永辉">
        <label>门店名称</label><input class="inp" id="stName" placeholder="如：永辉超市（观音桥店）">
        <label>省份</label><input class="inp" id="stProvince" placeholder="如：重庆">
        <label>城市</label><input class="inp" id="stCity" placeholder="如：重庆">
        <label>微信商户号</label><input class="inp" id="stMch" placeholder="8~10 位数字">
        <label>经度</label><input class="inp" id="stLng" placeholder="如：106.5516（可留空）">
        <label>纬度</label><input class="inp" id="stLat" placeholder="如：29.5630（可留空）">
        <label>来源</label><input class="inp" id="stSrc" readonly>
      </div>
      <p class="mut" style="font-size:12px;margin-top:10px">一个零售商可有多个门店，一个门店对应一个微信商户号；保存后全平台通用，批次计划里可直接选择。</p>
    </div>
    <div class="dr-f"><button class="btn btn-g" onclick="closeDrawer()">取消</button><button class="btn btn-p" onclick="stSave()">保存</button></div>
  </div>
</div>`;
}

/* ---------- 抽屉：商品 ---------- */
function tplDrawersku(){
  return `<div class="drawer" id="dw-sku">
  <div class="dr-mask" onclick="closeDrawer()"></div>
  <div class="dr-panel" style="width:560px">
    <div class="dr-h"><h4 id="skTitle">新增商品</h4><span class="x" onclick="closeDrawer()">×</span></div>
    <div class="dr-b">
      <div class="fgrid">
        <label>69码</label><input class="inp" id="sfCode" placeholder="8~14 位数字">
        <label>商品名称</label><input class="inp" id="sfName" placeholder="如：特仑苏纯牛奶 250ml×12">
        <label>店内码</label><input class="inp" id="sfInCode" placeholder="非 69码商品填店内码">
        <label>规格（选填）</label><input class="inp" id="sfSpec" placeholder="如：250ml×12">
      </div>
      <div style="margin-top:14px">
        <div class="mut" style="font-size:12.2px;margin-bottom:6px">店内码所属零售商（可多个，名称不同就追加）</div>
        <div id="sfRetList" style="min-height:28px;padding:4px 0"></div>
        <div class="flex" style="gap:6px;margin-top:6px">
          <input class="inp" id="sfRetAdd" placeholder="输入零售商名称，如：永辉超市" style="flex:1">
          <button class="btn btn-o btn-xs" type="button" onclick="skRetAdd()">＋ 追加零售商</button>
        </div>
      </div>
      <p class="mut" style="font-size:12px;margin-top:12px">69码与店内码至少填一个；填了店内码至少要有一个所属零售商。计划创建时维护的内码零售商，会按名称自动追加到这里，历史名称不覆盖。</p>
    </div>
    <div class="dr-f"><button class="btn btn-g" onclick="closeDrawer()">取消</button><button class="btn btn-p" onclick="skuSave()">保存</button></div>
  </div>
</div>`;
}
/* ---------- 模板 ---------- */
function tplPagestore(){
  return `<div class="view" id="v-store">
  <div class="panel">
    <div class="panel-h">
      <h3>门店与商户号 <span class="tg tg-n" id="stCnt">0 家门店</span></h3>
    </div>
    <div class="panel-b" style="border-top:1px solid var(--line2)">
      <div class="flex" style="gap:8px;flex-wrap:wrap;align-items:center">
        <span class="mut" style="font-size:12.2px">省份</span>
        <select class="inp" id="stProv" style="max-width:130px" onchange="stQuery()"><option value="">全部省份</option></select>
        <input class="inp" id="stKw" placeholder="门店编码 / 零售商 / 门店名称 / 商户号" style="max-width:280px" oninput="ST_PAGE=1;renderStores()">
        <button class="btn btn-p btn-xs" onclick="stQuery()">查询</button>
        <button class="btn btn-g btn-xs" onclick="stReset()">重置</button>
      </div>
    </div>
  </div>
  <div class="panel">
    <div class="panel-b" style="padding:0">
      <table class="bt mini">
        <thead><tr>
          <th style="width:150px">门店编码</th><th style="width:100px">零售商</th><th>门店名称</th>
          <th style="width:120px">省份 · 城市</th><th style="width:118px">微信商户号</th>
          <th style="width:150px">经纬度</th>
        </tr></thead>
        <tbody id="stBody"><tr><td colspan="6" class="empty-row">加载中…</td></tr></tbody>
      </table>
    </div>
  </div>
  <div class="pager"><div class="pg-info" id="stInfo">共 0 条，每页 15 条</div><div class="pg-btns" id="stPager"></div></div>
</div>`;
}

function tplPagesku(){
  return `<div class="view" id="v-sku">
  <div class="panel">
    <div class="panel-h">
      <h3>商品维护 <span class="tg tg-n" id="skCnt">0 个商品</span></h3>
    </div>
    <div class="panel-b" style="border-top:1px solid var(--line2)">
      <div class="flex" style="gap:8px;flex-wrap:wrap;align-items:center">
        <span class="mut" style="font-size:12.2px">店内码所属零售商</span>
        <select class="inp" id="skRet" style="max-width:160px" onchange="skQuery()"><option value="">全部零售商</option></select>
        <input class="inp" id="skKw" placeholder="69码 / 商品名称 / 店内码 / 零售商" style="max-width:280px" oninput="SK_PAGE=1;renderSkus()">
        <button class="btn btn-p btn-xs" onclick="skQuery()">查询</button>
        <button class="btn btn-g btn-xs" onclick="skReset()">重置</button>
      </div>
    </div>
  </div>
  <div class="panel">
    <div class="panel-b" style="padding:0">
      <table class="bt mini" style="table-layout:fixed">
        <thead><tr>
          <th style="width:126px">69码</th><th>商品名称</th><th style="width:112px">店内码</th>
          <th style="width:240px">店内码所属零售商</th>
        </tr></thead>
        <tbody id="skBody"><tr><td colspan="4" class="empty-row">加载中…</td></tr></tbody>
      </table>
    </div>
  </div>
  <div class="pager"><div class="pg-info" id="skInfo">共 0 条，每页 15 条</div><div class="pg-btns" id="skPager"></div></div>
</div>`;
}
MT.defineDrawer('dw-store', tplDrawerstore);
MT.defineDrawer('dw-sku', tplDrawersku);

MT.definePage({ id:'v-store', title:'门店与商户号', crumb:'系统配置 / 门店与商户号', group:'配置', template: tplPagestore });
MT.definePage({ id:'v-sku',   title:'商品维护',     crumb:'系统配置 / 商品维护',     group:'配置', template: tplPagesku });

/* =============================================================================
 * 从主数据选择门店 / 商品（批次信息、创建项目明细共用）
 * ========================================================================== */
var MD_PICK = { kind:'ret', sel:{}, cb:null };

function mdPick(kind, cb){
  MD_PICK = { kind: (kind === 'sku' ? 'sku' : 'ret'), sel:{}, cb: cb || null };
  var t = document.getElementById('pkTitle');
  if(t) t.textContent = MD_PICK.kind === 'ret' ? '从门店与商户号库选择' : '从商品维护库选择';
  var kw = document.getElementById('pkKw'); if(kw) kw.value = '';
  mdPickRender();
  openDrawer('dw-pick');
}

function mdPickRows(){
  var kw = String((document.getElementById('pkKw') || {}).value || '').trim().toLowerCase();
  var list = MD_PICK.kind === 'ret'
    ? (window.RET_DB || []).filter(function(x){ return x.status !== '停用'; })
    : (window.SKU_DB || []).filter(function(x){ return x.status !== '停用'; });
  if(!kw) return list;
  return list.filter(function(x){
    var hay = MD_PICK.kind === 'ret'
      ? (x.sid + ' ' + x.ret + ' ' + x.name + ' ' + x.prov + x.city + ' ' + x.mch)
      : (x.code + ' ' + x.inCode + ' ' + x.n + ' ' + (x.rets || []).join(' '));
    return hay.toLowerCase().indexOf(kw) >= 0;
  });
}

function mdPickKey(x){
  return (MD_PICK.kind === 'ret') ? x.mch : (x.code || x.inCode);
}

function mdPickRender(){
  var body = document.getElementById('pkList'); if(!body) return;
  var rows = mdPickRows();
  var h = '';
  rows.slice(0, 100).forEach(function(x){
    var key = mdPickKey(x);
    var on = !!MD_PICK.sel[key];
    var label = MD_PICK.kind === 'ret'
      ? ('<b>' + pnEsc(x.name) + '</b>　<span class="mut">' + pnEsc(x.ret) + ' · ' + pnEsc(x.prov + ' ' + x.city) + ' · 商户号 ' + pnEsc(x.mch) + '</span>')
      : ('<b>' + pnEsc(x.n) + '</b>　<span class="mut">69码 ' + pnEsc(x.code || '—') + (x.inCode ? ' · 店内码 ' + pnEsc(x.inCode) : '') + ((x.rets || []).length ? ' · ' + pnEsc(skuRetsText(x)) : '') + '</span>');
    h += '<label class="pk-row' + (on ? ' on' : '') + '"><input type="checkbox" ' + (on ? 'checked' : '')
      + ' onchange="mdPickToggle(\'' + pnEsc(key) + '\',this.checked)"> <span>' + label + '</span></label>';
  });
  body.innerHTML = h || '<div class="empty-row">没有可选数据</div>';
  var c = document.getElementById('pkCnt');
  if(c) c.textContent = '已选 ' + Object.keys(MD_PICK.sel).length + ' 条 / 共 ' + rows.length + ' 条';
}

function mdPickToggle(key, on){
  if(on) MD_PICK.sel[key] = true; else delete MD_PICK.sel[key];
  mdPickRender();
}

function mdPickOk(){
  var keys = Object.keys(MD_PICK.sel);
  if(!keys.length){ MT.toast('请至少勾选 1 条', 'err'); return; }
  var src = MD_PICK.kind === 'ret' ? (window.RET_DB || []) : (window.SKU_DB || []);
  var rows = src.filter(function(x){ return keys.indexOf(mdPickKey(x)) >= 0; });
  var cb = MD_PICK.cb;
  closeDrawer();
  if(typeof cb === 'function') cb(rows);
}

function tplDrawerpick(){
  return `<div class="drawer" id="dw-pick">
  <div class="dw-h"><h3 id="pkTitle">从主数据选择</h3><span class="dw-x" onclick="closeDrawer()">×</span></div>
  <div class="dw-b">
    <div class="flex" style="gap:8px;margin-bottom:10px">
      <input class="inp" id="pkKw" placeholder="搜索名称 / 商户号 / 69码" style="flex:1" oninput="mdPickRender()">
      <span class="mut" id="pkCnt"></span>
    </div>
    <div class="note b" style="margin-top:0">数据来自「门店与商户号」「商品维护」，选中后写入当前明细，可在明细里继续编辑</div>
    <div id="pkList" style="max-height:60vh;overflow:auto;margin-top:10px"></div>
  </div>
  <div class="dw-f">
    <div class="lft">支持多选</div>
    <div class="rgt"><button class="btn btn-g" onclick="closeDrawer()">取消</button><button class="btn btn-p" onclick="mdPickOk()">确定添加</button></div>
  </div>
</div>`;
}

MT.defineDrawer('dw-pick', tplDrawerpick);

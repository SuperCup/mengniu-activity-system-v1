/* =============================================================================
 * components/import-drawer.js — 名单导入抽屉
 * 对应待确认清单标黄项：
 *   · 10 门店 / 零售商：不再「选零售商 + 区域」圈选，改为业务直接导入名单
 *   · 11 商品：一期不对接商品库，改为导入（69码/店内码 + 商品名称 + 所属零售商）
 * 使用方式：模板下载 → 上传 CSV → 逐行校验 → 导入到「创建计划」明细
 * ========================================================================== */

/* ---------- 导入字段定义：模板、表头、校验共用一份 ---------- */
var IMP_SCHEMA = {
  ret: {
    title: '导入零售商 / 门店名单',
    hint: '列顺序固定：门店编码、零售商名称、门店名称、省份、城市、微信商户号、经度、纬度。门店编码必填且不可重复，编码来自客户系统、不限定格式（如 CQ001）；微信商户号由销售填写，销售没有则由服务商提报时补充，故允许为空；经纬度可留空，填写须成对且在当地范围内。',
    cols: [
      { key:'sid',   label:'门店编码',   req:true,  w:'10%' },
      { key:'ret',   label:'零售商名称', req:true,  w:'15%' },
      { key:'store', label:'门店名称',   req:true,  w:'24%' },
      { key:'prov',  label:'省份',       req:true,  w:'9%'  },
      { key:'city',  label:'城市',       req:true,  w:'9%'  },
      { key:'mch',   label:'微信商户号', req:false, w:'14%' },
      { key:'lng',   label:'经度',       req:false, w:'9%'  },
      { key:'lat',   label:'纬度',       req:false, w:'9%'  }
    ],
    demo: '门店编码,零售商名称,门店名称,省份,城市,微信商户号,经度,纬度\nCQ001,永辉,重庆永辉超市观音桥店,重庆,重庆,1236057802,106.5770,29.5580\nSZ-HL-01,华润万家,广东特易购商业有限公司,广东,深圳,,,\nSH-FM-02,全家,上海福满家便利有限公司,上海,上海,1252436002,,',
    file: '零售商门店导入模板.csv'
  },
  sku: {
    title: '导入活动商品明细',
    hint: '与创建项目的活动商品明细一致。列顺序固定：69码、商品名称、店内码、店内码所属零售商。69码与店内码至少填一个；填了店内码必须填所属零售商，一行只对应一个零售商。',
    cols: [
      { key:'code',   label:'69码',   req:false, w:'20%' },
      { key:'name',   label:'商品名称', req:true, w:'38%' },
      { key:'inCode', label:'店内码',  req:false, w:'14%' },
      { key:'owner',  label:'店内码所属零售商', req:false, w:'24%' }
    ],
    demo: '69码,商品名称,店内码,店内码所属零售商\n6901234500011,特仑苏纯牛奶 250ml×12,,\n,纯甄原味 200g,YH-88921,永辉\n6901234500028,蒙牛真果粒 250ml×12,,华润万家',
    file: '商品明细导入模板.csv'
  },
  mdstore: {
    title: '导入门店与商户号',
    hint: '列顺序固定：门店编码、零售商名称、门店名称、省份、城市、微信商户号、经度、纬度。门店编码必填且不可重复，编码来自客户系统、不限定格式（如 CQ001）；经纬度可留空，填写则须在经度 -180~180、纬度 -90~90 内。导入即写入门店库，全平台通用。',
    cols: [
      { key:'sid',  label:'门店编码', req:true,  w:'11%' },
      { key:'ret',  label:'零售商名称', req:true,  w:'14%' },
      { key:'name', label:'门店名称',   req:true,  w:'24%' },
      { key:'prov', label:'省份',       req:true,  w:'10%' },
      { key:'city', label:'城市',       req:true,  w:'10%' },
      { key:'mch',  label:'微信商户号', req:true,  w:'14%' },
      { key:'lng',  label:'经度',       req:false, w:'9%' },
      { key:'lat',  label:'纬度',       req:false, w:'8%' }
    ],
    demo: '门店编码,零售商名称,门店名称,省份,城市,微信商户号,经度,纬度\nCQ001,永辉,永辉超市（解放碑店）,重庆,重庆,1236057811,106.5770,29.5580\nSZ-HL-01,华润万家,华润万家（深圳罗湖店）,广东,深圳,1246429611,114.1180,22.5480\nSH-FM-02,盒马,盒马鲜生（杭州滨江店）,浙江,杭州,1254189211,,',
    file: '门店与商户号导入模板.csv'
  },
  mdsku: {
    title: '导入商品',
    hint: '列顺序固定：69码、商品名称、店内码、店内码所属零售商。69码与店内码至少填一个；填了店内码必须填所属零售商。同一个店内码遇到不同零售商名称时，会作为新的零售商追加到该商品，历史名称不覆盖；可在一格里用「、」写多个。导入即写入商品库，全平台通用。',
    cols: [
      { key:'code',   label:'69码',       req:false, w:'22%' },
      { key:'name',   label:'商品名称',    req:true,  w:'38%' },
      { key:'inCode', label:'店内码',      req:false, w:'16%' },
      { key:'ret',    label:'店内码所属零售商', req:false, w:'24%' }
    ],
    demo: '69码,商品名称,店内码,店内码所属零售商\n6901234500059,特仑苏沙漠有机纯牛奶 250ml×10,,,\n,纯甄果粒 200g×12,ZL-88021,永辉超市\n,特仑苏 / 精选礼盒,SPU-2318,华润万家',
    file: '商品导入模板.csv'
  }};

var IMP = { type:'ret', rows:[], errs:[] };

/* ---------- 打开抽屉 ---------- */
function openImp(type){
  IMP.fromPlan = !!document.querySelector('#dw-plannew.on');
  IMP.fromBatch = !!document.querySelector('#dw-batch.on');
  IMP.type = IMP_SCHEMA[type] ? type : 'ret';
  IMP.rows = [];
  IMP.errs = [];
  var sc = IMP_SCHEMA[IMP.type];
  document.getElementById('impTitle').textContent = sc.title;
  document.getElementById('impHint').innerHTML = '<b>导入要求：</b>' + sc.hint;
  var f = document.getElementById('impFile');
  if(f) f.value = '';
  impRenderResult();
  openDrawer('dw-imp');
}

/* ---------- 模板下载 ---------- */
function impTpl(){
  var sc = IMP_SCHEMA[IMP.type];
  var csv = sc.cols.map(function(c){ return c.label; }).join(',') + '\n' + sc.demo.split('\n').slice(1).join('\n');
  var blob = new Blob(['\uFEFF' + csv], { type:'text/csv;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = sc.file;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
  MT.toast('模板已下载：' + sc.file);
}

/* ---------- 读文件 ---------- */
function impRead(input){
  var f = input.files && input.files[0];
  if(!f) return;
  if(!/\.(csv|txt)$/i.test(f.name)){
    MT.toast('请上传 .csv 或 .txt 文件', 'err');
    return;
  }
  var reader = new FileReader();
  reader.onload = function(){
    var text = String(reader.result || '').replace(/^\uFEFF/, '');
    impParse(text, f.name);
  };
  reader.readAsText(f, 'utf-8');
}

function impDemo(){
  var sc = IMP_SCHEMA[IMP.type];
  impParse(sc.demo, '示例数据');
}

function impClear(){
  IMP.rows = []; IMP.errs = [];
  var f = document.getElementById('impFile'); if(f) f.value = '';
  impRenderResult();
}

/* ---------- 解析 + 逐行校验 ---------- */
function impSplit(line){
  /* 支持英文逗号 / 中文逗号 / 制表符；引号包裹字段内的分隔符做保护 */
  var out = [], cur = '', quote = false;
  for(var i=0;i<line.length;i++){
    var ch = line.charAt(i);
    if(ch === '"'){ quote = !quote; continue; }
    if(!quote && (ch === ',' || ch === '，' || ch === '\t')){ out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function impParse(text){
  var sc = IMP_SCHEMA[IMP.type];
  var lines = String(text || '').split(/\r?\n/).map(function(s){ return s.trim(); }).filter(Boolean);
  IMP.rows = []; IMP.errs = [];
  if(!lines.length){ impRenderResult(); return; }

  var norm = function(s){ return String(s == null ? '' : s).replace(/[\s*＊]/g, ''); };
  var labels = sc.cols.map(function(c){ return c.label; });
  var first = impSplit(lines[0]);

  /* 表头判定：整行与模板列名逐列相等才算表头。
     店名里出现「门店 / 商品」等字样不再被误判为表头，单行数据也不会被丢掉。 */
  var hasHeader = norm(first[0]) === norm(labels[0])
    || (first.length >= labels.length && labels.every(function(lb, i){ return norm(first[i]) === norm(lb); }));
  var start = hasHeader ? 1 : 0;

  var seen = {};
  var seenSid = {};
  for(var i = start; i < lines.length; i++){
    var cols = impSplit(lines[i]);
    var row = { __line:i + 1, __err:[] };
    sc.cols.forEach(function(c, ci){
      row[c.key] = (cols[ci] || '').trim();
      if(c.req && !row[c.key]) row.__err.push('缺少「' + c.label + '」');
    });
    if(IMP.type === 'ret' || IMP.type === 'mdstore'){
      if(row.sid){
        row.sid = String(row.sid).trim();
        if(seenSid[row.sid]){
          row.__err.push('门店编码与第 ' + seenSid[row.sid] + ' 行重复');
        } else if(IMP.type === 'mdstore' && (window.RET_DB || []).some(function(x){ return x.sid === row.sid; })){
          row.__err.push('门店编码已存在');
        } else {
          seenSid[row.sid] = i + 1;
        }
      }
    }
    if(IMP.type === 'ret'){
      if(row.mch && !/^\d{8,10}$/.test(row.mch)) row.__err.push('微信商户号应为 8~10 位数字');
      if((row.lng === '') !== (row.lat === '')) row.__err.push('经度与纬度需成对填写');
      if(row.lng !== '' && row.lat !== ''){
        var rx = Number(row.lng), ry = Number(row.lat);
        if(!isFinite(rx) || !isFinite(ry)) row.__err.push('经纬度需为数字');
        else if(rx < -180 || rx > 180 || ry < -90 || ry > 90) row.__err.push('经纬度超出范围');
      }
    }
    if(IMP.type === 'sku'){
      if(!row.code && !row.inCode) row.__err.push('69码与店内码至少填一个');
      if(row.inCode && !row.owner) row.__err.push('填了店内码要填所属零售商');
      if(row.code && !/^\d{8,14}$/.test(row.code)) row.__err.push('69码应为 8~14 位数字');
    }
    if(IMP.type === 'mdstore'){
      if(row.mch && !/^\d{8,10}$/.test(row.mch)) row.__err.push('微信商户号应为 8~10 位数字');
      if((row.lng === '') !== (row.lat === '')) row.__err.push('经度与纬度需成对填写');
      if(row.lng !== '' && row.lat !== ''){
        var lx = Number(row.lng), ly = Number(row.lat);
        if(!isFinite(lx) || !isFinite(ly)) row.__err.push('经纬度需为数字');
        else if(lx < -180 || lx > 180 || ly < -90 || ly > 90) row.__err.push('经纬度超出范围');
      }
    }
    if(IMP.type === 'mdsku'){
      if(!row.code && !row.inCode) row.__err.push('69码与店内码至少填一个');
      if(row.inCode && !row.ret) row.__err.push('填了店内码要填所属零售商');
      if(row.code && !/^\d{8,14}$/.test(row.code)) row.__err.push('69码应为 8~14 位数字');
    }
    /* 同一次导入内的重复行单独标出来，不静默丢弃 */
    var key;
    if(IMP.type === 'ret'){
      key = norm(row.mch) || norm(row.ret) + '|' + norm(row.store);
    } else if(IMP.type === 'mdstore'){
      key = norm(row.mch) || norm(row.ret) + '|' + norm(row.name);
    } else if(IMP.type === 'sku'){
      key = (norm(row.code) || norm(row.inCode)) + '|' + norm(row.owner);
    } else {
      key = (norm(row.code) || norm(row.inCode)) + '|' + norm(row.ret);
    }
    if(key && seen[key]){
      row.__err.push('与第 ' + seen[key] + ' 行重复');
    } else if(key){
      seen[key] = i + 1;
    }
    IMP.rows.push(row);
  }
  IMP.errs = IMP.rows.filter(function(r){ return r.__err.length; });
  impRenderResult();
}

/* ---------- 渲染预览 ---------- */
function impRenderResult(){
  var sc = IMP_SCHEMA[IMP.type];
  var total = IMP.rows.length;
  var bad = IMP.errs.length;
  var ok = total - bad;

  var cnt = document.getElementById('impCnt');
  if(cnt){
    cnt.innerHTML = total
      ? ('共解析 <b>' + total + '</b> 行 · 校验通过 <b>' + ok + '</b> 行' + (bad ? ' · <span class="err">异常 ' + bad + ' 行（导入时自动跳过）</span>' : ''))
      : '尚未选择文件';
  }

  var thead = '<tr><th style="width:52px">行号</th>' + sc.cols.map(function(c){
    return '<th style="width:' + c.w + '">' + c.label + (c.req ? '<em class="req">*</em>' : '') + '</th>';
  }).join('') + '<th style="width:170px">校验</th></tr>';

  var tbody;
  if(!total){
    tbody = '<tr><td colspan="' + (sc.cols.length + 2) + '" class="empty-row">选择 CSV 文件，或点「填入示例数据」先看格式</td></tr>';
  } else {
    tbody = IMP.rows.map(function(r){
      var cells = sc.cols.map(function(c){
        return '<td>' + (r[c.key] ? pnEsc(r[c.key]) : '<span class="mut">—</span>') + '</td>';
      }).join('');
      var st = r.__err.length
        ? '<span class="tg tg-r">' + r.__err.join('；') + '</span>'
        : '<span class="tg tg-g">通过</span>';
      return '<tr class="' + (r.__err.length ? 'imp-bad' : '') + '"><td class="idx">' + r.__line + '</td>' + cells + '<td>' + st + '</td></tr>';
    }).join('');
  }

  var box = document.getElementById('impPreview');
  if(box) box.innerHTML = '<table class="bt mini imp-tbl"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';

  var btn = document.getElementById('impOkBtn');
  if(btn) btn.disabled = !ok;
}

/* ---------- 提交 ---------- */
function impOk(){
  var good = IMP.rows.filter(function(r){ return !r.__err.length; });
  if(!good.length){ MT.toast('没有可导入的有效行', 'err'); return; }

  var added = 0, dup = 0, merged = 0;

  /* 主数据导入：直接写入全平台库 */
  if(IMP.type === 'mdstore' || IMP.type === 'mdsku'){
    good.forEach(function(r){
      if(IMP.type === 'mdstore'){
        var k = r.mch;
        if((window.RET_DB||[]).some(function(x){ return x.mch === k; })){ dup++; return; }
        window.RET_DB.unshift({
          sid: r.sid, ret:r.ret, name:r.name, prov:r.prov, city:r.city, mch:r.mch,
          lng: r.lng === '' ? null : Number(r.lng), lat: r.lat === '' ? null : Number(r.lat),
          status:'启用', src:'导入'
        });
        added++;
      } else {
        var ex = skuFind(r.code, r.inCode);
        if(ex){
          var addRet = 0;
          String(r.ret || '').split(/[、,，\/]/).forEach(function(x){ x = x.trim(); if(x && skuAddRet(ex, x)) addRet++; });
          if(addRet) merged++; else dup++;
          return;
        }
        var rets0 = String(r.ret || '').split(/[、,，\/]/).map(function(x){ return x.trim(); }).filter(Boolean);
        window.SKU_DB.unshift({ code:r.code, n:r.name, inCode:r.inCode, rets:rets0, spec:'', status:'启用', src:'导入' });
        added++;
      }
    });
    mnPersist();
    closeDrawer();
    if(typeof renderStores === 'function') renderStores();
    if(typeof renderSkus === 'function') renderSkus();
    sysLog('主数据', IMP.type === 'mdstore' ? '导入门店' : '导入商品', (IMP.type === 'mdstore' ? '门店与商户号' : '商品库'), '', '新增 ' + added + ' 条' + (merged ? '，追加零售商 ' + merged + ' 条' : '') + (dup ? '，无变化 ' + dup + ' 条' : ''));
    MT.toast('已导入 ' + added + ' 条' + (merged ? '，追加零售商 ' + merged + ' 条' : '') + (dup ? '，无变化 ' + dup + ' 条' : ''));
    return;
  }

  if(IMP.type === 'ret'){
    good.forEach(function(r){
      if(PN.ret.some(function(x){ return x.store === r.store && x.ret === r.ret; })){ dup++; return; }
      var sid = r.sid;
      var lng = r.lng === '' ? null : Number(r.lng);
      var lat = r.lat === '' ? null : Number(r.lat);
      PN.ret.push({ sid:sid, ret:r.ret, store:r.store, prov:r.prov, city:r.city, mch:r.mch, lng:lng, lat:lat, n:r.store });
      /* 导入即留存：同步登记到门店与商户号库 */
      if(!(window.RET_DB||[]).some(function(x){ return (r.mch && x.mch === r.mch) || (x.name === r.store && x.ret === r.ret); })){
        window.RET_DB.push({ sid:sid, ret:r.ret, name:r.store, prov:r.prov, city:r.city, mch:r.mch, lng:lng, lat:lat, status:'启用', src:'导入' });
      }
      added++;
    });
  } else {
    good.forEach(function(r){
      var ck = String(r.code || '');
      var ik = String(r.inCode || '');
      var kk = (ck || ik) + '|' + String(r.owner || '');
      if(PN.sku.some(function(x){ return ((String(x.code || '') || String(x.inCode || '')) + '|' + String(x.owner || '')) === kk; })){ dup++; return; }
      PN.sku.push({ code:ck, name:r.name, inCode:ik, owner:r.owner, n:r.name });
      /* 导入即留存：同步登记到商品库，零售商按名称追加 */
      (function(){
        var exs = skuFind(ck, ik);
        if(exs) skuAddRet(exs, r.owner);
        else window.SKU_DB.push({ code:ck, n:r.name, inCode:ik, rets:r.owner ? [r.owner] : [], spec:'', status:'启用', src:'导入' });
      })();
      added++;
    });
  }

  mnPersist();
  if(typeof pnRender === 'function') pnRender();
  closeDrawer();
  /* 从计划 / 批次抽屉进来的，导完回到原抽屉，草稿不丢 */
  if(IMP.fromPlan){
    IMP.fromPlan = false;
    openDrawer('dw-plannew');
  } else if(IMP.fromBatch){
    IMP.fromBatch = false;
    if(typeof batchPage === 'function') batchPage(true);
  }
  MT.toast('已导入 ' + added + ' 行' + (dup ? '，跳过重复 ' + dup + ' 行' : ''));
}

/** 取消导入：同样回到计划抽屉，已填内容保留 */
function impCancel(){
  closeDrawer();
  if(IMP.fromPlan){
    IMP.fromPlan = false;
    openDrawer('dw-plannew');
  } else if(IMP.fromBatch){
    IMP.fromBatch = false;
    if(typeof batchPage === 'function') batchPage(true);
  }
}

/* ---------- 模板：dw-imp ---------- */
function tplDrawerImp(){
  return `<div class="drawer" id="dw-imp" style="width:840px">
  <div class="dw-h">
    <h3 id="impTitle">导入零售商 / 门店名单</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">

    <div class="note b" id="impHint" style="margin-top:0"></div>

    <div class="imp-drop">
      <div class="imp-drop-l">
        <b>选择文件导入</b>
        <small>支持 .csv / .txt（UTF-8），单次建议不超过 5,000 行</small>
      </div>
      <div class="imp-drop-r">
        <input type="file" id="impFile" accept=".csv,text/csv,.txt" onchange="impRead(this)">
        <button class="btn btn-o btn-xs" type="button" onclick="impTpl()">下载导入模板</button>
        <button class="btn btn-g btn-xs" type="button" onclick="impDemo()">填入示例数据</button>
        <button class="btn btn-g btn-xs" type="button" onclick="impClear()">清空</button>
      </div>
    </div>

    <div class="psec"><h4>导入预览</h4><span class="psec-r" id="impCnt">尚未选择文件</span></div>
    <div id="impPreview" class="imp-preview"></div>
  </div>
  <div class="dw-f">
    <div class="lft">异常行导入时自动跳过，可修正后重新导入</div>
    <div class="rgt">
      <button class="btn btn-g" onclick="impCancel()">取消</button>
      <button class="btn btn-p" id="impOkBtn" onclick="impOk()" disabled>导入</button>
    </div>
  </div>
</div>`;
}

MT.defineDrawer('dw-imp', tplDrawerImp);

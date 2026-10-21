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
    hint: '列顺序固定：零售商名称、门店名称、省份、城市、微信商户号。微信商户号由销售填写，销售没有则由服务商提报时补充，故允许为空。',
    cols: [
      { key:'ret',   label:'零售商名称', req:true,  w:'18%' },
      { key:'store', label:'门店名称',   req:true,  w:'28%' },
      { key:'prov',  label:'省份',       req:true,  w:'11%' },
      { key:'city',  label:'城市',       req:true,  w:'11%' },
      { key:'mch',   label:'微信商户号', req:false, w:'16%' }
    ],
    demo: '零售商名称,门店名称,省份,城市,微信商户号\n永辉,重庆永辉超市观音桥店,重庆,重庆,1236057802\n华润万家,广东特易购商业有限公司,广东,深圳,\n全家,上海福满家便利有限公司,上海,上海,1252436002',
    file: '零售商门店导入模板.csv'
  },
  sku: {
    title: '导入活动商品明细',
    hint: '一期不对接商品库。列顺序固定：69码或店内码、商品名称、店内码所属零售商。店内码类商品须填写所属零售商，便于按零售商匹配核销。',
    cols: [
      { key:'code',  label:'69码或店内码', req:true, w:'24%' },
      { key:'name',  label:'商品名称',     req:true, w:'44%' },
      { key:'owner', label:'店内码所属零售商', req:true, w:'28%' }
    ],
    demo: '69码或店内码,商品名称,店内码所属零售商\n6901234500011,特仑苏纯牛奶 250ml×12,永辉\nYH-88921,纯甄原味 200g,永辉\n6901234500028,蒙牛真果粒 250ml×12,华润万家',
    file: '商品明细导入模板.csv'
  }
};

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
  for(var i = start; i < lines.length; i++){
    var cols = impSplit(lines[i]);
    var row = { __line:i + 1, __err:[] };
    sc.cols.forEach(function(c, ci){
      row[c.key] = (cols[ci] || '').trim();
      if(c.req && !row[c.key]) row.__err.push('缺少「' + c.label + '」');
    });
    if(IMP.type === 'ret' && row.mch && !/^\d{8,12}$/.test(row.mch)){
      row.__err.push('微信商户号应为 8~12 位数字');
    }
    /* 同一次导入内的重复行单独标出来，不静默丢弃 */
    var key = IMP.type === 'ret'
      ? (norm(row.mch) || norm(row.ret) + '|' + norm(row.store))
      : (norm(row.code) + '|' + norm(row.owner));
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

  var added = 0, dup = 0;
  if(IMP.type === 'ret'){
    good.forEach(function(r){
      if(PN.ret.some(function(x){ return x.store === r.store && x.ret === r.ret; })){ dup++; return; }
      PN.ret.push({ ret:r.ret, store:r.store, prov:r.prov, city:r.city, mch:r.mch, n:r.store });
      added++;
    });
  } else {
    good.forEach(function(r){
      if(PN.sku.some(function(x){ return x.code === r.code && x.owner === r.owner; })){ dup++; return; }
      PN.sku.push({ code:r.code, name:r.name, owner:r.owner, n:r.name });
      added++;
    });
  }

  if(typeof pnRender === 'function') pnRender();
  closeDrawer();
  /* 从计划 / 批次抽屉进来的，导完回到原抽屉，草稿不丢 */
  if(IMP.fromPlan){
    IMP.fromPlan = false;
    openDrawer('dw-plannew');
  } else if(IMP.fromBatch){
    IMP.fromBatch = false;
    openDrawer('dw-batch');
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
    openDrawer('dw-batch');
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

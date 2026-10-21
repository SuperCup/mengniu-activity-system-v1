/* ---------- 计划概况：零售商 / 活动商品都是多项，明细字段同「名单导入」模板 ---------- */
var CRE_BRIEF = [
  {
    name:'双节满减主推', bat:'双节满减主推', mech:'常温奶满 99 减 15',
    ret:[ { ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802' },
          { ret:'特易购',   store:'特易购（广州天河城店）',     prov:'广东省', city:'广州', mch:'1603482917' } ],
    sku:[ { code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', owner:'永辉超市 / 特易购' } ]
  },
  {
    name:'跨年场景承接', bat:'跨年场景承接', mech:'常温奶满 99 减 15',
    ret:[ { ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802' },
          { ret:'特易购',   store:'特易购（广州天河城店）',     prov:'广东省', city:'广州', mch:'1603482917' } ],
    sku:[ { code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', owner:'永辉超市 / 特易购' } ]
  },
  {
    name:'高端礼盒拉新', bat:'高端礼盒拉新', mech:'高端礼盒满 129 减 20',
    ret:[ { ret:'盒马鲜生', store:'盒马鲜生（杭州西湖银泰店）', prov:'浙江省', city:'杭州', mch:'1457820366' } ],
    sku:[ { code:'6923644288221', name:'特仑苏精选礼盒 12 盒装', owner:'盒马鲜生' } ]
  }
];

/* ---------- 表格单元格 ---------- */
function briefCell(i, k, v){
  return '<td><input class="inp" style="width:100%" value="' + vsEsc(v || '') + '"'
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
      + briefCell(i, 'name', b.name)
      + briefCell(i, 'bat',  b.bat)
      + briefCell(i, 'mech', b.mech)
      + briefCellItems(i, 'ret')
      + briefCellItems(i, 'sku')
      + '<td><div class="ops"><a onclick="briefDel(' + i + ')">删除</a></div></td>'
      + '</tr>';
  });
  if(!CRE_BRIEF.length){
    h = '<tr><td colspan="7" class="empty-row">至少添加 1 个计划概况</td></tr>';
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
  if(CRE_BRIEF.length >= 5){ MT.toast('一个项目最多 5 个计划', 'err'); return; }
  CRE_BRIEF.push({ name:'', bat:'', mech:'', ret:[], sku:[] });
  renderProjBrief();
}

function briefDel(i){
  if(CRE_BRIEF.length <= 1){ MT.toast('至少保留 1 个计划概况', 'err'); return; }
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
    title.innerHTML = (kind === 'ret' ? '涉及零售商明细' : '活动商品明细')
      + ' <span class="sub">' + pnEsc(b.name || '未命名计划') + '</span>';
  }
  var tip = document.getElementById('briefDwTip');
  if(tip){
    tip.innerHTML = kind === 'ret'
      ? '字段与「名单导入」的零售商模板一致：零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号'
      : '字段与「名单导入」的商品模板一致：69码或店内码 / 商品名称 / 店内码所属零售商';
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

/* ---------- 模板：dw-brief ---------- */
function tplDrawerbrief(){
  return `<div class="drawer" id="dw-brief" style="width:880px">
  <div class="dw-h">
    <h3 id="briefDwTitle">明细</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b" id="briefDwBody"></div>
  <div class="dw-f">
    <div class="lft" id="briefDwTip">明细字段与「名单导入」模板一致</div>
    <div class="rgt">
      <button class="btn btn-o" onclick="briefItemAdd()">＋ 添加一行</button>
      <button class="btn btn-g" onclick="closeDrawer()">取消</button>
      <button class="btn btn-p" onclick="briefItemDone()">完成</button>
    </div>
  </div>
</div>`;
}

MT.defineDrawer('dw-brief', tplDrawerbrief);


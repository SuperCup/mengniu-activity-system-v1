/* ---------- 批次计划：一个计划 = 一个批次 = 一张券，零售商 / 商品均为多项 ---------- */
var BRIEF_GRANTS = ['领券', '过机立减'];

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

function briefGrant(i, v){
  var cur = v || '领券';
  return '<td><select class="inp" style="width:100%" onchange="briefSet(' + i + ',\'grant\',this.value)">'
       + BRIEF_GRANTS.map(function(o){
           return '<option' + (o === cur ? ' selected' : '') + '>' + o + '</option>';
         }).join('')
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
      + briefCell(i, 'name',   b.name,   '如：双节满减主推')
      + briefCell(i, 'coupon', b.coupon, '如：双节常温奶满减券')
      + briefCell(i, 'mech',   b.mech,   '满 99 减 15')
      + briefGrant(i, b.grant)
      + briefCellItems(i, 'ret')
      + briefCellItems(i, 'sku')
      + '<td><div class="ops"><a onclick="briefDel(' + i + ')">删除</a></div></td>'
      + '</tr>';
  });
  if(!CRE_BRIEF.length){
    h = '<tr><td colspan="8" class="empty-row">至少创建 1 个计划</td></tr>';
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

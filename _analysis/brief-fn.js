
/* ---------- 计划概况（报批阶段）：只写做什么，不写预算与规则 ---------- */
var CRE_BRIEF = [
  { name:'双节满减主推', bat:'双节满减主推', mech:'常温奶满 99 减 15', ret:'永辉超市、特易购（华东 2 家）', sku:'特仑苏纯牛奶 250ml×12' },
  { name:'跨年场景承接', bat:'跨年场景承接', mech:'常温奶满 99 减 15', ret:'永辉超市、特易购（华东 2 家）', sku:'特仑苏纯牛奶 250ml×12' },
  { name:'高端礼盒拉新', bat:'高端礼盒拉新', mech:'高端礼盒满 129 减 20', ret:'盒马鲜生（杭州）', sku:'特仑苏 / 精选礼盒' }
];

function briefCell(i, k, v){
  return '<td><input class="inp" style="width:100%" value="' + vsEsc(v || '') + '"'
       + ' oninput="briefSet(' + i + ',\'' + k + '\',this.value)"></td>';
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
      + briefCell(i, 'ret',  b.ret)
      + briefCell(i, 'sku',  b.sku)
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
  CRE_BRIEF.push({ name:'', bat:'', mech:'', ret:'', sku:'' });
  renderProjBrief();
}

function briefDel(i){
  if(CRE_BRIEF.length <= 1){ MT.toast('至少保留 1 个计划概况', 'err'); return; }
  CRE_BRIEF.splice(i, 1);
  renderProjBrief();
}

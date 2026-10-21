
const fs=require('fs');
const ROOT='D:/Project/蒙牛-原型-ds-harness/hq-console';
function edit(rel, fn){
  const p=ROOT+'/'+rel;
  let s=fs.readFileSync(p,'utf8');
  const before=s.length;
  s=fn(s);
  if(s.length===before) console.log('!! no change:', rel);
  else fs.writeFileSync(p,s,'utf8');
}

/* ---------- 1. 服务商表格：唯一联系人 ---------- */
edit('js/pages/system-admin.js', function(s){
  const start=s.indexOf('function renderVendors(){');
  const end=s.indexOf('/* ============ 领券页面：数据弹窗 ============ */');
  if(start<0||end<0) return s;
  const body = "function renderVendors(){\n"
    + "  var box = document.getElementById('vsTbody'); if(!box) return;\n"
    + "  var h = '';\n"
    + "  VENDORS.forEach(function(v, i){\n"
    + "    var c = (v.cms && v.cms[0]) || { n:'—', e:'' };\n"
    + "    h += '<tr>' + (i%2 ? ' style=\"background:var(--bg-tint)\"' : '') + '>'\n"
    + "      + '<td><b>' + pnEsc(v.name) + '</b><div class=\"muted sx-mono\">' + pnEsc(v.code) + '</div></td>'\n"
    + "      + '<td class=\"vc-cm\"><b>' + pnEsc(c.n) + '</b><div class=\"muted\" style=\"font-size:11.2px;line-height:1.4\">' + pnEsc(c.e) + '</div></td>'\n"
    + "      + '<td class=\"vc-rm\">' + pnEsc(v.remark || '—') + '</td>'\n"
    + "      + '<td><span class=\"tg tg-g\">启用</span></td>'\n"
    + "      + '<td style=\"white-space:nowrap\"><button class=\"btn btn-o btn-xs\" onclick=\"openVs(' + i + ')\">编辑</button> '\n"
    + "      + '<button class=\"btn btn-g btn-xs\">停用</button></td>'\n"
    + "      + '</tr>';\n"
    + "  });\n"
    + "  box.innerHTML = h || '<tr><td colspan=\"5\" class=\"empty-row\">暂无服务商</td></tr>';\n"
    + "  var tg = document.querySelector('#v-admin .panel-h h3 .tg');\n"
    + "  if(tg) tg.textContent = VENDORS.length + ' 家';\n"
    + "}\n\n";
  return s.slice(0,start) + body + s.slice(end);
});

/* ---------- 2. 计划与批次页：去掉冗余的静态抽屉 ---------- */
edit('js/pages/plan-batch.js', function(s){
  const a=s.indexOf('/* ---------- 模板：dw-plan ---------- */');
  if(a<0) return s;
  const b=s.indexOf('MT.defineDrawer("dw-plan"');
  if(b<0) return s;
  const endLine=s.indexOf('\n', b);
  return s.slice(0,a) + s.slice(endLine+1);
});

/* ---------- 3. 数据看板：标注口径来源 ---------- */
edit('js/pages/dashboard.js', function(s){
  const anchor='<div class="view" id="v-board">';
  const i=s.indexOf(anchor);
  if(i<0) return s;
  const tip = anchor + "\n"
    + "  <div class=\"note b\" style=\"margin-top:0\">\n"
    + "    <b>指标口径：</b>沿用呼市 / 河南已对齐版本，模块与拆分维度直接平移，不另起炉灶（待确认清单标黄项 17）。\n"
    + "    数据源为微信支付 T+1 回传的发券 / 核销 / 订单明细，按活动 → 计划 → 批次 → 二维码四级维度下钻。\n"
    + "  </div>";
  return s.slice(0,i) + tip + s.slice(i+anchor.length);
});
console.log('done');

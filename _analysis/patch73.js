
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* ---------- workflow.js ---------- */
let w=fs.readFileSync(R+'js/core/workflow.js','utf8');
w=w.replace("    return { name:b.name, bat:b.bat, mech:b.mech, ret:b.ret, sku:b.sku };",
            "    return { name:b.name, coupon:b.coupon || b.bat || b.name, mech:b.mech, grant:b.grant || '领券', ret:b.ret, sku:b.sku };");
w=w.replace("      return { id:'PL-' + id.slice(-4) + '-' + (i+1), name:b.name, bat:b.bat, mech:b.mech, s:'', e:'', budget:0 };",
            "      return { id:'PL-' + id.slice(-4) + '-' + (i+1), name:b.name, coupon:b.coupon, mech:b.mech, grant:b.grant, s:'', e:'', budget:0 };");
w=w.replace("      name: b.name, mech: b.mech, bat: b.bat || b.name,",
            "      name: b.name, mech: b.mech, coupon: b.coupon || b.name, grant: b.grant || '领券', bat: b.coupon || b.name,");
w=w.replace("  CRE_BRIEF.push({ name:'', bat:'', mech:'', ret:[], sku:[] });",
            "  CRE_BRIEF.push({ name:'', coupon:'', mech:'', grant:'领券', ret:[], sku:[] });");
w=w.replace("        return { id:'PL-' + p.id.slice(-4) + '-' + (i+1), name:b.name, bat:b.bat, mech:b.mech, s:'', e:'', budget:0 };",
            "        return { id:'PL-' + p.id.slice(-4) + '-' + (i+1), name:b.name, coupon:b.coupon || b.bat, mech:b.mech, grant:b.grant || '领券', s:'', e:'', budget:0 };");
fs.writeFileSync(R+'js/core/workflow.js', w, 'utf8');
console.log('ok workflow');

/* ---------- projects.js：批次名称 → 券名称，补发券方式 ---------- */
let p=fs.readFileSync(R+'js/data/projects.js','utf8');
let n=0;
p=p.replace(/bat:'([^']*)', mech:'/g, function(m, bat){
  n++;
  var grant = (n % 4 === 1) ? '过机立减' : '领券';
  return "coupon:'" + bat + "', grant:'" + grant + "', mech:'";
});
p=p.replace(' *   报批只写计划 / 批次名称、机制口径、涉及零售商、活动商品；',
            ' *   报批只写计划名称、券名称、机制、发券方式、活动零售商、活动商品；');
p=p.replace(' * 计划概况（报批阶段填的「做什么」）',' * 批次计划（一个计划 = 一个批次 = 一张券）');
fs.writeFileSync(R+'js/data/projects.js', p, 'utf8');
console.log('ok projects, rows=' + n);

/* ---------- project-drawer.js ---------- */
let d=fs.readFileSync(R+'js/components/project-drawer.js','utf8');
d=d.replace("  /* 四、计划概况：报批阶段写的「做什么」 */","  /* 四、批次计划：一个计划 = 一个批次 = 一张券 */");
d=d.replace("'计划概况 <span class=\"muted\" style=\"font-weight:400;font-size:11.6px\">报批时填写；预算与券规则在审批通过后补充</span>'",
            "'批次计划 <span class=\"muted\" style=\"font-weight:400;font-size:11.6px\">一个计划对应一个批次（一批次=一张券）；预算与券规则在审批通过后补充</span>'");
d=d.replace("       + '<th style=\"width:16%\">计划名称</th><th style=\"width:16%\">批次名称</th>'\n       + '<th style=\"width:18%\">活动机制</th><th style=\"width:22%\">涉及零售商</th><th style=\"width:20%\">活动商品</th>'",
            "       + '<th style=\"width:14%\">计划名称</th><th style=\"width:16%\">券名称</th>'\n       + '<th style=\"width:14%\">机制</th><th style=\"width:9%\">发券方式</th><th style=\"width:22%\">活动零售商</th><th style=\"width:25%\">活动商品</th>'");
d=d.replace("          return '<tr><td>' + pnEsc(b.name) + '</td><td>' + pnEsc(b.bat) + '</td>'\n            + '<td>' + pnEsc(b.mech) + '</td><td>' + briefCellTxt(b.ret, 'ret') + '</td><td>' + briefCellTxt(b.sku, 'sku') + '</td></tr>';",
            "          return '<tr><td>' + pnEsc(b.name) + '</td><td>' + pnEsc(b.coupon || b.bat) + '</td>'\n            + '<td>' + pnEsc(b.mech) + '</td><td>' + pnEsc(b.grant || '领券') + '</td>'\n            + '<td>' + briefCellTxt(b.ret, 'ret') + '</td><td>' + briefCellTxt(b.sku, 'sku') + '</td></tr>';");
d=d.split('<span class="k">活动机制</span>').join('<span class="k">机制</span>');
fs.writeFileSync(R+'js/components/project-drawer.js', d, 'utf8');
console.log('ok drawer');

/* ---------- 审批 / 项目管理：标签与字段统一 ---------- */
['js/pages/project-approve.js','js/pages/project-manage.js'].forEach(function(f){
  let s=fs.readFileSync(R+f,'utf8');
  s=s.split('计划概况 ').join('批次计划 ');
  s=s.split('<span class="k">活动机制</span>').join('<span class="k">机制</span>');
  s=s.split('服务商 / 活动机制 / PO 单号').join('服务商 / 机制 / PO 单号');
  fs.writeFileSync(R+f, s, 'utf8');
});
console.log('ok approve+manage');

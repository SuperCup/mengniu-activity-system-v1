const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 1) 计划概况校验 + 文案修正 */
let c=fs.readFileSync(R+'js/pages/project-create.js','utf8');
c=c.replace('按上面 1 个概况补成 1 个计划 + 1 个批次，填写预算分配与券规则（面额 / 门槛 / 发放数量 / 有效期），',
            '按上面的计划概况逐个补成「计划 + 批次」，填写预算分配与券规则（面额 / 门槛 / 发放数量 / 有效期），');
c=c.replace("  if(missing.length){ MT.toast('提交前请补充：' + missing.join('、'), 'err'); return; }",
  "  var bad = CRE_BRIEF.filter(function(b){ return !(b.name||'').trim() || !(b.mech||'').trim() || !(b.ret||'').trim() || !(b.sku||'').trim(); });\n"
+ "  if(!CRE_BRIEF.length) missing.push('至少 1 个计划概况');\n"
+ "  if(bad.length) missing.push('计划概况的名称 / 机制 / 零售商 / 商品');\n"
+ "  if(missing.length){ MT.toast('提交前请补充：' + missing.join('、'), 'err'); return; }");
fs.writeFileSync(R+'js/pages/project-create.js',c,'utf8');
console.log('submit validation added');

/* 2) 项目详情：计划概况 */
let d=fs.readFileSync(R+'js/components/project-drawer.js','utf8');
if(d.indexOf('计划概况')<0){
  const sec = "  /* 四、计划概况（报批阶段写的做什么） */\n"
+ "  if(p.planBrief && p.planBrief.length){\n"
+ "    h += '<div class=\"dsec\"><h5>计划概况 <span class=\"muted\" style=\"font-weight:400;font-size:11.6px\">报批时填写，预算与券规则在审批通过后补充</span></h5>'\n"
+ "      + '<table class=\"bt mini\" style=\"table-layout:fixed\"><thead><tr>'\n"
+ "      + '<th style=\"width:16%\">计划名称</th><th style=\"width:16%\">批次名称</th>'
+ "      + '<th style=\"width:18%\">活动机制</th><th style=\"width:22%\">涉及零售商</th><th style=\"width:20%\">活动商品</th>'\n"
+ "      + '</tr></thead><tbody>'\n"
+ "      + p.planBrief.map(function(b){\n"
+ "          return '<tr><td>' + pnEsc(b.name) + '</td><td>' + pnEsc(b.bat) + '</td>'
+ "            + '<td>' + pnEsc(b.mech) + '</td><td>' + pnEsc(b.ret) + '</td><td>' + pnEsc(b.sku) + '</td></tr>';\n"
+ "        }).join('')\n"
+ "      + '</tbody></table></div>';\n"
+ "  }\n\n";
  d=d.replace('  /* 四、状态时间线 */', sec+'  /* 四、状态时间线 */');
  fs.writeFileSync(R+'js/components/project-drawer.js',d,'utf8');
  console.log('drawer brief section added:', d.indexOf('计划概况')>0);
} else console.log('drawer already has brief');

/* 3) 启动渲染 */
let a=fs.readFileSync(R+'js/app.js','utf8');
if(a.indexOf('renderProjBrief')<0){
  a=a.replace("    safe(window.initProjVendor,     'initProjVendor');",
    "    safe(window.initProjVendor,     'initProjVendor');\n    safe(window.renderProjBrief,    'renderProjBrief');");
  fs.writeFileSync(R+'js/app.js',a,'utf8');
  console.log('boot wired');
}

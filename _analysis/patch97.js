
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* ---------- 1. plan-drawer：明细渲染改为双抽屉共用 + 抽出 pnLoadRows ---------- */
let d=fs.readFileSync(R+'js/components/plan-drawer.js','utf8');

/* 1a. openPlanNew 里的明细加载换成 pnLoadRows */
const loadStart=d.indexOf('  /* 零售商明细：优先取计划里保存的导入快照 */');
const loadEnd=d.indexOf('  pnRender();\n  openDrawer(\'dw-plannew\');');
if(loadStart<0||loadEnd<0) throw new Error('load anchors');
d=d.slice(0,loadStart)+'  pnLoadRows(p);\n\n'+d.slice(loadEnd);

/* 1b. pnRender 整段替换 */
const rStart=d.indexOf('/* ---------- 渲染两张明细表 ---------- */');
const rEnd=d.indexOf('function pnSet(type, i, k, v){');
if(rStart<0||rEnd<0) throw new Error('render anchors');
d=d.slice(0,rStart)+fs.readFileSync(A+'pnrender.js','utf8')+d.slice(rEnd);
fs.writeFileSync(R+'js/components/plan-drawer.js', d, 'utf8');
console.log('ok plan-drawer');

/* ---------- 2. batch-drawer：加载明细 + 模板加两块 + 保存写回 ---------- */
let b=fs.readFileSync(R+'js/components/batch-drawer.js','utf8');

/* 2a. openBatch 里加载草稿 */
b=b.replace("  var b = p.batchForm || {};",
"  /* 明细草稿与计划抽屉共用：零售商门店 / 活动商品 */\n"
+ "  PN.idx = idx;\n"
+ "  pnLoadRows(p);\n\n"
+ "  var b = p.batchForm || {};");
b=b.replace("  batchPreview();\n  openDrawer('dw-batch');",
"  batchPreview();\n  pnRender();\n  openDrawer('dw-batch');");

/* 2b. 模板插入两块明细（放在 bat-grid 之后） */
const anchor="  </div>\n  <div class=\"dw-f\">\n    <div class=\"rgt\" style=\"margin-left:auto\">";
if(b.indexOf(anchor)<0) throw new Error('template anchor');
b=b.replace(anchor, fs.readFileSync(A+'bat-detail.html','utf8') + anchor);

/* 2c. 保存：校验并写回明细 */
b=b.replace("  p.batchForm = { name:name, face:face, thr:thr, start:start, end:end,\n                  cap:cap, user:user, desc:desc, batNo:batNo };",
"  if(!PN.ret.length){ MT.toast('请先导入至少 1 条活动零售商明细', 'err'); return; }\n"
+ "  if(!PN.sku.length){ MT.toast('请先导入至少 1 条活动商品明细', 'err'); return; }\n\n"
+ "  p.batchForm = { name:name, face:face, thr:thr, start:start, end:end,\n                  cap:cap, user:user, desc:desc, batNo:batNo };\n\n"
+ "  /* 零售商门店 / 活动商品明细：保存到计划，供计划详情、领券页与推送使用 */\n"
+ "  p.retRows = PN.ret.map(function(x){ return Object.assign({}, x); });\n"
+ "  p.skuRows = PN.sku.map(function(x){ return Object.assign({}, x); });\n"
+ "  p.ret = PN.ret.map(function(x){ return x.store || x.n; }).filter(Boolean);\n"
+ "  p.sku = PN.sku.map(function(x){ return x.name || x.n; }).filter(Boolean);");

fs.writeFileSync(R+'js/components/batch-drawer.js', b, 'utf8');
console.log('ok batch-drawer: template='+(b.indexOf('bfRetBody')>=0)+' save='+(b.indexOf('p.retRows = PN.ret')>=0));

/* ---------- 3. import-drawer：从批次抽屉进来，导完回批次抽屉 ---------- */
let im=fs.readFileSync(R+'js/components/import-drawer.js','utf8');
im=im.replace("  IMP.fromPlan = !!document.querySelector('#dw-plannew.on');",
"  IMP.fromPlan = !!document.querySelector('#dw-plannew.on');\n  IMP.fromBatch = !!document.querySelector('#dw-batch.on');");
im=im.replace("  /* 从计划抽屉进来的，导完回到计划抽屉，草稿不丢 */\n  if(IMP.fromPlan){\n    IMP.fromPlan = false;\n    openDrawer('dw-plannew');\n  }",
"  /* 从计划 / 批次抽屉进来的，导完回到原抽屉，草稿不丢 */\n  if(IMP.fromPlan){\n    IMP.fromPlan = false;\n    openDrawer('dw-plannew');\n  } else if(IMP.fromBatch){\n    IMP.fromBatch = false;\n    openDrawer('dw-batch');\n  }");
im=im.replace("  if(IMP.fromPlan){\n    IMP.fromPlan = false;\n    openDrawer('dw-plannew');\n  }\n}",
"  if(IMP.fromPlan){\n    IMP.fromPlan = false;\n    openDrawer('dw-plannew');\n  } else if(IMP.fromBatch){\n    IMP.fromBatch = false;\n    openDrawer('dw-batch');\n  }\n}");
fs.writeFileSync(R+'js/components/import-drawer.js', im, 'utf8');
console.log('ok import-drawer: '+(im.indexOf('IMP.fromBatch')>=0));


const fs=require('fs'), path=require('path');
const ROOT='D:/Project/蒙牛-原型-ds-harness/hq-console';
let js=fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/app.orig.js','utf8');
// 去掉被 style 块之后的多余内容与末尾 </script> 残留（已在上一步裁剪）
const lines=js.split('\n');

const startRe=/^(function\s+[\w$]+|var\s+[\w$]+|let\s+[\w$]+|const\s+[\w$]+|document\.addEventListener|window\.|\(function)/;
const commentRe=/^\s*\/\*/;

const segs=[];
let pending=[];
let cur=null;
for(const line of lines){
  if(startRe.test(line)){
    if(cur) segs.push(cur);
    cur={header:pending.join('\n'), code:[line]};
    pending=[];
    continue;
  }
  if(commentRe.test(line) && !cur){
    pending.push(line); continue;
  }
  if(commentRe.test(line) && cur && cur.code.length<=1 && cur.header===''){
    // 注释紧跟段首：作为该段注释
    cur.code.push(line); continue;
  }
  if(/^\s*\/\*/.test(line) && cur && /^\s*$/.test(cur.code[cur.code.length-1])){ cur.code.push(line); continue; }
  if(cur) cur.code.push(line); else pending.push(line);
}
if(cur) segs.push(cur);

function keyOf(seg){
  const first=seg.code[0];
  let m=first.match(/^(?:function\s+|var\s+|let\s+|const\s+)([\w$]+)/);
  if(m) return m[1];
  m=first.match(/^document\.addEventListener/); if(m) return 'keydown';
  m=first.match(/^\(function/); if(m) return 'iife';
  m=first.match(/^window\./); if(m) return 'window';
  return 'unknown:'+first.slice(0,40);
}

const MAP={
  // ---- 数据 ----
  'PAGES':'js/data/coupon-pages.js', 'STATEMAP':'js/data/coupon-pages.js',
  'QRDATA':'js/data/qr.js',
  'RET_DB':'js/data/retailers.js',
  'SKU_DB':'js/data/products.js', 'PN_SKU_PRESET':'js/data/products.js',
  'PLANS':'js/data/plans.js', 'PLAN_PAGE':'js/data/plans.js',
  'VENDORS':'js/data/vendors.js',
  'PO_DB':'js/data/po.js',
  'DB_CHAN':'js/data/dashboard.js','DB_RET':'js/data/dashboard.js','DB_SKU':'js/data/dashboard.js',
  'DB_WEEK':'js/data/dashboard.js','DB_WEEK_V':'js/data/dashboard.js','DB_HEAT':'js/data/dashboard.js',
  'PROJ_CARDS':'js/data/projects.js','PROJ_PAGE':'js/data/projects.js',
  // ---- 共享组件 ----
  'batCheck':'js/components/plan-list.js','renderPlans':'js/components/plan-list.js',
  'renderBatches':'js/components/plan-list.js','gotoPlan':'js/components/plan-list.js',
  'renderCreatePlans':'js/components/plan-list.js','renderApprovePlans':'js/components/plan-list.js',
  'delPlan':'js/components/plan-list.js','openPlanDetail':'js/components/plan-list.js',
  'PICK':'js/components/picker.js','openPick':'js/components/picker.js','renderPick':'js/components/picker.js',
  'pickSyncAll':'js/components/picker.js','pickAllToggle':'js/components/picker.js','pickRow':'js/components/picker.js',
  'pickToggle':'js/components/picker.js','pickSearch':'js/components/picker.js','closePick':'js/components/picker.js',
  'pickOk':'js/components/picker.js',
  'PN':'js/components/plan-drawer.js','openPlanNew':'js/components/plan-drawer.js','pnRender':'js/components/plan-drawer.js',
  'pnSet':'js/components/plan-drawer.js','pnDel':'js/components/plan-drawer.js','pnAddSku':'js/components/plan-drawer.js',
  'pnSum':'js/components/plan-drawer.js','pnSave':'js/components/plan-drawer.js','addPlan':'js/components/plan-drawer.js',
  'IMP':'js/components/import-drawer.js','openImp':'js/components/import-drawer.js','impExists':'js/components/import-drawer.js',
  'renderImp':'js/components/import-drawer.js','impSyncAll':'js/components/import-drawer.js',
  'impAllToggle':'js/components/import-drawer.js','impToggle':'js/components/import-drawer.js','impOk':'js/components/import-drawer.js',
  'qrCur':'js/components/qr-drawer.js','qrDrawBack':'js/components/qr-drawer.js','openQr':'js/components/qr-drawer.js',
  'qrSize':'js/components/qr-drawer.js','qrDl':'js/components/qr-drawer.js',
  'openFlow':'js/components/flow-drawer.js',
  'VS':'js/components/vendor-drawer.js','openVs':'js/components/vendor-drawer.js','vsRender':'js/components/vendor-drawer.js',
  'vsEsc':'js/components/vendor-drawer.js','vsSet':'js/components/vendor-drawer.js','vsDelCm':'js/components/vendor-drawer.js',
  'vsAddCm':'js/components/vendor-drawer.js','vsSave':'js/components/vendor-drawer.js',
  // ---- 模块 ----
  'toggleB':'js/pages/coupon-page.js','makeCard':'js/pages/coupon-page.js','refresh':'js/pages/coupon-page.js',
  'pickBg':'js/pages/coupon-page.js','syncPreview':'js/pages/coupon-page.js','setState':'js/pages/coupon-page.js',
  'openEditDrawer':'js/pages/coupon-page.js','openPgData':'js/components/pagedata.js',
  'batList':'js/pages/coupon-page.js','BAT':'js/pages/coupon-page.js','BPAGE':'js/pages/coupon-page.js',
  'BPICK':'js/pages/coupon-page.js','bFiltered':'js/pages/coupon-page.js','openPageDrawer':'js/pages/coupon-page.js',
  'renderBlist':'js/pages/coupon-page.js','bGo':'js/pages/coupon-page.js','bToggleRow':'js/pages/coupon-page.js',
  'bToggle':'js/pages/coupon-page.js',
  'renderVendors':'js/pages/system-admin.js',
  'renderDbKpis':'js/pages/dashboard.js','renderDbTrend':'js/pages/dashboard.js','renderDbChannel':'js/pages/dashboard.js',
  'renderDbRet':'js/pages/dashboard.js','renderDbSku':'js/pages/dashboard.js','renderDbTime':'js/pages/dashboard.js',
  'renderDbAll':'js/pages/dashboard.js',
  'initProjVendor':'js/pages/project-create.js','projVendorChange':'js/pages/project-create.js',
  'poLookup':'js/pages/project-create.js',
  'renderProjCards':'js/pages/project-manage.js','gotoProj':'js/pages/project-manage.js',
  // ---- 已手写 / 丢弃 ----
  'money':null,'pnEsc':null,'pnFmt':null,'pnNum':null,'pnMatch':null,
  'dbFmt':null,'dbMoney':null,
  'openDrawer':null,'closeDrawer':null,'keydown':null,'go':null,'pick':null,'__bootAll':null
};

const out={};
const skipped=[], unmapped=[];
for(const seg of segs){
  const k=keyOf(seg);
  if(!(k in MAP)){ unmapped.push(k+'  ← '+seg.code[0].trim().slice(0,70)); continue; }
  const target=MAP[k];
  if(target===null){ skipped.push(k); continue; }
  out[target]=out[target]||[];
  if(seg.header.trim()) out[target].push(seg.header.trimEnd());
  out[target].push(seg.code.join('\n').replace(/\s+$/,''));
}
console.log('unmapped:');
console.log(unmapped.join('\n'));
console.log('skipped:', skipped.join(', '));
console.log('--- targets ---');
Object.keys(out).forEach(k=>console.log(k+' : '+out[k].length+' segments'));
fs.writeFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/segments.json', JSON.stringify(out,null,1),'utf8');


const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* ---------- 计划抽屉 ---------- */
let d=fs.readFileSync(R+'js/components/plan-drawer.js','utf8');
const openStart=d.indexOf('function openPlanNew(idx){');
const openEnd=d.indexOf("  document.getElementById('pnName').value");
if(openStart<0||openEnd<0) throw new Error('openPlanNew anchors');
d=d.slice(0,openStart)+fs.readFileSync(A+'plan-open.txt','utf8')+'\n\n'+d.slice(openEnd);

const saveStart=d.indexOf('function pnSave(again){');
const saveEnd=d.indexOf('/** 兼容旧入口：直接新增一条空计划 */');
if(saveStart<0||saveEnd<0) throw new Error('pnSave anchors');
d=d.slice(0,saveStart)+fs.readFileSync(A+'plan-save.js','utf8')+'\n\n'+d.slice(saveEnd);
fs.writeFileSync(R+'js/components/plan-drawer.js', d, 'utf8');
console.log('ok plan drawer');

/* ---------- 批次抽屉 ---------- */
let b=fs.readFileSync(R+'js/components/batch-drawer.js','utf8');
const bs=b.indexOf('function batchSave(){');
const be=b.indexOf('/* ---------- 模板：dw-batch ---------- */');
if(bs<0||be<0) throw new Error('batchSave anchors');
b=b.slice(0,bs)+fs.readFileSync(A+'batch-save.js','utf8')+'\n\n'+b.slice(be);
fs.writeFileSync(R+'js/components/batch-drawer.js', b, 'utf8');
console.log('ok batch drawer');

/* ---------- 服务商：数据层收敛为唯一联系人 ---------- */
let v=fs.readFileSync(R+'js/data/vendors.js','utf8');
if(v.indexOf('唯一联系人')<0){
  v += "\n\n/* 标黄项 12：一个服务商只保留一个对接联系人，避免「取第一条」时静默丢数据 */\n"
     + "VENDORS.forEach(function(x){\n"
     + "  if(Array.isArray(x.cms) && x.cms.length > 1){\n"
     + "    x.cmsExtra = x.cms.slice(1);\n"
     + "    x.cms = [x.cms[0]];\n"
     + "  }\n"
     + "});\n";
  fs.writeFileSync(R+'js/data/vendors.js', v, 'utf8');
  console.log('ok vendors single contact');
}

/* ---------- 选择服务商不再被重置 ---------- */
let c=fs.readFileSync(R+'js/pages/project-create.js','utf8');
const oldSel="  projVendorChange('');\n  if(VENDORS.length > 1){ sel.value = '1'; projVendorChange('1'); }\n  else if(VENDORS.length){ sel.value = '0'; projVendorChange('0'); }";
const newSel="  /* 保留当前已选服务商，只有空选时才用第一家兜底 */\n  var keep = sel.value;\n  if(keep === '' && VENDORS.length){ keep = '0'; }\n  sel.value = keep;\n  projVendorChange(keep);";
if(c.indexOf(oldSel)>=0){ c=c.replace(oldSel,newSel); fs.writeFileSync(R+'js/pages/project-create.js',c,'utf8'); console.log('ok vendor keep'); }
else console.log('!! vendor select marker');

/* ---------- 系统管理：重置演示数据 ---------- */
let ad=fs.readFileSync(R+'js/pages/system-admin.js','utf8');
const oldH='    <h3>系统管理</h3>';
if(ad.indexOf('wfResetDemo')<0 && ad.indexOf(oldH)>=0){
  const i=ad.indexOf(oldH);
  const le=ad.indexOf('\n', ad.indexOf('</div>', i));
  ad=ad.slice(0,i)+oldH+'\n      <button class="btn btn-o btn-xs" onclick="wfResetDemo()">重置演示数据</button>'+ad.slice(i+oldH.length);
  fs.writeFileSync(R+'js/pages/system-admin.js', ad, 'utf8');
  console.log('ok reset button');
} else console.log('!! admin header');

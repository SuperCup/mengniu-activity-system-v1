const { chromium } = require('C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror',e=>errors.push(String(e)));
  const url = pathToFileURL(path.resolve('hq-console/index.html')).href+'?nologin=1';
  await page.goto(url);
  await page.waitForSelector('#pbPlanBody tr');
  const results = [];
  async function probe(name, fn) {results.push({name,result:await page.evaluate(fn)});}
  await probe('boot',()=>({views:document.querySelectorAll('.view').length,plans:PLANS.length}));
  await probe('submit does not create project and invalid PO accepted',()=>{
    go('v-create'); const before=PROJECTS.length;
    document.getElementById('poNo').value='INVALID';poLookup();submitProject();
    return {before,after:PROJECTS.length,toast:document.getElementById('mnToast').textContent};
  });
  await probe('approval does not transition',()=>{
    const p=PROJECTS.find(p=>p.state==='pending');const before=p.state;projApprove(p.id,'agree');return {before,after:p.state};
  });
  await probe('import closes parent editor and headerless data is lost',()=>{
    go('v-plan');openPlanNew();openImp('ret');impDemo();impOk();
    const afterImport={ret:PN.ret.length,open:[...document.querySelectorAll('.drawer.on')].map(x=>x.id)};
    openPlanNew();const afterReopen=PN.ret.length;
    IMP.type='ret';impParse('永辉,观音桥店,重庆,重庆,1236057802');const single=IMP.rows.length;
    impParse('永辉,观音桥门店,重庆,重庆,1236057802\n全家,人民路店,上海,上海,1236057803');
    return {afterImport,afterReopen,singleHeaderlessRows:single,twoHeaderlessRows:IMP.rows.length,firstStore:IMP.rows[0]?.store};
  });
  await probe('new plan loses project and ignores pending state and invalid amounts',()=>{
    closeDrawer(); const p=PROJECTS.find(p=>p.state==='pending');openProjPlans(p.id);openPlanNew();
    const fields={pnName:'REVIEW probe',pnMech:'满99减15',pnStart:'2026-12-20',pnEnd:'2027-01-05',pnBudget:'-1',pnQty:'1.5',pnFace:'-2',pnThr:'0'};
    Object.entries(fields).forEach(([k,v])=>document.getElementById(k).value=v);
    PN.ret=[{ret:'永辉',store:'店',prov:'上海',city:'上海',mch:''}];PN.sku=[{code:'6901234500011',name:'奶',owner:'永辉'}];
    pnSave(false);const n=PLANS[PLANS.length-1];return {scopeState:p.state,created:n.name==='REVIEW probe',proj:n.proj??null,visible:planScoped().includes(n),budget:n.budget,qty:n.qty,face:n.face};
  });
  await probe('batch accepts negative day and fractional counts and overwrites plan',()=>{
    const before={face:PLANS[0].face,qty:PLANS[0].qty,budget:PLANS[0].budget};openBatch(0);
    const f={bfName:'测试券',bfMch:'1236057802',bfFace:'10',bfThr:'99',bfCap:'1.5',bfDay:'-2',bfUser:'1.5',bfStart:'2026-12-20',bfEnd:'2026-12-27',bfDesc:'测试',bfBatNo:''};
    Object.entries(f).forEach(([k,v])=>document.getElementById(k).value=v);batchSave();const p=PLANS[0];
    return {before,after:{face:p.face,qty:p.qty,budget:p.budget,bat:p.bat,bstat:p.bstat,batchForm:p.batchForm}};
  });
  await page.goto(url);
  await page.waitForSelector('#pbPlanBody tr');
  await probe('QR names collide and empty channel keeps stale selected code',()=>{
    const a=qrCodeName('r1',QRDATA.r1.codes[0]),b=qrCodeName('r2',QRDATA.r2.codes[0]);
    openQr('r1','OFF');const before=qrCur.item.link;openQr('r2','MP');
    const first={page:qrCur.key,channel:qrCur.code,selected:qrCur.item.link,display:document.getElementById('qrLink').textContent};
    qrChannelTab('MP');const afterBlank={selected:qrCur.item?.link,display:document.getElementById('qrLink').textContent};
    return {a,b,duplicate:a===b,before,first,afterBlank};
  });
  await probe('vendor data has multiple contacts and save resets project vendor',()=>{
    closeDrawer();go('v-create');document.getElementById('projVendor').value='0';projVendorChange('0');
    const counts=VENDORS.map(v=>v.cms.length);openVs(2);vsSave();
    return {counts,selectedAfterSave:document.getElementById('projVendor').value};
  });
  await probe('dashboard channel total does not reconcile',()=>{
    const issuedCap=PLANS.reduce((n,p)=>n+p.bqty,0),used=PLANS.reduce((n,p)=>n+p.used,0);
    const chanUsed=DB_CHAN.reduce((n,c)=>n+Math.round(Math.round(issuedCap*c.share)*c.rate),0);
    return {used,chanUsed,kpis:document.getElementById('dbKpis').textContent};
  });
  await probe('decimal money formatting',()=>money(123.45));
  await probe('valid imports parse and unique contact is displayed',()=>{
    IMP.type='ret';impParse(IMP_SCHEMA.ret.demo);const ret={rows:IMP.rows.length,errors:IMP.errs.length};
    IMP.type='sku';impParse(IMP_SCHEMA.sku.demo);const sku={rows:IMP.rows.length,errors:IMP.errs.length};
    projVendorChange('0');return {ret,sku,displayedContact:document.getElementById('projContactName').textContent};
  });
  await probe('plan edit entry, page submit and vendor deactivate are unwired',()=>{
    closeDrawer();go('v-plan');const planEditLinks=[...document.querySelectorAll('#pbPlanBody [onclick]')].filter(x=>x.getAttribute('onclick').includes('openPlanNew')).length;
    return {planEditLinks,generatePageHandler:[...document.querySelectorAll('#dw-page button')].find(x=>x.textContent.includes('生成页面')).getAttribute('onclick'),vendorDeactivateHandler:[...document.querySelectorAll('#vsTbody button')].find(x=>x.textContent.includes('停用')).getAttribute('onclick')};
  });
  await probe('permissions save does not restrict navigation',()=>{
    openRole('biz');return {roleKeys:ROLES.map(r=>r.key),allNavigation:MT.navOrder,hasIdentity:typeof MT.currentUser};
  });
  await probe('batch duplicate ID accepted',()=>{
    openBatch(1);document.getElementById('bfMch').value='1236057802';document.getElementById('bfBatNo').value=PLANS[0].bat;batchSave();
    return {first:PLANS[0].bat,second:PLANS[1].bat,duplicate:PLANS[0].bat===PLANS[1].bat};
  });
  const artifact={errors,results};
  fs.writeFileSync('_analysis/review-20261021-results.json',JSON.stringify(artifact,null,2));
  console.log(JSON.stringify(artifact,null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});

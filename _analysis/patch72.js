
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'js/pages/project-create.js';
let s=fs.readFileSync(P,'utf8');

/* 1) 第四块：标题 + 表头 */
const secStart=s.indexOf('      <!-- 四、计划概况（报批阶段只写做什么） -->');
const secEnd=s.indexOf('      <div class="panel-f">');
if(secStart<0||secEnd<0) throw new Error('sec anchors');
s=s.slice(0,secStart)+fs.readFileSync(A+'cre-sec.html','utf8')+'\n'+s.slice(secEnd);

/* 2) 数据 + 单元格函数 */
const dStart=s.indexOf('/* ---------- 计划概况：零售商 / 活动商品都是多项');
const dEnd=s.indexOf('/* ---------- 明细抽屉：零售商 / 活动商品 ---------- */');
if(dStart<0||dEnd<0) throw new Error('data anchors');
s=s.slice(0,dStart)+fs.readFileSync(A+'cre-brief.js','utf8')+'\n'+s.slice(dEnd);

/* 3) 抽屉标题 / 提示文案 */
s=s.replace("title.innerHTML = (kind === 'ret' ? '涉及零售商明细' : '活动商品明细')","title.innerHTML = (kind === 'ret' ? '活动零售商明细' : '活动商品明细')");
s=s.replace("? '字段与「名单导入」的零售商模板一致：零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号'","? '字段与「名单导入」的零售商模板一致：零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号；可用「下载模板 / 导入文件」批量导入'");
s=s.replace(": '字段与「名单导入」的商品模板一致：69码或店内码 / 商品名称 / 店内码所属零售商';",": '字段与「名单导入」的商品模板一致：69码或店内码 / 商品名称 / 店内码所属零售商；可用「下载模板 / 导入文件」批量导入';");

/* 4) 导入函数：插在 briefItemDone 之后 */
const impAnchor='/* ---------- 模板：dw-brief ---------- */';
const impAt=s.indexOf(impAnchor);
if(impAt<0) throw new Error('imp anchor');
s=s.slice(0,impAt)+fs.readFileSync(A+'cre-import.js','utf8')+'\n'+s.slice(impAt);

/* 5) 抽屉模板 */
const tStart=s.indexOf('function tplDrawerbrief(){');
const tEnd=s.indexOf("MT.defineDrawer('dw-brief', tplDrawerbrief);");
if(tStart<0||tEnd<0) throw new Error('tpl anchors');
s=s.slice(0,tStart)+fs.readFileSync(A+'dw-brief.html','utf8')+'\n\n'+s.slice(tEnd);

/* 6) 提交校验：券名称也必填 */
s=s.replace("if(!String(b.name || '').trim() || !String(b.mech || '').trim()","if(!String(b.name || '').trim() || !String(b.coupon || '').trim() || !String(b.mech || '').trim()");
s=s.replace("if(bad.length) missing.push('计划概况的名称 / 机制 / 零售商明细 / 商品明细');","if(bad.length) missing.push('计划的名称 / 券名称 / 机制 / 活动零售商 / 活动商品');");
s=s.replace("if(!CRE_BRIEF.length) missing.push('至少 1 个计划概况');","if(!CRE_BRIEF.length) missing.push('至少 1 个计划');");

fs.writeFileSync(P,s,'utf8');
console.log('ok create page');

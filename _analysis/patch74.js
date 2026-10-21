
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* ---------- readiness：归属商户号不再让业务填 ---------- */
let rd=fs.readFileSync(R+'js/core/readiness.js','utf8');
rd=rd.replace("  if(isVoucher){\n    g1.fields.push({ k:'mch', label:'归属商户号', kind:'text', req:true, tag:'微信必填',\n      hint:'实际创建券批次的主体商户号，不能拿门店核销商户号顶替' });\n  }\n","");
rd=rd.replace("label: isVoucher ? '批次名称' : '活动名称'","label: isVoucher ? '券名称' : '活动名称'");
rd=rd.replace("tag:'微信必填', hint: isVoucher ? '与报批的计划/批次名称不同，这里是微信后台上创建的券批次名' : '微信创建活动时填写的名称，建议 9 个字以内' });",
              "tag:'微信必填', hint: isVoucher ? '报批时填写的券名称会带过来，可在此按微信后台口径微调' : '微信创建活动时填写的名称，建议 9 个字以内' });");
fs.writeFileSync(R+'js/core/readiness.js', rd, 'utf8');
console.log('ok readiness');

/* ---------- 配置抽屉：多计划切换 + 说明 ---------- */
let c=fs.readFileSync(R+'js/components/config-drawer.js','utf8');

/* 插入 cfgPlanBar / cfgSwitch */
const anchor='/** 商户及商品组：门店与商品明细摘要（来自导入，不在此重复维护） */';
const at=c.indexOf(anchor);
if(at<0) throw new Error('scope anchor');
c=c.slice(0,at)+fs.readFileSync(A+'cfg-bar.js','utf8')+'\n'+c.slice(at);

/* 渲染：计划条 + 说明 */
c=c.replace("  var all = planMissing(p);\n  var h = cfgPlanHead(p);",
"  var all = planMissing(p);\n  var h = cfgPlanBar(p);\n"
+ "  h += '<div class=\"note b\" style=\"margin:0 0 12px\">一个批次等于一张券；一个计划对应一个批次（便于管理），一个项目（活动）下有多个计划就是多个批次。归属商户号由服务商配券时补充，本页不用填。</div>';\n"
+ "  h += cfgPlanHead(p);");

/* 快照头：机制 / 券名称 / 发券方式 */
c=c.replace("      + '<div><span>活动机制</span><b>' + pnEsc(mech || '—') + '</b></div>'",
            "      + '<div><span>券名称</span><b>' + pnEsc((brief && brief.coupon) || p.coupon || p.bat || '—') + '</b></div>'\n"
          + "      + '<div><span>发券方式</span><b>' + pnEsc((brief && brief.grant) || p.grant || '领券') + '</b></div>'\n"
          + "      + '<div><span>机制</span><b>' + pnEsc(mech || '—') + '</b></div>'");
fs.writeFileSync(R+'js/components/config-drawer.js', c, 'utf8');
console.log('ok config drawer');

/* ---------- CSS ---------- */
const cp=R+'css/components.css';
fs.appendFileSync(cp, fs.readFileSync(A+'cfg-bar.css','utf8'), 'utf8');
console.log('ok css');


const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* ---------- 1. wfEnterConfig 改为跳转 ---------- */
let w=fs.readFileSync(R+'js/core/workflow.js','utf8');
const s0=w.indexOf('function wfEnterConfig(');
if(s0<0) throw new Error('wfEnterConfig anchor');
let s1=w.indexOf('\n}\n', s0);
if(s1<0) throw new Error('wfEnterConfig end');
w=w.slice(0,s0)+fs.readFileSync(A+'plan-info.js','utf8').split('/** 项目三项基本信息')[0].trim()+w.slice(s1+2);
fs.writeFileSync(R+'js/core/workflow.js', w, 'utf8');
console.log('ok wfEnterConfig');

/* ---------- 2. plan-batch：项目信息三块 + 去掉项目详情按钮 ---------- */
let b=fs.readFileSync(R+'js/pages/plan-batch.js','utf8');
const at=b.indexOf('/** 当前作用域下的计划 */');
if(at<0) throw new Error('planScoped anchor');
/* 追加 planProjInfo（从 plan-info.js 中截取第二段） */
const info=fs.readFileSync(A+'plan-info.js','utf8');
const infoBody=info.slice(info.indexOf('/** 项目三项基本信息'));
if(b.indexOf('function planProjInfo')<0){
  b=b.slice(0,at)+infoBody+'\n'+b.slice(at);
}

/* 替换顶部项目条 */
const start=b.indexOf("  bar.innerHTML = '<div class=\"panel-h\">'");
const end=b.indexOf("  if(tip) tip.innerHTML = '当前项目：<b>'");
if(start<0||end<0) throw new Error('bar anchors');
const newBar =
"  bar.innerHTML = '<div class=\"panel-h\">'\n"
+ "    + '<h3>' + pnEsc(p.name) + ' <span class=\"tg ' + st.cls + '\">' + st.label + '</span>'\n"
+ "      + ' <span class=\"tg tg-n\">' + plans.length + ' 个计划 / ' + batchN + ' 个批次</span></h3>'\n"
+ "    + '<div class=\"flex\" style=\"gap:8px\">'\n"
+ "    +   (canCreate ? '<button class=\"btn btn-p btn-xs\" onclick=\"openPlanNew()\">＋ 创建计划</button>' : '')\n"
+ "    +   '<button class=\"btn btn-g btn-xs\" onclick=\"goPlanAll()\">查看全部计划</button>'\n"
+ "    + '</div>'\n"
+ "    + '</div><div class=\"panel-b\">'\n"
+ "    + planProjInfo(p)\n"
+ "    + (blocked ? '<div class=\"note b\" style=\"margin-top:12px\">该项目当前为「' + st.label + '」，审批通过后才可补充计划明细。</div>' : '')\n"
+ "    + (ended ? '<div class=\"note b\" style=\"margin-top:12px\">该项目已终止，计划与批次仅可查看，不可新增。</div>' : '')\n"
+ "    + (canEdit && !plans.length && briefs ? '<div class=\"note b\" style=\"margin-top:12px\">报批时创建的批次计划：<b>' + briefs + '</b>。按计划逐个补充执行配置，补完再推送服务商。</div>' : '')\n"
+ "    + (canEdit && plans.length ? '<div class=\"note b\" style=\"margin-top:12px\">按计划逐个点「补充配置」完善执行信息（券名称、面额、门槛、数量、有效期等），全部完成后才可推送服务商。</div>' : '')\n"
+ "    + '</div>';\n";
b=b.slice(0,start)+newBar+b.slice(end);
fs.writeFileSync(R+'js/pages/plan-batch.js', b, 'utf8');
console.log('ok plan-batch bar');

/* ---------- 3. 配置抽屉：去掉所属项目 ---------- */
let c=fs.readFileSync(R+'js/components/config-drawer.js','utf8');
const projRow="      + '<div><span>所属项目</span><b>' + pnEsc(proj.name || '—') + '</b></div>'\n";
if(c.indexOf(projRow)>=0){ c=c.replace(projRow,''); fs.writeFileSync(R+'js/components/config-drawer.js', c,'utf8'); console.log('ok remove 所属项目'); }
else console.log('!! 所属项目 row not found');

/* ---------- 4. CSS + 项目目标默认值 ---------- */
fs.appendFileSync(R+'css/components.css', fs.readFileSync(A+'plan-info.css','utf8'), 'utf8');

let pj=fs.readFileSync(R+'js/data/projects.js','utf8');
if(pj.indexOf("p.goal")<0){
  pj=pj.replace("/* 计划归属的项目（用于「计划与批次」按项目看） */","/* 项目目标：创建页填写，演示数据统一给一个默认值 */\nPROJECTS.forEach(function(p){ if(!p.goal) p.goal = '拉新 + 复购'; });\n\n/* 计划归属的项目（用于「计划与批次」按项目看） */");
  fs.writeFileSync(R+'js/data/projects.js', pj, 'utf8');
  console.log('ok project goal');
}

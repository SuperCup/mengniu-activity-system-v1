const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 1) 顶部「总部端 UI 原型…」免责条整块删除 */
let h=fs.readFileSync(R+'index.html','utf8');
h=h.replace(/\s*<div class="hintbar">[\s\S]*?<\/div>\n/, '\n');
h=h.replace('本页需要启用 JavaScript 才能查看原型。','本页需要启用 JavaScript 才能正常显示。');
fs.writeFileSync(R+'index.html',h,'utf8');
console.log('index hintbar removed:', h.indexOf('hintbar')<0);

/* 2) 新项目顶部两状态说明块删除 */
let c=fs.readFileSync(R+'js/pages/project-create.js','utf8');
const a=c.indexOf('<!-- 两个状态：提交审批 / 审批通过后补充 -->');
const b=c.indexOf('<!-- 一、基本信息 -->');
if(a<0||b<0) throw new Error('create anchors');
c=c.slice(0,a)+c.slice(b);
fs.writeFileSync(R+'js/pages/project-create.js',c,'utf8');
console.log('create stagebar removed:', c.indexOf('stagebar')<0);

/* 3) 登录页「待确认（清单第 19 项）」说明删除，跳过链接去掉“原型演示” */
let l=fs.readFileSync(R+'login.html','utf8');
l=l.replace(/\s*<div class="note">[\s\S]*?<\/div>\n/, '\n');
l=l.replace('原型演示：暂不登录，直接进入','暂不登录，直接进入');
fs.writeFileSync(R+'login.html',l,'utf8');
console.log('login note removed:', l.indexOf('待确认（清单第 19 项）')<0);

/* 4) 其他面向用户的“示意 / 示例”提法 */
let v=fs.readFileSync(R+'js/pages/vendor-portal.js','utf8');
v=v.replace(' * pages/vendor-portal.js — 服务商操作页（示意）',' * pages/vendor-portal.js — 服务商操作页');
v=v.replace(' * 服务商端不在总部端原型的交付范围，此处仅示意确认 / 提报动作。',' * 服务商端与总部端分离，此处展示邮件链接进入后的确认 / 提报动作。');
v=v.replace('<div class="st">邮件示意</div>','<div class="st">邮件通知</div>');
v=v.replace('crumb: "示例 / 服务商操作页"','crumb: "服务商协作 / 服务商操作页"');
v=v.replace('group: "示例"','group: "服务商协作"');
fs.writeFileSync(R+'js/pages/vendor-portal.js',v,'utf8');
console.log('vendor portal toned down');

let rr=fs.readFileSync(R+'js/core/router.js','utf8');
rr=rr.replace("MT.toast('帮助文档：一期原型说明见项目根目录 README.md')", "MT.toast('帮助文档：见项目根目录 README.md')");
fs.writeFileSync(R+'js/core/router.js',rr,'utf8');
console.log('help toast cleaned');

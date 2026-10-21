
const fs=require('fs');
const S='D:/Project/蒙牛-原型-ds-harness/_analysis/shots/';
const idx=fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/hq-console/index.html','utf8');
function view(id){ const h=fs.readFileSync(S+id+'.dom.html','utf8'); const i=h.indexOf('id="'+id+'"'); const j=h.indexOf('<div class="view', i+10); return h.slice(i, j<0?undefined:j); }
function c(s,re){ return (s.match(re)||[]).length; }

console.log('① 系统名称 MTL 出现次数：', c(idx+/MTL/.test(idx)?'MTL':'',/MTL/g));
console.log('   顶栏品牌：', /mn-brand-t">蒙牛活动管理平台/.test(idx)?'蒙牛活动管理平台':'?');

console.log('② 项目创建 两个状态：', /两个状态/.test(view('v-create'))?'有':'无', '| 无计划表：', c(view('v-create'),/id="planBody"/g)===0);

console.log('③ 顶栏搜索：', /mn-search|searchTip|mtlSearch/.test(idx)?'仍存在':'已移除');

const mg=view('v-manage');
console.log('④ 项目管理：卡片', c(mg,/<div class="pcard"/g), '| 状态标签', c(mg,/nmst/g), '| 保存时间', c(mg,/class="savet"/g), '| 进度标签', c(mg,/进度：/g), '| 活动ID字样', c(mg,/活动 ID：/g), '| 说明文字', c(mg,/class="noa"/g));
console.log('   状态项（含全部）：', c(mg,/projState\(/g), '| 计数', (/<span class="c">(\d+)<\/span>全部/).exec(mg.replace(/\s+/g,''))?1:0);
console.log('   流程说明按钮：', /openFlow\(\)/.test(mg)?'有':'无');

const pl=view('v-plan');
console.log('⑥ 计划页（菜单进入）：项目条隐藏', /id="planProjBar"[^>]*display:\s*none/.test(pl), '| 提示', (/id="planScopeTip">([^<]*)/.exec(pl)||[])[1]);

const ap=view('v-approve');
const ad=view('v-admin');
console.log('⑦ 审批页内嵌详情：', /审批详情/.test(ap)?'有':'无', '| 系统管理页签', c(ad,/class="atab/g), '| 权限矩阵外露', c(ad,/data-menu=/g));

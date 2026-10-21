
const fs=require('fs');
const S='D:/Project/蒙牛-原型-ds-harness/_analysis/shots/';
function view(html,id){ const i=html.indexOf('id="'+id+'"'); if(i<0)return ''; const j=html.indexOf('<div class="view', i+10); return html.slice(i, j<0?undefined:j); }
function c(s,re){ return (s.match(re)||[]).length; }

const cr=view(fs.readFileSync(S+'v-create.dom.html','utf8'),'v-create');
console.log('== 项目创建 ==');
console.log('两状态说明:', cr.indexOf('两个状态')>=0?'yes':'no');
console.log('残留批次计划表(planBody):', c(cr,/id="planBody"/g), '(应为 0)');
console.log('残留“第二段”:', c(cr,/第二段/g), '(应为 0)');
console.log('下一节提示:', cr.indexOf('提交后的下一步')>=0?'yes':'no');
console.log('服务商联系人自动带出:', /id="projContactName">([^<]*)/.exec(cr)[1]);

const mg=view(fs.readFileSync(S+'v-manage.dom.html','utf8'),'v-manage');
console.log('== 项目管理 ==');
console.log('卡片:', c(mg,/<div class="pcard"/g), '状态标签:', c(mg,/nmst/g), '保存时间:', c(mg,/class="savet"/g));
console.log('进度标签:', c(mg,/进度：/g));
console.log('顶部状态项:', c(mg,/projState\(/g));
console.log('文案含 MTL:', /MTL/.test(mg)?'有':'无');

const ad=view(fs.readFileSync(S+'v-admin.dom.html','utf8'),'v-admin');
console.log('== 系统管理 ==');
console.log('页签:', c(ad,/class="atab/g), '角色行:', c(ad,/openRole\(/g), '服务商行:', c(ad,/openVs\(\d/g));
console.log('隐藏的页签容器:', c(ad,/id="admTab-(org|vendor)" style="display:none"/g));

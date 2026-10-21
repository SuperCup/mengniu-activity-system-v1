
const fs=require('fs');
const S='D:/Project/蒙牛-原型-ds-harness/_analysis/shots/';
function view(html,id){
  const i=html.indexOf('id="'+id+'"');
  if(i<0) return '';
  const j=html.indexOf('<div class="view', i+10);
  return html.slice(i, j<0?undefined:j);
}
function count(s,re){ return (s.match(re)||[]).length; }
const m=view(fs.readFileSync(S+'v-manage.dom.html','utf8'),'v-manage');
console.log('== 项目管理（仅该视图）==');
console.log('卡片数:', count(m,/<div class="pcard"/g));
console.log('标题状态标签:', count(m,/nmst/g));
console.log('保存时间(左下):', count(m,/class="savet"/g));
console.log('执行进度标签:', count(m,/进度：/g));
console.log('noa 说明:', count(m,/class="noa"/g));
console.log('活动 ID 字样:', count(m,/活动 ID：/g));
const a=view(fs.readFileSync(S+'v-admin.dom.html','utf8'),'v-admin');
console.log('== 系统管理 ==');
console.log('页签数:', count(a,/class="atab/g));
console.log('角色行:', count(a,/openRole\(/g));
console.log('权限矩阵行(应在抽屉):', count(a,/data-menu=/g));
const ap=view(fs.readFileSync(S+'v-approve.dom.html','utf8'),'v-approve');
console.log('== 项目审批 ==');
console.log('卡片数:', count(ap,/<div class="pcard"/g));
console.log('内嵌详情:', ap.indexOf('审批详情')>=0?'有':'无');

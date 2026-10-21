
const fs=require('fs');
const S='D:/Project/蒙牛-原型-ds-harness/_analysis/shots/';
function view(html,id){ const i=html.indexOf('id="'+id+'"'); if(i<0)return ''; const j=html.indexOf('<div class="view', i+10); return html.slice(i, j<0?undefined:j); }
['projplans','approveplans'].forEach(function(k){
  const h=fs.readFileSync(S+'p-'+k+'.html','utf8');
  const v=view(h,'v-plan');
  const bar=/id="planProjBar"([^>]*)>([\s\S]{0,1200}?)<\/div><\/div>/.exec(v);
  console.log('== '+k+' ==');
  console.log('bar attrs:', /id="planProjBar"[^>]*style="([^"]*)"/.exec(v) ? /id="planProjBar"[^>]*style="([^"]*)"/.exec(v)[1] : '(no style)');
  const tip=/id="planScopeTip">([\s\S]*?)<\/span>/.exec(v);
  console.log('scopeTip:', tip ? tip[1].replace(/<[^>]+>/g,'') : '(none)');
  console.log('项目条含项目名:', v.indexOf('双节常温奶满减')>=0 || v.indexOf('元旦乳品满减')>=0 ? 'yes':'no');
  console.log('计划行数:', (v.match(/<td><b>ZS-HD/g)||[]).length);
  console.log('空态:', v.indexOf('暂无计划')>=0 ? 'yes':'no');
  console.log('审批门槛提示:', v.indexOf('审批通过后才可补充计划明细')>=0 ? 'yes':'no');
});
/* dw-role 内容 */
const r=fs.readFileSync(S+'p-role.html','utf8');
console.log('== dw-role ==');
console.log('菜单勾选行:', (r.match(/data-menu=/g)||[]).length);
console.log('数据范围选项:', (r.match(/<option value="本级及下级"/g)||[]).length);
/* dw-proj 内容 */
const d=fs.readFileSync(S+'p-projdetail.html','utf8');
console.log('== dw-proj ==');
console.log('含预算与PO:', d.indexOf('预算与 PO')>=0?'yes':'no');
console.log('含状态流转:', d.indexOf('状态流转')>=0?'yes':'no');
console.log('含计划与批次汇总:', d.indexOf('查看计划与批次')>=0?'yes':'no');

const fs=require('fs');
const S='D:/Project/蒙牛-原型-ds-harness/_analysis/shots/';
function g(v){ return fs.readFileSync(S+v+'.dom.html','utf8'); }
function all(re){ }
['v-plan','v-h5','v-manage'].forEach(function(v){
  const h=g(v);
  const m=h.match(/每页\s*\d+\s*条/g);
  console.log(v, '分页文案:', m ? m.join(' / ') : '(none)');
});
const p=g('v-plan');
const i=p.indexOf('id="planPager"');
console.log('planPager:', i<0?'缺':p.slice(i, i+320).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const c=g('v-create');
console.log('v-create 活动机制字段:', c.indexOf('活动机制（满减金额）')>=0);
console.log('v-create 第四节:', c.indexOf('四、计划概况')>=0, '第五节:', c.indexOf('第五')>=0 || c.indexOf('提交后的下一步')>=0);

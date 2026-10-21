

/* ---------- 已批准但未补配置的示例（0044 元旦乳品满减） ---------- */
PLANS[0].exec.mchAuth = '已核验';
PLANS[2].exec.mchAuth = '已核验';

PLANS.push({
  id:'PL-04', pid:'ZS-HD-202612-D',
  projectId:'MN-WX-202612-0044', proj:'MN-WX-202612-0044',
  name:'元旦常温奶满减', mech:'常温奶满 99 减 15', bat:'',
  s:'2026-12-28', e:'2027-01-05',
  ret:['重庆永辉超市有限公司'], sku:['特仑苏纯牛奶 250ml×12'],
  budget:0, coupon:'', face:0, thr:0, qty:0, limit:'', valid:'',
  retRows:[{ ret:'永辉超市', store:'永辉超市（重庆观音桥店）', prov:'重庆市', city:'重庆', mch:'1236057802' }],
  skuRows:[{ code:'6923644223456', name:'特仑苏纯牛奶 250ml×12', owner:'永辉超市' }],
  type:'voucher', exec:null, configState:'todo',
  assignee:'李雪', version:1, updatedAt:'2026-10-20 09:00',
  bstat:'', bqty:0, used:0, usedAmt:0
});

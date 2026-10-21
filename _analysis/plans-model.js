/* ---------- 模型扩展：活动类型 / 执行配置 / 配置状态 / 版本 ---------- */
PLANS.forEach(function(p){
  if(!p.projectId) p.projectId = p.proj || 'MN-WX-202612-0041';
  if(!p.proj) p.proj = p.projectId;
  if(p.version == null) p.version = 1;
  if(p.assignee == null) p.assignee = '李雪';
  if(p.configState == null) p.configState = 'todo';
  if(p.type == null) p.type = 'voucher';
});

/* 同一项目下三种不同类型的计划，便于验证按类型显字段 */
PLANS[0].type = 'voucher';
PLANS[1].type = 'fixed';
PLANS[2].type = 'discount';

/* 审批通过后补的执行配置示例：01 待补一项、02 已完整、03 待补一项 */
PLANS[0].exec = { name:'双节满减主推', mch:'1603482917', fund:'预充值', face:15, thr:99,
  pay:'微信支付', skuLimit:'指定商品', qty:9000, perLimit:2, risk:'关闭',
  notice:'每人限领 2 张，领取后 7 天内有效', savedAt:'2026-10-19 15:30' };
PLANS[1].exec = { name:'跨年场景承接', fund:'免充值', face:15, thr:99,
  pay:'微信支付', skuLimit:'不限商品', qty:7000, perJoin:1, risk:'关闭',
  notice:'活动期间每人参与 1 次，先到先得', mchAuth:'已核验', svc:'服务商已确认',
  savedAt:'2026-10-19 16:02' };
PLANS[2].exec = { name:'高端礼盒拉新', fund:'预充值', discount:8.5, cap:20, thr:129,
  pay:'微信支付', skuLimit:'指定商品', qty:5000, perJoin:1,
  notice:'折扣不与其他优惠叠加', savedAt:'2026-10-19 16:20' };

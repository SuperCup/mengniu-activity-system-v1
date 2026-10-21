
/* 计划归属与券信息：0044 下 4 个计划 = 4 个批次（一个计划对应一个批次） */
PLANS.forEach(function(x){
  if(x.id === 'PL-01' || x.id === 'PL-02' || x.id === 'PL-03' || x.id === 'PL-04'){
    x.projectId = 'MN-WX-202612-0044';
    x.proj = 'MN-WX-202612-0044';
  }
  if(x.coupon == null) x.coupon = '';
  if(!x.grant) x.grant = '领券';
});
PLANS[0].coupon = '双节常温奶满减券';
PLANS[1].coupon = '跨年常温奶满减券';
PLANS[2].coupon = '礼盒满减券';
PLANS[2].grant  = '过机立减';

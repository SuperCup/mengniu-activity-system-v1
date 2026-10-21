
/* =============================================================================
 * 演示数据补全：项目目标、服务商对接联系人 / 邮箱
 *   创建页只填服务商时联系人自动带出，列表与详情按同一口径展示
 * ========================================================================== */
PROJECTS.forEach(function(p){
  if(!p.goal) p.goal = '拉新 + 复购';
  if(!p.vendorContact || !p.vendorMail){
    var v = (window.VENDORS || []).filter(function(x){ return x.name === p.vendor; })[0];
    if(v && v.cms && v.cms[0]){
      if(!p.vendorContact) p.vendorContact = v.cms[0].n;
      if(!p.vendorMail)    p.vendorMail    = v.cms[0].e;
    }
  }
});

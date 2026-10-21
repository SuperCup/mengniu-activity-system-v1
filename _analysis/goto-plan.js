function gotoPlan(n){
  var list = (typeof planScoped === 'function') ? planScoped() : PLANS;
  var pages = Math.max(1, Math.ceil(list.length / PLAN_SIZE));
  if(n < 1 || n > pages) return;
  PLAN_PAGE = n;
  renderPlans();
}

function impOk(){
  var good = IMP.rows.filter(function(r){ return !r.__err.length; });
  if(!good.length){ MT.toast('没有可导入的有效行', 'err'); return; }

  var added = 0, dup = 0;
  if(IMP.type === 'ret'){
    good.forEach(function(r){
      if(PN.ret.some(function(x){ return x.store === r.store && x.ret === r.ret; })){ dup++; return; }
      PN.ret.push({ ret:r.ret, store:r.store, prov:r.prov, city:r.city, mch:r.mch, n:r.store });
      added++;
    });
  } else {
    good.forEach(function(r){
      if(PN.sku.some(function(x){ return x.code === r.code && x.owner === r.owner; })){ dup++; return; }
      PN.sku.push({ code:r.code, name:r.name, owner:r.owner, n:r.name });
      added++;
    });
  }

  if(typeof pnRender === 'function') pnRender();
  closeDrawer();
  /* 从计划抽屉进来的，导完回到计划抽屉，草稿不丢 */
  if(IMP.fromPlan){
    IMP.fromPlan = false;
    openDrawer('dw-plannew');
  }
  MT.toast('已导入 ' + added + ' 行' + (dup ? '，跳过重复 ' + dup + ' 行' : ''));
}

/** 取消导入：同样回到计划抽屉，已填内容保留 */
function impCancel(){
  closeDrawer();
  if(IMP.fromPlan){
    IMP.fromPlan = false;
    openDrawer('dw-plannew');
  }
}

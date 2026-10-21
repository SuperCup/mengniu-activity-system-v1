/* ---------- 支持 #v-xxx 直达，可带参数： #v-plan?projectId=..&planId=..&tab=config ---------- */
MT.parseHash = function(){
  var h = (location.hash || '').slice(1);
  var i = h.indexOf('?');
  var page = i < 0 ? h : h.slice(0, i);
  var q = {};
  if(i >= 0){
    h.slice(i + 1).split('&').forEach(function(kv){
      if(!kv) return;
      var at = kv.indexOf('=');
      var k = at < 0 ? kv : kv.slice(0, at);
      var v = at < 0 ? '' : kv.slice(at + 1);
      try{ q[decodeURIComponent(k)] = decodeURIComponent(v); }catch(e){ q[k] = v; }
    });
  }
  return { page: page, q: q };
};

MT.fromHash = function(def){
  var page = MT.parseHash().page;
  return MT.pages[page] ? page : def;
};

/** 把当前视图与上下文写进地址栏，刷新后仍能回到同一页面 / 同一计划 */
MT.setHash = function(page, q){
  var s = page || '';
  var kv = [];
  Object.keys(q || {}).forEach(function(k){
    if(q[k] === '' || q[k] == null) return;
    kv.push(encodeURIComponent(k) + '=' + encodeURIComponent(q[k]));
  });
  if(kv.length) s += '?' + kv.join('&');
  if(location.hash.slice(1) !== s) history.replaceState(null, '', '#' + s);
};

window.addEventListener('hashchange', function(){
  var h = MT.parseHash();
  if(MT.pages[h.page] && h.page !== MT.currentView) go(h.page);
  if(h.q && (h.q.planId || h.q.projectId) && typeof wfOpenFromRoute === 'function'){
    wfOpenFromRoute(h.q);
  }
});

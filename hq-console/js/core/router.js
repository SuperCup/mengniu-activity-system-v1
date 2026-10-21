/* =============================================================================
 * core/router.js — 页面注册表、左侧导航、视图切换、全局搜索
 * 每个业务模块用 MT.definePage 注册自己的模板与初始化逻辑（见 js/pages/）。
 * ========================================================================== */
window.MT = window.MT || {};

/**
 * 注册一个业务模块（视图）
 * @param {object} def
 * @param {string} def.id       视图 id，如 'v-create'
 * @param {string} def.title    名称
 * @param {string} def.crumb    面包屑文案，如 '项目管理 / 项目创建'
 * @param {string} def.group    左侧导航分组
 * @param {string} [def.badge]  导航角标
 * @param {boolean} [def.new]   显示 NEW 标
 * @param {boolean} [def.nav]   是否出现在左侧导航（默认 true）
 * @param {function} def.template  返回该模块 HTML 字符串
 * @param {function} [def.init]    模块挂载后执行
 */
MT.definePage = function(def){
  MT.pages[def.id] = def;
  if(def.nav !== false) MT.navOrder.push(def.id);
};

/** 把所有模块模板挂到 #viewRoot（隐藏状态，由 .on 控制显示） */
MT.mountPages = function(){
  var host = document.getElementById('viewRoot');
  if(!host) return;
  host.innerHTML = Object.keys(MT.pages).map(function(k){
    var p = MT.pages[k];
    return p.template();
  }).join('\n');
};

/** 渲染左侧导航：按 group 归组 */
MT.renderSider = function(){
  var box = document.getElementById('sider');
  if(!box) return;
  var groups = [];
  var byGroup = {};
  MT.navOrder.forEach(function(id){
    var p = MT.pages[id];
    if(!p) return;
    var g = p.group || '业务模块';
    if(!byGroup[g]){ byGroup[g] = []; groups.push(g); }
    byGroup[g].push(p);
  });
  var h = '';
  groups.forEach(function(g){
    h += '<div class="grp">' + g + '</div>';
    byGroup[g].forEach(function(p){
      h += '<a class="item" data-view="' + p.id + '" data-crumb="' + (p.crumb || p.title) + '" onclick="go(\'' + p.id + '\',this)">'
        + '<span class="ic">' + (MT.ICONS[p.id] || '') + '</span>' + p.title
        + (p.badge ? '<span class="badge">' + p.badge + '</span>' : '')
        + (p.isNew ? '<span class="new">NEW</span>' : '')
        + '</a>';
    });
  });
  box.innerHTML = h;
};

/** 视图切换 */
function go(id, el){
  var target = document.getElementById(id);
  if(!target) return;
  var vs = document.querySelectorAll('.view');
  for(var i=0;i<vs.length;i++) vs[i].classList.remove('on');
  target.classList.add('on');

  var as = document.querySelectorAll('.sider a.item');
  for(var j=0;j<as.length;j++) as[j].classList.toggle('on', as[j].getAttribute('data-view') === id);

  var p = MT.pages[id];
  var cb = document.getElementById('crumb');
  if(cb){
    var crumb = (p && p.crumb) ? p.crumb : (p ? p.title : '');
    var parts = crumb.split('/').map(function(t){ return t.trim(); }).filter(Boolean);
    cb.innerHTML = parts.map(function(t, i){
      return i === parts.length - 1 ? '<b>' + t + '</b>' : t;
    }).join('<span class="sp">/</span>');
  }

  /* 计划与批次：菜单进入看全部，由项目管理进入看当前项目 */
  if(id === 'v-plan'){
    if(typeof PLAN_SCOPE !== 'undefined' && !PLAN_SCOPE_KEEP) PLAN_SCOPE = null;
    if(typeof renderPlanScope === 'function') renderPlanScope();
  }

  /* 数据看板每次进入重算指标，保证与计划/批次数据同源 */
  if(id === 'v-board' && typeof renderDbAll === 'function'){ try{ renderDbAll(); }catch(e){} }

  /* 系统日志每次进入按当前筛选重绘 */
  if(id === 'v-log' && typeof renderLogs === 'function'){ renderLogs(); }

  MT.currentView = id;
  if(MT.parseHash().page !== id) MT.setHash(id, {});

  /* 切换视图后高度变化，平滑滚动会被打断，改为即时回顶 */
  window.scrollTo(0,0);
  requestAnimationFrame(function(){
    window.scrollTo(0,0);
    if(document.documentElement) document.documentElement.scrollTop = 0;
    if(document.body) document.body.scrollTop = 0;
  });
}

/** 流程/步骤条内的单选切换 */
function pick(el){
  var ps = el.parentNode.querySelectorAll('.s');
  for(var i=0;i<ps.length;i++) ps[i].classList.remove('on');
  el.classList.add('on');
}

function mnHelp(){
  MT.toast('帮助文档：见项目根目录 README.md');
}

function logoutToDing(){
  sessionStorage.removeItem('mn_ding_login');
  location.href = 'login.html';
}

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

/* ---------- 侧边栏图标：统一 16px 线性图标，继承当前文字色 ---------- */
MT.ICONS = {
  'v-home': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2.2" y="2.2" width="5" height="5" rx="1"/><rect x="8.8" y="2.2" width="5" height="5" rx="1"/><rect x="2.2" y="8.8" width="5" height="5" rx="1"/><rect x="8.8" y="8.8" width="5" height="5" rx="1"/></svg>',
  'v-create': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2.2H4.4a1.2 1.2 0 0 0-1.2 1.2v9.2a1.2 1.2 0 0 0 1.2 1.2h7.2a1.2 1.2 0 0 0 1.2-1.2V6"/><path d="M11.6 1.8v4h4"/><path d="M8 8.4v3.2M6.4 10h3.2"/></svg>',
  'v-approve': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="5.8"/><path d="m5.2 8.1 2 2 3.6-3.9"/></svg>',
  'v-manage': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.2 5.6a1.2 1.2 0 0 1 1.2-1.2h3l1.3 1.6h4.9a1.2 1.2 0 0 1 1.2 1.2v5.4a1.2 1.2 0 0 1-1.2 1.2H3.4a1.2 1.2 0 0 1-1.2-1.2z"/></svg>',
  'v-plan': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="m8 1.9 5.4 2.6L8 7.1 2.6 4.5z"/><path d="m2.6 8 5.4 2.6L13.4 8"/><path d="m2.6 11.5 5.4 2.6 5.4-2.6"/></svg>',
  'v-h5': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4.2" y="1.8" width="7.6" height="12.4" rx="1.6"/><path d="M6.8 3.6h2.4"/><path d="M7 11.4h2"/></svg>',
  'v-board': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.4 13.6V2.6"/><path d="M2.4 13.6h11.2"/><rect x="4.6" y="8.4" width="2.2" height="3.4" rx="0.6"/><rect x="8.4" y="5.4" width="2.2" height="6.4" rx="0.6"/><rect x="11.4" y="9.8" width="0" height="0"/></svg>',
  'v-admin': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2.1"/><path d="M12.9 9.6a1 1 0 0 0 .2 1.1l.1.1a1.2 1.2 0 1 1-1.7 1.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9v.2a1.2 1.2 0 1 1-2.4 0v-.1a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1.2 1.2 0 1 1-1.7-1.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H2.9a1.2 1.2 0 1 1 0-2.4h.1a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1.2 1.2 0 1 1 1.7-1.7l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V2.9a1.2 1.2 0 1 1 2.4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.2 1.2 0 1 1 1.7 1.7l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6h.2a1.2 1.2 0 1 1 0 2.4h-.1a1 1 0 0 0-.9.6z"/></svg>',
  'v-log': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2.6" y="2" width="10.8" height="12" rx="1.4"/><path d="M5.2 5.6h5.6M5.2 8h5.6M5.2 10.4h3.4"/></svg>',
  'v-vendor': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1.8" y="3" width="12.4" height="8.2" rx="1.2"/><path d="M5.6 13.6h4.8"/><path d="M8 11.2v2.4"/></svg>'
};

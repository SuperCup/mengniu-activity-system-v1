/* =============================================================================
 * app.js — 应用启动
 * 顺序：注入浮层 → 注入各模块视图 → 渲染左侧导航 → 初始化各模块数据 → 进入默认视图
 * ========================================================================== */
(function(){
  'use strict';

  /** 单个模块初始化失败不影响其它模块（原型演示容错） */
  function safe(fn, name){
    if(typeof fn !== 'function') return;
    try{ fn(); }
    catch(e){ console.warn('[蒙牛活动管理平台] 模块初始化失败：' + name, e); }
  }

  /* 原型演示容错：脚本异常不再静默，直接显示在页面顶部，便于回归时定位 */
  window.addEventListener('error', function(e){
    var bar = document.getElementById('mnErr');
    if(!bar){
      bar = document.createElement('div');
      bar.id = 'mnErr';
      bar.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:999;background:#C0392B;color:#fff;font:12px/1.7 sans-serif;padding:6px 12px';
      document.body.appendChild(bar);
    }
    bar.textContent = '脚本错误：' + (e.message || e.error) + '  @' + (e.filename || '').split('/').pop() + ':' + e.lineno;
  });

  function boot(){
    /* 先装载本地数据（有则覆盖种子，没有则落库），再渲染任何视图 */
    safe(function(){ MT.store.load(); }, "store.load");

    MT.mountDrawers();   // 抽屉 / 浮层（js/components/*.js 注册）
    MT.mountPages();     // 业务模块视图（js/pages/*.js 注册）
    MT.renderSider();    // 左侧导航（依据 MT.definePage 注册信息生成）

    /* 各模块的数据渲染：与源型一致，启动时一次性灌入，切换视图不再重复计算 */
    safe(window.renderTodos,        'renderTodos');
    safe(window.renderVendors,      'renderVendors');
    safe(window.initProjVendor,     'initProjVendor');
    safe(window.renderProjBrief,    'renderProjBrief');
    safe(window.renderPlanScope,    'renderPlanScope');
    safe(window.renderPlans,        'renderPlans');
    safe(window.renderProjCards,    'renderProjCards');
    safe(window.renderApproveList,  'renderApproveList');
    safe(window.renderRoles,        'renderRoles');
    safe(window.renderOrgs,         'renderOrgs');
    safe(window.renderDbAll,        'renderDbAll');

    /* 默认进入「计划与批次」（与 V5 一致）；带 #v-xxx 时直达对应模块 */
    go(MT.fromHash('v-plan'));

    /* 带上下文进入：#v-plan?projectId=..&planId=..&tab=config → 定位到原计划 */
    var q = MT.parseHash().q;
    if(q && (q.planId || q.projectId) && typeof wfOpenFromRoute === 'function'){
      setTimeout(function(){ wfOpenFromRoute(q); }, 120);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

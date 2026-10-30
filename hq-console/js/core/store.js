/* =============================================================================
 * core/store.js — 统一本地数据仓库（localStorage 持久化）
 * 职责：
 *   1. 启动时装载：有本地数据则覆盖种子数据，没有则把当前种子数据写入本地
 *   2. 任何业务动作后 save()，刷新不丢记录
 *   3. schemaVersion + 旧数据迁移；解析/写入失败不覆盖原数据，只提示
 *   4. 「重置演示数据」需用户明确点击，不在启动时自动重置
 * ========================================================================== */
window.MT = window.MT || {};

MT.store = (function(){
  var KEY = 'mn_hq_store_v2';
  var SCHEMA = 10;

  var state = { ready:false, writable:true, err:'' };

  function lsOk(){
    try{
      var t = '__mn_t__';
      localStorage.setItem(t, '1');
      localStorage.removeItem(t);
      return true;
    }catch(e){ return false; }
  }

  function plain(x){ return JSON.parse(JSON.stringify(x)); }

  function snapshot(){
    return {
      v: SCHEMA,
      at: new Date().toISOString(),
      projects: plain(window.PROJECTS || []),
      plans: plain(window.PLANS || []),
      logs: plain((window.SYS_LOGS || []).slice(0, 500)),
      stores: plain(window.RET_DB || []),
      skus: plain(window.SKU_DB || []),
      miniApps: plain(window.MINI_APPS || []),
      miniPush: plain(window.MINI_PUSH || [])
    };
  }

  /** 旧版本数据迁移：补齐新增字段，不删除历史字段 */
  function migrate(data){
    var notes = [];
    (data.plans || []).forEach(function(p){
      if(!p.projectId && p.proj){ p.projectId = p.proj; }
      if(!p.proj && p.projectId){ p.proj = p.projectId; }
      if(!p.type) p.type = 'voucher';
      if(!p.exec) p.exec = null;
      if(p.version == null) p.version = 1;
      notes.push(p.id);
    });
    (data.skus || []).forEach(function(x){
      if(!x.rets){
        x.rets = [];
        if(x.ret) String(x.ret).split(/[、,，\/]/).forEach(function(v){ v = v.trim(); if(v) x.rets.push(v); });
      }
      delete x.ret; delete x.brand; delete x.cat;
    });
    (data.projects || []).forEach(function(p){
      /* V7.3：旧的 7 状态映射到「4 节点 / 11 状态」 */
      var OLD2NEW = {
        draft:'editing', pending:'approving', approved:'passed', rejected:'rejected',
        confirmed:'to_confirm', running:'running', stopped:'finished'
      };
      if(OLD2NEW[p.state]) p.state = OLD2NEW[p.state];
      if((!p.vendorContact || !p.vendorMail) && typeof vendorByName === 'function'){
        var vend = vendorByName(p.vendor);
        var cms = vend && vend.cms && vend.cms[0];
        if(cms){
          if(!p.vendorContact) p.vendorContact = cms.n;
          if(!p.vendorMail) p.vendorMail = cms.e;
        }
      }
      /* V7.2：补齐创建人 / 审批人 / 负责人 / 归属商户号 */
      var people = (window.PROJ_PEOPLE || {})[p.id];
      if(people){
        if(!p.creator && typeof contactById === 'function'){
          var cr = contactById(people.creator);
          if(cr) p.creator = { id:cr.id, name:cr.name, dept:cr.dept, phone:cr.phone };
        }
        if(!p.ownerUser && typeof contactById === 'function'){
          var ow = contactById(people.owner);
          if(ow) p.ownerUser = { id:ow.id, name:ow.name, dept:ow.dept, phone:ow.phone };
        }
        if(!Array.isArray(p.approvers)){
          p.approvers = (people.approvers || []).map(function(id){
            var c = (typeof contactById === 'function') ? contactById(id) : null;
            return c ? { id:c.id, name:c.name, dept:c.dept, title:c.title } : null;
          }).filter(Boolean);
        }
      }
      if(!p.vendorMch && typeof vendorMch === 'function') p.vendorMch = vendorMch(p.vendor) || '';
      if(p.coupon == null) p.coupon = p.bat || '';
      if(!p.grant) p.grant = '领券';
      if(!p.version) p.version = 1;
      if(!Array.isArray(p.planBrief)) p.planBrief = [];
      if(p.rejectLog == null) p.rejectLog = [];
      /* 批次名称 → 券名称；补发券方式 */
      p.planBrief.forEach(function(b){
        if(b.coupon == null) b.coupon = b.bat || b.name || '';
        if(!b.grant) b.grant = '领券';
        delete b.bat;
      });
    });
    /* 元旦项目补多条待完善计划，便于验证配置工作台 */
    if(Array.isArray(window.DEMO_TODO_PLANS)){
      if(!Array.isArray(data.plans)) data.plans = [];
      window.DEMO_TODO_PLANS.forEach(function(seed){
        if(!data.plans.some(function(p){ return p.id === seed.id; })){
          data.plans.push(JSON.parse(JSON.stringify(seed)));
        }
      });
    }
    return notes;
  }

  function hydrate(data){
    if(!data || typeof data !== 'object') return false;
    if(data.v !== SCHEMA){
      migrate(data);
      console.info('[蒙牛活动管理平台] 本地数据已从 v' + data.v + ' 迁移到 v' + SCHEMA);
    }
    if(Array.isArray(data.projects) && data.projects.length){
      window.PROJECTS.length = 0;
      data.projects.forEach(function(p){ window.PROJECTS.push(p); });
    }
    if(Array.isArray(data.plans) && data.plans.length){
      window.PLANS.length = 0;
      data.plans.forEach(function(p){ window.PLANS.push(p); });
    }
    if(Array.isArray(data.logs) && data.logs.length){
      window.SYS_LOGS.length = 0;
      data.logs.forEach(function(r){ window.SYS_LOGS.push(r); });
    }
    if(Array.isArray(data.stores) && data.stores.length){
      window.RET_DB.length = 0;
      data.stores.forEach(function(s){ window.RET_DB.push(s); });
    }
    if(Array.isArray(data.skus) && data.skus.length){
      window.SKU_DB.length = 0;
      data.skus.forEach(function(s){ window.SKU_DB.push(s); });
    }
    /* 发券渠道固定为单一「蒙牛会员服务中心」，不再从本地缓存恢复旧渠道列表 */
    if(Array.isArray(data.miniPush) && Array.isArray(window.MINI_PUSH)){
      window.MINI_PUSH.length = 0;
      data.miniPush.forEach(function(x){ window.MINI_PUSH.push(x); });
    }
    return true;
  }

  function save(){
    if(!state.writable || !state.ready) return false;
    try{
      localStorage.setItem(KEY, JSON.stringify(snapshot()));
      return true;
    }catch(e){
      state.writable = false;
      state.err = e.message || String(e);
      /* 本地存储受限时静默降级为内存态，不再在页面顶部提示 */
      return false;
    }
  }

  function load(){
    if(!lsOk()){
      state.ready = true; state.writable = false;
      state.err = '浏览器限制本地存储';
      /* 本地存储受限时静默降级为内存态，不再在页面顶部提示 */
      return false;
    }
    var raw = null;
    try{ raw = localStorage.getItem(KEY); }catch(e){ raw = null; }

    if(!raw){
      state.ready = true;
      save();                 // 首次进入：把种子数据落库
      return false;
    }
    var data;
    try{
      data = JSON.parse(raw);
    }catch(e){
      /* 解析失败：保留损坏数据原样，不覆盖，提示用户手动重置 */
      state.ready = true; state.writable = false;
      state.err = '本地数据解析失败';
      storageNotice('本地数据解析失败，已按示例数据运行且不会覆盖原文件；可在「系统管理 → 重置演示数据」恢复');
      return false;
    }
    state.ready = true;
    var used = hydrate(data);
    if(used) save();          // 迁移后回写
    return used;
  }

  function reset(){
    try{ localStorage.removeItem(KEY); }catch(e){}
    location.reload();
  }

  function info(){
    var size = 0;
    try{ size = (localStorage.getItem(KEY) || '').length; }catch(e){}
    return { schema: SCHEMA, ready: state.ready, writable: state.writable, err: state.err, bytes: size };
  }

  return { load:load, save:save, reset:reset, info:info, migrate:migrate, KEY:KEY };
})();

/** 顶部中性提示条：只出现一次，可关闭；不遮挡内容、不弹红框 */
function storageNotice(msg){
  if(document.getElementById('mnStoreWarn')) return;
  var host = document.querySelector('.main') || document.body;
  var bar = document.createElement('div');
  bar.id = 'mnStoreWarn';
  bar.className = 'mn-warnbar';
  bar.innerHTML = '<span>' + msg + '</span>'
    + '<a class="x" onclick="this.parentNode.remove()">关闭</a>';
  host.insertBefore(bar, host.firstChild);
}

/* 业务动作统一入口：改完内存后调用，避免每个动作自己拼存储 */
function mnPersist(){ MT.store.save(); }

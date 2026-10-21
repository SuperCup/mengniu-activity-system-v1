/* =============================================================================
 * core/drawer.js — 抽屉与遮罩
 * 浮层组件把自己注册到 MT.drawers，启动时统一挂载到 #layerRoot。
 * ========================================================================== */
window.MT = window.MT || {};

/** 注册一个浮层（抽屉 / 弹窗）：template 返回 HTML 字符串 */
MT.defineDrawer = function(id, template){
  MT.drawers[id] = { id: id, template: template };
};

/** 启动时把所有浮层模板注入页面 */
MT.mountDrawers = function(){
  var host = document.getElementById('layerRoot');
  if(!host) return;
  var html = '<div class="mask" id="mask" onclick="closeDrawer()"></div>';
  Object.keys(MT.drawers).forEach(function(k){ html += MT.drawers[k].template(); });
  host.innerHTML = html;
};

function openDrawer(id){
  var d = document.getElementById(id);
  if(!d) return;
  /* 先关掉其它抽屉，避免叠加遮挡 */
  var all = document.querySelectorAll('.drawer.on');
  for(var i=0;i<all.length;i++) all[i].classList.remove('on');
  var m = document.getElementById('mask');
  if(m) m.classList.add('on');
  d.classList.add('on');
  document.body.style.overflow = 'hidden';
  if(id === 'dw-page'){
    document.querySelectorAll('#dw-page #blist input[type=checkbox]').forEach(function(i){ if(!i.disabled) i.checked = false; });
    var pv = document.getElementById('pvList');
    if(pv) pv.innerHTML = '';
    if(typeof refresh === 'function') refresh();
  }
}

function closeDrawer(){
  var ds = document.querySelectorAll('.drawer.on');
  for(var i=0;i<ds.length;i++) ds[i].classList.remove('on');
  var m = document.getElementById('mask');
  if(m) m.classList.remove('on');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){
    if(typeof closePick === 'function') closePick();
    closeDrawer();
  }
});

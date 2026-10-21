
const fs=require('fs');
const ROOT='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 1) router：支持 #v-xxx 直达（便于分享与回归截图） */
let r=fs.readFileSync(ROOT+'js/core/router.js','utf8');
if(r.indexOf('MT.currentView')<0){
  r=r.replace("  /* 切换视图后高度变化，平滑滚动会被打断，改为即时回顶 */",
    "  MT.currentView = id;\n  if(location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);\n\n  /* 切换视图后高度变化，平滑滚动会被打断，改为即时回顶 */");
  r += "\n/* ---------- 支持 #v-xxx 直达 ---------- */\n"
     + "MT.fromHash = function(def){\n"
     + "  var h = (location.hash || '').slice(1);\n"
     + "  return MT.pages[h] ? h : def;\n"
     + "};\n"
     + "window.addEventListener('hashchange', function(){\n"
     + "  var h = (location.hash || '').slice(1);\n"
     + "  if(MT.pages[h] && h !== MT.currentView) go(h);\n"
     + "});\n";
  fs.writeFileSync(ROOT+'js/core/router.js', r, 'utf8');
  console.log('router patched');
}

/* 2) app：启动时按 hash 选择默认视图；捕获脚本异常并显性提示 */
let a=fs.readFileSync(ROOT+'js/app.js','utf8');
if(a.indexOf('MT.fromHash')<0){
  a=a.replace("    go('v-plan');        // 默认进入「计划与批次」（与 V5 一致）",
    "    /* 默认进入「计划与批次」（与 V5 一致）；带 #v-xxx 时直达对应模块 */\n"
    + "    go(MT.fromHash('v-plan'));");
  a=a.replace("  function boot(){",
    "  /* 原型演示容错：脚本异常不再静默，直接显示在页面顶部，便于回归时定位 */\n"
    + "  window.addEventListener('error', function(e){\n"
    + "    var bar = document.getElementById('mtlErr');\n"
    + "    if(!bar){\n"
    + "      bar = document.createElement('div');\n"
    + "      bar.id = 'mtlErr';\n"
    + "      bar.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:999;background:#C0392B;color:#fff;font:12px/1.7 sans-serif;padding:6px 12px';\n"
    + "      document.body.appendChild(bar);\n"
    + "    }\n"
    + "    bar.textContent = '脚本错误：' + (e.message || e.error) + '  @' + (e.filename || '').split('/').pop() + ':' + e.lineno;\n"
    + "  });\n\n"
    + "  function boot(){");
  fs.writeFileSync(ROOT+'js/app.js', a, 'utf8');
  console.log('app patched');
}

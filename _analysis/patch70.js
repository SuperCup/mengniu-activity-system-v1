
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'js/core/store.js';
let s=fs.readFileSync(P,'utf8');

s=s.replace('var SCHEMA = 2;','var SCHEMA = 3;');

/* 迁移：计划概况字段改名（bat→coupon），补发券方式 */
s=s.replace("    (data.projects || []).forEach(function(p){\n      if(!p.version) p.version = 1;\n      if(!Array.isArray(p.planBrief)) p.planBrief = [];\n      if(p.rejectLog == null) p.rejectLog = [];\n    });",
"    (data.projects || []).forEach(function(p){\n      if(!p.version) p.version = 1;\n      if(!Array.isArray(p.planBrief)) p.planBrief = [];\n      if(p.rejectLog == null) p.rejectLog = [];\n      /* 批次名称 → 券名称；补发券方式 */\n      p.planBrief.forEach(function(b){\n        if(b.coupon == null) b.coupon = b.bat || b.name || '';\n        if(!b.grant) b.grant = '领券';\n        delete b.bat;\n      });\n    });");

/* 存储不可用：改成顶部可关闭的中性提示条，不再每次刷新弹红色提示 */
s=s.replace("    if(!lsOk()){\n      state.ready = true; state.writable = false;\n      MT.toast('浏览器禁用了本地存储，本次演示的修改不会被保存', 'err');\n      return false;\n    }",
"    if(!lsOk()){\n      state.ready = true; state.writable = false;\n      state.err = '浏览器限制本地存储';\n      storageNotice();\n      return false;\n    }");

s=s.replace("      state.err = e.message || String(e);\n      MT.toast('本地保存失败（' + state.err + '），当前修改仅保留在内存中', 'err');\n      return false;",
"      state.err = e.message || String(e);\n      storageNotice();\n      return false;");

s=s.replace("      state.err = '本地数据解析失败';\n      MT.toast('本地数据解析失败，已按示例数据运行且不会覆盖原文件；可在「系统管理 → 重置演示数据」恢复', 'err');\n      return false;",
"      state.err = '本地数据解析失败';\n      storageNotice('本地数据解析失败，已按示例数据运行且不会覆盖原文件；可在「系统管理 → 重置演示数据」恢复');\n      return false;");

s=s.replace("/* 业务动作统一入口：改完内存后调用，避免每个动作自己拼存储 */",
"/** 顶部中性提示条：只出现一次，可关闭；不遮挡内容、不弹红框 */\nfunction storageNotice(msg){\n  if(document.getElementById('mnStoreWarn')) return;\n  var host = document.querySelector('.main') || document.body;\n  var bar = document.createElement('div');\n  bar.id = 'mnStoreWarn';\n  bar.className = 'mn-warnbar';\n  bar.innerHTML = '<span>' + (msg || '当前浏览器限制了本地存储，本次演示的修改不会被保存；可在「系统管理 → 重置演示数据」重新开始。') + '</span>'\n    + '<a class=\"x\" onclick=\"this.parentNode.remove()\">关闭</a>';\n  host.insertBefore(bar, host.firstChild);\n}\n\n/* 业务动作统一入口：改完内存后调用，避免每个动作自己拼存储 */");

fs.writeFileSync(P, s, 'utf8');
console.log('ok store.js');

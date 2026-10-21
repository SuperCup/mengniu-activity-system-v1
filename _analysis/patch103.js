
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 1. 种子日志日期对齐演示时间（当前为 2026-10 下旬） */
let lg=fs.readFileSync(R+'js/data/logs.js','utf8');
const map = {
  '2026-12-19':'2026-10-21', '2026-12-18':'2026-10-20', '2026-12-17':'2026-10-19',
  '2026-12-16':'2026-10-18', '2026-12-15':'2026-10-16', '2026-12-14':'2026-10-15',
  '2026-12-13':'2026-10-14', '2026-12-12':'2026-10-13'
};
Object.keys(map).forEach(function(k){ lg = lg.split(k).join(map[k]); });
fs.writeFileSync(R+'js/data/logs.js', lg, 'utf8');
console.log('ok dates: '+(lg.indexOf('2026-12-')<0));

/* 2. 列表：每次渲染都读筛选控件 + 按时间倒序 */
let lp=fs.readFileSync(R+'js/pages/log-page.js','utf8');
const oldList = lp.slice(lp.indexOf('function logList(){'), lp.indexOf('function logQuery(){'));
const newList =
"function logList(){\n"
+ "  var mod = (document.getElementById('logMod') || {}).value;\n"
+ "  var res = (document.getElementById('logRes') || {}).value;\n"
+ "  var from = (document.getElementById('logFrom') || {}).value || '';\n"
+ "  var to = (document.getElementById('logTo') || {}).value || '';\n"
+ "  var kw = String((document.getElementById('logKw') || {}).value || '').trim().toLowerCase();\n"
+ "  LOG_F = { mod: mod || '', res: res || '', from: from, to: to };\n"
+ "\n"
+ "  var rows = (window.SYS_LOGS || []).filter(function(r){\n"
+ "    if(LOG_F.mod && r.mod !== LOG_F.mod) return false;\n"
+ "    if(LOG_F.res && r.result !== LOG_F.res) return false;\n"
+ "    var day = String(r.at || '').slice(0, 10);\n"
+ "    if(LOG_F.from && day < LOG_F.from) return false;\n"
+ "    if(LOG_F.to && day > LOG_F.to) return false;\n"
+ "    if(kw){\n"
+ "      var hay = (r.user + ' ' + r.obj + ' ' + r.objId + ' ' + r.detail + ' ' + r.act + ' ' + r.mod).toLowerCase();\n"
+ "      if(hay.indexOf(kw) < 0) return false;\n"
+ "    }\n"
+ "    return true;\n"
+ "  });\n"
+ "\n"
+ "  /* 时间倒序：新写入的日志永远在最上面 */\n"
+ "  rows.sort(function(a, b){ return String(b.at).localeCompare(String(a.at)); });\n"
+ "  return rows;\n"
+ "}\n\n";
lp = lp.replace(oldList, newList);
fs.writeFileSync(R+'js/pages/log-page.js', lp, 'utf8');
console.log('ok list: '+(lp.indexOf('时间倒序')>=0));

/* 3. 日志时间精确到秒 */
let au=fs.readFileSync(R+'js/core/audit.js','utf8');
if(au.indexOf('wfNowSec')<0){
  au=au.replace("  var at = (typeof wfNow === 'function') ? wfNow() : new Date().toISOString().slice(0,19).replace('T',' ');",
"  var at = logNow();");
  au=au.replace("var SYS_LOG_MAX = 500;",
"var SYS_LOG_MAX = 500;\n\n/** 日志时间：年-月-日 时:分:秒 */\nfunction logNow(){\n  var d = new Date();\n  function two(n){ return ('0' + n).slice(-2); }\n  return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate())\n    + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds());\n}");
  fs.writeFileSync(R+'js/core/audit.js', au, 'utf8');
  console.log('ok logNow');
}

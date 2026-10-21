/* =============================================================================
 * core/format.js — 全局命名空间与格式化工具
 * 说明：原型大量使用内联 onclick，因此工具函数保持全局声明，便于模板直接调用。
 * ========================================================================== */
window.MT = window.MT || {};

/** 全局注册表：页面与浮层组件 */
MT.pages = MT.pages || {};      // key = 视图 id（v-xxx）
MT.drawers = MT.drawers || {};  // key = 抽屉 id（dw-xxx）
MT.navOrder = MT.navOrder || [];

/* ---------- HTML 转义 ---------- */
function pnEsc(v){ return String(v==null?'':v).replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function vsEsc(v){ return String(v==null?'':v).replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
MT.esc = pnEsc;

/* ---------- 金额 ---------- */
/** 135000 → '¥135,000.00' */
function money(n){
  var v = Number(n);
  if(!isFinite(v)) v = 0;
  return '\u00a5' + v.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
}
/** 千分位：135000 → '135,000'；非数字原样返回 */
function pnFmt(v){
  if(v==null || v==='') return '';
  var raw = String(v).replace(/,/g,'').trim();
  if(!/^-?\d+(\.\d+)?$/.test(raw)) return String(v);
  var neg = raw.charAt(0)==='-';
  if(neg) raw = raw.slice(1);
  var parts = raw.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg?'-':'') + parts.join('.');
}
/** 反解析：'110,000' / '¥52.00' / '9,000 张' → 数字 */
function pnNum(v){
  var t = String(v==null?'':v).replace(/[,\s¥￥]/g,'').replace(/[^0-9.\-]/g,'');
  var n = parseFloat(t);
  return isNaN(n) ? 0 : n;
}
/** 看板用：整数千分位 */
function dbFmt(n){ return Number(Math.round(n)).toLocaleString('en-US'); }
function dbMoney(n){ return '¥' + Number(Math.round(n)).toLocaleString('en-US'); }

/* ---------- 名称匹配 ---------- */
/** 按名称在预设库里找：先全名精确，再按前缀宽松匹配 */
function pnMatch(list, name){
  var s = String(name||'').trim();
  var hit = list.filter(function(x){ return x.n===s; })[0];
  if(hit) return hit;
  var best=null, bestLen=0;
  list.forEach(function(x){
    var a=x.n.replace(/[\s\/]/g,''), b=s.replace(/[\s\/]/g,'');
    var core=b.split('×')[0].split('*')[0];
    if((b.indexOf(a)===0 || core.indexOf(a)===0 || a.indexOf(b)===0) && a.length>bestLen){ best=x; bestLen=a.length; }
  });
  return best;
}

/* ---------- 轻提示（替代 alert，统一交互反馈） ---------- */
MT.toast = function(msg, type){
  /* 空消息不弹，避免出现空白提示框 */
  if(msg == null || String(msg).trim() === '') return;
  var box = document.getElementById('mnToast');
  if(!box){
    box = document.createElement('div');
    box.id = 'mnToast';
    box.className = 'mn-toast';
    document.body.appendChild(box);
  }
  box.textContent = msg;
  box.className = 'mn-toast on' + (type ? ' ' + type : '');
  clearTimeout(MT._toastTimer);
  MT._toastTimer = setTimeout(function(){ box.className = 'mn-toast'; }, 2600);
};


/** 统一日期展示：始终输出 年-月-日（YYYY-MM-DD），兼容带时间的字符串 */
function mnDate(v){
  if(v == null || v === '') return '';
  var s = String(v).trim().replace(/[\/.]/g, '-').replace(/年|月/g, '-').replace(/日/g, '');
  var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if(!m) return String(v);
  var mm = ('0' + m[2]).slice(-2), dd = ('0' + m[3]).slice(-2);
  return m[1] + '-' + mm + '-' + dd;
}

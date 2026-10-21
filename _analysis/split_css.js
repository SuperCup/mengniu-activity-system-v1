
const fs=require('fs'), path=require('path');
const ROOT='D:/Project/蒙牛-原型-ds-harness/hq-console';
let css=fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/app.orig.css','utf8');

/* ---------- 1. 颜色替换表：字面色值 → 规范 token ---------- */
const COLOR = {
  '#12A06A':'var(--brand)', '#0B7550':'var(--brand-d)', '#E8F6F0':'var(--brand-l)', '#F3FAF7':'var(--brand-ll)',
  '#BFE3D3':'var(--brand-40)', '#CDEAD8':'var(--brand-20)', '#C9D8D2':'var(--brand-40)', '#CFE7DA':'var(--brand-20)',
  '#E4F1EB':'var(--brand-12)', '#D6E3DD':'var(--brand-20)', '#CFE0D8':'var(--brand-20)', '#CFDCD6':'var(--brand-20)',
  '#DDE6E2':'var(--brand-20)', '#DCE6E1':'var(--brand-20)', '#C3D2CB':'var(--brand-40)',
  '#0E8A7D':'var(--brand-80)', '#17A091':'var(--brand-60)', '#0B8A5C':'var(--aux-green)', '#609C0C':'var(--aux-olive)',
  '#2C6FC4':'var(--blue)', '#EAF2FC':'var(--blue-l)', '#1B4E8C':'var(--blue-ink)', '#1668C4':'var(--blue)', '#0E4E96':'var(--blue-ink)',
  '#1F2D2A':'var(--ink)', '#4A5A56':'var(--ink-80)', '#5D6B66':'var(--ink-80)', '#87968F':'var(--ink-60)',
  '#A8B4AF':'var(--ink-40)', '#C3CFCA':'var(--ink-20)',
  '#F2F5F4':'var(--bg)', '#E3EAE7':'var(--line)', '#EFF3F1':'var(--line2)', '#EDF2F0':'var(--line2)',
  '#FAFCFB':'var(--bg-tint)', '#F7FAF9':'var(--bg-soft)', '#FBFDFC':'var(--bg-tint)', '#FBFCFC':'var(--bg-tint)',
  '#FAFBFA':'var(--bg-tint)', '#F3F7F5':'var(--bg-soft)', '#F1F5F3':'var(--bg-soft)', '#EEF2F1':'var(--bg-soft)',
  '#F2F9F5':'var(--brand-ll)', '#F7FCF9':'var(--brand-ll)', '#F6FAF8':'var(--brand-ll)',
  '#C08300':'var(--aux-sand-ink)', '#FDF5E4':'var(--aux-sand-l)', '#F8F4EA':'var(--aux-sand-l)', '#FFFBF0':'var(--aux-sand-l)',
  '#F0DFC0':'var(--aux-sand-40)', '#F3E7CD':'var(--aux-sand-40)', '#F3E6C8':'var(--aux-sand-40)', '#F3E2C0':'var(--aux-sand-40)',
  '#FEFCF6':'var(--aux-sand-ll)', '#8A5C00':'var(--aux-sand-ink)', '#7A5200':'var(--aux-sand-ink)',
  '#8A6410':'var(--aux-sand-ink)', '#6E4400':'var(--aux-sand-ink)', '#8F5700':'var(--aux-sand-ink)', '#9A6A16':'var(--aux-sand-ink)',
  '#C0392B':'var(--red)', '#FBECEA':'var(--red-l)', '#B4442F':'var(--red)', '#8A2C1D':'var(--red-ink)',
  '#B4232A':'var(--red)', '#E0573F':'var(--red)', '#F3D5D1':'var(--red-40)', '#EBC8C4':'var(--red-40)',
  '#FEF9F8':'var(--red-ll)', '#FDECEA':'var(--red-l)',
  '#6B4FA8':'var(--purple)', '#F0EBF9':'var(--purple-l)', '#DED5F0':'var(--purple-40)', '#FAF8FD':'var(--purple-ll)', '#B77DE0':'var(--purple)',
  '#F08A4B':'var(--aux-olive)', '#E8622C':'var(--aux-green)', '#D9480F':'var(--red)'
};
const RGBA = [
  [/rgba\(18,\s*160,\s*106,/g,'rgba(9,108,82,'],
  [/rgba\(20,\s*50,\s*40,/g,'rgba(20,30,53,'],
  [/rgba\(20,\s*32,\s*28,/g,'rgba(20,30,53,'],
  [/rgba\(31,\s*45,\s*42,/g,'rgba(20,30,53,'],
  [/rgba\(16,\s*40,\s*34,/g,'rgba(20,30,53,'],
  [/rgba\(18,\s*36,\s*31,/g,'rgba(20,30,53,'],
  [/rgba\(22,\s*104,\s*196,/g,'rgba(44,111,196,']
];
function applyColor(text){
  var t=text;
  Object.keys(COLOR).forEach(function(k){
    t=t.split(k).join(COLOR[k]);
    t=t.split(k.toLowerCase()).join(COLOR[k]);
  });
  RGBA.forEach(function(p){ t=t.replace(p[0],p[1]); });
  return t;
}

/* ---------- 2. 解析规则 ---------- */
// 去掉注释，记录为 *_comment 便于人工回顾
let src = css;
const rules=[];
let i=0;
const N=src.length;
while(i<N){
  const open=src.indexOf('{', i);
  if(open<0) break;
  let sel=src.slice(i, open);
  // 找配对的 }
  let depth=1, j=open+1;
  while(j<N && depth>0){
    if(src[j]==='{')depth++;
    else if(src[j]==='}')depth--;
    j++;
  }
  const body=src.slice(open+1, j-1);
  rules.push({sel:sel.trim(), body:body, raw:src.slice(i, j)});
  i=j;
}
console.log('parsed rules:', rules.length);

/* ---------- 3. 目标文件判定 ---------- */
const MATCHERS = [
  ['pages/home.css',      /^\.todos?\b|^\.todo\b|^\.msg\b/],
  ['pages/dashboard.css', /^\.db-|^\.kpi|^\.chart|^\.legend|^\.svgline|^\.duo|^\.donut|^\.hbar|^\.heat|^\.hx|^\.sqbar|^#db/],
  ['pages/coupon.css',    /^\.h5grid|^\.h5new|^\.h5prev|^\.phone|^\.rules|^\.linkrow|^\.sizes|^\.sortlist|^\.bgpick|^\.qr|^\.qinfo|^\.qsz|^\.qwrap|^\.stg|^\.dw-qr|^\.blist|^\.bcnt|^\.b-row/],
  ['pages/admin.css',     /^\.vcs-tbl|^#dw-vs|^\.vs-/],
  ['pages/plan-batch.css',/^\.bf\b|^\.bfilter|^\.blist-tbl|^\.bt\b|^\.bt\.|^\.bt |^\.pb-plan|^\.pb-bat|^#planTbl|^\.pager|^\.psec|^\.add-row|^#dw-plannew|^\.dsec|^\.dkv|^\.tags-multi|^\.bp\b|^\.bp-i|^\.imp-row|^#dw-imp|^\.selall|^\.list-hd|^\.ops|^\.lk\b|^\.ap-plan/],
  ['pages/project.css',   /^\.st\b|^\.fr\b|^\.inp|^\.fg\b|^\.fg\.|^\.chk|^\.cbox|^\.note|^\.drop|^\.file\b|^\.pl-add|^\.locked|^\.projbar|^\.pjl|^\.pjt|^\.ctx|^\.ps-item|^\.ps-|^\.steps|^\.flow\b|^\.flow\.|^\.flow-lnk|^\.stmap|^\.stdoc|^\.acts|^\.tl\b|^\.diff|^\.vres|^\.sums|^\.sum\b|^\.mini|^\.grid|^\.mail|^\.funl|^\.fl-row/]
];
const DROP = /^:root|^\*|^body|^html|^\.topbar|^\.crumb|^\.hintbar|^\.wrap|^\.view\b|^\.muted\b|^\.flex\b|^\.right\b|^\.sx-mono|^\.sec-gap|^\.foot\b|^\.lnk|^a\.lnk|^\.mut\b/;

const buckets = {};
function push(file, text){ (buckets[file]=buckets[file]||[]).push(text); }

rules.forEach(function(r){
  let sel = r.sel.replace(/\/\*[\s\S]*?\*\//g,'').trim();
  if(!sel) return;
  const head = sel.split(',')[0].trim();
  const probe = sel.replace(/\s+/g,' ');
  if(DROP.test(head)) return;
  // @media：按内部首条选择器归类
  let target='components.css';
  let mm = null;
  if(/^@media/.test(head)){
    mm = probe.match(/\{([^\{]+)\{/);
    var inner = (r.body.match(/([^{}]+)\{/)||[])[1] || '';
    inner = inner.trim();
    for(var k=0;k<MATCHERS.length;k++){ if(MATCHERS[k][1].test(inner)){ target=MATCHERS[k][0]; break; } }
  } else {
    for(var k2=0;k2<MATCHERS.length;k2++){ if(MATCHERS[k2][1].test(head)){ target=MATCHERS[k2][0]; break; } }
  }
  push(target, applyColor(r.raw.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').trim()));
});

console.log('--- bucket sizes ---');
Object.keys(buckets).forEach(k=>console.log(k+': '+buckets[k].length+' rules'));
fs.writeFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/css_buckets.json', JSON.stringify(buckets,null,1),'utf8');

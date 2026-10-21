/* =============================================================================
 * components/pagedata.js — 页面数据弹窗
 * ========================================================================== */

/* 当前页的全量数字；分渠道时按二维码渠道汇总 */
var PG_VIEW = { name:'', P:0, G:0, U:0, ch:'' };

function pgPageCodes(name){
  var data = window.QRDATA || {};
  var keys = Object.keys(data);
  for(var i=0;i<keys.length;i++){
    if(data[keys[i]].name === name) return data[keys[i]].codes || [];
  }
  return [];
}

function pgRenderCh(){
  var box = document.getElementById('pgCh');
  if(!box) return;
  var chs = window.QR_CHANNELS || [];
  var h = '<span class="' + (PG_VIEW.ch ? '' : 'on') + '" data-ch="" onclick="pgPickCh(this)">全部</span>';
  chs.forEach(function(ch){
    h += '<span class="' + (PG_VIEW.ch === ch.code ? 'on' : '') + '" data-ch="' + ch.code + '" onclick="pgPickCh(this)">' + ch.name + '</span>';
  });
  box.innerHTML = h;
}

function pgShow(P, G, U){
  var f = function(x){ return x.toLocaleString('en-US'); };
  document.getElementById('pgdPv').textContent  = f(P);
  document.getElementById('pgdGet').textContent = f(G);
  document.getElementById('pgdUse').textContent = f(U);
  document.getElementById('pgdPv2').textContent  = f(P);
  document.getElementById('pgdGet2').textContent = f(G);
  document.getElementById('pgdUse2').textContent = f(U);
  document.getElementById('pgdR1').textContent = P ? (G/P*100).toFixed(1)+'%' : '—';
  document.getElementById('pgdR2').textContent = G ? (U/G*100).toFixed(1)+'%' : '—';
}

function pgApply(){
  var P = PG_VIEW.P, G = PG_VIEW.G, U = PG_VIEW.U;
  if(PG_VIEW.ch){
    var list = pgPageCodes(PG_VIEW.name).filter(function(c){ return c.ch === PG_VIEW.ch; });
    P = 0; G = 0; U = 0;
    list.forEach(function(c){
      P += c.scan || 0;
      G += c.got || 0;
      U += c.used || 0;
    });
  }
  pgShow(P, G, U);
}

function pgPickCh(el){
  PG_VIEW.ch = el.getAttribute('data-ch') || '';
  pgRenderCh();
  pgApply();
}

/* ---------- 逻辑 ---------- */
function openPgData(name, pv, get, use){
  var n = function(x){ return parseInt(String(x).replace(/,/g,''),10)||0; };
  PG_VIEW.name = name;
  PG_VIEW.P = n(pv);
  PG_VIEW.G = n(get);
  PG_VIEW.U = n(use);
  PG_VIEW.ch = '';
  document.getElementById('pgDataName').textContent = name;
  pgRenderCh();
  pgApply();
  openDrawer('dw-pgdata');
}

/* ============ 新建领券页面：批次列表（筛选 + 分页 + 勾选） ============ */
/* ============================================================
   核销订单分析看板（纯 SVG / CSS，无外部图表库）
   数据以 PLANS 的批次核销字段为基线派生
   ============================================================ */

/* 渠道构成（发券渠道） */

/* ---------- 模板：dw-pgdata ---------- */
function tplDrawerpgdata(){
  return `<div class="drawer" id="dw-pgdata" style="width:520px">
  <div class="dw-h">
    <h3>领券页面数据 <span class="sub" id="pgDataName">—</span></h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">
    <div class="pg-ch" id="pgCh"></div>
    <div class="pdm">
      <div class="pdm-i"><span class="k">PV</span><span class="v" id="pgdPv">—</span><span class="d">页面访问次数</span></div>
      <div class="pdm-i"><span class="k">领取</span><span class="v" id="pgdGet">—</span><span class="d">成功领券张数</span></div>
      <div class="pdm-i"><span class="k">核销</span><span class="v" id="pgdUse">—</span><span class="d">已核销张数</span></div>
    </div>
    <table class="bt mini" style="table-layout:fixed;margin-top:16px">
      <thead><tr><th style="width:44%">指标</th><th style="text-align:right">数值</th><th style="width:30%;text-align:right">转化率</th></tr></thead>
      <tbody>
        <tr><td>PV（页面访问）</td><td class="num" id="pgdPv2">—</td><td class="num muted">—</td></tr>
        <tr><td>领取（领券成功）</td><td class="num" id="pgdGet2">—</td><td class="num" id="pgdR1">—</td></tr>
        <tr><td>核销（已使用）</td><td class="num" id="pgdUse2">—</td><td class="num" id="pgdR2">—</td></tr>
      </tbody>
    </table>
  </div>
  <div class="dw-f">
    <div class="lft">数据 T+1 更新，口径与数据看板一致</div>
    <div class="rgt">
      <button class="btn btn-g" onclick="closeDrawer()">关闭</button>
      <button class="btn btn-p" onclick="closeDrawer(); go('v-board', null)">去数据看板</button>
    </div>
  </div>
</div>`;
}

MT.defineDrawer("dw-pgdata", tplDrawerpgdata);

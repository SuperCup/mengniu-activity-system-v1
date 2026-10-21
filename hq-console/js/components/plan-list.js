/* =============================================================================
 * components/plan-list.js — 计划 / 批次表格渲染与计划详情
 * 被「项目创建」「项目审批」「计划与批次」三个模块共用，全站只有一份计划数据。
 * 对应待确认清单标黄项：
 *   · 3 支持补充计划批次信息（批次表格提供「补充批次信息」入口）
 *   · 10/11 零售商与商品明细改为导入（表格里直接点「明细」查看导入结果）
 * ========================================================================== */

/* ---------- 计划状态：跟随批次流转，不在本系统编辑 ---------- */
function planToday(){
  var d = new Date();
  function two(n){ return ('0' + n).slice(-2); }
  return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate());
}

function planProjOf(p){
  var id = (p && (p.projectId || p.proj)) || '';
  return (typeof projByAny === 'function') ? projByAny(id) : null;
}

function planLifeState(p){
  var proj = planProjOf(p);
  var pst = proj ? proj.state : '';
  if(pst === 'stopped' || p.bstat === '已终止' || p.bstat === '已中止') return { txt:'已中止', cls:'tg-r' };
  var today = planToday();
  if((p.e && p.e < today) || p.bstat === '已结束') return { txt:'已结束', cls:'tg-n' };
  if(!p.bat) return { txt:'待完善', cls:'tg-a' };
  if(pst === 'running') return { txt:'进行中', cls:'tg-g' };
  return { txt:'待配置', cls:'tg-t' };
}

/* ---------- 计划里的零售商 / 商品摘要（优先用导入结果，保持与详情页一致） ---------- */
function planLabel(p, kind){
  var rows = kind === 'ret' ? (p.retRows || []) : (p.skuRows || []);
  var names = rows.length
    ? rows.map(function(r){ return kind === 'ret' ? (r.ret || r.store || '') : (r.name || ''); })
    : (kind === 'ret' ? (p.ret || []) : (p.sku || []));
  names = names.filter(Boolean);
  if(!names.length) return '<span class="muted">未导入</span>';
  return pnEsc(names[0]) + (names.length > 1 ? '<span class="muted"> +' + (names.length - 1) + '</span>' : '');
}

/* ---------- 计划表（计划与批次 → 计划列表，每页 15 条） ---------- */
function planMenuFiltered(list){
  if(typeof PLAN_SCOPE !== 'undefined' && PLAN_SCOPE) return list;
  var projEl = document.getElementById('planFProj');
  var statEl = document.getElementById('planFStat');
  var kwEl = document.getElementById('planFKw');
  var proj = projEl ? projEl.value : '';
  var stat = statEl ? statEl.value : '';
  var kw = kwEl ? String(kwEl.value || '').trim().toLowerCase() : '';
  return list.filter(function(p){
    if(proj && (p.projectId || p.proj) !== proj) return false;
    if(stat && planLifeState(p).txt !== stat) return false;
    if(kw){
      var owner = planProjOf(p);
      var hay = (p.pid + ' ' + p.name + ' ' + (p.coupon || '') + ' ' + (p.bat || '') + ' ' + (owner ? owner.name : '')).toLowerCase();
      if(hay.indexOf(kw) < 0) return false;
    }
    return true;
  });
}

function renderPlans(){
  var list = (typeof planScoped === 'function') ? planScoped() : PLANS.slice();
  list = planMenuFiltered(list);
  var body = document.getElementById('pbPlanBody');
  var cnt = document.getElementById('pbPlanCnt');
  if(cnt) cnt.textContent = list.length + ' 个计划';

  var pages = Math.max(1, Math.ceil(list.length / PLAN_SIZE));
  if(PLAN_PAGE > pages) PLAN_PAGE = pages;
  var st = (PLAN_PAGE - 1) * PLAN_SIZE, en = Math.min(st + PLAN_SIZE, list.length);

  if(body){
    if(!list.length){
      body.innerHTML = '<tr><td colspan="10" class="empty-row">没有匹配的计划</td></tr>';
    } else {
      var h = '';
      list.slice(st, en).forEach(function(p){
        var i = PLANS.indexOf(p);
        var life = planLifeState(p);
        var proj = planProjOf(p);
        var batCell = p.bat
          ? '<a class="lnk sx-mono" onclick="openPlanDetail(' + i + ')">' + pnEsc(p.bat) + '</a>'
          : '<span class="muted">待服务商上传</span>';
        h += '<tr>'
          + '<td><b>' + pnEsc(p.pid) + '</b></td>'
          + '<td><b>' + pnEsc(proj ? proj.name : '—') + '</b>'
            + '<div class="muted sx-mono">' + pnEsc(p.projectId || p.proj || '') + '</div></td>'
          + '<td><b>' + pnEsc(p.name) + '</b>'
            + (p.coupon ? '<div class="muted" style="font-size:11.6px">' + pnEsc(p.coupon) + (p.grant ? ' · ' + pnEsc(p.grant) : '') + '</div>' : '')
          + '</td>'
          + '<td>¥' + p.face + ' / 满 ' + p.thr + '</td>'
          + '<td class="num" style="text-align:left">' + Number(p.qty).toLocaleString('en-US') + ' 张</td>'
          + '<td>' + money(p.budget) + '</td>'
          + '<td style="font-size:12.1px;white-space:nowrap">' + mnDate(p.s) + ' ~ ' + mnDate(p.e) + '</td>'
          + '<td>' + batCell + '</td>'
          + '<td><span class="tg ' + life.cls + ' xs">' + life.txt + '</span></td>'
          + '<td><div class="ops">'
            + (life.txt === '待完善' ? '<a onclick="openBatch(' + i + ')">补充配置</a>' : '')
            + '<a onclick="openPlanDetail(' + i + ')">明细</a></div></td>'
          + '</tr>';
      });
      body.innerHTML = h;
    }
  }

  /* 分页（每页 15 条） */
  var t = document.getElementById('planTotal');
  if(t) t.textContent = list.length;
  var pb = document.getElementById('planPager');
  if(pb){
    var pg = '<span class="' + (PLAN_PAGE <= 1 ? 'dis' : '') + '" onclick="gotoPlan(' + (PLAN_PAGE - 1) + ')">上一页</span>';
    for(var k = 1; k <= pages; k++){
      pg += '<span class="' + (k === PLAN_PAGE ? 'on' : '') + '" onclick="gotoPlan(' + k + ')">' + k + '</span>';
    }
    pg += '<span class="' + (PLAN_PAGE >= pages ? 'dis' : '') + '" onclick="gotoPlan(' + (PLAN_PAGE + 1) + ')">下一页</span>';
    pb.innerHTML = pg;
  }

  var stt = document.getElementById('pbStat');
  if(stt){
    var bn = list.filter(function(x){ return !!x.bat; }).length;
    stt.textContent = list.length + ' / ' + bn + ' / 2';
  }

  /* 批次列表随计划同步重建，保证领券页与计划页口径一致 */
  BAT = batList();
  renderBatches();

  if(typeof renderBlist === 'function'){ try{ renderBlist(); }catch(e){} }
}

/* ---------- 批次表：与计划严格 1:1，没有批次的计划也可以就地补充 ---------- */
function renderBatches(){
  var body = document.getElementById('batBody');
  if(!body) return;
  var list = (typeof planScoped === 'function') ? planScoped() : PLANS.slice();

  var total = list.length;
  var sel = document.getElementById('pbBatPlan');
  if(sel){
    var cur = sel.value;
    var opt = '<option value="">全部计划</option>';
    list.forEach(function(p){
      var key = p.bat || p.pid;
      opt += '<option value="' + key + '"' + (cur === key ? ' selected' : '') + '>' + pnEsc(p.pid) + ' · ' + pnEsc(p.name) + '</option>';
    });
    sel.innerHTML = opt;
  }

  var fp = sel ? sel.value : '';
  var stEl = document.getElementById('pbBatStat');
  var fs2 = stEl ? stEl.value : '';
  var kwEl = document.getElementById('pbBatRet');
  var kw = kwEl ? String(kwEl.value || '').trim().toLowerCase() : '';

  var rows = list.filter(function(p){
    var key = p.bat || p.pid;
    if(fp && key !== fp) return false;
    if(fs2 && planLifeState(p).txt !== fs2) return false;
    if(kw){
      var hay = (p.bat + ' ' + p.name + ' ' + (p.ret || []).join(' ')).toLowerCase();
      if(hay.indexOf(kw) < 0) return false;
    }
    return true;
  });

  var cnt = document.getElementById('pbBatCnt');
  if(cnt) cnt.textContent = (rows.length === total ? total + ' 个批次' : rows.length + ' / ' + total + ' 个批次');

  if(!rows.length){
    body.innerHTML = '<tr><td colspan="9" class="empty-row">没有匹配的批次</td></tr>';
    return;
  }

  var h = '';
  rows.forEach(function(p){
    var idx = PLANS.indexOf(p);
    var life = planLifeState(p);
    h += '<tr>'
      + '<td>' + (p.bat ? '<span class="sx-mono">' + pnEsc(p.bat) + '</span>' : '<span class="muted">待服务商上传</span>') + '</td>'
      + '<td style="font-size:11.8px;white-space:nowrap"><span class="sx-mono">' + pnEsc(p.pid) + '</span></td>'
      + '<td>' + pnEsc(p.btitle || p.name) + '</td>'
      + '<td style="font-size:12.1px">' + pnEsc(p.bmech || '—') + '</td>'
      + '<td style="font-size:11.8px;white-space:nowrap">' + pnEsc(p.bs || '—') + '<br><span class="muted">' + pnEsc(p.be || '') + '</span></td>'
      + '<td><span class="tg ' + life.cls + ' xs">' + life.txt + '</span></td>'
      + '<td class="num" style="text-align:left">' + Number(p.bqty || 0).toLocaleString('en-US') + '</td>'
      + '<td style="font-size:11.8px">' + Number(p.used || 0).toLocaleString('en-US') + ' 单<br><span class="muted">' + money(p.usedAmt || 0) + '</span></td>'
      + '<td><div class="ops">'
        + (life.txt === '待完善' ? '<a onclick="openBatch(' + idx + ')">补充配置</a>' : '')
        + '<a onclick="openPlanDetail(' + idx + ')">明细</a></div></td>'
      + '</tr>';
  });
  body.innerHTML = h;
}

function gotoPlan(n){
  var list = (typeof planScoped === 'function') ? planScoped() : PLANS;
  var pages = Math.max(1, Math.ceil(list.length / PLAN_SIZE));
  if(n < 1 || n > pages) return;
  PLAN_PAGE = n;
  renderPlans();
}

function delPlan(i){
  if(!confirm('确认删除计划「' + PLANS[i].name + '」？')) return;
  PLANS.splice(i, 1);
  var pages = Math.max(1, Math.ceil(PLANS.length / PLAN_SIZE));
  if(PLAN_PAGE > pages) PLAN_PAGE = pages;
  renderPlans();
}

/* ---------- 计划详情抽屉 ---------- */
function openPlanDetail(i){
  var p = PLANS[i]; if(!p) return;
  var proj = planProjOf(p);
  var life = planLifeState(p);

  var h = '';
  h += '<div class="dsec"><h5>所属计划</h5><div class="dkv">'
    + '<div class="r"><span class="k">所属项目</span><span class="v">' + pnEsc(proj ? proj.name : '—') + '</span></div>'
    + '<div class="r"><span class="k">计划 ID</span><span class="v sx-mono">' + pnEsc(p.pid) + '</span></div>'
    + '<div class="r"><span class="k">计划名称</span><span class="v">' + pnEsc(p.name) + '</span></div>'
    + '<div class="r"><span class="k">计划状态</span><span class="v"><span class="tg ' + life.cls + ' xs">' + life.txt + '</span></span></div>'
    + '</div></div>';

  h += '<div class="dsec" style="margin-bottom:0"><h5>对应批次</h5>';
  if(p.bat){
    h += '<div class="note b" style="margin-top:0">批次编码、券规则、有效期与发放上限由服务商上传回传，本系统只查看，不能编辑。</div>'
      + '<div class="dkv">'
      + '<div class="r"><span class="k">批次编码</span><span class="v"><b class="sx-mono">' + pnEsc(p.bat) + '</b></span></div>'
      + '<div class="r"><span class="k">券名称</span><span class="v">' + pnEsc(p.btitle || p.coupon || p.name) + '</span></div>'
      + '<div class="r full"><span class="k">券规则</span><span class="v">' + pnEsc(p.bmech || p.coupon || '—') + '</span></div>'
      + '<div class="r"><span class="k">批次有效期</span><span class="v">' + pnEsc(p.bs || '—') + ' ~ ' + pnEsc(p.be || '—') + '</span></div>'
      + '<div class="r"><span class="k">发放上限</span><span class="v">' + Number(p.bqty || 0).toLocaleString('en-US') + ' 张</span></div>'
      + '<div class="r"><span class="k">已核销</span><span class="v">' + Number(p.used || 0).toLocaleString('en-US') + ' 单 / ' + money(p.usedAmt || 0) + '</span></div>'
      + '</div>';
  } else {
    h += '<div class="note b" style="margin-top:0">待完善：由创建人补充服务商配置批次需要的信息（券名称、面额、门槛、有效期、发放上限等）。批次号仍由服务商在微信支付后台生成后回传，这里不填写。</div>'
      + (life.txt === '待完善' ? '<button class="btn btn-p btn-xs" type="button" onclick="closeDrawer();openBatch(' + i + ')">补充配置</button>' : '');
  }
  h += '</div>';

  /* 活动零售商 / 活动商品明细：与「补充配置」页导入结果同源 */
  var retRows = p.retRows || [];
  var skuRows = p.skuRows || [];
  h += '<div class="dsec"><h5>活动零售商明细 <span class="muted">' + retRows.length + ' 条</span></h5>';
  if(retRows.length){
    h += '<table class="bt mini" style="table-layout:fixed"><thead><tr>'
       + '<th style="width:6%">#</th><th style="width:20%">零售商名称</th><th style="width:30%">门店名称</th>'
       + '<th style="width:12%">省份</th><th style="width:12%">城市</th><th style="width:20%">微信商户号</th></tr></thead><tbody>';
    retRows.forEach(function(r, k){
      h += '<tr><td class="idx">' + (k+1) + '</td>'
         + '<td>' + pnEsc(r.ret || '—') + '</td>'
         + '<td>' + pnEsc(r.store || r.n || '—') + '</td>'
         + '<td class="mut">' + pnEsc(r.prov || '—') + '</td>'
         + '<td class="mut">' + pnEsc(r.city || '—') + '</td>'
         + '<td class="sx-mono">' + (r.mch ? pnEsc(r.mch) : '<span class="tg tg-a xs">待服务商补充</span>') + '</td></tr>';
    });
    h += '</tbody></table>';
  } else {
    h += '<div class="note b" style="margin-top:0">还没有导入零售商 / 门店明细</div>';
  }
  h += '</div>';

  h += '<div class="dsec" style="margin-bottom:0"><h5>活动商品明细 <span class="muted">' + skuRows.length + ' 条</span></h5>';
  if(skuRows.length){
    h += '<table class="bt mini" style="table-layout:fixed"><thead><tr>'
       + '<th style="width:6%">#</th><th style="width:26%">69码或店内码</th><th style="width:44%">商品名称</th>'
       + '<th style="width:24%">店内码所属零售商</th></tr></thead><tbody>';
    skuRows.forEach(function(r, k){
      h += '<tr><td class="idx">' + (k+1) + '</td>'
         + '<td class="sx-mono">' + pnEsc(r.code || '—') + '</td>'
         + '<td>' + pnEsc(r.name || r.n || '—') + '</td>'
         + '<td class="mut">' + pnEsc(r.owner || '—') + '</td></tr>';
    });
    h += '</tbody></table>';
  } else {
    h += '<div class="note b" style="margin-top:0">还没有导入活动商品明细</div>';
  }
  h += '</div>';

  document.getElementById('pdTitle').innerHTML = '计划批次 <span class="sub">' + pnEsc(p.pid) + (p.bat ? ' / ' + pnEsc(p.bat) : '') + '</span>';
  document.getElementById('pdBody').innerHTML = h;
  var foot = document.querySelector('#dw-pdetail .dw-f .lft');
  if(foot) foot.textContent = '一个计划对应一个批次；批次信息由服务商上传，本系统无编辑';
  openDrawer('dw-pdetail');
}

/* ---------- 模板：dw-pdetail ---------- */
function tplDrawerpdetail(){
  return `<div class="drawer" id="dw-pdetail" style="width:780px">
  <div class="dw-h">
    <h3 id="pdTitle">计划与批次明细</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b" id="pdBody"></div>
  <div class="dw-f">
    <div class="lft">计划与批次一一对应，批次不可拆分或合并</div>
    <div class="rgt"><button class="btn btn-g" onclick="closeDrawer()">关闭</button></div>
  </div>
</div>`;
}

MT.defineDrawer('dw-pdetail', tplDrawerpdetail);

/* =============================================================================
 * components/plan-list.js — 计划 / 批次表格渲染与计划详情
 * 被「项目创建」「项目管理」「计划与批次」三个模块共用，全站只有一份计划数据。
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

/** 批次配置是否可补充：仅审批通过、待推送；推送后锁定 */
function planCanConfig(p){
  var proj = planProjOf(p);
  return !proj || proj.state === 'passed' || proj.state === 'to_push';
}

function planLifeState(p){
  var proj = planProjOf(p);
  var pst = proj ? proj.state : '';
  if(pst === 'finished' || p.bstat === '已终止' || p.bstat === '已中止') return { txt:'已中止', cls:'tg-r' };
  var today = planToday();
  if((p.e && p.e < today) || p.bstat === '已结束') return { txt:'已结束', cls:'tg-n' };
  if(!p.bat) return { txt:'待完善', cls:'tg-a' };
  if(pst === 'to_push')     return { txt:'待推送',       cls:'tg-a' };
  if(pst === 'pushed')      return { txt:'已推送',       cls:'tg-t' };
  if(pst === 'to_confirm')  return { txt:'待服务商确认', cls:'tg-a' };
  if(pst === 'confirmed')   return { txt:'已确认',       cls:'tg-g' };
  if(pst === 'configured')  return { txt:'已配置',       cls:'tg-t' };
  if(pst === 'running')     return { txt:'进行中',       cls:'tg-g' };
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
          : '<span class="muted" style="white-space:nowrap;font-size:11.6px">待服务商上传</span>';
        h += '<tr>'
          + '<td><b>' + pnEsc(p.pid) + '</b></td>'
          + '<td><b>' + pnEsc(proj ? proj.name : '—') + '</b>'
            + '<div class="muted sx-mono">项目编号 ' + pnEsc(projCodeText(p.projectId || p.proj)) + '</div></td>'
          + '<td><b>' + pnEsc(p.name) + '</b></td>'
          + '<td style="font-size:12.1px">' + (p.mech ? pnEsc(p.mech) : ('¥' + p.face + ' / 满 ' + p.thr)) + '</td>'
          + '<td class="num" style="text-align:left">' + Number(p.qty).toLocaleString('en-US') + ' 张</td>'
          + '<td style="white-space:nowrap">' + money(p.budget) + '</td>'
          + '<td style="font-size:12.1px;white-space:nowrap">' + mnDate(p.s) + ' ~ ' + mnDate(p.e) + '</td>'
          + '<td>' + batCell + '</td>'
          + '<td><span class="tg ' + life.cls + ' xs">' + life.txt + '</span></td>'
          + '<td><div class="ops">'
            + (life.txt === '待完善'
              ? (planCanConfig(p) ? '<a onclick="openBatch(' + i + ')">补充配置</a>' : '<span class="muted" style="font-size:11.6px">已锁定</span>')
              : '')
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

/* ---------- 批次明细抽屉（字段与「完善配置」页一一对应，只读） ---------- */
function openPlanDetail(i){
  var p = PLANS[i]; if(!p) return;
  var proj = planProjOf(p);
  var life = planLifeState(p);
  var bf = p.batchForm || {};
  var mechType = bf.mechType || p.mechType || (/减至/.test(p.mech || '') ? '减至' : '满减');
  var face = (bf.face !== undefined && bf.face !== '') ? bf.face : p.face;
  var thr = (bf.thr !== undefined && bf.thr !== '') ? bf.thr : p.thr;
  var cap = (bf.cap !== undefined && bf.cap !== '') ? bf.cap : p.bqty;
  var user = (bf.user !== undefined && bf.user !== '') ? bf.user : '';
  var start = bf.start || p.bs || p.s || '';
  var end = bf.end || p.be || p.e || '';
  var desc = bf.desc || '';
  var batNo = bf.batNo || p.bat || '';
  var isCut = mechType === '减至';
  var validTxt = start && end ? (mnDate(start) + ' ~ ' + mnDate(end)) : '—';
  if(bf.validMode === 'after' && bf.validDays) validTxt += '（领券后 ' + bf.validDays + ' 天内可用）';
  var thrTxt = isCut ? ((Number(thr) > 0) ? ('订单满 ' + thr + ' 元') : '无门槛') : ((Number(thr) > 0) ? ('满 ' + thr + ' 元可用') : '无门槛');

  var h = '';
  h += '<div class="dsec"><h5>所属计划</h5><div class="dkv">'
    + '<div class="r"><span class="k">所属项目</span><span class="v">' + pnEsc(proj ? proj.name : '—') + '</span></div>'
    + '<div class="r"><span class="k">计划 ID</span><span class="v sx-mono">' + pnEsc(p.pid) + '</span></div>'
    + '<div class="r"><span class="k">计划名称</span><span class="v">' + pnEsc(p.name) + '</span></div>'
    + '<div class="r"><span class="k">计划状态</span><span class="v"><span class="tg ' + life.cls + ' xs">' + life.txt + '</span></span></div>'
    + '</div></div>';

  h += '<div class="dsec"><h5>批次配置</h5>';
  if(!bf.name){
    h += planCanConfig(p)
      ? '<div class="note b" style="margin-top:0">该批次还未填写执行配置，点「补充配置」补全券名称、面额、门槛、可用时间与发放上限。</div>'
      : '<div class="note b" style="margin-top:0">项目已推送服务商，批次配置已锁定，仅可查看已有明细。</div>';
  }
  h += '<div class="dkv">'
    + '<div class="r"><span class="k">批次号</span><span class="v">' + (batNo ? '<b class="sx-mono">' + pnEsc(batNo) + '</b>' : '<span class="muted">待服务商回传</span>') + '</span></div>'
    + '<div class="r"><span class="k">券名称</span><span class="v">' + pnEsc(bf.name || p.btitle || '—') + '</span></div>'
    + '<div class="r"><span class="k">机制类型</span><span class="v">' + pnEsc(mechType) + '</span></div>'
    + '<div class="r"><span class="k">' + (isCut ? '换购价' : '券面额') + '</span><span class="v">' + (face !== '' && face != null ? '¥' + pnEsc(face) : '—') + '</span></div>'
    + '<div class="r"><span class="k">' + (isCut ? '订单优惠门槛' : '使用门槛') + '</span><span class="v">' + thrTxt + '</span></div>'
    + (isCut && (bf.maxPrice || p.maxPrice) ? '<div class="r"><span class="k">商品单价最高</span><span class="v">¥' + pnEsc(bf.maxPrice || p.maxPrice) + '</span></div>' : '')
    + '<div class="r"><span class="k">可用时间</span><span class="v">' + pnEsc(validTxt) + '</span></div>'
    + '<div class="r"><span class="k">发放总上限</span><span class="v">' + (cap !== '' && cap != null ? Number(cap).toLocaleString('en-US') + ' 张' : '—') + '</span></div>'
    + '<div class="r"><span class="k">单个用户可领</span><span class="v">' + (user ? user + ' 张' : '—') + '</span></div>'
    + '<div class="r full"><span class="k">使用说明</span><span class="v">' + (desc ? pnEsc(desc) : '—') + '</span></div>'
    + '<div class="r full"><span class="k">券详情图</span><span class="v">' + (function(){
        if(!p.img) return '<span class="muted">未上传</span>';
        var data = (window.PLAN_IMG_DATA || {})[p.id];
        if(data) return '<img src="' + data + '" alt="券详情图" style="max-width:100%;max-height:150px;border-radius:8px;border:1px solid var(--line);display:block;margin-top:4px">';
        return '<span class="muted">已上传：' + pnEsc(p.img.name || '券详情图') + '（刷新后需重新上传文件）</span>';
      })() + '</span></div>'
    + '<div class="r"><span class="k">已核销</span><span class="v">' + Number(p.used || 0).toLocaleString('en-US') + ' 单 / ' + money(p.usedAmt || 0) + '</span></div>'
    + '</div>';
  if(life.txt === '待完善'){
    if(planCanConfig(p)) h += '<button class="btn btn-p btn-xs" type="button" style="margin-top:10px" onclick="closeDrawer();openBatch(' + i + ')">补充配置</button>';
  }
  h += '</div>';

  /* 活动零售商 / 活动商品明细：与「补充配置」页同源同字段 */
  var retRows = p.retRows || [];
  var skuRows = p.skuRows || [];
  h += '<div class="dsec"><h5>活动零售商明细 <span class="muted">' + retRows.length + ' 条</span></h5>';
  if(retRows.length){
    h += '<table class="bt mini" style="table-layout:fixed"><thead><tr>'
       + '<th style="width:5%">#</th><th style="width:14%">门店编码</th><th style="width:15%">零售商名称</th><th style="width:20%">门店名称</th>'
       + '<th style="width:9%">省份</th><th style="width:9%">城市</th><th style="width:13%">微信商户号</th>'
       + '<th style="width:8%">经度</th><th style="width:7%">纬度</th></tr></thead><tbody>';
    retRows.forEach(function(r, k){
      h += '<tr><td class="idx">' + (k+1) + '</td>'
         + '<td class="sx-mono">' + pnEsc(r.sid || '—') + '</td>'
         + '<td>' + pnEsc(r.ret || '—') + '</td>'
         + '<td>' + pnEsc(r.store || r.n || '—') + '</td>'
         + '<td class="mut">' + pnEsc(r.prov || '—') + '</td>'
         + '<td class="mut">' + pnEsc(r.city || '—') + '</td>'
         + '<td class="sx-mono">' + (r.mch ? pnEsc(r.mch) : '<span class="tg tg-a xs">待服务商补充</span>') + '</td>'
         + '<td class="sx-mono mut">' + (r.lng != null && r.lng !== '' ? pnEsc(r.lng) : '—') + '</td>'
         + '<td class="sx-mono mut">' + (r.lat != null && r.lat !== '' ? pnEsc(r.lat) : '—') + '</td></tr>';
    });
    h += '</tbody></table>';
  } else {
    h += '<div class="note b" style="margin-top:0">还没有导入零售商 / 门店明细</div>';
  }
  h += '</div>';

  h += '<div class="dsec" style="margin-bottom:0"><h5>活动商品明细 <span class="muted">' + skuRows.length + ' 条</span></h5>';
  if(skuRows.length){
    h += '<table class="bt mini" style="table-layout:fixed"><thead><tr>'
       + '<th style="width:6%">#</th><th style="width:20%">69码</th><th style="width:40%">商品名称</th>'
       + '<th style="width:16%">店内码</th><th style="width:18%">所属零售商</th></tr></thead><tbody>';
    skuRows.forEach(function(r, k){
      h += '<tr><td class="idx">' + (k+1) + '</td>'
         + '<td class="sx-mono">' + pnEsc(r.code || '—') + '</td>'
         + '<td>' + pnEsc(r.name || r.n || '—') + '</td>'
         + '<td class="sx-mono">' + pnEsc(r.inCode || '—') + '</td>'
         + '<td class="mut">' + pnEsc(r.owner || '—') + '</td></tr>';
    });
    h += '</tbody></table>';
  } else {
    h += '<div class="note b" style="margin-top:0">还没有导入活动商品明细</div>';
  }
  h += '</div>';

  document.getElementById('pdTitle').innerHTML = '批次明细 <span class="sub">' + pnEsc(p.pid) + (batNo ? ' / ' + pnEsc(batNo) : '') + '</span>';
  document.getElementById('pdBody').innerHTML = h;
  var foot = document.querySelector('#dw-pdetail .dw-f .lft');
  if(foot) foot.textContent = '字段与「完善配置」一致；批次号由服务商上传回传，本系统只查看';
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

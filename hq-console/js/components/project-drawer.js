/* =============================================================================
 * components/project-drawer.js — 项目详情（dw-proj）
 * 项目列表与详情共用；字段与项目卡片保持同一集合，卡片能看到的这里都有，
 * 详情再补充审批信息、状态时间线与计划批次汇总，避免「列表与详情混显」。
 * ========================================================================== */

/** 与创建页批次计划同一套摘要：名称摘要 +「明细 N」 */
function projBriefItems(list, kind){
  var s = (typeof briefSummary === 'function') ? briefSummary(list || [], kind) : { txt:'', n:0 };
  var txt = s.n
    ? '<span class="bv">' + pnEsc(s.txt) + '</span>'
    : '<span class="mut">未添加</span>';
  var meta = s.n ? '<span class="lnk">明细 ' + s.n + '</span>' : '';
  return '<td><div class="bcell">' + txt + meta + '</div></td>';
}


/** 审批人结果：优先读取 BPM 明细，未配置时按项目状态兜底 */
function projApprovalResults(p){
  var detail = (typeof PROJ_APPROVAL_DETAIL !== 'undefined' && PROJ_APPROVAL_DETAIL[p.id]) || {};
  var reached = ['passed','to_push','pushed','to_confirm','confirmed','configured','running','finished'].indexOf(p.state) >= 0;
  return (p.approvers || []).map(function(a, i){
    if(detail[a.id]) return Object.assign({}, a, detail[a.id]);
    if(reached) return Object.assign({}, a, { result:'通过', at:p.approvedAt || '', note:'同意，按活动方案执行。' });
    if(p.state === 'rejected') return Object.assign({}, a, { result:i === 0 ? '未通过' : '通过', at:p.saved || '', note:i === 0 ? (p.approvalNote || '未通过') : '同意。' });
    if(p.state === 'approving') return Object.assign({}, a, { result:'审批中', at:p.submitted || '', note:'' });
    return Object.assign({}, a, { result:'待审批', at:'', note:'' });
  });
}

/** 审批节点内的多人结果与意见 */
function projApprovalHTML(p, list){
  var yes = list.filter(function(x){ return x.result === '通过'; }).length;
  var h = '<div class="ptl-apv"><div class="ptl-apv-h"><b>并联审批</b><span>' + list.length + ' 人 · 全部同意后通过</span>'
    + '<span class="ptl-apv-sum">' + yes + '/' + list.length + ' 已同意</span></div>';
  list.forEach(function(r){
    var cls = r.result === '通过' ? 'tg-g' : (r.result === '未通过' ? 'tg-r' : (r.result === '审批中' ? 'tg-t' : 'tg-n'));
    var note = r.note ? ('意见：' + pnEsc(r.note)) : (r.result === '审批中' ? '等待该审批人处理' : '—');
    var tm = (r.result === '审批中' || r.result === '待审批') ? '' : (r.at ? pnEsc(r.at) : '');
    h += '<div class="ptl-person">'
      + '<span class="ptl-av">' + pnEsc((r.name || '?').slice(0, 1)) + '</span>'
      + '<div class="ptl-p-main"><div><b>' + pnEsc(r.name || '—') + '</b>'
      + (r.dept ? '<span class="ptl-p-dept">' + pnEsc(r.dept) + '</span>' : '') + '</div>'
      + '<div class="ptl-opinion">' + note + '</div></div>'
      + '<div class="ptl-p-rt"><span class="tg ' + cls + ' xs">' + pnEsc(r.result) + '</span>'
      + (tm ? '<span class="ptl-p-time">' + tm + '</span>' : '') + '</div>'
      + '</div>';
  });
  return h + '</div>';
}

/** 状态流转：4 个节点时间轴，审批节点展开审批人结果与意见 */
function projTimelineHTML(p){
  var idx = (typeof projStageIndex === 'function') ? projStageIndex(p) : 0;
  function cls(i){
    if(i === 0) return idx > 0 ? 'done' : 'cur';
    if(i === 1) return (p.state === 'approving' || p.state === 'rejected') ? 'cur' : ((idx > 1 || p.state === 'passed' || p.state === 'to_push') ? 'done' : 'todo');
    if(i === 2) return (p.state === 'to_push' || p.state === 'pushed' || p.state === 'to_confirm') ? 'cur'
      : ((['confirmed','configured','running','finished'].indexOf(p.state) >= 0) ? 'done' : 'todo');
    return (p.state === 'configured' || p.state === 'running') ? 'cur' : (p.state === 'finished' ? 'done' : 'todo');
  }
  function node(cl, title, tag, tagCls, time, body){
    return '<div class="ptl-node ' + cl + '"><div class="ptl-head"><b>' + title + '</b>'
      + '<span class="tg ' + tagCls + ' xs">' + tag + '</span>'
      + (time ? '<span class="ptl-time">' + pnEsc(time) + '</span>' : '')
      + '</div><div class="ptl-body">' + body + '</div></div>';
  }

  var submitted = !!p.submitted || p.state !== 'editing';

  /* 审批 */
  var apTag = '待审批', apCls = 'tg-n', apTime = '';
  if(p.state === 'approving'){ apTag = '审批中'; apCls = 'tg-t'; }
  else if(p.state === 'rejected'){ apTag = '未通过'; apCls = 'tg-r'; apTime = p.approvedAt || ''; }
  else if(['passed','to_push','pushed','to_confirm','confirmed','configured','running','finished'].indexOf(p.state) >= 0){
    apTag = '已通过'; apCls = 'tg-g'; apTime = p.approvedAt || '';
  }
  var apBody;
  if(p.state === 'editing'){
    apBody = p.approvers && p.approvers.length
      ? '<span class="muted">审批人：' + p.approvers.map(function(a){ return pnEsc(a.name); }).join('、') + ' · 提交后进入 BPM 并联审批</span>'
      : '<span class="muted">尚未选择审批人</span>';
  } else {
    apBody = projApprovalHTML(p, projApprovalResults(p));
  }

  /* 推送：只有已通过且批次齐全才是「待推送」；未到达的节点显示「未开始」 */
  var pushTag = '未开始', pushCls = 'tg-n', pushTime = '', pushBody = '审批通过并补齐批次配置后进入待推送';
  if(p.state === 'passed'){ pushBody = '审批已通过，待完善批次配置'; }
  else if(p.state === 'to_push'){ pushTag = '待推送'; pushCls = 'tg-a'; pushBody = '批次配置齐全，等待推送服务商'; }
  else if(p.state === 'pushed'){
    pushTag = '已推送'; pushCls = 'tg-g'; pushTime = p.mailAt || '';
    pushBody = '已推送至 ' + pnEsc(p.pushTo || '服务商');
  } else if(p.state === 'to_confirm'){
    pushTag = '待确认'; pushCls = 'tg-a'; pushTime = p.mailAt || '';
    pushBody = '服务商已收到，等待确认计划';
  } else if(['confirmed','configured','running','finished'].indexOf(p.state) >= 0){
    pushTag = '已确认'; pushCls = 'tg-g'; pushTime = p.confirmAt || p.confirmedAt || p.mailAt || '';
    pushBody = '服务商已确认承接';
  }

  /* 执行：未到达时也显示「未开始」，避免提前出现执行中 */
  var execTag = '未开始', execCls = 'tg-n', execTime = '', execBody = '审批通过并完成批次配置后进入执行';
  if(p.state === 'to_push' || p.state === 'pushed' || p.state === 'to_confirm'){
    execBody = '服务商确认并回传批次号后进入执行';
  } else if(p.state === 'confirmed'){
    execBody = '等待服务商回传批次号';
  } else if(p.state === 'configured'){ execTag = '已配置'; execCls = 'tg-g'; execTime = p.configuredAt || ''; execBody = '服务商已回传批次号，等待上传账单'; }
  else if(p.state === 'running'){
    execTag = '执行中'; execCls = 'tg-s'; execBody = '活动执行中' + (p.progress && p.progress.todo ? '；' + pnEsc(p.progress.todo) : '');
  } else if(p.state === 'finished'){
    execTag = '已结束'; execCls = 'tg-n'; execTime = p.stoppedAt || '';
    execBody = '项目已结束' + (p.stopReason ? '；' + pnEsc(p.stopReason) : '') + (p.released ? '；' + pnEsc(p.released) : '');
  }

  return '<div class="dsec" style="margin-bottom:0"><h5>状态流转</h5><div class="ptl">'
    + node(cls(0), '草稿阶段', submitted ? '已提交' : '草稿', submitted ? 'tg-g' : 'tg-n', p.submitted || p.saved,
        submitted ? '项目信息已提交，进入审批' : '项目信息编辑中；提交后生成项目编号并进入审批')
    + node(cls(1) + (p.state === 'rejected' ? ' rej' : ''), '审批阶段', apTag, apCls, apTime, apBody)
    + node(cls(2), '推送阶段', pushTag, pushCls, pushTime, pushBody)
    + node(cls(3), '执行阶段', execTag, execCls, execTime, execBody)
    + '</div></div>';
}

function openProjDetail(id){
  var p = projByAny(id);
  if(!p){ MT.toast('未找到该项目', 'err'); return; }
  if(p.state === 'editing'){
    MT.toast('草稿阶段不提供详情，请点「编辑」进入项目编辑', 'err');
    return;
  }
  if(typeof projVisible === 'function' && !projVisible(p)){
    MT.toast('当前身份无权查看该项目（仅创建人 / 审批人 / 负责人可见）', 'err');
    return;
  }
  var st = (typeof projDisplay === 'function') ? projDisplay(p) : PROJ_STATES[p.state];

  var h = '<div style="margin-bottom:10px"><a class="btn btn-g btn-xs" onclick="closeDrawer();go(\'v-manage\')">← 返回项目列表</a></div>'
    + '<div class="pcard-h" style="padding:0 0 14px;border-bottom:1px solid var(--line2);margin-bottom:14px">'
    + '<div><h4 style="font-size:var(--fs-lg)">' + pnEsc(p.name)
    + ' <span class="tg ' + st.cls + ' nmst">' + st.label + '</span></h4></div>'
    + '<div class="rt"><span class="muted">项目编号</span><br><span class="sx-mono">' + pnEsc(p.code || '—') + '</span></div>'
    + '</div>';

  /* 一、二、三与创建项目字段一致 */
  h += (typeof planProjInfo === 'function') ? planProjInfo(p) : '';

  /* 五、批次计划：列与创建页「创建计划」一致 */
  var briefs = p.planBrief || [];
  var pstat = (typeof projPlanStat === 'function') ? projPlanStat(p.id) : { n:briefs.length, amt:0 };
  h += '<div class="dsec" style="margin-top:16px"><h5>五、批次计划 <span class="tg tg-n">' + briefs.length + ' 个计划</span>'
    + ' <span class="tg tg-s" style="background:var(--brand-l);color:var(--brand-d)">合计 ' + money(pstat.amt) + '</span></h5>';
  if(!briefs.length){
    h += '<div class="muted" style="font-size:12.4px">还没有计划</div>';
  } else {
    h += '<table class="bt" style="table-layout:fixed"><thead><tr>'
      + '<th style="width:8%">序号</th>'
      + '<th style="width:24%">机制</th>'
      + '<th style="width:34%">活动零售商</th>'
      + '<th style="width:34%">活动商品</th>'
      + '</tr></thead><tbody>'
      + briefs.map(function(b, i){
          return '<tr><td style="text-align:center">' + (i + 1) + '</td>'
            + '<td>' + pnEsc(b.mech || '—') + '</td>'
            + projBriefItems(b.ret, 'ret')
            + projBriefItems(b.sku, 'sku')
            + '</tr>';
        }).join('')
      + '</tbody></table>';
  }
  h += '</div>';


  /* 四、状态流转时间轴 */
  h += projTimelineHTML(p);

  /* 五、计划与批次：仅执行中展示汇总 */
  if(p.state === 'running' && p.progress){
    h += '<div class="dsec" style="margin-bottom:0"><h5>计划与批次</h5><div class="dkv">'
      + '<div class="r"><span class="k">计划数</span><span class="v">' + p.progress.plan + ' 个</span></div>'
      + '<div class="r"><span class="k">批次数</span><span class="v">' + p.progress.batch + ' 个</span></div>'
      + '<div class="r"><span class="k">当前进度</span><span class="v" style="color:var(--aux-sand-ink)">' + pnEsc(p.progress.todo) + '</span></div>'
      + '</div>'
      + '<div style="margin-top:10px"><button class="btn btn-o btn-xs" onclick="closeDrawer();openProjPlans(\'' + p.id + '\')">查看计划与批次</button></div>'
      + '</div>';
  }

  document.getElementById('projDwTitle').innerHTML = '项目详情';
  document.getElementById('projDwBody').innerHTML = h;
  openDrawer('dw-proj');
}

/* ---------- 模板：dw-proj ---------- */
function tplDrawerproj(){
  return `<div class="drawer" id="dw-proj" style="width:1040px">
  <div class="dw-h">
    <h3 id="projDwTitle">项目详情</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b" id="projDwBody"></div>
  <div class="dw-f">
    <div class="lft"></div>
    <div class="rgt"><button class="btn btn-g" onclick="closeDrawer()">关闭</button></div>
  </div>
</div>`;
}

MT.defineDrawer('dw-proj', tplDrawerproj);
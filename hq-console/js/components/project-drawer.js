/* =============================================================================
 * components/project-drawer.js — 项目详情（dw-proj）
 * 项目列表、项目审批共用；字段与项目卡片保持同一集合，卡片能看到的这里都有，
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

function openProjDetail(id){
  var p = projByAny(id);
  if(!p){ MT.toast('未找到该项目', 'err'); return; }
  var st = PROJ_STATES[p.state];

  var h = '<div class="pcard-h" style="padding:0 0 14px;border-bottom:1px solid var(--line2);margin-bottom:14px">'
    + '<div><h4 style="font-size:var(--fs-lg)">' + pnEsc(p.name)
    + ' <span class="tg ' + st.cls + ' nmst">' + st.label + '</span></h4></div>'
    + '<div class="rt"><span class="muted">项目单号</span><br><span class="sx-mono">' + pnEsc(p.orderNo) + '</span></div>'
    + '</div>';

  /* 一、二、三与创建项目字段一致 */
  h += (typeof planProjInfo === 'function') ? planProjInfo(p) : '';

  /* 四、批次计划：列与创建页「创建计划」一致 */
  var briefs = p.planBrief || [];
  h += '<div class="dsec" style="margin-top:16px"><h5>四、批次计划 <span class="tg tg-n">' + briefs.length + ' 个计划</span></h5>';
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

  /* 四、状态时间线 */
  var tl = [];
  if(p.saved)       tl.push(['最近保存', p.saved]);
  if(p.submitted)   tl.push(['提交审批', p.submitted]);
  if(p.approvedAt)  tl.push(['审批通过', p.approvedAt]);
  if(p.confirmedAt) tl.push(['服务商确认', p.confirmedAt]);
  if(p.stoppedAt)   tl.push(['终止', p.stoppedAt]);
  h += '<div class="dsec"><h5>状态流转</h5><div class="dkv">'
    + tl.map(function(t){
        return '<div class="r"><span class="k">' + t[0] + '</span><span class="v">' + pnEsc(t[1]) + '</span></div>';
      }).join('')
    + (p.approver ? '<div class="r full"><span class="k">当前审批人</span><span class="v">' + pnEsc(p.approver) + '</span></div>' : '')
    + (p.pushTo ? '<div class="r full"><span class="k">推送对象</span><span class="v">' + pnEsc(p.pushTo) + '</span></div>' : '')
    + (p.stopReason ? '<div class="r full"><span class="k">终止原因</span><span class="v">' + pnEsc(p.stopReason) + '</span></div>' : '')
    + (p.released ? '<div class="r full"><span class="k">后续影响</span><span class="v">' + pnEsc(p.released) + '</span></div>' : '')
    + '</div></div>';

  /* 五、计划与批次：仅执行中展示汇总 */
  if(p.state === 'running' && p.progress){
    h += '<div class="dsec" style="margin-bottom:0"><h5>计划与批次</h5><div class="dkv">'
      + '<div class="r"><span class="k">计划数</span><span class="v">' + p.progress.plan + ' 个</span></div>'
      + '<div class="r"><span class="k">批次数</span><span class="v">' + p.progress.batch + ' 个</span></div>'
      + '<div class="r"><span class="k">领券页面</span><span class="v">' + p.progress.page + ' 个（' + p.progress.pageOn + ' 启用）</span></div>'
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
    <div class="lft">字段与创建项目一致</div>
    <div class="rgt"><button class="btn btn-g" onclick="closeDrawer()">关闭</button></div>
  </div>
</div>`;
}

MT.defineDrawer('dw-proj', tplDrawerproj);

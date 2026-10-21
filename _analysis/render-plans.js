/* ---------- 计划表（计划与批次 → 计划列表，每页 15 条） ---------- */
function renderPlans(){
  var list = (typeof planScoped === 'function') ? planScoped() : PLANS.slice();
  var body = document.getElementById('pbPlanBody');
  var cnt = document.getElementById('pbPlanCnt');
  if(cnt) cnt.textContent = list.length + ' 个计划';

  var pages = Math.max(1, Math.ceil(list.length / PLAN_SIZE));
  if(PLAN_PAGE > pages) PLAN_PAGE = pages;
  var st = (PLAN_PAGE - 1) * PLAN_SIZE, en = Math.min(st + PLAN_SIZE, list.length);

  if(body){
    if(!list.length){
      body.innerHTML = '<tr><td colspan="9" class="empty-row">暂无计划。审批通过后可在本页补充计划明细。</td></tr>';
    } else {
      var h = '';
      list.slice(st, en).forEach(function(p){
        var i = PLANS.indexOf(p);
        var ck = batCheck(p);
        var batCell = p.bat
          ? '<a class="lnk sx-mono" onclick="openPlanDetail(' + i + ')">' + pnEsc(p.bat) + '</a>'
          : '<span class="tg tg-a xs">待补充批次</span>';
        h += '<tr>'
          + '<td><b>' + pnEsc(p.pid) + '</b><div class="muted sx-mono">' + pnEsc(p.proj || '—') + '</div></td>'
          + '<td>' + pnEsc(p.name) + '</td>'
          + '<td>¥' + p.face + ' / 满 ' + p.thr + '</td>'
          + '<td class="num" style="text-align:left">' + Number(p.qty).toLocaleString('en-US') + ' 张</td>'
          + '<td>' + money(p.budget) + '</td>'
          + '<td style="font-size:12.1px;white-space:nowrap">' + p.s.slice(5) + ' ~ ' + p.e.slice(5) + '</td>'
          + '<td>' + batCell + '</td>'
          + '<td><span class="tg ' + ck.cls + '">' + ck.txt + '</span></td>'
          + '<td><div class="ops">'
            + '<a onclick="openBatch(' + i + ')">' + (p.bat ? '编辑批次' : '补充批次') + '</a>'
            + '<a onclick="openPlanDetail(' + i + ')">明细</a>'
          + '</div></td>'
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

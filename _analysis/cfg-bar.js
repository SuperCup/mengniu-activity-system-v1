
/** 同项目多计划：一个项目（活动）下有多个计划 = 多个批次，逐个补齐 */
function cfgPlanBar(p){
  var projId = p.projectId || p.proj;
  var list = (window.PLANS || []).filter(function(x){ return (x.projectId || x.proj) === projId; });
  if(list.length <= 1) return '';
  var ready = list.filter(function(x){ return planReady(x); }).length;
  return '<div class="cfg-plans">'
    + '<div class="cfg-plans-h"><b>本项目共 ' + list.length + ' 个计划 / ' + list.length + ' 个批次</b>'
      + '<span class="mut">已完成 ' + ready + ' / ' + list.length + '，点下方计划切换，逐个补齐</span></div>'
    + '<div class="cfg-tabs">'
    + list.map(function(x){
        var st = planConfigState(x);
        return '<a class="cfg-tab' + (x.id === p.id ? ' on' : '') + '" onclick="cfgSwitch(\'' + x.id + '\')">'
          + '<b>' + pnEsc(x.name || x.id) + '</b>'
          + '<span>' + pnEsc(x.coupon || x.bat || '—') + '</span>'
          + '<i class="' + st.cls + '">' + pnEsc(st.txt) + '</i>'
          + '</a>';
      }).join('')
    + '</div></div>';
}

function cfgSwitch(pid){
  if(CFG.pid === pid) return;
  openPlanConfig(pid);
}

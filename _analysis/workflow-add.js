
/** 工作台「待我补充执行配置」：跳到第一个有欠配置计划的项目 */
function wfGoFirstConfig(){
  var t = (window.PROJECTS || []).filter(function(p){ return p.state === 'approved'; })
    .filter(function(p){ return projConfigStat(p.id).todo; })[0];
  if(!t){ MT.toast('当前没有待补充执行配置的项目'); return; }
  wfEnterConfig(t.id);
}

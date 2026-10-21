function todoDefs(){
  var noPlan = PROJECTS.filter(function(p){ return p.state === 'running' && p.progress && p.progress.plan === 0; }).length;
  var noBat = PLANS.filter(function(p){ return !p.bat; }).length;
  var myCfg = PROJECTS.filter(function(p){ return p.state === 'approved'; })
    .reduce(function(s, p){ return s + (projConfigStat(p.id).todo ? 1 : 0); }, 0);

  return [
    { n: projCount('pending'),   l: '待我审批',          r: '数字化中心',            act: "go('v-approve')" },
    { n: projCount('approved'),  l: '待推送服务商',      r: '已通过未推送',          cls: 'warn', act: "gotoProjState('approved')" },
    { n: myCfg,                  l: '待我补充执行配置',  r: '已批准未完成配置',      cls: myCfg ? 'warn' : '', act: "wfGoFirstConfig()" },
    { n: projCount('confirmed'), l: '待服务商确认',      r: '推送后等待确认',        cls: 'warn', act: "gotoProjState('confirmed')" },
    { n: noPlan,                 l: '待补充计划明细',    r: '执行中但计划为 0',      act: "gotoProjState('running')" },
    { n: noBat,                  l: '待补充批次',        r: '计划缺对应批次',        cls: noBat ? 'err' : '', act: "go('v-plan')" },
    { n: projCount('running'),   l: '执行中活动',        r: '本月进行中',            act: "gotoProjState('running')" },
    { n: projCount('stopped'),   l: '已终止项目',        r: '预算已释放',            act: "gotoProjState('stopped')" }
  ];
}
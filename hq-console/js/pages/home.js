/* =============================================================================
 * pages/home.js — 工作台
 * 入口页：待办 + 消息与提醒。待办数字全部由 data/* 计算，与列表角标同源；
 * 点击数字卡直达已筛选列表（项目类会带上状态筛选）。
 * ========================================================================== */

function todoDefs(){
  var noPlan = PROJECTS.filter(function(p){ return p.state === 'running' && p.progress && p.progress.plan === 0; }).length;
  var noBat = PLANS.filter(function(p){ return !p.bat; }).length;
  var myCfg = PROJECTS.filter(function(p){ return p.state === 'passed'; })
    .reduce(function(s, p){ return s + (projConfigStat(p.id).todo ? 1 : 0); }, 0);

  return [
    { n: projCount('to_push'),    l: '待推送服务商',      r: '已通过待推送',          cls: 'warn', act: "gotoProjState('to_push')" },
    { n: myCfg,                  l: '待我补充执行配置',  r: '已通过未完成配置',      cls: myCfg ? 'warn' : '', act: "wfGoFirstConfig()" },
    { n: projCount('to_confirm'), l: '待服务商确认',      r: '推送后等待确认',        cls: 'warn', act: "gotoProjState('to_confirm')" },
    { n: noPlan,                 l: '待补充计划明细',    r: '执行中但计划为 0',      act: "gotoProjState('running')" },
    { n: noBat,                  l: '待补充批次',        r: '计划缺对应批次',        cls: noBat ? 'err' : '', act: "go('v-plan')" },
    { n: projCount('running'),   l: '执行中活动',        r: '本月进行中',            act: "gotoProjState('running')" },
    { n: projCount('finished'),  l: '已结束项目',        r: '预算已释放',            act: "gotoProjState('finished')" }
  ];
}

function renderTodos(){
  var box = document.getElementById('homeTodos'); if(!box) return;
  box.innerHTML = todoDefs().map(function(t){
    return '<div class="todo ' + (t.cls || '') + '" style="cursor:pointer" onclick="' + t.act + '">'
      + '<div class="n">' + t.n + '</div><div class="l">' + t.l + '</div><div class="r">' + t.r + '</div></div>';
  }).join('');
}

/* ---------- 模板：v-home ---------- */
function tplPagehome(){
  return `<div class="view" id="v-home">
  <div class="st">我的待办</div>
  <div class="todos" id="homeTodos"></div>
  <div class="st" style="margin-top:26px">消息与提醒</div>
  <div class="panel"><div class="panel-b" style="padding:6px 20px">
    <div class="msg"><span class="dot b"></span><span class="t"><b>【审批中】</b>BU01 提交「年货节乳品礼盒」，核销预算 ¥125,000.00，已在 BPM 发起审批，待审批人处理</span><span class="tm">12 分钟前</span></div>
    <div class="msg"><span class="dot"></span><span class="t"><b>【审批通过】</b>「元旦乳品满减」终审通过，活动 ID <b>2026101910000003</b> 已签发，项目状态更新为「已通过」，待创建人补充计划明细后进入待推送</span><span class="tm">1 小时前</span></div>
    <div class="msg"><span class="dot"></span><span class="t"><b>【已推送】</b>活动链接邮件已发送至 上海智士网络科技 · huwz@zhishi.com，等待服务商确认</span><span class="tm">1 小时前</span></div>
    <div class="msg"><span class="dot a"></span><span class="t"><b>【计划校验失败】</b>「双节常温奶满减」计划金额合计 ¥420,000 超出核销预算 ¥400,000，已拒绝；差异清单已下载，等待服务商重新上传</span><span class="tm">2 小时前</span></div>
    <div class="msg"><span class="dot"></span><span class="t"><b>【批次已配置】</b>「双节常温奶满减」3 个计划各回传 1 个批次（共 3 个），均已一一对应并可推送领券小程序批次</span><span class="tm">今天 10:22</span></div>
    <div class="msg"><span class="dot r"></span><span class="t"><b>【待推送】</b>「跨年暖冬饮品券」审批已通过、批次配置齐全，等待推送服务商</span><span class="tm">昨天 18:20</span></div>
  </div></div>
</div>`;
}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-home",
  title: "工作台",
  crumb: "概览 / 工作台",
  group: "概览",
  template: tplPagehome
});

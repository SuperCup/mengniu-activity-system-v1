
/** 计划的执行配置入口：不再直接弹抽屉，先到「计划与批次」按计划逐个补充 */
function wfEnterConfig(projId){
  var p = wfFindProj(projId);
  if(!p) return;
  if(p.state !== 'approved' && p.state !== 'confirmed' && p.state !== 'running'){
    MT.toast('该项目当前不可补充配置', 'err');
    return;
  }
  if(typeof openProjPlans === 'function'){
    openProjPlans(projId);
    MT.toast('在计划列表中点「补充配置」，逐个计划/批次完善执行配置');
  }
}

/** 项目三项基本信息（与创建页一、二、三一致），只读展示在计划与批次页 */
function planProjInfo(p){
  var own = String(p.owner || '').split('·');
  var oname = (own[0] || '').trim();
  var ophone = (own[1] || '').trim();

  function row(k, v){
    return '<div class="pinfo-row"><span class="k">' + k + '</span><span class="v">' + (v ? pnEsc(v) : '—') + '</span></div>';
  }

  return '<div class="pinfo">'
    + '<div class="pinfo-sec"><h5>一、基本信息</h5>'
      + row('项目名称', p.name)
      + row('项目目标', p.goal || '拉新 + 复购')
      + row('投放平台', p.platform)
      + row('活动周期', p.period)
      + row('活动负责人', oname)
      + row('联系方式', ophone)
    + '</div>'
    + '<div class="pinfo-sec"><h5>二、预算与费用科目</h5>'
      + row('PO 单号', p.po)
      + row('核销预算（元）', p.budget)
      + row('费用科目', p.subject)
      + row('承担主体', p.bearer || p.bu)
      + row('预算来源', p.source)
    + '</div>'
    + '<div class="pinfo-sec"><h5>三、服务商信息</h5>'
      + row('服务商', p.vendor)
      + row('对接联系人', p.vendorContact)
      + row('邮箱', p.vendorMail)
    + '</div>'
    + '</div>';
}

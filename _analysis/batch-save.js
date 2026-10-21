function batchSave(){
  var p = PLANS[BAT_EDIT.idx];
  if(!p) return;

  var name  = (document.getElementById('bfName').value || '').trim();
  var mch   = (document.getElementById('bfMch').value || '').trim();
  var fund  = document.getElementById('bfFund').value;
  var face  = Number(document.getElementById('bfFace').value);
  var thr   = Number(document.getElementById('bfThr').value);
  var start = document.getElementById('bfStart').value;
  var end   = document.getElementById('bfEnd').value;
  var capRaw = document.getElementById('bfCap').value;
  var dayRaw = document.getElementById('bfDay').value;
  var userRaw = document.getElementById('bfUser').value;
  var desc  = (document.getElementById('bfDesc').value || '').trim();
  var batNo = (document.getElementById('bfBatNo').value || '').trim();

  /* 只做确定性校验：不强制「门槛大于面额」，也不限制 90 天 / 100 张 / 100 字
     —— 这些上限在不同产品与账号下并不一致，统一登记在 docs/微信执行字段待核验.md */
  if(!name){ MT.toast('请填写批次名称', 'err'); return; }
  if(!/^\d{8,12}$/.test(mch)){ MT.toast('请填写正确的微信支付商户号（8~12 位数字）', 'err'); return; }
  if(!isFinite(face) || face <= 0){ MT.toast('券面额必须大于 0', 'err'); return; }
  if(!isFinite(thr) || thr < 0){ MT.toast('使用门槛必须是不小于 0 的数字', 'err'); return; }
  if(!start || !end || start > end){ MT.toast('可用时间开始日不能晚于结束日', 'err'); return; }

  var cap = Number(capRaw);
  if(!isFinite(cap) || cap <= 0 || Math.abs(cap - Math.round(cap)) > 1e-9){
    MT.toast('发放总上限必须是正整数', 'err'); return;
  }
  var day = (dayRaw === '' ? null : Number(dayRaw));
  if(day !== null){
    if(!isFinite(day) || day < 0 || Math.abs(day - Math.round(day)) > 1e-9){
      MT.toast('单日发放上限必须是非负整数', 'err'); return;
    }
    if(day > cap){ MT.toast('单日发放上限不能超过发放总上限', 'err'); return; }
  }
  var user = Number(userRaw);
  if(!isFinite(user) || user < 1 || Math.abs(user - Math.round(user)) > 1e-9){
    MT.toast('单个用户可领个数必须是正整数', 'err'); return;
  }

  /* 批次号全局唯一：同一批次不能绑定到两个计划 */
  if(batNo){
    var clash = PLANS.filter(function(x){ return x !== p && x.bat === batNo; })[0];
    if(clash){ MT.toast('批次号 ' + batNo + ' 已被计划「' + clash.name + '」占用，不能重复绑定', 'err'); return; }
  }

  p.batchForm = { name:name, mch:mch, fund:fund, face:face, thr:thr, start:start, end:end,
                  cap:cap, day:day, user:user, desc:desc, batNo:batNo };
  p.bs = start; p.be = end; p.bqty = cap;
  p.btitle = name;
  p.bmech = '满 ' + thr + ' 元减 ' + face + ' 元';

  /* 计划方案与批次分层保存：已产生核销的计划不再被批次表单改掉面额与数量 */
  if(!p.used){
    p.face = face; p.thr = thr; p.qty = cap;
  } else if(p.face !== face || p.qty !== cap){
    MT.toast('该计划已有核销记录，面额/数量沿用原审批方案，差异请走变更审批');
  }

  /* 不再自动编造外部批次号，也不再自动标记为「已审核」 */
  p.bat = batNo || '';
  p.bstat = batNo ? '待提报' : '待补充批次';
  p.updatedAt = (typeof wfNow === 'function') ? wfNow() : '';

  if(typeof mnPersist === 'function') mnPersist();
  closeDrawer();
  renderPlans();
  if(typeof renderProjCards === 'function') renderProjCards();
  MT.toast(batNo
    ? '批次信息已保存，等待服务商在商户后台创建后回填审核结果'
    : '批次信息已保存（未填批次号，保持未提报状态）');
}
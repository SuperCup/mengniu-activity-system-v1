function pnSave(again){
  var name = (document.getElementById('pnName').value || '').trim();
  var mech = (document.getElementById('pnMech').value || '').trim();
  if(!name){ MT.toast('请填写计划名称', 'err'); document.getElementById('pnName').focus(); return; }
  if(!mech){ MT.toast('请填写活动机制', 'err'); document.getElementById('pnMech').focus(); return; }

  var s = document.getElementById('pnStart').value;
  var e = document.getElementById('pnEnd').value;
  if(!s || !e || s > e){ MT.toast('开始时间不能晚于结束时间', 'err'); return; }

  var budget = pnNum(document.getElementById('pnBudget').value);
  var face   = pnNum(document.getElementById('pnFace').value);
  var thr    = pnNum(document.getElementById('pnThr').value);
  var qty    = pnNum(document.getElementById('pnQty').value);

  /* 只校验确定性规则（有限、非负、数量为整数），不套用「门槛必须大于面额」等未经核验的猜测 */
  if(!isFinite(budget) || budget < 0){ MT.toast('计划预算必须是不小于 0 的数字', 'err'); return; }
  if(!isFinite(face) || face < 0){ MT.toast('券面额必须是不小于 0 的数字', 'err'); return; }
  if(!isFinite(thr) || thr < 0){ MT.toast('门槛必须是不小于 0 的数字', 'err'); return; }
  if(!isFinite(qty) || qty < 0 || Math.abs(qty - Math.round(qty)) > 1e-9){
    MT.toast('发放数量必须是非负整数', 'err'); return;
  }

  var now = (typeof wfNow === 'function') ? wfNow() : '';
  var obj = {
    name: name, mech: mech, s: s, e: e,
    ret: PN.ret.map(function(x){ return x.store || x.n; }),
    sku: PN.sku.map(function(x){ return x.name || x.n; }),
    retRows: PN.ret.map(function(x){ return Object.assign({}, x); }),
    skuRows: PN.sku.map(function(x){ return Object.assign({}, x); }),
    budget: budget,
    coupon: '满 ' + thr + ' 元减 ' + face + ' 元',
    face: face, thr: thr, qty: qty,
    limit: document.getElementById('pnLimit').value,
    valid: document.getElementById('pnValid').value
  };

  if(PN.idx >= 0){
    var p = PLANS[PN.idx];
    for(var k in obj) p[k] = obj[k];
    p.version = (p.version || 1) + 1;
    p.updatedAt = now;
    MT.toast('计划已保存（版本 v' + p.version + '）');
  } else {
    var maxN = 0;
    PLANS.forEach(function(x){
      var m = /(\d+)$/.exec(x.id || '');
      if(m) maxN = Math.max(maxN, parseInt(m[1], 10));
    });
    obj.id = 'PL-' + (maxN + 1);
    obj.pid = 'ZS-HD-202612-' + String.fromCharCode(65 + (PLANS.length % 26));
    obj.projectId = PN.projId || '';
    obj.proj = obj.projectId;
    obj.type = 'voucher';
    obj.exec = null;
    obj.configState = 'todo';
    obj.assignee = (typeof mnCurrentUser === 'function') ? mnCurrentUser().name : '李雪';
    obj.version = 1;
    obj.updatedAt = now;
    obj.bat = ''; obj.bstat = '待补充批次';
    obj.btitle = ''; obj.bmech = ''; obj.bs = ''; obj.be = '';
    obj.bchannel = ''; obj.bqty = 0; obj.used = 0; obj.usedAmt = 0;
    PLANS.push(obj);
    MT.toast('计划已创建，可在「计划与批次」补充批次信息');
  }

  if(typeof mnPersist === 'function') mnPersist();
  renderPlans();
  closeDrawer();
  if(typeof renderProjCards === 'function') renderProjCards();

  if(again){
    setTimeout(function(){ openPlanNew(-1); }, 180);
  }
}
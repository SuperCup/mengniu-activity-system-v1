/* =============================================================================
 * core/workflow.js — 业务流程动作（真正改本地数据，不是只弹提示）
 *   提交报批 → 冻结审批快照 → 审批通过/驳回 → 补充执行配置 → 推送服务商
 *   所有动作改完内存数据后 mnPersist()，并重绘受影响的列表与待办
 * ========================================================================== */
window.MT = window.MT || {};

function wfNow(){
  var d = new Date();
  function two(n){ return ('0' + n).slice(-2); }
  return d.getFullYear() + '-' + two(d.getMonth()+1) + '-' + two(d.getDate())
    + ' ' + two(d.getHours()) + ':' + two(d.getMinutes());
}
function wfToday(){ return wfNow().slice(0,10); }

/** 刷新所有受影响的视图（避免某处改了数据、别处还是旧数字） */
function wfRefresh(){
  if(typeof renderProjCards === 'function') renderProjCards();
  if(typeof syncUserFilter === 'function') syncUserFilter();
  if(typeof renderPlans === 'function') renderPlans();
  if(typeof renderTodos === 'function') renderTodos();
  if(typeof renderDbAll === 'function') renderDbAll();
}

function wfNextProjId(){
  var max = 0;
  (window.PROJECTS || []).forEach(function(p){
    var m = /(\d+)$/.exec(p.id || '');
    if(m) max = Math.max(max, parseInt(m[1], 10));
  });
  var n = String(max + 1);
  while(n.length < 4) n = '0' + n;
  return 'MN-WX-202612-' + n;
}

/* 推送确认弹窗点「确认推送」后执行 */
function wfPushDo(id){
  var p = wfFindProj(id); if(!p) return;
  var now = wfNow();
  var stat = projConfigStat(p.id);
  p.state = 'pushed';
  p.saved = now;
  p.mailAt = now;
  p.handoff = { at:now, by:mnCurrentUser().name, plans:stat.list.map(function(x){ return x.id; }) };
  sysLog('项目管理', '推送服务商', p.name, p.id, '推送至 ' + (p.vendor || '服务商') + '，共 ' + stat.list.length + ' 个计划（本地记录）');
  mnPersist(); wfRefresh();
  MT.toast('已推送服务商（本地记录，' + (p.vendorMail || '服务商邮箱') + '）；邮件发送需接入邮件服务');
}

function wfFindProj(id){
  return (typeof projByAny === 'function') ? projByAny(id) : (window.PROJECTS || []).filter(function(p){ return p.id === id; })[0];
}

/* ---------- 提交报批（mode = 'draft' 时只存草稿，不做完整性校验） ---------- */
function wfSubmit(mode){
  var isDraft = (mode === 'draft');
  var g = function(id){ var el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
  var missing = [];

  var name = g('projName');
  if(!name) missing.push('项目名称');
  var ownerName = g('projOwner');
  var ownerPhone = g('projOwnerPhone');
  var po = g('poNo').toUpperCase();
  var apList = (typeof getApprovers === 'function') ? getApprovers() : [];

  if(!isDraft){
    if(!ownerName) missing.push('活动负责人');
    if(!ownerPhone) missing.push('联系方式');
    if(!po) missing.push('预算单号');
    if(g('projVendor') === '') missing.push('服务商');
    if(!apList.length) missing.push('项目审批人（至少 1 人）');

    if(!CRE_BRIEF.length){
      missing.push('至少 1 个计划');
    } else {
      var bad = CRE_BRIEF.filter(function(b){
        return mechCheck(b)
            || !(b.ret || []).length || !(b.sku || []).length;
      });
      if(bad.length) missing.push('计划的机制金额 / 活动零售商 / 活动商品');
      var sidBad = CRE_BRIEF.some(function(b){
        return (b.ret || []).some(function(r){ return (r.ret || r.store || r.mch) && !String(r.sid || '').trim(); });
      });
      if(sidBad) missing.push('活动零售商门店编码（每行必填）');
      var retLack = CRE_BRIEF.some(function(b){
        return (b.ret || []).some(function(r){
          var hasData = r.sid || r.ret || r.store || r.prov || r.city || r.mch;
          var blank = function(v){ var s = String(v == null ? '' : v).trim(); return !s || s === '—'; };
          return hasData && (blank(r.ret) || blank(r.prov) || blank(r.city));
        });
      });
      if(retLack) missing.push('活动零售商（零售商名称 / 省份 / 城市）');
      var skuOver = false, skuDup = false;
      CRE_BRIEF.forEach(function(b){
        var rows = (b.sku || []).filter(function(x){ return x.code || x.name || x.inCode; });
        var max = (b.mechType === '减至') ? 5000 : 15000;
        if(rows.length > max) skuOver = true;
        var seen = {};
        rows.forEach(function(x){
          var c = String(x.code || '').trim(), n = String(x.inCode || '').trim();
          if(c){ if(seen['c' + c]) skuDup = true; seen['c' + c] = 1; }
          if(n){ if(seen['n' + n]) skuDup = true; seen['n' + n] = 1; }
        });
      });
      if(skuOver) missing.push('活动商品数量（满减≤15000 / 换购≤5000）');
      if(skuDup) missing.push('活动商品 69码 / 店内码去重');
    }
  }

  if(missing.length){
    MT.toast((isDraft ? '保存草稿前请补充：' : '提交前请补充：') + missing.join('、'), 'err');
    return;
  }

  /* 编辑草稿 / 未通过项目后重新提交：复用原项目编号，整单替换计划 */
  var editId = window.CRE_EDIT_ID || '';
  var exist = editId ? wfFindProj(editId) : null;

  /* PO 校验结果进入提交条件，而不是只做展示；编辑已存在项目不再重复校验 */
  var pod = (window.PO_DB || {})[po];
  if(!isDraft && !pod && !exist){ MT.toast('预算单不存在或未审批（' + po + '），不能提交', 'err'); return; }
  if(!pod) pod = {};

  var now = wfNow();
  var id = exist ? exist.id : wfNextProjId();
  var vend = (window.VENDORS || [])[parseInt(g('projVendor'), 10)] || {};
  var proto = (window.PROJECTS || []).filter(function(x){ return x.state === 'approving'; })[0]
           || (window.PROJECTS || [])[0] || {};
  var proj = JSON.parse(JSON.stringify(proto));

  /* 草稿允许空行：只落有内容的计划 */
  var briefs = isDraft
    ? CRE_BRIEF.filter(function(b){ return b.mech || (b.ret || []).length || (b.sku || []).length; })
    : CRE_BRIEF;
  /* 门店编码来自客户系统，保留原值，仅去首尾空格 */
  briefs.forEach(function(b){
    (b.ret || []).forEach(function(r){ if(r.sid) r.sid = String(r.sid).trim(); });
  });
  var kinds = [];
  briefs.forEach(function(b){ if(b.mech && kinds.indexOf(b.mech) < 0) kinds.push(b.mech); });

  proj.id = id;
  proj.name = name;
  proj.orderNo = exist ? exist.orderNo : ('SO' + wfToday().replace(/-/g, '') + '-' + String((window.PROJECTS || []).length + 1).slice(-2));
  proj.source = pod.src || proj.source;
  proj.platform = '微信支付';
  proj.bu = pod.org || proj.bu;
  proj.owner = ownerName + (ownerPhone ? ' · ' + ownerPhone : '');
  var ownerId = g('projOwnerId');
  proj.ownerUser = ownerId && (typeof contactById === 'function') && contactById(ownerId)
    ? (function(c){ return { id:c.id, name:c.name, phone:c.phone, dept:c.dept, title:c.title }; })(contactById(ownerId))
    : (typeof personOf === 'function' ? personOf(proj.owner) : { name:ownerName, phone:ownerPhone });
  proj.creator = (function(){
    var u = (typeof mnCurrentUser === 'function') ? mnCurrentUser() : { name:'张明' };
    return { id:u.id || '', name:u.name, dept:u.dept || '' };
  })();
  proj.approvers = apList.map(function(c){ return { id:c.id, name:c.name, dept:c.dept, title:c.title }; });
  proj.vendor = vend.name || '';
  proj.vendorMch = (typeof vendorMch === 'function') ? (vendorMch(vend.name) || vend.mch || '') : (vend.mch || '');
  proj.vendorMail = (vend.cms && vend.cms[0] && vend.cms[0].e) || '';
  proj.vendorContact = (vend.cms && vend.cms[0] && vend.cms[0].n) || '';
  proj.mech = kinds.join(' / ');
  var perS = (typeof g === 'function') ? g('creStart') : '';
  var perE = (typeof g === 'function') ? g('creEnd') : '';
  if(perS && perE) proj.period = perS + '~' + perE;
  proj.budgetSys = g('budgetSys') || 'TPM';
  proj.budgetFiles = BUDGET_VOUCHERS.slice();
  proj.po = po;
  var budgetTyped = g('poBudget');
  proj.budget = budgetTyped
    ? (String(budgetTyped).indexOf('\u00a5') === 0 ? budgetTyped : '\u00a5' + budgetTyped)
    : ('\u00a5' + pod.budget);
  proj.crumb = undefined;
  proj.state = isDraft ? 'editing' : 'approving';
  proj.code = exist ? (exist.code || exist.id) : newProjCode();
  proj.submitted = isDraft ? '' : now;
  proj.saved = now;
  proj.approver = proj.approvers.map(function(a){ return a.name; }).join('、') || '—';
  proj.version = 1;
  proj.rejectLog = [];
  proj.handoff = null;
  /* 计划名称、券名称、发券方式不在创建时报：统一按序号命名，券名称等补充批次信息时再填 */
  proj.planBrief = briefs.map(function(b, i){
    return { name:'计划' + (i + 1), coupon:'', mech:b.mech, mechType:b.mechType || '满减',
             thr:b.thr, face:b.face, maxPrice:b.maxPrice || '', rate:b.rate, grant:'', ret:b.ret, sku:b.sku };
  });
  proj.snapshot = {
    version: 1,
    at: now,
    project: { name:name, budget:proj.budget, vendor:proj.vendor, period:proj.period },
    plans: proj.planBrief.map(function(b, i){
      return { id:'PL-' + id.slice(-4) + '-' + (i+1), name:b.name, coupon:'', mech:b.mech, s:'', e:'', budget:0 };
    })
  };

  /* 计划记录：报批阶段只有业务方案，没有预算与券规则 */
  var period = String(proj.period || '').split('~');
  var s = (period[0] || '').trim() || wfToday();
  var e = (period[1] || '').trim() || wfToday();
  var wfNewPlans = [];
  briefs.forEach(function(b, i){
    var pid = 'PL-' + id.slice(-4) + '-' + (i+1);
    wfNewPlans.push({
      id: pid,
      pid: 'ZS-HD-202612-' + String.fromCharCode(65 + i),
      projectId: id, proj: id,
      name: '计划' + (i + 1), mech: b.mech, mechType: b.mechType || '满减', rate: b.rate || 0,
      coupon: '', grant: '', bat: '',
      s: s, e: e,
      face: b.face || 0, thr: b.thr || 0, maxPrice: b.maxPrice || '', qty: 0, budget: 0,
      limit: '', valid: '',
      ret: (b.ret || []).map(function(r){ return r.ret; }),
      sku: (b.sku || []).map(function(r){ return r.name; }),
      retRows: (b.ret || []).map(function(r){ return Object.assign({}, r); }),
      skuRows: (b.sku || []).map(function(r){ return Object.assign({}, r); }),
      type: 'voucher', exec: null, configState: 'todo',
      assignee: ownerName || '李雪', version: 1, updatedAt: now,
      bstat: '', bqty: 0, used: 0, usedAmt: 0
    });
  });

  /* 计划整体替换：编辑场景下先清掉旧计划再挂新的，保证条数一致 */
  window.PLANS = (window.PLANS || []).filter(function(x){ return (x.projectId || x.proj) !== id; }).concat(wfNewPlans);

  if(exist){
    proj.creator = exist.creator;
    proj.createdAt = exist.createdAt;
    proj.rejectLog = exist.rejectLog || [];
    proj.version = (exist.version || 1) + 1;
    proj.approvalNote = '';
    proj.confirmedAt = '';
    proj.stoppedAt = '';
    proj.stopReason = '';
    PROJECTS[PROJECTS.indexOf(exist)] = proj;
  } else {
    PROJECTS.push(proj);
  }
  sysLog('项目管理', isDraft ? '保存草稿' : (exist ? '重新提交审批' : '提交审批'), proj.name, proj.id,
    isDraft ? '保存为草稿，计划与审批信息待补全'
            : ((exist ? '修改后重新提交，' : '提交后') + '进入审批中，审批人：' + proj.approver + '（BPM 并联审批，全部同意后通过）'));
  mnPersist();
  wfRefresh();

  /* 表单回到初始状态，避免重复提交同一份 */
  CRE_BRIEF.length = 0;
  CRE_BRIEF.push({ mechType:'满减', thr:'', face:'', rate:'', mech:'', ret:[], sku:[] });
  renderProjBrief();
  window.CRE_EDIT_ID = '';
  if(typeof resetCreateMode === 'function') resetCreateMode();
  if(isDraft){
    MT.toast('已保存草稿：' + name + '（' + id + '），可随时编辑后提交审批');
  } else {
    MT.toast((exist ? '已重新提交审批：' : '已提交审批：') + name + '（' + id + '），审批人：' + proj.approver + '（BPM 并联审批，全部同意后通过）');
  }
  go('v-manage');
}

/* ---------- 项目管理里的状态动作 ---------- */
function wfAct(act, id){
  var p = wfFindProj(id);
  if(!p){ MT.toast('未找到该项目', 'err'); return; }
  var now = wfNow();

  if(act === 'submit'){
    if(p.state !== 'editing' && p.state !== 'rejected'){ MT.toast('只有草稿或未通过项目可以提交', 'err'); return; }
    p.state = 'approving'; p.submitted = now; p.saved = now;
    sysLog('项目管理', '提交审批', p.name, p.id, '提交审批，进入审批中（审批人：' + (p.approver || '—') + '；并联审批，全部同意后通过）');
    mnPersist(); wfRefresh();
    MT.toast('已提交审批：' + p.name + '，审批人：' + (p.approver || '—') + '（全部同意后通过）');
    return;
  }
  if(act === 'push'){
    if(p.state !== 'to_push'){ MT.toast('只有「待推送」的项目可以推送', 'err'); return; }
    var stat = projConfigStat(p.id);
    if(!stat.total){ MT.toast('该项目还没有计划，先补充计划再推送', 'err'); return; }
    if(stat.todo){
      var names = stat.list.filter(function(x){ return !planReady(x); })
                           .map(function(x){ return x.name; }).join('、');
      MT.toast('还有 ' + stat.todo + ' 个计划未配置完成：' + names + '，不能推送', 'err');
      return;
    }
    openPushConfirm(id);
    return;
  }
  if(act === 'resend'){
    if(!p.handoff){ MT.toast('还没有推送记录，无法重发', 'err'); return; }
    p.mailAt = now;
    sysLog('项目管理', '重发确认邮件', p.name, p.id, '重发至 ' + (p.vendorMail || '服务商邮箱') + '（本地模拟）');
    MT.toast('已重发确认邮件到 ' + (p.vendorMail || '服务商邮箱') + '（本地模拟，未真实发送）');
    return;
  }
  if(act === 'copy'){
    var link = location.href.split('#')[0] + '#vendor?token=' + (p.token || p.id);
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(link).then(function(){ MT.toast('确认链接已复制'); },
        function(){ MT.toast('复制失败，链接：' + link, 'err'); });
    } else {
      MT.toast('链接：' + link);
    }
    return;
  }
  if(act === 'stop'){
    if(['to_push','pushed','to_confirm','confirmed','configured','running'].indexOf(p.state) < 0){
      MT.toast('当前状态不能终止', 'err'); return;
    }
    p.state = 'finished'; p.saved = now; p.stoppedAt = now;
    sysLog('项目管理', '终止项目', p.name, p.id, '终止后释放未核销预算额度');
    mnPersist(); wfRefresh();
    MT.toast('已终止「' + p.name + '」，预算额度将释放回部门池');
    return;
  }
  if(act === 'del'){
    if(p.state !== 'editing'){ MT.toast('只有草稿可以删除', 'err'); return; }
    var i = window.PROJECTS.indexOf(p);
    if(i >= 0) window.PROJECTS.splice(i, 1);
    sysLog('项目管理', '删除草稿', p.name, p.id, '草稿已删除');
    mnPersist(); wfRefresh();
    MT.toast('草稿已删除');
    return;
  }
  if(act === 'copyNew'){
    var cp = JSON.parse(JSON.stringify(p));
    cp.id = wfNextProjId();
    cp.name = p.name + '（副本）';
    cp.state = 'editing';
    cp.submitted = ''; cp.approvedAt = ''; cp.snapshot = null; cp.handoff = null;
    cp.rejectLog = [];
    cp.saved = now;
    window.PROJECTS.push(cp);
    sysLog('项目管理', '复制项目', cp.name, cp.id, '由 ' + p.id + ' 复制为新草稿');
    mnPersist(); wfRefresh();
    MT.toast('已复制为新草稿：' + cp.name);
    return;
  }
  MT.toast('已执行');
}

/* ---------- 进入补配置 ---------- */
/** 项目 → 定位到第一个待补配置的计划并打开配置抽屉 */
/** 计划的执行配置入口：不再直接弹抽屉，先到「计划与批次」按计划逐个补充 */
function wfEnterConfig(projId){
  var p = wfFindProj(projId);
  if(!p) return;
  if(['passed','to_push'].indexOf(p.state) < 0){
    MT.toast('仅「已通过 / 待推送」项目可补充批次配置；推送后已锁定', 'err');
    return;
  }
  if(typeof openProjPlans === 'function'){
    openProjPlans(projId);
    MT.toast('点计划后的「补充配置」，填写该批次的券信息');
  }
}

/** 深链接：#v-plan?projectId=..&planId=..&tab=config */
function wfOpenFromRoute(q){
  var projId = q.projectId || q.projectid;
  var planId = q.planId || q.planid;
  if(projId && typeof openProjPlans === 'function') openProjPlans(projId);
  if(planId){
    setTimeout(function(){ openBatchById(planId); }, 160);
  } else if(projId && q.tab === 'config'){
    wfEnterConfig(projId);
  }
}

/** 重置演示数据（需用户明确点击） */
function wfResetDemo(){
  if(!confirm('确认清空本地改动并恢复演示数据？此操作不可撤销。')) return;
  MT.store.reset();
}


/** 工作台「待我补充执行配置」：跳到第一个有欠配置计划的项目 */
function wfGoFirstConfig(){
  var t = (window.PROJECTS || []).filter(function(p){ return p.state === 'passed'; })
    .filter(function(p){ return projConfigStat(p.id).todo; })[0];
  if(!t){ MT.toast('当前没有待补充执行配置的项目'); return; }
  wfEnterConfig(t.id);
}
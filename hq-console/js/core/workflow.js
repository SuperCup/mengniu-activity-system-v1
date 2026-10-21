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
  if(typeof renderApproveList === 'function') renderApproveList();
  if(typeof renderPlans === 'function') renderPlans();
  if(typeof renderTodos === 'function') renderTodos();
  if(typeof renderDbAll === 'function') renderDbAll();
  if(typeof renderBlist === 'function'){ try{ renderBlist(); }catch(e){} }
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

function wfFindProj(id){
  return (typeof projByAny === 'function') ? projByAny(id) : (window.PROJECTS || []).filter(function(p){ return p.id === id; })[0];
}

/* ---------- 提交报批 ---------- */
function wfSubmit(){
  var g = function(id){ var el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
  var missing = [];

  var name = g('projName');
  if(!name) missing.push('项目名称');
  var ownerName = g('projOwner');
  var ownerPhone = g('projOwnerPhone');
  if(!ownerName) missing.push('活动负责人');
  if(!ownerPhone) missing.push('联系方式');
  var po = g('poNo').toUpperCase();
  if(!po) missing.push('PO 单号');
  if(g('projVendor') === '') missing.push('服务商');

  if(!CRE_BRIEF.length){
    missing.push('至少 1 个计划');
  } else {
    var bad = CRE_BRIEF.filter(function(b){
      return !String(b.mech || '').trim()
          || !(b.ret || []).length || !(b.sku || []).length;
    });
    if(bad.length) missing.push('计划的机制 / 活动零售商 / 活动商品');
  }

  if(missing.length){ MT.toast('提交前请补充：' + missing.join('、'), 'err'); return; }

  /* PO 校验结果进入提交条件，而不是只做展示 */
  var pod = (window.PO_DB || {})[po];
  if(!pod){ MT.toast('PO 单不存在或未审批（' + po + '），不能提交', 'err'); return; }

  var now = wfNow();
  var id = wfNextProjId();
  var vend = (window.VENDORS || [])[parseInt(g('projVendor'), 10)] || {};
  var proto = (window.PROJECTS || []).filter(function(x){ return x.state === 'pending'; })[0]
           || (window.PROJECTS || [])[0] || {};
  var proj = JSON.parse(JSON.stringify(proto));

  var kinds = [];
  CRE_BRIEF.forEach(function(b){ if(kinds.indexOf(b.mech) < 0) kinds.push(b.mech); });

  proj.id = id;
  proj.name = name;
  proj.orderNo = 'SO' + wfToday().replace(/-/g, '') + '-' + String((window.PROJECTS || []).length + 1).slice(-2);
  proj.source = pod.src || proj.source;
  proj.platform = '微信支付';
  proj.bu = pod.org || proj.bu;
  proj.owner = ownerName + (ownerPhone ? ' · ' + ownerPhone : '');
  proj.vendor = vend.name || '';
  proj.vendorMail = (vend.cms && vend.cms[0] && vend.cms[0].e) || '';
  proj.vendorContact = (vend.cms && vend.cms[0] && vend.cms[0].n) || '';
  proj.mech = kinds.join(' / ');
  proj.po = po;
  proj.budget = '\u00a5' + pod.budget;
  proj.crumb = undefined;
  proj.state = 'pending';
  proj.submitted = now;
  proj.saved = now;
  proj.approver = '数字化中心 · 张明（第 1 级）';
  proj.version = 1;
  proj.rejectLog = [];
  proj.handoff = null;
  proj.planBrief = CRE_BRIEF.map(function(b, i){
    var nm = b.name || ('计划' + (i + 1));
    return { name:nm, coupon:b.coupon || b.bat || nm, mech:b.mech, grant:b.grant || '领券', ret:b.ret, sku:b.sku };
  });
  proj.snapshot = {
    version: 1,
    at: now,
    project: { name:name, budget:proj.budget, vendor:proj.vendor, period:proj.period },
    plans: proj.planBrief.map(function(b, i){
      return { id:'PL-' + id.slice(-4) + '-' + (i+1), name:b.name, coupon:b.coupon, mech:b.mech, grant:b.grant, s:'', e:'', budget:0 };
    })
  };

  /* 计划记录：报批阶段只有业务方案，没有预算与券规则 */
  var period = String(proj.period || '').split('~');
  var s = (period[0] || '').trim() || wfToday();
  var e = (period[1] || '').trim() || wfToday();
  CRE_BRIEF.forEach(function(b, i){
    var pid = 'PL-' + id.slice(-4) + '-' + (i+1);
    window.PLANS.push({
      id: pid,
      pid: 'ZS-HD-202612-' + String.fromCharCode(65 + i),
      projectId: id, proj: id,
      name: b.name || ('计划' + (i + 1)), mech: b.mech, coupon: b.coupon || b.name || ('计划' + (i + 1)), grant: b.grant || '领券', bat: b.coupon || b.name || ('计划' + (i + 1)),
      s: s, e: e,
      face: 0, thr: 0, qty: 0, budget: 0,
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

  window.PROJECTS.push(proj);
  sysLog('项目管理', '提交审批', proj.name, proj.id, '提交后进入待审批，审批人：数字化中心 张明');
  mnPersist();
  wfRefresh();

  /* 表单回到初始状态，避免重复提交同一份 */
  CRE_BRIEF.length = 0;
  CRE_BRIEF.push({ name:'', coupon:'', mech:'', grant:'领券', ret:[], sku:[] });
  renderProjBrief();
  MT.toast('已提交审批：' + name + '（' + id + '），等待数字化中心审批');
  go('v-manage');
}

/* ---------- 审批 ---------- */
function wfApprove(id, act){
  var p = wfFindProj(id);
  if(!p){ MT.toast('未找到该项目', 'err'); return; }
  if(p.state !== 'pending'){ MT.toast('该项目当前不在待审批状态，无法审批', 'err'); return; }
  var now = wfNow();

  if(act === 'agree'){
    p.state = 'approved';
    p.approvedAt = now;
    p.approvedBy = '数字化中心 · 张明';
    sysLog('项目审批', '审批通过', p.name, p.id, '第 1 级审批通过；待补执行配置 ' + projConfigStat(p.id).todo + ' 个计划');
    p.saved = now;
    if(!p.snapshot){
      p.snapshot = { version:p.version || 1, at:now,
        project:{ name:p.name, budget:p.budget, vendor:p.vendor, period:p.period },
        plans:(p.planBrief || []).map(function(b, i){
          return { id:'PL-' + p.id.slice(-4) + '-' + (i+1), name:b.name, coupon:b.coupon || b.bat, mech:b.mech, grant:b.grant || '领券', s:'', e:'', budget:0 };
        }) };
    }
    mnPersist(); wfRefresh();
    var stat = projConfigStat(p.id);
    MT.toast('已同意「' + p.name + '」；待补执行配置 ' + stat.todo + ' 个计划，点「完善批次计划」开始补充');
  } else {
    p.state = 'draft';
    p.rejectLog = p.rejectLog || [];
    p.rejectLog.push({ at:now, by:'数字化中心 · 张明', note:'方案信息不足，退回修改' });
    sysLog('项目审批', '审批驳回', p.name, p.id, '驳回原因：方案信息不足，退回修改');
    p.saved = now;
    mnPersist(); wfRefresh();
    MT.toast('已驳回「' + p.name + '」，退回创建人修改（留痕已记录）');
  }
}

/* ---------- 项目管理里的状态动作 ---------- */
function wfAct(act, id){
  var p = wfFindProj(id);
  if(!p){ MT.toast('未找到该项目', 'err'); return; }
  var now = wfNow();

  if(act === 'submit'){
    if(p.state !== 'draft'){ MT.toast('只有草稿可以提交', 'err'); return; }
    p.state = 'pending'; p.submitted = now; p.saved = now;
    sysLog('项目管理', '提交审批', p.name, p.id, '草稿提交，进入待审批');
    mnPersist(); wfRefresh();
    MT.toast('已提交审批：' + p.name);
    return;
  }
  if(act === 'withdraw'){
    if(p.state !== 'pending'){ MT.toast('只有待审批项目可以撤回', 'err'); return; }
    p.state = 'draft'; p.saved = now;
    sysLog('项目管理', '撤回审批', p.name, p.id, '撤回后回到草稿');
    mnPersist(); wfRefresh();
    MT.toast('已撤回，项目回到草稿');
    return;
  }
  if(act === 'push'){
    if(p.state !== 'approved'){ MT.toast('只有审批通过的项目可以推送', 'err'); return; }
    var stat = projConfigStat(p.id);
    if(!stat.total){ MT.toast('该项目还没有计划，先补充计划再推送', 'err'); return; }
    if(stat.todo){
      var names = stat.list.filter(function(x){ return !planReady(x); })
                           .map(function(x){ return x.name; }).join('、');
      MT.toast('还有 ' + stat.todo + ' 个计划未配置完成：' + names + '，不能推送', 'err');
      return;
    }
    p.state = 'confirmed';
    p.saved = now;
    p.handoff = { at:now, by:mnCurrentUser().name, plans:stat.list.map(function(x){ return x.id; }) };
    sysLog('项目管理', '推送服务商', p.name, p.id, '推送至 ' + (p.vendor || '服务商') + '，共 ' + stat.list.length + ' 个计划（本地记录）');
    mnPersist(); wfRefresh();
    MT.toast('已推送服务商（本地记录，' + (p.vendorMail || '服务商邮箱') + '）；邮件发送需接入邮件服务');
    return;
  }
  if(act === 'resend'){
    if(!p.handoff){ MT.toast('还没有推送记录，无法重发', 'err'); return; }
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
    p.state = 'stopped'; p.saved = now; p.stoppedAt = now;
    sysLog('项目管理', '终止项目', p.name, p.id, '终止后释放未核销预算额度');
    mnPersist(); wfRefresh();
    MT.toast('已终止「' + p.name + '」，预算额度将释放回部门池');
    return;
  }
  if(act === 'del'){
    if(p.state !== 'draft'){ MT.toast('只有草稿可以删除', 'err'); return; }
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
    cp.state = 'draft';
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
  if(p.state !== 'approved' && p.state !== 'confirmed' && p.state !== 'running'){
    MT.toast('该项目当前不可补充配置', 'err');
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
  var t = (window.PROJECTS || []).filter(function(p){ return p.state === 'approved'; })
    .filter(function(p){ return projConfigStat(p.id).todo; })[0];
  if(!t){ MT.toast('当前没有待补充执行配置的项目'); return; }
  wfEnterConfig(t.id);
}

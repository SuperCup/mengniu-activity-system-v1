/* =============================================================================
 * pages/coupon-page.js — 挂券与配置（小程序发券渠道）
 * 第一层：发券渠道列表；第二层：该渠道的发券任务与已推送批次。
 * 旧「领券页面 / 二维码」模块已下线，相关代码与数据文件不再保留。
 * ========================================================================== */

/* ---------- 模板：v-h5 ---------- */
function tplPageh5(){
  return `<div class="view" id="v-h5">
  <div id="miniList"></div>
  <div id="miniDetail" style="display:none"></div>
</div>`;
}
/* =============================================================================
 * 挂券与配置：第一层是小程序列表（= 发券渠道），第二层是该渠道的发券任务
 *   1. 创建发券任务：按「进行中项目」圈选供应商已上传批次号的批次，核对后推送给小程序方
 *   2. 推送即完成：不做配券状态跟进，批次只记录推送时间与渠道
 * ========================================================================== */
var MINI_APPS = [
  { id:'MP-01', name:'蒙牛会员服务中心', appid:'wx8f3a2c9d1e4b6a70', desc:'C 端领券主渠道，公众号与线下物料统一导流', owner:'李雪', at:'2026-08-12', status:'启用',
    mchs:['1236057802','1252436002','1457820366','1603482917'] }
];

var MINI_PUSH = [
  { bat:'23020101', appId:'MP-01', task:'MT-20261021-01', proj:'2026101810000005', projName:'双节常温奶满减', plan:'计划1', mch:'1236057802', at:'2026-10-21 15:32' },
  { bat:'23020102', appId:'MP-01', task:'MT-20261021-01', proj:'2026101810000005', projName:'双节常温奶满减', plan:'计划2', mch:'1603482917', at:'2026-10-21 15:32' },
  { bat:'23020101', appId:'MP-01', task:'MT-20261022-01', proj:'2026101810000005', projName:'双节常温奶满减', plan:'计划1', mch:'1236057802', at:'2026-10-22 14:02' }
];

var MINI_CUR = '';

function miniApp(id){ var l = MINI_APPS.filter(function(a){ return a.id === id; }); return l[0] || null; }
function miniMchPool(){
  var out = [];
  MINI_APPS.forEach(function(a){ (a.mchs || []).forEach(function(m){ if(out.indexOf(m) < 0) out.push(m); }); });
  return out;
}
function miniMchAdd(){
  var a = miniApp(MINI_CUR); if(!a) return;
  if(miniPushes(a.id).length){ MT.toast('已有推送批次，商户号已锁定', 'err'); return; }
  var inp = document.getElementById('miniMchNew');
  var v = inp ? String(inp.value || '').trim() : '';
  if(!/^\d{8,10}$/.test(v)){ MT.toast('微信商户号须为 8~10 位数字', 'err'); return; }
  a.mchs = a.mchs || [];
  if(a.mchs.indexOf(v) >= 0){ MT.toast('该商户号已在列表中', 'err'); return; }
  a.mchs.push(v);
  if(inp) inp.value = '';
  miniRenderDetail();
  MT.toast('已添加可发券商户号');
}
function miniMchDel(m){
  var a = miniApp(MINI_CUR); if(!a) return;
  if(miniPushes(a.id).length){ MT.toast('已有推送批次，商户号已锁定', 'err'); return; }
  a.mchs = (a.mchs || []).filter(function(x){ return x !== m; });
  miniRenderDetail();
}
function miniPushes(id){ return MINI_PUSH.filter(function(x){ return x.appId === id; }); }

/** 按任务号归并：一个任务 = 一批同时推送的批次 */
function miniTasks(id){
  var out = [];
  miniPushes(id).forEach(function(x){
    var t = out.filter(function(y){ return y.task === x.task; })[0];
    if(!t){ t = { task:x.task, proj:x.proj, projName:x.projName, at:x.at, rows:[] }; out.push(t); }
    t.rows.push(x);
  });
  return out;
}

function miniLastAt(id){
  var ps = miniPushes(id).map(function(x){ return x.at; }).sort();
  return ps.length ? ps[ps.length - 1] : '—';
}

function miniEnter(id){ MINI_CUR = id; renderMini(); }
function miniBack(){ MINI_CUR = ''; renderMini(); }

/* 配置跳到该渠道自己的小程序管理后台 */
function miniConfig(id){
  var a = miniApp(id); if(!a) return;
  var q = 'id=' + encodeURIComponent(a.id)
    + '&name=' + encodeURIComponent(a.name)
    + '&appid=' + encodeURIComponent(a.appid);
  window.open('mini-admin.html?' + q, '_blank', 'noopener');
  sysLog('挂券与配置', '打开管理后台', a.name, a.appid, '跳转「' + a.name + '」小程序管理后台');
}

function renderMini(){
  var list = document.getElementById('miniList');
  var det  = document.getElementById('miniDetail');
  if(!list || !det) return;
  if(MINI_CUR){
    list.style.display = 'none'; det.style.display = '';
    miniRenderDetail();
  } else {
    det.style.display = 'none'; list.style.display = '';
    miniRenderList();
  }
}

/* ---------- 第一层：发券渠道（小程序）列表 ---------- */
function miniRenderList(){
  var box = document.getElementById('miniList'); if(!box) return;
  var kw = String((document.getElementById('miniKw') || {}).value || '').trim().toLowerCase();
  var st = (document.getElementById('miniStat') || {}).value || '';
  var rows = MINI_APPS.filter(function(a){
    if(st && a.status !== st) return false;
    if(!kw) return true;
    return (a.name + ' ' + a.appid + ' ' + a.desc).toLowerCase().indexOf(kw) >= 0;
  });

  var h = '';
  rows.forEach(function(a){
    var n = miniPushes(a.id).length;
    var idq = JSON.stringify(a.id).replace(/"/g, '&quot;');
    h += '<tr style="cursor:pointer" onclick="miniEnter(' + idq + ')">'
      + '<td><b>' + pnEsc(a.name) + '</b><div class="muted" style="font-size:11px">' + pnEsc(a.desc) + '</div></td>'
      + '<td class="sx-mono" style="font-size:11.4px">' + pnEsc(a.appid) + '</td>'
      + '<td class="num">' + n + '</td>'
      + '<td class="sx-mono" style="font-size:11.4px;white-space:nowrap">' + pnEsc(miniLastAt(a.id)) + '</td>'
      + '<td><span class="tg ' + (a.status === '启用' ? 'tg-g' : 'tg-n') + '">' + pnEsc(a.status) + '</span></td>'
      + '<td style="white-space:nowrap"><button class="btn btn-p btn-xs" onclick="event.stopPropagation();miniEnter(' + idq + ')">进入渠道</button> '
      + '<button class="btn btn-o btn-xs" onclick="event.stopPropagation();miniConfig(' + idq + ')">配置</button></td>'
      + '</tr>';
  });

  box.innerHTML = '<div class="panel"><div class="panel-h"><h3>挂券与配置</h3></div>'
    + '<div class="panel-b" style="border-top:1px solid var(--line2)"><div class="flex" style="gap:8px;flex-wrap:wrap">'
    + '<input class="inp" id="miniKw" placeholder="小程序名称 / AppID" style="max-width:240px" oninput="miniRenderList()">'
    + '<select class="inp" id="miniStat" style="max-width:130px" onchange="miniRenderList()"><option value="">全部状态</option><option>启用</option><option>停用</option></select>'
    + '<span class="mut" style="margin-left:auto">建好发券任务即推送给小程序方，配券在渠道侧完成</span>'
    + '</div></div></div>'
    + '<div class="panel"><div class="panel-b" style="padding:0"><table class="bt mini" style="table-layout:fixed"><thead><tr>'
    + '<th style="width:34%">小程序 / 说明</th><th style="width:190px">AppID</th><th style="width:110px;text-align:right">已推送批次</th>'
    + '<th style="width:130px">最近推送</th><th style="width:70px">状态</th><th style="width:168px">操作</th>'
    + '</tr></thead><tbody>' + (h || '<tr><td colspan="6" class="empty-row">没有符合条件的渠道</td></tr>') + '</tbody></table></div></div>';
}

/* ---------- 第二层：某渠道的发券任务 + 已推送批次 ---------- */
function miniRenderDetail(){
  var box = document.getElementById('miniDetail'); if(!box) return;
  var a = miniApp(MINI_CUR); if(!a){ miniBack(); return; }
  var ps = miniPushes(a.id);
  var tasks = miniTasks(a.id);
  var mchLocked = ps.length > 0;
  var mchs = a.mchs || (a.mchs = []);

  var h = '';
  h += '<div class="panel" style="margin-bottom:12px"><div class="panel-h"><h3>' + pnEsc(a.name)
     + ' <span class="tg ' + (a.status === '启用' ? 'tg-g' : 'tg-n') + '">' + pnEsc(a.status) + '</span></h3>'
     + '<div class="flex"><a class="lnk" style="cursor:pointer" onclick="miniBack()">← 返回渠道列表</a></div></div>'
     + '<div class="panel-b"><div class="flex" style="gap:26px;flex-wrap:wrap;align-items:flex-start">'
     + '<div><div class="mut" style="font-size:11.6px">小程序 AppID</div><div class="sx-mono" style="font-size:12.4px">' + pnEsc(a.appid) + '</div></div>'
     + '<div><div class="mut" style="font-size:11.6px">接入说明</div><div style="font-size:12.4px">' + pnEsc(a.desc) + '</div></div>'
     + '<div><div class="mut" style="font-size:11.6px">负责人</div><div style="font-size:12.4px">' + pnEsc(a.owner) + '</div></div>'
     + '<div><div class="mut" style="font-size:11.6px">接入时间</div><div style="font-size:12.4px">' + pnEsc(a.at) + '</div></div>'
     + '<div><div class="mut" style="font-size:11.6px">发券任务 / 已推送批次</div><div style="font-size:12.4px"><b>' + tasks.length + '</b> / ' + ps.length + ' 个</div></div>'
     + '</div></div></div>';

  /* 可发券商户号：提前提供给服务商配券使用，产生已推送批次后锁定 */
  h += '<div class="panel" style="margin-bottom:12px"><div class="panel-h"><h3>可发券商户号 <span class="tg tg-n">' + mchs.length + ' 个</span></h3>'
     + '<div class="flex"><span class="mut" style="font-size:12px">' + (mchLocked
        ? '已有推送批次，商户号已锁定，不可新增或修改'
        : '服务商配券只能使用以下商户号，推送后锁定') + '</span></div></div>'
     + '<div class="panel-b"><div class="flex" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">';
  if(!mchs.length) h += '<span class="mut">还没有提供可发券商户号</span>';
  mchs.forEach(function(m){
    h += '<span class="tg tg-n sx-mono">' + pnEsc(m) + (mchLocked ? '' : ' <a style="cursor:pointer;margin-left:6px" onclick="miniMchDel(\'' + pnEsc(m) + '\')">×</a>') + '</span>';
  });
  h += '</div>';
  if(!mchLocked){
    h += '<div class="flex" style="gap:8px"><input class="inp" id="miniMchNew" placeholder="输入 8~10 位微信商户号" style="max-width:260px" onkeydown="if(event.key===\'Enter\')miniMchAdd()">'
       + '<button class="btn btn-o btn-xs" onclick="miniMchAdd()">＋ 添加商户号</button></div>';
  }
  h += '<div class="fld-hint" style="margin-top:8px">' + (mchLocked
        ? '如需调整，请在配券前完成；当前小程序已产生推送记录，按规则不可再改。'
        : '必须在小程序配券前提供；一旦产生已推送批次，将不可新增或修改。') + '</div>'
     + '</div></div>';

  /* 发券任务 */
  h += '<div class="panel" style="margin-bottom:12px"><div class="panel-h"><h3>发券任务 <span class="tg tg-n">' + tasks.length + ' 个</span></h3>'
     + '<div class="flex"><button class="btn btn-p btn-xs" onclick="openMiniNew()">＋ 创建发券任务</button></div></div>'
     + '<div class="panel-b" style="padding:0"><table class="bt mini" style="table-layout:fixed"><thead><tr>'
     + '<th style="width:170px">任务号</th><th style="width:230px">项目</th><th>批次</th>'
     + '<th style="width:150px">推送时间</th><th style="width:96px">状态</th>'
     + '</tr></thead><tbody>';
  if(!tasks.length){
    h += '<tr><td colspan="5" class="empty-row">还没有发券任务，点右上「创建发券任务」按项目圈选批次</td></tr>';
  } else {
    tasks.forEach(function(t){
      var bats = t.rows.map(function(r){ return r.bat; }).join('、');
      h += '<tr><td class="sx-mono" style="font-size:11.6px">' + pnEsc(t.task) + '</td>'
        + '<td>' + pnEsc(t.projName) + '<div class="muted sx-mono" style="font-size:11px">项目编号 ' + pnEsc(projCodeText(t.proj)) + '</div></td>'
        + '<td class="sx-mono" style="font-size:11.6px">' + pnEsc(bats) + '<div class="muted" style="font-size:11px">共 ' + t.rows.length + ' 个批次</div></td>'
        + '<td class="sx-mono" style="font-size:11.4px;white-space:nowrap">' + pnEsc(t.at) + '</td>'
        + '<td><span class="tg tg-g">已推送</span></td></tr>';
    });
  }
  h += '</tbody></table></div></div>';

  /* 已推送批次 */
  h += '<div class="panel"><div class="panel-h"><h3>已推送批次 <span class="tg tg-n">' + ps.length + ' 个</span></h3>'
     + '<div class="flex"><span class="mut" style="font-size:12px">推送后由小程序方配券，平台不再记录配券状态</span></div></div>'
     + '<div class="panel-b" style="padding:0"><table class="bt mini" style="table-layout:fixed"><thead><tr>'
     + '<th style="width:110px">批次号</th><th style="width:250px">项目 / 计划</th><th style="width:130px">商户号</th>'
     + '<th style="width:150px">推送时间</th><th style="width:96px">状态</th>'
     + '</tr></thead><tbody>';
  if(!ps.length){
    h += '<tr><td colspan="5" class="empty-row">该渠道还没有推送过批次</td></tr>';
  } else {
    ps.forEach(function(x){
      h += '<tr><td class="sx-mono" style="font-size:11.8px"><b>' + pnEsc(x.bat) + '</b></td>'
        + '<td>' + pnEsc(x.projName) + '<div class="muted" style="font-size:11px">' + pnEsc(x.plan) + ' · 项目编号 ' + pnEsc(projCodeText(x.proj)) + '</div></td>'
        + '<td class="sx-mono" style="font-size:11.6px">' + pnEsc(x.mch) + '</td>'
        + '<td class="sx-mono" style="font-size:11.4px;white-space:nowrap">' + pnEsc(x.at) + '</td>'
        + '<td><span class="tg tg-g">已推送</span></td></tr>';
    });
  }
  h += '</tbody></table></div></div>';

  box.innerHTML = h;
}

/* ---------- 创建发券任务：按进行中项目圈选「已有批次号」的批次 ---------- */
var MINI_TASK = { proj:'', sel:{} };

function miniRunningProjects(){
  return (window.PROJECTS || []).filter(function(p){ return p.state === 'running'; });
}

function miniProjBatches(projId, appId){
  return (window.PLANS || []).filter(function(p){
    if(p.projectId !== projId || p.proj !== projId) return false;
    if(!p.bat) return false;
    return !MINI_PUSH.some(function(x){ return x.bat === p.bat && x.appId === appId; });
  });
}

function openMiniNew(){
  var a = miniApp(MINI_CUR); if(!a) return;
  var ps = miniRunningProjects();
  MINI_TASK = { proj: ps.length ? ps[0].id : '', sel:{} };
  var sel = document.getElementById('mtProj');
  sel.innerHTML = ps.map(function(p){ return '<option value="' + p.id + '">' + pnEsc(p.name) + ' · ' + pnEsc(p.code || p.id) + '</option>'; }).join('') || '<option value="">没有进行中的项目</option>';
  if(ps.length) sel.value = ps[0].id;
  document.getElementById('mtApp').textContent = a.name + '（' + a.appid + '）';
  miniTaskBatches();
  openDrawer('dw-minitask');
}

function miniTaskProj(v){ MINI_TASK.proj = v; MINI_TASK.sel = {}; miniTaskBatches(); }

function miniTaskBatches(){
  var a = miniApp(MINI_CUR); if(!a) return;
  var list = miniProjBatches(MINI_TASK.proj, a.id);
  var box = document.getElementById('mtList'); if(!box) return;
  if(!list.length){
    box.innerHTML = '<div class="empty-row">该项目没有可推送的批次（需先由服务商回传批次号，且未推送过当前渠道）</div>';
  } else {
    box.innerHTML = '<table class="bt mini" style="table-layout:fixed"><thead><tr><th style="width:34px"></th><th style="width:96px">批次号</th><th style="width:150px">计划</th><th style="width:88px">面额</th><th style="width:96px">门槛</th><th style="width:112px">商户号</th><th>有效期</th></tr></thead><tbody>'
      + list.map(function(p){
          var mch = (p.exec && p.exec.mch) ? p.exec.mch : '—';
          return '<tr><td><input type="checkbox" ' + (MINI_TASK.sel[p.bat] ? 'checked' : '') + ' onchange="miniTaskToggle(\'' + pnEsc(p.bat) + '\')"></td>'
            + '<td class="sx-mono" style="font-size:11.8px"><b>' + pnEsc(p.bat) + '</b></td>'
            + '<td>' + pnEsc(p.name) + '</td>'
            + '<td class="num">' + (p.face ? '¥' + p.face : '—') + '</td>'
            + '<td class="num">' + (p.thr ? '满 ' + p.thr : '—') + '</td>'
            + '<td class="sx-mono" style="font-size:11.6px">' + pnEsc(mch) + '</td>'
            + '<td class="muted" style="font-size:11.4px">' + pnEsc((p.bs || p.s || '') + ' ~ ' + (p.be || p.e || '')) + '</td></tr>';
        }).join('') + '</tbody></table>';
  }
  var c = document.getElementById('mtCnt');
  if(c) c.textContent = '已选 ' + Object.keys(MINI_TASK.sel).length + ' 个批次 / 可推送 ' + list.length + ' 个';
}

function miniTaskToggle(bat){
  if(MINI_TASK.sel[bat]) delete MINI_TASK.sel[bat]; else MINI_TASK.sel[bat] = 1;
  miniTaskBatches();
}

function miniTaskOk(){
  var a = miniApp(MINI_CUR); if(!a) return;
  var keys = Object.keys(MINI_TASK.sel);
  if(!keys.length){ MT.toast('请先勾选要推送的批次', 'err'); return; }
  var proj = (window.PROJECTS || []).filter(function(p){ return p.id === MINI_TASK.proj; })[0] || {};
  var now = (typeof wfNow === 'function') ? wfNow() : '';
  var no = 'MT-' + now.replace(/[^0-9]/g, '').slice(0, 8) + '-' + String(MINI_PUSH.length + 1).padStart(2, '0');
  keys.forEach(function(bat){
    var p = (window.PLANS || []).filter(function(x){ return x.bat === bat; })[0] || {};
    MINI_PUSH.unshift({
      bat: bat, appId: a.id, task: no,
      proj: MINI_TASK.proj, projName: proj.name || MINI_TASK.proj,
      plan: p.name || '',
      mch: (p.exec && p.exec.mch) ? p.exec.mch : '—',
      at: now
    });
  });
  mnPersist(); closeDrawer(); miniRenderDetail();
  sysLog('挂券与配置', '推送批次', no, MINI_TASK.proj, '渠道 ' + a.name + '；批次 ' + keys.join('、'));
  MT.toast('已推送 ' + keys.length + ' 个批次给「' + a.name + '」，由小程序方配券');
}

function tplDrawerminitask(){
  return `<div class="drawer" id="dw-minitask" style="width:820px">
  <div class="dw-h"><h3>创建发券任务 <span class="sub">圈选批次 → 核对 → 推送给小程序方</span></h3><span class="dw-x" onclick="closeDrawer()">×</span></div>
  <div class="dw-b">
    <div class="note b" style="margin-top:0">只能推送<b>进行中项目</b>里<b>服务商已上传批次号</b>的批次；推送后由小程序方配券，平台只记录推送时间与渠道。</div>
    <div class="fr" style="margin-top:14px"><label>推送渠道</label><div class="locked" id="mtApp">—</div></div>
    <div class="fr"><label>选择项目（仅进行中）<em>*</em></label>
      <select class="inp" id="mtProj" onchange="miniTaskProj(this.value)"></select>
      <div class="fld-hint">项目必须是执行中状态；批次号由服务商在微信支付后台生成后回传</div>
    </div>
    <div class="fr"><label>核对可推送批次</label>
      <div class="tw scroll" style="border:1px solid var(--line2);border-radius:7px;max-height:300px" id="mtList"></div>
      <div class="flex" style="margin-top:8px"><span class="mut" id="mtCnt"></span></div>
      <div class="fld-hint">核对批次号与商户号无误后再推送；推送后不撤回，需要调整请重新推送</div>
    </div>
  </div>
  <div class="dw-f">
    <div class="lft">推送 = 把批次交给小程序方配券，不在此处配券</div>
    <div class="rgt"><button class="btn btn-g" onclick="closeDrawer()">取消</button><button class="btn btn-p" onclick="miniTaskOk()">确认推送</button></div>
  </div>
</div>`;
}

MT.defineDrawer('dw-minitask', tplDrawerminitask);

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-h5",
  title: "挂券与配置",
  crumb: "运营执行 / 挂券与配置",
  group: "运营执行",
  template: tplPageh5
});

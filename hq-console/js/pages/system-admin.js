/* =============================================================================
 * pages/system-admin.js — 系统管理
 * 结构：三个页签（角色与权限 / 组织架构 / 服务商配置），每页签只有列表，
 *      权限矩阵与服务商编辑各自走抽屉，避免列表与详情同页混显。
 * ========================================================================== */

var ADM_TAB = 'role';

/* ---------- 服务商列表 ---------- */
function renderVendors(){
  var box = document.getElementById('vsTbody'); if(!box) return;
  var h = '';
  VENDORS.forEach(function(v, i){
    var c = (v.cms && v.cms[0]) || { n:'—', e:'' };
    h += '<tr>'
      + '<td><b>' + pnEsc(v.name) + '</b><div class="muted sx-mono">' + pnEsc(v.code) + '</div></td>'
      + '<td class="sx-mono">' + pnEsc(v.mch || '—') + '</td>'
      + '<td class="vc-cm"><b>' + pnEsc(c.n) + '</b><div class="muted" style="font-size:11.2px;line-height:1.4">' + pnEsc(c.e) + '</div></td>'
      + '<td class="vc-rm">' + pnEsc(v.remark || '—') + '</td>'
      + '<td><span class="tg tg-g">启用</span></td>'
      + '<td style="white-space:nowrap"><button class="btn btn-o btn-xs" onclick="openVs(' + i + ')">编辑</button> '
      + '<button class="btn btn-g btn-xs">停用</button></td>'
      + '</tr>';
  });
  box.innerHTML = h || '<tr><td colspan="6" class="empty-row">暂无服务商</td></tr>';

  var tg = document.getElementById('vsCnt');
  if(tg) tg.textContent = VENDORS.length + ' 家';
}

/* ---------- 角色列表 ---------- */
function renderRoles(){
  var box = document.getElementById('roleTbody'); if(!box) return;
  var h = '';
  ROLES.forEach(function(r){
    var menuTxt = r.noAccount
      ? '<b>不发账号、不进系统</b>'
      : (r.menus.length === MENUS.length ? '全部菜单' : r.menus.length + ' 个菜单');
    h += '<tr>'
      + '<td><b>' + pnEsc(r.name) + '</b><div class="muted" style="font-size:11.4px">' + pnEsc(r.desc) + '</div></td>'
      + '<td>' + pnEsc(r.owner) + '</td>'
      + '<td>' + menuTxt + '</td>'
      + '<td><span class="tg ' + (r.status === '启用' ? 'tg-g' : 'tg-n') + '">' + r.status + '</span></td>'
      + '<td style="white-space:nowrap">'
      + (r.noAccount ? '<span class="muted">—</span>'
          : '<button class="btn btn-o btn-xs" onclick="openRole(\'' + r.key + '\')">配置</button>')
      + '</td>'
      + '</tr>';
  });
  box.innerHTML = h;
  var tg = document.getElementById('roleCnt');
  if(tg) tg.textContent = ROLES.length + ' 个角色';
}

/* ---------- 组织架构列表 ---------- */
function renderOrgs(){
  var box = document.getElementById('orgTbody'); if(!box) return;
  box.innerHTML = ORGS.map(function(o){
    return '<tr>'
      + '<td>' + pnEsc(o.level) + '</td>'
      + '<td><b>' + pnEsc(o.name) + '</b></td>'
      + '<td>' + pnEsc(o.up) + '</td>'
      + '<td>' + pnEsc(o.down) + '</td>'
      + '<td><span class="tg tg-g">' + o.status + '</span></td>'
      + '</tr>';
  }).join('');
}

/* ---------- 页签 ---------- */
function admTab(k){
  ADM_TAB = k;
  ['role','org','vendor'].forEach(function(x){
    var el = document.getElementById('admTab-' + x);
    if(el) el.style.display = (x === k ? '' : 'none');
  });
  var btns = document.querySelectorAll('#admTabs .atab');
  for(var i=0;i<btns.length;i++) btns[i].classList.toggle('on', btns[i].getAttribute('data-tab') === k);
}

/* ---------- 角色配置（抽屉） ---------- */
function openRole(key){
  var r = roleByKey(key); if(!r) return;
  ROLE_EDIT = key;

  document.getElementById('roleDwTitle').innerHTML = '角色配置 <span class="sub">' + pnEsc(r.name) + '</span>';
  document.getElementById('roleMenuBody').innerHTML = MENUS.map(function(m){
    var on = r.menus.indexOf(m.key) >= 0;
    return '<tr><td>' + pnEsc(m.name) + '</td>'
      + '<td style="width:110px"><label class="chk"><input type="checkbox" data-menu="' + m.key + '"' + (on ? ' checked' : '') + '>已启用</label></td></tr>';
  }).join('');
  openDrawer('dw-role');
}

var ROLE_EDIT = '';

function roleSave(){
  var r = roleByKey(ROLE_EDIT); if(!r) return;
  var boxes = document.querySelectorAll('#roleMenuBody input[data-menu]');
  var menus = [];
  for(var i=0;i<boxes.length;i++){ if(boxes[i].checked) menus.push(boxes[i].getAttribute('data-menu')); }
  if(!menus.length){ MT.toast('至少保留一个菜单', 'err'); return; }
  r.menus = menus;
  closeDrawer();
  renderRoles();
  MT.toast('「' + r.name + '」权限已更新');
}

/* ---------- 模板：v-admin ---------- */
function tplPageadmin(){
  return `<div class="view" id="v-admin">
  <div class="panel">
    <div class="panel-h">
      <h3>系统管理</h3>
      <div class="flex"><span class="muted">角色与权限、组织架构、服务商配置集中在此维护</span></div>
    </div>
    <div id="admTabs" class="steps">
      <div class="atab on" data-tab="role" onclick="admTab('role')">角色与权限 <span class="c" id="roleCnt">2 个角色</span></div>
      <div class="atab" data-tab="org" onclick="admTab('org')">组织架构 <span class="c">5 个节点</span></div>
      <div class="atab" data-tab="vendor" onclick="admTab('vendor')">服务商配置 <span class="c" id="vsCnt">5 家</span></div>
    </div>
  </div>

  <!-- 角色与权限 -->
  <div id="admTab-role">
    <div class="panel">
      <div class="panel-h">
        <h3>角色列表</h3>
        <div class="flex"><span class="muted">点「配置」维护菜单；数据可见范围固定为项目创建人、活动负责人及对应审批人</span></div>
      </div>
      <div class="panel-b" style="padding:0">
        <div class="tw scroll" style="border:none;box-shadow:none;border-radius:0">
          <table class="bt">
            <thead><tr>
              <th style="width:36%">角色</th>
              <th style="width:24%">人员归属</th>
              <th style="width:20%">菜单范围</th>
              <th style="width:10%">状态</th>
              <th style="width:96px">操作</th>
            </tr></thead>
            <tbody id="roleTbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- 组织架构 -->
  <div id="admTab-org" style="display:none">
    <div class="panel">
      <div class="panel-h">
        <h3>组织架构</h3>
        <div class="flex"><span class="muted">组织架构用于人员归属与创建项目时的人员选择</span></div>
      </div>
      <div class="panel-b" style="padding:0">
        <div class="tw scroll" style="border:none;box-shadow:none;border-radius:0">
          <table class="bt">
            <thead><tr>
              <th style="width:12%">层级</th>
              <th style="width:32%">名称</th>
              <th style="width:22%">上级</th>
              <th style="width:20%">下辖</th>
              <th style="width:10%">状态</th>
            </tr></thead>
            <tbody id="orgTbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- 服务商配置 -->
  <div id="admTab-vendor" style="display:none">
    <div class="panel">
      <div class="panel-h">
        <h3>服务商配置</h3>
        <div class="flex">
          <span class="muted">一个服务商只维护一个对接联系人 / 邮箱</span>
          <button class="btn btn-p btn-xs" onclick="openVs(-1)">＋ 新增服务商</button>
        </div>
      </div>
      <div class="panel-b" style="padding:0">
        <div class="tw scroll" style="border:none;box-shadow:none;border-radius:0">
          <table class="bt vcs-tbl">
            <thead><tr>
              <th style="width:28%">服务商名称</th>
              <th style="width:14%">归属商户号</th>
              <th style="width:22%">对接联系人 / 邮箱</th>
              <th>备注</th>
              <th style="width:8%">状态</th>
              <th style="width:116px">操作</th>
            </tr></thead>
            <tbody id="vsTbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

/* ---------- 模板：dw-role ---------- */
function tplDrawerrole(){
  return `<div class="drawer" id="dw-role" style="width:560px">
  <div class="dw-h">
    <h3 id="roleDwTitle">角色配置</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">
    <div class="psec"><h4>菜单权限</h4><span class="psec-r">勾选可访问的菜单</span></div>
    <table class="bt mini" style="table-layout:fixed">
      <thead><tr><th>菜单</th><th style="width:110px">启用</th></tr></thead>
      <tbody id="roleMenuBody"></tbody>
    </table>
  </div>
  <div class="dw-f">
    <div class="lft">系统管理菜单不对业务角色开放</div>
    <div class="rgt">
      <button class="btn btn-g" onclick="closeDrawer()">取消</button>
      <button class="btn btn-p" onclick="roleSave()">保存</button>
    </div>
  </div>
</div>`;
}

MT.defineDrawer('dw-role', tplDrawerrole);

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-admin",
  title: "系统管理",
  crumb: "系统配置 / 系统管理",
  group: "配置",
  template: tplPageadmin
});

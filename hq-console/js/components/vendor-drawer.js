/* =============================================================================
 * components/vendor-drawer.js — 服务商新增 / 编辑抽屉
 * 对应待确认清单标黄项 12：「一个服务商仅一个对接联系人 / 邮箱。
 * 选公司后自动带出唯一联系人；内部由谁跟进由服务商自行分配，不在系统体现。」
 * 因此本抽屉只有一组「联系人 + 邮箱」，不再维护多条联系人。
 * ========================================================================== */

/** 编辑上下文：idx = -1 表示新增 */
var VS = { idx:-1 };

function openVs(idx){
  VS.idx = (typeof idx === 'number') ? idx : -1;
  var editing = VS.idx >= 0;
  var d = VENDORS[VS.idx] || null;

  document.getElementById('vsTitle').innerHTML = (editing ? '编辑服务商' : '新增服务商')
    + ' <span class="sub">保存后可在项目创建时被选择</span>';
  document.getElementById('vsName').value = d ? d.name : '';
  document.getElementById('vsCode').value = d ? (d.code || '') : '保存后自动生成';
  document.getElementById('vsRemark').value = d ? (d.remark || '') : '';

  /* 唯一联系人：兼容历史数据结构（cms 数组只取第一条） */
  var c = (d && d.cms && d.cms[0]) ? d.cms[0] : { n:'', e:'' };
  document.getElementById('vsContact').value = c.n || '';
  document.getElementById('vsEmail').value = c.e || '';
  document.getElementById('vsMch').value = d ? (d.mch || '') : '';

  document.querySelector('#dw-vs .dw-f .lft').innerHTML =
    '当前 <b>' + VENDORS.length + '</b> 家 · 每个服务商只维护一个对接邮箱';

  openDrawer('dw-vs');
}

function vsSave(){
  var name = (document.getElementById('vsName').value || '').trim();
  var cn   = (document.getElementById('vsContact').value || '').trim();
  var em   = (document.getElementById('vsEmail').value || '').trim();
  var rk   = (document.getElementById('vsRemark').value || '').trim();
  var mch  = (document.getElementById('vsMch').value || '').trim();

  var mchRaw = mch.replace(/\s/g, '');
  if(!mchRaw){ MT.toast('请填写归属商户号', 'err'); document.getElementById('vsMch').focus(); return; }
  if(!/^\d{6,16}$/.test(mchRaw)){ MT.toast('归属商户号应为 6~16 位数字', 'err'); document.getElementById('vsMch').focus(); return; }
  if(!name){ MT.toast('请填写服务商名称', 'err'); document.getElementById('vsName').focus(); return; }
  if(!cn || !em){ MT.toast('联系人与邮箱需成对填写', 'err'); (cn ? document.getElementById('vsEmail') : document.getElementById('vsContact')).focus(); return; }
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ MT.toast('邮箱格式不正确', 'err'); document.getElementById('vsEmail').focus(); return; }

  var obj = { name:name, mch:mchRaw, cms:[{ n:cn, e:em }], remark:rk };
  if(VS.idx >= 0){
    var v = VENDORS[VS.idx];
    for(var k in obj) v[k] = obj[k];
  } else {
    obj.code = 'SVC-' + ('000' + (VENDORS.length + 1)).slice(-4);
    VENDORS.push(obj);
  }

  closeDrawer();
  renderVendors();
  if(typeof initProjVendor === 'function') initProjVendor();
  MT.toast(VS.idx >= 0 ? '服务商已更新' : '服务商已新增');
}

/* ---------- 模板：dw-vs ---------- */
function tplDrawervs(){
  return `<div class="drawer" id="dw-vs" style="width:600px">
  <div class="dw-h">
    <h3 id="vsTitle">新增服务商</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">
    <div class="note b" style="margin-top:0">
      <b>一个服务商只有一个对接联系人 / 邮箱。</b>系统只记录对外对接人，服务商内部由谁跟进由其自行分配，不在本系统体现。
    </div>

    <div class="fr">
      <label>服务商名称<em>*</em></label>
      <input class="inp" id="vsName" placeholder="营业执照上的公司全称">
    </div>

    <div class="fg c2">
      <div class="fr">
        <label>服务商编码</label>
        <input class="inp" id="vsCode" readonly style="background:var(--bg-soft);color:var(--ink-60)">
      </div>
      <div class="fr">
        <label>归属商户号<em>*</em></label>
        <input class="inp" id="vsMch" placeholder="微信支付商户号，如 1035891372">
        <div class="fld-hint">项目选用该服务商时自动带出，可按项目调整</div>
      </div>
    </div>

    <div class="psec"><h4>对接联系人</h4><span class="psec-r">唯一</span></div>
    <div class="fg c2">
      <div class="fr">
        <label>联系人姓名<em>*</em></label>
        <input class="inp" id="vsContact" placeholder="如：胡文志">
      </div>
      <div class="fr">
        <label>对接邮箱<em>*</em></label>
        <input class="inp" id="vsEmail" type="email" placeholder="huwz@zhishi.com">
        <div class="fld-hint">审批通过后，活动链接与推送邮件只发送到该邮箱</div>
      </div>
    </div>

    <div class="fr">
      <label>备注</label>
      <textarea class="inp" id="vsRemark" rows="3" placeholder="如：承接区域、结算方式、SLA 要求等"></textarea>
    </div>
  </div>
  <div class="dw-f">
    <div class="lft">当前 <b>5</b> 家 · 每个服务商只维护一个对接邮箱</div>
    <div class="rgt">
      <button class="btn btn-g" onclick="closeDrawer()">取消</button>
      <button class="btn btn-p" onclick="vsSave()">保存</button>
    </div>
  </div>
</div>`;
}

MT.defineDrawer('dw-vs', tplDrawervs);

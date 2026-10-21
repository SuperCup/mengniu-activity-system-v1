/* =============================================================================
 * components/batch-drawer.js — 补充计划批次信息
 * 对应待确认清单标黄项 3：「支持补充计划批次信息，复制微信支付后台的必填字段
 * 和规则规划，展示字段使用示例图」。
 * 字段、单位、长度与校验规则 1:1 对齐微信支付商户平台「代金券 / 商家券批次」创建页，
 * 每个字段下方给出填写示例，右侧给出消费者卡包里的示例图。
 * ========================================================================== */

/** 微信支付后台批次字段限制（校验规则集中在此，便于和商户平台台账对齐） */
var BATCH_FIELDS = {
  nameMax: 9,          // 券名称最多 9 个汉字
  spanMax: 90,         // 可用时间跨度最多 90 天
  userMin: 1, userMax: 100,
  descMax: 100
};

var BAT_EDIT = { idx:-1 };

/* ---------- 打开抽屉 ---------- */
function openBatch(idx){
  idx = (typeof idx === 'number') ? idx : parseInt(idx, 10);
  var p = PLANS[idx];
  if(!p){ MT.toast('未找到对应计划', 'err'); return; }
  BAT_EDIT.idx = idx;

  /* 明细草稿与计划抽屉共用：零售商门店 / 活动商品 */
  PN.idx = idx;
  pnLoadRows(p);

  var b = p.batchForm || {};
  document.getElementById('batTitle').innerHTML = '补充批次信息'
    + ' <span class="sub">' + pnEsc(p.pid) + ' · ' + pnEsc(p.name) + '</span>';

  document.getElementById('bfName').value  = b.name || (p.name || '').slice(0, BATCH_FIELDS.nameMax);
  document.getElementById('bfFace').value  = b.face != null ? b.face : p.face;
  document.getElementById('bfThr').value   = b.thr != null ? b.thr : p.thr;
  document.getElementById('bfStart').value = b.start || p.s;
  document.getElementById('bfEnd').value   = b.end || p.e;
  document.getElementById('bfCap').value   = b.cap != null ? b.cap : p.qty;
  document.getElementById('bfUser').value  = b.user != null ? b.user : 2;
  document.getElementById('bfDesc').value  = b.desc || '限指定商品使用，不可兑换现金，可在微信支付卡包查看。';
  document.getElementById('bfBatNo').value = b.batNo || (p.bat || '');

  batchPreview();
  pnRender();
  openDrawer('dw-batch');
}

/** 按计划 ID 打开批次信息页（深链接 / 工作台入口用） */
function openBatchById(pid){
  var i = PLANS.map(function(x){ return x.id; }).indexOf(pid);
  if(i < 0){ MT.toast('未找到对应计划', 'err'); return; }
  openBatch(i);
}

/* ---------- 右侧示例图：券在消费者卡包里的样子 ---------- */
function batchPreview(){
  var face  = document.getElementById('bfFace').value || 0;
  var thr   = document.getElementById('bfThr').value || 0;
  var start = document.getElementById('bfStart').value || '';
  var end   = document.getElementById('bfEnd').value || '';
  var name  = document.getElementById('bfName').value || '券名称';
  var desc  = document.getElementById('bfDesc').value || '';
  var m = function(v){ return String(Number(v) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };

  var box = document.getElementById('batPreviewCard');
  if(box){
    box.innerHTML = '<div class="wxcard">'
      + '<div class="wxcard-l"><span class="amt">¥<b>' + m(face) + '</b></span>'
      +   '<span class="thr">满 ' + m(thr) + ' 元可用</span></div>'
      + '<div class="wxcard-r"><b>' + pnEsc(name) + '</b>'
      +   '<small>' + (start ? mnDate(start) : '—') + ' 至 ' + (end ? mnDate(end) : '—') + '</small>'
      +   '<small class="mut">' + pnEsc(desc.slice(0, 26)) + (desc.length > 26 ? '…' : '') + '</small></div>'
      + '</div>';
  }
  var span = 0;
  if(start && end) span = Math.round((new Date(end) - new Date(start)) / 86400000);
  var sp = document.getElementById('bfSpan');
  if(sp){
    sp.innerHTML = start && end ? ('可用时间跨度 <b>' + span + '</b> 天（上限 ' + BATCH_FIELDS.spanMax + ' 天）') : '';
    sp.className = span > BATCH_FIELDS.spanMax ? 'mut err' : 'mut';
  }
  var nm = document.getElementById('bfNameLen');
  if(nm){
    var len = (document.getElementById('bfName').value || '').length;
    nm.textContent = len + ' / ' + BATCH_FIELDS.nameMax + ' 个汉字';
    nm.className = len > BATCH_FIELDS.nameMax ? 'mut err' : 'mut';
  }
  var dc = document.getElementById('bfDescLen');
  if(dc){
    var dl = (document.getElementById('bfDesc').value || '').length;
    dc.textContent = dl + ' / ' + BATCH_FIELDS.descMax + ' 字';
    dc.className = dl > BATCH_FIELDS.descMax ? 'mut err' : 'mut';
  }
}

/* ---------- 保存：校验后写回计划，批次与计划 1:1 ---------- */
function batchSave(){
  var p = PLANS[BAT_EDIT.idx];
  if(!p) return;

  var name  = (document.getElementById('bfName').value || '').trim();
  var face  = Number(document.getElementById('bfFace').value);
  var thr   = Number(document.getElementById('bfThr').value);
  var start = document.getElementById('bfStart').value;
  var end   = document.getElementById('bfEnd').value;
  var capRaw = document.getElementById('bfCap').value;
  var userRaw = document.getElementById('bfUser').value;
  var desc  = (document.getElementById('bfDesc').value || '').trim();
  var batNo = (document.getElementById('bfBatNo').value || '').trim();

  /* 只做确定性校验：不强制「门槛大于面额」，也不限制 90 天 / 100 张 / 100 字
     —— 这些上限在不同产品与账号下并不一致，统一登记在 docs/微信执行字段待核验.md */
  if(!name){ MT.toast('请填写券名称', 'err'); return; }
  if(!isFinite(face) || face <= 0){ MT.toast('券面额必须大于 0', 'err'); return; }
  if(!isFinite(thr) || thr < 0){ MT.toast('使用门槛必须是不小于 0 的数字', 'err'); return; }
  if(!start || !end || start > end){ MT.toast('可用时间开始日不能晚于结束日', 'err'); return; }

  var cap = Number(capRaw);
  if(!isFinite(cap) || cap <= 0 || Math.abs(cap - Math.round(cap)) > 1e-9){
    MT.toast('发放总上限必须是正整数', 'err'); return;
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

  if(!PN.ret.length){ MT.toast('请先导入至少 1 条活动零售商明细', 'err'); return; }
  if(!PN.sku.length){ MT.toast('请先导入至少 1 条活动商品明细', 'err'); return; }

  p.batchForm = { name:name, face:face, thr:thr, start:start, end:end,
                  cap:cap, user:user, desc:desc, batNo:batNo };

  /* 零售商门店 / 活动商品明细：保存到计划，供计划详情、领券页与推送使用 */
  p.retRows = PN.ret.map(function(x){ return Object.assign({}, x); });
  p.skuRows = PN.sku.map(function(x){ return Object.assign({}, x); });
  p.ret = PN.ret.map(function(x){ return x.store || x.n; }).filter(Boolean);
  p.sku = PN.sku.map(function(x){ return x.name || x.n; }).filter(Boolean);
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

  sysLog('计划与批次', '保存批次配置', p.name, p.id,
    '券名称 ' + name + '；面额 ' + face + ' 元；门槛 ' + thr + ' 元；可用 ' + start + ' ~ ' + end
    + '；零售商 ' + PN.ret.length + ' 条；商品 ' + PN.sku.length + ' 条');

  if(typeof mnPersist === 'function') mnPersist();
  closeDrawer();
  renderPlans();
  if(typeof renderProjCards === 'function') renderProjCards();
  MT.toast(batNo
    ? '批次信息已保存，等待服务商在商户后台创建后回填审核结果'
    : '批次信息已保存（未填批次号，保持未提报状态）');
}

/* ---------- 模板：dw-batch ---------- */
function tplDrawerBatch(){
  return `<div class="drawer dw-batch" id="dw-batch">
  <div class="dw-h">
    <h3 id="batTitle">补充批次信息</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">
    <div class="bat-grid">
      <div class="bat-form">
        <div class="psec"><h4>一、批次必填字段</h4><span class="psec-r">对标微信支付后台</span></div>

        <div class="fr">
          <label>券名称<em>*</em></label>
          <input class="inp" id="bfName" maxlength="20" oninput="batchPreview()" placeholder="如：双节满减券">
          <div class="fld-hint"><span id="bfNameLen" class="mut">0 / 9 个汉字</span> · 例：双节满减券（不超过 9 个汉字，超长商户平台直接拒绝）</div>
        </div>

        <div class="fr">
          <label>批次号</label>
          <input class="inp" id="bfBatNo" readonly placeholder="待服务商上传" style="background:var(--bg-soft);color:var(--ink-60)">
          <div class="fld-hint">由服务商在微信支付后台生成后回传，创建人不用填写</div>
        </div>

        <div class="fr">
          <label>券类型</label>
          <div class="locked"><b>满减券</b>　一期仅支持满减</div>
          <div class="fld-hint">例：满 99 减 15</div>
        </div>

        <div class="fg c2">
          <div class="fr">
            <label>券面额（元）<em>*</em></label>
            <input class="inp" id="bfFace" type="number" min="1" oninput="batchPreview()" placeholder="15">
            <div class="fld-hint">例：15　即为消费者实际抵扣金额</div>
          </div>
          <div class="fr">
            <label>使用门槛（元）<em>*</em></label>
            <input class="inp" id="bfThr" type="number" min="1" oninput="batchPreview()" placeholder="99">
            <div class="fld-hint">例：99　订单满 99 元可用，必须大于面额</div>
          </div>
        </div>

        <div class="fg c2">
          <div class="fr">
            <label>可用开始时间<em>*</em></label>
            <input class="inp" id="bfStart" type="date" onchange="batchPreview()">
          </div>
          <div class="fr">
            <label>可用结束时间<em>*</em></label>
            <input class="inp" id="bfEnd" type="date" onchange="batchPreview()">
          </div>
        </div>
        <div class="fld-hint" id="bfSpan"></div>

        <div class="psec"><h4>二、发放控制</h4></div>
        <div class="fg c2">
          <div class="fr">
            <label>发放总上限（张）<em>*</em></label>
            <input class="inp" id="bfCap" type="number" min="1" placeholder="9000">
            <div class="fld-hint">例：9000</div>
          </div>
          <div class="fr">
            <label>单人可领个数<em>*</em></label>
            <input class="inp" id="bfUser" type="number" min="1" max="100" placeholder="2">
            <div class="fld-hint">例：2　取值 1 ~ 100</div>
          </div>
        </div>

        <div class="fr">
          <label>使用说明（消费者可见）<em>*</em></label>
          <textarea class="inp" id="bfDesc" rows="3" oninput="batchPreview()" maxlength="200"></textarea>
          <div class="fld-hint"><span id="bfDescLen" class="mut">0 / 100 字</span> · 例：限指定商品使用，不可兑换现金，可在微信支付卡包查看。</div>
        </div>

      </div>

      <div class="bat-side">
        <div class="psec"><h4>字段示例图</h4><span class="psec-r">消费者卡包</span></div>
        <div id="batPreviewCard"></div>
        <div class="note b" style="margin-top:10px">消费者领券页面预览</div>
      </div>
    </div>

    <!-- 三、活动零售商明细 -->
    <div class="psec" style="margin-top:22px"><h4>三、活动零售商明细</h4><span class="psec-r"><b id="bfRetCnt">0</b> 条</span></div>
    <table class="bt mini" style="table-layout:fixed">
      <thead><tr>
        <th style="width:5%">#</th>
        <th style="width:17%">零售商名称</th>
        <th style="width:28%">门店名称</th>
        <th style="width:9%">省份</th>
        <th style="width:9%">城市</th>
        <th style="width:22%">微信商户号</th>
        <th style="width:10%">操作</th>
      </tr></thead>
      <tbody id="bfRetBody"><tr><td colspan="7" class="empty-row">尚未导入零售商 / 门店</td></tr></tbody>
    </table>
    <div class="imp-row" onclick="openImp('ret')">
      <span class="ic">⇪</span> 导入零售商门店名单
      <span class="hint">零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号</span>
    </div>
    <div class="note" id="bfMchTip" style="margin-top:10px">门店微信商户号可空，由服务商提报时补充</div>

    <!-- 四、活动商品明细 -->
    <div class="psec" style="margin-top:22px"><h4>四、活动商品明细</h4><span class="psec-r"><b id="bfSkuCnt">0</b> 条</span></div>
    <table class="bt mini" style="table-layout:fixed">
      <thead><tr>
        <th style="width:5%">#</th>
        <th style="width:24%">69码或店内码</th>
        <th style="width:44%">商品名称</th>
        <th style="width:18%">店内码所属零售商</th>
        <th style="width:9%">操作</th>
      </tr></thead>
      <tbody id="bfSkuBody"><tr><td colspan="5" class="empty-row">尚未导入商品</td></tr></tbody>
    </table>
    <div class="imp-row" onclick="openImp('sku')">
      <span class="ic">⇪</span> 导入商品明细
      <span class="hint">69码或店内码 / 商品名称 / 店内码所属零售商</span>
    </div>
  </div>
  <div class="dw-f">
    <div class="rgt" style="margin-left:auto">
      <button class="btn btn-g" onclick="closeDrawer()">取消</button>
      <button class="btn btn-p" onclick="batchSave()">保存批次信息</button>
    </div>
  </div>
</div>`;
}

MT.defineDrawer('dw-batch', tplDrawerBatch);

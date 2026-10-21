/* =============================================================================
 * components/batch-drawer.js — 补充计划批次信息
 * 对应待确认清单标黄项 3：「支持补充计划批次信息，复制微信支付后台的必填字段
 * 和规则规划，展示字段使用示例图」。
 * 字段、单位、长度与校验规则 1:1 对齐微信支付商户平台「代金券 / 商家券批次」创建页，
 * 每个字段下方给出填写示例，右侧给出消费者卡包里的示例图。
 * ========================================================================== */

/** 微信支付后台批次字段限制（校验规则集中在此，便于和商户平台台账对齐） */
var BATCH_FIELDS = {
  nameMax: 9,          // 批次名称最多 9 个汉字
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

  var b = p.batchForm || {};
  document.getElementById('batTitle').innerHTML = '补充批次信息'
    + ' <span class="sub">' + pnEsc(p.pid) + ' · ' + pnEsc(p.name) + '</span>';

  document.getElementById('bfName').value  = b.name || (p.name || '').slice(0, BATCH_FIELDS.nameMax);
  document.getElementById('bfMch').value   = b.mch || ((p.retRows && p.retRows[0] && p.retRows[0].mch) || '');
  document.getElementById('bfFund').value  = b.fund || '预充值';
  document.getElementById('bfFace').value  = b.face != null ? b.face : p.face;
  document.getElementById('bfThr').value   = b.thr != null ? b.thr : p.thr;
  document.getElementById('bfStart').value = b.start || p.s;
  document.getElementById('bfEnd').value   = b.end || p.e;
  document.getElementById('bfCap').value   = b.cap != null ? b.cap : p.qty;
  document.getElementById('bfDay').value   = b.day != null ? b.day : Math.min(p.qty || 0, 1000);
  document.getElementById('bfUser').value  = b.user != null ? b.user : 2;
  document.getElementById('bfDesc').value  = b.desc || '限指定商品使用，不可兑换现金，可在微信支付卡包查看。';
  document.getElementById('bfBatNo').value = b.batNo || (p.bat || '');

  /* 适用商户号：随计划导入的门店清单带出 */
  var mchs = ((p.retRows || []).map(function(r){ return r.mch; }).filter(Boolean));
  var miss = (p.retRows || []).filter(function(r){ return !r.mch; }).length;
  document.getElementById('bfMerchants').value = mchs.length ? mchs.join('、') : '（计划内门店均未填商户号，由服务商提报时补充）';
  document.getElementById('bfMerchants').title = mchs.join(', ');

  document.getElementById('bfMchTip').innerHTML = miss
    ? '<b>注意：</b>计划内仍有 ' + miss + ' 家门店未填微信商户号，批次创建后需在商户平台补齐，否则该门店无法核销。'
    : '计划内门店商户号已齐备。';

  batchPreview();
  openDrawer('dw-batch');
}

/* ---------- 右侧示例图：券在消费者卡包里的样子 ---------- */
function batchPreview(){
  var face  = document.getElementById('bfFace').value || 0;
  var thr   = document.getElementById('bfThr').value || 0;
  var start = document.getElementById('bfStart').value || '';
  var end   = document.getElementById('bfEnd').value || '';
  var name  = document.getElementById('bfName').value || '批次名称';
  var desc  = document.getElementById('bfDesc').value || '';
  var m = function(v){ return String(Number(v) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };

  var box = document.getElementById('batPreviewCard');
  if(box){
    box.innerHTML = '<div class="wxcard">'
      + '<div class="wxcard-l"><span class="amt">¥<b>' + m(face) + '</b></span>'
      +   '<span class="thr">满 ' + m(thr) + ' 元可用</span></div>'
      + '<div class="wxcard-r"><b>' + pnEsc(name) + '</b>'
      +   '<small>' + (start ? start.slice(5) : '—') + ' 至 ' + (end ? end.slice(5) : '—') + '</small>'
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
  var mch   = (document.getElementById('bfMch').value || '').trim();
  var fund  = document.getElementById('bfFund').value;
  var face  = Number(document.getElementById('bfFace').value);
  var thr   = Number(document.getElementById('bfThr').value);
  var start = document.getElementById('bfStart').value;
  var end   = document.getElementById('bfEnd').value;
  var cap   = Number(document.getElementById('bfCap').value);
  var day   = Number(document.getElementById('bfDay').value);
  var user  = Number(document.getElementById('bfUser').value);
  var desc  = (document.getElementById('bfDesc').value || '').trim();
  var batNo = (document.getElementById('bfBatNo').value || '').trim();

  /* 校验规则与微信支付商户平台保持一致 */
  if(!name){ MT.toast('请填写批次名称', 'err'); return; }
  if(name.length > BATCH_FIELDS.nameMax){ MT.toast('批次名称不超过 ' + BATCH_FIELDS.nameMax + ' 个汉字', 'err'); return; }
  if(!/^\d{8,12}$/.test(mch)){ MT.toast('请填写正确的微信支付商户号（8~12 位数字）', 'err'); return; }
  if(!(face > 0)){ MT.toast('券面额必须大于 0', 'err'); return; }
  if(!(thr > face)){ MT.toast('使用门槛必须大于券面额（微信支付规则）', 'err'); return; }
  if(!start || !end || start > end){ MT.toast('可用时间开始日不能晚于结束日', 'err'); return; }
  var span = Math.round((new Date(end) - new Date(start)) / 86400000);
  if(span > BATCH_FIELDS.spanMax){ MT.toast('可用时间跨度不超过 ' + BATCH_FIELDS.spanMax + ' 天', 'err'); return; }
  if(!(cap > 0)){ MT.toast('请填写发放总上限', 'err'); return; }
  if(day && day > cap){ MT.toast('单日发放上限不能超过发放总上限', 'err'); return; }
  if(!(user >= BATCH_FIELDS.userMin && user <= BATCH_FIELDS.userMax)){
    MT.toast('单个用户可领个数为 ' + BATCH_FIELDS.userMin + '~' + BATCH_FIELDS.userMax, 'err'); return;
  }
  if(!desc){ MT.toast('请填写使用说明（对消费者可见）', 'err'); return; }
  if(desc.length > BATCH_FIELDS.descMax){ MT.toast('使用说明不超过 ' + BATCH_FIELDS.descMax + ' 字', 'err'); return; }

  p.batchForm = { name:name, mch:mch, fund:fund, face:face, thr:thr, start:start, end:end,
                  cap:cap, day:day, user:user, desc:desc, batNo:batNo };
  p.face = face; p.thr = thr; p.qty = cap;
  p.bs = start; p.be = end; p.bqty = cap;
  p.bmech = '满 ' + thr + ' 元减 ' + face + ' 元';
  p.btitle = name;
  p.bstat = '已审核';
  p.bat = batNo || ('WX' + String(Date.now()).slice(-8));
  if(p.used == null) p.used = 0;
  if(p.usedAmt == null) p.usedAmt = 0;

  closeDrawer();
  renderPlans();
  MT.toast('批次信息已保存，与计划「' + p.name + '」一一对应');
}

/* ---------- 模板：dw-batch ---------- */
function tplDrawerBatch(){
  return `<div class="drawer dw-batch" id="dw-batch">
  <div class="dw-h">
    <h3 id="batTitle">补充批次信息</h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">
    <div class="note g" style="margin-top:0">
      <b>为什么需要补充：</b>批次号由服务商在微信支付商户平台创建后生成，系统不回写。为避免口径不一致，下列字段与规则完全复制微信支付后台，逐项填写后与计划绑定。
    </div>

    <div class="bat-grid">
      <div class="bat-form">
        <div class="psec"><h4>一、批次必填字段</h4><span class="psec-r">对标微信支付后台</span></div>

        <div class="fr">
          <label>批次名称<em>*</em></label>
          <input class="inp" id="bfName" maxlength="20" oninput="batchPreview()" placeholder="如：双节满减券">
          <div class="fld-hint"><span id="bfNameLen" class="mut">0 / 9 个汉字</span> · 例：双节满减券（不超过 9 个汉字，超长商户平台直接拒绝）</div>
        </div>

        <div class="fg c2">
          <div class="fr">
            <label>微信支付商户号<em>*</em></label>
            <input class="inp" id="bfMch" placeholder="1236057802">
            <div class="fld-hint">例：1236057802　随计划门店清单带出，可手工修正</div>
          </div>
          <div class="fr">
            <label>批次号（商户平台生成后回填）</label>
            <input class="inp" id="bfBatNo" placeholder="留空则自动生成示意编号">
            <div class="fld-hint">例：23020101　服务商建批后把批次号登记回来</div>
          </div>
        </div>

        <div class="fg c2">
          <div class="fr">
            <label>发放资金方<em>*</em></label>
            <select class="inp" id="bfFund">
              <option value="预充值">预充值</option>
              <option value="营销资金">营销资金</option>
              <option value="企业付款">企业付款</option>
            </select>
            <div class="fld-hint">例：预充值　资金未到账时无法发放，需先充值</div>
          </div>
          <div class="fr">
            <label>券类型</label>
            <div class="locked"><b>满减券</b>　一期仅支持满减</div>
            <div class="fld-hint">例：满 99 减 15</div>
          </div>
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
        <div class="fg c3">
          <div class="fr">
            <label>发放总上限（张）<em>*</em></label>
            <input class="inp" id="bfCap" type="number" min="1" placeholder="9000">
            <div class="fld-hint">例：9000</div>
          </div>
          <div class="fr">
            <label>单日发放上限（张）</label>
            <input class="inp" id="bfDay" type="number" min="0" placeholder="1000">
            <div class="fld-hint">例：1000　不得超过总上限</div>
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

        <div class="fr">
          <label>适用门店商户号</label>
          <input class="inp" id="bfMerchants" readonly style="background:var(--bg-soft);color:var(--ink-60)">
          <div class="fld-hint" id="bfMchTip"></div>
        </div>
      </div>

      <div class="bat-side">
        <div class="psec"><h4>字段示例图</h4><span class="psec-r">消费者卡包</span></div>
        <div id="batPreviewCard"></div>
        <div class="note" style="margin-top:12px">
          <b>微信支付后台字段顺序：</b><br>
          1. 批次名称 → 2. 商户号 → 3. 发放资金方 → 4. 券面额 / 使用门槛 → 5. 可用时间 → 6. 发放上限 → 7. 单人限领 → 8. 使用说明
        </div>
        <div class="note b" style="margin-top:10px">
          <b>平台侧硬性限制：</b>名称 ≤ 9 个汉字；门槛须大于面额；有效期跨度 ≤ 90 天；单人可领 1~100 张；资金不足无法发放。
        </div>
      </div>
    </div>
  </div>
  <div class="dw-f">
    <div class="lft">批次与计划一一对应，保存后状态变为「已审核」</div>
    <div class="rgt">
      <button class="btn btn-g" onclick="closeDrawer()">取消</button>
      <button class="btn btn-p" onclick="batchSave()">保存批次信息</button>
    </div>
  </div>
</div>`;
}

MT.defineDrawer('dw-batch', tplDrawerBatch);

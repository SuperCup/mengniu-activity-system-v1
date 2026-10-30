/* =============================================================================
 * pages/vendor-portal.js — 服务商操作页
 * 服务商端与总部端分离，此处展示邮件链接进入后的确认 / 提报动作。
 * ========================================================================== */

/* ---------- 模板：v-vendor ---------- */
function tplPagevendor(){
  return `<div class="view" id="v-vendor">
  <div class="panel">
    <div class="panel-h">
      <h3>服务商操作页 <span class="tg tg-a">免登录 · 邮件链接进入</span></h3>
      <span class="muted">由邮件专属链接直达，只在总部端菜单里做演示入口</span>
    </div>
    <div class="panel-b">
      <div class="cbox"><b>服务商没有系统账号。</b>打开邮件中的专属链接即可进入本页，令牌与项目编号绑定、设有效期、活动终止即回收。页面只展示该活动，不暴露预算总额与内部审批意见。</div>

      <!-- 活动摘要 -->
      <div class="vsum">
        <div class="vsum-h"><b>双节常温奶满减</b><span class="sx-mono">2026101810000005</span><span class="tg tg-g">服务商已确认</span></div>
        <div class="vsum-kv">
          <div><span>活动周期</span><b>2026-12-20 ~ 2027-01-05</b></div>
          <div><span>投放平台</span><b>微信支付</b></div>
          <div><span>核销预算</span><b>¥400,000.00</b></div>
          <div><span>计划 / 批次</span><b>3 个计划 · 3 个批次</b></div>
        </div>
      </div>

      <!-- 邮件通知模板（完整示例） -->
      <div class="vsec">
        <div class="vsec-h"><b>邮件通知模板</b><span class="tg tg-n">发给服务商的专属链接邮件</span></div>
        <div class="mail">
          <div class="mail-h">
            <div class="r"><span class="k">发件人</span><span>蒙牛活动管理平台 &lt;no-reply@mengniu.com.cn&gt;</span></div>
            <div class="r"><span class="k">收件人</span><span>huwz@zhishi.com（上海智士网络科技 · 胡味芝）</span></div>
            <div class="r"><span class="k">主题</span><span><b>【活动执行通知】双节常温奶满减 · 项目编号 2026101810000005 待您确认</b></span></div>
          </div>
          <div class="mail-b">
            <div class="bt">您好，有一项活动待确认执行</div>
            <div>活动名称：双节常温奶满减<br>
            项目编号：2026101810000005<br>
            活动周期：2026-12-20 至 2027-01-05<br>
            投放平台：微信支付<br>
            机制附件：活动机制说明 / 零售商清单 / SKU 清单（3 个，可下载）<br>
            核销预算：¥400,000.00</div>
            <a class="mail-link" href="javascript:void(0)" onclick="MT.toast('邮件链接即进入下方服务商操作页（原型演示）')">确认执行</a>
            <div class="mail-tip">请在 2 个工作日内确认是否承接。确认后在同一页面下载批次计划，再上传已配置批次与订单数据。<br>本链接仅对本次活动有效，请勿转发。链接有效期至 2026-12-19。</div>
          </div>
        </div>
        <div class="note">邮件正文只放活动名称 / ID、周期、投放平台、机制附件与核销预算；预算总额与内部审批意见不出现在邮件里。</div>
      </div>

      <div class="flow">
        <div class="fs done"><div class="l">① 确认执行</div><div class="d">2026-10-19 15:30</div></div>
        <div class="fs done"><div class="l">② 下载批次计划</div><div class="d">3 个计划 · 2026-10-19 15:32</div></div>
        <div class="fs done"><div class="l">③ 回传批次</div><div class="d">3 个批次 · 2026-10-21 10:20</div></div>
        <div class="fs done"><div class="l">④ 上传订单数据</div><div class="d">12,428 条 · 2026-10-21 10:25</div></div>
      </div>

      <!-- ① 确认执行 -->
      <div class="vsec">
        <div class="vsec-h"><b>① 确认执行</b><span class="tg tg-g">已完成</span></div>
        <div class="vres ok"><span class="ic">✓</span><span class="bd"><b>已确认承接</b>2026-10-19 15:30 确认执行「双节常温奶满减」，进入批次配置。</span></div>
      </div>

      <!-- ② 下载批次计划 -->
      <div class="vsec">
        <div class="vsec-h"><b>② 下载批次计划</b><span class="tg tg-g">已下载</span></div>
        <div class="file"><span class="ic">XLS</span><span class="nm">双节常温奶满减_批次计划.xlsx<small>总部下发 · 以当前已保存的批次配置为准</small></span><button class="btn btn-o btn-xs" type="button" onclick="vendorDownloadPlans()">下载</button>
          <button class="btn btn-o btn-xs" type="button" onclick="vendorDownloadPlanImages()">下载券图</button></div>
        <div class="note b">文件含「批次计划」「活动零售商」「活动商品」「可发券商户号」「填写说明」五个 Sheet，明细按项目与计划 ID 关联。按已保存的配置在微信支付后台建券，批次号由商户平台生成。</div>
      </div>

      <div id="venPlanPreview"></div>

      <!-- ③ 回传批次 -->
      <div class="vsec">
        <div class="vsec-h"><b>③ 回传已配置批次（批次号 + 商户号）</b><span class="tg tg-a">待校验提交</span></div>
        <div class="note b" style="margin-top:0">在微信支付商户平台配置批次后，把<b>批次号</b>与<b>微信商户号</b>按计划逐条回传；商户号须为 8~10 位数字，且已由总部加入小程序「可发券商户号」列表，否则无法通过校验。<div class="fld-hint" id="venMchPool" style="margin-top:6px"></div></div>
        <div class="tw scroll" style="margin-top:10px">
          <table class="bt mini" style="table-layout:fixed">
            <thead><tr>
              <th style="width:26%">计划名称</th><th style="width:16%">计划 ID</th>
              <th style="width:22%">批次号<em style="color:var(--red)">*</em></th>
              <th style="width:22%">微信商户号<em style="color:var(--red)">*</em></th>
              <th>校验</th>
            </tr></thead>
            <tbody id="venUpBody"><tr><td colspan="5" class="empty-row">加载中…</td></tr></tbody>
          </table>
        </div>
        <div class="vsec-act">
          <button class="btn btn-o" type="button" onclick="vendorDownloadReturnTemplate()">下载批次回传模板</button>
          <button class="btn btn-p" onclick="vendorSubmit()">提交回传</button>
          <button class="btn btn-o" onclick="vendorFillDemo()">填入示例</button>
          <span class="mut">模板按当前项目逐计划预填，请保留标识；填妥后将批次号、商户号录入上表提交。提交后总部端「计划与批次」可见</span>
        </div>
      </div>

      <!-- ④ 上传订单数据 -->
      <div class="vsec">
        <div class="vsec-h"><b>④ 上传订单数据</b><span class="tg tg-g">已上传</span></div>
        <div class="drop"><b>点击或拖拽上传订单数据</b>支持 xlsx / csv，单文件 ≤20MB<span class="sm">须含「批次编码」，一条订单只归属一个批次</span></div>
        <div class="file"><span class="ic">XLS</span><span class="nm">双节常温奶满减_订单_20261021.xlsx<small>12,428 条订单 · 3 个批次均已归属 · 2026-10-21 10:25</small></span><button class="btn btn-o btn-xs" type="button" onclick="MT.toast('订单明细为原型演示数据')">查看</button></div>
        <div class="vres ok"><span class="ic">✓</span><span class="bd"><b>批次归属校验通过</b>全部订单都能对上已回传的 3 个批次，无孤儿订单、无重复归属。</span></div>
      </div>

      <div class="note"><b>服务商可见范围：</b>活动名称与 ID、周期、核销预算（用于配券）、机制附件、计划与批次数据、校验结果。<b>不可见：</b>内部审批意见与审批人、其他服务商的活动、其他 BU 的数据。</div>
    </div>
  </div>
</div>`;
}

/* =============================================================================
 * 服务商回传：批次号 + 微信商户号（一个计划 = 一个批次 = 一个商户号）
 * ========================================================================== */
var VEN_ROWS = [];

function vendorPlans(){
  var list = (window.PLANS || []).filter(function(p){ return p.projectId === "MN-WX-202612-0041"; });
  return list;
}

function renderVendorUpload(){
  var body = document.getElementById("venUpBody"); if(!body) return;
  VEN_ROWS = vendorPlans().map(function(p){
    var mch = (p.retRows && p.retRows[0] && p.retRows[0].mch) || "";
    return { pid:p.id, plan:p.name, bat:p.bat || "", mch:mch, err:"" };
  });
  venUpRender();
  vendorRenderPlanPreview();
}

function venUpRender(){
  var body = document.getElementById("venUpBody"); if(!body) return;
  var h = "";
  VEN_ROWS.forEach(function(r, i){
    h += "<tr><td><b>" + pnEsc(r.plan) + "</b></td>"
      + "<td class=\"sx-mono\" style=\"font-size:11.4px\">" + pnEsc(r.pid) + "</td>"
      + "<td><input class=\"inp\" style=\"width:100%\" value=\"" + vsEsc(r.bat) + "\" placeholder=\"如 23020105\" oninput=\"venUpSet(" + i + ",'bat',this.value)\"></td>"
      + "<td><input class=\"inp\" style=\"width:100%\" value=\"" + vsEsc(r.mch) + "\" placeholder=\"8~10 位\" oninput=\"venUpSet(" + i + ",'mch',this.value)\"></td>"
      + "<td>" + (r.err ? "<span class=\"tg tg-r\">" + pnEsc(r.err) + "</span>" : (r.done ? "<span class=\"tg tg-g\">✓ 已回传</span>" : "<span class=\"mut\">待校验</span>")) + "</td></tr>";
  });
  body.innerHTML = h || "<tr><td colspan=\"5\" class=\"empty-row\">本活动暂无待回传计划</td></tr>";
}

function venUpSet(i, f, v){
  if(!VEN_ROWS[i]) return;
  VEN_ROWS[i][f] = v;
  VEN_ROWS[i].err = "";
  VEN_ROWS[i].done = false;
}

function vendorFillDemo(){
  var seq = [23020101, 23020102, 23020103];
  VEN_ROWS.forEach(function(r, i){
    if(!r.bat) r.bat = String(seq[i] || (23020110 + i));
    var ok = (window.RET_DB || []).some(function(x){ return x.mch === r.mch; });
    if(!r.mch || !ok) r.mch = "1236057802";
    r.err = "";
  });
  venUpRender();
}

function vendorSubmit(){
  if(!VEN_ROWS.length){ MT.toast("本活动暂无待回传计划", "err"); return; }
  var errs = 0;
  VEN_ROWS.forEach(function(r){
    var bat = String(r.bat || "").trim();
    var mch = String(r.mch || "").trim();
    r.err = "";
    if(!bat){ r.err = "批次号必填"; errs++; }
    else if(!/^\d{6,20}$/.test(bat)){ r.err = "批次号须为 6~20 位数字"; errs++; }
    else {
      var clash = (window.PLANS || []).filter(function(p){ return p.id !== r.pid && String(p.bat || "") === bat; })[0];
      if(clash){ r.err = "已被「" + clash.name + "」占用"; errs++; }
    }
    if(!r.err){
      if(!mch){ r.err = "商户号必填"; errs++; }
      else if(!/^\d{8,10}$/.test(mch)){ r.err = "商户号须为 8~10 位数字"; errs++; }
      else {
        var lib = (window.RET_DB || []).filter(function(x){ return x.mch === mch; })[0];
        if(!lib){ r.err = "门店库无此商户号"; errs++; }
      }
    }
  });
  if(errs){ venUpRender(); MT.toast("有 " + errs + " 条回传信息未通过校验", "err"); return; }

  VEN_ROWS.forEach(function(r){
    var p = (window.PLANS || []).filter(function(x){ return x.id === r.pid; })[0];
    if(!p) return;
    p.bat = String(r.bat).trim();
    p.mch = String(r.mch).trim();
    p.bstat = "已回传";
    p.batchedAt = (typeof wfNow === "function") ? wfNow() : "";
    if(p.batchForm){ p.batchForm.batNo = p.bat; }
    r.done = true;
  });
  mnPersist();
  renderVendorUpload();
  sysLog("服务商协作", "回传批次号与商户号", "双节常温奶满减", "2026101810000005",
    VEN_ROWS.map(function(r){ return r.pid + " → " + r.bat + " / " + r.mch; }).join("；"));
  MT.toast("已回传 " + VEN_ROWS.length + " 个批次，批次号已写回计划");
}

MT.defineDrawer && 0;


/* 下载数据与完善批次同源；不读取尚未保存的抽屉草稿。 */
function vendorValue(){
  for(var i=0;i<arguments.length;i++) if(arguments[i] !== undefined && arguments[i] !== null && arguments[i] !== '') return arguments[i];
  return '';
}
function vendorPlanFields(p){
  var b=p.batchForm || {}, pr=(window.PROJECTS || []).filter(function(x){return x.id === (p.projectId || p.proj);})[0] || {};
  var type=vendorValue(b.mechType,p.mechType,'满减'), exchange=type === '减至';
  return [
    ['项目编号',projCodeText(p.projectId || p.proj)],['项目名称',pr.name || ''],
    ['项目活动周期',pr.period || ''],['投放平台',pr.platform || '微信支付'],
    ['计划ID',p.id],['计划编号',p.pid || ''],['计划名称',p.name || ''],
    ['计划预算（元）',vendorValue(p.budget)],['机制',p.mech || p.bmech || ''],
    ['券名称',vendorValue(b.name,p.btitle,p.coupon)],['批次号',vendorValue(p.bat,b.batNo)],
    ['机制类型',type],['券面额（元）',exchange ? '' : vendorValue(b.face,p.face)],
    ['减至价（元）',exchange ? vendorValue(b.face,p.face) : ''],
    ['优惠门槛方式',exchange ? (b.thrMode === 'amt' ? '订单金额满' : '不限制订单优惠门槛') : '满减门槛'],
    ['使用门槛／订单金额（元）',exchange && b.thrMode !== 'amt' ? '' : vendorValue(b.thr,p.thr)],
    ['商品最高单价（元）',exchange ? vendorValue(b.maxPrice,p.maxPrice) : ''],
    ['可用开始时间',vendorValue(b.start,p.bs,p.s)],['可用结束时间',vendorValue(b.end,p.be,p.e)],
    ['可用时间方式',b.validMode === 'after' ? '有效期内领券后指定天数可用' : '有效期内任意时间可用'],
    ['领券后可用天数',b.validMode === 'after' ? vendorValue(b.validDays) : ''],
    ['发放总上限（张）',vendorValue(b.cap,p.bqty,p.qty)],
    ['单人可领个数',vendorValue(b.user)],['使用说明（消费者可见）',vendorValue(b.desc)],
    ['超预算处理',b.overBudget === 'stop' ? '停止发放' : vendorValue(b.overBudget)],
    ['批次状态',p.bstat || ''],['零售商明细条数',(p.retRows || []).length],['商品明细条数',(p.skuRows || []).length]
  ];
}
function vendorPlanWorkbook(){
  var omitted=['项目编号','项目名称','项目活动周期','计划编号','计划名称','超预算处理','批次状态','零售商明细条数','商品明细条数'];
  function downloadFields(p){return vendorPlanFields(p).filter(function(f){return omitted.indexOf(f[0]) < 0;}).map(function(f){return [f[0],f[0] === '批次号' ? '' : f[1]];});}
  var plans=vendorPlans(), fields=downloadFields({});
  var main=[fields.map(function(x){return x[0];})];
  var ret=[['计划ID','门店编码','零售商名称','门店名称','省份','城市','微信商户号','经度','纬度']];
  var sku=[['计划ID','69码','商品名称','店内码','店内码所属零售商']];
  plans.forEach(function(p){
    main.push(downloadFields(p).map(function(x){return x[1];}));
    var ids=[p.projectId || p.proj || '',p.id,p.pid || '',p.name || ''];
    (p.retRows || []).forEach(function(r){ret.push([p.id].concat([r.sid || '',r.ret || '',r.store || r.n || '',r.prov || '',r.city || '',r.mch || '',vendorValue(r.lng),vendorValue(r.lat)]));});
    (p.skuRows || []).forEach(function(r){
      var inCode=String(r.inCode || '').trim();
      var owners=[];
      if(inCode){
        var source=vendorValue(r.owner,r.rets,[]);
        (Array.isArray(source) ? source : [source]).forEach(function(value){
          String(value).split(/[、,，;；\/\r\n]+/).forEach(function(owner){
            owner=owner.trim(); if(owner && owners.indexOf(owner) < 0) owners.push(owner);
          });
        });
      }
      if(!owners.length) owners=[''];
      owners.forEach(function(owner){sku.push([p.id,r.code || '',r.name || r.n || '',inCode,owner]);});
    });
  });
  var mchs = [['微信商户号']], mchSeen = {};
  (window.MINI_APPS || []).forEach(function(a){
    (a.mchs || []).forEach(function(m){
      if(!mchSeen[m]){ mchSeen[m] = 1; mchs.push([m]); }
    });
  });
  if(mchs.length === 1) mchs.push(['尚未提供可发券商户号']);
  return [{name:'批次计划',rows:main},{name:'活动零售商',rows:ret},{name:'活动商品',rows:sku},{name:'可发券商户号',rows:mchs},{name:'填写说明',rows:[
    ['事项','说明'],['数据来源','下载时当前项目已保存的完善批次配置；空白表示尚未填写，不编造配置。'],
    ['明细关联','活动零售商、活动商品均以计划ID关联批次计划。'],
    ['编码格式','项目编号、计划ID、门店编码、批次号、微信商户号、69码及店内码均为文本，请勿转为数值。'],
    ['可发券商户号','见「可发券商户号」Sheet：配券时只能使用清单内的商户号；清单由总部在小程序详情维护，推送后锁定。'],
    ['批次号','此列留空，等待服务商在微信支付后台建券后上传补充。'],
    ['商品零售商','无店内码时所属零售商留空；有店内码且关联多个零售商时，每个零售商单独一行。'],
    ['机制','满减填写券面额与门槛；减至填写减至价、优惠门槛方式及商品最高单价。'],
    ['可用时间','领券后指定天数仍受可用开始、结束时间约束；活动结束后不可用。'],
    ['回传','在微信支付后台建券后，使用批次回传模板保留项目编号、计划ID，填写实际批次号和商户号。']
  ]}];
}
function vendorReturnWorkbook(){
  var rows=[['项目编号','计划ID','计划编号','计划名称','券名称','批次号','微信商户号']];
  vendorPlans().forEach(function(p){rows.push([projCodeText(p.projectId || p.proj),p.id,p.pid || '',p.name || '',vendorValue((p.batchForm || {}).name,p.btitle,p.coupon),'','']);});
  return [{name:'批次回传',rows:rows},{name:'填写说明',rows:[
    ['字段／事项','填写规则'],['项目编号、计划ID','系统预填，不得修改；一个计划对应一个批次，不得跨项目绑定。'],
    ['计划编号、计划名称、券名称','预填参考信息，用于核对配置；系统以计划ID关联。'],
    ['批次号','必填，微信支付后台实际生成的批次号；按文本填写，当前页面校验6～20位数字且全局唯一。'],
    ['微信商户号','必填，按文本填写，当前页面校验8～12位数字，须为已登记的门店商户号。'],
    ['提交方式','此文件为填写模板；填妥后将批次号及商户号按计划录入服务商操作页，点击提交回传。'],
    ['空白与重复','批次号及商户号留空供填写，不提供可误提交的示例值；请勿重复绑定其他计划的批次。']
  ]}];
}
function vendorRenderPlanPreview(){
  var el=document.getElementById('venPlanPreview'); if(!el) return;
  el.innerHTML=vendorPlans().map(function(p){
    var h='<details class="vsec"><summary><b>'+pnEsc(p.name || p.id)+'</b> · 查看下发批次配置与明细</summary><div class="dkv">';
    vendorPlanFields(p).forEach(function(f){h+='<div class="r"><span class="k">'+pnEsc(f[0])+'</span><span class="v">'+pnEsc(String(vendorValue(f[1],'未填写')))+'</span></div>';});
    h+='</div>';
    vendorPlanWorkbook().slice(1,3).forEach(function(sheet){
      var start=1, planColumn=sheet.rows[0].indexOf('计划ID');
      h+='<h4>'+sheet.name+'</h4><div class="tw scroll"><table class="bt mini"><thead><tr>'+sheet.rows[0].slice(start).map(function(v){return '<th>'+pnEsc(v)+'</th>';}).join('')+'</tr></thead><tbody>';
      sheet.rows.slice(1).filter(function(row){return row[planColumn] === p.id;}).forEach(function(row){h+='<tr>'+row.slice(start).map(function(v){return '<td>'+pnEsc(String(vendorValue(v,'—')))+'</td>';}).join('')+'</tr>';});
      h+='</tbody></table></div>';
    });
    return h+'</details>';
  }).join('');
}

/* 原型保持离线可用：生成标准 OOXML 工作簿，不依赖 CDN 或构建工具。
 * 所有单元格显式为文本，保留编码前导零，并避免内容被解释为公式。 */
function vendorWorkbookBytes(sheets){
  function xml(v){return String(v == null ? '' : v).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function col(i){var s=''; for(i++;i;i=Math.floor((i-1)/26)) s=String.fromCharCode(65+(i-1)%26)+s; return s;}
  var ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  var files=[], enc=new TextEncoder();
  var types='<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
  var book='<workbook xmlns="'+ns+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>',rels='<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  sheets.forEach(function(s,i){
    types+='<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
    book+='<sheet name="'+xml(s.name)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>';
    rels+='<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>';
    var rows=s.rows.map(function(row,r){return '<row r="'+(r+1)+'">'+row.map(function(v,c){return '<c r="'+col(c)+(r+1)+'" t="inlineStr"><is><t xml:space="preserve">'+xml(v)+'</t></is></c>';}).join('')+'</row>';}).join('');
    files.push(['xl/worksheets/sheet'+(i+1)+'.xml','<worksheet xmlns="'+ns+'"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultColWidth="24"/><sheetData>'+rows+'</sheetData></worksheet>']);
  });
  files.push(['[Content_Types].xml',types+'</Types>'],['xl/workbook.xml',book+'</sheets></workbook>'],['xl/_rels/workbook.xml.rels',rels+'</Relationships>'],['_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>']);
  function crc(a){var c=0xffffffff; for(var i=0;i<a.length;i++){c^=a[i];for(var j=0;j<8;j++) c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
  function header(size){return new Uint8Array(size);}
  function put(a,at,v,n){for(var i=0;i<n;i++) a[at+i]=(v>>>(8*i))&255;}
  var chunks=[],central=[],offset=0,centralSize=0;
  files.forEach(function(f){
    var name=enc.encode(f[0]),data=enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+f[1]),sum=crc(data);
    var local=header(30);put(local,0,0x04034b50,4);put(local,4,20,2);put(local,10,0,2);put(local,12,33,2);put(local,14,sum,4);put(local,18,data.length,4);put(local,22,data.length,4);put(local,26,name.length,2);
    var cd=header(46);put(cd,0,0x02014b50,4);put(cd,4,20,2);put(cd,6,20,2);put(cd,14,33,2);put(cd,16,sum,4);put(cd,20,data.length,4);put(cd,24,data.length,4);put(cd,28,name.length,2);put(cd,42,offset,4);
    chunks.push(local,name,data);central.push(cd,name);offset+=local.length+name.length+data.length;centralSize+=cd.length+name.length;
  });
  var end=header(22);put(end,0,0x06054b50,4);put(end,8,files.length,2);put(end,10,files.length,2);put(end,12,centralSize,4);put(end,16,offset,4);
  var all=chunks.concat(central,[end]),result=new Uint8Array(offset+centralSize+22),pos=0;
  all.forEach(function(a){result.set(a,pos);pos+=a.length;}); return result;
}
function vendorDownloadWorkbook(sheets,suffix){
  if(!vendorPlans().length){MT.toast('本活动暂无计划可下载','err');return;}
  var p=vendorPlans()[0],pr=(window.PROJECTS || []).filter(function(x){return x.id === (p.projectId || p.proj);})[0] || {};
  var blob=new Blob([vendorWorkbookBytes(sheets)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;
  a.download=String(pr.name || p.projectId || p.proj).replace(/[\\/:*?"<>|]/g,'_')+'_'+suffix+'.xlsx';
  document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(url);a.remove();},1000);
  MT.toast(suffix+'已下载');
}
function vendorDownloadPlans(){vendorDownloadWorkbook(vendorPlanWorkbook(),'批次计划');}

/* ---------- 下载券图：按计划 ID 命名，多张时打包为 ZIP ---------- */
function vendorCrc32(u8){
  var c, crc = 0xFFFFFFFF;
  for(var i=0;i<u8.length;i++){
    c = (crc ^ u8[i]) & 0xFF;
    for(var k=0;k<8;k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function vendorZip(files){
  function le16(n){ return [n & 255, (n >>> 8) & 255]; }
  function le32(n){ n = n >>> 0; return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
  var enc = new TextEncoder();
  var now = new Date();
  var dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  var dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
  var locals = [], centrals = [], offset = 0;
  files.forEach(function(f){
    var name = enc.encode(f.name);
    var crc = vendorCrc32(f.data);
    var head = [].concat(
      le32(0x04034b50), le16(20), le16(0x0800), le16(0), le16(dosTime), le16(dosDate),
      le32(crc), le32(f.data.length), le32(f.data.length), le16(name.length), le16(0)
    );
    locals.push(new Uint8Array(head), name, f.data);
    var cen = [].concat(
      le32(0x02014b50), le16(20), le16(20), le16(0x0800), le16(0), le16(dosTime), le16(dosDate),
      le32(crc), le32(f.data.length), le32(f.data.length), le16(name.length), le16(0), le16(0),
      le16(0), le16(0), le32(0), le32(offset)
    );
    centrals.push(new Uint8Array(cen), name);
    offset += head.length + name.length + f.data.length;
  });
  var cenSize = centrals.reduce(function(n, x){ return n + x.length; }, 0);
  var eocd = new Uint8Array([].concat(
    le32(0x06054b50), le16(0), le16(0), le16(files.length), le16(files.length),
    le32(cenSize), le32(offset), le16(0)
  ));
  return new Blob(locals.concat(centrals, [eocd]), { type:'application/zip' });
}
function vendorDownloadPlanImages(){
  var plans = vendorPlans().filter(function(p){ return p.img; });
  if(!plans.length){ MT.toast('本项目还没有上传券详情图', 'err'); return; }
  var files = [], missing = 0;
  plans.forEach(function(p){
    var data = (window.PLAN_IMG_DATA || {})[p.id];
    if(!data){ missing++; return; }
    try{
      var m = /^data:([^;]+);base64,(.*)$/.exec(data);
      if(!m){ missing++; return; }
      var bin = atob(m[2]);
      var u8 = new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++) u8[i] = bin.charCodeAt(i);
      var ext = /png/i.test(m[1]) ? '.png' : '.jpg';
      files.push({ name: String(p.id || p.pid || 'plan') + ext, data: u8 });
    }catch(e){ missing++; }
  });
  if(!files.length){
    MT.toast('券图文件不在当前会话中（刷新后需重新上传），暂无可打包的图片', 'err');
    return;
  }
  var blob = vendorZip(files);
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '双节常温奶满减_券详情图_' + files.length + '张.zip';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 900);
  MT.toast('已打包下载 ' + files.length + ' 张券图' + (missing ? '（另有 ' + missing + ' 张需重新上传后下载）' : ''));
}
function vendorDownloadReturnTemplate(){vendorDownloadWorkbook(vendorReturnWorkbook(),'批次回传模板');}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-vendor",
  title: "服务商操作页",
  crumb: "服务商协作 / 服务商操作页",
  group: "服务商协作",
  isNew: true,
  template: tplPagevendor
});

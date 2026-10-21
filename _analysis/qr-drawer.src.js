/* =============================================================================
 * components/qr-drawer.js — 分渠道二维码抽屉
 * 对应待确认清单标黄项 16：「一个活动多分发渠道生成多个二维码。
 * 确认渠道粒度（线下物料 / 公众号 / 私域）与二维码命名规则，用于分渠道统计发券量。」
 * 实现要点：
 *   · 渠道枚举集中维护（CHANNELS），一个活动下同一渠道可以建多枚码
 *   · 命名规则：MN-<活动ID>-<渠道码>-<两位序号>，可用于统计与物料对账
 *   · 抽屉内给出渠道维度的扫码 / 领取 / 核销统计，验证「分渠道统计发券量」
 * ========================================================================== */

/** 渠道枚举：新增渠道只改这一处 */
var QR_CHANNELS = [
  { code:'OFF', name:'线下物料', desc:'门店堆头、DM 单页、收银台立牌' },
  { code:'MP',  name:'公众号',   desc:'公众号图文、菜单栏、自动回复' },
  { code:'PRI', name:'私域',     desc:'导购企微群、朋友圈、一对一发送' }
];

var qrCur = { key:'r1', px:300, code:'' };

/* ---------- 确定性点阵：同一枚码图案固定 ---------- */
function qrDrawBack(svg, seed){
  var out = '<rect width="100" height="100" fill="#fff"/>';
  function finder(x, y){
    return '<rect x="'+x+'" y="'+y+'" width="24" height="24" fill="#141E35"/>'
         + '<rect x="'+(x+5)+'" y="'+(y+5)+'" width="14" height="14" fill="#fff"/>'
         + '<rect x="'+(x+9)+'" y="'+(y+9)+'" width="6" height="6" fill="#141E35"/>';
  }
  var v = seed || 1;
  for(var y=0;y<20;y++){
    for(var x=0;x<20;x++){
      v = (v*1103515245 + 12345) & 0x7fffffff;
      if((v>>16) % 100 < 48){
        var px = 3 + x*4.7, py = 3 + y*4.7;
        /* 避开三个定位角 */
        if((px<30&&py<30) || (px>66&&py<30) || (px<30&&py>66)) continue;
        out += '<rect x="'+px.toFixed(1)+'" y="'+py.toFixed(1)+'" width="4.2" height="4.2" fill="#141E35"/>';
      }
    }
  }
  out += finder(3,3) + finder(73,3) + finder(3,73);
  return out;
}

/** 为一枚渠道码计算数据（链接、命名、统计），首次访问时懒生成 */
function qrEnsureCodes(key){
  var d = QRDATA[key];
  if(!d) return null;
  if(d.codes && d.codes.length) return d;
  var chans = d.chan && d.chan.length ? d.chan : ['线下物料'];
  d.codes = [];
  var seq = {};
  chans.forEach(function(cn){
    var ch = QR_CHANNELS.filter(function(x){ return x.name === cn; })[0] || QR_CHANNELS[0];
    seq[ch.code] = (seq[ch.code] || 0) + 1;
    d.codes.push({
      ch: ch.code,
      chName: ch.name,
      no: ('0' + seq[ch.code]).slice(-2),
      link: (d.link || 'mn-act.cn/h5/g/' + key) + '?ch=' + ch.code.toLowerCase() + seq[ch.code],
      seed: (key.charCodeAt(0) * 31 + ch.code.charCodeAt(0) * 7 + seq[ch.code] * 97) % 99991,
      scan: 0, got: 0, used: 0
    });
  });
  return d;
}

/** 渠道码的业务编号：MN-<活动ID>-<渠道码>-<序号> */
function qrCodeName(key, code){
  return 'MN-WX-202612-0041-' + code.ch + '-' + code.no;
}

/* ---------- 打开抽屉（可指定默认渠道） ---------- */
function openQr(key, chCode){
  key = key || 'r1';
  var d = qrEnsureCodes(key);
  if(!d) return;
  qrCur.key = key;
  qrCur.px = 300;
  qrCur.code = chCode || d.codes[0].ch;

  document.getElementById('qrPageName').textContent = d.name;
  document.getElementById('qrProj').innerHTML = d.proj || '双节常温奶满减 <span class="tg tg-n sx">MN-WX-202612-0041</span>';
  document.getElementById('qrPeriod').textContent = d.period || '2026-12-20 ~ 2027-01-05';
  var st = document.getElementById('qrStatus');
  if(st){ st.textContent = d.status; st.className = 'tg ' + d.cls; }

  qrRenderCodes();
  qrPickCode(qrCur.code, 0);
  openDrawer('dw-qr');
}

/* ---------- 渠道码列表 ---------- */
function qrRenderCodes(){
  var d = QRDATA[qrCur.key];
  var box = document.getElementById('qrCodeList');
  if(!box || !d) return;

  var h = '';
  QR_CHANNELS.forEach(function(ch){
    var list = d.codes.filter(function(c){ return c.ch === ch.code; });
    var on = qrCur.code === ch.code;
    h += '<div class="qrc-grp' + (on ? ' on' : '') + '">'
      + '<div class="qrc-h" onclick="qrChannelTab(\'' + ch.code + '\')">'
      +   '<b>' + ch.name + '</b><span class="tag">' + ch.code + '</span>'
      +   '<span class="cnt">' + list.length + ' 枚</span>'
      + '</div>';
    if(on){
      h += '<div class="qrc-b">';
      if(!list.length){
        h += '<div class="mut" style="font-size:12px;padding:4px 2px">该渠道还没有码</div>';
      } else {
        list.forEach(function(c, i){
          h += '<div class="qrc-item' + (c.no === qrCur.no && qrCur.ch === ch.code ? ' cur' : '') + '" onclick="qrPickCode(\'' + ch.code + '\',' + i + ')">'
            + '<span class="nm">' + qrCodeName(qrCur.key, c) + '</span>'
            + '<span class="mut">' + c.chName + '</span>'
            + '</div>';
        });
      }
      h += '<button class="btn btn-g btn-xs" style="margin-top:8px" onclick="qrAdd(\'' + ch.code + '\')">＋ 新增一枚' + ch.name + '码</button>';
      h += '</div>';
    }
    h += '</div>';
  });
  box.innerHTML = h;

  /* 渠道统计 */
  var stat = document.getElementById('qrStat');
  if(stat){
    var rows = QR_CHANNELS.map(function(ch){
      var list = d.codes.filter(function(c){ return c.ch === ch.code; });
      var scan = list.reduce(function(a, c){ return a + (c.scan || 0); }, 0);
      var got  = list.reduce(function(a, c){ return a + (c.got || 0); }, 0);
      var used = list.reduce(function(a, c){ return a + (c.used || 0); }, 0);
      var rate = got ? Math.round(used / got * 100) : 0;
      return '<tr>'
        + '<td><b>' + ch.name + '</b><div class="mut" style="font-size:11px">' + ch.desc + '</div></td>'
        + '<td class="num" style="text-align:left">' + list.length + ' 枚</td>'
        + '<td class="num" style="text-align:left">' + scan.toLocaleString('en-US') + '</td>'
        + '<td class="num" style="text-align:left">' + got.toLocaleString('en-US') + '</td>'
        + '<td class="num" style="text-align:left">' + used.toLocaleString('en-US') + '</td>'
        + '<td class="num" style="text-align:left">' + rate + '%</td>'
        + '</tr>';
    }).join('');
    stat.innerHTML = '<table class="bt mini"><thead><tr>'
      + '<th>分发渠道</th><th style="width:70px">二维码</th><th style="width:80px">扫码量</th>'
      + '<th style="width:80px">领券量</th><th style="width:80px">核销量</th><th style="width:70px">核销率</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table>';
  }
}

/** 切换渠道分组 */
function qrChannelTab(chCode){
  var d = QRDATA[qrCur.key];
  if(!d) return;
  var first = d.codes.filter(function(c){ return c.ch === chCode; })[0];
  qrCur.code = chCode;
  qrCur.no = first ? first.no : '';
  qrRenderCodes();
  if(first) qrPickCode(chCode, 0);
  else qrBlank();
}

/** 选中某一枚码 */
function qrPickCode(chCode, i){
  var d = QRDATA[qrCur.key];
  if(!d) return;
  var list = d.codes.filter(function(c){ return c.ch === chCode; });
  var c = list[i];
  if(!c) return;
  qrCur.code = chCode;
  qrCur.no = c.no;
  qrCur.item = c;

  document.getElementById('qrSvg').innerHTML = qrDrawBack(null, c.seed);
  document.getElementById('qrCodeName').textContent = qrCodeName(qrCur.key, c);
  document.getElementById('qrLink').innerHTML = 'https://' + c.link
    + ' <a class="lnk" onclick="qrCopy()">复制</a>';
  document.getElementById('qrDimv').textContent = qrCur.px + ' × ' + qrCur.px + ' px';
  var sz = document.querySelectorAll('#qrSz span');
  for(var k=0;k<sz.length;k++) sz[k].className = sz[k].getAttribute('data-px') === String(qrCur.px) ? 'on' : '';

  /* 分渠道数据 */
  var box = document.getElementById('qrCodeData');
  if(box){
    box.innerHTML = '<div class="dkv">'
      + '<div class="r"><span class="k">分发渠道</span><span class="v">' + c.chName + '（' + c.ch + '）</span></div>'
      + '<div class="r"><span class="k">本码扫码</span><span class="v">' + (c.scan || 0).toLocaleString('en-US') + '</span></div>'
      + '<div class="r"><span class="k">本码领券</span><span class="v">' + (c.got || 0).toLocaleString('en-US') + '</span></div>'
      + '<div class="r"><span class="k">本码核销</span><span class="v">' + (c.used || 0).toLocaleString('en-US') + '</span></div>'
      + '</div>';
  }
  qrRenderCodes();
}

function qrBlank(){
  document.getElementById('qrSvg').innerHTML = '';
  document.getElementById('qrCodeName').textContent = '—';
  document.getElementById('qrLink').textContent = '该渠道还没有二维码，点左侧「新增」生成';
  document.getElementById('qrCodeData').innerHTML = '';
}

/* ---------- 新增一枚渠道码 ---------- */
function qrAdd(chCode){
  var d = QRDATA[qrCur.key];
  if(!d) return;
  var ch = QR_CHANNELS.filter(function(x){ return x.code === chCode; })[0];
  var list = d.codes.filter(function(c){ return c.ch === chCode; });
  var no = ('0' + (list.length + 1)).slice(-2);
  var base = d.link || ('mn-act.cn/h5/g/' + qrCur.key);
  d.codes.push({
    ch: chCode, chName: ch.name, no: no,
    link: base + '?ch=' + chCode.toLowerCase() + parseInt(no, 10),
    seed: (Date.now() + list.length * 137) % 99991,
    scan: 0, got: 0, used: 0
  });
  qrCur.code = chCode;
  qrCur.no = no;
  qrRenderCodes();
  qrPickCode(chCode, list.length);
  MT.toast('已生成' + ch.name + '二维码 ' + qrCodeName(qrCur.key, { ch:chCode, no:no }));
}

/* ---------- 尺寸 / 下载 / 复制 ---------- */
function qrSize(el, px){
  var sz = document.querySelectorAll('#qrSz span');
  for(var i=0;i<sz.length;i++) sz[i].classList.remove('on');
  el.classList.add('on');
  qrCur.px = px;
  document.getElementById('qrDimv').textContent = px + ' × ' + px + ' px';
}

function qrDl(fmt){
  var c = qrCur.item;
  if(!c){ MT.toast('请先在左侧选择一枚二维码', 'err'); return; }
  MT.toast('下载 ' + fmt + ' · ' + qrCur.px + 'px
' + qrCodeName(qrCur.key, c) + '
https://' + c.link + '（演示环境不实际下载）');
}

function qrCopy(){
  var c = qrCur.item;
  if(!c) return;
  var url = 'https://' + c.link;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){ MT.toast('链接已复制'); }, function(){ MT.toast(url); });
  } else {
    MT.toast(url);
  }
}

/* ---------- 模板：dw-qr ---------- */
function tplDrawerqr(){
  return `<div class="drawer dw-qr" id="dw-qr">
  <div class="dw-h">
    <h3>分渠道二维码 <span class="sub" id="qrPageName">领券页面</span></h3>
    <div class="flex" style="gap:10px">
      <span class="tg tg-g" id="qrStatus">启用中</span>
      <span class="dw-x" onclick="closeDrawer()">×</span>
    </div>
  </div>
  <div class="dw-b">

    <div class="note g" style="margin-top:0">
      <b>一个活动可以有多个码。</b>同一活动按分发渠道（线下物料 / 公众号 / 私域）分别生成二维码，用于分渠道统计发券量；同一渠道下还可以按物料位置建多枚码。
    </div>

    <div class="qwrap2">
      <div class="qrc-list" id="qrCodeList"></div>

      <div class="qrc-main">
        <div class="qrc-qr">
          <div class="qr"><svg viewBox="0 0 100 100" id="qrSvg"></svg></div>
          <div class="qsdim" id="qrDimv">300 × 300 px</div>
          <div class="qsz" id="qrSz">
            <span class="on" data-px="300" onclick="qrSize(this,300)">300</span>
            <span data-px="600" onclick="qrSize(this,600)">600</span>
            <span data-px="1000" onclick="qrSize(this,1000)">1000</span>
          </div>
          <div class="flex" style="gap:6px;margin-top:10px;justify-content:center">
            <button class="btn btn-o btn-xs" onclick="qrDl('PNG')">下载 PNG</button>
            <button class="btn btn-g btn-xs" onclick="qrDl('SVG')">下载 SVG</button>
          </div>
        </div>

        <div class="qrc-info">
          <div class="qinfo">
            <div class="qi"><span class="k">二维码编号</span><span class="v"><b id="qrCodeName">—</b></span></div>
            <div class="qi"><span class="k">所属项目</span><span class="v" id="qrProj"></span></div>
            <div class="qi"><span class="k">活动周期</span><span class="v" id="qrPeriod"></span></div>
            <div class="qi"><span class="k">跳转链接</span><span class="v" id="qrLink"></span></div>
            <div class="qi"><span class="k">命名规则</span><span class="v"><span class="sx-mono">MN-&lt;活动ID&gt;-&lt;渠道码&gt;-&lt;序号&gt;</span>　渠道码：OFF 线下物料 / MP 公众号 / PRI 私域</span></div>
          </div>
          <div class="psec"><h4>本码数据</h4></div>
          <div id="qrCodeData"></div>
        </div>
      </div>
    </div>

    <div class="psec"><h4>分渠道统计</h4><span class="psec-r">用于核对各渠道发券量</span></div>
    <div id="qrStat"></div>

  </div>
  <div class="dw-f">
    <div class="lft">扫码 → 领取 → 核销按「码」维度留痕，可回溯到具体物料</div>
    <div class="rgt"><button class="btn btn-g" onclick="closeDrawer()">关闭</button></div>
  </div>
</div>`;
}

MT.defineDrawer('dw-qr', tplDrawerqr);

/* =============================================================================
 * pages/coupon-page.js — 领券页面（建页 / 编辑 / 预览 / 分渠道二维码）
 * 标黄项 16：一个活动多分发渠道生成多个二维码。
 * ========================================================================== */

/* ---------- 逻辑 ---------- */

/* ============ 批次勾选 → 实时预览 ============ */

function toggleB(cb){
  var bi=cb.closest('.bi');
  if(cb.checked){
    document.getElementById('pvList').appendChild(makeCard(bi));
  }else{
    var box=document.getElementById('pvList');
    var ex=box.querySelector('[data-for="'+bi.dataset.id+'"]');
    if(ex)ex.remove();
  }
  refresh();
}

function makeCard(bi){
  var d=document.createElement('div');
  d.className='cp';d.dataset.for=bi.dataset.id;
  d.innerHTML='<div class="amt">¥'+bi.dataset.amt+'</div><div class="mid"><b>'+bi.dataset.name+'</b><small>'+bi.dataset.cond+' · '+bi.dataset.exp+'</small></div><div class="btn2">立即领取</div>';
  return d;
}

function refresh(){
  var list=document.getElementById('pvList');
  if(!list)return;
  var n=list.querySelectorAll('.cp').length;
  document.getElementById('selCnt').textContent=n;
  var c2=document.getElementById('selCnt2'); if(c2)c2.textContent=n;
  document.getElementById('selWarn').style.display=n>6?'inline':'none';
  document.getElementById('pvHint').textContent=n?('共 '+n+' 张券，点击「立即领取」逐张领取'):'请先勾选批次';
  var rows='';var i=1;
  list.querySelectorAll('.cp').forEach(function(c){
    var id=c.dataset.for;var amt=c.querySelector('.amt').textContent;
    rows+='<div class="si"><span>'+i+'. <b>'+id+'</b> '+amt+'</span><span class="mv">↑ ↓</span></div>';i++;
  });
  document.getElementById('sortList').innerHTML=rows||'<div class="si"><span>未勾选批次</span></div>';
}

function pickBg(el,cls){
  var box=el.closest('.bgpick');
  box.querySelectorAll('.g').forEach(function(g){g.classList.remove('on')});
  el.classList.add('on');
  var bg=document.getElementById('pvBg'); if(bg)bg.className='bg '+(cls||'');
}

function syncPreview(){
  var v=document.getElementById('pgName').value||'活动领券页';
  var t=document.getElementById('pvTitle'); if(t)t.textContent=v.replace('（','·').replace('）','');
}
/* ============ 抽屉 ============ */

function openEditDrawer(key){
  var d=PAGES[key]||PAGES.r1;
  var isDraft = d.status==='草稿';
  document.getElementById('edSub').textContent=d.name+' · MN-WX-202612-0041';
  document.getElementById('edName').value=d.name;
  var st=document.getElementById('edStatus'); st.textContent=d.status; st.className='tg '+d.cls;
  /* 批次 */
  document.getElementById('edBatch').innerHTML=d.batches.map(function(b){
    return '<div class="bi lock" data-id="'+b.id+'"><label class="chk"><input type="checkbox" checked disabled></label>'+
           '<span class="id">'+b.id+'</span><span class="info">¥'+b.face+' / '+b.cond+' · '+b.qty+
           '<small>'+b.exp+'</small></span><span class="rt"><span class="tg tg-'+(isDraft?'a':'n')+' xs">'+(isDraft?'草稿':'已锁定')+'</span></span></div>';
  }).join('');
  /* 预览券卡 */
  document.getElementById('edTitle').textContent=d.title;
  document.querySelector('#edBg small').textContent='活动时间 '+d.actTime;
  document.getElementById('edList').innerHTML=d.batches.map(function(b){
    return '<div class="cp"><div class="amt">¥<b>'+b.face+'</b></div>'+
           '<div class="mid"><b>'+b.card+'</b><small>'+b.cond+' 元可用 · '+b.cardExp+'</small></div>'+
           '<div class="btn2 '+(isDraft?'off':'')+'">'+(isDraft?'未启用':'立即领取')+'</div></div>';
  }).join('');
  document.querySelector('#dw-edit .ph').textContent='共 '+d.batches.length+' 张券';
  /* 右侧信息 */
  var info=[
    ['含券批次','<span class="sx-mono">'+d.batches.map(function(b){return b.id}).join('、')+'</span>（共 '+d.batches.length+' 个，锁定不可改）'],
    ['分发渠道',d.chan.join('、')],
    ['页面链接',d.link?'<span class="sx-mono">'+d.link+'</span>':'<span class="muted">未生成</span>'],
    ['有效期',d.period]
  ];
  document.getElementById('edInfo').innerHTML=info.map(function(x){
    return '<div class="r"><span class="k">·</span><div><b>'+x[0]+'：</b>'+x[1]+'</div></div>';
  }).join('');
  /* 底部按钮与状态一致 */
  document.getElementById('edStop').style.display = isDraft?'none':'';
  document.getElementById('edDel').style.display  = isDraft?'':'none';
  document.querySelector('#dw-edit .dw-f .lft').textContent = isDraft?'草稿 · 启用后对外可领':'最近保存 2026-10-19 16:05';
  openDrawer('dw-edit');
}

function setState(el,key){
  if(el)el.classList.add('on');
  var map=STATEMAP[key]||STATEMAP.default;
  var box=document.getElementById('pvList'); if(!box)return;
  var cards=box.querySelectorAll('.cp');
  cards.forEach(function(c,i){
    var m=map[i]||map[map.length-1];
    var b=c.querySelector('.btn2');b.textContent=m[0];b.className='btn2 '+(m[1]==='got'?'':m[1]);
    c.classList.remove('dim');
    if(key==='sold'&&i===0)c.classList.add('dim');
    var old=c.querySelector('.tagv');if(old)old.remove();
    if(key==='got'&&i===0){var t=document.createElement('span');t.className='tagv';t.textContent='已领取';c.querySelector('.mid').appendChild(t);}
  });
  var host=box.closest('.phone');
  var lab=host?host.querySelector('.statelab'):null;
  if(lab&&el)lab.textContent='预览态：'+el.textContent.replace(/^[①②③④⑤⑥]\s*/,'');
  var hint=document.getElementById('pvHint');
  if(hint){
    hint.textContent = key==='got'?'已领取 1 张，可继续领取其余券'
      : key==='repeat'?'每人限领 1 张，该券已领取'
      : key==='sold'?'第 1 张券已领完，其余仍可领取'
      : key==='expired'?'活动已结束，感谢关注'
      : ('共 '+cards.length+' 张券，点击「立即领取」逐张领取');
  }
}
/* ============ 页面二维码（每页独立） ============ */

function batList(){
  return PLANS.filter(function(p){ return !!p.bat; }).map(function(p){
    return {
      id:p.bat,
      ttl:p.btitle||p.name,
      mech:p.bmech||'',
      s:p.bs||p.s,
      e:p.be||p.e,
      st: p.bstat==='\u5df2\u7ec8\u6b62' ? '\u5df2\u7ec8\u6b62' : '\u53ef\u5efa\u9875',
      cap:(p.bqty||0).toLocaleString('en-US'),
      sent:(p.used||0).toLocaleString('en-US'),
      ch:'\u626b\u7801',
      amt:String(p.face),
      cond:'\u6ee1 '+p.thr+' \u5143\u53ef\u7528',
      name:p.btitle||p.name,
      exp:(p.bs?mnDate(p.bs):'')+' 至 '+(p.be?mnDate(p.be):'')+' 有效',
      plan:p.name,
      used:p.used||0,
      usedAmt:p.usedAmt||0
    };
  });
}

var BAT = batList();

var BPAGE = 1, BSIZE = 15;

var BPICK = [];

function bFiltered(){
  var fst = (document.getElementById('bFStatus')||{}).value || '';
  var fpl = (document.getElementById('bFPlan')||{}).value || '';
  var fkw = ((document.getElementById('bFKw')||{}).value || '').trim();
  return BAT.filter(function(b){
    if(fst && b.st!==fst) return false;
    if(fpl && b.plan!==fpl) return false;
    if(fkw && b.id.indexOf(fkw)<0 && b.ttl.indexOf(fkw)<0) return false;
    return true;
  });
}

function openPageDrawer(){
  var kw=document.getElementById('bFKw'); if(kw) kw.value='';
  var fs=document.getElementById('bFStatus'); if(fs) fs.value='';
  var fp=document.getElementById('bFPlan'); if(fp) fp.value='';
  BPAGE=1; BPICK=[];
  var pv=document.getElementById('pvList'); if(pv) pv.innerHTML='';
  var ph=document.getElementById('pvHint'); if(ph) ph.style.display='';
  var sc=document.getElementById('selCnt2'); if(sc) sc.textContent='0';
  renderBlist();
  openDrawer('dw-page');
}

function renderBlist(){
  var rows = bFiltered();
  var box = document.getElementById('blist'); if(!box) return;
  var tot = rows.length;
  var pages = Math.max(1, Math.ceil(tot/BSIZE));
  if(BPAGE>pages) BPAGE = pages;
  var slice = rows.slice((BPAGE-1)*BSIZE, BPAGE*BSIZE);

  var h='';
  slice.forEach(function(b){
    var has = (b.st==='已占用');
    var on  = BPICK.indexOf(b.id)>=0;
    h += '<tr class="b-row'+(on?' on':'')+(has?' dis':'')+'" onclick="bToggleRow(event,this,\''+b.id+'\')"'
       + ' data-id="'+b.id+'" data-amt="'+b.amt+'" data-cond="'+b.cond+'" data-name="'+b.name+'" data-exp="'+b.exp+'">'
       + '<td><label class="chk"><input type="checkbox"'+(on?' checked':'')+(has?' disabled':'')
       + ' onchange="bToggle(this,\''+b.id+'\')"></label></td>'
       + '<td class="sx-mono" style="font-size:11.8px">'+b.id+'</td>'
       + '<td>'+b.ttl+'</td>'
       + '<td class="muted" style="font-size:11.8px">'+b.mech+'</td>'
       + '<td class="muted" style="font-size:11.6px">'+b.s+'</td>'
       + '<td class="muted" style="font-size:11.6px">'+b.e+'</td>'
       + '<td><span class="tg '+(has?'tg-a':'tg-g')+' xs">'+b.st+'</span></td>'
       + '<td class="num">'+b.cap+'</td>'
       + '<td class="num">'+b.sent+'</td>'
       + '<td class="muted" style="font-size:11.6px">'+b.ch+'</td>'
       + '</tr>';
  });
  if(!h) h='<tr><td colspan="10" class="empty-row">没有匹配的批次</td></tr>';
  box.innerHTML=h;

  document.getElementById('bTotal').textContent = tot;
  var pg='';
  pg += '<button class="pg '+(BPAGE<=1?'dis':'')+'" onclick="bGo('+(BPAGE-1)+')">上一页</button>';
  for(var i=1;i<=pages;i++) pg += '<button class="pg '+(i===BPAGE?'on':'')+'" onclick="bGo('+i+')">'+i+'</button>';
  pg += '<button class="pg '+(BPAGE>=pages?'dis':'')+'" onclick="bGo('+(BPAGE+1)+')">下一页</button>';
  document.getElementById('bPager').innerHTML = pg;

  refresh();
}

function bGo(n){
  var pages = Math.max(1, Math.ceil(bFiltered().length/BSIZE));
  if(n<1||n>pages) return;
  BPAGE=n; renderBlist();
}

function bToggleRow(e, tr, id){
  if(e.target && (e.target.tagName==='INPUT' || e.target.tagName==='LABEL')) return;
  if(tr.classList.contains('dis')) return;
  var cb = tr.querySelector('input[type=checkbox]');
  if(!cb) return;
  cb.checked = !cb.checked;
  bToggle(cb, id);
}

function bToggle(cb, id){
  var k = BPICK.indexOf(id);
  if(cb.checked){ if(k<0) BPICK.push(id); } else { if(k>=0) BPICK.splice(k,1); }
  var tr = cb.closest('tr');
  if(tr) tr.classList.toggle('on', cb.checked);

  // 同步消费者端预览
  var box = document.getElementById('pvList');
  if(cb.checked){
    var b = BAT.filter(function(x){ return x.id===id; })[0];
    if(b && !box.querySelector('[data-for="'+id+'"]')) box.appendChild(makeCard({dataset:{id:b.id,amt:b.amt,cond:b.cond,name:b.name,exp:b.exp}}));
  } else {
    var ex = box.querySelector('[data-for="'+id+'"]');
    if(ex) ex.remove();
  }
  refresh();
}

/* ============ 项目状态流转说明（隐式弹窗） ============ */

/* ---------- 模板：v-h5 ---------- */
function tplPageh5(){
  return `<div class="view" id="v-h5">
  <div class="panel">
    <div class="panel-b">
      <div class="flex" style="margin-bottom:0">
        <input class="inp" placeholder="所属项目（项目名称 / 活动 ID）" value="双节常温奶满减" style="max-width:280px">
        <input class="inp" placeholder="页面名称" style="max-width:180px">
        <input class="inp" placeholder="含批次编码" style="max-width:150px">
        <button class="btn btn-p btn-xs">查询</button>
        <button class="btn btn-g btn-xs">重置</button>
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-h">
      <h3>领券页面</h3>
      <div class="flex"><button class="btn btn-p btn-xs" onclick="openPageDrawer()">＋ 新建领券页面</button></div>
    </div>
    <div class="panel-b">
      <div class="tw scroll">
        <table>
          <tbody><tr><th style="width:180px">页面名称</th><th style="width:64px">所属项目</th><th style="width:70px">批次数</th><th style="width:62px">状态</th><th style="width:104px">有效期</th><th style="width:84px">渠道</th><th style="width:76px">二维码</th><th>操作</th></tr>
          <tr>
            <td><b>双节主推页（常温奶）</b></td>
            <td><a class="pjl sx-mono" onclick="event.stopPropagation()">…0041<span class="pjt"><span class="pjt-h">双节常温奶满减</span><span class="pjt-b"><span class="row"><span>活动编码</span><span class="sx-mono">MN-WX-202612-0041</span></span><span class="row"><span>业务部门</span><span>BU03 华东事业部</span></span><span class="row"><span>服务商</span><span>上海智士网络科技</span></span><span class="row"><span>项目状态</span><span style="color:var(--brand-d)">执行中</span></span><span class="row"><span>项目周期</span><span>2026-12-20 ~ 2027-01-05</span></span></span><span class="pjt-f">点击查看项目详情 →</span></span></a></td>
            <td>2 个</td>
            <td><span class="tg tg-g">启用中</span></td>
            <td style="white-space:nowrap;font-size:11.8px">2026-12-20 ~ 2027-01-05</td>
            <td style="font-size:11.8px"><span class="tg tg-n xs">线下物料</span> <span class="tg tg-n xs">公众号</span> <span class="tg tg-n xs">私域</span></td>
            
            <td style="white-space:nowrap;font-size:11.6px"><a class="lnk" onclick="openQr('r1','OFF')">物料</a> <a class="lnk" onclick="openQr('r1','MP')">公众号</a> <a class="lnk" onclick="openQr('r1','PRI')">私域</a></td>
            <td style="white-space:nowrap">
              <button class="btn btn-o btn-xs" onclick="openPgData('双节主推页（常温奶）','86,420','41,230','18,606')">数据</button>
              <button class="btn btn-o btn-xs" onclick="openEditDrawer('r1')">编辑</button>
              <button class="btn btn-g btn-xs">停用</button>
            </td>
          </tr>
          <tr>
            <td><b>高端礼盒页（满 129）</b></td>
            <td><a class="pjl sx-mono" onclick="event.stopPropagation()">…0041<span class="pjt"><span class="pjt-h">双节常温奶满减</span><span class="pjt-b"><span class="row"><span>活动编码</span><span class="sx-mono">MN-WX-202612-0041</span></span><span class="row"><span>业务部门</span><span>BU03 华东事业部</span></span><span class="row"><span>服务商</span><span>上海智士网络科技</span></span><span class="row"><span>项目状态</span><span style="color:var(--brand-d)">执行中</span></span><span class="row"><span>项目周期</span><span>2026-12-20 ~ 2027-01-05</span></span></span><span class="pjt-f">点击查看项目详情 →</span></span></a></td>
            <td>1 个</td>
            <td><span class="tg tg-g">启用中</span></td>
            <td style="white-space:nowrap;font-size:11.8px">2026-12-20 ~ 2027-01-05</td>
            <td style="font-size:11.8px"><span class="tg tg-n xs">线下物料</span> <span class="tg tg-n xs">私域</span></td>
            
            <td style="white-space:nowrap;font-size:11.6px"><a class="lnk" onclick="openQr('r2','OFF')">物料</a> <a class="lnk" onclick="openQr('r2','MP')">公众号</a> <a class="lnk" onclick="openQr('r2','PRI')">私域</a></td>
            <td style="white-space:nowrap">
              <button class="btn btn-o btn-xs" onclick="openPgData('高端礼盒页（满 129）','32,180','15,720','6,288')">数据</button>
              <button class="btn btn-o btn-xs" onclick="openEditDrawer('r2')">编辑</button>
              <button class="btn btn-g btn-xs">停用</button>
            </td>
          </tr>
          <tr style="background:#FCFDFC">
            <td><b style="color:var(--ink3)">元旦补发页（草稿）</b><div class="muted" style="font-size:11.2px">未启用</div></td>
            <td><a class="pjl sx-mono" onclick="event.stopPropagation()">…0041<span class="pjt"><span class="pjt-h">双节常温奶满减</span><span class="pjt-b"><span class="row"><span>活动编码</span><span class="sx-mono">MN-WX-202612-0041</span></span><span class="row"><span>业务部门</span><span>BU03 华东事业部</span></span><span class="row"><span>服务商</span><span>上海智士网络科技</span></span><span class="row"><span>项目状态</span><span style="color:var(--brand-d)">执行中</span></span><span class="row"><span>项目周期</span><span>2026-12-20 ~ 2027-01-05</span></span></span><span class="pjt-f">点击查看项目详情 →</span></span></a></td>
            <td>1 个</td>
            <td><span class="tg tg-n">草稿</span></td>
            <td style="white-space:nowrap;font-size:11.8px">2026-12-30 ~ 2027-01-05</td>
            <td style="font-size:11.8px">线下</td>
            
            <td><span class="muted" style="font-size:11.6px;white-space:nowrap" title="草稿未生成链接，启用后按渠道分别生成二维码">未生成</span></td>
            <td style="white-space:nowrap">
              <button class="btn btn-o btn-xs" disabled="" title="未启用，暂无数据">数据</button>
              <button class="btn btn-o btn-xs" onclick="openEditDrawer('r3')">继续编辑</button>
              <button class="btn btn-d btn-xs">删除</button>
            </td>
          </tr>
        </tbody></table>
      </div>
    </div>
</div>

</div>`;
}

/* ---------- 模板：dw-page ---------- */
function tplDrawerpage(){
  return `<div class="drawer" id="dw-page">
  <div class="dw-h">
    <h3>新建领券页面 <span class="sub">项目：双节常温奶满减 · MN-WX-202612-0041</span></h3>
    <div class="flex" style="gap:14px">
      <div class="dw-step" id="dwStep">
        <span class="sp on"><i>1</i>填基础信息</span><span style="color:#C9D8D2">›</span>
        <span class="sp"><i>2</i>选批次</span><span style="color:#C9D8D2">›</span>
        <span class="sp"><i>3</i>外观与渠道</span><span style="color:#C9D8D2">›</span>
        <span class="sp"><i>4</i>预览与生成</span>
      </div>
      <span class="dw-x" onclick="closeDrawer()">×</span>
    </div>
  </div>
  <div class="dw-b">
    

    <div class="fg c2">
      <div class="fr"><label>页面名称<em>*</em></label>
        <input class="inp" id="pgName" value="双节主推页（常温奶）" placeholder="如：双节主推页（常温奶）" oninput="syncPreview()">
        <div class="mut" style="font-size:11.6px;margin-top:4px">建议带场景或渠道，同一项目内名称不可重复，最长 30 字</div>
      </div>
      <div class="fr"><label>页面归属</label>
        <div class="locked" style="padding:7px 11px;font-size:12.4px;line-height:1.6"><span class="lk" style="margin-right:6px">继承项目</span>双节常温奶满减 · MN-WX-202612-0041</div>
        <div class="mut" style="font-size:11.6px;margin-top:4px">归属随项目锁定，不可修改；要挂到其他项目请从该项目进入</div>
      </div>
    </div>

    <div class="fr"><label>页面有效期<em>*</em></label>
      <div class="flex" style="gap:8px;max-width:420px"><input class="inp" value="2026-12-20" style="flex:1"><span class="muted">至</span><input class="inp" value="2027-01-05" style="flex:1"></div>
      <div class="mut" style="font-size:11.6px;margin-top:4px">留空则跟随批次有效期；超出批次有效期的部分自动截断。页面到期自动下架，二维码扫开显示「活动已结束」</div>
    </div>

    <div class="fr"><label>勾选券批次<em>*</em>（只能选本项目批次，勾选顺序即券卡展示顺序）</label>
      <div class="bfilter">
        <select class="inp" id="bFStatus" onchange="renderBlist()" style="max-width:104px">
          <option value="">全部状态</option>
          <option value="可建页">可建页</option>
          <option value="已占用">已占用</option>
        </select>
        <select class="inp" id="bFPlan" onchange="renderBlist()" style="max-width:128px">
          <option value="">全部计划</option>
          <option value="双节满减主推">双节满减主推</option>
          <option value="跨年场景承接">跨年场景承接</option>
          <option value="高端礼盒拉新">高端礼盒拉新</option>
        </select>
        <input class="inp" id="bFKw" placeholder="批次编码 / 标题" style="flex:1;min-width:120px" oninput="renderBlist()">
      </div>
      <div class="tw scroll" style="border:1px solid var(--line2);border-radius:7px">
        <table class="bt mini blist-tbl" style="table-layout:fixed">
          <thead><tr>
            <th style="width:34px"></th>
            <th style="width:82px">批次编码</th>
            <th style="width:110px">标题</th>
            <th>机制</th>
            <th style="width:80px">开始日期</th>
            <th style="width:80px">结束日期</th>
            <th style="width:66px">状态</th>
            <th style="width:68px">核销上限</th>
            <th style="width:66px">累计发放</th>
            <th style="width:62px">渠道</th>
          </tr></thead>
          <tbody id="blist"><tr class="b-row" onclick="bToggleRow(event,this,'23020101')" data-id="23020101" data-amt="15" data-cond="满 99 元可用" data-name="双节满减主推" data-exp="2026-12-20 至 2026-12-27 有效"><td><label class="chk"><input type="checkbox" onchange="bToggle(this,'23020101')"></label></td><td class="sx-mono" style="font-size:11.8px">23020101</td><td>双节满减主推</td><td class="muted" style="font-size:11.8px">满99元减15元</td><td class="muted" style="font-size:11.6px">2026-12-20</td><td class="muted" style="font-size:11.6px">2026-12-27</td><td><span class="tg tg-g xs">可建页</span></td><td class="num">9,000</td><td class="num">6,320</td><td class="muted" style="font-size:11.6px">扫码</td></tr><tr class="b-row" onclick="bToggleRow(event,this,'23020102')" data-id="23020102" data-amt="15" data-cond="满 99 元可用" data-name="跨年场景承接" data-exp="12-28-01-05 有效"><td><label class="chk"><input type="checkbox" onchange="bToggle(this,'23020102')"></label></td><td class="sx-mono" style="font-size:11.8px">23020102</td><td>跨年场景承接</td><td class="muted" style="font-size:11.8px">满99元减15元</td><td class="muted" style="font-size:11.6px">2026-12-28</td><td class="muted" style="font-size:11.6px">2027-01-05</td><td><span class="tg tg-g xs">可建页</span></td><td class="num">7,000</td><td class="num">3,610</td><td class="muted" style="font-size:11.6px">扫码</td></tr><tr class="b-row" onclick="bToggleRow(event,this,'23020103')" data-id="23020103" data-amt="20" data-cond="满 129 元可用" data-name="高端礼盒拉新" data-exp="12-20-01-05 有效"><td><label class="chk"><input type="checkbox" onchange="bToggle(this,'23020103')"></label></td><td class="sx-mono" style="font-size:11.8px">23020103</td><td>高端礼盒拉新</td><td class="muted" style="font-size:11.8px">满129元减20元</td><td class="muted" style="font-size:11.6px">2026-12-20</td><td class="muted" style="font-size:11.6px">2027-01-05</td><td><span class="tg tg-g xs">可建页</span></td><td class="num">5,000</td><td class="num">2,498</td><td class="muted" style="font-size:11.6px">扫码</td></tr></tbody>
        </table>
      </div>
      <div class="pager" style="margin:9px 0 0;padding:0;border:none;background:none">
        <div class="pg-info">共 <b id="bTotal">3</b> 个批次，每页 15 条</div>
        <div class="pg-btns" id="bPager"><button class="pg dis" onclick="bGo(0)">上一页</button><button class="pg on" onclick="bGo(1)">1</button><button class="pg dis" onclick="bGo(2)">下一页</button></div>
      </div>
      <div class="bcnt">
        已选 <b id="selCnt">0</b> 个批次
        <span class="warn" id="selWarn" style="display:none">· 超过 6 个批次会明显影响领取体验，建议拆分页面</span>
        <span>· 建议单页不超过 6 个批次</span>
      </div>
      <div class="mut" style="font-size:11.8px;margin-top:7px;line-height:1.75">置灰说明：<b>已占用</b> = 该批次已挂在其他启用中的页面上，同一批次只能挂一个启用页面（停用原页面后释放）。</div>
    </div>

    <div class="fr"><label>券卡展示顺序</label>
      <div class="sortlist" id="sortList"><div class="si"><span>未勾选批次</span></div></div>
      <div class="mut" style="font-size:11.6px;margin-top:5px">默认按勾选顺序排列；高面额券建议置顶，提升点击率</div>
    </div>

    <div class="fg c2">
      <div class="fr"><label>分发渠道（仅记录，用于归因）</label>
        <div style="display:flex;flex-direction:column;gap:3px">
          <label class="chk"><input type="checkbox" checked="">线下物料</label>
          <label class="chk"><input type="checkbox" checked="">公众号</label>
          <label class="chk"><input type="checkbox">私域</label>
        </div>
        <div class="mut" style="font-size:11.6px;margin-top:4px">同一页面多渠到投放，数据在看板合并统计；带参链接按渠道单独归因</div>
      </div>
      <div class="fr"><label>页面背景</label>
        <div class="bgpick">
          <div class="g" onclick="pickBg(this,'')"><i></i><span>默认样式​</span></div>
          
          
          <div class="g up on" onclick="pickBg(this,'')"><i style="background:#FAFCFB;border-bottom:1px dashed var(--line);display:flex;align-items:center;justify-content:center;color:var(--ink4);font-size:16px">＋</i><span style="white-space: pre-wrap;">上传背景图​</span></div>
        </div>
        <div class="mut" style="font-size:11.6px;margin-top:5px">仅可换背景图（建议 750×420px，≤500KB），券卡布局与文案固定，不可拖拽</div>
      </div>
    </div>

    <div class="st" style="margin:18px 0 10px">消费者端预览 <span class="sub">随勾选实时联动</span></div>
    <div class="stg">
      <div class="phone">
        <div class="notch"></div>
        <div class="scr">
          <div class="bg " id="pvBg">
            <em id="pvTitle">双节主推页·常温奶</em>
            <small>活动时间 2026.12.20 - 2027.01.05</small>
          </div>
          <div class="rulebar"><span>每人每种券限领 1 张</span><span>先到先得</span></div>
          <div class="bd2">
            <div class="ph" id="pvHint">请先勾选批次</div>
            <div id="pvList"></div>
          </div>
          <div class="cfoot">券由微信支付发放，领取后可在微信卡包查看<br>活动最终解释权归主办方所有</div>
        </div>
        <div class="statelab">预览态：未领取</div>
      </div>
      <div class="rules" id="stateDescDrawer">
        <div class="r"><span class="k">i</span><div><b>保存草稿：</b>校验只做「页面名称必填」，可先存后补；草稿占用的批次不做锁定，他人仍可建页。</div></div>
        <div class="r"><span class="k">ii</span><div><b>生成页面：</b>至少勾选 1 个批次、有效期不早于批次开始日；生成后页面状态为「未启用」，需手动启用才对外可领。</div></div>
        <div class="r"><span class="k">iii</span><div><b>启用：</b>启用时二次校验批次是否已被占用 / 是否失效，任一不通过则拒绝启用并提示具体批次；启用后批次即被锁定到本页面。</div></div>
      </div>
    </div>
  </div>
  <div class="dw-f">
    <div class="lft">已选 <b id="selCnt2">0</b> 个批次 · 页面归属 <b>双节常温奶满减</b></div>
    <div class="rgt">
      <button class="btn btn-g" onclick="closeDrawer()">取消</button>
      <button class="btn btn-o" onclick="closeDrawer()">保存草稿</button>
      <button class="btn btn-p" onclick="closeDrawer()">生成页面与二维码</button>
    </div>
  </div>
</div>`;
}

/* ---------- 模板：dw-edit ---------- */
function tplDraweredit(){
  return `<div class="drawer" id="dw-edit">
  <div class="dw-h">
    <h3>编辑领券页面 <span class="sub" id="edSub">双节主推页（常温奶） · MN-WX-202612-0041</span></h3>
    <div class="flex" style="gap:12px"><span class="tg tg-g" id="edStatus">启用中</span><span class="dw-x" onclick="closeDrawer()">×</span></div>
  </div>
  <div class="dw-b">
    <div class="fg c2">
      <div class="fr"><label>页面名称</label><input class="inp" id="edName" value="双节主推页（常温奶）"></div>
      <div class="fr"><label>页面归属</label><div class="locked" style="padding:7px 11px;font-size:12.4px;line-height:1.6"><span class="lk" style="margin-right:6px">继承项目</span>双节常温奶满减 · MN-WX-202612-0041</div></div>
    </div>
    <div class="fr"><label>含券批次（锁定，不可修改）</label>
      <div class="blist" id="edBatch"><div class="bi lock" data-id="23020101"><label class="chk"><input type="checkbox" checked="" disabled=""></label><span class="id">23020101</span><span class="info">¥15 / 满 99 · 9,000 张<small>2026-12-20 ~ 2026-12-27</small></span><span class="rt"><span class="tg tg-n xs">已锁定</span></span></div><div class="bi lock" data-id="23020102"><label class="chk"><input type="checkbox" checked="" disabled=""></label><span class="id">23020102</span><span class="info">¥15 / 满 99 · 7,000 张<small>2026-12-28 ~ 2027-01-05</small></span><span class="rt"><span class="tg tg-n xs">已锁定</span></span></div></div>
    </div>
    <div class="fr"><label>页面背景</label>
      <div class="bgpick">
        <div class="g on"><i></i><span>默认样式​</span></div>
        <div class="g"><i style="background:#FAFCFB;border-bottom:1px dashed var(--line)"></i><span style="white-space: pre-wrap;">上传背景图​</span></div>
      </div>
    </div>
    <div class="fr"><label>分发渠道</label>
      <div style="display:flex;flex-direction:column;gap:3px">
        <label class="chk"><input type="checkbox" checked="">线下物料</label>
        <label class="chk"><input type="checkbox" checked="">公众号</label>
        <label class="chk"><input type="checkbox">私域</label>
      </div>
    </div>
    <div class="st" style="margin:18px 0 10px">页面预览 <span class="sub">与消费者实际看到的一致</span></div>
    <div class="stg">
      <div class="phone">
        <div class="notch"></div>
        <div class="scr">
          <div class="bg" id="edBg">
            <em id="edTitle">双节主推页·常温奶</em>
            <small>活动时间 2026.12.20 - 2027.01.05</small>
          </div>
          <div class="rulebar"><span>每人每种券限领 1 张</span><span>先到先得</span></div>
          <div class="bd2">
            <div class="ph">共 2 张券</div>
            <div id="edList"><div class="cp"><div class="amt">¥<b>15</b></div><div class="mid"><b>双节常温奶满减券</b><small>满 99 元可用 · 12.20-12.27 有效</small></div><div class="btn2 ">立即领取</div></div><div class="cp"><div class="amt">¥<b>15</b></div><div class="mid"><b>双节常温奶满减券</b><small>满 99 元可用 · 12.28-01.05 有效</small></div><div class="btn2 ">立即领取</div></div></div>
          </div>
          <div class="cfoot">券由微信支付发放，领取后可在微信卡包查看<br>活动最终解释权归主办方所有</div>
        </div>
      </div>
      <div class="rules" id="edInfo"><div class="r"><span class="k">·</span><div><b>含券批次：</b><span class="sx-mono">23020101、23020102</span>（共 2 个，锁定不可改）</div></div><div class="r"><span class="k">·</span><div><b>分发渠道：</b>线下物料、公众号</div></div><div class="r"><span class="k">·</span><div><b>页面链接：</b><span class="sx-mono">mn-act.cn/h5/g/7f3a2c</span></div></div><div class="r"><span class="k">·</span><div><b>有效期：</b>2026-12-20 ~ 2027-01-05</div></div></div>
    </div>

  </div>
  <div class="dw-f">
    <div class="lft">最近保存 2026-10-19 16:05</div>
    <div class="rgt">
      <button class="btn btn-g" onclick="closeDrawer()">取消</button>
      <button class="btn btn-d" id="edStop" onclick="closeDrawer()">停用页面</button>
      <button class="btn btn-d" id="edDel" style="display:none" onclick="closeDrawer()">删除草稿</button>
      <button class="btn btn-p" onclick="closeDrawer()">保存</button>
    </div>
  </div>
</div>`;
}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-h5",
  title: "领券页面",
  crumb: "运营执行 / 领券页面",
  group: "运营执行",
  template: tplPageh5
});

MT.defineDrawer("dw-page", tplDrawerpage);

MT.defineDrawer("dw-edit", tplDraweredit);

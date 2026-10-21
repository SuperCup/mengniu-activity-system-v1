
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
function openDrawer(id){
  var d=document.getElementById(id); if(!d)return;
  /* 先清掉其它已打开的抽屉，避免叠加后互相遮挡 */
  var all=document.querySelectorAll('.drawer.on');
  for(var i=0;i<all.length;i++) all[i].classList.remove('on');
  var m=document.getElementById('mask'); if(m) m.classList.add('on');
  d.classList.add('on');
  document.body.style.overflow='hidden';
  if(id==='dw-page'){
    document.querySelectorAll('#dw-page #blist input[type=checkbox]').forEach(function(i){if(!i.disabled)i.checked=false;});
    document.getElementById('pvList').innerHTML='';
    refresh();
  }
}
/* ============ 领券页面：列表与编辑抽屉共用同一份数据 ============ */
var PAGES={
  r1:{name:'双节主推页（常温奶）',status:'启用中',cls:'tg-g',
      batches:[{id:'23020101',face:'15',cond:'满 99',qty:'9,000 张',exp:'12-20 ~ 12-27',card:'双节常温奶满减券',cardExp:'12.20-12.27 有效'},
               {id:'23020102',face:'15',cond:'满 99',qty:'7,000 张',exp:'12-28 ~ 01-05',card:'双节常温奶满减券',cardExp:'12.28-01.05 有效'}],
      chan:['线下物料','公众号'],link:'mn-act.cn/h5/g/7f3a2c',period:'2026-12-20 ~ 2027-01-05',
      title:'双节主推页·常温奶',actTime:'2026.12.20 - 2027.01.05'},
  r2:{name:'高端礼盒页（满 129）',status:'启用中',cls:'tg-g',
      batches:[{id:'23020103',face:'20',cond:'满 129',qty:'5,000 张',exp:'12-20 ~ 01-05',card:'高端礼盒专享券',cardExp:'12.20-01.05 有效'}],
      chan:['导购私域'],link:'mn-act.cn/h5/g/2b9d81',period:'2026-12-20 ~ 2027-01-05',
      title:'高端礼盒页·满 129',actTime:'2026.12.20 - 2027.01.05'},
  r3:{name:'元旦补发页',status:'草稿',cls:'tg-n',
      batches:[{id:'23020104',face:'15',cond:'满 99',qty:'5,000 张',exp:'12-30 ~ 01-05',card:'元旦补发券',cardExp:'12.30-01.05 有效'}],
      chan:['线下'],link:'',period:'2026-12-30 ~ 2027-01-05',
      title:'元旦补发页',actTime:'2026.12.30 - 2027.01.05'}
};
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
function closeDrawer(){
  var ds=document.querySelectorAll('.drawer.on');
  for(var i=0;i<ds.length;i++) ds[i].classList.remove('on');
  var m=document.getElementById('mask'); if(m) m.classList.remove('on');
  document.body.style.overflow='';
}
/* ============ 消费者状态切换 ============ */
var STATEMAP={
  default:[['立即领取',''],['立即领取',''],['立即领取','']],
  loading:[['领取中…','off'],['立即领取',''],['立即领取','']],
  got:[['去卡包查看','got'],['立即领取',''],['立即领取','']],
  repeat:[['已领取','off'],['立即领取',''],['立即领取','']],
  sold:[['已领完','off'],['立即领取',''],['立即领取','']],
  expired:[['活动已结束','off'],['活动已结束','off'],['活动已结束','off']]
};
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
var QRDATA={
  r1:{name:'双节主推页（常温奶）',proj:'双节常温奶满减 · <span class="sx-mono">MN-WX-202612-0041</span>',
      batch:'<span class="tg tg-n xs">23020101</span> <span class="tg tg-n xs">23020102</span>',
      period:'2026-12-20 ~ 2027-01-05',chan:'线下 / 公众号',link:'mn-act.cn/h5/g/7f3a2c',
      status:'启用中',cls:'tg-g',seed:7},
  r2:{name:'高端礼盒页（满 129）',proj:'双节常温奶满减 · <span class="sx-mono">MN-WX-202612-0041</span>',
      batch:'<span class="tg tg-n xs">23020103</span>',
      period:'2026-12-20 ~ 2027-01-05',chan:'导购私域',link:'mn-act.cn/h5/g/2b9d81',
      status:'启用中',cls:'tg-g',seed:23}
};
var qrCur={key:'r1',px:300};
function qrDrawBack(svg,seed){
  /* 用确定性伪随机生成点阵：同一页面 seed 固定 → 图案稳定 */
  var out='<rect width="100" height="100" fill="#fff"/>';
  function finder(x,y){
    return '<rect x="'+x+'" y="'+y+'" width="24" height="24" fill="#1F2D2A"/>'+
           '<rect x="'+(x+5)+'" y="'+(y+5)+'" width="14" height="14" fill="#fff"/>'+
           '<rect x="'+(x+9)+'" y="'+(y+9)+'" width="6" height="6" fill="#1F2D2A"/>';
  }
  var v=seed;
  for(var y=0;y<20;y++){
    for(var x=0;x<20;x++){
      v=(v*1103515245+12345)&0x7fffffff;
      if((v>>16)%100<48){
        var px=3+x*4.7, py=3+y*4.7;
        /* 避开三个定位角 */
        if((px<30&&py<30)||(px>66&&py<30)||(px<30&&py>66)) continue;
        out+='<rect x="'+px.toFixed(1)+'" y="'+py.toFixed(1)+'" width="4.2" height="4.2" fill="#1F2D2A"/>';
      }
    }
  }
  out+=finder(3,3)+finder(73,3)+finder(3,73);
  return out;
}
function openQr(key){
  var d=QRDATA[key]; if(!d)return;
  qrCur={key:key,px:300};
  document.getElementById('qrPageName').textContent=d.name;
  document.getElementById('qrName').textContent=d.name;
  document.getElementById('qrProj').innerHTML=d.proj;
  document.getElementById('qrBatch').innerHTML=d.batch;
  document.getElementById('qrPeriod').textContent=d.period;
  document.getElementById('qrChan').textContent=d.chan;
  document.getElementById('qrLink').innerHTML='https://'+d.link+' <a class="lnk">复制</a>';
  document.getElementById('qrFoot').textContent=d.link;
  var st=document.getElementById('qrStatus');
  st.textContent=d.status; st.className='tg '+d.cls;
  document.getElementById('qrSvg').innerHTML=qrDrawBack(null,d.seed);
  var sz=document.querySelectorAll('#qrSz span');
  for(var i=0;i<sz.length;i++) sz[i].className = i===0?'on':'';
  document.getElementById('qrDimv').textContent='300 × 300 px';
  openDrawer('dw-qr');
}
function qrSize(el,px){
  var sz=document.querySelectorAll('#qrSz span');
  for(var i=0;i<sz.length;i++) sz[i].classList.remove('on');
  el.classList.add('on');
  qrCur.px=px;
  document.getElementById('qrDimv').textContent=px+' × '+px+' px';
}
function qrDl(fmt){
  var d=QRDATA[qrCur.key]||{link:''};
  alert('下载 '+fmt+' · '+qrCur.px+'px\n页面：'+d.name+'\n链接：'+d.link+'\n（演示环境仅提示，不实际下载）');
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDrawer();});

/* ============ 路由 ============ */
/* ================= 四、活动计划：列表 / 分页 / 详情 ================= */
/* 零售商库：商户级（一个商户 = 一个微信支付商户号）
   r=区域  ret=SG零售商  name=商户名称  m=微信商户号 */
var RET_DB=[
  {r:'重庆', ret:'永辉',      name:'重庆永辉超市有限公司',                   m:'1236057802'},
  {r:'湖北', ret:'娇兰佳人',  name:'武汉市**坚勇佳人化妆品店',               m:'1454028602'},
  {r:'湖北', ret:'娇兰佳人',  name:'武汉市汉阳区娇妤化妆品店',               m:'1461722002'},
  {r:'四川', ret:'舞东风',    name:'四川舞东风超市连锁股份有限公司',         m:'1491611462'},
  {r:'广东', ret:'壹加壹',    name:'广东壹加壹商业连锁有限公司',             m:'1500278692'},
  {r:'广东', ret:'壹加壹',    name:'广东壹加壹商业连锁有限公司',             m:'1500279152'},
  {r:'广东', ret:'精明购',    name:'上海智***科技有限公司',                  m:'1493487682'},
  {r:'广东', ret:'华润万家',  name:'广东特易购商业有限公司',                 m:'1246429601'},
  {r:'广东', ret:'华润万家',  name:'上海嘉定乐购生活购物有限公司顺德分公司', m:'1246444301'},
  {r:'广东', ret:'华润万家',  name:'华润万家生活超市（中山）有限公司',       m:'1246552201'},
  {r:'广西', ret:'华润万家',  name:'广西华润万家生活超市有限公司',           m:'1246565301'},
  {r:'广东', ret:'华润万家',  name:'华润万***超市（珠海）有限公司',          m:'1246568101'},
  {r:'广东', ret:'华润万家',  name:'江门华润万家生活超市有限公司',           m:'1246642801'},
  {r:'广东', ret:'华润万家',  name:'特易购***深圳）有限公司',                m:'1247444201'},
  {r:'广东', ret:'华润万家',  name:'上海嘉定乐购生活购物有限公司东莞市厚街分公司', m:'1247453101'},
  {r:'江苏', ret:'苏果超市',  name:'苏果超市有限公司南京分公司',             m:'1251328801'},
  {r:'上海', ret:'全家便利',  name:'上海福满家便利有限公司',                 m:'1252436002'},
  {r:'北京', ret:'物美',      name:'北京物美商业集团股份有限公司',           m:'1253041102'},
  {r:'天津', ret:'物美',      name:'天津物美便利超市有限公司',               m:'1253041305'},
  {r:'浙江', ret:'盒马',      name:'杭州盒马网络科技有限公司',               m:'1254189203'},
  {r:'云南', ret:'钱大妈',    name:'昆明钱大妈农产品有限公司',               m:'1255203406'}
];
/* 商品库 */
var SKU_DB=[
  {g:'常温奶',n:'特仑苏纯牛奶 250ml×12',d:'SKU 6901234500011'},
  {g:'常温奶',n:'蒙牛纯甄酸奶 200g×12',d:'SKU 6901234500028'},
  {g:'常温奶',n:'未来星儿童奶 190ml×12',d:'SKU 6901234500035'},
  {g:'礼盒装',n:'特仑苏 / 精选礼盒',d:'2 款礼盒 · 18 SKU'},
  {g:'礼盒装',n:'纯甄果粒礼盒装',d:'SKU 6901234500042'},
  {g:'冰品',n:'随变 / 蒂兰圣雪冰品',d:'夏季档专用 · 64 SKU'}
];

/* 计划数据（创建时填写） */
var PLANS=[
  {id:'PL-01',pid:'ZS-HD-202612-A',name:'双节满减主推',mech:'常温奶满 99 减 15',
   s:'2026-12-20',e:'2026-12-27',ret:['重庆永辉超市有限公司','广东特易购商业有限公司'],sku:['特仑苏纯牛奶 250ml\u00d712'],
   budget:135000,coupon:'\u6ee1 99 \u5143\u51cf 15 \u5143',face:15,thr:99,qty:9000,limit:'\u6bcf\u4eba\u9650\u9886 2 \u5f20',valid:'2026-12-20 ~ 2026-12-27',
   bat:'23020101',bstat:'\u5df2\u5ba1\u6838',btitle:'\u53cc\u8282\u6ee1\u51cf\u4e3b\u63a8',bmech:'\u6ee199\u5143\u51cf15\u5143',
   bs:'2026-12-20',be:'2026-12-27',bchannel:'\u626b\u7801\u9886\u5238',bqty:9000,used:6320,usedAmt:94800},
  {id:'PL-02',pid:'ZS-HD-202612-B',name:'\u8de8\u5e74\u573a\u666f\u627f\u63a5',mech:'\u5e38\u6e29\u5976\u6ee1 99 \u51cf 15',
   s:'2026-12-28',e:'2027-01-05',ret:['\u91cd\u5e86\u6c38\u8f89\u8d85\u5e02\u6709\u9650\u516c\u53f8','\u5e7f\u4e1c\u7279\u6613\u8d2d\u5546\u4e1a\u6709\u9650\u516c\u53f8'],sku:['\u7279\u4ed1\u82cf\u7eaf\u725b\u5976 250ml\u00d712'],
   budget:105000,coupon:'\u6ee1 99 \u5143\u51cf 15 \u5143',face:15,thr:99,qty:7000,limit:'\u6bcf\u4eba\u9650\u9886 2 \u5f20',valid:'2026-12-28 ~ 2027-01-05',
   bat:'23020102',bstat:'\u5df2\u5ba1\u6838',btitle:'\u8de8\u5e74\u573a\u666f\u627f\u63a5',bmech:'\u6ee199\u5143\u51cf15\u5143',
   bs:'2026-12-28',be:'2027-01-05',bchannel:'\u626b\u7801\u9886\u5238',bqty:7000,used:3610,usedAmt:54150},
  {id:'PL-03',pid:'ZS-HD-202612-C',name:'\u9ad8\u7aef\u793c\u76d2\u62c9\u65b0',mech:'\u9ad8\u7aef\u793c\u76d2\u6ee1 129 \u51cf 20',
   s:'2026-12-20',e:'2027-01-05',ret:['\u676d\u5dde\u76d2\u9a6c\u7f51\u7edc\u79d1\u6280\u6709\u9650\u516c\u53f8'],sku:['\u7279\u4ed1\u82cf / \u7cbe\u9009\u793c\u76d2'],
   budget:100000,coupon:'\u6ee1 129 \u5143\u51cf 20 \u5143',face:20,thr:129,qty:5000,limit:'\u6bcf\u4eba\u9650\u9886 1 \u5f20',valid:'2026-12-20 ~ 2027-01-05',
   bat:'23020103',bstat:'\u5df2\u5ba1\u6838',btitle:'\u9ad8\u7aef\u793c\u76d2\u62c9\u65b0',bmech:'\u6ee1129\u5143\u51cf20\u5143',
   bs:'2026-12-20',be:'2027-01-05',bchannel:'\u626b\u7801\u9886\u5238',bqty:5000,used:2498,usedAmt:49960}
];
function money(n){return '¥'+Number(n).toLocaleString('en-US')+'.00';}

var PLAN_PAGE=1, PLAN_SIZE=5;

/* ============================================================
   计划与批次（1 : 1）
   - 计划是唯一记录，批次挂在计划下，一个计划最多一个批次
   - 数据源统一为 PLANS：项目创建页 / 审批页 / 计划与批次页同源
   ============================================================ */

/* 批次与计划的对应校验 */
function batCheck(p){
  if(!p.bat) return {txt:'待回传',cls:'tg-a'};
  if(p.bstat==='已终止') return {txt:'已终止',cls:'tg-n'};
  return {txt:'通过',cls:'tg-g'};
}

/* 计划表 */
function renderPlans(){
  var body=document.getElementById('pbPlanBody');
  var cnt=document.getElementById('pbPlanCnt');
  if(cnt) cnt.textContent=PLANS.length+' 个计划';
  if(!body) return;

  if(!PLANS.length){
    body.innerHTML='<tr><td colspan="9" class="empty-row">暂无计划</td></tr>';
    return;
  }

  var h='';
  PLANS.forEach(function(p,i){
    var ck=batCheck(p);
    var batCell = p.bat
      ? '<a class="lnk sx-mono" onclick="openPlanDetail('+i+')">'+pnEsc(p.bat)+'</a>'
      : '<span class="tg tg-a xs">待服务商回传</span>';
    h+='<tr>'
      +'<td><b>'+pnEsc(p.pid)+'</b><div class="muted sx-mono">MN-WX-202612-0041</div></td>'
      +'<td>'+pnEsc(p.name)+'</td>'
      +'<td>\u00a5'+p.face+' / \u6ee1 '+p.thr+'</td>'
      +'<td class="num" style="text-align:left">'+p.qty.toLocaleString('en-US')+' \u5f20</td>'
      +'<td>'+money(p.budget)+'</td>'
      +'<td style="font-size:12.1px;white-space:nowrap">'+p.s.slice(5)+' ~ '+p.e.slice(5)+'</td>'
      +'<td>'+batCell+'</td>'
      +'<td><span class="tg '+ck.cls+'">'+ck.txt+'</span></td>'
      +'<td><a class="lnk" onclick="openPlanDetail('+i+')">\u660e\u7ec6</a></td>'
      +'</tr>';
  });
  body.innerHTML=h;

  /* 顶部统计：计划数 / 已回传批次数 / 页面数 */
  var st=document.getElementById('pbStat');
  if(st){
    var bn=PLANS.filter(function(x){ return !!x.bat; }).length;
    st.textContent=PLANS.length+' / '+bn+' / 2';
  }

  /* 批次列表随计划同步重建，保证领券页与计划页口径一致 */
  BAT = batList();

  renderCreatePlans();
  renderBatches();
  renderApprovePlans();

  if(typeof renderBlist==='function'){ try{ renderBlist(); }catch(e){} }
}

/* 项目创建页「四、批次计划」表：与计划与批次页同源 PLANS */
function renderCreatePlans(){
  var body=document.getElementById('planBody'); if(!body) return;
  var total=PLANS.length;
  var pages=Math.max(1,Math.ceil(total/PLAN_SIZE));
  if(PLAN_PAGE>pages) PLAN_PAGE=pages;
  var st=(PLAN_PAGE-1)*PLAN_SIZE, en=Math.min(st+PLAN_SIZE,total);

  if(!total){
    body.innerHTML='<tr><td colspan="8" class="empty-row">\u5c1a\u672a\u6dfb\u52a0\u6279\u6b21\u8ba1\u5212</td></tr>';
  }else{
    var h='';
    for(var i=st;i<en;i++){
      var p=PLANS[i];
      var rn=p.ret.length?pnEsc(p.ret[0])+(p.ret.length>1?'<span class="muted"> +'+(p.ret.length-1)+'</span>':''):'<span class="muted">\u672a\u9009</span>';
      var sn=p.sku.length?pnEsc(p.sku[0])+(p.sku.length>1?'<span class="muted"> +'+(p.sku.length-1)+'</span>':''):'<span class="muted">\u672a\u9009</span>';
      h+='<tr>'
        +'<td class="muted">'+(i+1)+'</td>'
        +'<td class="nm">'+pnEsc(p.name)+'</td>'
        +'<td>'+pnEsc(p.mech)+'</td>'
        +'<td style="font-size:12.2px;white-space:nowrap">'+p.s+' ~ '+p.e+'</td>'
        +'<td><span class="lk" onclick="openPick(\'ret\','+i+')">'+rn+'</span></td>'
        +'<td><span class="lk" onclick="openPick(\'sku\','+i+')">'+sn+'</span></td>'
        +'<td class="num" style="text-align:right;padding-right:14px;font-size:12.2px">'+money(p.budget)+'</td>'
        +'<td><div class="ops"><a onclick="openPlanDetail('+i+')">\u8be6\u60c5</a><a onclick="openPlanNew('+i+')">\u7f16\u8f91</a><a class="del" onclick="delPlan('+i+')">\u5220\u9664</a></div></td>'
        +'</tr>';
    }
    body.innerHTML=h;
  }

  var t=document.getElementById('planTotal'); if(t) t.textContent=total;
  var pg='';
  pg+='<span class="'+(PLAN_PAGE<=1?'dis':'')+'" onclick="gotoPlan('+(PLAN_PAGE-1)+')">\u4e0a\u4e00\u9875</span>';
  for(var k=1;k<=pages;k++) pg+='<span class="'+(k===PLAN_PAGE?'on':'')+'" onclick="gotoPlan('+k+')">'+k+'</span>';
  pg+='<span class="'+(PLAN_PAGE>=pages?'dis':'')+'" onclick="gotoPlan('+(PLAN_PAGE+1)+')">\u4e0b\u4e00\u9875</span>';
  var pb=document.getElementById('planPager'); if(pb) pb.innerHTML=pg;
}

/* 批次表：数据只取自 PLANS 的批次字段，因此天然 1:1 */
function renderBatches(){
  var body=document.getElementById('batBody');
  var cnt=document.getElementById('pbBatCnt');
  if(!body) return;

  var list = PLANS.filter(function(p){ return !!p.bat; });
  var total = list.length;

  var sel=document.getElementById('pbBatPlan');
  if(sel){
    var cur=sel.value;
    var opt='<option value="">\u5168\u90e8\u8ba1\u5212</option>';
    list.forEach(function(p){
      opt+='<option value="'+p.bat+'"'+(cur===p.bat?' selected':'')+'>'+pnEsc(p.bat)+' \u00b7 '+pnEsc(p.name)+'</option>';
    });
    sel.innerHTML=opt;
  }

  var fp=sel?sel.value:'';
  var stEl=document.getElementById('pbBatStat');
  var fs=stEl?stEl.value:'';
  var rtEl=document.getElementById('pbBatRet');
  var fr=rtEl?String(rtEl.value||'').trim().toLowerCase():'';

  var rows=list.filter(function(p){
    if(fp && p.bat!==fp) return false;
    if(fs && p.bstat!==fs) return false;
    if(fr){
      var hay=(p.bat+' '+p.name+' '+(p.ret||[]).join(' ')).toLowerCase();
      if(hay.indexOf(fr)<0) return false;
    }
    return true;
  });

  if(cnt){
    cnt.textContent = rows.length===total ? total+' \u4e2a\u6279\u6b21' : rows.length+' / '+total+' \u4e2a\u6279\u6b21';
  }

  if(!rows.length){
    body.innerHTML='<tr><td colspan="9" class="empty-row">\u6ca1\u6709\u5339\u914d\u7684\u6279\u6b21</td></tr>';
    return;
  }

  var h='';
  rows.forEach(function(p){
    var idx=PLANS.indexOf(p);
    var sc = p.bstat==='\u5df2\u5ba1\u6838' ? 'var(--brand-d)'
           : (p.bstat==='\u5df2\u7ec8\u6b62' ? 'var(--red)' : 'var(--amber)');
    h+='<tr>'
      +'<td><a class="lnk sx-mono" onclick="openPlanDetail('+idx+')">'+pnEsc(p.bat)+'</a></td>'
      +'<td style="font-size:11.8px;white-space:nowrap"><span class="sx-mono">'+pnEsc(p.pid)+'</span></td>'
      +'<td>'+pnEsc(p.btitle||p.name)+'</td>'
      +'<td style="font-size:12.1px">'+pnEsc(p.bmech||'\u2014')+'</td>'
      +'<td style="font-size:11.8px;white-space:nowrap">'+pnEsc(p.bs||'\u2014')+'<br><span class="muted">'+pnEsc(p.be||'')+'</span></td>'
      +'<td style="font-weight:600;color:'+sc+'">'+pnEsc(p.bstat)+'</td>'
      +'<td class="num" style="text-align:left">'+(p.bqty||0).toLocaleString('en-US')+'</td>'
      +'<td style="font-size:11.8px">'+(p.used||0).toLocaleString('en-US')+' \u5355<br><span class="muted">'+money(p.usedAmt||0)+'</span></td>'
      +'<td><a class="lnk" onclick="openPlanDetail('+idx+')">\u660e\u7ec6</a></td>'
      +'</tr>';
  });
  body.innerHTML=h;
}

function gotoPlan(n){
  var pages=Math.max(1,Math.ceil(PLANS.length/PLAN_SIZE));
  if(n<1||n>pages) return;
  PLAN_PAGE=n; renderPlans();
}

/* ============ 审批详情：批次计划（与项目创建共用 PLANS） ============ */
function renderApprovePlans(){
  var body=document.getElementById('apPlanBody'); if(!body) return;
  var cnt=document.getElementById('apPlanCnt');
  if(cnt) cnt.textContent=PLANS.length;
  if(!PLANS.length){
    body.innerHTML='<tr><td colspan="7" class="empty-row">\u6682\u65e0\u6279\u6b21\u8ba1\u5212</td></tr>';
    return;
  }
  var h='';
  PLANS.forEach(function(p,i){
    var rn=p.ret.length
      ? pnEsc(p.ret[0])+(p.ret.length>1?'<span class="muted"> +'+(p.ret.length-1)+'</span>':'')
      : '<span class="muted">\u672a\u9009</span>';
    var sn=p.sku.length
      ? pnEsc(p.sku[0])+(p.sku.length>1?'<span class="muted"> +'+(p.sku.length-1)+'</span>':'')
      : '<span class="muted">\u672a\u9009</span>';
    h+='<tr>'
      +'<td class="muted">'+(i+1)+'</td>'
      +'<td class="nm">'+pnEsc(p.name)+'</td>'
      +'<td style="font-size:12.2px;word-break:break-word">'+pnEsc(p.mech)+'</td>'
      +'<td style="font-size:12.1px;line-height:1.55"><span style="font-family:ui-monospace,Menlo,monospace">'+p.s+'</span><br><span class="muted" style="font-family:ui-monospace,Menlo,monospace">'+p.e+'</span></td>'
      +'<td style="font-size:12.2px;word-break:break-word;line-height:1.5">'+rn+'</td>'
      +'<td style="font-size:12.2px;word-break:break-word;line-height:1.5">'+sn+'</td>'
      +'<td class="num" style="text-align:right;padding-right:12px;font-size:12.2px">'+money(p.budget)+'</td>'
      +'</tr>';
  });
  body.innerHTML=h;
}

function delPlan(i){
  if(!confirm('确认删除计划「'+PLANS[i].name+'」？')) return;
  PLANS.splice(i,1);
  var pages=Math.max(1,Math.ceil(PLANS.length/PLAN_SIZE));
  if(PLAN_PAGE>pages) PLAN_PAGE=pages;
  renderPlans();
}

/* 详情抽屉 */
function openPlanDetail(i){
  var p=PLANS[i]; if(!p) return;
  var h='';
  h+='<div class="dsec"><h5>计划基础信息</h5><div class="dkv">'+
     '<div class="r"><span class="k">计划名</span><span class="v">'+p.name+'</span></div>'+
     '<div class="r"><span class="k">计划 ID</span><span class="v">'+pnEsc(p.pid)+'</span></div>'+
     '<div class="r full"><span class="k">活动机制</span><span class="v">'+p.mech+'</span></div>'+
     '<div class="r"><span class="k">开始时间</span><span class="v">'+p.s+'</span></div>'+
     '<div class="r"><span class="k">结束时间</span><span class="v">'+p.e+'</span></div>'+
     '</div></div>';

  /* 零售商明细：微信商户号 / 区域 / 商户名称 / SG零售商 */
  var rRow = p.ret.map(function(x){
    var src = RET_DB.filter(function(y){ return y.name===x || y.n===x; })[0];
    return '<tr><td class="sx-mono" style="font-size:11.6px">'+(src?src.m:'—')+'</td>'
         +'<td>'+(src?src.r:'—')+'</td>'
         +'<td>'+x+'</td>'
         +'<td>'+(src?src.ret:'—')+'</td></tr>';
  }).join('');
  h+='<div class="dsec"><h5>零售商明细（'+p.ret.length+' 条）</h5>'+
     (p.ret.length
       ? '<table class="bt mini" style="table-layout:fixed"><thead><tr>'+
         '<th style="width:20%">微信商户号</th><th style="width:9%">区域</th>'+
         '<th style="width:52%">商户名称</th><th style="width:19%">SG零售商</th>'+
         '</tr></thead><tbody>'+rRow+'</tbody></table>'
       : '<div class="muted" style="font-size:12.4px">未添加零售商</div>')+
     '</div>';

  /* 商品明细：按条列出（含 SKU / 供货价 / 参与量） */
  var sRow = p.sku.map(function(x){
    var hit = PN_SKU_PRESET.filter(function(y){ return y.n===x; })[0];
    return '<tr><td>'+x+'</td><td>'+(hit?hit.c:'—')+'</td><td class="num">'+(hit?hit.p:'—')+'</td><td class="num">'+(hit?hit.q:'—')+'</td></tr>';
  }).join('');
  h+='<div class="dsec"><h5>活动商品明细（'+p.sku.length+' 条）</h5>'+
     (p.sku.length
       ? '<table class="bt mini" style="table-layout:fixed"><thead><tr>'+
         '<th style="width:40%">商品 / 品类</th><th style="width:22%">SKU 编码</th>'+
         '<th style="width:19%;text-align:right">供货价</th><th style="width:19%;text-align:right">参与量</th>'+
         '</tr></thead><tbody>'+sRow+'</tbody></table>'
       : '<div class="muted" style="font-size:12.4px">未添加商品</div>')+
     '</div>';

  h+='<div class="dsec"><h5>预算分配</h5><div class="dkv">'+
     '<div class="r"><span class="k">计划预算</span><span class="v" style="color:var(--brand-d);font-weight:700">'+money(p.budget)+'</span></div>'+
     '<div class="r"><span class="k">占项目预算</span><span class="v">'+(p.budget/4000).toFixed(1)+'%</span></div>'+
     '<div class="r"><span class="k">发放数量</span><span class="v">'+Number(p.qty).toLocaleString('en-US')+' 张</span></div>'+
     '<div class="r"><span class="k">单张成本</span><span class="v">'+money(Math.round(p.budget/p.qty*100)/100)+'</span></div>'+
     '</div></div>';

  h+='<div class="dsec"><h5>优惠发放规则</h5><div class="dkv">'+
     '<div class="r full"><span class="k">券规则</span><span class="v">'+p.coupon+'</span></div>'+
     '<div class="r"><span class="k">券面额</span><span class="v">'+money(p.face)+'</span></div>'+
     '<div class="r"><span class="k">使用门槛</span><span class="v">满 '+p.thr+' 元可用</span></div>'+
     '<div class="r"><span class="k">单人限领</span><span class="v">'+p.limit+'</span></div>'+
     '<div class="r"><span class="k">券有效期</span><span class="v">'+p.valid+'</span></div>'+
     '</div></div>';

  /* 对应批次：1 个计划对应 1 个批次 */
  var hasBat = !!p.bat;
  var ck = batCheck(p);
  h+='<div class="dsec" style="margin-bottom:0"><h5>对应批次 <span class="tg '+ck.cls+' xs" style="margin-left:6px">'+ck.txt+'</span></h5>'+
     (hasBat
       ? '<div class="dkv">'+
         '<div class="r"><span class="k">批次编码</span><span class="v"><b style="font-family:ui-monospace,Menlo,monospace">'+pnEsc(p.bat)+'</b> <span class="muted">（微信支付后台生成）</span></span></div>'+
         '<div class="r"><span class="k">对应计划</span><span class="v">'+pnEsc(p.pid)+' <span class="tg tg-g xs">一一对应</span></span></div>'+
         '<div class="r"><span class="k">批次状态</span><span class="v">'+pnEsc(p.bstat)+'</span></div>'+
         '<div class="r"><span class="k">批次有效期</span><span class="v">'+pnEsc(p.bs||'\u2014')+' ~ '+pnEsc(p.be||'\u2014')+'</span></div>'+
         '<div class="r"><span class="k">已核销</span><span class="v">'+(p.used||0).toLocaleString('en-US')+' 单 / '+money(p.usedAmt||0)+'</span></div>'+
         '</div>'
       : '<div class="muted" style="font-size:12.4px">服务商尚未回传该计划的批次明细与核销订单；一个计划对应一个批次，不得拆分或合并</div>')+
     '</div>';

  document.getElementById('pdTitle').innerHTML='计划与批次明细 <span class="sub">'+pnEsc(p.pid)+(hasBat?' / '+pnEsc(p.bat):'')+'</span>';
  document.getElementById('pdBody').innerHTML=h;
  openDrawer('dw-pdetail');
}

/* 零售商 / 商品 多选浮层 */
var PICK = {type:"ret", idx:-1, tmp:[], vis:[]};
function openPick(type,idx){
  PICK.type=type; PICK.idx=idx;
  var p=PLANS[idx]; if(!p) return;
  PICK.tmp=(type==='ret'?p.ret:p.sku).slice();
  document.getElementById('pkTitle').textContent=(type==='ret'?'选择零售商':'选择活动商品')+'　·　'+p.name;
  document.getElementById('pkSearch').value='';
  renderPick('');
  document.getElementById('pkLayer').classList.add('on');
}
function renderPick(kw){
  var isRet = PICK.type==='ret';
  var db = isRet ? RET_DB : SKU_DB;
  var box = document.getElementById('pkBody');
  var groups={}, order=[];
  db.forEach(function(it){
    var g = isRet ? it.ret : it.g;
    var hay = isRet ? (it.name+' '+it.m+' '+it.r+' '+it.ret) : (it.n+' '+it.d+' '+it.g);
    if(kw && hay.toLowerCase().indexOf(String(kw).toLowerCase())<0) return;
    if(!groups[g]){ groups[g]=[]; order.push(g); }
    groups[g].push(it);
  });
  var h='';
  order.forEach(function(g){
    h+='<div class="pk-g">'+g+'</div>';
    groups[g].forEach(function(it){
      var key = isRet ? it.name : it.n;
      var on = PICK.tmp.indexOf(key)>=0;
      var ck = on?' checked':'';
      var sub = isRet ? ('微信商户号 '+it.m+' · '+it.r) : it.d;
      h+='<div class="pk-i'+(on?' on':'')+'" onclick="pickRow(event,this)"><input type="checkbox"'+ck+' onchange="pickToggle(this,this.getAttribute(\'data-n\'))" data-n="'+key.replace(/"/g,'&quot;')+'"><span>'+key+'</span><span class="d">'+sub+'</span></div>';
    });
  });
  if(!h) h='<div style="padding:26px 0;text-align:center;color:var(--ink4);font-size:12.8px">没有匹配项</div>';
  box.innerHTML=h;
  document.getElementById('pkCnt').textContent=PICK.tmp.length;

  PICK.vis=[];
  order.forEach(function(g){
    groups[g].forEach(function(it){
      PICK.vis.push(isRet ? it.name : it.n);
    });
  });
  pickSyncAll();
}

/* 全选框状态：全选 / 部分 / 未选 */
function pickSyncAll(){
  var all=document.getElementById('pkAll'); if(!all) return;
  var tot=(PICK.vis||[]).length;
  var sel=(PICK.vis||[]).filter(function(k){ return PICK.tmp.indexOf(k)>=0; }).length;
  all.checked = tot>0 && sel===tot;
  all.indeterminate = sel>0 && sel<tot;
  all.disabled = tot===0;
}

/* 全选 / 取消全选：仅作用于当前筛选结果 */
function pickAllToggle(on){
  var list=PICK.vis||[];
  if(on){
    list.forEach(function(k){ if(PICK.tmp.indexOf(k)<0) PICK.tmp.push(k); });
  }else{
    list.forEach(function(k){
      var i=PICK.tmp.indexOf(k);
      if(i>=0) PICK.tmp.splice(i,1);
    });
  }
  renderPick(document.getElementById('pkSearch').value||'');
}
/* 点整行任意位置都能切换勾选（input 触发时已经在 onchange 里处理，这里跳过） */
function pickRow(e,row){
  if(e.target && e.target.tagName==='INPUT') return;
  var cb=row.querySelector('input[type=checkbox]');
  if(!cb) return;
  cb.checked=!cb.checked;
  pickToggle(cb, cb.getAttribute('data-n'));
}
function pickToggle(el,n){
  var k=PICK.tmp.indexOf(n);
  if(el.checked){ if(k<0) PICK.tmp.push(n); } else { if(k>=0) PICK.tmp.splice(k,1); }
  var row=el.closest('.pk-i');
  if(row) row.classList.toggle('on', el.checked);
  document.getElementById('pkCnt').textContent=PICK.tmp.length;
  pickSyncAll();
}
function pickSearch(v){ renderPick(v.trim()); }
function closePick(){ document.getElementById('pkLayer').classList.remove('on'); }
function pickOk(){
  var p=PLANS[PICK.idx]; if(!p) return;
  if(PICK.type==='ret') p.ret=PICK.tmp.slice(); else p.sku=PICK.tmp.slice();
  closePick(); renderPlans();
}

/* 新增计划 */
/* ============ 创建 / 编辑计划：零售商明细 + 商品明细 ============ */
var PN={idx:-1, ret:[], sku:[]};

var PN_SKU_PRESET=[
  {n:'特仑苏 / 精选礼盒', c:'SPU-2318', p:'¥128.00', q:'3,200'},
  {n:'蒙牛纯甄酸奶 200g', c:'SKU-230512', p:'¥4.80', q:'6,000'},
  {n:'未来星儿童奶 190ml', c:'SKU-230708', p:'¥3.60', q:'4,500'},
  {n:'纯甄果粒礼盒装', c:'SPU-2415', p:'¥88.00', q:'2,000'},
  {n:'特仑苏纯牛奶 250ml×12', c:'SKU-230101', p:'¥68.00', q:'5,600'},
  {n:'随变 / 蒂兰圣雪冰品', c:'SPU-2601', p:'¥3.80', q:'2,400'}
];

function openPlanNew(idx){
  PN.idx = (typeof idx==='number') ? idx : -1;
  var editing = PN.idx>=0;
  var p = editing ? PLANS[PN.idx] : null;

  document.getElementById('pnTitle').innerHTML = (editing?'编辑活动计划':'创建活动计划')
    + ' <span class="sub">项目：双节常温奶满减 · MN-WX-202612-0041</span>';

  document.getElementById('pnName').value  = p ? p.name : '';
  document.getElementById('pnMech').value  = p ? p.mech : '';
  document.getElementById('pnStart').value = p ? p.s : '2026-12-20';
  document.getElementById('pnEnd').value   = p ? p.e : '2027-01-05';
  document.getElementById('pnBudget').value = p ? pnFmt(p.budget) : 0;
  document.getElementById('pnQty').value    = p ? pnFmt(p.qty) : 0;
  document.getElementById('pnFace').value   = p ? p.face : 0;
  document.getElementById('pnThr').value    = p ? p.thr : 0;
  document.getElementById('pnLimit').value  = p ? p.limit : '每人限领 2 张';
  document.getElementById('pnValid').value  = p ? p.valid : '随批次有效期';

  /* 零售商明细：编辑时按已存商户名从零售商库还原（商户号/区域/SG零售商一并带出） */
  PN.ret = [];
  if(p && p.ret && p.ret.length){
    p.ret.forEach(function(n){
      var src = RET_DB.filter(function(x){ return x.name===n || x.n===n; })[0];
      if(src){
        PN.ret.push({name:src.name, r:src.r, ret:src.ret, m:src.m, n:src.name});
      } else {
        PN.ret.push({name:n, r:'—', ret:'—', m:'—', n:n});
      }
    });
  }

  /* 商品明细 */
  PN.sku = [];
  if(p && p.sku && p.sku.length){
    p.sku.forEach(function(n){
      var hit = pnMatch(PN_SKU_PRESET, n);
      PN.sku.push({n:n, c:hit?hit.c:'—', p:hit?hit.p:'—', q:hit?hit.q:'—'});
    });
  }

  pnRender();
  openDrawer('dw-plannew');
}

function pnRender(){
  /* 零售商表：微信商户号 / 区域 / 商户名称 / SG零售商 均来自零售商库（只读） */
  var h='';
  if(!PN.ret.length){
    h='<tr><td colspan="6" class="empty-row">尚未导入零售商</td></tr>';
  } else {
    PN.ret.forEach(function(it,i){
      h+='<tr>'
        +'<td class="idx">'+(i+1)+'</td>'
        +'<td><span class="ro mut sx-mono" style="font-size:11.8px;white-space:nowrap">'+pnEsc(it.m||'—')+'</span></td>'
        +'<td><span class="ro mut">'+pnEsc(it.r||'—')+'</span></td>'
        +'<td><span class="ro">'+pnEsc(it.name||it.n||'—')+'</span></td>'
        +'<td><span class="ro mut">'+pnEsc(it.ret||'—')+'</span></td>'
        +'<td><span class="del" onclick="pnDel(\'ret\','+i+')">移除</span></td>'
        +'</tr>';
    });
  }
  document.getElementById('pnRetBody').innerHTML=h;

  /* 商品表：名称/SKU/供货价来自商品库（只读），仅参与量可编辑 */
  var g='';
  if(!PN.sku.length){
    g='<tr><td colspan="6" class="empty-row">尚未导入商品，点下方「从商品库导入」添加</td></tr>';
  } else {
    PN.sku.forEach(function(it,i){
      g+='<tr>'
        +'<td class="idx">'+(i+1)+'</td>'
        +'<td><span class="ro">'+pnEsc(it.n)+'</span></td>'
        +'<td><span class="ro mut sx-mono" style="font-size:11.8px">'+pnEsc(it.c||'—')+'</span></td>'
        +'<td><span class="ro mut">'+pnEsc(it.p||'—')+'</span></td>'
        +'<td><input class="ci num" value="'+pnEsc(it.q||'')+'" placeholder="0" oninput="pnSet(\'sku\','+i+',\'q\',this.value)"></td>'
        +'<td><span class="del" onclick="pnDel(\'sku\','+i+')">移除</span></td>'
        +'</tr>';
    });
  }
  document.getElementById('pnSkuBody').innerHTML=g;

  document.getElementById('pnRetCnt').textContent=PN.ret.length;
  document.getElementById('pnSkuCnt').textContent=PN.sku.length;
  document.getElementById('pnFRet').textContent=PN.ret.length;
  document.getElementById('pnFSku').textContent=PN.sku.length;
}

/* ============ 导入浮层：从零售商库 / 商品库多选导入 ============ */
var IMP = {type:'ret', tmp:[], vis:[]};

function openImp(type){
  IMP.type = type;
  IMP.tmp = [];
  var isRet = type==='ret';
  document.getElementById('impTitle').textContent = isRet ? '从零售商库导入' : '从商品库导入';
  document.getElementById('impKw').value = '';

  var db = isRet ? RET_DB : SKU_DB;
  var gs = [], seen = {};
  db.forEach(function(it){
    var g = isRet ? it.ret : it.g;
    if(!seen[g]){ seen[g]=1; gs.push(g); }
  });
  var sel = document.getElementById('impGrp');
  sel.innerHTML = '<option value="">全部'+(isRet?'零售商':'品类')+'</option>'
                + gs.map(function(g){ return '<option value="'+g+'">'+g+'</option>'; }).join('');

  renderImp('');
  openDrawer('dw-imp');
}

function impExists(key){
  var arr = IMP.type==='ret' ? PN.ret : PN.sku;
  return arr.some(function(x){ return (IMP.type==='ret' ? x.m : x.n)===key; });
}

function renderImp(kw){
  var isRet = IMP.type==='ret';
  var db = isRet ? RET_DB : SKU_DB;
  var g0 = document.getElementById('impGrp').value;
  var k = String(kw||'').trim();

  var groups = {}, order = [];
  db.forEach(function(it){
    var g = isRet ? it.ret : it.g;
    if(g0 && g!==g0) return;
    var hay = isRet ? (it.name+' '+it.m+' '+it.r+' '+it.ret) : (it.n+' '+it.d);
    if(k && hay.toLowerCase().indexOf(k.toLowerCase())<0) return;
    if(!groups[g]){ groups[g]=[]; order.push(g); }
    groups[g].push(it);
  });

  var h='';
  order.forEach(function(g){
    h+='<div class="imp-g">'+g+'</div>';
    groups[g].forEach(function(it){
      var key = isRet ? it.m : it.n;
      var has = impExists(key);
      var on  = IMP.tmp.indexOf(key)>=0;
      var nm  = isRet ? it.name : it.n;
      var ds  = isRet ? ('微信商户号 '+it.m+' · '+it.r) : it.d;
      h+='<div class="imp-i'+(on?' on':'')+(has?' dis':'')+'" onclick="impToggle(event,this,\''+pnEsc(key).replace(/'/g,"\\'")+'\', '+has+')">'
        +'<input type="checkbox" disabled'+(on?' checked':'')+'>'
        +'<div><div class="nm">'+pnEsc(nm)+'</div><div class="ds">'+pnEsc(ds)+'</div></div>'
        +'<span class="tgx">'+(has?'已导入':'')+'</span>'
        +'</div>';
    });
  });
  if(!h) h='<div style="padding:40px 0;text-align:center;color:var(--ink4);font-size:12.6px">没有匹配项</div>';
  document.getElementById('impBody').innerHTML=h;
  document.getElementById('impCnt').textContent = IMP.tmp.length;

  /* 记录当前筛选后可见且可勾选的键，供全选使用 */
  IMP.vis = [];
  order.forEach(function(g){
    groups[g].forEach(function(it){
      var key = isRet ? it.m : it.n;
      if(!impExists(key)) IMP.vis.push(key);
    });
  });
  impSyncAll();
}

/* 全选框状态与单项勾选联动：全选 / 部分 / 未选 */
function impSyncAll(){
  var all=document.getElementById('impAll'); if(!all) return;
  var tot=(IMP.vis||[]).length;
  var sel=(IMP.vis||[]).filter(function(k){ return IMP.tmp.indexOf(k)>=0; }).length;
  all.checked = tot>0 && sel===tot;
  all.indeterminate = sel>0 && sel<tot;
  all.disabled = tot===0;
}

/* 全选 / 取消全选：仅作用于当前筛选结果，已导入项自动跳过 */
function impAllToggle(on){
  var list=IMP.vis||[];
  if(on){
    list.forEach(function(k){ if(IMP.tmp.indexOf(k)<0) IMP.tmp.push(k); });
  }else{
    list.forEach(function(k){
      var i=IMP.tmp.indexOf(k);
      if(i>=0) IMP.tmp.splice(i,1);
    });
  }
  var kw=document.getElementById('impKw').value;
  renderImp(kw);
}

function impToggle(e, row, key, has){
  if(e.target && e.target.tagName==='INPUT') return;
  if(has) return;
  var k = IMP.tmp.indexOf(key);
  if(k>=0){ IMP.tmp.splice(k,1); } else { IMP.tmp.push(key); }
  row.classList.toggle('on', k<0);
  var cb = row.querySelector('input[type=checkbox]');
  if(cb) cb.checked = (k<0);
  document.getElementById('impCnt').textContent = IMP.tmp.length;
  impSyncAll();
}

function impOk(){
  if(!IMP.tmp.length){ alert('请至少选择一项'); return; }
  if(IMP.type==='ret'){
    IMP.tmp.forEach(function(mch){
      var src = RET_DB.filter(function(x){ return x.m===mch; })[0];
      if(!src) return;
      PN.ret.push({name:src.name, r:src.r, ret:src.ret, m:src.m, n:src.name});
    });
  } else {
    IMP.tmp.forEach(function(n){
      var hit = pnMatch(PN_SKU_PRESET, n);
      if(!hit){
        var src = SKU_DB.filter(function(x){ return x.n===n; })[0] || {n:n,d:''};
        var m = (src.d||'').match(/SKU\s*(\d+)/);
        hit = {n:n, c:(m?('SKU-'+m[1].slice(-6)):'—'), p:'—', q:''};
      }
      PN.sku.push({n:n, c:hit.c||'—', p:hit.p||'—', q:(hit.q||'')});
    });
  }
  closeDrawer();
  pnRender();
}

function pnEsc(v){ return String(v==null?'':v).replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

/* 数字千分位：135000 → '135,000'；非数字原样返回 */
function pnFmt(v){
  if(v==null || v==='') return '';
  var raw = String(v).replace(/,/g,'').trim();
  if(!/^-?\d+(\.\d+)?$/.test(raw)) return String(v);
  var neg = raw.charAt(0)==='-';
  if(neg) raw = raw.slice(1);
  var parts = raw.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg?'-':'') + parts.join('.');
}

/* 反解析：'110,000' / '¥52.00' / '9,000 张' → 数字。pnFmt 的逆运算 */
function pnNum(v){
  var t = String(v==null?'':v).replace(/[,\s¥￥]/g,'').replace(/[^0-9.\-]/g,'');
  var n = parseFloat(t);
  return isNaN(n) ? 0 : n;
}

/* 按名称在预设库里找：先全名精确，再按「前缀」宽松匹配（兼容 '未来星儿童奶 190ml×12' 这类带规格后缀的名字） */
function pnMatch(list, name){
  var s = String(name||'').trim();
  var hit = list.filter(function(x){ return x.n===s; })[0];
  if(hit) return hit;
  var best=null, bestLen=0;
  list.forEach(function(x){
    var a=x.n.replace(/[\s\/]/g,''), b=s.replace(/[\s\/]/g,'');
    var core=b.split('×')[0].split('*')[0];
    // 单向前缀 / 双向包含，取最长命中
    if((b.indexOf(a)===0 || core.indexOf(a)===0 || a.indexOf(b)===0) && a.length>bestLen){ best=x; bestLen=a.length; }
  });
  return best;
}

function pnSet(type,i,k,v){
  var arr = type==='ret' ? PN.ret : PN.sku;
  if(!arr[i]) return;
  arr[i][k] = v;
}

function pnDel(type,i){
  var arr = type==='ret' ? PN.ret : PN.sku;
  arr.splice(i,1);
  pnRender();
}

function pnAddSku(){
  PN.sku.push({n:'', c:'', p:'', q:''});
  pnRender();
}

/* 零售商明细不再承担预算，计划预算由独立字段维护（保留函数以兼容原调用点） */
function pnSum(){ return; }

/* 保存：写回 PLANS */
function pnSave(again){
  var name=(document.getElementById('pnName').value||'').trim();
  var mech=(document.getElementById('pnMech').value||'').trim();
  if(!name){ alert('请填写计划名称'); document.getElementById('pnName').focus(); return; }
  if(!mech){ alert('请填写活动机制'); document.getElementById('pnMech').focus(); return; }
  if(!PN.ret.length){ alert('请至少添加一条零售商明细'); return; }
  if(!PN.sku.length){ alert('请至少添加一条活动商品明细'); return; }

  var rets=PN.ret.map(function(x){ return x.n; }).filter(Boolean);
  var skus=PN.sku.map(function(x){ return x.n; }).filter(Boolean);

  var obj={
    name:name, mech:mech,
    s:document.getElementById('pnStart').value,
    e:document.getElementById('pnEnd').value,
    ret:rets, sku:skus,
    budget:pnNum(document.getElementById('pnBudget').value),
    coupon:'满 '+pnNum(document.getElementById('pnThr').value)+' 元减 '+pnNum(document.getElementById('pnFace').value)+' 元',
    face:pnNum(document.getElementById('pnFace').value),
    thr:pnNum(document.getElementById('pnThr').value),
    qty:pnNum(document.getElementById('pnQty').value),
    limit:document.getElementById('pnLimit').value,
    valid:document.getElementById('pnValid').value
  };

  if(PN.idx>=0){
    var p=PLANS[PN.idx];
    for(var k in obj) p[k]=obj[k];
  } else {
    obj.id='PL-'+('0'+(PLANS.length+1)).slice(-2);
    obj.pid='ZS-HD-202612-'+String.fromCharCode(64+PLANS.length+1);
    /* 新计划尚未回传批次：1 个计划最多 1 个批次，批次由服务商上传时产生 */
    obj.bat=''; obj.bstat='待服务商回传';
    obj.btitle=''; obj.bmech=''; obj.bs=''; obj.be='';
    obj.bchannel=''; obj.bqty=0; obj.used=0; obj.usedAmt=0;
    PLANS.push(obj);
  }
  renderPlans();
  closeDrawer();

  if(again){
    /* 保存并继续：清空表单，留在抽屉内 */
    setTimeout(function(){ openPlanNew(-1); }, 180);
  }
}

function addPlan(){
  PLANS.push({id:'PL-'+('0'+(PLANS.length+1)).slice(-2),
    pid:'ZS-HD-202612-'+String.fromCharCode(64+PLANS.length+1),
    name:'新建计划（未命名）',mech:'待填写',
    s:'2026-12-20',e:'2027-01-05',ret:[],sku:[],budget:0,coupon:'待填写',face:0,thr:0,qty:0,
    limit:'待填写',valid:'随批次有效期',
    bat:'',bstat:'待服务商回传',btitle:'',bmech:'',bs:'',be:'',bchannel:'',bqty:0,used:0,usedAmt:0});
  PLAN_PAGE=Math.ceil(PLANS.length/PLAN_SIZE);
  renderPlans();
}


/* ============ 服务商数据（系统管理 → 服务商配置） ============ */
var VENDORS=[
  {code:'SVC-0001', name:'智选数字技术（广州）股份有限公司',
   cms:[{n:'周敏',e:'zhoumin@zhixuan-digital.com'},{n:'赵宇',e:'zhaoyu@zhixuan-digital.com'},
        {n:'刘思远',e:'liusy@zhixuan-digital.com'}],
   remark:'集团级主服务商，承接全国总部统投项目；对账周期 T+3'},
  {code:'SVC-0002', name:'上海智士网络科技有限公司',
   cms:[{n:'胡味芝',e:'huwz@zhishi.com'},{n:'钱磊',e:'qianlei@zhishi.com'}],
   remark:'华东区主要执行方；券码异常需 2 小时内响应'},
  {code:'SVC-0003', name:'武汉智赢数图科技有限公司',
   cms:[{n:'李航',e:'lihang@zhiying-shutu.com'}],
   remark:'华中区执行方；支持门店物料代发'},
  {code:'SVC-0004', name:'广州智曹数字技术有限公司',
   cms:[{n:'陈嘉明',e:'chenjm@zhicao-tech.com'},{n:'林晓彤',e:'linxt@zhicao-tech.com'}],
   remark:'华南区执行方；负责便利店渠道核销对接'},
  {code:'SVC-0005', name:'智选数字技术（广州）股份有限公司北京分公司',
   cms:[{n:'王琳',e:'wanglin@zhixuan-digital.com'},{n:'孙皓',e:'sunhao@zhixuan-digital.com'}],
   remark:'华北区执行方；与总部共用券模板，独立结算'}
];

function renderVendors(){
  var box=document.getElementById('vsTbody'); if(!box) return;
  var h='';
  VENDORS.forEach(function(v,i){
    var cm='';
    (v.cms||[]).forEach(function(c,k){
      cm += (k===0 ? '<b>'+c.n+'</b>' : '<span>'+c.n+'</span>')
          + '<div class="muted" style="font-size:11.2px;line-height:1.4">'+c.e+'</div>';
    });
    h += '<tr'+(i%2?' style="background:#FAFCFB"':'')+'>'
       + '<td><b>'+v.name+'</b><div class="muted sx-mono">'+v.code+'</div></td>'
       + '<td class="vc-cm">'+cm+'</td>'
       + '<td class="vc-rm">'+(v.remark||'—')+'</td>'
       + '<td><span class="tg tg-g">启用</span></td>'
       + '<td style="white-space:nowrap"><button class="btn btn-o btn-xs" onclick="openVs('+i+')">编辑</button> '
       + '<button class="btn btn-g btn-xs">停用</button></td>'
       + '</tr>';
  });
  box.innerHTML=h || '<tr><td colspan="5" class="empty-row">暂无服务商</td></tr>';
  var tg=document.querySelector('#v-admin .panel-h h3 .tg');
  if(tg) tg.textContent = VENDORS.length + ' 家';
}



/* ============ 领券页面：数据弹窗 ============ */
function openPgData(name, pv, get, use){
  var n = function(x){ return parseInt(String(x).replace(/,/g,''),10)||0; };
  var P=n(pv), G=n(get), U=n(use);
  var f = function(x){ return x.toLocaleString('en-US'); };
  document.getElementById('pgDataName').textContent = name;
  document.getElementById('pgdPv').textContent  = f(P);
  document.getElementById('pgdGet').textContent = f(G);
  document.getElementById('pgdUse').textContent = f(U);
  document.getElementById('pgdPv2').textContent  = f(P);
  document.getElementById('pgdGet2').textContent = f(G);
  document.getElementById('pgdUse2').textContent = f(U);
  document.getElementById('pgdR1').textContent = P ? (G/P*100).toFixed(1)+'%' : '—';
  document.getElementById('pgdR2').textContent = G ? (U/G*100).toFixed(1)+'%' : '—';
  openDrawer('dw-pgdata');
}

/* ============ 新建领券页面：批次列表（筛选 + 分页 + 勾选） ============ */
/* ============================================================
   核销订单分析看板（纯 SVG / CSS，无外部图表库）
   数据以 PLANS 的批次核销字段为基线派生
   ============================================================ */

/* 渠道构成（发券渠道） */
var DB_CHAN=[
  {n:'微信（品牌小程序）', share:0.655, rate:0.518},
  {n:'微信（线下扫码）',   share:0.212, rate:0.481},
  {n:'微信（公众号）',     share:0.093, rate:0.442},
  {n:'微信（社群分享）',   share:0.040, rate:0.396}
];

/* 零售商 TOP10（按销售额） */
var DB_RET=[
  {n:'重庆永辉超市有限公司', v:2184000},
  {n:'广东特易购商业有限公司', v:1642000},
  {n:'华润万家生活超市（中山）有限公司', v:1186000},
  {n:'上海福满家便利有限公司', v:962000},
  {n:'苏果超市有限公司南京分公司', v:748000},
  {n:'北京物美商业集团股份有限公司', v:634000},
  {n:'天津物美便利超市有限公司', v:512000},
  {n:'杭州盒马网络科技有限公司', v:428000},
  {n:'广西华润万家生活超市有限公司', v:316000},
  {n:'四川舞东风超市连锁股份有限公司', v:214000}
];

/* 商品 TOP10 */
var DB_SKU=[
  {n:'特仑苏纯牛奶 250ml×12', v:2860000, qty:16400, disc:642000},
  {n:'蒙牛纯甄酸奶 200g×12',  v:1980000, qty:13800, disc:412000},
  {n:'未来星儿童奶 190ml×12', v:1520000, qty:9600,  disc:288000},
  {n:'特仑苏 / 精选礼盒',      v:1180000, qty:4200,  disc:196000},
  {n:'纯甄果粒礼盒装',         v:940000,  qty:3800,  disc:152000},
  {n:'随变 / 蒂兰圣雪冰品',    v:638000,  qty:7200,  disc:86000},
  {n:'蒙牛真果粒 250g×12',     v:482000,  qty:5100,  disc:64000},
  {n:'蒙牛早餐奶 250ml×16',    v:396000,  qty:4600,  disc:52000},
  {n:'冠益乳原味 100g×8',      v:284000,  qty:3800,  disc:38000},
  {n:'优益C 活菌型 340ml',     v:214000,  qty:2600,  disc:29000}
];

/* 周内分布 */
var DB_WEEK=['周一','周二','周三','周四','周五','周六','周日'];
var DB_WEEK_V=[0.108,0.094,0.098,0.112,0.148,0.232,0.208];

/* 时段热度：7 天 × 24 小时，值 0~1 */
var DB_HEAT=(function(){
  var base=[0.02,0.01,0.01,0.01,0.02,0.05,0.12,0.26,0.38,0.46,0.62,0.78,
            0.92,0.84,0.66,0.54,0.58,0.72,0.88,0.95,0.86,0.62,0.34,0.14];
  var wk=[0.86,0.82,0.84,0.88,1.00,1.18,1.10];
  var out=[];
  for(var d=0;d<7;d++){
    var row=[];
    for(var hh=0;hh<24;hh++){
      var v=base[hh]*wk[d];
      /* 周末午间与晚间峰值更高 */
      if(d>=5 && (hh>=11&&hh<=13 || hh>=18&&hh<=20)) v*=1.15;
      row.push(Math.min(1, v));
    }
    out.push(row);
  }
  return out;
})();

function dbFmt(n){
  if(n>=1000000) return (n/1000000).toFixed(2)+'M';
  if(n>=1000) return (n/1000).toFixed(0)+'k';
  return String(n);
}
function dbMoney(n){ return '¥'+Number(Math.round(n)).toLocaleString('en-US'); }

/* ---------- ① 核心指标 ---------- */
function renderDbKpis(){
  var box=document.getElementById('dbKpis'); if(!box) return;
  var ord=0, disc=0;
  var list=PLANS.filter(function(p){ return !!p.bat; });
  list.forEach(function(p){
    ord += (p.used||0);
    /* usedAmt 为券成本（核销单数 × 券面额） */
    disc += (p.usedAmt||0);
  });
  /* 口径：
     优惠金额 = 券成本合计（批次已核销单数 × 券面额）
     销售额  = 优惠金额 × ROI（ROI 取自微信支付订单实付归因）
     笔单价  = 销售额 / 核销订单数 */
  var ROI=10.7;
  var gmv = Math.round(disc*ROI);
  var roi = ROI;
  var avg = ord>0 ? gmv/ord : 0;

  var cards=[
    {l:'核销订单数', q:'核销回调去重后的订单笔数', v:ord.toLocaleString('en-US'), d:[['同比','+33.82%','up'],['环比','+177.62%','up']]},
    {l:'销售额', q:'订单实付金额合计', v:dbMoney(gmv), d:[['同比','-61.61%','dn'],['环比','+2.75%','up']]},
    {l:'优惠金额', q:'券成本合计', v:dbMoney(disc), d:[['同比','-68.59%','dn'],['环比','-7.46%','dn']]},
    {l:'笔单价', q:'销售额 / 订单数', v:dbMoney(ord?gmv/ord:0), d:[['同比','+12.40%','up'],['环比','+3.18%','up']]},
    {l:'ROI', q:'销售额 / 优惠金额', v:roi.toFixed(1), d:[['同比','+21.89%','up'],['环比','+11.46%','up']]}
  ];

  var h='';
  cards.forEach(function(c){
    h+='<div class="kpi">'
      +'<div class="kl">'+c.l+'<i class="q">?</i></div>'
      +'<div class="kv2">'+c.v+'</div>'
      +'<div class="kd">';
    c.d.forEach(function(x){
      h+='<span class="'+x[2]+'">'+x[0]+' '+x[1]+'</span>';
    });
    h+='</div></div>';
  });
  box.innerHTML=h;
}

/* ---------- ② 趋势折线 ---------- */
function renderDbTrend(){
  var box=document.getElementById('dbTrend'); if(!box) return;

  /* 28 天序列（12-20 ~ 01-16），比例按指标体量设定 */
  var N=28, sales=[], disc=[], ord=[];
  var shape=[0.42,0.55,0.68,0.86,1.00,0.92,0.74,0.62,0.58,0.66,0.80,0.95,
             0.88,0.72,0.60,0.54,0.62,0.78,0.90,0.96,0.84,0.70,0.58,0.50,
             0.46,0.52,0.60,0.55];
  for(var i=0;i<N;i++){
    var s=shape[i];
    sales.push(Math.round(128000*s*100)/100);
    disc.push(Math.round(12800*s*100)/100);
    ord.push(Math.round(3200*s*100)/100);
  }

  var W=1000, H=250, PL=44, PR=10, PT=14, PB=26;
  var iw=W-PL-PR, ih=H-PT-PB;
  var maxV=Math.max.apply(null,sales.concat(disc)) || 1;

  function path(arr,scale){
    var pts=[];
    for(var k=0;k<arr.length;k++){
      var x=PL + iw*(k/(arr.length-1));
      var y=PT + ih*(1 - (arr[k]/(maxV*scale)));
      pts.push([x,y]);
    }
    var d='M'+pts[0][0].toFixed(1)+','+pts[0][1].toFixed(1);
    for(var m=1;m<pts.length;m++){
      var p0=pts[m-1], p1=pts[m];
      var cx=(p0[0]+p1[0])/2;
      d+=' C'+cx.toFixed(1)+','+p0[1].toFixed(1)+' '+cx.toFixed(1)+','+p1[1].toFixed(1)+' '+p1[0].toFixed(1)+','+p1[1].toFixed(1);
    }
    return {d:d, pts:pts};
  }

  var s1=path(sales,1.0);
  var s2=path(disc,1.0);
  var s3=path(ord,3.2);

  /* 面积 */
  var area=s1.d+' L'+s1.pts[s1.pts.length-1][0].toFixed(1)+','+(PT+ih)+' L'+s1.pts[0][0].toFixed(1)+','+(PT+ih)+' Z';

  /* Y 轴刻度 */
  var ticks=[], TN=5;
  for(var t=0;t<=TN;t++){
    var yv=maxV*(1-t/TN);
    var yy=PT+ih*(t/TN);
    ticks.push('<line x1="'+PL+'" y1="'+yy.toFixed(1)+'" x2="'+(W-PR)+'" y2="'+yy.toFixed(1)+'" stroke="#EFF3F1" stroke-width="1"/>'
      +'<text x="'+(PL-6)+'" y="'+(yy+3).toFixed(1)+'" font-size="10" fill="#A8B4AF" text-anchor="end">'+dbFmt(Math.round(yv))+'</text>');
  }

  /* X 轴标签（每 5 天一个） */
  var xlab='', dates=[];
  var d0=new Date(2026,11,20);
  for(var q=0;q<N;q++){
    var dd=new Date(d0.getTime()+q*86400000);
    dates.push((dd.getMonth()+1)+'-'+('0'+dd.getDate()).slice(-2));
  }
  for(var r=0;r<N;r+=5){
    var xx=PL+iw*(r/(N-1));
    xlab+='<text x="'+xx.toFixed(1)+'" y="'+(H-8)+'" font-size="10" fill="#A8B4AF" text-anchor="middle">'+dates[r]+'</text>';
  }

  var svg='<svg class="svgline" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="销售额趋势">'
    +'<defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">'
    +'<stop offset="0%" stop-color="#E8622C" stop-opacity="0.22"/>'
    +'<stop offset="100%" stop-color="#E8622C" stop-opacity="0"/>'
    +'</linearGradient></defs>'
    +ticks.join('')
    +'<path d="'+area+'" fill="url(#gArea)"/>'
    +'<path d="'+s2.d+'" fill="none" stroke="#2C6FC4" stroke-width="1.6" stroke-linejoin="round"/>'
    +'<path d="'+s3.d+'" fill="none" stroke="#A8B4AF" stroke-width="1.4" stroke-dasharray="4 3"/>'
    +'<path d="'+s1.d+'" fill="none" stroke="#E8622C" stroke-width="1.9" stroke-linejoin="round"/>'
    +xlab
    +'</svg>';

  box.innerHTML=svg;
}

/* ---------- ③ 发券渠道环形 + 明细 ---------- */
function renderDbChannel(){
  var box=document.getElementById('dbDonut');
  var body=document.getElementById('dbChanBody');

  var total=PLANS.filter(function(p){ return !!p.bat; })
                 .reduce(function(a,p){ return a+(p.bqty||0); },0);
  var gmv=0;
  PLANS.forEach(function(p){ gmv += (p.usedAmt||0); });
  gmv=Math.round(gmv*10.7);

  /* 环形图 */
  if(box){
    var R=62, r=40, C=75;
    var colors=['#E8622C','#2C6FC4','#1F9C6B','#C08300'];
    var acc=0;
    var segs='';
    DB_CHAN.forEach(function(c,i){
      var a0=acc*Math.PI*2-Math.PI/2;
      acc+=c.share;
      var a1=acc*Math.PI*2-Math.PI/2;
      var large=(a1-a0)>Math.PI?1:0;
      var x0=C+R*Math.cos(a0), y0=C+R*Math.sin(a0);
      var x1=C+R*Math.cos(a1), y1=C+R*Math.sin(a1);
      var x2=C+r*Math.cos(a1), y2=C+r*Math.sin(a1);
      var x3=C+r*Math.cos(a0), y3=C+r*Math.sin(a0);
      segs+='<path d="M'+x0.toFixed(2)+','+y0.toFixed(2)
        +' A'+R+','+R+' 0 '+large+' 1 '+x1.toFixed(2)+','+y1.toFixed(2)
        +' L'+x2.toFixed(2)+','+y2.toFixed(2)
        +' A'+r+','+r+' 0 '+large+' 0 '+x3.toFixed(2)+','+y3.toFixed(2)+' Z" fill="'+colors[i]+'"/>';
    });
    var legend='';
    DB_CHAN.forEach(function(c,i){
      legend+='<div style="display:flex;align-items:center;gap:6px;font-size:11.6px;color:var(--ink2)">'
        +'<i style="width:9px;height:9px;border-radius:2px;background:'+colors[i]+';display:inline-block"></i>'
        +'<span>'+c.n.replace('微信（','').replace('）','')+'</span></div>';
    });
    box.innerHTML='<svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="发券渠道构成">'+segs+'</svg>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;margin-top:6px">'+legend+'</div>';
  }

  /* 明细表 */
  if(body){
    var h='';
    DB_CHAN.forEach(function(c){
      var issued=Math.round(total*c.share);
      var used=Math.round(issued*c.rate);
      var amt=Math.round(gmv*c.share);
      h+='<tr>'
        +'<td>'+c.n+'</td>'
        +'<td class="num" style="text-align:right">'+issued.toLocaleString('en-US')+'</td>'
        +'<td class="num" style="text-align:right">'+used.toLocaleString('en-US')+'</td>'
        +'<td class="num" style="text-align:right">'+amt.toLocaleString('en-US')+'</td>'
        +'<td class="num" style="text-align:right">'+(c.rate*100).toFixed(2)+'%</td>'
        +'<td class="num" style="text-align:right">'+(c.share*100).toFixed(2)+'%</td>'
        +'</tr>';
    });
    body.innerHTML=h;
  }
}

/* ---------- ④ 零售商 TOP10 ---------- */
function renderDbRet(){
  var box=document.getElementById('dbRetList');
  var ticks=document.getElementById('dbRetTicks');
  if(!box) return;

  var max=DB_RET.reduce(function(a,b){ return Math.max(a,b.v); },0)||1;
  var h='';
  DB_RET.forEach(function(r){
    var w=(r.v/max*100).toFixed(1);
    /* 最大值条只画到 88%，给数值标签留出空间 */
    var wv=(r.v/max*88).toFixed(1);
    h+='<div class="hbar-row">'
      +'<div class="nm" title="'+r.n+'">'+r.n+'</div>'
      +'<div class="track"><div class="fill" style="width:'+wv+'%"></div>'
      +'<span class="val" style="position:absolute;left:calc('+wv+'% + 8px);top:0;line-height:19px">'
      +r.v.toLocaleString('en-US')+'</span></div>'
      +'</div>';
  });
  box.innerHTML=h;

  if(ticks){
    var tk='';
    for(var i=0;i<=5;i++){
      tk+='<span>'+dbFmt(Math.round(max*i/5))+'</span>';
    }
    ticks.innerHTML=tk;
  }
}

/* ---------- ⑤ 商品 TOP10 ---------- */
function renderDbSku(){
  var body=document.getElementById('dbSkuBody'); if(!body) return;
  var total=DB_SKU.reduce(function(a,b){ return a+b.v; },0)||1;
  var h='';
  DB_SKU.forEach(function(s,i){
    var pct=(s.v/total*100);
    h+='<tr>'
      +'<td class="dim">'+(i+1)+'</td>'
      +'<td>'+s.n+'</td>'
      +'<td class="num" style="text-align:right">'+s.v.toLocaleString('en-US')+'</td>'
      +'<td class="num" style="text-align:right">'+pct.toFixed(2)+'%<span class="sqbar"><i style="width:'+pct.toFixed(0)+'%"></i></span></td>'
      +'<td class="num" style="text-align:right">'+s.qty.toLocaleString('en-US')+'</td>'
      +'<td class="num" style="text-align:right">'+s.disc.toLocaleString('en-US')+'</td>'
      +'</tr>';
  });
  body.innerHTML=h;
}

/* ---------- ⑥ 时段热力 + 周内占比 ---------- */
function renderDbTime(){
  var box=document.getElementById('dbHeat');
  if(box){
    var h='<div class="heat">';
    /* 周一在最下、周日在上（与参考图一致） */
    for(var d=6;d>=0;d--){
      h+='<div class="hl">'+DB_WEEK[(d+1)%7]+'</div>';
      for(var hh=0;hh<24;hh++){
        var v=DB_HEAT[d][hh];
        var a=(0.08+v*0.92).toFixed(2);
        h+='<div class="cell" title="'+DB_WEEK[(d+1)%7]+' '+hh+':00 · 相对热度 '+(v*100).toFixed(0)+'" '
          +'style="background:rgba(232,98,44,'+a+')"></div>';
      }
    }
    h+='</div>';
    /* 时间轴：绝对定位，刻度落在对应小时列的中心 */
    var marks=[0,6,12,18];
    h+='<div class="hx"><div class="hx-in">';
    for(var t2=0;t2<marks.length;t2++){
      var pctT=((marks[t2]+0.5)/24*100).toFixed(2);
      h+='<span style="left:'+pctT+'%">'+marks[t2]+'</span>';
    }
    h+='</div></div>';
    box.innerHTML=h;
  }

  var wl=document.getElementById('dbWeekList');
  if(wl){
    var max=Math.max.apply(null,DB_WEEK_V);
    var h2='';
    DB_WEEK.forEach(function(nm,i){
      var w=(DB_WEEK_V[i]/max*82).toFixed(1);
      h2+='<div class="hbar-row" style="grid-template-columns:48px 1fr">'
        +'<div class="nm" style="text-align:right">'+nm+'</div>'
        +'<div class="track"><div class="fill" style="width:'+w+'%"></div>'
        +'<span class="val" style="position:absolute;left:calc('+w+'% + 8px);top:0;line-height:19px">'
        +(DB_WEEK_V[i]*100).toFixed(1)+'%</span></div>'
        +'</div>';
    });
    wl.innerHTML=h2;
  }
}

function renderDbAll(){
  try{ renderDbKpis(); }catch(e){}
  try{ renderDbTrend(); }catch(e){}
  try{ renderDbChannel(); }catch(e){}
  try{ renderDbRet(); }catch(e){}
  try{ renderDbSku(); }catch(e){}
  try{ renderDbTime(); }catch(e){}
}

/* 批次列表：由 PLANS 派生，保证与计划严格 1:1、全站只有一份批次数据 */
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
      exp:(p.bs?p.bs.slice(5):'')+'-'+(p.be?p.be.slice(5):'')+' \u6709\u6548',
      plan:p.name,
      used:p.used||0,
      usedAmt:p.usedAmt||0
    };
  });
}
var BAT = batList();
var BPAGE = 1, BSIZE = 4;
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
function openFlow(){ openDrawer('dw-flow'); }

/* ============ 项目创建：服务商 → 联系人联动 ============ */
function initProjVendor(){
  var sel=document.getElementById('projVendor'); if(!sel) return;
  var h='<option value="">请选择服务商</option>';
  VENDORS.forEach(function(v,i){ h+='<option value="'+i+'">'+v.name+'</option>'; });
  sel.innerHTML=h;
  projVendorChange('');
  if(VENDORS.length>1){ sel.value='1'; projVendorChange('1'); }
  else if(VENDORS.length){ sel.value='0'; projVendorChange('0'); }
}
function projVendorChange(v){
  var sel=document.getElementById('projContact'); if(!sel) return;
  var h='';
  if(v==='' || v==null){ h='<option value="">请先选择服务商</option>'; sel.innerHTML=h; sel.disabled=true; return; }
  var d=VENDORS[parseInt(v,10)];
  sel.disabled=false;
  h='<option value="">请选择联系人</option>';
  (d && d.cms ? d.cms : []).forEach(function(c){ h+='<option value="'+c.n+'">'+c.n+' · '+c.e+'</option>'; });
  sel.innerHTML=h;
}


function __bootAll(){
  renderVendors();
  initProjVendor();
  renderPlans();
  renderApprovePlans();
  renderProjCards();
  renderDbAll();
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', __bootAll);
}else{
  __bootAll();
}

/* PO 单号 → 带出预算信息 */
var PO_DB={
  'POCN68-0000014722':{budget:'400,000.00',left:'¥400,000.00',subj:'市场推广费-促销费用',org:'BU03 华东事业部',src:'集团统投'},
  'POCN68-0000014735':{budget:'120,000.00',left:'¥120,000.00',subj:'市场推广费-陈列费用',org:'BU01 华北事业部',src:'事业部自投'},
  'POCN68-0000016811':{budget:'260,000.00',left:'¥95,000.00',subj:'市场推广费-促销费用',org:'BU05 华南事业部',src:'集团统投'}
};
function poLookup(){
  var i=document.getElementById('poNo'); if(!i) return;
  var tag=document.getElementById('poTag');
  var b=document.getElementById('poBudget'), sj=document.getElementById('poSubj'),
      og=document.getElementById('poOrg'), sr=document.getElementById('poSrc');
  var key=(i.value||'').trim().toUpperCase();
  var d=PO_DB[key];
  if(d){
    b.value=d.budget; sj.value=d.subj; og.value=d.org; sr.value=d.src;
    document.getElementById('poHint').textContent='由 PO 单带出 · 金额池剩余 '+d.left;
    tag.className='tg tg-g'; tag.textContent='✓ 已校验';
  }else if(key===''){
    b.value=''; sj.value=''; og.value=''; sr.value='';
    document.getElementById('poHint').textContent='由 PO 单带出';
    tag.className='tg tg-n'; tag.textContent='待填写 PO 单号';
  }else{
    b.value=''; sj.value=''; og.value=''; sr.value='';
    document.getElementById('poHint').textContent='由 PO 单带出';
    tag.className='tg tg-r'; tag.textContent='✗ PO 单不存在或未审批';
  }
}

/* ============ 项目管理：卡片数据 + 分页 ============ */
var PROJ_CARDS = [
"  <!-- 01 草稿 -->\n  <div class=\"pcard\">\n    <div class=\"pcard-h\">\n      <div>\n        <h4>春节礼盒预售 <span class=\"tg tg-n nmst\">草稿</span></h4>\n        <div class=\"tags\">\n          <span class=\"tg tg-n\">微信支付</span>\n          <span class=\"tg tg-n\">草稿</span>\n          <span class=\"tg tg-s\" style=\"background:#F1F5F3;color:var(--ink3)\">第 1 次保存</span>\n        </div>\n      </div>\n      <div class=\"rt\">活动 ID：MN-WX-202612-0046（草稿号）<br>最近保存：2026-10-19 16:48</div>\n    </div>\n    <div class=\"kv\">\n      <div class=\"kv-i\"><span class=\"k\">创建业务部门</span><span class=\"v\">BU02 华北事业部</span></div>\n      <div class=\"kv-i\"><span class=\"k\">核销预算</span><span class=\"v\">¥180,000.00</span></div>\n      <div class=\"kv-i\"><span class=\"k\">活动周期</span><span class=\"v\">01-10 ~ 02-10</span></div>\n      <div class=\"kv-i\"><span class=\"k\">服务商</span><span class=\"v\">智选数字技术（广州）股份有限公司北京分公司</span></div>\n      <div class=\"kv-i\"><span class=\"k\">机制附件</span><span class=\"v\" style=\"color:var(--amber)\">已传 3 个，缺「零售商说明」</span></div>\n      <div class=\"kv-i\"><span class=\"k\">提交前预校验</span><span class=\"v\" style=\"color:var(--amber)\">3 项中 2 项通过，1 项待补</span></div>\n    </div>\n    <div class=\"pcard-f\">\n      <button class=\"btn btn-o btn-xs\">继续编辑</button>\n      <button class=\"btn btn-o btn-xs\">预览详情</button>\n      <button class=\"btn btn-d btn-xs\">删除草稿</button>\n      <button class=\"btn btn-p btn-xs\" disabled title=\"预校验未通过：缺「零售商说明」附件\">提交审批</button>\n      <span class=\"noa\">预校验未通过，提交后由数字化中心审批</span>\n    </div>\n  </div>",
"  <!-- 02 待审批 -->\n  <div class=\"pcard\">\n    <div class=\"pcard-h\">\n      <div>\n        <h4>年货节乳品礼盒 <span class=\"tg tg-t nmst\" style=\"background:var(--blue-l);color:var(--blue)\">待审批</span></h4>\n        <div class=\"tags\">\n          <span class=\"tg tg-n\">微信支付</span>\n          <span class=\"tg tg-t\" style=\"background:var(--blue-l);color:var(--blue)\">待审批</span>\n          <span class=\"tg tg-s\" style=\"background:var(--blue-l);color:var(--blue)\">已提交 2 小时</span>\n        </div>\n      </div>\n      <div class=\"rt\">活动 ID：MN-WX-202612-0043<br>提交：2026-10-19 14:20</div>\n    </div>\n    <div class=\"kv\">\n      <div class=\"kv-i\"><span class=\"k\">创建业务部门</span><span class=\"v\">BU01 华北事业部</span></div>\n      <div class=\"kv-i\"><span class=\"k\">核销预算</span><span class=\"v\">¥125,000.00</span></div>\n      <div class=\"kv-i\"><span class=\"k\">活动周期</span><span class=\"v\">12-28 ~ 01-10</span></div>\n      <div class=\"kv-i\"><span class=\"k\">服务商</span><span class=\"v\">智选数字技术（广州）股份有限公司北京分公司</span></div>\n      <div class=\"kv-i\"><span class=\"k\">当前审批人</span><span class=\"v\">数字化中心 · 张明（第 1 级）</span></div>\n      <div class=\"kv-i\"><span class=\"k\">编辑锁</span><span class=\"v\">审批中不可编辑，撤回后方可改</span></div>\n    </div>\n    <div class=\"pcard-f\">\n      <button class=\"btn btn-o btn-xs\">活动详情</button>\n      <button class=\"btn btn-d btn-xs\">撤回</button>\n      <span class=\"noa\">撤回后回到草稿，需重新提交</span>\n    </div>\n  </div>",
"  <!-- 03 待推送服务商 -->\n  <div class=\"pcard\">\n    <div class=\"pcard-h\">\n      <div>\n        <h4>元旦乳品满减 <span class=\"tg tg-t nmst\" style=\"background:var(--blue-l);color:var(--blue)\">待推送服务商</span></h4>\n        <div class=\"tags\">\n          <span class=\"tg tg-n\">微信支付</span>\n          <span class=\"tg tg-t\" style=\"background:var(--blue-l);color:var(--blue)\">待推送服务商</span>\n          <span class=\"tg tg-a\">已通过 4 小时未推送</span>\n        </div>\n      </div>\n      <div class=\"rt\">活动 ID：MN-WX-202612-0044<br>审批完成：2026-10-19 11:30</div>\n    </div>\n    <div class=\"kv\">\n      <div class=\"kv-i\"><span class=\"k\">创建业务部门</span><span class=\"v\">BU01 华北事业部</span></div>\n      <div class=\"kv-i\"><span class=\"k\">核销预算</span><span class=\"v\">¥125,000.00</span></div>\n      <div class=\"kv-i\"><span class=\"k\">活动周期</span><span class=\"v\">12-28 ~ 01-10</span></div>\n      <div class=\"kv-i\"><span class=\"k\">服务商</span><span class=\"v\">智选数字技术（广州）股份有限公司北京分公司</span></div>\n      <div class=\"kv-i\"><span class=\"k\">预算状态</span><span class=\"v\">已冻结 ¥125,000.00</span></div>\n      <div class=\"kv-i\"><span class=\"k\">推送对象</span><span class=\"v\">zhaolin@xingchen-dm.com（业务对接人）</span></div>\n    </div>\n    <div class=\"pcard-f\">\n      <button class=\"btn btn-o btn-xs\">活动详情</button>\n      <button class=\"btn btn-o btn-xs\">修改推送对象</button>\n      <button class=\"btn btn-d btn-xs\">终止活动</button>\n      <button class=\"btn btn-p btn-xs\">推送服务商（发邮件）</button>\n      <span class=\"noa\">推送后状态变为「待服务商确认」</span>\n    </div>\n  </div>",
"  <!-- 04 待服务商确认 -->\n  <div class=\"pcard\">\n    <div class=\"pcard-h\">\n      <div>\n        <h4>双节常温奶满减 <span class=\"tg tg-a nmst\">待服务商确认</span></h4>\n        <div class=\"tags\">\n          <span class=\"tg tg-n\">微信支付</span>\n          <span class=\"tg tg-r\">超 2 天未确认</span>\n        </div>\n      </div>\n      <div class=\"rt\">活动 ID：MN-WX-202612-0041<br>推送：2026-10-17 10:12</div>\n    </div>\n    <div class=\"kv\">\n      <div class=\"kv-i\"><span class=\"k\">创建业务部门</span><span class=\"v\">BU03 华东事业部</span></div>\n      <div class=\"kv-i\"><span class=\"k\">核销预算</span><span class=\"v\">¥400,000.00</span></div>\n      <div class=\"kv-i\"><span class=\"k\">活动周期</span><span class=\"v\">12-20 ~ 01-05</span></div>\n      <div class=\"kv-i\"><span class=\"k\">服务商</span><span class=\"v\">上海智士网络科技</span></div>\n      <div class=\"kv-i\"><span class=\"k\">邮件状态</span><span class=\"v\">已送达 · 已打开 2 次</span></div>\n      <div class=\"kv-i\"><span class=\"k\">等待时长</span><span class=\"v\" style=\"color:var(--red)\">2 天 6 小时（超 2 天阈值）</span></div>\n    </div>\n    <div class=\"pcard-f\">\n      <button class=\"btn btn-o btn-xs\">活动详情</button>\n      <button class=\"btn btn-o btn-xs\">重发邮件</button>\n      <button class=\"btn btn-o btn-xs\">复制确认链接</button>\n      <button class=\"btn btn-d btn-xs\">终止活动</button>\n    </div>\n  </div>",
"  <!-- 05 执行中（三个进度标识） -->\n  <div class=\"pcard\">\n    <div class=\"pcard-h\">\n      <div>\n        <h4>双节常温奶满减 <span class=\"tg tg-g nmst\">执行中</span></h4>\n        <div class=\"tags\">\n          <span class=\"tg tg-n\">微信支付</span>\n          <span class=\"tg tg-g\">进度：待建页面</span>\n          <span class=\"tg tg-s\" style=\"background:var(--brand-l);color:var(--brand-d)\">计划 4 / 批次 4 / 页面 1 启用</span>\n        </div>\n      </div>\n      <div class=\"rt\">活动 ID：MN-WX-202612-0041<br>确认时间：2026-10-19 15:30</div>\n    </div>\n    <div class=\"kv\">\n      <div class=\"kv-i\"><span class=\"k\">创建业务部门</span><span class=\"v\">BU03 华东事业部</span></div>\n      <div class=\"kv-i\"><span class=\"k\">核销预算</span><span class=\"v\">¥400,000.00</span></div>\n      <div class=\"kv-i\"><span class=\"k\">活动周期</span><span class=\"v\">12-20 ~ 01-05</span></div>\n      <div class=\"kv-i\"><span class=\"k\">服务商</span><span class=\"v\">上海智士网络科技</span></div>\n      <div class=\"kv-i\"><span class=\"k\">计划金额合计</span><span class=\"v\">¥340,000.00（占预算 85%）</span></div>\n      <div class=\"kv-i\"><span class=\"k\">批次回传</span><span class=\"v\" style=\"color:var(--brand)\">4 / 4 已回传</span></div>\n      <div class=\"kv-i\"><span class=\"k\">领券页面</span><span class=\"v\">2 个（1 启用 / 1 停用）</span></div>\n      <div class=\"kv-i\"><span class=\"k\">已核销金额</span><span class=\"v\">¥186,420.00 · 核销率 46.6%</span></div>\n    </div>\n    <div class=\"pcard-f\">\n      <button class=\"btn btn-o btn-xs\">活动详情</button>\n      <button class=\"btn btn-o btn-xs\">计划与批次</button>\n      <button class=\"btn btn-o btn-xs\">数据看板</button>\n      <button class=\"btn btn-d btn-xs\" disabled title=\"批次已产生，一期不允许终止\">终止活动</button>\n      <button class=\"btn btn-p btn-xs\">去领券页面</button>\n      <span class=\"noa\">批次一旦产生即不可终止、不可变更</span>\n    </div>\n  </div>",
"  <!-- 05' 执行中 - 待传计划 -->\n  <div class=\"pcard\">\n    <div class=\"pcard-h\">\n      <div>\n        <h4>早餐场景券（12月） <span class=\"tg tg-g nmst\">执行中</span></h4>\n        <div class=\"tags\">\n          <span class=\"tg tg-n\">微信支付</span>\n          <span class=\"tg tg-g\">执行中</span>\n          <span class=\"tg tg-a\">进度：待传计划</span>\n        </div>\n      </div>\n      <div class=\"rt\">活动 ID：MN-WX-202612-0039<br>确认时间：2026-10-18 16:10</div>\n    </div>\n    <div class=\"kv\">\n      <div class=\"kv-i\"><span class=\"k\">创建业务部门</span><span class=\"v\">BU05 华南事业部</span></div>\n      <div class=\"kv-i\"><span class=\"k\">核销预算</span><span class=\"v\">¥210,000.00</span></div>\n      <div class=\"kv-i\"><span class=\"k\">服务商</span><span class=\"v\">广州智曹数字技术有限公司</span></div>\n      <div class=\"kv-i\"><span class=\"k\">计划数 / 批次数</span><span class=\"v\">0 / 0</span></div>\n      <div class=\"kv-i\"><span class=\"k\">等待时长</span><span class=\"v\" style=\"color:var(--amber)\">已等 1 天 2 小时</span></div>\n    </div>\n    <div class=\"pcard-f\">\n      <button class=\"btn btn-o btn-xs\">活动详情</button>\n      <button class=\"btn btn-o btn-xs\">下载计划模板</button>\n      <button class=\"btn btn-d btn-xs\">终止活动</button>\n    </div>\n  </div>",
"  <!-- 06 已终止 -->\n  <div class=\"pcard\">\n    <div class=\"pcard-h\">\n      <div>\n        <h4>夏季冰品联合促销 <span class=\"tg tg-r nmst\">已终止</span></h4>\n        <div class=\"tags\">\n          <span class=\"tg tg-n\">微信支付</span>\n          <span class=\"tg tg-r\">已终止</span>\n          <span class=\"tg tg-s\" style=\"background:var(--red-l);color:var(--red)\">预算已释放</span>\n        </div>\n      </div>\n      <div class=\"rt\">活动 ID：MN-WX-202611-0028<br>终止：2026-10-16 09:40</div>\n    </div>\n    <div class=\"kv\">\n      <div class=\"kv-i\"><span class=\"k\">创建业务部门</span><span class=\"v\">BU04 西南事业部</span></div>\n      <div class=\"kv-i\"><span class=\"k\">核销预算</span><span class=\"v\">¥96,000.00</span></div>\n      <div class=\"kv-i\"><span class=\"k\">活动周期</span><span class=\"v\">10-01 ~ 10-31（提前终止）</span></div>\n      <div class=\"kv-i\"><span class=\"k\">服务商</span><span class=\"v\">武汉智赢数图科技有限公司</span></div>\n      <div class=\"kv-i\"><span class=\"k\">终止原因</span><span class=\"v\">业务调整，KPI 口径变更</span></div>\n      <div class=\"kv-i\"><span class=\"k\">终止时点</span><span class=\"v\">批次未产生（0 个计划 / 0 个批次）</span></div>\n      <div class=\"kv-i\"><span class=\"k\">后续影响</span><span class=\"v\">服务商链接已失效；预算额度 ¥96,000 已释放回部门池</span></div>\n      <div class=\"kv-i\"><span class=\"k\">已发券</span><span class=\"v\">无（终止前未发券）</span></div>\n    </div>\n    <div class=\"pcard-f\">\n      <button class=\"btn btn-o btn-xs\">活动详情（只读）</button>\n      <button class=\"btn btn-o btn-xs\">终止记录</button>\n      <button class=\"btn btn-o btn-xs\">复制为新项目</button>\n      <button class=\"btn btn-o btn-xs\" disabled title=\"终态不可编辑\">编辑</button>\n      <span class=\"noa\">已终止为终态，仅可复制重建</span>\n    </div>\n  </div>"
];
var PROJ_PAGE = 1, PROJ_SIZE = 4, PROJ_TOTAL = PROJ_CARDS.length;

function renderProjCards(){
  var box = document.getElementById('projList'); if(!box) return;
  var pages = Math.max(1, Math.ceil(PROJ_TOTAL / PROJ_SIZE));
  if(PROJ_PAGE > pages) PROJ_PAGE = pages;
  var st = (PROJ_PAGE-1)*PROJ_SIZE, en = Math.min(st+PROJ_SIZE, PROJ_TOTAL);
  var h = '';
  for(var i=st;i<en;i++) h += PROJ_CARDS[i] + '\n';
  box.innerHTML = h;

  var t = document.getElementById('projTotal'); if(t) t.textContent = PROJ_TOTAL;
  var pg = '';
  pg += '<span class="'+(PROJ_PAGE<=1?'dis':'')+'" onclick="gotoProj('+(PROJ_PAGE-1)+')">上一页</span>';
  for(var k=1;k<=pages;k++) pg += '<span class="'+(k===PROJ_PAGE?'on':'')+'" onclick="gotoProj('+k+')">'+k+'</span>';
  pg += '<span class="'+(PROJ_PAGE>=pages?'dis':'')+'" onclick="gotoProj('+(PROJ_PAGE+1)+')">下一页</span>';
  var pb = document.getElementById('projPager'); if(pb) pb.innerHTML = pg;
}

function gotoProj(n){
  var pages = Math.max(1, Math.ceil(PROJ_TOTAL / PROJ_SIZE));
  if(n<1 || n>pages) return;
  PROJ_PAGE = n; renderProjCards();
  window.scrollTo({top:0, behavior:'smooth'});
}

function go(id,el){
  var vs=document.querySelectorAll('.view');
  for(var i=0;i<vs.length;i++) vs[i].classList.remove('on');
  var t=document.getElementById(id); if(t) t.classList.add('on');
  var as=document.querySelectorAll('.topbar nav a');
  for(var j=0;j<as.length;j++) as[j].classList.remove('on');
  if(el&&el.parentNode&&el.parentNode.tagName==='NAV') el.classList.add('on');
  var c=el?el.getAttribute('data-crumb'):null;
  if(c){ var cb=document.getElementById('crumb'); if(cb) cb.innerHTML=c; }

  /* 切换视图后页面高度会变化，平滑滚动会在重排中被中断而停在中途/底部，
     故改为即时回顶，并在下一帧再校正一次，确保新视图从头开始展示 */
  if(id==='v-board' && typeof renderDbAll==='function'){ try{ renderDbAll(); }catch(e){} }

  window.scrollTo(0,0);
  requestAnimationFrame(function(){
    window.scrollTo(0,0);
    if(document.documentElement) document.documentElement.scrollTop=0;
    if(document.body) document.body.scrollTop=0;
  });
}
function pick(el){
  var ps=el.parentNode.querySelectorAll('.s');
  for(var i=0;i<ps.length;i++) ps[i].classList.remove('on');
  el.classList.add('on');
}

/* ============ 服务商配置：新增 / 编辑（联系人多条 + 备注） ============ */
var VS = {idx:-1, cm:[]};

function openVs(idx){
  VS.idx = (typeof idx==='number') ? idx : -1;
  var editing = VS.idx>=0;
  var d = VENDORS[VS.idx] || null;

  document.querySelector('#dw-vs .dw-h h3').innerHTML = (editing?'编辑服务商':'新增服务商')
    + ' <span class="sub">保存后可在项目创建时被选择</span>';
  document.getElementById('vsName').value = d ? d.name : '';
  document.getElementById('vsRemark').value = d ? (d.remark||'') : '';

  VS.cm = [];
  if(d && d.cms && d.cms.length){
    d.cms.forEach(function(c){ VS.cm.push({n:c.n, e:c.e}); });
  } else {
    VS.cm.push({n:'', e:''});
  }
  vsRender();
  document.querySelector('#dw-vs .dw-f .lft').innerHTML =
    '当前 <b>'+VENDORS.length+'</b> 家' + (editing ? '' : ' · 新增后为第 '+(VENDORS.length+1)+' 家');
  openDrawer('dw-vs');
}

function vsRender(){
  var h='';
  VS.cm.forEach(function(c,i){
    h+='<tr>'
      +'<td class="idx">'+(i+1)+'</td>'
      +'<td><input class="ci" value="'+vsEsc(c.n)+'" placeholder="姓名" oninput="vsSet('+i+',\'n\',this.value)"></td>'
      +'<td><input class="ci" value="'+vsEsc(c.e)+'" placeholder="name@company.com" oninput="vsSet('+i+',\'e\',this.value)"></td>'
      +'<td><span class="del" onclick="vsDelCm('+i+')">删除</span></td>'
      +'</tr>';
  });
  if(!VS.cm.length) h='<tr><td colspan="4" class="empty-row">暂无联系人，点下方「添加联系人」新增</td></tr>';
  document.getElementById('vsCmBody').innerHTML=h;
}
function vsEsc(v){ return String(v==null?'':v).replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function vsSet(i,k,v){ if(VS.cm[i]) VS.cm[i][k]=v; }
function vsDelCm(i){ VS.cm.splice(i,1); vsRender(); }
function vsAddCm(){ VS.cm.push({n:'',e:''}); vsRender(); }

function vsSave(){
  var name=(document.getElementById('vsName').value||'').trim();
  if(!name){ alert('请填写服务商名称'); document.getElementById('vsName').focus(); return; }
  var cms = VS.cm.filter(function(c){ return (c.n||'').trim() || (c.e||'').trim(); });
  if(!cms.length){ alert('请至少填写一位联系人与邮箱'); return; }
  var bad = cms.filter(function(c){ return !(c.n||'').trim() || !(c.e||'').trim(); });
  if(bad.length){ alert('联系人与邮箱需成对填写'); return; }

  var obj = {name:name, cms:cms.map(function(c){ return {n:c.n.trim(), e:c.e.trim()}; }),
             remark:(document.getElementById('vsRemark').value||'').trim()};
  if(VS.idx>=0){
    var v=VENDORS[VS.idx];
    for(var k in obj) v[k]=obj[k];
  } else {
    obj.code = 'SVC-'+('000'+(VENDORS.length+1)).slice(-4);
    VENDORS.push(obj);
  }
  closeDrawer();
  renderVendors();
}


/* =============================================================================
 * pages/dashboard.js — 数据看板
 * 标黄项 17：指标口径沿用呼市 / 河南已对齐版本，模块与拆分维度直接平移。
 * ========================================================================== */

/* ---------- 逻辑 ---------- */
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

/* ---------- 模板：v-board ---------- */
function tplPageboard(){
  return `<div class="view" id="v-board">
  <div class="note b" style="margin-top:0">
    <b>指标口径：</b>沿用呼市 / 河南已对齐版本，模块与拆分维度直接平移，不另起炉灶（待确认清单标黄项 17）。
    数据源为微信支付 T+1 回传的发券 / 核销 / 订单明细，按活动 → 计划 → 批次 → 二维码四级维度下钻。
  </div>
  
  <div class="sums">
    
    
    
    
  </div>

  

  
  
  

  <div class="st" style="margin-top:28px">核销订单分析 <span class="sub">数据源：微信支付核销回调 + T+1 订单拉取</span></div>

  <!-- 筛选 -->
  <div class="panel" style="margin-bottom:14px">
    <div class="panel-b" style="padding:12px 16px">
      <div class="flex" style="gap:10px;flex-wrap:wrap;align-items:center">
        <span class="muted">核销时间</span>
        <input class="inp" value="2026-12-20" style="max-width:128px"><span class="muted">至</span>
        <input class="inp" value="2027-01-05" style="max-width:128px">
        <span class="muted" style="margin-left:8px">活动</span>
        <input class="inp" placeholder="全部活动" style="max-width:150px">
        <span class="muted">创建业务部门</span>
        <input class="inp" placeholder="全部部门" style="max-width:150px">
        <button class="btn btn-p btn-xs">查询</button>
        <button class="btn btn-g btn-xs">重置</button>
      </div>
    </div>
  </div>

  <div class="db-wrap">

    <!-- ① 核心指标 -->
    <div class="st" style="margin:0">核心指标</div>
    <div class="kpis" id="dbKpis"><div class="kpi"><div class="kl">核销订单数<i class="q">?</i></div><div class="kv2">12,428</div><div class="kd"><span class="up">同比 +33.82%</span><span class="up">环比 +177.62%</span></div></div><div class="kpi"><div class="kl">销售额<i class="q">?</i></div><div class="kv2">¥2,128,337</div><div class="kd"><span class="dn">同比 -61.61%</span><span class="up">环比 +2.75%</span></div></div><div class="kpi"><div class="kl">优惠金额<i class="q">?</i></div><div class="kv2">¥198,910</div><div class="kd"><span class="dn">同比 -68.59%</span><span class="dn">环比 -7.46%</span></div></div><div class="kpi"><div class="kl">笔单价<i class="q">?</i></div><div class="kv2">¥171</div><div class="kd"><span class="up">同比 +12.40%</span><span class="up">环比 +3.18%</span></div></div><div class="kpi"><div class="kl">ROI<i class="q">?</i></div><div class="kv2">10.7</div><div class="kd"><span class="up">同比 +21.89%</span><span class="up">环比 +11.46%</span></div></div></div>

    <!-- ② 趋势 -->
    <div class="chart-box">
      <div class="chart-hd">
        <div class="legend">
          <span><i style="background:#E8622C"></i>销售额（元）</span>
          <span><i style="background:#2C6FC4"></i>优惠金额（元）</span>
          <span><i style="background:#A8B4AF"></i>订单数（笔）</span>
        </div>
        <div class="dim" style="font-size:11.8px">按自然日汇总</div>
      </div>
      <div id="dbTrend"><svg class="svgline" viewBox="0 0 1000 250" preserveAspectRatio="none" role="img" aria-label="销售额趋势"><defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8622C" stop-opacity="0.22"></stop><stop offset="100%" stop-color="#E8622C" stop-opacity="0"></stop></linearGradient></defs><line x1="44" y1="14.0" x2="990" y2="14.0" stroke="#EFF3F1" stroke-width="1"></line><text x="38" y="17.0" font-size="10" fill="#A8B4AF" text-anchor="end">128k</text><line x1="44" y1="56.0" x2="990" y2="56.0" stroke="#EFF3F1" stroke-width="1"></line><text x="38" y="59.0" font-size="10" fill="#A8B4AF" text-anchor="end">102k</text><line x1="44" y1="98.0" x2="990" y2="98.0" stroke="#EFF3F1" stroke-width="1"></line><text x="38" y="101.0" font-size="10" fill="#A8B4AF" text-anchor="end">77k</text><line x1="44" y1="140.0" x2="990" y2="140.0" stroke="#EFF3F1" stroke-width="1"></line><text x="38" y="143.0" font-size="10" fill="#A8B4AF" text-anchor="end">51k</text><line x1="44" y1="182.0" x2="990" y2="182.0" stroke="#EFF3F1" stroke-width="1"></line><text x="38" y="185.0" font-size="10" fill="#A8B4AF" text-anchor="end">26k</text><line x1="44" y1="224.0" x2="990" y2="224.0" stroke="#EFF3F1" stroke-width="1"></line><text x="38" y="227.0" font-size="10" fill="#A8B4AF" text-anchor="end">0</text><path d="M44.0,135.8 C61.5,135.8 61.5,108.5 79.0,108.5 C96.6,108.5 96.6,81.2 114.1,81.2 C131.6,81.2 131.6,43.4 149.1,43.4 C166.6,43.4 166.6,14.0 184.1,14.0 C201.7,14.0 201.7,30.8 219.2,30.8 C236.7,30.8 236.7,68.6 254.2,68.6 C271.7,68.6 271.7,93.8 289.3,93.8 C306.8,93.8 306.8,102.2 324.3,102.2 C341.8,102.2 341.8,85.4 359.3,85.4 C376.9,85.4 376.9,56.0 394.4,56.0 C411.9,56.0 411.9,24.5 429.4,24.5 C446.9,24.5 446.9,39.2 464.4,39.2 C482.0,39.2 482.0,72.8 499.5,72.8 C517.0,72.8 517.0,98.0 534.5,98.0 C552.0,98.0 552.0,110.6 569.6,110.6 C587.1,110.6 587.1,93.8 604.6,93.8 C622.1,93.8 622.1,60.2 639.6,60.2 C657.1,60.2 657.1,35.0 674.7,35.0 C692.2,35.0 692.2,22.4 709.7,22.4 C727.2,22.4 727.2,47.6 744.7,47.6 C762.3,47.6 762.3,77.0 779.8,77.0 C797.3,77.0 797.3,102.2 814.8,102.2 C832.3,102.2 832.3,119.0 849.9,119.0 C867.4,119.0 867.4,127.4 884.9,127.4 C902.4,127.4 902.4,114.8 919.9,114.8 C937.4,114.8 937.4,98.0 955.0,98.0 C972.5,98.0 972.5,108.5 990.0,108.5 L990.0,224 L44.0,224 Z" fill="url(#gArea)"></path><path d="M44.0,215.2 C61.5,215.2 61.5,212.4 79.0,212.4 C96.6,212.4 96.6,209.7 114.1,209.7 C131.6,209.7 131.6,205.9 149.1,205.9 C166.6,205.9 166.6,203.0 184.1,203.0 C201.7,203.0 201.7,204.7 219.2,204.7 C236.7,204.7 236.7,208.5 254.2,208.5 C271.7,208.5 271.7,211.0 289.3,211.0 C306.8,211.0 306.8,211.8 324.3,211.8 C341.8,211.8 341.8,210.1 359.3,210.1 C376.9,210.1 376.9,207.2 394.4,207.2 C411.9,207.2 411.9,204.1 429.4,204.1 C446.9,204.1 446.9,205.5 464.4,205.5 C482.0,205.5 482.0,208.9 499.5,208.9 C517.0,208.9 517.0,211.4 534.5,211.4 C552.0,211.4 552.0,212.7 569.6,212.7 C587.1,212.7 587.1,211.0 604.6,211.0 C622.1,211.0 622.1,207.6 639.6,207.6 C657.1,207.6 657.1,205.1 674.7,205.1 C692.2,205.1 692.2,203.8 709.7,203.8 C727.2,203.8 727.2,206.4 744.7,206.4 C762.3,206.4 762.3,209.3 779.8,209.3 C797.3,209.3 797.3,211.8 814.8,211.8 C832.3,211.8 832.3,213.5 849.9,213.5 C867.4,213.5 867.4,214.3 884.9,214.3 C902.4,214.3 902.4,213.1 919.9,213.1 C937.4,213.1 937.4,211.4 955.0,211.4 C972.5,211.4 972.5,212.4 990.0,212.4" fill="none" stroke="#2C6FC4" stroke-width="1.6" stroke-linejoin="round"></path><path d="M44.0,223.3 C61.5,223.3 61.5,223.1 79.0,223.1 C96.6,223.1 96.6,222.9 114.1,222.9 C131.6,222.9 131.6,222.6 149.1,222.6 C166.6,222.6 166.6,222.4 184.1,222.4 C201.7,222.4 201.7,222.5 219.2,222.5 C236.7,222.5 236.7,222.8 254.2,222.8 C271.7,222.8 271.7,223.0 289.3,223.0 C306.8,223.0 306.8,223.0 324.3,223.0 C341.8,223.0 341.8,222.9 359.3,222.9 C376.9,222.9 376.9,222.7 394.4,222.7 C411.9,222.7 411.9,222.4 429.4,222.4 C446.9,222.4 446.9,222.6 464.4,222.6 C482.0,222.6 482.0,222.8 499.5,222.8 C517.0,222.8 517.0,223.0 534.5,223.0 C552.0,223.0 552.0,223.1 569.6,223.1 C587.1,223.1 587.1,223.0 604.6,223.0 C622.1,223.0 622.1,222.7 639.6,222.7 C657.1,222.7 657.1,222.5 674.7,222.5 C692.2,222.5 692.2,222.4 709.7,222.4 C727.2,222.4 727.2,222.6 744.7,222.6 C762.3,222.6 762.3,222.9 779.8,222.9 C797.3,222.9 797.3,223.0 814.8,223.0 C832.3,223.0 832.3,223.2 849.9,223.2 C867.4,223.2 867.4,223.2 884.9,223.2 C902.4,223.2 902.4,223.1 919.9,223.1 C937.4,223.1 937.4,223.0 955.0,223.0 C972.5,223.0 972.5,223.1 990.0,223.1" fill="none" stroke="#A8B4AF" stroke-width="1.4" stroke-dasharray="4 3"></path><path d="M44.0,135.8 C61.5,135.8 61.5,108.5 79.0,108.5 C96.6,108.5 96.6,81.2 114.1,81.2 C131.6,81.2 131.6,43.4 149.1,43.4 C166.6,43.4 166.6,14.0 184.1,14.0 C201.7,14.0 201.7,30.8 219.2,30.8 C236.7,30.8 236.7,68.6 254.2,68.6 C271.7,68.6 271.7,93.8 289.3,93.8 C306.8,93.8 306.8,102.2 324.3,102.2 C341.8,102.2 341.8,85.4 359.3,85.4 C376.9,85.4 376.9,56.0 394.4,56.0 C411.9,56.0 411.9,24.5 429.4,24.5 C446.9,24.5 446.9,39.2 464.4,39.2 C482.0,39.2 482.0,72.8 499.5,72.8 C517.0,72.8 517.0,98.0 534.5,98.0 C552.0,98.0 552.0,110.6 569.6,110.6 C587.1,110.6 587.1,93.8 604.6,93.8 C622.1,93.8 622.1,60.2 639.6,60.2 C657.1,60.2 657.1,35.0 674.7,35.0 C692.2,35.0 692.2,22.4 709.7,22.4 C727.2,22.4 727.2,47.6 744.7,47.6 C762.3,47.6 762.3,77.0 779.8,77.0 C797.3,77.0 797.3,102.2 814.8,102.2 C832.3,102.2 832.3,119.0 849.9,119.0 C867.4,119.0 867.4,127.4 884.9,127.4 C902.4,127.4 902.4,114.8 919.9,114.8 C937.4,114.8 937.4,98.0 955.0,98.0 C972.5,98.0 972.5,108.5 990.0,108.5" fill="none" stroke="#E8622C" stroke-width="1.9" stroke-linejoin="round"></path><text x="44.0" y="242" font-size="10" fill="#A8B4AF" text-anchor="middle">12-20</text><text x="219.2" y="242" font-size="10" fill="#A8B4AF" text-anchor="middle">12-25</text><text x="394.4" y="242" font-size="10" fill="#A8B4AF" text-anchor="middle">12-30</text><text x="569.6" y="242" font-size="10" fill="#A8B4AF" text-anchor="middle">1-04</text><text x="744.7" y="242" font-size="10" fill="#A8B4AF" text-anchor="middle">1-09</text><text x="919.9" y="242" font-size="10" fill="#A8B4AF" text-anchor="middle">1-14</text></svg></div>
    </div>

    <!-- ③ 发券渠道 -->
    <div class="st" style="margin:4px 0 0">发券渠道</div>
    <div class="duo">
      <div class="donut-box">
        <div id="dbDonut"><svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="发券渠道构成"><path d="M75.00,13.00 A62,62 0 1 1 23.72,109.85 L41.92,97.48 A40,40 0 1 0 75.00,35.00 Z" fill="#E8622C"></path><path d="M23.72,109.85 A62,62 0 0 1 29.01,33.42 L45.33,48.17 A40,40 0 0 0 41.92,97.48 Z" fill="#2C6FC4"></path><path d="M29.01,33.42 A62,62 0 0 1 59.58,14.95 L65.05,36.26 A40,40 0 0 0 45.33,48.17 Z" fill="#1F9C6B"></path><path d="M59.58,14.95 A62,62 0 0 1 75.00,13.00 L75.00,35.00 A40,40 0 0 0 65.05,36.26 Z" fill="#C08300"></path></svg><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;margin-top:6px"><div style="display:flex;align-items:center;gap:6px;font-size:11.6px;color:var(--ink2)"><i style="width:9px;height:9px;border-radius:2px;background:#E8622C;display:inline-block"></i><span>品牌小程序</span></div><div style="display:flex;align-items:center;gap:6px;font-size:11.6px;color:var(--ink2)"><i style="width:9px;height:9px;border-radius:2px;background:#2C6FC4;display:inline-block"></i><span>线下扫码</span></div><div style="display:flex;align-items:center;gap:6px;font-size:11.6px;color:var(--ink2)"><i style="width:9px;height:9px;border-radius:2px;background:#1F9C6B;display:inline-block"></i><span>公众号</span></div><div style="display:flex;align-items:center;gap:6px;font-size:11.6px;color:var(--ink2)"><i style="width:9px;height:9px;border-radius:2px;background:#C08300;display:inline-block"></i><span>社群分享</span></div></div></div>
        <div class="cap">发券渠道构成</div>
      </div>
      <div class="tw scroll" style="box-shadow:none">
        <table class="bt db-table" style="min-width:640px">
          <thead><tr>
            <th style="width:150px">发券渠道</th>
            <th class="num">发券数</th>
            <th class="num">核销数</th>
            <th class="num">销售额（元）</th>
            <th class="num">核销率</th>
            <th class="num">销售额占比</th>
          </tr></thead>
          <tbody id="dbChanBody"><tr><td>微信（品牌小程序）</td><td class="num" style="text-align:right">13,755</td><td class="num" style="text-align:right">7,125</td><td class="num" style="text-align:right">1,394,061</td><td class="num" style="text-align:right">51.80%</td><td class="num" style="text-align:right">65.50%</td></tr><tr><td>微信（线下扫码）</td><td class="num" style="text-align:right">4,452</td><td class="num" style="text-align:right">2,141</td><td class="num" style="text-align:right">451,207</td><td class="num" style="text-align:right">48.10%</td><td class="num" style="text-align:right">21.20%</td></tr><tr><td>微信（公众号）</td><td class="num" style="text-align:right">1,953</td><td class="num" style="text-align:right">863</td><td class="num" style="text-align:right">197,935</td><td class="num" style="text-align:right">44.20%</td><td class="num" style="text-align:right">9.30%</td></tr><tr><td>微信（社群分享）</td><td class="num" style="text-align:right">840</td><td class="num" style="text-align:right">333</td><td class="num" style="text-align:right">85,133</td><td class="num" style="text-align:right">39.60%</td><td class="num" style="text-align:right">4.00%</td></tr></tbody>
        </table>
      </div>
    </div>

    <!-- ④ 零售商 TOP10 -->
    <div class="st" style="margin:4px 0 0">零售商 TOP10</div>
    <div class="chart-box">
      <div class="legend" style="margin-bottom:10px"><span><i style="background:#E8622C"></i>销售额（元）</span></div>
      <div class="hbar-list" id="dbRetList"><div class="hbar-row"><div class="nm" title="重庆永辉超市有限公司">重庆永辉超市有限公司</div><div class="track"><div class="fill" style="width:88.0%"></div><span class="val" style="position:absolute;left:calc(88.0% + 8px);top:0;line-height:19px">2,184,000</span></div></div><div class="hbar-row"><div class="nm" title="广东特易购商业有限公司">广东特易购商业有限公司</div><div class="track"><div class="fill" style="width:66.2%"></div><span class="val" style="position:absolute;left:calc(66.2% + 8px);top:0;line-height:19px">1,642,000</span></div></div><div class="hbar-row"><div class="nm" title="华润万家生活超市（中山）有限公司">华润万家生活超市（中山）有限公司</div><div class="track"><div class="fill" style="width:47.8%"></div><span class="val" style="position:absolute;left:calc(47.8% + 8px);top:0;line-height:19px">1,186,000</span></div></div><div class="hbar-row"><div class="nm" title="上海福满家便利有限公司">上海福满家便利有限公司</div><div class="track"><div class="fill" style="width:38.8%"></div><span class="val" style="position:absolute;left:calc(38.8% + 8px);top:0;line-height:19px">962,000</span></div></div><div class="hbar-row"><div class="nm" title="苏果超市有限公司南京分公司">苏果超市有限公司南京分公司</div><div class="track"><div class="fill" style="width:30.1%"></div><span class="val" style="position:absolute;left:calc(30.1% + 8px);top:0;line-height:19px">748,000</span></div></div><div class="hbar-row"><div class="nm" title="北京物美商业集团股份有限公司">北京物美商业集团股份有限公司</div><div class="track"><div class="fill" style="width:25.5%"></div><span class="val" style="position:absolute;left:calc(25.5% + 8px);top:0;line-height:19px">634,000</span></div></div><div class="hbar-row"><div class="nm" title="天津物美便利超市有限公司">天津物美便利超市有限公司</div><div class="track"><div class="fill" style="width:20.6%"></div><span class="val" style="position:absolute;left:calc(20.6% + 8px);top:0;line-height:19px">512,000</span></div></div><div class="hbar-row"><div class="nm" title="杭州盒马网络科技有限公司">杭州盒马网络科技有限公司</div><div class="track"><div class="fill" style="width:17.2%"></div><span class="val" style="position:absolute;left:calc(17.2% + 8px);top:0;line-height:19px">428,000</span></div></div><div class="hbar-row"><div class="nm" title="广西华润万家生活超市有限公司">广西华润万家生活超市有限公司</div><div class="track"><div class="fill" style="width:12.7%"></div><span class="val" style="position:absolute;left:calc(12.7% + 8px);top:0;line-height:19px">316,000</span></div></div><div class="hbar-row"><div class="nm" title="四川舞东风超市连锁股份有限公司">四川舞东风超市连锁股份有限公司</div><div class="track"><div class="fill" style="width:8.6%"></div><span class="val" style="position:absolute;left:calc(8.6% + 8px);top:0;line-height:19px">214,000</span></div></div></div>
      <div class="hbar-axis"><div></div><div class="ticks" id="dbRetTicks"><span>0</span><span>437k</span><span>874k</span><span>1.31M</span><span>1.75M</span><span>2.18M</span></div></div>
    </div>

    <!-- ⑤ 商品 TOP10 -->
    <div class="st" style="margin:4px 0 0">商品 TOP10</div>
    <div class="tw">
      <table class="bt db-table">
        <thead><tr>
          <th style="width:60px">排名</th>
          <th>商品名称</th>
          <th class="num" style="width:130px">销售额（元）</th>
          <th class="num" style="width:130px">销售额占比（%）</th>
          <th class="num" style="width:120px">销售件数（件）</th>
          <th class="num" style="width:120px">优惠金额（元）</th>
        </tr></thead>
        <tbody id="dbSkuBody"><tr><td class="dim">1</td><td>特仑苏纯牛奶 250ml×12</td><td class="num" style="text-align:right">2,860,000</td><td class="num" style="text-align:right">27.25%<span class="sqbar"><i style="width:27%"></i></span></td><td class="num" style="text-align:right">16,400</td><td class="num" style="text-align:right">642,000</td></tr><tr><td class="dim">2</td><td>蒙牛纯甄酸奶 200g×12</td><td class="num" style="text-align:right">1,980,000</td><td class="num" style="text-align:right">18.87%<span class="sqbar"><i style="width:19%"></i></span></td><td class="num" style="text-align:right">13,800</td><td class="num" style="text-align:right">412,000</td></tr><tr><td class="dim">3</td><td>未来星儿童奶 190ml×12</td><td class="num" style="text-align:right">1,520,000</td><td class="num" style="text-align:right">14.48%<span class="sqbar"><i style="width:14%"></i></span></td><td class="num" style="text-align:right">9,600</td><td class="num" style="text-align:right">288,000</td></tr><tr><td class="dim">4</td><td>特仑苏 / 精选礼盒</td><td class="num" style="text-align:right">1,180,000</td><td class="num" style="text-align:right">11.24%<span class="sqbar"><i style="width:11%"></i></span></td><td class="num" style="text-align:right">4,200</td><td class="num" style="text-align:right">196,000</td></tr><tr><td class="dim">5</td><td>纯甄果粒礼盒装</td><td class="num" style="text-align:right">940,000</td><td class="num" style="text-align:right">8.96%<span class="sqbar"><i style="width:9%"></i></span></td><td class="num" style="text-align:right">3,800</td><td class="num" style="text-align:right">152,000</td></tr><tr><td class="dim">6</td><td>随变 / 蒂兰圣雪冰品</td><td class="num" style="text-align:right">638,000</td><td class="num" style="text-align:right">6.08%<span class="sqbar"><i style="width:6%"></i></span></td><td class="num" style="text-align:right">7,200</td><td class="num" style="text-align:right">86,000</td></tr><tr><td class="dim">7</td><td>蒙牛真果粒 250g×12</td><td class="num" style="text-align:right">482,000</td><td class="num" style="text-align:right">4.59%<span class="sqbar"><i style="width:5%"></i></span></td><td class="num" style="text-align:right">5,100</td><td class="num" style="text-align:right">64,000</td></tr><tr><td class="dim">8</td><td>蒙牛早餐奶 250ml×16</td><td class="num" style="text-align:right">396,000</td><td class="num" style="text-align:right">3.77%<span class="sqbar"><i style="width:4%"></i></span></td><td class="num" style="text-align:right">4,600</td><td class="num" style="text-align:right">52,000</td></tr><tr><td class="dim">9</td><td>冠益乳原味 100g×8</td><td class="num" style="text-align:right">284,000</td><td class="num" style="text-align:right">2.71%<span class="sqbar"><i style="width:3%"></i></span></td><td class="num" style="text-align:right">3,800</td><td class="num" style="text-align:right">38,000</td></tr><tr><td class="dim">10</td><td>优益C 活菌型 340ml</td><td class="num" style="text-align:right">214,000</td><td class="num" style="text-align:right">2.04%<span class="sqbar"><i style="width:2%"></i></span></td><td class="num" style="text-align:right">2,600</td><td class="num" style="text-align:right">29,000</td></tr></tbody>
      </table>
    </div>

    <!-- ⑥ 时段分析 -->
    <div class="st" style="margin:4px 0 0">时段分析</div>
    <div class="duo2">
      <div class="chart-box">
        <div class="chart-hd"><div class="t">销售额时段分布</div><div class="dim" style="font-size:11.4px">颜色越深表示该时段销售额越高</div></div>
        <div class="heat-wrap" id="dbHeat"><div class="heat"><div class="hl">周一</div><div class="cell" title="周一 0:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周一 1:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周一 2:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周一 3:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周一 4:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周一 5:00 · 相对热度 6" style="background:rgba(232,98,44,0.13)"></div><div class="cell" title="周一 6:00 · 相对热度 13" style="background:rgba(232,98,44,0.20)"></div><div class="cell" title="周一 7:00 · 相对热度 29" style="background:rgba(232,98,44,0.34)"></div><div class="cell" title="周一 8:00 · 相对热度 42" style="background:rgba(232,98,44,0.46)"></div><div class="cell" title="周一 9:00 · 相对热度 51" style="background:rgba(232,98,44,0.55)"></div><div class="cell" title="周一 10:00 · 相对热度 68" style="background:rgba(232,98,44,0.71)"></div><div class="cell" title="周一 11:00 · 相对热度 99" style="background:rgba(232,98,44,0.99)"></div><div class="cell" title="周一 12:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周一 13:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周一 14:00 · 相对热度 73" style="background:rgba(232,98,44,0.75)"></div><div class="cell" title="周一 15:00 · 相对热度 59" style="background:rgba(232,98,44,0.63)"></div><div class="cell" title="周一 16:00 · 相对热度 64" style="background:rgba(232,98,44,0.67)"></div><div class="cell" title="周一 17:00 · 相对热度 79" style="background:rgba(232,98,44,0.81)"></div><div class="cell" title="周一 18:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周一 19:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周一 20:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周一 21:00 · 相对热度 68" style="background:rgba(232,98,44,0.71)"></div><div class="cell" title="周一 22:00 · 相对热度 37" style="background:rgba(232,98,44,0.42)"></div><div class="cell" title="周一 23:00 · 相对热度 15" style="background:rgba(232,98,44,0.22)"></div><div class="hl">周日</div><div class="cell" title="周日 0:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周日 1:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周日 2:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周日 3:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周日 4:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周日 5:00 · 相对热度 6" style="background:rgba(232,98,44,0.13)"></div><div class="cell" title="周日 6:00 · 相对热度 14" style="background:rgba(232,98,44,0.21)"></div><div class="cell" title="周日 7:00 · 相对热度 31" style="background:rgba(232,98,44,0.36)"></div><div class="cell" title="周日 8:00 · 相对热度 45" style="background:rgba(232,98,44,0.49)"></div><div class="cell" title="周日 9:00 · 相对热度 54" style="background:rgba(232,98,44,0.58)"></div><div class="cell" title="周日 10:00 · 相对热度 73" style="background:rgba(232,98,44,0.75)"></div><div class="cell" title="周日 11:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周日 12:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周日 13:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周日 14:00 · 相对热度 78" style="background:rgba(232,98,44,0.80)"></div><div class="cell" title="周日 15:00 · 相对热度 64" style="background:rgba(232,98,44,0.67)"></div><div class="cell" title="周日 16:00 · 相对热度 68" style="background:rgba(232,98,44,0.71)"></div><div class="cell" title="周日 17:00 · 相对热度 85" style="background:rgba(232,98,44,0.86)"></div><div class="cell" title="周日 18:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周日 19:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周日 20:00 · 相对热度 100" style="background:rgba(232,98,44,1.00)"></div><div class="cell" title="周日 21:00 · 相对热度 73" style="background:rgba(232,98,44,0.75)"></div><div class="cell" title="周日 22:00 · 相对热度 40" style="background:rgba(232,98,44,0.45)"></div><div class="cell" title="周日 23:00 · 相对热度 17" style="background:rgba(232,98,44,0.23)"></div><div class="hl">周六</div><div class="cell" title="周六 0:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周六 1:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周六 2:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周六 3:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周六 4:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周六 5:00 · 相对热度 5" style="background:rgba(232,98,44,0.13)"></div><div class="cell" title="周六 6:00 · 相对热度 12" style="background:rgba(232,98,44,0.19)"></div><div class="cell" title="周六 7:00 · 相对热度 26" style="background:rgba(232,98,44,0.32)"></div><div class="cell" title="周六 8:00 · 相对热度 38" style="background:rgba(232,98,44,0.43)"></div><div class="cell" title="周六 9:00 · 相对热度 46" style="background:rgba(232,98,44,0.50)"></div><div class="cell" title="周六 10:00 · 相对热度 62" style="background:rgba(232,98,44,0.65)"></div><div class="cell" title="周六 11:00 · 相对热度 78" style="background:rgba(232,98,44,0.80)"></div><div class="cell" title="周六 12:00 · 相对热度 92" style="background:rgba(232,98,44,0.93)"></div><div class="cell" title="周六 13:00 · 相对热度 84" style="background:rgba(232,98,44,0.85)"></div><div class="cell" title="周六 14:00 · 相对热度 66" style="background:rgba(232,98,44,0.69)"></div><div class="cell" title="周六 15:00 · 相对热度 54" style="background:rgba(232,98,44,0.58)"></div><div class="cell" title="周六 16:00 · 相对热度 58" style="background:rgba(232,98,44,0.61)"></div><div class="cell" title="周六 17:00 · 相对热度 72" style="background:rgba(232,98,44,0.74)"></div><div class="cell" title="周六 18:00 · 相对热度 88" style="background:rgba(232,98,44,0.89)"></div><div class="cell" title="周六 19:00 · 相对热度 95" style="background:rgba(232,98,44,0.95)"></div><div class="cell" title="周六 20:00 · 相对热度 86" style="background:rgba(232,98,44,0.87)"></div><div class="cell" title="周六 21:00 · 相对热度 62" style="background:rgba(232,98,44,0.65)"></div><div class="cell" title="周六 22:00 · 相对热度 34" style="background:rgba(232,98,44,0.39)"></div><div class="cell" title="周六 23:00 · 相对热度 14" style="background:rgba(232,98,44,0.21)"></div><div class="hl">周五</div><div class="cell" title="周五 0:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周五 1:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周五 2:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周五 3:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周五 4:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周五 5:00 · 相对热度 4" style="background:rgba(232,98,44,0.12)"></div><div class="cell" title="周五 6:00 · 相对热度 11" style="background:rgba(232,98,44,0.18)"></div><div class="cell" title="周五 7:00 · 相对热度 23" style="background:rgba(232,98,44,0.29)"></div><div class="cell" title="周五 8:00 · 相对热度 33" style="background:rgba(232,98,44,0.39)"></div><div class="cell" title="周五 9:00 · 相对热度 40" style="background:rgba(232,98,44,0.45)"></div><div class="cell" title="周五 10:00 · 相对热度 55" style="background:rgba(232,98,44,0.58)"></div><div class="cell" title="周五 11:00 · 相对热度 69" style="background:rgba(232,98,44,0.71)"></div><div class="cell" title="周五 12:00 · 相对热度 81" style="background:rgba(232,98,44,0.82)"></div><div class="cell" title="周五 13:00 · 相对热度 74" style="background:rgba(232,98,44,0.76)"></div><div class="cell" title="周五 14:00 · 相对热度 58" style="background:rgba(232,98,44,0.61)"></div><div class="cell" title="周五 15:00 · 相对热度 48" style="background:rgba(232,98,44,0.52)"></div><div class="cell" title="周五 16:00 · 相对热度 51" style="background:rgba(232,98,44,0.55)"></div><div class="cell" title="周五 17:00 · 相对热度 63" style="background:rgba(232,98,44,0.66)"></div><div class="cell" title="周五 18:00 · 相对热度 77" style="background:rgba(232,98,44,0.79)"></div><div class="cell" title="周五 19:00 · 相对热度 84" style="background:rgba(232,98,44,0.85)"></div><div class="cell" title="周五 20:00 · 相对热度 76" style="background:rgba(232,98,44,0.78)"></div><div class="cell" title="周五 21:00 · 相对热度 55" style="background:rgba(232,98,44,0.58)"></div><div class="cell" title="周五 22:00 · 相对热度 30" style="background:rgba(232,98,44,0.36)"></div><div class="cell" title="周五 23:00 · 相对热度 12" style="background:rgba(232,98,44,0.19)"></div><div class="hl">周四</div><div class="cell" title="周四 0:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周四 1:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周四 2:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周四 3:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周四 4:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周四 5:00 · 相对热度 4" style="background:rgba(232,98,44,0.12)"></div><div class="cell" title="周四 6:00 · 相对热度 10" style="background:rgba(232,98,44,0.17)"></div><div class="cell" title="周四 7:00 · 相对热度 22" style="background:rgba(232,98,44,0.28)"></div><div class="cell" title="周四 8:00 · 相对热度 32" style="background:rgba(232,98,44,0.37)"></div><div class="cell" title="周四 9:00 · 相对热度 39" style="background:rgba(232,98,44,0.44)"></div><div class="cell" title="周四 10:00 · 相对热度 52" style="background:rgba(232,98,44,0.56)"></div><div class="cell" title="周四 11:00 · 相对热度 66" style="background:rgba(232,98,44,0.68)"></div><div class="cell" title="周四 12:00 · 相对热度 77" style="background:rgba(232,98,44,0.79)"></div><div class="cell" title="周四 13:00 · 相对热度 71" style="background:rgba(232,98,44,0.73)"></div><div class="cell" title="周四 14:00 · 相对热度 55" style="background:rgba(232,98,44,0.59)"></div><div class="cell" title="周四 15:00 · 相对热度 45" style="background:rgba(232,98,44,0.50)"></div><div class="cell" title="周四 16:00 · 相对热度 49" style="background:rgba(232,98,44,0.53)"></div><div class="cell" title="周四 17:00 · 相对热度 60" style="background:rgba(232,98,44,0.64)"></div><div class="cell" title="周四 18:00 · 相对热度 74" style="background:rgba(232,98,44,0.76)"></div><div class="cell" title="周四 19:00 · 相对热度 80" style="background:rgba(232,98,44,0.81)"></div><div class="cell" title="周四 20:00 · 相对热度 72" style="background:rgba(232,98,44,0.74)"></div><div class="cell" title="周四 21:00 · 相对热度 52" style="background:rgba(232,98,44,0.56)"></div><div class="cell" title="周四 22:00 · 相对热度 29" style="background:rgba(232,98,44,0.34)"></div><div class="cell" title="周四 23:00 · 相对热度 12" style="background:rgba(232,98,44,0.19)"></div><div class="hl">周三</div><div class="cell" title="周三 0:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周三 1:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周三 2:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周三 3:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周三 4:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周三 5:00 · 相对热度 4" style="background:rgba(232,98,44,0.12)"></div><div class="cell" title="周三 6:00 · 相对热度 10" style="background:rgba(232,98,44,0.17)"></div><div class="cell" title="周三 7:00 · 相对热度 21" style="background:rgba(232,98,44,0.28)"></div><div class="cell" title="周三 8:00 · 相对热度 31" style="background:rgba(232,98,44,0.37)"></div><div class="cell" title="周三 9:00 · 相对热度 38" style="background:rgba(232,98,44,0.43)"></div><div class="cell" title="周三 10:00 · 相对热度 51" style="background:rgba(232,98,44,0.55)"></div><div class="cell" title="周三 11:00 · 相对热度 64" style="background:rgba(232,98,44,0.67)"></div><div class="cell" title="周三 12:00 · 相对热度 75" style="background:rgba(232,98,44,0.77)"></div><div class="cell" title="周三 13:00 · 相对热度 69" style="background:rgba(232,98,44,0.71)"></div><div class="cell" title="周三 14:00 · 相对热度 54" style="background:rgba(232,98,44,0.58)"></div><div class="cell" title="周三 15:00 · 相对热度 44" style="background:rgba(232,98,44,0.49)"></div><div class="cell" title="周三 16:00 · 相对热度 48" style="background:rgba(232,98,44,0.52)"></div><div class="cell" title="周三 17:00 · 相对热度 59" style="background:rgba(232,98,44,0.62)"></div><div class="cell" title="周三 18:00 · 相对热度 72" style="background:rgba(232,98,44,0.74)"></div><div class="cell" title="周三 19:00 · 相对热度 78" style="background:rgba(232,98,44,0.80)"></div><div class="cell" title="周三 20:00 · 相对热度 71" style="background:rgba(232,98,44,0.73)"></div><div class="cell" title="周三 21:00 · 相对热度 51" style="background:rgba(232,98,44,0.55)"></div><div class="cell" title="周三 22:00 · 相对热度 28" style="background:rgba(232,98,44,0.34)"></div><div class="cell" title="周三 23:00 · 相对热度 11" style="background:rgba(232,98,44,0.19)"></div><div class="hl">周二</div><div class="cell" title="周二 0:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周二 1:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周二 2:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周二 3:00 · 相对热度 1" style="background:rgba(232,98,44,0.09)"></div><div class="cell" title="周二 4:00 · 相对热度 2" style="background:rgba(232,98,44,0.10)"></div><div class="cell" title="周二 5:00 · 相对热度 4" style="background:rgba(232,98,44,0.12)"></div><div class="cell" title="周二 6:00 · 相对热度 10" style="background:rgba(232,98,44,0.17)"></div><div class="cell" title="周二 7:00 · 相对热度 22" style="background:rgba(232,98,44,0.29)"></div><div class="cell" title="周二 8:00 · 相对热度 33" style="background:rgba(232,98,44,0.38)"></div><div class="cell" title="周二 9:00 · 相对热度 40" style="background:rgba(232,98,44,0.44)"></div><div class="cell" title="周二 10:00 · 相对热度 53" style="background:rgba(232,98,44,0.57)"></div><div class="cell" title="周二 11:00 · 相对热度 67" style="background:rgba(232,98,44,0.70)"></div><div class="cell" title="周二 12:00 · 相对热度 79" style="background:rgba(232,98,44,0.81)"></div><div class="cell" title="周二 13:00 · 相对热度 72" style="background:rgba(232,98,44,0.74)"></div><div class="cell" title="周二 14:00 · 相对热度 57" style="background:rgba(232,98,44,0.60)"></div><div class="cell" title="周二 15:00 · 相对热度 46" style="background:rgba(232,98,44,0.51)"></div><div class="cell" title="周二 16:00 · 相对热度 50" style="background:rgba(232,98,44,0.54)"></div><div class="cell" title="周二 17:00 · 相对热度 62" style="background:rgba(232,98,44,0.65)"></div><div class="cell" title="周二 18:00 · 相对热度 76" style="background:rgba(232,98,44,0.78)"></div><div class="cell" title="周二 19:00 · 相对热度 82" style="background:rgba(232,98,44,0.83)"></div><div class="cell" title="周二 20:00 · 相对热度 74" style="background:rgba(232,98,44,0.76)"></div><div class="cell" title="周二 21:00 · 相对热度 53" style="background:rgba(232,98,44,0.57)"></div><div class="cell" title="周二 22:00 · 相对热度 29" style="background:rgba(232,98,44,0.35)"></div><div class="cell" title="周二 23:00 · 相对热度 12" style="background:rgba(232,98,44,0.19)"></div></div><div class="hx"><div class="hx-in"><span style="left:2.08%">0</span><span style="left:27.08%">6</span><span style="left:52.08%">12</span><span style="left:77.08%">18</span></div></div></div>
      </div>
      <div class="chart-box">
        <div class="chart-hd"><div class="t">销售额周内占比</div></div>
        <div class="hbar-list" id="dbWeekList"><div class="hbar-row" style="grid-template-columns:48px 1fr"><div class="nm" style="text-align:right">周一</div><div class="track"><div class="fill" style="width:38.2%"></div><span class="val" style="position:absolute;left:calc(38.2% + 8px);top:0;line-height:19px">10.8%</span></div></div><div class="hbar-row" style="grid-template-columns:48px 1fr"><div class="nm" style="text-align:right">周二</div><div class="track"><div class="fill" style="width:33.2%"></div><span class="val" style="position:absolute;left:calc(33.2% + 8px);top:0;line-height:19px">9.4%</span></div></div><div class="hbar-row" style="grid-template-columns:48px 1fr"><div class="nm" style="text-align:right">周三</div><div class="track"><div class="fill" style="width:34.6%"></div><span class="val" style="position:absolute;left:calc(34.6% + 8px);top:0;line-height:19px">9.8%</span></div></div><div class="hbar-row" style="grid-template-columns:48px 1fr"><div class="nm" style="text-align:right">周四</div><div class="track"><div class="fill" style="width:39.6%"></div><span class="val" style="position:absolute;left:calc(39.6% + 8px);top:0;line-height:19px">11.2%</span></div></div><div class="hbar-row" style="grid-template-columns:48px 1fr"><div class="nm" style="text-align:right">周五</div><div class="track"><div class="fill" style="width:52.3%"></div><span class="val" style="position:absolute;left:calc(52.3% + 8px);top:0;line-height:19px">14.8%</span></div></div><div class="hbar-row" style="grid-template-columns:48px 1fr"><div class="nm" style="text-align:right">周六</div><div class="track"><div class="fill" style="width:82.0%"></div><span class="val" style="position:absolute;left:calc(82.0% + 8px);top:0;line-height:19px">23.2%</span></div></div><div class="hbar-row" style="grid-template-columns:48px 1fr"><div class="nm" style="text-align:right">周日</div><div class="track"><div class="fill" style="width:73.5%"></div><span class="val" style="position:absolute;left:calc(73.5% + 8px);top:0;line-height:19px">20.8%</span></div></div></div>
      </div>
    </div>

  </div>
</div>`;
}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-board",
  title: "数据看板",
  crumb: "数据分析 / 数据看板",
  group: "数据分析",
  template: tplPageboard
});


  /* 活动零售商 / 活动商品明细：与「补充配置」页导入结果同源 */
  var retRows = p.retRows || [];
  var skuRows = p.skuRows || [];
  h += '<div class="dsec"><h5>活动零售商明细 <span class="muted">' + retRows.length + ' 条</span></h5>';
  if(retRows.length){
    h += '<table class="bt mini" style="table-layout:fixed"><thead><tr>'
       + '<th style="width:6%">#</th><th style="width:20%">零售商名称</th><th style="width:30%">门店名称</th>'
       + '<th style="width:12%">省份</th><th style="width:12%">城市</th><th style="width:20%">微信商户号</th></tr></thead><tbody>';
    retRows.forEach(function(r, k){
      h += '<tr><td class="idx">' + (k+1) + '</td>'
         + '<td>' + pnEsc(r.ret || '—') + '</td>'
         + '<td>' + pnEsc(r.store || r.n || '—') + '</td>'
         + '<td class="mut">' + pnEsc(r.prov || '—') + '</td>'
         + '<td class="mut">' + pnEsc(r.city || '—') + '</td>'
         + '<td class="sx-mono">' + (r.mch ? pnEsc(r.mch) : '<span class="tg tg-a xs">待服务商补充</span>') + '</td></tr>';
    });
    h += '</tbody></table>';
  } else {
    h += '<div class="note b" style="margin-top:0">还没有导入零售商 / 门店明细</div>';
  }
  h += '</div>';

  h += '<div class="dsec" style="margin-bottom:0"><h5>活动商品明细 <span class="muted">' + skuRows.length + ' 条</span></h5>';
  if(skuRows.length){
    h += '<table class="bt mini" style="table-layout:fixed"><thead><tr>'
       + '<th style="width:6%">#</th><th style="width:26%">69码或店内码</th><th style="width:44%">商品名称</th>'
       + '<th style="width:24%">店内码所属零售商</th></tr></thead><tbody>';
    skuRows.forEach(function(r, k){
      h += '<tr><td class="idx">' + (k+1) + '</td>'
         + '<td class="sx-mono">' + pnEsc(r.code || '—') + '</td>'
         + '<td>' + pnEsc(r.name || r.n || '—') + '</td>'
         + '<td class="mut">' + pnEsc(r.owner || '—') + '</td></tr>';
    });
    h += '</tbody></table>';
  } else {
    h += '<div class="note b" style="margin-top:0">还没有导入活动商品明细</div>';
  }
  h += '</div>';

/* ---------- 明细草稿：从计划带出（计划抽屉与批次抽屉共用） ---------- */
function pnLoadRows(p){
  PN.ret = [];
  PN.sku = [];
  if(p && p.retRows && p.retRows.length){
    PN.ret = p.retRows.map(function(r){ return Object.assign({}, r); });
  } else if(p && p.ret && p.ret.length){
    p.ret.forEach(function(n){ PN.ret.push({ ret:'—', store:n, prov:'—', city:'—', mch:'', n:n }); });
  }
  if(p && p.skuRows && p.skuRows.length){
    PN.sku = p.skuRows.map(function(r){ return Object.assign({}, r); });
  } else if(p && p.sku && p.sku.length){
    p.sku.forEach(function(n){ PN.sku.push({ code:'—', name:n, owner:'—', n:n }); });
  }
}

/* ---------- 渲染两张明细表：计划抽屉（pn*）与批次抽屉（bf*）共用同一份草稿 ---------- */
function pnRender(){
  /* 零售商明细：零售商名称 / 门店名称 / 省份 / 城市 / 微信商户号 */
  var retHtml = '';
  if(!PN.ret.length){
    retHtml = '<tr><td colspan="7" class="empty-row">尚未导入零售商 / 门店，点下方「导入零售商门店名单」</td></tr>';
  } else {
    PN.ret.forEach(function(it, i){
      retHtml += '<tr>'
        + '<td class="idx">' + (i+1) + '</td>'
        + '<td><span class="ro">' + pnEsc(it.ret || '—') + '</span></td>'
        + '<td><span class="ro">' + pnEsc(it.store || it.n || '—') + '</span></td>'
        + '<td><span class="ro mut">' + pnEsc(it.prov || '—') + '</span></td>'
        + '<td><span class="ro mut">' + pnEsc(it.city || '—') + '</span></td>'
        + '<td><span class="ro mut sx-mono" style="font-size:11.6px">' + (it.mch ? pnEsc(it.mch) : '<span class="tg tg-a">待服务商补充</span>') + '</span></td>'
        + '<td><span class="del" onclick="pnDel(\'ret\',' + i + ')">移除</span></td>'
        + '</tr>';
    });
  }
  ['pnRetBody','bfRetBody'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.innerHTML = retHtml;
  });

  /* 商品明细：69码或店内码 / 商品名称 / 店内码所属零售商 */
  var skuHtml = '';
  if(!PN.sku.length){
    skuHtml = '<tr><td colspan="5" class="empty-row">尚未导入商品，点下方「导入商品明细」</td></tr>';
  } else {
    PN.sku.forEach(function(it, i){
      skuHtml += '<tr>'
        + '<td class="idx">' + (i+1) + '</td>'
        + '<td><span class="ro sx-mono" style="font-size:11.8px">' + pnEsc(it.code || '—') + '</span></td>'
        + '<td><span class="ro">' + pnEsc(it.name || it.n || '—') + '</span></td>'
        + '<td><span class="ro mut">' + pnEsc(it.owner || '—') + '</span></td>'
        + '<td><span class="del" onclick="pnDel(\'sku\',' + i + ')">移除</span></td>'
        + '</tr>';
    });
  }
  ['pnSkuBody','bfSkuBody'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.innerHTML = skuHtml;
  });

  var set = function(ids, v){
    ids.forEach(function(id){ var el = document.getElementById(id); if(el) el.textContent = v; });
  };
  set(['pnRetCnt','bfRetCnt','pnFRet'], PN.ret.length);
  set(['pnSkuCnt','bfSkuCnt','pnFSku'], PN.sku.length);

  /* 未填商户号的条目数提示：销售没有则由服务商提报时补充 */
  var miss = PN.ret.filter(function(x){ return !x.mch; }).length;
  ['pnMchTip','bfMchTip'].forEach(function(id){
    var tip = document.getElementById(id); if(!tip) return;
    tip.innerHTML = miss
      ? ('其中 <b>' + miss + '</b> 家门店未填微信商户号，推送服务商后由服务商提报时补充')
      : '门店微信商户号已全部填写';
    tip.className = 'note' + (miss ? '' : ' g');
  });
}


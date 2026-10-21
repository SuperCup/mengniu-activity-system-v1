function impParse(text){
  var sc = IMP_SCHEMA[IMP.type];
  var lines = String(text || '').split(/\r?\n/).map(function(s){ return s.trim(); }).filter(Boolean);
  IMP.rows = []; IMP.errs = [];
  if(!lines.length){ impRenderResult(); return; }

  var norm = function(s){ return String(s == null ? '' : s).replace(/[\s*＊]/g, ''); };
  var labels = sc.cols.map(function(c){ return c.label; });
  var first = impSplit(lines[0]);

  /* 表头判定：整行与模板列名逐列相等才算表头。
     店名里出现「门店 / 商品」等字样不再被误判为表头，单行数据也不会被丢掉。 */
  var hasHeader = norm(first[0]) === norm(labels[0])
    || (first.length >= labels.length && labels.every(function(lb, i){ return norm(first[i]) === norm(lb); }));
  var start = hasHeader ? 1 : 0;

  var seen = {};
  for(var i = start; i < lines.length; i++){
    var cols = impSplit(lines[i]);
    var row = { __line:i + 1, __err:[] };
    sc.cols.forEach(function(c, ci){
      row[c.key] = (cols[ci] || '').trim();
      if(c.req && !row[c.key]) row.__err.push('缺少「' + c.label + '」');
    });
    if(IMP.type === 'ret' && row.mch && !/^\d{8,12}$/.test(row.mch)){
      row.__err.push('微信商户号应为 8~12 位数字');
    }
    /* 同一次导入内的重复行单独标出来，不静默丢弃 */
    var key = IMP.type === 'ret'
      ? (norm(row.mch) || norm(row.ret) + '|' + norm(row.store))
      : (norm(row.code) + '|' + norm(row.owner));
    if(key && seen[key]){
      row.__err.push('与第 ' + seen[key] + ' 行重复');
    } else if(key){
      seen[key] = i + 1;
    }
    IMP.rows.push(row);
  }
  IMP.errs = IMP.rows.filter(function(r){ return r.__err.length; });
  impRenderResult();
}

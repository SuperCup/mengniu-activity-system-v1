
/* ---------- 明细按模板导入：字段与「名单导入」一致 ---------- */
function briefImpCols(kind){
  return kind === 'ret'
    ? [['ret','零售商名称'],['store','门店名称'],['prov','省份'],['city','城市'],['mch','微信商户号']]
    : [['code','69码或店内码'],['name','商品名称'],['owner','店内码所属零售商']];
}

function briefImpTpl(){
  var kind = BRIEF_EDIT.kind, cols = briefImpCols(kind);
  var sample = kind === 'ret'
    ? '永辉超市,永辉超市（重庆观音桥店）,重庆市,重庆,1236057802'
    : '6923644223456,特仑苏纯牛奶 250ml×12,永辉超市';
  var csv = '\ufeff' + cols.map(function(c){ return c[1]; }).join(',') + '\r\n' + sample + '\r\n';
  var blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = kind === 'ret' ? '活动零售商明细模板.csv' : '活动商品明细模板.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 900);
  MT.toast('模板已下载，按列填写后再导入');
}

function briefImpToggle(){
  var box = document.getElementById('briefImpBox');
  if(!box) return;
  var on = box.style.display === 'none';
  box.style.display = on ? '' : 'none';
  if(on){
    var ta = document.getElementById('briefImpText');
    if(ta){
      ta.value = '';
      ta.placeholder = briefImpCols(BRIEF_EDIT.kind).map(function(c){ return c[1]; }).join(',');
      ta.focus();
    }
  }
}

function briefImpApply(){
  var ta = document.getElementById('briefImpText');
  briefImpText(ta ? ta.value : '');
}

function briefImpFile(inp){
  var f = inp.files && inp.files[0];
  if(!f) return;
  var rd = new FileReader();
  rd.onload = function(){ briefImpText(String(rd.result || '')); };
  rd.readAsText(f, 'utf-8');
  inp.value = '';
}

function briefImpText(text){
  var kind = BRIEF_EDIT.kind;
  var cols = briefImpCols(kind);
  var b = CRE_BRIEF[BRIEF_EDIT.i];
  if(!b) return;
  var list = b[kind] || (b[kind] = []);

  var lines = String(text || '').split(/\r?\n/).map(function(s){ return s.trim(); }).filter(Boolean);
  if(!lines.length){ MT.toast('没有可导入的内容', 'err'); return; }

  var split = (typeof impSplit === 'function') ? impSplit : function(s){
    return s.split(',').map(function(x){ return x.replace(/^"|"$/g, '').trim(); });
  };
  var norm = function(s){ return String(s == null ? '' : s).replace(/[\s*＊]/g, ''); };
  var head = split(lines[0]);
  var isHead = norm(head[0]) === norm(cols[0][1])
    || cols.every(function(c, i){ return norm(head[i]) === norm(c[1]); });

  var added = 0, dup = 0;
  for(var i = isHead ? 1 : 0; i < lines.length; i++){
    var cs = split(lines[i]);
    var row = {};
    var empty = true;
    cols.forEach(function(c, ci){
      row[c[0]] = (cs[ci] || '').trim();
      if(row[c[0]]) empty = false;
    });
    if(empty) continue;
    var same = list.some(function(x){
      return kind === 'ret'
        ? (x.store === row.store && x.ret === row.ret)
        : (x.code === row.code && x.owner === row.owner);
    });
    if(same){ dup++; continue; }
    list.push(row);
    added++;
  }

  var cnt = document.getElementById('briefImpCnt');
  if(cnt) cnt.textContent = '已追加 ' + added + ' 行' + (dup ? '，跳过重复 ' + dup + ' 行' : '');
  briefItemRender();
  if(!added) MT.toast('没有新增行' + (dup ? '（全部重复）' : ''), 'err');
}

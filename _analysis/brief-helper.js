
/** 明细的单元格文本：前 2 项 + 数量 */
function briefCellTxt(arr, kind){
  var s = briefSummary(arr, kind);
  if(!s.n) return '<span class="mut">—</span>';
  return pnEsc(s.txt) + '（' + s.n + (kind === 'ret' ? ' 家' : ' 个') + '）';
}

/* ---------- 审批列表用按钮：与项目管理同一张卡片，只换动作 ---------- */
function approveButtons(p){
  var q = "'" + p.id + "'";
  if(p.state === 'pending'){
    return '<button class="btn btn-d btn-xs" onclick="projApprove(' + q + ',\'reject\')">驳回</button>'
         + '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">查看详情</button>'
         + '<button class="btn btn-p btn-xs" onclick="projApprove(' + q + ',\'agree\')">同意</button>';
  }
  return '<button class="btn btn-o btn-xs" onclick="openProjDetail(' + q + ')">查看详情</button>';
}


/* =============================================================================
 * components/flow-drawer.js — 项目状态流转说明
 * ========================================================================== */

/* ---------- 逻辑 ---------- */
function openFlow(){ openDrawer('dw-flow'); }

/* ============ 项目创建：服务商 → 联系人联动 ============ */

/* ---------- 模板：dw-flow ---------- */
function tplDrawerflow(){
  return `<div class="drawer" id="dw-flow" style="width:900px">
  <div class="dw-h">
    <h3>项目节点与状态 <span class="sub">4 个节点 / 11 个状态，审批动作不在系统内，审批为并联</span></h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">
    <div class="stmap" style="margin-top:0">
        <div class="nd gray"><div class="nm"><span class="no">01</span>草稿阶段</div><div class="ds"><span class="fst">草稿</span>可编辑 / 提交审批</div></div>
        <div class="nd"><span class="ar">›</span><div class="nm"><span class="no">02</span>审批阶段</div><div class="ds"><span class="fst">审批中</span><span class="fst">已通过</span><span class="fst">未通过</span></div></div>
        <div class="nd"><span class="ar">›</span><div class="nm"><span class="no">03</span>推送阶段</div><div class="ds"><span class="fst">待推送</span><span class="fst">已推送</span><span class="fst">待确认</span><span class="fst">已确认</span></div></div>
        <div class="nd red"><span class="ar">›</span><div class="nm"><span class="no">04</span>执行阶段</div><div class="ds"><span class="fst">已配置</span><span class="fst">执行中</span><span class="fst">已结束</span></div></div>
    </div>

    <div class="apv-parallel" style="margin-top:14px">
      <div class="apv-p-head"><b>审批方式：并联审批</b><span class="mut">审批人之间没有先后、没有分级</span></div>
      <div class="apv-people">
        <span class="apv-person"><span class="nm">审批人 A</span></span>
        <span class="apv-person"><span class="nm">审批人 B</span></span>
        <span class="apv-person"><span class="nm">审批人 C</span></span>
      </div>
      <div class="apv-demo">
        <span class="mut">三个人同时收到审批任务，全部同意后：</span>
        <span class="res">✓ 审批通过</span>
      </div>
      <div class="apv-rule">任一人未通过，则本次审批不通过；不存在“先一级、后一级”的顺序。</div>
    </div>

    <div class="psec" style="margin-top:16px"><h4>状态字典</h4><span class="psec-r">审批状态与审批结果只在项目详情的状态时间轴中只读展示</span></div>
    <table class="bt mini" style="table-layout:fixed">
      <thead><tr><th style="width:18%">节点</th><th style="width:24%">状态</th><th>说明</th></tr></thead>
      <tbody>
        <tr><td><b>草稿</b></td><td>草稿</td><td>可编辑、可提交审批；无详情、无批次计划入口</td></tr>
        <tr><td rowspan="3"><b>审批</b></td><td>审批中</td><td>BPM 并联审批中；所选审批人全部同意后回写“已通过”，任一人未通过则回写“未通过”</td></tr>
        <tr><td>已通过</td><td>审批结果回写；可补计划详细字段</td></tr>
        <tr><td>未通过</td><td>可编辑后重新提交</td></tr>
        <tr><td rowspan="4"><b>推送</b></td><td>待推送</td><td>批次配置齐全，等待推送</td></tr>
        <tr><td>已推送</td><td>推送邮件已发出，等邮件回执</td></tr>
        <tr><td>待确认</td><td>服务商已收到，等待确认计划</td></tr>
        <tr><td>已确认</td><td>服务商确认承接</td></tr>
        <tr><td rowspan="3"><b>执行</b></td><td>已配置</td><td>服务商已上传批次号</td></tr>
        <tr><td>执行中</td><td>服务商已上传 1 次账单</td></tr>
        <tr><td>已结束</td><td>手工终止或项目到期</td></tr>
      </tbody>
    </table>

    <div class="psec" style="margin-top:16px"><h4>流程中的信息修改规则</h4><span class="psec-r">审批通过后计划批次锁定</span></div>
    <table class="bt mini" style="table-layout:fixed">
      <thead><tr><th style="width:34%">时点</th><th>允许的修改</th></tr></thead>
      <tbody>
        <tr><td>草稿 / 未通过</td><td>编辑项目信息与计划后重新提交审批</td></tr>
        <tr><td>审批中</td><td>计划锁定，不提供编辑入口</td></tr>
        <tr><td>已通过 / 待推送</td><td>不能增减计划批次、不能改机制类型；可补面额、门槛、发放上限等详细字段</td></tr>
        <tr><td>已推送及之后</td><td>不能增减计划批次、不能改机制类型、不能改机制详细字段</td></tr>
      </tbody>
    </table>
    <div class="note b" style="margin-top:12px">审批在 BPM 完成；系统内不提供通过 / 驳回 / 撤回等任何审批动作，只负责提交审批、获取审批结果。</div>
  </div>
  <div class="dw-f">
    <div class="lft">状态随业务流程推进，不支持手工改状态</div>
    <div class="rgt"><button class="btn btn-p" onclick="closeDrawer()">知道了</button></div>
  </div>
</div>`;
}

MT.defineDrawer("dw-flow", tplDrawerflow);

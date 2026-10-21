/* =============================================================================
 * components/flow-drawer.js — 项目状态流转说明
 * ========================================================================== */

/* ---------- 逻辑 ---------- */
function openFlow(){ openDrawer('dw-flow'); }

/* ============ 项目创建：服务商 → 联系人联动 ============ */

/* ---------- 模板：dw-flow ---------- */
function tplDrawerflow(){
  return `<div class="drawer" id="dw-flow" style="width:760px">
  <div class="dw-h">
    <h3>项目状态流转 <span class="sub">六个状态与各自可执行动作</span></h3>
    <span class="dw-x" onclick="closeDrawer()">×</span>
  </div>
  <div class="dw-b">
    <div class="stmap" style="margin-top:0">
        <div class="nd gray"><span class="ar">›</span><div class="nm"><span class="no">01</span>草稿</div><div class="ds">含被驳回回退<br>可编辑、可删除、可提审</div></div>
        <div class="nd gray"><span class="ar">›</span><div class="nm"><span class="no">02</span>待审批</div><div class="ds">已提交，锁编辑<br>可撤回（回到草稿）</div></div>
        <div class="nd"><span class="ar">›</span><div class="nm"><span class="no">03</span>待推送服务商</div><div class="ds">审批已通过<br>补计划明细 → 推送（邮件）/ 终止</div></div>
        <div class="nd"><span class="ar">›</span><div class="nm"><span class="no">04</span>待服务商确认</div><div class="ds">邮件已送达<br>可重发 / 可终止</div></div>
        <div class="nd"><span class="ar">›</span><div class="nm"><span class="no">05</span>执行中</div><div class="ds">服务商已确认<br>建计划·批次·页面，可终止<sup>*</sup></div></div>
        <div class="nd red"><div class="nm"><span class="no">06</span>已终止</div><div class="ds">终态，停发券<br>不可恢复，仅可重建</div></div>
      </div>
    <table class="bt mini" style="table-layout:fixed;margin-top:6px">
      <thead><tr>
        <th style="width:22%">状态</th><th style="width:40%">含义</th><th>可执行动作</th>
      </tr></thead>
      <tbody>
        <tr><td><b>草稿</b></td><td>含被驳回回退；仅本人与同部门可见，不计入待办</td><td>编辑、删除、提交审批</td></tr>
        <tr><td><b>待审批</b></td><td>已提交，锁编辑；等待数字化中心审批结论</td><td>撤回（回到草稿）</td></tr>
        <tr><td><b>待推送服务商</b></td><td>审批已通过；计划明细由创建人在此状态补充（审批人看不到计划明细）</td><td>补充计划明细、推送（邮件）、终止</td></tr>
        <tr><td><b>待服务商确认</b></td><td>邮件已送达，令牌有效期 7 天；未确认前不计入执行</td><td>重发、复制链接、终止</td></tr>
        <tr><td><b>执行中</b></td><td>服务商已确认，可建计划·批次·页面</td><td>建计划/批次/页面；批次产齐后不可终止</td></tr>
        <tr><td><b>已终止</b></td><td>终态，停发券，不可恢复</td><td>仅可重建</td></tr>
      </tbody>
    </table>
  </div>
  <div class="dw-f">
    <div class="lft">状态变更均由系统按动作自动推进，不支持手工改状态</div>
    <div class="rgt"><button class="btn btn-p" onclick="closeDrawer()">知道了</button></div>
  </div>
</div>`;
}

MT.defineDrawer("dw-flow", tplDrawerflow);

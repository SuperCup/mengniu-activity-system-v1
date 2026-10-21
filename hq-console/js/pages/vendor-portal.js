/* =============================================================================
 * pages/vendor-portal.js — 服务商操作页
 * 服务商端与总部端分离，此处展示邮件链接进入后的确认 / 提报动作。
 * ========================================================================== */

/* ---------- 模板：v-vendor ---------- */
function tplPagevendor(){
  return `<div class="view" id="v-vendor">
  <div class="panel">
    <div class="panel-h">
      <h3>服务商操作页 <span class="tg tg-a">免登录 · 邮件链接进入</span></h3>
      <span class="muted">服务商侧操作页（总部端菜单不进入此页，由邮件链接直达）</span>
    </div>
    <div class="panel-b">
      <div class="cbox" style="margin-bottom:16px"><b>服务商没有系统账号。</b>打开邮件中的专属链接即可进入本页，令牌与活动 ID 绑定、设有效期、活动终止即回收。页面只展示该活动，不暴露预算总额与内部审批意见。</div>

      <div class="st">邮件通知</div>
      <div class="mail">
        <div class="mail-h">
          <div class="r"><span class="k">发件人</span><span>蒙牛活动管理平台 &lt;no-reply@mengniu.com.cn&gt;</span></div>
          <div class="r"><span class="k">收件人</span><span>huwz@zhishi.com（上海智士网络科技 · 胡味芝）</span></div>
          <div class="r"><span class="k">主题</span><span><b>【活动执行通知】双节常温奶满减 · MN-WX-202612-0041 待您确认</b></span></div>
        </div>
        <div class="mail-b">
          <div class="bt">您好，有一项活动待确认执行</div>
          <div>活动名称：双节常温奶满减<br>
          活动 ID：MN-WX-202612-0041<br>
          活动周期：2026-12-20 至 2027-01-05<br>
          投放平台：微信支付<br>
          机制附件：活动机制说明 / 零售商清单 / SKU 清单（3 个，可下载）<br>
          核销预算：¥400,000.00</div>
          <a class="mail-link" href="javascript:void(0)" onclick="go('v-vendor',document.querySelector('.topbar nav a'))">确认执行</a>
          <div class="mail-tip">请在 2 个工作日内确认是否承接。确认后在同一页面下载批次计划，再上传已配置批次与订单数据。<br>本链接仅对本次活动有效，请勿转发。链接有效期至 2026-12-19。</div>
        </div>
      </div>

      <div class="st" style="margin-top:24px">服务商操作页（链接打开后）</div>
      <div class="flow">
        <div class="fs done"><div class="l">① 确认执行</div><div class="d">已完成 2026-10-19 15:30</div></div>
        <div class="fs done"><div class="l">② 下载批次计划</div><div class="d">3 个计划 · 2026-10-19 15:32</div></div>
        <div class="fs done"><div class="l">③ 上传已配置批次</div><div class="d">3 个批次 · 2026-10-21 10:20</div></div>
        <div class="fs done"><div class="l">④ 上传订单数据</div><div class="d">12,428 条 · 2026-10-21 10:25</div></div>
      </div>

      <div class="h5new" style="margin-top:6px">
        <div>
          <div class="st" style="margin-top:0">① 确认执行</div>
          <div class="vres ok"><span class="ic">✓</span><span class="bd"><b>已确认承接</b>2026-10-19 15:30 确认执行「双节常温奶满减」</span></div>

          <div class="st" style="margin-top:18px">② 下载批次计划</div>
          <div class="file"><span class="ic">XLS</span><span class="nm">双节常温奶满减_批次计划.xlsx<small>总部下发 · 3 个计划 · 2026-10-19 15:32</small></span><button class="btn btn-o btn-xs" type="button" onclick="MT.toast('批次计划已下载')">下载</button></div>
          <div class="note b" style="margin-top:10px">按该表在微信支付后台配置批次。批次号由商户平台生成，回传时须带上表内计划 ID。</div>
        </div>
        <div>
          <div class="st" style="margin-top:0">③ 上传已配置批次</div>
          <div class="drop"><b>点击或拖拽上传已配置批次</b>支持 xlsx / csv，单文件 ≤20MB<span class="sm">须含「批次编码」与「计划 ID」，与下载的批次计划一一对应</span></div>
          <div class="file"><span class="ic">XLS</span><span class="nm">双节常温奶满减_已配置批次_20261021.xlsx<small>3 条批次 · 一一对应校验通过 · 2026-10-21 10:20</small></span><button class="btn btn-o btn-xs">查看</button></div>
          <div class="vres ok"><span class="ic">✓</span><span class="bd"><b>一一对应校验通过</b>3 条计划各有 1 个批次，无重复绑定、无孤儿批次</span></div>

          <div class="st" style="margin-top:18px">④ 上传订单数据</div>
          <div class="drop"><b>点击或拖拽上传订单数据</b>支持 xlsx / csv，单文件 ≤20MB<span class="sm">须含「批次编码」，一条订单只归属一个批次</span></div>
          <div class="file"><span class="ic">XLS</span><span class="nm">双节常温奶满减_订单_20261021.xlsx<small>12,428 条订单 · 3 个批次均已归属 · 2026-10-21 10:25</small></span><button class="btn btn-o btn-xs">查看</button></div>
          <div class="vres ok"><span class="ic">✓</span><span class="bd"><b>批次归属校验通过</b>全部订单都能对上已回传的 3 个批次，无孤儿订单、无重复归属</span></div>
        </div>
      </div>

      <div class="note"><b>服务商可见范围：</b>活动名称与 ID、周期、核销预算（用于配券）、机制附件、计划与批次数据、校验结果。<b>不可见：</b>内部审批意见与审批人、其他服务商的活动、其他 BU 的数据。</div>
    </div>
  </div>
</div>`;
}

/* ---------- 注册模块 ---------- */
MT.definePage({
  id: "v-vendor",
  title: "服务商操作页",
  crumb: "服务商协作 / 服务商操作页",
  group: "服务商协作",
  isNew: true,
  template: tplPagevendor
});

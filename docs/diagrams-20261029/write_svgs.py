# -*- coding: utf-8 -*-
from pathlib import Path

out = Path(__file__).parent

blueprint = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1080" viewBox="0 0 1600 1080">
  <defs>
    <marker id="arr" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto">
      <path d="M0,0 L9,4 L0,8 Z" fill="#2b7e6a"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g font-family="Microsoft YaHei, sans-serif">
    <text x="48" y="52" font-size="36" fill="#075e4c" font-weight="700">应用蓝图</text>
    <text x="48" y="88" font-size="20" fill="#58756e">蒙牛活动管理平台 · 一期能力域与角色协作（不含技术部署）</text>

    <rect x="48" y="120" width="1504" height="108" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="72" y="156" font-size="24" fill="#075e4c" font-weight="700">使用角色</text>
    <rect x="72" y="172" width="340" height="40" rx="8" fill="#fff" stroke="#72a69a"/>
    <text x="90" y="199" font-size="18" fill="#163d37">业务运营 · 创建与执行本人项目</text>
    <rect x="428" y="172" width="300" height="40" rx="8" fill="#fff" stroke="#72a69a"/>
    <text x="446" y="199" font-size="18" fill="#163d37">审批人 · 按 BPM 授权处理</text>
    <rect x="744" y="172" width="280" height="40" rx="8" fill="#fff" stroke="#72a69a"/>
    <text x="762" y="199" font-size="18" fill="#163d37">管理员 · 角色与主数据配置</text>
    <rect x="1040" y="172" width="480" height="40" rx="8" fill="#fff" stroke="#72a69a"/>
    <text x="1058" y="199" font-size="18" fill="#163d37">服务商 · 项目专属入口（无独立账号）</text>

    <path d="M800 228 L800 258" stroke="#2b7e6a" stroke-width="3" marker-end="url(#arr)"/>

    <rect x="48" y="268" width="1504" height="560" rx="14" fill="#fff" stroke="#0b715a" stroke-width="3"/>
    <text x="72" y="308" font-size="26" fill="#075e4c" font-weight="700">蒙牛活动管理平台 · 应用能力</text>

    <rect x="72" y="330" width="350" height="150" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="92" y="368" font-size="22" fill="#075e4c" font-weight="700">1. 项目报批</text>
    <text x="92" y="402" font-size="17" fill="#163d37">项目创建 · 预算与服务商</text>
    <text x="92" y="430" font-size="17" fill="#163d37">提交审批 · BPM 结果回写</text>
    <text x="92" y="458" font-size="17" fill="#163d37">项目管理（六态流转）</text>

    <rect x="442" y="330" width="350" height="150" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="462" y="368" font-size="22" fill="#075e4c" font-weight="700">2. 计划与批次</text>
    <text x="462" y="402" font-size="17" fill="#163d37">计划列表 · 补充批次配置</text>
    <text x="462" y="430" font-size="17" fill="#163d37">券规则 / 零售商 / 商品明细</text>
    <text x="462" y="458" font-size="17" fill="#163d37">一计划一批次一券</text>

    <rect x="812" y="330" width="350" height="150" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="832" y="368" font-size="22" fill="#075e4c" font-weight="700">3. 服务商协作</text>
    <text x="832" y="402" font-size="17" fill="#163d37">推送邮件 · 专属确认页</text>
    <text x="832" y="430" font-size="17" fill="#163d37">下载计划 · 回传批次</text>
    <text x="832" y="458" font-size="17" fill="#163d37">核销 / 账单回传</text>

    <rect x="1182" y="330" width="340" height="150" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="1202" y="368" font-size="22" fill="#075e4c" font-weight="700">4. 投放触达</text>
    <text x="1202" y="402" font-size="17" fill="#163d37">领券小程序对接</text>
    <text x="1202" y="430" font-size="17" fill="#163d37">创建发券任务 · 推送批次</text>
    <text x="1202" y="458" font-size="17" fill="#163d37">对接既有会员小程序</text>

    <rect x="72" y="502" width="350" height="140" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="92" y="540" font-size="22" fill="#075e4c" font-weight="700">5. 主数据沉淀</text>
    <text x="92" y="574" font-size="17" fill="#163d37">门店与商户号（汇总入库）</text>
    <text x="92" y="602" font-size="17" fill="#163d37">商品维护（汇总入库）</text>

    <rect x="442" y="502" width="350" height="140" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="462" y="540" font-size="22" fill="#075e4c" font-weight="700">6. 数据看板</text>
    <text x="462" y="574" font-size="17" fill="#163d37">本人项目查询与回传数据</text>
    <text x="462" y="602" font-size="17" fill="#163d37">按回传金额口径展示</text>

    <rect x="812" y="502" width="350" height="140" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="832" y="540" font-size="22" fill="#075e4c" font-weight="700">7. 系统管理</text>
    <text x="832" y="574" font-size="17" fill="#163d37">角色权限 · 服务商配置</text>
    <text x="832" y="602" font-size="17" fill="#163d37">管理员维护主数据与授权</text>

    <rect x="1182" y="502" width="340" height="140" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="1202" y="540" font-size="22" fill="#075e4c" font-weight="700">8. 系统日志</text>
    <text x="1202" y="574" font-size="17" fill="#163d37">关键操作留痕查询</text>
    <text x="1202" y="602" font-size="17" fill="#163d37">按本人项目范围可见</text>

    <rect x="72" y="662" width="1450" height="140" rx="12" fill="#eaf5f0" stroke="#0b715a" stroke-width="2"/>
    <text x="92" y="700" font-size="22" fill="#075e4c" font-weight="700">核心业务对象</text>
    <text x="92" y="738" font-size="18" fill="#163d37">项目（预算系统 TPM / MEM / 其他） → 计划 → 批次（微信支付券） → 投放任务 → 核销与账单回传</text>
    <text x="92" y="772" font-size="18" fill="#163d37">活动零售商明细 · 活动商品明细 · 门店/商户号 · 商品主数据 · 操作日志</text>

    <rect x="48" y="860" width="1504" height="180" rx="12" fill="#f7f8f8" stroke="#72a69a" stroke-width="2"/>
    <text x="72" y="900" font-size="24" fill="#075e4c" font-weight="700">一期外部依赖（应用视角）</text>
    <rect x="72" y="922" width="340" height="88" rx="10" fill="#fff" stroke="#72a69a"/>
    <text x="90" y="958" font-size="18" fill="#075e4c" font-weight="700">登录</text>
    <text x="90" y="988" font-size="17" fill="#163d37">钉钉（蒙牛内部人员）</text>
    <rect x="432" y="922" width="340" height="88" rx="10" fill="#fff" stroke="#72a69a"/>
    <text x="450" y="958" font-size="18" fill="#075e4c" font-weight="700">审批</text>
    <text x="450" y="988" font-size="17" fill="#163d37">BPM 审批流</text>
    <rect x="792" y="922" width="360" height="88" rx="10" fill="#fff" stroke="#72a69a"/>
    <text x="810" y="958" font-size="18" fill="#075e4c" font-weight="700">财务 / 预算来源</text>
    <text x="810" y="988" font-size="17" fill="#163d37">TPM、MEM（及其他）</text>
    <rect x="1172" y="922" width="350" height="88" rx="10" fill="#fff" stroke="#72a69a"/>
    <text x="1190" y="958" font-size="18" fill="#075e4c" font-weight="700">投放与制券</text>
    <text x="1190" y="988" font-size="17" fill="#163d37">会员小程序 · 制券服务商</text>
  </g>
</svg>
"""

arch = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1120" viewBox="0 0 1600 1120">
  <defs>
    <marker id="a" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto">
      <path d="M0,0 L9,4 L0,8 Z" fill="#2b7e6a"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g font-family="Microsoft YaHei, sans-serif">
    <text x="48" y="52" font-size="36" fill="#075e4c" font-weight="700">系统架构图</text>
    <text x="48" y="88" font-size="20" fill="#58756e">一期逻辑架构及外部系统边界（登录 / 审批 / 预算来源已明确）</text>

    <rect x="48" y="118" width="1504" height="118" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="72" y="156" font-size="24" fill="#075e4c" font-weight="700">访问角色与数据边界</text>
    <text x="72" y="190" font-size="18" fill="#163d37">业务运营：仅本人创建项目相关数据　｜　审批人：按 BPM 授权处理　｜　管理员：按授权管理</text>
    <text x="72" y="218" font-size="18" fill="#163d37">服务商：通过项目专属授权入口访问，不接入组织架构，不配置独立服务商账号</text>

    <path d="M800 236 L800 268" stroke="#2b7e6a" stroke-width="3" marker-end="url(#a)"/>

    <rect x="48" y="278" width="330" height="300" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="68" y="318" font-size="24" fill="#075e4c" font-weight="700">客户现有系统</text>
    <rect x="68" y="338" width="290" height="52" rx="8" fill="#fff" stroke="#0b715a" stroke-width="2"/>
    <text x="84" y="370" font-size="17" fill="#163d37">钉钉登录（蒙牛内部人员）</text>
    <rect x="68" y="402" width="290" height="52" rx="8" fill="#fff" stroke="#0b715a" stroke-width="2"/>
    <text x="84" y="434" font-size="17" fill="#163d37">BPM 审批流</text>
    <rect x="68" y="466" width="290" height="52" rx="8" fill="#fff" stroke="#0b715a" stroke-width="2"/>
    <text x="84" y="498" font-size="17" fill="#163d37">财务预算：TPM / MEM</text>
    <rect x="68" y="530" width="290" height="32" rx="6" fill="#eaf5f0" stroke="#72a69a"/>
    <text x="84" y="552" font-size="15" fill="#58756e">通知接口 · 微信公共发券能力</text>

    <path d="M380 420 L418 420" stroke="#2b7e6a" stroke-width="3" marker-end="url(#a)"/>

    <rect x="428" y="278" width="744" height="520" rx="14" fill="#fff" stroke="#0b715a" stroke-width="3"/>
    <text x="452" y="318" font-size="26" fill="#075e4c" font-weight="700">蒙牛活动管理平台</text>

    <rect x="452" y="340" width="340" height="110" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="472" y="376" font-size="20" fill="#075e4c" font-weight="700">管理端</text>
    <text x="472" y="408" font-size="16" fill="#163d37">项目创建、BPM 审批结果、管理</text>
    <text x="472" y="434" font-size="16" fill="#163d37">计划与批次配置</text>

    <rect x="812" y="340" width="336" height="110" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="832" y="376" font-size="20" fill="#075e4c" font-weight="700">服务商专属操作页</text>
    <text x="832" y="408" font-size="16" fill="#163d37">确认、下载计划与回传</text>
    <text x="832" y="434" font-size="16" fill="#163d37">按项目与批次校验归属</text>

    <rect x="452" y="468" width="340" height="110" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="472" y="504" font-size="20" fill="#075e4c" font-weight="700">投放与数据查询</text>
    <text x="472" y="536" font-size="16" fill="#163d37">既有小程序投放任务</text>
    <text x="472" y="562" font-size="16" fill="#163d37">本人项目看板与查询</text>

    <rect x="812" y="468" width="336" height="110" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="832" y="504" font-size="20" fill="#075e4c" font-weight="700">配置与留痕</text>
    <text x="832" y="536" font-size="16" fill="#163d37">角色与服务商配置</text>
    <text x="832" y="562" font-size="16" fill="#163d37">系统日志与项目权限</text>

    <rect x="452" y="596" width="696" height="78" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="472" y="628" font-size="20" fill="#075e4c" font-weight="700">计划明细入库</text>
    <text x="472" y="656" font-size="16" fill="#163d37">活动零售商明细 → 门店与商户号　｜　活动商品明细 → 商品数据</text>

    <rect x="452" y="690" width="696" height="84" rx="12" fill="#eaf5f0" stroke="#0b715a" stroke-width="2"/>
    <text x="472" y="724" font-size="20" fill="#075e4c" font-weight="700">业务数据与执行记录</text>
    <text x="472" y="754" font-size="16" fill="#163d37">项目、计划、批次、台账、投放、回传结果及日志 · 预算来源 TPM/MEM</text>

    <path d="M1174 410 L1210 410" stroke="#2b7e6a" stroke-width="3" marker-end="url(#a)"/>
    <rect x="1220" y="278" width="332" height="190" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="1240" y="316" font-size="22" fill="#075e4c" font-weight="700">既有会员小程序</text>
    <text x="1240" y="352" font-size="16" fill="#163d37">平台提供开放 API</text>
    <text x="1240" y="380" font-size="16" fill="#163d37">鉴权、批次查询、发券</text>
    <text x="1240" y="408" font-size="16" fill="#163d37">批次信息及核销事件推送</text>
    <text x="1240" y="436" font-size="16" fill="#163d37">消费者页面由其承接</text>

    <path d="M1210 620 L1174 620" stroke="#2b7e6a" stroke-width="3" marker-end="url(#a)"/>
    <rect x="1220" y="492" width="332" height="220" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="1240" y="530" font-size="22" fill="#075e4c" font-weight="700">制券服务商</text>
    <text x="1240" y="566" font-size="16" fill="#163d37">确认接收、计划批次回传</text>
    <text x="1240" y="594" font-size="16" fill="#163d37">核销、执行情况、账单回传</text>
    <text x="1240" y="622" font-size="16" fill="#163d37">在微信侧创建券批次</text>
    <text x="1240" y="650" font-size="16" fill="#163d37">回传字段按接口契约</text>
    <text x="1240" y="678" font-size="16" fill="#163d37">无独立服务商系统账号</text>

    <rect x="48" y="600" width="330" height="198" rx="12" fill="#f7f8f8" stroke="#72a69a" stroke-width="2"/>
    <text x="68" y="638" font-size="22" fill="#075e4c" font-weight="700">边界说明</text>
    <text x="68" y="674" font-size="16" fill="#163d37">预算来源对接 TPM、MEM</text>
    <text x="68" y="702" font-size="16" fill="#163d37">审批统一走 BPM</text>
    <text x="68" y="730" font-size="16" fill="#163d37">不增加组织架构接入</text>
    <text x="68" y="758" font-size="16" fill="#163d37">不从门店/商品库选择</text>
    <text x="68" y="786" font-size="16" fill="#163d37">不新增资金划付能力</text>

    <path d="M800 798 L800 830" stroke="#2b7e6a" stroke-width="3" marker-end="url(#a)"/>

    <rect x="48" y="840" width="1504" height="120" rx="12" fill="#f2f8f5" stroke="#72a69a" stroke-width="2"/>
    <text x="72" y="880" font-size="22" fill="#075e4c" font-weight="700">后台任务与数据处理</text>
    <text x="72" y="914" font-size="17" fill="#163d37">BPM / 预算状态同步、指标计算与报表、台账更新与对账、账单入库检查、通知与运行维护</text>
    <text x="72" y="942" font-size="17" fill="#163d37">按有效业务数据与本期接口约定处理；看板具体指标与计算口径不在本期文档中固定</text>

    <rect x="48" y="990" width="1504" height="100" rx="12" fill="#eaf5f0" stroke="#0b715a" stroke-width="2"/>
    <text x="72" y="1030" font-size="22" fill="#075e4c" font-weight="700">关键集成约定</text>
    <text x="72" y="1064" font-size="18" fill="#163d37">登录 = 钉钉（蒙牛内部）　｜　审批 = BPM　｜　财务预算来源 = TPM、MEM　｜　投放 = 既有会员小程序　｜　制券 = 服务商 + 微信支付</text>
  </g>
</svg>
"""

(out / "应用蓝图.svg").write_text(blueprint, encoding="utf-8")
(out / "系统架构图.svg").write_text(arch, encoding="utf-8")
print("ok", (out / "应用蓝图.svg").stat().st_size, (out / "系统架构图.svg").stat().st_size)

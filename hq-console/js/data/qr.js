/* =============================================================================
 * data/qr.js — 页面二维码数据（一页多渠道多码）
 * 对应待确认清单标黄项 16：一个活动多分发渠道生成多个二维码，
 * 用于分渠道统计发券量。channels 与 components/qr-drawer.js 的 QR_CHANNELS 对齐。
 * 记录结构：
 *   codes[] = { ch 渠道码, chName 渠道名, no 两位序号, link 跳转链接,
 *               seed 图案种子, scan 扫码量, got 领券量, used 核销量 }
 * ========================================================================== */

var QRDATA = {
  r1: {
    name: '双节主推页（常温奶）',
    proj: '双节常温奶满减 · <span class="sx-mono">MN-WX-202612-0041</span>',
    period: '2026-12-20 ~ 2027-01-05',
    link: 'mn-act.cn/h5/g/7f3a2c',
    status: '启用中', cls: 'tg-g',
    codes: [
      { ch:'OFF', chName:'线下物料', no:'01', link:'mn-act.cn/h5/g/7f3a2c?ch=off1', seed:7,  scan:4820, got:3120, used:1682 },
      { ch:'OFF', chName:'线下物料', no:'02', link:'mn-act.cn/h5/g/7f3a2c?ch=off2', seed:71, scan:1264, got:812,  used:401  },
      { ch:'MP',  chName:'公众号',   no:'01', link:'mn-act.cn/h5/g/7f3a2c?ch=mp1',  seed:23, scan:2210, got:1508, used:736  },
      { ch:'PRI', chName:'私域',     no:'01', link:'mn-act.cn/h5/g/7f3a2c?ch=pri1', seed:41, scan:1685, got:1180, used:604  }
    ]
  },
  r2: {
    name: '高端礼盒页（满 129）',
    proj: '双节常温奶满减 · <span class="sx-mono">MN-WX-202612-0041</span>',
    period: '2026-12-20 ~ 2027-01-05',
    link: 'mn-act.cn/h5/g/2b9d81',
    status: '启用中', cls: 'tg-g',
    codes: [
      { ch:'OFF', chName:'线下物料', no:'01', link:'mn-act.cn/h5/g/2b9d81?ch=off1', seed:11, scan:1980, got:1120, used:505 },
      { ch:'PRI', chName:'私域',     no:'01', link:'mn-act.cn/h5/g/2b9d81?ch=pri1', seed:53, scan:930,  got:612,  used:288 }
    ]
  },
  r3: {
    name: '元旦补发页（草稿）',
    proj: '双节常温奶满减 · <span class="sx-mono">MN-WX-202612-0041</span>',
    period: '2026-12-30 ~ 2027-01-05',
    link: '',
    status: '草稿', cls: 'tg-n',
    codes: []
  }
};

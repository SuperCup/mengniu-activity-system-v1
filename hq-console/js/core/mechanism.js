/* =============================================================================
 * core/mechanism.js — 机制口径（满减 / 减至）
 *   一个计划 = 一个批次 = 一张券；机制类型 + 具体参数统一生成展示文案。
 *   一期只保留两种：满 99 减 15、减至 1 元（1 元乐享 / 0.1 元尝鲜）。
 * ========================================================================== */

var MECH_TYPES = ['满减', '减至'];

function mechTypeOf(o){
  var t = (o && o.mechType) || '满减';
  return MECH_TYPES.indexOf(t) >= 0 ? t : '满减';
}

/** 生成机制文案：满 99 减 15 / 减至 1 元 / 满 59 元减至 0.1 元 */
function mechText(o){
  var t = mechTypeOf(o);
  var thr = Number(o && o.thr) || 0;
  var face = Number(o && o.face) || 0;
  if(t === '减至') return (thr > 0 ? '满 ' + thr + ' 元' : '') + '减至 ' + face + ' 元';
  return '满 ' + (thr || 0) + ' 减 ' + (face || 0);
}

/** 机制校验：返回错误文案，空串表示通过 */
function mechCheck(o){
  var t = mechTypeOf(o);
  var thr = Number(o && o.thr);
  var face = Number(o && o.face);
  if(t === '减至'){
    if(!(face > 0)) return '减至价需大于 0';
    if(thr > 0 && face >= thr) return '减至价需低于门槛';
    return '';
  }
  if(!(thr > 0)) return '满减门槛需大于 0';
  if(!(face > 0)) return '满减金额需大于 0';
  if(face >= thr) return '满减金额需小于门槛';
  return '';
}

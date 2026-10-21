
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* mnDate 助手 */
let f=fs.readFileSync(R+'js/core/format.js','utf8');
if(f.indexOf('function mnDate')<0){
  f=f.replace('/* ---------- 轻提示 ---------- */', '');
  f += '\n\n/** 统一日期展示：始终输出 年-月-日（YYYY-MM-DD），兼容带时间的字符串 */\nfunction mnDate(v){\n  if(v == null || v === \'\') return \'\';\n  var s = String(v).trim().replace(/[\\/.]/g, \'-\').replace(/年|月/g, \'-\').replace(/日/g, \'\');\n  var m = /^(\\d{4})-(\\d{1,2})-(\\d{1,2})/.exec(s);\n  if(!m) return String(v);\n  var mm = (\'0\' + m[2]).slice(-2), dd = (\'0\' + m[3]).slice(-2);\n  return m[1] + \'-\' + mm + \'-\' + dd;\n}\n';
  fs.writeFileSync(R+'js/core/format.js', f, 'utf8');
  console.log('ok mnDate');
}

/* 领券页有效期：源码里是中文字符串，直接按行替换 */
let c=fs.readFileSync(R+'js/pages/coupon-page.js','utf8');
const lines=c.split('\n');
let done=false;
for(let i=0;i<lines.length;i++){
  if(lines[i].indexOf("exp:(p.bs?p.bs.slice(5)")>=0){
    lines[i]="      exp:(p.bs?mnDate(p.bs):'')+' 至 '+(p.be?mnDate(p.be):'')+' 有效',";
    done=true;
    break;
  }
}
if(done){ fs.writeFileSync(R+'js/pages/coupon-page.js', lines.join('\n'), 'utf8'); }
console.log('ok coupon date: '+done);

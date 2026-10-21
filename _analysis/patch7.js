
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
fs.copyFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/qr.data.src.js', R+'js/data/qr.js');

let c=fs.readFileSync(R+'js/pages/coupon-page.js','utf8');
c=c.replace('<td style="font-size:11.8px">线下 / 公众号</td>',
  '<td style="font-size:11.8px"><span class="tg tg-n xs">线下物料</span> <span class="tg tg-n xs">公众号</span> <span class="tg tg-n xs">私域</span></td>');
c=c.replace('<td style="font-size:11.8px">导购私域</td>',
  '<td style="font-size:11.8px"><span class="tg tg-n xs">线下物料</span> <span class="tg tg-n xs">私域</span></td>');
const qrCell = function(key, ico){
  return '<td style="white-space:nowrap;font-size:11.6px">'
    + '<a class="lnk" onclick="openQr(\'' + key + '\',\'OFF\')">物料</a> '
    + '<a class="lnk" onclick="openQr(\'' + key + '\',\'MP\')">公众号</a> '
    + '<a class="lnk" onclick="openQr(\'' + key + '\',\'PRI\')">私域</a></td>';
};
c=c.replace('<td><button class="btn btn-o btn-xs" style="white-space:nowrap" onclick="openQr(\'r1\')">查看码</button></td>', qrCell('r1'));
c=c.replace('<td><button class="btn btn-o btn-xs" style="white-space:nowrap" onclick="openQr(\'r2\')">查看码</button></td>', qrCell('r2'));
c=c.replace('<td><span class="muted" style="font-size:11.6px;white-space:nowrap" title="草稿未生成链接，启用后自动生成">未生成</span></td>',
  '<td><span class="muted" style="font-size:11.6px;white-space:nowrap" title="草稿未生成链接，启用后按渠道分别生成二维码">未生成</span></td>');
fs.writeFileSync(R+'js/pages/coupon-page.js', c, 'utf8');

let q=fs.readFileSync(R+'js/components/qr-drawer.js','utf8');
q=q.replace("  var chans = d.chan && d.chan.length ? d.chan : ['线下物料'];",
  "  var chans = d.chan ? (Array.isArray(d.chan) ? d.chan : String(d.chan).split('/')) : ['线下物料'];\n"
+ "  chans = chans.map(function(x){ return String(x).trim(); }).filter(Boolean);\n"
+ "  if(!chans.length) chans = ['线下物料'];");
fs.writeFileSync(R+'js/components/qr-drawer.js', q, 'utf8');
console.log('patched qr + coupon');

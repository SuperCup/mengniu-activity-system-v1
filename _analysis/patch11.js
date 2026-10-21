
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 1) 删除已废弃的多选浮层组件（标黄项 10/11 改为导入后不再使用） */
try{ fs.unlinkSync(R+'js/components/picker.js'); console.log('deleted picker.js'); }catch(e){ console.log('picker.js: '+e.code); }
let h=fs.readFileSync(R+'index.html','utf8');
h=h.replace('<!-- 组件：可复用业务部件（模板 + 逻辑同文件） -->\n<script src="js/components/picker.js"></script>\n', '<!-- 组件：可复用业务部件（模板 + 逻辑同文件） -->\n');
h=h.replace('<script src="js/components/picker.js"></script>\n', '');
fs.writeFileSync(R+'index.html', h, 'utf8');

/* 2) 收掉最后一处硬编码色值 */
let c=fs.readFileSync(R+'css/pages/coupon.css','utf8');
c=c.replace('.phone .cp .btn2.off{background:#C9D3D0;color:#fff}', '.phone .cp .btn2.off{background:var(--ink-20);color:#fff}');
c=c.replace('.phone .cp .btn2.off{background:#C9D3D0;color:#ffffff}', '.phone .cp .btn2.off{background:var(--ink-20);color:#fff}');
fs.writeFileSync(R+'css/pages/coupon.css', c, 'utf8');
console.log('picker refs left:', (fs.readFileSync(R+'index.html','utf8').match(/picker/g)||[]).length);
console.log('hex left:', (fs.readFileSync(R+'css/pages/coupon.css','utf8').match(/#[0-9A-Fa-f]{6}/g)||[]).length);

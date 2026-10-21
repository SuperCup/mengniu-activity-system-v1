
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
let c=fs.readFileSync(R+'js/pages/coupon-page.js','utf8');
const before=(c.match(/导购私域/g)||[]).length;
c=c.split('>导购私域<').join('>私域<');
fs.writeFileSync(R+'js/pages/coupon-page.js',c,'utf8');
console.log('导购私域 occurrences before:', before, 'after:', (c.match(/导购私域/g)||[]).length);
try{ fs.unlinkSync(R+'_probe.html'); console.log('probe removed'); }catch(e){}

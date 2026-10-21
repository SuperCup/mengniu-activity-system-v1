const fs=require('fs');
const h=fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/shots/v-create.dom.html','utf8');
const i=h.indexOf('id="briefBody"');
const j=h.indexOf('</tbody>', i);
const seg=h.slice(i, j);
const rows=seg.split('<tr>').slice(1);
console.log('行数:', rows.length);
rows.forEach(function(r,k){
  console.log('第'+(k+1)+'行: ' + r.replace(/<input[^>]*value="([^"]*)"[^>]*>/g, '[$1]').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
});

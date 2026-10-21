const fs=require('fs');
const h=fs.readFileSync('D:/Project/蒙牛-原型-ds-harness/_analysis/shots/p-detail3.html','utf8');
const i=h.indexOf('id="projDwBody"');
const seg=h.slice(i, h.indexOf('<div class="dw-f">', i));
const k=seg.indexOf('计划概况');
const tbl=seg.slice(k, seg.indexOf('</table>', k));
console.log('标题:', /<h5>([\s\S]*?)<\/h5>/.exec(tbl)[1].replace(/<[^>]+>/g,''));
const rows=tbl.split('<tr>').slice(1);
rows.forEach(function(r,n){ console.log('行'+(n+1)+': '+r.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()); });

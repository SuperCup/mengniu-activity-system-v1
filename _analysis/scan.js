
const fs=require('fs');
const dir='D:/Project/蒙牛-原型-ds-harness/_analysis/shots/';
['v-home','v-create','v-approve','v-manage','v-plan','v-h5','v-board','v-admin','v-vendor'].forEach(function(v){
  let s=fs.readFileSync(dir+v+'.dom.html','utf8');
  s=s.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'');
  const re=/(?<![0-9-])(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(?![0-9-])/g;
  const hits=[]; let m;
  while((m=re.exec(s))!==null){
    const ctx=s.slice(Math.max(0,m.index-70), m.index+30).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
    hits.push(ctx);
  }
  console.log(v+': '+hits.length+(hits.length?(' -> '+hits.slice(0,2).join(' /// ')):''));
});

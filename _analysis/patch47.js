
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';

/* 按行替换：把 marker 所在整行换成文件里的内容 */
function replaceLine(file, marker, txtFile){
  let s=fs.readFileSync(file,'utf8');
  if(s.indexOf('计划概况')>=0){ console.log(file+' 已有标签'); return; }
  const i=s.indexOf(marker);
  if(i<0){ console.log('!! marker 未找到: '+marker); return; }
  const lineStart=s.lastIndexOf('\n', i)+1;
  let lineEnd=s.indexOf('\n', i);
  if(lineEnd<0) lineEnd=s.length;
  const neu=fs.readFileSync(txtFile,'utf8');
  s=s.slice(0,lineStart)+neu+s.slice(lineEnd);
  fs.writeFileSync(file,s,'utf8');
  console.log('ok: '+file);
}

replaceLine(R+'js/pages/project-manage.js',  "pnEsc(p.source) + '</span>';", A+'tag-manage.txt');
replaceLine(R+'js/pages/project-approve.js', "pnEsc(p.platform) + '</span></div></div>'", A+'tag-approve.txt');

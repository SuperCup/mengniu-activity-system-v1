
const fs=require('fs'), path=require('path');
const src='D:/Project/蒙牛/一期/蒙牛活动管理平台_一期总部端UI_V5.html';
const outDir='D:/Project/蒙牛-原型-ds-harness/_analysis/blocks';
fs.mkdirSync(outDir,{recursive:true});
let s=fs.readFileSync(src,'utf8');
// 1. cleanup exported-design noise
s=s.replace(/ data-page-node-id="[^"]*"/g,'')
   .replace(/<style id="__dm_no_drag_style__">[\s\S]*?<\/style>/g,'')
   .replace(/<style id="__dm_bindable_badge_style__">[\s\S]*?<\/style>/g,'')
   .replace(/ style=""/g,'');
const scriptIdx=s.indexOf('<script');
const styleEnd=s.indexOf('</style>', s.indexOf('<body')) ;
const bodyStart=s.indexOf('<body');
const body=s.slice(bodyStart, scriptIdx);

function findBlock(idAttr){
  const re=new RegExp('<div[^>]*id="'+idAttr+'"[^>]*>');
  const m=re.exec(body);
  if(!m) return null;
  const start=m.index;
  // walk divs
  const tagRe=/<div\b[^>]*>|<\/div>/g;
  tagRe.lastIndex=start;
  let depth=0, t, end=-1;
  while((t=tagRe.exec(body))){
    if(t[0]==='</div>') depth--; else depth++;
    if(depth===0){ end=t.index+t[0].length; break; }
  }
  return {start, end, html:body.slice(start,end)};
}
const ids=['v-home','v-create','v-approve','v-manage','v-plan','v-h5','v-board','v-admin','v-vendor',
  'dw-qr','dw-plannew','dw-pgdata','dw-flow','dw-imp','dw-vs','dw-page','dw-edit','dw-pdetail','dw-plan','pkLayer','mask'];
const report=[];
for(const id of ids){
  const b=findBlock(id);
  if(!b){ report.push(id+' : NOT FOUND'); continue; }
  fs.writeFileSync(path.join(outDir,id+'.html'), b.html, 'utf8');
  report.push(id+' : '+b.html.length+' chars, lines='+b.html.split('\n').length);
}
// leftover markup outside blocks (shell: topbar/crumb/hintbar/wrap open/close)
console.log(report.join('\n'));
// also dump the shell region
const firstView=body.indexOf('<div class="view"');
fs.writeFileSync(path.join(outDir,'_shell_before.html'), body.slice(0, firstView), 'utf8');
fs.writeFileSync(path.join(outDir,'_shell_after_tail.html'), body.slice(body.lastIndexOf('</div>')+6), 'utf8');
console.log('shell head len', firstView, 'tail len', body.length-(body.lastIndexOf('</div>')+6));

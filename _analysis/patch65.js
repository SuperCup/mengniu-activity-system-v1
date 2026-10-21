
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';
const A='D:/Project/蒙牛-原型-ds-harness/_analysis/';
const P=R+'js/components/import-drawer.js';
let s=fs.readFileSync(P,'utf8');

function swap(startMark, endMark, file){
  const a=s.indexOf(startMark), b=s.indexOf(endMark);
  if(a<0||b<0) throw new Error('anchor '+startMark.slice(0,30)+' '+a+' '+b);
  s=s.slice(0,a)+fs.readFileSync(A+file,'utf8')+'\n'+s.slice(b);
}
swap('function impParse(text){', '/* ---------- 渲染预览 ---------- */', 'imp-parse.js');
swap('function impOk(){', '/* ---------- 模板：dw-imp ---------- */', 'imp-ok.js');

/* 记录「从计划抽屉进入」，导入/取消后返回 */
s=s.replace('function openImp(type){\n  IMP.type = IMP_SCHEMA[type] ? type : \'ret\';',
  'function openImp(type){\n  IMP.fromPlan = !!document.querySelector(\'#dw-plannew.on\');\n  IMP.type = IMP_SCHEMA[type] ? type : \'ret\';');

/* 取消按钮改为带返回上下文 */
s=s.split('onclick="closeDrawer()">取消</button>').join('onclick="impCancel()">取消</button>');

fs.writeFileSync(P,s,'utf8');
console.log('import drawer patched');

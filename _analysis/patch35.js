
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 工作台待办渲染 */
let a=fs.readFileSync(R+'js/app.js','utf8');
if(a.indexOf('renderTodos')<0){
  a=a.replace("    safe(window.renderVendors,      'renderVendors');",
    "    safe(window.renderTodos,        'renderTodos');\n    safe(window.renderVendors,      'renderVendors');");
  fs.writeFileSync(R+'js/app.js',a,'utf8');
}

/* 项目列表：支持从工作台带状态进入 */
let m=fs.readFileSync(R+'js/pages/project-manage.js','utf8');
if(m.indexOf('gotoProjState')<0){
  m=m.replace("function projState(k){",
    "function gotoProjState(k){\n  PROJ_FILTER = k || '';\n  PROJ_PAGE = 1;\n  renderProjCards();\n  go('v-manage');\n}\n\nfunction projState(k){");
  fs.writeFileSync(R+'js/pages/project-manage.js',m,'utf8');
}
console.log('home wired');

const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* 审批卡片：加一个计划概况数量标签（不含预算与规则，审批人可据此判断体量） */
let a=fs.readFileSync(R+'js/pages/project-approve.js','utf8');
if(a.indexOf('计划概况')<0){
  a=a.replace("    +   '<div class=\"tags\"><span class=\"tg tg-n\">' + pnEsc(p.source) + '</span>'
"
            + "    +   '<span class=\"tg tg-n\">' + pnEsc(p.platform) + '</span></div></div>'",
    "    +   '<div class=\"tags\"><span class=\"tg tg-n\">' + pnEsc(p.source) + '</span>'
"
  + "    +   '<span class=\"tg tg-n\">' + pnEsc(p.platform) + '</span>'
"
  + "    +   ((p.planBrief && p.planBrief.length) ? '<span class=\"tg tg-a\">计划概况 ' + p.planBrief.length + ' 个</span>' : '') + '</div></div>'");
  fs.writeFileSync(R+'js/pages/project-approve.js',a,'utf8');
  console.log('approve tag added:', a.indexOf('计划概况')>0);
}

/* 项目列表卡片：同样给一个计划概况数量标签 */
let m=fs.readFileSync(R+'js/pages/project-manage.js','utf8');
if(m.indexOf('计划概况')<0){
  m=m.replace("  var tags = '<span class=\"tg tg-n\">' + pnEsc(p.platform) + '</span>'
"
            + "           + '<span class=\"tg tg-n\">' + pnEsc(p.source) + '</span>';",
    "  var tags = '<span class=\"tg tg-n\">' + pnEsc(p.platform) + '</span>'
"
  + "           + '<span class=\"tg tg-n\">' + pnEsc(p.source) + '</span>'
"
  + "           + ((p.planBrief && p.planBrief.length) ? '<span class=\"tg tg-a\">计划概况 ' + p.planBrief.length + ' 个</span>' : '');");
  fs.writeFileSync(R+'js/pages/project-manage.js',m,'utf8');
  console.log('manage tag added:', m.indexOf('计划概况')>0);
}

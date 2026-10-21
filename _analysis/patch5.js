
const fs=require('fs');
const R='D:/Project/蒙牛-原型-ds-harness/hq-console/';

/* ---- router.js：给侧边栏加真实图标 ---- */
let r=fs.readFileSync(R+'js/core/router.js','utf8');
if(r.indexOf('MT.ICONS')<0){
  r=r.replace(
    "        + '<span class=\"ic\"></span>' + p.title",
    "        + '<span class=\"ic\">' + (MT.ICONS[p.id] || '') + '</span>' + p.title");
  const icons = "\n/* ---------- 侧边栏图标：统一 16px 线性图标，继承当前文字色 ---------- */\n"
   + "MT.ICONS = {\n"
   + "  'v-home': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.2\" y=\"2.2\" width=\"5\" height=\"5\" rx=\"1\"/><rect x=\"8.8\" y=\"2.2\" width=\"5\" height=\"5\" rx=\"1\"/><rect x=\"2.2\" y=\"8.8\" width=\"5\" height=\"5\" rx=\"1\"/><rect x=\"8.8\" y=\"8.8\" width=\"5\" height=\"5\" rx=\"1\"/></svg>',\n"
   + "  'v-create': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 2.2H4.4a1.2 1.2 0 0 0-1.2 1.2v9.2a1.2 1.2 0 0 0 1.2 1.2h7.2a1.2 1.2 0 0 0 1.2-1.2V6\"/><path d=\"M11.6 1.8v4h4\"/><path d=\"M8 8.4v3.2M6.4 10h3.2\"/></svg>',\n"
   + "  'v-approve': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"8\" cy=\"8\" r=\"5.8\"/><path d=\"m5.2 8.1 2 2 3.6-3.9\"/></svg>',\n"
   + "  'v-manage': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.2 5.6a1.2 1.2 0 0 1 1.2-1.2h3l1.3 1.6h4.9a1.2 1.2 0 0 1 1.2 1.2v5.4a1.2 1.2 0 0 1-1.2 1.2H3.4a1.2 1.2 0 0 1-1.2-1.2z\"/></svg>',\n"
   + "  'v-plan': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m8 1.9 5.4 2.6L8 7.1 2.6 4.5z\"/><path d=\"m2.6 8 5.4 2.6L13.4 8\"/><path d=\"m2.6 11.5 5.4 2.6 5.4-2.6\"/></svg>',\n"
   + "  'v-h5': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4.2\" y=\"1.8\" width=\"7.6\" height=\"12.4\" rx=\"1.6\"/><path d=\"M6.8 3.6h2.4\"/><path d=\"M7 11.4h2\"/></svg>',\n"
   + "  'v-board': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.4 13.6V2.6\"/><path d=\"M2.4 13.6h11.2\"/><rect x=\"4.6\" y=\"8.4\" width=\"2.2\" height=\"3.4\" rx=\"0.6\"/><rect x=\"8.4\" y=\"5.4\" width=\"2.2\" height=\"6.4\" rx=\"0.6\"/><rect x=\"11.4\" y=\"9.8\" width=\"0\" height=\"0\"/></svg>',\n"
   + "  'v-admin': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"8\" cy=\"8\" r=\"2.1\"/><path d=\"M12.9 9.6a1 1 0 0 0 .2 1.1l.1.1a1.2 1.2 0 1 1-1.7 1.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9v.2a1.2 1.2 0 1 1-2.4 0v-.1a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1.2 1.2 0 1 1-1.7-1.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H2.9a1.2 1.2 0 1 1 0-2.4h.1a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1.2 1.2 0 1 1 1.7-1.7l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V2.9a1.2 1.2 0 1 1 2.4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.2 1.2 0 1 1 1.7 1.7l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6h.2a1.2 1.2 0 1 1 0 2.4h-.1a1 1 0 0 0-.9.6z\"/></svg>',\n"
   + "  'v-vendor': '<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"1.8\" y=\"3\" width=\"12.4\" height=\"8.2\" rx=\"1.2\"/><path d=\"M5.6 13.6h4.8\"/><path d=\"M8 11.2v2.4\"/></svg>'\n"
   + "};\n";
  r += icons;
  fs.writeFileSync(R+'js/core/router.js', r, 'utf8');
  console.log('router icons added');
}

/* ---- layout.css：图标承载样式 ---- */
let c=fs.readFileSync(R+'css/layout.css','utf8');
if(c.indexOf('/* nav icons */')<0){
  c += "\n/* nav icons */\n"
    + ".sider a.item .ic{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:9px;flex:0 0 16px;opacity:.82}\n"
    + ".sider a.item .ic svg{width:16px;height:16px;display:block}\n"
    + ".sider a.item:hover .ic{opacity:1}\n"
    + ".sider a.item.on .ic{opacity:1;color:var(--brand)}\n";
  fs.writeFileSync(R+'css/layout.css', c, 'utf8');
  console.log('icon css added');
}

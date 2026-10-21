
const fs=require('fs');
const C='D:/Project/蒙牛-原型-ds-harness/hq-console/css/components.css';
let c=fs.readFileSync(C,'utf8');
c=c.replace('.pcard-f{display:flex;justify-content:flex-end;',
            '.pcard-f{display:flex;justify-content:space-between;align-items:center;');
fs.writeFileSync(C,c,'utf8');

const P='D:/Project/蒙牛-原型-ds-harness/hq-console/css/pages/project.css';
let p=fs.readFileSync(P,'utf8');
p=p.replace('.acts .noa{font-size:11.6px;color:var(--ink4)}','');
fs.writeFileSync(P,p,'utf8');
console.log('css tuned');

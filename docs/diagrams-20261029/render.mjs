import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const dir = path.resolve('D:/Project/蒙牛-原型-ds-harness/docs/diagrams-20261029');
const files = [
  {svg: '应用蓝图.svg', png: '应用蓝图.png', w: 1600, h: 1080},
  {svg: '系统架构图.svg', png: '系统架构图.png', w: 1680, h: 1080},
  {svg: '业务流程图.svg', png: '业务流程图.png', w: 2200, h: 1680},
];

const browser = await chromium.launch({headless: true, channel: 'msedge'});
for (const f of files) {
  const page = await browser.newPage({
    viewport: {width: f.w, height: f.h},
    deviceScaleFactor: 2,
  });
  await page.goto(pathToFileURL(path.join(dir, f.svg)).href);
  await page.waitForTimeout(200);
  await page.screenshot({
    path: path.join(dir, f.png),
    fullPage: false,
    animations: 'disabled',
  });
  console.log('wrote', f.png);
  await page.close();
}
await browser.close();

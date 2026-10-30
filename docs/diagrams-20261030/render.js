const path = require('node:path');
const { chromium } = require('D:/Project/蒙牛-原型-ds-harness/docs/diagrams-20261029/node_modules/playwright');

const files = [
  { html: '全景图.html', png: '全景图.png', height: 1200 },
  { html: '业务流程图.html', png: '业务流程图.png', height: 900 },
  { html: '系统架构图.html', png: '系统架构图.png', height: 780 },
];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const f of files) {
    const page = await browser.newPage({ viewport: { width: 1880, height: f.height }, deviceScaleFactor: 2 });
    await page.goto('file:///' + path.join(__dirname, f.html));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(__dirname, f.png), fullPage: true, animations: 'disabled' });
    console.log('wrote', f.png, await page.evaluate(() => document.body.scrollHeight));
    await page.close();
  }
  await browser.close();
})();

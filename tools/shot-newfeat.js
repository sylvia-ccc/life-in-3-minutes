/* 给本轮新增的两个交互拍截图，用于交接包
   用法：node tools/shot-newfeat.js */
const { launch } = require('./pw');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'shots');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await page.waitForTimeout(700);

  await page.click('#btnStart');
  await page.waitForTimeout(600);
  await page.click('#btnBegin');
  await page.waitForTimeout(1600);

  // R 键确认框
  await page.keyboard.press('r');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, '11-confirm.png') });
  await page.click('#cfNo');
  await page.waitForTimeout(300);

  // 跑到结局
  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp="12"]'); if (b) b.click(); });
  let g = 0;
  while (g++ < 150) {
    await page.waitForTimeout(260);
    const st = await page.evaluate(() => ({
      end: document.getElementById('scrEnd').classList.contains('active'),
      choice: document.getElementById('ovChoice').classList.contains('show'),
    }));
    if (st.choice) { await page.click('#ckOpts .opt').catch(() => {}); await page.waitForTimeout(100); }
    if (st.end) break;
  }
  await page.waitForTimeout(600);

  // 结局页顶部
  await page.screenshot({ path: path.join(OUT, '12-end-top.png') });

  // 滚到底部，「回到顶部」按钮出现
  await page.evaluate(() => { document.getElementById('scrEnd').scrollTop = 99999; });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, '13-end-bottom.png') });

  console.log('errors:', errs.length ? errs.join('\n') : 'none');
  await browser.close();
})().catch(e => { console.error('失败:', e); process.exit(1); });

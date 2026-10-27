/* 校验单文件版本可独立运行 */
const { launch } = require('./pw');
const path = require('path');

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + path.join(__dirname, '..', 'dist', 'life-in-3-minutes.html'));
  await page.waitForTimeout(600);
  const meta = await page.evaluate(() => document.getElementById('metaStrip').textContent);
  await page.screenshot({ path: 'shots/d1-start.png' });
  await page.click('#btnStart');
  await page.waitForTimeout(500);
  await page.click('#btnBegin');
  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp="12"]'); if (b) b.click(); });
  let guard = 0;
  while (guard++ < 200) {
    await page.waitForTimeout(250);
    const st = await page.evaluate(() => ({
      end: document.getElementById('scrEnd').classList.contains('active'),
      choice: document.getElementById('ovChoice').classList.contains('show'),
    }));
    if (st.choice) { await page.click('#ckOpts .opt'); await page.waitForTimeout(80); }
    if (st.end) break;
  }
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => ({
    forks: document.querySelectorAll('#forkList .fork-row').length,
    ach: document.querySelectorAll('#endAch .ach').length,
  }));
  await page.click('#btnCard');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/d2-card.png' });
  console.log('meta:', meta.trim());
  console.log('end:', JSON.stringify(info));
  console.log('errors:', errs.length ? errs.join('|') : 'none');
  await browser.close();
})();

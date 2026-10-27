/* 移动端截图自检 */
const { launch } = require('./pw');
const path = require('path');

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/m1-start.png' });
  await page.click('#btnStart');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/m2-birth.png' });
  await page.click('#btnBegin');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shots/m3-play.png' });

  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp="12"]'); if (b) b.click(); });
  let guard = 0;
  while (guard++ < 200) {
    await page.waitForTimeout(250);
    const st = await page.evaluate(() => ({
      end: document.getElementById('scrEnd').classList.contains('active'),
      choice: document.getElementById('ovChoice').classList.contains('show'),
    }));
    if (st.choice) {
      if (guard < 6) { await page.waitForTimeout(200); await page.screenshot({ path: 'shots/m4-choice.png' }); }
      await page.click('#ckOpts .opt'); await page.waitForTimeout(80);
    }
    if (st.end) break;
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/m5-end.png' });
  await page.evaluate(() => {
    const el = document.getElementById('endForks');
    if (el && el.style.display !== 'none') el.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'shots/m6-forks.png' });

  await page.evaluate(() => document.querySelector('.end-actions').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(200);
  await page.click('#btnCard');
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'shots/m7-card.png' });
  console.log('errors:', errs.length ? errs.join('|') : 'none');
  await browser.close();
})();

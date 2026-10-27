/* 直接导出人生卡片 PNG 用于检视 */
const { launch } = require('./pw');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await page.waitForTimeout(500);

  const lang = process.argv[2] || 'zh';
  await page.evaluate(l => {
    if (l !== 'zh') { /* switch */ }
  }, lang);

  await page.click('#btnStart');
  await page.waitForTimeout(400);
  await page.click('#btnBegin');
  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp="12"]'); if (b) b.click(); });
  let guard = 0;
  while (guard++ < 160) {
    await page.waitForTimeout(300);
    const st = await page.evaluate(() => ({
      end: document.getElementById('scrEnd').classList.contains('active'),
      choice: document.getElementById('ovChoice').classList.contains('show'),
    }));
    if (st.choice) { await page.click('#ckOpts .opt'); await page.waitForTimeout(80); }
    if (st.end) break;
  }
  if (lang === 'en') { await page.click('#btnLang'); await page.waitForTimeout(400); }
  await page.click('#btnCard');
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => document.getElementById('lifeCard').toDataURL('image/png'));
  fs.writeFileSync(path.join(__dirname, '..', 'shots', 'card-' + lang + '.png'),
    Buffer.from(data.split(',')[1], 'base64'));
  console.log('saved card-' + lang + '.png', 'errors:', errs.length ? errs.join('|') : 'none');
  await browser.close();
})();

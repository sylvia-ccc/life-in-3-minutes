/* 线上地址实机验证 */
const { launch } = require('./pw');

(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2, ignoreHTTPSErrors: false });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

  const t0 = Date.now();
  const resp = await page.goto('https://game.workagentpro.com/', { waitUntil: 'networkidle', timeout: 45000 });
  const load = Date.now() - t0;
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/live-1-start.png' });

  const meta = await page.evaluate(() => ({
    title: document.title,
    meta: (document.getElementById('metaStrip') || {}).textContent,
    brand: (document.getElementById('brandTitle') || {}).textContent,
  }));

  // 玩一局
  await page.click('#btnStart');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/live-2-birth.png' });
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
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/live-3-end.png' });
  const end = await page.evaluate(() => ({
    grade: (document.getElementById('endGrade') || {}).textContent.trim().slice(0, 20),
    forks: document.querySelectorAll('#forkList .fork-row').length,
  }));

  console.log('status:', resp.status(), '| load:', load + 'ms');
  console.log('meta:', JSON.stringify(meta));
  console.log('end:', JSON.stringify(end));
  console.log('errors:', errs.length ? errs.join('|') : 'none');
  await browser.close();
})();

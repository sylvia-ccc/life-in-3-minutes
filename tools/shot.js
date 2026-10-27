/* 用无头浏览器截图自检 */
const { launch } = require('./pw');
const path = require('path');

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));

  const url = 'file://' + path.join(__dirname, '..', 'index.html');
  await page.goto(url);
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/01-start.png' });

  await page.click('#btnStart');
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'shots/02-birth.png' });

  await page.click('#btnBegin');
  await page.waitForTimeout(2600);
  await page.screenshot({ path: 'shots/03-play.png' });

  // 等第一个选择出现
  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp=\"12\"]'); if (b) b.click(); });
  let cg = 0;
  while (cg++ < 60) {
    await page.waitForTimeout(200);
    const sc = await page.evaluate(() => document.getElementById('ovChoice').classList.contains('show'));
    if (sc) { await page.waitForTimeout(450); await page.screenshot({ path: 'shots/04-choice.png' }); break; }
  }
  await page.click('#ckOpts .opt');
  await page.waitForTimeout(300);

  // 加速到结局
  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp="12"]'); if (b) b.click(); });
  let guard = 0;
  while (guard++ < 120) {
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => ({
      end: document.getElementById('scrEnd').classList.contains('active'),
      choice: document.getElementById('ovChoice').classList.contains('show'),
    }));
    if (st.choice) { await page.click('#ckOpts .opt'); await page.waitForTimeout(120); }
    if (st.end) break;
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/05-end.png', fullPage: false });

  // 未走的路
  await page.evaluate(() => {
    const el = document.getElementById('endForks');
    if (el && el.style.display !== 'none') el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shots/05b-forks.png' });

  // 人生卡片
  await page.evaluate(() => {
    const el = document.querySelector('.end-actions');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(250);
  await page.click('#btnCard');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shots/09-card.png' });
  const cardInfo = await page.evaluate(() => {
    const cv = document.getElementById('lifeCard');
    const g = cv.getContext('2d');
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let ink = 0, gold = 0;
    for (let i = 0; i < d.length; i += 4000) {
      if (d[i] < 230 || d[i + 1] < 230) ink++;
      if (d[i] > 130 && d[i] < 200 && d[i + 2] < 110) gold++;
    }
    return { w: cv.width, h: cv.height, ink, gold };
  });
  console.log('card:', JSON.stringify(cardInfo));
  await page.click('#cardClose');
  await page.waitForTimeout(300);

  // 图鉴
  await page.click('#btnGal2');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shots/06-gallery.png' });

  // 英文
  await page.click('#btnBack'); await page.waitForTimeout(300);
  await page.click('#btnLang'); await page.waitForTimeout(300);
  await page.screenshot({ path: 'shots/07-end-en.png' });
  await page.click('#btnAgain'); await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/08-birth-en.png' });

  console.log('errors:', errs.length ? errs.join('\n') : 'none');
  await browser.close();
})();

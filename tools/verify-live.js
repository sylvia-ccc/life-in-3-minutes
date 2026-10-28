/* 对线上站点做冒烟测试：确认新功能在生产环境真的可用
   用法：node tools/verify-live.js */
const { launch } = require('./pw');
const URL = process.env.LIVE_URL || 'https://game.workagentpro.com';

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  const resp = await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  console.log('HTTP', resp.status());
  await page.waitForTimeout(1200);

  const title = await page.title();
  console.log('标题:', title, /3 分钟看完一生|Life in 3 Minutes/.test(title) ? '✓' : '✗');

  // 投胎 -> 开始 -> 进行中
  await page.click('#btnStart');
  await page.waitForTimeout(700);
  await page.click('#btnBegin');
  await page.waitForTimeout(1500);

  // R 键确认
  await page.keyboard.press('r');
  await page.waitForTimeout(400);
  const cf = await page.evaluate(() => ({
    shown: document.getElementById('ovConfirm').classList.contains('show'),
    text: document.getElementById('cfText').textContent,
  }));
  console.log('[线上 R 键确认]', JSON.stringify(cf), cf.shown ? '✓' : '✗');
  await page.click('#cfNo');
  await page.waitForTimeout(300);

  // 跑到结局
  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp="12"]'); if (b) b.click(); });
  let guard = 0;
  while (guard++ < 150) {
    await page.waitForTimeout(280);
    const st = await page.evaluate(() => ({
      end: document.getElementById('scrEnd').classList.contains('active'),
      choice: document.getElementById('ovChoice').classList.contains('show'),
    }));
    if (st.choice) { await page.click('#ckOpts .opt').catch(() => {}); await page.waitForTimeout(120); }
    if (st.end) break;
  }
  await page.waitForTimeout(800);

  const end = await page.evaluate(() => ({
    screen: document.querySelector('.screen.active').id,
    scrollH: document.getElementById('scrEnd').scrollHeight,
    clientH: document.getElementById('scrEnd').clientHeight,
  }));
  console.log('[线上结局页]', JSON.stringify(end), end.screen === 'scrEnd' ? '✓' : '✗');

  if (end.scrollH > end.clientH + 100) {
    await page.evaluate(() => { document.getElementById('scrEnd').scrollTop = 99999; });
    await page.waitForTimeout(400);
    const shown = await page.evaluate(() => !document.getElementById('btnTop').hidden);
    console.log('[线上回到顶部按钮]', shown ? '✓ 出现' : '✗ 未出现');
    await page.click('#btnTop');
    await page.waitForTimeout(900);
    const top = await page.evaluate(() => Math.round(document.getElementById('scrEnd').scrollTop));
    console.log('[线上点击回顶]', top < 10 ? '✓ 回到 ' + top : '✗ 停在 ' + top);
  }

  console.log('JS 错误:', errors.length ? errors.join('\n') : '无 ✓');
  await browser.close();
})().catch(e => { console.error('失败:', e); process.exit(1); });

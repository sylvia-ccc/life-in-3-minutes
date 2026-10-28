/* 实测两个新交互：结局页回到顶部、R 键中途重投确认
   用法：node tools/verify-newfeat.js */
const path = require('path');
const { launch } = require('./pw');

const ROOT = path.join(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'index.html');

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(URL, { waitUntil: 'load' });

  /* ---------- 1. R 键确认 ---------- */
  // 开始页按 R 应该没有任何反应
  await page.keyboard.press('r');
  await page.waitForTimeout(200);
  const atStart = await page.evaluate(() => ({
    screen: document.querySelector('.screen.active').id,
    confirmShown: document.getElementById('ovConfirm').classList.contains('show'),
  }));
  console.log('[R@开始页]', JSON.stringify(atStart), atStart.screen === 'scrStart' && !atStart.confirmShown ? '✓' : '✗');

  // 投胎 -> 出生页 -> 开始人生 -> 进入进行中
  await page.click('#btnStart');
  await page.waitForTimeout(400);
  await page.click('#btnBegin');
  await page.waitForTimeout(1200);
  const playing = await page.evaluate(() => ({
    screen: document.querySelector('.screen.active').id,
  }));
  console.log('[进行中状态]', JSON.stringify(playing), playing.screen === 'scrPlay' ? '✓' : '✗');

  // 进行中按 R 应该弹确认
  await page.keyboard.press('r');
  await page.waitForTimeout(300);
  const afterR = await page.evaluate(() => ({
    confirmShown: document.getElementById('ovConfirm').classList.contains('show'),
    text: document.getElementById('cfText').textContent,
  }));
  console.log('[R@进行中]', JSON.stringify(afterR), afterR.confirmShown ? '✓ 弹了确认' : '✗ 没弹');

  // 选「继续这一生」-> 弹窗关闭，人生还在
  await page.click('#cfNo');
  await page.waitForTimeout(400);
  const afterNo = await page.evaluate(() => ({
    confirmShown: document.getElementById('ovConfirm').classList.contains('show'),
    screen: document.querySelector('.screen.active').id,
  }));
  console.log('[取消重投]', JSON.stringify(afterNo), !afterNo.confirmShown && afterNo.screen === 'scrPlay' ? '✓' : '✗');

  // 选「丢掉，重新投」-> 回到出生页
  await page.keyboard.press('r');
  await page.waitForTimeout(250);
  await page.click('#cfYes');
  await page.waitForTimeout(400);
  const afterYes = await page.evaluate(() => ({
    confirmShown: document.getElementById('ovConfirm').classList.contains('show'),
    screen: document.querySelector('.screen.active').id,
  }));
  console.log('[确认重投]', JSON.stringify(afterYes), !afterYes.confirmShown && afterYes.screen === 'scrBirth' ? '✓' : '✗');

  /* ---------- 2. 结局页回到顶部 ---------- */
  // 快进：直接跑完一生
  await page.click('#btnBegin');
  await page.waitForTimeout(300);
  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp="12"]'); if (b) b.click(); });
  let guard = 0;
  while (guard++ < 160) {
    await page.waitForTimeout(300);
    const st = await page.evaluate(() => ({
      end: document.getElementById('scrEnd').classList.contains('active'),
      choice: document.getElementById('ovChoice').classList.contains('show'),
    }));
    if (st.choice) { await page.click('#ckOpts .opt'); await page.waitForTimeout(120); }
    if (st.end) break;
  }
  await page.waitForTimeout(700);
  const endState = await page.evaluate(() => ({
    screen: document.querySelector('.screen.active').id,
    scrollH: document.getElementById('scrEnd').scrollHeight,
    clientH: document.getElementById('scrEnd').clientHeight,
    topBtnHidden: document.getElementById('btnTop').hidden,
  }));
  console.log('[结局页]', JSON.stringify(endState), endState.screen === 'scrEnd' ? '✓' : '✗');

  const scrollable = endState.scrollH > endState.clientH + 100;
  console.log('[结局页可滚动]', scrollable ? '✓ 内容' + endState.scrollH + 'px > 视口' + endState.clientH + 'px' : '✗ 不用滚，按钮无意义');

  if (scrollable) {
    // 顶部时按钮应隐藏
    console.log('[顶部时按钮隐藏]', endState.topBtnHidden ? '✓' : '✗');
    // 滚下去
    await page.evaluate(() => { document.getElementById('scrEnd').scrollTop = 99999; });
    await page.waitForTimeout(400);
    const afterScroll = await page.evaluate(() => ({
      hidden: document.getElementById('btnTop').hidden,
      scrollTop: document.getElementById('scrEnd').scrollTop,
    }));
    console.log('[滚到底后按钮出现]', JSON.stringify(afterScroll), !afterScroll.hidden ? '✓' : '✗');

    // 点按钮回顶
    await page.click('#btnTop');
    await page.waitForTimeout(900);
    const afterTop = await page.evaluate(() => ({
      scrollTop: Math.round(document.getElementById('scrEnd').scrollTop),
      hidden: document.getElementById('btnTop').hidden,
    }));
    console.log('[点击回到顶部]', JSON.stringify(afterTop), afterTop.scrollTop < 10 ? '✓' : '✗');

    // 英文模式下按钮文案
    await page.click('#btnLang');
    await page.waitForTimeout(200);
    const enTxt = await page.evaluate(() => document.getElementById('topBtn').textContent);
    console.log('[英文文案]', enTxt, enTxt === 'Back to top' ? '✓' : '✗');
  }

  console.log('\nJS 错误:', errors.length ? errors.join('\n') : '无 ✓');
  await browser.close();
})().catch(e => { console.error('失败:', e); process.exit(1); });

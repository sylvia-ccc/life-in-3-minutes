/* 检查英文模式下界面是否还有中文残留
   用法：node tools/check-lang.js */
const { launch } = require('./pw');
const path = require('path');

const ROOT = path.join(__dirname, '..');

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await page.waitForTimeout(800);

  /* 切英文 */
  await page.click('#btnLang');
  await page.waitForTimeout(400);

  /* 遍历所有屏幕，抓出可见文本里的中文 */
  const CJK = /[一-鿿]/;
  const report = [];

  const scan = async label => {
    const hits = await page.evaluate(() => {
      const out = [];
      const active = document.querySelector('.screen.active');
      if (!active) return out;
      const walk = el => {
        for (const n of el.childNodes) {
          if (n.nodeType === 3) {
            const t = n.textContent.trim();
            if (t && /[一-鿿]/.test(t)) {
              const id = n.parentElement && (n.parentElement.id || n.parentElement.className);
              out.push({ tag: n.parentElement && n.parentElement.tagName, id: String(id || '').slice(0, 40), text: t.slice(0, 70) });
            }
          } else if (n.nodeType === 1) {
            const st = getComputedStyle(n);
            if (st.display !== 'none' && st.visibility !== 'hidden') walk(n);
          }
        }
      };
      walk(active);
      return out;
    });
    if (hits.length) report.push({ label, hits });
  };

  await scan('开始页');

  await page.click('#btnStart');
  await page.waitForTimeout(600);
  await scan('出生页');

  await page.click('#btnBegin');
  await page.waitForTimeout(1500);
  await scan('人生进行中');

  /* 跑到结局 */
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
  await scan('结局页');

  await page.click('#btnGal2');
  await page.waitForTimeout(600);
  await scan('图鉴页');

  if (!report.length) {
    console.log('英文模式下无中文残留 ✓');
  } else {
    console.log('发现中文残留：');
    report.forEach(r => {
      console.log('\n[' + r.label + '] ' + r.hits.length + ' 处');
      r.hits.forEach(h => console.log('  <' + h.tag + ' id=' + h.id + '> ' + h.text));
    });
  }
  console.log('\nJS 错误:', errors.length ? errors.join('\n') : '无 ✓');
  await browser.close();
})().catch(e => { console.error('失败:', e); process.exit(1); });

/* 生成 README 用的 15 秒 GIF
   流程：投胎 → 出生页 → 抉择 → 人生推进 → 结局评级
   用法：node tools/make-gif.js
   产物：docs/preview.gif（截图帧落在 shots/gif/，不入库） */
const { launch } = require('./pw');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FRAME_DIR = path.join(ROOT, 'shots', 'gif');
const OUT = path.join(ROOT, 'docs', 'preview.gif');

/* 录屏节奏（毫秒），总计约 15 秒 */
const STEPS = [
  { wait: 2000 },                                   // 开始页标题
  { click: '#btnStart', wait: 2500 },               // 投胎 → 出生证明
  { click: '#btnBegin', wait: 2500 },               // 开始这一生
  { wait: 3000 },                                   // 人生推进
  { pick: true, wait: 2500 },                       // 第一次抉择
  { wait: 3000 },                                   // 继续推进
  { pick: true, wait: 2500 },                       // 第二次抉择
  { wait: 2500 },                                   // 继续推进
];

(async () => {
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });

  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 640 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

  await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await page.waitForTimeout(900);
  /* 一开始就调到最快，让画面全程都在动，录出来的 GIF 才有看头 */
  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp="12"]'); if (b) b.click(); });

  let frame = 0;
  const fps = 10;
  const grab = async () => {
    const buf = await page.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(FRAME_DIR, String(frame).padStart(4, '0') + '.png'), buf);
    frame++;
  };

  for (const step of STEPS) {
    if (step.click) {
      await page.click(step.click).catch(() => {});
    } else if (step.pick) {
      /* 抉择弹窗：出现就点第一个选项 */
      const ok = await page.evaluate(() => {
        const b = document.querySelector('#ckOpts .opt');
        if (b) { b.click(); return true; }
        return false;
      });
      if (!ok) {
        /* 等它出现再点 */
        for (let i = 0; i < 40; i++) {
          await page.waitForTimeout(150);
          const hit = await page.evaluate(() => {
            const b = document.querySelector('#ckOpts .opt');
            if (b) { b.click(); return true; }
            return false;
          });
          if (hit) break;
        }
      }
    }
    /* 这一段里持续抽帧 */
    const frames = Math.max(1, Math.round((step.wait || 500) / 1000 * fps));
    for (let i = 0; i < frames; i++) {
      await grab();
      await page.waitForTimeout(1000 / fps);
    }
  }

  /* 再跑到结局，把评级收进画面 */
  await page.evaluate(() => { const b = document.querySelector('.speed button[data-sp="12"]'); if (b) b.click(); });
  let guard = 0;
  while (guard++ < 120) {
    await page.waitForTimeout(260);
    const st = await page.evaluate(() => ({
      end: document.getElementById('scrEnd').classList.contains('active'),
      choice: document.getElementById('ovChoice').classList.contains('show'),
    }));
    if (st.choice) { await page.click('#ckOpts .opt').catch(() => {}); await page.waitForTimeout(120); }
    if (st.end) break;
    await grab();
  }
  /* 结局页多留几帧，让评级被看清 */
  for (let i = 0; i < 24; i++) { await grab(); await page.waitForTimeout(1000 / fps); }

  console.log('抽帧', frame, '张 ->', FRAME_DIR);
  await browser.close();
  if (errs.length) console.log('JS 错误:', errs.join('\n'));

  /* 只留变化帧的一半 + 缩到 560px：纸色渐变背景在 GIF 里极难压，
     这是体积能落在 1.2MB 的唯一办法。改参数前先想清楚体积。 */
  const HALF = path.join(ROOT, 'shots', 'gif-half');
  fs.rmSync(HALF, { recursive: true, force: true });
  fs.mkdirSync(HALF, { recursive: true });
  const all = fs.readdirSync(FRAME_DIR).filter(f => f.endsWith('.png')).sort();
  all.forEach((f, i) => {
    if (i % 2) return;
    fs.copyFileSync(path.join(FRAME_DIR, f), path.join(HALF, String(i >> 1).padStart(4, '0') + '.png'));
  });

  execFileSync('ffmpeg', [
    '-y', '-framerate', '8', '-i', path.join(HALF, '%04d.png'),
    '-vf', 'scale=560:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5',
    '-loop', '0', OUT,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log('生成', path.relative(ROOT, OUT), kb + 'KB');
})().catch(e => { console.error('失败:', e); process.exit(1); });

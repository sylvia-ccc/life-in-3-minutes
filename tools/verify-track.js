/* 用本地 HTTP 服务 + 无头浏览器跑完整一局，抓取真实上报的埋点 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { launch } = require('./pw');

const FILE = path.join(__dirname, '..', 'dist', 'life-in-3-minutes.html');
const hits = [];
const PORT = 8777;

const srv = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/c') {
    let b = '';
    req.on('data', c => { b += c; });
    req.on('end', () => {
      try { hits.push(JSON.parse(b)); } catch (e) { hits.push({ bad: b }); }
      res.writeHead(204, { 'Cache-Control': 'no-store' });
      res.end();
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(FILE));
});

(async () => {
  await new Promise(r => srv.listen(PORT, '127.0.0.1', r));
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));

  await page.goto('http://127.0.0.1:' + PORT + '/');
  await page.waitForTimeout(700);
  await page.click('#btnStart');
  await page.waitForTimeout(500);
  await page.click('#btnBegin');
  await page.evaluate(() => {
    const b = document.querySelector('.speed button[data-sp="12"]');
    if (b) b.click();
  });

  let guard = 0;
  while (guard++ < 200) {
    await page.waitForTimeout(280);
    const st = await page.evaluate(() => ({
      end: document.getElementById('scrEnd').classList.contains('active'),
      choice: document.getElementById('ovChoice').classList.contains('show'),
    }));
    if (st.choice) { await page.click('#ckOpts .opt'); await page.waitForTimeout(60); }
    if (st.end) break;
  }
  const grade = await page.evaluate(() => {
    const el = document.getElementById('endGrade');
    return el ? el.textContent.trim() : '?';
  });
  await page.waitForTimeout(400);
  /* 模拟用户直接关掉标签页 / 跳走：pagehide 才会触发 */
  await page.goto('about:blank');
  await page.waitForTimeout(700);
  await page.close();
  await browser.close();
  srv.close();

  const kinds = {};
  hits.forEach(h => { kinds[h.t] = (kinds[h.t] || 0) + 1; });
  console.log('事件统计:', JSON.stringify(kinds));
  console.log('事件总数:', hits.length);
  console.log('样例 open :', JSON.stringify(hits.find(h => h.t === 'open')));
  console.log('样例 end  :', JSON.stringify(hits.find(h => h.t === 'end')));
  console.log('样例 leave:', JSON.stringify(hits.find(h => h.t === 'leave')));
  const need = ['open', 'start', 'begin', 'end', 'leave'];
  const miss = need.filter(k => !kinds[k]);
  console.log('缺失事件:', miss.length ? miss.join(',') : '无');
  console.log('JS 错误:', errs.length ? errs.join(' | ') : '无');
  const ok = !miss.length && !errs.length;
  console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL');
  process.exit(ok ? 0 : 1);
})();

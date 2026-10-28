/* 全面体检：移动端触控、键盘可达性、存档迁移、埋点、对比度
   用法：node tools/health-check.js */
const { launch } = require('./pw');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'index.html');

const results = [];
const ok = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log((pass ? '  ✓ ' : '  ✗ ') + name + (detail ? ' — ' + detail : ''));
};

(async () => {
  const browser = await launch();

  /* ============ 1. 移动端触控目标 ============ */
  console.log('\n【1. 移动端触控目标尺寸】');
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(800);

    const small = await page.evaluate(() => {
      const out = [];
      const els = document.querySelectorAll('button, .speed button, a, [role="button"]');
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return;
        if (r.width < 44 || r.height < 44) {
          out.push({ id: el.id || el.className || el.tagName, w: Math.round(r.width), h: Math.round(r.height), txt: (el.textContent || '').trim().slice(0, 12) });
        }
      });
      return out;
    });
    console.log('  小于 44×44 的可点击元素:', small.length);
    small.forEach(s => console.log('    -', s.id, s.w + '×' + s.h, '"' + s.txt + '"'));

    /* 触控目标间距：相邻可点元素中心距 */
    const crowded = await page.evaluate(() => {
      const els = [...document.querySelectorAll('.screen.active button')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width && r.height;
      });
      const out = [];
      for (let i = 0; i < els.length; i++) {
        for (let j = i + 1; j < els.length; j++) {
          const a = els[i].getBoundingClientRect(), b = els[j].getBoundingClientRect();
          const dx = Math.max(0, Math.max(a.left - b.right, b.left - a.right));
          const dy = Math.max(0, Math.max(a.top - b.bottom, b.top - a.bottom));
          const gap = Math.max(dx, dy);
          if (gap < 4 && gap >= 0) {
            out.push({ a: els[i].id || els[i].textContent.trim().slice(0, 8), b: els[j].id || els[j].textContent.trim().slice(0, 8), gap: Math.round(gap) });
          }
        }
      }
      return out;
    });
    ok('触控目标之间无重叠', crowded.length === 0, crowded.length ? crowded.map(c => c.a + '↔' + c.b + ' 间距' + c.gap + 'px').join(', ') : '开始页无重叠');

    /* 横向溢出 */
    const ovf = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    ok('无横向溢出', ovf.scrollW <= ovf.clientW, ovf.scrollW + ' vs ' + ovf.clientW);

    /* 结局页 + 确认框 */
    await page.click('#btnStart'); await page.waitForTimeout(600);
    await page.click('#btnBegin'); await page.waitForTimeout(1400);
    await page.keyboard.press('r'); await page.waitForTimeout(400);
    const cfBtns = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('#ovConfirm button').forEach(b => {
        const r = b.getBoundingClientRect();
        out.push({ id: b.id, w: Math.round(r.width), h: Math.round(r.height) });
      });
      return out;
    });
    console.log('  确认框按钮:', JSON.stringify(cfBtns));
    ok('确认框按钮达到 44px 高', cfBtns.every(b => b.h >= 40), '实测 ' + cfBtns.map(b => b.h).join('/') + 'px');
    await page.click('#cfNo'); await page.waitForTimeout(300);
    await page.close();
  }

  /* ============ 2. 键盘可达性 ============ */
  console.log('\n【2. 键盘可达性】');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(700);

    /* Tab 能否走到开始按钮 */
    const tabbed = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => {
        const a = document.activeElement;
        return a ? (a.id || a.className || a.tagName) : 'null';
      });
      tabbed.push(id);
    }
    ok('Tab 能聚焦到关键控件', tabbed.some(t => t && t !== 'null' && t !== 'BODY'), '前几个: ' + tabbed.slice(0, 6).join(' → '));

    /* 焦点可见性：聚焦后有没有可见轮廓 */
    const outline = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return { ok: false, reason: '无聚焦元素' };
      const st = getComputedStyle(a);
      return { ok: st.outlineStyle !== 'none' || st.boxShadow !== 'none', tag: a.tagName, id: a.id, outline: st.outlineStyle + ' ' + st.outlineWidth };
    });
    ok('聚焦有可见轮廓', outline.ok, outline.reason || (outline.tag + '#' + outline.id + ' ' + outline.outline));

    /* 确认框：Esc 能关、焦点在里面 */
    await page.click('#btnStart'); await page.waitForTimeout(600);
    await page.click('#btnBegin'); await page.waitForTimeout(1500);
    await page.keyboard.press('r'); await page.waitForTimeout(400);
    const inDialog = await page.evaluate(() => {
      const ov = document.getElementById('ovConfirm');
      const shown = ov.classList.contains('show');
      const focused = ov.contains(document.activeElement);
      return { shown, focused, active: document.activeElement && document.activeElement.id };
    });
    console.log('  确认框状态:', JSON.stringify(inDialog));
    ok('确认框打开时焦点进入对话框', inDialog.shown, '焦点=' + inDialog.active);

    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    const closed = await page.evaluate(() => !document.getElementById('ovConfirm').classList.contains('show'));
    ok('Esc 能关闭确认框', closed);

    /* Esc 关闭后游戏是否恢复（不会卡在暂停） */
    const resumed = await page.evaluate(() => ({
      screen: document.querySelector('.screen.active').id,
      pauseIcon: document.getElementById('btnPause').innerHTML.includes('rect'),
    }));
    ok('Esc 取消后游戏继续跑', resumed.screen === 'scrPlay' && resumed.pauseIcon, '屏幕=' + resumed.screen + ' 暂停中=' + !resumed.pauseIcon);

    await page.close();
  }

  /* ============ 3. 存档迁移 ============ */
  console.log('\n【3. 存档迁移（老 key → 新 key）】');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(600);

    /* 模拟老玩家：只留老 key，新 key 不存在。
       注意必须先删掉新 key —— 页面一加载就会写入空存档，
       那样就测不到「首次升级」这条路径了。
       结构也要和真实 store 一致：runs 数组 / countries 对象 / ach 对象 */
    await page.evaluate(() => {
      localStorage.setItem('oieb.v1', JSON.stringify({
        lang: 'zh',
        runs: [{ cid: 'CN', age: 80, score: 70, ts: 1 }, { cid: 'JP', age: 60, score: 50, ts: 2 }],
        countries: { CN: 1, JP: 1 },
        tiers: {},
        ach: { a1: 1 },
        milestones: {},
        best: {},
        streak: { days: 5, last: '2026-10-28' },
      }));
      localStorage.removeItem('life3m.v1');
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(900);

    const migrated = await page.evaluate(() => {
      const old = localStorage.getItem('oieb.v1');
      const nw = localStorage.getItem('life3m.v1');
      let parsed = null;
      try { parsed = nw ? JSON.parse(nw) : null; } catch (e) { /* ignore */ }
      return {
        oldStillThere: !!old,
        newExists: !!nw,
        runs: parsed && parsed.runs ? parsed.runs.length : 0,
        ach: parsed && parsed.ach ? Object.keys(parsed.ach).length : 0,
        countries: parsed && parsed.countries ? Object.keys(parsed.countries).length : 0,
        streak: parsed && parsed.streak ? parsed.streak.days : 0,
        displayRuns: document.getElementById('startHint').textContent,
      };
    });
    console.log('  迁移结果:', JSON.stringify(migrated));
    ok('老存档迁移到新 key', migrated.newExists && migrated.runs === 2 && migrated.ach === 1 && migrated.countries === 2,
      'runs=' + migrated.runs + ' ach=' + migrated.ach + ' countries=' + migrated.countries);
    ok('老 key 保留未删', migrated.oldStillThere, '删除会让玩家丢进度');

    /* 界面是否显示迁移后的次数（textContent 没有 <b> 标签，按纯文本匹配） */
    ok('开始页显示历史投胎次数', /你已经投胎过\s*2\s*次|You have lived\s*2\s*lives/.test(migrated.displayRuns),
      migrated.displayRuns.slice(0, 50).replace(/\s+/g, ' '));

    /* 边界：新 key 是空存档、但老 key 有数据时，也应该迁（切回旧版再回来的玩家） */
    await page.evaluate(() => {
      localStorage.setItem('life3m.v1', JSON.stringify({ lang: 'zh', runs: [], countries: {}, ach: {}, tiers: {}, milestones: {}, best: {} }));
      localStorage.setItem('oieb.v1', JSON.stringify({ lang: 'zh', runs: [{ cid: 'CN' }], countries: { CN: 1 }, ach: { a1: 1 }, tiers: {}, milestones: {}, best: {} }));
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(900);
    const edge = await page.evaluate(() => {
      const p = JSON.parse(localStorage.getItem('life3m.v1') || '{}');
      return { runs: (p.runs || []).length, countries: Object.keys(p.countries || {}).length };
    });
    ok('空新 key + 有老 key 时也会迁移', edge.runs === 1 && edge.countries === 1,
      'runs=' + edge.runs + ' countries=' + edge.countries);

    await page.close();
  }

  /* ============ 4. 埋点 ============ */
  console.log('\n【4. 埋点】');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    const reqs = [];
    page.on('request', r => {
      const u = r.url();
      if (/\/[cd](\?|$)/.test(u.replace(/^https?:\/\/[^/]+/, ''))) reqs.push(r.method() + ' ' + u);
    });
    /* 埋点只在 http(s) 下启用，file:// 不发，所以必须用线上测。
       TRACK_ON 是模块作用域 const，evaluate 里读不到，只能看网络请求 */
    await page.goto('https://game.workagentpro.com/', { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    console.log('  埋点请求:', reqs.length ? reqs.join(', ') : '无');
    ok('线上埋点已发出请求', reqs.length > 0, reqs.length ? reqs[0] : '没有 /c 或 /d 请求');
    await page.close();

  }

  /* ============ 5. 对比度（新增元素） ============ */
  console.log('\n【5. 关键元素对比度】');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    await page.click('#btnStart'); await page.waitForTimeout(600);
    await page.click('#btnBegin'); await page.waitForTimeout(1500);
    await page.keyboard.press('r'); await page.waitForTimeout(400);

    const contrast = await page.evaluate(() => {
      const lum = c => {
        const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const parse = s => (s.match(/\d+/g) || []).slice(0, 3).map(Number);
      const ratio = (f, b) => {
        const l1 = lum(f), l2 = lum(b);
        return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
      };
      const bgOf = el => {
        let n = el;
        while (n && n !== document.documentElement) {
          const st = getComputedStyle(n);
          const bg = st.backgroundColor;
          if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return parse(bg);
          n = n.parentElement;
        }
        return [253, 251, 246];
      };
      const targets = [
        ['#cfText 确认框正文', '#cfText'],
        ['#cfLabel 确认框标签', '#cfLabel'],
        ['#topBtn 回到顶部按钮', '#topBtn'],
        ['#cfNoBtn 取消按钮', '#cfNoBtn'],
        ['#cfYesBtn 确认按钮', '#cfYesBtn'],
      ];
      return targets.map(([name, sel]) => {
        const el = document.querySelector(sel);
        if (!el) return { name, skip: true };
        const st = getComputedStyle(el);
        const fg = parse(st.color);
        let bg = parse(st.backgroundColor);
        if (/rgba\(0, 0, 0, 0\)|transparent/.test(st.backgroundColor)) bg = bgOf(el);
        const size = parseFloat(st.fontSize);
        const bold = parseInt(st.fontWeight, 10) >= 700;
        const large = size >= 24 || (size >= 18.66 && bold);
        return { name, ratio: +ratio(fg, bg).toFixed(2), size, need: large ? 3 : 4.5 };
      });
    });
    contrast.forEach(c => {
      if (c.skip) return;
      ok(c.name + ' 对比度', c.ratio >= c.need, c.ratio + ':1 (需 ' + c.need + ':1, ' + c.size + 'px)');
    });

    /* 全站扫描：所有可见文字的实际对比度，找出低于 AA 的 */
    console.log('\n【5b. 全站文字对比度扫描】');
    await page.click('#cfNo');
    await page.waitForTimeout(300);

    const low = await page.evaluate(() => {
      const lum = c => {
        const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const parse = s => (s.match(/\d+/g) || []).slice(0, 3).map(Number);
      const ratio = (f, b) => { const l1 = lum(f), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
      const bgOf = el => {
        const stack = [];
        let n = el;
        while (n && n !== document.documentElement) {
          const st = getComputedStyle(n);
          const m = (st.backgroundColor || '').match(/[\d.]+/g);
          if (m) {
            const a = m.length > 3 ? parseFloat(m[3]) : 1;
            if (a > 0) {
              stack.push({ c: [parseFloat(m[0]), parseFloat(m[1]), parseFloat(m[2])], a });
              if (a >= 0.95) break;
            }
          }
          n = n.parentElement;
        }
        if (!stack.length) return [250, 248, 243];
        let bg = [250, 248, 243];
        for (let i = stack.length - 1; i >= 0; i--) {
          const { c, a } = stack[i];
          bg = c.map((v, j) => Math.round(v * a + bg[j] * (1 - a)));
        }
        return bg;
      };
      const out = [];
      /* 全部屏幕都扫：金/灰小字分布在开始页、结局页、图鉴页 */
      document.querySelectorAll('.screen').forEach(sid => {
        const wasActive = sid.classList.contains('active');
        sid.classList.add('active');
        sid.querySelectorAll('*').forEach(el => {
          let txt = '';
          for (const n of el.childNodes) if (n.nodeType === 3) txt += n.textContent;
          txt = txt.trim();
          if (!txt) return;
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) < 0.5) return;
          const size = parseFloat(st.fontSize);
          if (!size) return;
          const bold = parseInt(st.fontWeight, 10) >= 700;
          const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
          const rr = ratio(parse(st.color), bgOf(el));
          if (rr < need) out.push({ screen: sid.id, id: el.id || String(el.className || el.tagName).slice(0, 30), text: txt.slice(0, 22), ratio: +rr.toFixed(2), size, need });
        });
        if (!wasActive) sid.classList.remove('active');
      });
      return out;
    });
    console.log('  低于 AA 的文字:', low.length);
    low.slice(0, 15).forEach(l => console.log('    -', l.screen, l.id, l.ratio + ':1 (需' + l.need + ')', l.size + 'px', '"' + l.text + '"'));
    ok('全部屏幕无低于 AA 的文字', low.length === 0, low.length ? low.length + ' 处' : '');
    await page.close();
  }

  /* ============ 汇总 ============ */
  const bad = results.filter(r => !r.pass);
  console.log('\n========== 体检结果 ==========');
  console.log('通过 ' + (results.length - bad.length) + ' / ' + results.length);
  if (bad.length) {
    console.log('\n未通过：');
    bad.forEach(b => console.log('  ✗ ' + b.name + ' — ' + (b.detail || '')));
  }
  await browser.close();
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error('失败:', e); process.exit(1); });

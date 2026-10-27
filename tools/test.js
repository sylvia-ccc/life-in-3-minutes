/* 引擎不变量测试：node --test tools/test.js
   不依赖浏览器，几秒钟跑完，CI 里每次提交都会跑。 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { console, Math, Date };
vm.createContext(ctx);
for (const f of ['js/config.js', 'js/data-countries.js', 'js/data-events.js', 'js/data-dist.js', 'js/engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const E = ctx.LifeEngine;
const ALL = vm.runInContext('ALL_EVENTS', ctx);
const COUNTRIES = vm.runInContext('COUNTRIES', ctx);
const TIERS = vm.runInContext('TIERS', ctx);
const DIST = vm.runInContext('DIST', ctx);

/* 跑完一生；picks 决定每个岔路怎么选 */
function playLife(seed, picks) {
  const s = E.newLife(seed, {});
  let guard = 0, ci = 0;
  while (s.alive && guard++ < 200) {
    E.tick(s);
    if (s.pending) {
      const idx = picks ? picks(ci, s) : Math.floor(Math.random() * s.pending.ch.length);
      E.resolveChoice(s, Math.min(idx, s.pending.ch.length - 1));
      ci++;
    }
  }
  E.finalize(s);
  return s;
}

test('同一个种子给出同一个出生', () => {
  for (const seed of [1, 42, 999999, 123456789]) {
    const a = E.newLife(seed, {});
    const b = E.newLife(seed, {});
    assert.strictEqual(a.cid, b.cid, '国家不一致 seed=' + seed);
    assert.strictEqual(a.tier, b.tier, '阶层不一致 seed=' + seed);
    assert.deepStrictEqual(a.name, b.name, '姓名不一致 seed=' + seed);
    assert.strictEqual(a.iq, b.iq, '天赋不一致 seed=' + seed);
  }
});

test('指定国家时一定生在那个国家', () => {
  for (const c of COUNTRIES.slice(0, 25)) {
    const s = E.newLife(7, { country: c.id });
    assert.strictEqual(s.cid, c.id, '指定 ' + c.id + ' 却生在 ' + s.cid);
  }
});

test('每一生都会在合理时间内结束', () => {
  for (let i = 0; i < 400; i++) {
    const s = E.newLife(i * 37 + 1, {});
    let guard = 0;
    while (s.alive && guard++ < 200) {
      E.tick(s);
      if (s.pending) E.resolveChoice(s, 0);
    }
    assert.ok(!s.alive, '第 ' + i + ' 生没有结束');
    assert.ok(s.age >= 0 && s.age <= 130, '寿命异常：' + s.age);
  }
});

test('数值不会变成 NaN 或无穷', () => {
  for (let i = 0; i < 300; i++) {
    const s = playLife(i * 13 + 5);
    for (const k of ['age', 'money', 'hp', 'iq', 'ap', 'jy', 'score', 'pct', 'rarity', 'similar']) {
      assert.ok(isFinite(s[k]), k + ' 不是有限数：' + s[k]);
    }
    assert.ok(s.score >= 0 && s.score <= 100, '分数越界：' + s.score);
    assert.ok(s.pct >= 0 && s.pct <= 100, '百分位越界：' + s.pct);
    assert.ok(s.money > -1e12 && s.money < 1e13, '财富离谱：' + s.money);
  }
});

test('评级随百分位单调不降', () => {
  const order = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
  let last = -1;
  for (let p = 0; p <= 100; p += 0.5) {
    const idx = order.indexOf(E.grade(p).k);
    assert.ok(idx >= last, '评级在 p=' + p + ' 处倒退了');
    last = idx;
  }
});

test('分位表单调且长度正确', () => {
  assert.strictEqual(DIST.score.length, 101);
  for (let i = 1; i < 101; i++) {
    assert.ok(DIST.score[i] >= DIST.score[i - 1], 'score 第 ' + i + ' 位不单调');
    assert.ok(DIST.wealth[i] >= DIST.wealth[i - 1], 'wealth 第 ' + i + ' 位不单调');
  }
});

test('每个抉择都至少两个选项，且都有结果文案', () => {
  const choices = ALL.filter(e => e.ch);
  assert.ok(choices.length >= 40, '抉择事件太少：' + choices.length);
  for (const e of choices) {
    assert.ok(e.ch.length >= 2, e.id + ' 选项不足');
    for (const o of e.ch) {
      assert.ok(o.zh && o.en, e.id + ' 选项缺文案');
      assert.ok(o.r && o.r.zh && o.r.en, e.id + ' 选项缺结果文案');
    }
  }
});

test('阶层表完整', () => {
  assert.strictEqual(TIERS.length, 7);
  assert.strictEqual(vm.runInContext('TIER_CAP', ctx).length, 7);
  assert.strictEqual(vm.runInContext('TIER_START', ctx).length, 7);
});

test('国家表没有重复 id，字段都在合理范围', () => {
  const ids = new Set();
  for (const c of COUNTRIES) {
    assert.ok(!ids.has(c.id), '国家 id 重复：' + c.id);
    ids.add(c.id);
    assert.ok(c.pop > 0 && c.pop < 2000, c.id + ' 人口异常');
    assert.ok(c.gdp > 100 && c.gdp < 200000, c.id + ' 人均产出异常');
    assert.ok(c.life > 30 && c.life < 95, c.id + ' 寿命异常');
  }
  assert.ok(COUNTRIES.length >= 100, '国家太少');
});

test('回溯：换一个选项会得到不同的人生', () => {
  let changed = 0;
  for (let t = 0; t < 60; t++) {
    const seed = t * 7919 + 13;
    const a = playLife(seed, () => 0);
    const picks = a.choiceLog.map(c => c.picked);
    const b = E.replay(seed, picks, 0, 1, null);
    if (a.age !== b.age || Math.round(a.money) !== Math.round(b.money)) changed++;
  }
  assert.ok(changed >= 50, '换选项后人生几乎没变，回溯形同虚设（' + changed + '/60）');
});

test('所有事件都能被至少一种人生遇到（粗略）', () => {
  const seen = new Set();
  for (let i = 0; i < 600; i++) {
    const s = playLife(i * 31 + 3);
    s.fired.forEach(id => seen.add(id));
  }
  const never = ALL.filter(e => !e.rep && !seen.has(e.id)).map(e => e.id);
  assert.ok(never.length < ALL.length * 0.08,
    '有 ' + never.length + ' 个事件从未触发，可能是条件写死了：' + never.slice(0, 10).join(','));
});

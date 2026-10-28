/* 统计事件实际出现频次，用来决定先改哪批英文
   用法：node tools/event-freq.js [局数] */
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

const N = parseInt(process.argv[2] || '3000', 10);
const cnt = {};
/* log 里存的是文本不是 id，所以用英文文本反查事件 */
const enToId = new Map();
ALL.forEach(e => {
  if (e.en) enToId.set(e.en, e.id);
  if (e.v) e.v.forEach(v => enToId.set(v[1], e.id));
});

for (let i = 0; i < N; i++) {
  const s = E.newLife(i * 7919 + 13);
  let guard = 0;
  while (s.alive && guard++ < 130) {
    E.tick(s);
    if (s.pending) {
      const idx = Math.floor(Math.random() * s.pending.ch.length);
      E.resolveChoice(s, idx);
    }
  }
  E.finalize(s);
  /* log 存的是文本，用英文原文反查是哪条事件 */
  (s.log || []).forEach(e => {
    const id = enToId.get(e.en);
    if (id) cnt[id] = (cnt[id] || 0) + 1;
  });
}

/* log 里的条目未必带 id，退回到「按出现次数排序的事件池」：
   统计所有事件里哪些 id 一次都没出现过——那些就是低频/从不出现的 */
console.log('总事件', ALL.length);
console.log('模拟局数', N);

/* 统计所有事件里哪些 id 一次都没出现过——那些就是低频/从不出现的 */
const never = ALL.filter(e => !cnt[e.id]);
const appeared = ALL.filter(e => cnt[e.id] > 0).sort((a, b) => cnt[b.id] - cnt[a.id]);
console.log('出现过的', appeared.length, '| 从未出现的', never.length);

const freqOut = ALL.map(e => ({ id: e.id, n: cnt[e.id] || 0, choice: !!e.ch }));
fs.writeFileSync(path.join(root, 'shots', 'event-freq.json'), JSON.stringify(freqOut, null, 1));
console.log('\n明细写入 shots/event-freq.json');

/* 按覆盖率分层：改英文要按「读者实际会读到多少」排优先级 */
const sorted = freqOut.slice().sort((a, b) => b.n - a.n);
let cum = 0, total = 0;
sorted.forEach(e => { total += e.n; cum += e.n; });
console.log('\n总触发次数', total);
[50, 100, 150, 200, 250, 322].forEach(k => {
  const top = sorted.slice(0, k);
  const c = top.reduce((s, e) => s + e.n, 0);
  console.log('前 ' + k + ' 个事件覆盖 ' + (c / total * 100).toFixed(1) + '% 的阅读量');
});

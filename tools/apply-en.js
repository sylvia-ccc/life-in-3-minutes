/* 把英文改写应用到 js/data-events.js
   做法：从当前数据里取出旧英文原串，按「旧串 → 新串」做精确替换，
   这样不用碰结构，也不会误伤别的字段。 */
const fs = require('fs');
const vm = require('vm');

const target = process.argv[2] || '/tmp/en1.js';
const file = 'js/data-events.js';
let src = fs.readFileSync(file, 'utf8');

const ctx = { console, Math, Date };
vm.createContext(ctx);
for (const f of ['js/config.js', 'js/data-countries.js', file, 'js/data-dist.js', 'js/engine.js']) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
}
const ALL = vm.runInContext('ALL_EVENTS', ctx);
const map = require(target);

const esc = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
let ok = 0;
const miss = [];

for (const id of Object.keys(map)) {
  const e = ALL.find(x => x.id === id);
  if (!e) { miss.push(id + '（找不到事件）'); continue; }
  const M = map[id];
  const pairs = [[e.en, M.q]];
  if (e.ch && M.o) {
    e.ch.forEach((o, i) => {
      pairs.push([o.en, M.o[i]]);
      pairs.push([o.r && o.r.en, M.r[i]]);
    });
  }
  for (const [oldS, newS] of pairs) {
    if (!oldS || !newS) continue;
    const needle = "'" + esc(oldS) + "'";
    if (src.indexOf(needle) < 0) { miss.push(id + ' ← ' + oldS.slice(0, 36)); continue; }
    src = src.replace(needle, () => "'" + esc(newS) + "'");
    ok++;
  }
}

fs.writeFileSync(file, src);
console.log('替换 ' + ok + ' 处 | 未命中 ' + miss.length);
miss.slice(0, 12).forEach(m => console.log('  ✗ ' + m));

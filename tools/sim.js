/* 批量模拟：校验平衡性 + 生成分数分位表 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const files = ['js/data-countries.js', 'js/data-events.js', 'js/engine.js'];
const ctx = { console, Math, Date };
vm.createContext(ctx);
for (const f of files) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const E = ctx.LifeEngine;
const COUNTRIES = vm.runInContext('COUNTRIES', ctx);
const TIERS = vm.runInContext('TIERS', ctx);

const N = parseInt(process.argv[2] || '20000', 10);
const lives = [];
const byCountry = {}, achCount = {}, pcts = {}, edDist = {}, tierDist = {};
let years = 0, pendingLeft = 0;

for (let i = 0; i < N; i++) {
  let s = E.newLife(i * 7919 + 13);
  let guard = 0;
  while (s.alive && guard++ < 130) {
    E.tick(s);
    if (s.pending) {
      const idx = Math.floor(Math.random() * s.pending.ch.length);
      E.resolveChoice(s, idx);
    }
  }
  if (s.pending) pendingLeft++;
  E.finalize(s);
  if (!isFinite(s.score)) { console.error('NaN score at', i); process.exit(1); }
  lives.push(s);
  years += s.age;
  const b = byCountry[s.cid] = byCountry[s.cid] || { n:0, sumAge:0, sumScore:0 };
  b.n++; b.sumAge += s.age; b.sumScore += s.score;
  achCount[s.ach.length] = (achCount[s.ach.length] || 0) + 1;
  edDist[s.ed] = (edDist[s.ed] || 0) + 1;
  tierDist[s.tier] = (tierDist[s.tier] || 0) + 1;
}

const q = (arr, p) => { const a = arr.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
const scores = lives.map(s => s.score), ages = lives.map(s => s.age), wealths = lives.map(s => s.money);

console.log('样本:', N, ' 平均寿命:', (years / N).toFixed(1), ' 未决选择残留:', pendingLeft);
console.log('寿命 5/25/50/75/95/99:', [0.05,0.25,0.5,0.75,0.95,0.99].map(p => q(ages,p)).join(' / '));
console.log('财富 10/25/50/75/90/99:', [0.1,0.25,0.5,0.75,0.9,0.99].map(p => E.fmtMoney(q(wealths,p),'en')).join(' / '));
console.log('得分 1/10/25/50/75/90/99:', [0.01,0.1,0.25,0.5,0.75,0.9,0.99].map(p => q(scores,p).toFixed(1)).join(' / '));
console.log('财富 99.9/99.99:', [0.999,0.9999].map(p => E.fmtMoney(q(wealths,p),'en')).join(' / '),
  ' 亿万富翁:', lives.filter(s=>s.money>=1e9).length, '/', N,
  ' 负债:', (lives.filter(s=>s.money<0).length/N*100).toFixed(1)+'%');
console.log('阶层分布:', TIERS.map((t,i)=>t.zh+' '+(100*(tierDist[i]||0)/N).toFixed(2)+'%').join(' · '));
console.log('成就数分布:', JSON.stringify(achCount));
console.log('学历分布:', JSON.stringify(edDist));

/* 生成分位表 */
const mk = (arr) => { const a = arr.slice().sort((x,y)=>x-y); const o=[]; for(let i=0;i<=100;i++) o.push(Math.round(a[Math.min(a.length-1,Math.round(i/100*(a.length-1)))]*10)/10); return o; };
const eduP = [];
for (let k = 0; k <= 8; k++) eduP.push(Math.round(lives.filter(s => s.ed >= k).length / N * 1000) / 1000);
const table = { score: mk(scores), age: mk(ages), wealth: mk(wealths), happy: mk(lives.map(s=>s.jy)), eduP };
E.setDist(table);
lives.forEach(s => { s.pct = E.percentile(s.score); const rr=E.computeRarity(s); s.similar=rr.similar; s.rarity=rr.rarity; const g = E.grade(s.pct); pcts[g.k] = (pcts[g.k]||0)+1; });
console.log('评级分布:', JSON.stringify(pcts));
const sims = lives.map(s=>s.similar).sort((a,b)=>a-b);
console.log('相似人数 10/50/90/99 分位:', [0.1,0.5,0.9,0.99].map(x=>sims[Math.floor(x*sims.length)].toExponential(2)).join(' / '));

console.log('\n国家           样本  平均寿命(设定)  平均分');
Object.entries(byCountry).sort((a,b)=>b[1].n-a[1].n).slice(0,14).forEach(([k,v]) => {
  const c = COUNTRIES.find(x => x.id === k);
  console.log((k+' '+(c?c.zh:'')).padEnd(13,' '), String(v.n).padStart(5), ((v.sumAge/v.n).toFixed(1)+' ('+(c?c.life:'')+')').padStart(12), (v.sumScore/v.n).toFixed(1).padStart(7));
});

fs.writeFileSync(path.join(root, 'js/data-dist.js'),
  '/* 自动生成：' + N + ' 次模拟的分布表 */\nconst DIST = ' + JSON.stringify(table) + ';\n');
console.log('\n已写入 js/data-dist.js');

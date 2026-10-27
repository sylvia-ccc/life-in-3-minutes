/* 内容数据校验：加完国家/事件之后跑一遍，比在浏览器里点半天快得多
   用法：node tools/validate.js  （CI 里也会跑） */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { console, Math, Date };
vm.createContext(ctx);
for (const f of ['js/config.js', 'js/data-countries.js', 'js/data-events.js', 'js/data-dist.js', 'js/engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}

const C = vm.runInContext('COUNTRIES', ctx);
const REGIONS = vm.runInContext('REGIONS', ctx);
const TIERS = vm.runInContext('TIERS', ctx);
const ALL = vm.runInContext('ALL_EVENTS', ctx);
const E = ctx.LifeEngine;
const EDU_STYLE = vm.runInContext('EDU_STYLE', ctx);

const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const needStr = (v, where) => { if (typeof v !== 'string' || !v.trim()) err(where + ' 缺少文本'); };
const needNum = (v, where) => { if (typeof v !== 'number' || !isFinite(v)) err(where + ' 不是有效数字'); };

/* ---------- 国家 ---------- */
{
  const ids = new Set();
  C.forEach((c, i) => {
    const w = 'COUNTRIES[' + i + '] ' + (c.id || '?');
    needStr(c.id, w + ' id');
    if (ids.has(c.id)) err(w + ' id 重复');
    ids.add(c.id);
    needStr(c.zh, w + ' zh'); needStr(c.en, w + ' en');
    needStr(c.flag, w + ' flag');
    if (!REGIONS[c.region]) err(w + ' region 不存在：' + c.region);
    if (!EDU_STYLE[c.style]) err(w + ' style 不存在：' + c.style);
    needNum(c.pop, w + ' pop'); if (c.pop <= 0) err(w + ' 人口必须大于 0');
    needNum(c.life, w + ' life'); if (c.life < 25 || c.life > 100) warn(w + ' 预期寿命异常：' + c.life);
    needNum(c.gdp, w + ' gdp'); if (c.gdp <= 0) err(w + ' 人均产出必须大于 0');
    needNum(c.edu, w + ' edu'); needNum(c.mob, w + ' mob');
    if (c.edu < 0 || c.edu > 1) err(w + ' edu 应在 0~1');
    if (c.mob < 0 || c.mob > 1) err(w + ' mob 应在 0~1');
  });
  if (C.length < 2) err('国家太少');
}

/* ---------- 阶层 ---------- */
{
  if (TIERS.length !== 7) err('TIERS 应为 7 层，实际 ' + TIERS.length);
  ['TIER_FAM', 'TIER_START', 'TIER_START_MIN', 'TIER_CAP'].forEach(k => {
    const a = vm.runInContext(k, ctx);
    if (!Array.isArray(a) || a.length !== TIERS.length) err(k + ' 长度与 TIERS 不一致');
  });
  const cap = vm.runInContext('TIER_CAP', ctx);
  for (let i = 1; i < cap.length; i++) {
    if (cap[i] < cap[i - 1]) warn('TIER_CAP 不是递增的（第 ' + i + ' 层）');
  }
}

/* ---------- 事件 ---------- */
{
  const ids = new Set();
  const TYPES = ['g', 'b', 'n', 'm'];
  ALL.forEach((e, i) => {
    const w = '事件[' + i + '] ' + (e.id || '?');
    needStr(e.id, w + ' id');
    if (ids.has(e.id)) err(w + ' id 重复');
    ids.add(e.id);
    /* 可重复事件用 v:[[zh,en],...] 存多个版本，普通事件用 zh/en */
    if (e.v) {
      if (!Array.isArray(e.v) || !e.v.length) err(w + ' v 必须是非空数组');
      else e.v.forEach((pair, k) => {
        if (!Array.isArray(pair) || pair.length !== 2) err(w + ' v[' + k + '] 必须是 [中文, English]');
        else { needStr(pair[0], w + ' v[' + k + '] 中文'); needStr(pair[1], w + ' v[' + k + '] English'); }
      });
    } else {
      needStr(e.zh, w + ' zh'); needStr(e.en, w + ' en');
    }
    if (!Array.isArray(e.a) || e.a.length !== 2) err(w + ' a 必须是 [起始年龄, 结束年龄]');
    else {
      const [a0, a1] = e.a;
      needNum(a0, w + ' a[0]'); needNum(a1, w + ' a[1]');
      if (a0 > a1) err(w + ' 年龄区间倒置：' + a0 + ' > ' + a1);
      if (a0 < 0 || a1 > 120) err(w + ' 年龄超出 0~120');
    }
    needNum(e.w, w + ' 权重 w');
    if (e.w <= 0) err(w + ' 权重必须大于 0');
    if (!TYPES.includes(e.t)) err(w + ' 类型 t 只能是 g/b/n/m，实际 ' + e.t);
    if (e.c && typeof e.c !== 'function') err(w + ' 条件 c 必须是函数');
    if (e.rg && !Array.isArray(e.rg)) err(w + ' rg 必须是数组');
    if (e.cn && !Array.isArray(e.cn)) err(w + ' cn 必须是数组');
    if (e.rg) e.rg.forEach(r => { if (!REGIONS[r]) err(w + ' rg 引用了不存在的地区：' + r); });
    if (e.cn) {
      const set = new Set(C.map(c => c.id));
      e.cn.forEach(cid => { if (!set.has(cid)) err(w + ' cn 引用了不存在的国家：' + cid); });
    }
    if (e.ch) {
      if (!Array.isArray(e.ch) || e.ch.length < 2) err(w + ' 抉择至少要有 2 个选项');
      else e.ch.forEach((o, k) => {
        const ow = w + ' 选项[' + k + ']';
        needStr(o.zh, ow + ' zh'); needStr(o.en, ow + ' en');
        if (!o.r || !o.r.zh || !o.r.en) err(ow + ' 缺少结果文案 r');
        const hasEffect = o.fx || o.set || o.ed !== undefined || o.money || o.marry || o.kids || o.school !== undefined;
        if (!hasEffect) warn(ow + ' 没有任何效果，玩家会感觉选了个寂寞');
      });
    }
  });
  const choiceCount = ALL.filter(e => e.ch).length;
  if (choiceCount < 20) warn('抉择事件偏少（' + choiceCount + ' 个），玩家会很快见到底');
}

/* ---------- 成就 / 收集 ---------- */
{
  const ach = E.ACH_LIST;
  const s1 = new Set();
  ach.forEach((a, i) => {
    if (s1.has(a.id)) err('成就 id 重复：' + a.id);
    s1.add(a.id);
    if (!a.zh || !a.en) err('成就 ' + a.id + ' 缺少文案');
    if (typeof a.c !== 'function') err('成就 ' + a.id + ' 缺少判定函数 c');
  });
}

/* ---------- 分位表 ---------- */
{
  const D = vm.runInContext('DIST', ctx);
  if (!D || !D.score) err('DIST 缺失，请先跑 node tools/sim.js 40000');
  else {
    if (D.score.length !== 101) err('DIST.score 长度应为 101，实际 ' + D.score.length);
    for (let i = 1; i < D.score.length; i++) {
      if (D.score[i] < D.score[i - 1]) { err('DIST.score 不是单调递增（第 ' + i + ' 位）'); break; }
    }
    ['age', 'wealth', 'happy'].forEach(k => {
      if (!D[k] || D[k].length !== 101) err('DIST.' + k + ' 长度应为 101');
    });
    if (!D.eduP || D.eduP.length !== 9) err('DIST.eduP 长度应为 9');
  }
}

/* ---------- 汇总 ---------- */
const choiceN = ALL.filter(e => e.ch).length;
console.log('国家 ' + C.length + ' 个 · 事件 ' + ALL.length + ' 条（抉择 ' + choiceN + '） · 阶层 ' + TIERS.length +
  ' 层 · 成就 ' + E.ACH_LIST.length + ' 个');

if (warns.length) {
  console.log('\n提醒 ' + warns.length + ' 条：');
  warns.slice(0, 20).forEach(w => console.log('  · ' + w));
  if (warns.length > 20) console.log('  · …还有 ' + (warns.length - 20) + ' 条');
}

if (errors.length) {
  console.error('\n错误 ' + errors.length + ' 条：');
  errors.slice(0, 40).forEach(e => console.error('  ✗ ' + e));
  if (errors.length > 40) console.error('  ✗ …还有 ' + (errors.length - 40) + ' 条');
  process.exit(1);
}

console.log('\n校验通过 ✓');

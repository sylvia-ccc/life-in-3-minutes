/* ============================================================
   引擎层：一整个人生的推演（纯逻辑，可在 Node 中跑批量模拟）
   ============================================================ */

(function (root) {
'use strict';

/* ---------- 随机数 ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const R = { f: Math.random };
function rnd() { return R.f(); }
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function gauss(m, sd) {
  let u = 0, v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return m + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

/* ---------- 职业表 ---------- */
const JOBS = {
  0: [['无业','Unemployed',0.30],['零工','Odd-jobber',0.50],['拾荒者','Scavenger',0.40]],
  1: [['农民','Farmer',0.55],['建筑工','Construction worker',0.68],['小贩','Street vendor',0.52],['清洁工','Cleaner',0.48]],
  2: [['工厂工人','Factory worker',0.72],['司机','Driver',0.82],['服务员','Waiter',0.62],['快递员','Courier',0.78]],
  3: [['技工','Technician',0.95],['店员','Shop assistant',0.78],['保安','Security guard',0.68],['销售员','Salesperson',0.88]],
  4: [['护士','Nurse',1.05],['电工','Electrician',1.10],['厨师','Chef',1.00],['初级职员','Junior clerk',0.92]],
  5: [['会计','Accountant',1.40],['小学教师','Primary teacher',1.28],['技术员','Engineering tech',1.45],['公务员','Civil servant',1.22]],
  6: [['工程师','Engineer',1.90],['程序员','Software developer',2.10],['中学教师','School teacher',1.55],['医生','Doctor',2.30],['部门经理','Manager',1.85]],
  7: [['高级工程师','Senior engineer',2.55],['律师','Lawyer',2.85],['主治医师','Physician',3.05],['大学讲师','Lecturer',2.25]],
  8: [['研究员','Researcher',3.00],['主任医师','Chief physician',3.55],['大学教授','Professor',3.20],['企业高管','Executive',3.80]],
};

const EDU_NAME = [
  ['未上学','No schooling'], ['小学','Primary school'], ['初中','Lower secondary'],
  ['高中','High school'], ['中专/技校','Vocational'], ['大专','Associate degree'],
  ['本科','Bachelor\'s'], ['硕士','Master\'s'], ['博士','Doctorate'],
];

/* ---------- 财富格式 ---------- */
function fmtMoney(v, lang) {
  const neg = v < 0; const a = Math.abs(v);
  let s;
  if (lang === 'zh') {
    if (a >= 1e8) s = (a / 1e8).toFixed(a >= 1e9 ? 1 : 2) + '亿';
    else if (a >= 1e4) s = (a / 1e4).toFixed(a >= 1e5 ? 0 : 1) + '万';
    else s = Math.round(a).toString();
    return (neg ? '-$' : '$') + s;
  }
  if (a >= 1e9) s = (a / 1e9).toFixed(1) + 'B';
  else if (a >= 1e6) s = (a / 1e6).toFixed(a >= 1e7 ? 1 : 2) + 'M';
  else if (a >= 1e3) s = (a / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'k';
  else s = Math.round(a).toString();
  return (neg ? '-$' : '$') + s;
}

/* ---------- 出生 ----------
   投胎按人口加权，但做幂次压缩：纯人口权重下中印合计 36%，
   最小的国家约 1/3000，图鉴永远收不完。
   α=0.55 把中印压到约 6%，小国抬到 0.19%，既保留真实感又收得动。 */
const BIRTH_ALPHA = 0.55;
const BIRTH_W = (function () {
  const w = COUNTRIES.map(c => Math.pow(c.pop, BIRTH_ALPHA));
  const t = w.reduce((a, b) => a + b, 0);
  return w.map(x => x / t);
})();

function weightedCountry() {
  let r = rnd(), acc = 0;
  for (let i = 0; i < COUNTRIES.length; i++) { acc += BIRTH_W[i]; if (r <= acc) return COUNTRIES[i]; }
  return COUNTRIES[COUNTRIES.length - 1];
}

function makeName(c, gender) {
  const pool = NAMES[c.nm] || NAMES.eu;
  const g = gender === 'f' ? pool.f : pool.m;
  const given = pick(g);
  const last = pick(pool.l);
  const cjk = c.nm === 'cn' || c.nm === 'jp' || c.nm === 'kr';
  const native = cjk ? (c.nm === 'cn' ? last[0] + given[0] : last[0] + ' ' + given[0]) : given[1] + ' ' + last[1];
  const roman = cjk ? last[1] + ' ' + given[1] : given[1] + ' ' + last[1];
  return { n: native, r: roman };
}

function newLife(seed, opts) {
  R.f = (seed !== undefined) ? mulberry32(seed) : Math.random;

  /* 指定国家：只锁定出生地，家庭、天赋、事件仍然全部随机 */
  let c = null;
  if (opts && opts.country) c = COUNTRIES.find(x => x.id === opts.country) || null;
  if (!c) c = weightedCountry();
  const tw = tierWeights(c);
  let r = rnd(), acc = 0, tier = 0;
  for (let i = 0; i < tw.length; i++) { acc += tw[i]; if (r <= acc) { tier = i; break; } }

  const gender = rnd() < 0.505 ? 'm' : 'f';
  /* 城乡：按人均GDP 估一个城市化率，城市与农村是两种完全不同的人生 */
  const urbRate = clamp(0.18 + Math.log10(Math.max(400, c.gdp) / 400) / 2.6, 0.18, 0.93);
  const urban = rnd() < urbRate;
  const bonus = Math.round(tier * 4);
  const s = {
    seed, alive: true, age: 0,
    c, cid: c.id, region: c.region, style: c.style,
    name: makeName(c, gender), gender,
    tier, tierKey: TIERS[tier].key,
    urban,
    capRate: TIER_CAP[tier],
    hp: clamp(Math.round(gauss(64 + bonus, 13)), 8, 99),
    iq: clamp(Math.round(gauss(50 + bonus * 0.7, 15)), 5, 99),
    ap: clamp(Math.round(gauss(50 + bonus * 0.6, 15)), 5, 99),
    jy: clamp(Math.round(gauss(62 + bonus * 1.2, 10)), 20, 99),
    lk: clamp(Math.round(gauss(50, 18)), 1, 99),
    fam: TIER_FAM[tier],
    ed: 0, inSchool: false,
    money: 0, peak: 0, debtYears: 0,
    job: null, jobLevel: 1, income: 0, expenses: 0,
    married: false, kids: 0, house: false, retired: false, unemployed: false,
    fired: [], log: [], pending: null, ach: [], traitFlags: [], choiceLog: [],
    /* 上一局出现过的选择事件：本局降低权重，避免连着两局做同样的决定 */
    avoid: (opts && opts.avoid && opts.avoid.length) ? new Set(opts.avoid) : null,
  };

  if (s.iq >= 88) s.traitFlags.push('genius');
  if (s.ap >= 88) s.traitFlags.push('beauty');
  if (s.hp <= 30) s.traitFlags.push('frail');
  if (tier >= 5) s.traitFlags.push('elite');
  if (tier === 6) s.traitFlags.push('dynasty');
  if (tier === 0) s.traitFlags.push('destitute');

  s.birthRarity = 1 / ((c.pop / TOTAL_POP) * tw[tier] * 0.1 * 0.1 * 0.1);
  s.log.push({ age: 0, t: 'm', kind: 'birth' });
  return s;
}

/* ---------- 日志 ---------- */
function push(s, t, zh, en, fx) {
  s.log.push({ age: s.age, t, zh, en, fx: fx || null });
}

/* ---------- 工作与金钱 ---------- */
function eduMult(ed) { return [0.45, 0.55, 0.75, 1.00, 1.15, 1.45, 1.95, 2.60, 3.30][ed] || 0.45; }

function assignJob(s) {
  const list = JOBS[s.ed] || JOBS[0];
  const j = pick(list);
  s.job = { zh: j[0], en: j[1], mult: j[2] };
  s.jobLevel = 1 + (s.lk > 82 ? 1 : 0) + (s.fam >= 4 ? 1 : 0) + (s.ed >= 7 ? 1 : 0);
  s.unemployed = false;
  recalcIncome(s);
  push(s, 'm', '你成了一名' + j[0] + '。', 'You became a ' + j[1].toLowerCase() + '.');
}

function recalcIncome(s) {
  if (!s.job || s.retired) { s.income = 0; return; }
  const base = s.c.gdp * 0.45 * s.job.mult * eduMult(s.ed);
  const lvl = 1 + 0.22 * (s.jobLevel - 1);
  const exp = 0.85 + Math.min(0.45, s.age * 0.006);
  const luck = 0.85 + (s.lk / 100) * 0.35;
  s.income = Math.round(base * lvl * exp * luck);
}

function economy(s) {
  if (s.age < 16) return;
  /* 16 岁：家里给的起点。顶端两级用绝对下限兜底，穷国也可能有寡头 */
  if (s.age === 16) {
    const base = Math.max(TIER_START[s.tier] * s.c.gdp, TIER_START_MIN[s.tier]);
    s.money += base * (0.55 + rnd() * 0.9);
  }

  const c = s.c;

  if (!s.job && !s.retired && !s.inSchool && s.age >= 16 && s.age < 62) assignJob(s);

  /* 失业 */
  if (s.job && !s.retired && s.age < 62 && !s.inSchool) {
    const up = 0.012 + (s.ed <= 3 ? 0.016 : 0) + (c.gdp < 3000 ? 0.012 : 0);
    if (s.unemployed) {
      if (rnd() < 0.52) { s.unemployed = false; recalcIncome(s); push(s, 'g', '你重新找到了工作。', 'You found work again.'); }
    } else if (rnd() < up) {
      s.unemployed = true;
      push(s, 'b', '你失业了。', 'You lost your job.');
      s.jy = clamp(s.jy - 8, 0, 100);
    }
  }

  /* 升职 */
  if (s.job && !s.unemployed && !s.retired && s.age >= 20 && s.age < 60 && s.jobLevel < 5) {
    if (rnd() < 0.030 + s.iq * 0.0005 + (s.ed >= 6 ? 0.015 : 0)) {
      s.jobLevel++;
      recalcIncome(s);
      push(s, 'g', '你升职了。', 'You were promoted.');
      s.jy = clamp(s.jy + 5, 0, 100);
    }
  }

  let income = 0;
  if (s.inSchool && s.age >= 16) income = c.gdp * 0.06;
  else if (s.retired) income = c.gdp * 0.16 * (0.35 + 0.14 * s.fam) * (s.money > 2e5 ? 1.6 : 1);
  else if (!s.unemployed && s.job) income = s.income;
  if (income === 0 && s.age >= 18) income = c.gdp * 0.04 * (0.4 + c.edu);  // 救济/低保
  /* 城市收入高、开销也高；农村相反 */
  income *= s.urban ? 1.02 : 0.98;

  const fixed = c.gdp * 0.035 * (1 + (s.married ? 0.30 : 0) + (s.house ? 0.20 : 0) + 0.12 * s.kids)
    * (s.urban ? 1.07 : 0.93);
  let net = income * 0.40 - fixed;

  /* 资本回报：两极分化的引擎。越有钱，钱生钱越快；
     同时富人的开销也随资产一起膨胀——豪宅、私人飞机、整个团队。 */
  if (s.money > 0) {
    net += s.money * s.capRate * gauss(1, 0.30);
    if (s.tier >= 5) net -= s.money * 0.013;
  } else if (s.money < 0) {
    net -= Math.abs(s.money) * 0.045;
  }

  s.income = Math.round(income);
  s.expenses = Math.round(income * 0.60 + fixed);
  s.money += net;
  if (s.money > s.peak) s.peak = s.money;

  if (s.money < 0) {
    s.debtYears++;
    s.jy = clamp(s.jy - 0.6, 0, 100);
    if (s.money < -c.gdp * 3) s.jy = clamp(s.jy - 1.2, 0, 100);
  } else s.debtYears = 0;
}

/* ---------- 健康与情绪 ---------- */
function vitals(s) {
  /* 衰老：40 岁后体质自然下滑 */
  if (s.age > 40) {
    const decay = 0.22 + Math.pow(s.age - 40, 1.30) * 0.0072;
    s.hp -= decay * (s.hp > 72 ? 0.65 : 1);
  }
  /* 恢复：年轻时身体能自我修复，这让事件伤害不是永久惩罚 */
  if (s.age < 45 && s.hp < 66) s.hp += 2.0;
  else if (s.age < 62 && s.hp < 55) s.hp += 1.0;

  s.hp = clamp(s.hp, 0, 100);
  s.jy = clamp(s.jy + (52 - s.jy) * 0.05, 0, 100);
  if (s.age > 32) s.ap = clamp(s.ap - 0.22, 0, 100);
  if (s.age < 20) s.iq = clamp(s.iq + 0.5, 0, 100);
}

/* ---------- 死亡判定（Gompertz，按国家预期寿命校准） ---------- */
function deathCheck(s) {
  const le = s.c.life, a = s.age;
  const k = 0.095;
  const p0 = 0.693 * k / (Math.exp(k * le) - 1);
  let p = p0 * Math.exp(k * (a - 6));   // 健康折损补偿
  const hf = s.hp >= 45 ? 1 : s.hp >= 32 ? 1.22 : s.hp >= 18 ? 1.65 : 2.5;
  p *= hf;
  if (a <= 1) p += Math.pow(1 - s.c.edu, 2) * 0.038;
  if (a >= 16 && a < 45) p += 0.0007;
  return rnd() < Math.min(0.92, p);
}

function deathCause(s) {
  const a = s.age;
  const opts = a < 5
    ? [['一场急病带走了你。','A sudden illness took you.'],['那个冬天太冷了。','That winter was too cold.']]
    : a < 25
    ? [['一场意外。','An accident.'],['你没能撑过那场病。','You did not survive the illness.']]
    : a < 55
    ? [['身体先垮了。','Your body gave out first.'],['一场病来得太快。','The illness came too fast.'],['心脏在某个深夜停了下来。','Your heart stopped late one night.']]
    : a < 75
    ? [['你在医院里走完了最后一段。','You spent the last stretch in a hospital.'],['心脏停在了某个普通的下午。','Your heart stopped on an ordinary afternoon.'],['你没能等到下一个春天。','You did not make it to the next spring.']]
    : [['你在睡梦中离开了。','You left in your sleep.'],['走的时候很安静。','It was quiet at the end.'],['你活到了很多人没活到的年纪。','You reached an age many never see.']];
  return opts[Math.floor(rnd() * opts.length)];
}

function die(s, causeZh, causeEn) {
  s.alive = false;
  s.log.push({ age: s.age, t: 'm', kind: 'death', zh: causeZh, en: causeEn });
}

/* ---------- 事件触发 ---------- */
function eligible(s, e) {
  if (e.w === 0) return false;
  if (!e.rep && s.fired.indexOf(e.id) >= 0) return false;
  if (s.age < e.a[0] || s.age > e.a[1]) return false;
  if (e.cn && e.cn.indexOf(s.cid) < 0) return false;
  if (e.rg && e.rg.indexOf(s.region) < 0) return false;
  if (e.c && !e.c(s)) return false;
  return true;
}

function rollEvent(s) {
  const pool = [];
  let total = 0;
  for (const e of ALL_EVENTS) {
    if (!eligible(s, e)) continue;
    if (e.rep && e.id === s.lastId) continue;
    let w = e.w;
    /* 上一局做过的选择，本局权重打二折 */
    if (s.avoid && e.ch && s.avoid.has(e.id)) w *= 0.18;
    pool.push([e, w]); total += w;
  }
  if (!pool.length) return null;
  let r = rnd() * total;
  for (const it of pool) { r -= it[1]; if (r <= 0) return it[0]; }
  return pool[pool.length - 1][0];
}

function applyFx(s, fx) {
  if (!fx) return;
  if (fx.hp) s.hp = clamp(s.hp + fx.hp, 0, 100);
  if (fx.iq) s.iq = clamp(s.iq + fx.iq, 0, 100);
  if (fx.ap) s.ap = clamp(s.ap + fx.ap, 0, 100);
  if (fx.jy) s.jy = clamp(s.jy + fx.jy, 0, 100);
  if (fx.lk) s.lk = clamp(s.lk + fx.lk, 0, 100);
  if (fx.mo) {
    const unit = Math.max(s.c.gdp * 0.06, s.income * 0.28);
    if (s.age < 16) s.money = Math.max(0, s.money + fx.mo * unit * 0.2);  // 未成年由家庭承担
    else s.money += fx.mo * unit;
  }
  /* mul：按比例放大/缩水现有资产（并购、上市、崩盘）
     abs：绝对金额（遗产、和解金、罚款） */
  if (fx.mul) s.money = s.money * (1 + fx.mul);
  if (fx.abs) s.money += fx.abs;
  if (fx.fam) s.fam = clamp(s.fam + fx.fam, 0, 4);
}

/* ---------- 教育阶段 ---------- */
/* 家庭阶层对能否上学影响极大：顶层家庭的孩子几乎不可能失学 */
function schoolChance(s, stage) {
  const base = s.c.edu * (stage === 1 ? 0.92 : 0.95) + s.fam * 0.045;
  let p = base;
  if (s.fam >= 3) p = Math.max(p, 0.93);
  if (s.fam >= 4) p = Math.max(p, 0.985);
  return Math.min(0.995, p);
}

function educationStage(s) {
  const c = s.c, st = EDU_STYLE[c.style];
  const a = s.age;

  if (a === 6) {
    const p = schoolChance(s, 1);
    if (rnd() < p) {
      s.ed = 1; s.inSchool = true;
      push(s, 'm', '你上学了，背着家里缝的书包。', 'You started school with a bag sewn at home.');
    } else {
      s.inSchool = false;
      push(s, 'b', '家里没有让你上学。你的童年在田里和街上度过。', 'You were never sent to school. Your childhood was spent in fields and streets.');
      s.jy = clamp(s.jy - 6, 0, 100);
    }
    return true;
  }
  if (a === 11 && s.ed === 1) {
    if (rnd() < schoolChance(s, 2)) { s.ed = 2; s.inSchool = true; push(s, 'm', '你升入了初中。', 'You moved up to lower secondary school.'); }
    else { s.inSchool = false; push(s, 'n', '你小学毕业就离开了学校。', 'You left school after primary.'); }
    return true;
  }
  if (a === 15 && s.ed === 2) {
    const canAcademic = s.fam >= 1 || s.iq > 65;
    const opts = [];
    if (canAcademic) opts.push({
      zh: '继续读高中，准备考大学', en: 'Go to high school and aim for university',
      fx: { iq: 2 }, ed: 3, school: true,
      r: { zh: '你报了高中。班里四十个人，目标只有一个。', en: 'You enrolled in high school. Forty classmates, one goal.' },
    });
    opts.push({
      zh: '读技校，学一门手艺', en: 'Go to vocational school and learn a trade',
      fx: { iq: 2, jy: 2 }, ed: 4, school: true,
      r: { zh: '你进了技校。三年后你有一门手艺，比同学早三年挣钱。', en: 'You went to vocational school. Three years later you had a trade and a three-year head start.' },
    });
    opts.push({
      zh: '不读了，出去打工', en: 'Drop out and start working',
      fx: { hp: -3, jy: 1 }, ed: 2, school: false,
      r: { zh: '你背着包进了城。第一份工资你数了三遍。', en: 'You left for the city with a bag. You counted your first wage three times.' },
    });
    s.pending = {
      id: 'edu15', kind: 'choice',
      zh: '十五岁，你要决定接下来的路。', en: 'At fifteen, you had to decide what came next.',
      ch: opts,
    };
    return true;
  }
  if (a === 18 && s.ed === 3) {
    let cost = c.gdp * 0.55 * st.collegeCost * 2.6;
    if (s.fam >= 3) cost *= 0.3;
    const score = s.iq * 0.62 + s.fam * 7 + rnd() * 22;
    const opts = [];
    if (score > 48) opts.push({
      zh: '上大学', en: 'Go to university',
      fx: { iq: 6, jy: 6 }, money: -cost, ed: 6, school: true,
      r: { zh: '你考上了大学。四年后你拿到一张文凭，和一笔' + (cost > c.gdp * 2 ? '不小的债' : '不多的债') + '。',
           en: 'You got into university. Four years later: a degree and ' + (cost > c.gdp * 2 ? 'a real debt' : 'a small debt') + '.' },
    });
    opts.push({
      zh: '读大专，早点工作', en: 'Do a two-year associate degree',
      fx: { iq: 3, jy: 2 }, money: -cost * 0.4, ed: 5, school: true,
      r: { zh: '你读了两年大专，比本科生早两年进入社会。', en: 'Two years of associate study. You entered the workforce two years earlier.' },
    });
    opts.push({
      zh: '直接工作', en: 'Start working right away',
      fx: {}, ed: 3, school: false,
      r: { zh: '你没有再读书。同学们去考场的时候，你在上班。', en: 'You stopped studying. While classmates sat exams, you were on shift.' },
    });
    s.pending = {
      id: 'edu18', kind: 'choice',
      zh: '成绩出来了，你要选一条路。', en: 'The results are out. You had to choose a path.',
      ch: opts,
    };
    return true;
  }
  if (a === 22 && s.ed === 6) {
    const opts = [{
      zh: '继续读研', en: 'Do a master\'s',
      fx: { iq: 6, jy: 3, mo: -2 }, ed: 7, school: true,
      r: { zh: '你又读了三年。出来时，同龄人已经工作三年了。', en: 'Three more years. By then your peers had three years of work behind them.' },
    }, {
      zh: '开始工作', en: 'Start working',
      fx: {}, ed: 6, school: false,
      r: { zh: '你投了六十份简历，拿到三个面试。', en: 'Sixty applications, three interviews.' },
    }];
    s.pending = { id: 'edu22', kind: 'choice', zh: '本科毕业了，要接着读吗？', en: 'You graduated. Continue studying?', ch: opts };
    return true;
  }
  if (a === 25 && s.ed === 7 && s.iq >= 68) {
    const opts = [{
      zh: '读博', en: 'Do a PhD',
      fx: { iq: 8, jy: -6, mo: -2 }, ed: 8, school: true,
      r: { zh: '你读完了博士。答辩那天，你在走廊里坐了很久。', en: 'You finished the PhD. After the defence you sat in the corridor for a long time.' },
    }, {
      zh: '去工作', en: 'Go to work',
      fx: {}, ed: 7, school: false,
      r: { zh: '你带着硕士文凭进入职场，起薪比同龄人高。', en: 'You entered the workforce with a master\'s and a higher starting salary.' },
    }];
    s.pending = { id: 'edu25', kind: 'choice', zh: '硕士毕业，要读博吗？', en: 'Master\'s done. A PhD?', ch: opts };
    return true;
  }
  if (a === 18 && s.ed === 4 && s.inSchool) {
    s.inSchool = false;
    push(s, 'm', '你从技校毕业了，手里有一门手艺。', 'You finished vocational school with a trade in your hands.');
    return true;
  }
  if (a === 20 && s.ed === 5 && s.inSchool) {
    s.inSchool = false;
    push(s, 'm', '你大专毕业了。', 'You finished your associate degree.');
    return true;
  }
  if (a === 25 && s.ed === 7 && s.inSchool && s.iq < 68) {
    s.inSchool = false;
    push(s, 'm', '你硕士毕业了。', "You finished your master's.");
    return true;
  }
  if (a === 29 && s.ed === 8 && s.inSchool) {
    s.inSchool = false;
    push(s, 'm', '你博士毕业了。', 'You finished your doctorate.');
    return true;
  }
  if (a === 26 && s.inSchool && s.ed <= 7) { s.inSchool = false; return true; }
  if (a === 30 && s.inSchool) { s.inSchool = false; return true; }
  const retireAge = s.retireDelay ? 65 : 60;
  if (a === retireAge && s.job && !s.retired) {
    s.retired = true; s.income = 0;
    push(s, 'm', '你退休了。', 'You retired.');
    return true;
  }
  return false;
}

/* ---------- 婚育 ---------- */
function familyStage(s) {
  if (!s.married && s.age >= 22 && s.age <= 42) {
    const p = 0.055 + (s.ap - 50) * 0.0011 + (s.money > 0 ? 0.02 : -0.018) + (s.jy - 50) * 0.0007;
    if (rnd() < Math.max(0.008, p)) {
      s.married = true;
      const partner = makeName(s.c, s.gender === 'm' ? 'f' : 'm');
      push(s, 'm', '你和' + partner.n + '结婚了。', 'You married ' + partner.r + '.');
      s.jy = clamp(s.jy + 10, 0, 100);
      s.money -= Math.min(Math.max(0, s.money) * 0.35, s.c.gdp * 0.5);
    }
  }
  if (s.married && s.kids < 4 && s.age >= 23 && s.age <= 44) {
    const p = 0.16 * (1 - s.kids * 0.18) * (s.money > 0 ? 1 : 0.85);
    if (rnd() < p) {
      s.kids++;
      push(s, 'm', '你的第' + s.kids + '个孩子出生了。', 'Your child number ' + s.kids + ' was born.');
      s.jy = clamp(s.jy + 7, 0, 100);
    }
  }
}

/* ---------- 单年推进 ---------- */
function tick(s) {
  if (!s.alive || s.pending) return [];
  s.age++;
  const before = s.log.length;

  economy(s);
  vitals(s);
  familyStage(s);

  if (deathCheck(s)) { const dc = deathCause(s); die(s, dc[0], dc[1]); return s.log.slice(before); }

  educationStage(s);

  if (!s.pending) {
    const n = rnd() < 0.22 ? 0 : (rnd() < 0.80 ? 1 : 2);
    for (let i = 0; i < n; i++) {
      const e = rollEvent(s);
      if (!e) break;
      if (!e.rep) s.fired.push(e.id);
      s.lastId = e.id;
      if (e.ch) {
        s.pending = {
          id: e.id, kind: 'choice', zh: e.zh, en: e.en,
          ch: e.ch.filter(o => !o.c || o.c(s)),
          meta: e,
        };
        break;
      }
      const txt = e.v ? e.v[Math.floor(rnd() * e.v.length)] : [e.zh, e.en];
      push(s, e.t, txt[0], txt[1], e.fx);
      applyFx(s, e.fx);
      if (e.set) Object.assign(s, e.set);
    }
  }

  if (s.hp <= 0 && s.alive) die(s, '身体彻底垮了。', 'Your body finally gave out.');
  return s.log.slice(before);
}

/* ---------- 选择 ---------- */
function resolveChoice(s, idx) {
  const p = s.pending;
  if (!p) return [];
  const opt = p.ch[idx];
  p.opts = p.ch;
  s.pending = null;
  if (!opt) return [];
  s.fired.push(p.id);
  if (p.opts && p.opts.length > 1) {
    s.choiceLog.push({
      age: s.age, id: p.id, zh: p.zh, en: p.en, picked: idx,
      opts: p.opts.map(o => ({ zh: o.zh, en: o.en, r: o.r })),
    });
  }
  if (opt.ed !== undefined) s.ed = Math.max(s.ed, opt.ed);
  if (opt.school !== undefined) s.inSchool = opt.school;
  applyFx(s, opt.fx);
  if (opt.money) {
    const mv = typeof opt.money === 'function' ? opt.money(s) : opt.money;
    s.money += mv;
  }
  if (opt.marry) { s.married = true; s.jy = clamp(s.jy + 8, 0, 100); }
  if (opt.kids) {
    s.kids += opt.kids;
    s.jy = clamp(s.jy + 6, 0, 100);
  }
  if (opt.set) Object.assign(s, opt.set);

  if (opt.roll === 'invest') {
    if (rnd() < 0.42) {
      s.money += s.c.gdp * (1.5 + rnd() * 3);
      push(s, 'g', '你赌赢了。账户里的数字让你刷新了好几遍。', 'You won. You refreshed the page several times.', { mo: 2 });
      s.jy = clamp(s.jy + 8, 0, 100);
    } else {
      s.money -= Math.max(0, s.money * (0.4 + rnd() * 0.4));
      push(s, 'b', '你赌输了。数字消失的速度比出现时快得多。', 'You lost. The numbers vanished far faster than they appeared.');
      s.jy = clamp(s.jy - 10, 0, 100);
    }
  } else {
    push(s, opt.t || 'n', opt.r.zh, opt.r.en, opt.fx);
  }
  if (!s.job && !s.retired && !s.inSchool && s.age >= 16 && s.age < 62) assignJob(s);
  return [s.log[s.log.length - 1]];
}

/* ---------- 结局评分 ----------
   顺序即展示优先级：越稀有的越靠前，卡片只取前 4 个 */
const ACH_LIST = [
  { id:'tycoon',   zh:'商业帝国', en:'A Business Empire', c:s => s.money >= 1e8 },
  { id:'billion',  zh:'亿万身家', en:'Ten Figures',     c:s => s.money >= 1e9 },
  { id:'dynasty',  zh:'生在终点线', en:'Born at the Finish', c:s => s.tier === 6 },
  { id:'rich',     zh:'百万富翁', en:'Millionaire',     c:s => s.money >= 8e5 },
  { id:'longlife', zh:'长寿之人', en:'Long-lived',      c:s => s.age >= 90 },
  { id:'scholar',  zh:'博士',     en:'Doctorate',       c:s => s.ed >= 8 },
  { id:'selfmade', zh:'白手起家', en:'Self-made',       c:s => s.fam <= 1 && s.money >= 2e5 },
  { id:'parent',   zh:'为人父母', en:'A Parent',        c:s => s.kids >= 1 },
  { id:'educated', zh:'高等教育', en:'College Educated', c:s => s.ed >= 5 },
  { id:'happy',    zh:'幸福一生', en:'A Happy Life',    c:s => s.jy >= 78 },
  { id:'family',   zh:'儿孙满堂', en:'Big Family',      c:s => s.kids >= 3 },
  { id:'healthy',  zh:'无疾而终', en:'Died Peacefully', c:s => s.age >= 85 && s.hp >= 50 },
  { id:'climb',    zh:'逆天改命', en:'Defied the Odds', c:s => s.fam === 0 && s.ed >= 6 },
  { id:'alone',    zh:'孤独终老', en:'Died Alone',      c:s => s.kids === 0 && !s.married && s.age >= 75 },
  { id:'career',   zh:'事业巅峰', en:'Career Peak',     c:s => s.jobLevel >= 5 && s.ed >= 6 },
  { id:'late',     zh:'大器晚成', en:'Late Bloomer',    c:s => s.money >= 3e5 && s.age >= 60 },
  { id:'survivor', zh:'历经磨难', en:'Survivor',        c:s => s.debtYears >= 8 && s.money > 0 },
  { id:'rags',     zh:'一贫如洗', en:'Not a Penny',     c:s => s.money <= 0 && s.age >= 60 },
  { id:'street',   zh:'街头长大', en:'Raised on the Street', c:s => s.fam === 0 && s.age >= 70 },
];

function finalize(s) {
  s.alive = false;
  s.ach = ACH_LIST.filter(a => a.c(s)).map(a => a.id);
  const nw = clamp((Math.log10(Math.max(s.money, 0) + 1200) - 2.7) / 6.6, 0, 1);
  const lf = clamp(s.age / 96, 0, 1);
  const hp = s.jy / 100;
  const ed = s.ed / 8;
  const ac = Math.min(s.ach.length, 6) / 6;
  const base = 100 * (0.32 * nw + 0.24 * hp + 0.17 * lf + 0.12 * ed + 0.15 * ac);
  const climb = (s.fam <= 1 && s.money >= 2e5) ? 3 : 0;
  s.score = Math.round((base + climb) * 10) / 10;
  s.pct = percentile(s.score);
  const rr = computeRarity(s);
  s.similar = rr.similar;
  s.rarity = rr.rarity;
  return s;
}

let DIST = null;

/* 尾部概率：P(X >= v)，来自批量模拟的分位表 */
function tailProb(arr, v) {
  if (!arr) return 0.5;
  if (v <= arr[0]) return 1;
  if (v >= arr[arr.length - 1]) return 1 / 400;
  let lo = 0, hi = arr.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arr[m] <= v) lo = m; else hi = m; }
  const f = (v - arr[lo]) / Math.max(1e-6, arr[hi] - arr[lo]);
  return Math.max(1 / 400, 1 - (lo + f) / (arr.length - 1));
}

function percentile(score) {
  if (!DIST || !DIST.score) return 50;
  const T = DIST.score;
  let lo = 0, hi = T.length - 1;
  if (score <= T[0]) return 0.5;
  if (score >= T[hi]) return 99.99;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (T[mid] <= score) lo = mid; else hi = mid;
  }
  const f = (score - T[lo]) / Math.max(1e-6, T[hi] - T[lo]);
  return Math.min(99.99, (lo + f) / (T.length - 1) * 100);
}

/* 命运稀有度：四个维度尾部概率相乘，换算成地球上还有多少人像你 */
function computeRarity(s) {
  if (!DIST) return { similar: 1e9, rarity: 1 };
  const pA = tailProb(DIST.age, s.age);
  const pW = tailProb(DIST.wealth, s.money);
  const pH = tailProb(DIST.happy, s.jy);
  const pE = (DIST.eduP && DIST.eduP[s.ed] !== undefined) ? DIST.eduP[s.ed] : 0.3;
  const joint = Math.max(1e-12, pA * pW * pH * pE);
  return { similar: 8e9 * joint, rarity: 1 / joint };
}

function grade(pct) {
  if (pct >= 99.5) return { k:'SSS', zh:'传说', en:'Legendary' };
  if (pct >= 98) return { k:'SS', zh:'罕见', en:'Rare' };
  if (pct >= 92) return { k:'S', zh:'出众', en:'Outstanding' };
  if (pct >= 80) return { k:'A', zh:'不错', en:'Good' };
  if (pct >= 60) return { k:'B', zh:'普通', en:'Ordinary' };
  if (pct >= 35) return { k:'C', zh:'平凡', en:'Modest' };
  if (pct >= 15) return { k:'D', zh:'艰难', en:'Hard' };
  return { k:'E', zh:'苦难', en:'Harsh' };
}

/* ---------- 回溯 ----------
   从某个岔路重走一生：前面的选择按 picks 复现，到 forkIdx 换成 altIdx，之后随机。
   分叉那一刻会重新掷骰子——很多选择本身不消耗随机数，
   不重掷的话后面的事件流会和原来一模一样，等于没换路。 */
function replay(seed, picks, forkIdx, altIdx, country) {
  const s = newLife(seed, { country: country || null });
  s.seed = seed;
  let guard = 0, ci = 0;
  while (s.alive && guard++ < 130) {
    tick(s);
    if (s.pending) {
      let pick;
      if (ci < forkIdx) pick = (picks && picks[ci] !== undefined) ? picks[ci] : 0;
      else if (ci === forkIdx) pick = altIdx;
      else pick = Math.floor(rnd() * s.pending.ch.length);
      if (pick >= s.pending.ch.length) pick = s.pending.ch.length - 1;
      resolveChoice(s, pick);
      if (ci === forkIdx) {
        const h = (seed ^ Math.imul(forkIdx + 1, 2654435761) ^ Math.imul(altIdx + 1, 40503)) >>> 0;
        R.f = mulberry32(h);
      }
      ci++;
    }
  }
  finalize(s);
  return s;
}

const API = {
  newLife, tick, resolveChoice, finalize, replay, fmtMoney, grade, percentile, computeRarity,
  EDU_NAME, ACH_LIST, TIERS, setDist(d) { DIST = d; }, getDist() { return DIST; },
  _rng: R, mulberry32,
};

if (typeof module !== 'undefined' && module.exports) module.exports = API;
root.LifeEngine = API;

})(typeof globalThis !== 'undefined' ? globalThis : this);

/* ============================================================
   应用层：界面、节奏、存档
   ============================================================ */
(function () {
'use strict';

const E = window.LifeEngine;
if (typeof DIST !== 'undefined') E.setDist(DIST);

/* ---------------- 文案 ---------------- */
const T = {
  zh: {
    brand: '模拟人生', brandSub: '3 分钟看完一生', gal: '命运图鉴',
    wl1: '地球上现有', wl2: '人',
    startTitle: '你出生在<br><em>哪里</em>，从来由不得你',
    startSub: 'A LIFE SIMULATOR',
    startLead: '随机投胎到一个国家，随机拿到一副身体、一个家庭。<br>然后几十年，几万天，眨眼就过去。<br>有人三分钟走完一生，有人要一个小时。',
    startBtn: '投 胎', startHint: '按 <kbd>空格</kbd> 暂停 · <kbd>R</kbd> 重新投胎 · 每一局都不一样',
    bcLabel: '出 生 证 明', bcFamily: '家庭', bcEdu: '教育体系', begin: '开始这一生',
    bcLife: '预期寿命', bcGdp: '人均产出', lifeAvg: '这个国家的平均水平', gdpAvg: '人均年产出',
    fullLog: '查看完整记录', fullLogClose: '收起完整记录',
    hp: '体质', iq: '智力', ap: '颜值', jy: '快乐', ageUnit: '岁',
    logTitle: '人 生 记 录',
    edu: '学历', job: '职业', money: '净财富', married: '婚姻', kids: '子女',
    single: '未婚', wed: '已婚', childless: '无', none: '无',
    again: '再投一次胎', share: '复制这一生', back: '返回',
    gTitle: '命运图鉴', hlTitle: '这一生的几个瞬间',
    similarK: '地球上像你这样的人', rarityK: '命运稀有度',
    lifeN: '第 {n} 次人生',
    stage: ['童年', '少年', '青年', '中年', '晚年', '暮年'],
    copied: '已复制到剪贴板',
    newAch: '解锁',
    noAch: '这一生，没有拿到任何称号。',
    common: '常见', uncommon: '少见', rare: '罕见', veryRare: '极其罕见',
    overall: '综合评分', betterThan: '超过了 {p}% 的人生',
    lifespan: '寿命', onlyYou: '你是唯一',
    inSchool: '在读', noJob: '无', notYet: '—',
    forkTitle: '未 走 的 路', forkOther: '没走的那条', forkMore: '中 间 还 有 {n} 次 抉 择',
    cardBtn: '人生卡片', cardTitle: '人 生 卡 片', cardSave: '保存图片',
    cardClose: '关闭', cardHint: '长按图片也可以直接保存',
    cardWho: '地球上像你这样的人', cardTimes: '第 {n} 次人生',
    cardAch: '这一生的称号', cardNone: '没有称号',
  },
  en: {
    brand: 'Life in 3 Minutes', brandSub: '模拟人生 · 3分钟看完一生', gal: 'Archive',
    wl1: 'There are', wl2: 'people on Earth',
    startTitle: 'Where you are born<br>was never <em>your</em> choice',
    startSub: 'A LIFE SIMULATOR',
    startLead: 'A random country, a random body, a random family.<br>Then a few decades, a few thousand days, gone.<br>Some lives take three minutes. Some take an hour.',
    startBtn: 'BE BORN', startHint: 'Press <kbd>Space</kbd> to pause · <kbd>R</kbd> to be born again',
    bcLabel: 'BIRTH CERTIFICATE', bcFamily: 'FAMILY', bcEdu: 'SCHOOL SYSTEM', begin: 'LIVE THIS LIFE',
    bcLife: 'LIFE EXPECTANCY', bcGdp: 'OUTPUT PER HEAD', lifeAvg: 'National average', gdpAvg: 'GDP per capita',
    fullLog: 'FULL LOG', fullLogClose: 'HIDE LOG',
    hp: 'Health', iq: 'Mind', ap: 'Looks', jy: 'Joy', ageUnit: 'yrs',
    logTitle: 'LIFE LOG',
    edu: 'Education', job: 'Work', money: 'Net worth', married: 'Marital', kids: 'Children',
    single: 'Single', wed: 'Married', childless: 'None', none: 'None',
    again: 'BE BORN AGAIN', share: 'COPY THIS LIFE', back: 'BACK',
    gTitle: 'FATE ARCHIVE', hlTitle: 'A FEW MOMENTS',
    similarK: 'People like you on Earth', rarityK: 'Fate rarity',
    lifeN: 'Life #{n}',
    stage: ['Childhood', 'Teens', 'Youth', 'Midlife', 'Older', 'Old age'],
    copied: 'Copied to clipboard',
    newAch: 'Unlocked',
    noAch: 'No titles this time.',
    common: 'Common', uncommon: 'Uncommon', rare: 'Rare', veryRare: 'Extremely rare',
    overall: 'Overall', betterThan: 'better than {p}% of all lives',
    lifespan: 'Lifespan', onlyYou: 'Only you',
    inSchool: 'In school', noJob: 'None', notYet: '—',
    forkTitle: 'THE ROAD NOT TAKEN', forkOther: 'The other road', forkMore: '+{n} MORE CHOICES',
    cardBtn: 'Life card', cardTitle: 'L I F E   C A R D', cardSave: 'Save image',
    cardClose: 'Close', cardHint: 'Or long-press the image to save it',
    cardWho: 'People like you on Earth', cardTimes: 'Life #{n}',
    cardAch: 'Titles from this life', cardNone: 'No titles',
  }
};
const t = k => T[lang][k];

const EDU_DESC = {
  exam:       { zh: '考试决定很多事', en: 'Exams decide a lot' },
  liberal:    { zh: '学费昂贵，选择自由', en: 'Expensive, but flexible' },
  vocational: { zh: '一半学徒，一半课堂', en: 'Half workshop, half classroom' },
  free:       { zh: '学费全免', en: 'Tuition is free' },
  scarce:     { zh: '能上学已经是运气', en: 'Schooling itself is luck' },
  standard:   { zh: '按部就班', en: 'Standard track' },
};
const TRAITS = {
  genius:    { zh: '天生聪慧', en: 'Gifted', good: 1 },
  beauty:    { zh: '天生好看', en: 'Striking', good: 1 },
  frail:     { zh: '体弱多病', en: 'Frail', good: 0 },
  elite:     { zh: '生在顶层', en: 'Born at the top', good: 1 },
  dynasty:   { zh: '姓氏值钱', en: 'A name worth money', good: 1 },
  destitute: { zh: '生在赤贫', en: 'Born in poverty', good: 0 },
};

/* 年龄感悟 */
const MUSINGS = [
  { a: 7,  zh: '那时候你以为，夏天永远不会结束。', en: 'Back then you thought summer would never end.' },
  { a: 18, zh: '十八岁，你觉得一切都还来得及。', en: 'At eighteen, you believed there was still time for everything.' },
  { a: 24, zh: '你开始明白，有些门一旦关上就不会再开。', en: 'You began to understand that some doors, once shut, stay shut.' },
  { a: 31, zh: '三十一岁，你不再和人解释自己。', en: 'At thirty-one, you stopped explaining yourself to people.' },
  { a: 38, zh: '你偶尔会想起一个很久没联系的人。', en: 'Now and then you thought of someone you had not called in years.' },
  { a: 45, zh: '四十五岁，你发现自己越来越像父亲。', en: 'At forty-five, you noticed you were becoming your father.' },
  { a: 52, zh: '你开始计算，还剩下多少个春天。', en: 'You started counting how many springs were left.' },
  { a: 63, zh: '你把旧照片翻出来，认了很久才认出自己。', en: 'You dug out old photos and took a long time to recognise yourself.' },
  { a: 72, zh: '你发现，能记住的人越来越少了。', en: 'You realised there were fewer and fewer people left to remember.' },
  { a: 84, zh: '你已经不太在意明天了。', en: 'You stopped caring much about tomorrow.' },
];

/* 出生场景描写 */
const PLACE = {
  eastAsia:      { zh: '家在一座快速扩张的城市边缘，楼下是修车铺和便利店。', en: 'Home was on the edge of a fast-growing city, above a repair shop and a convenience store.' },
  southAsia:     { zh: '家在一个闷热的院子里，街上永远是喇叭声。', en: 'Home was a sweltering courtyard where the street never stopped honking.' },
  southeastAsia: { zh: '家在一间临水的木屋里，雨季时地板会渗水。', en: 'Home was a wooden house on the water; in the rainy season the floor seeped.' },
  middleEast:    { zh: '家在一座土黄色的城里，夏天热得能烫伤手。', en: 'Home was in an ochre city where summer burns your hands.' },
  africa:        { zh: '家是一间铁皮屋顶的屋子，停电是每天的事。', en: 'Home was under a tin roof, where the power cuts every day.' },
  europe:        { zh: '家在一栋老楼的四层，窗外是有轨电车的声音。', en: 'Home was on the fourth floor of an old building, above the sound of trams.' },
  latam:         { zh: '家在山坡上的一片房子里，远处能看见整座城市。', en: 'Home was on a hillside of houses, the whole city visible below.' },
  northAmerica:  { zh: '家是一栋带车库的房子，草坪修剪得很整齐。', en: 'Home was a house with a garage and a very neatly mowed lawn.' },
  oceania:       { zh: '家在一座靠海的小城，空气里有盐的味道。', en: 'Home was a small coastal town where the air tastes of salt.' },
  centralAsia:   { zh: '家在草原边的一座城里，冬天长得看不到尽头。', en: 'Home was a city at the edge of the steppe, where winter never seems to end.' },
};
/* 出生场景描写（富裕及以上用另一套） */
const PLACE_UP = {
  eastAsia:      { zh: '家在一栋高层公寓的二十几层，楼下是商场和地铁口。', en: 'Home was on the twentieth floor of a tower, above a mall and a subway entrance.' },
  southAsia:     { zh: '家在一条安静的街上，院子里有芒果树，门口停着一辆带司机的车。', en: 'Home was on a quiet street with a mango tree in the yard and a car with a driver at the gate.' },
  southeastAsia: { zh: '家在一片带围墙的住宅区里，保安认得每一辆车。', en: 'Home was inside a gated estate where the guard knew every car.' },
  middleEast:    { zh: '家是一栋有空调和水池的房子，窗外是整片沙色的城。', en: 'Home was a house with air conditioning and a pool, the sand-coloured city spread below.' },
  africa:        { zh: '家在城里最好的那一片，停电的时候有发电机。', en: 'Home was in the best part of town, with a generator for the power cuts.' },
  europe:        { zh: '家在一栋有电梯的老公寓顶层，阳台能看到整条河。', en: 'Home was the top floor of an old building with a lift, the river visible from the balcony.' },
  latam:         { zh: '家在山顶的封闭社区里，铁门后面是另一种城市。', en: 'Home was in a gated community on the hill; behind the gate was a different city.' },
  northAmerica:  { zh: '家是一栋带院子的房子，后院有一架秋千。', en: 'Home was a house with a yard and a swing in the back.' },
  oceania:       { zh: '家在半山上，阳台上能看到海。', en: 'Home was halfway up a hill, the sea visible from the balcony.' },
  centralAsia:   { zh: '家在一栋翻修过的公寓里，冬天暖气烧得很足。', en: 'Home was a renovated flat where the heating ran hot all winter.' },
};
/* 顶级富豪家庭：另一套完全不同的出生场景 */
const PLACE_TOP = {
  eastAsia:      { zh: '出生那天，私立医院的整层都被包下，走廊里站着你不认识的人。', en: 'The whole floor of a private hospital was booked. Strangers stood in the corridor.' },
  southAsia:     { zh: '家在城中最深的那条林荫道尽头，铁门后面是十几个人在等你出生。', en: 'Home was at the end of the deepest tree-lined road in the city; a dozen people waited behind the gate.' },
  southeastAsia: { zh: '你出生在一栋有独立电梯的顶层公寓里，楼下停着三辆车。', en: 'You were born in a penthouse with its own lift. Three cars waited downstairs.' },
  middleEast:    { zh: '你出生时，家族的生意已经覆盖了三个国家，名字写在很多份合同上。', en: 'By your birth, the family business already spanned three countries and signed a great many contracts.' },
  africa:        { zh: '你出生在一间有发电机、有私人医生的宅子里，墙外是另一座城。', en: 'You were born in a house with a generator and a private doctor. Outside the wall was another city.' },
  europe:        { zh: '你出生在一个有名字的老宅里，那栋房子比你家族的很多记忆都老。', en: 'You were born in a named old house, older than most of your family\'s memories.' },
  latam:         { zh: '你出生在山上最高的那栋房子里，山下的人都知道那个姓氏。', en: 'You were born in the highest house on the hill. Everyone below knew the surname.' },
  northAmerica:  { zh: '你出生时，家族基金已经为你设好了账户，新闻稿也写好了。', en: 'A trust was set up in your name before you could cry, and the press release was already drafted.' },
  oceania:       { zh: '你出生在一座能看见整片海湾的房子里，码头停着一条船。', en: 'You were born in a house overlooking the whole bay, with a boat at the jetty.' },
  centralAsia:   { zh: '你出生在一个和权力走得很近的家庭，很多事不需要开口。', en: 'You were born into a family close to power. Many things never needed to be asked for.' },
};

const FAMILY_LINE = [
  { zh: '家里没有电，也没有多余的一双鞋。', en: 'There was no electricity, and not a spare pair of shoes.' },
  { zh: '父母每天醒来第一件事，是算今天能挣到多少。', en: 'The first thing your parents did each morning was count what the day could bring in.' },
  { zh: '家里不富裕，但饭桌上总有热的东西。', en: 'Not rich, but there was always something hot on the table.' },
  { zh: '你有一整间自己的房间，周末有人送你去上课。', en: 'You had your own room, and someone drove you to lessons on weekends.' },
  { zh: '你从小就有一本护照，上面盖过好几个国家的章。', en: 'You had a passport before you could read, and it filled up quickly.' },
  { zh: '你出生那天，医院的整层都为你清空了。', en: 'On the day you were born, a whole floor of the hospital was cleared for you.' },
  { zh: '你出生那天，公司发了公告，股价涨了一点。', en: 'On the day you were born, the company issued a notice and the share price moved.' },
];

/* ---------------- 存档 ---------------- */
const LS = GAME.storageKey;
const LS_V0 = 'oieb.v1';
function loadStore() {
  try {
    /* 早期版本用过另一个 key，读到就迁过来，别让老玩家的图鉴白攒 */
    let raw = localStorage.getItem(LS);
    if (!raw) {
      const legacy = localStorage.getItem(LS_V0);
      if (legacy) { raw = legacy; localStorage.setItem(LS, legacy); }
    }
    const s = JSON.parse(raw || '{}');
    return Object.assign({ lang: null, runs: [], countries: {}, tiers: {}, ach: {}, milestones: {}, best: {} }, s);
  } catch (e) { return { lang: null, runs: [], countries: {}, tiers: {}, ach: {}, milestones: {}, best: {} }; }
}
let store = loadStore();
let lang = store.lang || GAME.lang;
function saveStore() { try { localStorage.setItem(LS, JSON.stringify(store)); } catch (e) {} }

/* ---------------- 运行时状态 ---------------- */
let S = null;
let timer = null;
let speed = 1;
let paused = false;
let currentScreen = 'scrStart';
let wasPlaying = false;
let runIndex = 0;
let lastPrev = null;

const $ = id => document.getElementById(id);
const DELAY = { 1: 1000, 2: 470, 4: 210, 12: 65 };

/* ---------------- 埋点（访问统计） ----------------
   只在 http(s) 下上报；单文件离线版（file://）自动静默。
   服务端只存加盐 IP 哈希，不存原始 IP。 */
const SITE = GAME.site;
const TRACK_ON = GAME.track && (location.protocol === 'http:' || location.protocol === 'https:');
let SID = '';
try {
  SID = sessionStorage.getItem('life3m.sid') || '';
  if (!SID) {
    SID = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem('life3m.sid', SID);
  }
} catch (e) { SID = Date.now().toString(36); }

const T0 = Date.now();
const tkSent = {};
let tkLeft = false;

/* 停留时长只算「页面可见」的时间：切到后台的标签页不计入，
   否则一个挂着不管的页面能报出几小时的假数据。 */
let tkSeg = Date.now();
let tkActive = 0;
function tkDur() {
  const extra = document.visibilityState === 'visible' ? Date.now() - tkSeg : 0;
  return Math.round((tkActive + extra) / 1000);
}

function track(t, extra) {
  if (!TRACK_ON) return;
  const body = JSON.stringify(Object.assign({
    t: t, sid: SID, lang: lang,
    vw: window.innerWidth || 0,
    ref: (document.referrer || '').slice(0, 100)
  }, extra || {}));
  try {
    if (navigator.sendBeacon) {
      if (navigator.sendBeacon('/c', new Blob([body], { type: 'application/json' }))) return;
    }
  } catch (e) {}
  try {
    fetch('/c', {
      method: 'POST', body: body, keepalive: true,
      headers: { 'Content-Type': 'application/json' }
    }).catch(function () {});
  } catch (e) {}
}
function trackOnce(t, extra) {
  if (tkSent[t]) return;
  tkSent[t] = 1;
  track(t, extra);
}
function trackLeave() {
  if (tkLeft) return;
  tkLeft = true;
  track('leave', { dur: tkDur() });
}

/* ---------------- 工具 ---------------- */
function fmtInt(n) { return Math.round(n).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US'); }
function fmtBig(n) {
  if (!isFinite(n)) return '∞';
  if (lang === 'zh') {
    if (n >= 1e8) return (n / 1e8).toFixed(n >= 1e9 ? 0 : 1) + '亿';
    if (n >= 1e4) return (n / 1e4).toFixed(n >= 1e5 ? 0 : 1) + '万';
    return fmtInt(n);
  }
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(0) + 'k';
  return fmtInt(n);
}
function rarityStr(r) {
  if (r >= 1e8) return '1 / ' + (lang === 'zh' ? (r / 1e8).toFixed(1) + '亿' : (r / 1e9).toFixed(2) + 'B');
  if (r >= 1e4) return '1 / ' + fmtInt(r);
  return '1 / ' + Math.round(r);
}
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  currentScreen = id;
  if (id === 'scrEnd' || id === 'scrGallery') $(id).scrollTop = 0;
}
function toast(msg, tag) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.innerHTML = (tag ? '<span class="g">' + tag + '</span>' : '') + '<span>' + msg + '</span>';
  const box = $('toasts');
  box.appendChild(d);
  while (box.children.length > 3) box.removeChild(box.firstChild);
  setTimeout(() => { d.style.transition = 'opacity .4s, transform .4s'; d.style.opacity = '0'; d.style.transform = 'translateY(8px)'; }, 2200);
  setTimeout(() => d.remove(), 2700);
}

/* ---------------- 语言 ---------------- */
function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = lang === 'zh' ? GAME.title : GAME.titleEn + ' — Your Whole Life, Start to Finish';
  $('brandTitle').textContent = t('brand');
  $('brandSub').textContent = t('brandSub');
  $('galLabel').textContent = t('gal');
  $('btnLang').textContent = lang === 'zh' ? 'EN' : '中';
  $('wl1').textContent = t('wl1');
  $('wl2').textContent = t('wl2');
  $('startTitle').innerHTML = t('startTitle');
  $('startSub').textContent = t('startSub');
  $('startLead').innerHTML = t('startLead');
  $('startBtn').textContent = t('startBtn');
  $('startHint').innerHTML = store.runs.length
    ? (lang === 'zh'
        ? '你已经投胎过 <b>' + store.runs.length + '</b> 次<br>' + t('startHint')
        : 'You have lived <b>' + store.runs.length + '</b> lives<br>' + t('startHint'))
    : t('startHint');
  $('bcLabel').textContent = t('bcLabel');
  $('bcFamilyK').textContent = t('bcFamily');
  $('bcEduK').textContent = t('bcEdu');
  $('bcLifeK').textContent = t('bcLife');
  $('bcGdpK').textContent = t('bcGdp');
  $('beginBtn').textContent = t('begin');
  $('sHp').textContent = t('hp'); $('sIq').textContent = t('iq');
  $('sAp').textContent = t('ap'); $('sJy').textContent = t('jy');
  $('pAgeUnit').textContent = t('ageUnit');
  $('logTitle').textContent = t('logTitle');
  $('againBtn').textContent = t('again');
  $('sameBtn').textContent = lang === 'zh' ? '在这一国再活一次' : 'Live here again';
  $('dailyBtn').textContent = lang === 'zh' ? '今 日 之 命' : 'T O D A Y \u2019 S  L I F E';
  $('dailySub').textContent = lang === 'zh'
    ? (new Date().getMonth() + 1) + ' 月 ' + new Date().getDate() + ' 日 · 今天所有人投的是同一个胎'
    : 'Everyone gets the same life today';
  const sk = (store.streak && store.streak.days) || 0;
  $('streak').textContent = sk >= 2
    ? (lang === 'zh' ? '已连续投胎 ' + sk + ' 天' : sk + '-day streak')
    : '';
  $('shareBtn').textContent = t('share');
  $('linkBtn').textContent = lang === 'zh' ? '复制人生链接' : 'Copy life link';
  $('gal2Btn').textContent = t('gal');
  $('gTitle').textContent = t('gTitle');
  $('backBtn').textContent = t('back');
  $('hlTitle').textContent = t('hlTitle');
  $('fullLogBtn').textContent = t('fullLog');
  $('forkTitle').textContent = t('forkTitle');
  $('cardBtn').textContent = t('cardBtn');
  $('cardTitle').textContent = t('cardTitle');
  $('cardSave').textContent = t('cardSave');
  $('cardHint').textContent = t('cardHint');
  $('ckLabel').textContent = lang === 'zh' ? '命 运 岔 路' : 'A FORK IN THE ROAD';
  $('worldPop').textContent = fmtInt(8e9);
  $('metaStrip').innerHTML = lang === 'zh'
    ? '<span><b>' + COUNTRIES.length + '</b> 个国家</span><span class="sep">·</span><span><b>' + ALL_EVENTS.length + '</b> 个人生事件</span><span class="sep">·</span><span><b>7</b> 层命运</span><span class="sep">·</span><span>从赤贫到顶级富豪</span>'
    : '<span><b>' + COUNTRIES.length + '</b> countries</span><span class="sep">·</span><span><b>' + ALL_EVENTS.length + '</b> life events</span><span class="sep">·</span><span><b>7</b> classes</span><span class="sep">·</span><span>from nothing to dynasty</span>';
  if (S) {
    renderSide();
    if (currentScreen === 'scrBirth') renderBirth();
    if (currentScreen === 'scrEnd') renderEnd();
  }
  if (currentScreen === 'scrGallery') renderGallery();
  if (S && S.pending) showChoice();
  store.lang = lang; saveStore();
}

/* ---------------- 出生 ---------------- */
/* 每日之命：同一天所有人拿到同一个种子，投到同一个胎 */
function dailyKey() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function dailySeed() {
  let x = dailyKey() >>> 0;
  x = (x ^ 61) ^ (x >>> 16); x = x + (x << 3); x = x ^ (x >>> 4);
  x = Math.imul(x, 0x27d4eb2d); x = x ^ (x >>> 15);
  return x >>> 0;
}

/* opts: { seed, country, daily } */
function doBirth(opts) {
  opts = opts || {};
  clearTimer();
  trackOnce('start');
  const seed = (opts.seed !== undefined) ? opts.seed
    : (Math.floor(Math.random() * 4294967296) >>> 0);
  S = E.newLife(seed, {
    avoid: store.recent || [],
    country: opts.country || null
  });
  S.seed = seed;
  S.daily = !!opts.daily;
  S.pinned = opts.country || null;
  runIndex = (store.runs.length || 0) + 1;
  renderBirth();
  show('scrBirth');
}

function renderBirth() {
  const s = S, c = s.c, tier = E.TIERS[s.tier];
  $('bcFlag').textContent = c.flag;
  $('bcCountry').textContent = lang === 'zh' ? c.zh : c.en;
  $('bcRegion').textContent = (lang === 'zh' ? REGIONS[c.region].zh : REGIONS[c.region].en)
    + ' · ' + (lang === 'zh' ? '人口 ' + fmtBig(c.pop * 1e6) : fmtBig(c.pop * 1e6) + ' people')
    + ' · ' + (s.urban ? (lang === 'zh' ? '城市' : 'city') : (lang === 'zh' ? '农村' : 'countryside'));
  $('bcName').textContent = lang === 'zh' ? s.name.n : s.name.r;
  $('bcFamilyV').textContent = lang === 'zh' ? tier.zh : tier.en;
  $('bcFamilyD').textContent = lang === 'zh' ? tier.zhDesc : tier.enDesc;
  $('bcLifeV').textContent = Math.round(c.life) + (lang === 'zh' ? ' 岁' : ' yrs');
  $('bcLifeD').textContent = t('lifeAvg');
  $('bcGdpV').textContent = '$' + fmtInt(c.gdp);
  $('bcGdpD').textContent = t('gdpAvg');
  const st = EDU_STYLE[c.style];
  $('bcEduV').textContent = lang === 'zh' ? st.zh : st.en;
  $('bcEduD').textContent = lang === 'zh' ? EDU_DESC[c.style].zh : EDU_DESC[c.style].en;

  const tr = $('bcTraits');
  tr.innerHTML = '';
  s.traitFlags.forEach(f => {
    const d = document.createElement('span');
    d.className = 'trait ' + (TRAITS[f].good ? 'good' : 'bad');
    d.textContent = lang === 'zh' ? TRAITS[f].zh : TRAITS[f].en;
    tr.appendChild(d);
  });

  const r = s.birthRarity;
  $('bcRarity').innerHTML = lang === 'zh'
    ? '这个组合在地球上出现的概率约为 <b>' + rarityStr(r) + '</b><br>你抽到了这一手牌，接下来只能打下去。'
    : 'The odds of this exact start were about <b>' + rarityStr(r) + '</b><br>You were dealt these cards. Now you play them.';
}

function beginLife() {
  trackOnce('begin');
  show('scrPlay');
  $('logInner').innerHTML = '';
  const pset = S.tier >= 5 ? PLACE_TOP : S.tier >= 3 ? PLACE_UP : PLACE;
  const p = pset[S.c.region] || PLACE.europe;
  const f = FAMILY_LINE[S.tier];
  addEntries([
    { age: 0, t: 'm', zh: '你出生在' + S.c.zh + '。', en: 'You were born in ' + S.c.en + '.' },
    { age: 0, t: 'n', zh: p.zh, en: p.en },
    { age: 0, t: 'n', zh: f.zh, en: f.en },
  ]);
  renderSide();
  paused = false; setPauseIcon();
  schedule();
}

/* ---------------- 主循环 ---------------- */
function schedule() {
  clearTimer();
  if (paused || !S || !S.alive) return;
  timer = setTimeout(step, DELAY[speed] || 1000);
}
function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

function step() {
  if (!S || !S.alive || paused) return;
  if (S.pending) { showChoice(); return; }

  const entries = E.tick(S);
  addEntries(entries);
  renderSide();

  if (!S.alive) { finish(); return; }
  if (S.pending) { showChoice(); return; }
  schedule();
}

function stageOf(age) {
  if (age < 7) return 0; if (age < 19) return 1; if (age < 30) return 2;
  if (age < 50) return 3; if (age < 70) return 4; return 5;
}

function renderSide() {
  if (!S) return;
  const s = S;
  $('pFlag').textContent = s.c.flag;
  $('pName').textContent = lang === 'zh' ? s.name.n : s.name.r;
  $('pCountry').textContent = lang === 'zh' ? s.c.zh : s.c.en;
  $('pAge').textContent = s.age;
  $('pStage').textContent = t('stage')[stageOf(s.age)];

  const set = (bar, val, v) => { $(bar).style.width = Math.max(0, Math.min(100, v)) + '%'; $(val).textContent = Math.round(v); };
  set('bHp', 'sHpV', s.hp); set('bIq', 'sIqV', s.iq);
  set('bAp', 'sApV', s.ap); set('bJy', 'sJyV', s.jy);

  const edu = E.EDU_NAME[s.ed];
  const eduTxt = s.age < 6 ? t('notYet') : (lang === 'zh' ? edu[0] : edu[1]);
  const job = s.job
    ? (lang === 'zh' ? s.job.zh : s.job.en)
    : (s.inSchool ? t('inSchool') : (s.age < 16 ? t('notYet') : t('noJob')));
  const m = s.money;
  const rows = [
    [t('edu'), eduTxt, ''],
    [t('job'), job, ''],
    [t('money'), E.fmtMoney(m, lang), m < 0 ? 'neg' : m > 0 ? 'pos' : ''],
    [t('married'), s.married ? t('wed') : t('single'), ''],
    [t('kids'), s.kids > 0 ? String(s.kids) : t('childless'), ''],
  ];
  let html = rows.map(r =>
    '<div class="fact"><span class="k">' + r[0] + '</span><span class="v mono ' + r[2] + '">' + r[1] + '</span></div>'
  ).join('');
  if (s.traitFlags.length) {
    html += '<div class="side-traits">' + s.traitFlags.map(f => {
      const tr = TRAITS[f];
      return '<span class="trait ' + (tr.good ? 'good' : 'bad') + '">' + (lang === 'zh' ? tr.zh : tr.en) + '</span>';
    }).join('') + '</div>';
  }
  $('pFacts').innerHTML = html;
}

function addEntries(entries) {
  if (!entries || !entries.length) return;
  const box = $('logInner');
  const near = $('log').scrollHeight - $('log').scrollTop - $('log').clientHeight < 140;
  entries.forEach(e => {
    if (!e) return;
    const txt = lang === 'zh' ? e.zh : e.en;
    if (!txt) return;
    const d = document.createElement('div');
    d.className = 'ev ' + (e.t || 'n');
    d.innerHTML = '<div class="age">' + e.age + (lang === 'zh' ? '岁' : '') + '</div>' +
                  '<div class="txt">' + txt + '</div>';
    box.appendChild(d);
  });
  const mu = MUSINGS.find(m => m.a === S.age);
  if (mu && Math.random() < 0.7) {
    const d = document.createElement('div');
    d.className = 'thought';
    d.textContent = lang === 'zh' ? mu.zh : mu.en;
    box.appendChild(d);
  }
  if (near) $('log').scrollTop = $('log').scrollHeight;
}

/* ---------------- 选择 ---------------- */
function showChoice() {
  const p = S.pending;
  if (!p) return;
  paused = true;
  $('ckLabel').textContent = (lang === 'zh' ? S.age + ' 岁 · 命 运 岔 路' : 'AGE ' + S.age + ' · A FORK IN THE ROAD');
  $('ckText').textContent = lang === 'zh' ? p.zh : p.en;
  const box = $('ckOpts');
  box.innerHTML = '';
  p.ch.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = '<span class="arrow">→</span>' + (lang === 'zh' ? o.zh : o.en);
    b.onclick = () => choose(i);
    box.appendChild(b);
  });
  $('ovChoice').classList.add('show');
}

function choose(i) {
  $('ovChoice').classList.remove('show');
  if (!S.pending) return;
  const res = E.resolveChoice(S, i);
  addEntries(res);
  renderSide();
  paused = false; setPauseIcon();
  if (!S.alive) { finish(); return; }
  schedule();
}

/* ---------------- 暂停 ---------------- */
function setPauseIcon() {
  const btn = $('btnPause');
  btn.innerHTML = paused
    ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
  btn.title = paused ? 'resume' : 'pause';
}
function togglePause() {
  if (!S || !S.alive || S.pending) return;
  paused = !paused;
  setPauseIcon();
  if (paused) clearTimer(); else schedule();
}

/* ---------------- 结局 ---------------- */
/* ---------------- 收集称号 ----------------
   图鉴收集到一定数量就解锁一个称号，给「继续投胎」一个理由。 */
function nCountry(st) { return Object.keys(st.countries || {}).filter(k => st.countries[k] > 0).length; }
function nTier(st) { return Object.keys(st.tiers || {}).filter(k => st.tiers[k] > 0).length; }
function nAch(st) { return Object.keys(st.ach || {}).length; }
function nRun(st) { return (st.runs || []).length; }
function nStreak(st) { return (st.streak && st.streak.days) || 0; }
function bothEnds(st) { return (st.tiers && st.tiers[0] && st.tiers[6]) ? 1 : 0; }

/* 连续投胎天数：隔天不断则 +1，断了从 1 重新算 */
function dayStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function bumpStreak() {
  const t = dayStr(new Date());
  const st = store.streak || { last: '', days: 0 };
  if (st.last === t) { store.streak = st; return st.days; }
  const y = new Date(); y.setDate(y.getDate() - 1);
  st.days = (st.last === dayStr(y)) ? st.days + 1 : 1;
  st.last = t;
  store.streak = st;
  return st.days;
}

/* 顺序 = 难度阶梯，越靠后越高 */
const COLLECT = [
  { id:'k3',   zh:'初次远行', en:'First Journey',    need:3,   val:nCountry, unit:[' 国',' countries'] },
  { id:'k10',  zh:'旅行者',   en:'Traveller',        need:10,  val:nCountry, unit:[' 国',' countries'] },
  { id:'t2',   zh:'两种人生', en:'Two Worlds',       need:2,   val:nTier,    unit:[' 层',' classes'] },
  { id:'t3',   zh:'见过人间', en:'Both Ends',        need:3,   val:nTier,    unit:[' 层',' classes'] },
  { id:'a5',   zh:'小有成就', en:'Collector',        need:5,   val:nAch,     unit:[' 个',' titles'] },
  { id:'r10',  zh:'十世',     en:'Ten Lives',        need:10,  val:nRun,     unit:[' 世',' lives'] },
  { id:'s7',   zh:'七日不辍', en:'Seven Days',       need:7,   val:nStreak,  unit:[' 天',' days'] },
  { id:'k30',  zh:'环球客',   en:'Globetrotter',     need:30,  val:nCountry, unit:[' 国',' countries'] },
  { id:'t5',   zh:'五世为人', en:'Five Stations',    need:5,   val:nTier,    unit:[' 层',' classes'] },
  { id:'a10',  zh:'成就猎人', en:'Achievement Hunter', need:10, val:nAch,    unit:[' 个',' titles'] },
  { id:'k60',  zh:'无国界',   en:'No Borders',       need:60,  val:nCountry, unit:[' 国',' countries'] },
  { id:'t7',   zh:'七层走遍', en:'All Seven',        need:7,   val:nTier,    unit:[' 层',' classes'] },
  { id:'a19',  zh:'全集',     en:'Completionist',    need:19,  val:nAch,     unit:[' 个',' titles'] },
  { id:'k90',  zh:'世界公民', en:'World Citizen',    need:90,  val:nCountry, unit:[' 国',' countries'] },
  { id:'s30',  zh:'三十日',   en:'Thirty Days',      need:30,  val:nStreak,  unit:[' 天',' days'] },
  { id:'both', zh:'从赤贫到顶级富豪', en:'From Nothing to Dynasty', need:1, val:bothEnds, binary:true },
  { id:'r100', zh:'百世',     en:'A Hundred Lives',  need:100, val:nRun,     unit:[' 世',' lives'] },
  { id:'k120', zh:'地球全书', en:'The Whole Earth',  need:120, val:nCountry, unit:[' 国',' countries'] },
];

function collectUnlocked(st) {
  return COLLECT.filter(m => m.val(st) >= m.need);
}

/* 距离最近的那个未解锁称号：用来在结局页给一个「再来一次」的理由 */
function nextGoal() {
  const ms = store.milestones || {};
  let best = null, bestP = -1;
  COLLECT.forEach(m => {
    if (ms[m.id]) return;
    const v = Math.min(m.val(store), m.need);
    const p = v / m.need;
    if (p > bestP) { bestP = p; best = m; }
  });
  if (!best) return null;
  return { m: best, v: Math.min(best.val(store), best.need), p: bestP };
}

function finish() {
  clearTimer();
  E.finalize(S);
  const s = S;
  const prev = store.runs.length ? store.runs[store.runs.length - 1] : null;
  lastPrev = prev;

  const rec = {
    cid: s.cid, age: s.age, money: Math.round(s.money), score: s.score,
    pct: Math.round(s.pct * 10) / 10, grade: E.grade(s.pct).k, ed: s.ed,
    jy: Math.round(s.jy), kids: s.kids, married: s.married,
  };
  store.runs.push(rec);
  if (store.runs.length > 500) store.runs = store.runs.slice(-500);
  store.countries[s.cid] = (store.countries[s.cid] || 0) + 1;
  /* 记下这一局做过的选择，下一局压低它们的权重 */
  store.recent = (s.choiceLog || []).map(x => x.id).slice(0, 40);
  store.tiers = store.tiers || {};
  store.tiers[s.tier] = (store.tiers[s.tier] || 0) + 1;

  const b = store.best;
  if (!b.age || s.age > b.age) b.age = s.age;
  if (b.money === undefined || s.money > b.money) b.money = Math.round(s.money);
  if (!b.score || s.score > b.score) { b.score = s.score; b.scoreCid = s.cid; b.scoreAge = s.age; }
  if (!b.jy || s.jy > b.jy) b.jy = Math.round(s.jy);

  const newly = s.ach.filter(id => !store.ach[id]);
  newly.forEach(id => { store.ach[id] = 1; });
  if (newly.length) {
    const names = newly.map(id => {
      const a = E.ACH_LIST.find(x => x.id === id);
      return lang === 'zh' ? a.zh : a.en;
    });
    const msg = names.length <= 2 ? names.join(' · ')
      : (lang === 'zh' ? newly.length + ' 个新称号' : newly.length + ' new titles');
    setTimeout(() => toast(msg, (lang === 'zh' ? '解锁 ' : 'Unlocked ') + newly.length), 600);
  }

  /* 收集称号：国家 / 阶层 / 成就 / 局数 达成里程碑 */
  store.milestones = store.milestones || {};
  bumpStreak();
  const newMs = collectUnlocked(store).filter(m => !store.milestones[m.id]);
  newMs.forEach(m => { store.milestones[m.id] = 1; });
  if (newMs.length) {
    const nm = newMs.map(m => lang === 'zh' ? m.zh : m.en);
    const msg = nm.length <= 2 ? nm.join(' · ')
      : (lang === 'zh' ? newMs.length + ' 个收集称号' : newMs.length + ' collection titles');
    setTimeout(() => toast(msg, lang === 'zh' ? '图鉴' : 'Collection'), 1500);
  }

  saveStore();
  renderEnd();
  show('scrEnd');
  postDaily(s);
  track('end', {
    grade: E.grade(s.pct).k,
    cid: s.cid,
    age: s.age,
    dur: tkDur()
  });
}

function epitaphOf(s) {
  const edu = E.EDU_NAME[s.ed];
  const job = s.job ? (lang === 'zh' ? s.job.zh : s.job.en)
                    : (lang === 'zh' ? '没有正式工作' : 'never formally employed');
  const tier = E.TIERS[s.tier];
  let ep;
  if (lang === 'zh') {
    ep = s.c.zh + '，' + tier.zh + '家庭。' + edu[0] + '。' + job + '。活了 ' + s.age + ' 岁。';
    if (s.age < 40) ep += '太短了。';
    else if (s.jy >= 78) ep += '这一生，你是笑着走完的。';
    else if (s.money < 0) ep += '到最后一刻，你还在还债。';
    else if (s.kids >= 2) ep += '你留下了 ' + s.kids + ' 个孩子。';
    else if (s.age >= 88) ep += '你活得比大多数人都久。';
  } else {
    ep = s.c.en + '. Born into a ' + tier.en.toLowerCase() + ' family. ' + edu[1] + '. ' + job + '. Died at ' + s.age + '.';
    if (s.age < 40) ep += ' Too short.';
    else if (s.jy >= 78) ep += ' You went out smiling.';
    else if (s.money < 0) ep += ' You were still paying debts at the end.';
    else if (s.kids >= 2) ep += ' You left ' + s.kids + ' children behind.';
    else if (s.age >= 88) ep += ' You outlived most people.';
  }
  return ep;
}

/* 这一生的三个标签：结局页和分享文案共用 */
function tagsOf(s) {
  const zh = lang === 'zh';
  const out = [];
  if (s.tier === 6) out.push(zh ? '顶级富豪之后' : 'Born a dynasty');
  else if (s.tier === 5) out.push(zh ? '生来有钱' : 'Born rich');
  else if (s.tier === 0) out.push(zh ? '赤贫出身' : 'Born with nothing');

  if (s.money >= 1e9) out.push(zh ? '十亿身家' : 'Billionaire');
  else if (s.money >= 1e8) out.push(zh ? '亿万身家' : 'Hundred-millionaire');
  else if (s.money >= 1e6) out.push(zh ? '百万富翁' : 'Millionaire');
  else if (s.money < 0) out.push(zh ? '负债离世' : 'Died in debt');

  if (s.tier <= 1 && s.money >= 2e5) out.push(zh ? '白手起家' : 'Self-made');
  if (s.ed === 0) out.push(zh ? '没上过学' : 'Never schooled');
  else if (s.ed >= 8) out.push(zh ? '博士' : 'Doctorate');

  if (s.age >= 90) out.push(zh ? '活到 ' + s.age + ' 岁' : 'Lived to ' + s.age);
  else if (s.age < 50) out.push(zh ? '只活到 ' + s.age : 'Gone at ' + s.age);

  if (s.kids >= 3) out.push(zh ? '儿孙满堂' : 'A full house');
  else if (s.kids === 0) out.push(zh ? '无儿无女' : 'No children');
  if (!s.married) out.push(zh ? '终身未婚' : 'Never married');
  if (s.jy >= 78) out.push(zh ? '一辈子挺快乐' : 'Genuinely happy');

  return out.slice(0, 3);
}

function renderEnd() {
  const s = S;
  if (!s) return;
  const g = E.grade(s.pct);
  const modeTag = s.daily ? (lang === 'zh' ? '今日之命' : 'Daily')
    : (s.pinned ? (lang === 'zh' ? '指定国家' : 'Chosen country') : '');
  $('endGrade').innerHTML = '<span class="life-tag">' + t('lifeN').replace('{n}', runIndex)
    + (modeTag ? ' · ' + modeTag : '') + '</span>'
    + g.k + '<small>' + (lang === 'zh' ? g.zh : g.en) + '</small>';

  const edu = E.EDU_NAME[s.ed];
  $('endEpitaph').textContent = epitaphOf(s);

  /* 与上一次人生对比 */
  const d = $('endDelta');
  if (lastPrev && !s.cf) {
    const dAge = s.age - lastPrev.age;
    const dW = s.money - lastPrev.money;
    const dS = s.score - lastPrev.score;
    const cell = (label, val, unit, good) => {
      const sign = val > 0 ? '+' : '';
      const cls = val === 0 ? '' : (good ? 'up' : 'down');
      return '<span class="dcell ' + cls + '">' + label + ' <b>' + sign + fmtInt(val) + unit + '</b></span>';
    };
    d.innerHTML = '<span class="dlabel">' + (lang === 'zh' ? '比上一次' : 'vs last life') + '</span>'
      + cell(lang === 'zh' ? '寿命' : 'age', dAge, lang === 'zh' ? ' 年' : '', dAge > 0)
      + cell(t('money'), Math.round(dW / (lang === 'zh' ? 1e4 : 1e3)), lang === 'zh' ? ' 万' : 'k', dW > 0)
      + cell(lang === 'zh' ? '评分' : 'score', Math.round(dS * 10) / 10, '', dS > 0);
    d.style.display = 'flex';
  } else {
    d.style.display = 'none';
  }

  const sim = s.similar, rar = s.rarity;
  const qual = rar >= 1e6 ? t('veryRare') : rar >= 1e4 ? t('rare') : rar >= 500 ? t('uncommon') : t('common');
  $('endRarity').innerHTML =
    '<div><div class="k">' + t('rarityK') + '</div><div class="v">' + rarityStr(rar) +
      ' <em class="qual">' + qual + '</em></div></div>' +
    '<div><div class="k">' + t('similarK') + '</div><div class="v">' +
      (sim < 1 ? t('onlyYou') : fmtBig(sim) + (lang === 'zh' ? ' 人' : '')) + '</div></div>' +
    '<div style="grid-column:1/-1"><div class="k">' + t('overall') + '</div>' +
    '<div class="v small">' + t('betterThan').replace('{p}',
      '<b style="color:var(--gold)">' + s.pct.toFixed(1) + '</b>') + '</div></div>';

  const tg = tagsOf(s);
  $('endTags').innerHTML = tg.map(x => '<span class="lifechip">' + x + '</span>').join('');
  $('endDaily').textContent = '';

  /* 岔路回溯的横幅 */
  const alt = $('endAlt');
  if (s.cf) {
    alt.className = 'end-alt show';
    alt.innerHTML = (lang === 'zh'
      ? '如果 ' + s.cf.age + ' 岁那年，你选了「<b>' + s.cf.label + '</b>」——这是另一条路。'
      : 'If at ' + s.cf.age + ' you had chosen “<b>' + s.cf.label + '</b>” — this is that road.')
      + '<span class="back" id="altBack">'
      + (lang === 'zh' ? '返回原来的人生' : 'Back to the first life') + '</span>';
    $('altBack').onclick = () => { S = S_ORIG; S_ORIG = null; renderEnd(); };
  } else {
    alt.className = 'end-alt';
    alt.innerHTML = '';
  }

  /* 下一个目标：离解锁最近的那个称号 */
  const ng = nextGoal();
  if (ng) {
    const m = ng.m;
    let line;
    if (m.binary) {
      line = lang === 'zh'
        ? '还差一次：<b>赤贫</b> 和 <b>顶级富豪</b> 你都还没走完'
        : 'One more: you have not yet lived both <b>nothing</b> and <b>a dynasty</b>';
    } else if (lang === 'zh') {
      line = '再 ' + (m.need - ng.v) + m.unit[0] + '就能解锁「<b>' + m.zh + '</b>」';
    } else {
      line = (m.need - ng.v) + m.unit[1] + ' to unlock “<b>' + m.en + '</b>”';
    }
    $('endNext').innerHTML =
      '<span class="nx-k">' + (lang === 'zh' ? '下 一 个 目 标' : 'N E X T   G O A L') + '</span>' +
      line +
      '<div class="nx-bar"><i style="width:' + Math.round(ng.p * 100) + '%"></i></div>';
    $('endNext').style.display = 'block';
  } else {
    $('endNext').style.display = 'none';
  }

  const cells = [
    [t('lifespan'), s.age + (lang === 'zh' ? ' 岁' : '')],
    [t('money'), E.fmtMoney(s.money, lang)],
    [t('edu'), lang === 'zh' ? edu[0] : edu[1]],
    [t('kids'), s.kids > 0 ? s.kids : t('childless')],
  ];
  $('endGrid').innerHTML = cells.map(c =>
    '<div class="cell"><div class="k">' + c[0] + '</div><div class="v">' + c[1] + '</div></div>').join('');

  const got = E.ACH_LIST.filter(a => s.ach.indexOf(a.id) >= 0);
  $('endAch').innerHTML = got.length
    ? got.map(a => '<span class="ach">' + (lang === 'zh' ? a.zh : a.en) + '</span>').join('') +
      '<span class="ach-count">' + got.length + ' / ' + E.ACH_LIST.length + '</span>'
    : '<span class="ach-empty">' + t('noAch') + '</span>';

  /* 未走的路 */
  renderForks(s);

  const scored = s.log.filter(e => e.kind !== 'birth').map(e => {
    let w = 0;
    if (e.t === 'm') w += 3;
    if (e.t === 'b' || e.t === 'g') w += 2;
    if (e.fx) w += Math.min(6, (Math.abs(e.fx.hp || 0) + Math.abs(e.fx.jy || 0)) / 4 + Math.abs(e.fx.mo || 0));
    if (e.kind === 'death') w += 99;
    return { e, w };
  }).sort((a, b) => b.w - a.w).slice(0, 4).sort((a, b) => a.e.age - b.e.age);
  $('hlList').innerHTML = scored.map(o =>
    '<div class="hl"><span class="a">' + o.e.age + (lang === 'zh' ? '岁' : '') + '</span><span>' +
    (lang === 'zh' ? o.e.zh : o.e.en) + '</span></div>').join('');

  $('endGrade').style.color = s.pct >= 92 ? 'var(--gold)' : 'var(--ink)';
  $('fullLog').style.display = 'none';
  $('fullLogBtn').textContent = t('fullLog');
}

/* 今日之命：把成绩报给服务器，换回今天的名次 */
function postDaily(s) {
  if (!TRACK_ON || !s.daily) return;
  const payload = {
    sid: SID,
    score: Math.round(s.score * 10) / 10,
    grade: E.grade(s.pct).k,
    cid: s.cid,
    age: s.age
  };
  try {
    fetch('/d', {
      method: 'POST', body: JSON.stringify(payload), keepalive: true,
      headers: { 'Content-Type': 'application/json' }
    }).then(function () {
      return fetch('/d.json?score=' + payload.score);
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.n || !$('endDaily')) return;
      let line;
      if (d.n <= 1) {
        line = lang === 'zh' ? '今日之命 · 你是今天第一个走到结局的人'
          : 'Daily · the first to finish today';
      } else {
        line = lang === 'zh'
          ? '今日之命 · 排名 ' + d.rank + ' / ' + d.n + '，超过了 ' + d.pct + '%'
          : 'Daily · rank ' + d.rank + ' of ' + d.n + ', better than ' + d.pct + '%';
      }
      $('endDaily').textContent = line;
    }).catch(function () {});
  } catch (e) {}
}

/* ---------------- 岔路回溯 ----------------
   引擎是确定性的：同一个种子 + 同样的选择，会得到同一条人生。
   所以把选择记录重放一遍、在某个路口换一个选项，就能真的走另一条路。 */
let S_ORIG = null;

function replayAlt(forkIdx, altIdx) {
  const src = S;
  if (!src || src.seed === undefined) return;
  const fork = (src.choiceLog || [])[forkIdx];
  if (!fork) return;

  const picks = (src.choiceLog || []).map(c => c.picked);
  const s = E.replay(src.seed, picks, forkIdx, altIdx, src.pinned || null);
  s.daily = false;
  s.pinned = src.pinned || null;
  s.cf = {
    age: fork.age,
    label: fork.opts[altIdx]
      ? (lang === 'zh' ? fork.opts[altIdx].zh : fork.opts[altIdx].en)
      : '',
  };
  if (!S_ORIG) S_ORIG = src;
  S = s;
  renderEnd();
  show('scrEnd');
  $('scrEnd').scrollTop = 0;
}

/* ---------------- 未走的路 ---------------- */
function renderForks(s) {
  const box = $('endForks');
  const list = s.choiceLog || [];
  if (!list.length) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  $('forkTitle').textContent = t('forkTitle');

  const MAX = 6;
  const trunc = list.length > MAX;
  const all = list.map((c, i) => ({ c, i }));
  const shown = trunc ? all.slice(0, 2).concat(all.slice(-(MAX - 2))) : all;

  const cutLen = lang === 'zh' ? 44 : 96;
  const shorten = str => {
    if (str.length <= cutLen) return str;
    let s2 = str.slice(0, cutLen);
    if (lang !== 'zh') {
      const sp = s2.lastIndexOf(' ');
      if (sp > cutLen * 0.6) s2 = s2.slice(0, sp);
    }
    return s2.replace(/[，,、\s]+$/, '') + '…';
  };
  const rowOf = o => {
    const c = o.c;
    const taken = c.opts[c.picked] || { zh: '', en: '' };
    const others = c.opts.filter((x, i) => i !== c.picked).slice(0, 2);
    const q = lang === 'zh' ? c.zh : c.en;
    const tk = lang === 'zh' ? taken.zh : taken.en;
    const oth = others.map(other => {
      const label = lang === 'zh' ? other.zh : other.en;
      const res = other.r ? (lang === 'zh' ? other.r.zh : other.r.en) : '';
      const cut = shorten(res);
      const realIdx = c.opts.indexOf(other);
      return '<div class="other"><span class="lbl">' + t('forkOther') + '</span>'
        + '<span class="ol">' + label + '</span>'
        + (cut ? '<span class="or">' + cut + '</span>' : '')
        + '<button class="alt-go" data-fork="' + o.i + '" data-opt="' + realIdx + '">'
        + (lang === 'zh' ? '走这条' : 'Take it') + '</button>'
        + '</div>';
    }).join('');
    return '<div class="fork-row">'
      + '<span class="a">' + c.age + (lang === 'zh' ? '岁' : '') + '</span>'
      + '<div class="fb"><div class="q">' + q + '</div>'
      + '<div class="picked"><span class="tick">✓</span>' + tk + '</div>'
      + oth + '</div></div>';
  };

  const parts = shown.map(rowOf);
  if (trunc) {
    parts.splice(2, 0, '<div class="fork-more">'
      + t('forkMore').replace('{n}', list.length - MAX) + '</div>');
  }
  $('forkList').innerHTML = parts.join('');
}

/* ---------------- 分享 ---------------- */
function shareLife() {
  const s = S;
  if (!s) return;
  const edu = E.EDU_NAME[s.ed];
  const tg = tagsOf(s).join(lang === 'zh' ? ' · ' : ' · ');
  const txt = lang === 'zh'
    ? '《模拟人生-3分钟看完一生》' + t('lifeN').replace('{n}', runIndex) + '\n' +
      s.c.flag + ' ' + s.c.zh + ' · ' + E.TIERS[s.tier].zh + '家庭 · ' + edu[0] + '\n' +
      tg + '\n' +
      '活了 ' + s.age + ' 岁，净财富 ' + E.fmtMoney(s.money, 'zh') + '，评级 ' + E.grade(s.pct).k + '\n' +
      '命运稀有度 ' + rarityStr(s.rarity) + '\n' +
      (s.jy >= 70 ? '一生尚算温暖。' : s.jy >= 45 ? '不好不坏的一生。' : '这一生太累了。') + '\n' +
      '这是我这一生的手牌，你来打打看 → ' + lifeLink()
    : '《Life in 3 Minutes》' + t('lifeN').replace('{n}', runIndex) + '\n' +
      s.c.flag + ' ' + s.c.en + ' · ' + E.TIERS[s.tier].en + ' · ' + edu[1] + '\n' +
      tg + '\n' +
      'Lived ' + s.age + ' years, net worth ' + E.fmtMoney(s.money, 'en') + ', grade ' + E.grade(s.pct).k + '\n' +
      'Fate rarity ' + rarityStr(s.rarity) + '\n' +
      (s.jy >= 70 ? 'A warm life, all told.' : s.jy >= 45 ? 'Neither good nor bad.' : 'It was exhausting.') + '\n' +
      'This was my starting hand. Try it → ' + lifeLink();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(() => toast(t('copied')), () => toast('×'));
  }
}

/* 复制文本：优先用 clipboard API，失败就退回老办法 */
function copyText(txt, okMsg) {
  const done = () => toast(okMsg);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done, () => toast('×'));
    return;
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    done();
  } catch (e) { toast('×'); }
}

/* 人生链接：把种子带在 URL 里，别人点开就是同一手牌 */
function lifeLink() {
  if (!S || S.seed === undefined) return '';
  return GAME.url + '/?s=' + S.seed + (S.pinned ? '&c=' + S.pinned : '');
}

function copyLifeLink() {
  const url = lifeLink();
  if (!url) return;
  copyText(url, lang === 'zh'
    ? '链接已复制，别人点开会拿到同一手牌'
    : 'Link copied — same starting hand');
}

/* ---------------- 人生卡片 ---------------- */
const CARD_W = 1080, CARD_H = 1440;

/* 固定二维码（指向 GAME.qrUrl），离线预生成，避免运行时引入编码器 */
const QR_TARGET = 'https://game.workagentpro.com';
const CARD_QR = [
  '11111110110011110100001111111',
  '10000010000000010000001000001',
  '10111010101001000111001011101',
  '10111010001010011110101011101',
  '10111010001000011100001011101',
  '10000010100111101100001000001',
  '11111110101010101010101111111',
  '00000000011111000001100000000',
  '10100011010111011000100100101',
  '01111001111110001101101000011',
  '10010011110101101001000011101',
  '10101101111100111010101101000',
  '10000110010001100011101100001',
  '00101101010001100101111100011',
  '11110010100110010001001010001',
  '01001100010101000001111110000',
  '10100110011011011001101100001',
  '01011100100000001001101100111',
  '11100111010001101011000011001',
  '00011000111100111010011000000',
  '11111110111101100001111111010',
  '00000000100011100100100011101',
  '11111110110100010000101010001',
  '10000010010011000011100010010',
  '10111010010001011001111111000',
  '10111010011101001101110011110',
  '10111010110111101101000010011',
  '10000010011110111010100111000',
  '11111110110110001110110011001',
];

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.lineTo(x + w - r, y);
  g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}

function drawCard() {
  const s = S;
  if (!s) return;
  const cv = $('lifeCard');
  if (cv.width !== CARD_W) cv.width = CARD_W;
  if (cv.height !== CARD_H) cv.height = CARD_H;
  const g = cv.getContext('2d');
  const W = CARD_W, H = CARD_H;
  const SERIF = '"Songti SC","STSong","Noto Serif SC","Source Han Serif SC",Georgia,serif';
  const SANS = '-apple-system,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif';
  const INK = '#1b1a17', INK2 = '#46423b', INK3 = '#837c70', GOLD = '#a9762c';
  const HAIR = 'rgba(27,26,23,0.15)';

  /* 纸 */
  g.clearRect(0, 0, W, H);
  g.fillStyle = '#f4f1ea';
  g.fillRect(0, 0, W, H);

  let rg = g.createRadialGradient(W * 0.12, H * 0.05, 0, W * 0.12, H * 0.05, W * 0.95);
  rg.addColorStop(0, 'rgba(169,118,44,0.11)');
  rg.addColorStop(1, 'rgba(169,118,44,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  rg = g.createRadialGradient(W * 0.9, H * 0.96, 0, W * 0.9, H * 0.96, W * 0.85);
  rg.addColorStop(0, 'rgba(63,116,85,0.09)');
  rg.addColorStop(1, 'rgba(63,116,85,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);

  /* 纸纹 */
  g.fillStyle = 'rgba(27,26,23,0.05)';
  for (let y = 64; y < H - 56; y += 23) {
    for (let x = 64; x < W - 56; x += 23) g.fillRect(x, y, 1.7, 1.7);
  }

  /* 双框 */
  g.strokeStyle = 'rgba(27,26,23,0.22)'; g.lineWidth = 2.5;
  g.strokeRect(38, 38, W - 76, H - 76);
  g.strokeStyle = 'rgba(169,118,44,0.42)'; g.lineWidth = 1;
  g.strokeRect(50, 50, W - 100, H - 100);

  /* 四角小刻线 */
  g.strokeStyle = 'rgba(169,118,44,0.75)'; g.lineWidth = 2;
  [[62, 62, 1, 1], [W - 62, 62, -1, 1], [62, H - 62, 1, -1], [W - 62, H - 62, -1, -1]].forEach(c => {
    g.beginPath();
    g.moveTo(c[0], c[1] + 26 * c[3]);
    g.lineTo(c[0], c[1]);
    g.lineTo(c[0] + 26 * c[2], c[1]);
    g.stroke();
  });

  /* 文字工具 */
  function text(str, x, y, o) {
    o = o || {};
    g.font = o.font || ('24px ' + SANS);
    g.fillStyle = o.color || INK;
    g.textBaseline = o.base || 'alphabetic';
    const sp = o.sp || 0;
    if (!sp) {
      g.textAlign = o.align || 'center';
      g.fillText(str, x, y);
      return;
    }
    g.textAlign = 'left';
    const chars = Array.from(str);
    const ws = chars.map(ch => g.measureText(ch).width + sp);
    let total = ws.reduce((a, b) => a + b, 0) - sp;
    let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
    chars.forEach((ch, i) => { g.fillText(ch, cx, y); cx += ws[i]; });
  }

  function wrapText(str, x, y, maxW, lh, o) {
    o = o || {};
    g.font = o.font || ('25px ' + SERIF);
    g.fillStyle = o.color || INK2;
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    const tokens = /\s/.test(str) ? str.split(/(\s+)/) : Array.from(str);
    const lines = [];
    let cur = '';
    tokens.forEach(tk => {
      const test = cur + tk;
      if (g.measureText(test).width > maxW && cur.trim()) { lines.push(cur.trim()); cur = tk; }
      else cur = test;
    });
    if (cur.trim()) lines.push(cur.trim());

    /* 中文禁则：标点、单位不能出现在行首，把它们并回上一行 */
    const NO_START = '，。、；：！？）》」』】〕·…%％岁年个元人次的了吗呢吧啊';
    for (let i = 1; i < lines.length; i++) {
      let ln = lines[i].replace(/^\s+/, '');
      let guard = 0;
      while (ln.length && NO_START.indexOf(ln[0]) >= 0 && guard++ < 4) {
        lines[i - 1] = lines[i - 1].replace(/\s+$/, '') + ln[0];
        ln = ln.slice(1);
      }
      lines[i] = ln;
    }

    const max = o.maxLines || 3;
    let out = lines.filter(l => l.length).slice(0, max);
    if (lines.length > max) out[max - 1] = out[max - 1].replace(/[，。,.、]$/, '') + '…';
    out.forEach((ln, i) => g.fillText(ln, x, y + i * lh));
  }

  const gd = E.grade(s.pct);
  const tier = E.TIERS[s.tier];
  const edu = E.EDU_NAME[s.ed];

  /* 抬头 */
  text(lang === 'zh' ? '模拟人生' : 'LIFE IN 3 MINUTES', W / 2, 122,
    { font: '30px ' + SERIF, color: INK3, sp: 13 });
  text(lang === 'zh' ? '3 分钟看完一生' : '模拟人生 · 3分钟看完一生', W / 2, 154,
    { font: '12.5px ' + SANS, color: GOLD, sp: 5 });

  /* 国旗 / 国家 / 姓名 */
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '84px ' + SANS;
  g.fillText(s.c.flag, W / 2, 214);

  g.textBaseline = 'alphabetic';
  text(lang === 'zh' ? s.c.zh : s.c.en, W / 2, 306, { font: '52px ' + SERIF, color: INK });
  text(lang === 'zh' ? s.name.n : s.name.r, W / 2, 350, { font: '25px ' + SERIF, color: INK2 });

  const reg = lang === 'zh' ? REGIONS[s.c.region].zh : REGIONS[s.c.region].en;
  text(reg + ' · ' + (lang === 'zh' ? tier.zh + '家庭' : tier.en + ' family'),
    W / 2, 384, { font: '13px ' + SANS, color: INK3 });

  g.strokeStyle = HAIR; g.lineWidth = 1;
  g.beginPath(); g.moveTo(158, 420); g.lineTo(W - 158, 420); g.stroke();

  /* 评级 */
  text(lang === 'zh' ? '评 级' : 'G R A D E', W / 2, 462,
    { font: '11px ' + SANS, color: 'rgba(131,124,112,0.85)', sp: 4 });
  g.textBaseline = 'middle';
  text(gd.k, W / 2, 546, { font: '148px ' + SERIF, color: s.pct >= 92 ? GOLD : INK });
  g.textBaseline = 'alphabetic';
  text(lang === 'zh' ? gd.zh : gd.en.toUpperCase(), W / 2, 618,
    { font: '13.5px ' + SANS, color: INK3, sp: 8 });

  /* 墓志铭 */
  wrapText(epitaphOf(s), W / 2, 672, 786, 42, { font: '24px ' + SERIF, color: INK2, maxLines: 3 });

  g.strokeStyle = HAIR; g.lineWidth = 1;
  g.beginPath(); g.moveTo(200, 778); g.lineTo(W - 200, 778); g.stroke();

  /* 四格数据 */
  const stats = [
    [t('lifespan'), s.age + (lang === 'zh' ? ' 岁' : '')],
    [t('money'), E.fmtMoney(s.money, lang)],
    [t('edu'), lang === 'zh' ? edu[0] : edu[1]],
    [t('rarityK'), rarityStr(s.rarity).replace(/\s/g, '')],
  ];
  const colX = [255, 445, 635, 825];
  stats.forEach((it, i) => {
    text(it[0], colX[i], 816, { font: '12px ' + SANS, color: INK3, sp: 2 });
    let sz = 30;
    g.font = sz + 'px ' + SERIF;
    while (g.measureText(it[1]).width > 168 && sz > 14) { sz -= 1; g.font = sz + 'px ' + SERIF; }
    text(it[1], colX[i], 862, { font: sz + 'px ' + SERIF, color: INK });
  });

  /* 称号 */
  const got = E.ACH_LIST.filter(a => s.ach.indexOf(a.id) >= 0).slice(0, 4);
  if (got.length) {
    const labels = got.map(a => (lang === 'zh' ? a.zh : a.en));
    g.font = '19px ' + SANS;
    const cw = labels.map(l => g.measureText(l).width + 36);
    const gap = 14;
    const totalW = cw.reduce((a, b) => a + b, 0) + gap * (labels.length - 1);
    let x0 = (W - totalW) / 2;
    const chY = 918, chH = 42;
    labels.forEach((l, i) => {
      g.fillStyle = 'rgba(169,118,44,0.09)';
      g.strokeStyle = 'rgba(169,118,44,0.32)';
      g.lineWidth = 1.2;
      rr(g, x0, chY, cw[i], chH, 21);
      g.fill(); g.stroke();
      g.fillStyle = GOLD;
      g.font = '19px ' + SANS;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(l, x0 + cw[i] / 2, chY + chH / 2 + 1);
      x0 += cw[i] + gap;
    });
  } else {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '18px ' + SANS; g.fillStyle = 'rgba(131,124,112,0.75)';
    g.fillText(t('cardNone'), W / 2, 939);
  }

  /* 像你这样的人 */
  g.textBaseline = 'alphabetic';
  text(t('cardWho'), W / 2, 1046, { font: '14px ' + SANS, color: INK3, sp: 3 });
  const simStr = s.similar < 1
    ? (lang === 'zh' ? '你是唯一' : 'Only you')
    : (lang === 'zh' ? fmtBig(s.similar) + '人' : fmtBig(s.similar));
  text(simStr, W / 2, 1116, { font: '56px ' + SERIF, color: GOLD });

  g.strokeStyle = HAIR; g.lineWidth = 1;
  g.beginPath(); g.moveTo(320, 1150); g.lineTo(W - 320, 1150); g.stroke();

  text(lang === 'zh'
      ? '超过了 ' + s.pct.toFixed(1) + '% 的人生'
      : 'better than ' + s.pct.toFixed(1) + '% of all lives',
    W / 2, 1192, { font: '18px ' + SERIF, color: INK2 });

  text(t('cardTimes').replace('{n}', runIndex) + ' · ' + (lang === 'zh' ? '随机人生' : 'a random life'),
    W / 2, 1226, { font: '11.5px ' + SANS, color: 'rgba(27,26,23,0.40)', sp: 3 });

  /* 二维码 + 网址：图片被转发出去后，扫码就能直接进来 */
  const showQR = GAME.qr && GAME.qrUrl === QR_TARGET;
  if (!showQR) {
    text(SITE, W / 2, 1282, { font: '16px ' + SANS, color: 'rgba(169,118,44,0.92)', sp: 2.5 });
    return;
  }
  const qs = 120, qx = 366, qy = 1256;
  g.fillStyle = '#ffffff';
  g.fillRect(qx - 9, qy - 9, qs + 18, qs + 18);
  g.fillStyle = INK;
  const cell = qs / CARD_QR.length;
  for (let yy = 0; yy < CARD_QR.length; yy++) {
    const row = CARD_QR[yy];
    for (let xx = 0; xx < row.length; xx++) {
      if (row[xx] === '1') g.fillRect(qx + xx * cell, qy + yy * cell, cell + 0.6, cell + 0.6);
    }
  }
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillStyle = GOLD;
  g.font = '19px ' + SERIF;
  g.fillText(lang === 'zh' ? '扫码投胎' : 'Scan to be born', qx + qs + 26, qy + 52);
  g.fillStyle = 'rgba(27,26,23,0.55)';
  g.font = '14px ' + SANS;
  g.fillText(SITE, qx + qs + 26, qy + 82);
}

function openCard() {
  if (!S) return;
  drawCard();
  $('ovCard').classList.add('show');
}
function closeCard() { $('ovCard').classList.remove('show'); }

function saveCard() {
  const cv = $('lifeCard');
  const name = 'life-' + S.cid + '-' + S.age + '-' + (S.score | 0) + '.png';
  const done = () => toast(lang === 'zh' ? '已保存图片' : 'Image saved');
  if (cv.toBlob) {
    cv.toBlob(b => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      done();
    }, 'image/png');
  } else {
    const a = document.createElement('a');
    a.href = cv.toDataURL('image/png'); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    done();
  }
}

/* ---------------- 国家档案 ---------------- */
let ccSel = null;

function openCountry(cid) {
  const c = COUNTRIES.find(x => x.id === cid);
  if (!c) return;
  ccSel = cid;
  const n = store.countries[cid] || 0;
  const st = EDU_STYLE[c.style];
  $('ccFlag').textContent = c.flag;
  $('ccName').textContent = lang === 'zh' ? c.zh : c.en;
  $('ccRegion').textContent = (lang === 'zh' ? REGIONS[c.region].zh : REGIONS[c.region].en)
    + ' · ' + (lang === 'zh' ? '人口 ' : 'pop. ') + fmtBig(c.pop * 1e6);
  $('ccGrid').innerHTML = [
    [lang === 'zh' ? '预期寿命' : 'Life expectancy', Math.round(c.life) + (lang === 'zh' ? ' 岁' : ' yrs')],
    [lang === 'zh' ? '人均产出' : 'GDP per capita', '$' + fmtInt(c.gdp)],
    [lang === 'zh' ? '教育体系' : 'Education', lang === 'zh' ? st.zh : st.en],
    [lang === 'zh' ? '你去过' : 'Times visited', n
      ? (lang === 'zh' ? n + ' 次' : (n === 1 ? '1 life' : n + ' lives'))
      : (lang === 'zh' ? '还没到过' : 'never')],
  ].map(x => '<div><div class="k">' + x[0] + '</div><div class="v">' + x[1] + '</div></div>').join('');
  $('ccNote').textContent = lang === 'zh'
    ? '国家由你选，出身仍然随机——家庭、天赋、会遇到什么事，一样都不由你。'
    : 'You pick the country. Everything else stays random — family, gifts, and what happens to you.';
  $('ccGoBtn').textContent = lang === 'zh' ? '投胎到这里' : 'Be born here';
  $('ovCountry').classList.add('show');
}
function closeCountry() { $('ovCountry').classList.remove('show'); }

/* ---------------- 图鉴 ---------------- */
function renderGallery() {
  const total = COUNTRIES.length;
  const got = Object.keys(store.countries).filter(id => store.countries[id] > 0).length;
  $('gCount').textContent = (lang === 'zh' ? '已解锁 ' : 'Unlocked ') + got + ' / ' + total;
  $('gProg').style.width = (got / total * 100).toFixed(1) + '%';
  $('gHint').textContent = got >= total
    ? (lang === 'zh' ? '全部国家都走过了。地球上没有你没活过的地方。'
                     : 'Every country on Earth. There is nowhere left you have not lived.')
    : (lang === 'zh'
        ? '还差 ' + (total - got) + ' 个国家。记录存在这台设备的浏览器里，刷新不会丢。'
        : (total - got) + ' countries to go. Progress is saved in this browser and survives a refresh.');

  $('gFlagsTitle').textContent = lang === 'zh' ? '国 家 图 鉴' : 'C O U N T R I E S';

  $('gFlags').innerHTML = COUNTRIES.map(c => {
    const n = store.countries[c.id] || 0;
    const nm = lang === 'zh' ? c.zh : c.en;
    return '<div class="flagcell ' + (n ? '' : 'locked') + '" data-cid="' + c.id + '" title="' + nm + '">' +
      '<div class="f">' + (n ? c.flag : '·') + '</div>' +
      '<div class="n">' + nm + '</div>' +
      '<div class="c">' + (n
        ? (lang === 'zh' ? n + ' 次' : (n === 1 ? '1 life' : n + ' lives'))
        : (lang === 'zh' ? '未到过' : 'not yet')) + '</div></div>';
  }).join('');

  /* 收集称号 */
  const ms = store.milestones || {};
  const unlocked = COLLECT.filter(m => ms[m.id]);
  const top = unlocked.length ? unlocked[unlocked.length - 1] : null;
  $('gNow').textContent = top ? (lang === 'zh' ? top.zh : top.en) : '';
  $('gMilesTitle').textContent = lang === 'zh'
    ? '收 集 称 号 ' + unlocked.length + ' / ' + COLLECT.length
    : 'C O L L E C T I O N   ' + unlocked.length + ' / ' + COLLECT.length;
  $('gMiles').innerHTML = COLLECT.map(m => {
    const on = !!ms[m.id];
    const v = Math.min(m.val(store), m.need);
    const detail = m.binary
      ? (on ? (lang === 'zh' ? '已达成' : 'Done') : (lang === 'zh' ? '未达成' : 'Not yet'))
      : v + ' / ' + m.need + (lang === 'zh' ? m.unit[0] : m.unit[1]);
    return '<div class="mile ' + (on ? 'on' : '') + '">' +
      '<div class="mn">' + (lang === 'zh' ? m.zh : m.en) + '</div>' +
      '<div class="md">' + detail + '</div></div>';
  }).join('');

  const b = store.best;
  const items = [
    [lang === 'zh' ? '投胎次数' : 'Lives lived', store.runs.length || 0, ''],
    [lang === 'zh' ? '最长寿' : 'Longest life', b.age ? b.age + (lang === 'zh' ? ' 岁' : '') : '—', ''],
    [lang === 'zh' ? '最高财富' : 'Peak wealth', b.money !== undefined ? E.fmtMoney(b.money, lang) : '—', ''],
    [lang === 'zh' ? '最高评分' : 'Best score', b.score ? b.score.toFixed(1) : '—',
      b.scoreCid ? ((COUNTRIES.find(c => c.id === b.scoreCid) || {}).flag || '') : ''],
    [lang === 'zh' ? '最快乐' : 'Happiest', b.jy ? b.jy : '—', ''],
    [lang === 'zh' ? '命运阶层' : 'Class', Object.keys(store.tiers || {}).length + ' / ' + E.TIERS.length, ''],
    [lang === 'zh' ? '收集称号' : 'Collection', unlocked.length + ' / ' + COLLECT.length, ''],
    [lang === 'zh' ? '解锁成就' : 'Achievements', Object.keys(store.ach).length + ' / ' + E.ACH_LIST.length, ''],
  ];
  $('gBests').innerHTML = items.map(i =>
    '<div class="best"><div class="k">' + i[0] + '</div><div class="v">' + i[1] + '</div><div class="s">' + i[2] + '</div></div>'
  ).join('');
}

/* ---------------- 事件绑定 ---------------- */
$('btnStart').onclick = () => doBirth();
$('btnBegin').onclick = beginLife;
$('btnAgain').onclick = () => doBirth();
$('btnDaily').onclick = () => doBirth({ seed: dailySeed(), daily: true });
$('btnSame').onclick = () => { if (S) doBirth({ country: S.cid }); };
$('ccGo').onclick = () => {
  const cid = ccSel;
  closeCountry();
  if (cid) doBirth({ country: cid });
};
$('ccClose').onclick = closeCountry;
$('ovCountry').onclick = e => { if (e.target === $('ovCountry')) closeCountry(); };
$('gFlags').onclick = e => {
  const cell = e.target.closest('.flagcell');
  if (cell && cell.dataset.cid) openCountry(cell.dataset.cid);
};
$('forkList').onclick = e => {
  const btn = e.target.closest('.alt-go');
  if (!btn) return;
  replayAlt(parseInt(btn.dataset.fork, 10), parseInt(btn.dataset.opt, 10));
};
$('btnShare').onclick = shareLife;
$('btnLink').onclick = copyLifeLink;
$('btnCard').onclick = openCard;
$('cardClose').onclick = closeCard;
$('btnSaveCard').onclick = saveCard;
$('ovCard').onclick = e => { if (e.target === $('ovCard')) closeCard(); };
$('btnPause').onclick = togglePause;
$('btnLang').onclick = () => { lang = lang === 'zh' ? 'en' : 'zh'; applyLang(); };

$('btnFullLog').onclick = () => {
  const box = $('fullLog');
  if (box.style.display === 'block') {
    box.style.display = 'none';
    $('fullLogBtn').textContent = t('fullLog');
    return;
  }
  box.innerHTML = S.log.filter(e => e.kind !== 'birth').map(e =>
    '<div class="fl-row ' + (e.t || 'n') + '"><span class="a">' + e.age + '</span><span>' +
    (lang === 'zh' ? e.zh : e.en) + '</span></div>').join('');
  box.style.display = 'block';
  $('fullLogBtn').textContent = t('fullLogClose');
};

$('btnGallery').onclick = () => {
  wasPlaying = currentScreen === 'scrPlay' && S && S.alive;
  if (wasPlaying) { paused = true; clearTimer(); setPauseIcon(); }
  renderGallery(); show('scrGallery');
};
$('btnGal2').onclick = () => { renderGallery(); show('scrGallery'); };
$('btnBack').onclick = () => {
  if (wasPlaying && S && S.alive) { show('scrPlay'); paused = false; setPauseIcon(); schedule(); }
  else if (S) show('scrEnd');
  else show('scrStart');
};

document.querySelectorAll('.speed button').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.speed button').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    speed = parseInt(b.dataset.sp, 10);
    if (!paused && S && S.alive && !S.pending) schedule();
  };
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if ($('ovCard').classList.contains('show')) { closeCard(); return; }
  }
  if (e.key === ' ' || e.code === 'Space') {
    if (currentScreen === 'scrPlay') { e.preventDefault(); togglePause(); }
  } else if (e.key === 'r' || e.key === 'R') {
    if (currentScreen !== 'scrStart') doBirth();
  } else if (e.key === 'Enter') {
    if (currentScreen === 'scrStart') doBirth();
    else if (currentScreen === 'scrBirth') beginLife();
    else if (currentScreen === 'scrEnd') doBirth();
  } else if (currentScreen === 'scrPlay' && S && S.pending && /^[1-9]$/.test(e.key)) {
    const i = parseInt(e.key, 10) - 1;
    if (i < S.pending.ch.length) choose(i);
  }
});

/* ---------------- 启动 ---------------- */
/* 按配置关掉不需要的入口，fork 的人不用改 HTML */
function applyConfig() {
  if (!GAME.daily) $('btnDaily').style.display = 'none';
  if (!GAME.gallery) {
    $('btnGallery').style.display = 'none';
    $('btnGal2').style.display = 'none';
  }
  if (!GAME.card) $('btnCard').style.display = 'none';
  if (!GAME.seedLink) $('btnLink').style.display = 'none';
}

applyConfig();
applyLang();

/* 老存档补记：已经达成的收集称号直接点亮，不弹提示 */
store.milestones = store.milestones || {};
let msBackfill = 0;
collectUnlocked(store).forEach(m => {
  if (!store.milestones[m.id]) { store.milestones[m.id] = 1; msBackfill++; }
});
if (msBackfill) saveStore();

trackOnce('open');

/* 人生链接：?s=<seed>&c=<国家> 直接重走某个人的一生 */
(function bootFromLink() {
  if (!GAME.seedLink) return;
  let p;
  try { p = new URLSearchParams(location.search); } catch (e) { return; }
  const raw = parseInt(p.get('s'), 10);
  if (!isFinite(raw) || raw <= 0) return;
  const cid = (p.get('c') || '').toUpperCase();
  doBirth({ seed: raw >>> 0, country: /^[A-Z]{2}$/.test(cid) ? cid : null });
})();
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') {
    tkActive += Date.now() - tkSeg;
    trackLeave();
  } else {
    tkSeg = Date.now();
  }
});
window.addEventListener('pagehide', trackLeave);
window.addEventListener('beforeunload', trackLeave);
setInterval(function () {
  if (document.visibilityState !== 'visible') return;
  track('ping', { dur: tkDur() });
}, 20000);

})();

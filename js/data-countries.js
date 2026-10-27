/* ============================================================
   模拟人生-3分钟看完一生 / Life in 3 Minutes
   数据层 A：国家、地区、姓名、天赋
   ============================================================ */

const REGIONS = {
  eastAsia:     { zh: '东亚',       en: 'East Asia' },
  southAsia:    { zh: '南亚',       en: 'South Asia' },
  southeastAsia:{ zh: '东南亚',     en: 'Southeast Asia' },
  middleEast:   { zh: '中东',       en: 'Middle East' },
  africa:       { zh: '非洲',       en: 'Africa' },
  europe:       { zh: '欧洲',       en: 'Europe' },
  latam:        { zh: '拉丁美洲',   en: 'Latin America' },
  northAmerica: { zh: '北美',       en: 'North America' },
  oceania:      { zh: '大洋洲',     en: 'Oceania' },
  centralAsia:  { zh: '中亚',       en: 'Central Asia' },
};

/* pop: 百万 | life: 预期寿命 | gdp: 人均GDP(美元) | edu: 教育普及度 0-1
   mob: 社会流动性 0-1 | cost: 生活成本系数 | nm: 姓名池 | style: 教育模式 */
const COUNTRIES = [
  { id:'CN', flag:'🇨🇳', pop:1412, region:'eastAsia',      zh:'中国',         en:'China',          life:78.2, gdp:12700, edu:0.78, mob:0.55, cost:0.55, nm:'cn',    style:'exam' },
  { id:'IN', flag:'🇮🇳', pop:1428, region:'southAsia',     zh:'印度',         en:'India',          life:70.8, gdp:2500,  edu:0.65, mob:0.42, cost:0.30, nm:'in',    style:'exam' },
  { id:'US', flag:'🇺🇸', pop:340,  region:'northAmerica',  zh:'美国',         en:'United States',  life:79.1, gdp:76000, edu:0.92, mob:0.48, cost:1.00, nm:'na',    style:'liberal' },
  { id:'ID', flag:'🇮🇩', pop:278,  region:'southeastAsia', zh:'印度尼西亚',   en:'Indonesia',      life:71.7, gdp:4900,  edu:0.70, mob:0.45, cost:0.32, nm:'sea',   style:'standard' },
  { id:'PK', flag:'🇵🇰', pop:240,  region:'southAsia',     zh:'巴基斯坦',     en:'Pakistan',       life:66.4, gdp:1500,  edu:0.50, mob:0.35, cost:0.22, nm:'pk',    style:'scarce' },
  { id:'NG', flag:'🇳🇬', pop:223,  region:'africa',        zh:'尼日利亚',     en:'Nigeria',        life:54.6, gdp:2200,  edu:0.55, mob:0.38, cost:0.26, nm:'af',    style:'scarce' },
  { id:'BR', flag:'🇧🇷', pop:216,  region:'latam',         zh:'巴西',         en:'Brazil',         life:75.9, gdp:8900,  edu:0.75, mob:0.42, cost:0.38, nm:'latam', style:'standard' },
  { id:'BD', flag:'🇧🇩', pop:173,  region:'southAsia',     zh:'孟加拉国',     en:'Bangladesh',     life:73.7, gdp:2700,  edu:0.60, mob:0.40, cost:0.22, nm:'bd',    style:'scarce' },
  { id:'RU', flag:'🇷🇺', pop:144,  region:'europe',        zh:'俄罗斯',       en:'Russia',         life:73.2, gdp:12000, edu:0.85, mob:0.40, cost:0.42, nm:'ru',    style:'exam' },
  { id:'MX', flag:'🇲🇽', pop:129,  region:'latam',         zh:'墨西哥',       en:'Mexico',         life:75.1, gdp:11500, edu:0.74, mob:0.40, cost:0.40, nm:'latam', style:'standard' },
  { id:'JP', flag:'🇯🇵', pop:124,  region:'eastAsia',      zh:'日本',         en:'Japan',          life:84.5, gdp:34000, edu:0.95, mob:0.50, cost:0.80, nm:'jp',    style:'exam' },
  { id:'ET', flag:'🇪🇹', pop:127,  region:'africa',        zh:'埃塞俄比亚',   en:'Ethiopia',       life:65.6, gdp:1300,  edu:0.40, mob:0.32, cost:0.20, nm:'af',    style:'scarce' },
  { id:'PH', flag:'🇵🇭', pop:117,  region:'southeastAsia', zh:'菲律宾',       en:'Philippines',    life:71.5, gdp:3900,  edu:0.72, mob:0.44, cost:0.32, nm:'sea',   style:'standard' },
  { id:'EG', flag:'🇪🇬', pop:113,  region:'middleEast',    zh:'埃及',         en:'Egypt',          life:70.2, gdp:4300,  edu:0.68, mob:0.38, cost:0.28, nm:'me',    style:'standard' },
  { id:'VN', flag:'🇻🇳', pop:99,   region:'southeastAsia', zh:'越南',         en:'Vietnam',        life:74.6, gdp:4300,  edu:0.76, mob:0.52, cost:0.28, nm:'sea',   style:'exam' },
  { id:'CD', flag:'🇨🇩', pop:102,  region:'africa',        zh:'刚果（金）',   en:'DR Congo',       life:60.7, gdp:650,   edu:0.35, mob:0.28, cost:0.18, nm:'af',    style:'scarce' },
  { id:'DE', flag:'🇩🇪', pop:84,   region:'europe',        zh:'德国',         en:'Germany',        life:81.2, gdp:51000, edu:0.94, mob:0.58, cost:0.85, nm:'eu',    style:'vocational' },
  { id:'TR', flag:'🇹🇷', pop:85,   region:'middleEast',    zh:'土耳其',       en:'Türkiye',        life:78.6, gdp:13000, edu:0.80, mob:0.45, cost:0.42, nm:'tr',    style:'exam' },
  { id:'IR', flag:'🇮🇷', pop:89,   region:'middleEast',    zh:'伊朗',         en:'Iran',           life:76.7, gdp:4500,  edu:0.78, mob:0.42, cost:0.30, nm:'me',    style:'exam' },
  { id:'TH', flag:'🇹🇭', pop:72,   region:'southeastAsia', zh:'泰国',         en:'Thailand',       life:79.0, gdp:7200,  edu:0.78, mob:0.46, cost:0.38, nm:'sea',   style:'standard' },
  { id:'GB', flag:'🇬🇧', pop:68,   region:'europe',        zh:'英国',         en:'United Kingdom', life:81.3, gdp:46000, edu:0.93, mob:0.50, cost:0.90, nm:'eu',    style:'liberal' },
  { id:'FR', flag:'🇫🇷', pop:68,   region:'europe',        zh:'法国',         en:'France',         life:82.5, gdp:44000, edu:0.92, mob:0.52, cost:0.85, nm:'eu',    style:'liberal' },
  { id:'KR', flag:'🇰🇷', pop:52,   region:'eastAsia',      zh:'韩国',         en:'South Korea',    life:83.5, gdp:33000, edu:0.96, mob:0.48, cost:0.75, nm:'kr',    style:'exam' },
  { id:'ZA', flag:'🇿🇦', pop:61,   region:'africa',        zh:'南非',         en:'South Africa',   life:65.3, gdp:6800,  edu:0.72, mob:0.34, cost:0.38, nm:'af',    style:'standard' },
  { id:'KE', flag:'🇰🇪', pop:55,   region:'africa',        zh:'肯尼亚',       en:'Kenya',          life:63.7, gdp:2100,  edu:0.58, mob:0.36, cost:0.26, nm:'af',    style:'scarce' },
  { id:'AR', flag:'🇦🇷', pop:46,   region:'latam',         zh:'阿根廷',       en:'Argentina',      life:76.6, gdp:13700, edu:0.88, mob:0.44, cost:0.45, nm:'latam', style:'liberal' },
  { id:'CO', flag:'🇨🇴', pop:52,   region:'latam',         zh:'哥伦比亚',     en:'Colombia',       life:77.0, gdp:6600,  edu:0.76, mob:0.38, cost:0.35, nm:'latam', style:'standard' },
  { id:'CA', flag:'🇨🇦', pop:39,   region:'northAmerica',  zh:'加拿大',       en:'Canada',         life:82.0, gdp:53000, edu:0.95, mob:0.60, cost:0.92, nm:'na',    style:'liberal' },
  { id:'AU', flag:'🇦🇺', pop:26,   region:'oceania',       zh:'澳大利亚',     en:'Australia',      life:83.2, gdp:64000, edu:0.95, mob:0.58, cost:0.95, nm:'oc',    style:'liberal' },
  { id:'SA', flag:'🇸🇦', pop:37,   region:'middleEast',    zh:'沙特阿拉伯',   en:'Saudi Arabia',   life:77.9, gdp:32000, edu:0.82, mob:0.40, cost:0.62, nm:'me',    style:'standard' },
  { id:'DZ', flag:'🇩🇿', pop:45,   region:'africa',        zh:'阿尔及利亚',   en:'Algeria',        life:77.0, gdp:4500,  edu:0.70, mob:0.36, cost:0.28, nm:'me',    style:'standard' },
  { id:'MA', flag:'🇲🇦', pop:37,   region:'africa',        zh:'摩洛哥',       en:'Morocco',        life:74.0, gdp:3700,  edu:0.62, mob:0.38, cost:0.30, nm:'me',    style:'standard' },
  { id:'TZ', flag:'🇹🇿', pop:67,   region:'africa',        zh:'坦桑尼亚',     en:'Tanzania',       life:66.0, gdp:1200,  edu:0.48, mob:0.34, cost:0.20, nm:'af',    style:'scarce' },
  { id:'NP', flag:'🇳🇵', pop:30,   region:'southAsia',     zh:'尼泊尔',       en:'Nepal',          life:70.0, gdp:1300,  edu:0.50, mob:0.36, cost:0.20, nm:'np',    style:'scarce' },
  { id:'LK', flag:'🇱🇰', pop:22,   region:'southAsia',     zh:'斯里兰卡',     en:'Sri Lanka',      life:76.0, gdp:3800,  edu:0.80, mob:0.44, cost:0.28, nm:'lk',    style:'exam' },
  { id:'KZ', flag:'🇰🇿', pop:20,   region:'centralAsia',   zh:'哈萨克斯坦',   en:'Kazakhstan',     life:74.0, gdp:11000, edu:0.88, mob:0.42, cost:0.40, nm:'ca',    style:'exam' },
  { id:'UZ', flag:'🇺🇿', pop:36,   region:'centralAsia',   zh:'乌兹别克斯坦', en:'Uzbekistan',     life:72.0, gdp:2500,  edu:0.75, mob:0.38, cost:0.24, nm:'ca',    style:'standard' },
  { id:'ES', flag:'🇪🇸', pop:48,   region:'europe',        zh:'西班牙',       en:'Spain',          life:83.5, gdp:30000, edu:0.90, mob:0.50, cost:0.70, nm:'eu',    style:'liberal' },
  { id:'IT', flag:'🇮🇹', pop:59,   region:'europe',        zh:'意大利',       en:'Italy',          life:83.0, gdp:35000, edu:0.90, mob:0.46, cost:0.72, nm:'eu',    style:'liberal' },
  { id:'PL', flag:'🇵🇱', pop:38,   region:'europe',        zh:'波兰',         en:'Poland',         life:77.5, gdp:18000, edu:0.90, mob:0.50, cost:0.48, nm:'eu',    style:'standard' },
  { id:'SE', flag:'🇸🇪', pop:10.5, region:'europe',        zh:'瑞典',         en:'Sweden',         life:83.0, gdp:56000, edu:0.94, mob:0.62, cost:0.88, nm:'eu',    style:'free' },
  { id:'NO', flag:'🇳🇴', pop:5.5,  region:'europe',        zh:'挪威',         en:'Norway',         life:83.2, gdp:87000, edu:0.96, mob:0.66, cost:1.05, nm:'eu',    style:'free' },
  { id:'CH', flag:'🇨🇭', pop:8.8,  region:'europe',        zh:'瑞士',         en:'Switzerland',    life:84.0, gdp:93000, edu:0.95, mob:0.56, cost:1.20, nm:'eu',    style:'vocational' },
  { id:'SG', flag:'🇸🇬', pop:6,    region:'southeastAsia', zh:'新加坡',       en:'Singapore',      life:83.5, gdp:84000, edu:0.96, mob:0.55, cost:0.95, nm:'sea',   style:'exam' },
  { id:'AE', flag:'🇦🇪', pop:10,   region:'middleEast',    zh:'阿联酋',       en:'UAE',            life:79.2, gdp:49000, edu:0.88, mob:0.44, cost:0.80, nm:'me',    style:'standard' },
  { id:'NZ', flag:'🇳🇿', pop:5.2,  region:'oceania',       zh:'新西兰',       en:'New Zealand',    life:82.5, gdp:48000, edu:0.94, mob:0.60, cost:0.88, nm:'oc',    style:'liberal' },
  { id:'PE', flag:'🇵🇪', pop:34,   region:'latam',         zh:'秘鲁',         en:'Peru',           life:77.0, gdp:7100,  edu:0.74, mob:0.38, cost:0.32, nm:'latam', style:'standard' },
  { id:'GH', flag:'🇬🇭', pop:34,   region:'africa',        zh:'加纳',         en:'Ghana',          life:64.0, gdp:2400,  edu:0.60, mob:0.38, cost:0.26, nm:'af',    style:'scarce' },
  { id:'CL', flag:'🇨🇱', pop:20,   region:'latam',         zh:'智利',         en:'Chile',          life:80.0, gdp:15000, edu:0.85, mob:0.44, cost:0.45, nm:'latam', style:'standard' },

  /* ---- 第二轮扩充 ---- */
  { id:'AO', flag:'🇦🇴', pop:36,   region:'africa',        zh:'安哥拉',       en:'Angola',         life:62.0, gdp:2500,  edu:0.50, mob:0.34, cost:0.28, nm:'af',    style:'scarce' },
  { id:'MZ', flag:'🇲🇿', pop:33,   region:'africa',        zh:'莫桑比克',     en:'Mozambique',     life:61.0, gdp:600,   edu:0.42, mob:0.32, cost:0.18, nm:'af',    style:'scarce' },
  { id:'MG', flag:'🇲🇬', pop:30,   region:'africa',        zh:'马达加斯加',   en:'Madagascar',     life:65.0, gdp:500,   edu:0.55, mob:0.32, cost:0.16, nm:'af',    style:'scarce' },
  { id:'CM', flag:'🇨🇲', pop:28,   region:'africa',        zh:'喀麦隆',       en:'Cameroon',       life:60.0, gdp:1600,  edu:0.58, mob:0.34, cost:0.24, nm:'af',    style:'scarce' },
  { id:'SN', flag:'🇸🇳', pop:18,   region:'africa',        zh:'塞内加尔',     en:'Senegal',        life:68.0, gdp:1700,  edu:0.50, mob:0.36, cost:0.24, nm:'af',    style:'scarce' },
  { id:'ZW', flag:'🇿🇼', pop:16,   region:'africa',        zh:'津巴布韦',     en:'Zimbabwe',       life:62.0, gdp:2100,  edu:0.80, mob:0.34, cost:0.22, nm:'af',    style:'standard' },
  { id:'RW', flag:'🇷🇼', pop:14,   region:'africa',        zh:'卢旺达',       en:'Rwanda',         life:67.0, gdp:1000,  edu:0.62, mob:0.40, cost:0.20, nm:'af',    style:'scarce' },
  { id:'TN', flag:'🇹🇳', pop:12,   region:'africa',        zh:'突尼斯',       en:'Tunisia',        life:77.0, gdp:4000,  edu:0.80, mob:0.42, cost:0.26, nm:'me',    style:'standard' },
  { id:'MY', flag:'🇲🇾', pop:34,   region:'southeastAsia', zh:'马来西亚',     en:'Malaysia',       life:75.0, gdp:12000, edu:0.85, mob:0.50, cost:0.40, nm:'sea',   style:'standard' },
  { id:'KH', flag:'🇰🇭', pop:17,   region:'southeastAsia', zh:'柬埔寨',       en:'Cambodia',       life:70.0, gdp:1800,  edu:0.62, mob:0.42, cost:0.24, nm:'sea',   style:'scarce' },
  { id:'LA', flag:'🇱🇦', pop:7.5,  region:'southeastAsia', zh:'老挝',         en:'Laos',           life:68.0, gdp:2500,  edu:0.60, mob:0.38, cost:0.22, nm:'sea',   style:'scarce' },
  { id:'IQ', flag:'🇮🇶', pop:45,   region:'middleEast',    zh:'伊拉克',       en:'Iraq',           life:70.0, gdp:5000,  edu:0.70, mob:0.36, cost:0.28, nm:'me',    style:'standard' },
  { id:'JO', flag:'🇯🇴', pop:11,   region:'middleEast',    zh:'约旦',         en:'Jordan',         life:74.0, gdp:4300,  edu:0.85, mob:0.44, cost:0.34, nm:'me',    style:'exam' },
  { id:'MN', flag:'🇲🇳', pop:3.4,  region:'eastAsia',      zh:'蒙古',         en:'Mongolia',       life:71.0, gdp:4500,  edu:0.90, mob:0.40, cost:0.30, nm:'mn',    style:'standard' },
  { id:'AZ', flag:'🇦🇿', pop:10,   region:'centralAsia',   zh:'阿塞拜疆',     en:'Azerbaijan',     life:73.0, gdp:5500,  edu:0.88, mob:0.40, cost:0.30, nm:'ge',    style:'exam' },
  { id:'GE', flag:'🇬🇪', pop:3.7,  region:'centralAsia',   zh:'格鲁吉亚',     en:'Georgia',        life:74.0, gdp:6000,  edu:0.92, mob:0.44, cost:0.30, nm:'ge',    style:'standard' },
  { id:'NL', flag:'🇳🇱', pop:18,   region:'europe',        zh:'荷兰',         en:'Netherlands',    life:82.0, gdp:57000, edu:0.94, mob:0.60, cost:0.90, nm:'eu',    style:'vocational' },
  { id:'BE', flag:'🇧🇪', pop:11.7, region:'europe',        zh:'比利时',       en:'Belgium',        life:82.0, gdp:50000, edu:0.93, mob:0.56, cost:0.88, nm:'eu',    style:'vocational' },
  { id:'AT', flag:'🇦🇹', pop:9,    region:'europe',        zh:'奥地利',       en:'Austria',        life:82.0, gdp:53000, edu:0.93, mob:0.58, cost:0.85, nm:'eu',    style:'vocational' },
  { id:'DK', flag:'🇩🇰', pop:5.9,  region:'europe',        zh:'丹麦',         en:'Denmark',        life:81.5, gdp:68000, edu:0.95, mob:0.64, cost:0.95, nm:'eu',    style:'free' },
  { id:'FI', flag:'🇫🇮', pop:5.5,  region:'europe',        zh:'芬兰',         en:'Finland',        life:82.0, gdp:53000, edu:0.96, mob:0.62, cost:0.88, nm:'eu',    style:'free' },
  { id:'GR', flag:'🇬🇷', pop:10.4, region:'europe',        zh:'希腊',         en:'Greece',         life:82.0, gdp:22000, edu:0.90, mob:0.46, cost:0.62, nm:'eu',    style:'exam' },
  { id:'RO', flag:'🇷🇴', pop:19,   region:'europe',        zh:'罗马尼亚',     en:'Romania',        life:75.0, gdp:15000, edu:0.88, mob:0.48, cost:0.42, nm:'eu',    style:'standard' },
  { id:'RS', flag:'🇷🇸', pop:6.6,  region:'europe',        zh:'塞尔维亚',     en:'Serbia',         life:75.0, gdp:9500,  edu:0.88, mob:0.44, cost:0.38, nm:'eu',    style:'standard' },
  { id:'CU', flag:'🇨🇺', pop:11,   region:'latam',         zh:'古巴',         en:'Cuba',           life:78.0, gdp:9500,  edu:0.92, mob:0.42, cost:0.30, nm:'latam', style:'free' },
  { id:'EC', flag:'🇪🇨', pop:18,   region:'latam',         zh:'厄瓜多尔',     en:'Ecuador',        life:77.0, gdp:6000,  edu:0.78, mob:0.42, cost:0.32, nm:'latam', style:'standard' },
  { id:'GT', flag:'🇬🇹', pop:18,   region:'latam',         zh:'危地马拉',     en:'Guatemala',      life:72.0, gdp:5000,  edu:0.66, mob:0.36, cost:0.30, nm:'latam', style:'scarce' },
  { id:'BO', flag:'🇧🇴', pop:12,   region:'latam',         zh:'玻利维亚',     en:'Bolivia',        life:72.0, gdp:3600,  edu:0.74, mob:0.38, cost:0.26, nm:'latam', style:'standard' },
  { id:'UY', flag:'🇺🇾', pop:3.4,  region:'latam',         zh:'乌拉圭',       en:'Uruguay',        life:78.0, gdp:20000, edu:0.90, mob:0.52, cost:0.50, nm:'latam', style:'liberal' },
  { id:'JM', flag:'🇯🇲', pop:2.8,  region:'latam',         zh:'牙买加',       en:'Jamaica',        life:74.0, gdp:6000,  edu:0.78, mob:0.40, cost:0.38, nm:'na',    style:'liberal' },
  { id:'PG', flag:'🇵🇬', pop:10,   region:'oceania',       zh:'巴布亚新几内亚', en:'Papua New Guinea', life:66.0, gdp:2700, edu:0.50, mob:0.30, cost:0.30, nm:'oc',  style:'scarce' },

  /* ---- 第二批：北欧、东欧、海湾、非洲之角、南美、大洋洲 ---- */
  { id:'SE', flag:'🇸🇪', pop:10.5, region:'europe',        zh:'瑞典',         en:'Sweden',         life:83.3, gdp:56000, edu:0.96, mob:0.60, cost:0.88, nm:'eu',    style:'liberal' },
  { id:'NO', flag:'🇳🇴', pop:5.5,  region:'europe',        zh:'挪威',         en:'Norway',         life:83.2, gdp:87000, edu:0.97, mob:0.62, cost:1.05, nm:'eu',    style:'liberal' },
  { id:'CH', flag:'🇨🇭', pop:8.8,  region:'europe',        zh:'瑞士',         en:'Switzerland',    life:84.0, gdp:93000, edu:0.96, mob:0.58, cost:1.15, nm:'eu',    style:'vocational' },
  { id:'PL', flag:'🇵🇱', pop:37,   region:'europe',        zh:'波兰',         en:'Poland',         life:78.0, gdp:18000, edu:0.90, mob:0.50, cost:0.55, nm:'eu',    style:'standard' },
  { id:'UA', flag:'🇺🇦', pop:37,   region:'europe',        zh:'乌克兰',       en:'Ukraine',        life:71.0, gdp:4500,  edu:0.85, mob:0.42, cost:0.30, nm:'ru',    style:'standard' },
  { id:'PT', flag:'🇵🇹', pop:10.4, region:'europe',        zh:'葡萄牙',       en:'Portugal',       life:81.5, gdp:25000, edu:0.90, mob:0.50, cost:0.65, nm:'eu',    style:'liberal' },
  { id:'CZ', flag:'🇨🇿', pop:10.9, region:'europe',        zh:'捷克',         en:'Czechia',        life:79.5, gdp:27000, edu:0.92, mob:0.52, cost:0.60, nm:'eu',    style:'vocational' },
  { id:'HU', flag:'🇭🇺', pop:9.6,  region:'europe',        zh:'匈牙利',       en:'Hungary',        life:76.0, gdp:19000, edu:0.90, mob:0.48, cost:0.55, nm:'eu',    style:'standard' },
  { id:'IE', flag:'🇮🇪', pop:5.3,  region:'europe',        zh:'爱尔兰',       en:'Ireland',        life:82.5, gdp:100000,edu:0.95, mob:0.55, cost:1.00, nm:'eu',    style:'liberal' },
  { id:'SG', flag:'🇸🇬', pop:5.9,  region:'southeastAsia', zh:'新加坡',       en:'Singapore',      life:83.5, gdp:82000, edu:0.95, mob:0.55, cost:1.20, nm:'sea',   style:'exam' },
  { id:'MM', flag:'🇲🇲', pop:54,   region:'southeastAsia', zh:'缅甸',         en:'Myanmar',        life:66.0, gdp:1200,  edu:0.50, mob:0.30, cost:0.20, nm:'sea',   style:'scarce' },
  { id:'AF', flag:'🇦🇫', pop:42,   region:'middleEast',    zh:'阿富汗',       en:'Afghanistan',    life:62.0, gdp:400,   edu:0.30, mob:0.20, cost:0.16, nm:'me',    style:'scarce' },
  { id:'GH', flag:'🇬🇭', pop:34,   region:'africa',        zh:'加纳',         en:'Ghana',          life:64.0, gdp:2200,  edu:0.60, mob:0.38, cost:0.26, nm:'af',    style:'standard' },
  { id:'CI', flag:'🇨🇮', pop:28,   region:'africa',        zh:'科特迪瓦',     en:"Côte d'Ivoire",  life:59.0, gdp:2500,  edu:0.50, mob:0.34, cost:0.26, nm:'af',    style:'scarce' },
  { id:'SD', flag:'🇸🇩', pop:48,   region:'middleEast',    zh:'苏丹',         en:'Sudan',          life:65.0, gdp:1000,  edu:0.40, mob:0.26, cost:0.20, nm:'me',    style:'scarce' },
  { id:'UG', flag:'🇺🇬', pop:48,   region:'africa',        zh:'乌干达',       en:'Uganda',         life:63.0, gdp:1000,  edu:0.45, mob:0.32, cost:0.20, nm:'af',    style:'scarce' },
  { id:'ZM', flag:'🇿🇲', pop:20,   region:'africa',        zh:'赞比亚',       en:'Zambia',         life:62.0, gdp:1300,  edu:0.55, mob:0.32, cost:0.20, nm:'af',    style:'scarce' },
  { id:'BW', flag:'🇧🇼', pop:2.6,  region:'africa',        zh:'博茨瓦纳',     en:'Botswana',       life:69.0, gdp:7000,  edu:0.75, mob:0.42, cost:0.30, nm:'af',    style:'standard' },
  { id:'MW', flag:'🇲🇼', pop:21,   region:'africa',        zh:'马拉维',       en:'Malawi',         life:63.0, gdp:600,   edu:0.40, mob:0.28, cost:0.16, nm:'af',    style:'scarce' },
  { id:'ML', flag:'🇲🇱', pop:23,   region:'africa',        zh:'马里',         en:'Mali',           life:59.0, gdp:900,   edu:0.35, mob:0.26, cost:0.18, nm:'af',    style:'scarce' },
  { id:'BF', flag:'🇧🇫', pop:23,   region:'africa',        zh:'布基纳法索',   en:'Burkina Faso',   life:60.0, gdp:900,   edu:0.32, mob:0.26, cost:0.18, nm:'af',    style:'scarce' },
  { id:'NE', flag:'🇳🇪', pop:26,   region:'africa',        zh:'尼日尔',       en:'Niger',          life:61.0, gdp:600,   edu:0.30, mob:0.24, cost:0.16, nm:'af',    style:'scarce' },
  { id:'SO', flag:'🇸🇴', pop:18,   region:'africa',        zh:'索马里',       en:'Somalia',        life:56.0, gdp:600,   edu:0.25, mob:0.18, cost:0.18, nm:'af',    style:'scarce' },
  { id:'LY', flag:'🇱🇾', pop:7,    region:'middleEast',    zh:'利比亚',       en:'Libya',          life:72.0, gdp:6500,  edu:0.70, mob:0.30, cost:0.28, nm:'me',    style:'standard' },
  { id:'AE', flag:'🇦🇪', pop:10,   region:'middleEast',    zh:'阿联酋',       en:'United Arab Emirates', life:79.0, gdp:49000, edu:0.88, mob:0.42, cost:0.80, nm:'me', style:'standard' },
  { id:'KW', flag:'🇰🇼', pop:4.3,  region:'middleEast',    zh:'科威特',       en:'Kuwait',         life:78.5, gdp:32000, edu:0.85, mob:0.40, cost:0.70, nm:'me',    style:'standard' },
  { id:'QA', flag:'🇶🇦', pop:2.7,  region:'middleEast',    zh:'卡塔尔',       en:'Qatar',          life:80.0, gdp:80000, edu:0.88, mob:0.40, cost:0.90, nm:'me',    style:'standard' },
  { id:'IL', flag:'🇮🇱', pop:9.8,  region:'middleEast',    zh:'以色列',       en:'Israel',         life:82.5, gdp:55000, edu:0.94, mob:0.52, cost:0.95, nm:'il',    style:'liberal' },
  { id:'LB', flag:'🇱🇧', pop:5.5,  region:'middleEast',    zh:'黎巴嫩',       en:'Lebanon',        life:75.0, gdp:4000,  edu:0.80, mob:0.32, cost:0.40, nm:'me',    style:'standard' },
  { id:'SY', flag:'🇸🇾', pop:23,   region:'middleEast',    zh:'叙利亚',       en:'Syria',          life:72.0, gdp:900,   edu:0.55, mob:0.24, cost:0.20, nm:'me',    style:'scarce' },
  { id:'YE', flag:'🇾🇪', pop:34,   region:'middleEast',    zh:'也门',         en:'Yemen',          life:64.0, gdp:600,   edu:0.35, mob:0.20, cost:0.18, nm:'me',    style:'scarce' },
  { id:'PE', flag:'🇵🇪', pop:34,   region:'latam',         zh:'秘鲁',         en:'Peru',           life:77.0, gdp:7000,  edu:0.80, mob:0.40, cost:0.32, nm:'latam', style:'standard' },
  { id:'VE', flag:'🇻🇪', pop:28,   region:'latam',         zh:'委内瑞拉',     en:'Venezuela',      life:72.0, gdp:3500,  edu:0.85, mob:0.32, cost:0.30, nm:'latam', style:'standard' },
  { id:'CL', flag:'🇨🇱', pop:20,   region:'latam',         zh:'智利',         en:'Chile',          life:80.0, gdp:16000, edu:0.90, mob:0.46, cost:0.50, nm:'latam', style:'liberal' },
  { id:'CR', flag:'🇨🇷', pop:5.2,  region:'latam',         zh:'哥斯达黎加',   en:'Costa Rica',     life:80.0, gdp:13000, edu:0.88, mob:0.48, cost:0.45, nm:'latam', style:'liberal' },
  { id:'DO', flag:'🇩🇴', pop:11,   region:'latam',         zh:'多米尼加',     en:'Dominican Republic', life:73.0, gdp:10000, edu:0.78, mob:0.38, cost:0.38, nm:'latam', style:'standard' },
  { id:'NZ', flag:'🇳🇿', pop:5.2,  region:'oceania',       zh:'新西兰',       en:'New Zealand',    life:82.5, gdp:48000, edu:0.95, mob:0.60, cost:0.90, nm:'oc',    style:'liberal' },
  { id:'KG', flag:'🇰🇬', pop:7,    region:'centralAsia',   zh:'吉尔吉斯斯坦', en:'Kyrgyzstan',     life:72.0, gdp:1600,  edu:0.78, mob:0.34, cost:0.22, nm:'ca',    style:'standard' },
  { id:'TJ', flag:'🇹🇯', pop:10,   region:'centralAsia',   zh:'塔吉克斯坦',   en:'Tajikistan',     life:71.0, gdp:1000,  edu:0.75, mob:0.28, cost:0.18, nm:'ca',    style:'scarce' },
  { id:'TM', flag:'🇹🇲', pop:6.5,  region:'centralAsia',   zh:'土库曼斯坦',   en:'Turkmenistan',   life:69.0, gdp:9000,  edu:0.75, mob:0.26, cost:0.26, nm:'ca',    style:'standard' },
];

/* ---------------- 姓名池 ---------------- */
/* [本地文字, 罗马化] */
const NAMES = {
  cn: {
    m:[['伟','Wei'],['磊','Lei'],['浩','Hao'],['宇','Yu'],['强','Qiang'],['俊','Jun'],['鹏','Peng'],['涛','Tao']],
    f:[['芳','Fang'],['静','Jing'],['敏','Min'],['雪','Xue'],['丽','Li'],['欣','Xin'],['婷','Ting'],['悦','Yue']],
    l:[['王','Wang'],['李','Li'],['张','Zhang'],['刘','Liu'],['陈','Chen'],['杨','Yang'],['赵','Zhao'],['周','Zhou']],
  },
  jp: {
    m:[['悠人','Yuto'],['蓮','Ren'],['大翔','Hiroto'],['颯太','Sota'],['陽翔','Haruto'],['樹','Itsuki']],
    f:[['結衣','Yui'],['葵','Aoi'],['陽菜','Hina'],['凛','Rin'],['美咲','Misaki'],['咲良','Sakura']],
    l:[['佐藤','Sato'],['鈴木','Suzuki'],['高橋','Takahashi'],['田中','Tanaka'],['伊藤','Ito'],['渡辺','Watanabe']],
  },
  kr: {
    m:[['敏俊','Minjun'],['志勋','Jihoon'],['道贤','Dohyun'],['俊浩','Junho'],['贤宇','Hyunwoo'],['泰勇','Taeyong']],
    f:[['瑞妍','Seoyeon'],['智恩','Jieun'],['敏智','Minji'],['秀彬','Subin'],['彩英','Chaeyoung'],['娜妍','Nayeon']],
    l:[['金','Kim'],['李','Lee'],['朴','Park'],['崔','Choi'],['郑','Jung'],['姜','Kang']],
  },
  in: {
    m:[['Aarav','Aarav'],['Vihaan','Vihaan'],['Rohan','Rohan'],['Arjun','Arjun'],['Kabir','Kabir'],['Sanjay','Sanjay']],
    f:[['Ananya','Ananya'],['Priya','Priya'],['Isha','Isha'],['Meera','Meera'],['Kavya','Kavya'],['Lakshmi','Lakshmi']],
    l:[['Sharma','Sharma'],['Patel','Patel'],['Singh','Singh'],['Kumar','Kumar'],['Reddy','Reddy'],['Gupta','Gupta']],
  },
  pk: {
    m:[['Ali','Ali'],['Hamza','Hamza'],['Bilal','Bilal'],['Usman','Usman'],['Zain','Zain'],['Imran','Imran']],
    f:[['Ayesha','Ayesha'],['Fatima','Fatima'],['Zainab','Zainab'],['Hina','Hina'],['Sana','Sana'],['Maryam','Maryam']],
    l:[['Khan','Khan'],['Ahmed','Ahmed'],['Malik','Malik'],['Qureshi','Qureshi'],['Sheikh','Sheikh'],['Butt','Butt']],
  },
  bd: {
    m:[['Rahim','Rahim'],['Hasan','Hasan'],['Rafiq','Rafiq'],['Tanvir','Tanvir'],['Sabbir','Sabbir'],['Nayeem','Nayeem']],
    f:[['Nusrat','Nusrat'],['Rima','Rima'],['Sumaiya','Sumaiya'],['Tasnim','Tasnim'],['Shirin','Shirin'],['Afsana','Afsana']],
    l:[['Rahman','Rahman'],['Islam','Islam'],['Hossain','Hossain'],['Chowdhury','Chowdhury'],['Karim','Karim'],['Das','Das']],
  },
  np: {
    m:[['Bikash','Bikash'],['Suman','Suman'],['Rajan','Rajan'],['Dipesh','Dipesh'],['Nabin','Nabin']],
    f:[['Sita','Sita'],['Anjali','Anjali'],['Puja','Puja'],['Sabina','Sabina'],['Maya','Maya']],
    l:[['Shrestha','Shrestha'],['Thapa','Thapa'],['Gurung','Gurung'],['Karki','Karki'],['Rai','Rai']],
  },
  lk: {
    m:[['Kasun','Kasun'],['Nuwan','Nuwan'],['Dilan','Dilan'],['Chamara','Chamara'],['Sahan','Sahan']],
    f:[['Dilini','Dilini'],['Sanduni','Sanduni'],['Nadeesha','Nadeesha'],['Ishara','Ishara'],['Tharushi','Tharushi']],
    l:[['Perera','Perera'],['Fernando','Fernando'],['Silva','Silva'],['Jayawardena','Jayawardena'],['Bandara','Bandara']],
  },
  sea: {
    m:[['Adi','Adi'],['Budi','Budi'],['Rizky','Rizky'],['Minh','Minh'],['Thanh','Thanh'],['Arthit','Arthit'],['Jose','Jose'],['Paulo','Paulo']],
    f:[['Sari','Sari'],['Dewi','Dewi'],['Linh','Linh'],['Mai','Mai'],['Ploy','Ploy'],['Maria','Maria'],['Angel','Angel']],
    l:[['Santos','Santos'],['Nguyen','Nguyen'],['Tran','Tran'],['Wijaya','Wijaya'],['Sukarno','Sukarno'],['Reyes','Reyes']],
  },
  me: {
    m:[['Omar','Omar'],['Yusuf','Yusuf'],['Karim','Karim'],['Mehmet','Mehmet'],['Reza','Reza'],['Amir','Amir'],['Sami','Sami']],
    f:[['Layla','Layla'],['Nour','Nour'],['Zahra','Zahra'],['Elif','Elif'],['Sara','Sara'],['Yasmin','Yasmin']],
    l:[['Al-Hassan','Al-Hassan'],['Yilmaz','Yilmaz'],['Hosseini','Hosseini'],['Demir','Demir'],['Khalil','Khalil'],['Farah','Farah']],
  },
  tr: {
    m:[['Emre','Emre'],['Mert','Mert'],['Burak','Burak'],['Can','Can'],['Kerem','Kerem']],
    f:[['Zeynep','Zeynep'],['Elif','Elif'],['Selin','Selin'],['Defne','Defne'],['Ayse','Ayse']],
    l:[['Yilmaz','Yilmaz'],['Kaya','Kaya'],['Demir','Demir'],['Sahin','Sahin'],['Celik','Celik']],
  },
  ru: {
    m:[['Ivan','Ivan'],['Dmitri','Dmitri'],['Sergei','Sergei'],['Alexei','Alexei'],['Nikolai','Nikolai']],
    f:[['Anastasia','Anastasia'],['Olga','Olga'],['Katya','Katya'],['Svetlana','Svetlana'],['Irina','Irina']],
    l:[['Ivanov','Ivanov'],['Smirnov','Smirnov'],['Kuznetsov','Kuznetsov'],['Popov','Popov'],['Volkov','Volkov']],
  },
  af: {
    m:[['Kwame','Kwame'],['Chidi','Chidi'],['Tunde','Tunde'],['Emeka','Emeka'],['Kofi','Kofi'],['Abebe','Abebe'],['Musa','Musa'],['Thabo','Thabo']],
    f:[['Amara','Amara'],['Ngozi','Ngozi'],['Aisha','Aisha'],['Zola','Zola'],['Fatou','Fatou'],['Chiamaka','Chiamaka'],['Nadia','Nadia']],
    l:[['Okafor','Okafor'],['Mensah','Mensah'],['Adeyemi','Adeyemi'],['Bekele','Bekele'],['Nkosi','Nkosi'],['Diallo','Diallo'],['Mwangi','Mwangi']],
  },
  eu: {
    m:[['Lukas','Lukas'],['Marco','Marco'],['Pierre','Pierre'],['Oliver','Oliver'],['Erik','Erik'],['Mateo','Mateo']],
    f:[['Elena','Elena'],['Sophie','Sophie'],['Chiara','Chiara'],['Anna','Anna'],['Camille','Camille'],['Freya','Freya']],
    l:[['Muller','Muller'],['Rossi','Rossi'],['Dubois','Dubois'],['Smith','Smith'],['Andersson','Andersson'],['Novak','Novak']],
  },
  latam: {
    m:[['Diego','Diego'],['Mateo','Mateo'],['Lucas','Lucas'],['Santiago','Santiago'],['Rafael','Rafael'],['Joao','Joao']],
    f:[['Sofia','Sofia'],['Valentina','Valentina'],['Camila','Camila'],['Isabella','Isabella'],['Larissa','Larissa'],['Lucia','Lucia']],
    l:[['Silva','Silva'],['Garcia','Garcia'],['Martinez','Martinez'],['Rodriguez','Rodriguez'],['Oliveira','Oliveira'],['Fernandez','Fernandez']],
  },
  na: {
    m:[['James','James'],['Michael','Michael'],['Ethan','Ethan'],['Noah','Noah'],['Daniel','Daniel'],['Tyler','Tyler']],
    f:[['Emily','Emily'],['Sarah','Sarah'],['Olivia','Olivia'],['Megan','Megan'],['Chloe','Chloe'],['Rachel','Rachel']],
    l:[['Johnson','Johnson'],['Williams','Williams'],['Brown','Brown'],['Miller','Miller'],['Davis','Davis'],['Wilson','Wilson']],
  },
  oc: {
    m:[['Jack','Jack'],['Liam','Liam'],['Cooper','Cooper'],['Flynn','Flynn'],['Noah','Noah']],
    f:[['Ruby','Ruby'],['Matilda','Matilda'],['Chloe','Chloe'],['Isla','Isla'],['Grace','Grace']],
    l:[['Taylor','Taylor'],['Walker','Walker'],['Harris','Harris'],['Reid','Reid'],['Mitchell','Mitchell']],
  },
  ca: {
    m:[['Alikhan','Alikhan'],['Daniyar','Daniyar'],['Timur','Timur'],['Aziz','Aziz'],['Bekzod','Bekzod']],
    f:[['Aigerim','Aigerim'],['Dana','Dana'],['Zarina','Zarina'],['Madina','Madina'],['Nilufar','Nilufar']],
    l:[['Nurlanov','Nurlanov'],['Karimov','Karimov'],['Sadykov','Sadykov'],['Tursunov','Tursunov'],['Abdullaev','Abdullaev']],
  },
  mn: {
    m:[['Батбаяр','Batbayar'],['Тэмүүлэн','Temuulen'],['Ганбат','Ganbat'],['Эрдэнэ','Erdene'],['Амар','Amar']],
    f:[['Саран','Saran'],['Оюуна','Oyuuna'],['Туяа','Tuyaa'],['Номин','Nomin'],['Хулан','Khulan']],
    l:[['Батбаатар','Batbaatar'],['Дорж','Dorj'],['Энхбат','Enkhbat'],['Ганболд','Ganbold'],['Сүх','Sukh']],
  },
  ge: {
    m:[['Giorgi','Giorgi'],['Davit','Davit'],['Luka','Luka'],['Anar','Anar'],['Elvin','Elvin']],
    f:[['Nino','Nino'],['Tamar','Tamar'],['Mariam','Mariam'],['Leyla','Leyla'],['Aysel','Aysel']],
    l:[['Beridze','Beridze'],['Kapanadze','Kapanadze'],['Mammadov','Mammadov'],['Aliyev','Aliyev'],['Giorgadze','Giorgadze']],
  },
  il: {
    m:[['Noam','Noam'],['Ariel','Ariel'],['Yonatan','Yonatan'],['Eitan','Eitan'],['David','David'],['Omer','Omer']],
    f:[['Noa','Noa'],['Tamar','Tamar'],['Yael','Yael'],['Shira','Shira'],['Maya','Maya'],['Roni','Roni']],
    l:[['Cohen','Cohen'],['Levi','Levi'],['Mizrahi','Mizrahi'],['Peretz','Peretz'],['Biton','Biton'],['Dahan','Dahan']],
  },
};

/* ---------------- 家庭阶层 ----------------
   7 档：两端各加一档，让「顶级富豪」和「赤贫」都成为真实可遇到的命运。
   权重参照真实世界收入分布：全球约 9% 在极端贫困线以下，
   最顶端千万分之一是亿万富翁——游戏里把这个概率放大到可体验的量级。 */
const TIERS = [
  { key:'destitute', zh:'赤贫',     en:'Destitute',   zhDesc:'家里常常断粮',      enDesc:'Sometimes no food on the table' },
  { key:'poor',      zh:'贫困',     en:'Poor',        zhDesc:'一天挣的只够一天',  enDesc:'A day\'s work buys a day' },
  { key:'working',   zh:'温饱',     en:'Working',     zhDesc:'勉强够吃穿',        enDesc:'Just enough to get by' },
  { key:'modest',    zh:'小康',     en:'Modest',      zhDesc:'不富裕但稳定',      enDesc:'Not rich, but stable' },
  { key:'middle',    zh:'中产',     en:'Middle class',zhDesc:'有房有车有假期',    enDesc:'A flat, a car, a holiday' },
  { key:'rich',      zh:'富豪',     en:'Rich',        zhDesc:'生来就在金字塔上层', enDesc:'Born in the upper floors' },
  { key:'dynasty',   zh:'顶级富豪', en:'Dynasty',     zhDesc:'名字在富豪榜上',    enDesc:'Your family name is on a list' },
];

/* 粗粒度映射：老代码用 fam 0-4 判断，保持兼容 */
const TIER_FAM = [0, 0, 1, 2, 3, 4, 4];

/* 16 岁时家里给的起点（人均GDP 的倍数）；顶端两级用绝对下限兜底 */
const TIER_START = [0, 0.05, 0.22, 0.70, 2.0, 10, 300];
const TIER_START_MIN = [0, 0, 0, 0, 0, 2e6, 3.5e7];

/* 资本回报率：越有钱，钱生钱越快（这就是两极分化的机制） */
const TIER_CAP = [0.018, 0.020, 0.024, 0.028, 0.034, 0.050, 0.072];

/* 家庭阶层分布：由人均GDP与流动性推导 */
function tierWeights(c) {
  const t = Math.max(0, Math.min(1, Math.log10(Math.max(600, c.gdp) / 800) / Math.log10(110)));
  const skew = 1 - c.mob; // 流动性低 → 两极分化
  let w = [
    0.300 - 0.290 * t + 0.050 * skew,
    0.240 - 0.200 * t + 0.030 * skew,
    0.260 - 0.100 * t - 0.040 * skew,
    0.140 + 0.160 * t - 0.020 * skew,
    0.052 + 0.260 * t,
    0.004 + 0.045 * t + 0.006 * skew,
    0.001 + 0.014 * t + 0.004 * skew,
  ].map(x => Math.max(0.0004, x));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map(x => x / s);
}

const TOTAL_POP = COUNTRIES.reduce((a, c) => a + c.pop, 0);

/* 教育模式差异 */
const EDU_STYLE = {
  exam:      { zh:'应试教育', en:'Exam-driven',  collegeCost:0.55, vocCost:0.25, examWeight:1.25 },
  liberal:   { zh:'通识教育', en:'Liberal arts', collegeCost:1.60, vocCost:0.55, examWeight:0.85 },
  vocational:{ zh:'双元制',   en:'Dual system',  collegeCost:0.35, vocCost:0.15, examWeight:0.95 },
  free:      { zh:'免费教育', en:'Free tuition', collegeCost:0.05, vocCost:0.05, examWeight:0.95 },
  scarce:    { zh:'资源稀缺', en:'Scarce access',collegeCost:0.85, vocCost:0.35, examWeight:1.05 },
  standard:  { zh:'常规',     en:'Standard',     collegeCost:0.80, vocCost:0.35, examWeight:1.00 },
};

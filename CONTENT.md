# 内容编写指南

想加一个国家、一条事件，或者改数值平衡，看这一页就够了。
改完跑 `node tools/validate.js`，它会告诉你哪里写错了。

---

## 一条事件长什么样

事件都放在 `js/data-events.js`，按人生阶段分成几个数组（`EV_CHILD`、`EV_TEEN`、`EV_YOUNG`…），
最后统一拼进 `ALL_EVENTS`。

### 最简单的一条

```js
{ id:'my_event', a:[20,40], w:3, t:'g',
  zh:'你第一次拿到年终奖，请全家人吃了一顿饭。',
  en:'You got your first year-end bonus and took the whole family out to dinner.',
  fx:{ mo:2, jy:6 } }
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | 全局唯一。重复了校验器会报错 |
| `a` | ✅ | `[起始年龄, 结束年龄]`，闭区间，0~120 |
| `w` | ✅ | 权重，正整数。3 是普通事件的常用值，5 以上表示很常见 |
| `t` | ✅ | `'g'` 好事 / `'b'` 坏事 / `'n'` 中性 / `'m'` 里程碑 |
| `zh` `en` | ✅ | 中英双语，都要写。英文别用直译腔 |
| `fx` | | 效果，见下表 |
| `c` | | 触发条件，一个函数，例如 `s => s.tier >= 5` |
| `cn` | | 只在这些国家触发：`cn:['JP','KR']` |
| `rg` | | 只在这些地区触发：`rg:['europe']` |
| `rep` | | 设 `1` 表示可重复触发（用 `v` 存多个文案版本） |

### 效果 `fx` 能改什么

| 键 | 含义 |
|---|---|
| `hp` | 健康 |
| `iq` | 智力 |
| `ap` | 外貌 |
| `jy` | 快乐 |
| `lk` | 运气 |
| `mo` | 钱。单位是「当地人均月收入的一小部分」，±1~5 是正常量级 |
| `mul` | 按比例改变现有资产，`0.3` = 涨 30%，`-0.4` = 跌 40%（富豪事件用这个） |
| `abs` | 绝对金额（美元），用于遗产、赔偿这种 |

### 带选择的

```js
{ id:'my_choice', a:[24,34], w:3, t:'n',
  zh:'有人拉你合伙做生意，要你把积蓄投进去。',
  en:'Someone wanted you as a partner, and your savings as the buy-in.',
  ch:[
    { zh:'投', en:'Put it in', fx:{ mul:-0.7, lk:6 },
      r:{ zh:'你把钱投了进去。头两年一分没见着。', en:'You put it in. For two years you saw nothing back.' } },
    { zh:'不投', en:'Keep it', fx:{ jy:-2, mo:1 },
      r:{ zh:'你没投。那门生意后来做得不错，也后来垮了。', en:'You passed. The business did well, and then it collapsed.' } },
  ] }
```

- `ch` 至少两个选项
- 每个选项必须有 `zh` / `en` / `fx`（或 `set`）/ `r`（选完之后显示的结果文案）
- 选项还可以带 `set:{ married:true }` 直接改状态、`ed:5` 提升学历、`kids:1` 生孩子

### 可重复事件

有些事一辈子会发生好几次（老朋友来电、身体不舒服），用 `v` 存几个版本，引擎随机挑一个：

```js
{ id:'r_call', rep:1, a:[55,110], w:3, t:'g',
  v:[
    ['一个老朋友打来电话，你们聊了一个多小时。', 'An old friend called. You talked for over an hour.'],
    ['很久没联系的人发来消息，第一句是「你还记得我吗」。', 'Someone you had not heard from in years wrote: "Do you remember me?"'],
  ],
  fx:{ jy:4 } }
```

---

## 加一个国家

国家在 `js/data-countries.js` 的 `COUNTRIES` 数组里，一行一个：

```js
{ id:'IS', flag:'🇮🇸', pop:0.39, region:'europe', zh:'冰岛', en:'Iceland',
  life:83.1, gdp:74000, edu:0.96, mob:0.62, cost:1.05, nm:'eu', style:'free' },
```

| 字段 | 说明 |
|---|---|
| `id` | 两位国家代码，唯一 |
| `pop` | 人口，单位百万 |
| `life` | 预期寿命 |
| `gdp` | 人均 GDP（美元） |
| `edu` | 教育水平 0~1，影响受教育机会 |
| `mob` | 社会流动性 0~1，越低阶层越固化 |
| `cost` | 生活成本系数，1.0 约等于美国 |
| `nm` | 姓名池的 key，见 `NAMES` |
| `style` | 教育体系：`exam` 应试 / `free` 宽松 / `vocational` 分流 / `scarce` 稀缺 / `liberal` 自由 / `standard` 常规 |

加完记得跑 `node tools/sim.js 40000` 重新生成分位表——国家变了，分数分布也会变。

---

## 几个容易踩的坑

**id 不要重复。** 重复的事件 id 会导致同一条事件只触发一次；重复的国家 id 会让那个国家的投胎概率翻倍。

**条件函数里只能读 `s`。** 不要访问 DOM、不要用 `Math.random()`，否则重放和回溯会失效。

**年龄区间别写反。** `a:[40,20]` 校验器会直接报错。

**中英双语都要写。** 缺一边的话，切到英文会露出中文。

**改完数值平衡一定要重跑分位表**，否则「超过了 94% 的人生」这句话就不准了。

```bash
node tools/validate.js      # 先校验
node tools/sim.js 40000     # 再生成分位表
node tools/build.js         # 最后打包
```

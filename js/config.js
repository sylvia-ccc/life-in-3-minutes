/* ============================================================
   配置文件
   —— 想把它变成你自己的版本，改这一个文件就够了。
   —— 改完记得重新构建：node tools/build.js
   ============================================================ */
const GAME = {
  /* 品牌 */
  title:   '模拟人生 · 3 分钟看完一生',
  titleEn: 'Life in 3 Minutes',
  site:    'game.workagentpro.com',            // 卡片底部显示的网址
  url:     'https://game.workagentpro.com',    // 分享文案里的完整链接

  /* 默认语言：'zh' 或 'en'（玩家切换过之后以玩家选择为准） */
  lang: 'zh',

  /* 功能开关 */
  track:    true,   // 匿名埋点：打开 / 开始 / 完成 / 停留时长
  daily:    true,   // 今日之命：同一天所有人同一个种子
  gallery:  true,   // 命运图鉴：国家收集与称号
  card:     true,   // 人生卡片：Canvas 绘制的分享图
  qr:       true,   // 卡片上的二维码
  seedLink: true,   // 人生链接：?s=<seed> 让别人重走你这一生

  /* 存档命名空间。同一个域名下跑多份副本时，记得改成不同的值 */
  storageKey: 'life3m.v1',

  /* 卡片二维码指向的网址。
     矩阵是按这个网址预生成的；如果你改了 url，需要重新生成，
     否则二维码会指错地方（tools/qr.py 可以重新生成矩阵）。 */
  qrUrl: 'https://game.workagentpro.com',
};

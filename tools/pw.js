/* 统一的浏览器启动器
   - 装了 playwright-core 就能直接用（npm i 之后 npx playwright install chromium）
   - 也可以用 CHROME_PATH 指向本机已有的 Chrome，省掉下载 */
let chromium;
try {
  chromium = require('playwright-core').chromium;
} catch (e) {
  console.error('缺少 playwright-core，请先在项目根目录运行：npm i');
  process.exit(1);
}

async function launch(opts) {
  const exe = process.env.CHROME_PATH;
  const base = exe ? { executablePath: exe } : {};
  return chromium.launch(Object.assign(base, opts || {}));
}

module.exports = { chromium, launch };

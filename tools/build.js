/* 打包成单文件 HTML（可直接双击打开、发人、离线运行） */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, p) => {
  const css = fs.readFileSync(path.join(root, p), 'utf8');
  return '<style>\n' + css + '\n</style>';
});

html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, p) => {
  const js = fs.readFileSync(path.join(root, p), 'utf8');
  return '<script>\n/* ==== ' + path.basename(p) + ' ==== */\n' + js + '\n</script>';
});

const out = path.join(root, 'dist', 'life-in-3-minutes.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
const kb = (fs.statSync(out).size / 1024).toFixed(1);
console.log('已生成 dist/life-in-3-minutes.html  (' + kb + ' KB)');

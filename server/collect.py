#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
模拟人生-3分钟看完一生 · 后台数据服务（仅站长可见）
零依赖（Python 标准库），监听 127.0.0.1:8099，由 nginx 反代。

  POST /c          接收埋点事件（JSON）
  GET  /stats      数据面板（HTML，nginx basic auth 保护）
  GET  /stats.json 原始汇总（JSON）
  GET  /stats.csv  按天明细（CSV，Excel 可直接打开）

数据落地：$LIFE_STATS_BASE/data/YYYY-MM.jsonl（按月分文件）
            不设环境变量时，默认放在脚本所在目录。
隐私：不存原始 IP，只存 sha256(盐 + IP) 前 12 位
"""
import csv
import io
import json
import os
import time
import hashlib
import datetime
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from string import Template
from urllib.parse import urlparse

BASE = os.environ.get('LIFE_STATS_BASE') or os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, 'data')
SALT_FILE = os.path.join(BASE, '.salt')
LOCK = threading.Lock()
MAX_BODY = 4096
ALLOWED = ('open', 'start', 'begin', 'end', 'leave', 'ping')
DWELL_T = ('leave', 'ping', 'end')


def _salt():
    if not os.path.exists(SALT_FILE):
        with open(SALT_FILE, 'w') as f:
            f.write(hashlib.sha256(os.urandom(32)).hexdigest())
        os.chmod(SALT_FILE, 0o600)
    with open(SALT_FILE) as f:
        return f.read().strip()


SALT = _salt()


def append(ev):
    os.makedirs(DATA, exist_ok=True)
    path = os.path.join(DATA, datetime.date.today().strftime('%Y-%m') + '.jsonl')
    line = json.dumps(ev, ensure_ascii=False)
    with LOCK:
        with open(path, 'a', encoding='utf-8') as f:
            f.write(line + '\n')


def read_events():
    out = []
    if not os.path.isdir(DATA):
        return out
    for fn in sorted(os.listdir(DATA)):
        if not fn.endswith('.jsonl'):
            continue
        try:
            with open(os.path.join(DATA, fn), encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            out.append(json.loads(line))
                        except ValueError:
                            pass
        except OSError:
            pass
    return out


def daily_path():
    return os.path.join(DATA, 'daily-' + datetime.date.today().isoformat() + '.jsonl')


def append_daily(ev):
    os.makedirs(DATA, exist_ok=True)
    line = json.dumps(ev, ensure_ascii=False)
    with LOCK:
        with open(daily_path(), 'a', encoding='utf-8') as f:
            f.write(line + '\n')


def daily_board(score):
    rows = []
    path = daily_path()
    if os.path.exists(path):
        try:
            with open(path, encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            rows.append(json.loads(line))
                        except ValueError:
                            pass
        except OSError:
            pass
    best = {}
    for r in rows:
        sid = r.get('sid') or ''
        sc = float(r.get('score') or 0)
        if sc > best.get(sid, -1e9):
            best[sid] = sc
    vals = sorted(best.values())
    n = len(vals)
    if not n:
        return {'n': 0, 'rank': 0, 'pct': 0, 'top': None}
    below = sum(1 for v in vals if v < score)
    rank = n - sum(1 for v in vals if v <= score) + 1
    return {'n': n, 'rank': rank,
            'pct': round(below * 100.0 / n, 1),
            'top': round(vals[-1], 1)}


def day_of(ts):
    try:
        return datetime.date.fromtimestamp(ts).isoformat()
    except (ValueError, OSError, OverflowError):
        return datetime.date.today().isoformat()


def summarize(events):
    opens = [e for e in events if e.get('t') == 'open']
    sids = set(e.get('sid') for e in opens if e.get('sid'))

    dwell = {}
    for e in events:
        if e.get('t') in DWELL_T:
            d = e.get('dur') or 0
            s = e.get('sid') or ''
            if d > dwell.get(s, 0):
                dwell[s] = d
    durs = sorted(v for v in dwell.values() if v > 0)

    def cnt(t):
        return len(set(e.get('sid') for e in events if e.get('t') == t and e.get('sid')))

    by_day = {}
    for e in events:
        d = day_of(e.get('ts') or 0)
        row = by_day.setdefault(d, {'pv': 0, 'sids': set(), 'dm': {}})
        if e.get('t') == 'open':
            row['pv'] += 1
        if e.get('sid'):
            row['sids'].add(e['sid'])
        if e.get('t') in DWELL_T and e.get('dur'):
            k = e.get('sid') or ''
            if e['dur'] > row['dm'].get(k, 0):
                row['dm'][k] = e['dur']

    days = []
    for d in sorted(by_day, reverse=True)[:14]:
        r = by_day[d]
        ds = list(r.get('dm', {}).values())
        days.append({
            'date': d,
            'pv': r['pv'],
            'uv': len(r['sids']),
            'avg': round(sum(ds) / len(ds), 1) if ds else None,
        })

    today = datetime.date.today().isoformat()
    td = by_day.get(today, {'pv': 0, 'sids': set(), 'dm': {}})
    td_durs = list(td.get('dm', {}).values())

    dev = {'mobile': 0, 'desktop': 0}
    lang = {'zh': 0, 'en': 0}
    refs = {}
    countries = {}
    ages = []
    grades = {}
    for e in opens:
        dev['mobile' if (e.get('vw') or 0) < 760 else 'desktop'] += 1
        lang['en' if e.get('lang') == 'en' else 'zh'] += 1
        r = (e.get('ref') or '').strip()
        if r:
            try:
                host = urlparse(r).hostname or r
            except ValueError:
                host = r
            refs[host[:40]] = refs.get(host[:40], 0) + 1
    for e in events:
        if e.get('t') != 'end':
            continue
        g = e.get('grade') or ''
        if g:
            grades[g] = grades.get(g, 0) + 1
        cid = e.get('cid') or ''
        if cid:
            countries[cid] = countries.get(cid, 0) + 1
        a = e.get('age') or 0
        if a > 0:
            ages.append(a)

    def top(d, n):
        return sorted(d.items(), key=lambda x: -x[1])[:n]

    # 停留时长分桶
    buckets = [('0-10 秒', 0, 10), ('10-30 秒', 10, 30), ('30-60 秒', 30, 60),
               ('1-3 分', 60, 180), ('3-10 分', 180, 600), ('10 分以上', 600, 10 ** 9)]
    hist = []
    for label, lo, hi in buckets:
        hist.append((label, sum(1 for v in durs if lo <= v < hi)))

    return {
        'pv': len(opens),
        'uv': len(sids),
        'today_pv': td['pv'],
        'today_uv': len(td['sids']),
        'today_avg': round(sum(td_durs) / len(td_durs), 1) if td_durs else None,
        'started': cnt('start'),
        'began': cnt('begin'),
        'finished': cnt('end'),
        'dwell_n': len(durs),
        'dwell_avg': round(sum(durs) / len(durs), 1) if durs else None,
        'dwell_med': durs[len(durs) // 2] if durs else None,
        'dwell_max': durs[-1] if durs else None,
        'days': days,
        'device': dev,
        'lang': lang,
        'grades': grades,
        'refs': top(refs, 8),
        'countries': top(countries, 12),
        'avg_age': round(sum(ages) / len(ages), 1) if ages else None,
        'hist': hist,
    }


def fmt_dur(s):
    if s is None:
        return '—'
    s = int(round(s))
    if s < 60:
        return '%d 秒' % s
    if s < 3600:
        return '%d 分 %02d 秒' % (s // 60, s % 60)
    return '%d 时 %02d 分' % (s // 3600, (s % 3600) // 60)


def pct(a, b):
    return ('%.1f%%' % (a * 100.0 / b)) if b else '—'


PAGE = Template("""<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>后台数据 · 模拟人生</title>
<style>
  :root{--paper:#f4f1ea;--paper2:#faf8f3;--ink:#1b1a17;--ink2:#46423b;--ink3:#837c70;
        --line:#ddd6c9;--gold:#a9762c;--jade:#3f7455;--clay:#a34a3c}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--paper);color:var(--ink);font:14px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",system-ui,sans-serif;
       padding:34px 20px 60px;-webkit-font-smoothing:antialiased}
  body::before{content:'';position:fixed;inset:0;pointer-events:none;
    background:radial-gradient(circle at 15% 8%,rgba(169,118,44,.06),transparent 45%),
               radial-gradient(circle at 85% 92%,rgba(63,116,85,.05),transparent 45%)}
  .wrap{max-width:820px;margin:0 auto;position:relative}
  h1{font-family:"Songti SC",Georgia,serif;font-size:24px;font-weight:600;letter-spacing:.04em}
  .sub{font-size:11px;letter-spacing:.22em;color:var(--ink3);text-transform:uppercase;margin-top:4px}
  .top{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}
  .dl{font-size:11.5px;color:var(--ink3);letter-spacing:.06em}
  .dl a{color:var(--gold);text-decoration:none;border-bottom:1px solid rgba(169,118,44,.35);margin-left:10px}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:9px;margin:26px 0 22px}
  .c{background:var(--paper2);border:1px solid var(--line);border-radius:3px;padding:15px 16px}
  .c .k{font-size:10px;letter-spacing:.15em;color:var(--ink3);text-transform:uppercase}
  .c .v{font-family:"Songti SC",Georgia,serif;font-size:27px;margin-top:5px;line-height:1.1}
  .c .s{font-size:11px;color:var(--ink3);margin-top:3px}
  .c.hi .v{color:var(--gold)}
  h2{font-size:10px;letter-spacing:.22em;color:var(--ink3);text-transform:uppercase;
     margin:26px 0 9px;font-weight:500}
  table{width:100%;border-collapse:collapse;background:var(--paper2);border:1px solid var(--line)}
  th,td{padding:9px 13px;text-align:left;border-bottom:1px solid var(--line);font-size:13px}
  th{font-size:10px;letter-spacing:.12em;color:var(--ink3);text-transform:uppercase;font-weight:500}
  td.n{font-family:"SF Mono",Menlo,monospace;font-size:12.5px}
  tr:last-child td{border-bottom:none}
  td.empty{text-align:center;color:var(--ink3);padding:26px}
  .meta{font-size:12px;color:var(--ink3);line-height:2}
  .meta b{color:var(--ink2);font-weight:500}
  .bar{display:flex;height:5px;border-radius:3px;overflow:hidden;background:var(--line);margin-top:8px}
  .bar i{display:block;height:100%}
  .hb{display:flex;align-items:center;gap:10px;margin:5px 0}
  .hb .lb{width:88px;font-size:12px;color:var(--ink3)}
  .hb .tr{flex:1;height:9px;background:rgba(27,26,23,.06);border-radius:2px;overflow:hidden}
  .hb .tr i{display:block;height:100%;background:#a9762c;opacity:.75}
  .hb .nm{width:52px;text-align:right;font-family:"SF Mono",Menlo,monospace;font-size:12px;color:var(--ink2)}
  .foot{margin-top:34px;font-size:11px;color:var(--ink3);letter-spacing:.04em}
</style></head><body><div class="wrap">
  <div class="top">
    <div>
      <h1>后台数据</h1>
      <div class="sub">模拟人生 · 3 分钟看完一生</div>
    </div>
    <div class="dl">$updated
      <a href="/stats.csv">下载 CSV</a>
      <a href="/stats.json">JSON</a>
    </div>
  </div>

  <div class="cards">
    <div class="c hi"><div class="k">累计访客</div><div class="v">$uv</div><div class="s">页面访问 $pv 次</div></div>
    <div class="c"><div class="k">今日访客</div><div class="v">$tuv</div><div class="s">今日访问 $tpv 次</div></div>
    <div class="c"><div class="k">中位停留</div><div class="v">$dmed</div><div class="s">平均 $davg · 最长 $dmax</div></div>
    <div class="c"><div class="k">完成率</div><div class="v">$done</div><div class="s">$fin / $st 人玩到结局</div></div>
  </div>

  <h2>漏斗</h2>
  <div class="meta">
    进入页面 <b>$uv</b> 人 · 点了投胎 <b>$st</b> 人（$r1）· 开始这一生 <b>$bg</b> 人（$r2）· 走到结局 <b>$fin</b> 人（$r3）
    <div class="bar"><i style="width:$w1%;background:#c9b48a"></i><i style="width:$w2%;background:#a9762c"></i><i style="width:$w3%;background:#3f7455"></i></div>
  </div>

  <h2>停留时长分布</h2>
  <div>$hist</div>

  <h2>近 14 天</h2>
  <table><thead><tr><th>日期</th><th>访问</th><th>访客</th><th>平均停留</th></tr></thead>
  <tbody>$rows</tbody></table>

  <h2>来源 / 设备 / 语言</h2>
  <div class="meta">
    $refs<br>
    手机 <b>$mob</b> · 桌面 <b>$des</b><br>
    中文 <b>$zh</b> · English <b>$en</b>
  </div>

  <h2>结局</h2>
  <div class="meta">
    评级分布：$grades<br>
    平均寿命 <b>$avgage</b> · 今日之命参与 <b>$dailyn</b> 人<br>
    热门国家：$countries
  </div>

  <div class="foot">仅站长可见 · 数据存于服务器本地，不存原始 IP（仅存加盐哈希）· 停留时长取每个访客上报的最大值。</div>
</div></body></html>""")


def render_html(s):
    rows = []
    for d in s['days']:
        rows.append(
            '<tr><td>%s</td><td class="n">%d</td><td class="n">%d</td>'
            '<td class="n">%s</td></tr>'
            % (d['date'][5:], d['pv'], d['uv'], fmt_dur(d['avg']))
        )
    if not rows:
        rows.append('<tr><td colspan="4" class="empty">还没有数据</td></tr>')

    grades = ' · '.join('%s %d' % (k, v) for k, v in
                        sorted(s['grades'].items(), key=lambda x: -x[1])) or '—'
    refs = ' · '.join('%s <b>%d</b>' % (k, v) for k, v in s['refs']) or '暂无外部来源（直接打开）'
    countries = ' · '.join('%s <b>%d</b>' % (k, v) for k, v in s['countries']) or '—'
    avgage = (('%d 岁' % round(s['avg_age'])) if s['avg_age'] else '—')

    mx = max([v for _, v in s['hist']] or [0]) or 1
    hb = []
    for label, v in s['hist']:
        w = (v * 100.0 / mx) if v else 0
        hb.append('<div class="hb"><span class="lb">%s</span>'
                  '<span class="tr"><i style="width:%.1f%%"></i></span>'
                  '<span class="nm">%d</span></div>' % (label, w, v))

    return PAGE.safe_substitute(
        updated=datetime.datetime.now().strftime('%m-%d %H:%M'),
        uv=s['uv'], pv=s['pv'], tuv=s['today_uv'], tpv=s['today_pv'],
        davg=fmt_dur(s['dwell_avg']), dmed=fmt_dur(s['dwell_med']),
        dmax=fmt_dur(s['dwell_max']),
        done=pct(s['finished'], s['started']),
        st=s['started'], bg=s['began'], fin=s['finished'],
        r1=pct(s['started'], s['uv']), r2=pct(s['began'], s['started']),
        r3=pct(s['finished'], s['began']),
        w1='%.1f' % (s['started'] * 100.0 / (s['uv'] or 1)),
        w2='%.1f' % (s['began'] * 100.0 / (s['uv'] or 1)),
        w3='%.1f' % (s['finished'] * 100.0 / (s['uv'] or 1)),
        rows=''.join(rows), hist=''.join(hb),
        mob=s['device']['mobile'], des=s['device']['desktop'],
        zh=s['lang']['zh'], en=s['lang']['en'],
        grades=grades, refs=refs, countries=countries, avgage=avgage,
        dailyn=daily_board(0)['n'],
    )


def render_csv(s):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(['日期', '访问量', '访客数', '平均停留秒'])
    for d in reversed(s['days']):
        w.writerow([d['date'], d['pv'], d['uv'],
                    '' if d['avg'] is None else round(d['avg'], 1)])
    return '\ufeff' + buf.getvalue()


class Handler(BaseHTTPRequestHandler):
    server_version = 'life-stats/1.1'
    protocol_version = 'HTTP/1.1'

    def log_message(self, *a):
        pass

    def _send(self, code, body, ctype='text/html; charset=utf-8'):
        b = body.encode('utf-8') if isinstance(body, str) else body
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(b)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Robots-Tag', 'noindex, nofollow')
        self.end_headers()
        try:
            self.wfile.write(b)
        except OSError:
            pass

    def do_OPTIONS(self):
        self._send(204, b'')

    def _do_daily(self):
        try:
            n = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            n = 0
        if n <= 0 or n > MAX_BODY:
            return self._send(204, b'')
        try:
            d = json.loads(self.rfile.read(n).decode('utf-8'))
        except Exception:
            return self._send(204, b'')
        if not isinstance(d, dict):
            return self._send(204, b'')
        try:
            score = float(d.get('score') or 0)
        except (TypeError, ValueError):
            score = 0.0
        try:
            age = int(d.get('age') or 0)
        except (TypeError, ValueError):
            age = 0
        ip = (self.headers.get('X-Real-IP') or self.client_address[0] or '').strip()
        ev = {
            'sid': str(d.get('sid') or '')[:40],
            'score': round(max(-1e6, min(1e6, score)), 1),
            'grade': str(d.get('grade') or '')[:4],
            'cid': str(d.get('cid') or '')[:4],
            'age': max(0, min(130, age)),
            'ts': int(time.time()),
            'ip': hashlib.sha256((SALT + ip).encode()).hexdigest()[:12],
        }
        try:
            append_daily(ev)
        except OSError:
            pass
        self._send(204, b'')

    def do_POST(self):
        p = urlparse(self.path).path
        if p == '/d':
            return self._do_daily()
        if p != '/c':
            return self._send(404, 'not found', 'text/plain; charset=utf-8')
        try:
            n = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            n = 0
        if n <= 0 or n > MAX_BODY:
            return self._send(204, b'')
        try:
            raw = self.rfile.read(n)
            d = json.loads(raw.decode('utf-8'))
        except Exception:
            return self._send(204, b'')
        if not isinstance(d, dict):
            return self._send(204, b'')

        t = str(d.get('t') or '')
        if t not in ALLOWED:
            return self._send(204, b'')

        ip = (self.headers.get('X-Real-IP') or self.client_address[0] or '').strip()
        ev = {
            't': t,
            'sid': str(d.get('sid') or '')[:40],
            'ts': int(time.time()),
            'ip': hashlib.sha256((SALT + ip).encode()).hexdigest()[:12],
            'lang': 'en' if d.get('lang') == 'en' else 'zh',
            'vw': int(d.get('vw') or 0),
            'ref': str(d.get('ref') or '')[:120],
        }
        if t in DWELL_T:
            try:
                ev['dur'] = max(0, min(86400, int(d.get('dur') or 0)))
            except (TypeError, ValueError):
                ev['dur'] = 0
        if t == 'end':
            ev['grade'] = str(d.get('grade') or '')[:4]
            ev['cid'] = str(d.get('cid') or '')[:4]
            try:
                ev['age'] = int(d.get('age') or 0)
            except (TypeError, ValueError):
                ev['age'] = 0
        try:
            append(ev)
        except OSError:
            pass
        self._send(204, b'')

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/d.json':
            q = urlparse(self.path).query
            try:
                sc = float(q.split('score=')[1].split('&')[0]) if 'score=' in q else 0.0
            except (ValueError, IndexError):
                sc = 0.0
            return self._send(200, json.dumps(daily_board(sc), ensure_ascii=False),
                              'application/json; charset=utf-8')
        if path not in ('/stats', '/stats/', '/stats.json', '/stats.csv'):
            return self._send(404, 'not found', 'text/plain; charset=utf-8')
        try:
            s = summarize(read_events())
        except Exception as e:
            return self._send(500, 'summary error: %s' % e, 'text/plain; charset=utf-8')
        if path == '/stats.json':
            return self._send(200, json.dumps(s, ensure_ascii=False, indent=2),
                              'application/json; charset=utf-8')
        if path == '/stats.csv':
            return self._send(200, render_csv(s), 'text/csv; charset=utf-8')
        self._send(200, render_html(s))


def main():
    srv = ThreadingHTTPServer(('127.0.0.1', 8099), Handler)
    srv.daemon_threads = True
    srv.serve_forever()


if __name__ == '__main__':
    main()

# 可选的访问统计服务

一个零依赖的 Python 统计服务，只用标准库。游戏不依赖它也能玩——不部署的话，前端的埋点请求会静默失败，不影响任何功能。

## 它能做什么

| 接口 | 说明 |
|---|---|
| `POST /c` | 接收埋点事件（`open` / `start` / `begin` / `end` / `leave` / `ping`） |
| `POST /d` | 接收「今日之命」的成绩，用于当天排名 |
| `GET /d.json?score=80` | 查今天的排名与百分位 |
| `GET /stats` | 数据面板（HTML） |
| `GET /stats.json` | 汇总数据（JSON） |
| `GET /stats.csv` | 按天明细（CSV） |

数据按月存成 `data/YYYY-MM.jsonl`，每日之命存成 `data/daily-YYYY-MM-DD.jsonl`。

隐私：不存原始 IP，只存 `sha256(盐 + IP)` 的前 12 位；盐在首次启动时随机生成，存在 `.salt`。

## 跑起来

```bash
python3 collect.py          # 默认监听 127.0.0.1:8099
```

数据目录默认是脚本所在目录，可以用环境变量改：

```bash
LIFE_STATS_BASE=/var/lib/life-stats python3 collect.py
```

## 用 systemd 常驻

```ini
[Unit]
Description=life-in-3-minutes stats
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/life-stats
ExecStart=/usr/bin/python3 /opt/life-stats/collect.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

## nginx 反代

**重要**：服务目录一定要放在网站根目录之外。如果放在根目录里，`collect.py` 会被直接下载。

```nginx
# 埋点：公开，不记访问日志
location = /c {
    proxy_pass http://127.0.0.1:8099/c;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    access_log off;
    add_header Cache-Control "no-store";
}

location = /d {
    proxy_pass http://127.0.0.1:8099/d;
    proxy_set_header X-Real-IP $remote_addr;
    access_log off;
}

location = /d.json {
    proxy_pass http://127.0.0.1:8099/d.json;
    proxy_set_header X-Real-IP $remote_addr;
}

# 面板：建议单独一个域名 + 密码
location = /stats {
    auth_basic "Admin";
    auth_basic_user_file /etc/nginx/.htpasswd_stats;
    proxy_pass http://127.0.0.1:8099/stats;
    proxy_set_header X-Real-IP $remote_addr;
}
```

生成密码文件：

```bash
openssl passwd -apr1 'your-password' | sed 's/^/admin:/' | sudo tee /etc/nginx/.htpasswd_stats
sudo chown root:www-data /etc/nginx/.htpasswd_stats
sudo chmod 640 /etc/nginx/.htpasswd_stats
```

权限这一步很容易漏：如果属主是 `root:root`，nginx 的 worker 读不到，会直接返回 500。

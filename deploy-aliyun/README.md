# 阿里云服务器部署

线上地址：https://47.116.43.204/seeed-game/

## 代码位置

服务器源代码共用仓库根目录的 `server.mjs`、`recording-store.mjs`、`player-store.mjs`，无需保留另一份副本。分别处理语音识别代理、录音存储和玩家统计。`scripts/player-stats.mjs` 用于在服务器终端查看统计。

本目录的 `nginx.conf` 和 `seeed-game.service` 是线上反向代理和 systemd 服务配置。Nginx 托管打包后的静态文件，并将 `/seeed-game/api/` 转发到本机 Node 服务。

## 构建和上传

在仓库根目录执行（Node.js 22+）：

```bash
npm ci
node scripts/build-server.mjs
```

生成的 `dist-server/` 包含后端代码与 `public/` 前端资源，不包含密钥和用户数据。将其中内容上传至服务器 `/opt/seeed-game/`，保持服务器上已存在的配置和用户数据。

运行账号为 `www-data`，应当能读取发布文件。安装 Node.js、Nginx 后，将本目录的服务文件放到 `/etc/systemd/system/seeed-game.service`。首次部署时创建仅 root 可读的 `/etc/seeed-game.env`，参考根目录 `.env.example` 填写真实配置，不要提交此文件。

Nginx 配置中的 IP 和证书路径针对现有服务器；新服务器必须先配置对应的 HTTPS 证书，不能直接照搬证书路径。现有服务器使用 Certbot 续签，请保留续签配置。

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now seeed-game
sudo systemctl restart seeed-game
sudo nginx -t
sudo systemctl reload nginx
```

## 数据和统计

- 录音：`/var/lib/seeed-game/recordings/`，文件名记录北京时间，精确到秒并附唯一标识。
- 玩家数据：`/var/lib/seeed-game/analytics/players.json`。
- 玩家编号按浏览器标识分配；清除浏览器数据或换浏览器会获得新编号，不等于真实人数。
- 加载完成分配编号；点击“进入游戏”才累计点击。同一事件的重试不会重复计数。

```bash
sudo node /opt/seeed-game/player-stats.mjs
sudo systemctl status seeed-game
sudo journalctl -u seeed-game -n 50
```

更新程序时保留 `/var/lib/seeed-game/` 和 `/etc/seeed-game.env`。玩家数据、录音、私钥、真实 API Key 不纳入 GitHub 仓库。

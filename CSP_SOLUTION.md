# 🛡️ CSP (Content Security Policy) 问题解决方案

## 问题描述

当在 `localhost:3000` 上开发时，游戏无法加载，浏览器控制台显示：

```
Refused to frame 'https://playhop.com/' because an ancestor violates
the following Content Security Policy directive: "frame-ancestors 'self'
https://yoplay.io https://*.yoplay.io ... playhop.com"
```

## 根本原因

1. `https://yoplay.io/steal-a-brainrot.embed` 内部重定向或加载了 `playhop.com` 的内容
2. `playhop.com` 设置了 CSP 的 `frame-ancestors` 指令
3. 白名单中**不包括 localhost**，因此本地开发被阻止
4. 这是**服务器端安全策略**，无法从客户端绕过

## ✅ 解决方案

---

### **方案 1：使用 Cloudflare Tunnel（推荐）**

最简单、最安全的本地开发方案：

#### 步骤 1：安装 Cloudflare Tunnel
```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Windows
# 下载：https://github.com/cloudflare/cloudflared/releases

# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

#### 步骤 2：创建临时公开 URL
```bash
# 在项目目录打开新终端
cloudflared tunnel --url http://localhost:3000
```

你会看到类似输出：
```
2025-10-15 Your quick Tunnel has been created! Visit it at:
https://random-name-1234.trycloudflare.com
```

#### 步骤 3：访问公开 URL
使用生成的 `.trycloudflare.com` 域名访问你的网站，游戏将正常加载！

**优点**：
- ✅ 完全免费
- ✅ 无需配置
- ✅ 安全（HTTPS）
- ✅ 可以分享给团队测试

---

### **方案 2：使用 ngrok**

另一个流行的反向代理工具：

#### 步骤 1：安装 ngrok
```bash
# 访问 https://ngrok.com/ 注册并下载
# 或使用包管理器
brew install ngrok  # macOS
choco install ngrok # Windows
```

#### 步骤 2：启动隧道
```bash
ngrok http 3000
```

你会得到一个 `https://xxxx.ngrok.io` 地址。

**优点**：
- ✅ 界面友好，有请求监控
- ✅ 免费版足够使用
- ✅ 支持自定义域名（付费）

---

### **方案 3：修改 hosts 文件（部分有效）**

让浏览器认为你在使用真实域名：

#### macOS/Linux
```bash
sudo nano /etc/hosts
# 添加：
127.0.0.1    dev.yoplay.io
```

#### Windows
```
# 管理员权限打开：
C:\Windows\System32\drivers\etc\hosts
# 添加：
127.0.0.1    dev.yoplay.io
```

#### 访问
然后访问 `http://dev.yoplay.io:3000`

**注意**：
- ⚠️ 这可能不完全有效，因为 CSP 检查的是实际域名
- ⚠️ 需要配置 SSL 证书才能使用 HTTPS

---

### **方案 4：直接部署到 Cloudflare Pages（最终解决方案）**

在生产环境中，CSP 问题会自动解决：

#### 步骤 1：推送到 GitHub
```bash
git add .
git commit -m "Update game"
git push
```

#### 步骤 2：连接 Cloudflare Pages
1. 访问 https://pages.cloudflare.com/
2. 登录/注册
3. 点击 "Create a project"
4. 连接 GitHub 仓库：`IshiharaHaruki/gameweb`

#### 步骤 3：配置构建
```
Build command: pnpm pages:build
Build output directory: .vercel/output/static
```

#### 步骤 4：部署
点击 "Save and Deploy"，几分钟后就能访问！

你会得到一个 `https://gameweb.pages.dev` 域名。

**优点**：
- ✅ 完全免费
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 无 CSP 问题
- ✅ 每次推送自动部署

---

### **方案 5：临时禁用浏览器安全策略（仅测试用）**

**⚠️ 警告：仅用于开发测试，不要用于日常浏览！**

#### Chrome/Edge
```bash
# macOS
open -na "Google Chrome" --args --disable-web-security --user-data-dir=/tmp/chrome_dev

# Windows
chrome.exe --disable-web-security --user-data-dir="C:\tmp\chrome_dev"

# Linux
google-chrome --disable-web-security --user-data-dir=/tmp/chrome_dev
```

#### Firefox
1. 在地址栏输入 `about:config`
2. 搜索 `security.fileuri.strict_origin_policy`
3. 设置为 `false`

**优点**：
- ✅ 立即生效
- ✅ 无需额外工具

**缺点**：
- ❌ 极不安全
- ❌ 仅适用于开发测试
- ❌ 需要使用独立浏览器配置

---

## 📊 方案对比

| 方案 | 难度 | 安全性 | 推荐度 | 适用场景 |
|------|------|--------|--------|----------|
| Cloudflare Tunnel | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 本地开发 |
| ngrok | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 本地开发+分享 |
| hosts 文件 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 简单测试 |
| Cloudflare Pages | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 生产部署 |
| 禁用安全策略 | ⭐ | ⭐ | ⭐ | 临时测试 |

---

## 🎯 推荐工作流

### 开发阶段
使用 **Cloudflare Tunnel** 或 **ngrok**：
```bash
# 终端 1
pnpm dev

# 终端 2
cloudflared tunnel --url http://localhost:3000
```

### 生产部署
使用 **Cloudflare Pages**：
```bash
git push  # 自动部署
```

---

## 🔍 验证游戏是否加载成功

1. 打开开发者工具 (F12)
2. 切换到 Console 标签
3. 如果没有 CSP 错误，说明成功！
4. Network 标签中应该能看到 `steal-a-brainrot.embed` 的请求

---

## 💡 为什么会有 CSP 限制？

CSP 是一种安全机制，用于防止：
- **点击劫持攻击** (Clickjacking)
- **跨站脚本攻击** (XSS)
- **数据注入攻击**

`playhop.com` 设置 CSP 是为了确保他们的游戏只能在授权的网站上嵌入，这是合理的安全做法。

---

## 🤔 常见问题

### Q: 为什么 localhost 不在白名单中？
A: 因为任何人的 localhost 都是 127.0.0.1，无法区分来源，不安全。

### Q: 可以联系 yoplay.io 添加我的域名吗？
A: 可以尝试，但通常只对官方合作伙伴开放。

### Q: 使用反向代理会影响性能吗？
A: 开发时几乎没有影响。生产环境建议直接部署到 CDN。

### Q: 为什么不能直接修改 CSP？
A: CSP 是服务器端设置的响应头，客户端无法修改。

---

## 📚 相关资源

- [MDN: CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
- [Cloudflare Tunnel 文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [ngrok 文档](https://ngrok.com/docs)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

---

## ✅ 快速开始（推荐）

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 在新终端创建公开 URL
cloudflared tunnel --url http://localhost:3000

# 3. 访问显示的 .trycloudflare.com 地址

# 完成！游戏应该能正常加载了 🎮
```

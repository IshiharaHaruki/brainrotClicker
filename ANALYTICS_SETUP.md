# 🎮 游戏分析系统部署文档

本文档说明如何部署和使用基于 Cloudflare Workers + KV 的游戏统计分析系统。

---

## 📋 系统概述

### 功能特性
- ✅ **实时数据收集**：追踪游戏 PV、卡片点击、游戏启动、用户停留时长
- ✅ **综合评分算法**：基于多指标加权计算 HOT 游戏
- ✅ **自动化更新**：每天自动更新 HOT 游戏列表
- ✅ **零成本运行**：完全使用 Cloudflare 和 GitHub 免费额度

### 技术架构
```
┌─────────────┐
│  客户端埋点  │  → 追踪用户行为（PV/点击/启动/时长）
└──────┬──────┘
       ↓
┌─────────────────────┐
│ Cloudflare Workers  │  → 接收事件，写入 KV
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│  Cloudflare KV      │  → 存储 90 天统计数据
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│  GitHub Actions     │  → 每天计算评分，更新 frontmatter
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│   HOT 游戏列表      │  → 用户看到最新的 HOT 游戏
└─────────────────────┘
```

---

## 🚀 部署步骤

### Step 1: 创建 Cloudflare KV Namespace

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers & Pages → KV
3. 点击 "Create a namespace"，命名为 `ANALYTICS_KV`
4. 记录 Namespace ID（后续需要）

**或通过命令行创建：**
```bash
# 生产环境
wrangler kv:namespace create "ANALYTICS_KV"

# 预览环境
wrangler kv:namespace create "ANALYTICS_KV" --preview
```

### Step 2: 配置 wrangler.toml

编辑 `wrangler.toml`，将第 13-14 行的 ID 替换为实际值：

```toml
[[kv_namespaces]]
binding = "ANALYTICS_KV"
id = "你的生产环境 KV ID"          # 替换这里
preview_id = "你的预览环境 KV ID"  # 替换这里
```

### Step 3: 部署 Cloudflare Workers

```bash
# 安装 Wrangler CLI（如果还没安装）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署 Workers
wrangler deploy workers/analytics.ts
```

部署成功后，Workers 将在以下路径可用：
- `https://your-domain.com/api/track` - 追踪事件
- `https://your-domain.com/api/stats/:gameSlug` - 查询统计（可选）

### Step 4: 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. **CLOUDFLARE_ACCOUNT_ID**
   - 在 Cloudflare Dashboard 右上角查看
   - 格式：32 位十六进制字符串

2. **CLOUDFLARE_API_TOKEN**
   - 创建 API Token：[https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
   - 权限：`Account.Workers KV Storage:Read`
   - 复制 Token 并保存到 Secret

3. **CLOUDFLARE_KV_NAMESPACE_ID**
   - 即 Step 1 中创建的 Namespace ID
   - 粘贴到 Secret

### Step 5: 启用 GitHub Actions

GitHub Actions workflow 已创建在 `.github/workflows/update-hot-games.yml`

**自动运行时间**：每天凌晨 2 点 UTC（北京时间 10 点）

**手动触发**：
1. 进入 GitHub 仓库 → Actions
2. 选择 "Update HOT Games" workflow
3. 点击 "Run workflow"

### Step 6: 集成客户端埋点（可选）

要开始收集数据，需要在前端组件中添加埋点代码。

#### 示例 1：游戏详情页追踪 PV 和停留时长

编辑游戏详情页布局组件（例如 `theme/src/layouts/featured.tsx`）：

```tsx
import { useGamePageTracking } from '../utils/analytics';
import { useRouter } from 'nextra/hooks';

export function FeaturedLayout({ frontMatter, children }) {
  const router = useRouter();
  const { locale } = router;

  // 自动追踪 PV 和停留时长
  useGamePageTracking(frontMatter.slug, locale);

  return (
    <div>
      {children}
    </div>
  );
}
```

#### 示例 2：游戏卡片点击追踪

编辑 `theme/src/components/GameCard.tsx`：

```tsx
import { trackCardClick } from '../utils/analytics';
import { useRouter } from 'nextra/hooks';

export function GameCard({ title, slug, ...props }) {
  const router = useRouter();
  const { locale } = router;

  const handleClick = () => {
    trackCardClick(slug, locale);
  };

  return (
    <Link href={slug} onClick={handleClick}>
      <div className="game-card">
        {/* 卡片内容 */}
      </div>
    </Link>
  );
}
```

#### 示例 3：游戏启动追踪

在游戏 iframe 或 PLAY 按钮处：

```tsx
import { trackGameStart } from '../utils/analytics';

<button onClick={() => trackGameStart('/games/clicker/cookie-clicker', 'en')}>
  PLAY
</button>
```

---

## 📊 数据查看

### 方法 1：查看 GitHub Actions 运行结果

1. 进入 GitHub 仓库 → Actions
2. 选择最近的 "Update HOT Games" 运行
3. 查看 Summary，可以看到：
   - 🔥 HOT 游戏 Top 10 列表
   - 📈 评分详情
   - ⏰ 统计周期

### 方法 2：查看本地生成的 JSON

每次运行后会生成 `.cache/hot-games.json`：

```json
{
  "generatedAt": "2025-01-07T10:00:00.000Z",
  "period": "最近 7 天",
  "total": 25,
  "hotGames": [
    "/games/clicker/cookie-clicker",
    "/games/brainrot/steal-a-brainrot",
    ...
  ],
  "details": [
    {
      "slug": "/games/clicker/cookie-clicker",
      "score": 95.67,
      "stats": {
        "pv": 1523,
        "cardClick": 892,
        "gameStart": 645,
        "avgTimeSpent": 180
      }
    },
    ...
  ]
}
```

### 方法 3：通过 Cloudflare API 查询

```bash
# 查询单个游戏的统计数据（最近 7 天）
curl https://your-domain.com/api/stats/cookie-clicker?days=7
```

---

## ⚙️ 配置说明

### 评分权重调整

编辑 `scripts/calculate-hot-games.js` 第 22-27 行：

```javascript
weights: {
  pv: 0.30,          // 页面浏览权重 30%
  cardClick: 0.25,   // 卡片点击权重 25%
  gameStart: 0.30,   // 游戏启动权重 30%
  timeSpent: 0.15    // 停留时长权重 15%
}
```

**注意**：四项权重之和必须等于 1.0

### 统计周期调整

同样在 `scripts/calculate-hot-games.js` 第 30 行：

```javascript
periodDays: 7,  // 统计最近 7 天数据
```

可改为 14、30 等天数。

### HOT 游戏数量调整

第 33 行：

```javascript
hotGamesCount: 10,  // Top 10 游戏
```

---

## 🔧 故障排查

### 问题 1：Workers 返回 404

**原因**：Workers 路由未正确配置

**解决**：
1. 检查 Cloudflare Dashboard → Workers & Pages → Routes
2. 确保路由指向正确的 Worker
3. 或使用 Workers 自己的 URL（例如 `analytics.your-subdomain.workers.dev`）

### 问题 2：GitHub Actions 失败

**原因**：Secrets 未正确配置

**解决**：
1. 检查 GitHub Secrets 是否全部设置
2. 验证 API Token 权限是否正确
3. 查看 Actions 日志获取详细错误信息

### 问题 3：数据未被追踪

**原因**：客户端埋点未集成

**解决**：
1. 确认 `theme/src/utils/analytics.ts` 已创建
2. 在相关组件中导入并调用追踪函数
3. 打开浏览器开发者工具 → Network，查看是否有 POST 请求到 `/api/track`

### 问题 4：HOT 列表为空

**原因**：KV 中没有数据，或统计周期内无活动

**解决**：
1. 等待至少 1 天让数据累积
2. 手动触发一些游戏访问生成测试数据
3. 检查 KV Namespace 中是否有键

---

## 💰 成本估算

**完全免费**（在免费额度内）：

| 服务 | 免费额度 | 预计使用 | 成本 |
|------|---------|---------|------|
| Cloudflare Workers | 10 万请求/天 | < 1 万/天 | $0 |
| Cloudflare KV | 10 万读取/天<br>1000 写入/天 | 读: < 100/天<br>写: < 500/天 | $0 |
| GitHub Actions | 2000 分钟/月 | < 10 分钟/月 | $0 |

**总计：$0/月**

---

## 📚 参考文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/kv/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

## 🤝 需要帮助？

如有问题，请检查：
1. GitHub Actions 运行日志
2. Cloudflare Workers 日志（Logs 面板）
3. 浏览器控制台错误信息

Happy tracking! 🎉

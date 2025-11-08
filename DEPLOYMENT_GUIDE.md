# 部署指南：Cloudflare Pages Functions

本指南将帮助您完成从 Cloudflare Worker 到 Pages Functions 的部署迁移。

## 📋 目录

1. [前置条件](#前置条件)
2. [KV Namespace 配置](#kv-namespace-配置)
3. [本地开发](#本地开发)
4. [部署到生产环境](#部署到生产环境)
5. [验证部署](#验证部署)
6. [故障排查](#故障排查)

---

## 前置条件

确保您已经：

- ✅ 安装了 Node.js (v18+)
- ✅ 安装了 Wrangler CLI (`npm install -g wrangler`)
- ✅ 登录到 Cloudflare 账户 (`wrangler login`)
- ✅ 已有一个 Cloudflare Pages 项目

---

## KV Namespace 配置

### 方式一：通过 Cloudflare Dashboard 配置（推荐）

这是最简单的方式，适合大多数用户。

1. **访问 Cloudflare Dashboard**
   - 前往 https://dash.cloudflare.com
   - 选择您的账户
   - 点击左侧菜单的 **Workers & Pages**

2. **进入 Pages 项目设置**
   - 找到您的 Pages 项目（例如：`game-launch-boost`）
   - 点击项目名称进入详情页
   - 点击 **Settings** 选项卡

3. **配置 KV Namespace 绑定**
   - 在 Settings 页面，找到 **Functions** 部分
   - 点击 **KV namespace bindings**
   - 点击 **Add binding** 按钮

4. **添加绑定**
   - **Variable name**: `ANALYTICS_KV`
   - **KV namespace**: 选择 `f5f38702fcd64c1db759786eae1c55bd`（您的现有 KV）
   - 点击 **Save**

5. **为生产和预览环境分别配置**
   - 切换到 **Production** 标签页，重复上述步骤
   - 切换到 **Preview** 标签页，重复上述步骤

### 方式二：通过 wrangler.toml 配置

`wrangler.toml` 中已经包含了 KV Namespace 配置：

```toml
[[kv_namespaces]]
binding = "ANALYTICS_KV"
id = "f5f38702fcd64c1db759786eae1c55bd"
```

这个配置会在部署时自动应用。

**注意**：
- Dashboard 配置的优先级高于 wrangler.toml
- 推荐使用 Dashboard 配置，更灵活且不需要修改代码

---

## 本地开发

### 1. 构建项目

首先构建您的 Next.js 项目：

```bash
npm run build
# 或
pnpm build
```

这会生成静态文件到 `.vercel/output/static` 目录。

### 2. 启动本地开发服务器

```bash
npx wrangler pages dev .vercel/output/static
```

这将启动一个本地开发服务器，默认在 `http://localhost:8788`。

### 3. 测试 API 端点

**测试追踪端点**：

```bash
curl -X POST http://localhost:8788/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pv",
    "gameSlug": "test-game",
    "timestamp": '$(date +%s000)',
    "locale": "en"
  }'
```

**测试统计端点**：

```bash
curl http://localhost:8788/api/stats/test-game?days=7
```

### 4. 使用 KV 预览数据（可选）

如果需要使用本地 KV 数据进行测试：

```bash
npx wrangler pages dev .vercel/output/static --kv=ANALYTICS_KV
```

---

## 部署到生产环境

### 方式一：通过 Git 自动部署（推荐）

这是最简单的部署方式。

1. **确保 Git 仓库已连接到 Cloudflare Pages**
   - 在 Cloudflare Dashboard 中，您的 Pages 项目应该已经连接到 Git 仓库

2. **提交并推送代码**

```bash
git add functions/
git add wrangler.toml
git commit -m "迁移到 Cloudflare Pages Functions"
git push origin main
```

3. **Cloudflare 自动部署**
   - Cloudflare 会自动检测到新的提交
   - 开始构建和部署流程
   - 部署完成后，您会收到通知

4. **查看部署状态**
   - 前往 Cloudflare Dashboard > Workers & Pages > 您的项目
   - 点击 **Deployments** 查看部署历史和状态

### 方式二：手动部署

如果您想手动部署（例如，用于测试）：

```bash
# 1. 构建项目
npm run build

# 2. 部署到 Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --project-name=game-launch-boost
```

---

## 验证部署

### 1. 检查 Pages Functions 是否正常

访问您的 Pages 项目 URL，例如：

```
https://game-launch-boost.pages.dev
```

### 2. 测试 API 端点

**测试追踪端点**：

```bash
curl -X POST https://game-launch-boost.pages.dev/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pv",
    "gameSlug": "test-game",
    "timestamp": '$(date +%s000)',
    "locale": "en"
  }'
```

预期响应：

```json
{
  "success": true,
  "key": "stats:test-game:pv:2025-11-07"
}
```

**测试统计端点**：

```bash
curl https://game-launch-boost.pages.dev/api/stats/test-game?days=7
```

预期响应：

```json
{
  "gameSlug": "test-game",
  "days": 7,
  "stats": {
    "pv": {
      "count": 1,
      "total": 0
    }
  }
}
```

### 3. 检查 KV 数据

在 Cloudflare Dashboard 中：

1. 前往 **Workers & Pages** > **KV**
2. 找到您的 KV Namespace (`ANALYTICS_KV`)
3. 点击 **View** 查看存储的数据
4. 应该能看到类似 `stats:test-game:pv:2025-11-07` 的键

### 4. 查看日志

在 Cloudflare Dashboard 中：

1. 前往您的 Pages 项目
2. 点击 **Functions** 标签页
3. 点击 **Real-time Logs** 查看实时日志
4. 测试 API 端点，观察日志输出

---

## 故障排查

### 问题 1: 404 Not Found

**症状**：访问 `/api/track` 返回 404

**解决方案**：

1. 检查 `functions/` 目录是否存在于您的项目根目录
2. 检查文件结构：
   ```
   functions/
   ├── api/
   │   ├── _shared.ts
   │   ├── track.ts
   │   └── stats/
   │       └── [slug].ts
   ```
3. 重新部署项目

### 问题 2: KV Namespace Binding 不可用

**症状**：错误日志显示 `ANALYTICS_KV is not defined`

**解决方案**：

1. 检查 Dashboard 中的 KV Namespace 绑定是否正确配置
2. 确保 **Variable name** 精确匹配 `ANALYTICS_KV`（区分大小写）
3. 检查是否为 Production 和 Preview 环境都配置了绑定

### 问题 3: CORS 错误

**症状**：浏览器控制台显示 CORS 错误

**解决方案**：

1. 检查 `functions/api/_shared.ts` 中的 CORS 配置
2. 确认 `Access-Control-Allow-Origin` 设置正确
3. 如果需要限制特定域名，修改 `CORS_HEADERS` 配置

### 问题 4: 类型错误

**症状**：TypeScript 编译错误或运行时类型错误

**解决方案**：

1. 确保安装了 `@cloudflare/workers-types`：
   ```bash
   npm install -D @cloudflare/workers-types
   ```

2. 在 `tsconfig.json` 中添加类型引用：
   ```json
   {
     "compilerOptions": {
       "types": ["@cloudflare/workers-types"]
     }
   }
   ```

### 问题 5: 客户端无法连接

**症状**：前端调用 `/api/track` 失败

**解决方案**：

1. 检查客户端代码中的 API 端点 URL
2. 确认 `theme/src/utils/analytics.ts` 使用的是相对路径 `/api/track`
3. 检查浏览器开发者工具的 Network 标签查看请求详情

---

## 清理旧的 Worker（可选）

一旦验证 Pages Functions 正常工作，您可以删除旧的 Worker：

1. **删除 Worker 文件**：
   ```bash
   rm workers/analytics.ts
   ```

2. **删除 Worker 部署**（如果之前部署过）：
   ```bash
   wrangler delete analytics-worker
   ```

3. **提交更改**：
   ```bash
   git add .
   git commit -m "清理旧的 Worker 代码"
   git push origin main
   ```

---

## 下一步

- ✅ 验证 GitHub Actions 工作流是否正常（`update-hot-games.yml`）
- ✅ 监控 API 使用情况和错误率
- ✅ 配置自定义域名（如果需要）
- ✅ 设置告警通知

---

## 支持

如果遇到问题：

1. 查看 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
2. 查看 [Pages Functions 文档](https://developers.cloudflare.com/pages/functions/)
3. 访问 [Cloudflare Community](https://community.cloudflare.com/)
4. 检查项目的 GitHub Issues

---

**祝您部署成功！** 🚀

# 🎮 Game Launch Boost

一个基于 Next.js + Nextra 的游戏展示网站模板，支持游戏嵌入、多语言、多种布局和静态部署。

## ⚡ 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发运行

#### 方法 1：常规启动（可能遇到 CSP 问题）
```bash
pnpm dev
```
然后访问 http://localhost:3000

#### 方法 2：使用 Cloudflare Tunnel（推荐，解决 CSP 问题）

**macOS/Linux:**
```bash
./dev-with-tunnel.sh
```

**Windows:**
```bash
dev-with-tunnel.bat
```

这会自动启动开发服务器和 Cloudflare Tunnel，给你一个公开的 `.trycloudflare.com` URL，完美解决 CSP 限制！

> 💡 **什么是 CSP 问题？** 某些游戏平台（如 yoplay.io）设置了安全策略，不允许在 localhost 上嵌入游戏。使用 Cloudflare Tunnel 可以获得一个公开域名来绕过这个限制。详见 [CSP_SOLUTION.md](./CSP_SOLUTION.md)

### 构建部署

```bash
# Next.js 标准构建
pnpm build

# Cloudflare Pages 构建
pnpm pages:build

# 本地预览构建结果
pnpm start
```

---

## 📁 项目结构

```
GameTemplate/
├── config/
│   └── site.js                 # 网站配置（语言、主题、功能开关）
├── pages/
│   ├── index.tsx               # 根路由（自动跳转到默认语言）
│   ├── en/                     # 英文内容
│   │   ├── _meta.js            # 英文导航菜单
│   │   ├── index.mdx           # 英文首页（featured 布局）
│   │   ├── games/              # 游戏目录
│   │   │   ├── action/         # 动作游戏分类
│   │   │   │   └── steal-a-brainrot.mdx
│   │   │   ├── action.mdx      # 分类页面（category 布局）
│   │   │   └── ...
│   │   ├── guides/             # 指南文档
│   │   └── landing.mdx         # 落地页示例（landing 布局）
│   └── zh/                     # 中文内容（镜像 en/ 结构）
├── theme/
│   └── src/
│       ├── components/         # 组件（GameFrame, GameCard, Navbar...）
│       ├── layouts/            # 4种布局（featured, category, default, landing）
│       └── utils/              # 工具函数（游戏收集、路由...）
├── public/                     # 静态资源
├── next.config.mjs             # Next.js 配置
├── theme.config.jsx            # 主题配置
└── CSP_SOLUTION.md             # CSP 问题解决方案
```

---

## 🎨 布局系统

### 1️⃣ Featured 布局 - 首页展示
展示多个游戏分类的轮播。

```yaml
---
layout: featured
categories:
  - games/action
  - games/arcade
---
```

### 2️⃣ Category 布局 - 分类页面
网格展示分类下的所有游戏，支持分页。

```yaml
---
layout: category
title: Action Games
description: Exciting action games collection
---
```

### 3️⃣ Default 布局 - 游戏详情页
嵌入游戏播放器，显示游戏信息和介绍。

```yaml
---
title: Steal a Brainrot
game: https://yoplay.io/steal-a-brainrot.embed
cover: /images/game-cover.jpg
tags: [action, arcade]
---
```

### 4️⃣ Landing 布局 - 落地页
营销页面，支持 Hero、Features、FAQ、CTA 等区块。

```yaml
---
layout: landing
hero:
  game: https://game-url.com
features:
  title: Core Features
  items:
    - title: Feature 1
      icon: 🎮
---
```

---

## 🌍 多语言支持

### 配置语言

编辑 `config/site.js`：

```javascript
const SUPPORTED_LOCALES = {
  en: {
    name: "English",
    isDefault: true,  // 设置默认语言
  },
  zh: {
    name: "简体中文",
  },
};

const SITE_CONFIG = {
  features: {
    i18n: true,  // 启用多语言
  },
};
```

### 添加内容

1. 在 `pages/en/` 创建英文内容
2. 在 `pages/zh/` 创建对应的中文内容
3. 文件结构必须完全一致

---

## 🎮 添加新游戏

### 步骤 1：创建游戏文件

```bash
# 英文
pages/en/games/action/my-game.mdx

# 中文
pages/zh/games/action/my-game.mdx
```

### 步骤 2：配置 Frontmatter

```yaml
---
title: 我的游戏
description: 游戏描述
game: https://game-embed-url.com
cover: /images/my-game.jpg
date: 2025-01-15
tags: [action, arcade]
category: Action Games
---

# 游戏介绍

游戏的详细说明...
```

### 步骤 3：自动显示

游戏会自动出现在：
- ✅ 对应分类页面
- ✅ 首页轮播（如果分类在 `categories` 中）
- ✅ 导航菜单（如果配置了）

---

## 📚 核心功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 🎮 游戏嵌入 | ✅ | iframe + 全屏支持 |
| 📂 分类系统 | ✅ | 多级嵌套，自动收集 |
| 🎨 多布局 | ✅ | 4种专业布局 |
| 🌍 多语言 | ✅ | 基于文件夹路由 |
| 🌓 深色模式 | ✅ | 自动保存偏好 |
| 📊 SEO优化 | ✅ | Sitemap + Meta标签 |
| 🚀 静态导出 | ✅ | 纯静态，无服务器 |
| 🔗 社交分享 | ✅ | Twitter, Facebook... |
| 📄 分页 | ✅ | Category 布局支持 |
| 🍞 面包屑 | ✅ | 自动导航 |

---

## 🚀 部署

### Cloudflare Pages（推荐）

1. **推送到 GitHub**
   ```bash
   git push
   ```

2. **连接 Cloudflare Pages**
   - 访问 https://pages.cloudflare.com/
   - 连接 GitHub 仓库
   - 配置构建：
     - Build command: `pnpm pages:build`
     - Build output: `.vercel/output/static`

3. **自动部署**
   每次推送代码自动重新部署！

### 其他平台

- **Vercel**: `pnpm build` → 输出 `out/`
- **Netlify**: `pnpm build` → 输出 `out/`
- **GitHub Pages**: `pnpm build` → 输出 `out/`

---

## ⚙️ 配置

### 网站基础配置

编辑 `config/site.js`：

```javascript
const SITE_CONFIG = {
  url: "https://your-domain.com",
  title: "Your Game Site",
  siteName: "Game Portal",
  primaryColor: "#81c869",  // 主题色
  logo: {
    text: "Your Logo",
    image: "/logo.svg",
    height: 32,
  },
  features: {
    i18n: true,           // 多语言
    themeSwitch: true,    // 主题切换
    defaultTheme: "light" // 默认主题
  },
};
```

### 导航菜单配置

编辑 `pages/en/_meta.js`：

```javascript
export default {
  index: {
    title: "Home",
    type: "page",
    icon: "material-symbols:home",
    href: "/en",
  },
  games: {
    title: "Games",
    type: "menu",  // 下拉菜单
    icon: "material-symbols:games",
    items: {
      action: {
        title: "Action Games",
        href: "/en/games/action",
      },
    },
  },
};
```

---

## 🛡️ 解决 CSP 问题

如果在开发时遇到游戏无法加载的问题，请查看详细解决方案：

👉 **[CSP_SOLUTION.md](./CSP_SOLUTION.md)**

快速解决：
```bash
# 安装 Cloudflare Tunnel
brew install cloudflare/cloudflare/cloudflared

# 使用提供的脚本启动
./dev-with-tunnel.sh
```

---

## 🤝 技术栈

- **Next.js 14** - React 框架
- **Nextra 3** - 内容管理
- **Tailwind CSS** - 样式系统
- **TypeScript** - 类型安全
- **@iconify/react** - 图标库
- **next-themes** - 主题切换
- **react-share** - 社交分享

---

## 📖 示例游戏

项目已包含示例游戏：**Steal a Brainrot**

访问地址：
- 英文：`/en/games/action/steal-a-brainrot`
- 中文：`/zh/games/action/steal-a-brainrot`

---

## 💡 开发提示

### 添加新分类

1. 创建分类文件夹：`pages/en/games/new-category/`
2. 创建分类页面：`pages/en/games/new-category.mdx`（使用 `layout: category`）
3. 在 `_meta.js` 中添加导航项
4. （可选）在首页 `categories` 中添加

### 自定义主题

编辑 `tailwind.config.js` 和 `config/site.js` 中的颜色配置。

### 获取游戏列表

使用工具函数：
```typescript
import { getGamesByCategory } from '@/utils/getGamesByCategory';

const games = getGamesByCategory(pageMap, 'games/action', 'en');
```

---

## 🐛 常见问题

**Q: 为什么游戏无法加载？**
A: 可能是 CSP 限制，请使用 Cloudflare Tunnel 或部署到真实域名。详见 [CSP_SOLUTION.md](./CSP_SOLUTION.md)

**Q: 如何更改默认语言？**
A: 在 `config/site.js` 的 `SUPPORTED_LOCALES` 中设置 `isDefault: true`

**Q: 可以添加更多语言吗？**
A: 可以！在 `config/site.js` 中添加语言配置，然后创建对应的 `pages/{locale}/` 目录

**Q: 如何自定义布局？**
A: 编辑 `theme/src/layouts/` 中的布局文件，或创建新布局

---

## 📄 License

MIT License - 自由使用和修改

---

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Nextra 文档](https://nextra.site/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

---

## ✨ 贡献

欢迎提交 Issue 和 Pull Request！

---

Made with ❤️ using Next.js + Nextra

# Featured Games 英文页面只是示例，不做具体翻译了


单语言版本：https://aab6a5a4.game-launch-boost.pages.dev/

Welcome to Game Launch Boost! Here you can find a curated collection of amazing games across different categories.

## Featured Layout Configuration Guide

The Featured layout displays different game categories through the `categories` configuration. Each category shows up to 20 games in a carousel format.
The corresponding game card carousel component is located at src/components/GameCarousel.tsx

### Categories Configuration

Use the `categories` array in the frontmatter to specify which game categories to display:

```yaml
categories:
    - games/fighting     # 格斗游戏分类
    - games/arcade       # 街机游戏分类
    - games/popular      # 热门游戏（自动收集）
    - games/new         # 最新游戏（自动收集）
```

建议文件结构如下：

```
pages/
├── en/                    # 英文内容
│   ├── games/             # 游戏根目录
│   │   ├── fighting/      # 分类目录
│   │   │   ├── game1.mdx  # 游戏页面
│   │   │   └── game2.mdx  # 子分类
│   │   ├── arcade/        # 分类目录
│   │   │   └── game.mdx   # 游戏页面,不需要配置 layout，使用默认布局
│   │   ├── sports/        # 分类目录
│   │   │   └── game.mdx   # 游戏页面,不需要配置 layout，使用默认布局  
│   │   ├── fighting.mdx   # 分类页面,使用 Category 布局
│   │   └── arcade.mdx     # 分类页面,使用 Category 布局
│   ├── index.mdx          # 首页，建议使用 Featured 布局
│   └── download.mdx       # 下载页面，这里是一个 landing 布局的示例
└── zh/                    # 中文部分省略
    └── ...                # 文件夹省略
```

### Category Path Guidelines

1. **Path Format Requirements**:
- Paths are case-sensitive

2. **Subfolder Processing**:
- The system automatically traverses all subfolders under specified categories
- For example: configuring `games/fighting` includes:
  - `games/fighting/*.mdx`
  - `games/fighting/street/*.mdx`
  - `games/fighting/versus/*.mdx`
  - And deeper subfolders

3. **Game File Requirements**:
- Only collects `.mdx` files
- Does not collect `index.mdx` files
- Files must contain valid frontMatter

### Important Notes

1. Category paths must start with `games/`
2. Games are recursively collected from all subfolders
3. Each category displays up to 20 games, shown in carousels of 4
4. Game file requirements:
   - Must be `.mdx` files
   - Cannot be `index.mdx`
   - Must contain valid frontMatter (title required)
5. Category titles are automatically formatted (e.g., 'fighting-games' displays as 'Fighting Games')
6. Categories with no valid game files will not be displayed
7. Game card displays:
   - Title (required)
   - Description (optional)
   - Cover image (optional)
   - Category (optional)
   - Date (optional)

## Category Directory Structure

Games are organized using a folder structure that supports multiple levels. The basic structure is as follows:

```
pages/
├── en/                    # 英文内容
│   ├── games/            # 游戏根目录
│   │   ├── fighting/     # 格斗游戏分类
│   │   │   ├── game1.mdx # 游戏页面
│   │   │   └── street/   # 子分类
│   │   │       └── game2.mdx
│   │   ├── arcade/      # 街机游戏分类
│   │   │   └── index.mdx
│   │   └── sports/      # 体育游戏分类
│   │       └── index.mdx
│   └── index.mdx        # 当前页面
└── zh/                   # 中文内容
    └── games/           # 对应的中文游戏目录
```

### Supported Category Structure

1. **Basic Categories**:
- `games/fighting` - Fighting Games
- `games/arcade` - Arcade Games  
- `games/sports` - Sports Games
- `games/puzzle` - Puzzle Games
- `games/action` - Action Games

2. **Subcategory Examples**:
- `games/fighting/street` - Street Fighting
- `games/fighting/versus` - Versus Fighting
- `games/arcade/retro` - Retro Arcade
- `games/sports/football` - Football Games


### Category Page Configuration

Each category folder can contain an `index.mdx` file to configure the category page:

```yaml
---
title: Fighting Games
layout: category
description: Explore our fighting games collection
cover: /images/fighting-games.jpg
---
```

### 在 Featured 布局中使用分类

可以在 frontmatter 中指定任意层级的分类路径：

```yaml
categories:
    - games/fighting           # 所有格斗游戏
    - games/fighting/street    # 仅街机格斗游戏
    - games/arcade/retro       # 复古街机游戏
```
### Important Notes

1. Category paths must start with `games/`
2. Supports unlimited levels of subcategories
3. Each category folder should have an `index.mdx`
4. Category names are automatically formatted (e.g., 'fighting-games' displays as 'Fighting Games')
5. Subcategories inherit parent category configurations

## Adding New Games

To add a new game, follow these steps:

1. Choose or create an appropriate category folder
2. Create a new `.mdx` file in the category folder
3. Configure the game's frontmatter
4. Add game description and content

Example:
```yaml
---
title: Street Fighter
layout: default
description: Classic fighting game
game: https://example.com/street-fighter
cover: /images/street-fighter.jpg
date: 2024-03-20
tags: [fighting, arcade, classic]
---
```

# 游戏视频功能配置指南

本文档介绍如何为游戏添加教程视频,以及如何配置Cloudflare R2存储。

## 📋 功能概览

- ✅ 在游戏描述页面展示教程视频
- ✅ 支持HTML5原生视频播放器
- ✅ 支持可选字幕(.vtt格式)
- ✅ 响应式设计,移动端和桌面端完美适配
- ✅ 使用Cloudflare R2存储,成本极低
- ✅ 可选功能:有视频就显示,没有视频不影响现有页面

## 🎯 快速开始

### 1. 为游戏添加视频

在MDX游戏描述文件的frontmatter中添加`video`字段:

```yaml
---
title: Cookie Clicker
game: https://yoplay.io/cookie-clicker.embed
cover: /images/cover/cookie_clicker_gamecover.jpg
thumbnail: /images/thumbnail/cookie_clicker_thumb.jpg
video: https://r2.your-domain.com/videos/cookie-clicker-tutorial.mp4  # 新增
videoTitle: Cookie Clicker - 完整教程攻略  # 可选
videoCaption: https://r2.your-domain.com/captions/cookie-clicker-zh.vtt  # 可选字幕
categories: ['clicker']
---
```

### 2. 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `video` | string | 否 | 视频URL,支持R2或任何公开视频链接 |
| `videoTitle` | string | 否 | 视频标题,用于显示和accessibility |
| `videoCaption` | string | 否 | 字幕文件URL(.vtt格式) |

### 3. 支持的视频格式

- **推荐格式**: MP4 (H.264编码)
- **分辨率**: 720p (1280×720) 或 1080p (1920×1080)
- **码率**: 2-5 Mbps
- **音频**: AAC编码,128-192 kbps

## ☁️ Cloudflare R2 配置

### 第一步:创建R2 Bucket

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账户 → R2
3. 点击 **Create bucket**
4. 配置:
   - **Bucket name**: `game-videos` (或任何你喜欢的名称)
   - **Location**: 选择 Automatic (自动选择最优位置)
5. 点击 **Create bucket**

### 第二步:配置公开访问

#### 方法1:允许公开访问(推荐用于视频)

```bash
# 使用 Wrangler CLI 配置公开访问
npx wrangler r2 bucket cors put game-videos --cors-config cors-config.json
```

创建 `cors-config.json`:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

#### 方法2:绑定自定义域名(最佳实践)

1. 在R2 bucket设置中点击 **Connect Domain**
2. 输入自定义域名,例如 `r2.your-domain.com`
3. 添加DNS记录(Cloudflare会自动提示)
4. 等待DNS生效(通常几分钟)

### 第三步:上传视频文件

#### 使用Web界面上传

1. 进入你的R2 bucket
2. 点击 **Upload**
3. 选择视频文件
4. 建议的目录结构:
   ```
   /videos/
     /clicker/
       cookie-clicker-tutorial.mp4
       banana-clicker-guide.mp4
     /brainrot/
       skibidi-toilet-walkthrough.mp4
   /captions/
     cookie-clicker-zh.vtt
     cookie-clicker-en.vtt
   ```

#### 使用Wrangler CLI上传

```bash
# 上传单个文件
npx wrangler r2 object put game-videos/videos/cookie-clicker-tutorial.mp4 --file ./cookie-clicker-tutorial.mp4

# 批量上传目录
npx wrangler r2 object put game-videos/videos/ --file ./videos/ --recursive
```

#### 使用S3 CLI上传(兼容工具)

```bash
# 配置AWS CLI使用R2端点
aws configure set aws_access_key_id YOUR_R2_ACCESS_KEY
aws configure set aws_secret_access_key YOUR_R2_SECRET_KEY

# 上传文件
aws s3 cp ./cookie-clicker-tutorial.mp4 s3://game-videos/videos/cookie-clicker-tutorial.mp4 \
  --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

### 第四步:获取视频URL

#### 如果绑定了自定义域名:
```
https://r2.your-domain.com/videos/cookie-clicker-tutorial.mp4
```

#### 如果使用公开访问:
```
https://pub-XXXXXXXX.r2.dev/videos/cookie-clicker-tutorial.mp4
```

## 🎬 视频优化建议

### 1. 压缩视频

使用FFmpeg压缩视频以减少带宽消耗:

```bash
# 压缩到720p,码率2Mbps
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -preset slow -crf 23 -b:a 128k output.mp4

# 压缩到1080p,码率4Mbps
ffmpeg -i input.mp4 -vf scale=1920:1080 -c:v libx264 -preset slow -crf 21 -b:a 192k output.mp4
```

### 2. 生成字幕文件(.vtt)

创建字幕文件 `cookie-clicker-zh.vtt`:

```vtt
WEBVTT

00:00:00.000 --> 00:00:05.000
欢迎来到Cookie Clicker教程

00:00:05.000 --> 00:00:10.000
首先,点击大饼干开始游戏

00:00:10.000 --> 00:00:15.000
当你有足够的饼干,可以购买自动生成器
```

### 3. 生成封面图(poster)

```bash
# 从视频第5秒提取封面图
ffmpeg -i input.mp4 -ss 00:00:05 -vframes 1 -q:v 2 poster.jpg
```

## 💰 R2 成本估算

**Cloudflare R2定价**(2025年):
- 存储: $0.015/GB/月
- Class A操作(写入): $4.50/百万次
- Class B操作(读取): $0.36/百万次
- **出站流量: $0** (这是最大优势!)

**示例成本**(50个游戏,每个视频50MB):
- 存储: 2.5GB × $0.015 = **$0.0375/月**
- 读取: 10万次播放/月 = **$0.036/月**
- **总成本约 $0.07/月** (几乎免费)

## 🔧 高级配置

### 1. 添加多个视频(播放列表)

如果一个游戏有多个教程视频,可以使用数组格式:

```yaml
videos:
  - url: https://r2.domain.com/videos/part1.mp4
    title: 新手教程
    caption: https://r2.domain.com/captions/part1.vtt
  - url: https://r2.domain.com/videos/part2.mp4
    title: 高级技巧
    caption: https://r2.domain.com/captions/part2.vtt
```

*注: 需要额外修改VideoPlayer组件以支持此功能*

### 2. 视频加载性能监控

在`functions/api/track.ts`中添加视频播放事件追踪:

```typescript
// 追踪视频播放事件
{
  gameSlug: 'cookie-clicker',
  eventType: 'video_play',
  timestamp: Date.now()
}
```

### 3. 懒加载优化

VideoPlayer组件已使用`preload="metadata"`,仅预加载元数据而不预加载完整视频,减少初始加载时间。

## 📝 多语言支持

为不同语言版本提供不同视频:

```yaml
# pages/en/games/clicker/cookie-clicker.mdx
video: https://r2.domain.com/videos/cookie-clicker-en.mp4
videoCaption: https://r2.domain.com/captions/cookie-clicker-en.vtt

# pages/cn/games/clicker/cookie-clicker.mdx
video: https://r2.domain.com/videos/cookie-clicker-cn.mp4
videoCaption: https://r2.domain.com/captions/cookie-clicker-zh.vtt

# pages/es/games/clicker/cookie-clicker.mdx
video: https://r2.domain.com/videos/cookie-clicker-es.mp4
videoCaption: https://r2.domain.com/captions/cookie-clicker-es.vtt
```

## 🛠️ 故障排查

### 问题1:视频无法播放

**可能原因**:
- CORS配置不正确
- 视频格式不兼容
- R2 bucket未设置公开访问

**解决方案**:
```bash
# 检查CORS配置
npx wrangler r2 bucket cors get game-videos

# 验证视频URL可访问性
curl -I https://r2.your-domain.com/videos/test.mp4
```

### 问题2:视频加载缓慢

**优化建议**:
- 压缩视频文件(参考上方FFmpeg命令)
- 使用CDN加速(R2自动使用Cloudflare CDN)
- 降低视频分辨率和码率

### 问题3:字幕不显示

**检查清单**:
- [ ] 字幕文件格式为.vtt
- [ ] 字幕URL可访问
- [ ] 字幕文件编码为UTF-8
- [ ] CORS允许跨域访问字幕文件

## 🎨 自定义样式

修改`theme/src/components/VideoPlayer.tsx`以自定义视频播放器样式:

```tsx
// 修改容器样式
<div className="video-container my-8 rounded-2xl shadow-2xl">
  {/* 修改视频样式 */}
  <video className="w-full max-w-5xl mx-auto border-4 border-blue-500" />
</div>
```

## 📚 相关资源

- [Cloudflare R2 官方文档](https://developers.cloudflare.com/r2/)
- [HTML5 Video 规范](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [WebVTT 字幕格式](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API)
- [FFmpeg 视频处理](https://ffmpeg.org/documentation.html)

## 🆘 需要帮助?

如有问题,请查看:
1. 本项目的GitHub Issues
2. Cloudflare Community Forum
3. Next.js Discord频道

---

**更新日期**: 2025-11-08
**版本**: 1.0.0

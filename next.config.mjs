import nextra from "nextra";
import path from "path";
import { fileURLToPath } from "url";
import { SITE_CONFIG } from "./config/site.js"; // 应该为 site.js 可能因为重命名引入更新导致错误

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextra = nextra({
  theme: "./theme/src/index.tsx",
  themeConfig: "./theme.config.jsx",
});

export default withNextra({
  // 注意：静态导出（output: "export"）不支持 Next.js 原生 i18n
  // 本模板使用文件夹路由实现多语言（/en/, /zh/）
  // i18n 配置仅用于主题系统，不传递给 Next.js
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.resolve.alias["@"] = path.join(__dirname, "src");
    return config;
  },
});

// 多语言配置 至少设置一个，默认语言设置 isDefault: true, 如果需要启用多语言，需要设置 SITE_CONFIG 处 features.i18n = true
// 重命名后检查 next.config.mjs 、theme.config.jsx 、next-sitemap.config.js pages/_document.tsx 中配置文件引入是否正确 注意都应该为 site.js / site

const SUPPORTED_LOCALES = {
  en: {
    name: "English",
    localeName: "English",
    ogLocale: "en_US",
    htmlLang: "en",
    titleSuffix: "- Brainrot Clicker",
    isDefault: true,
  },
  es: {
    name: "Español",
    localeName: "Español",
    ogLocale: "es_ES",
    htmlLang: "es",
    titleSuffix: "- Brainrot Clicker",
    // isDefault: true,
  },
  cn: {
    name: "中文",
    localeName: "中文",
    ogLocale: "zh_CN",
    htmlLang: "zh",
    titleSuffix: "- Brainrot Clicker",
    // isDefault: true,
  },
};

// 获取默认语言配置
const getDefaultLocale = () => {
  const locales = Object.entries(SUPPORTED_LOCALES);
  // 如果只有一个语言，它就是默认值
  if (locales.length === 1) {
    return locales[0][1];
  }
  // 否则找到标记为默认的语言
  return locales.find(([_, config]) => config.isDefault)?.[1] || locales[0][1];
};

// 从 SUPPORTED_LOCALES 生成 Next.js i18n 配置
const i18nConfig = {
  locales: Object.keys(SUPPORTED_LOCALES),
  defaultLocale:
    Object.entries(SUPPORTED_LOCALES).find(
      ([_, config]) => config.isDefault
    )?.[0] || Object.keys(SUPPORTED_LOCALES)[0],
};

// 网站基础配置
const SITE_CONFIG = {
  url: "https://brainrot-clicker.app",
  title: "Brainrot Clicker",
  twitter: "@example",
  siteName: "Brainrot Clicker",
  // Logo 配置
  logo: {
    text: "Brainrot Clicker",
    image: "/logo.svg",
    height: 32,
  },
  // 主题主色调
  primaryColor: "#81c869",
  // 功能开关配置
  features: {
    i18n: true, // 是否启用多语言启用后将会读取 SUPPORTED_LOCALES 的默认语言作为网站语言
    themeSwitch: true, // 是否启用主题切换
    defaultTheme: "light", // 默认颜色模式: light 或 dark
  },
  // 使用生成的 i18n 配置
  i18nConfig,
};

// sitemap URL 优先级配置
const URL_PRIORITIES = [
  {
    pattern: "^/$",
    priority: 1.0,
    changefreq: "daily",
  },
  {
    pattern: "^/games",
    priority: 0.9,
    changefreq: "weekly",
  },
  {
    pattern: "^/guides",
    priority: 0.8,
    changefreq: "weekly",
  },
  {
    pattern: "^/about",
    priority: 0.7,
    changefreq: "monthly",
  },
  {
    pattern: ".*",
    priority: 0.5,
    changefreq: "weekly",
  },
];

module.exports = {
  SITE_CONFIG,
  SUPPORTED_LOCALES,
  URL_PRIORITIES,
  getDefaultLocale,
};

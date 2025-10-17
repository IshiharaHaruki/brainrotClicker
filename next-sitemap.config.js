/** @type {import('next-sitemap').IConfig} */
const {
  SITE_CONFIG,
  SUPPORTED_LOCALES,
  URL_PRIORITIES,
} = require("./config/site");

const SUPPORTED_LANGUAGES = Object.keys(SUPPORTED_LOCALES);
const DEFAULT_LANGUAGE =
  Object.entries(SUPPORTED_LOCALES).find(
    ([_, config]) => config.isDefault
  )?.[0] || "en";

console.log("多语言状态:", {
  enabled: SITE_CONFIG.features.i18n,
  languages: SUPPORTED_LANGUAGES,
});

function findUrlConfig(path) {
  const matchedConfig = URL_PRIORITIES.find((config) =>
    new RegExp(config.pattern).test(path)
  );
  return matchedConfig || URL_PRIORITIES[URL_PRIORITIES.length - 1];
}

// 配置
const config = {
  siteUrl: SITE_CONFIG.url,
  generateRobotsTxt: false, // 由构建后脚本生成
  generateIndexSitemap: false, // 生成单一 sitemap
  changefreq: "weekly",
  exclude: ["*/404", "*/500", "*/404.html", "*/500.html", "*/_next/*", "*/api/*", "/index"],

  transform: async (config, path) => {
    // 跳过根路径和 index
    if (path === "/" || path === "/index") {
      return null;
    }

    const urlConfig = findUrlConfig(path);

    // 检查路径是否已包含语言前缀
    const pathMatch = path.match(/^\/([^/]+)(\/.*)?$/);
    const firstSegment = pathMatch?.[1];
    const isLanguagePath = SUPPORTED_LANGUAGES.includes(firstSegment);

    if (!isLanguagePath) {
      return null; // 只处理语言路径
    }

    const lang = firstSegment;
    const restPath = pathMatch[2] || "";
    const cleanPath = `/${lang}${restPath}`.replace(/\/+/g, "/").replace(/\/$/, "") || `/${lang}`;

    console.log(`生成多语言URL: ${cleanPath}`);

    return {
      loc: `${config.siteUrl}${cleanPath}`,
      changefreq: urlConfig.changefreq,
      priority: urlConfig.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: SITE_CONFIG.features.i18n ? SUPPORTED_LANGUAGES.map((altLang) => ({
        href: `${config.siteUrl}/${altLang}${restPath}`.replace(/\/+/g, "/").replace(/\/$/, "") || `${config.siteUrl}/${altLang}`,
        hreflang: altLang,
        hrefIsAbsolute: true,
      })).concat({
        href: `${config.siteUrl}/${DEFAULT_LANGUAGE}${restPath}`.replace(/\/+/g, "/").replace(/\/$/, "") || `${config.siteUrl}/${DEFAULT_LANGUAGE}`,
        hreflang: "x-default",
        hrefIsAbsolute: true,
      }) : undefined,
    };
  },
};

module.exports = config;

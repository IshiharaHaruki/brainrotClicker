/** @type {import('next-sitemap').IConfig} */
const {
  SITE_CONFIG,
  SUPPORTED_LOCALES,
  URL_PRIORITIES,
} = require("./config/site"); // 应该为 site.js 可能因为重命名引入更新导致错误

// 从配置中获取多语言配置
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

// 为未启用多语言的情况创建配置
const defaultConfig = {
  siteUrl: SITE_CONFIG.url,
  generateRobotsTxt: true,
  changefreq: "weekly",
  exclude: ["*/404", "*/500", "*/404.html", "*/500.html"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/404", "/500"],
      },
    ],
  },
  transform: async (config, path) => {
    const urlConfig = findUrlConfig(path);
    const result = {
      loc: `${config.siteUrl}${path}`,
      changefreq: urlConfig.changefreq,
      priority: urlConfig.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
    console.log(`生成URL: ${result.loc}`);
    return result;
  },
};

// 为启用多语言的情况创建配置
const i18nConfig = {
  ...defaultConfig,
  transform: async (config, path) => {
    path = path.replace(/\/+/g, "/");
    const cleanPath = path.replace(/^\//, "");
    const urlConfig = findUrlConfig(path);

    // 为每个语言生成 URL
    const results = SUPPORTED_LANGUAGES.map((lang) => {
      const url = {
        loc: `${config.siteUrl}/${lang}/${cleanPath}`
          .replace(/\/+/g, "/")
          .replace(/\/$/, ""),
        changefreq: urlConfig.changefreq,
        priority: urlConfig.priority,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        alternateRefs: SUPPORTED_LANGUAGES.map((altLang) => ({
          href: `${config.siteUrl}/${altLang}/${cleanPath}`
            .replace(/\/+/g, "/")
            .replace(/\/$/, ""),
          hreflang: altLang,
          hrefIsAbsolute: true,
        })).concat({
          href: `${config.siteUrl}/${DEFAULT_LANGUAGE}/${cleanPath}`
            .replace(/\/+/g, "/")
            .replace(/\/$/, ""),
          hreflang: "x-default",
          hrefIsAbsolute: true,
        }),
      };
      console.log(`生成多语言URL: ${url.loc}`);
      return url;
    });

    return results;
  },
};

// 根据是否启用多语言选择配置
module.exports = SITE_CONFIG.features.i18n ? i18nConfig : defaultConfig;

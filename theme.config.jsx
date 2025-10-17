import { useRouter } from "nextra/hooks";
import {
  SITE_CONFIG,
  SUPPORTED_LOCALES,
  getDefaultLocale,
  URL_PRIORITIES,
} from "./config/site.js"; // 应该为 site.js 可能因为重命名引入更新导致错误

// 主题配置
export default {
  // 基础配置
  ...SITE_CONFIG,

  // 功能开关配置
  features: SITE_CONFIG.features,

  // Logo 配置
  logo: {
    text: SITE_CONFIG.logo.text,
    image: SITE_CONFIG.logo.image,
    height: SITE_CONFIG.logo.height,
  },

  // 主题主色调
  primaryColor: SITE_CONFIG.primaryColor,

  // 多语言支持
  i18n: SITE_CONFIG.features.i18n
    ? {
        defaultLocale:
          Object.entries(SUPPORTED_LOCALES).find(
            ([_, config]) => config.isDefault
          )?.[0] || Object.keys(SUPPORTED_LOCALES)[0],
        locales: Object.keys(SUPPORTED_LOCALES),
        config: Object.entries(SUPPORTED_LOCALES).map(([locale, config]) => ({
          locale,
          name: config.name,
          ogLocale: config.ogLocale,
          htmlLang: config.htmlLang,
          titleSuffix: config.titleSuffix,
          isDefault: config.isDefault,
        })),
      }
    : undefined,

  // SEO 配置
  head: () => {
    const { asPath, locale } = useRouter();
    const defaultLocale = getDefaultLocale();
    const currentLocale = SITE_CONFIG.features.i18n
      ? SUPPORTED_LOCALES[locale] || defaultLocale
      : defaultLocale;

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={SITE_CONFIG.title} />
        <meta property="og:site_name" content={SITE_CONFIG.siteName} />
        <meta property="og:locale" content={currentLocale.ogLocale} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={`${SITE_CONFIG.url}${asPath}`} />
      </>
    );
  },

  // sitemap 配置
  sitemap: {
    siteUrl: SITE_CONFIG.url,
    generateRobotsTxt: true,
    priority: URL_PRIORITIES,
  },

  // 导航配置
  navigation: {
    prev: true,
    next: true,
  },
  // 页脚配置
  footer: {
    text: `${new Date().getFullYear()} © ${SITE_CONFIG.siteName}`,
  },
};

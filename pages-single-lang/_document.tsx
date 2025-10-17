import Document, { Head, Html, Main, NextScript } from "next/document";
import { SUPPORTED_LOCALES } from "../config/site.js";

interface DocumentProps {
  __NEXT_DATA__: {
    page: string;
    locale?: string;
  };
}

interface LocaleConfig {
  name: string;
  localeName: string;
  ogLocale: string;
  htmlLang: string;
  titleSuffix: string;
  isDefault?: boolean;
}

interface LocaleMap {
  [key: string]: LocaleConfig;
}

class MyDocument extends Document<DocumentProps> {
  render() {
    // 从路径中获取语言代码
    const pathname = this.props.__NEXT_DATA__.page;
    let lang = pathname.split("/", 2)[1];

    // 检查语言代码是否在支持的语言列表中
    const locales = SUPPORTED_LOCALES as LocaleMap;
    const supportedLanguages = Object.keys(locales);
    if (!supportedLanguages.includes(lang)) {
      // 如果不在支持的语言列表中，使用默认语言
      lang = supportedLanguages.find(locale => locales[locale].isDefault) || 'en';
    }

    return (
      <Html lang={lang}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 
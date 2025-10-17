import type { ReactNode, ReactElement } from "react";

export interface LocaleConfig {
  locale: string;
  name: string;
  ogLocale: string;
  htmlLang: string;
  titleSuffix: string;
  isDefault?: boolean;
}

export interface FlexThemeConfig {
  backgroundColor?: {
    dark: string;
    light: string;
  };
  color?: {
    hue: {
      dark: number;
      light: number;
    };
    lightness: {
      dark: number;
      light: number;
    };
    saturation: number;
  };
  darkMode?: boolean;
  direction?: "ltr" | "rtl";
  features?: {
    i18n?: boolean;
    search?: boolean;
    darkMode?: boolean;
    themeSwitch?: boolean;
    defaultTheme?: "light" | "dark" | "system";
  };
  nextThemes?: {
    defaultTheme?: "light" | "dark" | "system";
    storageKey?: string;
  };
  logo?: ReactNode | ReactElement;
  head?: (props: { locale?: string; asPath: string }) => ReactElement;
  i18n?: {
    defaultLocale: string;
    locales: string[];
    config?: {
      locale: string;
      name: string;
      ogLocale: string;
      htmlLang: string;
      titleSuffix: string;
      isDefault?: boolean;
    }[];
  };
  siteName?: string;
  primaryColor?: string;
  url?: string;
  title?: string;
  description?: string;
  twitter?: string;
}

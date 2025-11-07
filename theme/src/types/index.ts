import React from "react";
import type { ReactNode } from "react";
import type { FlexThemeConfig } from './theme';

export interface PageOpts {
  title: string;
  frontMatter: {
    title?: string;
    description?: string;
    game?: string;
    cover?: string;
    thumbnail?: string;
    [key: string]: any;
  };
  pageMap: any[];
}

interface HeadProps {
  locale?: string;
  asPath: string;
}

export interface LocaleConfig {
  locale: string;
  name: string;
  ogLocale: string;
  htmlLang: string;
  titleSuffix: string;
  isDefault?: boolean;
}

export type ThemeConfig = FlexThemeConfig;

export interface MainProps {
  children: ReactNode;
  pageOpts: PageOpts;
  themeConfig?: ThemeConfig;
}

export interface LayoutProps {
  children: ReactNode;
  frontMatter: PageOpts["frontMatter"];
  themeConfig?: ThemeConfig;
  pageMap: any[];
}

export interface FrontMatter {
  title?: string;
  description?: string;
  game?: string;
  cover?: string;
  thumbnail?: string;
  date?: string;
  category?: string;
  tags?: string[];
  author?: string;
  categories?: string[];
  layout?: string;
  slug?: string;
  locale?: string;
  breadcrumb?: boolean;
  icon?: string;
  filter?: 'new' | 'hot';  // 游戏筛选标记：new（新游戏）或 hot（热门游戏）
}

export interface PageData {
  frontMatter: FrontMatter;
  filePath: string;
  name: string;
  route: string;
  locale?: string;
}

import type { ReactElement, ReactNode } from 'react'
import { createContext, useContext, useRef } from 'react'
import type { FlexThemeConfig } from '../types/theme'

// 需要深度合并的对象键
const DEEP_OBJECT_KEYS = ['features', 'i18n', 'nextThemes', 'backgroundColor', 'color']

export const DEFAULT_THEME: FlexThemeConfig = {
  backgroundColor: {
    dark: '17,17,17',
    light: '250,250,250'
  },
  color: {
    hue: {
      dark: 204,
      light: 212
    },
    lightness: {
      dark: 55,
      light: 45
    },
    saturation: 100
  },
  darkMode: true,
  direction: 'ltr',
  features: {
    i18n: false,
    search: true,
    darkMode: true,
    themeSwitch: true,
    defaultTheme: 'system'
  },
  nextThemes: {
    defaultTheme: 'system',
    storageKey: 'theme'
  }
}

const ThemeConfigContext = createContext<FlexThemeConfig>(DEFAULT_THEME)
ThemeConfigContext.displayName = 'FlexThemeConfig'

export const useThemeConfig = () => useContext(ThemeConfigContext)

// 深度合并对象的辅助函数
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key in source) {
    const value = source[key]
    if (value && typeof value === 'object' && DEEP_OBJECT_KEYS.includes(key)) {
      result[key] = deepMerge(target[key] || {} as any, value)
    } else {
      result[key] = value as any
    }
  }
  return result
}

export function ThemeConfigProvider({
  value = {},
  children
}: {
  value: any
  children: ReactNode
}): ReactElement {
  const storeRef = useRef<FlexThemeConfig>(DEFAULT_THEME)

  // 使用深度合并策略初始化配置
  if (!storeRef.current || value !== storeRef.current) {
    storeRef.current = deepMerge(DEFAULT_THEME, value || {})
  }

  return (
    <ThemeConfigContext.Provider value={storeRef.current}>
      {children}
    </ThemeConfigContext.Provider>
  )
} 
import { useRouter } from 'nextra/hooks'
import { useCallback, useState, useEffect } from 'react'
import type { FlexThemeConfig, LocaleConfig } from '../types/theme'
import { useThemeConfig } from '../contexts'

export function LocaleSwitch() {
    const router = useRouter()
    const { asPath } = router
    const [currentLocale, setCurrentLocale] = useState(router.locale)
    const [isOpen, setIsOpen] = useState(false)
    const themeConfig = useThemeConfig()

    // 当路由变化时更新当前语言
    useEffect(() => {
        setCurrentLocale(router.locale)
    }, [router.locale])

    const handleLocaleChange = useCallback((newLocale: string) => {
        // 设置 cookie
        const date = new Date()
        date.setFullYear(date.getFullYear() + 1)
        document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`
        
        // 切换路由
        const path = asPath.replace(/^\/[a-z]{2}/, `/${newLocale}`)
        router.push(path)
        setIsOpen(false)
    }, [router, asPath])

    // 获取当前语言显示文本
    const currentLocaleConfig = themeConfig?.i18n?.config?.find(l => l.locale === currentLocale) || themeConfig?.i18n?.config?.[0]

    // 如果多语言功能未启用，则不显示切换器
    if (!themeConfig?.features?.i18n || !themeConfig?.i18n?.config?.length) return null

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary rounded-md transition-colors"
            >
                <span>{currentLocaleConfig?.name}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-theme-bg-primary dark:bg-dark-secondary rounded-lg shadow-lg ring-1 ring-theme-border py-1">
                    {themeConfig.i18n.config?.map((item) => (
                        <button
                            key={item.locale}
                            onClick={() => handleLocaleChange(item.locale)}
                            className={`w-full text-left px-4 py-2 text-sm ${
                                currentLocale === item.locale
                                    ? 'bg-theme-bg-secondary text-theme-text-primary'
                                    : 'text-theme-text-secondary hover:bg-theme-bg-secondary'
                            } flex items-center justify-between transition-colors`}
                        >
                            <span>{item.name}</span>
                            {currentLocale === item.locale && <span>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
} 
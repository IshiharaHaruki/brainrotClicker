import { useTheme } from 'next-themes'
import NextHead from 'next/head'
import { useRouter } from 'next/router'
import { useMemo, useEffect } from 'react'
import type { ReactElement } from 'react'
import { useThemeConfig } from '../contexts'
import type { FlexThemeConfig } from '../types/theme'

interface HeadProps {
    frontMatter: {
        title?: string
        description?: string
        keywords?: string
        cover?: string
        icon?: string
        [key: string]: any
    }
    pageMap: any[]
}

export function Head({ frontMatter, pageMap }: HeadProps): ReactElement {
    const { resolvedTheme } = useTheme()
    const themeConfig = useThemeConfig() as FlexThemeConfig
    const router = useRouter()
    const { locale = 'en', asPath } = router

    // 检查是否启用多语言
    const i18nEnabled = themeConfig?.features?.i18n ?? false

    // 获取当前语言配置
    const currentLocaleConfig = themeConfig?.i18n?.config?.find(l => l.locale === locale) || themeConfig?.i18n?.config?.[0]

    // 动态设置 HTML lang 属性
    useEffect(() => {
        if (currentLocaleConfig?.htmlLang) {
            document.documentElement.lang = currentLocaleConfig.htmlLang
        } else {
            document.documentElement.lang = 'zh'
        }
    }, [currentLocaleConfig?.htmlLang])

    // 清理路径
    const cleanPath = useMemo(() => {
        let path = asPath.replace(/\.(mdx|md)$/i, "")
        const [pathWithoutQuery] = path.split("?")
        const [cleanPath] = pathWithoutQuery.split("#")
        return cleanPath
    }, [asPath])

    // 获取 meta 数据
    const meta = useMemo(() => {
        if (pageMap?.[0]?.data) {
            return pageMap[0].data
        }
        return {}
    }, [pageMap])
    
    // 生成页面标题
    const pageTitle = useMemo(() => {
        const baseTitle = frontMatter?.title || meta?.title || themeConfig?.title || ''
        const suffix = i18nEnabled && currentLocaleConfig?.titleSuffix ? currentLocaleConfig.titleSuffix : ''
        return `${baseTitle}${suffix}`
    }, [frontMatter?.title, meta?.title, themeConfig?.title, i18nEnabled, currentLocaleConfig])

    const pageDescription = frontMatter?.description || meta?.description || themeConfig.description
    const ogImage = frontMatter?.cover || frontMatter?.icon || '/og-image.jpg'

    // 生成规范的 canonical URL
    const canonicalUrl = useMemo(() => {
        if (!themeConfig?.url) return cleanPath

        if (i18nEnabled && themeConfig.i18n) {
            const defaultLocale = themeConfig.i18n.defaultLocale
            const url = locale === defaultLocale
                ? `${themeConfig.url}${cleanPath}`
                : `${themeConfig.url}/${locale}${cleanPath.replace(new RegExp(`^/${locale}`), "")}`
            return url.replace(/\/$/, "")
        }
        return `${themeConfig.url}${cleanPath}`.replace(/\/$/, "")
    }, [cleanPath, locale, i18nEnabled, themeConfig])

    return (
        <NextHead>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            {frontMatter?.keywords && <meta name="keywords" content={frontMatter.keywords} />}

            {/* HTML Language */}
            <meta httpEquiv="content-language" content={currentLocaleConfig?.htmlLang} />
            <meta property="og:locale" content={currentLocaleConfig?.ogLocale} />

            {/* Robots Tags */}
            <meta
                name="robots"
                content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            />
            <meta
                name="googlebot"
                content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            />

            {/* Theme Color */}
            <meta
                name="theme-color"
                content={resolvedTheme === 'dark' ? '#111' : '#fff'}
            />

            {/* Open Graph */}
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={themeConfig.siteName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={themeConfig.twitter} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={ogImage} />

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

            {/* 多语言 Alternate Links */}
            {i18nEnabled && themeConfig?.i18n?.config?.map((lang) => {
                if (lang.locale !== locale) {
                    const localePath = lang.locale === themeConfig.i18n?.defaultLocale
                        ? cleanPath
                        : `/${lang.locale}${cleanPath.replace(new RegExp(`^/${locale}`), '')}`
                    return (
                        <link
                            key={lang.locale}
                            rel="alternate"
                            hrefLang={lang.locale}
                            href={`${themeConfig.url}${localePath}`}
                        />
                    )
                }
                return null
            })}
            {i18nEnabled && themeConfig.url && (
                <link
                    rel="alternate"
                    hrefLang="x-default"
                    href={`${themeConfig.url}${cleanPath.replace(/\/$/, "")}`}
                />
            )}

            {/* Viewport */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </NextHead>
    )
}
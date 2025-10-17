import { useRouter } from 'nextra/hooks'
import Link from 'next/link'
import { Fragment } from 'react'
import { Icon } from '@iconify/react'

interface BreadcrumbItem {
    name: string
    href: string
}

export function Breadcrumb() {
    const router = useRouter()
    const { asPath } = router

    // 从路径中提取实际的 locale，避免 undefined 问题
    const pathLocale = asPath.split('/')[1]
    const locale = pathLocale === 'en' || pathLocale === 'zh' ? pathLocale : 'en'

    // 生成面包屑路径
    const generateBreadcrumb = (): BreadcrumbItem[] => {
        // 移除查询参数
        const pathWithoutQuery = asPath.split('?')[0]
        const paths = pathWithoutQuery.split('/').filter(Boolean)
        const items: BreadcrumbItem[] = []

        // 添加首页
        items.push({
            name: locale === 'zh' ? '首页' : 'Home',
            href: `/${locale}`
        })

        // 构建路径
        let currentPath = ''
        paths.forEach((path, index) => {
            if (index === 0) return // 跳过语言代码
            currentPath += `/${path}`
            
            // 根据路径生成名称
            let name = path
            switch (path) {
                case 'games':
                    name = locale === 'zh' ? '游戏' : 'Games'
                    break
                case 'about':
                    name = locale === 'zh' ? '关于' : 'About'
                    break
                case 'download':
                    name = locale === 'zh' ? '下载' : 'Download'
                    break
            }

            items.push({
                name,
                href: `/${locale}${currentPath}`
            })
        })

        return items
    }

    const breadcrumbs = generateBreadcrumb()

    return (
        <nav className="flex items-center gap-2 text-sm text-theme-text-secondary mb-6">
            {/* 首页图标 */}
            <Link 
                href={breadcrumbs[0].href}
                className="hover:text-primary-500 transition-colors"
            >
                <Icon icon="material-symbols:home" className="w-4 h-4" />
            </Link>

            {/* 其他导航项 */}
            {breadcrumbs.slice(1).map((item, index) => (
                <Fragment key={item.href}>
                    <Icon 
                        icon="material-symbols:chevron-right" 
                        className="w-4 h-4 opacity-50 text-theme-text-secondary"
                    />
                    <Link
                        href={item.href}
                        className={`
                            transition-colors hover:text-primary-500
                            ${index === breadcrumbs.length - 2 
                                ? 'text-primary-500 font-medium' 
                                : 'text-theme-text-secondary'
                            }
                        `}
                    >
                        {item.name}
                    </Link>
                </Fragment>
            ))}
        </nav>
    )
} 
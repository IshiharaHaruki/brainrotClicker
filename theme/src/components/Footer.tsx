import type { ThemeConfig } from '../types'
import Link from 'next/link'

export function Footer({ themeConfig }: { themeConfig?: ThemeConfig }) {
    const siteName = themeConfig?.siteName || 'Site Name'

    return (
        <footer className="bg-theme-bg-primary/80 dark:bg-dark-secondary/80 backdrop-blur-sm border-t border-theme-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-sm text-theme-text-secondary">
                    {new Date().getFullYear()} © {' '}
                    <Link 
                        href="/" 
                        className="hover:text-primary-500 transition-colors"
                    >
                        {siteName}
                    </Link>
                    . All rights reserved.
                </div>
            </div>
        </footer>
    )
} 
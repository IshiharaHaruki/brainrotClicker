import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import type { Category } from '../utils/getCategories';
import { useRouter } from 'nextra/hooks';

interface CategorySidebarProps {
    categories: Category[];
    currentPath: string;
    onClose?: () => void;
}

export function CategorySidebar({ categories, currentPath, onClose }: CategorySidebarProps) {
    const router = useRouter();
    const { asPath, query } = router;

    // 从 URL 路径中提取当前语言（因为静态导出模式下 router.locale 是 undefined）
    const getLocaleFromPath = (path: string): string => {
        const match = path.match(/^\/([a-z]{2})(\/|$)/);
        return match ? match[1] : 'en';
    };

    const locale = router.locale || getLocaleFromPath(asPath);

    // 从 URL 中提取筛选器（支持查询参数和 hash）
    const getCurrentFilter = (): string => {
        // 优先从查询参数中获取（保持向后兼容）
        if (query.filter) {
            return query.filter as string;
        }
        // 从 hash 中获取
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            const match = hash.match(/#filter-(\w+)/);
            if (match) {
                return match[1];
            }
        }
        return 'all';
    };

    const currentFilter = getCurrentFilter();

    // 检查当前路径是否匹配某个分类
    const isActive = (slug: string) => {
        return currentPath.startsWith(slug);
    };

    // 检查筛选器是否激活
    const isFilterActive = (filter: string) => {
        return currentFilter === filter && currentPath.includes('/games');
    };

    return (
        <nav className="h-full overflow-y-auto">
            <div className="p-4 space-y-2">
                {/* 关闭按钮 - 仅移动端显示 */}
                {onClose && (
                    <div className="flex justify-between items-center mb-4 lg:hidden">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Categories</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-yellow-600 rounded-lg transition-colors"
                        >
                            <Icon icon="mdi:close" className="w-6 h-6 text-gray-800 dark:text-white" />
                        </button>
                    </div>
                )}

                {/* 特殊分类：ALL GAMES */}
                <Link
                    href={`/${locale}/games#filter-all`}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                        isFilterActive('all')
                            ? 'bg-yellow-700 dark:bg-yellow-800 text-white shadow-md'
                            : 'bg-[#FFD700] hover:bg-[#FFC700] dark:bg-[#FFB700] dark:hover:bg-[#FFA700] text-gray-800 dark:text-gray-900'
                    }`}
                >
                    <span className="font-semibold">ALL GAMES</span>
                </Link>

                {/* 特殊分类：NEW GAMES */}
                <Link
                    href={`/${locale}/games#filter-new`}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                        isFilterActive('new')
                            ? 'bg-yellow-700 dark:bg-yellow-800 text-white shadow-md'
                            : 'bg-[#FFD700] hover:bg-[#FFC700] dark:bg-[#FFB700] dark:hover:bg-[#FFA700] text-gray-800 dark:text-gray-900'
                    }`}
                >
                    <span className="font-semibold">NEW GAMES</span>
                </Link>

                {/* 特殊分类：HOT GAMES */}
                <Link
                    href={`/${locale}/games#filter-hot`}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                        isFilterActive('hot')
                            ? 'bg-yellow-700 dark:bg-yellow-800 text-white shadow-md'
                            : 'bg-[#FFD700] hover:bg-[#FFC700] dark:bg-[#FFB700] dark:hover:bg-[#FFA700] text-gray-800 dark:text-gray-900'
                    }`}
                >
                    <span className="font-semibold">HOT GAMES</span>
                </Link>

                {/* 分隔线 */}
                <div className="h-px bg-yellow-700/30 my-4"></div>

                {/* 分类列表 */}
                {categories.map((category) => {
                    const active = isActive(category.slug);
                    const categoryHref = `/${locale}${category.slug}`;

                    return (
                        <Link
                            key={category.slug}
                            href={categoryHref}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                active
                                    ? 'bg-yellow-700 dark:bg-yellow-800 text-white shadow-md'
                                    : 'text-gray-800 dark:text-gray-100 hover:bg-yellow-600 hover:text-white'
                            }`}
                        >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                active ? 'bg-yellow-800 dark:bg-yellow-900' : 'bg-white/20'
                            }`}>
                                <Icon icon={category.icon} className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">{category.title}</span>
                        </Link>
                    );
                })}

                {/* 如果没有分类 */}
                {categories.length === 0 && (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        <Icon icon="mdi:folder-open" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No categories found</p>
                    </div>
                )}
            </div>
        </nav>
    );
}

import React, { useState, useEffect } from 'react';
import type { PageMapItem } from 'nextra';
import { GameCard } from '../components/GameCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { CategorySidebar } from '../components/CategorySidebar';
import { getFilteredGames, type FilterType } from '../utils/getGamesByCategory';
import { getCategories } from '../utils/getCategories';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useRouter } from 'nextra/hooks';
import type { FrontMatter } from '../types';

interface AllGamesLayoutProps {
    children: React.ReactNode;
    frontMatter: FrontMatter;
    pageMap: PageMapItem[];
}

export function AllGamesLayout({ children, frontMatter, pageMap }: AllGamesLayoutProps) {
    const router = useRouter();
    const { locale = 'en' } = router;
    const { query } = router;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const currentPage = Number(query.page) || 1;
    const pageSize = 12;

    // 从 URL 参数中获取筛选类型
    const filter = (query.filter as FilterType) || 'all';

    useEffect(() => {
        setIsClient(true);
    }, []);

    // 根据筛选类型获取游戏
    const allGames = getFilteredGames(pageMap, locale, filter);

    // 获取所有分类（用于 Sidebar）
    const categories = getCategories(pageMap, locale);

    // 计算分页
    const totalGames = allGames.length;
    const totalPages = Math.ceil(totalGames / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const games = allGames.slice(start, end);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // 构建分页链接（保留 filter 参数）
    const buildPageUrl = (page: number) => {
        const { pathname, query } = router;
        return {
            pathname,
            query: { ...query, page }
        };
    };

    // 根据筛选类型生成动态标题和描述
    const getPageInfo = () => {
        switch (filter) {
            case 'new':
                return {
                    title: 'New Games - Latest Releases',
                    description: 'Discover the newest games added in the last 10 days. Fresh content, latest releases, and exciting new gameplay experiences.',
                    badge: { text: 'NEW', icon: '⭐', color: 'bg-green-500' }
                };
            case 'hot':
                return {
                    title: 'Hot Games - Most Popular',
                    description: 'Play the hottest trending games with the most clicks and player engagement. Top-rated and most popular titles.',
                    badge: { text: 'HOT', icon: '🔥', color: 'bg-red-500' }
                };
            case 'all':
            default:
                return {
                    title: frontMatter.title || 'All Games',
                    description: frontMatter.description || 'Browse our complete collection of games',
                    badge: null
                };
        }
    };

    const pageInfo = getPageInfo();

    return (
        <main className="min-h-screen bg-theme-bg-primary dark:bg-[#1a1a1a]">
            {/* 移动端汉堡菜单按钮 */}
            <button
                className="fixed top-20 left-4 z-40 lg:hidden p-3 bg-[#DAA520] dark:bg-[#B8860B] text-white rounded-lg shadow-lg hover:bg-[#C8941F] transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
            >
                <Icon icon="mdi:menu" className="w-6 h-6" />
            </button>

            {/* 移动端 Sidebar 抽屉 */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* 半透明遮罩 */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    {/* 抽屉内容 */}
                    <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#DAA520] dark:bg-[#B8860B] overflow-y-auto shadow-2xl transform transition-transform">
                        <CategorySidebar
                            categories={categories}
                            currentPath={router.asPath}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </aside>
                </div>
            )}

            {/* 顶部广告区 */}
            <div
                className="w-full h-32 md:h-36 bg-theme-bg-primary dark:bg-[#1a1a1a]"
                id="top-ad-zone"
                aria-label="Top advertisement space"
            >
                {/* AdSense 广告位 */}
            </div>

            {/* 三区布局容器 */}
            <div className="flex w-full">
                {/* 左侧广告空白区 - 仅大屏显示 */}
                <div
                    className="hidden xl:block w-[160px] 2xl:w-[200px] flex-shrink-0"
                    id="left-ad-zone"
                    aria-label="Advertisement space"
                >
                    {/* 空白区域，供 AdSense 自动填充 */}
                </div>

                {/* 中间内容区 - Sidebar + Main */}
                <div className="flex-1 max-w-7xl mx-auto flex">
                    {/* Sidebar - 桌面固定显示 */}
                    <aside className="hidden lg:block w-[280px] flex-shrink-0 bg-[#DAA520] dark:bg-[#B8860B] sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto shadow-lg">
                        <CategorySidebar
                            categories={categories}
                            currentPath={router.asPath}
                        />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 px-4 lg:px-6 pb-12">
                        <Breadcrumb />

                        {/* 页面标题和统计 */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-theme-text-primary">
                                    {pageInfo.title}
                                </h1>
                                {pageInfo.badge && (
                                    <span className={`${pageInfo.badge.color} text-white text-sm font-bold px-3 py-1 rounded-full inline-flex items-center gap-1`}>
                                        <span>{pageInfo.badge.icon}</span>
                                        <span>{pageInfo.badge.text}</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-theme-text-secondary">
                                {pageInfo.description}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-theme-text-secondary">
                                <Icon icon="material-symbols:apps" className="w-4 h-4" />
                                <span>{totalGames} games available</span>
                            </div>
                        </div>

                        {isClient && (
                            <>
                                {games.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                        {games.map((game) => (
                                            <GameCard
                                                key={game.slug}
                                                title={game.title || 'Untitled Game'}
                                                description={game.description}
                                                cover={game.cover}
                                                category={game.category}
                                                date={game.date}
                                                tags={game.tags}
                                                author={game.author}
                                                href={game.slug || '#'}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                            <Icon icon="material-symbols:games-outline" className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
                                            No Games Found
                                        </h3>
                                        <p className="text-sm text-theme-text-secondary">
                                            There are no games available yet.
                                        </p>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t border-theme-border pt-6">
                                        <div className="flex items-center gap-2">
                                            <Icon icon="material-symbols:apps" className="w-4 h-4 text-theme-text-secondary" />
                                            <span className="text-sm text-theme-text-secondary">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasPrevPage && (
                                                <Link
                                                    href={buildPageUrl(currentPage - 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md text-theme-text-secondary hover:text-primary-500 transition-colors"
                                                >
                                                    <Icon icon="material-symbols:chevron-left" className="w-5 h-5" />
                                                </Link>
                                            )}

                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                    let page: number;
                                                    if (totalPages <= 7) {
                                                        page = i + 1;
                                                    } else {
                                                        if (currentPage <= 4) {
                                                            page = i + 1;
                                                        } else if (currentPage >= totalPages - 3) {
                                                            page = totalPages - 6 + i;
                                                        } else {
                                                            page = currentPage - 3 + i;
                                                        }
                                                    }

                                                    return (
                                                        <Link
                                                            key={page}
                                                            href={buildPageUrl(page)}
                                                            className={`
                                                                w-8 h-8 flex items-center justify-center rounded-md text-sm
                                                                ${page === currentPage
                                                                    ? 'bg-primary-500 text-white'
                                                                    : 'text-theme-text-secondary hover:text-primary-500 transition-colors'
                                                                }
                                                            `}
                                                        >
                                                            {page}
                                                        </Link>
                                                    );
                                                })}
                                            </div>

                                            {hasNextPage && (
                                                <Link
                                                    href={buildPageUrl(currentPage + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md text-theme-text-secondary hover:text-primary-500 transition-colors"
                                                >
                                                    <Icon icon="material-symbols:chevron-right" className="w-5 h-5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* MDX 内容 */}
                        <div className="mt-8 prose dark:prose-invert max-w-none">
                            {children}
                        </div>
                    </div>
                    {/* Main Content 结束 */}
                </div>
                {/* 中间内容区结束 */}

                {/* 右侧广告空白区 - 仅大屏显示 */}
                <div
                    className="hidden xl:block w-[160px] 2xl:w-[200px] flex-shrink-0"
                    id="right-ad-zone"
                    aria-label="Advertisement space"
                >
                    {/* 空白区域，供 AdSense 自动填充 */}
                </div>
            </div>
            {/* 三区布局容器结束 */}
        </main>
    );
}

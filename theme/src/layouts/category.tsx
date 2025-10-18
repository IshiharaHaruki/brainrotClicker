import React, { useState, useEffect } from 'react';
import type { PageMapItem } from 'nextra';
import { GameCard } from '../components/GameCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { CategorySidebar } from '../components/CategorySidebar';
import { getGamesInCurrentDirectory } from '../utils/getGamesByCategory';
import { getCategories } from '../utils/getCategories';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useRouter } from 'nextra/hooks';
import type { FrontMatter } from '../types';

interface CategoryLayoutProps {
    children: React.ReactNode;
    pageMap: PageMapItem[];
}

export function CategoryLayout({ children, pageMap }: CategoryLayoutProps) {
    const router = useRouter();
    // 从路径中提取实际的 locale
    const pathLocale = router.pathname.split('/')[1];
    const locale = pathLocale || router.locale || 'en';
    const { query } = router;
    const currentPage = Number(query.page) || 1;
    const [isClient, setIsClient] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pageSize = 12;

    useEffect(() => {
        setIsClient(true);
    }, []);

    // // 获取当前目录下的所有游戏
    // console.log('=== CategoryLayout Debug ===');
    // console.log('Router:', {
    //     pathname: router.pathname,
    //     locale: locale,
    //     query
    // });

    const allGames = getGamesInCurrentDirectory(pageMap, router.pathname, locale);

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

    // console.log('Pagination:', {
    //     totalGames,
    //     totalPages,
    //     currentPage,
    //     gamesOnCurrentPage: games.length
    // });
    // console.log('=== End Debug ===');

    
    // 构建分页链接
    const buildPageUrl = (page: number) => {
        const { pathname, query } = router;
        return {
            pathname,
            query: { ...query, page }
        };
    };

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
                                    There are no games in this category yet.
                                </p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-theme-border pt-6">
                                <div className="flex items-center gap-2">
                                    <Icon icon="material-symbols:apps" className="w-4 h-4 text-theme-text-secondary" />
                                    <span className="text-sm text-theme-text-secondary">
                                        {totalGames}
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
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                                        ))}
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

                        <div className="prose mt-8">
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
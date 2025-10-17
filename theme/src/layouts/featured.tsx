import React, { useState } from 'react';
import type { PageMapItem } from 'nextra';
import { Breadcrumb } from '../components/Breadcrumb';
import { GameCarousel } from '../components/GameCarousel';
import { GameFrame } from '../components/GameFrame';
import { useRouter } from 'nextra/hooks';
import { getGamesByCategory } from '../utils/getGamesByCategory';
import { getCategories } from '../utils/getCategories';
import { CategorySidebar } from '../components/CategorySidebar';
import type { FrontMatter } from '../types';
import { Icon } from '@iconify/react';
import { ShareButtons } from '../components/ShareButtons';

interface FeaturedLayoutProps {
    children: React.ReactNode;
    frontMatter: FrontMatter;
    pageMap: PageMapItem[];
}

export function FeaturedLayout({ children, frontMatter, pageMap }: FeaturedLayoutProps) {
    const router = useRouter();
    const { locale = 'en' } = router;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // 获取所有游戏分类
    const allCategories = getCategories(pageMap, locale);

    // 获取特色分类的游戏
    const getFeaturedGames = (category: string) => {
        const games = getGamesByCategory(pageMap, category, locale);
        return games.slice(0, 20); // 只取前20个游戏
    };

    // 从路径获取分类名称
    const getCategoryTitle = (path: string) => {
        const parts = path.split('/');
        const lastPart = parts[parts.length - 1];
        return lastPart
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // 从 frontMatter 中获取分类列表
    const categories = frontMatter.categories || [];

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
                            categories={allCategories}
                            currentPath={router.asPath}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </aside>
                </div>
            )}

            {/* 三区布局容器 */}
            <div className="flex w-full pt-32 md:pt-36">
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
                            categories={allCategories}
                            currentPath={router.asPath}
                        />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 px-4 lg:px-6">
                {frontMatter.game && (
                    <div className="mb-32">
                        <GameFrame
                            src={frontMatter.game}
                            title={frontMatter.title || 'Game'}
                            cover={frontMatter.cover}
                            thumbnail={frontMatter.thumbnail}
                        />
                    </div>
                )}

                {/* 分类游戏列表 */}
                {categories.length > 0 ? (
                    categories.map((category) => {
                        const games = getFeaturedGames(category);
                        if (games.length === 0) return null;

                        return (
                            <GameCarousel
                                key={category}
                                title={getCategoryTitle(category)}
                                games={games}
                            />
                        );
                    })
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <Icon icon="material-symbols:games-outline" className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
                            No Categories Found
                        </h3>
                        <p className="text-sm text-theme-text-secondary">
                            Please add some categories in the frontmatter to display games.
                        </p>
                    </div>
                )}

                {/* 文章内容区域 */}
                <div className="bg-white dark:bg-[#242424] rounded-xl shadow-sm">
                    <div className="p-6">
                        {/* 面包屑导航 */}
                        <Breadcrumb />

                        {/* 标题和封面图区域 */}
                        <div className="flex items-start gap-6 mb-6">
                            {/* 封面图 */}
                            {frontMatter.cover && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={frontMatter.thumbnail}
                                        alt={frontMatter.title}
                                        className="w-32 h-32 rounded-xl object-cover"
                                    />
                                </div>
                            )}
                            
                            {/* 标题和分享按钮 */}
                            <div className="flex-grow">
                                <h3 className="text-2xl font-bold text-theme-text-primary mb-4">
                                    {frontMatter.title}
                                </h3>
                                <div className="flex gap-2">
                                    <ShareButtons />
                                </div>
                            </div>
                        </div>

                        {/* 文章内容 */}
                        <article className="prose dark:prose-invert max-w-none">
                            {children}
                        </article>
                    </div>
                </div>

                        {/* MDX 内容
                        <div className="mt-8 prose dark:prose-invert prose-slate max-w-none">
                            <article className="nextra-body relative pb-8 w-full">
                                {children}
                            </article>
                        </div> */}
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
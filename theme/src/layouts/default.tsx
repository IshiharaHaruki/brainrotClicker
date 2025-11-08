import React from 'react';
import { useRouter } from 'nextra/hooks';
import { GameFrame } from '../components/GameFrame';
import { ShareButtons } from '../components/ShareButtons';
import { Breadcrumb } from '../components/Breadcrumb';
import { useGamePageTracking } from '../utils/analytics';
import type { FrontMatter } from '../types';

interface DefaultLayoutProps {
    children: React.ReactNode;
    frontMatter: FrontMatter;
}

export function DefaultLayout({ children, frontMatter }: DefaultLayoutProps) {
    const router = useRouter();
    const gameUrl = frontMatter.game;

    // 从 URL 路径中提取当前语言
    const getLocaleFromPath = (path: string): string => {
        const match = path.match(/^\/([a-z]{2})(\/|$)/);
        return match ? match[1] : 'en';
    };

    // 从路径中提取 gameSlug（例如：/en/games/cookie-clicker → cookie-clicker）
    const extractGameSlug = (path: string): string | null => {
        const match = path.match(/\/games\/([^\/\?#]+)/);
        return match ? match[1] : null;
    };

    const locale = router.locale || getLocaleFromPath(router.asPath);
    const gameSlug = extractGameSlug(router.asPath);

    // 追踪游戏页面浏览（Hook 内部会检查是否为游戏页面）
    useGamePageTracking(gameSlug || '', locale);

    return (
        <main className="min-h-screen bg-theme-bg-primary dark:bg-[#1a1a1a]">
            <div className="max-w-5xl mx-auto px-4 pt-32 md:pt-36 pb-6">
                {/* 游戏播放器 */}
                {gameUrl && (
                    <>
                        <div>
                            <GameFrame
                                src={gameUrl}
                                title={frontMatter.title || 'Game'}
                                cover={frontMatter.cover}
                                thumbnail={frontMatter.thumbnail}
                                gameSlug={gameSlug || undefined}
                            />
                        </div>
                        {/* 游戏下方广告区 */}
                        <div
                            className="w-full h-32 bg-theme-bg-primary dark:bg-[#1a1a1a] my-8"
                            id="game-bottom-ad-zone"
                            aria-label="Advertisement space below game"
                        >
                            {/* AdSense 广告位 */}
                        </div>
                    </>
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
                                        src={frontMatter.cover}
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
            </div>
        </main>
    );
}
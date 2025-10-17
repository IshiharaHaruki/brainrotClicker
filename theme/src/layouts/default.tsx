import React from 'react';
import { useRouter } from 'nextra/hooks';
import { GameFrame } from '../components/GameFrame';
import { ShareButtons } from '../components/ShareButtons';
import { Breadcrumb } from '../components/Breadcrumb';

interface DefaultLayoutProps {
    children: React.ReactNode;
    frontMatter: {
        title?: string;
        description?: string;
        game?: string;
        cover?: string;
    };
}

export function DefaultLayout({ children, frontMatter }: DefaultLayoutProps) {
    const gameUrl = frontMatter.game;

    return (
        <main className="min-h-screen bg-theme-bg-primary dark:bg-[#1a1a1a]">
            <div className="max-w-5xl mx-auto px-4 pt-32 md:pt-36 pb-6">
                {/* 游戏播放器 */}
                {gameUrl && (
                    <div className="mb-32">
                        <GameFrame
                            src={gameUrl}
                            title={frontMatter.title || 'Game'}
                            cover={frontMatter.cover}
                            thumbnail={frontMatter.thumbnail}
                        />
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
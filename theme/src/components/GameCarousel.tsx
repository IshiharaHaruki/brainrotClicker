import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { GameCard } from './GameCard';
import type { FrontMatter } from '../types';

interface GameCarouselProps {
    title: string;
    games: FrontMatter[];
}

export function GameCarousel({ title, games }: GameCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerRow = 4;
    const rows = 2;
    const itemsPerPage = itemsPerRow * rows;
    const totalPages = Math.ceil(games.length / itemsPerPage);

    // 检查是否有足够的游戏来显示导航按钮
    const showNavigation = games.length > itemsPerPage;
    
    // 检查是否可以前进/后退
    const canGoPrev = currentIndex > 0;
    const canGoNext = (currentIndex + 1) * itemsPerPage < games.length;

    const nextSlide = () => {
        if (canGoNext) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const prevSlide = () => {
        if (canGoPrev) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const visibleGames = games.slice(
        currentIndex * itemsPerPage,
        (currentIndex + 1) * itemsPerPage
    );

    // 计算实际需要的行数
    const actualRows = Math.ceil(visibleGames.length / itemsPerRow);

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-theme-text-primary">{title}</h2>
                {showNavigation && (
                    <div className="flex gap-2">
                        <button
                            onClick={prevSlide}
                            className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 transition-colors ${
                                canGoPrev 
                                    ? 'text-theme-text-secondary hover:text-primary-500' 
                                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                            disabled={!canGoPrev}
                        >
                            <Icon icon="material-symbols:chevron-left" className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 transition-colors ${
                                canGoNext 
                                    ? 'text-theme-text-secondary hover:text-primary-500' 
                                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                            disabled={!canGoNext}
                        >
                            <Icon icon="material-symbols:chevron-right" className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
            <div className="grid gap-6">
                {Array.from({ length: actualRows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {visibleGames
                            .slice(rowIndex * itemsPerRow, (rowIndex + 1) * itemsPerRow)
                            .map((game) => (
                                <GameCard
                                    key={game.slug}
                                    href={game.slug || '#'}
                                    title={game.title || ''}
                                    description={game.description}
                                    cover={game.cover}
                                    thumbnail={game.thumbnail}
                                    category={game.category}
                                    date={game.date}
                                />
                            ))}
                    </div>
                ))}
            </div>
        </div>
    );
} 
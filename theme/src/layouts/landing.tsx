import * as React from 'react'
import type { LayoutProps } from '../types'
import { GameFrame } from '../components/GameFrame'

// 渲染图标的辅助函数
function renderIcon(icon: string | undefined) {
    if (!icon) return null;
    
    // 如果是 emoji (单个字符或以 : 开头结尾)
    if (icon.length === 2 || (icon.startsWith(':') && icon.endsWith(':'))) {
        return (
            <span className="text-3xl transform hover:scale-110 transition-transform">
                {icon.replace(/:/g, '')}
            </span>
        );
    }
    
    // 如果是 SVG 组件名称 (以大写字母开头)
    if (/^[A-Z]/.test(icon)) {
        return null;
    }
    
    // 默认作为图片 URL 处理
    return (
        <img src={icon} alt="" className="w-8 h-8 transform hover:scale-110 transition-transform" />
    );
}

export function LandingLayout({ children, frontMatter }: LayoutProps) {
    return (
        <main className="bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:to-blue-900/30">
            {/* Hero Section */}
            <section className={`relative py-32 overflow-hidden ${frontMatter.hero?.background && !frontMatter.hero?.game ? '' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                {frontMatter.hero?.background && !frontMatter.hero?.game && (
                    <div className="absolute inset-0">
                        <img 
                            src={frontMatter.hero.background} 
                            alt="" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
                    </div>
                )}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center">
                        <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 text-white drop-shadow-lg ${frontMatter.hero?.game ? 'lg:text-6xl' : ''}`}>
                            {frontMatter.title}
                        </h1>
                        {frontMatter.description && (
                            <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow-lg">
                                {frontMatter.description}
                            </p>
                        )}
                        {frontMatter.hero?.game ? (
                            <div className="max-w-5xl mx-auto mb-12 bg-theme-bg-primary dark:bg-dark rounded-lg shadow-xl overflow-hidden">
                                <GameFrame
                                    src={frontMatter.hero.game || ''}
                                    title={frontMatter.title || ''}
                                    cover={frontMatter.cover}
                                    thumbnail={frontMatter.thumbnail}
                                />
                            </div>
                        ) : (
                            <div className="flex gap-6 justify-center">
                                {frontMatter.cta && (
                                    <a href={frontMatter.cta.link} 
                                       className="inline-flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-primary-500 to-indigo-500 text-lg font-semibold text-white hover:from-primary-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-primary-200 dark:hover:shadow-primary-900">
                                        {frontMatter.cta.text}
                                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </a>
                                )}
                                {frontMatter.secondaryCta && (
                                    <a href={frontMatter.secondaryCta.link}
                                       className="inline-flex items-center px-8 py-4 rounded-lg border-2 border-theme-border text-theme-text-primary backdrop-blur-sm text-lg font-semibold hover:bg-theme-bg-primary/60 transform hover:scale-105 transition-all">
                                        {frontMatter.secondaryCta.text}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {frontMatter.stats && (
                <section className="py-16 bg-theme-bg-primary dark:bg-dark">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {frontMatter.stats.items?.map((stat: any, index: number) => (
                                <div key={index} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all"></div>
                                    <div className="relative p-6 bg-theme-bg-primary dark:bg-dark-secondary rounded-lg transform hover:scale-105 transition-all shadow-lg">
                                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500">
                                            {stat.value}
                                        </div>
                                        <div className="text-theme-text-secondary font-medium">
                                            {stat.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            {frontMatter.features && (
                <section className="py-24 bg-gradient-to-b from-theme-bg-secondary to-theme-bg-primary dark:from-dark-secondary dark:to-dark relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500 mb-4">
                                {frontMatter.features.title}
                            </h2>
                            {frontMatter.features.description && (
                                <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto">
                                    {frontMatter.features.description}
                                </p>
                            )}
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {frontMatter.features.items?.map((feature: any, index: number) => (
                                <div key={index} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all"></div>
                                    <div className="relative p-8 bg-theme-bg-primary dark:bg-dark-secondary rounded-lg transform hover:scale-105 transition-all shadow-lg">
                                        {feature.icon && (
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-lg flex items-center justify-center mb-6 transform hover:rotate-6 transition-transform text-white">
                                                {renderIcon(feature.icon)}
                                            </div>
                                        )}
                                        <h3 className="text-xl font-semibold text-theme-text-primary mb-4">
                                            {feature.title}
                                        </h3>
                                        <p className="text-theme-text-secondary">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Showcase Section */}
            {frontMatter.showcase && (
                <section className="py-24 bg-theme-bg-primary dark:bg-dark relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500 mb-4">
                                {frontMatter.showcase.title}
                            </h2>
                            {frontMatter.showcase.description && (
                                <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto">
                                    {frontMatter.showcase.description}
                                </p>
                            )}
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {frontMatter.showcase.items?.map((item: any, index: number) => (
                                <div key={index} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all"></div>
                                    <div className="relative bg-theme-bg-primary dark:bg-dark-secondary rounded-lg overflow-hidden transform hover:scale-105 transition-all shadow-lg">
                                        <img src={item.image} alt={item.title} className="w-full aspect-video object-cover" />
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-theme-text-secondary">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            {frontMatter.faq && (
                <section className="py-24 bg-gradient-to-b from-theme-bg-primary to-theme-bg-secondary dark:from-dark dark:to-dark-secondary relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500 mb-4">
                                {frontMatter.faq.title}
                            </h2>
                            {frontMatter.faq.description && (
                                <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto">
                                    {frontMatter.faq.description}
                                </p>
                            )}
                        </div>
                        <div className="max-w-3xl mx-auto space-y-6">
                            {frontMatter.faq.items?.map((item: any, index: number) => (
                                <div key={index} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all"></div>
                                    <div className="relative p-6 bg-theme-bg-primary dark:bg-dark-secondary rounded-lg shadow-lg">
                                        <h3 className="text-lg font-semibold text-theme-text-primary mb-3">
                                            {item.question}
                                        </h3>
                                        <p className="text-theme-text-secondary">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Content Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <article className="prose dark:prose-invert prose-primary mx-auto">
                        {children}
                    </article>
                </div>
            </section>

            {/* CTA Section */}
            {frontMatter.bottomCta && (
                <section className="py-20 bg-gradient-to-b from-theme-bg-secondary to-theme-bg-primary dark:from-dark-secondary dark:to-dark relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500 mb-4">
                            {frontMatter.bottomCta.title}
                        </h2>
                        <p className="text-xl text-theme-text-secondary mb-10 max-w-2xl mx-auto">
                            {frontMatter.bottomCta.description}
                        </p>
                        <a href={frontMatter.bottomCta.link}
                           className="inline-flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-primary-500 to-indigo-500 text-lg font-semibold text-white hover:from-primary-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-primary-200 dark:hover:shadow-primary-900">
                            {frontMatter.bottomCta.text}
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                    </div>
                </section>
            )}
        </main>
    )
} 
import { useRouter } from 'nextra/hooks';
import type { Folder, MdxFile, PageMapItem } from 'nextra';
import themeConfig from '../../../theme.config';

interface PageConfig {
    title?: string;
    frontMatter?: {
        title?: string;
        description?: string;
        keywords?: string;
        [key: string]: any;
    };
}

function isMdxFile(item: PageMapItem): item is MdxFile {
    return 'frontMatter' in item;
}

function isFolder(item: PageMapItem): item is Folder {
    return 'children' in item;
}

function logPageMapStructure(items: PageMapItem[], depth = 0) {
    const indent = '  '.repeat(depth);
    items.forEach(item => {
        const type = isFolder(item) ? 'Folder' : isMdxFile(item) ? 'MDX' : 'Other';
        const route = 'route' in item ? item.route : 'N/A';
        const name = 'name' in item ? item.name : 'N/A';
        const title = isMdxFile(item) ? item.frontMatter?.title : 'N/A';
        
        console.log(`${indent}[${type}] ${name} (${route})`);
        if (title !== 'N/A') {
            console.log(`${indent}  Title: ${title}`);
        }
        
        if (isFolder(item)) {
            logPageMapStructure(item.children, depth + 1);
        }
    });
}

export function getPageConfig(pageMap: PageMapItem[], pathname: string): PageConfig {
    const config: PageConfig = {
        frontMatter: {}
    };

    console.log('=== PageConfig Debug ===');
    console.log('Current pathname:', pathname);
    
    // 输出完整的页面结构
    console.log('Page Structure:');
    logPageMapStructure(pageMap);
    
    // 输出全局变量信息
    console.log('Global Nextra Data:');
    console.log('pageMap:', (globalThis as any).__nextra_pageMap__);
    console.log('pages:', (globalThis as any).__nextra_pages__);
    console.log('defaultLocale:', (globalThis as any).__nextra_defaultLocale__);
    console.log('basePathname:', (globalThis as any).__nextra_basePath__);

    // 递归查找当前页面
    const findPage = (items: PageMapItem[]) => {
        for (const item of items) {
            const itemInfo = {
                type: isFolder(item) ? 'folder' : 'file',
                route: 'route' in item ? item.route : undefined,
                name: 'name' in item ? item.name : undefined,
                kind: 'kind' in item ? item.kind : undefined,
                frontMatter: isMdxFile(item) ? item.frontMatter : undefined
            };
            
            console.log('Checking item:', itemInfo);

            if ('route' in item && item.route === pathname) {
                console.log('Found matching page:', {
                    ...itemInfo,
                    fullItem: item
                });
                
                if (isMdxFile(item)) {
                    config.frontMatter = item.frontMatter;
                    config.title = item.frontMatter?.title;
                }
                return true;
            }
            if (isFolder(item)) {
                if (findPage(item.children)) {
                    return true;
                }
            }
        }
        return false;
    };

    findPage(pageMap);
    console.log('Final config:', config);
    console.log('=== End PageConfig Debug ===');

    return config;
}

export function usePageConfig(): PageConfig {
    const router = useRouter();
    
    // 获取所有可能的页面映射数据
    const pageMap = (globalThis as any).__nextra_pageMap__ || [];
    const dynamicPageMap = (globalThis as any).pageMap || [];
    const combinedPageMap = [...pageMap, ...dynamicPageMap];
    
    // 根据是否启用国际化来处理路径
    const i18nEnabled = themeConfig.features?.i18n;
    const fullPath = router.asPath.split('?')[0].split('#')[0];
    const pathToUse = i18nEnabled 
        ? fullPath 
        : fullPath.replace(new RegExp(`^/${router.locale}`), '');
    
    console.log('Router info:', {
        pathname: router.pathname,
        asPath: router.asPath,
        fullPath,
        pathToUse,
        locale: router.locale,
        defaultLocale: router.defaultLocale,
        locales: router.locales,
        i18nEnabled
    });
    
    return getPageConfig(combinedPageMap, pathToUse);
}

// 获取页面标题
export function getPageTitle(config: PageConfig, defaultTitle: string): string {
    const mdxTitle = config.frontMatter?.title;
    const pageTitle = config.title;
    
    console.log('Title generation:', {
        mdxTitle,
        pageTitle,
        defaultTitle,
        finalTitle: (mdxTitle || pageTitle || defaultTitle)
    });
    
    const title = mdxTitle || pageTitle || defaultTitle;
    // 根据是否启用国际化来添加标题后缀
    const i18nEnabled = themeConfig.features?.i18n;
    if (!i18nEnabled) {
        return title;
    }
    return title === defaultTitle ? title : `${title} | ${defaultTitle}`;
} 
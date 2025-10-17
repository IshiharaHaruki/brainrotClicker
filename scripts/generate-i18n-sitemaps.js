#!/usr/bin/env node

/**
 * 生成多语言 sitemap 文件的构建后处理脚本
 *
 * 功能：
 * 1. 读取 next-sitemap 生成的 sitemap.xml
 * 2. 按语言分组 URL
 * 3. 为每个语言生成独立的 sitemap 文件（sitemap-en.xml, sitemap-es.xml）
 * 4. 生成主 sitemap index（sitemap.xml）
 * 5. 更新 robots.txt
 */

const fs = require('fs');
const path = require('path');
const { SITE_CONFIG, SUPPORTED_LOCALES, URL_PRIORITIES } = require('../config/site');

const OUT_DIR = path.join(__dirname, '../out');
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITEMAP_PATH = path.join(OUT_DIR, 'sitemap.xml');
const ROBOTS_PATH = path.join(OUT_DIR, 'robots.txt');

const SUPPORTED_LANGUAGES = Object.keys(SUPPORTED_LOCALES);

/**
 * 查找 URL 配置
 */
function findUrlConfig(urlPath) {
  const matchedConfig = URL_PRIORITIES.find((config) =>
    new RegExp(config.pattern).test(urlPath)
  );
  return matchedConfig || URL_PRIORITIES[URL_PRIORITIES.length - 1];
}

console.log('🚀 开始生成多语言 sitemap...');
console.log(`支持的语言: ${SUPPORTED_LANGUAGES.join(', ')}`);

/**
 * 解析 XML sitemap 文件
 */
function parseSitemap(xmlContent) {
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  const locRegex = /<loc>(.*?)<\/loc>/;
  const changefreqRegex = /<changefreq>(.*?)<\/changefreq>/;
  const priorityRegex = /<priority>(.*?)<\/priority>/;
  const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/;
  const hreflangRegex = /<xhtml:link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*\/>/g;

  const urls = [];
  let match;

  while ((match = urlRegex.exec(xmlContent)) !== null) {
    const urlBlock = match[1];
    const loc = urlBlock.match(locRegex)?.[1];
    const changefreq = urlBlock.match(changefreqRegex)?.[1];
    const priority = urlBlock.match(priorityRegex)?.[1];
    const lastmod = urlBlock.match(lastmodRegex)?.[1];

    if (!loc) continue;

    const alternates = [];
    let altMatch;
    while ((altMatch = hreflangRegex.exec(urlBlock)) !== null) {
      alternates.push({
        hreflang: altMatch[1],
        href: altMatch[2],
      });
    }

    urls.push({
      loc,
      changefreq,
      priority,
      lastmod,
      alternates,
    });
  }

  return urls;
}

/**
 * 生成 sitemap URL 条目的 XML
 */
function generateUrlXml(url) {
  let xml = '  <url>\n';
  xml += `    <loc>${url.loc}</loc>\n`;
  if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
  if (url.changefreq) xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
  if (url.priority) xml += `    <priority>${url.priority}</priority>\n`;

  // 添加 hreflang 标签
  if (url.alternates && url.alternates.length > 0) {
    url.alternates.forEach(alt => {
      xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}"/>\n`;
    });
  }

  xml += '  </url>\n';
  return xml;
}

/**
 * 生成完整的 sitemap XML
 */
function generateSitemapXml(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  urls.forEach(url => {
    xml += generateUrlXml(url);
  });

  xml += '</urlset>\n';
  return xml;
}

/**
 * 生成 sitemap index XML
 */
function generateSitemapIndexXml(languages) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  languages.forEach(lang => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${SITE_CONFIG.url}/sitemap-${lang}.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });

  xml += '</sitemapindex>\n';
  return xml;
}

/**
 * 更新 robots.txt
 */
function updateRobotsTxt(languages) {
  let robotsTxt = `# *
User-agent: *
Allow: /
Disallow: /404
Disallow: /500
Disallow: /_next/
Disallow: /api/

# Host
Host: ${SITE_CONFIG.url}

# Sitemaps
Sitemap: ${SITE_CONFIG.url}/sitemap.xml
`;

  languages.forEach(lang => {
    robotsTxt += `Sitemap: ${SITE_CONFIG.url}/sitemap-${lang}.xml\n`;
  });

  return robotsTxt;
}

/**
 * 扫描 out 目录下的 HTML 文件并生成 URL
 */
function scanHtmlFiles() {
  const urls = [];

  function scanDir(dir, basePath = '') {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // 递归扫描子目录
        scanDir(fullPath, path.join(basePath, file));
      } else if (file.endsWith('.html') && file !== '404.html' && file !== '500.html') {
        // 构建 URL 路径
        let urlPath = path.join(basePath, file.replace('.html', ''));

        // 处理 index.html
        if (file === 'index.html') {
          urlPath = basePath || '/';
        }

        // 规范化路径
        urlPath = '/' + urlPath.replace(/\\/g, '/');
        urlPath = urlPath.replace(/\/+/g, '/');

        // 检查是否是语言路径
        const pathMatch = urlPath.match(/^\/([^/]+)(\/.*)?$/);
        const firstSegment = pathMatch?.[1];

        if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
          urls.push(urlPath);
        }
      }
    });
  }

  scanDir(OUT_DIR);
  return urls;
}

/**
 * 根据 URL 路径创建完整的 URL 对象
 */
function createUrlObject(urlPath) {
  const pathMatch = urlPath.match(/^\/([^/]+)(\/.*)?$/);
  const lang = pathMatch?.[1];
  const restPath = pathMatch?.[2] || '';

  const urlConfig = findUrlConfig(urlPath);

  const defaultLang = Object.entries(SUPPORTED_LOCALES).find(([_, config]) => config.isDefault)?.[0] || 'en';

  return {
    loc: `${SITE_CONFIG.url}${urlPath}`,
    changefreq: urlConfig.changefreq,
    priority: urlConfig.priority,
    lastmod: new Date().toISOString(),
    alternates: SUPPORTED_LANGUAGES.map((altLang) => ({
      hreflang: altLang,
      href: `${SITE_CONFIG.url}/${altLang}${restPath}`.replace(/([^:]\/)\/+/g, "$1").replace(/\/$/, "") || `${SITE_CONFIG.url}/${altLang}`,
    })).concat({
      hreflang: "x-default",
      href: `${SITE_CONFIG.url}/${defaultLang}${restPath}`.replace(/([^:]\/)\/+/g, "$1").replace(/\/$/, "") || `${SITE_CONFIG.url}/${defaultLang}`,
    }),
  };
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🔍 扫描 HTML 文件...');
    const urlPaths = scanHtmlFiles();
    console.log(`📄 发现 ${urlPaths.length} 个页面`);

    if (urlPaths.length === 0) {
      console.error('❌ 未找到任何 HTML 文件');
      process.exit(1);
    }

    // 按语言分组
    const urlsByLanguage = {};
    SUPPORTED_LANGUAGES.forEach(lang => {
      urlsByLanguage[lang] = [];
    });

    urlPaths.forEach(urlPath => {
      const pathMatch = urlPath.match(/^\/([^/]+)/);
      const lang = pathMatch?.[1];

      if (SUPPORTED_LANGUAGES.includes(lang)) {
        const urlObj = createUrlObject(urlPath);
        urlsByLanguage[lang].push(urlObj);
        console.log(`  ✓ ${urlPath} → ${lang}`);
      }
    });

    // 为每个语言生成 sitemap 文件
    SUPPORTED_LANGUAGES.forEach(lang => {
      const langUrls = urlsByLanguage[lang];
      const sitemapXml = generateSitemapXml(langUrls);
      const sitemapFile = path.join(OUT_DIR, `sitemap-${lang}.xml`);

      fs.writeFileSync(sitemapFile, sitemapXml, 'utf-8');
      console.log(`✅ 生成 sitemap-${lang}.xml (${langUrls.length} URLs)`);

      // 同时复制到 public 目录
      const publicSitemapFile = path.join(PUBLIC_DIR, `sitemap-${lang}.xml`);
      fs.writeFileSync(publicSitemapFile, sitemapXml, 'utf-8');
    });

    // 生成主 sitemap index
    const sitemapIndexXml = generateSitemapIndexXml(SUPPORTED_LANGUAGES);
    fs.writeFileSync(SITEMAP_PATH, sitemapIndexXml, 'utf-8');
    console.log('✅ 生成主 sitemap.xml (sitemap index)');

    // 同时复制到 public 目录
    const publicSitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    fs.writeFileSync(publicSitemapPath, sitemapIndexXml, 'utf-8');

    // 更新 robots.txt
    const robotsTxt = updateRobotsTxt(SUPPORTED_LANGUAGES);
    fs.writeFileSync(ROBOTS_PATH, robotsTxt, 'utf-8');
    console.log('✅ 更新 robots.txt');

    // 同时复制到 public 目录
    const publicRobotsPath = path.join(PUBLIC_DIR, 'robots.txt');
    fs.writeFileSync(publicRobotsPath, robotsTxt, 'utf-8');

    console.log('🎉 多语言 sitemap 生成完成！');
  } catch (error) {
    console.error('❌ 生成过程出错:', error);
    process.exit(1);
  }
}

main();

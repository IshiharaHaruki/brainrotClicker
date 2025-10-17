import React from 'react';
import { useRouter } from 'nextra/hooks';
import Head from 'next/head';
import {
    FacebookShareButton,
    TwitterShareButton,
    TelegramShareButton,
    WhatsappShareButton,
    WeiboShareButton,
    RedditShareButton,
    LinkedinShareButton,
    PocketShareButton,
    EmailShareButton,
    FacebookIcon,
    TwitterIcon,
    TelegramIcon,
    WhatsappIcon,
    WeiboIcon,
    RedditIcon,
    LinkedinIcon,
    PocketIcon,
    EmailIcon
} from 'react-share';
import { useTheme } from 'next-themes';

export function ShareButtons() {
    const { theme } = useTheme();
    const router = useRouter();
    const [pageInfo, setPageInfo] = React.useState({
        title: '',
        description: '',
        url: ''
    });

    React.useEffect(() => {
        // 获取页面 URL
        const url = window.location.href;
        
        // 获取页面标题和描述
        const metaTags = document.getElementsByTagName('meta');
        let description = '';
        
        // 从 meta 标签中获取描述
        for (let i = 0; i < metaTags.length; i++) {
            if (metaTags[i].getAttribute('name') === 'description') {
                description = metaTags[i].getAttribute('content') || '';
                break;
            }
        }

        setPageInfo({
            title: document.title,
            description: description,
            url: url
        });
    }, [router.asPath]);

    const isDark = theme === 'dark';
    
    // 图标的通用样式
    const iconProps = {
        size: 32,
        round: true,
        bgStyle: { fill: isDark ? '#2a2a2a' : '#f0f0f0' },
        iconFillColor: isDark ? '#ffffff' : '#000000'
    };

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg border border-theme-border bg-theme-bg-secondary">
            <FacebookShareButton 
                url={pageInfo.url} 
                title={pageInfo.title}
                className="hover:opacity-80 transition-opacity"
            >
                <FacebookIcon {...iconProps} />
            </FacebookShareButton>

            <TwitterShareButton 
                url={pageInfo.url} 
                title={pageInfo.title} 
                className="hover:opacity-80 transition-opacity"
            >
                <TwitterIcon {...iconProps} />
            </TwitterShareButton>

            <TelegramShareButton 
                url={pageInfo.url} 
                title={pageInfo.title} 
                className="hover:opacity-80 transition-opacity"
            >
                <TelegramIcon {...iconProps} />
            </TelegramShareButton>

            <WhatsappShareButton 
                url={pageInfo.url} 
                title={pageInfo.title} 
                className="hover:opacity-80 transition-opacity"
            >
                <WhatsappIcon {...iconProps} />
            </WhatsappShareButton>

            <WeiboShareButton
                url={pageInfo.url}
                title={pageInfo.title}
                className="hover:opacity-80 transition-opacity"
            >
                <WeiboIcon {...iconProps} />
            </WeiboShareButton>

            <RedditShareButton
                url={pageInfo.url}
                title={pageInfo.title}
                className="hover:opacity-80 transition-opacity"
            >
                <RedditIcon {...iconProps} />
            </RedditShareButton>

            <LinkedinShareButton
                url={pageInfo.url}
                title={pageInfo.title}
                summary={pageInfo.description}
                className="hover:opacity-80 transition-opacity"
            >
                <LinkedinIcon {...iconProps} />
            </LinkedinShareButton>

            <PocketShareButton
                url={pageInfo.url}
                title={pageInfo.title}
                className="hover:opacity-80 transition-opacity"
            >
                <PocketIcon {...iconProps} />
            </PocketShareButton>

            <EmailShareButton
                url={pageInfo.url}
                subject={pageInfo.title}
                body={pageInfo.description}
                className="hover:opacity-80 transition-opacity"
            >
                <EmailIcon {...iconProps} />
            </EmailShareButton>
        </div>
    );
} 
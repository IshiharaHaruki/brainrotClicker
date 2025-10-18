import type { AppProps } from 'next/app'
import Script from 'next/script';
import '../theme/src/styles/globals.css';

// 配置第三方服务的ID
const GA_MEASUREMENT_ID = 'id'; // Google Analytics ID
const ADSENSE_ID = 'ca-pub-6527494970179313';       // Google AdSense ID 
const CLARITY_ID = 'id';       // Microsoft Clarity ID

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      {/* 加载 Twemoji 表情库 */}
      <Script src="https://cdn.jsdelivr.net/npm/twemoji@14.0.2/dist/twemoji.min.js" />
      {/* Google AdSense 脚本 */}
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
        crossOrigin="anonymous" />

      {/* Google Analytics 脚本 */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>

      {/* Microsoft Clarity 分析脚本 */}
      <Script type="text/javascript">
        {
          `
         (function(c,l,a,r,i,t,y){
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_ID}");
    `
        }
      </Script>
    </>
  )
} 
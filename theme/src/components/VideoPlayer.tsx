import React, { useState, useRef } from 'react';

export interface VideoPlayerProps {
  /** 视频URL,支持R2或任何公开视频链接 */
  src: string;
  /** 可选的字幕文件URL (.vtt格式) */
  caption?: string;
  /** 视频标题,用于accessibility */
  title?: string;
  /** 可选的视频封面图URL */
  poster?: string;
  /** 自定义className */
  className?: string;
}

/**
 * 通用视频播放器组件
 * 支持HTML5 video标签的所有现代浏览器
 * 适用于Next.js静态导出模式
 *
 * 安全特性:
 * - URL验证,仅允许https和相对路径
 * - 错误处理和回退机制
 * - 禁用下载功能
 */
export function VideoPlayer({
  src,
  caption,
  title = '游戏教程视频',
  poster,
  className = '',
}: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 安全检查:验证URL是否为https或相对路径
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    // 允许https和相对路径,拒绝http和其他协议
    return url.startsWith('https://') || url.startsWith('/') || url.startsWith('./');
  };

  // 如果URL不安全,不渲染组件
  if (!isValidUrl(src)) {
    console.warn(`VideoPlayer: Invalid or insecure video URL: ${src}`);
    return null;
  }

  // 处理视频加载错误
  const handleError = () => {
    console.error(`VideoPlayer: Failed to load video from ${src}`);
    setHasError(true);
  };

  // 如果视频加载失败,显示错误提示
  if (hasError) {
    return (
      <div className={`video-container my-6 ${className}`}>
        <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            😕 视频加载失败,请稍后重试
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-container my-6 ${className}`}>
      <div className="relative rounded-lg overflow-hidden shadow-lg bg-black">
        <video
          ref={videoRef}
          width="100%"
          controls
          preload="metadata"
          poster={poster}
          className="w-full max-w-4xl mx-auto"
          aria-label={title}
          controlsList="nodownload"
          onError={handleError}
          playsInline
        >
          <source src={src} type="video/mp4" />
          {caption && isValidUrl(caption) && (
            <track
              src={caption}
              kind="subtitles"
              srcLang="zh"
              label="中文字幕"
            />
          )}
          您的浏览器不支持视频播放。请升级到现代浏览器。
        </video>
      </div>
      {title && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          {title}
        </p>
      )}
    </div>
  );
}

export default VideoPlayer;

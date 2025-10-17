@echo off
REM 🎮 Game Launch Boost - 开发服务器 + Cloudflare Tunnel (Windows)
REM 此脚本会同时启动开发服务器和 Cloudflare Tunnel，解决 CSP 问题

echo 🚀 启动 Game Launch Boost 开发环境...
echo.

REM 检查是否安装了 cloudflared
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未找到 cloudflared
    echo.
    echo 请先安装 Cloudflare Tunnel：
    echo.
    echo 访问：https://github.com/cloudflare/cloudflared/releases
    echo 下载 cloudflared-windows-amd64.exe
    echo 重命名为 cloudflared.exe
    echo 将其添加到 PATH 环境变量
    echo.
    pause
    exit /b 1
)

echo ✅ cloudflared 已安装
echo.

echo 📦 启动 Next.js 开发服务器...
start /B pnpm dev

echo ⏳ 等待开发服务器准备就绪...
timeout /t 5 /nobreak >nul

echo ✅ 开发服务器已启动：http://localhost:3000
echo.

echo 🌐 启动 Cloudflare Tunnel...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cloudflared tunnel --url http://localhost:3000

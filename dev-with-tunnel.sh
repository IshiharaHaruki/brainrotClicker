#!/bin/bash

# 🎮 Brainrot Clicker - 开发服务器 + Cloudflare Tunnel
# 此脚本会同时启动开发服务器和 Cloudflare Tunnel，解决 CSP 问题

echo "🚀 启动 Brainrot Clicker 开发环境..."
echo ""

# 检查是否安装了 cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo "❌ 未找到 cloudflared"
    echo ""
    echo "请先安装 Cloudflare Tunnel："
    echo ""
    echo "macOS:"
    echo "  brew install cloudflare/cloudflare/cloudflared"
    echo ""
    echo "Linux:"
    echo "  wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
    echo "  sudo dpkg -i cloudflared-linux-amd64.deb"
    echo ""
    echo "Windows:"
    echo "  访问 https://github.com/cloudflare/cloudflared/releases"
    echo ""
    exit 1
fi

echo "✅ cloudflared 已安装"
echo ""

# 检查端口 3000 是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3000 已被占用，正在停止..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "📦 启动 Next.js 开发服务器..."
pnpm dev &
DEV_PID=$!

# 等待开发服务器启动
echo "⏳ 等待开发服务器准备就绪..."
sleep 5

# 检查开发服务器是否启动成功
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ 开发服务器启动失败"
    exit 1
fi

echo "✅ 开发服务器已启动：http://localhost:3000"
echo ""

echo "🌐 启动 Cloudflare Tunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cloudflared tunnel --url http://localhost:3000 &
TUNNEL_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ 开发环境已就绪！"
echo ""
echo "📍 使用上方显示的 .trycloudflare.com 地址访问网站"
echo "   （不要使用 localhost:3000，否则会遇到 CSP 错误）"
echo ""
echo "🎮 游戏页面："
echo "   https://your-tunnel-url.trycloudflare.com/en/games/action/steal-a-brainrot"
echo ""
echo "⚠️  按 Ctrl+C 停止所有服务"
echo ""

# 等待用户终止
trap "echo ''; echo '🛑 正在停止服务...'; kill $DEV_PID $TUNNEL_PID 2>/dev/null; exit 0" INT TERM

wait

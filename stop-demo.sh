#!/bin/bash

# 智能客服多版本演示停止脚本

echo "=========================================="
echo "  智能客服多版本演示停止脚本"
echo "=========================================="
echo ""

# 停止服务
echo "正在停止所有服务..."
lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || true
sleep 2

# 验证
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 || \
   lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 || \
   lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "部分服务仍在运行，尝试强制停止..."
    lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo ""
echo "✓ 所有服务已停止"
echo ""
echo "日志文件位置："
echo "  - Web 版: /tmp/web-server.log"
echo "  - API 版: /tmp/api-server.log"
echo "  - Agent 版: /tmp/agent-server.log"

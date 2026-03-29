#!/bin/bash

# 智能客服多版本演示启动脚本

echo "=========================================="
echo "  智能客服多版本演示启动脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查端口占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# 停止现有服务
stop_services() {
    echo -e "${YELLOW}停止现有服务...${NC}"
    lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || true
    sleep 2
}

# 启动 Web 版
start_web() {
    echo -e "${GREEN}启动 Web 版 (端口 3000)...${NC}"
    cd /Users/zzx/CodeBuddy/Claw
    nohup npm start > /tmp/web-server.log 2>&1 &
    WEB_PID=$!
    echo "Web 版 PID: $WEB_PID"
    sleep 3
    
    if check_port 3000; then
        echo -e "${GREEN}✓ Web 版启动成功${NC}"
    else
        echo -e "${RED}✗ Web 版启动失败${NC}"
        cat /tmp/web-server.log
    fi
}

# 启动 API 版
start_api() {
    echo -e "${GREEN}启动 API 版 (端口 3001)...${NC}"
    cd /Users/zzx/CodeBuddy/Claw/versions/api
    nohup npm start > /tmp/api-server.log 2>&1 &
    API_PID=$!
    echo "API 版 PID: $API_PID"
    sleep 3
    
    if check_port 3001; then
        echo -e "${GREEN}✓ API 版启动成功${NC}"
    else
        echo -e "${RED}✗ API 版启动失败${NC}"
        cat /tmp/api-server.log
    fi
}

# 启动 Agent 版
start_agent() {
    echo -e "${GREEN}启动 Agent 版 (端口 3002)...${NC}"
    cd /Users/zzx/CodeBuddy/Claw/versions/agent
    nohup npm start > /tmp/agent-server.log 2>&1 &
    AGENT_PID=$!
    echo "Agent 版 PID: $AGENT_PID"
    sleep 3
    
    if check_port 3002; then
        echo -e "${GREEN}✓ Agent 版启动成功${NC}"
    else
        echo -e "${RED}✗ Agent 版启动失败${NC}"
        cat /tmp/agent-server.log
    fi
}

# 显示访问地址
show_urls() {
    echo ""
    echo "=========================================="
    echo "  🎉 所有服务已启动！"
    echo "=========================================="
    echo ""
    echo -e "${GREEN}📱 演示页面:${NC}"
    echo "   http://localhost:3000/demo.html"
    echo ""
    echo -e "${GREEN}🌐 Web 版:${NC}"
    echo "   客服界面: http://localhost:3000"
    echo "   管理后台: http://localhost:3000/admin"
    echo ""
    echo -e "${GREEN}📡 API 版:${NC}"
    echo "   健康检查: http://localhost:3001/health"
    echo "   API 文档: http://localhost:3001/health"
    echo ""
    echo -e "${GREEN}🤖 Agent 版:${NC}"
    echo "   健康检查: http://localhost:3002/health"
    echo "   Agent 列表: http://localhost:3002/api/agents"
    echo ""
    echo "=========================================="
    echo "  📖 使用说明"
    echo "=========================================="
    echo ""
    echo "1. 打开演示页面体验所有版本"
    echo "2. Web 版默认管理员: admin / admin123"
    echo "3. API 版需要先生成 API Key"
    echo "4. 查看 log 文件: /tmp/*-server.log"
    echo ""
    echo "停止服务:"
    echo "  ./stop-demo.sh"
    echo ""
}

# 主函数
main() {
    stop_services
    start_web
    start_api
    start_agent
    show_urls
}

# 执行
main

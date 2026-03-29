# 智能客服项目 - 完整部署指南

## 🎉 项目已完成多版本扩展

您的智能客服项目现在已经支持多种集成方式，可以满足不同场景的需求。

## 📦 版本总览

```
/Users/zzx/CodeBuddy/Claw/
├── 📁 versions/                    # 多版本目录
│   ├── 📄 README.md                # 总览文档
│   ├── 📁 api/                     # RESTful API 版本
│   │   ├── README.md
│   │   ├── api-server.js
│   │   └── package.json
│   ├── 📁 widget/                  # 网站嵌入版本
│   │   ├── README.md
│   │   └── widget.js
│   ├── 📁 agent/                   # 企业级 Agent 版本
│   │   ├── README.md
│   │   └── agent-server.js
│   ├── 📁 skill/                   # 平台集成版本
│   │   └── README.md
│   └── 📁 app/                     # 移动应用版本（待开发）
├── 📄 server.js                    # 主服务（Web 版）
├── 📄 SPEC.md                      # 功能规格
└── 📁 public/                      # 前端文件
```

## 🚀 快速启动指南

### 1️⃣ Web 版（标准版）

```bash
cd /Users/zzx/CodeBuddy/Claw
npm start
```

访问地址：
- 🌐 客服界面: http://localhost:3000
- 🔐 管理后台: http://localhost:3000/admin

---

### 2️⃣ API 版（第三方集成）

```bash
cd /Users/zzx/CodeBuddy/Claw/versions/api
npm install
npm start
```

服务地址：
- 📡 HTTP API: http://localhost:3001
- 🔌 WebSocket: ws://localhost:3001

使用示例：
```bash
# 生成 API Key
curl -X POST http://localhost:3001/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user"}'

# 发送消息
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"message": "我想退款", "use_ai": true}'
```

---

### 3️⃣ Widget 版（网站嵌入）

将以下代码添加到您的网站：

```html
<script src="https://your-domain.com/widget.js"></script>
<script>
  CustomerServiceWidget.init({
    apiKey: 'your-api-key',
    theme: 'light',
    position: 'right',
    primaryColor: '#4F46E5'
  });
</script>
```

---

### 4️⃣ Agent 版（企业服务）

```bash
cd /Users/zzx/CodeBuddy/Claw/versions/agent
npm install
npm start
```

服务地址：http://localhost:3002

使用示例：
```bash
# 处理请求
curl -X POST http://localhost:3002/api/agent/handle \
  -H "Content-Type: application/json" \
  -d '{"message": "我想退款", "sessionId": "session_123"}'

# 执行工作流
curl -X POST http://localhost:3002/api/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{"workflowName": "customer-service", "context": {"message": "我想退款"}}'
```

---

## 📊 版本选择指南

### 根据使用场景选择：

| 场景 | 推荐版本 | 原因 |
|------|----------|------|
| **个人体验/测试** | Web 版 | 开箱即用，无需配置 |
| **嵌入现有网站** | Widget 版 | 一行代码集成 |
| **第三方应用集成** | API 版 | 标准 RESTful API |
| **企业级服务** | Agent 版 | 多 Agent 协作，高可用 |
| **平台集成** | Skill 版 | 支持多平台调用 |
| **SaaS 产品** | API + Agent | 完整的企业级功能 |

---

## 🔧 部署建议

### 开发环境

```bash
# Web 版
cd /Users/zzx/CodeBuddy/Claw
npm start

# API 版（新终端）
cd /Users/zzx/CodeBuddy/Claw/versions/api
npm install
npm start

# Agent 版（新终端）
cd /Users/zzx/CodeBuddy/Claw/versions/agent
npm install
npm start
```

### 生产环境

#### Docker 部署

```bash
# 构建镜像
docker build -t customer-service-web .
docker build -t customer-service-api ./versions/api
docker build -t customer-service-agent ./versions/agent

# 运行容器
docker run -d -p 3000:3000 --name cs-web customer-service-web
docker run -d -p 3001:3001 --name cs-api customer-service-api
docker run -d -p 3002:3002 --name cs-agent customer-service-agent
```

#### Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
  
  api:
    build: ./versions/api
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - API_SECRET_KEY=your-production-secret
  
  agent:
    build: ./versions/agent
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
      - AI_API_KEY=your-ai-api-key
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

启动：
```bash
docker-compose up -d
```

---

## 📚 详细文档

### 各版本详细文档：

1. **总览文档**: `versions/README.md`
2. **API 版**: `versions/api/README.md`
3. **Widget 版**: `versions/widget/README.md`
4. **Agent 版**: `versions/agent/README.md`
5. **Skill 版**: `versions/skill/README.md`

---

## 🎯 核心功能

### 所有版本共有的功能：

✅ **智能对话**
- 支持 AI 驱动的智能回复
- 多轮对话上下文保持
- 意图识别

✅ **FAQ 知识库**
- 预设常见问题
- 智能匹配答案
- 相关问题推荐

✅ **多 AI 模型支持**
- OpenAI GPT 系列
- Anthropic Claude
- 百度文心一言
- 阿里通义千问

✅ **文件处理**
- 图片上传
- 视频支持
- 截屏功能

✅ **消息历史**
- 对话记录存储
- 加密存储
- 会话管理

### 版本特有功能：

| 功能 | Web | API | Widget | Agent | Skill |
|------|-----|-----|--------|-------|-------|
| 用户界面 | ✅ | ❌ | ✅ | ❌ | ❌ |
| 管理后台 | ✅ | ❌ | ❌ | ✅ | ❌ |
| WebSocket | ✅ | ✅ | ❌ | ✅ | ❌ |
| 多 Agent | ❌ | ❌ | ❌ | ✅ | ❌ |
| 工作流 | ❌ | ❌ | ❌ | ✅ | ❌ |
| 平台集成 | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 🔐 安全配置

### 1. API Key 管理

生成安全的 API Key：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. 环境变量配置

创建 `.env` 文件：
```env
# Web 版
PORT=3000
ENCRYPTION_KEY=your-encryption-key

# API 版
API_SECRET_KEY=your-api-secret
RATE_LIMIT_MAX=100

# Agent 版
AI_API_KEY=your-ai-api-key
AI_PROVIDER=openai
```

### 3. HTTPS 配置

使用 Nginx 反向代理：
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📈 性能优化

### 1. 缓存策略

```javascript
// 启用 Redis 缓存
const redis = require('redis');
const client = redis.createClient();

// 缓存常见问题
async function getFAQ(question) {
  const cached = await client.get(`faq:${question}`);
  if (cached) return JSON.parse(cached);
  
  const answer = await queryFAQ(question);
  await client.set(`faq:${question}`, JSON.stringify(answer), 'EX', 3600);
  return answer;
}
```

### 2. 负载均衡

使用 Nginx：
```nginx
upstream customer_service {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    location /api/ {
        proxy_pass http://customer_service;
    }
}
```

---

## 🤝 获取支持

### 文档资源

1. 查看各版本的 README.md
2. 查看 SPEC.md 了解功能规格
3. 查看代码注释

### 常见问题

**Q: 如何选择合适的版本？**
A: 参考"版本选择指南"章节，根据您的使用场景选择。

**Q: 可以同时运行多个版本吗？**
A: 可以！每个版本使用不同的端口，可以同时运行。

**Q: 如何自定义 AI 模型？**
A: 在管理后台配置 AI API Key 和模型参数。

**Q: 数据如何备份？**
A: 定期备份 SQLite 数据库文件 `customer_service.db`。

---

## 📞 技术支持

如有问题，请：
1. 查看详细文档
2. 检查日志文件
3. 提交 Issue

---

## 🎊 总结

您现在拥有一个功能完整、支持多种集成方式的智能客服系统！

### 可立即使用的功能：

✅ Web 客服界面
✅ RESTful API
✅ 网站嵌入 Widget
✅ 企业级 Agent 服务
✅ 多平台 Skill 集成

### 下一步建议：

1. 🔧 **配置环境变量** - 设置 API Key 和加密密钥
2. 🚀 **部署服务** - 选择合适的部署方式
3. 📊 **监控性能** - 设置监控和告警
4. 🔐 **加强安全** - 配置 HTTPS 和认证
5. 📈 **优化性能** - 启用缓存和负载均衡

**祝您使用愉快！** 🎉

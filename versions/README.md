# 智能客服 - 多版本集成方案

本文档介绍智能客服项目的各个版本及其使用方式。

## 📦 版本概览

| 版本 | 适用场景 | 集成难度 | 功能完整度 |
|------|----------|----------|------------|
| **Web 版** | 独立网站使用 | ⭐ 简单 | ⭐⭐⭐⭐⭐ |
| **API 版** | 第三方应用集成 | ⭐⭐ 中等 | ⭐⭐⭐⭐ |
| **Widget 版** | 嵌入网站 | ⭐ 简单 | ⭐⭐⭐⭐ |
| **Agent 版** | 企业级服务 | ⭐⭐⭐⭐ 复杂 | ⭐⭐⭐⭐⭐ |
| **Skill 版** | 平台集成 | ⭐⭐ 中等 | ⭐⭐⭐⭐ |
| **App 版** | 移动应用 | ⭐⭐⭐ 复杂 | ⭐⭐⭐⭐ |

## 🚀 快速开始

### 选择合适的版本

#### 1. 如果您想快速体验
→ 使用 **Web 版**
```bash
cd /Users/zzx/CodeBuddy/Claw
npm start
```
访问：http://localhost:3000

#### 2. 如果您需要嵌入到现有网站
→ 使用 **Widget 版**
```html
<script src="https://your-domain.com/widget.js"></script>
<script>
  CustomerServiceWidget.init({
    apiKey: 'your-api-key'
  });
</script>
```

#### 3. 如果您需要 API 集成
→ 使用 **API 版**
```bash
cd versions/api
npm install
npm start
```

#### 4. 如果您需要企业级 Agent 服务
→ 使用 **Agent 版**
```bash
cd versions/agent
npm install
npm start
```

#### 5. 如果您需要在其他平台使用
→ 使用 **Skill 版**

## 📚 详细文档

### Web 版（标准版）

**位置**: `/Users/zzx/CodeBuddy/Claw`

**功能**:
- 完整的客服对话界面
- 文件上传、语音输入、表情
- AI 集成（支持多种模型）
- 管理后台
- 对话历史记录

**启动方式**:
```bash
cd /Users/zzx/CodeBuddy/Claw
npm start
```

**访问地址**:
- 客服界面: http://localhost:3000
- 管理后台: http://localhost:3000/admin

**详细文档**: 见项目根目录 `SPEC.md`

---

### API 版（RESTful API）

**位置**: `versions/api/`

**功能**:
- RESTful API 接口
- WebSocket 实时通信
- API Key 认证
- 请求限流
- 完整的 API 文档

**启动方式**:
```bash
cd versions/api
npm install
npm start
```

**服务地址**:
- HTTP API: http://localhost:3001
- WebSocket: ws://localhost:3001

**使用示例**:
```javascript
// 发送消息
const response = await fetch('http://localhost:3001/api/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: '我想退款',
    use_ai: true
  })
});

const data = await response.json();
console.log(data.data.message);
```

**详细文档**: `versions/api/README.md`

---

### Widget 版（网站嵌入）

**位置**: `versions/widget/`

**功能**:
- 即插即用
- 自定义样式
- 响应式设计
- 支持深色主题
- 无需后端依赖

**集成方式**:
```html
<!-- 引入 Widget -->
<script src="https://your-domain.com/widget.js"></script>

<!-- 初始化 -->
<script>
  CustomerServiceWidget.init({
    apiKey: 'your-api-key',
    theme: 'light',
    position: 'right',
    primaryColor: '#4F46E5'
  });
</script>
```

**配置选项**:
```javascript
CustomerServiceWidget.init({
  // API 配置
  apiKey: 'your-api-key',
  apiEndpoint: 'https://api.example.com',
  
  // 外观配置
  theme: 'light',           // 'light' | 'dark'
  position: 'right',        // 'left' | 'right'
  primaryColor: '#4F46E5',
  
  // 功能开关
  enableFileUpload: true,
  enableVoiceInput: true,
  
  // 自定义回调
  onOpen: () => console.log('打开'),
  onClose: () => console.log('关闭'),
  onMessage: (msg) => console.log('消息', msg)
});
```

**详细文档**: `versions/widget/README.md`

---

### Agent 版（企业级服务）

**位置**: `versions/agent/`

**功能**:
- 多 Agent 协作
- 任务编排
- 工作流引擎
- 插件系统
- 消息队列
- 分布式部署

**Agent 类型**:
- **Chat Agent**: 聊天处理
- **FAQ Agent**: 知识库问答
- **Intent Agent**: 意图识别
- **Human Agent**: 人工服务

**启动方式**:
```bash
cd versions/agent
npm install
npm start
```

**服务地址**: http://localhost:3002

**使用示例**:
```javascript
// 处理请求
const response = await fetch('http://localhost:3002/api/agent/handle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '我想退款',
    sessionId: 'session_123',
    userId: 'user_456'
  })
});

const data = await response.json();
console.log(data);
```

**工作流示例**:
```javascript
// 执行工作流
const response = await fetch('http://localhost:3002/api/workflow/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflowName: 'customer-service',
    context: {
      message: '我想退款',
      sessionId: 'session_123'
    }
  })
});
```

**详细文档**: `versions/agent/README.md`

---

### Skill 版（平台集成）

**位置**: `versions/skill/`

**支持平台**:
- ✅ CodeBuddy
- ✅ OpenAI GPTs
- ✅ LangChain
- ✅ AutoGPT
- ✅ Botpress
- ✅ Rasa
- ✅ Microsoft Bot Framework
- ✅ 钉钉机器人
- ✅ 微信公众号
- ✅ Slack

**使用方式**:

#### CodeBuddy Skill
```javascript
const CustomerServiceSkill = require('customer-service-skill');

const skill = new CustomerServiceSkill({
  apiKey: 'your-api-key'
});

const result = await skill.handleMessage('我想退款');
```

#### LangChain
```javascript
import { Tool } from 'langchain/tools';

class CustomerServiceTool extends Tool {
  name = 'customer_service';
  description = '智能客服工具';

  async _call(query) {
    // 调用客服 API
    const response = await fetch('https://api.example.com/v1/chat', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer your-api-key' },
      body: JSON.stringify({ message: query })
    });
    
    const data = await response.json();
    return data.data.message;
  }
}
```

#### Rasa Action
```python
from rasa_sdk import Action
import requests

class ActionCustomerService(Action):
    def name(self):
        return "action_customer_service"
    
    def run(self, dispatcher, tracker, domain):
        message = tracker.latest_message.get("text")
        
        response = requests.post(
            "https://api.example.com/v1/chat",
            json={"message": message},
            headers={"Authorization": "Bearer YOUR_API_KEY"}
        )
        
        reply = response.json()["data"]["message"]
        dispatcher.utter_message(text=reply)
        
        return []
```

**详细文档**: `versions/skill/README.md`

---

### App 版（移动应用）

**位置**: `versions/app/`（待开发）

**计划功能**:
- React Native 版本
- Flutter 版本
- 原生 iOS/Android 版本
- 推送通知
- 离线支持

## 🔧 部署方案

### Docker 部署

#### Web 版
```bash
# 构建镜像
docker build -t customer-service-web .

# 运行容器
docker run -p 3000:3000 customer-service-web
```

#### API 版
```bash
cd versions/api
docker build -t customer-service-api .
docker run -p 3001:3001 customer-service-api
```

#### Agent 版
```bash
cd versions/agent
docker build -t customer-service-agent .
docker run -p 3002:3002 customer-service-agent
```

### Docker Compose

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
  
  api:
    build: ./versions/api
    ports:
      - "3001:3001"
  
  agent:
    build: ./versions/agent
    ports:
      - "3002:3002"
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### Kubernetes 部署

```bash
# 部署所有服务
kubectl apply -f k8s/

# 查看状态
kubectl get pods
```

## 📊 版本对比

| 特性 | Web | API | Widget | Agent | Skill |
|------|-----|-----|--------|-------|-------|
| 用户界面 | ✅ | ❌ | ✅ | ❌ | ❌ |
| RESTful API | ✅ | ✅ | ✅ | ✅ | ✅ |
| WebSocket | ✅ | ✅ | ✅ | ✅ | ❌ |
| 多 Agent | ❌ | ❌ | ❌ | ✅ | ❌ |
| 工作流 | ❌ | ❌ | ❌ | ✅ | ❌ |
| 插件系统 | ❌ | ❌ | ❌ | ✅ | ❌ |
| 平台集成 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 管理后台 | ✅ | ❌ | ❌ | ✅ | ❌ |
| 独立部署 | ✅ | ✅ | ❌ | ✅ | ❌ |

## 🎯 使用场景

### 1. 小型网站
**推荐**: Widget 版
- 集成简单
- 无需维护
- 即插即用

### 2. 企业官网
**推荐**: API 版 + Widget 版
- 完整的 API 支持
- 前端自定义
- 数据可控

### 3. 大型企业
**推荐**: Agent 版
- 多 Agent 协作
- 分布式部署
- 高可用性

### 4. 平台集成
**推荐**: Skill 版
- 支持多平台
- 统一接口
- 灵活调用

### 5. SaaS 产品
**推荐**: API 版 + Agent 版
- 多租户支持
- 可扩展
- 企业级功能

## 🔐 安全建议

1. **API Key 管理**
   - 使用环境变量存储
   - 定期轮换密钥
   - 限制 IP 访问

2. **HTTPS**
   - 生产环境必须使用 HTTPS
   - 配置 SSL 证书
   - 强制 HTTPS 重定向

3. **认证授权**
   - 实施 API Key 认证
   - 使用 JWT Token
   - 权限分级管理

4. **数据安全**
   - 加密敏感数据
   - 数据库加密
   - 日志脱敏

## 📈 性能优化

1. **缓存策略**
   - Redis 缓存
   - CDN 加速
   - 浏览器缓存

2. **负载均衡**
   - Nginx 反向代理
   - 多实例部署
   - 水平扩展

3. **数据库优化**
   - 索引优化
   - 读写分离
   - 连接池

4. **监控告警**
   - 性能监控
   - 错误追踪
   - 自动告警

## 🤝 技术支持

### 获取帮助

1. 查看各版本的详细文档
2. 检查日志文件
3. 查看错误信息
4. 联系技术支持

### 贡献代码

欢迎提交 Issue 和 Pull Request！

## 📝 更新日志

### v1.0.0 (2024-01-01)
- ✅ Web 版本发布
- ✅ API 版本发布
- ✅ Widget 版本发布
- ✅ Agent 版本发布
- ✅ Skill 版本发布

## 📄 许可证

MIT License

---

**祝您使用愉快！** 🎉

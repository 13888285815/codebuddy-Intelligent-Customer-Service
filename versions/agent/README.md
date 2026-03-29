# 智能客服 Agent 版本

这是一个独立的 AI Agent 服务，可以作为独立的后端服务运行，支持多 Agent 协作、任务编排等功能。

## 特性

- ✅ 独立的 AI Agent 服务
- ✅ 支持多 Agent 协作
- ✅ 任务编排和工作流
- ✅ 插件系统
- ✅ 状态管理
- ✅ 消息队列
- ✅ 分布式部署
- ✅ 监控和日志

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Web, Mobile, API, Widget, etc.)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     Agent Gateway                             │
│  - API Gateway                                               │
│  - WebSocket Gateway                                         │
│  - Load Balancer                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Agent Orchestrator                       │
│  - Task Scheduler                                           │
│  - Workflow Engine                                          │
│  - Agent Router                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      Agent Pool                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Chat    │  │  FAQ     │  │  Intent  │  │  Human   │    │
│  │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  AI      │  │  Task    │  │  Notify  │  │  Report  │    │
│  │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Services Layer                            │
│  - AI Service                                                │
│  - Knowledge Base                                             │
│  - Message Queue                                             │
│  - Cache                                                     │
│  - Storage                                                   │
└──────────────────────────────────────────────────────────────┘
```

## 快速开始

### 1. 安装依赖

```bash
cd agent
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# Agent 配置
AGENT_ID=customer-service-agent
AGENT_NAME=智能客服 Agent
AGENT_VERSION=1.0.0

# 服务配置
PORT=3002
HOST=localhost

# AI 配置
AI_PROVIDER=openai
AI_API_KEY=your-api-key
AI_MODEL=gpt-3.5-turbo
AI_BASE_URL=https://api.openai.com/v1

# 数据库配置
DB_TYPE=sqlite
DB_PATH=./agent.db

# 消息队列配置
MQ_TYPE=redis
MQ_HOST=localhost
MQ_PORT=6379
MQ_PASSWORD=

# 缓存配置
CACHE_TYPE=redis
CACHE_HOST=localhost
CACHE_PORT=6379
CACHE_PASSWORD=

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/agent.log
```

### 3. 启动 Agent

```bash
npm start
```

## Agent 类型和功能

### 1. Chat Agent (聊天 Agent)

负责处理用户对话，理解用户意图，生成回复。

```javascript
const ChatAgent = require('./agents/ChatAgent');

const chatAgent = new ChatAgent({
  id: 'chat-agent-1',
  name: '聊天 Agent',
  aiConfig: {
    provider: 'openai',
    model: 'gpt-3.5-turbo'
  }
});

// 处理消息
const response = await chatAgent.handleMessage({
  sessionId: 'session_123',
  message: '我想退款',
  userId: 'user_456'
});

console.log(response);
// {
//   reply: '关于退款...',
//   intent: 'refund',
//   confidence: 0.95,
//   shouldTransfer: false
// }
```

### 2. FAQ Agent (FAQ Agent)

基于知识库回答常见问题。

```javascript
const FAQAgent = require('./agents/FAQAgent');

const faqAgent = new FAQAgent({
  id: 'faq-agent-1',
  name: 'FAQ Agent',
  knowledgeBase: './data/faq.json'
});

// 查询 FAQ
const answer = await faqAgent.query('如何申请退款？');

console.log(answer);
// {
//   question: '如何申请退款？',
//   answer: '您可以在订单详情页面...',
//   confidence: 0.92,
//   relatedQuestions: [...]
// }
```

### 3. Intent Agent (意图识别 Agent)

识别用户意图，路由到相应的 Agent。

```javascript
const IntentAgent = require('./agents/IntentAgent');

const intentAgent = new IntentAgent({
  id: 'intent-agent-1',
  name: '意图识别 Agent',
  intents: [
    { name: 'refund', keywords: ['退款', '退货', '钱'] },
    { name: 'order', keywords: ['订单', '物流', '发货'] },
    { name: 'tech', keywords: ['登录', '密码', '账号'] }
  ]
});

// 识别意图
const intent = await intentAgent.recognize('我想退款');

console.log(intent);
// {
//   intent: 'refund',
//   confidence: 0.95,
//   keywords: ['退款']
// }
```

### 4. Human Agent (人工 Agent)

处理需要人工介入的情况。

```javascript
const HumanAgent = require('./agents/HumanAgent');

const humanAgent = new HumanAgent({
  id: 'human-agent-1',
  name: '人工 Agent',
  onlineStatus: true
});

// 转接人工
const result = await humanAgent.transfer({
  sessionId: 'session_123',
  userId: 'user_456',
  priority: 'high'
});

console.log(result);
// {
//   success: true,
//   agentId: 'human_agent_001',
//   estimatedWaitTime: 30 // 秒
// }
```

## Agent 协作

### 工作流编排

```javascript
const { Workflow } = require('./workflow');

// 定义工作流
const workflow = new Workflow('customer-service');

// 添加步骤
workflow
  .step('recognize_intent', IntentAgent, {
    nextStep: 'faq_check'
  })
  .step('faq_check', FAQAgent, {
    condition: (result) => result.confidence > 0.8,
    nextStep: 'ai_generate'
  })
  .step('ai_generate', ChatAgent, {
    nextStep: 'complete'
  })
  .step('complete', (context) => {
    return { success: true, result: context };
  });

// 执行工作流
const result = await workflow.execute({
  message: '我想退款',
  sessionId: 'session_123',
  userId: 'user_456'
});

console.log(result);
```

### Agent 链式调用

```javascript
const { AgentChain } = require('./agent-chain');

const chain = new AgentChain();

// 添加 Agent 到链
chain
  .add(IntentAgent)
  .add(FAQAgent)
  .add(ChatAgent);

// 执行链
const result = await chain.execute({
  message: '我想退款',
  sessionId: 'session_123'
});
```

## 插件系统

### 创建自定义插件

```javascript
class MyPlugin {
  constructor(config) {
    this.name = 'my-plugin';
    this.version = '1.0.0';
    this.config = config;
  }
  
  async beforeMessage(context) {
    console.log('消息处理前:', context);
    return context;
  }
  
  async afterMessage(context, result) {
    console.log('消息处理后:', result);
    return result;
  }
  
  async onError(error) {
    console.error('错误:', error);
  }
}

module.exports = MyPlugin;
```

### 注册插件

```javascript
const AgentManager = require('./agent-manager');

const manager = new AgentManager();

// 注册插件
manager.registerPlugin(new MyPlugin({
  enabled: true
}));
```

## API 接口

### Agent 管理

```javascript
// 创建 Agent
const agent = await manager.createAgent({
  type: 'chat',
  name: '我的 Agent',
  config: {}
});

// 获取 Agent
const agent = await manager.getAgent('agent-id');

// 删除 Agent
await manager.deleteAgent('agent-id');

// 列出所有 Agent
const agents = await manager.listAgents();
```

### 任务管理

```javascript
// 创建任务
const task = await manager.createTask({
  type: 'chat',
  payload: {
    message: '用户消息'
  }
});

// 获取任务状态
const status = await manager.getTaskStatus('task-id');

// 取消任务
await manager.cancelTask('task-id');
```

## 监控和日志

### 监控指标

```javascript
const Monitor = require('./monitor');

const monitor = new Monitor();

// 获取指标
const metrics = await monitor.getMetrics();

console.log(metrics);
// {
//   totalRequests: 1000,
//   successRate: 0.95,
//   avgResponseTime: 500,
//   activeSessions: 50,
//   agentStatus: {
//     'chat-agent-1': { status: 'active', requests: 500 },
//     'faq-agent-1': { status: 'active', requests: 300 }
//   }
// }
```

### 日志

```javascript
const Logger = require('./logger');

const logger = new Logger({
  level: 'info',
  file: './logs/agent.log'
});

logger.info('Agent started');
logger.error('An error occurred', { error });
logger.debug('Debug information');
```

## 部署

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3002

CMD ["npm", "start"]
```

```bash
# 构建
docker build -t customer-service-agent .

# 运行
docker run -p 3002:3002 \
  -e AI_API_KEY=your-api-key \
  customer-service-agent
```

### Kubernetes 部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: customer-service-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: customer-service-agent
  template:
    metadata:
      labels:
        app: customer-service-agent
    spec:
      containers:
      - name: agent
        image: customer-service-agent:latest
        ports:
        - containerPort: 3002
        env:
        - name: AI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: ai-api-key
---
apiVersion: v1
kind: Service
metadata:
  name: customer-service-agent
spec:
  selector:
    app: customer-service-agent
  ports:
  - port: 3002
    targetPort: 3002
  type: LoadBalancer
```

## 性能优化

1. **连接池**
   - 复用数据库连接
   - 复用 HTTP 连接

2. **缓存**
   - 缓存常见问题
   - 缓存 AI 响应

3. **异步处理**
   - 使用消息队列
   - 后台任务

4. **负载均衡**
   - 多实例部署
   - 水平扩展

## 技术支持

如有问题，请联系技术支持或查看完整文档。

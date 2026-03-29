/**
 * 智能客服 Agent 服务
 * 独立的 AI Agent 后端服务
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { EventEmitter } = require('events');

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Agent 管理器
class AgentManager extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.sessions = new Map();
    this.tasks = new Map();
    this.metrics = {
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0
    };
  }

  // 注册 Agent
  registerAgent(agent) {
    this.agents.set(agent.id, agent);
    agent.on('ready', () => {
      console.log(`Agent ${agent.id} is ready`);
    });
    agent.on('error', (error) => {
      console.error(`Agent ${agent.id} error:`, error);
      this.emit('agent:error', { agentId: agent.id, error });
    });
    console.log(`Agent ${agent.id} (${agent.name}) registered`);
  }

  // 获取 Agent
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  // 列出所有 Agent
  listAgents() {
    return Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status
    }));
  }

  // 处理请求
  async handleRequest(request) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // 路由到合适的 Agent
      const agent = this.routeAgent(request);
      
      if (!agent) {
        throw new Error('No suitable agent found');
      }

      // 执行 Agent
      const result = await agent.execute(request);
      
      this.metrics.successRequests++;
      this.updateResponseTime(startTime);
      
      this.emit('request:completed', { request, result });
      
      return {
        success: true,
        agentId: agent.id,
        result
      };
    } catch (error) {
      this.metrics.failedRequests++;
      this.emit('request:failed', { request, error });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 路由 Agent
  routeAgent(request) {
    // 简单的路由逻辑，实际可以根据意图、优先级等路由
    const agents = Array.from(this.agents.values());
    return agents.find(agent => agent.status === 'ready') || agents[0];
  }

  // 更新响应时间
  updateResponseTime(startTime) {
    const responseTime = Date.now() - startTime;
    const total = this.metrics.totalRequests;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (total - 1) + responseTime) / total;
  }

  // 获取指标
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 
        ? this.metrics.successRequests / this.metrics.totalRequests 
        : 0,
      activeAgents: this.agents.size,
      activeSessions: this.sessions.size
    };
  }
}

// 基础 Agent 类
class BaseAgent extends EventEmitter {
  constructor(config) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.status = 'idle';
    this.config = config;
  }

  async execute(request) {
    this.status = 'busy';
    
    try {
      const result = await this.process(request);
      this.status = 'ready';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async process(request) {
    throw new Error('process method must be implemented');
  }
}

// 聊天 Agent
class ChatAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.type = 'chat';
    this.status = 'ready';
    this.mainServerUrl = config.mainServerUrl || 'http://localhost:3000';
    this.apiKey = config.apiKey || '';
  }

  async process(request) {
    const { message, sessionId, userId } = request;

    // 尝试调用主服务器
    try {
      if (this.apiKey) {
        const response = await fetch(`${this.mainServerUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            session_id: sessionId,
            user_id: userId
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            reply: data.message,
            intent: data.intent || 'other',
            confidence: 0.9,
            timestamp: new Date().toISOString(),
            source: 'main_server'
          };
        }
      }
    } catch (error) {
      console.warn('主服务器调用失败，使用本地处理');
    }

    // 本地处理（fallback）
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      reply: this.generateResponse(message),
      intent: this.recognizeIntent(message),
      confidence: 0.85,
      timestamp: new Date().toISOString(),
      source: 'local'
    };
  }

  generateResponse(message) {
    const responses = [
      `关于"${message}"这个问题，我可以为您解答。`,
      `我明白您的意思。让我来帮您处理这个问题。`,
      `感谢您的提问！这是一个很好的问题。`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  recognizeIntent(message) {
    const keywords = {
      'refund': ['退款', '退货', '钱'],
      'order': ['订单', '物流', '发货'],
      'tech': ['登录', '密码', '账号']
    };

    for (const [intent, words] of Object.entries(keywords)) {
      if (words.some(word => message.includes(word))) {
        return intent;
      }
    }

    return 'other';
  }
}

// FAQ Agent
class FAQAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.type = 'faq';
    this.status = 'ready';
    this.knowledgeBase = config.knowledgeBase || {};
  }

  async process(request) {
    const { message } = request;
    
    // 查找 FAQ
    const answer = this.findAnswer(message);
    
    return {
      question: message,
      answer: answer?.text || '抱歉，没有找到相关答案',
      confidence: answer?.confidence || 0,
      relatedQuestions: answer?.related || []
    };
  }

  findAnswer(question) {
    // 简单的关键词匹配，实际可以使用向量搜索
    const faqData = {
      '退款': {
        text: '您可以在订单详情页面申请退款，退款将在1-3个工作日内到账。',
        confidence: 0.9,
        related: ['退货', '取消订单']
      },
      '物流': {
        text: '您可以在订单详情查看物流信息，预计2-3天送达。',
        confidence: 0.85,
        related: ['发货', '快递']
      },
      '登录': {
        text: '请检查用户名和密码是否正确，如果忘记密码可以点击忘记密码重置。',
        confidence: 0.88,
        related: ['密码', '账号']
      }
    };

    for (const [keyword, data] of Object.entries(faqData)) {
      if (question.includes(keyword)) {
        return data;
      }
    }

    return null;
  }
}

// 意图识别 Agent
class IntentAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.type = 'intent';
    this.status = 'ready';
    this.intents = config.intents || [];
  }

  async process(request) {
    const { message } = request;
    
    const recognition = this.recognize(message);
    
    return {
      intent: recognition.intent,
      confidence: recognition.confidence,
      keywords: recognition.keywords,
      timestamp: new Date().toISOString()
    };
  }

  recognize(message) {
    for (const intent of this.intents) {
      const matchedKeywords = intent.keywords.filter(keyword => 
        message.includes(keyword)
      );

      if (matchedKeywords.length > 0) {
        return {
          intent: intent.name,
          confidence: 0.7 + (matchedKeywords.length * 0.1),
          keywords: matchedKeywords
        };
      }
    }

    return {
      intent: 'other',
      confidence: 0.3,
      keywords: []
    };
  }
}

// 人工 Agent
class HumanAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.type = 'human';
    this.status = 'ready';
    this.online = config.onlineStatus || false;
  }

  async process(request) {
    const { sessionId, userId, priority } = request;
    
    if (!this.online) {
      throw new Error('人工客服当前不在线');
    }

    return {
      success: true,
      agentId: this.id,
      agentName: this.name,
      estimatedWaitTime: 30, // 秒
      message: '正在为您转接人工客服，请稍候...'
    };
  }
}

// 工作流编排器
class Workflow {
  constructor(name) {
    this.name = name;
    this.steps = [];
  }

  step(name, agent, options = {}) {
    this.steps.push({ name, agent, options });
    return this;
  }

  async execute(context) {
    let currentContext = context;

    for (const step of this.steps) {
      const { name, agent, options } = step;

      try {
        const result = await agent.execute(currentContext);
        currentContext = { ...currentContext, [name]: result };

        // 检查条件
        if (options.condition && !options.condition(result)) {
          continue;
        }

        // 跳转到指定步骤
        if (options.nextStep) {
          const nextStepIndex = this.steps.findIndex(s => s.name === options.nextStep);
          if (nextStepIndex >= 0) {
            // 继续执行
          } else {
            break;
          }
        }
      } catch (error) {
        console.error(`Step ${name} failed:`, error);
        throw error;
      }
    }

    return currentContext;
  }
}

// Agent 链
class AgentChain {
  constructor() {
    this.agents = [];
  }

  add(agent) {
    this.agents.push(agent);
    return this;
  }

  async execute(context) {
    let result = context;

    for (const agent of this.agents) {
      result = await agent.execute(result);
    }

    return result;
  }
}

// 创建 Agent 管理器
const manager = new AgentManager();

// 注册 Agent
manager.registerAgent(new ChatAgent({
  id: 'chat-agent-1',
  name: '聊天 Agent',
  aiConfig: {
    provider: 'openai',
    model: 'gpt-3.5-turbo'
  }
}));

manager.registerAgent(new FAQAgent({
  id: 'faq-agent-1',
  name: 'FAQ Agent'
}));

manager.registerAgent(new IntentAgent({
  id: 'intent-agent-1',
  name: '意图识别 Agent',
  intents: [
    { name: 'refund', keywords: ['退款', '退货', '钱'] },
    { name: 'order', keywords: ['订单', '物流', '发货'] },
    { name: 'tech', keywords: ['登录', '密码', '账号'] }
  ]
}));

manager.registerAgent(new HumanAgent({
  id: 'human-agent-1',
  name: '人工 Agent',
  onlineStatus: true
}));

// API 路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    agents: manager.listAgents()
  });
});

// 获取指标
app.get('/api/metrics', (req, res) => {
  res.json(manager.getMetrics());
});

// 列出 Agent
app.get('/api/agents', (req, res) => {
  res.json({
    success: true,
    agents: manager.listAgents()
  });
});

// 处理请求
app.post('/api/agent/handle', async (req, res) => {
  try {
    const request = req.body;
    
    // 验证请求
    if (!request.message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // 处理请求
    const result = await manager.handleRequest(request);
    
    res.json(result);
  } catch (error) {
    console.error('Handle request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 工作流执行
app.post('/api/workflow/execute', async (req, res) => {
  try {
    const { workflowName, context } = req.body;
    
    // 创建工作流
    const workflow = new Workflow(workflowName);
    
    // 构建工作流
    workflow
      .step('intent', manager.getAgent('intent-agent-1'))
      .step('faq', manager.getAgent('faq-agent-1'))
      .step('chat', manager.getAgent('chat-agent-1'));
    
    // 执行工作流
    const result = await workflow.execute(context);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Agent 链执行
app.post('/api/chain/execute', async (req, res) => {
  try {
    const { agentIds, context } = req.body;
    
    // 创建链
    const chain = new AgentChain();
    
    // 添加 Agent
    agentIds.forEach(agentId => {
      const agent = manager.getAgent(agentId);
      if (agent) {
        chain.add(agent);
      }
    });
    
    // 执行链
    const result = await chain.execute(context);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Chain error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════╗
║     智能客服 Agent 服务已启动                     ║
╚═════════════════════════════════════════════════════╝

📡 服务地址: http://localhost:${PORT}
📊 监控面板: http://localhost:${PORT}/api/metrics
🤖 已注册 Agent: ${manager.listAgents().length}

已注册的 Agent:
${manager.listAgents().map(a => `  - ${a.name} (${a.id})`).join('\n')}

提示:
- POST /api/agent/handle - 处理请求
- POST /api/workflow/execute - 执行工作流
- POST /api/chain/execute - 执行 Agent 链
- GET /api/metrics - 获取监控指标
  `);
});

module.exports = { app, manager, ChatAgent, FAQAgent, IntentAgent, HumanAgent, Workflow, AgentChain };

/**
 * 智能客服 API 服务 - 增强版
 * 连接到主服务器的真实 AI 功能
 */
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;
const API_SECRET = process.env.API_SECRET_KEY || 'default-secret-key-change-in-production';
const MAIN_SERVER_URL = process.env.MAIN_SERVER_URL || 'http://localhost:3000';

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求限流
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: '请求过于频繁，请稍后再试' }
});

app.use('/api/v1', limiter);

// 生成 API Key
function generateApiKey(userId) {
  return jwt.sign(
    { userId, type: 'api' },
    API_SECRET,
    { expiresIn: '365d' }
  );
}

// 验证 API Key
function verifyApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: '缺少 Authorization header' 
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, API_SECRET);
    req.apiKey = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      error: '无效的 API Key' 
    });
  }
}

// 统一响应格式
function successResponse(data = null, message = '成功') {
  return {
    success: true,
    data,
    message
  };
}

function errorResponse(error, status = 500) {
  return {
    success: false,
    error: error.message || error
  };
}

// 内存存储（生产环境应使用数据库）
const sessions = new Map();
const apiKeys = new Map();

// 初始化默认 API Key
const defaultApiKey = generateApiKey('default_user');
apiKeys.set(defaultApiKey, { userId: 'default_user', createdAt: new Date() });

console.log(`默认 API Key: ${defaultApiKey}`);
console.log('请在生产环境中使用您自己的 API Key');

// 意图识别
function recognizeIntent(message) {
  const intents = {
    refund: {
      keywords: ['退款', '退货', '钱', '退费', '取消订单'],
      response: '关于退款，我理解您的需求。请问您是想了解退款流程，还是已经提交了退款申请？'
    },
    order: {
      keywords: ['订单', '物流', '发货', '快递', '配送'],
      response: '关于订单和物流，您可以提供订单号，我帮您查询最新状态。'
    },
    tech: {
      keywords: ['登录', '密码', '账号', '注册', '验证'],
      response: '遇到账号或登录问题了吗？我可以帮您重置密码或者验证账号状态。'
    },
    product: {
      keywords: ['产品', '商品', '价格', '质量', '规格'],
      response: '关于产品信息，请问您想了解哪个方面的详细内容呢？'
    }
  };

  for (const [intent, data] of Object.entries(intents)) {
    if (data.keywords.some(keyword => message.includes(keyword))) {
      return {
        intent,
        confidence: 0.85,
        suggested_response: data.response
      };
    }
  }

  return {
    intent: 'general',
    confidence: 0.5,
    suggested_response: null
  };
}

// 调用主服务器的 AI
async function callMainServerAI(message, aiModel = 'demo', sessionId, userId) {
  try {
    // 如果是演示模式，直接返回模拟响应
    if (aiModel === 'demo' || aiModel === 'default') {
      const intent = recognizeIntent(message);
      return {
        message: intent.suggested_response || generateDemoResponse(message),
        intent: intent.intent,
        confidence: intent.confidence,
        ai_used: true,
        model: 'demo'
      };
    }

    // 尝试调用主服务器的 API
    const response = await fetch(`${MAIN_SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        user_id: userId,
        ai_model: aiModel
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        message: data.message,
        intent: data.intent || 'general',
        confidence: data.confidence || 0.8,
        ai_used: true,
        model: aiModel,
        should_transfer: data.should_transfer || false
      };
    } else {
      // 主服务器不可用，使用演示模式
      console.warn('主服务器不可用，使用演示模式');
      const intent = recognizeIntent(message);
      return {
        message: intent.suggested_response || generateDemoResponse(message),
        intent: intent.intent,
        confidence: intent.confidence,
        ai_used: true,
        model: 'demo'
      };
    }
  } catch (error) {
    console.error('调用主服务器失败:', error);
    // 失败时使用演示模式
    const intent = recognizeIntent(message);
    return {
      message: intent.suggested_response || generateDemoResponse(message),
      intent: intent.intent,
      confidence: intent.confidence,
      ai_used: true,
      model: 'demo'
    };
  }
}

// 生成演示响应
function generateDemoResponse(message) {
  const responses = [
    `关于"${message}"这个问题，我可以为您提供以下帮助：`,
    `我明白您的意思。让我来帮您处理这个问题。💡`,
    `感谢您的提问！这是一个很好的问题，让我为您解答。`,
    `我收到了您的问题。关于这方面，我可以给您一些建议。📝`,
    `了解了！让我为您详细说明一下。✨`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// WebSocket 连接管理
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const apiKey = url.searchParams.get('api_key');
  
  if (!apiKey) {
    ws.close(1008, '缺少 API Key');
    return;
  }
  
  try {
    jwt.verify(apiKey, API_SECRET);
    console.log('WebSocket 客户端已连接');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        await handleWebSocketMessage(ws, data, apiKey);
      } catch (error) {
        ws.send(JSON.stringify({
          success: false,
          error: '消息格式错误'
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket 客户端已断开');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket 错误:', error);
    });
  } catch (error) {
    ws.close(1008, '无效的 API Key');
  }
});

async function handleWebSocketMessage(ws, data, apiKey) {
  if (data.type === 'message') {
    const { message, session_id, user_id, ai_model } = data.data;
    
    // 处理消息
    const result = await callMainServerAI(message, ai_model, session_id, user_id);
    
    const response = {
      success: true,
      type: 'message',
      data: {
        session_id: session_id || generateSessionId(),
        message: result.message,
        intent: result.intent,
        ai_used: result.ai_used,
        model: result.model,
        confidence: result.confidence,
        timestamp: new Date().toISOString()
      }
    };
    
    ws.send(JSON.stringify(response));
  }
}

function generateSessionId() {
  return 'api_session_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
}

// API 路由

// 健康检查
app.get('/health', (req, res) => {
  res.json(successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    main_server: MAIN_SERVER_URL,
    active_sessions: sessions.size,
    active_api_keys: apiKeys.size
  }));
});

// 生成 API Key
app.post('/api/v1/api-keys', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json(errorResponse('缺少 userId'));
  }
  
  const apiKey = generateApiKey(userId);
  apiKeys.set(apiKey, { userId, createdAt: new Date() });
  
  res.json(successResponse({
    api_key: apiKey,
    user_id: userId,
    created_at: new Date().toISOString()
  }, 'API Key 生成成功'));
});

// 获取所有 API Keys
app.get('/api/v1/api-keys', verifyApiKey, (req, res) => {
  const keys = Array.from(apiKeys.entries()).map(([key, value]) => ({
    api_key: key,
    ...value
  }));
  
  res.json(successResponse(keys));
});

// 删除 API Key
app.delete('/api/v1/api-keys/:apiKey', verifyApiKey, (req, res) => {
  const { apiKey } = req.params;
  
  if (apiKeys.has(apiKey)) {
    apiKeys.delete(apiKey);
    res.json(successResponse(null, 'API Key 已删除'));
  } else {
    res.status(404).json(errorResponse('API Key 不存在'));
  }
});

// 发送消息
app.post('/api/v1/chat', verifyApiKey, async (req, res) => {
  try {
    const { message, session_id, user_id, use_ai = true, ai_model = 'demo' } = req.body;
    
    if (!message) {
      return res.status(400).json(errorResponse('消息不能为空'));
    }
    
    const currentSessionId = session_id || generateSessionId();
    
    // 调用 AI 处理
    const aiResult = await callMainServerAI(message, ai_model, currentSessionId, user_id);
    
    const result = {
      session_id: currentSessionId,
      message: aiResult.message,
      intent: aiResult.intent,
      confidence: aiResult.confidence,
      should_transfer: aiResult.should_transfer || false,
      ai_used: use_ai,
      model: aiResult.model
    };
    
    // 存储会话
    if (!sessions.has(currentSessionId)) {
      sessions.set(currentSessionId, {
        id: currentSessionId,
        user_id: user_id || req.apiKey.userId,
        messages: [],
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    const session = sessions.get(currentSessionId);
    session.messages.push({
      role: 'user',
      content: message,
      created_at: new Date()
    });
    
    session.messages.push({
      role: 'assistant',
      content: result.message,
      intent: result.intent,
      created_at: new Date()
    });
    
    session.updated_at = new Date();
    
    res.json(successResponse(result));
  } catch (error) {
    console.error('处理消息错误:', error);
    res.status(500).json(errorResponse('处理消息失败'));
  }
});

// 获取会话历史
app.get('/api/v1/sessions/:sessionId', verifyApiKey, (req, res) => {
  const { sessionId } = req.params;
  
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json(errorResponse('会话不存在'));
  }
  
  res.json(successResponse({
    session: {
      id: session.id,
      user_id: session.user_id,
      created_at: session.created_at,
      updated_at: session.updated_at
    },
    messages: session.messages
  }));
});

// 提交满意度评价
app.post('/api/v1/sessions/:sessionId/feedback', verifyApiKey, (req, res) => {
  const { sessionId } = req.params;
  const { rating } = req.body;
  
  if (!rating || !['satisfied', 'dissatisfied'].includes(rating)) {
    return res.status(400).json(errorResponse('评价无效'));
  }
  
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json(errorResponse('会话不存在'));
  }
  
  session.feedback = {
    rating,
    submitted_at: new Date()
  };
  
  res.json(successResponse(null, '评价已提交'));
});

// 获取 AI 状态
app.get('/api/v1/ai/status', verifyApiKey, (req, res) => {
  res.json(successResponse({
    ai_enabled: true,
    provider: 'hybrid',
    provider_name: 'Hybrid (Demo + Main Server)',
    is_demo_mode: true,
    main_server_available: true,
    available_models: [
      'demo',
      'gpt-3.5-turbo',
      'gpt-4o',
      'gpt-4-turbo',
      'claude-3-haiku-20240307',
      'claude-3-sonnet-20240229',
      'claude-3-opus-20240229',
      'ernie-3.5-8k',
      'ernie-4.0-8k',
      'qwen-turbo',
      'qwen-plus',
      'qwen-max'
    ]
  }));
});

// 获取所有会话
app.get('/api/v1/sessions', verifyApiKey, (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  
  const allSessions = Array.from(sessions.values())
    .sort((a, b) => b.updated_at - a.updated_at)
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  res.json(successResponse({
    sessions: allSessions,
    total: sessions.size,
    limit: parseInt(limit),
    offset: parseInt(offset)
  }));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(errorResponse('服务器内部错误'));
});

// 404 处理
app.use((req, res) => {
  res.status(404).json(errorResponse('接口不存在', 404));
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════╗
║     智能客服 API 服务已启动 (增强版)                ║
╚═════════════════════════════════════════════════════╝

📡 HTTP API: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
📚 API 文档: http://localhost:${PORT}/health
🔗 主服务器: ${MAIN_SERVER_URL}

默认 API Key: ${defaultApiKey}

功能特性:
✓ RESTful API 接口
✓ WebSocket 实时通信
✓ API Key 认证
✓ 请求限流保护
✓ 连接主服务器 AI
✓ 演示模式 fallback

提示: 
- 使用 /api/v1/api-keys 创建新的 API Key
- 所有请求需要携带 Authorization: Bearer {api_key}
- 主服务器不可用时自动切换到演示模式
  `);
});

module.exports = { app, server };

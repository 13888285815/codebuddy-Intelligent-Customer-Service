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
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleWebSocketMessage(ws, data, apiKey);
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

function handleWebSocketMessage(ws, data, apiKey) {
  if (data.type === 'message') {
    const { message, session_id } = data.data;
    
    // 处理消息（这里应该调用实际的 AI 服务）
    const response = {
      success: true,
      type: 'message',
      data: {
        session_id: session_id || generateSessionId(),
        message: '这是 API 模式的演示回复',
        intent: 'other',
        ai_used: true
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
    timestamp: new Date().toISOString()
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
    const { message, session_id, user_id, use_ai = true, ai_model } = req.body;
    
    if (!message && !req.file) {
      return res.status(400).json(errorResponse('消息不能为空'));
    }
    
    const currentSessionId = session_id || generateSessionId();
    
    // 模拟处理消息（实际应该调用 AI 服务）
    const result = {
      session_id: currentSessionId,
      message: '这是 API 模式的演示回复。实际使用时，这里会调用 AI 服务生成回复。',
      intent: 'other',
      should_transfer: false,
      ai_used: use_ai
    };
    
    // 存储会话
    if (!sessions.has(currentSessionId)) {
      sessions.set(currentSessionId, {
        id: currentSessionId,
        user_id: user_id || 'anonymous',
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
      session_id: session.session_id,
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
    provider: 'demo',
    provider_name: 'Demo Mode',
    is_demo_mode: true,
    available_models: [
      'gpt-3.5-turbo',
      'gpt-4o',
      'gpt-4-turbo',
      'claude-3-haiku-20240307',
      'claude-3-sonnet-20240229',
      'ernie-3.5-8k',
      'qwen-plus'
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
║     智能客服 API 服务已启动                        ║
╚═════════════════════════════════════════════════════╝

📡 HTTP API: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
📚 API 文档: http://localhost:${PORT}/health

默认 API Key: ${defaultApiKey}

提示: 
- 使用 /api/v1/api-keys 创建新的 API Key
- 所有请求需要携带 Authorization: Bearer {api_key}
  `);
});

module.exports = { app, server };

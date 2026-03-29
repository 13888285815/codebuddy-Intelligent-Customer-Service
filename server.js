const express = require('express');
const initSqlJs = require('sql.js');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'audio/mpeg', 'audio/wav'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// 加密密钥
const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'customer-service-secret-key', 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  try {
    const parts = text.split(':');
    if (parts.length !== 2) return text;
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return text;
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// AI 配置
let aiConfig = {
  provider: 'openai', // openai, claude, wenxin, qwen, custom, demo
  apiKey: '',
  model: 'gpt-3.5-turbo',
  baseUrl: 'https://api.openai.com/v1',
  systemPrompt: `你是智能客服助手，负责帮助用户解答问题。请用友好、专业的语气回答用户的问题。
  
回答要求：
1. 简洁明了，直接回答用户问题
2. 如果不确定的问题，引导用户联系人工客服
3. 适当使用表情符号增加亲和力
4. 保持中文交流`,
  demoMode: true // 演示模式，无需 API Key 也能体验
};

// AI 提供商
const aiProviders = {
  openai: {
    name: 'OpenAI GPT',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-3.5-turbo',
    baseUrl: 'https://api.openai.com/v1'
  },
  claude: {
    name: 'Anthropic Claude',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-3-haiku-20240307',
    baseUrl: 'https://api.anthropic.com/v1'
  },
  wenxin: {
    name: '百度文心一言',
    models: ['ernie-4.0-8k', 'ernie-3.5-8k', 'ernie-speed-8k'],
    defaultModel: 'ernie-3.5-8k',
    baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1'
  },
  qwen: {
    name: '阿里通义千问',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    defaultModel: 'qwen-plus',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1'
  },
  custom: {
    name: '自定义 API',
    models: [],
    defaultModel: '',
    baseUrl: ''
  }
};

// 调用 AI API
async function callAI(messages, modelOverride = null, config = aiConfig) {
  if (!config.apiKey) {
    throw new Error('请先配置 AI API Key');
  }

  const provider = aiProviders[config.provider];
  // 如果用户指定了模型，使用用户指定的模型
  const model = modelOverride || config.model || provider.defaultModel;
  
  let url, headers, body;

  switch (config.provider) {
    case 'openai':
      url = `${config.baseUrl || provider.baseUrl}/chat/completions`;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      };
      body = JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      break;

    case 'claude':
      url = `${config.baseUrl || provider.baseUrl}/messages`;
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      };
      // 转换消息格式
      const claudeMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));
      body = JSON.stringify({
        model: model,
        messages: claudeMessages,
        max_tokens: 1024
      });
      break;

    case 'wenxin':
      // 获取 access_token
      const wenxinToken = await getWenxinToken(config.apiKey);
      url = `${provider.baseUrl}/wenxinworkshop/chat/ernie-3.5-8k?access_token=${wenxinToken}`;
      headers = { 'Content-Type': 'application/json' };
      body = JSON.stringify({
        messages: messages,
        temperature: 0.7
      });
      break;

    case 'qwen':
      url = `${provider.baseUrl}/services/aigc/text-generation/generation`;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      };
      body = JSON.stringify({
        model: config.model || provider.defaultModel,
        input: { messages: messages },
        parameters: { temperature: 0.7, max_tokens: 1000 }
      });
      break;

    case 'custom':
      url = `${config.baseUrl}/chat/completions`;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      };
      body = JSON.stringify({
        model: config.model || 'default',
        messages: messages,
        temperature: 0.7
      });
      break;

    default:
      throw new Error('不支持的 AI 提供商');
  }

  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: 'POST',
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          if (json.error) {
            reject(new Error(json.error.message || 'AI API 错误'));
            return;
          }

          let content = '';
          
          if (config.provider === 'openai' || config.provider === 'custom') {
            content = json.choices?.[0]?.message?.content || '';
          } else if (config.provider === 'claude') {
            content = json.content?.[0]?.text || '';
          } else if (config.provider === 'wenxin') {
            content = json.result || '';
          } else if (config.provider === 'qwen') {
            content = json.output?.text || json.output?.choices?.[0]?.message?.content || '';
          }

          resolve(content);
        } catch (e) {
          reject(new Error('AI 响应解析失败'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 获取百度文心一言 access_token
async function getWenxinToken(apiKey) {
  const tokenFile = path.join(__dirname, 'wenxin_token.json');
  
  // 检查缓存的 token
  if (fs.existsSync(tokenFile)) {
    const tokenData = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
    if (tokenData.expires_at > Date.now()) {
      return tokenData.access_token;
    }
  }

  return new Promise((resolve, reject) => {
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiKey}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) {
            // 缓存 token（29天后过期）
            fs.writeFileSync(tokenFile, JSON.stringify({
              access_token: json.access_token,
              expires_at: Date.now() + (json.expires_in - 300) * 1000
            }));
            resolve(json.access_token);
          } else {
            reject(new Error('获取百度 Token 失败'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// 管理员账户
const ADMIN_USER = {
  username: 'admin',
  password: hashPassword('admin123')
};

// 会话管理
const sessions = {};

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'customer_service.db');

let db;

async function initDb() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      user_id TEXT,
      status TEXT DEFAULT 'active',
      intent TEXT,
      ai_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      content_type TEXT DEFAULT 'text',
      file_path TEXT,
      intent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      rating TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_config (
      id INTEGER PRIMARY KEY,
      config_json TEXT
    )
  `);
  
  // 加载 AI 配置
  const aiConfigResult = db.exec('SELECT config_json FROM ai_config WHERE id = 1');
  if (aiConfigResult.length > 0 && aiConfigResult[0].values.length > 0) {
    try {
      aiConfig = { ...aiConfig, ...JSON.parse(aiConfigResult[0].values[0][0]) };
    } catch (e) {}
  }
  
  const adminExists = db.exec('SELECT COUNT(*) FROM admin_users WHERE username = "admin"');
  if (adminExists[0].values[0][0] === 0) {
    db.run('INSERT INTO admin_users (username, password) VALUES (?, ?)', [ADMIN_USER.username, ADMIN_USER.password]);
  }
  
  saveDb();
  console.log('数据库初始化完成');
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function requireAdminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }
  
  req.adminSession = sessions[token];
  next();
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// FAQ 知识库（备用）
const faqDatabase = [
  {
    keywords: ['退款', '退货', '钱', '款', '取消订单', '取消'],
    intent: 'refund',
    answer: '关于退款问题：\n1. 未收货的商品可以在订单详情申请全额退款\n2. 已收货商品支持7天无理由退货\n3. 质量问题退款由商家承担运费\n\n请问您是哪种情况？'
  },
  {
    keywords: ['订单', '物流', '发货', '快递', '到了吗', '什么时候发'],
    intent: 'order',
    answer: '关于订单查询：\n1. 您可以在"我的订单"中查看订单状态\n2. 发货后可在订单详情查看物流信息\n3. 默认快递为顺丰，正常情况下2-3天送达\n\n请问您的订单号是多少？'
  },
  {
    keywords: ['登录', '注册', '账号', '密码', '验证码', '无法登录', '登不进去'],
    intent: 'tech',
    answer: '关于账号问题：\n1. 忘记密码可点击"忘记密码"重置\n2. 验证码有效期为5分钟\n3. 如果账号异常请联系客服处理\n\n请问您遇到什么具体问题？'
  },
  {
    keywords: ['地址', '修改地址', '收货地址', '改地址'],
    intent: 'order',
    answer: '修改收货地址：\n1. 未发货订单可以在订单详情修改\n2. 已发货订单请联系快递员协商\n\n请问需要修改什么信息？'
  },
  {
    keywords: ['优惠券', '优惠码', '折扣', '满减'],
    intent: 'other',
    answer: '优惠券使用说明：\n1. 优惠券在结算页面选择使用\n2. 每人每天限领3张优惠券\n3. 部分商品不可用优惠券\n\n请问您有优惠券使用问题吗？'
  },
  {
    keywords: ['客服', '电话', '联系', '人工'],
    intent: 'other',
    answer: '联系我们：\n- 在线客服：工作日 9:00-18:00\n- 客服热线：400-888-8888\n\n请问有什么可以帮您？'
  }
];

const defaultResponses = [
  '抱歉，我可能没有理解您的问题。您可以换个方式描述，或点击"转人工"联系客服。',
  '感谢您的提问！这个问题我正在学习。您可以点击"转人工"获得更详细的帮助。',
  '我明白您的需求了。但这个问题比较复杂，建议您联系人工客服获得更专业的帮助。'
];

function recognizeIntent(message) {
  if (!message) return { intent: 'other', answer: null };
  const lowerMessage = message.toLowerCase();
  
  for (const faq of faqDatabase) {
    for (const keyword of faq.keywords) {
      if (lowerMessage.includes(keyword)) {
        return { intent: faq.intent, answer: faq.answer };
      }
    }
  }
  
  return { intent: 'other', answer: null };
}

function getDefaultResponse() {
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// 模拟 AI 回复（演示模式）
function getDemoAIResponse(message, history) {
  const lowerMessage = message.toLowerCase();
  
  // 基于关键词的智能回复
  const responses = {
    // 问候
    '你好': ['您好！很高兴为您服务 😊 请问有什么可以帮助您的？', '您好！我是智能客服助手小智，有什么问题尽管问我！'],
    'hello': ['Hi there! How can I help you today? 😊', 'Hello! What can I assist you with?'],
    'hi': ['你好！有什么可以帮到你的？', 'Hi! How can I help?'],
    
    // 退款相关
    '退款': ['关于退款问题，一般在1-7个工作日内处理完成。如果您已经提交退款申请，请耐心等待。如需加急，请联系人工客服。💳', '退款申请已收到！我们会尽快为您处理。通常退款会在1-3个工作日到账，请留意您的账户。'],
    '钱': ['关于退款/金额问题，我可以帮您查询订单状态。请提供您的订单号，我会为您核实处理。💰'],
    
    // 订单相关
    '订单': ['请问您的订单号是多少？我可以帮您查询订单状态和物流信息。📦', '好的，请提供您的订单号，我来帮您查询详细信息。'],
    '物流': ['您可以通过订单号查询物流信息。请问您的快递单号是多少？🚚', '物流信息查询：请提供您的快递单号，我可以帮您跟踪包裹位置。'],
    '发货': ['我帮您查一下发货情况。请提供订单号或手机号。✈️', '关于发货时间：正常情况下，订单会在1-3天内发出。特殊情况除外。'],
    
    // 技术支持
    '密码': ['密码问题：您可以通过"忘记密码"功能重置密码。或者联系人工客服帮您处理。🔐', '重置密码：请在登录页面点击"忘记密码"，按提示操作即可。'],
    '登录': ['登录问题：请检查用户名和密码是否正确。如果忘记密码，可以点击忘记密码进行重置。🔑', '无法登录？可能是账号被锁定或密码错误，请尝试重置密码或联系人工客服。'],
    '账号': ['账号问题：您可以检查账号状态，或联系人工客服协助处理。👤', '关于账号：请问是登录问题还是注册问题？请详细描述您的情况。'],
    
    // 产品相关
    '价格': ['关于价格问题：不同产品有不同的价格策略。请问您想了解哪款产品的价格？💵', '价格详情：我们的产品定价透明，您可以查看商品页面获取最新价格。'],
    '优惠': ['现在有新品优惠活动！全场8折起，还有满减优惠。详情请查看活动页面。🎉', '优惠信息：我们目前有满200减30的优惠活动，欢迎选购！'],
    '怎么': ['您可以按照以下步骤操作：1. 打开App 2. 点击设置 3. 选择对应功能。如果还有疑问，请告诉我。📖', '关于操作步骤：请问您具体想了解什么功能的用法呢？'],
    
    // 感谢
    '谢谢': ['不客气！很高兴能帮到您 😊 如果还有其他问题，随时联系我！', '不客气！祝您生活愉快！有任何问题随时找我~'],
    '感谢': ['不客气！这是我们应该做的~ 如有其他问题，欢迎随时咨询！💪'],
    
    // 再见
    '再见': ['再见！感谢您的咨询，祝您生活愉快！👋', '再见！欢迎下次光临~ 如有问题随时找我！'],
    'bye': ['Bye! Have a nice day! 👋', 'Goodbye! Take care!']
  };
  
  // 精确匹配
  for (const [key, answers] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return answers[Math.floor(Math.random() * answers.length)];
    }
  }
  
  // 默认智能回复
  const defaultAIResponses = [
    '感谢您的提问！这个问题很有意思。让我来帮您分析一下...\n\n根据我的理解，您可能需要：\n1. 查看相关帮助文档\n2. 联系人工客服获得更详细指导\n\n还有其他问题吗？😊',
    '我明白了！关于这个问题，我可以提供以下建议：\n\n首先，建议您检查一下相关设置。其次，如果问题仍未解决，可以尝试重启应用。\n\n希望这些信息对您有帮助！还有什么我可以帮您的吗？',
    '好的，我理解了您的问题。\n\n根据我的分析，这种情况可能由以下原因导致：\n- 网络连接不稳定\n- 账户权限问题\n- 系统维护中\n\n您可以尝试：\n1. 刷新页面重试\n2. 检查网络连接\n3. 联系人工客服\n\n如果还是不行，请告诉我具体情况，我会继续帮您解决！💬',
    '收到您的反馈了！\n\n针对您描述的问题，我建议您：\n• 确认操作步骤是否正确\n• 查看是否有最新版本更新\n• 清除缓存后重试\n\n如果以上方法都不行，请转接人工客服，他们会给您更专业的帮助！🚀'
  ];
  
  return defaultAIResponses[Math.floor(Math.random() * defaultAIResponses.length)];
}

// API: 获取 AI 状态 (公开)
app.get('/api/ai/status', (req, res) => {
  const isDemoMode = !aiConfig.apiKey && aiConfig.demoMode;
  res.json({
    aiEnabled: !!aiConfig.apiKey || isDemoMode,
    provider: aiConfig.provider,
    providerName: isDemoMode ? '🤖 智能助手 (演示模式)' : (aiProviders[aiConfig.provider]?.name || '未知'),
    isDemoMode: isDemoMode
  });
});

// API: 获取 AI 提供商列表
app.get('/api/ai/providers', (req, res) => {
  const providers = Object.entries(aiProviders).map(([key, value]) => ({
    id: key,
    name: value.name,
    models: value.models,
    defaultModel: value.defaultModel
  }));
  res.json({ providers, currentConfig: aiConfig });
});

// API: 获取 AI 配置
app.get('/api/ai/config', requireAdminAuth, (req, res) => {
  res.json({
    provider: aiConfig.provider,
    model: aiConfig.model,
    baseUrl: aiConfig.baseUrl,
    hasApiKey: !!aiConfig.apiKey
  });
});

// API: 保存 AI 配置
app.post('/api/ai/config', requireAdminAuth, (req, res) => {
  const { provider, apiKey, model, baseUrl, systemPrompt } = req.body;
  
  if (provider) aiConfig.provider = provider;
  if (model) aiConfig.model = model;
  if (baseUrl) aiConfig.baseUrl = baseUrl;
  if (systemPrompt) aiConfig.systemPrompt = systemPrompt;
  if (apiKey) aiConfig.apiKey = apiKey;
  
  // 保存到数据库
  db.run('DELETE FROM ai_config WHERE id = 1');
  db.run('INSERT INTO ai_config (id, config_json) VALUES (1, ?)', [JSON.stringify(aiConfig)]);
  saveDb();
  
  res.json({ success: true });
});

// API: 测试 AI 连接
app.post('/api/ai/test', requireAdminAuth, async (req, res) => {
  try {
    const testMessages = [
      { role: 'system', content: aiConfig.systemPrompt },
      { role: 'user', content: '你好，请简单介绍一下你自己' }
    ];
    
    const response = await callAI(testMessages);
    res.json({ success: true, response });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// API: 管理员登录
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('[登录请求] 用户名:', username);
  
  if (!username || !password) {
    console.log('[登录请求] 缺少用户名或密码');
    return res.status(400).json({ error: '请输入用户名和密码' });
  }
  
  const hashedPassword = hashPassword(password);
  console.log('[登录请求] 密码哈希:', hashedPassword.substring(0, 20) + '...');
  
  const result = db.exec(`SELECT * FROM admin_users WHERE username = "${sanitizeInput(username)}" AND password = "${hashedPassword}"`);
  console.log('[登录请求] 数据库查询结果数量:', result.length);
  
  if (result.length > 0 && result[0].values.length > 0) {
    console.log('[登录请求] 登录成功');
    const token = crypto.randomBytes(32).toString('hex');
    sessions[token] = { username, loginTime: Date.now() };
    
    res.json({
      success: true,
      token,
      username
    });
  } else {
    console.log('[登录请求] 登录失败: 用户名或密码错误');
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

app.post('/api/admin/logout', requireAdminAuth, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  delete sessions[token];
  res.json({ success: true });
});

app.get('/api/admin/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token && sessions[token]) {
    res.json({ authenticated: true, username: sessions[token].username });
  } else {
    res.json({ authenticated: false });
  }
});

// API: 聊天
app.post('/api/chat', upload.single('file'), async (req, res) => {
  let { session_id, message, user_id, useAI, ai_model } = req.body;
  
  const file = req.file;
  let contentType = 'text';
  let filePath = null;
  
  if (file) {
    contentType = file.mimetype.startsWith('image') ? 'image' : 
                  file.mimetype.startsWith('video') ? 'video' : 'file';
    filePath = '/uploads/' + file.filename;
  }
  
  if (!message && !file) {
    return res.status(400).json({ error: '消息不能为空' });
  }
  
  message = message ? sanitizeInput(message) : '';

  let currentSessionId = session_id;
  
  if (!currentSessionId) {
    currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    db.run('INSERT INTO sessions (session_id, user_id) VALUES (?, ?)', [currentSessionId, sanitizeInput(user_id) || 'anonymous']);
  } else {
    db.run('UPDATE sessions SET updated_at = datetime("now") WHERE session_id = ?', [sanitizeInput(currentSessionId)]);
  }

  // 存储用户消息（加密存储）
  const encryptedUserMessage = message ? encrypt(message) : '';
  db.run('INSERT INTO messages (session_id, role, content, content_type, file_path) VALUES (?, ?, ?, ?, ?)', 
    [currentSessionId, 'user', encryptedUserMessage, contentType, filePath]);

  const intentResult = recognizeIntent(message);
  const intent = intentResult.intent;
  
  let reply;
  let shouldTransfer = false;
  let aiUsed = false;
  
  // 检查是否需要转人工
  const transferKeywords = ['转人工', '人工客服', '真人', '找人工'];
  if (transferKeywords.some(kw => message.includes(kw))) {
    shouldTransfer = true;
  }
  
  // 如果配置了 AI API Key，使用 AI 回答；否则使用演示模式
  const enableAI = useAI !== false && (aiConfig.apiKey || aiConfig.demoMode);
  
  if (enableAI && !shouldTransfer && message.length > 0) {
    try {
      // 获取历史消息
      const historyResult = db.exec(`
        SELECT role, content FROM messages 
        WHERE session_id = '${currentSessionId}'
        ORDER BY created_at ASC
        LIMIT 20
      `);
      
      let history = [];
      if (historyResult.length > 0 && historyResult[0].values) {
        history = historyResult[0].values.map(row => ({
          role: row[0],
          content: row[1]
        }));
      }
      
      // 检查是否配置了真实的 API Key
      if (aiConfig.apiKey) {
        // 构建 AI 消息
        const aiMessages = [
          { role: 'system', content: aiConfig.systemPrompt },
          ...history,
          { role: 'user', content: message }
        ];
        
        // 使用用户选定的 AI 模型，如果没有指定则使用配置中的默认模型
        const model = ai_model || aiConfig.model;
        reply = await callAI(aiMessages, model);
        aiUsed = true;
      } else {
        // 演示模式：使用模拟 AI 回复
        reply = getDemoAIResponse(message, history);
        aiUsed = true;
      }
      
      // 标记使用了 AI
      db.run('UPDATE sessions SET ai_used = 1 WHERE session_id = ?', [currentSessionId]);
      
    } catch (aiError) {
      console.error('AI 调用失败:', aiError.message);
      // AI 失败时回退到 FAQ
      if (intentResult.answer) {
        reply = intentResult.answer;
      } else {
        reply = getDefaultResponse();
      }
    }
  } else if (shouldTransfer) {
    reply = '好的，我正在为您转接人工客服，请稍候...\n\n🎧 您的人工客服小明为您服务。请问有什么可以帮助您的？\n\n如需结束对话，请输入"结束"';
  } else if (intentResult.answer) {
    reply = intentResult.answer;
  } else {
    // 检查连续未回答次数
    const recentResult = db.exec(`
      SELECT content FROM messages 
      WHERE session_id = '${currentSessionId}' AND role = 'assistant'
      ORDER BY created_at DESC LIMIT 3
    `);
    
    let defaultReplyCount = 0;
    if (recentResult.length > 0 && recentResult[0].values) {
      defaultReplyCount = recentResult[0].values.filter(v => 
        defaultResponses.includes(v[0])
    ).length;
    }
    
    if (defaultReplyCount >= 3) {
      shouldTransfer = true;
      reply = '抱歉，我多次未能准确回答您的问题。现在为您转接人工客服，请稍候...';
    } else {
      reply = getDefaultResponse();
    }
  }

  if (!session_id) {
    db.run('UPDATE sessions SET intent = ? WHERE session_id = ?', [intent, currentSessionId]);
  }

  // 存储客服回复（加密存储）
  const encryptedReply = reply ? encrypt(reply) : '';
  db.run('INSERT INTO messages (session_id, role, content, intent) VALUES (?, ?, ?, ?)', [
    currentSessionId, 'assistant', encryptedReply, intent
  ]);
  
  saveDb();

  res.json({
    session_id: currentSessionId,
    message: reply,
    intent: intent,
    should_transfer: shouldTransfer,
    file_path: filePath,
    ai_used: aiUsed
  });
});

// API: 获取会话列表
app.get('/api/sessions', requireAdminAuth, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  let whereClause = '';
  if (status) {
    whereClause = `WHERE status = "${sanitizeInput(status)}"`;
  }
  
  const totalResult = db.exec(`SELECT COUNT(*) as total FROM sessions ${whereClause}`);
  const total = totalResult.length > 0 ? totalResult[0].values[0][0] : 0;
  
  const sessionsResult = db.exec(`
    SELECT * FROM sessions 
    ${whereClause}
    ORDER BY updated_at DESC 
    LIMIT ${parseInt(limit)} OFFSET ${offset}
  `);
  
  let sessions = [];
  if (sessionsResult.length > 0 && sessionsResult[0].values) {
    const columns = sessionsResult[0].columns;
    sessions = sessionsResult[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });
  }
  
  res.json({
    sessions,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  });
});

app.get('/api/sessions/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const safeId = sanitizeInput(id);
  
  const sessionResult = db.exec(`SELECT * FROM sessions WHERE session_id = '${safeId}'`);
  if (sessionResult.length === 0 || sessionResult[0].values.length === 0) {
    return res.status(404).json({ error: '会话不存在' });
  }
  
  const columns = sessionResult[0].columns;
  const session = {};
  columns.forEach((col, i) => session[col] = sessionResult[0].values[0][i]);
  
  const messagesResult = db.exec(`
    SELECT * FROM messages 
    WHERE session_id = '${safeId}' 
    ORDER BY created_at ASC
  `);
  
  let messages = [];
  if (messagesResult.length > 0 && messagesResult[0].values) {
    const msgColumns = messagesResult[0].columns;
    messages = messagesResult[0].values.map(row => {
      const obj = {};
      msgColumns.forEach((col, i) => {
        // 解密消息内容
        if (col === 'content' && row[i]) {
          obj[col] = decrypt(row[i]);
        } else {
          obj[col] = row[i];
        }
      });
      return obj;
    });
  }
  
  const feedbackResult = db.exec(`SELECT * FROM feedback WHERE session_id = '${safeId}'`);
  let feedback = null;
  if (feedbackResult.length > 0 && feedbackResult[0].values.length > 0) {
    const fbColumns = feedbackResult[0].columns;
    feedback = {};
    fbColumns.forEach((col, i) => feedback[col] = feedbackResult[0].values[0][i]);
  }
  
  res.json({
    session,
    messages,
    feedback
  });
});

app.post('/api/sessions/:id/feedback', (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  
  if (!rating || !['satisfied', 'dissatisfied'].includes(rating)) {
    return res.status(400).json({ error: '评价无效' });
  }
  
  db.run('UPDATE sessions SET status = ? WHERE session_id = ?', ['completed', sanitizeInput(id)]);
  
  const existing = db.exec(`SELECT * FROM feedback WHERE session_id = '${sanitizeInput(id)}'`);
  if (existing.length > 0 && existing[0].values.length > 0) {
    db.run('UPDATE feedback SET rating = ? WHERE session_id = ?', [rating, sanitizeInput(id)]);
  } else {
    db.run('INSERT INTO feedback (session_id, rating) VALUES (?, ?)', [sanitizeInput(id), rating]);
  }
  
  saveDb();
  
  res.json({ success: true });
});

app.get('/api/stats', requireAdminAuth, (req, res) => {
  const totalResult = db.exec('SELECT COUNT(*) as count FROM sessions');
  const totalSessions = totalResult.length > 0 ? totalResult[0].values[0][0] : 0;
  
  const completedResult = db.exec("SELECT COUNT(*) as count FROM sessions WHERE status = 'completed'");
  const completedSessions = completedResult.length > 0 ? completedResult[0].values[0][0] : 0;
  
  const activeResult = db.exec("SELECT COUNT(*) as count FROM sessions WHERE status = 'active'");
  const activeSessions = activeResult.length > 0 ? activeResult[0].values[0][0] : 0;
  
  const aiUsedResult = db.exec("SELECT COUNT(*) as count FROM sessions WHERE ai_used = 1");
  const aiUsedSessions = aiUsedResult.length > 0 ? aiUsedResult[0].values[0][0] : 0;
  
  const feedbackResult = db.exec(`
    SELECT rating, COUNT(*) as count
    FROM feedback
    GROUP BY rating
  `);
  
  let satisfiedCount = 0;
  let dissatisfiedCount = 0;
  if (feedbackResult.length > 0 && feedbackResult[0].values) {
    feedbackResult[0].values.forEach(row => {
      if (row[0] === 'satisfied') satisfiedCount = row[1];
      if (row[0] === 'dissatisfied') dissatisfiedCount = row[1];
    });
  }
  
  const totalFeedback = satisfiedCount + dissatisfiedCount;
  
  const intentResult = db.exec(`
    SELECT intent, COUNT(*) as count
    FROM sessions
    WHERE intent IS NOT NULL
    GROUP BY intent
  `);
  
  let intentStats = [];
  if (intentResult.length > 0 && intentResult[0].values) {
    intentStats = intentResult[0].values.map(row => ({
      intent: row[0],
      count: row[1]
    }));
  }
  
  res.json({
    totalSessions,
    completedSessions,
    activeSessions,
    aiUsedSessions,
    satisfiedCount,
    dissatisfiedCount,
    satisfactionRate: totalFeedback > 0 ? Math.round((satisfiedCount / totalFeedback) * 100) : 0,
    totalFeedback,
    intentStats
  });
});

app.post('/api/admin/change-password', requireAdminAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '请输入旧密码和新密码' });
  }
  
  const oldHashed = hashPassword(oldPassword);
  const result = db.exec(`SELECT * FROM admin_users WHERE username = "${req.adminSession.username}" AND password = "${oldHashed}"`);
  
  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(401).json({ error: '旧密码错误' });
  }
  
  const newHashed = hashPassword(newPassword);
  db.run('UPDATE admin_users SET password = ? WHERE username = ?', [newHashed, req.adminSession.username]);
  saveDb();
  
  res.json({ success: true, message: '密码修改成功' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`智能客服服务已启动: http://localhost:${PORT}`);
    console.log(`管理后台: http://localhost:${PORT}/admin`);
    console.log(`默认管理员账号: admin / admin123`);
  });
}

start().catch(console.error);

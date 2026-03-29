# 智能客服 API 版本

这是一个纯 RESTful API 版本，供第三方应用集成使用。

## 特性

- ✅ 完整的 RESTful API 接口
- ✅ 支持 API Key 认证
- ✅ 支持 WebSocket 实时通信
- ✅ 统一的错误处理
- ✅ 请求限流保护
- ✅ 完整的 API 文档

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
PORT=3001
API_SECRET_KEY=your-secret-key-here
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

### 3. 启动服务

```bash
npm start
```

## API 文档

### 认证

所有 API 请求都需要在 Header 中包含 API Key：

```
Authorization: Bearer your-api-key
```

### 端点列表

#### 1. 发送消息

```http
POST /api/v1/chat
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "message": "用户消息",
  "session_id": "会话ID（可选）",
  "user_id": "用户ID（可选）",
  "use_ai": true,
  "ai_model": "gpt-3.5-turbo"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "session_id": "session_xxx",
    "message": "客服回复",
    "intent": "refund",
    "should_transfer": false,
    "ai_used": true
  }
}
```

#### 2. 获取会话历史

```http
GET /api/v1/sessions/:session_id
Authorization: Bearer {api_key}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": 1,
      "session_id": "session_xxx",
      "status": "active",
      "intent": "refund",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "messages": [
      {
        "role": "user",
        "content": "用户消息",
        "created_at": "2024-01-01T00:00:00Z"
      },
      {
        "role": "assistant",
        "content": "客服回复",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 3. 提交满意度评价

```http
POST /api/v1/sessions/:session_id/feedback
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "rating": "satisfied"  // satisfied | dissatisfied
}
```

#### 4. 上传文件

```http
POST /api/v1/upload
Authorization: Bearer {api_key}
Content-Type: multipart/form-data

file: [文件]
```

#### 5. 获取 AI 状态

```http
GET /api/v1/ai/status
Authorization: Bearer {api_key}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "ai_enabled": true,
    "provider": "openai",
    "provider_name": "OpenAI GPT",
    "is_demo_mode": false,
    "available_models": ["gpt-3.5-turbo", "gpt-4o", "gpt-4-turbo"]
  }
}
```

### WebSocket 实时通信

连接 WebSocket：

```javascript
const ws = new WebSocket('ws://localhost:3001/ws?api_key=your-api-key');

// 发送消息
ws.send(JSON.stringify({
  type: 'message',
  data: {
    message: '用户消息',
    session_id: 'session_xxx'
  }
}));

// 接收消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};

// 错误处理
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};

// 关闭连接
ws.onclose = () => {
  console.log('连接已关闭');
};
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权（API Key 无效） |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_KEY = 'your-api-key';
const API_URL = 'http://localhost:3001/api/v1';

// 发送消息
async function sendMessage(message) {
  const response = await axios.post(`${API_URL}/chat`, {
    message,
    use_ai: true
  }, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  return response.data;
}

// 使用
sendMessage('我想退款')
  .then(result => console.log(result.data.message))
  .catch(error => console.error(error));
```

### Python

```python
import requests

API_KEY = 'your-api-key'
API_URL = 'http://localhost:3001/api/v1'

def send_message(message):
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    data = {
        'message': message,
        'use_ai': True
    }
    
    response = requests.post(f'{API_URL}/chat', json=data, headers=headers)
    return response.json()

# 使用
result = send_message('我想退款')
print(result['data']['message'])
```

### cURL

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "我想退款",
    "use_ai": true
  }'
```

## 限流策略

- 默认：每分钟 100 次请求
- 可通过环境变量配置
- 超过限制返回 429 状态码

## 部署建议

1. **生产环境**
   - 使用 HTTPS
   - 配置反向代理（Nginx）
   - 启用缓存
   - 监控日志

2. **Docker 部署**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
docker build -t customer-service-api .
docker run -p 3001:3001 customer-service-api
```

## 技术支持

如有问题，请联系技术支持或查看完整文档。

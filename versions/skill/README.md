# 智能客服 Skill 版本

这是一个可被其他平台调用的 Skill 版本，支持多种协议和格式。

## 支持的平台

- ✅ **CodeBuddy** - 内置 Skill 调用
- ✅ **OpenAI GPTs** - GPT 插件
- ✅ **LangChain** - LangChain 工具
- ✅ **AutoGPT** - AutoGPT 插件
- ✅ **Botpress** - Botpress 模块
- ✅ **Dialogflow** - Dialogflow CX
- ✅ **Rasa** - Rasa Action
- ✅ **Microsoft Bot Framework** - 机器人技能
- ✅ **Slack** - Slack App
- ✅ **微信** - 微信小程序/公众号
- ✅ **钉钉** - 钉钉机器人

## 安装方式

### 1. CodeBuddy Skill

```bash
# 在 CodeBuddy 中直接使用
```

### 2. NPM 安装

```bash
npm install customer-service-skill
```

### 3. 直接导入

```javascript
import CustomerServiceSkill from 'customer-service-skill';
```

## 使用方式

### CodeBuddy Skill

在 CodeBuddy 项目中直接调用：

```javascript
// 在 CodeBuddy 项目中
const CustomerServiceSkill = require('customer-service-skill');

const skill = new CustomerServiceSkill({
  apiKey: 'your-api-key'
});

// 使用 Skill
const result = await skill.handleMessage('我想退款');
```

### OpenAI GPTs

创建 GPT 插件 manifest.json：

```json
{
  "schema_version": "v1",
  "name_for_human": "智能客服",
  "name_for_model": "customer_service",
  "description_for_human": "帮助用户解答客服相关问题",
  "description_for_model": "用于处理客户服务咨询的插件，包括退款、订单、技术支持等问题。",
  "auth": {
    "type": "user_http",
    "authorization_type": "bearer"
  },
  "api": {
    "type": "openapi",
    "url": "https://your-domain.com/openapi.yaml"
  },
  "logo_url": "https://your-domain.com/logo.png",
  "contact_email": "support@example.com",
  "legal_info_url": "https://your-domain.com/legal"
}
```

### LangChain

```javascript
import { Tool } from 'langchain/tools';
import axios from 'axios';

class CustomerServiceTool extends Tool {
  name = 'customer_service';
  description = '用于处理客户服务咨询的 AI 助手，可以回答退款、订单、技术支持等问题。';

  async _call(query) {
    try {
      const response = await axios.post('https://api.example.com/v1/chat', {
        message: query,
        use_ai: true
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.CUSTOMER_SERVICE_API_KEY}`
        }
      });

      return response.data.data.message;
    } catch (error) {
      return `错误: ${error.message}`;
    }
  }
}

// 使用
const tool = new CustomerServiceTool();
const result = await tool.call('我想退款');
```

### AutoGPT

创建 AutoGPT 插件：

```python
class CustomerServicePlugin:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.example.com/v1"
    
    def handle_query(self, message):
        """处理客服查询"""
        headers = {"Authorization": f"Bearer {self.api_key}"}
        data = {"message": message, "use_ai": True}
        
        response = requests.post(
            f"{self.base_url}/chat",
            json=data,
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()["data"]["message"]
        else:
            return f"Error: {response.json()['error']}"

# 在 AutoGPT 中使用
plugin = CustomerServicePlugin(api_key="your-api-key")
result = plugin.handle_query("我想退款")
```

### Rasa Action

```python
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests

class ActionCustomerService(Action):
    def name(self) -> Text:
        return "action_customer_service"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        message = tracker.latest_message.get("text")
        
        response = requests.post(
            "https://api.example.com/v1/chat",
            json={
                "message": message,
                "use_ai": True
            },
            headers={
                "Authorization": f"Bearer YOUR_API_KEY"
            }
        )
        
        if response.status_code == 200:
            reply = response.json()["data"]["message"]
            dispatcher.utter_message(text=reply)
        
        return []
```

### Microsoft Bot Framework

```csharp
using Microsoft.Bot.Builder;
using Microsoft.Bot.Schema;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

public class CustomerServiceSkill
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl = "https://api.example.com/v1";

    public CustomerServiceSkill(HttpClient httpClient, string apiKey)
    {
        _httpClient = httpClient;
        _apiKey = apiKey;
    }

    public async Task<string> HandleMessageAsync(string message)
    {
        var request = new
        {
            message = message,
            use_ai = true
        };

        var content = new StringContent(
            JsonConvert.SerializeObject(request),
            Encoding.UTF8,
            "application/json"
        );

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add(
            "Authorization",
            $"Bearer {_apiKey}"
        );

        var response = await _httpClient.PostAsync(
            $"{_baseUrl}/chat",
            content
        );

        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<dynamic>(responseContent);
        
        return result.data.message.ToString();
    }
}

// 在 Bot 中使用
public async Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken)
{
    var skill = new CustomerServiceSkill(_httpClient, _apiKey);
    var reply = await skill.HandleMessageAsync(turnContext.Activity.Text);
    
    await turnContext.SendActivityAsync(MessageFactory.Text(reply), cancellationToken);
}
```

### 钉钉机器人

```javascript
const axios = require('axios');

// 钉钉机器人 Webhook
async function handleDingTalkMessage(message, webhookUrl, apiKey) {
  try {
    // 调用客服 API
    const csResponse = await axios.post('https://api.example.com/v1/chat', {
      message: message,
      use_ai: true
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // 回复钉钉
    await axios.post(webhookUrl, {
      msgtype: 'text',
      text: {
        content: csResponse.data.data.message
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// 使用
handleDingTalkMessage(
  '我想退款',
  'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN',
  'your-api-key'
);
```

### 微信公众号

```python
from flask import Flask, request, jsonify
import requests
import hashlib
import xml.etree.ElementTree as ET

app = Flask(__name__)

@app.route('/wechat', methods=['GET', 'POST'])
def wechat():
    # 验证微信服务器
    if request.method == 'GET':
        token = 'your_token'
        data = request.args
        signature = data.get('signature')
        timestamp = data.get('timestamp')
        nonce = data.get('nonce')
        echostr = data.get('echostr')
        
        s = [timestamp, nonce, token]
        s.sort()
        s = ''.join(s)
        s = hashlib.sha1(s.encode()).hexdigest()
        
        if s == signature:
            return echostr
        else:
            return ''
    
    # 处理消息
    if request.method == 'POST':
        xml_data = request.data
        xml_tree = ET.fromstring(xml_data)
        
        from_user = xml_tree.find('FromUserName').text
        to_user = xml_tree.find('ToUserName').text
        msg_type = xml_tree.find('MsgType').text
        content = xml_tree.find('Content').text if msg_type == 'text' else ''
        
        # 调用客服 API
        response = requests.post(
            'https://api.example.com/v1/chat',
            json={
                'message': content,
                'use_ai': True
            },
            headers={
                'Authorization': 'Bearer YOUR_API_KEY'
            }
        )
        
        reply = response.json()['data']['message']
        
        # 构造回复
        reply_xml = f'''
        <xml>
        <ToUserName><![CDATA[{from_user}]]></ToUserName>
        <FromUserName><![CDATA[{to_user}]]></FromUserName>
        <CreateTime>{int(time.time())}</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[{reply}]]></Content>
        </xml>
        '''
        
        return reply_xml

if __name__ == '__main__':
    app.run(port=5000)
```

## Skill 配置

### 基础配置

```javascript
const skill = new CustomerServiceSkill({
  // API 配置
  apiKey: 'your-api-key',
  apiEndpoint: 'https://api.example.com/v1',
  
  // AI 配置
  aiProvider: 'openai',
  aiModel: 'gpt-3.5-turbo',
  
  // 功能配置
  enableIntentRecognition: true,
  enableFAQ: true,
  enableFileUpload: false,
  
  // 缓存配置
  enableCache: true,
  cacheDuration: 3600000,
  
  // 日志配置
  enableLogging: true,
  logLevel: 'info'
});
```

### 高级配置

```javascript
const skill = new CustomerServiceSkill({
  // 自定义意图识别
  customIntents: [
    {
      name: 'refund',
      keywords: ['退款', '退货', '钱'],
      priority: 1
    },
    {
      name: 'order',
      keywords: ['订单', '物流'],
      priority: 2
    }
  ],
  
  // 自定义 FAQ
  customFAQ: {
    '如何退款': '您可以在订单详情页面申请退款...',
    '物流查询': '在订单详情查看物流信息...'
  },
  
  // 自定义处理逻辑
  beforeProcess: async (message) => {
    console.log('处理前:', message);
    return message;
  },
  
  afterProcess: async (message, result) => {
    console.log('处理后:', result);
    return result;
  },
  
  // 错误处理
  onError: (error) => {
    console.error('Skill 错误:', error);
  }
});
```

## API 方法

### 基础方法

```javascript
// 处理消息
const result = await skill.handleMessage('我想退款');

// 识别意图
const intent = await skill.recognizeIntent('我要退款');

// 查询 FAQ
const answer = await skill.queryFAQ('如何退款？');

// 转人工
const result = await skill.transferToHuman({
  sessionId: 'session_123',
  userId: 'user_456'
});
```

### 批量处理

```javascript
// 批量处理消息
const messages = ['我想退款', '订单在哪里', '怎么登录'];
const results = await skill.handleBatch(messages);

// 批量识别意图
const intents = await skill.recognizeBatchIntents(messages);
```

### 流式处理

```javascript
// 流式处理消息
const stream = await skill.handleStream('我想退款');

for await (const chunk of stream) {
  console.log(chunk);
}
```

## 事件监听

```javascript
// 监听事件
skill.on('message', (data) => {
  console.log('收到消息:', data);
});

skill.on('intent', (data) => {
  console.log('识别到意图:', data);
});

skill.on('error', (error) => {
  console.error('发生错误:', error);
});

skill.on('transfer', (data) => {
  console.log('转接人工:', data);
});
```

## 测试

### 单元测试

```javascript
const { expect } = require('chai');

describe('CustomerServiceSkill', () => {
  let skill;
  
  beforeEach(() => {
    skill = new CustomerServiceSkill({
      apiKey: 'test-key',
      apiEndpoint: 'https://test.api.com/v1'
    });
  });
  
  it('should handle message', async () => {
    const result = await skill.handleMessage('我想退款');
    expect(result).to.have.property('message');
  });
  
  it('should recognize intent', async () => {
    const intent = await skill.recognizeIntent('我要退款');
    expect(intent).to.have.property('name');
  });
});
```

## 部署

### Serverless

```javascript
// AWS Lambda
exports.handler = async (event) => {
  const skill = new CustomerServiceSkill({
    apiKey: process.env.API_KEY
  });
  
  const message = JSON.parse(event.body).message;
  const result = await skill.handleMessage(message);
  
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

ENV API_KEY=your-api-key
ENV API_ENDPOINT=https://api.example.com/v1

EXPOSE 3000

CMD ["npm", "start"]
```

## 技术支持

如有问题，请联系技术支持或查看完整文档。

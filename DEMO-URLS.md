# 智能客服多版本演示地址

## 🎉 欢迎使用智能客服多版本演示系统

所有服务已启动并运行正常！您可以通过以下地址访问各个版本。

---

## 🌟 主要入口

### 📱 演示页面（推荐从这里开始）
```
http://localhost:3000/demo.html
```

> **提示**：这是所有版本的统一演示入口，包含所有功能的交互式演示。

---

## 📦 各版本详细地址

### 1️⃣ Web 版（标准版）

#### 客服界面
```
http://localhost:3000
```

**功能**：
- ✅ 完整的客服对话界面
- ✅ 文件上传（图片、视频）
- ✅ 语音输入
- ✅ 表情面板
- ✅ 截屏功能
- ✅ AI 模型选择
- ✅ 对话历史记录

#### 管理后台
```
http://localhost:3000/admin
```

**默认账号**：
- 用户名：`admin`
- 密码：`admin123`

**功能**：
- 📊 对话记录查看
- 📈 满意度统计
- 🔧 AI 配置管理
- 👤 管理员设置

---

### 2️⃣ API 版（RESTful API）

#### 健康检查
```
http://localhost:3001/health
```

#### API 端点

**生成 API Key**
```bash
curl -X POST http://localhost:3001/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo_user"}'
```

**发送消息**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "我想退款", "use_ai": true}'
```

**获取会话历史**
```bash
curl http://localhost:3001/api/v1/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**API 文档**
```
http://localhost:3001/health
```

---

### 3️⃣ Agent 版（企业级服务）

#### 健康检查
```
http://localhost:3002/health
```

#### Agent 端点

**处理请求**
```bash
curl -X POST http://localhost:3002/api/agent/handle \
  -H "Content-Type: application/json" \
  -d '{"message": "我想退款", "sessionId": "session_123"}'
```

**执行工作流**
```bash
curl -X POST http://localhost:3002/api/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{"workflowName": "customer-service", "context": {"message": "我想退款"}}'
```

**Agent 列表**
```bash
curl http://localhost:3002/api/agents
```

**监控指标**
```bash
curl http://localhost:3002/api/metrics
```

---

### 4️⃣ Widget 版（网站嵌入）

Widget 版不需要独立的服务器，直接在您的网站中引入：

```html
<!-- 引入 Widget -->
<script src="http://localhost:3000/widget.js"></script>

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

**演示页面**：http://localhost:3000/demo.html

---

### 5️⃣ Skill 版（平台集成）

Skill 版提供多种平台的集成示例：

#### 支持的平台
- ✅ CodeBuddy
- ✅ LangChain
- ✅ Rasa
- ✅ OpenAI GPTs
- ✅ AutoGPT
- ✅ Botpress
- ✅ Microsoft Bot Framework
- ✅ 钉钉机器人
- ✅ 微信公众号
- ✅ Slack

**详细文档**：`versions/skill/README.md`

---

## 🚀 快速开始

### 方式 1：使用演示页面（推荐）

1. 打开浏览器访问：
   ```
   http://localhost:3000/demo.html
   ```

2. 在演示页面中：
   - 点击各个版本卡片查看详情
   - 使用 API 测试工具
   - 查看 Widget 集成代码
   - 了解 Skill 集成示例

### 方式 2：直接访问各版本

1. **体验客服对话**：http://localhost:3000
2. **查看管理后台**：http://localhost:3000/admin
3. **测试 API 接口**：http://localhost:3001/health
4. **查看 Agent 状态**：http://localhost:3002/health

### 方式 3：使用命令行

```bash
# 停止现有服务
cd /Users/zzx/CodeBuddy/Claw
./stop-demo.sh

# 启动所有服务
./start-demo.sh

# 然后打开浏览器访问演示页面
open http://localhost:3000/demo.html
```

---

## 📚 详细文档

### 版本文档
- **总览**：`versions/README.md`
- **Web 版**：`SPEC.md`
- **API 版**：`versions/api/README.md`
- **Widget 版**：`versions/widget/README.md`
- **Agent 版**：`versions/agent/README.md`
- **Skill 版**：`versions/skill/README.md`

### 部署文档
- **完整部署指南**：`DEPLOYMENT.md`

---

## 🔧 服务管理

### 启动所有服务
```bash
cd /Users/zzx/CodeBuddy/Claw
./start-demo.sh
```

### 停止所有服务
```bash
cd /Users/zzx/CodeBuddy/Claw
./stop-demo.sh
```

### 查看服务状态
```bash
# 检查端口占用
lsof -i :3000
lsof -i :3001
lsof -i :3002

# 查看日志
tail -f /tmp/web-server.log
tail -f /tmp/api-server.log
tail -f /tmp/agent-server.log
```

---

## 🎯 使用场景建议

### 场景 1：快速体验
👉 直接访问：http://localhost:3000/demo.html

### 场景 2：集成到现有网站
👉 使用 Widget 版，参考 `versions/widget/README.md`

### 场景 3：第三方应用集成
👉 使用 API 版，参考 `versions/api/README.md`

### 场景 4：企业级部署
👉 使用 Agent 版，参考 `versions/agent/README.md`

### 场景 5：平台集成
👉 使用 Skill 版，参考 `versions/skill/README.md`

---

## 🐛 故障排除

### Web 版无法访问
```bash
# 检查服务状态
lsof -i :3000

# 查看日志
tail -f /tmp/web-server.log

# 重启服务
cd /Users/zzx/CodeBuddy/Claw
npm start
```

### API 版无法访问
```bash
# 检查服务状态
lsof -i :3001

# 查看日志
tail -f /tmp/api-server.log

# 重启服务
cd /Users/zzx/CodeBuddy/Claw/versions/api
npm start
```

### Agent 版无法访问
```bash
# 检查服务状态
lsof -i :3002

# 查看日志
tail -f /tmp/agent-server.log

# 重启服务
cd /Users/zzx/CodeBuddy/Claw/versions/agent
npm start
```

---

## 📞 获取帮助

1. **查看文档**：各版本目录下的 `README.md`
2. **检查日志**：`/tmp/*-server.log`
3. **查看错误信息**：浏览器开发者工具 Console

---

## 🎊 开始体验

现在就打开浏览器，访问演示页面吧！

```
http://localhost:3000/demo.html
```

---

**祝您使用愉快！** 🚀

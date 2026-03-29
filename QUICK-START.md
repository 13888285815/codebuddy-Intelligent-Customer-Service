# 🚀 智能客服 - 快速参考卡片

## 📍 所有演示地址

### 🌟 统一入口（推荐）
```
http://localhost:3000/demo.html
```
> 所有版本的交互式演示都在这里！

---

## 📦 各版本地址速查

| 版本 | 功能 | 地址 |
|------|------|------|
| **Web 客服** | 完整客服界面 | http://localhost:3000 |
| **Web 后台** | 管理控制台 | http://localhost:3000/admin |
| **API 服务** | RESTful API | http://localhost:3001/health |
| **Agent 服务** | 企业级 Agent | http://localhost:3002/health |
| **演示页面** | 统一演示入口 | http://localhost:3000/demo.html |

---

## 🔑 默认凭证

### Web 管理后台
- 用户名：`admin`
- 密码：`admin123`

### API Key
- 需要在演示页面中生成
- 或通过 API 调用生成

---

## 🎯 一键操作

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

### 打开演示页面
```bash
open http://localhost:3000/demo.html
```

---

## 📚 文档导航

| 文档 | 用途 | 路径 |
|------|------|------|
| **演示地址** | 所有版本的访问地址 | `DEMO-URLS.md` |
| **版本总览** | 各版本介绍和选择指南 | `versions/README.md` |
| **部署指南** | 完整的部署文档 | `DEPLOYMENT.md` |
| **功能规格** | Web 版功能说明 | `SPEC.md` |

---

## 💡 快速开始

### 新手入门
1. ✅ 打开 http://localhost:3000/demo.html
2. ✅ 点击各个版本卡片查看功能
3. ✅ 在 Web 客服界面体验对话
4. ✅ 在管理后台查看数据

### 开发者入门
1. ✅ 访问 http://localhost:3000/demo.html
2. ✅ 在 API 演示区域生成 API Key
3. ✅ 测试 API 接口
4. ✅ 查看各版本的集成代码

### 集成者入门
1. ✅ 选择合适的版本（参考演示页面）
2. ✅ 查看对应版本的 README.md
3. ✅ 按照文档进行集成
4. ✅ 部署到生产环境

---

## 🔧 常用命令

```bash
# 检查服务状态
lsof -i :3000  # Web 版
lsof -i :3001  # API 版
lsof -i :3002  # Agent 版

# 查看日志
tail -f /tmp/web-server.log
tail -f /tmp/api-server.log
tail -f /tmp/agent-server.log

# 重启单个服务
cd /Users/zzx/CodeBuddy/Claw && npm start                    # Web
cd /Users/zzx/CodeBuddy/Claw/versions/api && npm start    # API
cd /Users/zzx/CodeBuddy/Claw/versions/agent && npm start  # Agent
```

---

## 📞 获取帮助

遇到问题？
1. 查看 `DEMO-URLS.md` - 详细的使用说明
2. 查看 `versions/README.md` - 版本选择指南
3. 查看 `DEPLOYMENT.md` - 部署指南
4. 检查日志文件：`/tmp/*-server.log`

---

**现在就开始体验吧！** 🎉

```
http://localhost:3000/demo.html
```

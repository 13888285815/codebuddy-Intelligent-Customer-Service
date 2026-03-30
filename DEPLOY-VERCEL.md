# 🚀 智能客服系统 - 快速部署到 Vercel

## 📋 部署步骤（3步完成）

### 第1步：访问 Vercel
打开浏览器访问：https://vercel.com
- 使用 GitHub 账号登录

### 第2步：导入项目
1. 点击 **"Add New Project"**
2. 点击 **"Import Git Repository"**
3. 搜索并选择：`13888285815/codebuddy-Intelligent-Customer-Service`
4. 点击 **"Import"**

### 第3步：配置并部署
```
Project Name: codebuddy-customer-service（或其他名称）
Framework Preset: Other
Root Directory: ./
Build Command: (留空)
Output Directory: ./
Install Command: npm install
```
点击 **"Deploy"** 按钮，等待 2-3 分钟即可完成！

---

## 🎉 部署完成后的访问地址

假设项目名称为 `codebuddy-customer-service`，部署后的地址为：

### 🌐 共享访问地址（公网可访问）
- **客服界面**: `https://codebuddy-customer-service.vercel.app`
- **管理后台**: `https://codebuddy-customer-service.vercel.app/admin`
- **演示页面**: `https://codebuddy-customer-service.vercel.app/demo.html`
- **Widget演示**: `https://codebuddy-customer-service.vercel.app/widget-demo.html`

### 🏠 本地访问地址
- **客服界面**: `http://localhost:3000`
- **管理后台**: `http://localhost:3000/admin`
- **演示页面**: `http://localhost:3000/demo.html`

**管理后台默认账号**：
- 用户名：`admin`
- 密码：`admin123`

---

## 📝 注意事项

### ⚠️ Vercel 部署限制
由于 Vercel 是无服务器环境，以下功能在 Vercel 部署后可能受限：
1. **数据库**: SQLite 数据库无法持久化存储
2. **文件上传**: 本地上传功能需要配置对象存储
3. **AI 功能**: 如需真实 AI，需配置环境变量

### ✅ Vercel 部署后可用的功能
- 客服对话界面（演示模式）
- 管理后台界面
- 前端交互功能
- 所有 UI 效果（包括玻璃态效果）

---

## 🔧 自定义域名（可选）

如果需要自定义域名：
1. 在 Vercel Dashboard 进入项目设置
2. 点击 **Settings** → **Domains**
3. 添加您的域名并按提示配置 DNS

---

## 📊 部署验证

部署完成后，可以通过以下方式验证：

```bash
# 检查主页
curl https://codebuddy-customer-service.vercel.app

# 检查管理后台
curl https://codebuddy-customer-service.vercel.app/admin

# 检查演示页面
curl https://codebuddy-customer-service.vercel.app/demo.html
```

---

## 🎯 快速体验

部署完成后，直接访问以下地址即可体验：

### 📱 演示总览
```
https://codebuddy-customer-service.vercel.app/demo.html
```

这是所有功能的统一演示入口，推荐从这里开始体验！

---

## 📞 需要帮助？

- **Vercel 文档**: https://vercel.com/docs
- **项目 GitHub**: https://github.com/13888285815/codebuddy-Intelligent-Customer-Service
- **部署问题**: 查看 Vercel Dashboard 的 Deployments → Logs

---

**祝部署成功！** 🎊

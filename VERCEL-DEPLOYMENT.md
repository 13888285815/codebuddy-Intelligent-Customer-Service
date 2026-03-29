# Vercel 部署指南

## 方式一：通过 Vercel Dashboard 部署（推荐）

### 步骤：

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 登录您的账号（推荐使用GitHub登录）

2. **导入项目**
   - 点击 "Add New Project"
   - 选择 "Import Git Repository"
   - 搜索并选择：`13888285815/codebuddy-Intelligent-Customer-Service`
   - 点击 "Import"

3. **配置项目**
   ```
   Project Name: codebuddy-customer-service
   Framework Preset: Other
   Root Directory: ./
   Build Command: (留空)
   Output Directory: ./
   Install Command: npm install
   ```

4. **环境变量**（可选）
   如果需要配置AI服务，添加以下环境变量：
   ```
   ENCRYPTION_KEY: your-encryption-key
   OPENAI_API_KEY: your-api-key
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成（约2-3分钟）
   - Vercel会分配一个域名，例如：`https://codebuddy-customer-service.vercel.app`

6. **自定义域名**（可选）
   - 在 Project Settings → Domains 中添加自定义域名

---

## 方式二：使用 Vercel CLI 部署

### 前提条件：
- 需要安装 Vercel CLI（需要管理员权限）
- 需要 GitHub 访问权限

### 步骤：

1. **安装 Vercel CLI**
   ```bash
   sudo npm install -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```
   按照提示完成登录（推荐使用 GitHub）

3. **部署项目**
   ```bash
   cd /Users/zzx/CodeBuddy/Claw
   vercel
   ```
   
   系统会提示：
   ```
   ? Set up and deploy “~/codebuddy/Claw”? [Y/n] Y
   ? Which scope do you want to deploy to? Your Name
   ? Link to existing project? [y/N] N
   ? What's your project's name? codebuddy-customer-service
   ? In which directory is your code located? ./
   ? Want to override the settings? [y/N] N
   ```

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

---

## 部署后的配置

### 1. 数据库说明
- Vercel是无服务器环境，不适合直接使用SQLite数据库
- 需要迁移到外部数据库（如 PostgreSQL、MongoDB）
- 或使用 Vercel Postgres、Vercel KV 等

### 2. 文件上传
- 当前上传到本地 `uploads/` 目录
- Vercel部署需要使用对象存储（如 Vercel Blob、AWS S3）
- 或使用 Cloudinary、Vercel Blob 等服务

### 3. 持久化存储
- Vercel Functions 是无状态的
- 需要配置外部存储服务

---

## 推荐的数据库迁移方案

### 方案 A：Vercel Postgres
```javascript
// 安装依赖
npm install @vercel/postgres

// 使用示例
import { sql } from '@vercel/postgres';
const result = await sql`SELECT * FROM admin_users`;
```

### 方案 B：Supabase
```javascript
// 安装依赖
npm install @supabase/supabase-js

// 使用示例
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 方案 C：PlanetScale（MySQL）
```javascript
// 安装依赖
npm install @planetscale/database

// 使用示例
import { connect } from '@planetscale/database';
const conn = connect({ url: DATABASE_URL });
```

---

## 常见问题

### Q1: 部署后无法登录？
A: Vercel是无服务器环境，数据库会在函数重新部署时重置。需要配置外部数据库。

### Q2: 文件上传功能不可用？
A: 需要配置对象存储服务（Vercel Blob、Cloudinary等）。

### Q3: 如何自定义域名？
A: 在 Vercel Dashboard 的 Project Settings → Domains 中添加。

### Q4: 如何查看部署日志？
A: 在 Vercel Dashboard → Deployments → 点击最近的部署 → Functions Logs。

---

## 快速测试部署后功能

### 检查服务状态
```bash
# 检查主页
curl https://your-project.vercel.app

# 检查API健康状态
curl https://your-project.vercel.app/api/health

# 检查管理后台
curl https://your-project.vercel.app/admin
```

### 访问地址
- **客服界面**: https://your-project.vercel.app
- **管理后台**: https://your-project.vercel.app/admin
- **演示页面**: https://your-project.vercel.app/demo.html

---

## 持续集成

### 自动部署
- 推送到 GitHub main 分支会自动触发部署
- 可以在 Vercel Dashboard 中配置不同的部署分支

### 环境管理
- Preview: 每次提交都会创建预览环境
- Production: 生产环境，稳定版本

---

## 成本说明

- **Vercel 免费版**:
  - 每月 100GB 带宽
  - 每月 6000 分钟执行时间
  - 100GB 边缘网络存储
  - 适合个人项目和小型应用

- **Pro 版 ($20/月)**:
  - 1TB 带宽
  - 100,000 分钟执行时间
  - 无限函数
  - 适合商业项目

---

## 下一步

1. 访问 Vercel 并导入项目
2. 配置环境变量（如果需要）
3. 选择数据库解决方案
4. 测试部署后的应用
5. 配置自定义域名（可选）

---

**需要帮助？**
- Vercel 文档: https://vercel.com/docs
- Vercel 支持社区: https://vercel.com/help

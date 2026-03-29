# 管理员登录问题 - 解决方案

## 问题描述
无法使用用户名 `admin` 和密码 `admin123` 登录管理后台。

## 问题原因
数据库中的管理员密码哈希与当前服务器的哈希算法不匹配。可能的原因：
1. 数据库中的密码是在旧版本的服务器上创建的，使用了不同的哈希算法
2. 数据库迁移或升级过程中密码哈希发生了变化

## 解决方案

### ✅ 已完成
1. **创建密码重置脚本** (`reset-admin-password.js`)
   - 自动检测数据库中的管理员账户
   - 重置密码为 `admin123`
   - 使用当前的哈希算法加密密码
   - 保存到数据库并验证

2. **重启服务器**
   - 停止旧的服务器进程
   - 重新启动服务器以加载新的数据库
   - 服务器正常运行在 http://localhost:3000

3. **验证登录**
   - 测试 API 登录接口：✅ 成功
   - 获取认证 token：✅ 正常
   - 访问管理后台页面：✅ 正常

## 当前登录信息

```
用户名: admin
密码: admin123
管理后台: http://localhost:3000/admin
```

## 验证步骤

### 方法 1: 通过 Web 界面
1. 访问 http://localhost:3000/admin
2. 输入用户名：`admin`
3. 输入密码：`admin123`
4. 点击"登录"按钮

### 方法 2: 通过 API 测试
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

预期响应：
```json
{
  "success": true,
  "token": "your-token-here",
  "username": "admin"
}
```

### 方法 3: 使用测试页面
访问 http://localhost:3000/test-login.html 进行诊断和测试。

## 脚本说明

### reset-admin-password.js
用于重置管理员密码的独立脚本。

**使用方法：**
```bash
cd /Users/zzx/CodeBuddy/Claw
node reset-admin-password.js
```

**功能：**
- 检查数据库是否存在
- 查找现有的 admin 用户
- 重置密码为 `admin123`
- 保存并验证更改

## 相关文件

- `reset-admin-password.js` - 密码重置脚本
- `server.js` - 主服务器文件
- `customer_service.db` - SQLite 数据库
- `test-login.html` - 登录测试页面

## 防止未来问题

### 建议
1. **定期备份数据库**
   ```bash
   cp customer_service.db customer_service.db.backup
   ```

2. **密码修改后立即测试**
   - 修改密码后立即尝试登录
   - 确保新的密码可以正常使用

3. **使用密码重置脚本**
   - 如果忘记密码，运行 `reset-admin-password.js`
   - 或者通过管理后台修改密码

4. **保持服务器版本一致**
   - 避免频繁切换不同版本的服务器
   - 如需升级，先备份数据库

## 常见问题

### Q: 重置密码后仍然无法登录？
A: 请确保：
1. 服务器已重启（加载新的数据库）
2. 使用正确的用户名和密码（admin / admin123）
3. 浏览器没有缓存旧的登录状态
4. 网络连接正常

### Q: 如何修改管理员密码？
A: 登录管理后台后，进入"设置"页面，点击"修改密码"按钮。

### Q: 可以有多个管理员账户吗？
A: 可以。登录管理后台后，可以创建新的管理员账户。

### Q: 如何完全重置数据库？
A: 删除 `customer_service.db` 文件，然后重启服务器。服务器会自动创建新的数据库。

```bash
rm customer_service.db
# 重启服务器
npm start
```

## 技术细节

### 密码哈希算法
当前使用的哈希算法：
```javascript
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
```

### 数据库表结构
```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 登录流程
1. 用户提交用户名和密码
2. 服务器使用 SHA-256 哈希密码
3. 在数据库中查找匹配的记录
4. 如果匹配，生成 token 并返回
5. 将 token 存储在内存会话中

---

**最后更新**: 2026-03-29 15:30
**状态**: ✅ 已解决

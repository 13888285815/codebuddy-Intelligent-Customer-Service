/**
 * 重置管理员密码脚本
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'customer_service.db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function resetAdminPassword() {
  console.log('正在重置管理员密码...\n');
  
  // 读取现有数据库
  const SQL = await initSqlJs();
  let db;
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('✓ 已加载现有数据库');
  } else {
    console.log('✗ 数据库文件不存在！');
    return;
  }
  
  // 检查现有的 admin 用户
  const adminExists = db.exec('SELECT * FROM admin_users WHERE username = "admin"');
  
  if (adminExists.length > 0 && adminExists[0].values.length > 0) {
    const existingAdmin = adminExists[0].values[0];
    console.log('找到现有的 admin 用户：');
    console.log('  ID:', existingAdmin[0]);
    console.log('  用户名:', existingAdmin[1]);
    console.log('  密码哈希:', existingAdmin[2].substring(0, 20) + '...');
    console.log('  创建时间:', existingAdmin[3]);
    console.log('');
    
    // 更新密码
    const newHash = hashPassword('admin123');
    db.exec(`UPDATE admin_users SET password = "${newHash}" WHERE username = "admin"`);
    console.log('✓ 已更新 admin 密码');
  } else {
    // 创建新的 admin 用户
    const newHash = hashPassword('admin123');
    db.exec(`INSERT INTO admin_users (username, password) VALUES ("admin", "${newHash}")`);
    console.log('✓ 已创建新的 admin 用户');
  }
  
  // 保存数据库
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  console.log('✓ 数据库已保存');
  
  // 验证
  const verifyHash = hashPassword('admin123');
  const result = db.exec(`SELECT * FROM admin_users WHERE username = "admin" AND password = "${verifyHash}"`);
  
  if (result.length > 0 && result[0].values.length > 0) {
    console.log('\n✅ 密码重置成功！');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('\n现在可以使用这些凭据登录管理后台了。');
  } else {
    console.log('\n✗ 密码验证失败！');
  }
  
  // 列出所有管理员账户
  console.log('\n所有管理员账户：');
  const allAdmins = db.exec('SELECT id, username, created_at FROM admin_users');
  if (allAdmins.length > 0) {
    allAdmins[0].values.forEach(row => {
      console.log(`  - ID: ${row[0]}, 用户名: ${row[1]}, 创建时间: ${row[2]}`);
    });
  } else {
    console.log('  (无管理员账户)');
  }
}

resetAdminPassword().catch(error => {
  console.error('错误:', error);
  process.exit(1);
});

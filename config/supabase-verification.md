# Supabase 设置验证清单

完成 Supabase 设置后，请使用此清单验证所有配置是否正确。

## ✅ 验证步骤

### 1. 项目创建验证

- [ ] Supabase 账号已注册
- [ ] 新项目已创建并初始化完成
- [ ] 可以访问项目仪表板

### 2. API 密钥验证

- [ ] 已获取 Project URL（格式：`https://xxxxxxxxxxxxx.supabase.co`）
- [ ] 已获取 anon public key（以 `eyJ` 开头的长字符串）
- [ ] 已将密钥保存到安全位置

### 3. 环境变量验证

- [ ] 已复制 `.env.example` 为 `.env`
- [ ] 已在 `.env` 文件中填入真实的 Project URL
- [ ] 已在 `.env` 文件中填入真实的 anon public key
- [ ] 确认 `.env` 文件在 `.gitignore` 中（不会被提交到 Git）

### 4. 数据库表验证

在 Supabase 项目中验证：

- [ ] 打开 SQL Editor
- [ ] 执行了 `supabase-setup.sql` 脚本
- [ ] 看到 "custom_tools 表创建成功！" 消息
- [ ] 在 Table Editor 中可以看到 `custom_tools` 表

### 5. 表结构验证

在 Table Editor > custom_tools 中确认以下列存在：

- [ ] `id` (uuid, primary key)
- [ ] `user_id` (uuid, foreign key to auth.users)
- [ ] `tool_name` (text)
- [ ] `tool_url` (text)
- [ ] `tool_desc` (text)
- [ ] `category` (text)
- [ ] `is_free` (boolean)
- [ ] `is_chinese` (boolean)
- [ ] `created_at` (timestamp with time zone)
- [ ] `updated_at` (timestamp with time zone)

### 6. 索引验证

在 SQL Editor 中运行以下查询验证索引：

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'custom_tools';
```

应该看到：
- [ ] `custom_tools_pkey` (主键索引)
- [ ] `idx_custom_tools_user_id` (user_id 索引)
- [ ] `idx_custom_tools_category` (category 索引)

### 7. RLS 启用验证

在 SQL Editor 中运行：

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'custom_tools';
```

- [ ] `rowsecurity` 列的值为 `true`

### 8. RLS 策略验证

在 Authentication > Policies 中确认：

- [ ] `custom_tools` 表显示在列表中
- [ ] 有 4 个策略（SELECT, INSERT, UPDATE, DELETE）
- [ ] 每个策略都显示为启用状态

或在 SQL Editor 中运行：

```sql
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'custom_tools';
```

应该看到 4 个策略：
- [ ] `Users can view own tools` (SELECT)
- [ ] `Users can insert own tools` (INSERT)
- [ ] `Users can update own tools` (UPDATE)
- [ ] `Users can delete own tools` (DELETE)

### 9. 触发器验证

在 SQL Editor 中运行：

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'custom_tools';
```

- [ ] 看到 `update_custom_tools_updated_at` 触发器

### 10. 认证设置验证（可选）

在 Authentication > Settings 中确认：

- [ ] Email Auth 已启用
- [ ] Site URL 已配置（本地开发 URL）
- [ ] Redirect URLs 已配置

## 🧪 功能测试（可选）

如果想要测试数据库是否正常工作，可以在 SQL Editor 中运行：

```sql
-- 测试插入（需要先创建一个测试用户）
-- 注意：这只是测试，实际使用时会通过应用程序插入数据

-- 查看是否可以查询表
SELECT * FROM custom_tools;

-- 应该返回空结果（因为还没有数据）
```

## ❌ 常见问题

### 问题 1：SQL 脚本执行失败

**解决方案：**
- 确保在正确的项目中执行
- 检查是否有语法错误
- 尝试逐个执行 SQL 语句
- 查看错误消息并根据提示修复

### 问题 2：找不到 API 密钥

**解决方案：**
- 确保在 Settings > API 页面
- 刷新页面重试
- 确认项目已完全初始化

### 问题 3：RLS 策略未显示

**解决方案：**
- 在 SQL Editor 中运行策略查询验证
- 重新执行 SQL 脚本
- 检查是否有错误消息

### 问题 4：.env 文件不生效

**解决方案：**
- 确认文件名是 `.env` 而不是 `.env.txt`
- 确认文件在项目根目录
- 重启开发服务器（如果使用）

## ✨ 完成

如果所有验证项都已勾选，恭喜你！Supabase 设置已完成。

你现在可以继续执行下一个任务：**任务 3 - 集成 Supabase SDK**

## 📚 参考资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL 策略文档](https://www.postgresql.org/docs/current/sql-createpolicy.html)

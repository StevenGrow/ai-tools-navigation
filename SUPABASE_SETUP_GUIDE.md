# Supabase 项目设置指南

本指南将帮助你完成 Supabase 项目的设置，包括创建项目、获取密钥和配置数据库。

## 步骤 1: 注册 Supabase 账号并创建项目

1. 访问 [Supabase 官网](https://supabase.com)
2. 点击 "Start your project" 或 "Sign Up" 注册账号
3. 使用 GitHub、Google 或邮箱注册
4. 登录后，点击 "New Project" 创建新项目
5. 填写项目信息：
   - **Name**: `ai-tools-navigator` (或你喜欢的名称)
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择离你最近的区域（建议选择 Singapore 或 Tokyo）
   - **Pricing Plan**: 选择 Free 计划即可
6. 点击 "Create new project"，等待项目创建完成（约 2 分钟）

## 步骤 2: 获取项目 URL 和 API 密钥

1. 项目创建完成后，进入项目仪表板
2. 点击左侧菜单的 **Settings** (齿轮图标)
3. 点击 **API** 选项
4. 你会看到以下信息：
   - **Project URL**: 类似 `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: 这是你的公开 API 密钥（用于前端）
   - **service_role**: 这是服务端密钥（不要在前端使用）

5. 复制以下信息：
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

6. 更新项目根目录的 `.env.example` 文件：
   ```bash
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 步骤 3: 创建 custom_tools 数据表

1. 在 Supabase 项目仪表板，点击左侧菜单的 **SQL Editor**
2. 点击 "New query" 创建新查询
3. 打开项目根目录的 `supabase-setup.sql` 文件
4. 复制整个 SQL 脚本内容
5. 粘贴到 Supabase SQL Editor 中
6. 点击 "Run" 按钮执行脚本
7. 如果成功，你会看到 "custom_tools 表创建成功！" 的消息

## 步骤 4: 验证 RLS 策略配置

1. 点击左侧菜单的 **Authentication** > **Policies**
2. 你应该看到 `custom_tools` 表
3. 展开后应该看到 4 个策略：
   - ✅ Users can view own tools (SELECT)
   - ✅ Users can insert own tools (INSERT)
   - ✅ Users can update own tools (UPDATE)
   - ✅ Users can delete own tools (DELETE)

## 步骤 5: 测试数据库连接（可选）

1. 点击左侧菜单的 **Table Editor**
2. 选择 `custom_tools` 表
3. 你应该看到一个空表，包含以下列：
   - id (uuid)
   - user_id (uuid)
   - tool_name (text)
   - tool_url (text)
   - tool_desc (text)
   - category (text)
   - is_free (boolean)
   - is_chinese (boolean)
   - created_at (timestamp)
   - updated_at (timestamp)

## 步骤 6: 配置认证设置（可选但推荐）

1. 点击左侧菜单的 **Authentication** > **Settings**
2. 在 **Email Auth** 部分：
   - 确保 "Enable email signup" 已启用
   - 可以禁用 "Enable email confirmations" 以便测试（生产环境建议启用）
3. 在 **Site URL** 部分：
   - 添加你的本地开发 URL: `http://localhost:5173` 或 `http://127.0.0.1:5173`
   - 添加你的生产 URL（部署后）
4. 在 **Redirect URLs** 部分：
   - 添加允许的重定向 URL（与 Site URL 相同）

## 完成检查清单

- [ ] Supabase 账号已注册
- [ ] 新项目已创建
- [ ] 已获取 Project URL
- [ ] 已获取 anon public API key
- [ ] 已更新 .env.example 文件
- [ ] custom_tools 表已创建
- [ ] 索引已创建
- [ ] RLS 已启用
- [ ] 4 个 RLS 策略已配置
- [ ] 更新时间戳触发器已创建
- [ ] 已在 Table Editor 中验证表结构

## 下一步

完成以上步骤后，你可以继续执行任务 3：集成 Supabase SDK。

## 故障排除

### 问题：SQL 脚本执行失败
- 确保你在正确的项目中
- 检查是否有语法错误
- 尝试逐个执行 SQL 语句

### 问题：找不到 API 密钥
- 确保在 Settings > API 页面
- 刷新页面重试

### 问题：RLS 策略未显示
- 在 SQL Editor 中运行：`SELECT * FROM pg_policies WHERE tablename = 'custom_tools';`
- 检查策略是否已创建

## 参考资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)

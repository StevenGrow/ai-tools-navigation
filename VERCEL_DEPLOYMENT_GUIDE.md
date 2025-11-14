# Vercel 部署指南

本指南将帮助您将 AI 工具导航网站部署到 Vercel 平台。

## 前提条件

1. 已完成本地开发和测试
2. 代码已推送到 GitHub 仓库
3. 已设置好 Supabase 项目并获取了 API 密钥

## 步骤 1: 准备 GitHub 仓库

### 1.1 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `ai-tools-navigation` (或您喜欢的名称)
   - Description: `AI 工具导航网站 - 支持用户自定义工具`
   - 选择 Public 或 Private
   - 不要初始化 README、.gitignore 或 license（因为本地已有）

### 1.2 推送代码到 GitHub

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 提交当前更改
git add .
git commit -m "准备 Vercel 部署"

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## 步骤 2: 创建 Vercel 项目

### 2.1 注册 Vercel 账号

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Sign Up" 注册账号
3. 建议使用 GitHub 账号登录以便后续集成

### 2.2 导入 GitHub 仓库

1. 登录 Vercel 后，点击 "New Project"
2. 选择 "Import Git Repository"
3. 找到您刚创建的 GitHub 仓库并点击 "Import"
4. 配置项目设置：
   - Project Name: 保持默认或自定义
   - Framework Preset: 选择 "Other" 或 "Static"
   - Root Directory: 保持默认 "./"
   - Build Command: 留空（静态网站不需要构建）
   - Output Directory: 留空
   - Install Command: 留空

## 步骤 3: 配置环境变量

### 3.1 添加 Supabase 环境变量

1. 在项目导入页面或项目设置中，找到 "Environment Variables" 部分
2. 添加以下环境变量：

   **VITE_SUPABASE_URL**
   - Name: `VITE_SUPABASE_URL`
   - Value: 您的 Supabase 项目 URL（格式：https://xxxxx.supabase.co）
   - Environment: Production, Preview, Development（全选）

   **VITE_SUPABASE_ANON_KEY**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: 您的 Supabase anon public key
   - Environment: Production, Preview, Development（全选）

**重要提示：**
- 确保变量名完全匹配（区分大小写）
- 确保为所有环境（Production, Preview, Development）都设置了这些变量
- 添加环境变量后，需要重新部署项目才能生效

### 3.2 获取 Supabase 配置

如果您还没有 Supabase 配置，请按以下步骤获取：

1. 登录 [Supabase](https://supabase.com)
2. 选择您的项目
3. 进入 Settings > API
4. 复制以下信息：
   - Project URL（项目 URL）
   - Project API keys 中的 anon public key

## 步骤 4: 部署项目

### 4.1 触发首次部署

1. 确认所有配置正确后，点击 "Deploy"
2. Vercel 将自动开始部署过程
3. 等待部署完成（通常需要 1-3 分钟）

### 4.2 获取部署 URL

1. 部署完成后，您将看到成功页面
2. 记录下分配的 URL（格式：https://your-project-name.vercel.app）
3. 点击 "Visit" 访问您的网站

## 步骤 5: 验证部署

### 5.1 功能测试清单

访问部署的网站并测试以下功能：

- [ ] 页面正常加载，样式显示正确
- [ ] 搜索功能正常工作
- [ ] 工具卡片正常显示
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 添加自定义工具功能正常
- [ ] 编辑/删除自定义工具功能正常
- [ ] 响应式设计在移动设备上正常

### 5.2 检查控制台错误

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页
3. 确认没有 JavaScript 错误
4. 检查 Network 标签页确认 API 请求正常

### 5.3 验证环境变量配置

1. 打开浏览器开发者工具（F12）
2. 在 Console 中输入以下命令检查配置：
   ```javascript
   // 检查 Supabase 客户端是否正确初始化
   console.log('Supabase client:', window.supabaseClient);
   
   // 检查配置是否正确加载
   console.log('Config loaded:', window.supabaseClient ? '✅' : '❌');
   ```
3. 如果看到错误，检查环境变量是否正确设置

### 5.4 测试 Supabase 连接

1. 尝试注册新用户
2. 检查 Supabase 仪表板中是否创建了用户记录
3. 尝试添加自定义工具
4. 检查 custom_tools 表中是否有新记录

## 步骤 6: 配置自动部署

### 6.1 启用 Git 集成

Vercel 默认会监听您的 GitHub 仓库：

- 每次推送到 main 分支都会触发生产部署
- 推送到其他分支会创建预览部署
- Pull Request 会自动创建预览环境

### 6.2 配置部署钩子（可选）

如果需要自定义部署行为，可以在项目设置中配置：

1. 进入项目设置 > Git
2. 配置 Production Branch（默认为 main）
3. 设置 Ignored Build Step（如果需要）

## 故障排除

### 常见问题

1. **环境变量未生效**
   - 确认变量名拼写正确（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY）
   - 确认已选择所有环境（Production, Preview, Development）
   - 重新部署项目以应用新的环境变量

2. **Supabase 连接失败**
   - 检查 Supabase URL 格式是否正确
   - 确认 anon key 是否正确
   - 检查 Supabase 项目是否处于活跃状态

3. **页面显示空白**
   - 检查浏览器控制台是否有 JavaScript 错误
   - 确认所有文件都已正确推送到 GitHub
   - 检查 vercel.json 配置是否正确

4. **样式未加载**
   - 确认 CSS 文件路径正确
   - 检查是否有 CORS 问题
   - 验证静态资源是否正确部署

### 获取帮助

如果遇到问题，可以：

1. 查看 Vercel 项目的 Functions 标签页查看部署日志
2. 检查 GitHub Actions（如果有）的运行状态
3. 访问 [Vercel 文档](https://vercel.com/docs)
4. 查看 [Supabase 文档](https://supabase.com/docs)

## 下一步

部署成功后，您可以：

1. 配置自定义域名（参考域名配置指南）
2. 设置 SSL 证书（Vercel 自动提供）
3. 配置 CDN 和缓存策略
4. 监控网站性能和错误

恭喜！您的 AI 工具导航网站现在已经成功部署到 Vercel 了！
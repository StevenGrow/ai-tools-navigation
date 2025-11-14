# 🚀 快速部署指南

## 5分钟部署到 Vercel

### 步骤 1：准备 Supabase（2分钟）

如果你还没有 Supabase 项目：

1. 访问 [Supabase](https://supabase.com) 并注册
2. 创建新项目，等待初始化完成
3. 进入 Settings > API，复制：
   - Project URL：`https://xxxxx.supabase.co`
   - anon public key：`eyJhbGciOiJIUzI1NiIs...`
4. 进入 SQL Editor，运行项目中的 `supabase-setup.sql` 文件

### 步骤 2：推送到 GitHub（1分钟）

```bash
# 如果还没有推送到 GitHub
git add .
git commit -m "准备部署"
git push origin main

# 如果还没有 GitHub 仓库，先创建一个
# 然后运行：
# git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
# git push -u origin main
```

### 步骤 3：部署到 Vercel（2分钟）

1. 访问 [Vercel](https://vercel.com)
2. 用 GitHub 账号登录
3. 点击 "New Project" > 选择你的仓库 > "Import"
4. 在 Environment Variables 部分添加：
   ```
   VITE_SUPABASE_URL = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
   ```
5. 点击 "Deploy"

### 完成！🎉

部署完成后，你会得到一个类似这样的 URL：
`https://your-project-name.vercel.app`

## 快速测试

访问你的网站，测试：
- ✅ 页面正常加载
- ✅ 注册新用户
- ✅ 登录用户
- ✅ 添加自定义工具
- ✅ 搜索功能

## 遇到问题？

**最常见的问题：**
1. **页面空白** → 检查浏览器控制台错误
2. **无法注册** → 检查 Supabase URL 和 Key 是否正确
3. **环境变量错误** → 确保变量名完全匹配，重新部署

**需要帮助？** 查看 `PRE_DEPLOYMENT_CHECKLIST.md` 获取详细的故障排除指南。

---

**现在就开始部署吧！** 只需要5分钟，你的 AI 工具导航网站就能上线了！
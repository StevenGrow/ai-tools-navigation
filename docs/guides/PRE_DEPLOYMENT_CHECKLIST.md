# 部署前检查清单

## 🚀 Vercel 部署步骤

### 第一步：准备 Supabase 配置

在开始部署之前，你需要：

1. **确认 Supabase 项目已创建**
   - 访问 [Supabase](https://supabase.com)
   - 确认项目正常运行
   - 数据库表已创建（运行过 `supabase-setup.sql`）

2. **获取 Supabase 配置信息**
   - 项目 URL：`https://xxxxx.supabase.co`
   - Anon Public Key：`eyJhbGciOiJIUzI1NiIs...`

### 第二步：推送代码到 GitHub

```bash
# 如果还没有 Git 仓库，先初始化
git init
git add .
git commit -m "准备 Vercel 部署"

# 创建 GitHub 仓库后，添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 第三步：在 Vercel 创建项目

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 点击 "Import"

### 第四步：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 环境 |
|--------|----|----- |
| `VITE_SUPABASE_URL` | 你的 Supabase 项目 URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase anon key | Production, Preview, Development |

**重要提示：**
- 确保变量名完全匹配（区分大小写）
- 确保为所有环境都设置了这些变量
- URL 格式：`https://xxxxx.supabase.co`（不要忘记 https://）

### 第五步：部署项目

1. 确认环境变量设置正确
2. 点击 "Deploy"
3. 等待部署完成（1-3分钟）
4. 获取部署 URL：`https://your-project-name.vercel.app`

## ✅ 部署后验证清单

访问你的网站并测试以下功能：

### 基础功能
- [ ] 页面正常加载，样式显示正确
- [ ] 搜索功能正常工作
- [ ] 工具卡片正常显示和点击
- [ ] 返回顶部按钮正常工作

### 用户认证功能
- [ ] 注册功能正常（能创建新用户）
- [ ] 登录功能正常（能成功登录）
- [ ] 登出功能正常（能清除会话）
- [ ] 用户信息正确显示在导航栏

### 自定义工具功能
- [ ] 添加工具功能正常
- [ ] 编辑工具功能正常
- [ ] 删除工具功能正常
- [ ] 工具正确显示在对应分类中

### 响应式设计
- [ ] 在手机上正常显示
- [ ] 在平板上正常显示
- [ ] 模态框在移动设备上正常工作
- [ ] 按钮大小适合触摸操作

### 错误检查
- [ ] 浏览器控制台无 JavaScript 错误
- [ ] 网络请求正常（检查 Network 标签）
- [ ] Supabase 连接正常（能注册/登录用户）

## 🔧 常见问题解决

### 问题1：页面显示空白
**可能原因：**
- JavaScript 错误
- Supabase 配置错误
- 环境变量未正确设置

**解决方法：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页的错误信息
3. 检查 Network 标签页的请求状态
4. 确认环境变量设置正确

### 问题2：用户注册/登录失败
**可能原因：**
- Supabase URL 或 Key 错误
- Supabase 项目未正确配置
- 数据库表未创建

**解决方法：**
1. 检查 Supabase 项目状态
2. 确认数据库表已创建
3. 验证 RLS 策略已启用
4. 检查环境变量值是否正确

### 问题3：自定义工具功能不工作
**可能原因：**
- 用户未登录
- 数据库权限问题
- API 请求失败

**解决方法：**
1. 确认用户已成功登录
2. 检查 Supabase 数据库中的 custom_tools 表
3. 验证 RLS 策略配置
4. 查看网络请求的响应状态

## 📞 获取帮助

如果遇到问题，可以：

1. **查看部署日志**
   - 在 Vercel 项目页面查看 Functions 标签
   - 查看构建和部署日志

2. **检查 Supabase 状态**
   - 访问 Supabase 项目仪表板
   - 查看 API 日志和错误信息

3. **参考文档**
   - [Vercel 文档](https://vercel.com/docs)
   - [Supabase 文档](https://supabase.com/docs)
   - 项目中的其他指南文档

## 🎉 部署成功后

部署成功后，你可以：

1. **分享你的网站**
   - 复制 Vercel 提供的 URL
   - 分享给朋友测试

2. **监控网站性能**
   - 在 Vercel 中启用 Analytics
   - 监控访问量和性能指标

3. **考虑购买自定义域名**
   - 选择合适的域名
   - 在 Vercel 中配置自定义域名

4. **持续改进**
   - 收集用户反馈
   - 添加新功能
   - 优化用户体验

---

**准备好开始部署了吗？** 🚀

按照上面的步骤，你的 AI 工具导航网站很快就能上线了！
# AI 工具导航

一个简洁现代的 AI 工具导航网站，收录了常用的 AI 工具，支持用户认证和自定义工具管理。

## 🌟 特点

- 📱 **响应式设计** - 完美适配桌面、平板、手机等各种设备
- 🎨 **现代界面** - 简洁美观的卡片式设计，支持深色模式
- 🚀 **快速加载** - 纯静态页面，无需后端服务器，秒开体验
- 🔗 **一键访问** - 直接跳转到 AI 工具官网，无需记忆复杂网址
- 👤 **用户系统** - 安全的注册登录，数据云端同步
- ➕ **自定义工具** - 添加你发现的优质 AI 工具，建立个人收藏
- ✏️ **灵活管理** - 随时编辑、删除自己添加的工具
- 🔍 **智能搜索** - 同时搜索系统预设和个人自定义工具
- 🔒 **数据安全** - 基于 Supabase 的企业级安全保障
- 🌐 **多语言支持** - 支持中文和英文工具标识

## 📂 项目结构

```
.
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 原有脚本（搜索、返回顶部等）
├── js/                 # JavaScript 模块目录
│   ├── config.js       # Supabase 配置
│   ├── auth.js         # 认证管理
│   ├── tools.js        # 工具管理
│   ├── ui.js           # UI 管理
│   └── app.js          # 主应用逻辑
├── .env.example        # 环境变量示例
├── .gitignore          # Git 忽略文件
└── README.md           # 项目说明
```

## 🚀 快速开始

### 🌐 在线使用

直接访问 [AI 工具导航](https://your-domain.com) 即可开始使用，无需安装任何软件。

### 💻 本地部署

1. **克隆项目**
```bash
git clone https://github.com/你的用户名/ai-tools-nav.git
cd ai-tools-nav
```

2. **基础使用**
```bash
# 直接在浏览器中打开 index.html
open index.html

# 或使用本地服务器（推荐）
python -m http.server 8000
# 然后访问 http://localhost:8000
```

3. **启用完整功能**（可选）
如需使用用户认证和自定义工具功能，请继续配置 Supabase。

## ⚙️ 配置用户认证功能（可选）

如需启用用户认证和自定义工具功能，请按照以下步骤设置 Supabase：

#### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账号
2. 创建新项目，选择离你最近的区域
3. 等待项目初始化完成（约 2 分钟）

#### 2. 获取 API 密钥

1. 进入项目仪表板
2. 点击 Settings > API
3. 复制以下信息：
   - Project URL
   - anon public key

#### 3. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填入从 Supabase 获取的真实值
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4. 创建数据库表

1. 在 Supabase 项目中，点击 SQL Editor
2. 打开项目根目录的 `supabase-setup.sql` 文件
3. 复制整个 SQL 脚本并在 SQL Editor 中执行
4. 验证 `custom_tools` 表已创建成功

#### 5. 验证 RLS 策略

1. 点击 Authentication > Policies
2. 确认 `custom_tools` 表有 4 个策略：
   - Users can view own tools
   - Users can insert own tools
   - Users can update own tools
   - Users can delete own tools

**详细设置步骤请参考 `SUPABASE_SETUP_GUIDE.md` 文件。**

## 🚀 部署指南

### 部署到 Vercel（推荐）

#### 前提条件

1. GitHub 账号
2. Vercel 账号（可用 GitHub 登录）
3. 已配置的 Supabase 项目

#### 步骤 1：推送代码到 GitHub

```bash
# 如果还没有推送到 GitHub
git remote add origin https://github.com/你的用户名/ai-tools-nav.git
git branch -M main
git push -u origin main
```

#### 步骤 2：在 Vercel 创建项目

1. 访问 [Vercel](https://vercel.com) 并登录
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 项目设置保持默认即可
5. 点击 "Deploy"

#### 步骤 3：配置环境变量

1. 在 Vercel 项目仪表板中，点击 "Settings"
2. 选择 "Environment Variables"
3. 添加以下环境变量：

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | 你的 Supabase 项目 URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase anon key | Production, Preview, Development |

4. 点击 "Save"
5. 重新部署项目（Deployments > 最新部署 > Redeploy）

#### 步骤 4：配置自定义域名（可选）

1. 在 Vercel 项目设置中，选择 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录
4. 等待 SSL 证书自动生成

### 部署到其他平台

#### Netlify

1. 将代码推送到 GitHub
2. 在 Netlify 中导入 GitHub 仓库
3. 在 Site settings > Environment variables 中添加环境变量
4. 部署完成

#### GitHub Pages

**注意：** GitHub Pages 不支持环境变量，需要直接在代码中配置 Supabase 密钥。

1. 在 `js/config.js` 中直接填入 Supabase 配置
2. 推送到 GitHub
3. 在仓库设置中启用 GitHub Pages
4. 选择 main 分支作为源

### 本地开发服务器

如果需要在本地运行开发服务器（支持环境变量）：

```bash
# 安装 Vite（如果需要）
npm install -g vite

# 启动开发服务器
vite

# 或者使用 Python 简单服务器
python -m http.server 8000
```

## 🔧 环境变量配置

### 开发环境

1. 复制 `.env.example` 为 `.env`
2. 填入真实的 Supabase 配置：

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 生产环境

在部署平台（Vercel、Netlify 等）的环境变量设置中添加相同的变量。

**重要提示：**
- 不要将包含真实密钥的 `.env` 文件提交到 Git
- Supabase 的 anon key 是公开密钥，可以安全地暴露在前端代码中
- 数据安全通过 Supabase 的 Row Level Security (RLS) 策略保证

## 🏗️ 技术架构

### 前端技术栈
- **HTML5 + CSS3 + JavaScript (ES6+)** - 现代 Web 标准
- **CSS Grid + Flexbox** - 响应式布局系统
- **Supabase JavaScript SDK** - 实时数据库和认证
- **原生 JavaScript** - 无框架依赖，轻量高效

### 后端服务 (Supabase)
- **PostgreSQL** - 企业级关系型数据库
- **Row Level Security (RLS)** - 数据安全保障
- **实时 API** - 自动生成的 RESTful 接口
- **用户认证** - JWT 令牌安全认证

### 部署架构
- **Vercel** - 全球 CDN 加速，秒级部署
- **GitHub** - 版本控制和持续集成
- **自定义域名** - 支持 HTTPS 和 SSL 证书

### 核心特性
- ⚡ **零配置启动** - 下载即用，无需复杂配置
- 🔄 **实时同步** - 多设备数据自动同步
- 🛡️ **安全可靠** - 企业级安全标准
- 📱 **PWA 就绪** - 支持离线使用和桌面安装
- 🎯 **SEO 友好** - 搜索引擎优化

## 📦 工具分类

- 💬 **AI 对话助手** - ChatGPT、Claude、文心一言等智能对话工具
- 🎨 **AI 绘画** - Midjourney、DALL-E、Stable Diffusion 等图像生成工具
- 🎬 **AI 视频** - Runway、Pika Labs、剪映等视频创作工具
- ✍️ **AI 写作** - Jasper、Copy.ai、秘塔写作猫等文本创作工具
- 💻 **AI 编程** - GitHub Copilot、Cursor、通义灵码等代码助手
- 🎵 **AI 音频** - Suno、Udio、剪映等音频生成和处理工具

每个分类都支持添加自定义工具，让你的工具库更加个性化和完整。

## 🔧 自定义

如需添加新的 AI 工具，编辑 `index.html` 文件，在对应分类中添加：

```html
<a href="工具网址" class="tool-card" target="_blank" rel="noopener noreferrer">
    <div class="tool-name">工具名称</div>
    <div class="tool-desc">工具描述</div>
</a>
```

## 📄 许可证

MIT License

## 🐛 故障排除

### 常见问题

#### 1. 用户认证功能不工作

- 检查 Supabase 配置是否正确
- 确认环境变量已正确设置
- 查看浏览器控制台是否有错误信息
- 验证 Supabase 项目是否正常运行

#### 2. 自定义工具无法保存

- 确认用户已登录
- 检查 Supabase 数据库表是否正确创建
- 验证 RLS 策略是否已启用
- 查看网络请求是否成功

#### 3. 部署后环境变量不生效

- 确认在部署平台正确设置了环境变量
- 检查变量名是否正确（区分大小写）
- 重新部署项目以应用新的环境变量

#### 4. 搜索功能异常

- 清除浏览器缓存
- 检查 JavaScript 控制台错误
- 确认所有 JS 文件正确加载

### 获取帮助

如果遇到问题，请：

1. 查看浏览器控制台错误信息
2. 检查 Supabase 项目日志
3. 参考 `SUPABASE_SETUP_GUIDE.md` 详细设置步骤
4. 提交 Issue 并附上错误信息

## 📚 详细文档

- 📖 [Supabase 设置指南](SUPABASE_SETUP_GUIDE.md) - 详细的后端配置步骤
- 🔐 [认证功能使用指南](AUTH_USAGE_GUIDE.md) - 用户系统开发文档
- 📱 [响应式测试指南](RESPONSIVE_TESTING_GUIDE.md) - 多设备兼容性测试
- 🚀 [Vercel 部署指南](VERCEL_DEPLOYMENT_GUIDE.md) - 一键部署到云端
- 🌐 [域名设置指南](DOMAIN_SETUP_GUIDE.md) - 自定义域名配置
- ✅ [部署测试清单](DEPLOYMENT_TEST_CHECKLIST.md) - 上线前检查项目

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是新功能、Bug 修复、文档改进还是工具推荐。

### 🚀 如何贡献

1. **Fork 项目**
```bash
# Fork 本仓库到你的 GitHub 账号
# 然后克隆你的 Fork
git clone https://github.com/你的用户名/ai-tools-nav.git
```

2. **创建功能分支**
```bash
git checkout -b feature/amazing-feature
# 或
git checkout -b fix/bug-description
```

3. **开发和测试**
```bash
# 进行你的修改
# 运行测试确保功能正常
python -m http.server 8000
```

4. **提交更改**
```bash
git add .
git commit -m "feat: 添加新的 AI 工具分类"
# 或
git commit -m "fix: 修复移动端布局问题"
```

5. **推送并创建 PR**
```bash
git push origin feature/amazing-feature
# 然后在 GitHub 上创建 Pull Request
```

### 📋 开发规范

- **代码风格**: 保持代码简洁易读，遵循现有代码风格
- **注释规范**: 为复杂逻辑添加清晰的中文注释
- **响应式设计**: 确保新功能在所有设备上正常工作
- **测试要求**: 使用 `test-responsive.html` 测试响应式布局
- **文档更新**: 重要功能需要更新相关文档

### 🎯 贡献类型

- **🐛 Bug 修复**: 修复现有功能问题
- **✨ 新功能**: 添加新的功能特性
- **📝 文档**: 改进文档和使用指南
- **🎨 UI/UX**: 改进界面设计和用户体验
- **⚡ 性能**: 优化加载速度和响应性能
- **🔧 工具**: 改进开发和测试工具
- **🌐 国际化**: 添加多语言支持

### 💡 工具推荐

如果你发现了优质的 AI 工具，欢迎通过以下方式推荐：

1. **GitHub Issue**: 创建 "工具推荐" Issue
2. **Pull Request**: 直接修改 `index.html` 添加工具
3. **在线提交**: 使用网站的"添加工具"功能

**推荐格式**:
```
工具名称: ChatGPT
工具网址: https://chat.openai.com
工具描述: OpenAI 开发的强大对话 AI
分类: AI 对话助手
是否免费: 部分免费
是否中文: 支持中文
```

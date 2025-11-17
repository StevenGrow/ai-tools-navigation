# AI 工具导航

一个精选的 AI 工具导航网站，帮助用户发现和使用各种 AI 工具。

## 🎯 功能特点

- 🔍 **智能搜索** - 实时搜索工具名称和描述
- 📱 **响应式设计** - 完美支持桌面端、平板端、移动端
- 🏷️ **工具分类** - 按功能分类，支持标签筛选
- 🔐 **用户认证** - 安全的用户注册和登录系统
- ⚙️ **自定义工具** - 用户可添加、编辑、删除自己的工具
- 🎨 **现代化 UI** - 美观的界面设计和流畅的交互体验
- 📧 **邮箱验证** - 友好的邮箱确认流程

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Supabase (认证 + PostgreSQL 数据库)
- **部署**: Vercel
- **样式**: 模块化 CSS + CSS 变量
- **构建**: 自定义构建脚本

## 📁 项目结构

```
ai-tools-navigation/
├── 📁 src/                          # 源代码目录
│   ├── 📁 js/                       # JavaScript 文件
│   │   ├── core/                    # 核心功能
│   │   │   ├── app.js              # 主应用协调器
│   │   │   └── config.js           # Supabase 配置
│   │   └── modules/                 # 功能模块
│   │       ├── auth.js             # 认证管理
│   │       ├── tools.js            # 工具管理
│   │       ├── ui.js               # UI 管理
│   │       └── search.js           # 搜索功能
│   └── 📁 css/                      # 样式文件
│       ├── main.css                # 主样式和布局
│       ├── components.css          # 组件样式
│       ├── modals.css              # 模态框样式
│       ├── notifications.css       # 通知和反馈样式
│       └── responsive.css          # 响应式样式
├── 📁 public/                       # 公共文件（部署目录）
│   ├── index.html                  # 主页面
│   ├── debug-auth.html             # 认证调试页面
│   ├── style.css                   # CSS 入口文件
│   └── favicon.ico                 # 网站图标
├── 📁 docs/                         # 文档目录
│   ├── guides/                     # 指南文档
│   └── troubleshooting/            # 故障排除
├── 📁 tests/                        # 测试目录
│   ├── integration/                # 集成测试
│   ├── pages/                      # 测试页面
│   └── utils/                      # 测试工具
├── 📁 scripts/                      # 构建脚本
│   └── build.js                    # 构建脚本
├── 📁 config/                       # 配置文件
│   ├── vercel.json                 # Vercel 配置
│   ├── .env.example                # 环境变量示例
│   └── supabase-setup.sql          # 数据库设置
├── vercel.json                     # Vercel 部署配置
├── .env.example                    # 环境变量示例
├── package.json                    # 项目配置
└── README.md                       # 项目说明
```

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-tools-navigation
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 Supabase 配置
```

3. **启动本地服务器**
```bash
# 使用任何静态文件服务器，例如：
npx serve public
# 或
python -m http.server 8000 --directory public
```

4. **访问应用**
   - 主页面: http://localhost:8000
   - 调试页面: http://localhost:8000/debug-auth.html

### 部署到 Vercel

1. **推送代码到 GitHub**
2. **在 Vercel 导入项目**
3. **配置环境变量**：
   - `VITE_SUPABASE_URL`: 你的 Supabase 项目 URL
   - `VITE_SUPABASE_ANON_KEY`: 你的 Supabase 匿名密钥
4. **部署完成**

## 🔧 开发指南

### 添加新功能

1. **JavaScript 模块**: 在 `src/js/modules/` 中创建新模块
2. **样式文件**: 在 `src/css/` 中添加对应的 CSS 文件
3. **更新引用**: 在 `public/style.css` 中导入新的 CSS 文件
4. **测试**: 在 `tests/` 目录中添加相应测试

### 样式开发

项目使用模块化 CSS 结构：
- `main.css`: 基础样式、布局、CSS 变量
- `components.css`: 工具卡片、按钮等组件样式
- `modals.css`: 所有模态框和弹窗样式
- `notifications.css`: 通知消息、加载状态等
- `responsive.css`: 响应式适配

### 构建和部署

```bash
# 构建项目（注入环境变量）
node scripts/build.js

# 本地测试构建结果
npx serve public
```

## 📊 功能模块

### 🔐 用户认证系统
- **注册**: 邮箱 + 密码注册，支持表单验证
- **登录**: 安全登录，错误处理
- **邮箱验证**: 友好的确认流程，支持重发邮件
- **会话管理**: 自动保持登录状态
- **安全登出**: 清理用户数据

### ⚙️ 工具管理系统
- **查看工具**: 系统预设 + 用户自定义工具
- **添加工具**: 表单验证，分类管理
- **编辑工具**: 预填充表单，实时更新
- **删除工具**: 确认对话框，安全删除
- **权限控制**: 用户只能管理自己的工具

### 🔍 搜索系统
- **实时搜索**: 输入即搜索，无需提交
- **全文搜索**: 搜索工具名称和描述
- **结果高亮**: 匹配项高亮显示
- **分类筛选**: 按工具类别筛选

### 🎨 UI/UX 系统
- **响应式设计**: 适配所有设备尺寸
- **模态框管理**: 统一的弹窗系统
- **通知系统**: 成功、错误、警告通知
- **加载状态**: 全局和局部加载指示器
- **动画效果**: 流畅的过渡动画

## 🗄️ 数据库结构

### custom_tools 表
```sql
CREATE TABLE custom_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_url TEXT NOT NULL,
  tool_desc TEXT,
  category TEXT NOT NULL CHECK (category IN ('chat', 'image', 'video', 'writing', 'coding', 'audio')),
  is_free BOOLEAN DEFAULT true,
  is_chinese BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_custom_tools_user_id ON custom_tools(user_id);
CREATE INDEX idx_custom_tools_category ON custom_tools(category);

-- Row Level Security
ALTER TABLE custom_tools ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can manage own tools" ON custom_tools
  USING (auth.uid() = user_id);
```

## 🔒 安全特性

- **Row Level Security (RLS)**: 数据库级别的权限控制
- **输入验证**: 前端和后端双重验证
- **XSS 防护**: 输入清理和输出转义
- **CSRF 防护**: Supabase 自动处理
- **HTTPS 强制**: 生产环境强制 HTTPS

## 🌍 环境变量

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 测试

```bash
# 运行集成测试
node tests/integration/test-auth-functionality.js

# 运行响应式测试
node tests/utils/run-responsive-tests.js

# 运行性能测试
node tests/integration/test-performance.js
```

## 📚 文档

- [部署指南](docs/guides/VERCEL_DEPLOYMENT_GUIDE.md)
- [认证指南](docs/guides/AUTH_USAGE_GUIDE.md)
- [故障排除](docs/troubleshooting/EMAIL_CONFIRMATION_GUIDE.md)
- [项目重构说明](docs/guides/PROJECT_RESTRUCTURE_PLAN.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 遵循项目结构和代码规范
4. 添加必要的测试
5. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
6. 推送到分支 (`git push origin feature/AmazingFeature`)
7. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，请：
- 提交 [Issue](../../issues)
- 发起 [Pull Request](../../pulls)
- 联系项目维护者

---

**⭐ 如果这个项目对你有帮助，请给它一个 Star！**
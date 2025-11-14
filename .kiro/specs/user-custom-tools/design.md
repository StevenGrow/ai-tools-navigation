# Design Document

## Overview

本设计文档描述了如何为 AI 工具导航网站添加用户认证和自定义工具功能。系统将使用 Supabase 作为后端服务，提供用户认证、数据存储和 API 接口。前端将使用原生 JavaScript 与 Supabase SDK 集成，保持简单易维护的架构。

## Architecture

### 技术栈

**前端：**
- HTML5 + CSS3 + JavaScript (ES6+)
- Supabase JavaScript Client SDK
- 现有的响应式设计框架

**后端服务（Supabase）：**
- PostgreSQL 数据库
- 内置用户认证系统
- Row Level Security (RLS) 权限控制
- RESTful API 自动生成

**部署：**
- Vercel (前端托管)
- Supabase Cloud (后端服务)
- 自定义域名绑定

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                    用户浏览器                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │         AI 工具导航网站 (HTML/CSS/JS)              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │   │
│  │  │  登录/注册  │  │  工具展示  │  │  搜索功能  │  │   │
│  │  └────────────┘  └────────────┘  └───────────┘  │   │
│  │  ┌────────────┐  ┌────────────┐                 │   │
│  │  │  添加工具   │  │  编辑/删除  │                 │   │
│  │  └────────────┘  └────────────┘                 │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↕                                │
│              Supabase JavaScript SDK                     │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                  Supabase 后端服务                        │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │   Auth Service   │      │   PostgreSQL DB  │        │
│  │  - 用户注册       │      │  - users 表       │        │
│  │  - 用户登录       │      │  - custom_tools  │        │
│  │  - 会话管理       │      │  - RLS 权限      │        │
│  └──────────────────┘      └──────────────────┘        │
│  ┌──────────────────┐                                   │
│  │   RESTful API    │                                   │
│  │  - 自动生成       │                                   │
│  │  - 权限控制       │                                   │
│  └──────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 认证组件 (auth.js)

**职责：** 处理用户注册、登录、登出和会话管理

**接口：**
```javascript
class AuthManager {
  // 初始化 Supabase 客户端
  constructor(supabaseUrl, supabaseKey)
  
  // 用户注册
  async signUp(email, password)
  
  // 用户登录
  async signIn(email, password)
  
  // 用户登出
  async signOut()
  
  // 获取当前用户
  async getCurrentUser()
  
  // 监听认证状态变化
  onAuthStateChange(callback)
}
```

### 2. 工具管理组件 (tools.js)

**职责：** 处理自定义工具的 CRUD 操作

**接口：**
```javascript
class ToolsManager {
  // 初始化
  constructor(supabaseClient)
  
  // 获取用户的自定义工具
  async getUserTools(userId)
  
  // 添加新工具
  async addTool(toolData)
  
  // 更新工具
  async updateTool(toolId, toolData)
  
  // 删除工具
  async deleteTool(toolId)
  
  // 搜索工具（包含系统工具和自定义工具）
  searchTools(searchTerm, customTools)
}
```

### 3. UI 组件 (ui.js)

**职责：** 管理用户界面的显示和交互

**接口：**
```javascript
class UIManager {
  // 显示/隐藏登录模态框
  showLoginModal()
  hideLoginModal()
  
  // 显示/隐藏注册模态框
  showRegisterModal()
  hideRegisterModal()
  
  // 显示/隐藏添加工具模态框
  showAddToolModal()
  hideAddToolModal()
  
  // 显示/隐藏编辑工具模态框
  showEditToolModal(toolData)
  hideEditToolModal()
  
  // 更新用户界面状态
  updateUIForAuthState(isAuthenticated, user)
  
  // 渲染工具卡片
  renderToolCard(tool, isCustom)
  
  // 显示通知消息
  showNotification(message, type)
  
  // 显示加载状态
  showLoading()
  hideLoading()
}
```

### 4. 主应用组件 (app.js)

**职责：** 协调各个组件，管理应用状态

**接口：**
```javascript
class App {
  // 初始化应用
  async init()
  
  // 加载所有工具（系统 + 自定义）
  async loadAllTools()
  
  // 处理搜索
  handleSearch(searchTerm)
  
  // 刷新工具列表
  async refreshTools()
}
```

## Data Models

### 1. Users 表（Supabase 内置）

```sql
-- Supabase 自动创建的用户表
auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT NOT NULL,
  email_confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 2. Custom Tools 表

```sql
-- 自定义工具表
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

-- 创建索引以提高查询性能
CREATE INDEX idx_custom_tools_user_id ON custom_tools(user_id);
CREATE INDEX idx_custom_tools_category ON custom_tools(category);

-- 启用 Row Level Security
ALTER TABLE custom_tools ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看自己的工具
CREATE POLICY "Users can view own tools"
  ON custom_tools FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 策略：用户只能插入自己的工具
CREATE POLICY "Users can insert own tools"
  ON custom_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 策略：用户只能更新自己的工具
CREATE POLICY "Users can update own tools"
  ON custom_tools FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 策略：用户只能删除自己的工具
CREATE POLICY "Users can delete own tools"
  ON custom_tools FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. 前端数据结构

```javascript
// 系统预设工具
const systemTool = {
  name: "ChatGPT",
  url: "https://chat.openai.com",
  desc: "OpenAI 的对话式 AI 助手",
  category: "chat",
  isFree: false,
  isChinese: false,
  isSystem: true
};

// 用户自定义工具
const customTool = {
  id: "uuid",
  userId: "user-uuid",
  name: "My Custom Tool",
  url: "https://example.com",
  desc: "我的自定义工具",
  category: "chat",
  isFree: true,
  isChinese: true,
  isCustom: true,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z"
};
```

## Error Handling

### 1. 认证错误

```javascript
// 错误类型和处理
const authErrors = {
  'Invalid login credentials': '邮箱或密码错误',
  'User already registered': '该邮箱已被注册',
  'Email not confirmed': '请先确认您的邮箱',
  'Password should be at least 6 characters': '密码至少需要 6 个字符',
  'Invalid email': '邮箱格式不正确'
};

// 统一错误处理函数
function handleAuthError(error) {
  const message = authErrors[error.message] || '认证失败，请重试';
  UIManager.showNotification(message, 'error');
  console.error('Auth error:', error);
}
```

### 2. 数据库错误

```javascript
// 数据库操作错误处理
function handleDatabaseError(error, operation) {
  const messages = {
    'insert': '添加工具失败',
    'update': '更新工具失败',
    'delete': '删除工具失败',
    'select': '加载工具失败'
  };
  
  UIManager.showNotification(messages[operation] || '操作失败', 'error');
  console.error('Database error:', error);
}
```

### 3. 网络错误

```javascript
// 网络错误处理
function handleNetworkError(error) {
  if (!navigator.onLine) {
    UIManager.showNotification('网络连接已断开，请检查您的网络', 'error');
  } else {
    UIManager.showNotification('网络请求失败，请稍后重试', 'error');
  }
  console.error('Network error:', error);
}
```

### 4. 表单验证

```javascript
// 表单验证规则
const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  },
  password: {
    minLength: 6,
    message: '密码至少需要 6 个字符'
  },
  toolName: {
    required: true,
    maxLength: 100,
    message: '工具名称不能为空且不超过 100 个字符'
  },
  toolUrl: {
    pattern: /^https?:\/\/.+/,
    message: '请输入有效的网址（以 http:// 或 https:// 开头）'
  }
};
```

## Testing Strategy

### 1. 手动测试清单

**认证功能：**
- [ ] 使用有效邮箱和密码注册新账号
- [ ] 使用已存在的邮箱注册（应显示错误）
- [ ] 使用无效邮箱格式注册（应显示错误）
- [ ] 使用短密码注册（应显示错误）
- [ ] 使用正确凭证登录
- [ ] 使用错误凭证登录（应显示错误）
- [ ] 登出后验证用户状态
- [ ] 刷新页面后验证会话保持

**工具管理功能：**
- [ ] 未登录时隐藏"添加工具"按钮
- [ ] 登录后显示"添加工具"按钮
- [ ] 添加新的自定义工具
- [ ] 验证工具出现在正确的分类中
- [ ] 编辑自定义工具信息
- [ ] 删除自定义工具
- [ ] 验证删除确认对话框
- [ ] 登出后自定义工具消失
- [ ] 重新登录后自定义工具重新出现

**搜索功能：**
- [ ] 搜索系统预设工具
- [ ] 搜索自定义工具
- [ ] 搜索结果正确区分系统工具和自定义工具
- [ ] 清空搜索框显示所有工具

**响应式测试：**
- [ ] 在桌面浏览器测试所有功能
- [ ] 在平板设备测试所有功能
- [ ] 在手机设备测试所有功能
- [ ] 测试不同屏幕方向（横屏/竖屏）

### 2. 浏览器兼容性测试

- [ ] Chrome (最新版本)
- [ ] Firefox (最新版本)
- [ ] Safari (最新版本)
- [ ] Edge (最新版本)
- [ ] 移动端 Safari (iOS)
- [ ] 移动端 Chrome (Android)

### 3. 性能测试

- [ ] 页面加载时间 < 3 秒
- [ ] 登录响应时间 < 2 秒
- [ ] 添加工具响应时间 < 1 秒
- [ ] 搜索响应时间 < 500ms
- [ ] 大量工具（50+）时的渲染性能

## Security Considerations

### 1. 认证安全

- 使用 Supabase 内置的安全认证系统
- 密码使用 bcrypt 加密存储（Supabase 自动处理）
- 使用 JWT token 进行会话管理
- Token 自动刷新机制
- HTTPS 强制加密传输

### 2. 数据安全

- Row Level Security (RLS) 确保用户只能访问自己的数据
- SQL 注入防护（Supabase 自动处理）
- XSS 防护（输入验证和输出转义）
- CSRF 防护（Supabase 自动处理）

### 3. 前端安全

- 不在前端存储敏感信息
- 使用 HttpOnly cookies 存储 token（Supabase 自动处理）
- 输入验证和清理
- URL 验证防止恶意链接

## Deployment Plan

### 阶段 1：Supabase 设置（预计 30 分钟）

1. 注册 Supabase 账号
2. 创建新项目
3. 获取 API 密钥和项目 URL
4. 创建 custom_tools 表
5. 配置 RLS 策略
6. 测试数据库连接

### 阶段 2：本地开发（预计 4-6 小时）

1. 安装 Supabase JavaScript SDK
2. 创建认证组件
3. 创建工具管理组件
4. 创建 UI 组件
5. 集成现有页面
6. 本地测试所有功能

### 阶段 3：Vercel 部署（预计 30 分钟）

1. 将代码推送到 GitHub
2. 在 Vercel 创建新项目
3. 导入 GitHub 仓库
4. 配置环境变量（Supabase 密钥）
5. 部署并测试

### 阶段 4：域名配置（预计 1 小时）

1. 购买域名（推荐：阿里云、腾讯云、Namecheap）
2. 在 Vercel 添加自定义域名
3. 配置 DNS 记录
4. 等待 SSL 证书生成
5. 验证域名访问

### 阶段 5：生产测试（预计 1 小时）

1. 完整功能测试
2. 多设备测试
3. 性能测试
4. 安全检查
5. 用户体验优化

## File Structure

```
ai-tools-navigator/
├── index.html              # 主页面
├── style.css              # 样式文件
├── script.js              # 原有脚本（搜索、返回顶部等）
├── js/
│   ├── config.js          # Supabase 配置
│   ├── auth.js            # 认证管理
│   ├── tools.js           # 工具管理
│   ├── ui.js              # UI 管理
│   └── app.js             # 主应用逻辑
├── .env.example           # 环境变量示例
├── .gitignore             # Git 忽略文件
├── README.md              # 项目说明
└── vercel.json            # Vercel 配置（可选）
```

## Environment Variables

```bash
# .env.example
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Next Steps

1. 用户确认设计方案
2. 创建详细的实现任务列表
3. 开始编码实现
4. 逐步测试和部署

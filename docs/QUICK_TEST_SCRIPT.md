# 🚀 快速测试脚本

## 📋 10分钟完整测试流程

### 步骤1：数据库设置 (3分钟)

1. **打开 Supabase 控制台**
   ```
   https://supabase.com/dashboard/project/yjlzpvkypgtfkfzauhtb
   ```

2. **运行SQL脚本**
   - 点击左侧 `SQL Editor`
   - 复制以下内容并执行：

```sql
-- 快速设置脚本（复制整个代码块）
-- 1. 为 custom_tools 表添加管理员工具标识
ALTER TABLE custom_tools 
ADD COLUMN IF NOT EXISTS is_admin_tool BOOLEAN DEFAULT false;

-- 2. 添加工具可见性字段
ALTER TABLE custom_tools 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' 
CHECK (visibility IN ('private', 'public', 'admin'));

-- 3. 创建管理员表
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- 4. 启用管理员表的 RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 5. 创建管理员检查函数
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 更新权限策略
DROP POLICY IF EXISTS "Users can view own tools" ON custom_tools;
DROP POLICY IF EXISTS "Users can view tools" ON custom_tools;

CREATE POLICY "Users can view tools"
  ON custom_tools FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    (is_admin_tool = true AND visibility = 'public')
    OR
    EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own tools" ON custom_tools;
DROP POLICY IF EXISTS "Admins can insert admin tools" ON custom_tools;

CREATE POLICY "Users can insert tools"
  ON custom_tools FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND is_admin_tool = false)
    OR
    (EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid()) AND is_admin_tool = true)
  );

DROP POLICY IF EXISTS "Users can update own tools" ON custom_tools;
DROP POLICY IF EXISTS "Users can update tools" ON custom_tools;

CREATE POLICY "Users can update tools"
  ON custom_tools FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR 
    (is_admin_tool = true AND EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Users can delete own tools" ON custom_tools;
DROP POLICY IF EXISTS "Users can delete tools" ON custom_tools;

CREATE POLICY "Users can delete tools"
  ON custom_tools FOR DELETE
  USING (
    auth.uid() = user_id 
    OR 
    (is_admin_tool = true AND EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid()))
  );

-- 完成提示
SELECT 'Database setup completed! Now add your user as admin.' AS status;
```

3. **获取你的用户ID**
   - 点击左侧 `Authentication` → `Users`
   - 找到你的账号，复制 `User UID`

4. **添加管理员权限**
   - 在 SQL Editor 中运行（替换你的用户ID）：
```sql
INSERT INTO admin_users (user_id, role) 
VALUES ('你的用户ID', 'super_admin');
```

### 步骤2：测试功能 (7分钟)

1. **访问网站** (1分钟)
   ```
   https://ai-tools-navigation-2.vercel.app
   ```
   - 强制刷新：Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)

2. **登录并验证管理员身份** (2分钟)
   - 登录你的账号
   - ✅ 检查：用户名前是否有 👑 图标
   - ✅ 检查：是否有金色的 "👑 添加系统工具" 按钮

3. **测试添加系统工具** (3分钟)
   - 点击 "👑 添加系统工具" 按钮
   - 填写测试数据：
     ```
     工具名称：管理员测试工具
     工具描述：这是管理员添加的测试工具
     工具链接：https://example.com
     分类：选择 "AI写作"
     ```
   - 提交表单
   - ✅ 检查：工具是否成功添加
   - ✅ 检查：工具是否有金色边框和 👑 图标

4. **验证权限控制** (1分钟)
   - 打开无痕窗口访问网站
   - ✅ 检查：未登录用户能否看到管理员工具
   - ✅ 检查：未登录用户没有管理员按钮

## 🎯 预期结果检查清单

### ✅ 管理员身份验证
- [ ] 用户名前显示 👑 图标
- [ ] 有金色的 "👑 添加系统工具" 按钮
- [ ] 管理员按钮样式正确（金色渐变）

### ✅ 添加系统工具功能
- [ ] 点击按钮能打开添加工具表单
- [ ] 表单提交成功
- [ ] 工具显示在对应分类中
- [ ] 工具有特殊样式（金色边框 + 👑 图标）

### ✅ 权限控制
- [ ] 管理员工具对所有用户可见
- [ ] 普通用户没有管理员标识
- [ ] 普通用户没有管理员按钮

## 🐛 如果测试失败

### 常见问题1：没有管理员标识
```sql
-- 检查管理员记录
SELECT * FROM admin_users;

-- 如果没有你的记录，重新添加
INSERT INTO admin_users (user_id, role) 
VALUES ('你的用户ID', 'super_admin');
```

### 常见问题2：无法添加工具
- 检查浏览器控制台错误 (F12)
- 检查网络请求状态
- 验证数据库权限设置

### 常见问题3：样式显示异常
- 强制刷新页面 (Ctrl+Shift+R)
- 检查CSS文件是否加载
- 清除浏览器缓存

## 📞 需要帮助？

如果测试过程中遇到问题：
1. 截图保存错误信息
2. 记录具体的操作步骤
3. 检查浏览器控制台的错误日志
4. 联系开发者协助解决

## 🎉 测试成功后

恭喜！管理员功能基础版本运行正常。

**接下来可以：**
1. 继续开发管理员面板
2. 添加批量管理功能
3. 实现用户管理系统
4. 添加统计和分析功能
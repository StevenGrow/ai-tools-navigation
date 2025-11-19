-- 管理员权限功能数据库设置（修复版）
-- 在现有 Supabase 项目中运行此脚本

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

-- 5. 创建管理员表的 RLS 策略
-- 修复：允许所有认证用户查看管理员列表，避免无限递归
CREATE POLICY "Authenticated users can view admin list"
  ON admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

-- 6. 更新 custom_tools 的 RLS 策略以支持管理员工具
DROP POLICY IF EXISTS "Users can view own tools" ON custom_tools;
DROP POLICY IF EXISTS "Users can view tools" ON custom_tools;

CREATE POLICY "Users can view tools"
  ON custom_tools FOR SELECT
  USING (
    -- 用户可以查看自己的工具
    auth.uid() = user_id 
    OR 
    -- 所有人可以查看管理员添加的公开工具
    (is_admin_tool = true AND visibility = 'public')
    OR
    -- 管理员可以查看所有工具
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid()
    )
  );

-- 7. 管理员工具的插入策略
DROP POLICY IF EXISTS "Admins can insert admin tools" ON custom_tools;

CREATE POLICY "Admins can insert admin tools"
  ON custom_tools FOR INSERT
  WITH CHECK (
    -- 普通用户只能插入自己的工具
    (auth.uid() = user_id AND (is_admin_tool = false OR is_admin_tool IS NULL))
    OR
    -- 管理员可以插入管理员工具
    (EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid()
    ) AND is_admin_tool = true)
  );

-- 8. 更新策略
DROP POLICY IF EXISTS "Users can update own tools" ON custom_tools;
DROP POLICY IF EXISTS "Users can update tools" ON custom_tools;

CREATE POLICY "Users can update tools"
  ON custom_tools FOR UPDATE
  USING (
    -- 用户可以更新自己的工具
    auth.uid() = user_id 
    OR 
    -- 管理员可以更新所有工具
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid()
    )
  );

-- 9. 删除策略
DROP POLICY IF EXISTS "Users can delete own tools" ON custom_tools;
DROP POLICY IF EXISTS "Users can delete tools" ON custom_tools;

CREATE POLICY "Users can delete tools"
  ON custom_tools FOR DELETE
  USING (
    -- 用户可以删除自己的工具
    auth.uid() = user_id 
    OR 
    -- 管理员可以删除所有工具
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid()
    )
  );

-- 10. 创建管理员检查函数
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 创建添加管理员的函数（只有现有管理员可以调用）
CREATE OR REPLACE FUNCTION add_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 检查调用者是否是管理员
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can add new admins';
  END IF;
  
  -- 添加新管理员
  INSERT INTO admin_users (user_id, created_by)
  VALUES (target_user_id, auth.uid())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 手动添加第一个管理员（替换为你的用户ID）
-- 使用方法：
-- 1. 先注册一个账号并登录
-- 2. 在 Supabase Dashboard -> Authentication -> Users 中找到你的 user_id
-- 3. 取消下面这行的注释，替换 'your-user-id-here' 为你的实际 user_id
-- INSERT INTO admin_users (user_id, role) 
-- VALUES ('your-user-id-here', 'super_admin');

-- 完成！
SELECT 'Admin permissions setup completed!' AS status;

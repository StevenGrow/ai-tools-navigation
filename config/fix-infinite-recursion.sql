-- 快速修复无限递归问题
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 删除有问题的策略
DROP POLICY IF EXISTS "Admin users can view admin list" ON admin_users;

-- 2. 创建修复后的策略（允许所有认证用户查看）
CREATE POLICY "Authenticated users can view admin list"
  ON admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. 确保函数使用正确的语法
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can add new admins';
  END IF;
  
  INSERT INTO admin_users (user_id, created_by)
  VALUES (target_user_id, auth.uid())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Infinite recursion fixed!' AS status;

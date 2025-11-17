-- Supabase 数据库设置脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 创建 custom_tools 表
CREATE TABLE IF NOT EXISTS custom_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_url TEXT NOT NULL,
  tool_desc TEXT,
  category TEXT NOT NULL CHECK (category IN ('chat', 'image', 'video', 'writing', 'coding', 'audio')),
  is_free BOOLEAN DEFAULT true,
  is_chinese BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_custom_tools_user_id ON custom_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_tools_category ON custom_tools(category);

-- 3. 启用 Row Level Security
ALTER TABLE custom_tools ENABLE ROW LEVEL SECURITY;

-- 4. 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own tools" ON custom_tools;
DROP POLICY IF EXISTS "Users can insert own tools" ON custom_tools;
DROP POLICY IF EXISTS "Users can update own tools" ON custom_tools;
DROP POLICY IF EXISTS "Users can delete own tools" ON custom_tools;

-- 5. 创建 RLS 策略：用户只能查看自己的工具
CREATE POLICY "Users can view own tools"
  ON custom_tools FOR SELECT
  USING (auth.uid() = user_id);

-- 6. 创建 RLS 策略：用户只能插入自己的工具
CREATE POLICY "Users can insert own tools"
  ON custom_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. 创建 RLS 策略：用户只能更新自己的工具
CREATE POLICY "Users can update own tools"
  ON custom_tools FOR UPDATE
  USING (auth.uid() = user_id);

-- 8. 创建 RLS 策略：用户只能删除自己的工具
CREATE POLICY "Users can delete own tools"
  ON custom_tools FOR DELETE
  USING (auth.uid() = user_id);

-- 9. 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. 创建触发器
DROP TRIGGER IF EXISTS update_custom_tools_updated_at ON custom_tools;
CREATE TRIGGER update_custom_tools_updated_at
  BEFORE UPDATE ON custom_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 完成！现在可以测试表是否创建成功
SELECT 'custom_tools 表创建成功！' AS status;

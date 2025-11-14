/**
 * Supabase 配置文件
 * 初始化 Supabase 客户端
 */

// 从环境变量或直接配置获取 Supabase 凭证
// 注意：在生产环境中，这些值应该从环境变量中读取
const SUPABASE_URL = 'https://yjlzpvkypgtfkfzauhtb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqbHpwdmt5cGd0ZmtmemF1aHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzQxNTksImV4cCI6MjA3ODUxMDE1OX0.uQxHfJwRirsaIiw8m2dXbU0IkpH1rRaxkt1BCTUKBhY';

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 验证 Supabase 客户端是否成功初始化
if (supabase) {
    console.log('✅ Supabase 客户端初始化成功');
} else {
    console.error('❌ Supabase 客户端初始化失败');
}

// 导出 Supabase 客户端供其他模块使用
window.supabaseClient = supabase;

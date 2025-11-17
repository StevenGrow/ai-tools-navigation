/**
 * Supabase 配置文件
 * 初始化 Supabase 客户端
 */

// Supabase 配置
// 在 Vercel 部署时，需要在项目设置中配置以下环境变量：
// - VITE_SUPABASE_URL: Supabase 项目 URL
// - VITE_SUPABASE_ANON_KEY: Supabase anon public key
//
// 对于静态部署，我们需要在构建时替换这些值
// 或者在部署后通过 Vercel 的环境变量功能注入

// 生产环境配置（直接硬编码以确保正常工作）
const DEFAULT_SUPABASE_URL = 'https://yjlzpvkypgtfkfzauhtb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqbHpwdmt5cGd0ZmtmemF1aHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzQxNTksImV4cCI6MjA3ODUxMDE1OX0.uQxHfJwRirsaIiw8m2dXbU0IkpH1rRaxkt1BCTUKBhY';

// 获取配置的函数
function getSupabaseConfig() {
    // 对于静态部署，我们需要在部署前手动替换这些值
    // 或者使用构建脚本来注入环境变量
    
    // 检查是否有通过 meta 标签注入的环境变量
    const urlMeta = document.querySelector('meta[name="supabase-url"]');
    const keyMeta = document.querySelector('meta[name="supabase-key"]');
    
    if (urlMeta && keyMeta) {
        return {
            supabaseUrl: urlMeta.getAttribute('content'),
            supabaseKey: keyMeta.getAttribute('content')
        };
    }
    
    // 如果没有 meta 标签，使用默认配置（需要手动替换）
    return {
        supabaseUrl: DEFAULT_SUPABASE_URL,
        supabaseKey: DEFAULT_SUPABASE_ANON_KEY
    };
}

const { supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY } = getSupabaseConfig();

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 验证 Supabase 客户端是否成功初始化
if (supabase) {
    console.log('Supabase 客户端初始化成功');
} else {
    console.error('Supabase 客户端初始化失败');
}

// 导出 Supabase 客户端供其他模块使用
window.supabaseClient = supabase;

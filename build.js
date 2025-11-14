#!/usr/bin/env node

/**
 * 构建脚本 - 用于 Vercel 部署时注入环境变量
 * 这个脚本会在部署时运行，将环境变量注入到 HTML 文件中
 */

const fs = require('fs');
const path = require('path');

// 获取环境变量
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://yjlzpvkypgtfkfzauhtb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqbHpwdmt5cGd0ZmtmemF1aHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzQxNTksImV4cCI6MjA3ODUxMDE1OX0.uQxHfJwRirsaIiw8m2dXbU0IkpH1rRaxkt1BCTUKBhY';

console.log('🔧 开始构建过程...');
console.log('📍 Supabase URL:', SUPABASE_URL);
console.log('🔑 Supabase Key:', SUPABASE_ANON_KEY ? '已设置' : '未设置');

// 读取 index.html 文件
const indexPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// 检查是否已经有环境变量 meta 标签
const hasUrlMeta = htmlContent.includes('name="supabase-url"');
const hasKeyMeta = htmlContent.includes('name="supabase-key"');

if (!hasUrlMeta || !hasKeyMeta) {
    // 在 head 标签中注入环境变量 meta 标签
    const metaTags = `
    <!-- Supabase 环境变量 (由构建脚本注入) -->
    <meta name="supabase-url" content="${SUPABASE_URL}">
    <meta name="supabase-key" content="${SUPABASE_ANON_KEY}">`;
    
    // 在 </head> 之前插入 meta 标签
    htmlContent = htmlContent.replace('</head>', `${metaTags}\n</head>`);
    
    // 写回文件
    fs.writeFileSync(indexPath, htmlContent);
    
    console.log('✅ 环境变量已注入到 HTML 文件');
} else {
    console.log('ℹ️  环境变量 meta 标签已存在，跳过注入');
}

console.log('🎉 构建完成！');
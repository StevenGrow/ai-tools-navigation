#!/usr/bin/env node

/**
 * 构建脚本 - 用于 Vercel 部署时注入环境变量
 * 这个脚本会在部署时运行，将环境变量注入到 HTML 文件中
 */

const fs = require('fs');
const path = require('path');

// 获取环境变量
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// 验证环境变量
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ 错误: 缺少必要的环境变量');
    console.error('请确保设置了以下环境变量:');
    console.error('- VITE_SUPABASE_URL');
    console.error('- VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

console.log('开始构建过程...');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key:', SUPABASE_ANON_KEY ? '已设置' : '未设置');

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
    
    console.log('环境变量已注入到 HTML 文件');
} else {
    console.log('环境变量 meta 标签已存在，跳过注入');
}

console.log('构建完成！');
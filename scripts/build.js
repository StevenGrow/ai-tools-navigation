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

// 需要处理的 HTML 文件列表
const htmlFiles = ['public/index.html', 'public/debug-auth.html'];

// 处理每个 HTML 文件
htmlFiles.forEach(filename => {
    const filePath = path.join(__dirname, '..', filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        console.log(`跳过不存在的文件: ${filename}`);
        return;
    }
    
    console.log(`处理文件: ${filename}`);
    
    // 读取文件内容
    let htmlContent = fs.readFileSync(filePath, 'utf8');
    
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
        fs.writeFileSync(filePath, htmlContent);
        
        console.log(`环境变量已注入到 ${filename}`);
    } else {
        console.log(`${filename} 中的环境变量 meta 标签已存在，跳过注入`);
    }
});

// 复制 src 目录到 public 目录
const srcPath = path.join(__dirname, '..', 'src');
const destPath = path.join(__dirname, '..', 'public', 'src');

console.log('复制 src 目录到 public/src...');

// 递归复制目录的函数
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 执行复制
if (fs.existsSync(srcPath)) {
    copyDir(srcPath, destPath);
    console.log('src 目录复制完成！');
} else {
    console.log('src 目录不存在，跳过复制');
}

console.log('构建完成！');
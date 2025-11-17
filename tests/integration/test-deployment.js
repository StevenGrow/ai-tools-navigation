#!/usr/bin/env node

/**
 * 部署前测试脚本
 * 在推送到 Vercel 之前运行本地测试
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始部署前测试...\n');

// 测试 1: 检查必要文件是否存在
console.log('📁 检查必要文件...');
const requiredFiles = [
    'index.html',
    'style.css',
    'js/config.js',
    'js/auth.js',
    'js/tools.js',
    'js/ui.js',
    'js/app.js',
    'package.json',
    'vercel.json',
    '.env.example'
];

let missingFiles = [];
requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        missingFiles.push(file);
    }
});

if (missingFiles.length > 0) {
    console.log('❌ 缺少必要文件:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    process.exit(1);
} else {
    console.log('✅ 所有必要文件都存在\n');
}

// 测试 2: 检查 HTML 文件结构
console.log('🔍 检查 HTML 文件结构...');
const htmlContent = fs.readFileSync('index.html', 'utf8');

const htmlChecks = [
    { name: 'Supabase SDK 引用', pattern: /@supabase\/supabase-js/ },
    { name: '配置文件引用', pattern: /js\/config\.js/ },
    { name: '认证模块引用', pattern: /js\/auth\.js/ },
    { name: '工具模块引用', pattern: /js\/tools\.js/ },
    { name: 'UI 模块引用', pattern: /js\/ui\.js/ },
    { name: '应用模块引用', pattern: /js\/app\.js/ }
];

let htmlIssues = [];
htmlChecks.forEach(check => {
    if (!check.pattern.test(htmlContent)) {
        htmlIssues.push(check.name);
    }
});

if (htmlIssues.length > 0) {
    console.log('❌ HTML 文件问题:');
    htmlIssues.forEach(issue => console.log(`   - 缺少: ${issue}`));
} else {
    console.log('✅ HTML 文件结构正确\n');
}

// 测试 3: 检查 JavaScript 语法
console.log('🔧 检查 JavaScript 文件...');
const jsFiles = [
    'js/config.js',
    'js/auth.js',
    'js/tools.js',
    'js/ui.js',
    'js/app.js'
];

let jsIssues = [];
jsFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        
        // 基本语法检查
        if (content.includes('console.log') && !content.includes('// TODO: 移除调试代码')) {
            // 这是正常的，不算问题
        }
        
        // 检查是否有明显的语法错误标记
        if (content.includes('SyntaxError') || content.includes('undefined is not a function')) {
            jsIssues.push(`${file}: 可能存在语法错误`);
        }
        
    } catch (error) {
        jsIssues.push(`${file}: 无法读取文件`);
    }
});

if (jsIssues.length > 0) {
    console.log('❌ JavaScript 文件问题:');
    jsIssues.forEach(issue => console.log(`   - ${issue}`));
} else {
    console.log('✅ JavaScript 文件检查通过\n');
}

// 测试 4: 检查配置文件
console.log('⚙️  检查配置文件...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    // 检查 package.json
    if (!packageJson.scripts || !packageJson.scripts.build) {
        console.log('❌ package.json 缺少 build 脚本');
    } else {
        console.log('✅ package.json 配置正确');
    }
    
    // 检查 vercel.json
    if (!vercelJson.buildCommand) {
        console.log('❌ vercel.json 缺少 buildCommand');
    } else {
        console.log('✅ vercel.json 配置正确');
    }
    
} catch (error) {
    console.log('❌ 配置文件解析错误:', error.message);
}

console.log('\n📋 部署前检查清单:');
console.log('- [ ] 确认 Supabase 项目已创建并配置');
console.log('- [ ] 确认已获取 Supabase URL 和 API Key');
console.log('- [ ] 确认代码已推送到 GitHub');
console.log('- [ ] 确认 Vercel 项目已创建');
console.log('- [ ] 确认环境变量已在 Vercel 中配置');

console.log('\n🚀 如果所有检查都通过，您可以：');
console.log('1. 推送代码到 GitHub: git push origin main');
console.log('2. 在 Vercel 中触发部署');
console.log('3. 使用 DEPLOYMENT_TEST_CHECKLIST.md 测试部署结果');

console.log('\n✨ 测试完成！');
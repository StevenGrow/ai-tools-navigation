#!/usr/bin/env node

/**
 * 本地测试脚本
 * 验证重构后的项目结构和文件引用
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证项目重构结果...\n');

// 验证目录结构
function checkDirectoryStructure() {
    console.log('📁 验证目录结构...');
    
    const requiredDirs = [
        'src',
        'src/js',
        'src/js/core',
        'src/js/modules',
        'src/js/utils',
        'src/css',
        'src/assets',
        'public',
        'docs',
        'docs/guides',
        'tests',
        'tests/integration',
        'tests/pages',
        'tests/utils',
        'scripts',
        'config'
    ];
    
    let allDirsExist = true;
    
    requiredDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            console.log(`  ✅ ${dir}/`);
        } else {
            console.log(`  ❌ ${dir}/ - 目录不存在`);
            allDirsExist = false;
        }
    });
    
    return allDirsExist;
}

// 验证关键文件
function checkKeyFiles() {
    console.log('\n📄 验证关键文件...');
    
    const requiredFiles = [
        // 根目录文件
        'package.json',
        'README.md',
        'CHANGELOG.md',
        'LICENSE',
        '.gitignore',
        '.env.example',
        'vercel.json',
        
        // 源代码文件
        'src/js/core/app.js',
        'src/js/core/config.js',
        'src/js/modules/auth.js',
        'src/js/modules/tools.js',
        'src/js/modules/ui.js',
        'src/js/modules/search.js',
        
        // CSS 文件
        'src/css/main.css',
        'src/css/components.css',
        'src/css/modals.css',
        'src/css/notifications.css',
        'src/css/responsive.css',
        
        // 公共文件
        'public/index.html',
        'public/debug-auth.html',
        'public/style.css',
        'public/favicon.ico',
        
        // 构建脚本
        'scripts/build.js',
        
        // 配置文件
        'config/vercel.json',
        'config/.env.example'
    ];
    
    let allFilesExist = true;
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`  ✅ ${file}`);
        } else {
            console.log(`  ❌ ${file} - 文件不存在`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

// 验证 HTML 文件中的引用
function checkHTMLReferences() {
    console.log('\n🔗 验证 HTML 文件引用...');
    
    const htmlFiles = [
        'public/index.html',
        'public/debug-auth.html'
    ];
    
    let allReferencesValid = true;
    
    htmlFiles.forEach(htmlFile => {
        if (!fs.existsSync(htmlFile)) {
            console.log(`  ❌ ${htmlFile} - 文件不存在`);
            allReferencesValid = false;
            return;
        }
        
        const content = fs.readFileSync(htmlFile, 'utf8');
        
        // 检查 CSS 引用
        if (htmlFile === 'public/index.html') {
            if (content.includes('../src/css/') || content.includes('style.css')) {
                console.log(`  ✅ ${htmlFile} - CSS 引用正确`);
            } else {
                console.log(`  ❌ ${htmlFile} - CSS 引用可能有问题`);
                allReferencesValid = false;
            }
        }
        
        // 检查 JS 引用
        if (content.includes('../src/js/')) {
            console.log(`  ✅ ${htmlFile} - JS 引用路径正确`);
        } else {
            console.log(`  ❌ ${htmlFile} - JS 引用路径可能有问题`);
            allReferencesValid = false;
        }
    });
    
    return allReferencesValid;
}

// 验证 CSS 导入
function checkCSSImports() {
    console.log('\n🎨 验证 CSS 导入...');
    
    const styleFile = 'public/style.css';
    
    if (!fs.existsSync(styleFile)) {
        console.log(`  ❌ ${styleFile} - 文件不存在`);
        return false;
    }
    
    const content = fs.readFileSync(styleFile, 'utf8');
    
    const expectedImports = [
        '../src/css/main.css',
        '../src/css/components.css',
        '../src/css/modals.css',
        '../src/css/notifications.css',
        '../src/css/responsive.css'
    ];
    
    let allImportsValid = true;
    
    expectedImports.forEach(importPath => {
        if (content.includes(importPath)) {
            console.log(`  ✅ 导入 ${importPath}`);
        } else {
            console.log(`  ❌ 缺少导入 ${importPath}`);
            allImportsValid = false;
        }
    });
    
    return allImportsValid;
}

// 验证 package.json
function checkPackageJson() {
    console.log('\n📦 验证 package.json...');
    
    try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (pkg.version === '2.0.0') {
            console.log('  ✅ 版本号正确 (2.0.0)');
        } else {
            console.log(`  ❌ 版本号不正确: ${pkg.version}`);
            return false;
        }
        
        if (pkg.main === 'public/index.html') {
            console.log('  ✅ 主文件路径正确');
        } else {
            console.log(`  ❌ 主文件路径不正确: ${pkg.main}`);
            return false;
        }
        
        if (pkg.scripts && pkg.scripts.build === 'node scripts/build.js') {
            console.log('  ✅ 构建脚本路径正确');
        } else {
            console.log('  ❌ 构建脚本路径不正确');
            return false;
        }
        
        return true;
    } catch (error) {
        console.log('  ❌ package.json 解析失败:', error.message);
        return false;
    }
}

// 统计文件数量
function getFileStats() {
    console.log('\n📊 文件统计...');
    
    const stats = {
        jsFiles: 0,
        cssFiles: 0,
        htmlFiles: 0,
        testFiles: 0,
        docFiles: 0
    };
    
    // 统计 JS 文件
    if (fs.existsSync('src/js')) {
        const jsFiles = getAllFiles('src/js', '.js');
        stats.jsFiles = jsFiles.length;
        console.log(`  📄 JavaScript 文件: ${stats.jsFiles} 个`);
    }
    
    // 统计 CSS 文件
    if (fs.existsSync('src/css')) {
        const cssFiles = getAllFiles('src/css', '.css');
        stats.cssFiles = cssFiles.length;
        console.log(`  🎨 CSS 文件: ${stats.cssFiles} 个`);
    }
    
    // 统计 HTML 文件
    if (fs.existsSync('public')) {
        const htmlFiles = getAllFiles('public', '.html');
        stats.htmlFiles = htmlFiles.length;
        console.log(`  🌐 HTML 文件: ${stats.htmlFiles} 个`);
    }
    
    // 统计测试文件
    if (fs.existsSync('tests')) {
        const testFiles = getAllFiles('tests', '.js');
        stats.testFiles = testFiles.length;
        console.log(`  🧪 测试文件: ${stats.testFiles} 个`);
    }
    
    // 统计文档文件
    if (fs.existsSync('docs')) {
        const docFiles = getAllFiles('docs', '.md');
        stats.docFiles = docFiles.length;
        console.log(`  📚 文档文件: ${stats.docFiles} 个`);
    }
    
    return stats;
}

// 获取目录下所有指定扩展名的文件
function getAllFiles(dir, ext) {
    let files = [];
    
    function walkDir(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                walkDir(fullPath);
            } else if (stat.isFile() && fullPath.endsWith(ext)) {
                files.push(fullPath);
            }
        });
    }
    
    walkDir(dir);
    return files;
}

// 主验证函数
function runValidation() {
    console.log('🎯 AI 工具导航项目重构验证\n');
    
    const results = {
        directories: checkDirectoryStructure(),
        files: checkKeyFiles(),
        htmlRefs: checkHTMLReferences(),
        cssImports: checkCSSImports(),
        packageJson: checkPackageJson()
    };
    
    const stats = getFileStats();
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 验证结果总结');
    console.log('='.repeat(50));
    
    Object.entries(results).forEach(([key, result]) => {
        const status = result ? '✅ 通过' : '❌ 失败';
        const labels = {
            directories: '目录结构',
            files: '关键文件',
            htmlRefs: 'HTML 引用',
            cssImports: 'CSS 导入',
            packageJson: 'package.json'
        };
        console.log(`${labels[key]}: ${status}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
        console.log('🎉 所有验证项目都通过了！');
        console.log('✨ 项目重构成功完成！');
        console.log('\n📈 重构成果:');
        console.log(`   - JavaScript 模块: ${stats.jsFiles} 个`);
        console.log(`   - CSS 模块: ${stats.cssFiles} 个`);
        console.log(`   - HTML 页面: ${stats.htmlFiles} 个`);
        console.log(`   - 测试文件: ${stats.testFiles} 个`);
        console.log(`   - 文档文件: ${stats.docFiles} 个`);
        console.log('\n🚀 可以进行部署测试了！');
    } else {
        console.log('⚠️  部分验证项目未通过，请检查上述问题。');
    }
    console.log('='.repeat(50));
}

// 运行验证
runValidation();
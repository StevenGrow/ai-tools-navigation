/**
 * 响应式布局测试执行脚本
 * 用于自动化执行响应式布局测试
 */

// 检查是否在浏览器环境中运行
if (typeof window === 'undefined') {
    console.error('此脚本需要在浏览器环境中运行');
    process.exit(1);
}

// 主测试执行函数
async function runResponsiveTests() {
    console.log('🚀 开始执行响应式布局测试');
    console.log('测试页面:', window.location.href);
    console.log('用户代理:', navigator.userAgent);
    console.log('屏幕分辨率:', `${screen.width}×${screen.height}`);
    console.log('视口尺寸:', `${window.innerWidth}×${window.innerHeight}`);
    console.log('设备像素比:', window.devicePixelRatio || 1);
    console.log('-'.repeat(60));

    try {
        // 创建测试报告器
        const reporter = new ResponsiveTestReporter();
        reporter.startTestSession();

        // 等待页面完全加载
        await waitForPageLoad();

        // 执行桌面端测试
        console.log('\n📊 执行桌面端测试...');
        await reporter.testDesktopLayout();
        await delay(1000);

        // 执行平板端测试
        console.log('\n📊 执行平板端测试...');
        await reporter.testTabletLayout();
        await delay(1000);

        // 执行手机端测试
        console.log('\n📊 执行手机端测试...');
        await reporter.testMobileLayout();
        await delay(1000);

        // 恢复原始视口
        reporter.restoreViewport();

        // 结束测试并生成报告
        reporter.endTestSession();

        // 提供导出选项
        console.log('\n💾 测试完成！可以导出详细报告:');
        console.log('在浏览器控制台中运行: reporter.exportReport()');

        // 将 reporter 暴露到全局作用域以便手动导出
        window.testReporter = reporter;

        return reporter;

    } catch (error) {
        console.error('❌ 测试执行失败:', error);
        throw error;
    }
}

// 等待页面加载完成
function waitForPageLoad() {
    return new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 检查必要的元素是否存在
function checkRequiredElements() {
    const requiredSelectors = [
        'header',
        '.category-nav',
        '.container',
        '.category',
        '.tools-grid',
        '.tool-card'
    ];

    const missingElements = [];
    
    requiredSelectors.forEach(selector => {
        if (!document.querySelector(selector)) {
            missingElements.push(selector);
        }
    });

    if (missingElements.length > 0) {
        console.warn('⚠️ 以下必要元素未找到:', missingElements);
        return false;
    }

    return true;
}

// 生成测试摘要
function generateTestSummary(reporter) {
    const results = reporter.testResults;
    const summary = {
        desktop: calculateDeviceTypeSummary(results.desktop),
        tablet: calculateDeviceTypeSummary(results.tablet),
        mobile: calculateDeviceTypeSummary(results.mobile)
    };

    console.log('\n📈 测试摘要:');
    console.log('设备类型 | 测试数 | 平均分 | 通过率');
    console.log('-'.repeat(40));
    
    Object.entries(summary).forEach(([deviceType, stats]) => {
        const passRate = Math.round(stats.passRate * 100);
        console.log(`${deviceType.padEnd(8)} | ${stats.testCount.toString().padEnd(5)} | ${stats.averageScore.toString().padEnd(5)} | ${passRate}%`);
    });

    return summary;
}

// 计算设备类型摘要
function calculateDeviceTypeSummary(results) {
    if (results.length === 0) {
        return { testCount: 0, averageScore: 0, passRate: 0 };
    }

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const passedTests = results.filter(result => result.score === 100).length;

    return {
        testCount: results.length,
        averageScore: Math.round(totalScore / results.length),
        passRate: passedTests / results.length
    };
}

// 检查浏览器兼容性
function checkBrowserCompatibility() {
    const features = {
        'CSS Grid': 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('display', 'grid'),
        'Flexbox': 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('display', 'flex'),
        'Media Queries': window.matchMedia && window.matchMedia('(min-width: 1px)').matches,
        'Viewport Meta': !!document.querySelector('meta[name="viewport"]'),
        'Touch Events': 'ontouchstart' in window,
        'Device Pixel Ratio': 'devicePixelRatio' in window
    };

    console.log('\n🔍 浏览器兼容性检查:');
    Object.entries(features).forEach(([feature, supported]) => {
        const status = supported ? '✅' : '❌';
        console.log(`${status} ${feature}: ${supported}`);
    });

    const unsupportedFeatures = Object.entries(features)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature);

    if (unsupportedFeatures.length > 0) {
        console.warn('⚠️ 不支持的功能可能影响测试结果:', unsupportedFeatures);
    }

    return features;
}

// 自动运行测试（如果页面已加载）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (checkRequiredElements()) {
                runResponsiveTests().catch(console.error);
            } else {
                console.error('❌ 页面缺少必要元素，无法执行测试');
            }
        }, 1000);
    });
} else {
    // 页面已加载，延迟一下再执行测试
    setTimeout(() => {
        if (checkRequiredElements()) {
            runResponsiveTests().catch(console.error);
        } else {
            console.error('❌ 页面缺少必要元素，无法执行测试');
        }
    }, 1000);
}

// 导出函数供手动调用
window.runResponsiveTests = runResponsiveTests;
window.checkBrowserCompatibility = checkBrowserCompatibility;

// 添加快捷键支持
document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+T 运行测试
    if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        runResponsiveTests().catch(console.error);
    }
    
    // Ctrl+Shift+E 导出报告
    if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        if (window.testReporter) {
            window.testReporter.exportReport();
        } else {
            console.warn('⚠️ 请先运行测试再导出报告');
        }
    }
});

console.log('📋 响应式测试脚本已加载');
console.log('💡 快捷键:');
console.log('  Ctrl+Shift+T: 运行测试');
console.log('  Ctrl+Shift+E: 导出报告');
console.log('💡 手动命令:');
console.log('  runResponsiveTests(): 运行完整测试');
console.log('  checkBrowserCompatibility(): 检查浏览器兼容性');
/**
 * 响应式布局测试报告生成器
 * 用于生成详细的测试报告和验证结果
 */

class ResponsiveTestReporter {
    constructor() {
        this.testResults = {
            desktop: [],
            tablet: [],
            mobile: []
        };
        this.testStartTime = null;
        this.testEndTime = null;
    }

    // 开始测试会话
    startTestSession() {
        this.testStartTime = new Date();
        console.log('🚀 开始响应式布局测试会话');
        console.log('测试时间:', this.testStartTime.toLocaleString());
        console.log('浏览器信息:', this.getBrowserInfo());
        console.log('屏幕信息:', this.getScreenInfo());
    }

    // 结束测试会话
    endTestSession() {
        this.testEndTime = new Date();
        const duration = this.testEndTime - this.testStartTime;
        console.log('✅ 测试会话结束');
        console.log('测试耗时:', Math.round(duration / 1000), '秒');
        this.generateFinalReport();
    }

    // 获取浏览器信息
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        return {
            name: browser,
            userAgent: ua,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    // 获取屏幕信息
    getScreenInfo() {
        return {
            screenWidth: screen.width,
            screenHeight: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            devicePixelRatio: window.devicePixelRatio || 1,
            orientation: screen.orientation ? screen.orientation.type : 'unknown'
        };
    }

    // 测试桌面端布局
    async testDesktopLayout() {
        console.log('🖥️ 开始桌面端布局测试');
        const results = [];
        
        // 测试不同的桌面端分辨率
        const desktopSizes = [
            { width: 1920, height: 1080, name: '1080p' },
            { width: 1366, height: 768, name: '笔记本常见分辨率' },
            { width: 1200, height: 800, name: '最小桌面端' }
        ];

        for (const size of desktopSizes) {
            console.log(`测试桌面端尺寸: ${size.name} (${size.width}×${size.height})`);
            
            const testResult = await this.performLayoutTest('desktop', size);
            results.push(testResult);
            
            // 等待一下再测试下一个尺寸
            await this.delay(500);
        }

        this.testResults.desktop = results;
        console.log('✅ 桌面端布局测试完成');
        return results;
    }

    // 测试平板端布局
    async testTabletLayout() {
        console.log('📱 开始平板端布局测试');
        const results = [];
        
        // 测试不同的平板端分辨率
        const tabletSizes = [
            { width: 1024, height: 768, name: 'iPad 横屏' },
            { width: 768, height: 1024, name: 'iPad 竖屏' },
            { width: 800, height: 1280, name: 'Android 平板' }
        ];

        for (const size of tabletSizes) {
            console.log(`测试平板端尺寸: ${size.name} (${size.width}×${size.height})`);
            
            const testResult = await this.performLayoutTest('tablet', size);
            results.push(testResult);
            
            await this.delay(500);
        }

        this.testResults.tablet = results;
        console.log('✅ 平板端布局测试完成');
        return results;
    }

    // 测试手机端布局
    async testMobileLayout() {
        console.log('📱 开始手机端布局测试');
        const results = [];
        
        // 测试不同的手机端分辨率
        const mobileSizes = [
            { width: 375, height: 667, name: 'iPhone SE' },
            { width: 414, height: 896, name: 'iPhone 11' },
            { width: 360, height: 640, name: 'Android 常见' },
            { width: 320, height: 568, name: '最小手机屏幕' }
        ];

        for (const size of mobileSizes) {
            console.log(`测试手机端尺寸: ${size.name} (${size.width}×${size.height})`);
            
            const testResult = await this.performLayoutTest('mobile', size);
            results.push(testResult);
            
            await this.delay(500);
        }

        this.testResults.mobile = results;
        console.log('✅ 手机端布局测试完成');
        return results;
    }

    // 执行具体的布局测试
    async performLayoutTest(deviceType, size) {
        const testResult = {
            deviceType,
            size,
            timestamp: new Date(),
            tests: {},
            issues: [],
            score: 0
        };

        try {
            // 模拟视口尺寸（仅用于测试，实际媒体查询基于真实视口）
            this.simulateViewport(size.width, size.height);
            
            // 等待布局更新
            await this.delay(200);
            
            // 执行各项测试
            testResult.tests.header = this.testHeaderResponsive(size);
            testResult.tests.navigation = this.testNavigationResponsive(size);
            testResult.tests.grid = this.testGridResponsive(size);
            testResult.tests.modal = this.testModalResponsive(size);
            testResult.tests.buttons = this.testButtonsResponsive(size);
            testResult.tests.forms = this.testFormsResponsive(size);
            testResult.tests.accessibility = this.testAccessibility(size);
            
            // 计算总分
            testResult.score = this.calculateScore(testResult.tests);
            
        } catch (error) {
            console.error('测试执行错误:', error);
            testResult.issues.push({
                type: 'error',
                message: `测试执行失败: ${error.message}`
            });
        }

        return testResult;
    }

    // 测试头部响应式
    testHeaderResponsive(size) {
        const header = document.querySelector('header');
        const userActions = document.querySelector('.user-actions');
        const searchContainer = document.querySelector('.search-container');
        
        const result = {
            passed: true,
            issues: [],
            details: {}
        };

        if (!header) {
            result.passed = false;
            result.issues.push('头部元素未找到');
            return result;
        }

        const headerRect = header.getBoundingClientRect();
        result.details.headerHeight = headerRect.height;

        // 检查头部高度是否合理
        if (headerRect.height < 100) {
            result.issues.push(`头部高度过小: ${Math.round(headerRect.height)}px`);
        }

        // 检查用户操作区域
        if (userActions) {
            const actionsRect = userActions.getBoundingClientRect();
            result.details.userActionsVisible = actionsRect.width > 0 && actionsRect.height > 0;
            
            if (size.width <= 768) {
                // 移动端检查：用户操作应该在合适位置
                const isProperlyPositioned = actionsRect.top > 0 && actionsRect.left >= 0;
                if (!isProperlyPositioned) {
                    result.issues.push('移动端用户操作区域位置不当');
                }
            }
        }

        // 检查搜索框
        if (searchContainer) {
            const searchInput = searchContainer.querySelector('.search-input');
            if (searchInput) {
                const inputRect = searchInput.getBoundingClientRect();
                result.details.searchWidth = inputRect.width;
                
                // 搜索框应该占据合理的宽度
                const containerWidth = header.getBoundingClientRect().width;
                const searchRatio = inputRect.width / containerWidth;
                
                if (searchRatio < 0.3 || searchRatio > 0.8) {
                    result.issues.push(`搜索框宽度比例不当: ${Math.round(searchRatio * 100)}%`);
                }
            }
        }

        result.passed = result.issues.length === 0;
        return result;
    }

    // 测试导航响应式
    testNavigationResponsive(size) {
        const nav = document.querySelector('.category-nav');
        const result = {
            passed: true,
            issues: [],
            details: {}
        };

        if (!nav) {
            result.passed = false;
            result.issues.push('导航元素未找到');
            return result;
        }

        const navItems = nav.querySelectorAll('.nav-item');
        const navRect = nav.getBoundingClientRect();
        
        result.details.itemCount = navItems.length;
        result.details.navHeight = navRect.height;

        // 检查导航项换行情况
        let lineCount = this.countLines(navItems);
        result.details.lineCount = lineCount;

        // 根据屏幕尺寸判断换行是否合理
        if (size.width > 1024 && lineCount > 1) {
            result.issues.push(`桌面端导航不应换行，当前 ${lineCount} 行`);
        } else if (size.width <= 480 && lineCount > 3) {
            result.issues.push(`小屏幕导航行数过多: ${lineCount} 行`);
        }

        // 检查导航项尺寸
        navItems.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            if (size.width <= 768 && itemRect.height < 40) {
                result.issues.push(`导航项 ${index + 1} 在移动端高度不足: ${Math.round(itemRect.height)}px`);
            }
        });

        result.passed = result.issues.length === 0;
        return result;
    }

    // 测试网格响应式
    testGridResponsive(size) {
        const container = document.querySelector('.container');
        const categories = document.querySelectorAll('.category');
        const toolsGrids = document.querySelectorAll('.tools-grid');
        
        const result = {
            passed: true,
            issues: [],
            details: {}
        };

        if (!container) {
            result.passed = false;
            result.issues.push('容器元素未找到');
            return result;
        }

        const containerRect = container.getBoundingClientRect();
        result.details.containerWidth = containerRect.width;

        // 检查分类布局
        if (categories.length >= 2) {
            const firstCategory = categories[0];
            const secondCategory = categories[1];
            const firstRect = firstCategory.getBoundingClientRect();
            const secondRect = secondCategory.getBoundingClientRect();
            
            const isSideBySide = Math.abs(firstRect.top - secondRect.top) < 50;
            result.details.categoriesSideBySide = isSideBySide;

            // 桌面端应该并排，移动端应该堆叠
            if (size.width > 1024 && !isSideBySide) {
                result.issues.push('桌面端分类应该并排显示');
            } else if (size.width <= 1024 && isSideBySide) {
                result.issues.push('移动端分类应该垂直堆叠');
            }
        }

        // 检查工具网格
        toolsGrids.forEach((grid, gridIndex) => {
            const toolCards = grid.querySelectorAll('.tool-card');
            if (toolCards.length >= 2) {
                const gridResult = this.analyzeToolGrid(toolCards, size, gridIndex);
                result.details[`grid_${gridIndex}`] = gridResult;
                
                if (gridResult.issues.length > 0) {
                    result.issues.push(...gridResult.issues);
                }
            }
        });

        result.passed = result.issues.length === 0;
        return result;
    }

    // 分析工具网格
    analyzeToolGrid(toolCards, size, gridIndex) {
        const gridResult = {
            cardCount: toolCards.length,
            columns: 0,
            issues: []
        };

        // 计算列数
        const firstCard = toolCards[0];
        const firstRect = firstCard.getBoundingClientRect();
        let columns = 1;

        for (let i = 1; i < toolCards.length; i++) {
            const cardRect = toolCards[i].getBoundingClientRect();
            if (Math.abs(cardRect.top - firstRect.top) < 50) {
                columns++;
            } else {
                break;
            }
        }

        gridResult.columns = columns;

        // 检查列数是否符合预期
        if (size.width > 768 && columns < 2) {
            gridResult.issues.push(`网格 ${gridIndex + 1}: 大屏幕应显示多列，当前 ${columns} 列`);
        } else if (size.width <= 480 && columns > 1) {
            gridResult.issues.push(`网格 ${gridIndex + 1}: 小屏幕应单列显示，当前 ${columns} 列`);
        }

        // 检查卡片尺寸
        toolCards.forEach((card, cardIndex) => {
            const rect = card.getBoundingClientRect();
            if (rect.width < 150) {
                gridResult.issues.push(`网格 ${gridIndex + 1} 卡片 ${cardIndex + 1}: 宽度过小 ${Math.round(rect.width)}px`);
            }
            if (rect.height < 80) {
                gridResult.issues.push(`网格 ${gridIndex + 1} 卡片 ${cardIndex + 1}: 高度过小 ${Math.round(rect.height)}px`);
            }
        });

        return gridResult;
    }

    // 测试模态框响应式
    testModalResponsive(size) {
        const result = {
            passed: true,
            issues: [],
            details: {}
        };

        // 这里我们测试模态框的 CSS 规则而不是实际显示
        // 因为在自动化测试中显示模态框可能会干扰其他测试

        // 检查模态框 CSS 规则
        const modalStyles = this.getComputedStylesForSelector('.modal-content');
        if (modalStyles) {
            const maxWidth = modalStyles.maxWidth;
            const width = modalStyles.width;
            
            result.details.maxWidth = maxWidth;
            result.details.width = width;

            // 检查移动端是否有合适的宽度设置
            if (size.width <= 768) {
                if (!width.includes('%') && !width.includes('calc')) {
                    result.issues.push('移动端模态框应使用响应式宽度');
                }
            }
        }

        result.passed = result.issues.length === 0;
        return result;
    }

    // 测试按钮响应式
    testButtonsResponsive(size) {
        const backToTop = document.getElementById('backToTop');
        const addToolBtn = document.getElementById('addToolBtn');
        const actionButtons = document.querySelectorAll('.tool-action-btn');
        
        const result = {
            passed: true,
            issues: [],
            details: {}
        };

        // 检查浮动按钮
        if (backToTop) {
            const rect = backToTop.getBoundingClientRect();
            result.details.backToTopSize = { width: rect.width, height: rect.height };
            
            if (size.width <= 768 && (rect.width < 40 || rect.height < 40)) {
                result.issues.push(`返回顶部按钮在移动端尺寸不足: ${Math.round(rect.width)}×${Math.round(rect.height)}`);
            }
        }

        if (addToolBtn) {
            const rect = addToolBtn.getBoundingClientRect();
            result.details.addToolBtnSize = { width: rect.width, height: rect.height };
            
            if (size.width <= 768 && (rect.width < 44 || rect.height < 44)) {
                result.issues.push(`添加工具按钮在移动端尺寸不足: ${Math.round(rect.width)}×${Math.round(rect.height)}`);
            }
        }

        // 检查工具操作按钮
        result.details.actionButtonCount = actionButtons.length;
        actionButtons.forEach((button, index) => {
            const rect = button.getBoundingClientRect();
            if (size.width <= 768 && (rect.width < 44 || rect.height < 44)) {
                result.issues.push(`操作按钮 ${index + 1} 在移动端尺寸不足: ${Math.round(rect.width)}×${Math.round(rect.height)}`);
            }
        });

        result.passed = result.issues.length === 0;
        return result;
    }

    // 测试表单响应式
    testFormsResponsive(size) {
        const inputs = document.querySelectorAll('.form-input');
        const buttons = document.querySelectorAll('.form-submit-btn');
        const checkboxes = document.querySelectorAll('.checkbox-input');
        
        const result = {
            passed: true,
            issues: [],
            details: {
                inputCount: inputs.length,
                buttonCount: buttons.length,
                checkboxCount: checkboxes.length
            }
        };

        // 检查输入框
        inputs.forEach((input, index) => {
            const rect = input.getBoundingClientRect();
            if (size.width <= 768 && rect.height < 44) {
                result.issues.push(`输入框 ${index + 1} 在移动端高度不足: ${Math.round(rect.height)}px`);
            }
        });

        // 检查按钮
        buttons.forEach((button, index) => {
            const rect = button.getBoundingClientRect();
            if (size.width <= 768 && rect.height < 44) {
                result.issues.push(`表单按钮 ${index + 1} 在移动端高度不足: ${Math.round(rect.height)}px`);
            }
        });

        // 检查复选框
        checkboxes.forEach((checkbox, index) => {
            const rect = checkbox.getBoundingClientRect();
            if (size.width <= 768 && (rect.width < 18 || rect.height < 18)) {
                result.issues.push(`复选框 ${index + 1} 在移动端尺寸不足: ${Math.round(rect.width)}×${Math.round(rect.height)}`);
            }
        });

        result.passed = result.issues.length === 0;
        return result;
    }

    // 测试可访问性
    testAccessibility(size) {
        const result = {
            passed: true,
            issues: [],
            details: {}
        };

        // 检查视口元标签
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            const content = viewportMeta.getAttribute('content');
            result.details.viewportMeta = content;
            
            if (!content.includes('width=device-width') || !content.includes('initial-scale=1.0')) {
                result.issues.push('视口元标签配置不正确');
            }
        } else {
            result.issues.push('缺少视口元标签');
        }

        // 检查字体大小
        const bodyStyle = window.getComputedStyle(document.body);
        const fontSize = parseFloat(bodyStyle.fontSize);
        result.details.baseFontSize = fontSize;
        
        if (fontSize < 14) {
            result.issues.push(`基础字体大小过小: ${fontSize}px`);
        }

        // 检查水平滚动
        const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
        result.details.hasHorizontalScroll = hasHorizontalScroll;
        
        if (hasHorizontalScroll) {
            result.issues.push('页面存在水平滚动');
        }

        // 检查颜色对比度（简单检查）
        const textElements = document.querySelectorAll('p, span, div, a, button');
        let lowContrastCount = 0;
        
        for (let i = 0; i < Math.min(textElements.length, 10); i++) {
            const element = textElements[i];
            const style = window.getComputedStyle(element);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            
            // 简单的对比度检查（实际应该使用更复杂的算法）
            if (this.isLowContrast(color, backgroundColor)) {
                lowContrastCount++;
            }
        }
        
        result.details.lowContrastElements = lowContrastCount;
        if (lowContrastCount > 2) {
            result.issues.push(`发现 ${lowContrastCount} 个可能的低对比度元素`);
        }

        result.passed = result.issues.length === 0;
        return result;
    }

    // 简单的对比度检查
    isLowContrast(color, backgroundColor) {
        // 这是一个简化的检查，实际应该使用 WCAG 对比度算法
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
            return false; // 跳过透明背景
        }
        
        // 简单检查：如果颜色都很浅或都很深，可能对比度不足
        const colorLightness = this.getColorLightness(color);
        const bgLightness = this.getColorLightness(backgroundColor);
        
        return Math.abs(colorLightness - bgLightness) < 0.3;
    }

    // 获取颜色亮度（简化版）
    getColorLightness(color) {
        // 这是一个非常简化的亮度计算
        if (color.includes('rgb')) {
            const matches = color.match(/\d+/g);
            if (matches && matches.length >= 3) {
                const r = parseInt(matches[0]);
                const g = parseInt(matches[1]);
                const b = parseInt(matches[2]);
                return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            }
        }
        return 0.5; // 默认中等亮度
    }

    // 计算测试分数
    calculateScore(tests) {
        const totalTests = Object.keys(tests).length;
        const passedTests = Object.values(tests).filter(test => test.passed).length;
        return Math.round((passedTests / totalTests) * 100);
    }

    // 模拟视口尺寸
    simulateViewport(width, height) {
        // 注意：这只是视觉模拟，实际媒体查询仍基于真实视口
        document.body.style.width = width + 'px';
        document.body.style.maxWidth = width + 'px';
        document.body.style.margin = '0 auto';
        document.body.style.border = '2px solid #6366f1';
        
        // 触发 resize 事件
        window.dispatchEvent(new Event('resize'));
    }

    // 恢复原始视口
    restoreViewport() {
        document.body.style.width = '';
        document.body.style.maxWidth = '';
        document.body.style.margin = '';
        document.body.style.border = '';
        window.dispatchEvent(new Event('resize'));
    }

    // 计算元素行数
    countLines(elements) {
        if (elements.length === 0) return 0;
        
        let lineCount = 1;
        let previousTop = elements[0].getBoundingClientRect().top;
        
        for (let i = 1; i < elements.length; i++) {
            const currentTop = elements[i].getBoundingClientRect().top;
            if (Math.abs(currentTop - previousTop) > 5) {
                lineCount++;
                previousTop = currentTop;
            }
        }
        
        return lineCount;
    }

    // 获取选择器的计算样式
    getComputedStylesForSelector(selector) {
        const element = document.querySelector(selector);
        return element ? window.getComputedStyle(element) : null;
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 生成最终报告
    generateFinalReport() {
        console.log('\n📊 响应式布局测试报告');
        console.log('='.repeat(50));
        
        const allResults = [
            ...this.testResults.desktop,
            ...this.testResults.tablet,
            ...this.testResults.mobile
        ];

        // 统计信息
        const totalTests = allResults.length;
        const passedTests = allResults.filter(r => r.score === 100).length;
        const averageScore = allResults.reduce((sum, r) => sum + r.score, 0) / totalTests;

        console.log(`测试总数: ${totalTests}`);
        console.log(`完全通过: ${passedTests} (${Math.round(passedTests / totalTests * 100)}%)`);
        console.log(`平均分数: ${Math.round(averageScore)}%`);
        console.log(`测试时长: ${Math.round((this.testEndTime - this.testStartTime) / 1000)}秒`);

        // 按设备类型分组报告
        ['desktop', 'tablet', 'mobile'].forEach(deviceType => {
            const results = this.testResults[deviceType];
            if (results.length > 0) {
                console.log(`\n📱 ${deviceType.toUpperCase()} 测试结果:`);
                results.forEach(result => {
                    console.log(`  ${result.size.name}: ${result.score}% (${this.getScoreGrade(result.score)})`);
                    if (result.issues.length > 0) {
                        console.log(`    问题: ${result.issues.length} 个`);
                    }
                });
            }
        });

        // 常见问题汇总
        const allIssues = allResults.flatMap(r => r.issues);
        if (allIssues.length > 0) {
            console.log('\n⚠️ 发现的问题:');
            const issueGroups = this.groupIssues(allIssues);
            Object.entries(issueGroups).forEach(([issue, count]) => {
                console.log(`  • ${issue} (${count} 次)`);
            });
        }

        // 建议
        console.log('\n💡 优化建议:');
        this.generateRecommendations(allResults);

        return {
            summary: {
                totalTests,
                passedTests,
                averageScore: Math.round(averageScore),
                duration: Math.round((this.testEndTime - this.testStartTime) / 1000)
            },
            results: this.testResults,
            issues: allIssues
        };
    }

    // 获取分数等级
    getScoreGrade(score) {
        if (score >= 95) return '优秀';
        if (score >= 85) return '良好';
        if (score >= 70) return '一般';
        return '需改进';
    }

    // 分组问题
    groupIssues(issues) {
        const groups = {};
        issues.forEach(issue => {
            const message = typeof issue === 'string' ? issue : issue.message;
            groups[message] = (groups[message] || 0) + 1;
        });
        return groups;
    }

    // 生成优化建议
    generateRecommendations(results) {
        const recommendations = [];
        
        // 分析常见问题并给出建议
        const allIssues = results.flatMap(r => r.issues);
        
        if (allIssues.some(issue => issue.includes('高度不足'))) {
            recommendations.push('增加移动端按钮和输入框的最小高度至 44px');
        }
        
        if (allIssues.some(issue => issue.includes('宽度'))) {
            recommendations.push('优化响应式网格布局，确保不同屏幕尺寸下的合适列数');
        }
        
        if (allIssues.some(issue => issue.includes('对比度'))) {
            recommendations.push('检查并改善文本与背景的颜色对比度');
        }
        
        if (allIssues.some(issue => issue.includes('水平滚动'))) {
            recommendations.push('修复导致水平滚动的布局问题');
        }

        if (recommendations.length === 0) {
            recommendations.push('响应式布局表现良好，继续保持！');
        }

        recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
        });
    }

    // 导出测试报告为 JSON
    exportReport() {
        const report = {
            metadata: {
                testDate: this.testStartTime,
                duration: this.testEndTime - this.testStartTime,
                browser: this.getBrowserInfo(),
                screen: this.getScreenInfo()
            },
            results: this.testResults,
            summary: this.generateFinalReport()
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `responsive-test-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 导出类供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveTestReporter;
} else if (typeof window !== 'undefined') {
    window.ResponsiveTestReporter = ResponsiveTestReporter;
}
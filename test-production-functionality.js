/**
 * 生产环境完整功能测试脚本
 * 测试所有认证功能、工具管理功能和搜索功能
 * 
 * 使用方法：
 * 1. 在生产环境中打开浏览器控制台
 * 2. 运行此脚本
 * 3. 调用 runProductionTests() 开始完整测试
 */

class ProductionFunctionalityTester {
  constructor() {
    this.testResults = {
      environment: {},
      authentication: {},
      toolManagement: {},
      search: {},
      overall: {}
    };
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * 运行所有生产环境功能测试
   */
  async runAllTests() {
    console.log('🚀 开始生产环境完整功能测试...');
    console.log('🌐 当前环境:', window.location.href);
    console.log('⏰ 测试开始时间:', new Date().toLocaleString());
    
    this.startTime = performance.now();
    
    try {
      // 1. 环境检查
      await this.testEnvironment();
      
      // 2. 认证功能测试
      await this.testAuthentication();
      
      // 3. 工具管理功能测试
      await this.testToolManagement();
      
      // 4. 搜索功能测试
      await this.testSearch();
      
      // 5. 生成总体测试报告
      this.generateOverallReport();
      
    } catch (error) {
      console.error('❌ 生产环境测试过程中发生错误:', error);
      this.testResults.overall.error = error.message;
    } finally {
      this.endTime = performance.now();
      this.displayFinalResults();
    }
  }

  /**
   * 测试环境检查
   */
  async testEnvironment() {
    console.log('\n🔍 环境检查...');
    
    const environmentTests = {
      httpsConnection: this.checkHTTPS(),
      supabaseConnection: await this.checkSupabaseConnection(),
      requiredScripts: this.checkRequiredScripts(),
      domElements: this.checkDOMElements(),
      browserCompatibility: this.checkBrowserCompatibility(),
      performanceMetrics: await this.checkPerformanceMetrics()
    };
    
    this.testResults.environment = environmentTests;
    
    // 显示环境检查结果
    console.log('📊 环境检查结果:');
    Object.keys(environmentTests).forEach(testName => {
      const result = environmentTests[testName];
      console.log(`  ${result.passed ? '✅' : '❌'} ${testName}: ${result.passed}`);
      if (result.details) {
        console.log(`    ${result.details}`);
      }
    });
  }

  /**
   * 检查HTTPS连接
   */
  checkHTTPS() {
    const isHTTPS = window.location.protocol === 'https:';
    return {
      passed: isHTTPS,
      details: `协议: ${window.location.protocol}`
    };
  }

  /**
   * 检查Supabase连接
   */
  async checkSupabaseConnection() {
    try {
      if (!window.supabase) {
        return { passed: false, details: 'Supabase客户端未初始化' };
      }
      
      // 尝试获取会话来测试连接
      const { data, error } = await window.supabase.auth.getSession();
      
      if (error && error.message.includes('network')) {
        return { passed: false, details: `网络连接错误: ${error.message}` };
      }
      
      return { 
        passed: true, 
        details: `连接正常, 会话状态: ${data.session ? '已登录' : '未登录'}` 
      };
      
    } catch (error) {
      return { passed: false, details: `连接测试失败: ${error.message}` };
    }
  }

  /**
   * 检查必需的脚本
   */
  checkRequiredScripts() {
    const requiredObjects = [
      'supabase',
      'authManager', 
      'toolsManager',
      'uiManager',
      'app'
    ];
    
    const missingObjects = requiredObjects.filter(obj => !window[obj]);
    const allPresent = missingObjects.length === 0;
    
    return {
      passed: allPresent,
      details: allPresent ? '所有必需对象已加载' : `缺少对象: ${missingObjects.join(', ')}`
    };
  }

  /**
   * 检查DOM元素
   */
  checkDOMElements() {
    const requiredElements = [
      'loginBtn',
      'registerBtn', 
      'searchInput',
      'toolsContainer',
      'loginModal',
      'registerModal',
      'addToolModal'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    const allPresent = missingElements.length === 0;
    
    return {
      passed: allPresent,
      details: allPresent ? '所有必需DOM元素存在' : `缺少元素: ${missingElements.join(', ')}`
    };
  }

  /**
   * 检查浏览器兼容性
   */
  checkBrowserCompatibility() {
    const features = {
      fetch: typeof fetch !== 'undefined',
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      Promise: typeof Promise !== 'undefined',
      async: typeof (async function(){}) === 'function'
    };
    
    const unsupportedFeatures = Object.keys(features).filter(feature => !features[feature]);
    const allSupported = unsupportedFeatures.length === 0;
    
    return {
      passed: allSupported,
      details: allSupported ? '浏览器兼容性良好' : `不支持的特性: ${unsupportedFeatures.join(', ')}`
    };
  }

  /**
   * 检查性能指标
   */
  async checkPerformanceMetrics() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
      
      // 检查页面加载时间（应小于3秒）
      const loadTimeGood = loadTime < 3000;
      
      // 检查DOM元素数量
      const elementCount = document.querySelectorAll('*').length;
      const elementCountGood = elementCount < 1000; // 合理的DOM元素数量
      
      return {
        passed: loadTimeGood && elementCountGood,
        details: `加载时间: ${Math.round(loadTime)}ms, DOM元素: ${elementCount}个`
      };
      
    } catch (error) {
      return { passed: false, details: `性能检查失败: ${error.message}` };
    }
  }

  /**
   * 测试认证功能
   */
  async testAuthentication() {
    console.log('\n🔐 测试认证功能...');
    
    try {
      if (window.authTester) {
        const authResults = await window.authTester.runAllTests();
        this.testResults.authentication = {
          passed: authResults.percentage >= 80, // 80%通过率认为成功
          ...authResults
        };
      } else {
        // 如果没有专门的认证测试器，进行基本测试
        const basicAuthTest = await this.basicAuthenticationTest();
        this.testResults.authentication = basicAuthTest;
      }
      
      console.log(`${this.testResults.authentication.passed ? '✅' : '❌'} 认证功能测试完成`);
      
    } catch (error) {
      console.error('❌ 认证功能测试失败:', error);
      this.testResults.authentication = { passed: false, error: error.message };
    }
  }

  /**
   * 基本认证功能测试
   */
  async basicAuthenticationTest() {
    const tests = {
      authManagerExists: !!window.authManager,
      loginModalExists: !!document.getElementById('loginModal'),
      registerModalExists: !!document.getElementById('registerModal'),
      loginButtonExists: !!document.getElementById('loginBtn'),
      registerButtonExists: !!document.getElementById('registerBtn')
    };
    
    const passedCount = Object.values(tests).filter(Boolean).length;
    const totalCount = Object.keys(tests).length;
    
    return {
      passed: passedCount === totalCount,
      total: totalCount,
      passed: passedCount,
      percentage: Math.round(passedCount / totalCount * 100),
      details: tests
    };
  }

  /**
   * 测试工具管理功能
   */
  async testToolManagement() {
    console.log('\n🛠️ 测试工具管理功能...');
    
    try {
      if (window.toolManagementTester) {
        const toolResults = await window.toolManagementTester.runAllTests();
        this.testResults.toolManagement = {
          passed: toolResults.percentage >= 80, // 80%通过率认为成功
          ...toolResults
        };
      } else {
        // 如果没有专门的工具管理测试器，进行基本测试
        const basicToolTest = await this.basicToolManagementTest();
        this.testResults.toolManagement = basicToolTest;
      }
      
      console.log(`${this.testResults.toolManagement.passed ? '✅' : '❌'} 工具管理功能测试完成`);
      
    } catch (error) {
      console.error('❌ 工具管理功能测试失败:', error);
      this.testResults.toolManagement = { passed: false, error: error.message };
    }
  }

  /**
   * 基本工具管理功能测试
   */
  async basicToolManagementTest() {
    const tests = {
      toolsManagerExists: !!window.toolsManager,
      addToolModalExists: !!document.getElementById('addToolModal'),
      editToolModalExists: !!document.getElementById('editToolModal'),
      deleteToolModalExists: !!document.getElementById('deleteToolModal'),
      toolsContainerExists: !!document.getElementById('toolsContainer'),
      systemToolsVisible: document.querySelectorAll('.tool-card').length > 0
    };
    
    const passedCount = Object.values(tests).filter(Boolean).length;
    const totalCount = Object.keys(tests).length;
    
    return {
      passed: passedCount === totalCount,
      total: totalCount,
      passed: passedCount,
      percentage: Math.round(passedCount / totalCount * 100),
      details: tests
    };
  }

  /**
   * 测试搜索功能
   */
  async testSearch() {
    console.log('\n🔍 测试搜索功能...');
    
    try {
      if (window.searchTester) {
        const searchResults = await window.searchTester.runAllTests();
        this.testResults.search = {
          passed: searchResults.percentage >= 80, // 80%通过率认为成功
          ...searchResults
        };
      } else {
        // 如果没有专门的搜索测试器，进行基本测试
        const basicSearchTest = await this.basicSearchTest();
        this.testResults.search = basicSearchTest;
      }
      
      console.log(`${this.testResults.search.passed ? '✅' : '❌'} 搜索功能测试完成`);
      
    } catch (error) {
      console.error('❌ 搜索功能测试失败:', error);
      this.testResults.search = { passed: false, error: error.message };
    }
  }

  /**
   * 基本搜索功能测试
   */
  async basicSearchTest() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
      return { passed: false, error: '搜索输入框不存在' };
    }
    
    try {
      // 测试搜索输入
      const originalValue = searchInput.value;
      searchInput.value = 'ChatGPT';
      
      // 触发搜索
      if (window.app && window.app.handleSearch) {
        window.app.handleSearch('ChatGPT');
      } else {
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
      }
      
      // 等待搜索结果
      await this.delay(500);
      
      // 检查搜索结果
      const visibleTools = document.querySelectorAll('.tool-card:not(.hidden)');
      const hasResults = visibleTools.length > 0;
      
      // 恢复原值
      searchInput.value = originalValue;
      if (window.app && window.app.handleSearch) {
        window.app.handleSearch(originalValue);
      }
      
      return {
        passed: hasResults,
        total: 1,
        passed: hasResults ? 1 : 0,
        percentage: hasResults ? 100 : 0,
        details: { searchWorking: hasResults }
      };
      
    } catch (error) {
      return { passed: false, error: error.message };
    }
  }

  /**
   * 生成总体测试报告
   */
  generateOverallReport() {
    console.log('\n📋 生成总体测试报告...');
    
    const categories = ['environment', 'authentication', 'toolManagement', 'search'];
    let totalPassed = 0;
    let totalTests = 0;
    
    categories.forEach(category => {
      const result = this.testResults[category];
      if (result && typeof result === 'object') {
        if (result.total !== undefined && result.passed !== undefined) {
          totalTests += result.total;
          totalPassed += result.passed;
        } else if (result.passed !== undefined) {
          totalTests += 1;
          totalPassed += result.passed ? 1 : 0;
        }
      }
    });
    
    const overallPercentage = totalTests > 0 ? Math.round(totalPassed / totalTests * 100) : 0;
    const overallPassed = overallPercentage >= 80; // 80%通过率认为整体成功
    
    this.testResults.overall = {
      passed: overallPassed,
      total: totalTests,
      passedCount: totalPassed,
      percentage: overallPercentage,
      duration: this.endTime ? Math.round(this.endTime - this.startTime) : 0,
      timestamp: new Date().toISOString(),
      environment: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  /**
   * 显示最终测试结果
   */
  displayFinalResults() {
    const duration = this.endTime - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 生产环境功能测试完整报告');
    console.log('='.repeat(60));
    
    console.log(`🌐 测试环境: ${window.location.href}`);
    console.log(`⏰ 测试时间: ${new Date().toLocaleString()}`);
    console.log(`⏱️ 测试耗时: ${Math.round(duration)}ms`);
    console.log(`🖥️ 浏览器: ${navigator.userAgent.split(' ').pop()}`);
    
    console.log('\n📊 分类测试结果:');
    
    const categories = [
      { key: 'environment', name: '环境检查', icon: '🔍' },
      { key: 'authentication', name: '认证功能', icon: '🔐' },
      { key: 'toolManagement', name: '工具管理', icon: '🛠️' },
      { key: 'search', name: '搜索功能', icon: '🔍' }
    ];
    
    categories.forEach(category => {
      const result = this.testResults[category.key];
      if (result) {
        const status = result.passed ? '✅ 通过' : '❌ 失败';
        const percentage = result.percentage !== undefined ? ` (${result.percentage}%)` : '';
        console.log(`  ${category.icon} ${category.name}: ${status}${percentage}`);
        
        if (result.error) {
          console.log(`    错误: ${result.error}`);
        }
      }
    });
    
    console.log('\n🎯 总体结果:');
    const overall = this.testResults.overall;
    console.log(`  📈 通过率: ${overall.passedCount}/${overall.total} (${overall.percentage}%)`);
    console.log(`  ${overall.passed ? '🎉 测试通过' : '⚠️ 测试未完全通过'}`);
    
    if (overall.passed) {
      console.log('\n✨ 恭喜！生产环境所有核心功能正常运行');
    } else {
      console.log('\n⚠️ 注意：部分功能存在问题，请检查上述详细结果');
    }
    
    // 生成测试摘要表格
    console.log('\n📋 测试摘要:');
    console.table(this.generateTestSummaryTable());
    
    // 返回测试结果供外部使用
    return this.testResults;
  }

  /**
   * 生成测试摘要表格
   */
  generateTestSummaryTable() {
    const summary = {};
    
    const categories = [
      { key: 'environment', name: '环境检查' },
      { key: 'authentication', name: '认证功能' },
      { key: 'toolManagement', name: '工具管理' },
      { key: 'search', name: '搜索功能' }
    ];
    
    categories.forEach(category => {
      const result = this.testResults[category.key];
      if (result) {
        summary[category.name] = {
          '状态': result.passed ? '✅ 通过' : '❌ 失败',
          '通过率': result.percentage !== undefined ? `${result.percentage}%` : 'N/A',
          '详情': result.error || (result.total ? `${result.passedCount}/${result.total}` : '完成')
        };
      }
    });
    
    return summary;
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 导出测试结果
   */
  exportResults() {
    const exportData = {
      ...this.testResults,
      exportTime: new Date().toISOString(),
      testVersion: '1.0.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `production-test-results-${Date.now()}.json`;
    link.click();
    
    console.log('📄 测试结果已导出为JSON文件');
  }
}

// 创建全局测试实例
window.productionTester = new ProductionFunctionalityTester();

// 导出测试函数
window.runProductionTests = () => window.productionTester.runAllTests();

// 导出结果函数
window.exportProductionTestResults = () => window.productionTester.exportResults();

// 如果在浏览器环境中，添加快捷键
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + P: 运行生产环境测试
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      console.log('🚀 快捷键触发生产环境测试...');
      window.runProductionTests();
    }
  });
}

console.log('🚀 生产环境功能测试脚本已加载');
console.log('📝 使用方法:');
console.log('  1. 调用 runProductionTests() 开始完整测试');
console.log('  2. 或按 Ctrl/Cmd + Shift + P 快捷键');
console.log('  3. 调用 exportProductionTestResults() 导出测试结果');
console.log('  4. 测试将验证所有核心功能在生产环境中的运行状态');
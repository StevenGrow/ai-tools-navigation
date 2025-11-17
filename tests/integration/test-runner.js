/**
 * 综合测试运行器
 * 运行所有本地测试和调试功能
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行此脚本
 * 2. 调用 runAllTests() 开始完整测试
 * 3. 或调用单独的测试函数
 */

class ComprehensiveTestRunner {
  constructor() {
    this.testResults = {
      authentication: null,
      toolManagement: null,
      search: null,
      errorHandling: null,
      overall: null
    };
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始综合测试...');
    console.log('='.repeat(60));
    
    this.startTime = Date.now();
    
    try {
      // 检查测试环境
      const envCheck = this.checkTestEnvironment();
      if (!envCheck.passed) {
        console.error('❌ 测试环境检查失败:', envCheck.details);
        return;
      }
      
      console.log('✅ 测试环境检查通过');
      console.log('');
      
      // 1. 认证功能测试
      console.log('📋 第1阶段: 认证功能测试');
      console.log('-'.repeat(40));
      if (window.runAuthTests) {
        this.testResults.authentication = await window.runAuthTests();
      } else {
        console.error('❌ 认证测试脚本未加载');
      }
      
      await this.delay(2000); // 等待测试完成
      
      // 2. 工具管理功能测试
      console.log('\n📋 第2阶段: 工具管理功能测试');
      console.log('-'.repeat(40));
      if (window.runToolManagementTests) {
        this.testResults.toolManagement = await window.runToolManagementTests();
      } else {
        console.error('❌ 工具管理测试脚本未加载');
      }
      
      await this.delay(2000); // 等待测试完成
      
      // 3. 搜索功能测试
      console.log('\n📋 第3阶段: 搜索功能测试');
      console.log('-'.repeat(40));
      if (window.runSearchTests) {
        this.testResults.search = await window.runSearchTests();
      } else {
        console.error('❌ 搜索测试脚本未加载');
      }
      
      await this.delay(2000); // 等待测试完成
      
      // 4. 错误处理测试
      console.log('\n📋 第4阶段: 错误处理测试');
      console.log('-'.repeat(40));
      if (window.runErrorHandlingTests) {
        this.testResults.errorHandling = await window.runErrorHandlingTests();
      } else {
        console.error('❌ 错误处理测试脚本未加载');
      }
      
      this.endTime = Date.now();
      
      // 生成综合报告
      this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ 综合测试过程中发生错误:', error);
      this.endTime = Date.now();
      this.generateErrorReport(error);
    }
  }

  /**
   * 检查测试环境
   */
  checkTestEnvironment() {
    const checks = {
      supabaseClient: !!window.supabaseClient,
      authManager: !!window.AuthManager,
      toolsManager: !!window.ToolsManager,
      uiManager: !!window.UIManager,
      formValidator: !!window.FormValidator,
      app: !!window.App,
      authTester: !!window.authTester,
      toolManagementTester: !!window.toolManagementTester,
      searchTester: !!window.searchTester,
      errorHandlingTester: !!window.errorHandlingTester
    };
    
    const failed = Object.keys(checks).filter(key => !checks[key]);
    
    return {
      passed: failed.length === 0,
      checks,
      failed,
      details: failed.length > 0 ? `缺少: ${failed.join(', ')}` : '所有组件已加载'
    };
  }

  /**
   * 生成综合报告
   */
  generateComprehensiveReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 综合测试报告');
    console.log('='.repeat(60));
    
    const duration = this.endTime - this.startTime;
    console.log(`⏱️ 测试总耗时: ${Math.round(duration / 1000)}秒`);
    console.log(`📅 测试时间: ${new Date(this.startTime).toLocaleString()}`);
    
    // 统计各模块测试结果
    const moduleResults = [];
    let totalTests = 0;
    let totalPassed = 0;
    
    Object.keys(this.testResults).forEach(module => {
      const result = this.testResults[module];
      if (result && typeof result === 'object') {
        moduleResults.push({
          module: this.getModuleName(module),
          total: result.total || 0,
          passed: result.passed || 0,
          percentage: result.percentage || 0,
          status: result.percentage === 100 ? '✅ 通过' : '⚠️ 部分失败'
        });
        
        totalTests += result.total || 0;
        totalPassed += result.passed || 0;
      }
    });
    
    // 显示模块结果
    console.log('\n📋 各模块测试结果:');
    console.table(moduleResults);
    
    // 计算总体结果
    const overallPercentage = totalTests > 0 ? Math.round(totalPassed / totalTests * 100) : 0;
    this.testResults.overall = {
      total: totalTests,
      passed: totalPassed,
      percentage: overallPercentage,
      duration: Math.round(duration / 1000),
      modules: moduleResults.length
    };
    
    console.log('\n📈 总体测试结果:');
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过测试: ${totalPassed}`);
    console.log(`   通过率: ${overallPercentage}%`);
    console.log(`   测试模块: ${moduleResults.length}`);
    
    // 生成结论
    this.generateConclusion(overallPercentage, moduleResults);
    
    // 生成建议
    this.generateRecommendations(moduleResults);
    
    // 保存测试报告
    this.saveTestReport();
  }

  /**
   * 获取模块名称
   */
  getModuleName(module) {
    const names = {
      authentication: '认证功能',
      toolManagement: '工具管理',
      search: '搜索功能',
      errorHandling: '错误处理'
    };
    return names[module] || module;
  }

  /**
   * 生成结论
   */
  generateConclusion(overallPercentage, moduleResults) {
    console.log('\n🎯 测试结论:');
    
    if (overallPercentage >= 95) {
      console.log('🎉 优秀！所有功能测试基本通过，系统运行良好。');
    } else if (overallPercentage >= 80) {
      console.log('✅ 良好！大部分功能正常，少数问题需要修复。');
    } else if (overallPercentage >= 60) {
      console.log('⚠️ 一般！存在一些功能问题，建议优先修复。');
    } else {
      console.log('❌ 需要改进！存在较多功能问题，需要重点关注。');
    }
    
    // 分析问题模块
    const problemModules = moduleResults.filter(m => m.percentage < 80);
    if (problemModules.length > 0) {
      console.log('\n🔍 需要关注的模块:');
      problemModules.forEach(module => {
        console.log(`   • ${module.module}: ${module.passed}/${module.total} (${module.percentage}%)`);
      });
    }
  }

  /**
   * 生成建议
   */
  generateRecommendations(moduleResults) {
    console.log('\n💡 改进建议:');
    
    const recommendations = [];
    
    moduleResults.forEach(module => {
      if (module.percentage < 100) {
        switch (module.module) {
          case '认证功能':
            if (module.percentage < 80) {
              recommendations.push('• 检查 Supabase 配置和网络连接');
              recommendations.push('• 验证认证流程的错误处理');
            }
            break;
          case '工具管理':
            if (module.percentage < 80) {
              recommendations.push('• 检查数据库权限和 RLS 策略');
              recommendations.push('• 验证工具 CRUD 操作的实现');
            }
            break;
          case '搜索功能':
            if (module.percentage < 80) {
              recommendations.push('• 优化搜索算法和性能');
              recommendations.push('• 检查搜索结果显示逻辑');
            }
            break;
          case '错误处理':
            if (module.percentage < 80) {
              recommendations.push('• 完善错误消息的本地化');
              recommendations.push('• 增强网络错误处理机制');
            }
            break;
        }
      }
    });
    
    if (recommendations.length === 0) {
      console.log('   🎉 所有功能表现良好，无需特别改进！');
    } else {
      recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    // 通用建议
    console.log('\n📝 通用建议:');
    console.log('   • 定期运行测试以确保功能稳定性');
    console.log('   • 在生产环境部署前进行完整测试');
    console.log('   • 关注用户反馈，持续优化用户体验');
    console.log('   • 保持测试脚本与功能代码同步更新');
  }

  /**
   * 保存测试报告
   */
  saveTestReport() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        duration: this.endTime - this.startTime,
        results: this.testResults,
        environment: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };
      
      // 保存到 localStorage
      localStorage.setItem('testReport_' + Date.now(), JSON.stringify(report));
      
      console.log('\n💾 测试报告已保存到本地存储');
      console.log('   可通过浏览器开发者工具查看 localStorage');
      
    } catch (error) {
      console.warn('⚠️ 保存测试报告失败:', error);
    }
  }

  /**
   * 生成错误报告
   */
  generateErrorReport(error) {
    console.log('\n❌ 测试执行错误报告');
    console.log('='.repeat(60));
    console.log('错误信息:', error.message);
    console.log('错误堆栈:', error.stack);
    
    if (this.startTime) {
      const duration = this.endTime - this.startTime;
      console.log(`测试耗时: ${Math.round(duration / 1000)}秒`);
    }
    
    console.log('\n建议:');
    console.log('• 检查所有测试脚本是否正确加载');
    console.log('• 确认应用组件已正确初始化');
    console.log('• 检查网络连接和 Supabase 配置');
    console.log('• 查看浏览器控制台是否有其他错误信息');
  }

  /**
   * 运行单个模块测试
   */
  async runAuthenticationTests() {
    console.log('🔐 运行认证功能测试...');
    if (window.runAuthTests) {
      return await window.runAuthTests();
    } else {
      console.error('❌ 认证测试脚本未加载');
    }
  }

  async runToolManagementTests() {
    console.log('🔧 运行工具管理测试...');
    if (window.runToolManagementTests) {
      return await window.runToolManagementTests();
    } else {
      console.error('❌ 工具管理测试脚本未加载');
    }
  }

  async runSearchTests() {
    console.log('🔍 运行搜索功能测试...');
    if (window.runSearchTests) {
      return await window.runSearchTests();
    } else {
      console.error('❌ 搜索测试脚本未加载');
    }
  }

  async runErrorHandlingTests() {
    console.log('⚠️ 运行错误处理测试...');
    if (window.runErrorHandlingTests) {
      return await window.runErrorHandlingTests();
    } else {
      console.error('❌ 错误处理测试脚本未加载');
    }
  }

  /**
   * 获取测试历史
   */
  getTestHistory() {
    const history = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('testReport_')) {
        try {
          const report = JSON.parse(localStorage.getItem(key));
          history.push({
            key,
            timestamp: report.timestamp,
            duration: report.duration,
            overall: report.results.overall
          });
        } catch (error) {
          console.warn('解析测试报告失败:', key, error);
        }
      }
    }
    
    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 清理测试历史
   */
  clearTestHistory() {
    const keys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('testReport_')) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 已清理 ${keys.length} 个历史测试报告`);
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    console.log('🧪 综合测试运行器帮助');
    console.log('='.repeat(40));
    console.log('');
    console.log('📋 可用命令:');
    console.log('  runAllTests()              - 运行所有测试');
    console.log('  runAuthenticationTests()   - 仅运行认证测试');
    console.log('  runToolManagementTests()   - 仅运行工具管理测试');
    console.log('  runSearchTests()           - 仅运行搜索测试');
    console.log('  runErrorHandlingTests()    - 仅运行错误处理测试');
    console.log('  getTestHistory()           - 查看测试历史');
    console.log('  clearTestHistory()         - 清理测试历史');
    console.log('  showHelp()                 - 显示此帮助信息');
    console.log('');
    console.log('⌨️ 快捷键:');
    console.log('  Ctrl/Cmd + Shift + R       - 运行所有测试');
    console.log('  Ctrl/Cmd + Shift + A       - 运行认证测试');
    console.log('  Ctrl/Cmd + Shift + T       - 运行工具管理测试');
    console.log('  Ctrl/Cmd + Shift + S       - 运行搜索测试');
    console.log('  Ctrl/Cmd + Shift + E       - 运行错误处理测试');
    console.log('');
    console.log('📝 注意事项:');
    console.log('  • 确保所有测试脚本已正确加载');
    console.log('  • 某些测试需要用户登录状态');
    console.log('  • 测试会创建临时数据，完成后会自动清理');
    console.log('  • 建议在测试环境中运行，避免影响生产数据');
  }
}

// 创建全局测试运行器实例
window.testRunner = new ComprehensiveTestRunner();

// 导出主要测试函数
window.runAllTests = () => window.testRunner.runAllTests();
window.showTestHelp = () => window.testRunner.showHelp();

// 添加快捷键支持
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + R: 运行所有测试
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      console.log('🧪 快捷键触发综合测试...');
      window.runAllTests();
    }
    
    // Ctrl/Cmd + Shift + H: 显示帮助
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      window.showTestHelp();
    }
  });
}

console.log('🧪 综合测试运行器已加载');
console.log('📝 使用方法:');
console.log('  1. 调用 runAllTests() 开始完整测试');
console.log('  2. 调用 showTestHelp() 查看详细帮助');
console.log('  3. 或按 Ctrl/Cmd + Shift + R 快捷键运行所有测试');
console.log('  4. 按 Ctrl/Cmd + Shift + H 显示帮助信息');
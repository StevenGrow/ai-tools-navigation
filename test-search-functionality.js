/**
 * 搜索功能测试脚本
 * 测试搜索系统工具、自定义工具和搜索结果显示
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行此脚本
 * 2. 调用 runSearchTests() 开始测试
 */

class SearchFunctionalityTester {
  constructor() {
    this.testResults = {
      systemToolSearch: {},
      customToolSearch: {},
      searchResultDisplay: {},
      searchUIInteraction: {},
      searchPerformance: {}
    };
    this.originalSearchValue = '';
    this.testCustomTools = [];
  }

  /**
   * 运行所有搜索功能测试
   */
  async runAllTests() {
    console.log('🧪 开始搜索功能测试...');
    
    try {
      // 保存当前搜索状态
      this.saveCurrentSearchState();
      
      // 准备测试数据
      await this.prepareTestData();
      
      // 1. 测试系统工具搜索
      await this.testSystemToolSearch();
      
      // 2. 测试自定义工具搜索
      await this.testCustomToolSearch();
      
      // 3. 测试搜索结果显示
      await this.testSearchResultDisplay();
      
      // 4. 测试搜索UI交互
      await this.testSearchUIInteraction();
      
      // 5. 测试搜索性能
      await this.testSearchPerformance();
      
      // 清理测试数据
      await this.cleanupTestData();
      
      // 恢复搜索状态
      this.restoreSearchState();
      
      // 显示测试结果
      this.displayTestResults();
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
      this.restoreSearchState();
      await this.cleanupTestData();
    }
  }

  /**
   * 保存当前搜索状态
   */
  saveCurrentSearchState() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      this.originalSearchValue = searchInput.value;
      console.log('💾 已保存当前搜索状态:', this.originalSearchValue || '(空)');
    }
  }

  /**
   * 恢复搜索状态
   */
  restoreSearchState() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = this.originalSearchValue;
      // 触发搜索以恢复显示状态
      if (window.app && window.app.handleSearch) {
        window.app.handleSearch(this.originalSearchValue);
      }
      console.log('🔄 已恢复搜索状态:', this.originalSearchValue || '(空)');
    }
  }

  /**
   * 准备测试数据
   */
  async prepareTestData() {
    console.log('📋 准备测试数据...');
    
    // 检查是否有用户登录，如果有则创建测试工具
    try {
      if (window.authManager) {
        const currentUser = await window.authManager.getCurrentUser();
        if (currentUser && window.toolsManager) {
          console.log('👤 用户已登录，创建测试自定义工具...');
          
          const testTools = [
            {
              name: 'Search Test Chat Tool',
              url: 'https://search-test-chat.example.com',
              description: '搜索测试聊天工具',
              category: 'chat',
              isFree: true,
              isChinese: true
            },
            {
              name: 'Search Test Image Generator',
              url: 'https://search-test-image.example.com',
              description: '搜索测试图像生成器',
              category: 'image',
              isFree: false,
              isChinese: false
            }
          ];
          
          for (const toolData of testTools) {
            try {
              const addedTool = await window.toolsManager.addTool(toolData);
              if (addedTool) {
                this.testCustomTools.push(addedTool);
                console.log(`✅ 创建测试工具: ${addedTool.tool_name}`);
              }
            } catch (error) {
              console.warn(`⚠️ 创建测试工具失败: ${toolData.name}`, error);
            }
          }
          
          // 等待UI更新
          await this.delay(1000);
        } else {
          console.log('ℹ️ 用户未登录，将只测试系统工具搜索');
        }
      }
    } catch (error) {
      console.warn('⚠️ 准备测试数据时出错:', error);
    }
  }

  /**
   * 测试系统工具搜索
   */
  async testSystemToolSearch() {
    console.log('\n🔍 测试系统工具搜索...');
    
    const searchTests = [
      {
        name: '搜索ChatGPT',
        term: 'ChatGPT',
        expectedResults: ['ChatGPT'],
        shouldFind: true
      },
      {
        name: '搜索对话',
        term: '对话',
        expectedResults: ['ChatGPT', 'Claude', 'Gemini'],
        shouldFind: true
      },
      {
        name: '搜索绘画',
        term: '绘画',
        expectedResults: ['Midjourney', 'Stable Diffusion'],
        shouldFind: true
      },
      {
        name: '搜索免费工具',
        term: '免费',
        expectedResults: ['Claude', 'Gemini', 'Stable Diffusion'],
        shouldFind: true
      },
      {
        name: '搜索中文工具',
        term: '中文',
        expectedResults: ['通义千问', '文心一言'],
        shouldFind: true
      },
      {
        name: '搜索不存在的工具',
        term: 'NonExistentTool12345',
        expectedResults: [],
        shouldFind: false
      }
    ];

    for (const test of searchTests) {
      try {
        console.log(`🔄 执行搜索: "${test.term}"`);
        
        // 执行搜索
        await this.performSearch(test.term);
        
        // 等待搜索结果更新
        await this.delay(500);
        
        // 检查搜索结果
        const searchResults = this.getVisibleSystemTools();
        const foundTools = searchResults.map(tool => tool.name);
        
        // 验证结果
        let testPassed = true;
        let details = [];
        
        if (test.shouldFind) {
          // 检查是否找到了预期的工具
          const foundExpected = test.expectedResults.filter(expected => 
            foundTools.some(found => found.includes(expected))
          );
          
          testPassed = foundExpected.length > 0;
          details.push(`找到 ${foundExpected.length}/${test.expectedResults.length} 个预期工具`);
          details.push(`实际找到: ${foundTools.join(', ')}`);
        } else {
          // 应该没有找到结果
          testPassed = foundTools.length === 0;
          details.push(`预期无结果，实际找到 ${foundTools.length} 个`);
        }
        
        this.testResults.systemToolSearch[test.name] = {
          passed: testPassed,
          searchTerm: test.term,
          expectedResults: test.expectedResults,
          actualResults: foundTools,
          details: details.join('; ')
        };
        
        console.log(`${testPassed ? '✅' : '❌'} ${test.name}: ${testPassed}`);
        console.log(`   找到工具: ${foundTools.length > 0 ? foundTools.join(', ') : '无'}`);
        
      } catch (error) {
        console.error(`❌ ${test.name} 测试失败:`, error);
        this.testResults.systemToolSearch[test.name] = { 
          passed: false, 
          error: error.message 
        };
      }
    }
  }

  /**
   * 测试自定义工具搜索
   */
  async testCustomToolSearch() {
    console.log('\n🔍 测试自定义工具搜索...');
    
    if (this.testCustomTools.length === 0) {
      console.log('ℹ️ 没有自定义工具，跳过自定义工具搜索测试');
      this.testResults.customToolSearch = { 
        passed: true, 
        reason: 'No custom tools available' 
      };
      return;
    }
    
    const searchTests = [
      {
        name: '搜索自定义聊天工具',
        term: 'Search Test Chat',
        shouldFindCustom: true
      },
      {
        name: '搜索自定义图像工具',
        term: 'Search Test Image',
        shouldFindCustom: true
      },
      {
        name: '搜索测试工具通用词',
        term: 'Search Test',
        shouldFindCustom: true
      },
      {
        name: '搜索自定义工具描述',
        term: '搜索测试',
        shouldFindCustom: true
      }
    ];

    for (const test of searchTests) {
      try {
        console.log(`🔄 执行自定义工具搜索: "${test.term}"`);
        
        // 执行搜索
        await this.performSearch(test.term);
        
        // 等待搜索结果更新
        await this.delay(500);
        
        // 检查自定义工具搜索结果
        const customResults = this.getVisibleCustomTools();
        const foundCustomTools = customResults.map(tool => tool.name);
        
        // 验证结果
        let testPassed = false;
        if (test.shouldFindCustom) {
          testPassed = foundCustomTools.length > 0;
        } else {
          testPassed = foundCustomTools.length === 0;
        }
        
        this.testResults.customToolSearch[test.name] = {
          passed: testPassed,
          searchTerm: test.term,
          foundCustomTools,
          customToolCount: foundCustomTools.length
        };
        
        console.log(`${testPassed ? '✅' : '❌'} ${test.name}: ${testPassed}`);
        console.log(`   找到自定义工具: ${foundCustomTools.length > 0 ? foundCustomTools.join(', ') : '无'}`);
        
      } catch (error) {
        console.error(`❌ ${test.name} 测试失败:`, error);
        this.testResults.customToolSearch[test.name] = { 
          passed: false, 
          error: error.message 
        };
      }
    }
  }

  /**
   * 测试搜索结果显示
   */
  async testSearchResultDisplay() {
    console.log('\n📊 测试搜索结果显示...');
    
    const displayTests = [
      {
        name: '搜索结果统计显示',
        term: 'AI',
        checkStats: true
      },
      {
        name: '空搜索结果处理',
        term: 'NonExistentTool99999',
        checkEmpty: true
      },
      {
        name: '搜索高亮显示',
        term: 'ChatGPT',
        checkHighlight: true
      },
      {
        name: '分类隐藏显示',
        term: 'ChatGPT',
        checkCategoryVisibility: true
      }
    ];

    for (const test of displayTests) {
      try {
        console.log(`🔄 测试搜索显示: "${test.term}"`);
        
        // 执行搜索
        await this.performSearch(test.term);
        await this.delay(500);
        
        let testPassed = true;
        const details = [];
        
        if (test.checkStats) {
          // 检查搜索统计显示
          const statsElement = document.querySelector('.search-results-notification');
          const hasStats = !!statsElement;
          details.push(`统计显示: ${hasStats ? '✅' : '❌'}`);
          if (!hasStats) testPassed = false;
        }
        
        if (test.checkEmpty) {
          // 检查空结果处理
          const emptyMessage = document.querySelector('.search-empty-message');
          const hasEmptyMessage = !!emptyMessage;
          details.push(`空结果提示: ${hasEmptyMessage ? '✅' : '❌'}`);
          if (!hasEmptyMessage) testPassed = false;
        }
        
        if (test.checkHighlight) {
          // 检查搜索高亮
          const highlightElements = document.querySelectorAll('.search-highlight');
          const hasHighlight = highlightElements.length > 0;
          details.push(`搜索高亮: ${hasHighlight ? '✅' : '❌'} (${highlightElements.length}个)`);
          if (!hasHighlight) testPassed = false;
        }
        
        if (test.checkCategoryVisibility) {
          // 检查分类显示/隐藏
          const categories = document.querySelectorAll('.category');
          const visibleCategories = Array.from(categories).filter(cat => 
            !cat.classList.contains('hidden')
          );
          const hasVisibleCategories = visibleCategories.length > 0;
          details.push(`可见分类: ${hasVisibleCategories ? '✅' : '❌'} (${visibleCategories.length}个)`);
          if (!hasVisibleCategories) testPassed = false;
        }
        
        this.testResults.searchResultDisplay[test.name] = {
          passed: testPassed,
          searchTerm: test.term,
          details: details.join('; ')
        };
        
        console.log(`${testPassed ? '✅' : '❌'} ${test.name}: ${testPassed}`);
        console.log(`   详情: ${details.join('; ')}`);
        
      } catch (error) {
        console.error(`❌ ${test.name} 测试失败:`, error);
        this.testResults.searchResultDisplay[test.name] = { 
          passed: false, 
          error: error.message 
        };
      }
    }
  }

  /**
   * 测试搜索UI交互
   */
  async testSearchUIInteraction() {
    console.log('\n🖱️ 测试搜索UI交互...');
    
    const uiTests = {
      searchInputExists: this.testSearchInputExists(),
      searchInputFunctionality: await this.testSearchInputFunctionality(),
      keyboardShortcuts: await this.testKeyboardShortcuts(),
      searchClear: await this.testSearchClear()
    };
    
    this.testResults.searchUIInteraction = uiTests;
    
    Object.keys(uiTests).forEach(testName => {
      const result = uiTests[testName];
      console.log(`${result.passed ? '✅' : '❌'} ${testName}: ${result.passed}`);
      if (result.details) {
        console.log(`   详情: ${result.details}`);
      }
    });
  }

  /**
   * 测试搜索输入框存在
   */
  testSearchInputExists() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
      return { passed: false, details: '搜索输入框不存在' };
    }
    
    const hasPlaceholder = !!searchInput.placeholder;
    const isVisible = searchInput.offsetParent !== null;
    
    return {
      passed: hasPlaceholder && isVisible,
      details: `占位符: ${hasPlaceholder}, 可见: ${isVisible}`
    };
  }

  /**
   * 测试搜索输入框功能
   */
  async testSearchInputFunctionality() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
      return { passed: false, details: '搜索输入框不存在' };
    }
    
    try {
      // 测试输入事件
      const originalValue = searchInput.value;
      searchInput.value = 'test';
      
      // 模拟输入事件
      const inputEvent = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(inputEvent);
      
      await this.delay(400); // 等待防抖
      
      // 检查是否触发了搜索
      const hasSearchResults = document.querySelector('.search-results-notification') ||
                              document.querySelector('.search-empty-message') ||
                              document.querySelectorAll('.tool-card.hidden').length > 0;
      
      // 恢复原值
      searchInput.value = originalValue;
      
      return {
        passed: hasSearchResults,
        details: `输入事件触发搜索: ${hasSearchResults ? '✅' : '❌'}`
      };
      
    } catch (error) {
      return { passed: false, details: `测试失败: ${error.message}` };
    }
  }

  /**
   * 测试键盘快捷键
   */
  async testKeyboardShortcuts() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
      return { passed: false, details: '搜索输入框不存在' };
    }
    
    try {
      // 测试 Enter 键
      searchInput.value = 'test';
      searchInput.focus();
      
      const enterEvent = new KeyboardEvent('keyup', { 
        key: 'Enter', 
        bubbles: true 
      });
      searchInput.dispatchEvent(enterEvent);
      
      await this.delay(100);
      
      // 测试 Escape 键
      const escapeEvent = new KeyboardEvent('keyup', { 
        key: 'Escape', 
        bubbles: true 
      });
      searchInput.dispatchEvent(escapeEvent);
      
      await this.delay(100);
      
      const clearedValue = searchInput.value === '';
      
      return {
        passed: clearedValue,
        details: `Escape键清空搜索: ${clearedValue ? '✅' : '❌'}`
      };
      
    } catch (error) {
      return { passed: false, details: `测试失败: ${error.message}` };
    }
  }

  /**
   * 测试搜索清空
   */
  async testSearchClear() {
    try {
      // 先执行一个搜索
      await this.performSearch('test');
      await this.delay(300);
      
      // 然后清空搜索
      await this.performSearch('');
      await this.delay(300);
      
      // 检查是否所有工具都重新显示
      const hiddenTools = document.querySelectorAll('.tool-card.hidden');
      const allToolsVisible = hiddenTools.length === 0;
      
      // 检查是否清除了搜索指示器
      const searchIndicators = document.querySelectorAll('.search-results-notification, .search-empty-message, .search-highlight');
      const indicatorsCleared = searchIndicators.length === 0;
      
      return {
        passed: allToolsVisible && indicatorsCleared,
        details: `工具重新显示: ${allToolsVisible ? '✅' : '❌'}, 指示器清除: ${indicatorsCleared ? '✅' : '❌'}`
      };
      
    } catch (error) {
      return { passed: false, details: `测试失败: ${error.message}` };
    }
  }

  /**
   * 测试搜索性能
   */
  async testSearchPerformance() {
    console.log('\n⚡ 测试搜索性能...');
    
    const performanceTests = [
      { name: '短词搜索', term: 'AI' },
      { name: '长词搜索', term: 'ChatGPT OpenAI Assistant' },
      { name: '中文搜索', term: '人工智能助手' },
      { name: '特殊字符搜索', term: 'AI-Tool@2024' }
    ];

    for (const test of performanceTests) {
      try {
        console.log(`⚡ 性能测试: "${test.term}"`);
        
        const startTime = performance.now();
        
        // 执行搜索
        await this.performSearch(test.term);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 性能标准：搜索应在500ms内完成
        const performanceGood = duration < 500;
        
        this.testResults.searchPerformance[test.name] = {
          passed: performanceGood,
          duration: Math.round(duration),
          searchTerm: test.term
        };
        
        console.log(`${performanceGood ? '✅' : '❌'} ${test.name}: ${Math.round(duration)}ms`);
        
      } catch (error) {
        console.error(`❌ ${test.name} 性能测试失败:`, error);
        this.testResults.searchPerformance[test.name] = { 
          passed: false, 
          error: error.message 
        };
      }
    }
  }

  /**
   * 执行搜索
   */
  async performSearch(term) {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
      throw new Error('搜索输入框不存在');
    }
    
    // 设置搜索词
    searchInput.value = term;
    
    // 触发搜索
    if (window.app && window.app.handleSearch) {
      window.app.handleSearch(term);
    } else {
      // 备用方法：触发输入事件
      const inputEvent = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(inputEvent);
    }
  }

  /**
   * 获取可见的系统工具
   */
  getVisibleSystemTools() {
    const systemToolCards = document.querySelectorAll('.tool-card[data-custom="false"]:not(.hidden), .tool-card:not([data-custom]):not(.hidden)');
    
    return Array.from(systemToolCards).map(card => ({
      name: card.getAttribute('data-name') || card.querySelector('.tool-name')?.textContent || '',
      description: card.getAttribute('data-desc') || card.querySelector('.tool-desc')?.textContent || '',
      element: card
    }));
  }

  /**
   * 获取可见的自定义工具
   */
  getVisibleCustomTools() {
    const customToolCards = document.querySelectorAll('.tool-card[data-custom="true"]:not(.hidden)');
    
    return Array.from(customToolCards).map(card => ({
      name: card.getAttribute('data-name') || card.querySelector('.tool-name')?.textContent || '',
      description: card.getAttribute('data-desc') || card.querySelector('.tool-desc')?.textContent || '',
      id: card.getAttribute('data-tool-id'),
      element: card
    }));
  }

  /**
   * 清理测试数据
   */
  async cleanupTestData() {
    console.log('\n🧹 清理搜索测试数据...');
    
    // 删除创建的测试工具
    for (const tool of this.testCustomTools) {
      try {
        if (window.toolsManager) {
          await window.toolsManager.deleteTool(tool.id);
          console.log(`✅ 已删除测试工具: ${tool.tool_name}`);
        }
      } catch (error) {
        console.warn(`⚠️ 删除测试工具失败: ${tool.tool_name}`, error);
      }
    }
    
    this.testCustomTools = [];
    
    // 清除搜索状态
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
      if (window.app && window.app.handleSearch) {
        window.app.handleSearch('');
      }
    }
    
    console.log('✅ 搜索测试数据清理完成');
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 显示测试结果
   */
  displayTestResults() {
    console.log('\n📊 搜索功能测试结果汇总:');
    console.log('='.repeat(50));
    
    const categories = [
      { key: 'systemToolSearch', name: '系统工具搜索' },
      { key: 'customToolSearch', name: '自定义工具搜索' },
      { key: 'searchResultDisplay', name: '搜索结果显示' },
      { key: 'searchUIInteraction', name: '搜索UI交互' },
      { key: 'searchPerformance', name: '搜索性能' }
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    
    categories.forEach(category => {
      const results = this.testResults[category.key];
      console.log(`\n${category.name}:`);
      
      if (typeof results === 'object' && results !== null) {
        if (results.reason) {
          // 跳过的测试
          console.log(`  ⏭️ 跳过: ${results.reason}`);
        } else {
          // 包含多个子测试的分类
          Object.keys(results).forEach(testName => {
            const testResult = results[testName];
            const passed = testResult.passed;
            console.log(`  ${passed ? '✅' : '❌'} ${testName}`);
            totalTests++;
            if (passed) passedTests++;
            
            if (testResult.duration !== undefined) {
              console.log(`    耗时: ${testResult.duration}ms`);
            }
          });
        }
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`📈 测试统计: ${passedTests}/${totalTests} 通过 (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有搜索功能测试通过！');
    } else {
      console.log('⚠️ 部分测试未通过，请检查上述结果');
    }
    
    // 显示详细结果对象
    console.log('\n📋 详细测试结果:');
    console.table(this.getTestSummary());
    
    return {
      total: totalTests,
      passed: passedTests,
      percentage: Math.round(passedTests/totalTests*100),
      details: this.testResults
    };
  }

  /**
   * 获取测试摘要
   */
  getTestSummary() {
    const summary = {};
    
    // 各个测试分类的统计
    ['systemToolSearch', 'customToolSearch', 'searchResultDisplay', 'searchUIInteraction', 'searchPerformance'].forEach(key => {
      const results = this.testResults[key];
      if (results && !results.reason) {
        const tests = Object.keys(results);
        const passed = tests.filter(test => results[test].passed).length;
        
        const name = {
          systemToolSearch: '系统工具搜索',
          customToolSearch: '自定义工具搜索',
          searchResultDisplay: '搜索结果显示',
          searchUIInteraction: '搜索UI交互',
          searchPerformance: '搜索性能'
        }[key];
        
        summary[name] = `${passed}/${tests.length}`;
      } else if (results && results.reason) {
        const name = {
          customToolSearch: '自定义工具搜索'
        }[key];
        if (name) {
          summary[name] = '跳过';
        }
      }
    });
    
    return summary;
  }
}

// 创建全局测试实例
window.searchTester = new SearchFunctionalityTester();

// 导出测试函数
window.runSearchTests = () => window.searchTester.runAllTests();

// 如果在浏览器环境中，添加快捷键
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + S: 运行搜索测试
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      console.log('🧪 快捷键触发搜索测试...');
      window.runSearchTests();
    }
  });
}

console.log('🧪 搜索功能测试脚本已加载');
console.log('📝 使用方法:');
console.log('  1. 调用 runSearchTests() 开始测试');
console.log('  2. 或按 Ctrl/Cmd + Shift + S 快捷键');
console.log('  3. 测试将验证系统工具和自定义工具的搜索功能');
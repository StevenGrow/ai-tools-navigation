/**
 * 工具管理功能测试脚本
 * 测试添加、查看、编辑、删除工具功能
 * 
 * 使用方法：
 * 1. 确保用户已登录
 * 2. 在浏览器控制台中运行此脚本
 * 3. 调用 runToolManagementTests() 开始测试
 */

class ToolManagementTester {
  constructor() {
    this.testResults = {
      addTool: {},
      viewTools: {},
      editTool: {},
      deleteTool: {},
      toolValidation: {},
      uiInteraction: {}
    };
    this.testTools = [];
    this.originalTools = [];
  }

  /**
   * 运行所有工具管理测试
   */
  async runAllTests() {
    console.log('🧪 开始工具管理功能测试...');
    
    try {
      // 检查用户登录状态
      const isLoggedIn = await this.checkLoginStatus();
      if (!isLoggedIn) {
        console.error('❌ 用户未登录，无法进行工具管理测试');
        return;
      }
      
      // 保存当前工具状态
      await this.saveCurrentToolsState();
      
      // 1. 测试工具数据验证
      await this.testToolValidation();
      
      // 2. 测试添加工具功能
      await this.testAddToolFunctionality();
      
      // 3. 测试查看工具功能
      await this.testViewToolsFunctionality();
      
      // 4. 测试编辑工具功能
      await this.testEditToolFunctionality();
      
      // 5. 测试删除工具功能
      await this.testDeleteToolFunctionality();
      
      // 6. 测试UI交互
      await this.testUIInteraction();
      
      // 清理测试数据
      await this.cleanupTestData();
      
      // 显示测试结果
      this.displayTestResults();
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
      await this.cleanupTestData();
    }
  }

  /**
   * 检查用户登录状态
   */
  async checkLoginStatus() {
    try {
      if (!window.authManager) {
        console.error('❌ AuthManager 未初始化');
        return false;
      }
      
      const currentUser = await window.authManager.getCurrentUser();
      if (!currentUser) {
        console.error('❌ 用户未登录');
        return false;
      }
      
      console.log('✅ 用户已登录:', currentUser.email);
      return true;
    } catch (error) {
      console.error('❌ 检查登录状态失败:', error);
      return false;
    }
  }

  /**
   * 保存当前工具状态
   */
  async saveCurrentToolsState() {
    try {
      if (window.app && window.app.customTools) {
        this.originalTools = [...window.app.customTools];
        console.log('💾 已保存当前工具状态，共', this.originalTools.length, '个工具');
      }
    } catch (error) {
      console.warn('⚠️ 保存工具状态失败:', error);
    }
  }

  /**
   * 测试工具数据验证
   */
  async testToolValidation() {
    console.log('\n📝 测试工具数据验证...');
    
    const validationTests = [
      {
        name: '空工具名称',
        data: { name: '', url: 'https://example.com', category: 'chat' },
        shouldFail: true
      },
      {
        name: '过长工具名称',
        data: { name: 'a'.repeat(101), url: 'https://example.com', category: 'chat' },
        shouldFail: true
      },
      {
        name: '空工具网址',
        data: { name: 'Test Tool', url: '', category: 'chat' },
        shouldFail: true
      },
      {
        name: '无效网址格式',
        data: { name: 'Test Tool', url: 'invalid-url', category: 'chat' },
        shouldFail: true
      },
      {
        name: '无效分类',
        data: { name: 'Test Tool', url: 'https://example.com', category: 'invalid' },
        shouldFail: true
      },
      {
        name: '过长描述',
        data: { name: 'Test Tool', url: 'https://example.com', category: 'chat', description: 'a'.repeat(201) },
        shouldFail: true
      },
      {
        name: '有效工具数据',
        data: { name: 'Test Tool', url: 'https://example.com', category: 'chat', description: 'Valid description' },
        shouldFail: false
      }
    ];

    for (const test of validationTests) {
      try {
        if (!window.toolsManager) {
          console.error('❌ ToolsManager 未初始化');
          break;
        }
        
        const errors = window.toolsManager.validateToolData(test.data);
        const hasErrors = errors.length > 0;
        const passed = test.shouldFail ? hasErrors : !hasErrors;
        
        this.testResults.toolValidation[test.name] = {
          passed,
          errors,
          expectedToFail: test.shouldFail
        };
        
        console.log(`${passed ? '✅' : '❌'} ${test.name}`);
        if (hasErrors && test.shouldFail) {
          console.log(`   验证错误: ${errors[0]}`);
        }
        
      } catch (error) {
        console.error(`❌ ${test.name} 测试失败:`, error);
        this.testResults.toolValidation[test.name] = { passed: false, error: error.message };
      }
    }
  }

  /**
   * 测试添加工具功能
   */
  async testAddToolFunctionality() {
    console.log('\n➕ 测试添加工具功能...');
    
    const testToolsData = [
      {
        name: 'Test Chat Tool',
        url: 'https://test-chat.example.com',
        description: '测试聊天工具',
        category: 'chat',
        isFree: true,
        isChinese: true
      },
      {
        name: 'Test Image Tool',
        url: 'https://test-image.example.com',
        description: '测试图像工具',
        category: 'image',
        isFree: false,
        isChinese: false
      }
    ];

    for (let i = 0; i < testToolsData.length; i++) {
      const toolData = testToolsData[i];
      try {
        console.log(`🔄 添加测试工具 ${i + 1}: ${toolData.name}`);
        
        const addedTool = await window.toolsManager.addTool(toolData);
        
        if (addedTool && addedTool.id) {
          this.testTools.push(addedTool);
          
          // 验证工具数据
          const dataMatches = this.verifyToolData(addedTool, toolData);
          
          this.testResults.addTool[`tool_${i + 1}`] = {
            passed: true,
            tool: addedTool,
            dataMatches
          };
          
          console.log(`✅ 工具添加成功: ${addedTool.tool_name}`);
          console.log(`   ID: ${addedTool.id}`);
          console.log(`   数据匹配: ${dataMatches ? '✅' : '❌'}`);
          
          // 检查工具是否出现在UI中
          await this.delay(1000);
          const uiCheck = this.checkToolInUI(addedTool);
          this.testResults.addTool[`tool_${i + 1}`].uiCheck = uiCheck;
          
        } else {
          throw new Error('添加工具返回无效数据');
        }
        
      } catch (error) {
        console.error(`❌ 添加工具 ${i + 1} 失败:`, error);
        this.testResults.addTool[`tool_${i + 1}`] = { 
          passed: false, 
          error: error.message 
        };
      }
    }
  }

  /**
   * 测试查看工具功能
   */
  async testViewToolsFunctionality() {
    console.log('\n👀 测试查看工具功能...');
    
    try {
      if (!window.authManager || !window.toolsManager) {
        throw new Error('管理器未初始化');
      }
      
      const currentUser = await window.authManager.getCurrentUser();
      if (!currentUser) {
        throw new Error('用户未登录');
      }
      
      // 获取用户工具
      console.log('🔄 获取用户工具列表...');
      const userTools = await window.toolsManager.getUserTools(currentUser.id);
      
      // 验证测试工具是否在列表中
      const testToolsFound = this.testTools.every(testTool => 
        userTools.some(userTool => userTool.id === testTool.id)
      );
      
      console.log(`✅ 获取到 ${userTools.length} 个用户工具`);
      console.log(`${testToolsFound ? '✅' : '❌'} 测试工具在列表中: ${testToolsFound}`);
      
      // 检查工具在UI中的显示
      const uiDisplayCheck = this.checkToolsDisplayInUI(userTools);
      
      this.testResults.viewTools = {
        passed: userTools.length >= this.testTools.length && testToolsFound && uiDisplayCheck.passed,
        userToolsCount: userTools.length,
        testToolsFound,
        uiDisplayCheck
      };
      
    } catch (error) {
      console.error('❌ 查看工具功能测试失败:', error);
      this.testResults.viewTools = { passed: false, error: error.message };
    }
  }

  /**
   * 测试编辑工具功能
   */
  async testEditToolFunctionality() {
    console.log('\n✏️ 测试编辑工具功能...');
    
    if (this.testTools.length === 0) {
      console.log('⚠️ 没有测试工具可编辑');
      this.testResults.editTool = { passed: false, reason: 'No test tools available' };
      return;
    }
    
    const toolToEdit = this.testTools[0];
    const updatedData = {
      name: toolToEdit.tool_name + ' (已编辑)',
      url: 'https://edited-' + toolToEdit.tool_url.replace('https://', ''),
      description: toolToEdit.tool_desc + ' - 已编辑',
      category: toolToEdit.category === 'chat' ? 'image' : 'chat',
      isFree: !toolToEdit.is_free,
      isChinese: !toolToEdit.is_chinese
    };
    
    try {
      console.log(`🔄 编辑工具: ${toolToEdit.tool_name}`);
      
      const updatedTool = await window.toolsManager.updateTool(toolToEdit.id, updatedData);
      
      if (updatedTool) {
        // 验证更新的数据
        const dataMatches = this.verifyToolData(updatedTool, updatedData);
        
        // 更新测试工具数组中的数据
        const toolIndex = this.testTools.findIndex(t => t.id === toolToEdit.id);
        if (toolIndex !== -1) {
          this.testTools[toolIndex] = updatedTool;
        }
        
        console.log(`✅ 工具编辑成功: ${updatedTool.tool_name}`);
        console.log(`   数据匹配: ${dataMatches ? '✅' : '❌'}`);
        
        // 检查UI中的更新
        await this.delay(1000);
        const uiCheck = this.checkToolInUI(updatedTool);
        
        this.testResults.editTool = {
          passed: true,
          originalTool: toolToEdit,
          updatedTool,
          dataMatches,
          uiCheck
        };
        
      } else {
        throw new Error('编辑工具返回无效数据');
      }
      
    } catch (error) {
      console.error('❌ 编辑工具失败:', error);
      this.testResults.editTool = { passed: false, error: error.message };
    }
  }

  /**
   * 测试删除工具功能
   */
  async testDeleteToolFunctionality() {
    console.log('\n🗑️ 测试删除工具功能...');
    
    if (this.testTools.length === 0) {
      console.log('⚠️ 没有测试工具可删除');
      this.testResults.deleteTool = { passed: false, reason: 'No test tools available' };
      return;
    }
    
    const toolToDelete = this.testTools[this.testTools.length - 1]; // 删除最后一个
    
    try {
      console.log(`🔄 删除工具: ${toolToDelete.tool_name}`);
      
      const deleteResult = await window.toolsManager.deleteTool(toolToDelete.id);
      
      if (deleteResult) {
        console.log(`✅ 工具删除成功: ${toolToDelete.tool_name}`);
        
        // 验证工具是否真的被删除
        await this.delay(1000);
        
        // 尝试重新获取工具列表，确认工具已被删除
        const currentUser = await window.authManager.getCurrentUser();
        const userTools = await window.toolsManager.getUserTools(currentUser.id);
        const toolStillExists = userTools.some(tool => tool.id === toolToDelete.id);
        
        // 检查UI中是否还存在该工具
        const uiCheck = this.checkToolInUI(toolToDelete);
        const toolRemovedFromUI = !uiCheck.found;
        
        console.log(`${!toolStillExists ? '✅' : '❌'} 工具从数据库中删除: ${!toolStillExists}`);
        console.log(`${toolRemovedFromUI ? '✅' : '❌'} 工具从UI中移除: ${toolRemovedFromUI}`);
        
        // 从测试工具数组中移除
        this.testTools = this.testTools.filter(t => t.id !== toolToDelete.id);
        
        this.testResults.deleteTool = {
          passed: !toolStillExists && toolRemovedFromUI,
          deletedTool: toolToDelete,
          toolStillExists,
          toolRemovedFromUI
        };
        
      } else {
        throw new Error('删除工具返回失败结果');
      }
      
    } catch (error) {
      console.error('❌ 删除工具失败:', error);
      this.testResults.deleteTool = { passed: false, error: error.message };
    }
  }

  /**
   * 测试UI交互
   */
  async testUIInteraction() {
    console.log('\n🖱️ 测试UI交互...');
    
    const uiTests = {
      addToolButton: this.testAddToolButton(),
      modalInteraction: this.testModalInteraction(),
      toolCardActions: this.testToolCardActions(),
      formValidation: this.testFormUIValidation()
    };
    
    this.testResults.uiInteraction = uiTests;
    
    Object.keys(uiTests).forEach(testName => {
      const result = uiTests[testName];
      console.log(`${result.passed ? '✅' : '❌'} ${testName}: ${result.passed}`);
      if (result.details) {
        console.log(`   详情: ${result.details}`);
      }
    });
  }

  /**
   * 测试添加工具按钮
   */
  testAddToolButton() {
    const addToolBtn = document.getElementById('addToolBtn');
    
    if (!addToolBtn) {
      return { passed: false, details: '添加工具按钮不存在' };
    }
    
    const isVisible = addToolBtn.classList.contains('show');
    const hasClickHandler = addToolBtn.onclick !== null || 
                           addToolBtn.addEventListener !== undefined;
    
    return {
      passed: isVisible && hasClickHandler,
      details: `可见: ${isVisible}, 有点击处理: ${hasClickHandler}`
    };
  }

  /**
   * 测试模态框交互
   */
  testModalInteraction() {
    const modals = ['addToolModal', 'editToolModal', 'deleteToolModal'];
    let allPassed = true;
    const details = [];
    
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        const hasCloseBtn = modal.querySelector('.modal-close') !== null;
        const hasForm = modal.querySelector('form') !== null;
        
        const modalPassed = hasCloseBtn && (modalId === 'deleteToolModal' || hasForm);
        if (!modalPassed) allPassed = false;
        
        details.push(`${modalId}: ${modalPassed ? '✅' : '❌'}`);
      } else {
        allPassed = false;
        details.push(`${modalId}: ❌ 不存在`);
      }
    });
    
    return {
      passed: allPassed,
      details: details.join(', ')
    };
  }

  /**
   * 测试工具卡片操作
   */
  testToolCardActions() {
    const customToolCards = document.querySelectorAll('.tool-card[data-custom="true"]');
    
    if (customToolCards.length === 0) {
      return { passed: true, details: '没有自定义工具卡片需要测试' };
    }
    
    let allHaveActions = true;
    let actionButtonCount = 0;
    
    customToolCards.forEach(card => {
      const editBtn = card.querySelector('.edit-tool-btn');
      const deleteBtn = card.querySelector('.delete-tool-btn');
      
      if (editBtn) actionButtonCount++;
      if (deleteBtn) actionButtonCount++;
      
      if (!editBtn || !deleteBtn) {
        allHaveActions = false;
      }
    });
    
    return {
      passed: allHaveActions,
      details: `${customToolCards.length} 个卡片, ${actionButtonCount} 个操作按钮`
    };
  }

  /**
   * 测试表单UI验证
   */
  testFormUIValidation() {
    const forms = ['addToolForm', 'editToolForm'];
    let allFormsValid = true;
    const details = [];
    
    forms.forEach(formId => {
      const form = document.getElementById(formId);
      if (form) {
        const requiredFields = form.querySelectorAll('[required]');
        const errorElements = form.querySelectorAll('.error-message');
        
        const hasRequiredFields = requiredFields.length > 0;
        const hasErrorElements = errorElements.length > 0;
        
        const formValid = hasRequiredFields && hasErrorElements;
        if (!formValid) allFormsValid = false;
        
        details.push(`${formId}: ${formValid ? '✅' : '❌'}`);
      } else {
        allFormsValid = false;
        details.push(`${formId}: ❌ 不存在`);
      }
    });
    
    return {
      passed: allFormsValid,
      details: details.join(', ')
    };
  }

  /**
   * 验证工具数据
   */
  verifyToolData(actualTool, expectedData) {
    return actualTool.tool_name === expectedData.name &&
           actualTool.tool_url === expectedData.url &&
           actualTool.tool_desc === (expectedData.description || '') &&
           actualTool.category === expectedData.category &&
           actualTool.is_free === (expectedData.isFree || false) &&
           actualTool.is_chinese === (expectedData.isChinese || false);
  }

  /**
   * 检查工具是否在UI中显示
   */
  checkToolInUI(tool) {
    const toolCard = document.querySelector(`[data-tool-id="${tool.id}"]`);
    
    if (!toolCard) {
      return { found: false, details: '工具卡片未找到' };
    }
    
    const nameElement = toolCard.querySelector('.tool-name');
    const descElement = toolCard.querySelector('.tool-desc');
    const categorySection = toolCard.closest('.category');
    
    const nameMatches = nameElement && nameElement.textContent.includes(tool.tool_name);
    const descMatches = descElement && descElement.textContent.includes(tool.tool_desc);
    const inCorrectCategory = categorySection && categorySection.id === tool.category;
    
    return {
      found: true,
      nameMatches,
      descMatches,
      inCorrectCategory,
      passed: nameMatches && descMatches && inCorrectCategory
    };
  }

  /**
   * 检查工具在UI中的显示
   */
  checkToolsDisplayInUI(tools) {
    let allDisplayed = true;
    let displayedCount = 0;
    
    tools.forEach(tool => {
      const uiCheck = this.checkToolInUI(tool);
      if (uiCheck.found && uiCheck.passed) {
        displayedCount++;
      } else {
        allDisplayed = false;
      }
    });
    
    return {
      passed: allDisplayed,
      displayedCount,
      totalCount: tools.length
    };
  }

  /**
   * 清理测试数据
   */
  async cleanupTestData() {
    console.log('\n🧹 清理测试数据...');
    
    for (const tool of this.testTools) {
      try {
        await window.toolsManager.deleteTool(tool.id);
        console.log(`✅ 已删除测试工具: ${tool.tool_name}`);
      } catch (error) {
        console.warn(`⚠️ 删除测试工具失败: ${tool.tool_name}`, error);
      }
    }
    
    this.testTools = [];
    console.log('✅ 测试数据清理完成');
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
    console.log('\n📊 工具管理功能测试结果汇总:');
    console.log('='.repeat(50));
    
    const categories = [
      { key: 'toolValidation', name: '工具数据验证' },
      { key: 'addTool', name: '添加工具' },
      { key: 'viewTools', name: '查看工具' },
      { key: 'editTool', name: '编辑工具' },
      { key: 'deleteTool', name: '删除工具' },
      { key: 'uiInteraction', name: 'UI交互' }
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    
    categories.forEach(category => {
      const results = this.testResults[category.key];
      console.log(`\n${category.name}:`);
      
      if (typeof results === 'object' && results !== null) {
        if (category.key === 'toolValidation' || category.key === 'addTool' || category.key === 'uiInteraction') {
          // 这些分类包含多个子测试
          Object.keys(results).forEach(testName => {
            const testResult = results[testName];
            const passed = testResult.passed;
            console.log(`  ${passed ? '✅' : '❌'} ${testName}`);
            totalTests++;
            if (passed) passedTests++;
          });
        } else {
          // 单个测试结果
          const passed = results.passed;
          console.log(`  ${passed ? '✅' : '❌'} ${category.name}`);
          totalTests++;
          if (passed) passedTests++;
          
          if (results.error) {
            console.log(`    错误: ${results.error}`);
          }
        }
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`📈 测试统计: ${passedTests}/${totalTests} 通过 (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有工具管理功能测试通过！');
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
    
    // 工具验证
    const validationResults = this.testResults.toolValidation;
    if (validationResults) {
      const validationTests = Object.keys(validationResults);
      const validationPassed = validationTests.filter(test => validationResults[test].passed).length;
      summary['工具数据验证'] = `${validationPassed}/${validationTests.length}`;
    }
    
    // 添加工具
    const addResults = this.testResults.addTool;
    if (addResults) {
      const addTests = Object.keys(addResults);
      const addPassed = addTests.filter(test => addResults[test].passed).length;
      summary['添加工具'] = `${addPassed}/${addTests.length}`;
    }
    
    // 其他单项测试
    ['viewTools', 'editTool', 'deleteTool'].forEach(key => {
      const result = this.testResults[key];
      if (result) {
        const name = {
          viewTools: '查看工具',
          editTool: '编辑工具',
          deleteTool: '删除工具'
        }[key];
        summary[name] = result.passed ? '✅ 通过' : '❌ 失败';
      }
    });
    
    // UI交互
    const uiResults = this.testResults.uiInteraction;
    if (uiResults) {
      const uiTests = Object.keys(uiResults);
      const uiPassed = uiTests.filter(test => uiResults[test].passed).length;
      summary['UI交互'] = `${uiPassed}/${uiTests.length}`;
    }
    
    return summary;
  }
}

// 创建全局测试实例
window.toolManagementTester = new ToolManagementTester();

// 导出测试函数
window.runToolManagementTests = () => window.toolManagementTester.runAllTests();

// 如果在浏览器环境中，添加快捷键
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + T: 运行工具管理测试
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      console.log('🧪 快捷键触发工具管理测试...');
      window.runToolManagementTests();
    }
  });
}

console.log('🧪 工具管理功能测试脚本已加载');
console.log('📝 使用方法:');
console.log('  1. 确保用户已登录');
console.log('  2. 调用 runToolManagementTests() 开始测试');
console.log('  3. 或按 Ctrl/Cmd + Shift + T 快捷键');
console.log('  4. 测试将创建临时工具进行完整的CRUD测试');
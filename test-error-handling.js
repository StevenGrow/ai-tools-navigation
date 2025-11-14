/**
 * 错误处理测试脚本
 * 测试各种错误场景、错误消息显示和网络错误处理
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行此脚本
 * 2. 调用 runErrorHandlingTests() 开始测试
 */

class ErrorHandlingTester {
  constructor() {
    this.testResults = {
      authenticationErrors: {},
      toolManagementErrors: {},
      networkErrors: {},
      validationErrors: {},
      uiErrorDisplay: {}
    };
    this.originalNetworkStatus = navigator.onLine;
    this.testEmail = `error_test_${Date.now()}@example.com`;
    this.testPassword = 'errortest123';
  }

  /**
   * 运行所有错误处理测试
   */
  async runAllTests() {
    console.log('🧪 开始错误处理测试...');
    
    try {
      // 1. 测试认证错误处理
      await this.testAuthenticationErrors();
      
      // 2. 测试工具管理错误处理
      await this.testToolManagementErrors();
      
      // 3. 测试表单验证错误
      await this.testValidationErrors();
      
      // 4. 测试UI错误显示
      await this.testUIErrorDisplay();
      
      // 5. 测试网络错误处理
      await this.testNetworkErrors();
      
      // 显示测试结果
      this.displayTestResults();
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
    }
  }

  /**
   * 测试认证错误处理
   */
  async testAuthenticationErrors() {
    console.log('\n🔐 测试认证错误处理...');
    
    const authErrorTests = [
      {
        name: '无效邮箱登录',
        action: async () => {
          if (!window.authManager) throw new Error('AuthManager未初始化');
          return await window.authManager.signIn('invalid@nonexistent.com', 'wrongpassword');
        },
        expectedError: true,
        errorKeywords: ['邮箱', '密码', '错误', '凭证']
      },
      {
        name: '空邮箱登录',
        action: async () => {
          if (!window.authManager) throw new Error('AuthManager未初始化');
          return await window.authManager.signIn('', 'password');
        },
        expectedError: true,
        errorKeywords: ['邮箱', '空', '格式']
      },
      {
        name: '空密码登录',
        action: async () => {
          if (!window.authManager) throw new Error('AuthManager未初始化');
          return await window.authManager.signIn('test@example.com', '');
        },
        expectedError: true,
        errorKeywords: ['密码', '空', '字符']
      },
      {
        name: '短密码注册',
        action: async () => {
          if (!window.authManager) throw new Error('AuthManager未初始化');
          return await window.authManager.signUp('test@example.com', '123');
        },
        expectedError: true,
        errorKeywords: ['密码', '字符', '6']
      },
      {
        name: '无效邮箱格式注册',
        action: async () => {
          if (!window.authManager) throw new Error('AuthManager未初始化');
          return await window.authManager.signUp('invalid-email', 'password123');
        },
        expectedError: true,
        errorKeywords: ['邮箱', '格式', '有效']
      }
    ];

    for (const test of authErrorTests) {
      try {
        console.log(`🔄 测试: ${test.name}`);
        
        const result = await test.action();
        
        // 验证是否按预期失败
        const failedAsExpected = test.expectedError ? !result.success : result.success;
        
        // 检查错误消息是否包含预期关键词
        let errorMessageValid = true;
        if (test.expectedError && result.error) {
          const errorMessage = result.error.toLowerCase();
          const hasKeyword = test.errorKeywords.some(keyword => 
            errorMessage.includes(keyword.toLowerCase())
          );
          errorMessageValid = hasKeyword;
        }
        
        const testPassed = failedAsExpected && (test.expectedError ? errorMessageValid : true);
        
        this.testResults.authenticationErrors[test.name] = {
          passed: testPassed,
          result,
          failedAsExpected,
          errorMessageValid,
          errorMessage: result.error || null
        };
        
        console.log(`${testPassed ? '✅' : '❌'} ${test.name}`);
        if (result.error) {
          console.log(`   错误信息: ${result.error}`);
        }
        
      } catch (error) {
        console.error(`❌ ${test.name} 测试异常:`, error);
        this.testResults.authenticationErrors[test.name] = { 
          passed: false, 
          error: error.message 
        };
      }
    }
  }

  /**
   * 测试工具管理错误处理
   */
  async testToolManagementErrors() {
    console.log('\n🔧 测试工具管理错误处理...');
    
    // 首先确保用户已登录
    const isLoggedIn = await this.ensureUserLoggedIn();
    if (!isLoggedIn) {
      console.log('⚠️ 用户未登录，跳过工具管理错误测试');
      this.testResults.toolManagementErrors = { 
        passed: true, 
        reason: 'User not logged in' 
      };
      return;
    }
    
    const toolErrorTests = [
      {
        name: '空工具名称添加',
        action: async () => {
          if (!window.toolsManager) throw new Error('ToolsManager未初始化');
          return await window.toolsManager.addTool({
            name: '',
            url: 'https://example.com',
            category: 'chat'
          });
        },
        expectedError: true,
        errorKeywords: ['名称', '空', '不能']
      },
      {
        name: '无效URL添加',
        action: async () => {
          if (!window.toolsManager) throw new Error('ToolsManager未初始化');
          return await window.toolsManager.addTool({
            name: 'Test Tool',
            url: 'invalid-url',
            category: 'chat'
          });
        },
        expectedError: true,
        errorKeywords: ['网址', 'URL', '格式', '有效']
      },
      {
        name: '无效分类添加',
        action: async () => {
          if (!window.toolsManager) throw new Error('ToolsManager未初始化');
          return await window.toolsManager.addTool({
            name: 'Test Tool',
            url: 'https://example.com',
            category: 'invalid_category'
          });
        },
        expectedError: true,
        errorKeywords: ['分类', '有效', '选择']
      },
      {
        name: '过长描述添加',
        action: async () => {
          if (!window.toolsManager) throw new Error('ToolsManager未初始化');
          return await window.toolsManager.addTool({
            name: 'Test Tool',
            url: 'https://example.com',
            category: 'chat',
            description: 'a'.repeat(201) // 超过200字符限制
          });
        },
        expectedError: true,
        errorKeywords: ['描述', '字符', '200', '超过']
      },
      {
        name: '删除不存在的工具',
        action: async () => {
          if (!window.toolsManager) throw new Error('ToolsManager未初始化');
          return await window.toolsManager.deleteTool('non-existent-id-12345');
        },
        expectedError: true,
        errorKeywords: ['删除', '失败', '重试']
      },
      {
        name: '更新不存在的工具',
        action: async () => {
          if (!window.toolsManager) throw new Error('ToolsManager未初始化');
          return await window.toolsManager.updateTool('non-existent-id-12345', {
            name: 'Updated Tool',
            url: 'https://example.com',
            category: 'chat'
          });
        },
        expectedError: true,
        errorKeywords: ['更新', '失败', '重试']
      }
    ];

    for (const test of toolErrorTests) {
      try {
        console.log(`🔄 测试: ${test.name}`);
        
        let result;
        let threwError = false;
        
        try {
          result = await test.action();
        } catch (error) {
          threwError = true;
          result = { success: false, error: error.message };
        }
        
        // 验证是否按预期失败
        const failedAsExpected = test.expectedError ? (!result.success || threwError) : result.success;
        
        // 检查错误消息是否包含预期关键词
        let errorMessageValid = true;
        if (test.expectedError && result.error) {
          const errorMessage = result.error.toLowerCase();
          const hasKeyword = test.errorKeywords.some(keyword => 
            errorMessage.includes(keyword.toLowerCase())
          );
          errorMessageValid = hasKeyword;
        }
        
        const testPassed = failedAsExpected && (test.expectedError ? errorMessageValid : true);
        
        this.testResults.toolManagementErrors[test.name] = {
          passed: testPassed,
          result,
          failedAsExpected,
          errorMessageValid,
          errorMessage: result.error || null,
          threwError
        };
        
        console.log(`${testPassed ? '✅' : '❌'} ${test.name}`);
        if (result.error) {
          console.log(`   错误信息: ${result.error}`);
        }
        
      } catch (error) {
        console.error(`❌ ${test.name} 测试异常:`, error);
        this.testResults.toolManagementErrors[test.name] = { 
          passed: false, 
          error: error.message 
        };
      }
    }
  }

  /**
   * 测试表单验证错误
   */
  async testValidationErrors() {
    console.log('\n📝 测试表单验证错误...');
    
    const validationTests = [
      {
        name: '邮箱格式验证',
        validator: () => window.FormValidator.validateEmail('invalid-email'),
        expectedValid: false,
        errorKeywords: ['邮箱', '格式', '有效']
      },
      {
        name: '空邮箱验证',
        validator: () => window.FormValidator.validateEmail(''),
        expectedValid: false,
        errorKeywords: ['邮箱', '空', '不能']
      },
      {
        name: '密码长度验证',
        validator: () => window.FormValidator.validatePassword('123'),
        expectedValid: false,
        errorKeywords: ['密码', '字符', '6']
      },
      {
        name: '空密码验证',
        validator: () => window.FormValidator.validatePassword(''),
        expectedValid: false,
        errorKeywords: ['密码', '空', '不能']
      },
      {
        name: '密码匹配验证',
        validator: () => window.FormValidator.validatePasswordMatch('password1', 'password2'),
        expectedValid: false,
        errorKeywords: ['密码', '一致', '匹配']
      },
      {
        name: '登录表单验证',
        validator: () => window.FormValidator.validateLoginForm('invalid', '123'),
        expectedValid: false,
        errorKeywords: ['邮箱', '密码', '格式', '字符']
      },
      {
        name: '注册表单验证',
        validator: () => window.FormValidator.validateRegisterForm('invalid', '123', '456'),
        expectedValid: false,
        errorKeywords: ['邮箱', '密码', '格式', '字符', '一致']
      }
    ];

    for (const test of validationTests) {
      try {
        console.log(`🔄 测试: ${test.name}`);
        
        if (!window.FormValidator) {
          throw new Error('FormValidator未初始化');
        }
        
        const result = test.validator();
        
        // 验证结果是否符合预期
        const validAsExpected = result.valid === test.expectedValid;
        
        // 检查错误消息是否包含预期关键词
        let errorMessageValid = true;
        if (!test.expectedValid && result.error) {
          const errorMessage = result.error.toLowerCase();
          const hasKeyword = test.errorKeywords.some(keyword => 
            errorMessage.includes(keyword.toLowerCase())
          );
          errorMessageValid = hasKeyword;
        } else if (!test.expectedValid && result.errors) {
          // 处理多个错误的情况
          const allErrors = Object.values(result.errors).join(' ').toLowerCase();
          const hasKeyword = test.errorKeywords.some(keyword => 
            allErrors.includes(keyword.toLowerCase())
          );
          errorMessageValid = hasKeyword;
        }
        
        const testPassed = validAsExpected && (!test.expectedValid ? errorMessageValid : true);
        
        this.testResults.validationErrors[test.name] = {
          passed: testPassed,
          result,
          validAsExpected,
          errorMessageValid,
          errorMessage: result.error || (result.errors ? Object.values(result.errors).join('; ') : null)
        };
        
        console.log(`${testPassed ? '✅' : '❌'} ${test.name}`);
        if (result.error) {
          console.log(`   错误信息: ${result.error}`);
        } else if (result.errors) {
          console.log(`   错误信息: ${Object.values(result.errors).join('; ')}`);
        }
        
      } catch (error) {
        console.error(`❌ ${test.name} 测试异常:`, error);
        this.testResults.validationErrors[test.name] = { 
          passed: false, 
          error: error.message 
        };
      }
    }
  }

  /**
   * 测试UI错误显示
   */
  async testUIErrorDisplay() {
    console.log('\n🖥️ 测试UI错误显示...');
    
    const uiErrorTests = {
      errorElementsExist: this.testErrorElementsExist(),
      errorDisplayFunction: this.testErrorDisplayFunction(),
      errorClearFunction: this.testErrorClearFunction(),
      notificationSystem: await this.testNotificationSystem()
    };
    
    this.testResults.uiErrorDisplay = uiErrorTests;
    
    Object.keys(uiErrorTests).forEach(testName => {
      const result = uiErrorTests[testName];
      console.log(`${result.passed ? '✅' : '❌'} ${testName}: ${result.passed}`);
      if (result.details) {
        console.log(`   详情: ${result.details}`);
      }
    });
  }

  /**
   * 测试错误元素是否存在
   */
  testErrorElementsExist() {
    const errorElements = [
      'loginError',
      'registerError', 
      'addToolError',
      'editToolError'
    ];
    
    let allExist = true;
    const details = [];
    
    errorElements.forEach(elementId => {
      const element = document.getElementById(elementId);
      const exists = !!element;
      
      if (!exists) allExist = false;
      details.push(`${elementId}: ${exists ? '✅' : '❌'}`);
    });
    
    return {
      passed: allExist,
      details: details.join(', ')
    };
  }

  /**
   * 测试错误显示函数
   */
  testErrorDisplayFunction() {
    if (!window.uiManager) {
      return { passed: false, details: 'UIManager未初始化' };
    }
    
    try {
      // 测试显示错误
      const testErrorId = 'loginError';
      const testMessage = '测试错误消息';
      
      window.uiManager.showError(testErrorId, testMessage);
      
      const errorElement = document.getElementById(testErrorId);
      const messageDisplayed = errorElement && errorElement.textContent === testMessage;
      const hasShowClass = errorElement && errorElement.classList.contains('show');
      
      // 清理测试
      window.uiManager.hideError(testErrorId);
      
      return {
        passed: messageDisplayed && hasShowClass,
        details: `消息显示: ${messageDisplayed ? '✅' : '❌'}, 样式类: ${hasShowClass ? '✅' : '❌'}`
      };
      
    } catch (error) {
      return { passed: false, details: `测试失败: ${error.message}` };
    }
  }

  /**
   * 测试错误清除函数
   */
  testErrorClearFunction() {
    if (!window.uiManager) {
      return { passed: false, details: 'UIManager未初始化' };
    }
    
    try {
      const testErrorId = 'loginError';
      const testMessage = '测试错误消息';
      
      // 先显示错误
      window.uiManager.showError(testErrorId, testMessage);
      
      // 然后清除错误
      window.uiManager.hideError(testErrorId);
      
      const errorElement = document.getElementById(testErrorId);
      const messageCleared = errorElement && errorElement.textContent === '';
      const showClassRemoved = errorElement && !errorElement.classList.contains('show');
      
      return {
        passed: messageCleared && showClassRemoved,
        details: `消息清除: ${messageCleared ? '✅' : '❌'}, 样式类移除: ${showClassRemoved ? '✅' : '❌'}`
      };
      
    } catch (error) {
      return { passed: false, details: `测试失败: ${error.message}` };
    }
  }

  /**
   * 测试通知系统
   */
  async testNotificationSystem() {
    if (!window.uiManager) {
      return { passed: false, details: 'UIManager未初始化' };
    }
    
    try {
      // 测试显示通知
      const testMessage = '测试通知消息';
      window.uiManager.showNotification(testMessage, 'error', 100); // 100ms后自动关闭
      
      await this.delay(50); // 等待通知显示
      
      const notification = document.querySelector('.notification');
      const notificationDisplayed = !!notification;
      const hasCorrectType = notification && notification.classList.contains('notification-error');
      const hasCorrectMessage = notification && notification.textContent.includes(testMessage);
      
      // 等待通知自动关闭
      await this.delay(200);
      
      const notificationClosed = !document.querySelector('.notification');
      
      return {
        passed: notificationDisplayed && hasCorrectType && hasCorrectMessage && notificationClosed,
        details: `显示: ${notificationDisplayed ? '✅' : '❌'}, 类型: ${hasCorrectType ? '✅' : '❌'}, 消息: ${hasCorrectMessage ? '✅' : '❌'}, 自动关闭: ${notificationClosed ? '✅' : '❌'}`
      };
      
    } catch (error) {
      return { passed: false, details: `测试失败: ${error.message}` };
    }
  }

  /**
   * 测试网络错误处理
   */
  async testNetworkErrors() {
    console.log('\n🌐 测试网络错误处理...');
    
    const networkTests = {
      networkStatusDetection: this.testNetworkStatusDetection(),
      offlineHandling: await this.testOfflineHandling(),
      errorTranslation: this.testErrorTranslation()
    };
    
    this.testResults.networkErrors = networkTests;
    
    Object.keys(networkTests).forEach(testName => {
      const result = networkTests[testName];
      console.log(`${result.passed ? '✅' : '❌'} ${testName}: ${result.passed}`);
      if (result.details) {
        console.log(`   详情: ${result.details}`);
      }
    });
  }

  /**
   * 测试网络状态检测
   */
  testNetworkStatusDetection() {
    try {
      const isOnline = navigator.onLine;
      const hasOnlineEvent = 'ononline' in window;
      const hasOfflineEvent = 'onoffline' in window;
      
      return {
        passed: hasOnlineEvent && hasOfflineEvent,
        details: `在线状态: ${isOnline}, 在线事件: ${hasOnlineEvent ? '✅' : '❌'}, 离线事件: ${hasOfflineEvent ? '✅' : '❌'}`
      };
      
    } catch (error) {
      return { passed: false, details: `测试失败: ${error.message}` };
    }
  }

  /**
   * 测试离线处理
   */
  async testOfflineHandling() {
    try {
      // 检查应用是否有离线处理逻辑
      const hasOfflineHandler = window.app && 
                               typeof window.app.handleNetworkOffline === 'function';
      
      const hasOnlineHandler = window.app && 
                              typeof window.app.handleNetworkOnline === 'function';
      
      // 模拟离线事件（如果可能）
      let offlineEventHandled = false;
      if (hasOfflineHandler) {
        try {
          window.app.handleNetworkOffline();
          offlineEventHandled = true;
        } catch (error) {
          console.warn('离线处理函数调用失败:', error);
        }
      }
      
      return {
        passed: hasOfflineHandler && hasOnlineHandler && offlineEventHandled,
        details: `离线处理: ${hasOfflineHandler ? '✅' : '❌'}, 在线处理: ${hasOnlineHandler ? '✅' : '❌'}, 事件处理: ${offlineEventHandled ? '✅' : '❌'}`
      };
      
    } catch (error) {
      return { passed: false, details: `测试失败: ${error.message}` };
    }
  }

  /**
   * 测试错误信息翻译
   */
  testErrorTranslation() {
    if (!window.authManager) {
      return { passed: false, details: 'AuthManager未初始化' };
    }
    
    try {
      const testErrors = [
        'Invalid login credentials',
        'User already registered',
        'Email not confirmed',
        'Password should be at least 6 characters'
      ];
      
      let allTranslated = true;
      const translations = [];
      
      testErrors.forEach(error => {
        const translated = window.authManager.translateAuthError(error);
        const isTranslated = translated !== error && translated.length > 0;
        
        if (!isTranslated) allTranslated = false;
        translations.push(`${error} -> ${translated}`);
      });
      
      return {
        passed: allTranslated,
        details: `翻译测试: ${allTranslated ? '✅' : '❌'} (${translations.length}个)`
      };
      
    } catch (error) {
      return { passed: false, details: `测试失败: ${error.message}` };
    }
  }

  /**
   * 确保用户已登录（用于工具管理测试）
   */
  async ensureUserLoggedIn() {
    try {
      if (!window.authManager) {
        return false;
      }
      
      let currentUser = await window.authManager.getCurrentUser();
      
      if (!currentUser) {
        // 尝试注册并登录测试用户
        console.log('🔄 创建测试用户进行工具管理错误测试...');
        
        const registerResult = await window.authManager.signUp(this.testEmail, this.testPassword);
        if (registerResult.success) {
          currentUser = registerResult.user;
        } else {
          // 如果注册失败（可能用户已存在），尝试登录
          const loginResult = await window.authManager.signIn(this.testEmail, this.testPassword);
          if (loginResult.success) {
            currentUser = loginResult.user;
          }
        }
      }
      
      return !!currentUser;
      
    } catch (error) {
      console.warn('确保用户登录失败:', error);
      return false;
    }
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
    console.log('\n📊 错误处理测试结果汇总:');
    console.log('='.repeat(50));
    
    const categories = [
      { key: 'authenticationErrors', name: '认证错误处理' },
      { key: 'toolManagementErrors', name: '工具管理错误处理' },
      { key: 'validationErrors', name: '表单验证错误' },
      { key: 'uiErrorDisplay', name: 'UI错误显示' },
      { key: 'networkErrors', name: '网络错误处理' }
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
            
            if (testResult.errorMessage) {
              console.log(`    错误信息: ${testResult.errorMessage}`);
            }
          });
        }
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`📈 测试统计: ${passedTests}/${totalTests} 通过 (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有错误处理测试通过！');
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
    ['authenticationErrors', 'toolManagementErrors', 'validationErrors', 'uiErrorDisplay', 'networkErrors'].forEach(key => {
      const results = this.testResults[key];
      if (results && !results.reason) {
        const tests = Object.keys(results);
        const passed = tests.filter(test => results[test].passed).length;
        
        const name = {
          authenticationErrors: '认证错误处理',
          toolManagementErrors: '工具管理错误处理',
          validationErrors: '表单验证错误',
          uiErrorDisplay: 'UI错误显示',
          networkErrors: '网络错误处理'
        }[key];
        
        summary[name] = `${passed}/${tests.length}`;
      } else if (results && results.reason) {
        const name = {
          toolManagementErrors: '工具管理错误处理'
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
window.errorHandlingTester = new ErrorHandlingTester();

// 导出测试函数
window.runErrorHandlingTests = () => window.errorHandlingTester.runAllTests();

// 如果在浏览器环境中，添加快捷键
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + E: 运行错误处理测试
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      console.log('🧪 快捷键触发错误处理测试...');
      window.runErrorHandlingTests();
    }
  });
}

console.log('🧪 错误处理测试脚本已加载');
console.log('📝 使用方法:');
console.log('  1. 调用 runErrorHandlingTests() 开始测试');
console.log('  2. 或按 Ctrl/Cmd + Shift + E 快捷键');
console.log('  3. 测试将验证各种错误场景的处理和显示');
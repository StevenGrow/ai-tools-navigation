/**
 * 认证功能测试脚本
 * 测试注册、登录、登出和会话保持功能
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行此脚本
 * 2. 或者在 HTML 页面中引入此脚本
 * 3. 调用 runAuthTests() 开始测试
 */

class AuthFunctionalityTester {
  constructor() {
    this.testResults = {
      registration: {},
      login: {},
      logout: {},
      sessionPersistence: {},
      errorHandling: {},
      formValidation: {}
    };
    this.testEmail = `test_${Date.now()}@example.com`;
    this.testPassword = 'testpassword123';
    this.originalUser = null;
  }

  /**
   * 运行所有认证测试
   */
  async runAllTests() {
    console.log('🧪 开始认证功能测试...');
    console.log('📧 测试邮箱:', this.testEmail);
    
    try {
      // 保存当前用户状态
      await this.saveCurrentUserState();
      
      // 1. 测试表单验证
      await this.testFormValidation();
      
      // 2. 测试注册流程
      await this.testRegistrationFlow();
      
      // 3. 测试登录流程
      await this.testLoginFlow();
      
      // 4. 测试会话保持
      await this.testSessionPersistence();
      
      // 5. 测试登出流程
      await this.testLogoutFlow();
      
      // 6. 测试错误处理
      await this.testErrorHandling();
      
      // 恢复原始用户状态
      await this.restoreUserState();
      
      // 显示测试结果
      this.displayTestResults();
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
      await this.restoreUserState();
    }
  }

  /**
   * 保存当前用户状态
   */
  async saveCurrentUserState() {
    try {
      if (window.authManager) {
        this.originalUser = await window.authManager.getCurrentUser();
        console.log('💾 已保存当前用户状态:', this.originalUser?.email || '未登录');
      }
    } catch (error) {
      console.warn('⚠️ 保存用户状态失败:', error);
    }
  }

  /**
   * 恢复用户状态
   */
  async restoreUserState() {
    try {
      if (this.originalUser && window.authManager) {
        // 如果原来有用户登录，尝试恢复
        console.log('🔄 恢复原始用户状态...');
        // 注意：这里只是记录，实际恢复需要用户重新登录
        console.log('ℹ️ 请手动重新登录原用户:', this.originalUser.email);
      }
    } catch (error) {
      console.warn('⚠️ 恢复用户状态失败:', error);
    }
  }

  /**
   * 测试表单验证
   */
  async testFormValidation() {
    console.log('\n📝 测试表单验证...');
    
    const validationTests = [
      {
        name: '空邮箱验证',
        email: '',
        password: 'validpassword',
        shouldFail: true
      },
      {
        name: '无效邮箱格式验证',
        email: 'invalid-email',
        password: 'validpassword',
        shouldFail: true
      },
      {
        name: '空密码验证',
        email: 'valid@example.com',
        password: '',
        shouldFail: true
      },
      {
        name: '短密码验证',
        email: 'valid@example.com',
        password: '123',
        shouldFail: true
      },
      {
        name: '有效输入验证',
        email: 'valid@example.com',
        password: 'validpassword123',
        shouldFail: false
      }
    ];

    for (const test of validationTests) {
      try {
        const loginValidation = window.FormValidator.validateLoginForm(test.email, test.password);
        const registerValidation = window.FormValidator.validateRegisterForm(test.email, test.password, test.password);
        
        const loginPassed = test.shouldFail ? !loginValidation.valid : loginValidation.valid;
        const registerPassed = test.shouldFail ? !registerValidation.valid : registerValidation.valid;
        
        this.testResults.formValidation[test.name] = {
          passed: loginPassed && registerPassed,
          loginValidation,
          registerValidation
        };
        
        console.log(`${loginPassed && registerPassed ? '✅' : '❌'} ${test.name}`);
        
      } catch (error) {
        console.error(`❌ ${test.name} 测试失败:`, error);
        this.testResults.formValidation[test.name] = { passed: false, error: error.message };
      }
    }
  }

  /**
   * 测试注册流程
   */
  async testRegistrationFlow() {
    console.log('\n📝 测试注册流程...');
    
    try {
      // 确保先登出
      await this.ensureLoggedOut();
      
      // 测试注册
      console.log('🔄 尝试注册新用户...');
      const registerResult = await window.authManager.signUp(this.testEmail, this.testPassword);
      
      this.testResults.registration = {
        passed: registerResult.success,
        result: registerResult,
        timestamp: new Date().toISOString()
      };
      
      if (registerResult.success) {
        console.log('✅ 注册成功');
        console.log('👤 用户信息:', registerResult.user?.email);
        
        // 测试注册后的UI状态
        await this.delay(1000); // 等待UI更新
        const uiState = this.checkAuthUIState(true);
        this.testResults.registration.uiState = uiState;
        
      } else {
        console.log('❌ 注册失败:', registerResult.error);
      }
      
    } catch (error) {
      console.error('❌ 注册测试失败:', error);
      this.testResults.registration = { passed: false, error: error.message };
    }
  }

  /**
   * 测试登录流程
   */
  async testLoginFlow() {
    console.log('\n🔐 测试登录流程...');
    
    try {
      // 确保先登出
      await this.ensureLoggedOut();
      await this.delay(1000);
      
      // 测试登录
      console.log('🔄 尝试登录...');
      const loginResult = await window.authManager.signIn(this.testEmail, this.testPassword);
      
      this.testResults.login = {
        passed: loginResult.success,
        result: loginResult,
        timestamp: new Date().toISOString()
      };
      
      if (loginResult.success) {
        console.log('✅ 登录成功');
        console.log('👤 用户信息:', loginResult.user?.email);
        
        // 测试登录后的UI状态
        await this.delay(1000); // 等待UI更新
        const uiState = this.checkAuthUIState(true);
        this.testResults.login.uiState = uiState;
        
        // 测试用户信息获取
        const currentUser = await window.authManager.getCurrentUser();
        this.testResults.login.currentUserCheck = {
          passed: !!currentUser && currentUser.email === this.testEmail,
          user: currentUser
        };
        
      } else {
        console.log('❌ 登录失败:', loginResult.error);
      }
      
    } catch (error) {
      console.error('❌ 登录测试失败:', error);
      this.testResults.login = { passed: false, error: error.message };
    }
  }

  /**
   * 测试会话保持
   */
  async testSessionPersistence() {
    console.log('\n🔄 测试会话保持...');
    
    try {
      // 确保用户已登录
      const currentUser = await window.authManager.getCurrentUser();
      if (!currentUser) {
        console.log('⚠️ 用户未登录，跳过会话保持测试');
        this.testResults.sessionPersistence = { passed: false, reason: 'User not logged in' };
        return;
      }
      
      console.log('👤 当前用户:', currentUser.email);
      
      // 测试会话获取
      const session = await window.authManager.getSession();
      const sessionValid = !!session && !!session.user;
      
      console.log(`${sessionValid ? '✅' : '❌'} 会话获取测试`);
      
      // 测试会话管理器
      let sessionManagerTest = false;
      if (window.app && window.app.sessionManager) {
        try {
          const remainingTime = await window.app.sessionManager.getSessionRemainingTime();
          sessionManagerTest = remainingTime > 0;
          console.log(`${sessionManagerTest ? '✅' : '❌'} 会话管理器测试 (剩余时间: ${remainingTime}秒)`);
        } catch (error) {
          console.log('❌ 会话管理器测试失败:', error.message);
        }
      }
      
      // 模拟页面刷新后的会话恢复
      console.log('🔄 模拟会话恢复...');
      let sessionRestoreTest = false;
      try {
        if (window.app && window.app.sessionManager) {
          const restoredSession = await window.app.sessionManager.restoreSession();
          sessionRestoreTest = !!restoredSession && !!restoredSession.user;
          console.log(`${sessionRestoreTest ? '✅' : '❌'} 会话恢复测试`);
        }
      } catch (error) {
        console.log('❌ 会话恢复测试失败:', error.message);
      }
      
      this.testResults.sessionPersistence = {
        passed: sessionValid && sessionManagerTest && sessionRestoreTest,
        sessionValid,
        sessionManagerTest,
        sessionRestoreTest,
        session: session ? { 
          hasUser: !!session.user, 
          expiresAt: session.expires_at 
        } : null
      };
      
    } catch (error) {
      console.error('❌ 会话保持测试失败:', error);
      this.testResults.sessionPersistence = { passed: false, error: error.message };
    }
  }

  /**
   * 测试登出流程
   */
  async testLogoutFlow() {
    console.log('\n🚪 测试登出流程...');
    
    try {
      // 确保用户已登录
      const currentUser = await window.authManager.getCurrentUser();
      if (!currentUser) {
        console.log('⚠️ 用户未登录，跳过登出测试');
        this.testResults.logout = { passed: false, reason: 'User not logged in' };
        return;
      }
      
      console.log('🔄 尝试登出...');
      const logoutResult = await window.authManager.signOut();
      
      this.testResults.logout = {
        passed: logoutResult.success,
        result: logoutResult,
        timestamp: new Date().toISOString()
      };
      
      if (logoutResult.success) {
        console.log('✅ 登出成功');
        
        // 等待UI更新
        await this.delay(1000);
        
        // 测试登出后的状态
        const userAfterLogout = await window.authManager.getCurrentUser();
        const sessionAfterLogout = await window.authManager.getSession();
        
        const userCleared = !userAfterLogout;
        const sessionCleared = !sessionAfterLogout;
        
        console.log(`${userCleared ? '✅' : '❌'} 用户状态清除`);
        console.log(`${sessionCleared ? '✅' : '❌'} 会话状态清除`);
        
        // 测试登出后的UI状态
        const uiState = this.checkAuthUIState(false);
        
        this.testResults.logout.stateClearing = {
          userCleared,
          sessionCleared,
          uiState
        };
        
        this.testResults.logout.passed = logoutResult.success && userCleared && sessionCleared && uiState.passed;
        
      } else {
        console.log('❌ 登出失败:', logoutResult.error);
      }
      
    } catch (error) {
      console.error('❌ 登出测试失败:', error);
      this.testResults.logout = { passed: false, error: error.message };
    }
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling() {
    console.log('\n⚠️ 测试错误处理...');
    
    const errorTests = [
      {
        name: '无效邮箱登录',
        action: () => window.authManager.signIn('invalid@nonexistent.com', 'wrongpassword'),
        shouldFail: true
      },
      {
        name: '错误密码登录',
        action: () => window.authManager.signIn(this.testEmail, 'wrongpassword'),
        shouldFail: true
      },
      {
        name: '重复邮箱注册',
        action: () => window.authManager.signUp(this.testEmail, this.testPassword),
        shouldFail: true
      }
    ];

    for (const test of errorTests) {
      try {
        console.log(`🔄 测试: ${test.name}`);
        const result = await test.action();
        
        const passed = test.shouldFail ? !result.success : result.success;
        
        this.testResults.errorHandling[test.name] = {
          passed,
          result,
          expectedToFail: test.shouldFail
        };
        
        console.log(`${passed ? '✅' : '❌'} ${test.name}`);
        if (result.error) {
          console.log(`   错误信息: ${result.error}`);
        }
        
      } catch (error) {
        console.error(`❌ ${test.name} 测试异常:`, error);
        this.testResults.errorHandling[test.name] = { 
          passed: false, 
          error: error.message 
        };
      }
    }
  }

  /**
   * 检查认证UI状态
   */
  checkAuthUIState(shouldBeLoggedIn) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.getElementById('userInfo');
    const addToolBtn = document.getElementById('addToolBtn');
    
    const results = {
      loginBtnHidden: loginBtn ? loginBtn.classList.contains('hidden') : false,
      registerBtnHidden: registerBtn ? registerBtn.classList.contains('hidden') : false,
      userInfoVisible: userInfo ? !userInfo.classList.contains('hidden') : false,
      addToolBtnVisible: addToolBtn ? addToolBtn.classList.contains('show') : false
    };
    
    if (shouldBeLoggedIn) {
      // 登录状态：登录/注册按钮应该隐藏，用户信息和添加工具按钮应该显示
      results.passed = results.loginBtnHidden && results.registerBtnHidden && 
                      results.userInfoVisible && results.addToolBtnVisible;
    } else {
      // 登出状态：登录/注册按钮应该显示，用户信息和添加工具按钮应该隐藏
      results.passed = !results.loginBtnHidden && !results.registerBtnHidden && 
                      !results.userInfoVisible && !results.addToolBtnVisible;
    }
    
    console.log(`${results.passed ? '✅' : '❌'} UI状态检查 (期望${shouldBeLoggedIn ? '已登录' : '未登录'})`);
    
    return results;
  }

  /**
   * 确保用户已登出
   */
  async ensureLoggedOut() {
    try {
      const currentUser = await window.authManager.getCurrentUser();
      if (currentUser) {
        console.log('🔄 检测到已登录用户，执行登出...');
        await window.authManager.signOut();
        await this.delay(1000); // 等待登出完成
      }
    } catch (error) {
      console.warn('⚠️ 登出过程中出现错误:', error);
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
    console.log('\n📊 认证功能测试结果汇总:');
    console.log('='.repeat(50));
    
    const categories = [
      { key: 'formValidation', name: '表单验证' },
      { key: 'registration', name: '用户注册' },
      { key: 'login', name: '用户登录' },
      { key: 'sessionPersistence', name: '会话保持' },
      { key: 'logout', name: '用户登出' },
      { key: 'errorHandling', name: '错误处理' }
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    
    categories.forEach(category => {
      const results = this.testResults[category.key];
      console.log(`\n${category.name}:`);
      
      if (typeof results === 'object' && results !== null) {
        if (category.key === 'formValidation' || category.key === 'errorHandling') {
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
      console.log('🎉 所有认证功能测试通过！');
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
    
    // 表单验证
    const formValidationResults = this.testResults.formValidation;
    if (formValidationResults) {
      const formTests = Object.keys(formValidationResults);
      const formPassed = formTests.filter(test => formValidationResults[test].passed).length;
      summary['表单验证'] = `${formPassed}/${formTests.length}`;
    }
    
    // 其他测试
    ['registration', 'login', 'sessionPersistence', 'logout'].forEach(key => {
      const result = this.testResults[key];
      if (result) {
        const name = {
          registration: '用户注册',
          login: '用户登录', 
          sessionPersistence: '会话保持',
          logout: '用户登出'
        }[key];
        summary[name] = result.passed ? '✅ 通过' : '❌ 失败';
      }
    });
    
    // 错误处理
    const errorHandlingResults = this.testResults.errorHandling;
    if (errorHandlingResults) {
      const errorTests = Object.keys(errorHandlingResults);
      const errorPassed = errorTests.filter(test => errorHandlingResults[test].passed).length;
      summary['错误处理'] = `${errorPassed}/${errorTests.length}`;
    }
    
    return summary;
  }
}

// 创建全局测试实例
window.authTester = new AuthFunctionalityTester();

// 导出测试函数
window.runAuthTests = () => window.authTester.runAllTests();

// 如果在浏览器环境中，添加快捷键
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + A: 运行认证测试
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      console.log('🧪 快捷键触发认证测试...');
      window.runAuthTests();
    }
  });
}

console.log('🧪 认证功能测试脚本已加载');
console.log('📝 使用方法:');
console.log('  1. 调用 runAuthTests() 开始测试');
console.log('  2. 或按 Ctrl/Cmd + Shift + A 快捷键');
console.log('  3. 测试将使用临时邮箱进行完整的认证流程测试');
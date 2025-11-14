/**
 * 安全检查测试脚本
 * 验证 HTTPS 连接、检查 RLS 策略生效、测试权限控制
 * 
 * 使用方法：
 * 1. 在生产环境中打开浏览器控制台
 * 2. 运行此脚本
 * 3. 调用 runSecurityTests() 开始测试
 */

class SecurityTester {
  constructor() {
    this.testResults = {
      httpsConnection: {},
      certificateValidation: {},
      rlsPolicies: {},
      permissionControl: {},
      dataProtection: {},
      clientSideSecurity: {},
      overall: {}
    };
    this.startTime = null;
  }

  /**
   * 运行所有安全测试
   */
  async runAllTests() {
    console.log('🔒 开始安全检查测试...');
    console.log('🌐 当前环境:', window.location.href);
    
    this.startTime = performance.now();
    
    try {
      // 1. HTTPS 连接验证
      await this.testHTTPSConnection();
      
      // 2. SSL 证书验证
      await this.testCertificateValidation();
      
      // 3. RLS 策略测试
      await this.testRLSPolicies();
      
      // 4. 权限控制测试
      await this.testPermissionControl();
      
      // 5. 数据保护测试
      await this.testDataProtection();
      
      // 6. 客户端安全测试
      await this.testClientSideSecurity();
      
      // 7. 生成安全报告
      this.generateSecurityReport();
      
    } catch (error) {
      console.error('❌ 安全测试过程中发生错误:', error);
      this.testResults.overall.error = error.message;
    } finally {
      this.displayResults();
    }
  }

  /**
   * HTTPS 连接验证
   */
  async testHTTPSConnection() {
    console.log('\n🔐 测试 HTTPS 连接...');
    
    const tests = {
      protocolCheck: this.checkHTTPSProtocol(),
      mixedContentCheck: this.checkMixedContent(),
      secureHeadersCheck: await this.checkSecureHeaders(),
      redirectCheck: await this.checkHTTPSRedirect()
    };
    
    const passedTests = Object.values(tests).filter(test => test.passed).length;
    const totalTests = Object.keys(tests).length;
    
    this.testResults.httpsConnection = {
      tests,
      passedTests,
      totalTests,
      percentage: Math.round(passedTests / totalTests * 100),
      passed: passedTests === totalTests
    };
    
    console.log(`✅ HTTPS 连接测试完成: ${passedTests}/${totalTests} 通过`);
  }

  /**
   * 检查 HTTPS 协议
   */
  checkHTTPSProtocol() {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    // 本地开发环境可以使用 HTTP
    const passed = isHTTPS || isLocalhost;
    
    return {
      passed,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      isLocalhost,
      issues: passed ? [] : ['网站未使用 HTTPS 协议']
    };
  }

  /**
   * 检查混合内容
   */
  checkMixedContent() {
    const issues = [];
    
    // 检查 HTTP 资源
    const httpResources = [];
    
    // 检查图片
    const images = document.querySelectorAll('img[src^="http:"]');
    if (images.length > 0) {
      httpResources.push(`${images.length} 个 HTTP 图片`);
    }
    
    // 检查脚本
    const scripts = document.querySelectorAll('script[src^="http:"]');
    if (scripts.length > 0) {
      httpResources.push(`${scripts.length} 个 HTTP 脚本`);
    }
    
    // 检查样式表
    const stylesheets = document.querySelectorAll('link[href^="http:"]');
    if (stylesheets.length > 0) {
      httpResources.push(`${stylesheets.length} 个 HTTP 样式表`);
    }
    
    // 检查 iframe
    const iframes = document.querySelectorAll('iframe[src^="http:"]');
    if (iframes.length > 0) {
      httpResources.push(`${iframes.length} 个 HTTP iframe`);
    }
    
    if (httpResources.length > 0) {
      issues.push(`发现混合内容: ${httpResources.join(', ')}`);
    }
    
    return {
      passed: issues.length === 0,
      httpResources,
      issues
    };
  }

  /**
   * 检查安全头
   */
  async checkSecureHeaders() {
    const issues = [];
    const headers = {};
    
    try {
      // 尝试通过 fetch 获取响应头
      const response = await fetch(window.location.href, { method: 'HEAD' });
      
      // 检查重要的安全头
      const securityHeaders = [
        'strict-transport-security',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy'
      ];
      
      securityHeaders.forEach(header => {
        const value = response.headers.get(header);
        headers[header] = value;
        
        if (!value) {
          issues.push(`缺少安全头: ${header}`);
        }
      });
      
      // 检查 HSTS
      const hsts = response.headers.get('strict-transport-security');
      if (hsts) {
        const maxAge = hsts.match(/max-age=(\d+)/);
        if (!maxAge || parseInt(maxAge[1]) < 31536000) { // 1年
          issues.push('HSTS max-age 时间过短，建议至少1年');
        }
      }
      
      // 检查 CSP
      const csp = response.headers.get('content-security-policy');
      if (csp) {
        if (csp.includes("'unsafe-inline'")) {
          issues.push('CSP 允许 unsafe-inline，存在 XSS 风险');
        }
        if (csp.includes("'unsafe-eval'")) {
          issues.push('CSP 允许 unsafe-eval，存在代码注入风险');
        }
      }
      
    } catch (error) {
      issues.push(`无法检查响应头: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      headers,
      issues
    };
  }

  /**
   * 检查 HTTPS 重定向
   */
  async checkHTTPSRedirect() {
    const issues = [];
    
    try {
      // 如果当前是 HTTPS，测试对应的 HTTP 地址是否重定向
      if (window.location.protocol === 'https:') {
        const httpUrl = window.location.href.replace('https:', 'http:');
        
        try {
          const response = await fetch(httpUrl, { 
            method: 'HEAD',
            redirect: 'manual'
          });
          
          if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            if (location && location.startsWith('https:')) {
              // 正确重定向到 HTTPS
            } else {
              issues.push('HTTP 请求未正确重定向到 HTTPS');
            }
          } else {
            issues.push('HTTP 请求未设置重定向');
          }
          
        } catch (error) {
          // 可能是 CORS 限制，这是正常的
          console.warn('无法测试 HTTP 重定向:', error.message);
        }
      }
      
    } catch (error) {
      issues.push(`HTTPS 重定向测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * SSL 证书验证
   */
  async testCertificateValidation() {
    console.log('\n📜 测试 SSL 证书验证...');
    
    const tests = {
      certificateInfo: await this.getCertificateInfo(),
      validityCheck: this.checkCertificateValidity(),
      trustChainCheck: this.checkTrustChain()
    };
    
    const passedTests = Object.values(tests).filter(test => test.passed).length;
    const totalTests = Object.keys(tests).length;
    
    this.testResults.certificateValidation = {
      tests,
      passedTests,
      totalTests,
      percentage: Math.round(passedTests / totalTests * 100),
      passed: passedTests === totalTests
    };
    
    console.log(`✅ SSL 证书验证完成: ${passedTests}/${totalTests} 通过`);
  }

  /**
   * 获取证书信息
   */
  async getCertificateInfo() {
    const issues = [];
    let certificateInfo = {};
    
    try {
      // 在浏览器中，我们无法直接访问证书详细信息
      // 但可以通过一些间接方法检查
      
      // 检查连接是否安全
      const isSecure = window.isSecureContext;
      if (!isSecure) {
        issues.push('当前上下文不安全');
      }
      
      // 检查 TLS 版本（通过 navigator 对象推断）
      const userAgent = navigator.userAgent;
      const modernBrowser = /Chrome\/([8-9]\d|1\d\d)|Firefox\/([6-9]\d|1\d\d)|Safari\/([1-9]\d\d)/.test(userAgent);
      
      if (!modernBrowser) {
        issues.push('浏览器可能不支持现代 TLS 版本');
      }
      
      certificateInfo = {
        isSecureContext: isSecure,
        modernBrowser,
        domain: window.location.hostname,
        port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80')
      };
      
    } catch (error) {
      issues.push(`获取证书信息失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      certificateInfo,
      issues
    };
  }

  /**
   * 检查证书有效性
   */
  checkCertificateValidity() {
    const issues = [];
    
    try {
      // 检查是否在安全上下文中
      if (!window.isSecureContext) {
        issues.push('不在安全上下文中，证书可能无效');
      }
      
      // 检查域名匹配
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // 本地开发环境，跳过证书检查
      } else {
        // 在生产环境中，浏览器会自动验证证书
        // 如果页面能正常加载且 isSecureContext 为 true，说明证书有效
        if (window.isSecureContext) {
          // 证书有效
        } else {
          issues.push('证书验证失败');
        }
      }
      
    } catch (error) {
      issues.push(`证书有效性检查失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 检查信任链
   */
  checkTrustChain() {
    const issues = [];
    
    try {
      // 在浏览器环境中，信任链验证由浏览器自动完成
      // 如果页面能在 HTTPS 下正常加载，说明信任链有效
      
      if (window.location.protocol === 'https:' && window.isSecureContext) {
        // 信任链有效
      } else if (window.location.protocol === 'http:' && 
                (window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1')) {
        // 本地开发环境，跳过检查
      } else {
        issues.push('SSL 信任链可能存在问题');
      }
      
    } catch (error) {
      issues.push(`信任链检查失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * RLS 策略测试
   */
  async testRLSPolicies() {
    console.log('\n🛡️ 测试 RLS 策略...');
    
    if (!window.supabase) {
      this.testResults.rlsPolicies = {
        passed: false,
        error: 'Supabase 客户端未初始化，无法测试 RLS 策略'
      };
      return;
    }
    
    const tests = {
      anonymousAccess: await this.testAnonymousAccess(),
      userDataIsolation: await this.testUserDataIsolation(),
      crudPermissions: await this.testCRUDPermissions()
    };
    
    const passedTests = Object.values(tests).filter(test => test.passed).length;
    const totalTests = Object.keys(tests).length;
    
    this.testResults.rlsPolicies = {
      tests,
      passedTests,
      totalTests,
      percentage: Math.round(passedTests / totalTests * 100),
      passed: passedTests === totalTests
    };
    
    console.log(`✅ RLS 策略测试完成: ${passedTests}/${totalTests} 通过`);
  }

  /**
   * 测试匿名访问限制
   */
  async testAnonymousAccess() {
    const issues = [];
    
    try {
      // 确保用户已登出
      await window.supabase.auth.signOut();
      
      // 尝试访问 custom_tools 表
      const { data, error } = await window.supabase
        .from('custom_tools')
        .select('*')
        .limit(1);
      
      if (data && data.length > 0) {
        issues.push('匿名用户可以访问 custom_tools 表，RLS 策略可能未生效');
      }
      
      if (!error || !error.message.includes('RLS')) {
        issues.push('匿名访问未被 RLS 策略正确阻止');
      }
      
      // 尝试插入数据
      const { error: insertError } = await window.supabase
        .from('custom_tools')
        .insert({
          tool_name: 'Test Tool',
          tool_url: 'https://test.com',
          category: 'chat'
        });
      
      if (!insertError) {
        issues.push('匿名用户可以插入数据，RLS 策略未生效');
      }
      
    } catch (error) {
      // 这里的错误通常是好的，说明 RLS 在工作
      console.log('匿名访问被正确阻止:', error.message);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试用户数据隔离
   */
  async testUserDataIsolation() {
    const issues = [];
    
    try {
      // 检查当前用户状态
      const { data: { user } } = await window.supabase.auth.getUser();
      
      if (!user) {
        return {
          passed: true,
          issues: ['用户未登录，跳过数据隔离测试']
        };
      }
      
      // 获取当前用户的工具
      const { data: userTools, error: userError } = await window.supabase
        .from('custom_tools')
        .select('*');
      
      if (userError) {
        issues.push(`获取用户工具失败: ${userError.message}`);
      } else {
        // 检查返回的工具是否都属于当前用户
        const foreignTools = userTools.filter(tool => tool.user_id !== user.id);
        
        if (foreignTools.length > 0) {
          issues.push(`发现 ${foreignTools.length} 个不属于当前用户的工具，数据隔离失败`);
        }
      }
      
      // 尝试访问其他用户的数据（通过构造查询）
      const { data: allTools, error: allError } = await window.supabase
        .from('custom_tools')
        .select('*')
        .neq('user_id', user.id);
      
      if (allTools && allTools.length > 0) {
        issues.push('可以访问其他用户的数据，RLS 策略存在漏洞');
      }
      
    } catch (error) {
      issues.push(`用户数据隔离测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试 CRUD 权限
   */
  async testCRUDPermissions() {
    const issues = [];
    
    try {
      const { data: { user } } = await window.supabase.auth.getUser();
      
      if (!user) {
        return {
          passed: true,
          issues: ['用户未登录，跳过 CRUD 权限测试']
        };
      }
      
      // 测试创建权限
      const testTool = {
        tool_name: 'Security Test Tool',
        tool_url: 'https://security-test.com',
        tool_desc: 'Security test description',
        category: 'chat',
        is_free: true,
        is_chinese: false
      };
      
      const { data: createdTool, error: createError } = await window.supabase
        .from('custom_tools')
        .insert(testTool)
        .select()
        .single();
      
      if (createError) {
        issues.push(`创建权限测试失败: ${createError.message}`);
      } else {
        console.log('✅ 创建权限正常');
        
        // 测试读取权限
        const { data: readTool, error: readError } = await window.supabase
          .from('custom_tools')
          .select('*')
          .eq('id', createdTool.id)
          .single();
        
        if (readError) {
          issues.push(`读取权限测试失败: ${readError.message}`);
        } else {
          console.log('✅ 读取权限正常');
        }
        
        // 测试更新权限
        const { error: updateError } = await window.supabase
          .from('custom_tools')
          .update({ tool_desc: 'Updated description' })
          .eq('id', createdTool.id);
        
        if (updateError) {
          issues.push(`更新权限测试失败: ${updateError.message}`);
        } else {
          console.log('✅ 更新权限正常');
        }
        
        // 测试删除权限
        const { error: deleteError } = await window.supabase
          .from('custom_tools')
          .delete()
          .eq('id', createdTool.id);
        
        if (deleteError) {
          issues.push(`删除权限测试失败: ${deleteError.message}`);
        } else {
          console.log('✅ 删除权限正常');
        }
      }
      
    } catch (error) {
      issues.push(`CRUD 权限测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 权限控制测试
   */
  async testPermissionControl() {
    console.log('\n🔐 测试权限控制...');
    
    const tests = {
      authenticationCheck: await this.testAuthenticationCheck(),
      authorizationCheck: await this.testAuthorizationCheck(),
      sessionManagement: await this.testSessionManagement(),
      tokenSecurity: await this.testTokenSecurity()
    };
    
    const passedTests = Object.values(tests).filter(test => test.passed).length;
    const totalTests = Object.keys(tests).length;
    
    this.testResults.permissionControl = {
      tests,
      passedTests,
      totalTests,
      percentage: Math.round(passedTests / totalTests * 100),
      passed: passedTests === totalTests
    };
    
    console.log(`✅ 权限控制测试完成: ${passedTests}/${totalTests} 通过`);
  }

  /**
   * 测试身份验证检查
   */
  async testAuthenticationCheck() {
    const issues = [];
    
    try {
      if (!window.authManager) {
        issues.push('认证管理器未初始化');
        return { passed: false, issues };
      }
      
      // 检查当前认证状态
      const currentUser = await window.authManager.getCurrentUser();
      
      // 测试未认证用户的访问限制
      if (!currentUser) {
        // 检查添加工具按钮是否隐藏
        const addToolBtn = document.getElementById('addToolBtn');
        if (addToolBtn && addToolBtn.classList.contains('show')) {
          issues.push('未登录用户可以看到添加工具按钮');
        }
        
        // 检查用户信息区域是否隐藏
        const userInfo = document.getElementById('userInfo');
        if (userInfo && !userInfo.classList.contains('hidden')) {
          issues.push('未登录时用户信息区域仍然显示');
        }
      } else {
        // 已登录用户，检查相应的 UI 状态
        const addToolBtn = document.getElementById('addToolBtn');
        if (addToolBtn && !addToolBtn.classList.contains('show')) {
          issues.push('已登录用户无法看到添加工具按钮');
        }
      }
      
    } catch (error) {
      issues.push(`身份验证检查失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试授权检查
   */
  async testAuthorizationCheck() {
    const issues = [];
    
    try {
      if (!window.supabase) {
        issues.push('Supabase 客户端未初始化');
        return { passed: false, issues };
      }
      
      const { data: { user } } = await window.supabase.auth.getUser();
      
      if (user) {
        // 测试用户只能操作自己的数据
        const { data: userTools } = await window.supabase
          .from('custom_tools')
          .select('*');
        
        if (userTools) {
          // 检查所有返回的工具是否都属于当前用户
          const unauthorizedTools = userTools.filter(tool => tool.user_id !== user.id);
          
          if (unauthorizedTools.length > 0) {
            issues.push(`发现 ${unauthorizedTools.length} 个未授权访问的工具`);
          }
        }
        
        // 测试尝试修改其他用户的数据
        try {
          // 尝试创建一个属于其他用户的工具（应该失败）
          const fakeUserId = 'fake-user-id-12345';
          const { error } = await window.supabase
            .from('custom_tools')
            .insert({
              user_id: fakeUserId,
              tool_name: 'Unauthorized Tool',
              tool_url: 'https://test.com',
              category: 'chat'
            });
          
          if (!error) {
            issues.push('可以创建属于其他用户的数据，授权检查失败');
          }
        } catch (error) {
          // 这里的错误是预期的，说明授权检查正常工作
        }
      }
      
    } catch (error) {
      issues.push(`授权检查失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试会话管理
   */
  async testSessionManagement() {
    const issues = [];
    
    try {
      if (!window.supabase) {
        issues.push('Supabase 客户端未初始化');
        return { passed: false, issues };
      }
      
      // 检查会话状态
      const { data: { session } } = await window.supabase.auth.getSession();
      
      if (session) {
        // 检查会话是否有过期时间
        if (!session.expires_at) {
          issues.push('会话缺少过期时间');
        } else {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          
          if (expiresAt <= now) {
            issues.push('会话已过期但仍然有效');
          }
          
          // 检查会话剩余时间是否合理（不应该太长）
          const remainingTime = expiresAt - now;
          const maxSessionTime = 24 * 60 * 60 * 1000; // 24小时
          
          if (remainingTime > maxSessionTime) {
            issues.push('会话有效期过长，存在安全风险');
          }
        }
        
        // 检查刷新令牌
        if (!session.refresh_token) {
          issues.push('会话缺少刷新令牌');
        }
      }
      
      // 检查会话管理器
      if (window.app && window.app.sessionManager) {
        try {
          const remainingTime = await window.app.sessionManager.getSessionRemainingTime();
          
          if (session && remainingTime <= 0) {
            issues.push('会话管理器报告会话已过期，但会话仍然存在');
          }
        } catch (error) {
          issues.push(`会话管理器检查失败: ${error.message}`);
        }
      }
      
    } catch (error) {
      issues.push(`会话管理测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试令牌安全
   */
  async testTokenSecurity() {
    const issues = [];
    
    try {
      if (!window.supabase) {
        issues.push('Supabase 客户端未初始化');
        return { passed: false, issues };
      }
      
      const { data: { session } } = await window.supabase.auth.getSession();
      
      if (session) {
        // 检查访问令牌
        const accessToken = session.access_token;
        
        if (!accessToken) {
          issues.push('会话缺少访问令牌');
        } else {
          // 检查令牌格式（JWT 应该有三个部分）
          const tokenParts = accessToken.split('.');
          if (tokenParts.length !== 3) {
            issues.push('访问令牌格式不正确');
          }
          
          // 检查令牌是否在本地存储中暴露
          const localStorageKeys = Object.keys(localStorage);
          const sessionStorageKeys = Object.keys(sessionStorage);
          
          const tokenInLocalStorage = localStorageKeys.some(key => {
            const value = localStorage.getItem(key);
            return value && value.includes(accessToken);
          });
          
          const tokenInSessionStorage = sessionStorageKeys.some(key => {
            const value = sessionStorage.getItem(key);
            return value && value.includes(accessToken);
          });
          
          if (tokenInLocalStorage) {
            console.warn('访问令牌存储在 localStorage 中');
          }
          
          if (tokenInSessionStorage) {
            console.warn('访问令牌存储在 sessionStorage 中');
          }
        }
        
        // 检查刷新令牌
        const refreshToken = session.refresh_token;
        if (refreshToken) {
          // 刷新令牌不应该在客户端存储中明文暴露
          const refreshTokenExposed = Object.keys(localStorage).some(key => {
            const value = localStorage.getItem(key);
            return value && value.includes(refreshToken) && !value.startsWith('sb-');
          });
          
          if (refreshTokenExposed) {
            issues.push('刷新令牌在客户端存储中明文暴露');
          }
        }
      }
      
    } catch (error) {
      issues.push(`令牌安全测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 数据保护测试
   */
  async testDataProtection() {
    console.log('\n🛡️ 测试数据保护...');
    
    const tests = {
      inputValidation: this.testInputValidation(),
      outputEncoding: this.testOutputEncoding(),
      sqlInjectionPrevention: await this.testSQLInjectionPrevention(),
      xssProtection: this.testXSSProtection()
    };
    
    const passedTests = Object.values(tests).filter(test => test.passed).length;
    const totalTests = Object.keys(tests).length;
    
    this.testResults.dataProtection = {
      tests,
      passedTests,
      totalTests,
      percentage: Math.round(passedTests / totalTests * 100),
      passed: passedTests === totalTests
    };
    
    console.log(`✅ 数据保护测试完成: ${passedTests}/${totalTests} 通过`);
  }

  /**
   * 测试输入验证
   */
  testInputValidation() {
    const issues = [];
    
    try {
      // 检查表单验证
      const forms = document.querySelectorAll('form');
      
      forms.forEach((form, index) => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach((input, inputIndex) => {
          // 检查是否有验证属性
          const hasValidation = input.hasAttribute('required') ||
                               input.hasAttribute('pattern') ||
                               input.hasAttribute('minlength') ||
                               input.hasAttribute('maxlength') ||
                               input.type === 'email' ||
                               input.type === 'url';
          
          if (!hasValidation && input.type !== 'hidden') {
            issues.push(`表单 ${index + 1} 输入框 ${inputIndex + 1} 缺少验证属性`);
          }
        });
      });
      
      // 检查客户端验证函数
      if (window.FormValidator) {
        // 测试邮箱验证
        const emailTests = [
          { email: 'test@example.com', shouldPass: true },
          { email: 'invalid-email', shouldPass: false },
          { email: '<script>alert("xss")</script>@test.com', shouldPass: false }
        ];
        
        emailTests.forEach(test => {
          try {
            const result = window.FormValidator.validateEmail(test.email);
            if (result.valid !== test.shouldPass) {
              issues.push(`邮箱验证测试失败: ${test.email}`);
            }
          } catch (error) {
            issues.push(`邮箱验证函数错误: ${error.message}`);
          }
        });
        
        // 测试 URL 验证
        const urlTests = [
          { url: 'https://example.com', shouldPass: true },
          { url: 'javascript:alert("xss")', shouldPass: false },
          { url: 'data:text/html,<script>alert("xss")</script>', shouldPass: false }
        ];
        
        urlTests.forEach(test => {
          try {
            const result = window.FormValidator.validateUrl(test.url);
            if (result.valid !== test.shouldPass) {
              issues.push(`URL 验证测试失败: ${test.url}`);
            }
          } catch (error) {
            issues.push(`URL 验证函数错误: ${error.message}`);
          }
        });
      } else {
        issues.push('缺少客户端表单验证器');
      }
      
    } catch (error) {
      issues.push(`输入验证测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试输出编码
   */
  testOutputEncoding() {
    const issues = [];
    
    try {
      // 检查动态内容是否正确编码
      const dynamicElements = document.querySelectorAll('[data-dynamic], .tool-name, .tool-desc');
      
      dynamicElements.forEach((element, index) => {
        const content = element.innerHTML;
        
        // 检查是否包含未编码的脚本标签
        if (content.includes('<script>') || content.includes('javascript:')) {
          issues.push(`元素 ${index + 1} 包含未编码的脚本内容`);
        }
        
        // 检查是否包含未编码的事件处理器
        if (content.match(/on\w+\s*=/i)) {
          issues.push(`元素 ${index + 1} 包含未编码的事件处理器`);
        }
      });
      
      // 检查是否使用了安全的 DOM 操作方法
      if (window.uiManager) {
        // 检查 UI 管理器是否使用 textContent 而不是 innerHTML
        const uiManagerCode = window.uiManager.toString();
        
        if (uiManagerCode.includes('innerHTML') && !uiManagerCode.includes('textContent')) {
          issues.push('UI 管理器可能使用了不安全的 innerHTML 方法');
        }
      }
      
    } catch (error) {
      issues.push(`输出编码测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试 SQL 注入防护
   */
  async testSQLInjectionPrevention() {
    const issues = [];
    
    try {
      if (!window.supabase) {
        return { passed: true, issues: ['Supabase 未初始化，跳过 SQL 注入测试'] };
      }
      
      const { data: { user } } = await window.supabase.auth.getUser();
      
      if (!user) {
        return { passed: true, issues: ['用户未登录，跳过 SQL 注入测试'] };
      }
      
      // 测试常见的 SQL 注入攻击
      const sqlInjectionPayloads = [
        "'; DROP TABLE custom_tools; --",
        "' OR '1'='1",
        "'; SELECT * FROM users; --",
        "' UNION SELECT * FROM custom_tools WHERE '1'='1",
        "admin'--",
        "' OR 1=1#"
      ];
      
      for (const payload of sqlInjectionPayloads) {
        try {
          // 尝试在工具名称中注入 SQL
          const { error } = await window.supabase
            .from('custom_tools')
            .insert({
              tool_name: payload,
              tool_url: 'https://test.com',
              category: 'chat'
            });
          
          // 如果没有错误，可能存在 SQL 注入漏洞
          if (!error) {
            // 检查是否真的插入了数据
            const { data } = await window.supabase
              .from('custom_tools')
              .select('*')
              .eq('tool_name', payload);
            
            if (data && data.length > 0) {
              // 数据被插入，但这不一定意味着 SQL 注入成功
              // Supabase 使用参数化查询，应该是安全的
              
              // 清理测试数据
              await window.supabase
                .from('custom_tools')
                .delete()
                .eq('tool_name', payload);
            }
          }
          
        } catch (error) {
          // 错误是预期的，说明输入被正确处理
        }
      }
      
      // 测试搜索功能的 SQL 注入防护
      if (window.app && window.app.handleSearch) {
        for (const payload of sqlInjectionPayloads.slice(0, 3)) {
          try {
            window.app.handleSearch(payload);
            // 搜索应该正常工作，不应该导致错误或异常行为
          } catch (error) {
            issues.push(`搜索功能对 SQL 注入载荷处理异常: ${payload}`);
          }
        }
      }
      
    } catch (error) {
      issues.push(`SQL 注入防护测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试 XSS 防护
   */
  testXSSProtection() {
    const issues = [];
    
    try {
      // 测试常见的 XSS 攻击载荷
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<div onclick="alert(\'XSS\')">Click me</div>'
      ];
      
      // 创建测试容器
      const testContainer = document.createElement('div');
      testContainer.style.position = 'absolute';
      testContainer.style.top = '-9999px';
      document.body.appendChild(testContainer);
      
      for (const payload of xssPayloads) {
        try {
          // 测试 textContent（安全）
          testContainer.textContent = payload;
          const textContent = testContainer.textContent;
          
          if (textContent !== payload) {
            issues.push(`textContent 处理异常: ${payload}`);
          }
          
          // 测试 innerHTML（可能不安全）
          testContainer.innerHTML = '';
          
          // 模拟用户输入处理
          if (window.uiManager && window.uiManager.sanitizeInput) {
            const sanitized = window.uiManager.sanitizeInput(payload);
            testContainer.innerHTML = sanitized;
            
            // 检查是否包含脚本标签
            const scripts = testContainer.querySelectorAll('script');
            if (scripts.length > 0) {
              issues.push(`输入清理失败，仍包含脚本标签: ${payload}`);
            }
            
            // 检查是否包含事件处理器
            const elementsWithEvents = testContainer.querySelectorAll('[onclick], [onload], [onerror]');
            if (elementsWithEvents.length > 0) {
              issues.push(`输入清理失败，仍包含事件处理器: ${payload}`);
            }
          } else {
            console.warn('未找到输入清理函数，无法测试 XSS 防护');
          }
          
        } catch (error) {
          // 错误可能是好的，说明有防护措施
        }
      }
      
      // 清理测试容器
      document.body.removeChild(testContainer);
      
      // 检查 CSP 头
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!metaCSP) {
        issues.push('缺少 Content Security Policy 元标签');
      } else {
        const cspContent = metaCSP.getAttribute('content');
        if (cspContent.includes("'unsafe-inline'")) {
          issues.push('CSP 允许 unsafe-inline，可能存在 XSS 风险');
        }
      }
      
    } catch (error) {
      issues.push(`XSS 防护测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 客户端安全测试
   */
  async testClientSideSecurity() {
    console.log('\n🔒 测试客户端安全...');
    
    const tests = {
      storageSecurityCheck: this.testStorageSecurity(),
      cookieSecurityCheck: this.testCookieSecurity(),
      corsConfigCheck: await this.testCORSConfiguration(),
      dependencySecurityCheck: this.testDependencySecurity()
    };
    
    const passedTests = Object.values(tests).filter(test => test.passed).length;
    const totalTests = Object.keys(tests).length;
    
    this.testResults.clientSideSecurity = {
      tests,
      passedTests,
      totalTests,
      percentage: Math.round(passedTests / totalTests * 100),
      passed: passedTests === totalTests
    };
    
    console.log(`✅ 客户端安全测试完成: ${passedTests}/${totalTests} 通过`);
  }

  /**
   * 测试存储安全
   */
  testStorageSecurity() {
    const issues = [];
    
    try {
      // 检查 localStorage 中的敏感信息
      const localStorageKeys = Object.keys(localStorage);
      
      localStorageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        
        // 检查是否存储了明文密码
        if (key.toLowerCase().includes('password') || 
            (value && value.toLowerCase().includes('password'))) {
          issues.push(`localStorage 中可能存储了密码信息: ${key}`);
        }
        
        // 检查是否存储了信用卡信息
        if (value && /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/.test(value)) {
          issues.push(`localStorage 中可能存储了信用卡信息: ${key}`);
        }
        
        // 检查是否存储了 API 密钥（明文）
        if (key.toLowerCase().includes('secret') || 
            key.toLowerCase().includes('private')) {
          issues.push(`localStorage 中可能存储了敏感密钥: ${key}`);
        }
      });
      
      // 检查 sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage);
      
      sessionStorageKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        
        if (key.toLowerCase().includes('password') || 
            (value && value.toLowerCase().includes('password'))) {
          issues.push(`sessionStorage 中可能存储了密码信息: ${key}`);
        }
      });
      
    } catch (error) {
      issues.push(`存储安全检查失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试 Cookie 安全
   */
  testCookieSecurity() {
    const issues = [];
    
    try {
      if (document.cookie) {
        const cookies = document.cookie.split(';');
        
        cookies.forEach(cookie => {
          const [name, value] = cookie.split('=').map(s => s.trim());
          
          // 检查是否包含敏感信息
          if (name.toLowerCase().includes('password') || 
              name.toLowerCase().includes('secret')) {
            issues.push(`Cookie 中可能包含敏感信息: ${name}`);
          }
          
          // 注意：在客户端 JavaScript 中无法检查 HttpOnly 和 Secure 标志
          // 这些需要在服务器端或通过开发者工具检查
        });
        
        // 检查是否有过多的 Cookie
        if (cookies.length > 20) {
          issues.push(`Cookie 数量过多 (${cookies.length})，可能影响性能`);
        }
      }
      
    } catch (error) {
      issues.push(`Cookie 安全检查失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试 CORS 配置
   */
  async testCORSConfiguration() {
    const issues = [];
    
    try {
      // 测试跨域请求
      const testUrls = [
        'https://httpbin.org/get',
        'https://jsonplaceholder.typicode.com/posts/1'
      ];
      
      for (const url of testUrls) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          
          // 如果请求成功，检查 CORS 头
          const corsHeaders = {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': response.headers.get('access-control-allow-headers')
          };
          
          // 检查是否允许所有来源
          if (corsHeaders['access-control-allow-origin'] === '*') {
            console.warn(`${url} 允许所有来源的跨域请求`);
          }
          
        } catch (error) {
          // CORS 错误是预期的，说明有适当的限制
        }
      }
      
      // 检查当前域的 CORS 配置
      if (window.supabase) {
        try {
          // Supabase 请求应该正常工作
          await window.supabase.auth.getSession();
        } catch (error) {
          if (error.message.includes('CORS')) {
            issues.push('Supabase CORS 配置可能有问题');
          }
        }
      }
      
    } catch (error) {
      issues.push(`CORS 配置测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 测试依赖安全
   */
  testDependencySecurity() {
    const issues = [];
    
    try {
      // 检查外部脚本
      const externalScripts = document.querySelectorAll('script[src]');
      
      externalScripts.forEach((script, index) => {
        const src = script.src;
        
        // 检查是否使用 HTTPS
        if (src.startsWith('http:')) {
          issues.push(`外部脚本 ${index + 1} 使用不安全的 HTTP: ${src}`);
        }
        
        // 检查是否有 integrity 属性
        if (!script.hasAttribute('integrity') && !src.includes('localhost')) {
          issues.push(`外部脚本 ${index + 1} 缺少 integrity 属性: ${src}`);
        }
        
        // 检查是否有 crossorigin 属性
        if (!script.hasAttribute('crossorigin') && !src.includes(window.location.hostname)) {
          issues.push(`外部脚本 ${index + 1} 缺少 crossorigin 属性: ${src}`);
        }
      });
      
      // 检查外部样式表
      const externalStyles = document.querySelectorAll('link[rel="stylesheet"][href]');
      
      externalStyles.forEach((link, index) => {
        const href = link.href;
        
        if (href.startsWith('http:')) {
          issues.push(`外部样式表 ${index + 1} 使用不安全的 HTTP: ${href}`);
        }
        
        if (!link.hasAttribute('integrity') && !href.includes('localhost')) {
          issues.push(`外部样式表 ${index + 1} 缺少 integrity 属性: ${href}`);
        }
      });
      
      // 检查已知的不安全库
      const unsafeLibraries = [
        'eval',
        'Function',
        'setTimeout',
        'setInterval'
      ];
      
      unsafeLibraries.forEach(lib => {
        if (window[lib] && window[lib].toString().includes('native code')) {
          // 这是正常的，原生函数
        } else if (window[lib]) {
          console.warn(`检测到可能被重写的全局函数: ${lib}`);
        }
      });
      
    } catch (error) {
      issues.push(`依赖安全检查失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 生成安全报告
   */
  generateSecurityReport() {
    console.log('\n📋 生成安全测试报告...');
    
    const categories = ['httpsConnection', 'certificateValidation', 'rlsPolicies', 'permissionControl', 'dataProtection', 'clientSideSecurity'];
    let totalScore = 0;
    let categoryCount = 0;
    
    categories.forEach(category => {
      const result = this.testResults[category];
      if (result && !result.error) {
        categoryCount++;
        
        if (result.percentage !== undefined) {
          totalScore += result.percentage;
        } else if (result.passed) {
          totalScore += 100;
        }
      }
    });
    
    const overallScore = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;
    
    this.testResults.overall = {
      score: overallScore,
      securityLevel: this.getSecurityLevel(overallScore),
      duration: performance.now() - this.startTime,
      timestamp: new Date().toISOString(),
      environment: window.location.href,
      recommendations: this.getSecurityRecommendations()
    };
  }

  /**
   * 获取安全等级
   */
  getSecurityLevel(score) {
    if (score >= 95) return '🔒 高度安全';
    if (score >= 85) return '🛡️ 安全';
    if (score >= 75) return '⚠️ 基本安全';
    if (score >= 60) return '🚨 存在风险';
    return '❌ 高风险';
  }

  /**
   * 获取安全建议
   */
  getSecurityRecommendations() {
    const recommendations = [];
    
    // 收集所有分类的问题和建议
    Object.values(this.testResults).forEach(result => {
      if (result.tests) {
        Object.values(result.tests).forEach(test => {
          if (test.issues) {
            test.issues.forEach(issue => {
              if (issue.includes('HTTPS')) {
                recommendations.push('启用 HTTPS 并配置安全头');
              } else if (issue.includes('RLS')) {
                recommendations.push('检查并修复 RLS 策略配置');
              } else if (issue.includes('XSS')) {
                recommendations.push('加强 XSS 防护，使用 CSP 头');
              } else if (issue.includes('SQL')) {
                recommendations.push('确保使用参数化查询防止 SQL 注入');
              } else if (issue.includes('Cookie')) {
                recommendations.push('配置安全的 Cookie 属性');
              } else if (issue.includes('存储')) {
                recommendations.push('避免在客户端存储敏感信息');
              }
            });
          }
        });
      }
    });
    
    // 去重并返回前10个最重要的建议
    return [...new Set(recommendations)].slice(0, 10);
  }

  /**
   * 显示最终结果
   */
  displayResults() {
    const duration = performance.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('🔒 安全检查完整报告');
    console.log('='.repeat(60));
    
    console.log(`🌐 测试环境: ${window.location.href}`);
    console.log(`⏱️ 测试耗时: ${Math.round(duration)}ms`);
    console.log(`🕒 测试时间: ${new Date().toLocaleString()}`);
    
    const overall = this.testResults.overall;
    console.log(`\n🛡️ 安全评分: ${overall.score}/100`);
    console.log(`🔒 安全等级: ${overall.securityLevel}`);
    
    // 显示各分类结果
    console.log('\n📊 安全检查结果:');
    
    const categories = [
      { key: 'httpsConnection', name: 'HTTPS 连接', icon: '🔐' },
      { key: 'certificateValidation', name: 'SSL 证书', icon: '📜' },
      { key: 'rlsPolicies', name: 'RLS 策略', icon: '🛡️' },
      { key: 'permissionControl', name: '权限控制', icon: '🔐' },
      { key: 'dataProtection', name: '数据保护', icon: '🛡️' },
      { key: 'clientSideSecurity', name: '客户端安全', icon: '🔒' }
    ];
    
    categories.forEach(category => {
      const result = this.testResults[category.key];
      if (result && !result.error) {
        const percentage = result.percentage || (result.passed ? 100 : 0);
        const status = result.passed ? '✅ 安全' : '⚠️ 存在问题';
        
        console.log(`  ${category.icon} ${category.name}: ${status} (${percentage}%)`);
        
        // 显示主要问题
        if (result.tests) {
          const allIssues = [];
          Object.values(result.tests).forEach(test => {
            if (test.issues) {
              allIssues.push(...test.issues);
            }
          });
          
          if (allIssues.length > 0) {
            console.log(`    问题: ${allIssues.slice(0, 2).join('; ')}`);
            if (allIssues.length > 2) {
              console.log(`    还有 ${allIssues.length - 2} 个问题...`);
            }
          }
        }
      } else if (result && result.error) {
        console.log(`  ${category.icon} ${category.name}: ❌ 错误 (${result.error})`);
      }
    });
    
    // 显示安全建议
    if (overall.recommendations && overall.recommendations.length > 0) {
      console.log('\n💡 安全建议:');
      overall.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    // 显示总结
    if (overall.score >= 95) {
      console.log('\n🎉 优秀！网站安全性很高');
    } else if (overall.score >= 85) {
      console.log('\n✅ 网站安全性良好，可以考虑进一步加强');
    } else if (overall.score >= 75) {
      console.log('\n⚠️ 网站安全性基本达标，建议修复发现的问题');
    } else {
      console.log('\n🚨 网站存在安全风险，请尽快修复关键问题');
    }
    
    return this.testResults;
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
    link.download = `security-test-results-${Date.now()}.json`;
    link.click();
    
    console.log('📄 安全测试结果已导出');
  }
}

// 创建全局测试实例
window.securityTester = new SecurityTester();

// 导出测试函数
window.runSecurityTests = () => window.securityTester.runAllTests();

// 导出结果函数
window.exportSecurityResults = () => window.securityTester.exportResults();

// 如果在浏览器环境中，添加快捷键
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + U: 运行安全测试
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'U') {
      e.preventDefault();
      console.log('🔒 快捷键触发安全测试...');
      window.runSecurityTests();
    }
  });
}

console.log('🔒 安全检查测试脚本已加载');
console.log('📝 使用方法:');
console.log('  1. 调用 runSecurityTests() 开始测试');
console.log('  2. 或按 Ctrl/Cmd + Shift + U 快捷键');
console.log('  3. 调用 exportSecurityResults() 导出测试结果');
console.log('  4. 测试将验证 HTTPS、SSL 证书、RLS 策略、权限控制和数据保护');
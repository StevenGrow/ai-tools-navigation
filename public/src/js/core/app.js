/**
 * 主应用协调器
 * 初始化所有管理器，协调各组件交互，实现应用启动逻辑
 */

class App {
  constructor() {
    // 管理器实例
    this.supabaseClient = null;
    this.authManager = null;
    this.toolsManager = null;
    this.uiManager = null;
    this.sessionManager = null;
    this.adminManager = null;
    
    // 应用状态
    this.isInitialized = false;
    this.currentUser = null;
    this.customTools = [];
    
    // 事件监听器存储
    this.eventListeners = new Map();
    
    // 绑定方法上下文
    this.handleAuthStateChange = this.handleAuthStateChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleAddToolSubmit = this.handleAddToolSubmit.bind(this);
    this.handleEditToolSubmit = this.handleEditToolSubmit.bind(this);
    this.handleDeleteToolConfirm = this.handleDeleteToolConfirm.bind(this);
  }

  /**
   * 初始化应用
   * 按顺序初始化所有组件和管理器
   */
  async init() {
    try {
      console.log('开始初始化应用...');
      
      // 1. 等待 Supabase 客户端加载
      await this.waitForSupabase();
      
      // 2. 初始化所有管理器
      this.initializeManagers();
      
      // 3. 设置事件监听器
      this.setupEventListeners();
      
      // 4. 初始化认证状态
      await this.initializeAuthState();
      
      // 5. 加载初始数据
      await this.loadInitialData();
      
      // 6. 标记应用已初始化
      this.isInitialized = true;
      
      console.log('应用初始化完成');
      
      // 显示欢迎消息
      this.showWelcomeMessage();
      
    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * 等待 Supabase 客户端加载
   */
  async waitForSupabase() {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 最多等待 5 秒
      let attempts = 0;
      
      const checkSupabase = () => {
        attempts++;
        
        if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) {
          this.supabaseClient = window.supabaseClient;
          console.log('Supabase 客户端已加载');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Supabase 客户端加载超时'));
        } else {
          setTimeout(checkSupabase, 100);
        }
      };
      
      checkSupabase();
    });
  }

  /**
   * 初始化所有管理器
   */
  initializeManagers() {
    console.log('初始化管理器...');
    
    // 初始化 UI 管理器
    this.uiManager = new UIManager();
    console.log('UI 管理器已初始化');
    
    // 初始化认证管理器
    this.authManager = new AuthManager(this.supabaseClient);
    console.log('认证管理器已初始化');
    
    // 初始化工具管理器
    this.toolsManager = new ToolsManager(this.supabaseClient);
    console.log('工具管理器已初始化');
    
    // 初始化会话管理器
    this.sessionManager = new SessionManager(this.supabaseClient);
    console.log('会话管理器已初始化');
    
    // 初始化管理员管理器
    this.adminManager = new AdminManager(this.supabaseClient);
    console.log('管理员管理器已初始化');
    
    // 将管理器实例设置为全局变量（向后兼容）
    window.uiManager = this.uiManager;
    window.authManager = this.authManager;
    window.toolsManager = this.toolsManager;
    window.adminManager = this.adminManager;
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    console.log('设置事件监听器...');
    
    // 认证相关事件
    this.setupAuthEventListeners();
    
    // 工具管理相关事件
    this.setupToolEventListeners();
    
    // 搜索相关事件
    this.setupSearchEventListeners();
    
    // 导航相关事件
    this.setupNavigationEventListeners();
    
    // 全局事件
    this.setupGlobalEventListeners();
    
    console.log('事件监听器设置完成');
  }

  /**
   * 设置认证相关事件监听器
   */
  setupAuthEventListeners() {
    // 登录按钮
    this.addEventListener('loginBtn', 'click', () => {
      this.uiManager.showLoginModal();
    });
    
    // 注册按钮
    this.addEventListener('registerBtn', 'click', () => {
      this.uiManager.showRegisterModal();
    });
    
    // 登出按钮
    this.addEventListener('logoutBtn', 'click', async () => {
      await this.handleLogout();
    });
    
    // 登录表单提交
    this.addEventListener('loginForm', 'submit', async (e) => {
      await this.handleLoginSubmit(e);
    });
    
    // 注册表单提交
    this.addEventListener('registerForm', 'submit', async (e) => {
      await this.handleRegisterSubmit(e);
    });
    
    // 切换到注册模态框
    this.addEventListener('showRegisterLink', 'click', (e) => {
      e.preventDefault();
      this.uiManager.hideLoginModal();
      this.uiManager.showRegisterModal();
    });
    
    // 切换到登录模态框
    this.addEventListener('showLoginLink', 'click', (e) => {
      e.preventDefault();
      this.uiManager.hideRegisterModal();
      this.uiManager.showLoginModal();
    });
    
    // 认证状态变化监听
    if (this.authManager) {
      this.authManager.onAuthStateChange(this.handleAuthStateChange);
    }
  }

  /**
   * 设置工具管理相关事件监听器
   */
  setupToolEventListeners() {
    // 添加工具按钮
    this.addEventListener('addToolBtn', 'click', () => {
      this.uiManager.showAddToolModal();
    });
    
    // 添加工具表单提交
    this.addEventListener('addToolForm', 'submit', this.handleAddToolSubmit);
    
    // 编辑工具表单提交
    this.addEventListener('editToolForm', 'submit', this.handleEditToolSubmit);
    
    // 确认删除按钮
    this.addEventListener('confirmDeleteBtn', 'click', this.handleDeleteToolConfirm);
    
    // 使用事件委托处理动态添加的工具操作按钮
    document.addEventListener('click', (e) => {
      // 编辑工具按钮
      if (e.target.classList.contains('edit-tool-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.handleEditToolClick(e.target);
      }
      
      // 删除工具按钮
      if (e.target.classList.contains('delete-tool-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.handleDeleteToolClick(e.target);
      }
    });
  }

  /**
   * 设置搜索相关事件监听器
   */
  setupSearchEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      // 防抖搜索
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.handleSearch(searchInput.value);
        }, 300);
      });
      
      // 键盘事件
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(searchTimeout);
          this.handleSearch(searchInput.value);
        }
        if (e.key === 'Escape') {
          searchInput.value = '';
          this.handleSearch('');
        }
      });
    }
  }

  /**
   * 设置导航相关事件监听器
   */
  setupNavigationEventListeners() {
    // 返回顶部按钮
    this.addEventListener('backToTop', 'click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // 滚动显示返回顶部按钮
    window.addEventListener('scroll', () => {
      const backToTopButton = document.getElementById('backToTop');
      if (backToTopButton) {
        if (window.pageYOffset > 300) {
          backToTopButton.classList.add('show');
        } else {
          backToTopButton.classList.remove('show');
        }
      }
    });
    
    // 分类导航平滑滚动
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const navHeight = document.querySelector('.category-nav')?.offsetHeight || 0;
          const targetPosition = targetElement.offsetTop - navHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /**
   * 设置全局事件监听器
   */
  setupGlobalEventListeners() {
    // 页面可见性变化（用于会话管理）
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isInitialized) {
        this.handlePageVisible();
      }
    });
    
    // 窗口焦点变化
    window.addEventListener('focus', () => {
      if (this.isInitialized) {
        this.handleWindowFocus();
      }
    });
    
    // 网络状态变化
    window.addEventListener('online', () => {
      this.handleNetworkOnline();
    });
    
    window.addEventListener('offline', () => {
      this.handleNetworkOffline();
    });
    
    // 响应式测试快捷键
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + T: 运行响应式测试
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.testResponsiveLayout();
      }
      
      // Ctrl/Cmd + Shift + M: 切换测试模式
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        if (document.body.classList.contains('test-mode')) {
          this.disableTestMode();
        } else {
          this.enableTestMode();
        }
      }
    });
  }

  /**
   * 添加事件监听器的辅助方法
   */
  addEventListener(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
      
      // 存储监听器以便后续清理
      const key = `${elementId}-${event}`;
      this.eventListeners.set(key, { element, event, handler });
    } else {
      console.warn(`元素未找到: ${elementId}`);
    }
  }

  /**
   * 初始化认证状态
   */
  async initializeAuthState() {
    try {
      console.log('初始化认证状态...');
      
      // 初始化会话管理
      const user = await this.sessionManager.initializeSession();
      
      if (user) {
        this.currentUser = user;
        console.log('用户会话已恢复:', user.email);
        
        // 开始会话监控
        this.sessionManager.startSessionMonitoring();
      } else {
        console.log('用户未登录');
      }
      
    } catch (error) {
      console.error('❌ 初始化认证状态失败:', error);
    }
  }

  /**
   * 加载初始数据
   */
  async loadInitialData() {
    try {
      console.log('加载初始数据...');
      
      // 如果用户已登录，加载其自定义工具
      if (this.currentUser) {
        await this.loadUserCustomTools();
      }
      
      console.log('初始数据加载完成');
      
    } catch (error) {
      console.error('❌ 加载初始数据失败:', error);
    }
  }

  /**
   * 加载用户自定义工具
   */
  async loadUserCustomTools() {
    if (!this.currentUser) return;
    
    try {
      console.log('加载用户自定义工具...');
      
      // 显示加载动画
      this.uiManager.showLoading('正在加载您的自定义工具...', 'dots');
      
      const customTools = await this.toolsManager.getUserTools(this.currentUser.id);
      this.customTools = customTools;
      
      // 清除现有的自定义工具
      this.removeCustomToolsFromUI();
      
      // 使用进度条显示工具加载进度
      if (customTools.length > 0) {
        this.uiManager.hideLoading();
        this.uiManager.showProgress(0, '正在加载自定义工具...');
        
        for (let i = 0; i < customTools.length; i++) {
          const tool = customTools[i];
          this.addToolToCategory(tool);
          
          // 更新进度
          const progress = ((i + 1) / customTools.length) * 100;
          this.uiManager.updateProgress(progress, `正在加载工具 ${i + 1}/${customTools.length}`);
          
          // 添加小延迟以显示进度效果
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        this.uiManager.hideProgress();
      } else {
        this.uiManager.hideLoading();
      }
      
      console.log(`已加载 ${customTools.length} 个自定义工具`);
      
      if (customTools.length > 0) {
        this.uiManager.showCompletionFeedback('自定义工具加载完成', {
          count: customTools.length,
          time: '0.5秒'
        });
      }
      
    } catch (error) {
      console.error('❌ 加载自定义工具失败:', error);
      this.uiManager.hideLoading();
      this.uiManager.hideProgress();
      this.uiManager.showNotification('加载自定义工具失败，请刷新页面重试', 'error');
    }
  }

  /**
   * 加载管理员工具
   */
  async loadAdminTools() {
    try {
      console.log('加载管理员工具...');
      
      const adminTools = await this.adminManager.getAdminTools();
      
      // 将管理员工具添加到对应分类
      adminTools.forEach(tool => {
        this.addToolToCategory(tool, false, true); // false=不是自定义工具, true=是管理员工具
      });
      
      console.log(`已加载 ${adminTools.length} 个管理员工具`);
      
    } catch (error) {
      console.error('❌ 加载管理员工具失败:', error);
    }
  }

  /**
   * 处理认证状态变化
   */
  async handleAuthStateChange(event, session) {
    const isAuthenticated = !!session?.user;
    const user = session?.user;
    
    console.log('🔄 认证状态变化:', event, isAuthenticated ? user.email : '未登录');
    
    // 更新当前用户
    this.currentUser = user;
    
    // 更新 UI 状态
    this.uiManager.updateUIForAuthState(isAuthenticated, user);
    
    if (isAuthenticated && user) {
      // 用户登录
      await this.handleUserLogin(user);
    } else {
      // 用户登出
      this.handleUserLogout();
    }
  }

  /**
   * 处理用户登录
   */
  async handleUserLogin(user) {
    try {
      // 开始会话监控
      this.sessionManager.startSessionMonitoring();
      
      // 检查管理员状态
      const isAdmin = await this.adminManager.checkAdminStatus();
      console.log('管理员状态:', isAdmin);
      
      // 加载用户自定义工具
      await this.loadUserCustomTools();
      
      // 如果是管理员，加载管理员工具
      if (isAdmin) {
        await this.loadAdminTools();
        this.uiManager.updateUIForAdminState(true);
      }
      
      // 显示欢迎消息
      const welcomeMsg = isAdmin ? 
        `欢迎回来，管理员 ${user.email}！` : 
        `欢迎回来，${user.email}！`;
      this.uiManager.showNotification(welcomeMsg, 'success');
      
    } catch (error) {
      console.error('处理用户登录失败:', error);
    }
  }

  /**
   * 处理用户登出
   */
  handleUserLogout() {
    // 停止会话监控
    this.sessionManager.stopSessionMonitoring();
    
    // 清除自定义工具
    this.customTools = [];
    this.removeCustomToolsFromUI();
    
    // 确保系统工具可见
    this.ensureSystemToolsVisible();
    
    console.log('用户登出处理完成');
  }

  /**
   * 显示欢迎消息
   */
  showWelcomeMessage() {
    if (this.currentUser) {
      this.uiManager.showNotification(`欢迎回来，${this.currentUser.email}！`, 'success');
    } else {
      // 可以显示一个简单的应用就绪消息
      console.log('AI 工具导航网站已就绪');
    }
  }

  /**
   * 处理初始化错误
   */
  handleInitializationError(error) {
    console.error('应用初始化失败:', error);
    
    // 显示错误消息给用户
    const errorMessage = '应用初始化失败，请刷新页面重试';
    
    // 尝试显示通知，如果 UI 管理器未初始化则使用 alert
    if (this.uiManager) {
      this.uiManager.showNotification(errorMessage, 'error', 0); // 不自动关闭
    } else {
      alert(errorMessage);
    }
  }

  /**
   * 处理页面可见性变化
   */
  async handlePageVisible() {
    // 页面重新可见时，检查认证状态
    if (this.authManager) {
      try {
        const user = await this.authManager.getCurrentUser();
        if (user && !this.currentUser) {
          // 用户在其他标签页登录了
          this.currentUser = user;
          await this.handleUserLogin(user);
        } else if (!user && this.currentUser) {
          // 用户在其他标签页登出了
          this.currentUser = null;
          this.handleUserLogout();
        }
      } catch (error) {
        console.error('检查认证状态失败:', error);
      }
    }
  }

  /**
   * 处理窗口获得焦点
   */
  handleWindowFocus() {
    // 窗口获得焦点时的处理逻辑
    console.log('窗口获得焦点');
  }

  /**
   * 处理网络连接恢复
   */
  handleNetworkOnline() {
    console.log('网络连接已恢复');
    this.uiManager.showNotification('网络连接已恢复', 'success');
  }

  /**
   * 处理网络连接断开
   */
  handleNetworkOffline() {
    console.log('网络连接已断开');
    this.uiManager.showNotification('网络连接已断开，部分功能可能无法使用', 'warning', 0);
  }

  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证密码强度
   * @param {string} password - 密码
   * @returns {Object}
   */
  validatePassword(password) {
    const result = {
      valid: true,
      strength: 'weak',
      issues: []
    };

    if (!password || password.length < 6) {
      result.valid = false;
      result.issues.push('密码长度至少需要6个字符');
    }

    if (password && password.length >= 8) {
      result.strength = 'medium';
    }

    if (password && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      result.strength = 'strong';
    }

    return result;
  }

  /**
   * 获取分类中文名称
   * @param {string} category - 分类ID
   * @returns {string}
   */
  getCategoryName(category) {
    const categoryNames = {
      chat: '对话助手',
      image: '绘画',
      video: '视频',
      writing: '写作',
      coding: '编程',
      audio: '音频'
    };
    return categoryNames[category] || category;
  }

  /**
   * 获取应用状态信息
   */
  getAppState() {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser,
      customToolsCount: this.customTools.length,
      isOnline: navigator.onLine
    };
  }

  /**
   * 清理资源
   */
  cleanup() {
    console.log('清理应用资源...');
    
    // 停止会话监控
    if (this.sessionManager) {
      this.sessionManager.stopSessionMonitoring();
    }
    
    // 清理事件监听器
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners.clear();
    
    // 重置状态
    this.isInitialized = false;
    this.currentUser = null;
    this.customTools = [];
    
    console.log('应用资源清理完成');
  }

  /**
   * 处理登录表单提交
   */
  async handleLoginSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.form-submit-btn');
    
    try {
      // 显示加载状态
      this.uiManager.showButtonLoading(submitBtn, '登录中...', 'dots');
      this.uiManager.hideError('loginError');
      
      // 获取表单数据
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const password = formData.get('password');
      
      // 验证表单
      if (!email || !password) {
        this.uiManager.showError('loginError', '请填写完整的登录信息', 'validation', [
          '确保邮箱地址已填写',
          '确保密码已填写',
          '检查输入格式是否正确'
        ]);
        return;
      }
      
      if (!this.isValidEmail(email)) {
        this.uiManager.showError('loginError', '请输入有效的邮箱地址', 'validation', [
          '检查邮箱格式是否正确',
          '确保包含@符号和域名',
          '避免使用特殊字符'
        ]);
        return;
      }
      
      // 执行登录
      const result = await this.authManager.signIn(email, password);
      
      if (result.success) {
        // 登录成功
        this.uiManager.showButtonLoading(submitBtn, '登录成功！');
        
        // 短暂延迟显示成功状态
        setTimeout(() => {
          this.uiManager.hideLoginModal();
          this.uiManager.showSuccessFeedback('login', '', {
            subtitle: `欢迎回来，${this.currentUser?.email || ''}`,
            celebrate: true
          });
          
          // 清空表单
          e.target.reset();
        }, 800);
      } else {
        // 登录失败 - 特殊处理邮箱确认错误
        if (result.errorType === 'email_not_confirmed') {
          // 关闭登录模态框
          this.uiManager.hideLoginModal();
          // 显示友好的邮箱确认弹窗
          this.uiManager.showEmailConfirmationModal(result.email || email);
        } else {
          // 其他错误使用增强错误处理
          this.uiManager.showAuthError(new Error(result.error), email);
        }
      }
      
    } catch (error) {
      console.error('登录失败:', error);
      
      // 根据错误类型显示不同的错误信息
      if (error.message.includes('network') || error.message.includes('fetch')) {
        this.uiManager.showNetworkError(error);
      } else {
        this.uiManager.showAuthError(error);
      }
    } finally {
      if (!e.target.querySelector('.form-submit-btn').textContent.includes('成功')) {
        this.uiManager.hideButtonLoading(submitBtn);
      }
    }
  }

  /**
   * 处理注册表单提交
   */
  async handleRegisterSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.form-submit-btn');
    
    try {
      // 显示加载状态
      this.uiManager.showButtonLoading(submitBtn, '注册中...', 'dots');
      this.uiManager.hideError('registerError');
      
      // 获取表单数据
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');
      
      // 验证表单
      if (!email || !password || !confirmPassword) {
        this.uiManager.showError('registerError', '请填写完整的注册信息', 'validation', [
          '确保所有字段都已填写',
          '检查邮箱格式是否正确',
          '确认密码是否匹配'
        ]);
        return;
      }
      
      if (!this.isValidEmail(email)) {
        this.uiManager.showError('registerError', '请输入有效的邮箱地址', 'validation', [
          '检查邮箱格式是否正确',
          '确保包含@符号和域名',
          '避免使用特殊字符'
        ]);
        return;
      }
      
      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.valid) {
        this.uiManager.showError('registerError', passwordValidation.issues[0], 'validation', [
          '使用至少6个字符的密码',
          '建议包含大小写字母和数字',
          '避免使用过于简单的密码'
        ]);
        return;
      }
      
      if (password !== confirmPassword) {
        this.uiManager.showError('registerError', '两次输入的密码不匹配', 'validation', [
          '确保两次输入的密码完全相同',
          '注意大小写是否一致',
          '重新输入确认密码'
        ]);
        return;
      }
      
      // 执行注册
      const result = await this.authManager.signUp(email, password);
      
      if (result.success) {
        // 注册成功
        this.uiManager.showButtonLoading(submitBtn, '注册成功！');
        
        setTimeout(() => {
          this.uiManager.hideRegisterModal();
          this.uiManager.showSuccessFeedback('register', '', {
            subtitle: '请查收邮箱确认邮件',
            celebrate: true
          });
          
          // 清空表单
          e.target.reset();
        }, 800);
      } else {
        // 注册失败
        this.uiManager.showAuthError(new Error(result.error));
      }
      
    } catch (error) {
      console.error('注册失败:', error);
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        this.uiManager.showNetworkError(error);
      } else {
        this.uiManager.showAuthError(error);
      }
    } finally {
      if (!e.target.querySelector('.form-submit-btn').textContent.includes('成功')) {
        this.uiManager.hideButtonLoading(submitBtn);
      }
    }
  }

  /**
   * 处理用户登出
   */
  async handleLogout() {
    try {
      // 显示确认对话框
      this.uiManager.showConfirmDialog(
        '确认登出',
        '您确定要登出吗？',
        async () => {
          // 用户确认登出
          this.uiManager.showLoading('正在登出...');
          
          const result = await this.authManager.signOut();
          
          if (result.success) {
            this.uiManager.showSuccessFeedback('logout', '', {
              subtitle: '期待您的再次访问'
            });
          } else {
            this.uiManager.showNotification(result.error || '登出失败', 'error');
          }
          
          this.uiManager.hideLoading();
        },
        () => {
          // 用户取消登出
          console.log('用户取消登出');
        }
      );
      
    } catch (error) {
      console.error('登出失败:', error);
      this.uiManager.showNotification('登出失败，请刷新页面重试', 'error');
    }
  }

  /**
   * 处理添加工具表单提交
   */
  async handleAddToolSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.form-submit-btn');
    
    try {
      // 显示加载状态
      this.uiManager.showButtonLoading(submitBtn, '添加中...', 'pulse');
      this.uiManager.hideError('addToolError');
      
      // 获取表单数据
      const toolData = {
        name: document.getElementById('toolName').value,
        url: document.getElementById('toolUrl').value,
        description: document.getElementById('toolDesc').value,
        category: document.getElementById('toolCategory').value,
        isFree: document.getElementById('toolIsFree').checked,
        isChinese: document.getElementById('toolIsChinese').checked
      };
      
      // 检查是否是管理员模式
      const isAdminMode = document.querySelector('#addToolModal .admin-notice') !== null;
      
      let newTool;
      if (isAdminMode && this.adminManager.getAdminStatus()) {
        // 管理员添加系统工具
        const result = await this.adminManager.addAdminTool(toolData);
        if (!result.success) {
          throw new Error(result.error);
        }
        newTool = result.data;
      } else {
        // 普通用户添加个人工具
        newTool = await this.toolsManager.addTool(toolData);
      }
      
      // 显示成功状态
      this.uiManager.showButtonLoading(submitBtn, '添加成功！');
      
      // 短暂延迟后处理成功逻辑
      setTimeout(() => {
        // 成功后的处理
        this.uiManager.hideAddToolModal();
        this.uiManager.showSuccessFeedback('add', '工具', {
          subtitle: `${toolData.name} 已添加到 ${this.getCategoryName(toolData.category)}`,
          celebrate: true
        });
        
        // 将新工具添加到对应分类
        this.addToolToCategory(newTool);
        
        // 更新自定义工具列表
        this.customTools.push(newTool);
        
        // 重置表单
        e.target.reset();
      }, 800);
      
    } catch (error) {
      console.error('添加工具失败:', error);
      
      // 根据错误类型显示不同的错误信息
      if (error.message.includes('网址')) {
        this.uiManager.showError('addToolError', error.message, 'validation', [
          '确保网址以 http:// 或 https:// 开头',
          '检查网址格式是否正确',
          '确认网址可以正常访问'
        ]);
      } else if (error.message.includes('名称')) {
        this.uiManager.showError('addToolError', error.message, 'validation', [
          '工具名称不能为空',
          '名称长度不超过100个字符',
          '使用简洁明了的名称'
        ]);
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        this.uiManager.showNetworkError(error);
      } else {
        this.uiManager.showError('addToolError', error.message || '添加工具失败，请重试', 'error', [
          '检查网络连接',
          '确认所有信息填写正确',
          '稍后重试'
        ]);
      }
      
      this.uiManager.hideButtonLoading(submitBtn);
    }
  }

  /**
   * 处理编辑工具表单提交
   */
  async handleEditToolSubmit(e) {
    e.preventDefault();
    
    try {
      // 获取工具ID
      const modal = document.getElementById('editToolModal');
      const toolId = modal.getAttribute('data-tool-id');
      
      if (!toolId) {
        this.uiManager.showError('editToolError', '无法获取工具ID');
        return;
      }
      
      // 显示加载状态
      this.uiManager.showFormLoading(e.target);
      this.uiManager.hideError('editToolError');
      
      // 获取表单数据
      const toolData = {
        name: document.getElementById('editToolName').value,
        url: document.getElementById('editToolUrl').value,
        description: document.getElementById('editToolDesc').value,
        category: document.getElementById('editToolCategory').value,
        isFree: document.getElementById('editToolIsFree').checked,
        isChinese: document.getElementById('editToolIsChinese').checked
      };
      
      // 更新工具
      const updatedTool = await this.toolsManager.updateTool(toolId, toolData);
      
      // 成功后的处理
      this.uiManager.hideEditToolModal();
      this.uiManager.showSuccessFeedback('update', updatedTool.tool_name, {
        subtitle: '工具信息已更新'
      });
      
      // 更新页面中的工具卡片
      this.updateToolCardInUI(updatedTool);
      
      // 更新自定义工具列表
      const toolIndex = this.customTools.findIndex(tool => tool.id === toolId);
      if (toolIndex !== -1) {
        this.customTools[toolIndex] = updatedTool;
      }
      
    } catch (error) {
      console.error('更新工具失败:', error);
      this.uiManager.showError('editToolError', error.message);
    } finally {
      this.uiManager.hideFormLoading(e.target);
    }
  }

  /**
   * 处理删除工具确认
   */
  async handleDeleteToolConfirm() {
    const modal = document.getElementById('deleteToolModal');
    const toolId = modal.getAttribute('data-tool-id');
    
    if (!toolId) {
      this.uiManager.showNotification('无法获取工具ID', 'error');
      return;
    }

    const confirmBtn = document.getElementById('confirmDeleteBtn');

    try {
      // 显示加载状态
      this.uiManager.showButtonLoading(confirmBtn, '删除中...', 'bars');

      // 删除工具
      await this.toolsManager.deleteTool(toolId);
      
      // 显示成功状态
      this.uiManager.showButtonLoading(confirmBtn, '删除成功！');
      
      // 短暂延迟后处理成功逻辑
      setTimeout(() => {
        // 获取工具信息用于反馈
        const tool = this.customTools.find(t => t.id === toolId);
        const toolName = tool ? tool.tool_name : '工具';
        
        // 成功后的处理
        this.uiManager.hideDeleteToolModal();
        this.uiManager.showSuccessFeedback('delete', toolName, {
          subtitle: '已从您的工具列表中移除'
        });
        
        // 从页面移除工具卡片
        this.removeToolCardFromUI(toolId);
        
        // 从自定义工具列表中移除
        this.customTools = this.customTools.filter(tool => tool.id !== toolId);
      }, 800);
      
    } catch (error) {
      console.error('删除工具失败:', error);
      this.uiManager.showNotification(error.message || '删除工具失败，请重试', 'error');
      this.uiManager.hideButtonLoading(confirmBtn);
    }
  }

  /**
   * 处理编辑工具按钮点击
   */
  handleEditToolClick(button) {
    const toolId = button.getAttribute('data-tool-id');
    const tool = this.customTools.find(t => t.id === toolId);
    
    if (tool) {
      console.log('编辑工具:', tool);
      this.uiManager.showEditToolModal(tool);
    } else {
      console.error('未找到要编辑的工具:', toolId);
      this.uiManager.showNotification('未找到要编辑的工具', 'error');
    }
  }

  /**
   * 处理删除工具按钮点击
   */
  handleDeleteToolClick(button) {
    const toolId = button.getAttribute('data-tool-id');
    const tool = this.customTools.find(t => t.id === toolId);
    
    if (tool) {
      console.log('准备删除工具:', tool);
      this.uiManager.showDeleteToolModal(tool);
    } else {
      console.error('未找到要删除的工具:', toolId);
      this.uiManager.showNotification('未找到要删除的工具', 'error');
    }
  }

  /**
   * 处理搜索
   */
  handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const categories = document.querySelectorAll('.category');
    
    console.log('执行搜索:', term);
    
    categories.forEach(category => {
      let hasVisibleCards = false;
      const cards = category.querySelectorAll('.tool-card');
      
      cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const desc = card.getAttribute('data-desc').toLowerCase();
        const isCustom = card.getAttribute('data-custom') === 'true';
        
        // 如果用户未登录，跳过自定义工具
        if (!this.currentUser && isCustom) {
          card.classList.add('hidden');
          return;
        }
        
        // 执行搜索匹配
        const matchesSearch = term === '' || 
                            name.includes(term) || 
                            desc.includes(term);
        
        if (matchesSearch) {
          card.classList.remove('hidden');
          hasVisibleCards = true;
          
          // 为搜索结果添加工具类型标识
          this.updateToolCardSearchIndicator(card, isCustom, term);
        } else {
          card.classList.add('hidden');
          this.removeToolCardSearchIndicator(card);
        }
      });
      
      // 如果分类下没有可见的卡片，隐藏整个分类
      if (hasVisibleCards || term === '') {
        category.classList.remove('hidden');
      } else {
        category.classList.add('hidden');
      }
      
      // 更新网格布局
      const toolsGrid = category.querySelector('.tools-grid');
      if (toolsGrid) {
        this.updateGridLayout(toolsGrid);
      }
    });
    
    // 显示搜索结果统计
    if (term !== '') {
      this.showSearchStats(term);
    } else {
      // 清空搜索时移除所有搜索指示器
      this.clearAllSearchIndicators();
    }
  }

  /**
   * 将工具添加到对应分类
   */
  addToolToCategory(tool) {
    const categorySection = document.querySelector(`#${tool.category}`);
    if (categorySection) {
      const toolsGrid = categorySection.querySelector('.tools-grid');
      if (toolsGrid) {
        const toolCard = this.uiManager.renderToolCard(tool, true);
        
        // 为自定义工具添加事件监听器
        this.addCustomToolEventListeners(toolCard, tool);
        
        // 添加入场动画
        toolCard.style.opacity = '0';
        toolCard.style.transform = 'translateY(20px)';
        
        // 将自定义工具插入到网格中，保持两列布局
        this.insertToolIntoGrid(toolsGrid, toolCard);
        
        // 触发入场动画
        setTimeout(() => {
          toolCard.style.transition = 'all 0.3s ease';
          toolCard.style.opacity = '1';
          toolCard.style.transform = 'translateY(0)';
          
          // 显示浮动成功消息
          this.uiManager.showFloatingSuccess(toolCard, '已添加');
        }, 50);
        
        // 确保分类可见（处理空分类情况）
        categorySection.classList.remove('hidden');
        
        console.log('工具已添加到分类:', tool.tool_name, tool.category);
      }
    }
  }

  /**
   * 从 UI 中移除所有自定义工具
   */
  removeCustomToolsFromUI() {
    const customToolCards = document.querySelectorAll('.tool-card[data-custom="true"]');
    customToolCards.forEach(card => {
      const toolsGrid = card.parentElement;
      card.remove();
      
      // 更新网格布局
      if (toolsGrid) {
        this.updateGridLayout(toolsGrid);
        
        // 检查分类是否变为空（只有在搜索时才隐藏空分类）
        this.checkEmptyCategory(toolsGrid.closest('.category'));
      }
    });
    
    console.log('已移除所有自定义工具');
  }

  /**
   * 确保系统工具可见
   */
  ensureSystemToolsVisible() {
    const systemToolCards = document.querySelectorAll('.tool-card[data-custom="false"], .tool-card:not([data-custom])');
    systemToolCards.forEach(card => {
      card.style.display = '';
      card.classList.remove('hidden');
    });
    
    // 确保所有分类可见
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
      category.classList.remove('hidden');
    });
    
    console.log('系统工具已确保可见');
  }

  /**
   * 为自定义工具添加事件监听器
   */
  addCustomToolEventListeners(toolCard, tool) {
    // 编辑按钮事件
    const editBtn = toolCard.querySelector('.edit-tool-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleEditToolClick(editBtn);
      });
    }
    
    // 删除按钮事件
    const deleteBtn = toolCard.querySelector('.delete-tool-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleDeleteToolClick(deleteBtn);
      });
    }
  }

  /**
   * 将工具卡片插入到网格中，保持布局
   */
  insertToolIntoGrid(toolsGrid, toolCard) {
    // 获取现有的工具卡片
    const existingCards = toolsGrid.querySelectorAll('.tool-card');
    
    // 如果网格为空，直接添加
    if (existingCards.length === 0) {
      toolsGrid.appendChild(toolCard);
      return;
    }
    
    // 将自定义工具添加到末尾，保持两列布局
    toolsGrid.appendChild(toolCard);
    
    // 确保网格布局正确
    this.updateGridLayout(toolsGrid);
  }

  /**
   * 更新网格布局
   */
  updateGridLayout(toolsGrid) {
    // 确保网格使用正确的 CSS 类
    if (!toolsGrid.classList.contains('tools-grid')) {
      toolsGrid.classList.add('tools-grid');
    }
    
    // 统计工具数量，用于调试
    const totalCards = toolsGrid.querySelectorAll('.tool-card').length;
    const customCards = toolsGrid.querySelectorAll('.tool-card[data-custom="true"]').length;
    const systemCards = totalCards - customCards;
    
    console.log(`网格布局更新: 系统工具 ${systemCards} 个，自定义工具 ${customCards} 个，总计 ${totalCards} 个`);
  }

  /**
   * 从 UI 中移除指定的工具卡片
   */
  removeToolCardFromUI(toolId) {
    const toolCard = document.querySelector(`[data-tool-id="${toolId}"]`);
    
    if (toolCard) {
      const toolsGrid = toolCard.parentElement;
      const categorySection = toolCard.closest('.category');
      
      // 移除工具卡片
      toolCard.remove();
      
      // 更新网格布局
      if (toolsGrid) {
        this.updateGridLayout(toolsGrid);
        
        // 检查分类是否变为空
        this.checkEmptyCategory(categorySection);
      }
      
      console.log('工具卡片已从UI中移除:', toolId);
    } else {
      console.warn('未找到要删除的工具卡片:', toolId);
    }
  }

  /**
   * 更新页面中的工具卡片
   */
  updateToolCardInUI(updatedTool) {
    // 查找现有的工具卡片
    const existingCard = document.querySelector(`[data-tool-id="${updatedTool.id}"]`);
    
    if (existingCard) {
      const oldCategory = existingCard.closest('.category');
      const oldToolsGrid = existingCard.parentElement;
      
      // 检查分类是否发生变化
      const newCategoryId = updatedTool.category;
      const oldCategoryId = oldCategory ? oldCategory.id : null;
      
      if (oldCategoryId !== newCategoryId) {
        // 分类发生变化，需要移动工具卡片
        
        // 从旧分类中移除
        existingCard.remove();
        
        // 添加到新分类
        this.addToolToCategory(updatedTool);
        
        // 更新旧分类的布局
        if (oldToolsGrid) {
          this.updateGridLayout(oldToolsGrid);
          this.checkEmptyCategory(oldCategory);
        }
      } else {
        // 分类未变化，只需要更新卡片内容
        const newCard = this.uiManager.renderToolCard(updatedTool, true);
        
        // 为新卡片添加事件监听器
        this.addCustomToolEventListeners(newCard, updatedTool);
        
        // 替换现有卡片
        existingCard.parentNode.replaceChild(newCard, existingCard);
      }
      
      console.log('工具卡片已更新:', updatedTool.tool_name);
    } else {
      console.warn('未找到要更新的工具卡片:', updatedTool.id);
      // 如果找不到现有卡片，直接添加新卡片
      this.addToolToCategory(updatedTool);
    }
  }

  /**
   * 检查并处理空分类
   */
  checkEmptyCategory(categorySection) {
    if (!categorySection) return;
    
    const toolsGrid = categorySection.querySelector('.tools-grid');
    if (!toolsGrid) return;
    
    const visibleCards = toolsGrid.querySelectorAll('.tool-card:not(.hidden)');
    
    // 只有在搜索状态下才隐藏空分类
    const searchInput = document.getElementById('searchInput');
    const isSearching = searchInput && searchInput.value.trim() !== '';
    
    if (isSearching && visibleCards.length === 0) {
      categorySection.classList.add('hidden');
    } else {
      categorySection.classList.remove('hidden');
    }
  }

  /**
   * 显示搜索结果统计
   */
  showSearchStats(searchTerm) {
    const visibleCards = document.querySelectorAll('.tool-card:not(.hidden)');
    const systemCards = document.querySelectorAll('.tool-card[data-custom="false"]:not(.hidden), .tool-card:not([data-custom]):not(.hidden)').length;
    const customCards = document.querySelectorAll('.tool-card[data-custom="true"]:not(.hidden)').length;
    
    console.log(`搜索 "${searchTerm}" 结果: 系统工具 ${systemCards} 个，自定义工具 ${customCards} 个，总计 ${visibleCards.length} 个`);
    
    // 显示搜索结果提示
    this.showSearchResultsNotification(searchTerm, systemCards, customCards, visibleCards.length);
  }

  /**
   * 显示搜索结果通知
   */
  showSearchResultsNotification(searchTerm, systemCount, customCount, totalCount) {
    // 移除之前的搜索结果通知
    const existingNotification = document.querySelector('.search-results-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // 移除之前的空结果消息
    const existingEmptyMessage = document.querySelector('.search-empty-message');
    if (existingEmptyMessage) {
      existingEmptyMessage.remove();
    }
    
    // 如果没有结果，显示空结果提示
    if (totalCount === 0) {
      this.showEmptySearchResults(searchTerm);
      return;
    }
    
    // 构建结果消息
    let message = `找到 ${totalCount} 个工具`;
    if (customCount > 0) {
      message += ` (系统工具 ${systemCount} 个，自定义工具 ${customCount} 个)`;
    }
    
    // 创建搜索结果通知元素
    const notification = document.createElement('div');
    notification.className = 'search-results-notification';
    notification.innerHTML = `
      <span class="search-term">搜索 "${searchTerm}":</span>
      <span class="search-count">${message}</span>
      <div class="search-stats">
        <div class="search-stats-item">
          <div class="search-stats-icon system"></div>
          <span>系统工具: ${systemCount}</span>
        </div>
        <div class="search-stats-item">
          <div class="search-stats-icon custom"></div>
          <span>自定义工具: ${customCount}</span>
        </div>
      </div>
    `;
    
    // 插入到搜索框下方
    const searchInput = document.getElementById('searchInput');
    const searchContainer = searchInput?.parentElement;
    if (searchContainer) {
      searchContainer.appendChild(notification);
    }
  }

  /**
   * 显示空搜索结果
   */
  showEmptySearchResults(searchTerm) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'search-empty-message';
    emptyMessage.innerHTML = `
      <div class="empty-icon">🔍</div>
      <p>未找到包含 "${searchTerm}" 的工具</p>
      <p class="warning-text">尝试使用不同的关键词或检查拼写</p>
    `;
    
    // 插入到第一个分类前面
    const firstCategory = document.querySelector('.category');
    if (firstCategory && firstCategory.parentElement) {
      firstCategory.parentElement.insertBefore(emptyMessage, firstCategory);
    }
    
    // 同时显示通知
    this.uiManager.showNotification(`未找到包含 "${searchTerm}" 的工具`, 'info');
  }

  /**
   * 为工具卡片添加搜索类型指示器
   */
  updateToolCardSearchIndicator(card, isCustom, searchTerm) {
    // 移除现有的搜索指示器
    this.removeToolCardSearchIndicator(card);
    
    // 添加搜索匹配样式
    card.classList.add('search-match');
    
    // 高亮搜索词
    if (searchTerm) {
      this.highlightSearchTermInCard(card, searchTerm);
    }
    
    // 为自定义工具添加特殊标识
    if (isCustom) {
      const indicator = document.createElement('div');
      indicator.className = 'search-custom-indicator';
      indicator.innerHTML = '<span>自定义</span>';
      card.appendChild(indicator);
    }
  }

  /**
   * 在工具卡片中高亮搜索词
   */
  highlightSearchTermInCard(card, searchTerm) {
    const nameElement = card.querySelector('.tool-name');
    const descElement = card.querySelector('.tool-desc');
    
    if (nameElement) {
      const originalName = nameElement.getAttribute('data-original-text') || nameElement.textContent;
      nameElement.setAttribute('data-original-text', originalName);
      nameElement.innerHTML = this.highlightText(originalName, searchTerm);
    }
    
    if (descElement) {
      const originalDesc = descElement.getAttribute('data-original-text') || descElement.textContent;
      descElement.setAttribute('data-original-text', originalDesc);
      descElement.innerHTML = this.highlightText(originalDesc, searchTerm);
    }
  }

  /**
   * 高亮文本中的搜索词
   */
  highlightText(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  /**
   * 转义正则表达式特殊字符
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 移除工具卡片的搜索指示器
   */
  removeToolCardSearchIndicator(card) {
    card.classList.remove('search-match');
    const indicator = card.querySelector('.search-custom-indicator');
    if (indicator) {
      indicator.remove();
    }
    
    // 恢复原始文本
    this.restoreOriginalTextInCard(card);
  }

  /**
   * 恢复工具卡片的原始文本
   */
  restoreOriginalTextInCard(card) {
    const nameElement = card.querySelector('.tool-name');
    const descElement = card.querySelector('.tool-desc');
    
    if (nameElement && nameElement.hasAttribute('data-original-text')) {
      nameElement.textContent = nameElement.getAttribute('data-original-text');
      nameElement.removeAttribute('data-original-text');
    }
    
    if (descElement && descElement.hasAttribute('data-original-text')) {
      descElement.textContent = descElement.getAttribute('data-original-text');
      descElement.removeAttribute('data-original-text');
    }
  }

  /**
   * 清除所有搜索指示器
   */
  clearAllSearchIndicators() {
    // 移除搜索结果通知
    const notification = document.querySelector('.search-results-notification');
    if (notification) {
      notification.remove();
    }
    
    // 移除空搜索结果消息
    const emptyMessage = document.querySelector('.search-empty-message');
    if (emptyMessage) {
      emptyMessage.remove();
    }
    
    // 移除所有工具卡片的搜索指示器
    const allCards = document.querySelectorAll('.tool-card');
    allCards.forEach(card => {
      this.removeToolCardSearchIndicator(card);
    });
    
    // 确保所有分类可见
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
      category.classList.remove('hidden');
    });
  }

  /**
   * 响应式测试功能
   */
  testResponsiveLayout() {
    console.log('开始响应式布局测试...');
    
    const testResults = {
      viewport: this.getViewportInfo(),
      modals: this.testModalResponsiveness(),
      toolCards: this.testToolCardResponsiveness(),
      navigation: this.testNavigationResponsiveness(),
      forms: this.testFormResponsiveness()
    };
    
    console.log('响应式测试结果:', testResults);
    
    // 显示测试结果
    this.displayTestResults(testResults);
    
    return testResults;
  }

  /**
   * 获取视口信息
   */
  getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      orientation: window.screen.orientation?.type || 'unknown',
      breakpoint: this.getCurrentBreakpoint()
    };
  }

  /**
   * 获取当前断点
   */
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    if (width <= 320) return 'xs';
    if (width <= 480) return 'sm';
    if (width <= 768) return 'md';
    if (width <= 1024) return 'lg';
    return 'xl';
  }

  /**
   * 测试模态框响应性
   */
  testModalResponsiveness() {
    const results = {};
    const modals = ['loginModal', 'registerModal', 'addToolModal', 'editToolModal', 'deleteToolModal'];
    
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          const rect = modalContent.getBoundingClientRect();
          results[modalId] = {
            width: rect.width,
            height: rect.height,
            fitsInViewport: rect.width <= window.innerWidth && rect.height <= window.innerHeight,
            hasScrollbar: modalContent.scrollHeight > modalContent.clientHeight
          };
        }
      }
    });
    
    return results;
  }

  /**
   * 测试工具卡片响应性
   */
  testToolCardResponsiveness() {
    const toolCards = document.querySelectorAll('.tool-card');
    const results = {
      totalCards: toolCards.length,
      cardSizes: [],
      actionButtonSizes: [],
      touchFriendly: true
    };
    
    toolCards.forEach((card, index) => {
      if (index < 5) { // 只测试前5个卡片
        const rect = card.getBoundingClientRect();
        results.cardSizes.push({
          width: rect.width,
          height: rect.height
        });
        
        // 测试操作按钮
        const actionBtns = card.querySelectorAll('.tool-action-btn');
        actionBtns.forEach(btn => {
          const btnRect = btn.getBoundingClientRect();
          const size = {
            width: btnRect.width,
            height: btnRect.height,
            touchFriendly: btnRect.width >= 44 && btnRect.height >= 44
          };
          results.actionButtonSizes.push(size);
          
          if (!size.touchFriendly) {
            results.touchFriendly = false;
          }
        });
      }
    });
    
    return results;
  }

  /**
   * 测试导航响应性
   */
  testNavigationResponsiveness() {
    const userActions = document.querySelector('.user-actions');
    const categoryNav = document.querySelector('.category-nav');
    const searchInput = document.getElementById('searchInput');
    
    return {
      userActions: userActions ? {
        width: userActions.getBoundingClientRect().width,
        visible: !userActions.classList.contains('hidden')
      } : null,
      categoryNav: categoryNav ? {
        width: categoryNav.getBoundingClientRect().width,
        scrollable: categoryNav.scrollWidth > categoryNav.clientWidth
      } : null,
      searchInput: searchInput ? {
        width: searchInput.getBoundingClientRect().width,
        height: searchInput.getBoundingClientRect().height
      } : null
    };
  }

  /**
   * 测试表单响应性
   */
  testFormResponsiveness() {
    const formInputs = document.querySelectorAll('.form-input');
    const formButtons = document.querySelectorAll('.form-submit-btn');
    
    const results = {
      inputs: [],
      buttons: [],
      touchFriendly: true
    };
    
    formInputs.forEach((input, index) => {
      if (index < 3) { // 只测试前3个输入框
        const rect = input.getBoundingClientRect();
        const inputResult = {
          width: rect.width,
          height: rect.height,
          touchFriendly: rect.height >= 44
        };
        results.inputs.push(inputResult);
        
        if (!inputResult.touchFriendly) {
          results.touchFriendly = false;
        }
      }
    });
    
    formButtons.forEach((button, index) => {
      if (index < 2) { // 只测试前2个按钮
        const rect = button.getBoundingClientRect();
        const buttonResult = {
          width: rect.width,
          height: rect.height,
          touchFriendly: rect.height >= 44
        };
        results.buttons.push(buttonResult);
        
        if (!buttonResult.touchFriendly) {
          results.touchFriendly = false;
        }
      }
    });
    
    return results;
  }

  /**
   * 显示测试结果
   */
  displayTestResults(results) {
    const { viewport, modals, toolCards, navigation, forms } = results;
    
    console.log(`当前视口: ${viewport.width}x${viewport.height} (${viewport.breakpoint})`);
    console.log(`触摸友好性: 工具卡片 ${toolCards.touchFriendly ? '通过' : '未通过'}, 表单 ${forms.touchFriendly ? '通过' : '未通过'}`);
    
    // 创建测试结果通知
    let message = `响应式测试完成 (${viewport.breakpoint}断点)`;
    let type = 'info';
    
    if (!toolCards.touchFriendly || !forms.touchFriendly) {
      message += ' - 发现触摸友好性问题';
      type = 'warning';
    }
    
    this.uiManager.showNotification(message, type);
    
    // 在控制台显示详细结果
    console.table({
      '视口宽度': viewport.width,
      '视口高度': viewport.height,
      '断点': viewport.breakpoint,
      '工具卡片数量': toolCards.totalCards,
      '工具卡片触摸友好': toolCards.touchFriendly ? '是' : '否',
      '表单触摸友好': forms.touchFriendly ? '是' : '否'
    });
  }

  /**
   * 启用测试模式
   */
  enableTestMode() {
    document.body.classList.add('test-mode');
    document.body.querySelector('body::before').style.display = 'block';
    console.log('测试模式已启用');
  }

  /**
   * 禁用测试模式
   */
  disableTestMode() {
    document.body.classList.remove('test-mode');
    console.log('测试模式已禁用');
  }
}

// 创建全局应用实例
window.app = new App();

// 导出 App 类
window.App = App;
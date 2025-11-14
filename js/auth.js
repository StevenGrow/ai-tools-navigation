/**
 * 认证管理器
 * 处理用户注册、登录、登出和会话管理
 */

class AuthManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.authStateCallbacks = [];
  }

  /**
   * 用户注册
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async signUp(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        return {
          success: false,
          error: this.translateAuthError(error.message)
        };
      }

      // 注册成功
      this.currentUser = data.user;
      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('注册错误:', error);
      return {
        success: false,
        error: '注册失败，请稍后重试'
      };
    }
  }

  /**
   * 用户登录
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        return {
          success: false,
          error: this.translateAuthError(error.message)
        };
      }

      // 登录成功
      this.currentUser = data.user;
      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('登录错误:', error);
      return {
        success: false,
        error: '登录失败，请稍后重试'
      };
    }
  }

  /**
   * 用户登出
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: '登出失败，请稍后重试'
        };
      }

      // 清除当前用户
      this.currentUser = null;
      return {
        success: true
      };
    } catch (error) {
      console.error('登出错误:', error);
      return {
        success: false,
        error: '登出失败，请稍后重试'
      };
    }
  }

  /**
   * 获取当前用户
   * @returns {Promise<object|null>}
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error) {
        console.error('获取用户信息错误:', error);
        return null;
      }

      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('获取用户信息错误:', error);
      return null;
    }
  }

  /**
   * 获取当前会话
   * @returns {Promise<object|null>}
   */
  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error) {
        console.error('获取会话错误:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('获取会话错误:', error);
      return null;
    }
  }

  /**
   * 监听认证状态变化
   * @param {Function} callback - 状态变化时的回调函数
   */
  onAuthStateChange(callback) {
    // 保存回调函数
    this.authStateCallbacks.push(callback);

    // 设置 Supabase 认证状态监听
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('认证状态变化:', event, session?.user?.email || '未登录');

        // 更新当前用户
        this.currentUser = session?.user || null;

        // 调用所有注册的回调函数
        this.authStateCallbacks.forEach(cb => {
          cb(event, session);
        });
      }
    );

    // 返回取消订阅的函数
    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * 翻译认证错误消息为中文
   * @param {string} errorMessage - 英文错误消息
   * @returns {string} 中文错误消息
   */
  translateAuthError(errorMessage) {
    const errorMap = {
      'Invalid login credentials': '邮箱或密码错误',
      'User already registered': '该邮箱已被注册',
      'Email not confirmed': '请先确认您的邮箱',
      'Password should be at least 6 characters': '密码至少需要 6 个字符',
      'Invalid email': '邮箱格式不正确',
      'Email rate limit exceeded': '操作过于频繁，请稍后再试',
      'Signup disabled': '注册功能暂时关闭',
      'User not found': '用户不存在',
      'Invalid password': '密码错误',
      'Email already exists': '该邮箱已被注册',
      'Weak password': '密码强度不足'
    };

    // 查找匹配的错误消息
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    // 如果没有匹配的，返回通用错误消息
    return '操作失败，请稍后重试';
  }

  /**
   * 检查用户是否已登录
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * 获取当前用户邮箱
   * @returns {string|null}
   */
  getUserEmail() {
    return this.currentUser?.email || null;
  }

  /**
   * 获取当前用户 ID
   * @returns {string|null}
   */
  getUserId() {
    return this.currentUser?.id || null;
  }
}

// 导出 AuthManager 类
window.AuthManager = AuthManager;

/**
 * 表单验证器
 * 提供邮箱、密码等表单字段的验证功能
 */
class FormValidator {
  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {{valid: boolean, error?: string}}
   */
  static validateEmail(email) {
    if (!email || email.trim() === '') {
      return {
        valid: false,
        error: '邮箱不能为空'
      };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return {
        valid: false,
        error: '请输入有效的邮箱地址'
      };
    }

    return { valid: true };
  }

  /**
   * 验证密码强度
   * @param {string} password - 密码
   * @returns {{valid: boolean, error?: string}}
   */
  static validatePassword(password) {
    if (!password || password.trim() === '') {
      return {
        valid: false,
        error: '密码不能为空'
      };
    }

    if (password.length < 6) {
      return {
        valid: false,
        error: '密码至少需要 6 个字符'
      };
    }

    if (password.length > 72) {
      return {
        valid: false,
        error: '密码不能超过 72 个字符'
      };
    }

    return { valid: true };
  }

  /**
   * 验证确认密码是否匹配
   * @param {string} password - 密码
   * @param {string} confirmPassword - 确认密码
   * @returns {{valid: boolean, error?: string}}
   */
  static validatePasswordMatch(password, confirmPassword) {
    if (!confirmPassword || confirmPassword.trim() === '') {
      return {
        valid: false,
        error: '请确认密码'
      };
    }

    if (password !== confirmPassword) {
      return {
        valid: false,
        error: '两次输入的密码不一致'
      };
    }

    return { valid: true };
  }

  /**
   * 验证登录表单
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {{valid: boolean, errors: object}}
   */
  static validateLoginForm(email, password) {
    const errors = {};
    let valid = true;

    const emailValidation = this.validateEmail(email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
      valid = false;
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error;
      valid = false;
    }

    return { valid, errors };
  }

  /**
   * 验证注册表单
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @param {string} confirmPassword - 确认密码
   * @returns {{valid: boolean, errors: object}}
   */
  static validateRegisterForm(email, password, confirmPassword) {
    const errors = {};
    let valid = true;

    const emailValidation = this.validateEmail(email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
      valid = false;
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error;
      valid = false;
    }

    const passwordMatchValidation = this.validatePasswordMatch(password, confirmPassword);
    if (!passwordMatchValidation.valid) {
      errors.confirmPassword = passwordMatchValidation.error;
      valid = false;
    }

    return { valid, errors };
  }

  /**
   * 显示表单错误消息
   * @param {HTMLElement} errorElement - 错误消息显示元素
   * @param {string} message - 错误消息
   */
  static showError(errorElement, message) {
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * 清除表单错误消息
   * @param {HTMLElement} errorElement - 错误消息显示元素
   */
  static clearError(errorElement) {
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * 为输入框添加实时验证
   * @param {HTMLInputElement} inputElement - 输入框元素
   * @param {Function} validationFunction - 验证函数
   * @param {HTMLElement} errorElement - 错误消息显示元素
   */
  static addRealtimeValidation(inputElement, validationFunction, errorElement) {
    if (!inputElement) return;

    // 失去焦点时验证
    inputElement.addEventListener('blur', () => {
      const value = inputElement.value;
      const validation = validationFunction(value);
      
      if (!validation.valid) {
        this.showError(errorElement, validation.error);
        inputElement.classList.add('input-error');
      } else {
        this.clearError(errorElement);
        inputElement.classList.remove('input-error');
      }
    });

    // 输入时清除错误
    inputElement.addEventListener('input', () => {
      if (errorElement && errorElement.textContent) {
        this.clearError(errorElement);
        inputElement.classList.remove('input-error');
      }
    });
  }
}

// 导出 FormValidator 类
window.FormValidator = FormValidator;

/**
 * 错误处理器
 * 统一处理认证相关的错误
 */
class AuthErrorHandler {
  /**
   * 处理注册错误
   * @param {Error|string} error - 错误对象或错误消息
   * @returns {string} 用户友好的错误消息
   */
  static handleSignUpError(error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // 常见注册错误映射
    const errorMap = {
      'User already registered': '该邮箱已被注册，请直接登录',
      'Email already exists': '该邮箱已被注册，请直接登录',
      'Invalid email': '邮箱格式不正确，请检查后重试',
      'Password should be at least 6 characters': '密码至少需要 6 个字符',
      'Weak password': '密码强度不足，请使用更复杂的密码',
      'Email rate limit exceeded': '操作过于频繁，请稍后再试',
      'Signup disabled': '注册功能暂时关闭，请稍后再试'
    };

    // 查找匹配的错误消息
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    // 默认错误消息
    return '注册失败，请检查输入信息后重试';
  }

  /**
   * 处理登录错误
   * @param {Error|string} error - 错误对象或错误消息
   * @returns {string} 用户友好的错误消息
   */
  static handleSignInError(error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // 常见登录错误映射
    const errorMap = {
      'Invalid login credentials': '邮箱或密码错误，请重试',
      'Invalid password': '密码错误，请重试',
      'User not found': '该邮箱未注册，请先注册',
      'Email not confirmed': '请先确认您的邮箱',
      'Email rate limit exceeded': '登录尝试次数过多，请稍后再试',
      'Invalid email': '邮箱格式不正确'
    };

    // 查找匹配的错误消息
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    // 默认错误消息
    return '登录失败，请检查邮箱和密码后重试';
  }

  /**
   * 处理登出错误
   * @param {Error|string} error - 错误对象或错误消息
   * @returns {string} 用户友好的错误消息
   */
  static handleSignOutError(error) {
    console.error('登出错误:', error);
    return '登出失败，请刷新页面后重试';
  }

  /**
   * 处理网络错误
   * @param {Error} error - 错误对象
   * @returns {string} 用户友好的错误消息
   */
  static handleNetworkError(error) {
    if (!navigator.onLine) {
      return '网络连接已断开，请检查您的网络连接';
    }

    if (error.message.includes('fetch')) {
      return '网络请求失败，请检查网络连接后重试';
    }

    return '网络错误，请稍后重试';
  }

  /**
   * 显示错误消息到指定元素
   * @param {HTMLElement} element - 显示错误的元素
   * @param {string} message - 错误消息
   */
  static displayError(element, message) {
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
      element.classList.add('error-message');
    }
  }

  /**
   * 清除错误消息
   * @param {HTMLElement} element - 显示错误的元素
   */
  static clearError(element) {
    if (element) {
      element.textContent = '';
      element.style.display = 'none';
      element.classList.remove('error-message');
    }
  }

  /**
   * 记录错误到控制台
   * @param {string} context - 错误上下文
   * @param {Error} error - 错误对象
   */
  static logError(context, error) {
    console.error(`[${context}]`, error);
  }
}

// 导出 AuthErrorHandler 类
window.AuthErrorHandler = AuthErrorHandler;

/**
 * 会话管理器
 * 处理用户会话的保存、恢复和自动登出
 */
class SessionManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.sessionCheckInterval = null;
    this.SESSION_CHECK_INTERVAL = 60000; // 每分钟检查一次会话
  }

  /**
   * 初始化会话管理
   * 恢复用户会话并开始会话监控
   */
  async initializeSession() {
    try {
      // 尝试从本地存储恢复会话
      const session = await this.restoreSession();
      
      if (session) {
        console.log('会话已恢复:', session.user.email);
        return session.user;
      }

      return null;
    } catch (error) {
      console.error('初始化会话错误:', error);
      return null;
    }
  }

  /**
   * 恢复用户会话
   * 页面刷新后自动恢复登录状态
   * @returns {Promise<object|null>}
   */
  async restoreSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error) {
        console.error('恢复会话错误:', error);
        return null;
      }

      if (session) {
        // 验证会话是否过期
        const isExpired = this.isSessionExpired(session);
        if (isExpired) {
          console.log('会话已过期，需要重新登录');
          await this.clearSession();
          return null;
        }

        return session;
      }

      return null;
    } catch (error) {
      console.error('恢复会话错误:', error);
      return null;
    }
  }

  /**
   * 保存用户会话
   * Supabase 自动处理会话保存到 localStorage
   * @param {object} session - 会话对象
   */
  saveSession(session) {
    // Supabase SDK 自动将会话保存到 localStorage
    // 这里可以添加额外的会话信息保存逻辑
    if (session) {
      console.log('会话已保存');
    }
  }

  /**
   * 清除用户会话
   */
  async clearSession() {
    try {
      await this.supabase.auth.signOut();
      console.log('会话已清除');
    } catch (error) {
      console.error('清除会话错误:', error);
    }
  }

  /**
   * 检查会话是否过期
   * @param {object} session - 会话对象
   * @returns {boolean}
   */
  isSessionExpired(session) {
    if (!session || !session.expires_at) {
      return true;
    }

    const expiresAt = session.expires_at * 1000; // 转换为毫秒
    const now = Date.now();

    return now >= expiresAt;
  }

  /**
   * 获取会话过期时间
   * @param {object} session - 会话对象
   * @returns {Date|null}
   */
  getSessionExpiryTime(session) {
    if (!session || !session.expires_at) {
      return null;
    }

    return new Date(session.expires_at * 1000);
  }

  /**
   * 刷新会话
   * 延长会话有效期
   * @returns {Promise<object|null>}
   */
  async refreshSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.refreshSession();

      if (error) {
        console.error('刷新会话错误:', error);
        return null;
      }

      if (session) {
        console.log('会话已刷新');
        return session;
      }

      return null;
    } catch (error) {
      console.error('刷新会话错误:', error);
      return null;
    }
  }

  /**
   * 开始会话监控
   * 定期检查会话状态，自动刷新即将过期的会话
   */
  startSessionMonitoring() {
    // 清除现有的监控
    this.stopSessionMonitoring();

    // 开始新的监控
    this.sessionCheckInterval = setInterval(async () => {
      const { data: { session } } = await this.supabase.auth.getSession();

      if (session) {
        const expiresAt = session.expires_at * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // 如果会话在 5 分钟内过期，自动刷新
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log('会话即将过期，自动刷新...');
          await this.refreshSession();
        }

        // 如果会话已过期，自动登出
        if (timeUntilExpiry <= 0) {
          console.log('会话已过期，自动登出');
          await this.clearSession();
          window.location.reload(); // 刷新页面
        }
      }
    }, this.SESSION_CHECK_INTERVAL);

    console.log('会话监控已启动');
  }

  /**
   * 停止会话监控
   */
  stopSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
      console.log('会话监控已停止');
    }
  }

  /**
   * 获取会话剩余时间（秒）
   * @returns {Promise<number>}
   */
  async getSessionRemainingTime() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();

      if (!session || !session.expires_at) {
        return 0;
      }

      const expiresAt = session.expires_at * 1000;
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);

      return Math.floor(remaining / 1000); // 返回秒数
    } catch (error) {
      console.error('获取会话剩余时间错误:', error);
      return 0;
    }
  }
}

// 导出 SessionManager 类
window.SessionManager = SessionManager;

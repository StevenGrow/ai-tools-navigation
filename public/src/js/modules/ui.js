/**
 * UI 管理器
 * 管理用户界面的显示和交互
 * 实现显示/隐藏模态框、通知消息、加载状态等功能
 */

class UIManager {
  constructor() {
    this.loadingState = false;
    this.notificationTimeout = null;
    this.initializeEventListeners();
    this.initializeModalEventListeners();
  }

  /**
   * 初始化基础事件监听器
   */
  initializeEventListeners() {
    // ESC 键关闭所有模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAllModals();
      }
    });

    // 点击通知消息关闭
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-close')) {
        this.hideNotification();
      }
    });
  }

  /**
   * 初始化模态框事件监听器
   */
  initializeModalEventListeners() {
    // 登录模态框事件
    this.initializeLoginModalEvents();
    
    // 注册模态框事件
    this.initializeRegisterModalEvents();
    
    // 添加工具模态框事件
    this.initializeAddToolModalEvents();
    
    // 编辑工具模态框事件
    this.initializeEditToolModalEvents();
    
    // 删除工具模态框事件
    this.initializeDeleteToolModalEvents();
  }

  /**
   * 初始化登录模态框事件
   */
  initializeLoginModalEvents() {
    const modal = document.getElementById('loginModal');
    const closeBtn = document.getElementById('loginModalClose');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideLoginModal());
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideLoginModal();
        }
      });
    }
  }

  /**
   * 初始化注册模态框事件
   */
  initializeRegisterModalEvents() {
    const modal = document.getElementById('registerModal');
    const closeBtn = document.getElementById('registerModalClose');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideRegisterModal());
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideRegisterModal();
        }
      });
    }
  }

  /**
   * 初始化添加工具模态框事件
   */
  initializeAddToolModalEvents() {
    const modal = document.getElementById('addToolModal');
    const closeBtn = document.getElementById('addToolModalClose');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideAddToolModal());
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideAddToolModal();
        }
      });
    }
  }

  /**
   * 初始化编辑工具模态框事件
   */
  initializeEditToolModalEvents() {
    const modal = document.getElementById('editToolModal');
    const closeBtn = document.getElementById('editToolModalClose');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideEditToolModal());
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideEditToolModal();
        }
      });
    }
  }

  /**
   * 初始化删除工具模态框事件
   */
  initializeDeleteToolModalEvents() {
    const modal = document.getElementById('deleteToolModal');
    const closeBtn = document.getElementById('deleteToolModalClose');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideDeleteToolModal());
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideDeleteToolModal());
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideDeleteToolModal();
        }
      });
    }
  }

  // 显示/隐藏登录模态框
  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.add('show');
      // 清空表单
      const form = document.getElementById('loginForm');
      if (form) form.reset();
      this.hideError('loginError');
    }
  }

  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // 显示/隐藏注册模态框
  showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
      modal.classList.add('show');
      // 清空表单
      const form = document.getElementById('registerForm');
      if (form) form.reset();
      this.hideError('registerError');
    }
  }

  hideRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // 显示/隐藏添加工具模态框
  showAddToolModal() {
    const modal = document.getElementById('addToolModal');
    if (modal) {
      modal.classList.add('show');
      // 清空表单
      const form = document.getElementById('addToolForm');
      if (form) form.reset();
      this.hideError('addToolError');
      // 聚焦到第一个输入框
      const firstInput = document.getElementById('toolName');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  hideAddToolModal() {
    const modal = document.getElementById('addToolModal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // 显示/隐藏编辑工具模态框
  showEditToolModal(toolData) {
    const modal = document.getElementById('editToolModal');
    if (modal && toolData) {
      // 预填充表单数据
      const nameInput = document.getElementById('editToolName');
      const urlInput = document.getElementById('editToolUrl');
      const descInput = document.getElementById('editToolDesc');
      const categorySelect = document.getElementById('editToolCategory');
      const isFreeCheckbox = document.getElementById('editToolIsFree');
      const isChineseCheckbox = document.getElementById('editToolIsChinese');

      if (nameInput) nameInput.value = toolData.tool_name || '';
      if (urlInput) urlInput.value = toolData.tool_url || '';
      if (descInput) descInput.value = toolData.tool_desc || '';
      if (categorySelect) categorySelect.value = toolData.category || '';
      if (isFreeCheckbox) isFreeCheckbox.checked = toolData.is_free || false;
      if (isChineseCheckbox) isChineseCheckbox.checked = toolData.is_chinese || false;

      // 存储工具ID用于更新
      modal.setAttribute('data-tool-id', toolData.id);

      // 清空错误信息
      this.hideError('editToolError');

      // 显示模态框
      modal.classList.add('show');

      // 聚焦到第一个输入框
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 100);
      }
    }
  }

  hideEditToolModal() {
    const modal = document.getElementById('editToolModal');
    if (modal) {
      modal.classList.remove('show');
      modal.removeAttribute('data-tool-id');
      
      // 清空表单
      const form = document.getElementById('editToolForm');
      if (form) form.reset();
    }
  }

  // 显示/隐藏删除工具确认模态框
  showDeleteToolModal(toolData) {
    const modal = document.getElementById('deleteToolModal');
    const toolNameElement = document.getElementById('deleteToolName');
    
    if (modal && toolData) {
      // 设置要删除的工具名称
      if (toolNameElement) {
        toolNameElement.textContent = toolData.tool_name || toolData.name;
      }
      
      // 存储工具ID用于删除
      modal.setAttribute('data-tool-id', toolData.id);
      
      // 显示模态框
      modal.classList.add('show');
    }
  }

  hideDeleteToolModal() {
    const modal = document.getElementById('deleteToolModal');
    if (modal) {
      modal.classList.remove('show');
      modal.removeAttribute('data-tool-id');
    }
  }

  /**
   * 更新用户界面状态
   * 根据登录状态更新导航栏和用户专属功能
   * @param {boolean} isAuthenticated - 是否已认证
   * @param {object} user - 用户信息
   */
  updateUIForAuthState(isAuthenticated, user) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const addToolBtn = document.getElementById('addToolBtn');

    if (isAuthenticated && user) {
      // 已登录状态
      if (loginBtn) loginBtn.classList.add('hidden');
      if (registerBtn) registerBtn.classList.add('hidden');
      if (userInfo) userInfo.classList.remove('hidden');
      if (userEmail) userEmail.textContent = user.email;
      if (addToolBtn) addToolBtn.classList.add('show');
      
      // 显示自定义工具相关功能
      this.showCustomToolFeatures();
      
      // 显示成功登录通知
      this.showNotification(`欢迎回来，${user.email}！`, 'success');
    } else {
      // 未登录状态
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (registerBtn) registerBtn.classList.remove('hidden');
      if (userInfo) userInfo.classList.add('hidden');
      if (addToolBtn) addToolBtn.classList.remove('show');
      
      // 隐藏自定义工具相关功能
      this.hideCustomToolFeatures();
      
      // 清空用户邮箱显示
      if (userEmail) userEmail.textContent = '';
    }
  }

  /**
   * 更新管理员状态的UI
   * @param {boolean} isAdmin - 是否是管理员
   */
  updateUIForAdminState(isAdmin) {
    const userEmail = document.getElementById('userEmail');
    const addToolBtn = document.getElementById('addToolBtn');
    
    if (isAdmin) {
      // 为管理员添加特殊标识
      if (userEmail) {
        userEmail.innerHTML = `
          <span class="admin-badge">👑</span>
          ${userEmail.textContent}
        `;
      }
      
      // 显示管理员添加工具按钮
      this.showAdminAddToolButton();
      
    } else {
      // 移除管理员标识
      if (userEmail && userEmail.querySelector('.admin-badge')) {
        const badge = userEmail.querySelector('.admin-badge');
        badge.remove();
      }
    }
  }

  /**
   * 显示管理员添加工具按钮
   */
  showAdminAddToolButton() {
    // 检查是否已经存在管理员按钮
    let adminAddBtn = document.getElementById('adminAddToolBtn');
    
    if (!adminAddBtn) {
      // 创建管理员添加工具按钮
      adminAddBtn = document.createElement('button');
      adminAddBtn.id = 'adminAddToolBtn';
      adminAddBtn.className = 'add-tool-btn admin-add-tool-btn';
      adminAddBtn.innerHTML = '👑 添加系统工具';
      adminAddBtn.title = '添加系统工具（所有用户可见）';
      
      // 添加到页面
      document.body.appendChild(adminAddBtn);
      
      // 绑定点击事件
      adminAddBtn.addEventListener('click', () => {
        this.showAdminAddToolModal();
      });
    }
    
    // 显示按钮
    adminAddBtn.classList.add('show');
  }

  /**
   * 显示管理员添加工具模态框
   */
  showAdminAddToolModal() {
    // 暂时使用现有的添加工具模态框，后续可以创建专门的管理员模态框
    this.showAddToolModal();
    
    // 修改标题以区分管理员工具
    const modalTitle = document.querySelector('#addToolModal .modal-header h2');
    if (modalTitle) {
      modalTitle.textContent = '👑 添加系统工具';
    }
    
    // 添加提示信息
    const form = document.getElementById('addToolForm');
    if (form && !form.querySelector('.admin-notice')) {
      const notice = document.createElement('div');
      notice.className = 'admin-notice';
      notice.innerHTML = `
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: #0369a1; font-weight: 500;">
            👑 <span>管理员模式</span>
          </div>
          <div style="color: #0369a1; font-size: 0.9rem; margin-top: 0.5rem;">
            您正在添加系统工具，所有用户都能看到这个工具。
          </div>
        </div>
      `;
      form.insertBefore(notice, form.firstChild);
    }
  }

  // 显示自定义工具相关功能
  showCustomToolFeatures() {
    // 显示所有自定义工具的操作按钮
    const customToolCards = document.querySelectorAll('.custom-tool-card');
    customToolCards.forEach(card => {
      const actions = card.querySelector('.tool-actions');
      if (actions) {
        actions.style.display = 'flex';
      }
    });
    
    // 显示添加工具按钮
    const addToolBtn = document.getElementById('addToolBtn');
    if (addToolBtn) {
      addToolBtn.classList.add('show');
    }
  }

  // 隐藏自定义工具相关功能
  hideCustomToolFeatures() {
    // 隐藏所有自定义工具的操作按钮
    const customToolCards = document.querySelectorAll('.custom-tool-card');
    customToolCards.forEach(card => {
      const actions = card.querySelector('.tool-actions');
      if (actions) {
        actions.style.display = 'none';
      }
    });
    
    // 隐藏添加工具按钮
    const addToolBtn = document.getElementById('addToolBtn');
    if (addToolBtn) {
      addToolBtn.classList.remove('show');
    }
    
    // 移除所有自定义工具卡片
    const customTools = document.querySelectorAll('.tool-card[data-custom="true"]');
    customTools.forEach(card => card.remove());
  }

  // 渲染工具卡片
  renderToolCard(tool, isCustom = false) {
    const card = document.createElement('a');
    card.href = tool.tool_url || tool.url;
    card.className = 'tool-card';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.setAttribute('data-name', tool.tool_name || tool.name);
    card.setAttribute('data-desc', tool.tool_desc || tool.desc);
    
    // 添加自定义工具标识
    if (isCustom) {
      card.setAttribute('data-custom', 'true');
      card.setAttribute('data-tool-id', tool.id);
      card.setAttribute('data-user-id', tool.user_id);
      card.classList.add('custom-tool-card');
    } else {
      card.setAttribute('data-custom', 'false');
      card.classList.add('system-tool-card');
    }

    // 构建标签
    let tags = '';
    const isFree = tool.is_free !== undefined ? tool.is_free : tool.isFree;
    const isChinese = tool.is_chinese !== undefined ? tool.is_chinese : tool.isChinese;
    
    if (isFree) {
      tags += '<span class="tag tag-free">免费</span>';
    } else {
      tags += '<span class="tag tag-paid">付费</span>';
    }
    
    if (isChinese) {
      tags += '<span class="tag tag-cn">中文</span>';
    }
    
    if (isCustom) {
      tags += '<span class="tag tag-custom">自定义</span>';
    }

    // 为自定义工具添加操作按钮容器
    let actionButtons = '';
    if (isCustom) {
      actionButtons = `
        <div class="tool-actions">
          <button class="tool-action-btn edit-tool-btn" data-tool-id="${tool.id}" title="编辑工具" onclick="event.preventDefault(); event.stopPropagation();">
            ✏️
          </button>
          <button class="tool-action-btn delete-tool-btn" data-tool-id="${tool.id}" title="删除工具" onclick="event.preventDefault(); event.stopPropagation();">
            🗑️
          </button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="tool-content">
        <div class="tool-name">${tool.tool_name || tool.name}${tags}</div>
        <div class="tool-desc">${tool.tool_desc || tool.desc}</div>
      </div>
      ${actionButtons}
    `;

    return card;
  }

  /**
   * 显示通知消息
   * @param {string} message - 通知消息内容
   * @param {string} type - 通知类型 ('success', 'error', 'warning', 'info')
   * @param {number} duration - 显示时长（毫秒），0 表示不自动关闭
   * @param {Object} options - 额外选项
   */
  showNotification(message, type = 'info', duration = 3000, options = {}) {
    // 清除现有通知
    this.hideNotification();

    // 创建通知容器
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // 添加动画类型
    if (options.animation) {
      notification.classList.add(`notification-${options.animation}`);
    }

    // 创建通知图标
    const icon = document.createElement('div');
    icon.className = 'notification-icon';
    icon.innerHTML = this.getNotificationIcon(type);

    // 创建通知内容
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    // 创建主消息
    const mainMessage = document.createElement('div');
    mainMessage.className = 'notification-message';
    mainMessage.textContent = message;
    content.appendChild(mainMessage);

    // 添加副消息（如果有）
    if (options.subtitle) {
      const subtitle = document.createElement('div');
      subtitle.className = 'notification-subtitle';
      subtitle.textContent = options.subtitle;
      content.appendChild(subtitle);
    }

    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', '关闭通知');
    closeBtn.addEventListener('click', () => this.hideNotification());

    // 组装通知
    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(closeBtn);

    // 添加到页面
    document.body.appendChild(notification);

    // 触发显示动画
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // 成功类型的特殊效果
    if (type === 'success') {
      this.addSuccessEffects(notification, options);
    }

    // 自动关闭
    if (duration > 0) {
      this.notificationTimeout = setTimeout(() => {
        this.hideNotification();
      }, duration);
    }

    return notification;
  }

  /**
   * 获取通知图标
   * @param {string} type - 通知类型
   * @returns {string}
   */
  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  /**
   * 添加成功效果
   * @param {HTMLElement} notification - 通知元素
   * @param {Object} options - 选项
   */
  addSuccessEffects(notification, options = {}) {
    // 添加成功动画类
    notification.classList.add('notification-success-enhanced');
    
    // 如果启用了庆祝效果
    if (options.celebrate) {
      this.showCelebrationEffect();
    }
    
    // 如果有进度条效果
    if (options.progress) {
      this.addProgressEffect(notification);
    }
  }

  /**
   * 显示庆祝效果
   */
  showCelebrationEffect() {
    // 创建庆祝粒子效果
    const celebration = document.createElement('div');
    celebration.className = 'celebration-container';
    
    // 创建多个庆祝粒子
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      particle.style.animationDuration = (2 + Math.random() * 2) + 's';
      celebration.appendChild(particle);
    }
    
    document.body.appendChild(celebration);
    
    // 清理庆祝效果
    setTimeout(() => {
      if (celebration.parentNode) {
        celebration.remove();
      }
    }, 4000);
  }

  /**
   * 添加进度效果
   * @param {HTMLElement} notification - 通知元素
   */
  addProgressEffect(notification) {
    const progressBar = document.createElement('div');
    progressBar.className = 'notification-progress';
    notification.appendChild(progressBar);
    
    // 动画进度条
    setTimeout(() => {
      progressBar.style.width = '100%';
    }, 100);
  }

  /**
   * 显示成功操作反馈
   * @param {string} action - 操作名称
   * @param {string} item - 操作对象
   * @param {Object} options - 选项
   */
  showSuccessFeedback(action, item = '', options = {}) {
    const messages = {
      login: '登录成功！',
      logout: '已成功登出',
      register: '注册成功！',
      add: `${item}添加成功！`,
      update: `${item}更新成功！`,
      delete: `${item}删除成功！`,
      save: '保存成功！',
      upload: '上传成功！',
      download: '下载成功！'
    };
    
    const message = messages[action] || `${action}成功！`;
    
    const defaultOptions = {
      celebrate: ['add', 'register', 'save'].includes(action),
      progress: ['upload', 'download'].includes(action),
      animation: 'bounce',
      subtitle: options.subtitle
    };
    
    this.showNotification(message, 'success', 4000, { ...defaultOptions, ...options });
  }

  /**
   * 显示操作完成反馈
   * @param {string} message - 消息
   * @param {Object} stats - 统计信息
   */
  showCompletionFeedback(message, stats = {}) {
    let subtitle = '';
    if (stats.count) {
      subtitle = `共处理 ${stats.count} 项`;
    }
    if (stats.time) {
      subtitle += stats.count ? `，耗时 ${stats.time}` : `耗时 ${stats.time}`;
    }
    
    this.showNotification(message, 'success', 5000, {
      subtitle,
      celebrate: true,
      animation: 'slide'
    });
  }

  /**
   * 显示实时反馈
   * @param {HTMLElement} element - 目标元素
   * @param {string} type - 反馈类型
   */
  showRealTimeFeedback(element, type = 'success') {
    if (!element) return;
    
    // 移除现有反馈
    element.classList.remove('feedback-success', 'feedback-error', 'feedback-warning');
    
    // 添加新反馈
    element.classList.add(`feedback-${type}`);
    
    // 添加反馈图标
    const existingIcon = element.querySelector('.feedback-icon');
    if (existingIcon) {
      existingIcon.remove();
    }
    
    const icon = document.createElement('span');
    icon.className = 'feedback-icon';
    icon.innerHTML = this.getNotificationIcon(type);
    element.appendChild(icon);
    
    // 自动移除反馈
    setTimeout(() => {
      element.classList.remove(`feedback-${type}`);
      if (icon.parentNode) {
        icon.remove();
      }
    }, 2000);
  }

  /**
   * 显示浮动成功消息
   * @param {HTMLElement} element - 目标元素
   * @param {string} message - 消息
   */
  showFloatingSuccess(element, message) {
    if (!element) return;
    
    const floatingMessage = document.createElement('div');
    floatingMessage.className = 'floating-success-message';
    floatingMessage.textContent = message;
    
    // 定位到元素附近
    const rect = element.getBoundingClientRect();
    floatingMessage.style.position = 'fixed';
    floatingMessage.style.left = rect.left + rect.width / 2 + 'px';
    floatingMessage.style.top = rect.top - 10 + 'px';
    floatingMessage.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(floatingMessage);
    
    // 触发动画
    setTimeout(() => {
      floatingMessage.classList.add('show');
    }, 10);
    
    // 清理
    setTimeout(() => {
      if (floatingMessage.parentNode) {
        floatingMessage.remove();
      }
    }, 2000);
  }

  /**
   * 隐藏通知消息
   */
  hideNotification() {
    const notification = document.querySelector('.notification');
    if (notification) {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300); // 等待动画完成
    }

    // 清除自动关闭定时器
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }
  }

  // 显示/隐藏错误消息
  showError(elementId, message, type = 'error', suggestions = []) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      // 清空现有内容
      errorElement.innerHTML = '';
      
      // 创建错误图标
      const errorIcon = document.createElement('span');
      errorIcon.className = 'error-icon';
      errorIcon.innerHTML = this.getErrorIcon(type);
      
      // 创建错误消息
      const errorMessage = document.createElement('span');
      errorMessage.className = 'error-message-text';
      errorMessage.textContent = message;
      
      // 组装错误内容
      errorElement.appendChild(errorIcon);
      errorElement.appendChild(errorMessage);
      
      // 添加建议（如果有）
      if (suggestions.length > 0) {
        const suggestionsList = document.createElement('ul');
        suggestionsList.className = 'error-suggestions';
        
        suggestions.forEach(suggestion => {
          const suggestionItem = document.createElement('li');
          suggestionItem.textContent = suggestion;
          suggestionsList.appendChild(suggestionItem);
        });
        
        errorElement.appendChild(suggestionsList);
      }
      
      // 设置错误类型样式
      errorElement.className = `error-message error-${type} show`;
      
      // 添加震动效果
      errorElement.style.animation = 'errorShake 0.5s ease-in-out';
      setTimeout(() => {
        errorElement.style.animation = '';
      }, 500);
    }
  }

  hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.classList.remove('show');
      errorElement.innerHTML = '';
      errorElement.className = 'error-message';
    }
  }

  /**
   * 获取错误图标
   * @param {string} type - 错误类型
   * @returns {string}
   */
  getErrorIcon(type) {
    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      validation: '📝'
    };
    return icons[type] || icons.error;
  }

  /**
   * 显示增强的错误通知
   * @param {string} title - 错误标题
   * @param {string} message - 错误消息
   * @param {Array} suggestions - 解决建议
   * @param {string} type - 错误类型
   */
  showEnhancedError(title, message, suggestions = [], type = 'error') {
    const errorNotification = document.createElement('div');
    errorNotification.className = `enhanced-error-notification enhanced-error-${type}`;
    
    errorNotification.innerHTML = `
      <div class="enhanced-error-header">
        <span class="enhanced-error-icon">${this.getErrorIcon(type)}</span>
        <span class="enhanced-error-title">${title}</span>
        <button class="enhanced-error-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
      <div class="enhanced-error-body">
        <p class="enhanced-error-message">${message}</p>
        ${suggestions.length > 0 ? `
          <div class="enhanced-error-suggestions">
            <p class="suggestions-title">💡 解决建议：</p>
            <ul>
              ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
    
    // 添加到页面
    document.body.appendChild(errorNotification);
    
    // 触发显示动画
    setTimeout(() => {
      errorNotification.classList.add('show');
    }, 10);
    
    // 自动关闭（错误类型不自动关闭）
    if (type !== 'error') {
      setTimeout(() => {
        if (errorNotification.parentNode) {
          errorNotification.classList.remove('show');
          setTimeout(() => errorNotification.remove(), 300);
        }
      }, 8000);
    }
    
    return errorNotification;
  }

  /**
   * 显示表单验证错误
   * @param {HTMLFormElement} form - 表单元素
   * @param {Object} errors - 错误对象
   */
  showFormValidationErrors(form, errors) {
    if (!form || !errors) return;
    
    // 清除现有错误
    const errorElements = form.querySelectorAll('.field-error');
    errorElements.forEach(el => el.remove());
    
    // 移除错误样式
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => input.classList.remove('input-error'));
    
    // 显示新错误
    Object.keys(errors).forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
      const error = errors[fieldName];
      
      if (field && error) {
        // 添加错误样式
        field.classList.add('input-error');
        
        // 创建错误提示
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.innerHTML = `
          <span class="field-error-icon">⚠️</span>
          <span class="field-error-text">${error}</span>
        `;
        
        // 插入错误提示
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        // 添加震动效果
        field.style.animation = 'inputErrorShake 0.3s ease-in-out';
        setTimeout(() => {
          field.style.animation = '';
        }, 300);
      }
    });
  }

  /**
   * 显示网络错误
   * @param {Error} error - 错误对象
   */
  showNetworkError(error) {
    let title = '网络错误';
    let message = '请检查您的网络连接';
    let suggestions = [
      '检查网络连接是否正常',
      '尝试刷新页面',
      '稍后再试'
    ];
    
    if (!navigator.onLine) {
      title = '网络连接断开';
      message = '您的设备似乎已断开网络连接';
      suggestions = [
        '检查WiFi或移动数据连接',
        '确认网络设置正确',
        '连接网络后刷新页面'
      ];
    } else if (error.message.includes('timeout')) {
      title = '请求超时';
      message = '服务器响应时间过长';
      suggestions = [
        '检查网络连接速度',
        '稍后重试',
        '联系技术支持'
      ];
    }
    
    this.showEnhancedError(title, message, suggestions, 'error');
  }

  /**
   * 显示认证错误
   * @param {Error} error - 错误对象
   * @param {string} userEmail - 用户邮箱（用于邮箱确认错误）
   */
  showAuthError(error, userEmail = '') {
    const authErrorMap = {
      'Invalid login credentials': {
        title: '登录失败',
        message: '邮箱或密码不正确',
        suggestions: [
          '检查邮箱地址是否正确',
          '确认密码是否正确',
          '尝试重置密码'
        ]
      },
      'User already registered': {
        title: '注册失败',
        message: '该邮箱已被注册',
        suggestions: [
          '使用其他邮箱地址',
          '尝试登录现有账号',
          '使用忘记密码功能'
        ]
      },
      'Email not confirmed': {
        title: '邮箱未验证',
        message: '请先验证您的邮箱地址',
        suggestions: [
          '检查邮箱收件箱',
          '查看垃圾邮件文件夹',
          '重新发送验证邮件'
        ],
        special: 'email_confirmation'
      },
      'Password should be at least 6 characters': {
        title: '密码格式错误',
        message: '密码长度至少需要6个字符',
        suggestions: [
          '使用至少6个字符的密码',
          '包含字母和数字',
          '避免使用过于简单的密码'
        ]
      }
    };
    
    const errorInfo = authErrorMap[error.message] || {
      title: '认证错误',
      message: error.message || '认证过程中发生错误',
      suggestions: [
        '请稍后重试',
        '检查输入信息',
        '联系技术支持'
      ]
    };
    
    // 特殊处理邮箱确认错误
    if (errorInfo.special === 'email_confirmation') {
      this.showEmailConfirmationModal(userEmail);
    } else {
      this.showEnhancedError(errorInfo.title, errorInfo.message, errorInfo.suggestions, 'error');
    }
  }

  /**
   * 显示邮箱确认模态框
   * @param {string} email - 用户邮箱
   */
  showEmailConfirmationModal(email = '') {
    // 移除现有的邮箱确认模态框
    const existingModal = document.getElementById('emailConfirmationModal');
    if (existingModal) {
      existingModal.remove();
    }

    // 创建邮箱确认模态框
    const modal = document.createElement('div');
    modal.className = 'modal email-confirmation-modal';
    modal.id = 'emailConfirmationModal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="email-confirmation-icon">📧</div>
          <h2>邮箱验证</h2>
          <button class="modal-close" id="emailConfirmationClose">&times;</button>
        </div>
        <div class="modal-body">
          <div class="email-confirmation-content">
            <p class="email-confirmation-message">
              <strong>您的邮箱尚未验证</strong><br>
              为了保护您的账户安全，请先验证您的邮箱地址。
            </p>
            
            ${email ? `
              <div class="email-display">
                <span class="email-label">邮箱地址：</span>
                <span class="email-address">${email}</span>
              </div>
            ` : ''}
            
            <div class="confirmation-steps">
              <h4>📋 验证步骤：</h4>
              <ol>
                <li>检查您的邮箱收件箱</li>
                <li>查找来自我们的验证邮件</li>
                <li>点击邮件中的验证链接</li>
                <li>返回此页面重新登录</li>
              </ol>
            </div>
            
            <div class="confirmation-tips">
              <h4>💡 找不到邮件？</h4>
              <ul>
                <li>检查垃圾邮件文件夹</li>
                <li>确认邮箱地址是否正确</li>
                <li>等待几分钟后再检查</li>
                <li>点击下方按钮重新发送</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="emailConfirmationCancel">稍后验证</button>
          ${email ? `
            <button class="btn btn-primary" id="resendConfirmationBtn" data-email="${email}">
              <span class="btn-icon">📤</span>
              重新发送验证邮件
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // 添加到页面
    document.body.appendChild(modal);

    // 绑定事件
    this.bindEmailConfirmationEvents(modal, email);

    // 显示模态框
    setTimeout(() => modal.classList.add('show'), 10);

    return modal;
  }

  /**
   * 绑定邮箱确认模态框事件
   * @param {HTMLElement} modal - 模态框元素
   * @param {string} email - 用户邮箱
   */
  bindEmailConfirmationEvents(modal, email) {
    const closeBtn = modal.querySelector('#emailConfirmationClose');
    const cancelBtn = modal.querySelector('#emailConfirmationCancel');
    const resendBtn = modal.querySelector('#resendConfirmationBtn');

    // 关闭模态框
    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 300);
    };

    // 绑定关闭事件
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // ESC 键关闭
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // 重新发送验证邮件
    if (resendBtn && email) {
      resendBtn.addEventListener('click', async () => {
        await this.handleResendConfirmation(resendBtn, email);
      });
    }
  }

  /**
   * 处理重新发送确认邮件
   * @param {HTMLButtonElement} button - 按钮元素
   * @param {string} email - 用户邮箱
   */
  async handleResendConfirmation(button, email) {
    if (!window.supabaseClient || !email) {
      this.showNotification('配置错误，无法发送邮件', 'error');
      return;
    }

    // 显示按钮加载状态
    this.showButtonLoading(button, '发送中...');

    try {
      const { data, error } = await window.supabaseClient.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        throw error;
      }

      // 发送成功
      this.hideButtonLoading(button);
      this.showNotification(
        `验证邮件已发送到 ${email}`,
        'success',
        5000,
        {
          subtitle: '请检查您的邮箱（包括垃圾邮件文件夹）'
        }
      );

      // 更新按钮状态
      button.innerHTML = `
        <span class="btn-icon">✅</span>
        邮件已发送
      `;
      button.disabled = true;

      // 5秒后恢复按钮
      setTimeout(() => {
        button.innerHTML = `
          <span class="btn-icon">📤</span>
          重新发送验证邮件
        `;
        button.disabled = false;
      }, 5000);

    } catch (error) {
      console.error('重新发送确认邮件失败:', error);
      this.hideButtonLoading(button);
      
      let errorMessage = '发送失败，请稍后重试';
      if (error.message.includes('rate limit')) {
        errorMessage = '发送过于频繁，请稍后再试';
      } else if (error.message.includes('invalid email')) {
        errorMessage = '邮箱地址无效';
      }
      
      this.showNotification(errorMessage, 'error');
    }
  }

  /**
   * 显示邮箱确认成功提示
   * @param {string} email - 用户邮箱
   */
  showEmailConfirmationSuccess(email) {
    this.showNotification(
      '邮箱验证成功！',
      'success',
      4000,
      {
        subtitle: `${email} 已成功验证`,
        celebrate: true,
        animation: 'bounce'
      }
    );
  }

  /**
   * 检查并处理邮箱确认状态
   * @param {object} user - 用户对象
   * @returns {boolean} 是否已确认
   */
  checkEmailConfirmationStatus(user) {
    if (!user) return false;
    
    const isConfirmed = user.email_confirmed_at !== null;
    
    if (!isConfirmed) {
      // 显示友好的提示而不是错误
      this.showNotification(
        '请验证您的邮箱后再登录',
        'warning',
        0, // 不自动关闭
        {
          subtitle: '点击通知查看详细说明'
        }
      );
      
      // 点击通知显示详细模态框
      const notification = document.querySelector('.notification');
      if (notification) {
        notification.style.cursor = 'pointer';
        notification.addEventListener('click', () => {
          this.hideNotification();
          this.showEmailConfirmationModal(user.email);
        });
      }
    }
    
    return isConfirmed;
  }

  /**
   * 显示全局加载状态
   * @param {string} message - 加载消息
   * @param {string} type - 加载类型 ('default', 'dots', 'pulse', 'bars')
   */
  showLoading(message = '加载中...', type = 'default') {
    this.loadingState = true;
    
    // 移除现有加载指示器
    this.hideLoading();

    // 创建加载遮罩
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.id = 'globalLoadingOverlay';

    // 创建加载内容
    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading-content';

    // 创建加载动画
    const spinner = this.createLoadingSpinner(type);

    // 创建加载文本
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = message;

    // 组装加载指示器
    loadingContent.appendChild(spinner);
    loadingContent.appendChild(loadingText);
    loadingOverlay.appendChild(loadingContent);

    // 添加到页面
    document.body.appendChild(loadingOverlay);

    // 触发显示动画
    setTimeout(() => {
      loadingOverlay.classList.add('show');
    }, 10);
  }

  /**
   * 创建不同类型的加载动画
   * @param {string} type - 动画类型
   * @returns {HTMLElement}
   */
  createLoadingSpinner(type = 'default') {
    const container = document.createElement('div');
    container.className = `loading-spinner loading-spinner-${type}`;

    switch (type) {
      case 'dots':
        container.innerHTML = `
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        `;
        break;
      
      case 'pulse':
        container.innerHTML = `
          <div class="loading-pulse"></div>
        `;
        break;
      
      case 'bars':
        container.innerHTML = `
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
        `;
        break;
      
      default:
        // 保持原有的默认旋转动画
        break;
    }

    return container;
  }

  /**
   * 隐藏全局加载状态
   */
  hideLoading() {
    this.loadingState = false;
    
    const loadingOverlay = document.getElementById('globalLoadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('show');
      setTimeout(() => {
        if (loadingOverlay.parentNode) {
          loadingOverlay.remove();
        }
      }, 300); // 等待动画完成
    }
  }

  /**
   * 显示按钮加载状态
   * @param {HTMLButtonElement} button - 按钮元素
   * @param {string} loadingText - 加载时显示的文本
   * @param {string} spinnerType - 加载动画类型
   */
  showButtonLoading(button, loadingText = '处理中...', spinnerType = 'default') {
    if (!button) return;

    // 保存原始状态
    button.setAttribute('data-original-text', button.textContent);
    button.setAttribute('data-original-disabled', button.disabled);
    button.setAttribute('data-original-html', button.innerHTML);

    // 设置加载状态
    button.disabled = true;
    button.classList.add('loading');

    // 创建加载内容
    const loadingContent = document.createElement('span');
    loadingContent.className = 'button-loading-content';
    
    const spinner = document.createElement('span');
    spinner.className = `button-loading-spinner button-loading-spinner-${spinnerType}`;
    
    const text = document.createElement('span');
    text.className = 'button-loading-text';
    text.textContent = loadingText;

    loadingContent.appendChild(spinner);
    loadingContent.appendChild(text);
    
    button.innerHTML = '';
    button.appendChild(loadingContent);
  }

  /**
   * 隐藏按钮加载状态
   * @param {HTMLButtonElement} button - 按钮元素
   */
  hideButtonLoading(button) {
    if (!button) return;

    // 恢复原始状态
    const originalText = button.getAttribute('data-original-text');
    const originalHtml = button.getAttribute('data-original-html');
    const originalDisabled = button.getAttribute('data-original-disabled') === 'true';

    if (originalHtml) {
      button.innerHTML = originalHtml;
      button.removeAttribute('data-original-html');
    } else if (originalText) {
      button.textContent = originalText;
      button.removeAttribute('data-original-text');
    }

    button.disabled = originalDisabled;
    button.removeAttribute('data-original-disabled');
    button.classList.remove('loading');
  }

  /**
   * 显示表单加载状态
   * @param {HTMLFormElement} form - 表单元素
   */
  showFormLoading(form) {
    if (!form) return;

    const submitBtn = form.querySelector('.form-submit-btn, [type="submit"]');
    if (submitBtn) {
      this.showButtonLoading(submitBtn);
    }

    // 禁用所有输入框
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.setAttribute('data-original-disabled', input.disabled);
      input.disabled = true;
    });

    form.classList.add('form-loading');
  }

  /**
   * 隐藏表单加载状态
   * @param {HTMLFormElement} form - 表单元素
   */
  hideFormLoading(form) {
    if (!form) return;

    const submitBtn = form.querySelector('.form-submit-btn, [type="submit"]');
    if (submitBtn) {
      this.hideButtonLoading(submitBtn);
    }

    // 恢复输入框状态
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const originalDisabled = input.getAttribute('data-original-disabled') === 'true';
      input.disabled = originalDisabled;
      input.removeAttribute('data-original-disabled');
    });

    form.classList.remove('form-loading');
  }
  /**
   * 隐藏所有模态框
   */
  hideAllModals() {
    this.hideLoginModal();
    this.hideRegisterModal();
    this.hideAddToolModal();
    this.hideEditToolModal();
    this.hideDeleteToolModal();
  }

  /**
   * 获取当前显示的模态框
   * @returns {HTMLElement|null}
   */
  getCurrentModal() {
    const modals = document.querySelectorAll('.modal.show');
    return modals.length > 0 ? modals[modals.length - 1] : null;
  }

  /**
   * 检查是否有模态框正在显示
   * @returns {boolean}
   */
  hasActiveModal() {
    return document.querySelector('.modal.show') !== null;
  }

  /**
   * 设置焦点到指定元素
   * @param {string} elementId - 元素ID
   * @param {number} delay - 延迟时间（毫秒）
   */
  focusElement(elementId, delay = 100) {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element && typeof element.focus === 'function') {
        element.focus();
      }
    }, delay);
  }

  /**
   * 清空表单
   * @param {string} formId - 表单ID
   */
  clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      
      // 清除所有错误状态
      const errorElements = form.querySelectorAll('.error-message');
      errorElements.forEach(element => {
        this.hideError(element.id);
      });
      
      // 移除输入框错误样式
      const inputs = form.querySelectorAll('.form-input');
      inputs.forEach(input => {
        input.classList.remove('input-error');
      });
    }
  }

  /**
   * 验证表单字段
   * @param {string} fieldId - 字段ID
   * @param {Function} validator - 验证函数
   * @param {string} errorElementId - 错误显示元素ID
   * @returns {boolean}
   */
  validateField(fieldId, validator, errorElementId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(errorElementId);
    
    if (!field) return false;
    
    const result = validator(field.value);
    
    if (result.valid) {
      field.classList.remove('input-error');
      this.hideError(errorElementId);
      return true;
    } else {
      field.classList.add('input-error');
      this.showError(errorElementId, result.error);
      return false;
    }
  }

  /**
   * 显示确认对话框
   * @param {string} title - 对话框标题
   * @param {string} message - 对话框消息
   * @param {Function} onConfirm - 确认回调
   * @param {Function} onCancel - 取消回调
   */
  showConfirmDialog(title, message, onConfirm, onCancel) {
    // 创建确认对话框
    const dialog = document.createElement('div');
    dialog.className = 'modal confirm-dialog';
    dialog.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary cancel-btn">取消</button>
          <button class="btn btn-primary confirm-btn">确认</button>
        </div>
      </div>
    `;

    // 添加事件监听
    const cancelBtn = dialog.querySelector('.cancel-btn');
    const confirmBtn = dialog.querySelector('.confirm-btn');

    cancelBtn.addEventListener('click', () => {
      dialog.remove();
      if (onCancel) onCancel();
    });

    confirmBtn.addEventListener('click', () => {
      dialog.remove();
      if (onConfirm) onConfirm();
    });

    // 点击背景关闭
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
        if (onCancel) onCancel();
      }
    });

    // 添加到页面并显示
    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add('show'), 10);
  }

  /**
   * 显示工具提示
   * @param {HTMLElement} element - 目标元素
   * @param {string} message - 提示消息
   * @param {string} position - 位置 ('top', 'bottom', 'left', 'right')
   */
  showTooltip(element, message, position = 'top') {
    if (!element) return;

    // 移除现有提示
    this.hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.textContent = message;
    tooltip.id = 'activeTooltip';

    document.body.appendChild(tooltip);

    // 计算位置
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top, left;

    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + 8;
        break;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.classList.add('show');
  }

  /**
   * 隐藏工具提示
   */
  hideTooltip() {
    const tooltip = document.getElementById('activeTooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }

  /**
   * 显示数据加载指示器
   * @param {HTMLElement} container - 容器元素
   * @param {string} message - 加载消息
   */
  showDataLoading(container, message = '加载数据中...') {
    if (!container) return;

    // 创建加载指示器
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'data-loading-indicator';
    loadingIndicator.innerHTML = `
      <div class="data-loading-spinner"></div>
      <div class="data-loading-text">${message}</div>
    `;

    // 隐藏原有内容
    const originalContent = container.innerHTML;
    container.setAttribute('data-original-content', originalContent);
    container.innerHTML = '';
    container.appendChild(loadingIndicator);
    container.classList.add('data-loading');
  }

  /**
   * 隐藏数据加载指示器
   * @param {HTMLElement} container - 容器元素
   */
  hideDataLoading(container) {
    if (!container) return;

    const originalContent = container.getAttribute('data-original-content');
    if (originalContent) {
      container.innerHTML = originalContent;
      container.removeAttribute('data-original-content');
    }
    container.classList.remove('data-loading');
  }

  /**
   * 显示内联加载动画
   * @param {HTMLElement} element - 目标元素
   * @param {string} position - 位置 ('before', 'after', 'replace')
   * @returns {HTMLElement} 加载元素
   */
  showInlineLoading(element, position = 'after') {
    if (!element) return null;

    const loadingElement = document.createElement('span');
    loadingElement.className = 'inline-loading';
    loadingElement.innerHTML = '<span class="inline-loading-spinner"></span>';

    switch (position) {
      case 'before':
        element.parentNode.insertBefore(loadingElement, element);
        break;
      case 'after':
        element.parentNode.insertBefore(loadingElement, element.nextSibling);
        break;
      case 'replace':
        element.style.display = 'none';
        element.parentNode.insertBefore(loadingElement, element.nextSibling);
        break;
    }

    return loadingElement;
  }

  /**
   * 隐藏内联加载动画
   * @param {HTMLElement} loadingElement - 加载元素
   * @param {HTMLElement} originalElement - 原始元素（用于replace模式）
   */
  hideInlineLoading(loadingElement, originalElement = null) {
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.remove();
    }
    
    if (originalElement) {
      originalElement.style.display = '';
    }
  }

  /**
   * 显示卡片加载状态
   * @param {HTMLElement} card - 卡片元素
   */
  showCardLoading(card) {
    if (!card) return;

    card.classList.add('card-loading');
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'card-loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="card-loading-spinner"></div>
    `;

    card.style.position = 'relative';
    card.appendChild(loadingOverlay);
  }

  /**
   * 隐藏卡片加载状态
   * @param {HTMLElement} card - 卡片元素
   */
  hideCardLoading(card) {
    if (!card) return;

    card.classList.remove('card-loading');
    const overlay = card.querySelector('.card-loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * 显示进度条
   * @param {number} progress - 进度百分比 (0-100)
   * @param {string} message - 进度消息
   */
  showProgress(progress = 0, message = '处理中...') {
    // 移除现有进度条
    this.hideProgress();

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.id = 'globalProgressContainer';
    progressContainer.innerHTML = `
      <div class="progress-content">
        <div class="progress-message">${message}</div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="progress-percentage">${Math.round(progress)}%</div>
      </div>
    `;

    document.body.appendChild(progressContainer);
    setTimeout(() => progressContainer.classList.add('show'), 10);
  }

  /**
   * 更新进度条
   * @param {number} progress - 进度百分比 (0-100)
   * @param {string} message - 进度消息
   */
  updateProgress(progress, message = null) {
    const container = document.getElementById('globalProgressContainer');
    if (!container) return;

    const progressBar = container.querySelector('.progress-bar');
    const progressPercentage = container.querySelector('.progress-percentage');
    const progressMessage = container.querySelector('.progress-message');

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    if (progressPercentage) {
      progressPercentage.textContent = `${Math.round(progress)}%`;
    }
    
    if (message && progressMessage) {
      progressMessage.textContent = message;
    }
  }

  /**
   * 隐藏进度条
   */
  hideProgress() {
    const container = document.getElementById('globalProgressContainer');
    if (container) {
      container.classList.remove('show');
      setTimeout(() => {
        if (container.parentNode) {
          container.remove();
        }
      }, 300);
    }
  }

  /**
   * 检查当前是否处于加载状态
   * @returns {boolean}
   */
  isLoading() {
    return this.loadingState;
  }

  /**
   * 滚动到指定元素
   * @param {string} elementId - 元素ID
   * @param {string} behavior - 滚动行为 ('smooth', 'auto')
   */
  scrollToElement(elementId, behavior = 'smooth') {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior, block: 'start' });
    }
  }

  /**
   * 高亮显示元素
   * @param {string} elementId - 元素ID
   * @param {number} duration - 高亮持续时间（毫秒）
   */
  highlightElement(elementId, duration = 2000) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('highlight');
      setTimeout(() => {
        element.classList.remove('highlight');
      }, duration);
    }
  }

  /**
   * 获取表单数据
   * @param {string} formId - 表单ID
   * @returns {object} 表单数据对象
   */
  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    // 处理复选框
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      data[checkbox.name || checkbox.id] = checkbox.checked;
    });

    return data;
  }

  /**
   * 设置表单数据
   * @param {string} formId - 表单ID
   * @param {object} data - 数据对象
   */
  setFormData(formId, data) {
    const form = document.getElementById(formId);
    if (!form || !data) return;

    Object.keys(data).forEach(key => {
      const field = form.querySelector(`[name="${key}"], #${key}`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = Boolean(data[key]);
        } else {
          field.value = data[key] || '';
        }
      }
    });
  }
}

// 导出 UI 管理器
window.UIManager = UIManager;

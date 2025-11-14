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
   */
  showNotification(message, type = 'info', duration = 3000) {
    // 清除现有通知
    this.hideNotification();

    // 创建通知容器
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // 创建通知内容
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.textContent = message;

    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', '关闭通知');
    closeBtn.addEventListener('click', () => this.hideNotification());

    // 组装通知
    notification.appendChild(content);
    notification.appendChild(closeBtn);

    // 添加到页面
    document.body.appendChild(notification);

    // 触发显示动画
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // 自动关闭
    if (duration > 0) {
      this.notificationTimeout = setTimeout(() => {
        this.hideNotification();
      }, duration);
    }

    return notification;
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
  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }

  hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.classList.remove('show');
      errorElement.textContent = '';
    }
  }

  /**
   * 显示全局加载状态
   * @param {string} message - 加载消息
   */
  showLoading(message = '加载中...') {
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
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';

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
   */
  showButtonLoading(button, loadingText = '处理中...') {
    if (!button) return;

    // 保存原始状态
    button.setAttribute('data-original-text', button.textContent);
    button.setAttribute('data-original-disabled', button.disabled);

    // 设置加载状态
    button.disabled = true;
    button.textContent = loadingText;
    button.classList.add('loading');
  }

  /**
   * 隐藏按钮加载状态
   * @param {HTMLButtonElement} button - 按钮元素
   */
  hideButtonLoading(button) {
    if (!button) return;

    // 恢复原始状态
    const originalText = button.getAttribute('data-original-text');
    const originalDisabled = button.getAttribute('data-original-disabled') === 'true';

    if (originalText) {
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

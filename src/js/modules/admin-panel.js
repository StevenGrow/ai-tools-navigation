/**
 * 管理员面板模块
 * 处理管理员控制面板的所有功能
 */

class AdminPanel {
  constructor(supabaseClient, adminManager) {
    this.supabase = supabaseClient;
    this.adminManager = adminManager;
    this.currentTab = 'stats';
    this.currentFilter = 'all';
    this.allTools = [];
    this.allUsers = [];
    this.selectedTools = new Set(); // 批量选择的工具ID
    this.lastDeletedTools = []; // 用于撤销删除
    
    this.initializeEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    // 标签页切换
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // 工具过滤按钮
    document.querySelectorAll('.admin-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterTools(e.target.dataset.filter);
      });
    });

    // 搜索功能
    const toolSearch = document.getElementById('adminToolSearch');
    if (toolSearch) {
      toolSearch.addEventListener('input', (e) => {
        this.searchTools(e.target.value);
      });
    }

    const userSearch = document.getElementById('adminUserSearch');
    if (userSearch) {
      userSearch.addEventListener('input', (e) => {
        this.searchUsers(e.target.value);
      });
    }

    // 批量操作按钮
    const selectAllBtn = document.getElementById('adminSelectAll');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => this.selectAllTools());
    }

    const deselectAllBtn = document.getElementById('adminDeselectAll');
    if (deselectAllBtn) {
      deselectAllBtn.addEventListener('click', () => this.deselectAllTools());
    }

    const batchDeleteBtn = document.getElementById('adminBatchDelete');
    if (batchDeleteBtn) {
      batchDeleteBtn.addEventListener('click', () => this.batchDeleteTools());
    }

    const batchCategoryBtn = document.getElementById('adminBatchCategory');
    if (batchCategoryBtn) {
      batchCategoryBtn.addEventListener('click', () => this.showBatchCategoryModal());
    }

    // 关闭按钮
    const closeBtn = document.getElementById('adminPanelClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // 点击模态框外部关闭
    const modal = document.getElementById('adminPanelModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hide();
        }
      });
    }
  }

  /**
   * 显示管理员面板
   */
  async show() {
    const modal = document.getElementById('adminPanelModal');
    if (modal) {
      modal.classList.add('show');
      
      // 加载数据
      await this.loadData();
    }
  }

  /**
   * 隐藏管理员面板
   */
  hide() {
    const modal = document.getElementById('adminPanelModal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  /**
   * 切换标签页
   */
  switchTab(tabName) {
    this.currentTab = tabName;

    // 更新标签按钮状态
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // 更新标签页内容
    document.querySelectorAll('.admin-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    const targetTab = document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // 加载对应标签页的数据
    this.loadTabData(tabName);
  }

  /**
   * 加载所有数据
   */
  async loadData() {
    await Promise.all([
      this.loadStats(),
      this.loadTools(),
      this.loadUsers()
    ]);
  }

  /**
   * 加载标签页数据
   */
  async loadTabData(tabName) {
    switch (tabName) {
      case 'stats':
        await this.loadStats();
        break;
      case 'tools':
        await this.loadTools();
        break;
      case 'users':
        await this.loadUsers();
        break;
    }
  }

  /**
   * 加载统计数据
   */
  async loadStats() {
    try {
      // 获取所有工具数据
      const { data: allTools, error } = await this.supabase
        .from('custom_tools')
        .select('*');

      if (error) throw error;

      // 基础统计
      const systemTools = allTools.filter(t => t.is_admin_tool);
      const userTools = allTools.filter(t => !t.is_admin_tool);
      const uniqueUsers = new Set(allTools.map(t => t.user_id));

      // 更新基础统计卡片
      this.updateStatCard('systemToolsCount', systemTools.length);
      this.updateStatCard('userToolsCount', userTools.length);
      this.updateStatCard('totalUsersCount', uniqueUsers.size);
      this.updateStatCard('totalToolsCount', allTools.length);

      // 分类统计
      const categoryStats = this.calculateCategoryStats(allTools);
      this.renderCategoryStats(categoryStats);

      // 特性统计
      const featureStats = this.calculateFeatureStats(allTools);
      this.renderFeatureStats(featureStats);

      // 时间趋势统计
      const timeStats = this.calculateTimeStats(allTools);
      this.renderTimeStats(timeStats);

      // 热门工具
      this.renderTopTools(allTools);

    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  }

  /**
   * 更新统计卡片
   */
  updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value.toLocaleString();
    }
  }

  /**
   * 加载工具列表
   */
  async loadTools() {
    const listContainer = document.getElementById('adminToolsList');
    if (!listContainer) return;

    try {
      listContainer.innerHTML = '<div class="admin-loading">加载中...</div>';

      // 获取所有工具
      const { data: tools, error } = await this.supabase
        .from('custom_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.allTools = tools || [];
      this.renderTools(this.allTools);

    } catch (error) {
      console.error('加载工具列表失败:', error);
      listContainer.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty-icon">❌</div>
          <div class="admin-empty-text">加载失败</div>
          <div class="admin-empty-hint">${error.message}</div>
        </div>
      `;
    }
  }

  /**
   * 渲染工具列表
   */
  renderTools(tools) {
    const listContainer = document.getElementById('adminToolsList');
    if (!listContainer) return;

    if (tools.length === 0) {
      listContainer.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty-icon">📦</div>
          <div class="admin-empty-text">暂无工具</div>
          <div class="admin-empty-hint">还没有任何工具</div>
        </div>
      `;
      this.updateBatchActionsUI();
      return;
    }

    listContainer.innerHTML = tools.map(tool => `
      <div class="admin-tool-item ${this.selectedTools.has(tool.id) ? 'selected' : ''}" data-tool-id="${tool.id}">
        <div class="admin-tool-checkbox">
          <input type="checkbox" 
                 class="tool-checkbox" 
                 data-tool-id="${tool.id}"
                 ${this.selectedTools.has(tool.id) ? 'checked' : ''}>
        </div>
        <div class="admin-tool-info">
          <div class="admin-tool-name">
            ${tool.is_admin_tool ? '👑' : '👤'} ${tool.tool_name}
            ${tool.is_free ? '<span class="tag tag-free">免费</span>' : '<span class="tag tag-paid">付费</span>'}
            ${tool.is_chinese ? '<span class="tag tag-cn">中文</span>' : ''}
          </div>
          <div class="tool-desc">${tool.tool_desc || '暂无描述'}</div>
          <div class="admin-tool-meta">
            <span>🔗 <a href="${tool.tool_url}" target="_blank">${tool.tool_url}</a></span>
            <span>📁 ${this.getCategoryName(tool.category)}</span>
            <span>📅 ${new Date(tool.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="admin-tool-actions">
          <button class="admin-action-btn edit" data-tool-id="${tool.id}">✏️ 编辑</button>
          <button class="admin-action-btn delete" data-tool-id="${tool.id}">🗑️ 删除</button>
        </div>
      </div>
    `).join('');

    // 绑定操作按钮事件
    this.bindToolActions();
    this.updateBatchActionsUI();
  }

  /**
   * 绑定工具操作按钮事件
   */
  bindToolActions() {
    // 复选框
    document.querySelectorAll('.tool-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const toolId = e.target.dataset.toolId;
        if (e.target.checked) {
          this.selectedTools.add(toolId);
        } else {
          this.selectedTools.delete(toolId);
        }
        this.updateToolItemSelection(toolId);
        this.updateBatchActionsUI();
      });
    });

    // 编辑按钮
    document.querySelectorAll('.admin-action-btn.edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const toolId = e.target.dataset.toolId;
        this.editTool(toolId);
      });
    });

    // 删除按钮
    document.querySelectorAll('.admin-action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const toolId = e.target.dataset.toolId;
        this.deleteTool(toolId);
      });
    });
  }

  /**
   * 过滤工具
   */
  filterTools(filter) {
    this.currentFilter = filter;

    // 更新按钮状态
    document.querySelectorAll('.admin-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    // 过滤工具
    let filteredTools = this.allTools;
    if (filter === 'system') {
      filteredTools = this.allTools.filter(tool => tool.is_admin_tool);
    } else if (filter === 'user') {
      filteredTools = this.allTools.filter(tool => !tool.is_admin_tool);
    }

    this.renderTools(filteredTools);
  }

  /**
   * 搜索工具
   */
  searchTools(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    let filteredTools = this.allTools;

    // 应用过滤器
    if (this.currentFilter === 'system') {
      filteredTools = filteredTools.filter(tool => tool.is_admin_tool);
    } else if (this.currentFilter === 'user') {
      filteredTools = filteredTools.filter(tool => !tool.is_admin_tool);
    }

    // 应用搜索
    if (term) {
      filteredTools = filteredTools.filter(tool => {
        return tool.tool_name.toLowerCase().includes(term) ||
               (tool.tool_desc && tool.tool_desc.toLowerCase().includes(term)) ||
               tool.tool_url.toLowerCase().includes(term);
      });
    }

    this.renderTools(filteredTools);
  }

  /**
   * 编辑工具
   */
  editTool(toolId) {
    const tool = this.allTools.find(t => t.id === toolId);
    if (tool && window.uiManager) {
      this.hide();
      window.uiManager.showEditToolModal(tool);
    }
  }

  /**
   * 删除工具
   */
  async deleteTool(toolId) {
    const tool = this.allTools.find(t => t.id === toolId);
    if (!tool) return;

    if (!confirm(`确定要删除工具"${tool.tool_name}"吗？此操作无法撤销。`)) {
      return;
    }

    try {
      const { error } = await this.supabase
        .from('custom_tools')
        .delete()
        .eq('id', toolId);

      if (error) throw error;

      // 刷新列表
      await this.loadTools();
      await this.loadStats();

      if (window.uiManager) {
        window.uiManager.showNotification('工具删除成功', 'success', 2000);
      }

    } catch (error) {
      console.error('删除工具失败:', error);
      if (window.uiManager) {
        window.uiManager.showNotification('删除工具失败', 'error');
      }
    }
  }

  /**
   * 加载用户列表
   */
  async loadUsers() {
    const listContainer = document.getElementById('adminUsersList');
    if (!listContainer) return;

    try {
      listContainer.innerHTML = '<div class="admin-loading">加载中...</div>';

      // 获取所有用户的工具
      const { data: tools, error } = await this.supabase
        .from('custom_tools')
        .select('user_id, created_at, is_admin_tool');

      if (error) throw error;

      // 获取管理员列表
      const { data: admins } = await this.supabase
        .from('admin_users')
        .select('user_id, role');

      const adminMap = {};
      if (admins) {
        admins.forEach(admin => {
          adminMap[admin.user_id] = admin.role;
        });
      }

      // 统计每个用户的详细信息
      const userStats = {};
      tools.forEach(tool => {
        if (!userStats[tool.user_id]) {
          userStats[tool.user_id] = {
            totalTools: 0,
            systemTools: 0,
            userTools: 0,
            lastActivity: tool.created_at
          };
        }
        userStats[tool.user_id].totalTools++;
        if (tool.is_admin_tool) {
          userStats[tool.user_id].systemTools++;
        } else {
          userStats[tool.user_id].userTools++;
        }
        // 更新最后活动时间
        if (new Date(tool.created_at) > new Date(userStats[tool.user_id].lastActivity)) {
          userStats[tool.user_id].lastActivity = tool.created_at;
        }
      });

      this.allUsers = Object.entries(userStats).map(([userId, stats]) => ({
        id: userId,
        ...stats,
        isAdmin: !!adminMap[userId],
        adminRole: adminMap[userId] || null
      }));

      // 按工具数量排序
      this.allUsers.sort((a, b) => b.totalTools - a.totalTools);

      this.renderUsers(this.allUsers);

    } catch (error) {
      console.error('加载用户列表失败:', error);
      listContainer.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty-icon">❌</div>
          <div class="admin-empty-text">加载失败</div>
          <div class="admin-empty-hint">${error.message}</div>
        </div>
      `;
    }
  }

  /**
   * 渲染用户列表
   */
  renderUsers(users) {
    const listContainer = document.getElementById('adminUsersList');
    if (!listContainer) return;

    if (users.length === 0) {
      listContainer.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty-icon">👥</div>
          <div class="admin-empty-text">暂无用户</div>
          <div class="admin-empty-hint">还没有用户添加工具</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = users.map(user => {
      const lastActivityDate = new Date(user.lastActivity);
      const daysAgo = Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
      const activityText = daysAgo === 0 ? '今天' : daysAgo === 1 ? '昨天' : `${daysAgo}天前`;

      return `
        <div class="admin-user-item" data-user-id="${user.id}">
          <div class="admin-user-avatar ${user.isAdmin ? 'admin' : ''}">
            ${user.isAdmin ? '👑' : '👤'}
          </div>
          <div class="admin-user-info">
            <div class="admin-user-header">
              <div class="admin-user-email">
                ${user.id.substring(0, 12)}...
                ${user.isAdmin ? `<span class="user-admin-badge">${this.getAdminRoleName(user.adminRole)}</span>` : ''}
              </div>
            </div>
            <div class="admin-user-stats">
              <span>📦 总计 ${user.totalTools} 个工具</span>
              ${user.systemTools > 0 ? `<span>👑 系统 ${user.systemTools}</span>` : ''}
              ${user.userTools > 0 ? `<span>👤 个人 ${user.userTools}</span>` : ''}
              <span>⏰ ${activityText}活跃</span>
            </div>
          </div>
          <div class="admin-user-actions">
            <button class="admin-action-btn view-tools" data-user-id="${user.id}">
              📋 查看工具
            </button>
            <button class="admin-action-btn manage-role" data-user-id="${user.id}">
              ${user.isAdmin ? '⚙️ 管理权限' : '➕ 设为管理员'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // 绑定用户操作按钮
    this.bindUserActions();
  }

  /**
   * 搜索用户
   */
  searchUsers(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    let filteredUsers = this.allUsers;

    if (term) {
      filteredUsers = filteredUsers.filter(user => {
        return user.id.toLowerCase().includes(term);
      });
    }

    this.renderUsers(filteredUsers);
  }

  /**
   * 绑定用户操作按钮
   */
  bindUserActions() {
    // 查看工具按钮
    document.querySelectorAll('.admin-action-btn.view-tools').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.userId;
        this.showUserTools(userId);
      });
    });

    // 管理权限按钮
    document.querySelectorAll('.admin-action-btn.manage-role').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.userId;
        this.showManageRoleModal(userId);
      });
    });
  }

  /**
   * 显示用户的工具列表
   */
  async showUserTools(userId) {
    try {
      // 获取用户的所有工具
      const { data: tools, error } = await this.supabase
        .from('custom_tools')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const user = this.allUsers.find(u => u.id === userId);
      const userIdShort = userId.substring(0, 12);

      const toolsList = tools.length > 0 ? tools.map(tool => `
        <div class="user-tool-item">
          <div class="user-tool-info">
            <div class="user-tool-name">
              ${tool.is_admin_tool ? '👑' : '👤'} ${tool.tool_name}
              ${tool.is_free ? '<span class="tag tag-free">免费</span>' : '<span class="tag tag-paid">付费</span>'}
            </div>
            <div class="user-tool-desc">${tool.tool_desc || '暂无描述'}</div>
            <div class="user-tool-meta">
              <span>📁 ${this.getCategoryName(tool.category)}</span>
              <span>📅 ${new Date(tool.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="user-tool-actions">
            <a href="${tool.tool_url}" target="_blank" class="tool-link-btn">🔗 访问</a>
          </div>
        </div>
      `).join('') : '<div class="admin-empty-hint">该用户还没有添加工具</div>';

      const modalHTML = `
        <div class="modal show" id="userToolsModal">
          <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
              <h2>👤 用户工具列表</h2>
              <button class="modal-close" id="userToolsClose">×</button>
            </div>
            <div class="modal-body">
              <div class="user-tools-header">
                <div class="user-tools-info">
                  <p><strong>用户ID:</strong> ${userIdShort}...</p>
                  <p><strong>工具总数:</strong> ${tools.length} 个</p>
                </div>
              </div>
              <div class="user-tools-list">
                ${toolsList}
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" id="userToolsCloseBtn">关闭</button>
            </div>
          </div>
        </div>
      `;

      // 添加到页面
      const existingModal = document.getElementById('userToolsModal');
      if (existingModal) {
        existingModal.remove();
      }
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      // 绑定关闭事件
      const modal = document.getElementById('userToolsModal');
      const closeBtn = document.getElementById('userToolsClose');
      const closeBtnFooter = document.getElementById('userToolsCloseBtn');

      const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      };

      closeBtn.addEventListener('click', closeModal);
      closeBtnFooter.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

    } catch (error) {
      console.error('加载用户工具失败:', error);
      if (window.uiManager) {
        window.uiManager.showNotification('加载用户工具失败', 'error');
      }
    }
  }

  /**
   * 显示管理权限模态框
   */
  showManageRoleModal(userId) {
    const user = this.allUsers.find(u => u.id === userId);
    if (!user) return;

    const userIdShort = userId.substring(0, 12);
    const isAdmin = user.isAdmin;

    const modalHTML = `
      <div class="modal show" id="manageRoleModal">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h2>${isAdmin ? '⚙️ 管理权限' : '➕ 设为管理员'}</h2>
            <button class="modal-close" id="manageRoleClose">×</button>
          </div>
          <div class="modal-body">
            <p style="margin-bottom: 1rem; color: var(--text-secondary);">
              <strong>用户ID:</strong> ${userIdShort}...
            </p>
            ${isAdmin ? `
              <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                当前角色: <strong>${this.getAdminRoleName(user.adminRole)}</strong>
              </p>
              <div class="form-group">
                <label for="roleSelect">修改角色</label>
                <select id="roleSelect" class="form-control">
                  <option value="super_admin" ${user.adminRole === 'super_admin' ? 'selected' : ''}>超级管理员</option>
                  <option value="admin" ${user.adminRole === 'admin' ? 'selected' : ''}>管理员</option>
                  <option value="moderator" ${user.adminRole === 'moderator' ? 'selected' : ''}>版主</option>
                </select>
              </div>
              <div class="role-actions">
                <button class="btn btn-danger" id="removeAdminBtn">移除管理员权限</button>
              </div>
            ` : `
              <div class="form-group">
                <label for="roleSelect">选择角色</label>
                <select id="roleSelect" class="form-control">
                  <option value="admin">管理员</option>
                  <option value="moderator">版主</option>
                  <option value="super_admin">超级管理员</option>
                </select>
              </div>
              <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
                <strong>角色说明：</strong><br>
                • 超级管理员：拥有所有权限<br>
                • 管理员：可以管理工具和用户<br>
                • 版主：可以审核和管理工具
              </p>
            `}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="manageRoleCancelBtn">取消</button>
            <button class="btn btn-primary" id="manageRoleConfirmBtn">
              ${isAdmin ? '更新角色' : '授予权限'}
            </button>
          </div>
        </div>
      </div>
    `;

    // 添加到页面
    const existingModal = document.getElementById('manageRoleModal');
    if (existingModal) {
      existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 绑定事件
    const modal = document.getElementById('manageRoleModal');
    const closeBtn = document.getElementById('manageRoleClose');
    const cancelBtn = document.getElementById('manageRoleCancelBtn');
    const confirmBtn = document.getElementById('manageRoleConfirmBtn');
    const removeBtn = document.getElementById('removeAdminBtn');

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    confirmBtn.addEventListener('click', async () => {
      const select = document.getElementById('roleSelect');
      const role = select.value;
      await this.updateUserRole(userId, role);
      closeModal();
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', async () => {
        if (confirm(`确定要移除用户 ${userIdShort}... 的管理员权限吗？`)) {
          await this.removeAdminRole(userId);
          closeModal();
        }
      });
    }
  }

  /**
   * 更新用户角色
   */
  async updateUserRole(userId, role) {
    try {
      const user = this.allUsers.find(u => u.id === userId);
      
      if (user.isAdmin) {
        // 更新现有管理员角色
        const { error } = await this.supabase
          .from('admin_users')
          .update({ role })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // 添加新管理员
        const { error } = await this.supabase
          .from('admin_users')
          .insert({ user_id: userId, role });

        if (error) throw error;
      }

      // 刷新用户列表
      await this.loadUsers();

      if (window.uiManager) {
        window.uiManager.showNotification(
          user.isAdmin ? '角色更新成功' : '管理员权限授予成功',
          'success',
          3000
        );
      }

    } catch (error) {
      console.error('更新用户角色失败:', error);
      if (window.uiManager) {
        window.uiManager.showNotification('操作失败', 'error');
      }
    }
  }

  /**
   * 移除管理员角色
   */
  async removeAdminRole(userId) {
    try {
      const { error } = await this.supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // 刷新用户列表
      await this.loadUsers();

      if (window.uiManager) {
        window.uiManager.showNotification('管理员权限已移除', 'success', 3000);
      }

    } catch (error) {
      console.error('移除管理员角色失败:', error);
      if (window.uiManager) {
        window.uiManager.showNotification('操作失败', 'error');
      }
    }
  }

  /**
   * 获取管理员角色名称
   */
  getAdminRoleName(role) {
    const roleNames = {
      super_admin: '超级管理员',
      admin: '管理员',
      moderator: '版主'
    };
    return roleNames[role] || role;
  }

  /**
   * 获取分类中文名称
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
   * 全选工具
   */
  selectAllTools() {
    const checkboxes = document.querySelectorAll('.tool-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
      this.selectedTools.add(checkbox.dataset.toolId);
      this.updateToolItemSelection(checkbox.dataset.toolId);
    });
    this.updateBatchActionsUI();
  }

  /**
   * 取消全选
   */
  deselectAllTools() {
    const checkboxes = document.querySelectorAll('.tool-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
      this.selectedTools.delete(checkbox.dataset.toolId);
      this.updateToolItemSelection(checkbox.dataset.toolId);
    });
    this.updateBatchActionsUI();
  }

  /**
   * 更新工具项的选中状态
   */
  updateToolItemSelection(toolId) {
    const toolItem = document.querySelector(`.admin-tool-item[data-tool-id="${toolId}"]`);
    if (toolItem) {
      if (this.selectedTools.has(toolId)) {
        toolItem.classList.add('selected');
      } else {
        toolItem.classList.remove('selected');
      }
    }
  }

  /**
   * 更新批量操作UI状态
   */
  updateBatchActionsUI() {
    const selectedCount = this.selectedTools.size;
    const batchActions = document.getElementById('adminBatchActions');
    const selectedCountEl = document.getElementById('adminSelectedCount');

    if (batchActions) {
      if (selectedCount > 0) {
        batchActions.classList.add('show');
      } else {
        batchActions.classList.remove('show');
      }
    }

    if (selectedCountEl) {
      selectedCountEl.textContent = selectedCount;
    }
  }

  /**
   * 批量删除工具
   */
  async batchDeleteTools() {
    if (this.selectedTools.size === 0) {
      if (window.uiManager) {
        window.uiManager.showNotification('请先选择要删除的工具', 'warning', 2000);
      }
      return;
    }

    const selectedToolsArray = Array.from(this.selectedTools);
    const toolNames = selectedToolsArray
      .map(id => this.allTools.find(t => t.id === id)?.tool_name)
      .filter(Boolean)
      .slice(0, 3)
      .join('、');
    
    const moreCount = selectedToolsArray.length > 3 ? `等${selectedToolsArray.length}个` : '';

    if (!confirm(`确定要删除 ${selectedToolsArray.length} 个工具吗？\n\n包括：${toolNames}${moreCount}\n\n此操作无法撤销！`)) {
      return;
    }

    try {
      // 保存删除的工具信息（用于可能的撤销功能）
      this.lastDeletedTools = selectedToolsArray.map(id => 
        this.allTools.find(t => t.id === id)
      ).filter(Boolean);

      // 批量删除
      const { error } = await this.supabase
        .from('custom_tools')
        .delete()
        .in('id', selectedToolsArray);

      if (error) throw error;

      // 清空选择
      this.selectedTools.clear();

      // 刷新列表
      await this.loadTools();
      await this.loadStats();

      if (window.uiManager) {
        window.uiManager.showNotification(
          `成功删除 ${selectedToolsArray.length} 个工具`, 
          'success', 
          3000
        );
      }

    } catch (error) {
      console.error('批量删除工具失败:', error);
      if (window.uiManager) {
        window.uiManager.showNotification('批量删除失败', 'error');
      }
    }
  }

  /**
   * 显示批量修改分类模态框
   */
  showBatchCategoryModal() {
    if (this.selectedTools.size === 0) {
      if (window.uiManager) {
        window.uiManager.showNotification('请先选择要修改的工具', 'warning', 2000);
      }
      return;
    }

    const categories = [
      { value: 'chat', label: '对话助手' },
      { value: 'image', label: '绘画' },
      { value: 'video', label: '视频' },
      { value: 'writing', label: '写作' },
      { value: 'coding', label: '编程' },
      { value: 'audio', label: '音频' }
    ];

    const categoryOptions = categories.map(cat => 
      `<option value="${cat.value}">${cat.label}</option>`
    ).join('');

    const modalHTML = `
      <div class="modal show" id="batchCategoryModal">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h2>批量修改分类</h2>
            <button class="modal-close" id="batchCategoryClose">×</button>
          </div>
          <div class="modal-body">
            <p style="margin-bottom: 1rem; color: var(--text-secondary);">
              已选择 <strong>${this.selectedTools.size}</strong> 个工具
            </p>
            <div class="form-group">
              <label for="batchCategorySelect">选择新分类</label>
              <select id="batchCategorySelect" class="form-control">
                <option value="">请选择分类</option>
                ${categoryOptions}
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="batchCategoryCancelBtn">取消</button>
            <button class="btn btn-primary" id="batchCategoryConfirmBtn">确认修改</button>
          </div>
        </div>
      </div>
    `;

    // 添加到页面
    const existingModal = document.getElementById('batchCategoryModal');
    if (existingModal) {
      existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 绑定事件
    const modal = document.getElementById('batchCategoryModal');
    const closeBtn = document.getElementById('batchCategoryClose');
    const cancelBtn = document.getElementById('batchCategoryCancelBtn');
    const confirmBtn = document.getElementById('batchCategoryConfirmBtn');

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    confirmBtn.addEventListener('click', async () => {
      const select = document.getElementById('batchCategorySelect');
      const newCategory = select.value;

      if (!newCategory) {
        if (window.uiManager) {
          window.uiManager.showNotification('请选择分类', 'warning', 2000);
        }
        return;
      }

      await this.batchUpdateCategory(newCategory);
      closeModal();
    });
  }

  /**
   * 批量更新分类
   */
  async batchUpdateCategory(newCategory) {
    const selectedToolsArray = Array.from(this.selectedTools);

    try {
      // 批量更新
      const { error } = await this.supabase
        .from('custom_tools')
        .update({ category: newCategory })
        .in('id', selectedToolsArray);

      if (error) throw error;

      // 清空选择
      this.selectedTools.clear();

      // 刷新列表
      await this.loadTools();

      if (window.uiManager) {
        window.uiManager.showNotification(
          `成功修改 ${selectedToolsArray.length} 个工具的分类`, 
          'success', 
          3000
        );
      }

    } catch (error) {
      console.error('批量修改分类失败:', error);
      if (window.uiManager) {
        window.uiManager.showNotification('批量修改失败', 'error');
      }
    }
  }

  /**
   * 获取管理员角色名称
   */
  getAdminRoleName(role) {
    const roleNames = {
      super_admin: '超级管理员',
      admin: '管理员',
      moderator: '版主'
    };
    return roleNames[role] || role;
  }

  /**
   * 计算分类统计
   */
  calculateCategoryStats(tools) {
    const stats = {};
    const categories = ['chat', 'image', 'video', 'writing', 'coding', 'audio'];
    
    categories.forEach(cat => {
      stats[cat] = {
        total: 0,
        system: 0,
        user: 0
      };
    });

    tools.forEach(tool => {
      if (stats[tool.category]) {
        stats[tool.category].total++;
        if (tool.is_admin_tool) {
          stats[tool.category].system++;
        } else {
          stats[tool.category].user++;
        }
      }
    });

    return stats;
  }

  /**
   * 渲染分类统计
   */
  renderCategoryStats(stats) {
    const container = document.getElementById('categoryStatsContainer');
    if (!container) return;

    const categories = [
      { key: 'chat', name: '对话助手', icon: '💬' },
      { key: 'image', name: '绘画', icon: '🎨' },
      { key: 'video', name: '视频', icon: '🎬' },
      { key: 'writing', name: '写作', icon: '✍️' },
      { key: 'coding', name: '编程', icon: '💻' },
      { key: 'audio', name: '音频', icon: '🎵' }
    ];

    const maxCount = Math.max(...Object.values(stats).map(s => s.total), 1);

    container.innerHTML = `
      <h3 class="stats-section-title">📊 分类统计</h3>
      <div class="category-stats-list">
        ${categories.map(cat => {
          const catStats = stats[cat.key];
          const percentage = (catStats.total / maxCount * 100).toFixed(0);
          return `
            <div class="category-stat-item">
              <div class="category-stat-header">
                <span class="category-stat-name">${cat.icon} ${cat.name}</span>
                <span class="category-stat-count">${catStats.total}</span>
              </div>
              <div class="category-stat-bar">
                <div class="category-stat-fill" style="width: ${percentage}%"></div>
              </div>
              <div class="category-stat-detail">
                <span>👑 系统: ${catStats.system}</span>
                <span>👤 用户: ${catStats.user}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * 计算特性统计
   */
  calculateFeatureStats(tools) {
    return {
      free: tools.filter(t => t.is_free).length,
      paid: tools.filter(t => !t.is_free).length,
      chinese: tools.filter(t => t.is_chinese).length,
      english: tools.filter(t => !t.is_chinese).length
    };
  }

  /**
   * 渲染特性统计
   */
  renderFeatureStats(stats) {
    const container = document.getElementById('featureStatsContainer');
    if (!container) return;

    const total = stats.free + stats.paid;
    const freePercentage = total > 0 ? (stats.free / total * 100).toFixed(1) : 0;
    const chinesePercentage = total > 0 ? (stats.chinese / total * 100).toFixed(1) : 0;

    container.innerHTML = `
      <h3 class="stats-section-title">🏷️ 特性统计</h3>
      <div class="feature-stats-grid">
        <div class="feature-stat-card">
          <div class="feature-stat-icon free">💰</div>
          <div class="feature-stat-info">
            <div class="feature-stat-label">免费工具</div>
            <div class="feature-stat-value">${stats.free}</div>
            <div class="feature-stat-percentage">${freePercentage}%</div>
          </div>
        </div>
        <div class="feature-stat-card">
          <div class="feature-stat-icon paid">💳</div>
          <div class="feature-stat-info">
            <div class="feature-stat-label">付费工具</div>
            <div class="feature-stat-value">${stats.paid}</div>
            <div class="feature-stat-percentage">${(100 - freePercentage).toFixed(1)}%</div>
          </div>
        </div>
        <div class="feature-stat-card">
          <div class="feature-stat-icon chinese">🇨🇳</div>
          <div class="feature-stat-info">
            <div class="feature-stat-label">中文支持</div>
            <div class="feature-stat-value">${stats.chinese}</div>
            <div class="feature-stat-percentage">${chinesePercentage}%</div>
          </div>
        </div>
        <div class="feature-stat-card">
          <div class="feature-stat-icon english">🌍</div>
          <div class="feature-stat-info">
            <div class="feature-stat-label">英文工具</div>
            <div class="feature-stat-value">${stats.english}</div>
            <div class="feature-stat-percentage">${(100 - chinesePercentage).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 计算时间趋势统计
   */
  calculateTimeStats(tools) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      today: tools.filter(t => new Date(t.created_at) >= today).length,
      yesterday: tools.filter(t => {
        const date = new Date(t.created_at);
        return date >= yesterday && date < today;
      }).length,
      thisWeek: tools.filter(t => new Date(t.created_at) >= weekAgo).length,
      thisMonth: tools.filter(t => new Date(t.created_at) >= monthAgo).length
    };
  }

  /**
   * 渲染时间趋势统计
   */
  renderTimeStats(stats) {
    const container = document.getElementById('timeStatsContainer');
    if (!container) return;

    container.innerHTML = `
      <h3 class="stats-section-title">📈 时间趋势</h3>
      <div class="time-stats-grid">
        <div class="time-stat-card">
          <div class="time-stat-period">今天</div>
          <div class="time-stat-value">${stats.today}</div>
          <div class="time-stat-label">新增工具</div>
        </div>
        <div class="time-stat-card">
          <div class="time-stat-period">昨天</div>
          <div class="time-stat-value">${stats.yesterday}</div>
          <div class="time-stat-label">新增工具</div>
        </div>
        <div class="time-stat-card">
          <div class="time-stat-period">本周</div>
          <div class="time-stat-value">${stats.thisWeek}</div>
          <div class="time-stat-label">新增工具</div>
        </div>
        <div class="time-stat-card">
          <div class="time-stat-period">本月</div>
          <div class="time-stat-value">${stats.thisMonth}</div>
          <div class="time-stat-label">新增工具</div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染热门工具
   */
  renderTopTools(tools) {
    const container = document.getElementById('topToolsContainer');
    if (!container) return;

    // 按创建时间排序，获取最新的10个工具
    const recentTools = [...tools]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    container.innerHTML = `
      <h3 class="stats-section-title">🔥 最新工具</h3>
      <div class="top-tools-list">
        ${recentTools.map((tool, index) => `
          <div class="top-tool-item">
            <div class="top-tool-rank">#${index + 1}</div>
            <div class="top-tool-info">
              <div class="top-tool-name">
                ${tool.is_admin_tool ? '👑' : '👤'} ${tool.tool_name}
              </div>
              <div class="top-tool-meta">
                <span>📁 ${this.getCategoryName(tool.category)}</span>
                <span>📅 ${this.formatRelativeTime(tool.created_at)}</span>
              </div>
            </div>
            <a href="${tool.tool_url}" target="_blank" class="top-tool-link">🔗</a>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return date.toLocaleDateString();
  }
}

// 导出 AdminPanel 类
window.AdminPanel = AdminPanel;

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
      // 获取系统工具数量
      const { count: systemToolsCount } = await this.supabase
        .from('custom_tools')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin_tool', true);

      // 获取用户工具数量
      const { count: userToolsCount } = await this.supabase
        .from('custom_tools')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin_tool', false);

      // 获取总用户数（需要管理员权限查询 auth.users）
      // 暂时使用工具创建者的唯一数量作为估算
      const { data: uniqueUsers } = await this.supabase
        .from('custom_tools')
        .select('user_id');

      const totalUsers = uniqueUsers ? new Set(uniqueUsers.map(u => u.user_id)).size : 0;

      // 更新显示
      this.updateStatCard('systemToolsCount', systemToolsCount || 0);
      this.updateStatCard('userToolsCount', userToolsCount || 0);
      this.updateStatCard('totalUsersCount', totalUsers);
      this.updateStatCard('totalToolsCount', (systemToolsCount || 0) + (userToolsCount || 0));

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
      return;
    }

    listContainer.innerHTML = tools.map(tool => `
      <div class="admin-tool-item" data-tool-id="${tool.id}">
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
  }

  /**
   * 绑定工具操作按钮事件
   */
  bindToolActions() {
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

      // 获取所有用户的工具统计
      const { data: tools, error } = await this.supabase
        .from('custom_tools')
        .select('user_id');

      if (error) throw error;

      // 统计每个用户的工具数量
      const userStats = {};
      tools.forEach(tool => {
        if (!userStats[tool.user_id]) {
          userStats[tool.user_id] = 0;
        }
        userStats[tool.user_id]++;
      });

      this.allUsers = Object.entries(userStats).map(([userId, toolCount]) => ({
        id: userId,
        toolCount
      }));

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

    listContainer.innerHTML = users.map(user => `
      <div class="admin-user-item">
        <div class="admin-user-avatar">👤</div>
        <div class="admin-user-info">
          <div class="admin-user-email">${user.id.substring(0, 8)}...</div>
          <div class="admin-user-stats">
            <span>🛠️ ${user.toolCount} 个工具</span>
          </div>
        </div>
      </div>
    `).join('');
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
}

// 导出 AdminPanel 类
window.AdminPanel = AdminPanel;

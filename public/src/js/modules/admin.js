/**
 * 管理员功能模块
 * 处理管理员权限检查、管理员工具管理等功能
 */

class AdminManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.isAdmin = false;
    this.adminRole = null;
  }

  /**
   * 检查当前用户是否是管理员
   * @returns {Promise<boolean>}
   */
  async checkAdminStatus() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        this.isAdmin = false;
        return false;
      }

      // 调用数据库函数检查管理员状态
      const { data, error } = await this.supabase
        .rpc('is_admin', { user_uuid: user.id });

      if (error) {
        console.error('检查管理员状态失败:', error);
        this.isAdmin = false;
        return false;
      }

      this.isAdmin = data;
      
      // 如果是管理员，获取角色信息
      if (this.isAdmin) {
        await this.loadAdminRole();
      }

      return this.isAdmin;
    } catch (error) {
      console.error('检查管理员状态错误:', error);
      this.isAdmin = false;
      return false;
    }
  }

  /**
   * 加载管理员角色信息
   */
  async loadAdminRole() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      const { data, error } = await this.supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        this.adminRole = data.role;
      }
    } catch (error) {
      console.error('加载管理员角色失败:', error);
    }
  }

  /**
   * 添加管理员工具
   * @param {Object} toolData - 工具数据
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async addAdminTool(toolData) {
    try {
      if (!this.isAdmin) {
        return {
          success: false,
          error: '只有管理员可以添加系统工具'
        };
      }

      const { data: { user } } = await this.supabase.auth.getUser();

      const toolRecord = {
        user_id: user.id,
        tool_name: toolData.name,
        tool_url: toolData.url,
        tool_desc: toolData.description,
        category: toolData.category,
        is_free: toolData.isFree,
        is_chinese: toolData.isChinese,
        is_admin_tool: true,
        visibility: 'public' // 管理员工具默认公开
      };

      const { data, error } = await this.supabase
        .from('custom_tools')
        .insert([toolRecord])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: this.translateError(error.message)
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('添加管理员工具失败:', error);
      return {
        success: false,
        error: '添加工具失败，请稍后重试'
      };
    }
  }

  /**
   * 获取所有管理员工具
   * @returns {Promise<Array>}
   */
  async getAdminTools() {
    try {
      const { data, error } = await this.supabase
        .from('custom_tools')
        .select('*')
        .eq('is_admin_tool', true)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取管理员工具失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('获取管理员工具错误:', error);
      return [];
    }
  }

  /**
   * 更新管理员工具
   * @param {string} toolId - 工具ID
   * @param {Object} toolData - 更新的工具数据
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async updateAdminTool(toolId, toolData) {
    try {
      if (!this.isAdmin) {
        return {
          success: false,
          error: '只有管理员可以编辑系统工具'
        };
      }

      const updateData = {
        tool_name: toolData.name,
        tool_url: toolData.url,
        tool_desc: toolData.description,
        category: toolData.category,
        is_free: toolData.isFree,
        is_chinese: toolData.isChinese,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('custom_tools')
        .update(updateData)
        .eq('id', toolId)
        .eq('is_admin_tool', true)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: this.translateError(error.message)
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('更新管理员工具失败:', error);
      return {
        success: false,
        error: '更新工具失败，请稍后重试'
      };
    }
  }

  /**
   * 删除管理员工具
   * @param {string} toolId - 工具ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteAdminTool(toolId) {
    try {
      if (!this.isAdmin) {
        return {
          success: false,
          error: '只有管理员可以删除系统工具'
        };
      }

      const { error } = await this.supabase
        .from('custom_tools')
        .delete()
        .eq('id', toolId)
        .eq('is_admin_tool', true);

      if (error) {
        return {
          success: false,
          error: this.translateError(error.message)
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('删除管理员工具失败:', error);
      return {
        success: false,
        error: '删除工具失败，请稍后重试'
      };
    }
  }

  /**
   * 添加新管理员
   * @param {string} userEmail - 用户邮箱
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async addAdmin(userEmail) {
    try {
      if (!this.isAdmin) {
        return {
          success: false,
          error: '只有管理员可以添加新管理员'
        };
      }

      // 首先查找用户
      const { data: userData, error: userError } = await this.supabase
        .from('auth.users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError || !userData) {
        return {
          success: false,
          error: '未找到该用户'
        };
      }

      // 调用添加管理员函数
      const { data, error } = await this.supabase
        .rpc('add_admin', { target_user_id: userData.id });

      if (error) {
        return {
          success: false,
          error: this.translateError(error.message)
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('添加管理员失败:', error);
      return {
        success: false,
        error: '添加管理员失败，请稍后重试'
      };
    }
  }

  /**
   * 翻译错误消息
   * @param {string} errorMessage - 英文错误消息
   * @returns {string} 中文错误消息
   */
  translateError(errorMessage) {
    const errorMap = {
      'duplicate key value violates unique constraint': '该用户已经是管理员',
      'permission denied': '权限不足',
      'row level security': '权限验证失败'
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    return '操作失败，请稍后重试';
  }

  /**
   * 获取当前用户的管理员状态
   * @returns {boolean}
   */
  getAdminStatus() {
    return this.isAdmin;
  }

  /**
   * 获取管理员角色
   * @returns {string|null}
   */
  getAdminRole() {
    return this.adminRole;
  }
}

// 导出 AdminManager 类
window.AdminManager = AdminManager;
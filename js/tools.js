// 工具管理器
// 处理自定义工具的 CRUD 操作

class ToolsManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  // 验证工具数据
  validateToolData(toolData) {
    const errors = [];
    
    // 验证工具名称
    if (!toolData.name || toolData.name.trim().length === 0) {
      errors.push('工具名称不能为空');
    } else if (toolData.name.length > 100) {
      errors.push('工具名称不能超过 100 个字符');
    }
    
    // 验证工具网址
    if (!toolData.url || toolData.url.trim().length === 0) {
      errors.push('工具网址不能为空');
    } else {
      try {
        const url = new URL(toolData.url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('工具网址必须以 http:// 或 https:// 开头');
        }
      } catch (e) {
        errors.push('请输入有效的网址格式');
      }
    }
    
    // 验证分类
    const validCategories = ['chat', 'image', 'video', 'writing', 'coding', 'audio'];
    if (!toolData.category || !validCategories.includes(toolData.category)) {
      errors.push('请选择有效的工具分类');
    }
    
    // 验证描述长度
    if (toolData.description && toolData.description.length > 200) {
      errors.push('工具描述不能超过 200 个字符');
    }
    
    return errors;
  }

  // 获取用户的自定义工具
  async getUserTools(userId) {
    try {
      const { data, error } = await this.supabase
        .from('custom_tools')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('获取用户工具失败:', error);
        throw new Error('获取工具列表失败');
      }
      
      return data || [];
    } catch (error) {
      console.error('获取用户工具错误:', error);
      throw error;
    }
  }

  // 添加新工具
  async addTool(toolData) {
    try {
      // 验证数据
      const validationErrors = this.validateToolData(toolData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }
      
      // 获取当前用户
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('请先登录');
      }
      
      // 准备插入数据
      const insertData = {
        user_id: user.id,
        tool_name: toolData.name.trim(),
        tool_url: toolData.url.trim(),
        tool_desc: toolData.description ? toolData.description.trim() : '',
        category: toolData.category,
        is_free: toolData.isFree || false,
        is_chinese: toolData.isChinese || false
      };
      
      // 插入数据库
      const { data, error } = await this.supabase
        .from('custom_tools')
        .insert([insertData])
        .select()
        .single();
      
      if (error) {
        console.error('添加工具失败:', error);
        throw new Error('添加工具失败，请重试');
      }
      
      return data;
    } catch (error) {
      console.error('添加工具错误:', error);
      throw error;
    }
  }

  // 更新工具
  async updateTool(toolId, toolData) {
    try {
      // 验证数据
      const validationErrors = this.validateToolData(toolData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }
      
      // 准备更新数据
      const updateData = {
        tool_name: toolData.name.trim(),
        tool_url: toolData.url.trim(),
        tool_desc: toolData.description ? toolData.description.trim() : '',
        category: toolData.category,
        is_free: toolData.isFree || false,
        is_chinese: toolData.isChinese || false,
        updated_at: new Date().toISOString()
      };
      
      // 更新数据库
      const { data, error } = await this.supabase
        .from('custom_tools')
        .update(updateData)
        .eq('id', toolId)
        .select()
        .single();
      
      if (error) {
        console.error('更新工具失败:', error);
        throw new Error('更新工具失败，请重试');
      }
      
      return data;
    } catch (error) {
      console.error('更新工具错误:', error);
      throw error;
    }
  }

  // 删除工具
  async deleteTool(toolId) {
    try {
      const { error } = await this.supabase
        .from('custom_tools')
        .delete()
        .eq('id', toolId);
      
      if (error) {
        console.error('删除工具失败:', error);
        throw new Error('删除工具失败，请重试');
      }
      
      return true;
    } catch (error) {
      console.error('删除工具错误:', error);
      throw error;
    }
  }

  // 搜索工具（包含系统工具和自定义工具）
  searchTools(searchTerm, customTools) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return {
        customTools: customTools,
        systemTools: [], // 系统工具由前端DOM搜索处理
        totalCount: customTools.length
      };
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    // 搜索自定义工具
    const filteredCustomTools = customTools.filter(tool => {
      const nameMatch = tool.tool_name.toLowerCase().includes(term);
      const descMatch = tool.tool_desc && tool.tool_desc.toLowerCase().includes(term);
      const categoryMatch = tool.category.toLowerCase().includes(term);
      
      return nameMatch || descMatch || categoryMatch;
    });
    
    return {
      customTools: filteredCustomTools,
      systemTools: [], // 系统工具由前端DOM搜索处理
      totalCount: filteredCustomTools.length,
      searchTerm: term
    };
  }

  // 获取工具的搜索关键词（用于高亮显示）
  getToolSearchKeywords(tool, searchTerm) {
    if (!searchTerm) return [];
    
    const keywords = [];
    const term = searchTerm.toLowerCase();
    
    if (tool.tool_name.toLowerCase().includes(term)) {
      keywords.push({ type: 'name', text: tool.tool_name });
    }
    
    if (tool.tool_desc && tool.tool_desc.toLowerCase().includes(term)) {
      keywords.push({ type: 'description', text: tool.tool_desc });
    }
    
    if (tool.category.toLowerCase().includes(term)) {
      keywords.push({ type: 'category', text: tool.category });
    }
    
    return keywords;
  }
}

// 导出工具管理器
window.ToolsManager = ToolsManager;

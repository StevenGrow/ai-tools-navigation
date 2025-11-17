/**
 * 多设备测试脚本
 * 测试在桌面浏览器、平板设备和手机设备上的功能和显示效果
 * 
 * 使用方法：
 * 1. 在不同设备上打开浏览器
 * 2. 运行此脚本
 * 3. 调用 runMultiDeviceTests() 开始测试
 */

class MultiDeviceTester {
  constructor() {
    this.testResults = {
      deviceInfo: {},
      desktopTests: {},
      tabletTests: {},
      mobileTests: {},
      crossDeviceTests: {},
      overall: {}
    };
    this.deviceType = this.detectDeviceType();
    this.startTime = null;
  }

  /**
   * 运行所有多设备测试
   */
  async runAllTests() {
    console.log('📱 开始多设备测试...');
    console.log(`🔍 检测到设备类型: ${this.deviceType}`);
    
    this.startTime = performance.now();
    
    try {
      // 1. 收集设备信息
      this.collectDeviceInfo();
      
      // 2. 根据设备类型运行相应测试
      await this.runDeviceSpecificTests();
      
      // 3. 运行跨设备通用测试
      await this.runCrossDeviceTests();
      
      // 4. 生成测试报告
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ 多设备测试过程中发生错误:', error);
      this.testResults.overall.error = error.message;
    } finally {
      this.displayResults();
    }
  }

  /**
   * 检测设备类型
   */
  detectDeviceType() {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    
    // 检查是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // 检查是否为平板
    const isTablet = /(iPad|Android(?!.*Mobile))/i.test(userAgent) || 
                    (isMobile && width >= 768);
    
    if (width >= 1025) {
      return 'desktop';
    } else if (width >= 768 || isTablet) {
      return 'tablet';
    } else {
      return 'mobile';
    }
  }

  /**
   * 收集设备信息
   */
  collectDeviceInfo() {
    console.log('📊 收集设备信息...');
    
    this.testResults.deviceInfo = {
      deviceType: this.deviceType,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      touchSupport: 'ontouchstart' in window,
      orientation: screen.orientation ? screen.orientation.type : 'unknown',
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    };
    
    console.log('✅ 设备信息收集完成');
    console.log(`   屏幕: ${this.testResults.deviceInfo.screenWidth}×${this.testResults.deviceInfo.screenHeight}`);
    console.log(`   视口: ${this.testResults.deviceInfo.viewportWidth}×${this.testResults.deviceInfo.viewportHeight}`);
    console.log(`   像素比: ${this.testResults.deviceInfo.devicePixelRatio}`);
    console.log(`   触摸支持: ${this.testResults.deviceInfo.touchSupport ? '是' : '否'}`);
  }

  /**
   * 运行设备特定测试
   */
  async runDeviceSpecificTests() {
    console.log(`\n🎯 运行 ${this.deviceType} 设备特定测试...`);
    
    switch (this.deviceType) {
      case 'desktop':
        await this.runDesktopTests();
        break;
      case 'tablet':
        await this.runTabletTests();
        break;
      case 'mobile':
        await this.runMobileTests();
        break;
    }
  }

  /**
   * 桌面端测试
   */
  async runDesktopTests() {
    console.log('🖥️ 执行桌面端测试...');
    
    const tests = {
      layoutStructure: this.testDesktopLayout(),
      navigationDisplay: this.testDesktopNavigation(),
      toolGridLayout: this.testDesktopToolGrid(),
      modalBehavior: this.testDesktopModals(),
      keyboardShortcuts: await this.testKeyboardShortcuts(),
      mouseInteraction: await this.testMouseInteraction(),
      windowResizing: await this.testWindowResizing()
    };
    
    this.testResults.desktopTests = tests;
    this.logTestResults('桌面端', tests);
  }

  /**
   * 平板端测试
   */
  async runTabletTests() {
    console.log('📱 执行平板端测试...');
    
    const tests = {
      layoutAdaptation: this.testTabletLayout(),
      touchInteraction: await this.testTouchInteraction(),
      orientationChange: await this.testOrientationChange(),
      gestureSupport: await this.testGestureSupport(),
      virtualKeyboard: await this.testVirtualKeyboard(),
      scrollBehavior: this.testScrollBehavior()
    };
    
    this.testResults.tabletTests = tests;
    this.logTestResults('平板端', tests);
  }

  /**
   * 移动端测试
   */
  async runMobileTests() {
    console.log('📱 执行移动端测试...');
    
    const tests = {
      mobileLayout: this.testMobileLayout(),
      touchFriendliness: this.testTouchFriendliness(),
      thumbReachability: this.testThumbReachability(),
      textReadability: this.testTextReadability(),
      loadingPerformance: await this.testMobilePerformance(),
      batteryImpact: this.testBatteryImpact(),
      networkAdaptation: await this.testNetworkAdaptation()
    };
    
    this.testResults.mobileTests = tests;
    this.logTestResults('移动端', tests);
  }

  /**
   * 桌面端布局测试
   */
  testDesktopLayout() {
    const issues = [];
    let passed = true;
    
    // 检查分类并排显示
    const categories = document.querySelectorAll('.category');
    const categoriesPerRow = this.getCategoriesPerRow();
    
    if (categoriesPerRow < 2) {
      issues.push('分类应该并排显示（至少2列）');
      passed = false;
    }
    
    // 检查工具卡片布局
    const toolGrids = document.querySelectorAll('.tools-grid');
    toolGrids.forEach((grid, index) => {
      const computedStyle = window.getComputedStyle(grid);
      const columns = computedStyle.gridTemplateColumns.split(' ').length;
      
      if (columns < 2) {
        issues.push(`分类 ${index + 1} 的工具应该多列显示`);
        passed = false;
      }
    });
    
    // 检查导航栏布局
    const nav = document.querySelector('.category-nav');
    if (nav) {
      const navItems = nav.querySelectorAll('.nav-item');
      const navHeight = nav.offsetHeight;
      const expectedSingleRowHeight = 60; // 预期单行高度
      
      if (navHeight > expectedSingleRowHeight * 1.5) {
        issues.push('导航项应该在桌面端单行显示');
        passed = false;
      }
    }
    
    return { passed, issues, details: { categoriesPerRow } };
  }

  /**
   * 桌面端导航测试
   */
  testDesktopNavigation() {
    const issues = [];
    let passed = true;
    
    // 检查用户操作区域位置
    const userInfo = document.getElementById('userInfo');
    const loginBtn = document.getElementById('loginBtn');
    
    if (userInfo || loginBtn) {
      const element = userInfo || loginBtn;
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // 用户操作区域应该在右上角
      if (rect.right < viewportWidth * 0.8) {
        issues.push('用户操作区域应该位于右上角');
        passed = false;
      }
    }
    
    // 检查搜索框位置
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      const rect = searchInput.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const centerX = rect.left + rect.width / 2;
      
      // 搜索框应该居中
      if (Math.abs(centerX - viewportWidth / 2) > viewportWidth * 0.1) {
        issues.push('搜索框应该居中显示');
        passed = false;
      }
    }
    
    return { passed, issues };
  }

  /**
   * 桌面端工具网格测试
   */
  testDesktopToolGrid() {
    const issues = [];
    let passed = true;
    
    const toolGrids = document.querySelectorAll('.tools-grid');
    
    toolGrids.forEach((grid, index) => {
      const tools = grid.querySelectorAll('.tool-card:not(.hidden)');
      const computedStyle = window.getComputedStyle(grid);
      const gap = parseInt(computedStyle.gap) || 0;
      
      // 检查工具卡片间距
      if (gap < 16) {
        issues.push(`分类 ${index + 1} 的工具卡片间距过小`);
        passed = false;
      }
      
      // 检查工具卡片尺寸
      tools.forEach((tool, toolIndex) => {
        const rect = tool.getBoundingClientRect();
        if (rect.width < 200) {
          issues.push(`分类 ${index + 1} 工具 ${toolIndex + 1} 宽度过小`);
          passed = false;
        }
      });
    });
    
    return { passed, issues };
  }

  /**
   * 桌面端模态框测试
   */
  testDesktopModals() {
    const issues = [];
    let passed = true;
    
    const modals = ['loginModal', 'registerModal', 'addToolModal', 'editToolModal'];
    
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          const rect = modalContent.getBoundingClientRect();
          
          // 检查模态框尺寸
          if (rect.width > window.innerWidth * 0.9) {
            issues.push(`${modalId} 在桌面端过宽`);
            passed = false;
          }
          
          if (rect.height > window.innerHeight * 0.9) {
            issues.push(`${modalId} 在桌面端过高`);
            passed = false;
          }
        }
      }
    });
    
    return { passed, issues };
  }

  /**
   * 键盘快捷键测试
   */
  async testKeyboardShortcuts() {
    const issues = [];
    let passed = true;
    
    try {
      // 测试搜索框快捷键
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        // 模拟 Ctrl+K 或 Cmd+K
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true
        });
        
        document.dispatchEvent(event);
        await this.delay(100);
        
        // 检查搜索框是否获得焦点
        if (document.activeElement !== searchInput) {
          issues.push('搜索快捷键 Ctrl+K 未正常工作');
          passed = false;
        }
      }
      
      // 测试 Escape 键
      if (searchInput && searchInput.value) {
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true
        });
        
        searchInput.dispatchEvent(escEvent);
        await this.delay(100);
        
        if (searchInput.value !== '') {
          issues.push('Escape 键清空搜索未正常工作');
          passed = false;
        }
      }
      
    } catch (error) {
      issues.push(`键盘快捷键测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 鼠标交互测试
   */
  async testMouseInteraction() {
    const issues = [];
    let passed = true;
    
    try {
      // 测试工具卡片悬停效果
      const toolCards = document.querySelectorAll('.tool-card');
      if (toolCards.length > 0) {
        const firstCard = toolCards[0];
        
        // 模拟鼠标悬停
        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        firstCard.dispatchEvent(mouseEnterEvent);
        
        await this.delay(100);
        
        // 检查悬停效果
        const computedStyle = window.getComputedStyle(firstCard);
        const transform = computedStyle.transform;
        
        if (transform === 'none') {
          issues.push('工具卡片缺少悬停效果');
          passed = false;
        }
      }
      
      // 测试按钮点击反馈
      const buttons = document.querySelectorAll('button, .btn');
      if (buttons.length > 0) {
        const firstButton = buttons[0];
        
        // 模拟鼠标按下
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
        firstButton.dispatchEvent(mouseDownEvent);
        
        await this.delay(50);
        
        // 检查按下状态
        const computedStyle = window.getComputedStyle(firstButton);
        // 这里可以检查按钮的 active 状态样式
      }
      
    } catch (error) {
      issues.push(`鼠标交互测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 窗口调整测试
   */
  async testWindowResizing() {
    const issues = [];
    let passed = true;
    
    try {
      const originalWidth = window.innerWidth;
      const originalHeight = window.innerHeight;
      
      // 模拟窗口调整（注意：在某些浏览器中可能受限）
      if (window.resizeTo) {
        // 测试不同尺寸
        const testSizes = [
          { width: 1200, height: 800 },
          { width: 1024, height: 768 },
          { width: 800, height: 600 }
        ];
        
        for (const size of testSizes) {
          try {
            window.resizeTo(size.width, size.height);
            await this.delay(500);
            
            // 检查布局是否正确适配
            const categoriesPerRow = this.getCategoriesPerRow();
            if (size.width >= 1025 && categoriesPerRow < 2) {
              issues.push(`窗口 ${size.width}×${size.height} 时布局未正确适配`);
              passed = false;
            }
          } catch (resizeError) {
            // 某些浏览器不允许调整窗口大小
            console.warn('无法调整窗口大小，跳过此测试');
          }
        }
        
        // 恢复原始尺寸
        window.resizeTo(originalWidth, originalHeight);
      } else {
        console.warn('浏览器不支持窗口调整，跳过此测试');
      }
      
    } catch (error) {
      issues.push(`窗口调整测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 平板端布局测试
   */
  testTabletLayout() {
    const issues = [];
    let passed = true;
    
    // 检查分类垂直堆叠
    const categoriesPerRow = this.getCategoriesPerRow();
    if (categoriesPerRow > 1) {
      issues.push('平板端分类应该垂直堆叠显示');
      passed = false;
    }
    
    // 检查工具卡片仍然多列显示
    const toolGrids = document.querySelectorAll('.tools-grid');
    toolGrids.forEach((grid, index) => {
      const computedStyle = window.getComputedStyle(grid);
      const columns = computedStyle.gridTemplateColumns.split(' ').length;
      
      if (columns < 2) {
        issues.push(`分类 ${index + 1} 的工具在平板端应该保持多列显示`);
        passed = false;
      }
    });
    
    return { passed, issues };
  }

  /**
   * 触摸交互测试
   */
  async testTouchInteraction() {
    const issues = [];
    let passed = true;
    
    if (!this.testResults.deviceInfo.touchSupport) {
      return { passed: true, issues: ['设备不支持触摸，跳过测试'] };
    }
    
    try {
      // 测试工具卡片触摸
      const toolCards = document.querySelectorAll('.tool-card');
      if (toolCards.length > 0) {
        const firstCard = toolCards[0];
        
        // 模拟触摸事件
        const touchStartEvent = new TouchEvent('touchstart', {
          bubbles: true,
          touches: [new Touch({
            identifier: 1,
            target: firstCard,
            clientX: 100,
            clientY: 100
          })]
        });
        
        firstCard.dispatchEvent(touchStartEvent);
        await this.delay(100);
        
        const touchEndEvent = new TouchEvent('touchend', {
          bubbles: true,
          changedTouches: [new Touch({
            identifier: 1,
            target: firstCard,
            clientX: 100,
            clientY: 100
          })]
        });
        
        firstCard.dispatchEvent(touchEndEvent);
      }
      
      // 测试按钮触摸友好性
      const buttons = document.querySelectorAll('button, .btn');
      buttons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const minTouchSize = 44; // Apple HIG 推荐的最小触摸尺寸
        
        if (rect.width < minTouchSize || rect.height < minTouchSize) {
          issues.push(`按钮 ${index + 1} 尺寸过小，不适合触摸操作`);
          passed = false;
        }
      });
      
    } catch (error) {
      issues.push(`触摸交互测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 屏幕方向变化测试
   */
  async testOrientationChange() {
    const issues = [];
    let passed = true;
    
    try {
      if (screen.orientation) {
        const originalOrientation = screen.orientation.type;
        
        // 监听方向变化
        const orientationChangePromise = new Promise((resolve) => {
          const handler = () => {
            screen.orientation.removeEventListener('change', handler);
            resolve();
          };
          screen.orientation.addEventListener('change', handler);
          
          // 5秒后超时
          setTimeout(() => {
            screen.orientation.removeEventListener('change', handler);
            resolve();
          }, 5000);
        });
        
        // 尝试旋转屏幕（注意：可能需要用户手动操作）
        console.log('请旋转设备以测试屏幕方向变化...');
        
        await orientationChangePromise;
        
        // 检查布局是否正确适配
        await this.delay(500);
        
        const currentOrientation = screen.orientation.type;
        if (currentOrientation !== originalOrientation) {
          // 检查布局适配
          const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
          if (hasHorizontalScroll) {
            issues.push('方向变化后出现水平滚动');
            passed = false;
          }
        }
      } else {
        console.warn('设备不支持屏幕方向 API');
      }
      
    } catch (error) {
      issues.push(`屏幕方向测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 手势支持测试
   */
  async testGestureSupport() {
    const issues = [];
    let passed = true;
    
    if (!this.testResults.deviceInfo.touchSupport) {
      return { passed: true, issues: ['设备不支持触摸，跳过手势测试'] };
    }
    
    try {
      // 测试滑动手势
      const scrollContainer = document.querySelector('.main-content') || document.body;
      
      // 模拟滑动手势
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        touches: [new Touch({
          identifier: 1,
          target: scrollContainer,
          clientX: 200,
          clientY: 300
        })]
      });
      
      scrollContainer.dispatchEvent(touchStart);
      
      await this.delay(50);
      
      const touchMove = new TouchEvent('touchmove', {
        bubbles: true,
        touches: [new Touch({
          identifier: 1,
          target: scrollContainer,
          clientX: 200,
          clientY: 200
        })]
      });
      
      scrollContainer.dispatchEvent(touchMove);
      
      await this.delay(50);
      
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        changedTouches: [new Touch({
          identifier: 1,
          target: scrollContainer,
          clientX: 200,
          clientY: 200
        })]
      });
      
      scrollContainer.dispatchEvent(touchEnd);
      
    } catch (error) {
      issues.push(`手势支持测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 虚拟键盘测试
   */
  async testVirtualKeyboard() {
    const issues = [];
    let passed = true;
    
    try {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
      
      if (inputs.length > 0) {
        const firstInput = inputs[0];
        
        // 模拟聚焦输入框
        firstInput.focus();
        await this.delay(500);
        
        // 检查视口是否调整
        const viewportHeight = window.innerHeight;
        const originalViewportHeight = this.testResults.deviceInfo.viewportHeight;
        
        if (Math.abs(viewportHeight - originalViewportHeight) < 50) {
          // 在某些设备上，虚拟键盘可能不会改变视口高度
          console.warn('虚拟键盘可能未正确检测');
        }
        
        // 检查输入框是否仍然可见
        const rect = firstInput.getBoundingClientRect();
        if (rect.bottom > viewportHeight) {
          issues.push('虚拟键盘弹出时输入框被遮挡');
          passed = false;
        }
        
        // 失焦
        firstInput.blur();
      }
      
    } catch (error) {
      issues.push(`虚拟键盘测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 移动端布局测试
   */
  testMobileLayout() {
    const issues = [];
    let passed = true;
    
    // 检查分类垂直堆叠
    const categoriesPerRow = this.getCategoriesPerRow();
    if (categoriesPerRow > 1) {
      issues.push('移动端分类应该垂直堆叠显示');
      passed = false;
    }
    
    // 检查工具卡片在小屏幕上单列显示
    if (window.innerWidth <= 480) {
      const toolGrids = document.querySelectorAll('.tools-grid');
      toolGrids.forEach((grid, index) => {
        const computedStyle = window.getComputedStyle(grid);
        const columns = computedStyle.gridTemplateColumns.split(' ').length;
        
        if (columns > 1) {
          issues.push(`分类 ${index + 1} 在小屏幕上应该单列显示工具`);
          passed = false;
        }
      });
    }
    
    // 检查水平滚动
    const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
    if (hasHorizontalScroll) {
      issues.push('页面出现水平滚动');
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 触摸友好性测试
   */
  testTouchFriendliness() {
    const issues = [];
    let passed = true;
    
    const minTouchSize = 44; // Apple HIG 推荐
    
    // 检查所有可交互元素
    const interactiveElements = document.querySelectorAll('button, .btn, a, input, select, textarea, [onclick], [role="button"]');
    
    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      
      if (rect.width < minTouchSize || rect.height < minTouchSize) {
        const tagName = element.tagName.toLowerCase();
        const className = element.className || '';
        issues.push(`元素 ${tagName}.${className} (${index + 1}) 尺寸过小: ${Math.round(rect.width)}×${Math.round(rect.height)}px`);
        passed = false;
      }
    });
    
    // 检查元素间距
    const buttons = document.querySelectorAll('button, .btn');
    for (let i = 0; i < buttons.length - 1; i++) {
      const current = buttons[i].getBoundingClientRect();
      const next = buttons[i + 1].getBoundingClientRect();
      
      const distance = Math.min(
        Math.abs(current.right - next.left),
        Math.abs(current.bottom - next.top)
      );
      
      if (distance < 8) {
        issues.push(`按钮 ${i + 1} 和 ${i + 2} 间距过小: ${Math.round(distance)}px`);
        passed = false;
      }
    }
    
    return { passed, issues };
  }

  /**
   * 拇指可达性测试
   */
  testThumbReachability() {
    const issues = [];
    let passed = true;
    
    const screenHeight = window.innerHeight;
    const thumbReachZone = screenHeight * 0.75; // 拇指可达区域约为屏幕高度的75%
    
    // 检查重要操作按钮的位置
    const importantButtons = [
      document.getElementById('addToolBtn'),
      document.querySelector('.search-btn'),
      document.querySelector('.back-to-top')
    ].filter(Boolean);
    
    importantButtons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      
      if (rect.top > thumbReachZone) {
        issues.push(`重要按钮 ${index + 1} 位置过高，拇指难以触及`);
        passed = false;
      }
    });
    
    // 检查导航项是否在可达区域
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      
      if (rect.bottom > thumbReachZone) {
        issues.push(`导航项 ${index + 1} 位置过高`);
        passed = false;
      }
    });
    
    return { passed, issues };
  }

  /**
   * 文本可读性测试
   */
  testTextReadability() {
    const issues = [];
    let passed = true;
    
    const minFontSize = 16; // 移动端推荐最小字体大小
    
    // 检查文本元素字体大小
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, .tool-name, .tool-desc');
    
    textElements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseInt(computedStyle.fontSize);
      
      if (fontSize < minFontSize) {
        const text = element.textContent.substring(0, 20) + '...';
        issues.push(`文本元素 "${text}" 字体过小: ${fontSize}px`);
        passed = false;
      }
    });
    
    // 检查行高
    textElements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const fontSize = parseInt(computedStyle.fontSize);
      
      if (lineHeight / fontSize < 1.2) {
        issues.push(`文本元素 ${index + 1} 行高过小`);
        passed = false;
      }
    });
    
    return { passed, issues };
  }

  /**
   * 移动端性能测试
   */
  async testMobilePerformance() {
    const issues = [];
    let passed = true;
    
    try {
      // 测试页面加载性能
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        
        // 移动端加载时间应该更快
        if (loadTime > 2000) {
          issues.push(`页面加载时间过长: ${Math.round(loadTime)}ms`);
          passed = false;
        }
      }
      
      // 测试滚动性能
      const scrollContainer = document.querySelector('.main-content') || document.body;
      const startTime = performance.now();
      
      // 模拟滚动
      scrollContainer.scrollTop = 100;
      await this.delay(16); // 一帧的时间
      
      const scrollTime = performance.now() - startTime;
      if (scrollTime > 16) {
        issues.push(`滚动性能不佳: ${Math.round(scrollTime)}ms`);
        passed = false;
      }
      
      // 检查内存使用（如果支持）
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        if (memoryUsage > 50) {
          issues.push(`内存使用过高: ${Math.round(memoryUsage)}MB`);
          passed = false;
        }
      }
      
    } catch (error) {
      issues.push(`性能测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 电池影响测试
   */
  testBatteryImpact() {
    const issues = [];
    let passed = true;
    
    try {
      // 检查动画和过渡效果
      const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"]');
      
      if (animatedElements.length > 10) {
        issues.push('过多的动画效果可能影响电池续航');
        passed = false;
      }
      
      // 检查定时器使用
      const originalSetInterval = window.setInterval;
      let intervalCount = 0;
      
      window.setInterval = function(...args) {
        intervalCount++;
        return originalSetInterval.apply(this, args);
      };
      
      // 恢复原始函数
      setTimeout(() => {
        window.setInterval = originalSetInterval;
      }, 100);
      
      if (intervalCount > 5) {
        issues.push('过多的定时器可能影响电池续航');
        passed = false;
      }
      
    } catch (error) {
      issues.push(`电池影响测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 网络适应性测试
   */
  async testNetworkAdaptation() {
    const issues = [];
    let passed = true;
    
    try {
      // 检查网络状态
      if (navigator.connection) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          // 在慢速网络下检查是否有优化
          const images = document.querySelectorAll('img');
          const largeImages = Array.from(images).filter(img => {
            return img.naturalWidth > 500 || img.naturalHeight > 500;
          });
          
          if (largeImages.length > 0) {
            issues.push('在慢速网络下应该优化图片大小');
            passed = false;
          }
        }
        
        // 检查离线支持
        if (!navigator.onLine) {
          const hasServiceWorker = 'serviceWorker' in navigator;
          if (!hasServiceWorker) {
            issues.push('离线状态下缺少 Service Worker 支持');
            passed = false;
          }
        }
      }
      
    } catch (error) {
      issues.push(`网络适应性测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 滚动行为测试
   */
  testScrollBehavior() {
    const issues = [];
    let passed = true;
    
    try {
      // 检查滚动容器
      const scrollContainers = document.querySelectorAll('[style*="overflow"], .scrollable');
      
      scrollContainers.forEach((container, index) => {
        const computedStyle = window.getComputedStyle(container);
        const overflowY = computedStyle.overflowY;
        
        // 检查是否有平滑滚动
        if (overflowY === 'scroll' || overflowY === 'auto') {
          const scrollBehavior = computedStyle.scrollBehavior;
          if (scrollBehavior !== 'smooth') {
            issues.push(`滚动容器 ${index + 1} 缺少平滑滚动`);
            passed = false;
          }
        }
      });
      
      // 检查页面滚动
      const bodyStyle = window.getComputedStyle(document.body);
      const htmlStyle = window.getComputedStyle(document.documentElement);
      
      if (bodyStyle.scrollBehavior !== 'smooth' && htmlStyle.scrollBehavior !== 'smooth') {
        issues.push('页面缺少平滑滚动设置');
        passed = false;
      }
      
    } catch (error) {
      issues.push(`滚动行为测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 跨设备通用测试
   */
  async runCrossDeviceTests() {
    console.log('\n🌐 运行跨设备通用测试...');
    
    const tests = {
      accessibility: this.testAccessibility(),
      colorContrast: this.testColorContrast(),
      focusManagement: this.testFocusManagement(),
      errorHandling: await this.testErrorHandling(),
      dataConsistency: await this.testDataConsistency(),
      securityFeatures: this.testSecurityFeatures()
    };
    
    this.testResults.crossDeviceTests = tests;
    this.logTestResults('跨设备通用', tests);
  }

  /**
   * 可访问性测试
   */
  testAccessibility() {
    const issues = [];
    let passed = true;
    
    // 检查 alt 属性
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt) {
        issues.push(`图片 ${index + 1} 缺少 alt 属性`);
        passed = false;
      }
    });
    
    // 检查表单标签
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      
      if (!label && !ariaLabel && !input.placeholder) {
        issues.push(`输入框 ${index + 1} 缺少标签或说明`);
        passed = false;
      }
    });
    
    // 检查标题层级
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      if (currentLevel > previousLevel + 1) {
        issues.push(`标题 ${index + 1} 层级跳跃过大`);
        passed = false;
      }
      
      previousLevel = currentLevel;
    });
    
    return { passed, issues };
  }

  /**
   * 颜色对比度测试
   */
  testColorContrast() {
    const issues = [];
    let passed = true;
    
    try {
      // 检查文本颜色对比度
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, .btn');
      
      textElements.forEach((element, index) => {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        // 简单的对比度检查（实际应该使用更复杂的算法）
        if (color === backgroundColor) {
          issues.push(`元素 ${index + 1} 文本颜色与背景颜色相同`);
          passed = false;
        }
        
        // 检查透明背景
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          const parentBg = this.getEffectiveBackgroundColor(element);
          if (color === parentBg) {
            issues.push(`元素 ${index + 1} 文本颜色与有效背景颜色对比度不足`);
            passed = false;
          }
        }
      });
      
    } catch (error) {
      issues.push(`颜色对比度测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 焦点管理测试
   */
  testFocusManagement() {
    const issues = [];
    let passed = true;
    
    try {
      // 检查可聚焦元素
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
      
      focusableElements.forEach((element, index) => {
        // 检查是否有焦点样式
        element.focus();
        const computedStyle = window.getComputedStyle(element);
        const outline = computedStyle.outline;
        const boxShadow = computedStyle.boxShadow;
        
        if (outline === 'none' && boxShadow === 'none') {
          issues.push(`元素 ${index + 1} 缺少焦点指示器`);
          passed = false;
        }
        
        element.blur();
      });
      
      // 检查 tabindex 使用
      const customTabIndex = document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])');
      if (customTabIndex.length > 0) {
        issues.push('使用了自定义 tabindex，可能影响键盘导航');
        passed = false;
      }
      
    } catch (error) {
      issues.push(`焦点管理测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 错误处理测试
   */
  async testErrorHandling() {
    const issues = [];
    let passed = true;
    
    try {
      // 测试网络错误处理
      if (window.fetch) {
        try {
          await fetch('https://nonexistent-domain-12345.com');
        } catch (error) {
          // 应该有错误处理
          const errorMessages = document.querySelectorAll('.error-message, .notification');
          if (errorMessages.length === 0) {
            issues.push('网络错误缺少用户提示');
            passed = false;
          }
        }
      }
      
      // 测试表单验证错误
      const forms = document.querySelectorAll('form');
      forms.forEach((form, index) => {
        const requiredInputs = form.querySelectorAll('[required]');
        
        if (requiredInputs.length > 0) {
          const errorContainers = form.querySelectorAll('.error-message, .field-error');
          if (errorContainers.length === 0) {
            issues.push(`表单 ${index + 1} 缺少错误提示容器`);
            passed = false;
          }
        }
      });
      
    } catch (error) {
      issues.push(`错误处理测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 数据一致性测试
   */
  async testDataConsistency() {
    const issues = [];
    let passed = true;
    
    try {
      // 检查本地存储数据
      const localStorageKeys = Object.keys(localStorage);
      const sessionStorageKeys = Object.keys(sessionStorage);
      
      // 检查是否有过期数据
      localStorageKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          JSON.parse(value); // 检查是否为有效 JSON
        } catch (error) {
          issues.push(`本地存储项 "${key}" 数据格式无效`);
          passed = false;
        }
      });
      
      // 检查会话数据
      sessionStorageKeys.forEach(key => {
        try {
          const value = sessionStorage.getItem(key);
          JSON.parse(value);
        } catch (error) {
          issues.push(`会话存储项 "${key}" 数据格式无效`);
          passed = false;
        }
      });
      
      // 检查 Cookie
      if (document.cookie) {
        const cookies = document.cookie.split(';');
        cookies.forEach((cookie, index) => {
          const [name, value] = cookie.split('=');
          if (!name || !value) {
            issues.push(`Cookie ${index + 1} 格式无效`);
            passed = false;
          }
        });
      }
      
    } catch (error) {
      issues.push(`数据一致性测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 安全特性测试
   */
  testSecurityFeatures() {
    const issues = [];
    let passed = true;
    
    try {
      // 检查 HTTPS
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        issues.push('网站未使用 HTTPS 协议');
        passed = false;
      }
      
      // 检查 CSP 头
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!metaCSP) {
        issues.push('缺少 Content Security Policy');
        passed = false;
      }
      
      // 检查外部链接
      const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + location.hostname + '"])');
      externalLinks.forEach((link, index) => {
        if (!link.rel || !link.rel.includes('noopener')) {
          issues.push(`外部链接 ${index + 1} 缺少 rel="noopener"`);
          passed = false;
        }
      });
      
      // 检查表单安全
      const forms = document.querySelectorAll('form');
      forms.forEach((form, index) => {
        if (form.method && form.method.toLowerCase() === 'get') {
          const passwordInputs = form.querySelectorAll('input[type="password"]');
          if (passwordInputs.length > 0) {
            issues.push(`表单 ${index + 1} 使用 GET 方法传输密码`);
            passed = false;
          }
        }
      });
      
    } catch (error) {
      issues.push(`安全特性测试失败: ${error.message}`);
      passed = false;
    }
    
    return { passed, issues };
  }

  /**
   * 辅助方法：获取分类每行数量
   */
  getCategoriesPerRow() {
    const categories = document.querySelectorAll('.category');
    if (categories.length < 2) return 1;
    
    const firstRect = categories[0].getBoundingClientRect();
    const secondRect = categories[1].getBoundingClientRect();
    
    // 如果第二个分类的顶部位置与第一个相近，说明在同一行
    return Math.abs(firstRect.top - secondRect.top) < 50 ? 2 : 1;
  }

  /**
   * 辅助方法：获取有效背景颜色
   */
  getEffectiveBackgroundColor(element) {
    let current = element;
    
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const bg = style.backgroundColor;
      
      if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }
      
      current = current.parentElement;
    }
    
    return 'rgb(255, 255, 255)'; // 默认白色背景
  }

  /**
   * 记录测试结果
   */
  logTestResults(category, tests) {
    console.log(`\n📊 ${category}测试结果:`);
    
    Object.keys(tests).forEach(testName => {
      const result = tests[testName];
      console.log(`  ${result.passed ? '✅' : '❌'} ${testName}: ${result.passed}`);
      
      if (result.issues && result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`    ⚠️ ${issue}`);
        });
      }
    });
  }

  /**
   * 生成测试报告
   */
  generateTestReport() {
    console.log('\n📋 生成多设备测试报告...');
    
    const allTests = {
      ...this.testResults.desktopTests,
      ...this.testResults.tabletTests,
      ...this.testResults.mobileTests,
      ...this.testResults.crossDeviceTests
    };
    
    let totalTests = 0;
    let passedTests = 0;
    let totalIssues = 0;
    
    Object.values(allTests).forEach(test => {
      if (test && typeof test === 'object') {
        totalTests++;
        if (test.passed) passedTests++;
        if (test.issues) totalIssues += test.issues.length;
      }
    });
    
    const percentage = totalTests > 0 ? Math.round(passedTests / totalTests * 100) : 0;
    
    this.testResults.overall = {
      deviceType: this.deviceType,
      totalTests,
      passedTests,
      percentage,
      totalIssues,
      duration: performance.now() - this.startTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 显示最终结果
   */
  displayResults() {
    const duration = performance.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📱 多设备测试完整报告');
    console.log('='.repeat(60));
    
    console.log(`📱 设备类型: ${this.deviceType}`);
    console.log(`📏 屏幕尺寸: ${this.testResults.deviceInfo.screenWidth}×${this.testResults.deviceInfo.screenHeight}`);
    console.log(`🖼️ 视口尺寸: ${this.testResults.deviceInfo.viewportWidth}×${this.testResults.deviceInfo.viewportHeight}`);
    console.log(`📱 像素比: ${this.testResults.deviceInfo.devicePixelRatio}`);
    console.log(`👆 触摸支持: ${this.testResults.deviceInfo.touchSupport ? '是' : '否'}`);
    console.log(`⏱️ 测试耗时: ${Math.round(duration)}ms`);
    
    const overall = this.testResults.overall;
    console.log(`\n📊 测试结果: ${overall.passedTests}/${overall.totalTests} (${overall.percentage}%)`);
    console.log(`⚠️ 发现问题: ${overall.totalIssues} 个`);
    
    if (overall.percentage >= 90) {
      console.log('\n🎉 优秀！设备兼容性测试通过');
    } else if (overall.percentage >= 80) {
      console.log('\n✅ 良好！大部分功能在此设备上正常工作');
    } else if (overall.percentage >= 70) {
      console.log('\n⚠️ 一般！存在一些兼容性问题需要优化');
    } else {
      console.log('\n❌ 需要改进！存在较多兼容性问题');
    }
    
    // 显示设备特定建议
    this.displayDeviceSpecificRecommendations();
    
    return this.testResults;
  }

  /**
   * 显示设备特定建议
   */
  displayDeviceSpecificRecommendations() {
    console.log('\n💡 设备优化建议:');
    
    switch (this.deviceType) {
      case 'desktop':
        console.log('  🖥️ 桌面端优化:');
        console.log('    - 充分利用大屏幕空间，使用多列布局');
        console.log('    - 添加键盘快捷键支持');
        console.log('    - 优化鼠标悬停效果');
        console.log('    - 考虑添加右键菜单');
        break;
        
      case 'tablet':
        console.log('  📱 平板端优化:');
        console.log('    - 优化触摸交互，增大可点击区域');
        console.log('    - 支持屏幕方向变化');
        console.log('    - 适配虚拟键盘');
        console.log('    - 优化手势操作');
        break;
        
      case 'mobile':
        console.log('  📱 移动端优化:');
        console.log('    - 确保所有元素触摸友好（≥44px）');
        console.log('    - 优化单手操作体验');
        console.log('    - 减少网络请求和资源大小');
        console.log('    - 考虑离线功能');
        break;
    }
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    link.download = `multi-device-test-${this.deviceType}-${Date.now()}.json`;
    link.click();
    
    console.log('📄 多设备测试结果已导出');
  }
}

// 创建全局测试实例
window.multiDeviceTester = new MultiDeviceTester();

// 导出测试函数
window.runMultiDeviceTests = () => window.multiDeviceTester.runAllTests();

// 导出结果函数
window.exportMultiDeviceResults = () => window.multiDeviceTester.exportResults();

// 如果在浏览器环境中，添加快捷键
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + M: 运行多设备测试
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
      e.preventDefault();
      console.log('📱 快捷键触发多设备测试...');
      window.runMultiDeviceTests();
    }
  });
}

console.log('📱 多设备测试脚本已加载');
console.log('📝 使用方法:');
console.log('  1. 调用 runMultiDeviceTests() 开始测试');
console.log('  2. 或按 Ctrl/Cmd + Shift + M 快捷键');
console.log('  3. 调用 exportMultiDeviceResults() 导出测试结果');
console.log('  4. 测试将根据当前设备类型运行相应的兼容性测试');
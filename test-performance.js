/**
 * 性能测试脚本
 * 测试页面加载速度、操作响应时间和性能瓶颈
 * 
 * 使用方法：
 * 1. 在生产环境中打开浏览器控制台
 * 2. 运行此脚本
 * 3. 调用 runPerformanceTests() 开始测试
 */

class PerformanceTester {
  constructor() {
    this.testResults = {
      pageLoad: {},
      runtime: {},
      memory: {},
      network: {},
      rendering: {},
      interaction: {},
      overall: {}
    };
    this.startTime = null;
    this.performanceObserver = null;
  }

  /**
   * 运行所有性能测试
   */
  async runAllTests() {
    console.log('⚡ 开始性能测试...');
    console.log('🌐 当前环境:', window.location.href);
    
    this.startTime = performance.now();
    
    try {
      // 1. 页面加载性能测试
      await this.testPageLoadPerformance();
      
      // 2. 运行时性能测试
      await this.testRuntimePerformance();
      
      // 3. 内存使用测试
      await this.testMemoryUsage();
      
      // 4. 网络性能测试
      await this.testNetworkPerformance();
      
      // 5. 渲染性能测试
      await this.testRenderingPerformance();
      
      // 6. 交互响应性能测试
      await this.testInteractionPerformance();
      
      // 7. 生成性能报告
      this.generatePerformanceReport();
      
    } catch (error) {
      console.error('❌ 性能测试过程中发生错误:', error);
      this.testResults.overall.error = error.message;
    } finally {
      this.displayResults();
    }
  }

  /**
   * 页面加载性能测试
   */
  async testPageLoadPerformance() {
    console.log('\n📊 测试页面加载性能...');
    
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    if (navigation) {
      const metrics = {
        // DNS 查询时间
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        
        // TCP 连接时间
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        
        // SSL 握手时间
        sslHandshake: navigation.secureConnectionStart > 0 ? 
          navigation.connectEnd - navigation.secureConnectionStart : 0,
        
        // 请求响应时间
        requestResponse: navigation.responseEnd - navigation.requestStart,
        
        // DOM 解析时间
        domParsing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        
        // 资源加载时间
        resourceLoading: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
        
        // 总加载时间
        totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
        
        // 首次内容绘制 (FCP)
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        
        // 最大内容绘制 (LCP) - 需要通过 PerformanceObserver 获取
        largestContentfulPaint: 0
      };
      
      // 获取 LCP
      try {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          metrics.largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
        }
      } catch (error) {
        console.warn('无法获取 LCP 指标:', error);
      }
      
      // 性能评分
      const scores = {
        dnsLookup: this.scoreMetric(metrics.dnsLookup, [50, 100, 200]),
        tcpConnect: this.scoreMetric(metrics.tcpConnect, [100, 200, 500]),
        requestResponse: this.scoreMetric(metrics.requestResponse, [200, 500, 1000]),
        domParsing: this.scoreMetric(metrics.domParsing, [500, 1000, 2000]),
        totalLoadTime: this.scoreMetric(metrics.totalLoadTime, [1000, 2000, 3000]),
        firstContentfulPaint: this.scoreMetric(metrics.firstContentfulPaint, [1000, 2500, 4000]),
        largestContentfulPaint: this.scoreMetric(metrics.largestContentfulPaint, [2500, 4000, 6000])
      };
      
      const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
      
      this.testResults.pageLoad = {
        metrics,
        scores,
        averageScore: Math.round(averageScore),
        passed: averageScore >= 70,
        recommendations: this.getLoadPerformanceRecommendations(metrics, scores)
      };
      
      console.log('✅ 页面加载性能测试完成');
      console.log(`   总加载时间: ${Math.round(metrics.totalLoadTime)}ms`);
      console.log(`   FCP: ${Math.round(metrics.firstContentfulPaint)}ms`);
      console.log(`   LCP: ${Math.round(metrics.largestContentfulPaint)}ms`);
      console.log(`   性能评分: ${Math.round(averageScore)}/100`);
      
    } else {
      this.testResults.pageLoad = {
        passed: false,
        error: '无法获取导航性能数据'
      };
    }
  }

  /**
   * 运行时性能测试
   */
  async testRuntimePerformance() {
    console.log('\n⚡ 测试运行时性能...');
    
    const tests = {
      jsExecutionTime: await this.testJavaScriptExecution(),
      domManipulation: await this.testDOMManipulation(),
      eventHandling: await this.testEventHandling(),
      asyncOperations: await this.testAsyncOperations(),
      frameRate: await this.testFrameRate()
    };
    
    const passedTests = Object.values(tests).filter(test => test.passed).length;
    const totalTests = Object.keys(tests).length;
    
    this.testResults.runtime = {
      tests,
      passedTests,
      totalTests,
      percentage: Math.round(passedTests / totalTests * 100),
      passed: passedTests / totalTests >= 0.8
    };
    
    console.log(`✅ 运行时性能测试完成: ${passedTests}/${totalTests} 通过`);
  }

  /**
   * JavaScript 执行性能测试
   */
  async testJavaScriptExecution() {
    const issues = [];
    let totalTime = 0;
    
    try {
      // 测试数组操作性能
      const startTime = performance.now();
      
      const largeArray = new Array(10000).fill(0).map((_, i) => i);
      const filtered = largeArray.filter(x => x % 2 === 0);
      const mapped = filtered.map(x => x * 2);
      const reduced = mapped.reduce((a, b) => a + b, 0);
      
      const arrayOpTime = performance.now() - startTime;
      totalTime += arrayOpTime;
      
      if (arrayOpTime > 50) {
        issues.push(`数组操作耗时过长: ${Math.round(arrayOpTime)}ms`);
      }
      
      // 测试对象操作性能
      const objStartTime = performance.now();
      
      const largeObject = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key_${i}`] = `value_${i}`;
      }
      
      const keys = Object.keys(largeObject);
      const values = Object.values(largeObject);
      
      const objOpTime = performance.now() - objStartTime;
      totalTime += objOpTime;
      
      if (objOpTime > 20) {
        issues.push(`对象操作耗时过长: ${Math.round(objOpTime)}ms`);
      }
      
      // 测试字符串操作性能
      const strStartTime = performance.now();
      
      let longString = '';
      for (let i = 0; i < 1000; i++) {
        longString += `This is string number ${i}. `;
      }
      
      const processed = longString.split(' ').filter(word => word.length > 3).join(' ');
      
      const strOpTime = performance.now() - strStartTime;
      totalTime += strOpTime;
      
      if (strOpTime > 30) {
        issues.push(`字符串操作耗时过长: ${Math.round(strOpTime)}ms`);
      }
      
    } catch (error) {
      issues.push(`JavaScript 执行测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      totalTime: Math.round(totalTime),
      issues,
      benchmark: totalTime < 100 ? '优秀' : totalTime < 200 ? '良好' : '需要优化'
    };
  }

  /**
   * DOM 操作性能测试
   */
  async testDOMManipulation() {
    const issues = [];
    let totalTime = 0;
    
    try {
      // 创建测试容器
      const testContainer = document.createElement('div');
      testContainer.style.position = 'absolute';
      testContainer.style.top = '-9999px';
      document.body.appendChild(testContainer);
      
      // 测试元素创建和插入
      const createStartTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const element = document.createElement('div');
        element.textContent = `Test element ${i}`;
        element.className = 'test-element';
        testContainer.appendChild(element);
      }
      
      const createTime = performance.now() - createStartTime;
      totalTime += createTime;
      
      if (createTime > 50) {
        issues.push(`DOM 元素创建耗时过长: ${Math.round(createTime)}ms`);
      }
      
      // 测试查询性能
      const queryStartTime = performance.now();
      
      const elements = testContainer.querySelectorAll('.test-element');
      const evenElements = testContainer.querySelectorAll('.test-element:nth-child(even)');
      
      const queryTime = performance.now() - queryStartTime;
      totalTime += queryTime;
      
      if (queryTime > 20) {
        issues.push(`DOM 查询耗时过长: ${Math.round(queryTime)}ms`);
      }
      
      // 测试样式修改性能
      const styleStartTime = performance.now();
      
      elements.forEach((element, index) => {
        element.style.backgroundColor = index % 2 === 0 ? '#f0f0f0' : '#ffffff';
        element.style.padding = '10px';
        element.style.margin = '5px';
      });
      
      const styleTime = performance.now() - styleStartTime;
      totalTime += styleTime;
      
      if (styleTime > 30) {
        issues.push(`样式修改耗时过长: ${Math.round(styleTime)}ms`);
      }
      
      // 测试元素删除性能
      const removeStartTime = performance.now();
      
      while (testContainer.firstChild) {
        testContainer.removeChild(testContainer.firstChild);
      }
      
      const removeTime = performance.now() - removeStartTime;
      totalTime += removeTime;
      
      if (removeTime > 20) {
        issues.push(`DOM 元素删除耗时过长: ${Math.round(removeTime)}ms`);
      }
      
      // 清理测试容器
      document.body.removeChild(testContainer);
      
    } catch (error) {
      issues.push(`DOM 操作测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      totalTime: Math.round(totalTime),
      issues,
      benchmark: totalTime < 120 ? '优秀' : totalTime < 200 ? '良好' : '需要优化'
    };
  }

  /**
   * 事件处理性能测试
   */
  async testEventHandling() {
    const issues = [];
    let totalTime = 0;
    
    try {
      // 创建测试元素
      const testButton = document.createElement('button');
      testButton.textContent = 'Test Button';
      testButton.style.position = 'absolute';
      testButton.style.top = '-9999px';
      document.body.appendChild(testButton);
      
      // 测试事件绑定性能
      const bindStartTime = performance.now();
      
      const handlers = [];
      for (let i = 0; i < 100; i++) {
        const handler = () => console.log(`Handler ${i}`);
        handlers.push(handler);
        testButton.addEventListener('click', handler);
      }
      
      const bindTime = performance.now() - bindStartTime;
      totalTime += bindTime;
      
      if (bindTime > 30) {
        issues.push(`事件绑定耗时过长: ${Math.round(bindTime)}ms`);
      }
      
      // 测试事件触发性能
      const triggerStartTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        const clickEvent = new MouseEvent('click', { bubbles: true });
        testButton.dispatchEvent(clickEvent);
      }
      
      const triggerTime = performance.now() - triggerStartTime;
      totalTime += triggerTime;
      
      if (triggerTime > 20) {
        issues.push(`事件触发耗时过长: ${Math.round(triggerTime)}ms`);
      }
      
      // 测试事件解绑性能
      const unbindStartTime = performance.now();
      
      handlers.forEach(handler => {
        testButton.removeEventListener('click', handler);
      });
      
      const unbindTime = performance.now() - unbindStartTime;
      totalTime += unbindTime;
      
      if (unbindTime > 20) {
        issues.push(`事件解绑耗时过长: ${Math.round(unbindTime)}ms`);
      }
      
      // 清理测试元素
      document.body.removeChild(testButton);
      
    } catch (error) {
      issues.push(`事件处理测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      totalTime: Math.round(totalTime),
      issues,
      benchmark: totalTime < 70 ? '优秀' : totalTime < 120 ? '良好' : '需要优化'
    };
  }

  /**
   * 异步操作性能测试
   */
  async testAsyncOperations() {
    const issues = [];
    let totalTime = 0;
    
    try {
      // 测试 Promise 性能
      const promiseStartTime = performance.now();
      
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => resolve(i), Math.random() * 10);
          })
        );
      }
      
      await Promise.all(promises);
      
      const promiseTime = performance.now() - promiseStartTime;
      totalTime += promiseTime;
      
      if (promiseTime > 100) {
        issues.push(`Promise 操作耗时过长: ${Math.round(promiseTime)}ms`);
      }
      
      // 测试 setTimeout 性能
      const timeoutStartTime = performance.now();
      
      await new Promise(resolve => {
        let count = 0;
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            count++;
            if (count === 10) resolve();
          }, i);
        }
      });
      
      const timeoutTime = performance.now() - timeoutStartTime;
      totalTime += timeoutTime;
      
      if (timeoutTime > 50) {
        issues.push(`setTimeout 操作耗时过长: ${Math.round(timeoutTime)}ms`);
      }
      
      // 测试 requestAnimationFrame 性能
      const rafStartTime = performance.now();
      
      await new Promise(resolve => {
        let count = 0;
        function frame() {
          count++;
          if (count < 10) {
            requestAnimationFrame(frame);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(frame);
      });
      
      const rafTime = performance.now() - rafStartTime;
      totalTime += rafTime;
      
      if (rafTime > 200) {
        issues.push(`requestAnimationFrame 操作耗时过长: ${Math.round(rafTime)}ms`);
      }
      
    } catch (error) {
      issues.push(`异步操作测试失败: ${error.message}`);
    }
    
    return {
      passed: issues.length === 0,
      totalTime: Math.round(totalTime),
      issues,
      benchmark: totalTime < 350 ? '优秀' : totalTime < 500 ? '良好' : '需要优化'
    };
  }

  /**
   * 帧率测试
   */
  async testFrameRate() {
    const issues = [];
    
    try {
      let frameCount = 0;
      let lastTime = performance.now();
      const frameTimes = [];
      
      const measureFrames = () => {
        return new Promise(resolve => {
          const frame = (currentTime) => {
            if (frameCount > 0) {
              const frameTime = currentTime - lastTime;
              frameTimes.push(frameTime);
            }
            
            lastTime = currentTime;
            frameCount++;
            
            if (frameCount < 60) { // 测试 60 帧
              requestAnimationFrame(frame);
            } else {
              resolve();
            }
          };
          
          requestAnimationFrame(frame);
        });
      };
      
      await measureFrames();
      
      // 计算平均帧时间和帧率
      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const fps = 1000 / averageFrameTime;
      
      // 检查帧率稳定性
      const maxFrameTime = Math.max(...frameTimes);
      const minFrameTime = Math.min(...frameTimes);
      const frameTimeVariance = maxFrameTime - minFrameTime;
      
      if (fps < 30) {
        issues.push(`帧率过低: ${Math.round(fps)} FPS`);
      }
      
      if (frameTimeVariance > 50) {
        issues.push(`帧率不稳定，变化范围: ${Math.round(frameTimeVariance)}ms`);
      }
      
      return {
        passed: issues.length === 0,
        fps: Math.round(fps),
        averageFrameTime: Math.round(averageFrameTime),
        frameTimeVariance: Math.round(frameTimeVariance),
        issues,
        benchmark: fps >= 60 ? '优秀' : fps >= 30 ? '良好' : '需要优化'
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [`帧率测试失败: ${error.message}`]
      };
    }
  }

  /**
   * 内存使用测试
   */
  async testMemoryUsage() {
    console.log('\n💾 测试内存使用...');
    
    const issues = [];
    let memoryInfo = {};
    
    try {
      if (performance.memory) {
        memoryInfo = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
        
        const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
        const totalMB = memoryInfo.totalJSHeapSize / 1024 / 1024;
        const limitMB = memoryInfo.jsHeapSizeLimit / 1024 / 1024;
        
        // 内存使用检查
        if (usedMB > 100) {
          issues.push(`JavaScript 堆内存使用过高: ${Math.round(usedMB)}MB`);
        }
        
        if (usedMB / limitMB > 0.8) {
          issues.push(`内存使用接近限制: ${Math.round(usedMB / limitMB * 100)}%`);
        }
        
        // 内存泄漏检测
        const initialMemory = usedMB;
        
        // 创建一些对象来测试内存管理
        const testObjects = [];
        for (let i = 0; i < 1000; i++) {
          testObjects.push({
            id: i,
            data: new Array(100).fill(Math.random()),
            timestamp: Date.now()
          });
        }
        
        // 等待垃圾回收
        await this.delay(100);
        
        // 清理对象
        testObjects.length = 0;
        
        // 强制垃圾回收（如果支持）
        if (window.gc) {
          window.gc();
        }
        
        await this.delay(100);
        
        const finalMemory = performance.memory.usedJSHeapSize / 1024 / 1024;
        const memoryDiff = finalMemory - initialMemory;
        
        if (memoryDiff > 5) {
          issues.push(`可能存在内存泄漏: 增加了 ${Math.round(memoryDiff)}MB`);
        }
        
        this.testResults.memory = {
          passed: issues.length === 0,
          usedMB: Math.round(usedMB),
          totalMB: Math.round(totalMB),
          limitMB: Math.round(limitMB),
          usagePercentage: Math.round(usedMB / limitMB * 100),
          memoryLeakTest: Math.round(memoryDiff),
          issues,
          benchmark: usedMB < 50 ? '优秀' : usedMB < 100 ? '良好' : '需要优化'
        };
        
        console.log(`✅ 内存使用测试完成: ${Math.round(usedMB)}MB / ${Math.round(limitMB)}MB`);
        
      } else {
        this.testResults.memory = {
          passed: false,
          error: '浏览器不支持内存 API'
        };
      }
      
    } catch (error) {
      this.testResults.memory = {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * 网络性能测试
   */
  async testNetworkPerformance() {
    console.log('\n🌐 测试网络性能...');
    
    const issues = [];
    const networkTests = {};
    
    try {
      // 获取网络连接信息
      if (navigator.connection) {
        const connection = navigator.connection;
        networkTests.connectionInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
        
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          issues.push('网络连接较慢，可能影响用户体验');
        }
      }
      
      // 测试资源加载性能
      const resources = performance.getEntriesByType('resource');
      const resourceAnalysis = this.analyzeResourcePerformance(resources);
      
      networkTests.resourceAnalysis = resourceAnalysis;
      
      if (resourceAnalysis.slowResources.length > 0) {
        issues.push(`发现 ${resourceAnalysis.slowResources.length} 个加载缓慢的资源`);
      }
      
      if (resourceAnalysis.largeResources.length > 0) {
        issues.push(`发现 ${resourceAnalysis.largeResources.length} 个大尺寸资源`);
      }
      
      // 测试 API 响应时间
      const apiTests = await this.testAPIPerformance();
      networkTests.apiTests = apiTests;
      
      if (apiTests.averageResponseTime > 1000) {
        issues.push(`API 平均响应时间过长: ${Math.round(apiTests.averageResponseTime)}ms`);
      }
      
      this.testResults.network = {
        passed: issues.length === 0,
        tests: networkTests,
        issues,
        recommendations: this.getNetworkRecommendations(networkTests, issues)
      };
      
      console.log('✅ 网络性能测试完成');
      
    } catch (error) {
      this.testResults.network = {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * 分析资源性能
   */
  analyzeResourcePerformance(resources) {
    const slowResources = [];
    const largeResources = [];
    const resourceTypes = {};
    
    resources.forEach(resource => {
      const loadTime = resource.responseEnd - resource.requestStart;
      const size = resource.transferSize || 0;
      
      // 记录资源类型
      const type = this.getResourceType(resource.name);
      if (!resourceTypes[type]) {
        resourceTypes[type] = { count: 0, totalSize: 0, totalTime: 0 };
      }
      resourceTypes[type].count++;
      resourceTypes[type].totalSize += size;
      resourceTypes[type].totalTime += loadTime;
      
      // 检查慢速资源
      if (loadTime > 1000) {
        slowResources.push({
          name: resource.name,
          loadTime: Math.round(loadTime),
          size: Math.round(size / 1024)
        });
      }
      
      // 检查大尺寸资源
      if (size > 500 * 1024) { // 500KB
        largeResources.push({
          name: resource.name,
          size: Math.round(size / 1024),
          loadTime: Math.round(loadTime)
        });
      }
    });
    
    return {
      totalResources: resources.length,
      slowResources,
      largeResources,
      resourceTypes
    };
  }

  /**
   * 获取资源类型
   */
  getResourceType(url) {
    if (url.includes('.js')) return 'JavaScript';
    if (url.includes('.css')) return 'CSS';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'Image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'Font';
    if (url.includes('api/') || url.includes('/api')) return 'API';
    return 'Other';
  }

  /**
   * 测试 API 性能
   */
  async testAPIPerformance() {
    const apiTests = [];
    
    try {
      // 如果有 Supabase 连接，测试其响应时间
      if (window.supabase) {
        const startTime = performance.now();
        
        try {
          await window.supabase.auth.getSession();
          const responseTime = performance.now() - startTime;
          
          apiTests.push({
            name: 'Supabase Auth',
            responseTime: Math.round(responseTime),
            success: true
          });
        } catch (error) {
          apiTests.push({
            name: 'Supabase Auth',
            responseTime: 0,
            success: false,
            error: error.message
          });
        }
      }
      
      // 测试其他可能的 API 端点
      const testEndpoints = [
        '/api/health',
        '/api/status',
        '/.well-known/health'
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          const startTime = performance.now();
          const response = await fetch(endpoint, { method: 'HEAD' });
          const responseTime = performance.now() - startTime;
          
          apiTests.push({
            name: endpoint,
            responseTime: Math.round(responseTime),
            success: response.ok,
            status: response.status
          });
        } catch (error) {
          // 端点不存在或网络错误，跳过
        }
      }
      
    } catch (error) {
      console.warn('API 性能测试失败:', error);
    }
    
    const averageResponseTime = apiTests.length > 0 ? 
      apiTests.reduce((sum, test) => sum + test.responseTime, 0) / apiTests.length : 0;
    
    return {
      tests: apiTests,
      averageResponseTime: Math.round(averageResponseTime),
      successRate: apiTests.length > 0 ? 
        apiTests.filter(test => test.success).length / apiTests.length * 100 : 100
    };
  }

  /**
   * 渲染性能测试
   */
  async testRenderingPerformance() {
    console.log('\n🎨 测试渲染性能...');
    
    const issues = [];
    const renderingTests = {};
    
    try {
      // 测试重绘性能
      const repaintTest = await this.testRepaintPerformance();
      renderingTests.repaint = repaintTest;
      
      if (!repaintTest.passed) {
        issues.push(...repaintTest.issues);
      }
      
      // 测试重排性能
      const reflowTest = await this.testReflowPerformance();
      renderingTests.reflow = reflowTest;
      
      if (!reflowTest.passed) {
        issues.push(...reflowTest.issues);
      }
      
      // 测试 CSS 动画性能
      const animationTest = await this.testAnimationPerformance();
      renderingTests.animation = animationTest;
      
      if (!animationTest.passed) {
        issues.push(...animationTest.issues);
      }
      
      // 测试滚动性能
      const scrollTest = await this.testScrollPerformance();
      renderingTests.scroll = scrollTest;
      
      if (!scrollTest.passed) {
        issues.push(...scrollTest.issues);
      }
      
      this.testResults.rendering = {
        passed: issues.length === 0,
        tests: renderingTests,
        issues,
        recommendations: this.getRenderingRecommendations(renderingTests)
      };
      
      console.log('✅ 渲染性能测试完成');
      
    } catch (error) {
      this.testResults.rendering = {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * 测试重绘性能
   */
  async testRepaintPerformance() {
    const issues = [];
    
    try {
      // 创建测试元素
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.top = '-9999px';
      testElement.style.width = '100px';
      testElement.style.height = '100px';
      testElement.style.backgroundColor = 'red';
      document.body.appendChild(testElement);
      
      const startTime = performance.now();
      
      // 触发多次重绘
      for (let i = 0; i < 100; i++) {
        testElement.style.backgroundColor = i % 2 === 0 ? 'red' : 'blue';
      }
      
      const repaintTime = performance.now() - startTime;
      
      if (repaintTime > 50) {
        issues.push(`重绘操作耗时过长: ${Math.round(repaintTime)}ms`);
      }
      
      // 清理
      document.body.removeChild(testElement);
      
      return {
        passed: issues.length === 0,
        repaintTime: Math.round(repaintTime),
        issues
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [`重绘测试失败: ${error.message}`]
      };
    }
  }

  /**
   * 测试重排性能
   */
  async testReflowPerformance() {
    const issues = [];
    
    try {
      // 创建测试元素
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.top = '-9999px';
      document.body.appendChild(testElement);
      
      const startTime = performance.now();
      
      // 触发多次重排
      for (let i = 0; i < 50; i++) {
        testElement.style.width = `${100 + i}px`;
        testElement.style.height = `${100 + i}px`;
        // 读取属性触发重排
        const width = testElement.offsetWidth;
      }
      
      const reflowTime = performance.now() - startTime;
      
      if (reflowTime > 100) {
        issues.push(`重排操作耗时过长: ${Math.round(reflowTime)}ms`);
      }
      
      // 清理
      document.body.removeChild(testElement);
      
      return {
        passed: issues.length === 0,
        reflowTime: Math.round(reflowTime),
        issues
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [`重排测试失败: ${error.message}`]
      };
    }
  }

  /**
   * 测试动画性能
   */
  async testAnimationPerformance() {
    const issues = [];
    
    try {
      // 创建测试元素
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.top = '-9999px';
      testElement.style.width = '50px';
      testElement.style.height = '50px';
      testElement.style.backgroundColor = 'blue';
      testElement.style.transition = 'transform 0.3s ease';
      document.body.appendChild(testElement);
      
      const startTime = performance.now();
      let frameCount = 0;
      
      // 启动动画
      testElement.style.transform = 'translateX(100px)';
      
      // 监控动画帧
      const monitorFrames = () => {
        return new Promise(resolve => {
          const frame = () => {
            frameCount++;
            if (frameCount < 20) {
              requestAnimationFrame(frame);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(frame);
        });
      };
      
      await monitorFrames();
      
      const animationTime = performance.now() - startTime;
      const fps = frameCount / (animationTime / 1000);
      
      if (fps < 30) {
        issues.push(`动画帧率过低: ${Math.round(fps)} FPS`);
      }
      
      // 清理
      document.body.removeChild(testElement);
      
      return {
        passed: issues.length === 0,
        fps: Math.round(fps),
        animationTime: Math.round(animationTime),
        issues
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [`动画测试失败: ${error.message}`]
      };
    }
  }

  /**
   * 测试滚动性能
   */
  async testScrollPerformance() {
    const issues = [];
    
    try {
      const scrollContainer = document.documentElement || document.body;
      const originalScrollTop = scrollContainer.scrollTop;
      
      const startTime = performance.now();
      let frameCount = 0;
      
      // 模拟滚动
      const scrollTest = () => {
        return new Promise(resolve => {
          const frame = () => {
            frameCount++;
            scrollContainer.scrollTop = frameCount * 10;
            
            if (frameCount < 30) {
              requestAnimationFrame(frame);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(frame);
        });
      };
      
      await scrollTest();
      
      const scrollTime = performance.now() - startTime;
      const fps = frameCount / (scrollTime / 1000);
      
      if (fps < 30) {
        issues.push(`滚动帧率过低: ${Math.round(fps)} FPS`);
      }
      
      // 恢复原始滚动位置
      scrollContainer.scrollTop = originalScrollTop;
      
      return {
        passed: issues.length === 0,
        fps: Math.round(fps),
        scrollTime: Math.round(scrollTime),
        issues
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [`滚动测试失败: ${error.message}`]
      };
    }
  }

  /**
   * 交互响应性能测试
   */
  async testInteractionPerformance() {
    console.log('\n🖱️ 测试交互响应性能...');
    
    const issues = [];
    const interactionTests = {};
    
    try {
      // 测试点击响应时间
      const clickTest = await this.testClickResponse();
      interactionTests.click = clickTest;
      
      if (!clickTest.passed) {
        issues.push(...clickTest.issues);
      }
      
      // 测试输入响应时间
      const inputTest = await this.testInputResponse();
      interactionTests.input = inputTest;
      
      if (!inputTest.passed) {
        issues.push(...inputTest.issues);
      }
      
      // 测试搜索响应时间
      const searchTest = await this.testSearchResponse();
      interactionTests.search = searchTest;
      
      if (!searchTest.passed) {
        issues.push(...searchTest.issues);
      }
      
      // 测试模态框响应时间
      const modalTest = await this.testModalResponse();
      interactionTests.modal = modalTest;
      
      if (!modalTest.passed) {
        issues.push(...modalTest.issues);
      }
      
      this.testResults.interaction = {
        passed: issues.length === 0,
        tests: interactionTests,
        issues,
        averageResponseTime: this.calculateAverageResponseTime(interactionTests)
      };
      
      console.log('✅ 交互响应性能测试完成');
      
    } catch (error) {
      this.testResults.interaction = {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * 测试点击响应时间
   */
  async testClickResponse() {
    const issues = [];
    const responseTimes = [];
    
    try {
      const buttons = document.querySelectorAll('button, .btn');
      
      if (buttons.length === 0) {
        return { passed: true, issues: ['没有找到可测试的按钮'] };
      }
      
      // 测试前几个按钮
      const testButtons = Array.from(buttons).slice(0, 3);
      
      for (const button of testButtons) {
        const startTime = performance.now();
        
        // 模拟点击事件
        const clickEvent = new MouseEvent('click', { bubbles: true });
        button.dispatchEvent(clickEvent);
        
        // 等待一帧
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const responseTime = performance.now() - startTime;
        responseTimes.push(responseTime);
        
        if (responseTime > 100) {
          issues.push(`按钮响应时间过长: ${Math.round(responseTime)}ms`);
        }
      }
      
      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      
      return {
        passed: issues.length === 0,
        averageResponseTime: Math.round(averageResponseTime),
        responseTimes: responseTimes.map(t => Math.round(t)),
        issues
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [`点击响应测试失败: ${error.message}`]
      };
    }
  }

  /**
   * 测试输入响应时间
   */
  async testInputResponse() {
    const issues = [];
    const responseTimes = [];
    
    try {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
      
      if (inputs.length === 0) {
        return { passed: true, issues: ['没有找到可测试的输入框'] };
      }
      
      const testInput = inputs[0];
      const originalValue = testInput.value;
      
      // 测试输入响应
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        
        testInput.value = `test${i}`;
        const inputEvent = new Event('input', { bubbles: true });
        testInput.dispatchEvent(inputEvent);
        
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const responseTime = performance.now() - startTime;
        responseTimes.push(responseTime);
        
        if (responseTime > 50) {
          issues.push(`输入响应时间过长: ${Math.round(responseTime)}ms`);
        }
      }
      
      // 恢复原值
      testInput.value = originalValue;
      
      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      
      return {
        passed: issues.length === 0,
        averageResponseTime: Math.round(averageResponseTime),
        responseTimes: responseTimes.map(t => Math.round(t)),
        issues
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [`输入响应测试失败: ${error.message}`]
      };
    }
  }

  /**
   * 测试搜索响应时间
   */
  async testSearchResponse() {
    const issues = [];
    
    try {
      const searchInput = document.getElementById('searchInput');
      
      if (!searchInput) {
        return { passed: true, issues: ['没有找到搜索输入框'] };
      }
      
      const originalValue = searchInput.value;
      
      const startTime = performance.now();
      
      // 模拟搜索
      searchInput.value = 'ChatGPT';
      
      if (window.app && window.app.handleSearch) {
        window.app.handleSearch('ChatGPT');
      } else {
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
      }
      
      // 等待搜索结果
      await this.delay(300);
      
      const responseTime = performance.now() - startTime;
      
      if (responseTime > 500) {
        issues.push(`搜索响应时间过长: ${Math.round(responseTime)}ms`);
      }
      
      // 恢复原值
      searchInput.value = originalValue;
      if (window.app && window.app.handleSearch) {
        window.app.handleSearch(originalValue);
      }
      
      return {
        passed: issues.length === 0,
        responseTime: Math.round(responseTime),
        issues
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [`搜索响应测试失败: ${error.message}`]
      };
    }
  }

  /**
   * 测试模态框响应时间
   */
  async testModalResponse() {
    const issues = [];
    
    try {
      const loginBtn = document.getElementById('loginBtn');
      
      if (!loginBtn) {
        return { passed: true, issues: ['没有找到登录按钮'] };
      }
      
      const startTime = performance.now();
      
      // 模拟点击登录按钮
      const clickEvent = new MouseEvent('click', { bubbles: true });
      loginBtn.dispatchEvent(clickEvent);
      
      // 等待模态框显示
      await this.delay(100);
      
      const responseTime = performance.now() - startTime;
      
      // 检查模态框是否显示
      const loginModal = document.getElementById('loginModal');
      const isModalVisible = loginModal && !loginModal.classList.contains('hidden');
      
      if (!isModalVisible) {
        issues.push('模态框未正确显示');
      }
      
      if (responseTime > 200) {
        issues.push(`模态框响应时间过长: ${Math.round(responseTime)}ms`);
      }
      
      // 关闭模态框
      if (isModalVisible && window.uiManager) {
        window.uiManager.hideLoginModal();
      }
      
      return {
        passed: issues.length === 0,
        responseTime: Math.round(responseTime),
        modalVisible: isModalVisible,
        issues
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [`模态框响应测试失败: ${error.message}`]
      };
    }
  }

  /**
   * 计算平均响应时间
   */
  calculateAverageResponseTime(interactionTests) {
    const responseTimes = [];
    
    Object.values(interactionTests).forEach(test => {
      if (test.averageResponseTime) {
        responseTimes.push(test.averageResponseTime);
      } else if (test.responseTime) {
        responseTimes.push(test.responseTime);
      }
    });
    
    return responseTimes.length > 0 ? 
      Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;
  }

  /**
   * 性能指标评分
   */
  scoreMetric(value, thresholds) {
    const [good, ok, poor] = thresholds;
    
    if (value <= good) return 100;
    if (value <= ok) return 75;
    if (value <= poor) return 50;
    return 25;
  }

  /**
   * 获取加载性能建议
   */
  getLoadPerformanceRecommendations(metrics, scores) {
    const recommendations = [];
    
    if (scores.dnsLookup < 75) {
      recommendations.push('考虑使用 DNS 预解析 (<link rel="dns-prefetch">)');
    }
    
    if (scores.requestResponse < 75) {
      recommendations.push('优化服务器响应时间，考虑使用 CDN');
    }
    
    if (scores.domParsing < 75) {
      recommendations.push('减少 DOM 复杂度，优化 HTML 结构');
    }
    
    if (scores.totalLoadTime < 75) {
      recommendations.push('压缩资源文件，启用 Gzip 压缩');
    }
    
    if (scores.firstContentfulPaint < 75) {
      recommendations.push('优化关键渲染路径，内联关键 CSS');
    }
    
    if (scores.largestContentfulPaint < 75) {
      recommendations.push('优化最大内容元素的加载，使用图片懒加载');
    }
    
    return recommendations;
  }

  /**
   * 获取网络性能建议
   */
  getNetworkRecommendations(networkTests, issues) {
    const recommendations = [];
    
    if (issues.some(issue => issue.includes('缓慢'))) {
      recommendations.push('启用资源缓存，设置合适的 Cache-Control 头');
      recommendations.push('使用 HTTP/2 或 HTTP/3 协议');
    }
    
    if (issues.some(issue => issue.includes('大尺寸'))) {
      recommendations.push('压缩图片，使用现代图片格式 (WebP, AVIF)');
      recommendations.push('代码分割，按需加载资源');
    }
    
    if (networkTests.connectionInfo?.effectiveType === 'slow-2g') {
      recommendations.push('为慢速网络优化，减少初始加载资源');
      recommendations.push('实现离线功能，使用 Service Worker');
    }
    
    return recommendations;
  }

  /**
   * 获取渲染性能建议
   */
  getRenderingRecommendations(renderingTests) {
    const recommendations = [];
    
    if (renderingTests.repaint && !renderingTests.repaint.passed) {
      recommendations.push('减少不必要的重绘，使用 CSS transform 代替改变位置');
    }
    
    if (renderingTests.reflow && !renderingTests.reflow.passed) {
      recommendations.push('避免频繁的重排，批量进行 DOM 操作');
    }
    
    if (renderingTests.animation && renderingTests.animation.fps < 60) {
      recommendations.push('使用 CSS transform 和 opacity 进行动画');
      recommendations.push('启用硬件加速 (will-change 属性)');
    }
    
    if (renderingTests.scroll && renderingTests.scroll.fps < 30) {
      recommendations.push('优化滚动性能，使用 passive 事件监听器');
      recommendations.push('实现虚拟滚动或懒加载');
    }
    
    return recommendations;
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport() {
    console.log('\n📋 生成性能测试报告...');
    
    const categories = ['pageLoad', 'runtime', 'memory', 'network', 'rendering', 'interaction'];
    let totalScore = 0;
    let categoryCount = 0;
    
    categories.forEach(category => {
      const result = this.testResults[category];
      if (result && !result.error) {
        categoryCount++;
        
        if (result.averageScore) {
          totalScore += result.averageScore;
        } else if (result.percentage) {
          totalScore += result.percentage;
        } else if (result.passed) {
          totalScore += 100;
        }
      }
    });
    
    const overallScore = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;
    
    this.testResults.overall = {
      score: overallScore,
      grade: this.getPerformanceGrade(overallScore),
      duration: performance.now() - this.startTime,
      timestamp: new Date().toISOString(),
      environment: window.location.href,
      userAgent: navigator.userAgent,
      recommendations: this.getOverallRecommendations()
    };
  }

  /**
   * 获取性能等级
   */
  getPerformanceGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * 获取总体建议
   */
  getOverallRecommendations() {
    const recommendations = [];
    
    // 收集所有分类的建议
    Object.values(this.testResults).forEach(result => {
      if (result.recommendations) {
        recommendations.push(...result.recommendations);
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
    console.log('⚡ 性能测试完整报告');
    console.log('='.repeat(60));
    
    console.log(`🌐 测试环境: ${window.location.href}`);
    console.log(`⏱️ 测试耗时: ${Math.round(duration)}ms`);
    console.log(`🖥️ 浏览器: ${navigator.userAgent.split(' ').pop()}`);
    
    const overall = this.testResults.overall;
    console.log(`\n📊 总体性能评分: ${overall.score}/100 (${overall.grade})`);
    
    // 显示各分类结果
    console.log('\n📈 分类性能结果:');
    
    const categories = [
      { key: 'pageLoad', name: '页面加载', icon: '📊' },
      { key: 'runtime', name: '运行时性能', icon: '⚡' },
      { key: 'memory', name: '内存使用', icon: '💾' },
      { key: 'network', name: '网络性能', icon: '🌐' },
      { key: 'rendering', name: '渲染性能', icon: '🎨' },
      { key: 'interaction', name: '交互响应', icon: '🖱️' }
    ];
    
    categories.forEach(category => {
      const result = this.testResults[category.key];
      if (result && !result.error) {
        let status, score;
        
        if (result.averageScore) {
          score = result.averageScore;
          status = result.passed ? '✅ 通过' : '⚠️ 需要优化';
        } else if (result.percentage) {
          score = result.percentage;
          status = result.passed ? '✅ 通过' : '⚠️ 需要优化';
        } else {
          score = result.passed ? 100 : 0;
          status = result.passed ? '✅ 通过' : '❌ 失败';
        }
        
        console.log(`  ${category.icon} ${category.name}: ${status} (${score}/100)`);
        
        // 显示关键指标
        if (category.key === 'pageLoad' && result.metrics) {
          console.log(`    加载时间: ${Math.round(result.metrics.totalLoadTime)}ms`);
          console.log(`    FCP: ${Math.round(result.metrics.firstContentfulPaint)}ms`);
        } else if (category.key === 'memory' && result.usedMB) {
          console.log(`    内存使用: ${result.usedMB}MB`);
        } else if (category.key === 'interaction' && result.averageResponseTime) {
          console.log(`    平均响应: ${result.averageResponseTime}ms`);
        }
      } else if (result && result.error) {
        console.log(`  ${category.icon} ${category.name}: ❌ 错误 (${result.error})`);
      }
    });
    
    // 显示性能等级说明
    console.log('\n🏆 性能等级说明:');
    console.log('  A (90-100): 优秀 - 性能表现卓越');
    console.log('  B (80-89):  良好 - 性能表现良好');
    console.log('  C (70-79):  一般 - 有优化空间');
    console.log('  D (60-69):  较差 - 需要优化');
    console.log('  F (0-59):   很差 - 急需优化');
    
    // 显示优化建议
    if (overall.recommendations && overall.recommendations.length > 0) {
      console.log('\n💡 优化建议:');
      overall.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    // 显示总结
    if (overall.score >= 90) {
      console.log('\n🎉 恭喜！网站性能表现优秀');
    } else if (overall.score >= 80) {
      console.log('\n✅ 网站性能表现良好，可以考虑进一步优化');
    } else if (overall.score >= 70) {
      console.log('\n⚠️ 网站性能一般，建议进行优化');
    } else {
      console.log('\n❌ 网站性能需要改进，请优先处理关键问题');
    }
    
    return this.testResults;
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
    link.download = `performance-test-results-${Date.now()}.json`;
    link.click();
    
    console.log('📄 性能测试结果已导出');
  }
}

// 创建全局测试实例
window.performanceTester = new PerformanceTester();

// 导出测试函数
window.runPerformanceTests = () => window.performanceTester.runAllTests();

// 导出结果函数
window.exportPerformanceResults = () => window.performanceTester.exportResults();

// 如果在浏览器环境中，添加快捷键
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + R: 运行性能测试
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      console.log('⚡ 快捷键触发性能测试...');
      window.runPerformanceTests();
    }
  });
}

console.log('⚡ 性能测试脚本已加载');
console.log('📝 使用方法:');
console.log('  1. 调用 runPerformanceTests() 开始测试');
console.log('  2. 或按 Ctrl/Cmd + Shift + R 快捷键');
console.log('  3. 调用 exportPerformanceResults() 导出测试结果');
console.log('  4. 测试将评估页面加载、运行时、内存、网络、渲染和交互性能');
# 认证模块使用指南

## 快速开始

### 1. 初始化认证管理器

```javascript
// 获取 Supabase 客户端（已在 config.js 中初始化）
const supabase = window.supabaseClient;

// 创建认证管理器实例
const authManager = new AuthManager(supabase);

// 创建会话管理器实例
const sessionManager = new SessionManager(supabase);
```

### 2. 用户注册

```javascript
// 获取表单数据
const email = document.getElementById('registerEmail').value;
const password = document.getElementById('registerPassword').value;
const confirmPassword = document.getElementById('registerPasswordConfirm').value;

// 验证表单
const validation = FormValidator.validateRegisterForm(email, password, confirmPassword);
if (!validation.valid) {
    // 显示验证错误
    if (validation.errors.email) {
        console.error(validation.errors.email);
    }
    if (validation.errors.password) {
        console.error(validation.errors.password);
    }
    if (validation.errors.confirmPassword) {
        console.error(validation.errors.confirmPassword);
    }
    return;
}

// 执行注册
const result = await authManager.signUp(email, password);
if (result.success) {
    console.log('注册成功！', result.user);
    // 注册成功后的操作...
} else {
    console.error('注册失败：', result.error);
    // 显示错误消息...
}
```

### 3. 用户登录

```javascript
// 获取表单数据
const email = document.getElementById('loginEmail').value;
const password = document.getElementById('loginPassword').value;

// 验证表单
const validation = FormValidator.validateLoginForm(email, password);
if (!validation.valid) {
    // 显示验证错误
    if (validation.errors.email) {
        console.error(validation.errors.email);
    }
    if (validation.errors.password) {
        console.error(validation.errors.password);
    }
    return;
}

// 执行登录
const result = await authManager.signIn(email, password);
if (result.success) {
    console.log('登录成功！', result.user);
    // 登录成功后的操作...
} else {
    console.error('登录失败：', result.error);
    // 显示错误消息...
}
```

### 4. 用户登出

```javascript
const result = await authManager.signOut();
if (result.success) {
    console.log('登出成功！');
    // 登出成功后的操作...
} else {
    console.error('登出失败：', result.error);
}
```

### 5. 获取当前用户

```javascript
const user = await authManager.getCurrentUser();
if (user) {
    console.log('当前用户：', user.email);
} else {
    console.log('用户未登录');
}
```

### 6. 监听认证状态变化

```javascript
// 设置认证状态监听
const unsubscribe = authManager.onAuthStateChange((event, session) => {
    console.log('认证状态变化：', event);
    
    if (session) {
        // 用户已登录
        console.log('用户已登录：', session.user.email);
        // 更新 UI...
    } else {
        // 用户未登录
        console.log('用户未登录');
        // 更新 UI...
    }
});

// 取消监听（在组件卸载时调用）
// unsubscribe();
```

### 7. 会话管理

```javascript
// 初始化会话（应用启动时调用）
const user = await sessionManager.initializeSession();
if (user) {
    console.log('会话已恢复：', user.email);
}

// 开始会话监控（自动刷新和过期处理）
sessionManager.startSessionMonitoring();

// 获取会话剩余时间
const remainingTime = await sessionManager.getSessionRemainingTime();
console.log('会话剩余时间：', remainingTime, '秒');

// 手动刷新会话
const session = await sessionManager.refreshSession();
if (session) {
    console.log('会话已刷新');
}

// 停止会话监控（应用关闭时调用）
sessionManager.stopSessionMonitoring();
```

### 8. 实时表单验证

```javascript
// 为邮箱输入框添加实时验证
const emailInput = document.getElementById('registerEmail');
const emailError = document.getElementById('emailError');
FormValidator.addRealtimeValidation(
    emailInput,
    FormValidator.validateEmail,
    emailError
);

// 为密码输入框添加实时验证
const passwordInput = document.getElementById('registerPassword');
const passwordError = document.getElementById('passwordError');
FormValidator.addRealtimeValidation(
    passwordInput,
    FormValidator.validatePassword,
    passwordError
);
```

### 9. 错误处理

```javascript
// 处理注册错误
try {
    const result = await authManager.signUp(email, password);
    if (!result.success) {
        const friendlyError = AuthErrorHandler.handleSignUpError(result.error);
        AuthErrorHandler.displayError(errorElement, friendlyError);
    }
} catch (error) {
    const friendlyError = AuthErrorHandler.handleNetworkError(error);
    AuthErrorHandler.displayError(errorElement, friendlyError);
}

// 处理登录错误
try {
    const result = await authManager.signIn(email, password);
    if (!result.success) {
        const friendlyError = AuthErrorHandler.handleSignInError(result.error);
        AuthErrorHandler.displayError(errorElement, friendlyError);
    }
} catch (error) {
    const friendlyError = AuthErrorHandler.handleNetworkError(error);
    AuthErrorHandler.displayError(errorElement, friendlyError);
}
```

## 完整示例

### 注册表单处理

```javascript
// 获取表单元素
const registerForm = document.getElementById('registerForm');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
const registerError = document.getElementById('registerError');

// 添加实时验证
FormValidator.addRealtimeValidation(registerEmail, FormValidator.validateEmail, registerError);
FormValidator.addRealtimeValidation(registerPassword, FormValidator.validatePassword, registerError);

// 处理表单提交
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 清除之前的错误
    AuthErrorHandler.clearError(registerError);
    
    // 获取表单数据
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const confirmPassword = registerPasswordConfirm.value;
    
    // 验证表单
    const validation = FormValidator.validateRegisterForm(email, password, confirmPassword);
    if (!validation.valid) {
        const errorMessage = Object.values(validation.errors)[0];
        AuthErrorHandler.displayError(registerError, errorMessage);
        return;
    }
    
    // 执行注册
    try {
        const result = await authManager.signUp(email, password);
        if (result.success) {
            console.log('注册成功！');
            // 关闭模态框、显示成功消息等...
        } else {
            const friendlyError = AuthErrorHandler.handleSignUpError(result.error);
            AuthErrorHandler.displayError(registerError, friendlyError);
        }
    } catch (error) {
        const friendlyError = AuthErrorHandler.handleNetworkError(error);
        AuthErrorHandler.displayError(registerError, friendlyError);
    }
});
```

### 登录表单处理

```javascript
// 获取表单元素
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');

// 处理表单提交
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 清除之前的错误
    AuthErrorHandler.clearError(loginError);
    
    // 获取表单数据
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    // 验证表单
    const validation = FormValidator.validateLoginForm(email, password);
    if (!validation.valid) {
        const errorMessage = Object.values(validation.errors)[0];
        AuthErrorHandler.displayError(loginError, errorMessage);
        return;
    }
    
    // 执行登录
    try {
        const result = await authManager.signIn(email, password);
        if (result.success) {
            console.log('登录成功！');
            // 关闭模态框、显示成功消息等...
        } else {
            const friendlyError = AuthErrorHandler.handleSignInError(result.error);
            AuthErrorHandler.displayError(loginError, friendlyError);
        }
    } catch (error) {
        const friendlyError = AuthErrorHandler.handleNetworkError(error);
        AuthErrorHandler.displayError(loginError, friendlyError);
    }
});
```

### 应用初始化

```javascript
// 应用启动时的初始化代码
document.addEventListener('DOMContentLoaded', async () => {
    // 创建管理器实例
    const authManager = new AuthManager(window.supabaseClient);
    const sessionManager = new SessionManager(window.supabaseClient);
    
    // 初始化会话
    const user = await sessionManager.initializeSession();
    if (user) {
        console.log('用户已登录：', user.email);
        // 更新 UI 显示用户信息
    }
    
    // 开始会话监控
    sessionManager.startSessionMonitoring();
    
    // 监听认证状态变化
    authManager.onAuthStateChange((event, session) => {
        if (session) {
            // 用户登录
            console.log('用户登录：', session.user.email);
            // 更新 UI
        } else {
            // 用户登出
            console.log('用户登出');
            // 更新 UI
        }
    });
    
    // 将管理器实例保存到全局，供其他模块使用
    window.authManager = authManager;
    window.sessionManager = sessionManager;
});
```

## API 参考

### AuthManager

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `signUp(email, password)` | email: string, password: string | Promise<{success: boolean, user?: object, error?: string}> | 用户注册 |
| `signIn(email, password)` | email: string, password: string | Promise<{success: boolean, user?: object, error?: string}> | 用户登录 |
| `signOut()` | - | Promise<{success: boolean, error?: string}> | 用户登出 |
| `getCurrentUser()` | - | Promise<object\|null> | 获取当前用户 |
| `getSession()` | - | Promise<object\|null> | 获取当前会话 |
| `onAuthStateChange(callback)` | callback: Function | Function | 监听认证状态变化 |
| `isAuthenticated()` | - | boolean | 检查是否已登录 |
| `getUserEmail()` | - | string\|null | 获取用户邮箱 |
| `getUserId()` | - | string\|null | 获取用户 ID |

### FormValidator

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `validateEmail(email)` | email: string | {valid: boolean, error?: string} | 验证邮箱格式 |
| `validatePassword(password)` | password: string | {valid: boolean, error?: string} | 验证密码强度 |
| `validatePasswordMatch(password, confirmPassword)` | password: string, confirmPassword: string | {valid: boolean, error?: string} | 验证密码匹配 |
| `validateLoginForm(email, password)` | email: string, password: string | {valid: boolean, errors: object} | 验证登录表单 |
| `validateRegisterForm(email, password, confirmPassword)` | email: string, password: string, confirmPassword: string | {valid: boolean, errors: object} | 验证注册表单 |
| `showError(errorElement, message)` | errorElement: HTMLElement, message: string | void | 显示错误消息 |
| `clearError(errorElement)` | errorElement: HTMLElement | void | 清除错误消息 |
| `addRealtimeValidation(inputElement, validationFunction, errorElement)` | inputElement: HTMLInputElement, validationFunction: Function, errorElement: HTMLElement | void | 添加实时验证 |

### AuthErrorHandler

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `handleSignUpError(error)` | error: Error\|string | string | 处理注册错误 |
| `handleSignInError(error)` | error: Error\|string | string | 处理登录错误 |
| `handleSignOutError(error)` | error: Error\|string | string | 处理登出错误 |
| `handleNetworkError(error)` | error: Error | string | 处理网络错误 |
| `displayError(element, message)` | element: HTMLElement, message: string | void | 显示错误消息 |
| `clearError(element)` | element: HTMLElement | void | 清除错误消息 |
| `logError(context, error)` | context: string, error: Error | void | 记录错误 |

### SessionManager

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `initializeSession()` | - | Promise<object\|null> | 初始化会话 |
| `restoreSession()` | - | Promise<object\|null> | 恢复会话 |
| `saveSession(session)` | session: object | void | 保存会话 |
| `clearSession()` | - | Promise<void> | 清除会话 |
| `isSessionExpired(session)` | session: object | boolean | 检查会话是否过期 |
| `getSessionExpiryTime(session)` | session: object | Date\|null | 获取会话过期时间 |
| `refreshSession()` | - | Promise<object\|null> | 刷新会话 |
| `startSessionMonitoring()` | - | void | 开始会话监控 |
| `stopSessionMonitoring()` | - | void | 停止会话监控 |
| `getSessionRemainingTime()` | - | Promise<number> | 获取会话剩余时间（秒） |

## 注意事项

1. **会话管理**：应用启动时必须调用 `sessionManager.initializeSession()` 来恢复用户会话
2. **会话监控**：建议在应用启动时调用 `sessionManager.startSessionMonitoring()` 来自动处理会话刷新和过期
3. **错误处理**：所有异步操作都应该使用 try-catch 包裹，并使用 `AuthErrorHandler` 处理错误
4. **表单验证**：提交表单前必须先验证，避免不必要的网络请求
5. **实时验证**：使用 `FormValidator.addRealtimeValidation()` 可以提供更好的用户体验
6. **认证状态监听**：使用 `authManager.onAuthStateChange()` 可以实时响应用户登录/登出状态变化


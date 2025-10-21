/**
 * SmartAbp低代码引擎 - E2E测试辅助函数
 * 提供登录、导航等通用测试功能
 */

export interface LoginCredentials {
    username: string;
    password: string;
}

/**
 * 默认测试账号
 */
export const TEST_USERS = {
    admin: {
        username: 'admin',
        password: '1q2w3E*'
    }
} as const;

/**
 * 测试页面URL
 */
export const TEST_URLS = {
    login: '/account/login',
    portal: '/lowcode/welcome',
    layer1: '/lowcode/layer1',
    layer2: '/lowcode/layer2',
    layer3: '/lowcode/layer3',
} as const;

/**
 * 测试超时配置（毫秒）
 */
export const TIMEOUTS = {
    short: 5000,    // 短超时（元素查找）
    medium: 10000,  // 中等超时（页面加载）
    long: 30000,    // 长超时（API调用）
} as const;

/**
 * 测试断言消息
 */
export const ASSERT_MESSAGES = {
    loginSuccess: '用户应该成功登录',
    pageLoaded: '页面应该正确加载',
    noConsoleErrors: '控制台不应该有错误',
    apiSuccess: 'API调用应该成功',
    dataDisplayed: '数据应该正确显示',
} as const;


import { defineConfig, devices } from '@playwright/test';

/**
 * SmartAbp低代码引擎 - Playwright测试配置
 * 用于前后端集成测试和UI自动化测试
 */
export default defineConfig({
  // 测试目录
  testDir: './tests/e2e',
  
  // 测试超时时间（30秒）
  timeout: 30 * 1000,
  
  // 全局超时时间（10分钟）
  globalTimeout: 10 * 60 * 1000,
  
  // 断言超时时间（5秒）
  expect: {
    timeout: 5000
  },
  
  // 测试失败时的行为
  fullyParallel: false, // 串行执行（因为需要数据库状态一致）
  forbidOnly: !!process.env.CI, // CI环境禁止only
  retries: process.env.CI ? 2 : 0, // CI环境重试2次
  workers: 1, // 单线程执行（避免并发冲突）
  
  // 报告配置
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/test-results.json' }]
  ],
  
  // 全局配置
  use: {
    // 基础URL
    baseURL: 'http://localhost:9001',
    
    // 浏览器配置
    headless: false, // 开发时显示浏览器
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    // 截图配置
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // 超时配置
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // 开发服务器配置（可选）
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分钟
  },
});


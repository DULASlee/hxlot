#!/bin/bash

# ============================================================================
# 安装专业测试工具脚本
# ============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/src/SmartAbp.Vue"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 安装SmartAbp专业测试工具${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$FRONTEND_DIR"

# ============================================================================
# 检查已安装的工具
# ============================================================================

echo -e "${YELLOW}📋 检查已安装的测试工具...${NC}"
echo ""

check_package() {
    if npm list "$1" &>/dev/null; then
        echo -e "${GREEN}  ✅ $1 已安装${NC}"
        return 0
    else
        echo -e "${YELLOW}  ⏳ $1 需要安装${NC}"
        return 1
    fi
}

check_package "vitest"
check_package "cypress"
check_package "@playwright/test"
check_package "supertest"

echo ""

# ============================================================================
# 安装推荐的测试工具
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 开始安装推荐测试工具${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. 安装Playwright
if ! check_package "@playwright/test"; then
    echo -e "${YELLOW}📦 1/5 安装Playwright（现代E2E测试框架）...${NC}"
    npm install -D @playwright/test
    echo -e "${GREEN}✅ Playwright安装完成${NC}"
    
    echo -e "${YELLOW}📦 下载浏览器驱动...${NC}"
    npx playwright install chromium
    echo -e "${GREEN}✅ 浏览器驱动安装完成${NC}"
else
    echo -e "${GREEN}✅ 1/5 Playwright已安装${NC}"
fi

echo ""

# 2. 安装SuperTest
if ! check_package "supertest"; then
    echo -e "${YELLOW}📦 2/5 安装SuperTest（HTTP API测试库）...${NC}"
    npm install -D supertest @types/supertest
    echo -e "${GREEN}✅ SuperTest安装完成${NC}"
else
    echo -e "${GREEN}✅ 2/5 SuperTest已安装${NC}"
fi

echo ""

# 3. 安装MSW
if ! check_package "msw"; then
    echo -e "${YELLOW}📦 3/5 安装MSW（Mock Service Worker）...${NC}"
    npm install -D msw
    echo -e "${GREEN}✅ MSW安装完成${NC}"
else
    echo -e "${GREEN}✅ 3/5 MSW已安装${NC}"
fi

echo ""

# 4. 安装Faker
if ! check_package "@faker-js/faker"; then
    echo -e "${YELLOW}📦 4/5 安装Faker（测试数据生成）...${NC}"
    npm install -D @faker-js/faker
    echo -e "${GREEN}✅ Faker安装完成${NC}"
else
    echo -e "${GREEN}✅ 4/5 Faker已安装${NC}"
fi

echo ""

# 5. 安装Axios Mock Adapter
if ! check_package "axios-mock-adapter"; then
    echo -e "${YELLOW}📦 5/5 安装Axios Mock Adapter...${NC}"
    npm install -D axios-mock-adapter
    echo -e "${GREEN}✅ Axios Mock Adapter安装完成${NC}"
else
    echo -e "${GREEN}✅ 5/5 Axios Mock Adapter已安装${NC}"
fi

echo ""

# ============================================================================
# 创建测试配置文件
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚙️  创建测试配置文件${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Playwright配置
if [ ! -f "playwright.config.ts" ]; then
    echo -e "${YELLOW}📝 创建playwright.config.ts...${NC}"
    cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e-playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:11369',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:11369',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
EOF
    echo -e "${GREEN}✅ playwright.config.ts创建完成${NC}"
else
    echo -e "${GREEN}✅ playwright.config.ts已存在${NC}"
fi

# 测试设置文件
mkdir -p tests
if [ ! -f "tests/setup.ts" ]; then
    echo -e "${YELLOW}📝 创建tests/setup.ts...${NC}"
    cat > tests/setup.ts << 'EOF'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'

// 每个测试后清理
afterEach(() => {
  cleanup()
})

// 全局测试前设置
beforeAll(() => {
  // 设置测试环境变量
  process.env.VITE_API_BASE_URL = 'http://localhost:44379'
  console.log('🧪 测试环境初始化完成')
})

// 全局测试后清理
afterAll(() => {
  console.log('🧪 测试环境清理完成')
})
EOF
    echo -e "${GREEN}✅ tests/setup.ts创建完成${NC}"
else
    echo -e "${GREEN}✅ tests/setup.ts已存在${NC}"
fi

echo ""

# ============================================================================
# 创建示例测试
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 创建示例测试${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# API测试示例
mkdir -p tests/api
if [ ! -f "tests/api/code-generator.api.test.ts" ]; then
    echo -e "${YELLOW}📝 创建API测试示例...${NC}"
    cat > tests/api/code-generator.api.test.ts << 'EOF'
import { describe, it, expect } from 'vitest'
import request from 'supertest'

const API_BASE = 'http://localhost:44379/api/code-generator'

describe('Code Generator API Tests', () => {
  it('should get connection strings', async () => {
    const response = await request(API_BASE)
      .get('/connection-strings')
      .expect(200)
    
    expect(response.body).toBeDefined()
  })
  
  it('should validate module config', async () => {
    const validConfig = {
      systemName: 'TestSystem',
      name: 'TestModule',
      displayName: '测试模块',
    }
    
    const response = await request(API_BASE)
      .post('/validate')
      .send(validConfig)
      .expect(200)
    
    expect(response.body).toBeDefined()
  })
})
EOF
    echo -e "${GREEN}✅ API测试示例创建完成${NC}"
fi

# Playwright测试示例
mkdir -p tests/e2e-playwright
if [ ! -f "tests/e2e-playwright/code-generator.spec.ts" ]; then
    echo -e "${YELLOW}📝 创建Playwright测试示例...${NC}"
    cat > tests/e2e-playwright/code-generator.spec.ts << 'EOF'
import { test, expect } from '@playwright/test'

test.describe('Code Generator E2E Tests', () => {
  test('should load entrance page', async ({ page }) => {
    await page.goto('/CodeGen/entrance')
    await expect(page).toHaveTitle(/SmartAbp/)
  })
  
  test('should navigate to simple mode', async ({ page }) => {
    await page.goto('/CodeGen/entrance')
    await page.click('text=极简模式')
    await expect(page).toHaveURL(/CodeGen\/ultra-simple/)
  })
})
EOF
    echo -e "${GREEN}✅ Playwright测试示例创建完成${NC}"
fi

echo ""

# ============================================================================
# 完成总结
# ============================================================================

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 测试工具安装完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}📊 已安装的工具：${NC}"
echo -e "  ✅ Vitest - 单元测试框架"
echo -e "  ✅ Cypress - E2E测试框架"
echo -e "  ✅ Playwright - 现代E2E测试"
echo -e "  ✅ SuperTest - API测试"
echo -e "  ✅ MSW - API Mock"
echo -e "  ✅ Faker - 测试数据生成"
echo ""

echo -e "${BLUE}🚀 可用的测试命令：${NC}"
echo -e "  npm run test                - 运行单元测试"
echo -e "  npm run test:e2e            - 运行E2E测试（Vitest）"
echo -e "  npm run test:playwright     - 运行E2E测试（Playwright）"
echo -e "  npm run test:coverage       - 查看代码覆盖率"
echo ""

echo -e "${BLUE}📚 下一步：${NC}"
echo -e "  1. 阅读文档: docs/testing/测试工具配置指南.md"
echo -e "  2. 运行示例: npm run test:playwright"
echo -e "  3. 编写测试: 参考 tests/api/ 和 tests/e2e-playwright/"
echo ""


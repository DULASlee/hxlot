# SmartAbp.Vue 登录功能测试指南

## 🎯 测试项目概述

本测试项目专门用于验证 SmartAbp.Vue 应用的用户登录功能是否正常实现，包含完整的测试环境、测试用例和测试工具。

## 📋 测试功能清单

### ✅ 已实现的测试功能

1. **登录测试页面** (`/test/login`)
   - 可视化登录功能测试界面
   - API 连接状态检测
   - 用户登录表单测试
   - 认证状态实时显示
   - 测试日志记录

2. **单元测试** (Vitest)
   - 认证状态管理测试
   - 登录组件功能测试
   - API 服务测试

3. **E2E 测试** (Cypress)
   - 完整登录流程测试
   - 用户界面交互测试
   - 网络错误处理测试

## 🚀 快速开始

### 1. 访问登录测试页面

开发服务器运行后，访问以下地址：

```
http://localhost:11369/test/login
```

或者在已登录状态下，通过侧边栏菜单访问 "登录测试" 页面。

### 2. 运行单元测试

```bash
# 运行所有单元测试
npm run test

# 运行测试并显示 UI 界面
npm run test:ui

# 运行测试并生成覆盖率报告
npm run test:coverage

# 只运行认证相关测试
npm run test -- auth
```

### 3. 运行 E2E 测试

```bash
# 打开 Cypress 测试界面
npm run cypress:open

# 在命令行中运行 E2E 测试
npm run cypress:run
```

## 🧪 测试场景详解

### 登录测试页面功能

#### 1. API 连接测试
- **功能**: 测试与后端 API 的连接状态
- **测试端点**: `/health-status`
- **预期结果**: 显示连接成功或失败状态

#### 2. 用户登录测试
- **测试数据**:
  - 管理员: `admin` / `1q2w3E*`
  - 普通用户: `testuser` / `Test123!`
  - 无效用户: `invalid` / `wrongpass`

#### 3. 认证状态显示
- Token 状态
- 用户信息 (ID, 用户名, 邮箱, 角色)
- 认证状态 (已认证/未认证)

#### 4. 测试日志
- 实时显示测试操作日志
- 按时间倒序排列
- 支持清空日志功能

### 单元测试覆盖范围

#### 认证状态管理 (`auth.test.ts`)
```typescript
✅ 初始状态验证
✅ Token 设置和获取
✅ 用户信息管理
✅ 权限角色检查
✅ 认证状态清除
✅ 认证头生成
```

#### 登录组件测试 (`LoginTest.test.ts`)
```typescript
✅ 组件渲染测试
✅ 表单数据填充
✅ 登录成功处理
✅ 登录失败处理
✅ API 连接测试
✅ 日志管理功能
```

### E2E 测试场景

#### 基础功能测试
- 页面加载和渲染
- 表单填充和验证
- 按钮交互和状态

#### 登录流程测试
- 成功登录流程
- 失败登录处理
- 表单验证错误

#### 网络和性能测试
- 网络错误处理
- 慢速网络适应
- 响应式设计验证

#### 可访问性测试
- 键盘导航支持
- Enter 键表单提交
- 焦点管理

## 📊 测试数据说明

### 预设测试账户

| 类型 | 用户名 | 密码 | 用途 |
|------|--------|------|------|
| 管理员 | `admin` | `1q2w3E*` | 测试管理员权限登录 |
| 普通用户 | `testuser` | `Test123!` | 测试普通用户登录 |
| 无效用户 | `invalid` | `wrongpass` | 测试登录失败处理 |

### API 端点配置

- **基础 URL**: `VITE_API_BASE_URL` 环境变量 (默认: `https://localhost:44397`)
- **健康检查**: `GET /health-status`
- **用户登录**: `POST /connect/token`
- **用户信息**: `GET /api/account/my-profile`
- **用户登出**: `POST /api/account/logout`

## 🔧 测试配置

### Vitest 配置 (`vitest.config.ts`)
```typescript
- 测试环境: jsdom
- 全局变量: 启用
- 设置文件: src/test/setup.ts
- 路径别名: 与 Vite 配置一致
```

### Cypress 配置 (`cypress.config.ts`)
```typescript
- 基础 URL: http://localhost:11369
- 视口大小: 1280x720
- 测试文件: cypress/e2e/**/*.cy.{js,ts}
- 支持文件: cypress/support/e2e.ts
```

### 测试环境设置 (`src/test/setup.ts`)
```typescript
- Pinia 状态管理初始化
- localStorage 模拟
- matchMedia 模拟
- Vue Test Utils 全局配置
```

## 📈 测试报告

### 运行测试并查看结果

1. **单元测试报告**:
   ```bash
   npm run test:coverage
   ```
   - 生成覆盖率报告
   - 显示测试通过率
   - 标识未覆盖的代码

2. **E2E 测试报告**:
   ```bash
   npm run cypress:run
   ```
   - 生成测试视频
   - 截图记录
   - 测试执行时间统计

### 测试结果解读

- ✅ **通过**: 功能正常工作
- ❌ **失败**: 需要检查代码或配置
- ⚠️ **跳过**: 测试被跳过或条件不满足

## 🐛 常见问题排查

### 1. API 连接失败
**问题**: 测试页面显示 "API 连接失败"
**解决方案**:
- 检查后端服务是否启动
- 验证 `VITE_API_BASE_URL` 环境变量
- 检查网络连接和防火墙设置

### 2. 登录测试失败
**问题**: 使用测试账户登录失败
**解决方案**:
- 确认后端数据库中存在测试用户
- 检查密码是否正确
- 验证认证服务配置

### 3. 单元测试失败
**问题**: `npm run test` 执行失败
**解决方案**:
- 检查依赖是否完整安装
- 验证测试环境配置
- 查看具体错误信息

### 4. E2E 测试失败
**问题**: Cypress 测试无法运行
**解决方案**:
- 确保开发服务器正在运行
- 检查端口 11369 是否可访问
- 验证 Cypress 配置

## 🔄 持续集成

### GitHub Actions 配置示例

```yaml
name: 测试流水线
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
      - run: npm run cypress:run
```

## 📚 扩展测试

### 添加新的测试用例

1. **单元测试**:
   ```typescript
   // src/stores/__tests__/新功能.test.ts
   import { describe, it, expect } from 'vitest'
   
   describe('新功能测试', () => {
     it('应该正确处理新功能', () => {
       // 测试代码
     })
   })
   ```

2. **E2E 测试**:
   ```typescript
   // cypress/e2e/新功能.cy.ts
   describe('新功能 E2E 测试', () => {
     it('应该完成新功能流程', () => {
       cy.visit('/new-feature')
       // 测试步骤
     })
   })
   ```

### 性能测试

使用 Lighthouse CI 或其他性能测试工具：

```bash
# 安装 Lighthouse CI
npm install -g @lhci/cli

# 运行性能测试
lhci autorun
```

## 📞 技术支持

如果在测试过程中遇到问题，请：

1. 查看控制台错误信息
2. 检查网络请求状态
3. 验证环境配置
4. 参考本文档的故障排除部分

---

**注意**: 本测试项目基于 SmartAbp 框架构建，确保后端服务正确配置并运行，以获得最佳测试效果。
# SmartAbp 代码风格与约定

## 目录结构约定

### 前端目录结构
```
src/SmartAbp.Vue/src/
├── views/                  # 页面视图（按模块分组）
│   ├── user/              # 用户管理模块
│   ├── project/           # 项目管理模块
│   ├── log/               # 日志管理模块
│   ├── system/            # 系统管理模块
│   ├── auth/              # 认证相关页面
│   └── common/            # 通用页面
├── components/             # 组件（按功能分组）
│   ├── layout/            # 布局组件
│   ├── user/              # 用户相关组件
│   ├── log/               # 日志相关组件
│   ├── auth/              # 认证相关组件
│   ├── theme/             # 主题相关组件
│   └── common/            # 通用组件
├── stores/                # 状态管理
│   └── modules/           # 按模块分组的stores
├── styles/                # 样式文件
├── composables/           # 组合式函数
├── utils/                 # 工具函数
└── router/                # 路由配置
```

## 命名规范

### 文件命名
- **Vue组件**: PascalCase `UserManagementView.vue`
- **TypeScript文件**: camelCase `userService.ts`
- **样式文件**: kebab-case `user-management.css`
- **目录**: kebab-case `user-management/`

### 变量命名
- **变量**: camelCase `userName`, `userList`
- **常量**: UPPER_SNAKE_CASE `API_BASE_URL`
- **函数**: camelCase `getUserList`, `handleUserCreate`
- **类**: PascalCase `UserService`, `ApiClient`

## Vue组件结构
```vue
<template>
  <!-- 使用语义化标签和BEM命名 -->
</template>

<script setup lang="ts">
// 1. 导入顺序：Vue -> 第三方 -> 项目内部
// 2. 类型定义
// 3. 响应式变量
// 4. 计算属性
// 5. 方法定义
// 6. 生命周期
</script>

<style scoped>
/* 使用设计系统变量，遵循BEM命名规范 */
</style>
```

## TypeScript规范
- 严格类型定义，避免使用 `any`
- 使用接口定义数据结构
- 使用泛型提高代码复用性
- 编写类型守卫函数

## Git提交规范
```
feat: 添加用户管理功能
fix: 修复登录状态丢失问题
docs: 更新API文档
style: 优化用户列表样式
refactor: 重构主题系统
test: 添加用户服务单元测试
chore: 更新依赖包版本
```
# 🏗️ SmartAbp架构合规性规则

## 前端架构约束（Vue + TS）
- 强制模块化导入（import { ref } from 'vue'），禁止 import * as Vue
- 目录结构：views/、components/、stores/modules/、styles/design-system/
- 依赖层次：
  - 允许：Views → Components → Composables → Utils；Stores → Services → Utils
  - 禁止：Utils → Views；Components → Views；Services → Stores

## 后端架构约束（ABP vNext）
- 分层：Web → HttpApi → Application → Domain；EFCore → Domain
- 禁止：Domain 依赖 Application/Infrastructure；跨层直接调用

## 设计系统强制使用
- 必须使用 CSS 变量（var(--theme-…）），禁止硬编码颜色/间距/圆角等

## 文件命名规范
- Vue组件：UserListView.vue / UserCard.vue / BaseButton.vue
- TS文件：userService.ts / userTypes.ts / useUser.ts
- 禁止：userList.vue、User_List.vue、user_service.ts、userServiceImpl.ts

## 状态管理（Pinia）
- 模块化 store，返回 state/getters/actions；禁止在全局 index.ts 集中定义所有状态

## 类型安全
- 接口类型明确，禁止 any；开启严格模式（tsconfig strict 等）

## 合规性度量（必须达到）
- 目录结构/命名规范/设计系统使用率 100%
- 类型覆盖率 >95%，重复代码率 <5%

---
违反架构规则会迅速积累技术债，务必严格遵守。
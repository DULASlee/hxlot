---
inclusion: always
---

# 🏗️ SmartAbp架构合规性规则

## 📋 强制架构原则

### 1. 前端架构约束 (Vue 3.5.13 + TypeScript 8.41.0)
**Vue.js + TypeScript 项目结构：**

```typescript
// ✅ 强制使用：Vue 3 Composition API + <script setup>
<script setup lang="ts">
import { ref, computed } from "vue" // WHY: 双引号符合项目.prettierrc.json配置
import { useUserStore } from "@/stores/modules/user"
import type { UserInfo } from "@/types/user"

// ✅ 强制使用：Element Plus组件
import { ElButton, ElTable } from "element-plus"
import type { FormInstance } from "element-plus"

// ✅ 强制使用：响应式数据
const users = ref<UserInfo[]>([])
const loading = ref(false)

// ✅ 强制使用：计算属性
const activeUsers = computed(() => 
  users.value.filter(user => user.isActive)
)
</script>

// ❌ 严禁：Options API (已废弃)
export default {
  data() { return {} }, // 禁止使用
  methods: {} // 禁止使用
}

// ❌ 严禁：全局导入
import * as Vue from "vue"

// ❌ 严禁：单引号 (违反项目.prettierrc.json配置)
import { ref } from 'vue' // 错误：应使用双引号

// ❌ 严禁：分号结尾 (违反项目.prettierrc.json配置)
import { ref } from "vue"; // 错误：不应使用分号
```

### 2. 后端架构约束 (ABP vNext + .NET)
**ABP vNext 分层架构：**

```csharp
// ✅ 强制遵循：DDD分层架构
namespace SmartAbp.Application.Users
{
    [Authorize(SmartAbpPermissions.Users.Default)] // WHY: 必须包含权限检查
    public class UserAppService : SmartAbpAppService, IUserAppService
    {
        private readonly IRepository<User, Guid> _userRepository;
        
        public UserAppService(IRepository<User, Guid> userRepository)
        {
            _userRepository = userRepository;
        }
        
        // ✅ 强制使用：标准CRUD模式
        public virtual async Task<PagedResultDto<UserDto>> GetListAsync(GetUserListDto input)
        {
            var query = await _userRepository.GetQueryableAsync();
            // 实现分页查询逻辑
        }
    }
}

// ✅ 强制遵循：接口契约定义
namespace SmartAbp.Application.Contracts.Users
{
    public interface IUserAppService : ICrudAppService<
        UserDto,
        Guid,
        GetUserListDto,
        CreateUserDto,
        UpdateUserDto>
    {
        // 扩展方法定义
    }
}

// ❌ 严禁：跨层直接调用
// 应用层直接调用基础设施层 = 禁止
// 域层依赖应用层 = 禁止
// Web层直接调用仓储 = 禁止
```

## 🎯 目录结构强制性检查

### 前端目录合规性 (基于实际项目结构)
```bash
# ✅ 必须存在的目录结构 (与实际项目同步)
src/SmartAbp.Vue/src/
├── views/                     # ✅ 页面视图层
│   ├── codegen/              # ✅ 代码生成模块
│   │   ├── designer/         # ✅ 可视化设计器
│   │   └── VisualDesignerView.vue # ✅ 主设计器页面
│   ├── user/                 # ✅ 用户管理模块
│   ├── system/               # ✅ 系统管理模块
│   └── dashboard/            # ✅ 仪表板模块
├── components/               # ✅ 可复用组件
│   ├── common/               # ✅ 通用组件
│   ├── forms/                # ✅ 表单组件
│   └── charts/               # ✅ 图表组件
├── stores/                   # ✅ Pinia状态管理
│   └── modules/              # ✅ 模块化Store
├── composables/              # ✅ Vue 3组合函数
├── utils/                    # ✅ 工具函数
├── types/                    # ✅ TypeScript类型定义
├── styles/                   # ✅ 样式文件
├── core/                     # ✅ 核心功能
│   └── api/                  # ✅ API客户端 (openapi生成)
├── packages/                 # ✅ 低代码引擎包
│   ├── lowcode-core/         # ✅ 低代码核心
│   ├── lowcode-designer/     # ✅ 可视化设计器
│   ├── lowcode-codegen/      # ✅ 代码生成器
│   ├── lowcode-api/          # ✅ API管理
│   └── lowcode-ui-vue/       # ✅ Vue UI组件库
└── assets/                   # ✅ 静态资源

# ✅ 后端目录结构 (ABP vNext标准)
src/
├── SmartAbp.Application/          # ✅ 应用服务层
├── SmartAbp.Application.Contracts/ # ✅ 应用服务契约
├── SmartAbp.Domain/               # ✅ 域层
├── SmartAbp.Domain.Shared/        # ✅ 域共享
├── SmartAbp.EntityFrameworkCore/  # ✅ 数据访问层
├── SmartAbp.HttpApi/              # ✅ HTTP API层
├── SmartAbp.HttpApi.Client/       # ✅ HTTP客户端
├── SmartAbp.Web/                  # ✅ Web宿主
├── SmartAbp.DbMigrator/           # ✅ 数据库迁移
└── SmartAbp.CodeGenerator/        # ✅ 代码生成器
```

### 禁止的目录结构
```bash
# ❌ 严禁的目录结构
src/SmartAbp.Vue/src/
├── views/all-views/          # ❌ 禁止扁平化堆积
├── components/misc/          # ❌ 禁止杂项目录
├── styles/themes/            # ❌ 禁止多套主题系统 (使用Element Plus主题)
├── utils/helpers/            # ❌ 禁止模糊命名
├── lib/                      # ❌ 禁止lib目录 (使用packages/)
└── shared/                   # ❌ 禁止shared目录 (使用composables/)

# ❌ 严禁的后端目录结构
src/
├── SmartAbp.Common/          # ❌ 禁止Common层 (使用Domain.Shared)
├── SmartAbp.Infrastructure/  # ❌ 禁止Infrastructure层 (使用EntityFrameworkCore)
└── SmartAbp.Services/        # ❌ 禁止Services层 (使用Application)
```

## 🔗 依赖关系规则

### 前端依赖层次 (Vue 3 + TypeScript + Element Plus)
```typescript
// ✅ 允许的依赖关系
Views → Components → Composables → Utils → Types
Views → Stores (通过composables)
Views → Core/API (通过services)
Stores → Core/API → Utils → Types
Components → Stores (通过composables)
Components → Element Plus组件
Packages/Lowcode → Core → Utils → Types

// ✅ 具体示例 (基于项目实际路径配置)
// views/user/UserManagement.vue
import { useUserStore } from "@/stores/modules/user"        // ✅ 视图使用Store
import { UserCard } from "@/components/user/UserCard.vue"   // ✅ 视图使用组件
import { ElButton, ElTable } from "element-plus"           // ✅ 使用Element Plus

// stores/modules/user.ts
import { userService } from "@/core/api/services/userService" // ✅ Store使用API服务
import type { UserInfo } from "@/types/user"                 // ✅ Store使用类型

// components/user/UserCard.vue
import { useUserActions } from "@/composables/useUserActions" // ✅ 组件使用组合函数
import { formatDate } from "@/utils/dateUtils"               // ✅ 组件使用工具函数

// 低代码引擎包导入 (基于项目实际配置)
import { LowcodeCore } from "@smartabp/lowcode-core"         // ✅ 低代码核心包
import { Designer } from "@smartabp/lowcode-designer"       // ✅ 设计器包
import { CodeGenerator } from "@smartabp/lowcode-codegen"   // ✅ 代码生成器包

// ❌ 禁止的依赖关系
Utils → Views           // ❌ 工具不能依赖视图
Utils → Components      // ❌ 工具不能依赖组件
Utils → Stores          // ❌ 工具不能依赖状态
Components → Views      // ❌ 组件不能依赖视图
Core/API → Stores       // ❌ API服务不能依赖状态
Types → 任何实现层       // ❌ 类型定义不能依赖实现
Composables → Views     // ❌ 组合函数不能依赖视图
```

### 后端依赖层次 (ABP vNext标准)
```csharp
// ✅ 允许的依赖关系 (严格DDD分层)
Web → HttpApi → Application → Domain
Web → HttpApi → Application.Contracts
EntityFrameworkCore → Domain
HttpApi.Client → Application.Contracts
DbMigrator → EntityFrameworkCore → Domain
CodeGenerator → Application → Domain

// ✅ 具体示例
// SmartAbp.Web依赖关系
SmartAbp.Web → SmartAbp.HttpApi
SmartAbp.Web → SmartAbp.EntityFrameworkCore

// SmartAbp.Application依赖关系
SmartAbp.Application → SmartAbp.Domain
SmartAbp.Application → SmartAbp.Application.Contracts

// SmartAbp.EntityFrameworkCore依赖关系
SmartAbp.EntityFrameworkCore → SmartAbp.Domain

// ❌ 禁止的依赖关系 (违反DDD原则)
Domain → Application           // ❌ 域层不能依赖应用层
Domain → EntityFrameworkCore   // ❌ 域层不能依赖基础设施层
Domain → HttpApi              // ❌ 域层不能依赖API层
Application.Contracts → Application // ❌ 契约不能依赖实现
HttpApi → EntityFrameworkCore // ❌ API层不能直接依赖数据层
```

## 🎨 设计系统强制使用 (Element Plus + 自定义主题)

### Element Plus主题变量使用规范
```css
/* ✅ 强制使用：Element Plus CSS变量 */
.user-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  padding: var(--el-spacing-large);
  border-radius: var(--el-border-radius-base);
  color: var(--el-text-color-primary);
  box-shadow: var(--el-box-shadow-light);
}

/* ✅ 强制使用：Element Plus组件类名 */
.custom-button {
  @apply el-button el-button--primary;
}

/* ✅ 强制使用：响应式设计 */
.responsive-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--el-spacing-large);
}

/* ❌ 严禁使用：硬编码值 (违反设计系统) */
.user-card {
  background: #ffffff;     /* 禁止：应使用 var(--el-bg-color) */
  border: 1px solid #dcdfe6; /* 禁止：应使用 var(--el-border-color) */
  padding: 20px;           /* 禁止：应使用 var(--el-spacing-large) */
  border-radius: 4px;      /* 禁止：应使用 var(--el-border-radius-base) */
  color: #303133;          /* 禁止：应使用 var(--el-text-color-primary) */
}

/* ❌ 严禁使用：自定义颜色 (破坏主题一致性) */
.custom-color {
  color: #ff6b6b;          /* 禁止：未定义的颜色 */
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4); /* 禁止：自定义渐变 */
}
```

### Element Plus主题系统约束
```typescript
// ✅ 强制使用：Element Plus主题配置 (基于项目实际配置)
// main.ts 中的配置
import { ElConfigProvider } from "element-plus"
import zhCn from "element-plus/dist/locale/zh-cn.mjs"

// ✅ 正确的主题配置方式 (无分号，符合.prettierrc.json)
const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn,
  // 使用Element Plus内置主题变量
})

// ✅ 强制使用：CSS变量覆盖 (在全局样式中)
:root {
  --el-color-primary: #409eff;        // ✅ 覆盖主色调
  --el-color-success: #67c23a;        // ✅ 覆盖成功色
  --el-color-warning: #e6a23c;        // ✅ 覆盖警告色
  --el-color-danger: #f56c6c;         // ✅ 覆盖危险色
  --el-font-size-base: 14px;          // ✅ 覆盖基础字体大小
}

// ✅ 强制使用：组合函数管理主题
// composables/useTheme.ts
export const useTheme = () => {
  const isDark = ref(false)
  
  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle("dark", isDark.value)
  }
  
  return { isDark, toggleTheme }
}

// ❌ 严禁：直接操作DOM样式 (破坏响应式)
document.documentElement.style.setProperty("--color", "#custom") // 禁止
document.body.style.backgroundColor = "#ffffff" // 禁止

// ❌ 严禁：多套主题系统 (造成冲突)
import AnotherUILibrary from "another-ui" // 禁止引入其他UI库
```

### Sass/SCSS使用规范 (与Element Plus集成)
```scss
// ✅ 强制使用：Element Plus Sass变量
@use "element-plus/theme-chalk/src/common/var.scss" as *;

.custom-component {
  // ✅ 使用Element Plus变量
  color: $el-text-color-primary;
  background: $el-bg-color;
  border: 1px solid $el-border-color;
  
  // ✅ 使用Element Plus混入
  @include when(hover) {
    background: $el-bg-color-page;
  }
}

// ❌ 严禁：自定义Sass变量 (与Element Plus冲突)
$custom-primary: #ff0000;  // 禁止：应使用Element Plus变量
$custom-spacing: 16px;     // 禁止：应使用Element Plus间距系统
```

## 📁 文件命名强制规范

### Vue组件命名 (PascalCase for components, kebab-case for files)
```typescript
// ✅ 正确命名 (页面级组件)
UserManagement.vue        // 用户管理页面
ProductList.vue           // 产品列表页面
VisualDesignerView.vue    // 可视化设计器页面 (实际项目中存在)

// ✅ 正确命名 (业务组件)
UserCard.vue              // 用户卡片组件
ProductForm.vue           // 产品表单组件
DataTable.vue             // 数据表格组件

// ✅ 正确命名 (基础组件 - Base前缀)
BaseButton.vue            // 基础按钮
BaseInput.vue             // 基础输入框
BaseModal.vue             // 基础模态框

// ✅ 正确命名 (低代码引擎组件)
DesignerCanvas.vue        // 设计器画布
ComponentPalette.vue      // 组件面板
PropertyPanel.vue         // 属性面板

// ❌ 错误命名
userManagement.vue        // 小写开头 (应为 UserManagement.vue)
User_Management.vue       // 下划线分隔 (应为 UserManagement.vue)
userManagementComponent.vue // 冗余后缀 (应为 UserManagement.vue)
user-management.vue       // 短横线命名 (应为 UserManagement.vue)
```

### TypeScript文件命名 (camelCase)
```typescript
// ✅ 正确命名 (服务文件)
userService.ts            // 用户服务
productService.ts         // 产品服务
authService.ts            // 认证服务

// ✅ 正确命名 (类型定义)
userTypes.ts              // 用户类型
apiTypes.ts               // API类型
commonTypes.ts            // 通用类型

// ✅ 正确命名 (组合函数 - use前缀)
useUser.ts                // 用户相关组合函数
useAuth.ts                // 认证相关组合函数
useTable.ts               // 表格相关组合函数

// ✅ 正确命名 (工具函数)
dateUtils.ts              // 日期工具
stringUtils.ts            // 字符串工具
validationUtils.ts        // 验证工具

// ✅ 正确命名 (常量文件)
constants.ts              // 通用常量
apiConstants.ts           // API常量
routeConstants.ts         // 路由常量

// ✅ 正确命名 (CLI工具 - 基于项目实际结构)
cli.ts                    // CLI工具入口
add-module.ts             // 模块添加工具

// ❌ 错误命名
UserService.ts            // 大写开头 (应为 userService.ts)
user_service.ts           // 下划线分隔 (应为 userService.ts)
userServiceImpl.ts        // 冗余后缀 (应为 userService.ts)
user-service.ts           // 短横线分隔 (应为 userService.ts)
```

### C#文件命名 (PascalCase - ABP标准)
```csharp
// ✅ 正确命名 (应用服务)
UserAppService.cs         // 用户应用服务
ProductAppService.cs      // 产品应用服务

// ✅ 正确命名 (DTO)
UserDto.cs                // 用户DTO
CreateUserDto.cs          // 创建用户DTO
UpdateUserDto.cs          // 更新用户DTO
GetUserListDto.cs         // 获取用户列表DTO

// ✅ 正确命名 (接口)
IUserAppService.cs        // 用户应用服务接口
IUserRepository.cs        // 用户仓储接口

// ✅ 正确命名 (实体)
User.cs                   // 用户实体
Product.cs                // 产品实体
AuditLog.cs               // 审计日志实体

// ✅ 正确命名 (权限)
SmartAbpPermissions.cs    // 权限定义
UserPermissions.cs        // 用户权限

// ❌ 错误命名
userAppService.cs         // 小写开头 (应为 UserAppService.cs)
User_App_Service.cs       // 下划线分隔 (应为 UserAppService.cs)
UserAppServiceImpl.cs     // 冗余后缀 (应为 UserAppService.cs)
```

### 正确的目录命名 (kebab-case for directories)
src/views/user-management/     # 用户管理视图目录
src/components/data-display/   # 数据展示组件目录
src/composables/use-auth/      # 认证组合函数目录

# ✅ 正确的包目录命名 (kebab-case - 基于项目实际结构)
packages/lowcode-core/         # 低代码核心包
packages/lowcode-designer/     # 低代码设计器包
packages/lowcode-codegen/      # 低代码生成器包
packages/lowcode-api/          # 低代码API包
packages/lowcode-ui-vue/       # 低代码Vue UI组件库

# ❌ 错误的目录命名
src/views/UserManagement/      # PascalCase (应为 user-management)
src/views/user_management/     # 下划线 (应为 user-management)
src/components/dataDisplay/    # camelCase (应为 data-display)
```

## 🔄 状态管理架构 (Pinia 3.0.3 + TypeScript)

// WHY: 更新版本号与package.json保持一致

### Pinia Store结构 (Composition API风格)
```typescript
// ✅ 强制使用：模块化Store (Composition API)
// stores/modules/user.ts
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { ElMessage } from "element-plus"
import { userService } from "@/core/api/services/userService"
import type { UserInfo, CreateUserDto, UpdateUserDto, GetUserListDto } from "@/types/user"

export const useUserStore = defineStore("user", () => {
  // ✅ 状态定义 (使用ref)
  const users = ref<UserInfo[]>([])
  const currentUser = ref<UserInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // ✅ 计算属性 (使用computed)
  const activeUsers = computed(() => 
    users.value.filter(user => user.isActive)
  )
  
  const totalActiveUsers = computed(() => activeUsers.value.length)
  
  const hasUsers = computed(() => users.value.length > 0)

  // ✅ 操作方法 (异步操作 + 错误处理)
  const fetchUsers = async (params?: GetUserListDto) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await userService.getList(params)
      users.value = response.items
      pagination.value.total = response.totalCount
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取用户列表失败"
      ElMessage.error(error.value)
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData: CreateUserDto) => {
    try {
      loading.value = true
      const newUser = await userService.create(userData)
      users.value.unshift(newUser)
      ElMessage.success("用户创建成功")
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : "创建用户失败"
      ElMessage.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, userData: UpdateUserDto) => {
    try {
      loading.value = true
      const updatedUser = await userService.update(id, userData)
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      ElMessage.success("用户更新成功")
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : "更新用户失败"
      ElMessage.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    try {
      loading.value = true
      await userService.delete(id)
      users.value = users.value.filter(user => user.id !== id)
      ElMessage.success("用户删除成功")
    } catch (err) {
      error.value = err instanceof Error ? err.message : "删除用户失败"
      ElMessage.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ 重置方法
  const resetState = () => {
    users.value = []
    currentUser.value = null
    loading.value = false
    error.value = null
    pagination.value = { current: 1, pageSize: 10, total: 0 }
  }

  // ✅ 返回所有状态和方法
  return {
    // 状态
    users,
    currentUser,
    loading,
    error,
    pagination,
    // 计算属性
    activeUsers,
    totalActiveUsers,
    hasUsers,
    // 方法
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetState
  }
})

// ✅ 强制使用：类型安全的Store使用
// 在组件中使用
export const useUserStoreWithRefs = () => {
  return storeToRefs(useUserStore())
}
```

### Store组织结构规范
```typescript
// ✅ 强制的Store目录结构
stores/
├── index.ts              # Store入口文件
├── modules/              # 模块化Store
│   ├── user.ts          # 用户Store
│   ├── auth.ts          # 认证Store
│   ├── product.ts       # 产品Store
│   ├── system.ts        # 系统Store
│   └── lowcode.ts       # 低代码引擎Store
└── types/               # Store类型定义
    ├── user.ts
    ├── auth.ts
    └── common.ts

// ✅ stores/index.ts - 统一导出
export { useUserStore } from "./modules/user"
export { useAuthStore } from "./modules/auth"
export { useProductStore } from "./modules/product"
export { useSystemStore } from "./modules/system"
export { useLowcodeStore } from "./modules/lowcode"

// ✅ 强制使用：Store命名约定
// 文件名: camelCase (user.ts, productCategory.ts)
// Store名称: camelCase ("user", "productCategory")
// 导出函数: use + PascalCase + Store (useUserStore, useProductCategoryStore)
```

### Store使用规范 (在组件中)
```vue
<script setup lang="ts">
// ✅ 强制使用：正确的Store导入和使用
import { storeToRefs } from "pinia"
import { useUserStore } from "@/stores/modules/user"

// ✅ 获取Store实例
const userStore = useUserStore()

// ✅ 响应式解构 (使用storeToRefs)
const { users, loading, activeUsers } = storeToRefs(userStore)

// ✅ 方法直接解构 (不需要storeToRefs)
const { fetchUsers, createUser, updateUser, deleteUser } = userStore

// ✅ 生命周期中调用
onMounted(() => {
  fetchUsers()
})

// ❌ 错误的Store使用方式
const { users, loading } = userStore // 错误：失去响应性
const users = userStore.users // 错误：失去响应性
</script>
```

### 禁止的Store模式
```typescript
// ❌ 严禁：Options API风格的Store
export const useUserStore = defineStore("user", {
  state: () => ({}),    // 禁止使用
  getters: {},          // 禁止使用
  actions: {}           // 禁止使用
})

// ❌ 严禁：全局Store (所有状态混在一起)
// stores/index.ts
export const useGlobalStore = defineStore("global", () => {
  const users = ref([])
  const products = ref([])
  const orders = ref([])
  // ... 所有状态混在一起 - 禁止
})

// ❌ 严禁：Store间直接依赖
// stores/modules/product.ts
import { useUserStore } from "./user" // 禁止Store间直接导入

export const useProductStore = defineStore("product", () => {
  const userStore = useUserStore() // 禁止在Store内部使用其他Store
})

// ✅ 正确方式：通过组合函数或组件层面协调多个Store
// composables/useUserProduct.ts
export const useUserProduct = () => {
  const userStore = useUserStore()
  const productStore = useProductStore()
  
  // 在组合函数中协调多个Store
  return { userStore, productStore }
}
```

## 🛡️ 类型安全强制要求 (TypeScript 5.8 严格模式)

### TypeScript严格模式配置 (已启用)
```json
// tsconfig.json - 当前项目配置
{
  "compilerOptions": {
    "target": "ES2020",                    // ✅ 现代JS目标
    "module": "ESNext",                    // ✅ ESM模块
    "moduleResolution": "Bundler",         // ✅ Bundler解析
    "strict": true,                        // ✅ 严格模式
    "noUnusedLocals": true,               // ✅ 禁止未使用变量
    "noUnusedParameters": true,           // ✅ 禁止未使用参数
    "noFallthroughCasesInSwitch": true,   // ✅ Switch穿透检查
    "isolatedModules": true,              // ✅ 隔离模块
    "allowImportingTsExtensions": true,   // ✅ 允许TS扩展名导入
    "noEmit": true                        // ✅ 不生成文件(Vite处理)
  }
}
```

### 强制类型定义规范
```typescript
// ✅ 强制使用：完整的接口定义
interface UserCreateRequest {
  name: string
  email: string
  role: UserRole
  avatar?: string                         // ✅ 可选属性明确标记
  metadata: Record<string, unknown>       // ✅ 使用Record而非any
}

interface UserInfo {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  avatar?: string
}

// ✅ 强制使用：枚举类型
enum UserRole {
  Admin = "admin",
  User = "user",
  Guest = "guest"
}

// ✅ 强制使用：联合类型
type UserStatus = "active" | "inactive" | "pending" | "suspended"

// ✅ 强制使用：泛型约束
interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
  code: number
}

interface PagedResult<T> {
  items: T[]
  totalCount: number
  hasNext: boolean
  hasPrevious: boolean
}

// ✅ 强制使用：严格的函数签名
const createUser = async (data: UserCreateRequest): Promise<ApiResponse<UserInfo>> => {
  // 实现逻辑
  return {
    success: true,
    data: newUser,
    message: "用户创建成功",
    code: 200
  }
}

const getUserList = async (
  params: GetUserListDto
): Promise<ApiResponse<PagedResult<UserInfo>>> => {
  // 实现逻辑
}

// ✅ 强制使用：类型守卫
const isUserInfo = (obj: unknown): obj is UserInfo => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as UserInfo).id === "string" &&
    typeof (obj as UserInfo).name === "string" &&
    typeof (obj as UserInfo).email === "string"
  )
}

// ✅ 强制使用：断言函数
const assertIsUserInfo = (obj: unknown): asserts obj is UserInfo => {
  if (!isUserInfo(obj)) {
    throw new Error("Invalid UserInfo object")
  }
}
```

### Vue 3组件类型安全
```vue
<script setup lang="ts">
// ✅ 强制使用：defineProps with TypeScript
interface Props {
  user: UserInfo
  editable?: boolean
  onSave?: (user: UserInfo) => void
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

// ✅ 强制使用：defineEmits with TypeScript
interface Emits {
  update: [user: UserInfo]
  delete: [id: string]
  error: [message: string]
}

const emit = defineEmits<Emits>()

// ✅ 强制使用：ref with explicit types
const loading = ref<boolean>(false)
const users = ref<UserInfo[]>([])
const currentUser = ref<UserInfo | null>(null)

// ✅ 强制使用：computed with return type inference
const activeUsers = computed(() => 
  users.value.filter(user => user.isActive)
) // 自动推断为 ComputedRef<UserInfo[]>

// ✅ 强制使用：reactive with interface
interface FormState {
  name: string
  email: string
  role: UserRole
}

const formState = reactive<FormState>({
  name: "",
  email: "",
  role: UserRole.User
})

// ✅ 强制使用：watch with typed source
watch(
  () => props.user,
  (newUser: UserInfo, oldUser: UserInfo | undefined) => {
    // 处理用户变化
  },
  { deep: true }
)
</script>

<template>
  <!-- ✅ 强制使用：类型安全的模板 -->
  <div>
    <h1>{{ props.user.name }}</h1>
    <p>{{ props.user.email }}</p>
    <el-button 
      @click="emit('update', props.user)"
      :disabled="!props.editable"
    >
      更新用户
    </el-button>
  </div>
</template>
```

### Pinia Store类型安全
```typescript
// ✅ 强制使用：完整的Store类型定义
interface UserState {
  users: UserInfo[]
  currentUser: UserInfo | null
  loading: boolean
  error: string | null
}

interface UserActions {
  fetchUsers: (params?: GetUserListDto) => Promise<void>
  createUser: (data: UserCreateRequest) => Promise<UserInfo>
  updateUser: (id: string, data: UpdateUserDto) => Promise<UserInfo>
  deleteUser: (id: string) => Promise<void>
}

// ✅ Store类型导出
export type UserStore = UserState & UserActions

export const useUserStore = defineStore("user", (): UserStore => {
  // 实现
})
```

### API服务类型安全
```typescript
// ✅ 强制使用：完整的API服务类型
class UserService {
  async getList(params?: GetUserListDto): Promise<ApiResponse<PagedResult<UserInfo>>> {
    const response = await apiClient.get<ApiResponse<PagedResult<UserInfo>>>(
      "/api/users",
      { params }
    )
    return response.data
  }

  async create(data: UserCreateRequest): Promise<ApiResponse<UserInfo>> {
    const response = await apiClient.post<ApiResponse<UserInfo>>(
      "/api/users",
      data
    )
    return response.data
  }

  async update(id: string, data: UpdateUserDto): Promise<ApiResponse<UserInfo>> {
    const response = await apiClient.put<ApiResponse<UserInfo>>(
      `/api/users/${id}`,
      data
    )
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/users/${id}`)
    return response.data
  }
}

export const userService = new UserService()
```

### 严禁的类型使用
```typescript
// ❌ 严禁：any类型 (除非极特殊情况)
const createUser = async (data: any): Promise<any> => {
  // 禁止使用any
}

// ❌ 严禁：unknown without type guards
const processData = (data: unknown) => {
  return data.someProperty // 错误：未进行类型检查
}

// ❌ 严禁：类型断言 without validation
const user = data as UserInfo // 错误：未验证类型

// ❌ 严禁：非空断言 without null check
const userName = user!.name // 错误：未检查user是否为null

// ❌ 严禁：Object类型
const config: Object = {} // 错误：应使用具体接口或Record<string, unknown>

// ❌ 严禁：Function类型
const callback: Function = () => {} // 错误：应使用具体函数签名

// ❌ 严禁：空接口
interface EmptyInterface {} // 错误：应使用Record<string, never>或具体属性

// ✅ 正确的替代方案
const processData = (data: unknown) => {
  if (isUserInfo(data)) {
    return data.name // ✅ 类型安全
  }
  throw new Error("Invalid data")
}

const user = assertIsUserInfo(data) ? data : null // ✅ 验证后使用

const userName = user?.name ?? "Unknown" // ✅ 可选链和空值合并

const config: Record<string, unknown> = {} // ✅ 明确的对象类型

const callback: (data: UserInfo) => void = () => {} // ✅ 具体函数签名
```

### TypeScript配置验证
```bash
# ✅ 强制执行的类型检查命令
npm run type-check  # 等同于 tsc --noEmit
npm run lint        # ESLint类型相关规则检查

# ✅ 必须通过的检查项
- 无TypeScript编译错误
- 无未使用的变量和参数
- 无隐式any类型
- 无类型断言滥用
- 无非空断言滥用
```

## 🚨 自动检查机制 (基于项目实际配置)

### 代码提交前检查 (precommit-check脚本)
```bash
# ✅ 当前项目的自动检查序列 (package.json中已配置)
npm run precommit-check

# 等同于执行以下命令序列:
1. tsc --noEmit                    # TypeScript类型检查
2. cross-env ESLINT_USE_FLAT_CONFIG=false eslint -c .eslintrc.cjs . --fix  # ESLint检查和修复
3. vitest run --coverage          # 单元测试和覆盖率检查
4. vite build                     # 构建检查

# ✅ 额外的架构合规性检查
5. 目录结构合规性检查            # 验证目录结构符合规范
6. 命名规范检查                  # 验证文件和组件命名
7. 依赖关系检查                  # 验证模块间依赖关系
8. Element Plus使用检查          # 验证UI组件使用规范
9. Pinia Store结构检查           # 验证状态管理结构
10. 低代码引擎架构检查           # 验证微内核架构约束
```

### Husky Git Hooks配置
```json
// ✅ 当前项目已配置的Git Hooks
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.vue": ["eslint --fix", "prettier --write"],
    "*.{js,tsx,css,scss,md,json}": ["prettier --write"]
  }
}
```

### 违规自动处理机制
```typescript
// ✅ 违规处理级别
interface ViolationHandling {
  // 轻微违规 (自动修复)
  minor: {
    actions: ["auto-fix", "warning"],
    examples: [
      "代码格式不符合Prettier规范",
      "导入语句顺序错误",
      "缺少类型注解但可推断"
    ]
  }
  
  // 严重违规 (阻止提交)
  major: {
    actions: ["block-commit", "require-manual-fix"],
    examples: [
      "使用any类型",
      "跨层直接调用",
      "破坏微内核架构",
      "硬编码CSS值",
      "Store间直接依赖"
    ]
  }
  
  // 重复违规 (人工审核)
  critical: {
    actions: ["lock-file", "manual-review", "architecture-review"],
    examples: [
      "连续3次违反同一架构规则",
      "绕过类型检查",
      "破坏设计系统一致性"
    ]
  }
}
```

### 实时检查工具集成
```bash
# ✅ VS Code / Cursor集成检查
- TypeScript Language Server    # 实时类型检查
- ESLint Extension             # 实时代码质量检查
- Prettier Extension           # 实时格式化
- Vetur/Volar Extension        # Vue文件支持
- Element Plus Snippets        # Element Plus代码片段

# ✅ 构建时检查
- Vite Plugin ESLint           # 构建时ESLint检查
- Vue TSC Plugin               # 构建时TypeScript检查
- Vitest Coverage              # 测试覆盖率检查
```

## 📊 合规性度量 (基于项目实际标准)

### 必须达到的指标 (当前项目标准)
```typescript
interface ComplianceMetrics {
  // ✅ 代码质量指标 (基于vitest.config.ts)
  testCoverage: {
    statements: 80,              // 语句覆盖率 ≥80%
    branches: 75,                // 分支覆盖率 ≥75%
    functions: 80,               // 函数覆盖率 ≥80%
    lines: 80                    // 行覆盖率 ≥80%
  }
  
  // ✅ TypeScript严格性指标
  typeScript: {
    strictMode: true,            // 严格模式 100%
    noImplicitAny: true,         // 禁止隐式any 100%
    typeAnnotationCoverage: 95,  // 类型注解覆盖率 ≥95%
    unusedVariables: 0           // 未使用变量 = 0
  }
  
  // ✅ 架构合规性指标
  architecture: {
    directoryStructure: 100,     // 目录结构合规率 100%
    namingConvention: 100,       // 命名规范合规率 100%
    dependencyRules: 100,        // 依赖关系合规率 100%
    layerViolations: 0           // 分层违规 = 0
  }
  
  // ✅ 设计系统指标
  designSystem: {
    elementPlusUsage: 100,       // Element Plus使用率 100%
    hardcodedStyles: 0,          // 硬编码样式 = 0
    cssVariableUsage: 100,       // CSS变量使用率 100%
    themeConsistency: 100        // 主题一致性 100%
  }
  
  // ✅ Vue 3规范指标
  vue3Standards: {
    compositionApiUsage: 100,    // Composition API使用率 100%
    scriptSetupUsage: 100,       // <script setup>使用率 100%
    optionsApiUsage: 0,          // Options API使用率 = 0
    reactivityCompliance: 100    // 响应式规范合规率 100%
  }
  
  // ✅ 低代码引擎指标
  lowcodeEngine: {
    microkernelCompliance: 100,  // 微内核架构合规率 100%
    pluginIsolation: 100,        // 插件隔离率 100%
    sandboxSecurity: 100,        // 沙箱安全性 100%
    performanceStandards: 95     // 性能标准达标率 ≥95%
  }
}
```

### 质量门槛检查点
```bash
# ✅ 必须通过的质量门槛 (基于项目scripts)
1. npm run type-check          # TypeScript编译检查 - 必须0错误
2. npm run lint               # ESLint检查 - 必须0错误
3. npm run test:coverage      # 测试覆盖率 - 必须达到阈值
4. npm run build              # 构建检查 - 必须成功
5. npm run stylelint          # 样式检查 - 必须0错误

# ✅ 架构合规性检查 (自定义脚本)
6. 目录结构验证               # 验证符合标准目录结构
7. 命名规范验证               # 验证文件和组件命名
8. 依赖关系验证               # 验证模块间依赖合规
9. 设计系统验证               # 验证Element Plus使用
10. 低代码引擎架构验证        # 验证微内核架构
```

### 持续监控指标
```typescript
// ✅ 实时监控的关键指标
interface ContinuousMonitoring {
  daily: {
    buildSuccessRate: 100,       // 构建成功率 100%
    testPassRate: 100,           // 测试通过率 100%
    lintErrorCount: 0,           // Lint错误数量 = 0
    typeErrorCount: 0            // 类型错误数量 = 0
  }
  
  weekly: {
    codeQualityTrend: "improving", // 代码质量趋势
    architectureDebt: "decreasing", // 架构债务趋势
    performanceMetrics: "stable",   // 性能指标趋势
    securityVulnerabilities: 0      // 安全漏洞数量 = 0
  }
  
  monthly: {
    technicalDebtRatio: "<10%",     // 技术债务比例 <10%
    maintainabilityIndex: ">80",    // 可维护性指数 >80
    cyclomaticComplexity: "<10",    // 圈复杂度 <10
    duplicationRate: "<5%"          // 重复代码率 <5%
  }
}
```

## 🚀 低代码引擎架构强制约束

### 微内核架构分层约束
**🔴 低代码引擎必须严格遵循微内核架构：**

```typescript
// ✅ 强制架构分层
src/lowcode/
├── kernel/                    # 🔥 微内核层 - 绝对稳定
│   ├── core.ts               # 核心引擎（禁止修改核心接口）
│   ├── types.ts              # 类型定义（向后兼容）
│   ├── plugin-manager.ts     # 插件管理器
│   └── schema-validator.ts   # Schema验证器
├── plugins/                   # 🔥 插件层 - 沙箱隔离
│   ├── vue3/                 # Vue3生成器插件
│   ├── react/                # React生成器插件
│   ├── abp/                  # ABP后端生成器插件
│   ├── uniapp/               # UniApp跨端生成器插件
│   └── common/               # 通用插件基础
├── schemas/                   # 🔥 Schema层 - 严格验证
│   ├── component.schema.json # 组件Schema定义
│   ├── page.schema.json      # 页面Schema定义
│   ├── api.schema.json       # API Schema定义
│   └── validation/           # 验证器实现
├── runtime/                   # 🔥 运行时层 - 执行环境
│   ├── sandbox.ts            # 沙箱执行环境
│   ├── monitor.ts            # 性能监控
│   └── security.ts           # 安全控制
└── examples/                  # 🔥 示例层 - 标准参考

// ❌ 严禁的架构违规
// plugins/ 直接调用其他 plugins/ = 禁止
// runtime/ 直接修改 kernel/ = 禁止
// examples/ 包含业务逻辑 = 禁止
```

### 低代码引擎依赖关系强制规则
**🔴 严格的依赖层次约束：**

```typescript
// ✅ 允许的依赖关系
kernel/ → (无外部依赖)           // 微内核完全自含
plugins/ → kernel/              // 插件依赖内核
runtime/ → kernel/ + plugins/   // 运行时依赖内核和插件
schemas/ → kernel/              // Schema依赖内核验证
examples/ → runtime/ + plugins/ // 示例依赖运行时和插件

// ❌ 禁止的依赖关系
kernel/ → plugins/              // ❌ 内核不能依赖插件
kernel/ → runtime/              // ❌ 内核不能依赖运行时
plugins/ → runtime/             // ❌ 插件不能依赖运行时
schemas/ → plugins/             // ❌ Schema不能依赖具体插件
plugins/vue3/ → plugins/react/ // ❌ 插件间不能直接依赖
```

### 低代码引擎接口强制标准
**🔴 统一的插件接口约束：**

```typescript
// ✅ 强制实现的插件接口
export interface CodegenPlugin<TSchema, TConfig, TResult> {
  // 必需的元数据
  readonly metadata: PluginMetadata;
  
  // 必需的生命周期方法
  canHandle(schema: any): boolean;
  validate(schema: TSchema): Promise<ValidationResult>;
  generate(schema: TSchema, config: TConfig, context: PluginContext): Promise<TResult>;
  
  // 可选的生命周期方法
  onInit?(): Promise<void>;
  onDestroy?(): Promise<void>;
  onError?(error: Error): Promise<void>;
}

// ✅ 强制的插件元数据结构
export interface PluginMetadata {
  name: string;                  // ✅ 必需：插件名称
  version: string;               // ✅ 必需：版本号
  description?: string;          // ✅ 可选：描述
  author?: string;               // ✅ 可选：作者
  dependencies: string[];        // ✅ 必需：依赖列表
  peerDependencies: string[];    // ✅ 必需：对等依赖
  target: FrameworkTarget[];     // ✅ 必需：目标框架
  capabilities: PluginCapability[]; // ✅ 必需：能力声明
}

// ❌ 严禁的插件实现
// 不实现必需方法的插件 = 禁止
// 不声明依赖关系的插件 = 禁止
// 不支持沙箱隔离的插件 = 禁止
// 直接访问DOM/文件系统的插件 = 禁止
```

### 低代码引擎安全架构约束
**🔴 沙箱隔离和安全边界：**

```typescript
// ✅ 强制的安全架构
interface SecurityArchitecture {
  // 插件沙箱隔离
  pluginSandbox: {
    isolatedContext: true,       // ✅ 隔离执行上下文
    resourceLimits: {            // ✅ 资源限制
      maxMemory: '50MB',
      maxExecutionTime: '5s',
      maxFileSize: '10MB'
    },
    permissionSystem: {          // ✅ 权限系统
      fileAccess: 'sandboxed',
      networkAccess: 'proxy',
      systemAccess: 'denied'
    }
  };
  
  // 代码生成安全边界
  codeGeneration: {
    inputValidation: true,       // ✅ 输入验证
    outputSanitization: true,    // ✅ 输出消毒
    codeInjectionPrevention: true, // ✅ 代码注入防护
    xssProtection: true          // ✅ XSS防护
  };
  
  // Schema安全验证
  schemaValidation: {
    strictMode: true,            // ✅ 严格模式
    additionalProperties: false, // ✅ 禁止额外属性
    depthLimit: 10,              // ✅ 深度限制
    sizeLimit: '1MB'             // ✅ 大小限制
  };
}

// ❌ 严禁的安全违规
// 插件直接访问宿主环境 = 禁止
// 绕过输入验证 = 禁止
// 生成包含安全漏洞的代码 = 禁止
// 不经过沙箱直接执行代码 = 禁止
```

### 低代码引擎性能架构要求
**🔴 性能优先的架构设计：**

```typescript
// ✅ 强制的性能架构
interface PerformanceArchitecture {
  // 代码生成性能
  codeGeneration: {
    maxGenerationTime: 156,      // ✅ 最大生成时间156ms
    batchProcessing: true,       // ✅ 批量处理支持
    incrementalGeneration: true, // ✅ 增量生成
    caching: {                   // ✅ 缓存策略
      schemaCache: true,
      templateCache: true,
      resultCache: true
    }
  };
  
  // 内存管理
  memoryManagement: {
    maxMemoryUsage: 200,         // ✅ 最大内存200MB
    garbageCollection: 'auto',   // ✅ 自动垃圾回收
    memoryLeakDetection: true,   // ✅ 内存泄漏检测
    resourcePooling: true        // ✅ 资源池化
  };
  
  // 并发处理
  concurrency: {
    maxConcurrentJobs: 100,      // ✅ 最大并发任务100
    queueManagement: true,       // ✅ 队列管理
    loadBalancing: true,         // ✅ 负载均衡
    backpressure: true           // ✅ 背压控制
  };
}

// ❌ 严禁的性能反模式
// 同步阻塞的代码生成 = 禁止
// 无限制的内存使用 = 禁止
// 不支持取消的长时间操作 = 禁止
// 没有缓存的重复计算 = 禁止
```

### 低代码引擎可扩展性架构
**🔴 面向未来的可扩展设计：**

```typescript
// ✅ 强制的可扩展性架构
interface ExtensibilityArchitecture {
  // 插件扩展机制
  pluginExtensions: {
    hotReloading: true,          // ✅ 热重载支持
    versionManagement: true,     // ✅ 版本管理
    dependencyResolution: true,  // ✅ 依赖解析
    apiVersioning: true          // ✅ API版本化
  };
  
  // Schema扩展机制
  schemaExtensions: {
    customTypes: true,           // ✅ 自定义类型
    inheritance: true,           // ✅ Schema继承
    composition: true,           // ✅ Schema组合
    backwardCompatibility: true  // ✅ 向后兼容
  };
  
  // 运行时扩展机制
  runtimeExtensions: {
    middlewareSupport: true,     // ✅ 中间件支持
    eventSystem: true,           // ✅ 事件系统
    hookSystem: true,            // ✅ 钩子系统
    configurationOverride: true // ✅ 配置覆盖
  };
}

// ❌ 严禁的扩展性反模式
// 硬编码的框架支持 = 禁止
// 不支持版本化的API = 禁止
// 破坏向后兼容性的更改 = 禁止
// 不支持配置化的固定实现 = 禁止
```

---

**🎯 架构一致性是项目成功的基石，违反架构规则将导致技术债务激增！**
**🚀 低代码引擎架构是智能化开发的基础，必须严格遵循微内核架构原则！**
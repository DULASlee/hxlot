import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import SmartAbpLayout from "@/components/layout/SmartAbpLayout.vue"
import LoginView from "@/views/auth/Login.vue"
import { useAuthStore } from "@/stores"
import { logger } from "@/utils/logger"
import { ElMessage } from "element-plus"
import { i18n } from "@/plugins/i18n"
import opsMonitoringRoutes from "./modules/ops-monitoring"

// 动态导入页面组件
const DashboardView = () => import("@/views/common/DashboardView.vue")
const UserManagement = () => import("@/views/user/UserManagement.vue")
const UserListView = () => import("@/views/user/UserListView.vue")
const UserRolesView = () => import("@/views/user/UserRolesView.vue")
const LoginTest = () => import("@/views/auth/LoginTest.vue")
const ForbiddenView = () => import("@/views/error/Forbidden.vue")

// 新增页面组件
const ProfileView = () => import("@/views/common/ProfileView.vue")
const SettingsView = () => import("@/views/common/SettingsView.vue")
const ProjectListView = () => import("@/views/project/ProjectListView.vue")
const ProjectAnalysisView = () => import("@/views/project/ProjectAnalysisView.vue")
const PermissionsView = () => import("@/views/system/PermissionsView.vue")
const UsersView = () => import("@/views/system/UsersView.vue")

const routes: RouteRecordRaw[] = [
  // 登录页面
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { 
      title: "登录",
      requiresAuth: false 
    },
  },
  {
    path: "/test/login",
    name: "LoginTest",
    component: LoginTest,
    meta: { requiresAuth: false, title: "登录功能测试" },
  },
  // 403 权限不足页面
  {
    path: "/403",
    name: "Forbidden",
    component: ForbiddenView,
    meta: { 
      title: "权限不足",
      requiresAuth: false 
    },
  },
  // 根路径重定向到工作台
  {
    path: "/",
    redirect: "/dashboard",
    meta: { 
      title: "首页",
      requiresAuth: false 
    },
  },
  // 工作台页面
  {
    path: "/dashboard",
    component: SmartAbpLayout,
    name: "Dashboard",
    meta: {
      title: "工作台",
      icon: "📊",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
    children: [
      {
        path: "",
        component: DashboardView,
        meta: { title: "工作台" },
      },
    ],
  },
  // 用户管理模块
  {
    path: "/User",
    component: SmartAbpLayout,
    meta: {
      title: "用户管理",
      icon: "👥",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
    children: [
      {
        path: "",
        name: "UserList",
        component: UserListView,
        meta: { title: "用户列表", menuKey: "user-list" },
      },
      {
        path: "management",
        name: "UserManagement",
        component: UserManagement,
        meta: { title: "用户管理", menuKey: "user-management" },
      },
      {
        path: "roles",
        name: "UserRoles",
        component: UserRolesView,
        meta: { title: "用户角色", menuKey: "user-roles" },
      },
    ],
  },
  // 项目管理模块
  {
    path: "/Project",
    component: SmartAbpLayout,
    meta: {
      title: "项目管理",
      icon: "📁",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
    children: [
      {
        path: "",
        name: "ProjectList",
        component: ProjectListView,
        meta: { title: "项目列表", menuKey: "project-list" },
      },
      {
        path: "analysis",
        name: "ProjectAnalysis",
        component: ProjectAnalysisView,
        meta: { title: "项目分析", menuKey: "project-analysis" },
      },
    ],
  },
  // 日志管理模块
  {
    path: "/Log",
    component: SmartAbpLayout,
    meta: {
      title: "日志管理",
      icon: "📋",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
    children: [
      {
        path: "",
        name: "LogList",
        component: () => import("@/views/log/LogManagement.vue"),
        meta: { title: "日志管理", menuKey: "log-management" },
      },
      {
        path: "viewer",
        name: "LogViewer",
        component: () => import("@/views/log/AdvancedLogViewer.vue"),
        meta: { title: "日志查看器", menuKey: "log-viewer" },
      },
      {
        path: "dashboard",
        name: "LogDashboard",
        component: () => import("@/views/log/LogDashboard.vue"),
        meta: { title: "日志仪表板", menuKey: "log-dashboard" },
      },
    ],
  },
  // 系统管理模块
  {
    path: "/Admin",
    component: SmartAbpLayout,
    meta: {
      title: "系统管理",
      icon: "⚙️",
      requiresAuth: true,
      requiredRoles: ["admin"],
    },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: DashboardView,
        meta: { title: "系统概览", menuKey: "admin-dashboard" },
      },
      {
        path: "users",
        name: "AdminUsers",
        component: UsersView,
        meta: { title: "用户管理", menuKey: "admin-users" },
      },
      {
        path: "roles",
        name: "AdminRoles",
        component: () => import("@/views/system/RolesView.vue"),
        meta: { title: "角色管理", menuKey: "admin-roles" },
      },
      {
        path: "permissions",
        name: "AdminPermissions",
        component: PermissionsView,
        meta: { title: "权限管理", menuKey: "admin-permissions" },
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: SettingsView,
        meta: { title: "系统设置", menuKey: "admin-settings" },
      },
      {
        path: "performance",
        name: "AdminPerformance",
        component: () => import("@/views/system/PerformanceMonitorView.vue"),
        meta: { 
          title: "性能监控", 
          menuKey: "admin-performance",
          requiredRoles: ["admin", "guest"]
        },
      },
    ],
  },
  // 测试页面
  {
    path: "/Test",
    component: SmartAbpLayout,
    meta: {
      title: "测试功能",
      icon: "🧪",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
    children: [
      {
        path: "",
        name: "TestView",
        component: () => import("@/views/test/TestView.vue"),
        meta: { title: "系统测试", menuKey: "test-system" },
      },
      {
        path: "login",
        name: "LoginTestPage",
        component: LoginTest,
        meta: { title: "登录测试", menuKey: "test-login" },
      },
    ],
  },
  // 代码生成入口选择页
  {
    path: "/codegen",
    name: "CodeGenEntrance",
    component: () => import("@/views/lowcode/CodeGenEntrance.vue"),
    meta: {
      title: "代码生成入口",
      icon: "🚀",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
  },
  // 极简代码生成入口（独立路由）
  {
    path: "/CodeGen/ultra-simple",
    name: "UltraSimpleStudio",
    component: () => import("@/views/lowcode/UltraSimpleStudio.vue"),
    meta: {
      title: "极简代码生成",
      icon: "⚡",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
  },
  // LowCode Studio 专业工作台
  {
    path: "/lowcode",
    component: () => import("@/views/lowcode/LowCodeStudioView.vue"),
    name: "LowCodeStudio",
    meta: {
      title: "LowCode Studio",
      icon: "🧩",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
    children: [
      {
        path: "",
        name: "LowCodeStudioWelcome",
        component: () => import("@/views/lowcode/LowCodeStudioWelcome.vue"),
        meta: { title: "LowCode Studio", menuKey: "welcome" }
      },
      {
        path: "entity-modeling",
        name: "EntityModeling",
        component: () => import("@smartabp/lowcode-designer/src/views/EntityModelingView.vue"),
        meta: { title: "数据建模", menuKey: "entity-modeling" },
      },
      {
        path: "design",
        name: "PageDesign",
        component: () => import("@smartabp/lowcode-designer/src/views/DesignView.vue"),
        meta: { title: "页面设计", menuKey: "page-design" },
      },
      {
        path: "generation",
        name: "CodeGeneration",
        component: () => import("@/views/lowcode/GenerationView.vue"),
        meta: { title: "代码生成", menuKey: "code-generation" },
      },
      {
        path: "workflows",
        name: "WorkflowsManagement",
        component: () => import("@/views/lowcode/WorkflowsView.vue"),
        meta: { title: "工作流", menuKey: "workflows" },
      },
      {
        path: "theme",
        name: "ThemeCustomization",
        component: () => import("@smartabp/lowcode-designer/src/views/ThemeCustomizationView.vue"),
        meta: { title: "主题定制", menuKey: "theme-customization" },
      },
    ],
  },
  // 个人中心
  {
    path: "/profile",
    component: SmartAbpLayout,
    name: "Profile",
    meta: {
      title: "个人中心",
      icon: "👤",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
    children: [
      {
        path: "",
        component: ProfileView,
        meta: { title: "个人中心" },
      },
    ],
  },
  // 帮助中心
  {
    path: "/help",
    component: SmartAbpLayout,
    name: "Help",
    meta: {
      title: "帮助中心",
      icon: "❓",
      requiresAuth: true,
      requiredRoles: ["user"],
    },
    children: [
      {
        path: "",
        component: () => import("@/views/common/HelpView.vue"),
        meta: { title: "帮助中心" },
      },
    ],
  },
  // 运维监控模块路由
  ...opsMonitoringRoutes,
  // 404页面 - 重定向到主框架内的404页面
  {
    path: "/:pathMatch(.*)*",
    redirect: (to) => {
      return `/dashboard/not-found${to.path}`
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫 - 增强版认证和权限检查
router.beforeEach(async (to, from, next) => {
  logger.debug(`[路由守卫] 从 ${from.path} 跳转到 ${to.path}`)

  // 检查用户是否已登录
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isAuthenticated

  // 1. 登录状态检查：已登录用户尝试访问登录页，重定向到工作台
  if (to.name === "Login" && isLoggedIn) {
    logger.debug("[路由守卫] 用户已登录，重定向到工作台")
    return next({ name: "Dashboard" })
  }

  // 2. 认证检查：需要认证但未登录，重定向到登录页
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (requiresAuth && !isLoggedIn) {
    logger.debug("[路由守卫] 需要认证但未登录，重定向到登录页")
    return next({
      name: "Login",
      query: { redirect: to.fullPath },
    })
  }

  // 3. 角色权限检查（支持角色层级继承）：检查用户是否具有所需角色
  const requiredRoles = to.meta.requiredRoles as string[] | undefined
  if (requiredRoles && requiredRoles.length > 0 && isLoggedIn) {
    const userRoles = authStore.userInfo?.roles || []
    const username = authStore.userInfo?.userName || authStore.userInfo?.username
    
    // 🔑 开发阶段特殊处理：超级用户白名单直接放行
    const { isSuperUser } = await import('@/utils/roleHierarchy')
    if (isSuperUser(username)) {
      logger.debug(
        `[路由守卫] 超级用户 "${username}" 白名单放行（开发阶段） - 拥有所有权限`
      )
      return next()
    }
    
    // 🏛️ 使用角色层级系统检查权限（admin > manager > user > guest）
    const { hasRolePermission, getHighestRole } = await import('@/utils/roleHierarchy')
    const hasPermission = hasRolePermission(userRoles, requiredRoles)
    
    if (!hasPermission) {
      const highestRole = getHighestRole(userRoles)
      logger.warn(
        `[路由守卫] 用户权限不足 - 用户: ${username}, 需要角色: ${requiredRoles.join(', ')}, 用户最高角色: ${highestRole}, 所有角色: ${userRoles.join(', ')}`
      )
      ElMessage.warning({
        message: i18n.global.t('permission.noAccess') || '您的权限不足，无法访问此页面',
        duration: 3000,
        showClose: true
      })
      // 权限不足时重定向到403页面，避免重定向循环
      return next({ name: 'Forbidden' })
    }
    
    logger.debug(`[路由守卫] 角色权限检查通过 - 用户: ${username}, 用户角色: ${userRoles.join(', ')}, 需要角色: ${requiredRoles.join(', ')}`)
  }

  // 4. 根路径处理：根据登录状态重定向
  if (to.path === "/") {
    if (isLoggedIn) {
      logger.debug("[路由守卫] 根路径重定向到工作台")
      return next({ name: "Dashboard" })
    } else {
      logger.debug("[路由守卫] 根路径重定向到登录页")
      return next({ name: "Login" })
    }
  }

  logger.debug("[路由守卫] 允许访问")
  next()
})

// 路由守卫 - 记录路由切换性能
router.afterEach(async (to) => {
  const startTime = performance.now()
  
  // 动态导入性能监控（避免循环依赖）
  const { performanceMonitor } = await import("@/utils/performance/monitor")
  
  // 等待下一帧后记录，此时组件应该已经渲染完成
  requestAnimationFrame(() => {
    const duration = performance.now() - startTime
    performanceMonitor.recordRoutePerformance(to.path, duration)
  })
})

// 多标签页状态同步
window.addEventListener("storage", (event) => {
  if (event.key === "token" && !event.newValue) {
    router.push({ name: "Login" })
  }
})

export default router

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SmartAbpLayout from '../components/layout/SmartAbpLayout.vue'
import LoginView from '../views/auth/Login.vue'
import { authService } from '@/utils/auth'

// 动态导入页面组件
const DashboardView = () => import('../views/common/DashboardView.vue')
const UserManagement = () => import('../views/user/UserManagement.vue')
const UserListView = () => import('../views/user/UserListView.vue')
const UserRolesView = () => import('../views/user/UserRolesView.vue')
const LoginTest = () => import('../views/auth/LoginTest.vue')

// 新增页面组件
const ProfileView = () => import('../views/common/ProfileView.vue')
const SettingsView = () => import('../views/common/SettingsView.vue')
const ProjectListView = () => import('../views/project/ProjectListView.vue')
const ProjectAnalysisView = () => import('../views/project/ProjectAnalysisView.vue')
const PermissionsView = () => import('../views/system/PermissionsView.vue')
const UsersView = () => import('../views/system/UsersView.vue')

const routes: RouteRecordRaw[] = [
  // 登录页面
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/test/login',
    name: 'LoginTest',
    component: LoginTest,
    meta: { requiresAuth: false, title: '登录功能测试' }
  },
  // 根路径重定向到工作台
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: false }
  },
  // 工作台页面
  {
    path: '/dashboard',
    component: SmartAbpLayout,
    name: 'Dashboard',
    meta: {
      title: '工作台',
      icon: '📊',
      requiresAuth: true,
      requiredRoles: ['user']
    },
    children: [
      {
        path: '',
        component: DashboardView,
        meta: { title: '工作台' }
      }
    ]
  },
  // 用户管理模块
  {
    path: '/User',
    component: SmartAbpLayout,
    meta: {
      title: '用户管理',
      icon: '👥',
      requiresAuth: true,
      requiredRoles: ['user']
    },
    children: [
      {
        path: '',
        name: 'UserList',
        component: UserListView,
        meta: { title: '用户列表', menuKey: 'user-list' }
      },
      {
        path: 'management',
        name: 'UserManagement',
        component: UserManagement,
        meta: { title: '用户管理', menuKey: 'user-management' }
      },
      {
        path: 'roles',
        name: 'UserRoles',
        component: UserRolesView,
        meta: { title: '用户角色', menuKey: 'user-roles' }
      }
    ]
  },
  // 项目管理模块
  {
    path: '/Project',
    component: SmartAbpLayout,
    meta: {
      title: '项目管理',
      icon: '📁',
      requiresAuth: true,
      requiredRoles: ['user']
    },
    children: [
      {
        path: '',
        name: 'ProjectList',
        component: ProjectListView,
        meta: { title: '项目列表', menuKey: 'project-list' }
      },
      {
        path: 'analysis',
        name: 'ProjectAnalysis',
        component: ProjectAnalysisView,
        meta: { title: '项目分析', menuKey: 'project-analysis' }
      }
    ]
  },
  // 日志管理模块
  {
    path: '/Log',
    component: SmartAbpLayout,
    meta: {
      title: '日志管理',
      icon: '📋',
      requiresAuth: true,
      requiredRoles: ['user']
    },
    children: [
      {
        path: '',
        name: 'LogList',
        component: () => import('@/views/log/LogManagement.vue'),
        meta: { title: '日志管理', menuKey: 'log-management' }
      },
      {
        path: 'viewer',
        name: 'LogViewer',
        component: () => import('@/views/log/AdvancedLogViewer.vue'),
        meta: { title: '日志查看器', menuKey: 'log-viewer' }
      },
      {
        path: 'dashboard',
        name: 'LogDashboard',
        component: () => import('@/views/log/LogDashboard.vue'),
        meta: { title: '日志仪表板', menuKey: 'log-dashboard' }
      }
    ]
  },
  // 系统管理模块
  {
    path: '/Admin',
    component: SmartAbpLayout,
    meta: {
      title: '系统管理',
      icon: '⚙️',
      requiresAuth: true,
      requiredRoles: ['admin']
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: DashboardView,
        meta: { title: '系统概览', menuKey: 'admin-dashboard' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: UsersView,
        meta: { title: '用户管理', menuKey: 'admin-users' }
      },
      {
        path: 'roles',
        name: 'AdminRoles',
        component: () => import('../views/system/RolesView.vue'),
        meta: { title: '角色管理', menuKey: 'admin-roles' }
      },
      {
        path: 'permissions',
        name: 'AdminPermissions',
        component: PermissionsView,
        meta: { title: '权限管理', menuKey: 'admin-permissions' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: SettingsView,
        meta: { title: '系统设置', menuKey: 'admin-settings' }
      }
    ]
  },
  // 测试页面
  {
    path: '/Test',
    component: SmartAbpLayout,
    meta: {
      title: '测试功能',
      icon: '🧪',
      requiresAuth: true,
      requiredRoles: ['user']
    },
    children: [
      {
        path: '',
        name: 'TestView',
        component: () => import('../views/test/TestView.vue'),
        meta: { title: '系统测试', menuKey: 'test-system' }
      },
      {
        path: 'login',
        name: 'LoginTestPage',
        component: LoginTest,
        meta: { title: '登录测试', menuKey: 'test-login' }
      },
      {
        path: 'theme',
        name: 'ThemeDemo',
        component: () => import('../views/test/ThemeDemo.vue'),
        meta: { title: '主题演示', menuKey: 'test-theme' }
      },
      {
        path: 'theme-debug',
        name: 'ThemeDebug',
        component: () => import('../views/test/ThemeDebugView.vue'),
        meta: { title: '主题调试', menuKey: 'test-theme-debug' }
      }
    ]
  },
  // 个人中心
  {
    path: '/profile',
    component: SmartAbpLayout,
    name: 'Profile',
    meta: {
      title: '个人中心',
      icon: '👤',
      requiresAuth: true,
      requiredRoles: ['user']
    },
    children: [
      {
        path: '',
        component: ProfileView,
        meta: { title: '个人中心' }
      }
    ]
  },
  // 帮助中心
  {
    path: '/help',
    component: SmartAbpLayout,
    name: 'Help',
    meta: {
      title: '帮助中心',
      icon: '❓',
      requiresAuth: true,
      requiredRoles: ['user']
    },
    children: [
      {
        path: '',
        component: () => import('../views/common/HelpView.vue'),
        meta: { title: '帮助中心' }
      }
    ]
  },
  // 404页面 - 重定向到主框架内的404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: (to) => {
      return `/dashboard/not-found${to.path}`
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 基础认证检查
router.beforeEach(async (to, from, next) => {
  console.log(`[路由守卫] 从 ${from.path} 跳转到 ${to.path}`);

  // 检查用户是否已登录
  const isLoggedIn = authService.isTokenValid();

  // 已登录用户尝试访问登录页：重定向到工作台
  if (to.name === 'Login' && isLoggedIn) {
    console.log('[路由守卫] 用户已登录，重定向到工作台');
    return next({ name: 'Dashboard' });
  }

  // 需要认证但未登录：重定向到登录页
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !isLoggedIn) {
    console.log('[路由守卫] 需要认证但未登录，重定向到登录页');
    return next({
      name: 'Login',
      query: { redirect: to.fullPath }
    });
  }

  // 处理根路径：根据登录状态重定向
  if (to.path === '/') {
    if (isLoggedIn) {
      console.log('[路由守卫] 根路径重定向到工作台');
      return next({ name: 'Dashboard' });
    } else {
      console.log('[路由守卫] 根路径重定向到登录页');
      return next({ name: 'Login' });
    }
  }

  console.log('[路由守卫] 允许访问');
  next();
});

// 多标签页状态同步
window.addEventListener('storage', (event) => {
  if (event.key === 'token' && !event.newValue) {
    router.push({ name: 'Login' });
  }
});

export default router

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SmartAbpLayout from '../components/SmartAbpLayout.vue'
import LoginView from '../views/Login.vue'
import { authService } from '@/utils/auth'

// 动态导入页面组件
const DashboardView = () => import('../views/DashboardView.vue')
const UserManagement = () => import('../components/UserManagement.vue')
const UserListView = () => import('../components/UserListView.vue')
const UserRolesView = () => import('../components/UserRolesView.vue')
const LoginTest = () => import('../views/LoginTest.vue')

// 新增页面组件
const ProfileView = () => import('../views/ProfileView.vue')
const SettingsView = () => import('../views/SettingsView.vue')
const NotFoundView = () => import('../views/NotFoundView.vue')
const ProjectListView = () => import('../views/projects/ProjectListView.vue')
const ProjectAnalysisView = () => import('../views/projects/ProjectAnalysisView.vue')
const PermissionsView = () => import('../views/system/PermissionsView.vue')
const UsersView = () => import('../views/system/UsersView.vue')

const routes: RouteRecordRaw[] = [
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
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: SmartAbpLayout,
    meta: {
      requiresAuth: true,
      requiredRoles: ['user'], // 基础用户权限
      fallbackRoute: '/login'  // 降级路由
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardView,
        meta: {
          title: '工作台',
          icon: '📊',
          menuKey: 'dashboard',
          requiredRoles: ['user']
        }
      },
      {
        path: 'index',
        redirect: '/dashboard'
      },
      // 系统管理
      {
        path: 'system/users',
        name: 'Users',
        component: UsersView,
        meta: { title: '用户管理', menuKey: 'system-users' }
      },
      {
        path: 'system/user',
        name: 'UserManagement',
        component: UserManagement,
        meta: { title: '用户管理', menuKey: 'system-user' }
      },
      {
        path: 'system/user-list',
        name: 'UserList',
        component: UserListView,
        meta: { title: '用户列表', menuKey: 'system-user-list' }
      },
      {
        path: 'system/roles',
        name: 'Roles',
        component: () => import('../views/system/RolesView.vue'),
        meta: { title: '角色管理', menuKey: 'system-roles' }
      },
      {
        path: 'system/user-roles',
        name: 'UserRoles',
        component: UserRolesView,
        meta: { title: '用户角色', menuKey: 'system-user-roles' }
      },
      {
        path: 'system/permissions',
        name: 'Permissions',
        component: PermissionsView,
        meta: { title: '权限管理', menuKey: 'system-permissions' }
      },
      {
        path: 'system/logs',
        name: 'LogManagement',
        component: () => import('@/views/LogManagement.vue'),
        meta: {
          title: '日志管理',
          icon: '📋',
          menuKey: 'system-logs',
          description: '系统日志查看、分析和管理'
        }
      },
      {
        path: 'system/logs/viewer',
        name: 'LogViewer',
        component: () => import('@/components/AdvancedLogViewer.vue'),
        meta: {
          title: '日志查看器',
          icon: '👁️',
          menuKey: 'system-logs-viewer',
          parent: 'system-logs'
        }
      },
      {
        path: 'system/logs/dashboard',
        name: 'LogDashboard',
        component: () => import('@/components/LogDashboard.vue'),
        meta: {
          title: '日志仪表板',
          icon: '📊',
          menuKey: 'system-logs-dashboard',
          parent: 'system-logs'
        }
      },
      // 项目管理
      {
        path: 'projects/list',
        name: 'ProjectList',
        component: ProjectListView,
        meta: { title: '项目列表', menuKey: 'project-list' }
      },
      {
        path: 'projects/analysis',
        name: 'ProjectAnalysis',
        component: ProjectAnalysisView,
        meta: { title: '项目分析', menuKey: 'project-analysis' }
      },
      // 个人中心
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileView,
        meta: { title: '个人中心', menuKey: 'profile' }
      },
      // 系统设置
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView,
        meta: { title: '系统设置', menuKey: 'settings' }
      },
      {
        path: 'test/login-test',
        name: 'LoginTestPage',
        component: LoginTest,
        meta: { title: '登录测试', icon: '🧪', menuKey: 'test-login' }
      },
      {
        path: 'test/system',
        name: 'SystemTest',
        component: () => import('../views/TestView.vue'),
        meta: { title: '系统测试', icon: '🔧', menuKey: 'test-system' }
      },
      // 404页面 - 在主框架内显示
      {
        path: 'not-found/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundView,
        meta: { title: '页面未找到', menuKey: 'not-found' }
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

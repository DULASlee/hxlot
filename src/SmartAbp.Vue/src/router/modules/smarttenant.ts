// 🔥 自动生成的路由配置 - SmartTenant模块
// 生成时间: 2025-10-25 16:49:42
// 支持懒加载和权限控制

import type { RouteRecordRaw } from 'vue-router'
import SmartAbpLayout from '@/components/layout/SmartAbpLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/smarttenant',
    component: SmartAbpLayout,
    name: 'SmartTenantModule',
    meta: {
      title: '租户管理',
      icon: 'users',
      requiresAuth: true,
      requiredRoles: ['admin'],
    },
    children: [
      {
        path: 'smarttenant',
        name: 'SmartTenantManagement',
        component: () => import('@/views/smarttenant/SmartTenantManagement.vue'),
        meta: {
          title: '租户管理',
          icon: 'users',
          requiresAuth: true,
          requiredRoles: ['admin'],
        },
      },
    ],
  },
]

export default routes


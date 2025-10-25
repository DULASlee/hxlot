// 🔥 自动生成的菜单配置 - Vue3路由集成
// 支持权限控制和国际化

import type { MenuConfig } from '@/types/menu'

export const smarttenantMenuConfig: MenuConfig = {
  name: 'SmartTenant',
  displayName: '租户管理',
  icon: 'el-icon-s-data',
  order: 100,
  children: [
    {
      name: 'SmartTenantManagement',
      displayName: '租户管理管理',
      path: '/smarttenant/smarttenant',
      component: 'SmartTenantManagement',
      permission: 'SmartAbp.SmartTenant.Default',
      icon: 'el-icon-menu'
    },
  ]
}

export default smarttenantMenuConfig

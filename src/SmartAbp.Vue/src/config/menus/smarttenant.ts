// 🔥 自动生成的菜单配置 - Vue3路由集成
// 支持权限控制和国际化

import type { FolderMenuItem } from '@/types/menu'

export const smarttenantMenuConfig: FolderMenuItem = {
  key: 'SmartTenant',
  title: '租户管理',
  icon: 'el-icon-s-data',
  type: 'folder',
  order: 100,
  visible: true,
  requiredRoles: [],
  children: [
    {
      key: 'SmartTenantManagement',
      title: '租户管理管理',
      type: 'page',
      path: '/smarttenant/smarttenant',
      component: 'SmartTenantManagement',
      icon: 'el-icon-menu',
      order: 1,
      visible: true,
      requiredRoles: [],
      closable: true,
      meta: {
        title: '租户管理管理',
        menuKey: 'SmartTenantManagement'
      }
    },
  ]
}

export default smarttenantMenuConfig

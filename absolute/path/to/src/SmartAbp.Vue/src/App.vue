const handleMenuChange = (menuKey: string) => {
  console.log('切换菜单:', menuKey)
  console.log('当前组件:', currentComponent.value)

  // 根据菜单键切换组件
  switch (menuKey) {
    case 'dashboard':
      currentComponent.value = DashboardView  // 直接使用组件变量
      break
    case 'system-user':
      currentComponent.value = UserManagement  // 直接使用组件变量
      break
    default:
      currentComponent.value = DashboardView  // 直接使用组件变量
  }

  console.log('切换后组件:', currentComponent.value)
}
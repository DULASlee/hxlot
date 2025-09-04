// ... existing code ...
const checkAuth = () => {
  // 开发阶段直接设置已认证状态
  if (import.meta.env.MODE === 'development') {
    isAuthenticated.value = true;
    
    // 自动生成测试 token 和用户信息
    localStorage.setItem('access_token', 'mock-jwt-token-' + Date.now());
    localStorage.setItem('user_info', JSON.stringify({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      roles: ['admin']
    }));
    return;
  }
  
  // 生产环境保持原有逻辑
  const token = localStorage.getItem('access_token');
  isAuthenticated.value = !!token;
};
const handleMenuChange = (menuKey: string) => {
  console.log('切换菜单:', menuKey)
  console.log('当前组件:', currentComponent.value)

  // 根据菜单键切换组件
  switch (menuKey) {
    case 'dashboard':
      currentComponent.value = 'DashboardView'
      break
    case 'system-user':
      currentComponent.value = 'UserManagement'  // 注意这里的大小写
      break
    default:
      currentComponent.value = 'DashboardView'
  }

  console.log('切换后组件:', currentComponent.value)
}
import './styles/design-system/index.css'  // 统一设计系统
import './styles/main.css'                 // 基础样式和工具类
import './plugins/dayjs'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import { authService } from '@/utils/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router)

// 初始化主题
const themeStore = useThemeStore()
themeStore.init()

// 初始化认证状态（使用TypeScript认证服务）
try {
  authService.initialize().catch((error) => {
    console.error('认证初始化失败:', error)
  })
} catch (error) {
  console.error('认证初始化过程中发生错误:', error)
}

app.mount('#app')

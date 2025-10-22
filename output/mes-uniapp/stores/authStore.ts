// stores/authStore.ts
/**
 * 认证状态管理Store
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

import { defineStore } from 'pinia'
import { useAuth } from '@/composables/useAuth'

export const useAuthStore = defineStore('auth', () => {
  const auth = useAuth()

  return {
    ...auth
  }
})

export type AuthStoreType = ReturnType<typeof useAuthStore>

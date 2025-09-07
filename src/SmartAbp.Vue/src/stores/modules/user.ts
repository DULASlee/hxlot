import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户模块相关类型定义
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  name: string
  email: string
  phone?: string
  password: string
}

export interface UpdateUserRequest {
  id: string
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentUser = ref<User | null>(null)

  // 计算属性
  const activeUsers = computed(() => 
    users.value.filter(user => user.status === 'active')
  )

  const userCount = computed(() => users.value.length)

  const hasUsers = computed(() => users.value.length > 0)

  // 方法（占位符，待实现具体业务逻辑）
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO: 实现获取用户列表的API调用
      // const response = await userApi.getUsers()
      // users.value = response.data
    } catch (err) {
      error.value = '获取用户列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (_userData: CreateUserRequest) => {
    try {
      // TODO: 实现创建用户的API调用
      // const response = await userApi.createUser(userData)
      // users.value.push(response.data)
      // return response.data
    } catch (err) {
      error.value = '创建用户失败'
      throw err
    }
  }

  const updateUser = async (_userData: UpdateUserRequest) => {
    try {
      // TODO: 实现更新用户的API调用
      // const response = await userApi.updateUser(userData)
      // const index = users.value.findIndex(u => u.id === userData.id)
      // if (index !== -1) {
      //   users.value[index] = response.data
      // }
      // return response.data
    } catch (err) {
      error.value = '更新用户失败'
      throw err
    }
  }

  const deleteUser = async (_userId: string) => {
    try {
      // TODO: 实现删除用户的API调用
      // await userApi.deleteUser(userId)
      // users.value = users.value.filter(u => u.id !== userId)
    } catch (err) {
      error.value = '删除用户失败'
      throw err
    }
  }

  const getUserById = (userId: string) => {
    return users.value.find(user => user.id === userId)
  }

  const setCurrentUser = (user: User | null) => {
    currentUser.value = user
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    users,
    loading,
    error,
    currentUser,
    
    // 计算属性
    activeUsers,
    userCount,
    hasUsers,
    
    // 方法
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    setCurrentUser,
    clearError
  }
})

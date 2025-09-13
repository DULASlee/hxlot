import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const items = ref<any[]>([])
  const loading = ref(false)
  const total = ref(0)
  const pageIndex = ref(1)
  const pageSize = ref(10)

  async function fetchList(params?: { pageIndex?: number; pageSize?: number; query?: Record<string, any> }) {
    loading.value = true
    try {
      const pi = params?.pageIndex ?? pageIndex.value
      const ps = params?.pageSize ?? pageSize.value
      pageIndex.value = pi
      pageSize.value = ps
      // P0占位：使用静态数据，P1接入OpenAPI客户端
      const start = (pi - 1) * ps
      const data = Array.from({ length: ps }, (_, i) => ({ id: start + i + 1 }))
      items.value = data
      total.value = 100
    } finally {
      loading.value = false
    }
  }

  async function createOrUpdate(payload: any) {
    // P0占位：直接模拟成功
    return Promise.resolve({ ok: true, data: payload })
  }

  async function remove(id: string | number) {
    // P0占位：直接模拟成功
    return Promise.resolve({ ok: true, id })
  }

  return { items, loading, total, pageIndex, pageSize, fetchList, createOrUpdate, remove }
})

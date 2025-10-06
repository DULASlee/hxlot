/**
 * Book Store
 * 由元数据自动生成，请勿手动修改
 * @generated
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getBookList,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} from '@/views/library/book/book-api'
import type {
  BookDto,
  CreateBookDto,
  UpdateBookDto,
  BookPagedRequestDto
} from '@/views/library/book/book.types'

export const useBookStore = defineStore('book', () => {
  // 状态
  const list = ref<BookDto[]>([])
  const current = ref<BookDto>()
  const loading = ref(false)
  const total = ref(0)

  // 获取列表
  async function fetchList(params?: BookPagedRequestDto) {
    loading.value = true
    try {
      const { items, totalCount } = await getBookList(params)
      list.value = items
      total.value = totalCount
      return items
    } finally {
      loading.value = false
    }
  }

  // 获取详情
  async function fetchById(id: string) {
    loading.value = true
    try {
      current.value = await getBookById(id)
      return current.value
    } finally {
      loading.value = false
    }
  }

  // 创建
  async function create(data: CreateBookDto) {
    const result = await createBook(data)
    list.value.unshift(result)
    total.value++
    return result
  }

  // 更新
  async function update(id: string, data: UpdateBookDto) {
    const result = await updateBook(id, data)
    const index = list.value.findIndex(item => item.id === id)
    if (index > -1) {
      list.value[index] = result
    }
    if (current.value?.id === id) {
      current.value = result
    }
    return result
  }

  // 删除
  async function remove(id: string) {
    await deleteBook(id)
    const index = list.value.findIndex(item => item.id === id)
    if (index > -1) {
      list.value.splice(index, 1)
      total.value--
    }
    if (current.value?.id === id) {
      current.value = undefined
    }
  }

  // 清空
  function reset() {
    list.value = []
    current.value = undefined
    total.value = 0
  }

  return {
    // 状态
    list,
    current,
    loading,
    total,

    // 方法
    fetchList,
    fetchById,
    create,
    update,
    remove,
    reset
  }
})

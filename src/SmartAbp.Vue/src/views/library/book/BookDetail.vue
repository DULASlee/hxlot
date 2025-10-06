<template>
  <el-dialog
    v-model="visible"
    title="详情"
    width="600px"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-loading="loading">
      <el-descriptions-item label="书名">
        {{ data?.title }}
      </el-descriptions-item>
      <el-descriptions-item label="ISBN">
        {{ data?.isbn }}
      </el-descriptions-item>
      <el-descriptions-item label="作者">
        {{ data?.author }}
      </el-descriptions-item>
      <el-descriptions-item label="出版社">
        {{ data?.publisher }}
      </el-descriptions-item>
      <el-descriptions-item label="出版日期">
        {{ data?.publishDate }}
      </el-descriptions-item>
      <el-descriptions-item label="价格">
        {{ data?.price }}
      </el-descriptions-item>
      <el-descriptions-item label="库存数量">
        {{ data?.stock }}
      </el-descriptions-item>
      <el-descriptions-item label="简介">
        {{ data?.description }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getBookById } from './book-api'
import type { BookDto } from './book.types'

interface Props {
  visible: boolean
  bookId?: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const data = ref<BookDto>()

// 监听ID变化，加载数据
watch(() => [props.bookId, props.visible], ([id, visible]) => {
  if (id && visible) {
    loadData(id as string)
  }
}, { immediate: true })

// 加载数据
async function loadData(id: string) {
  loading.value = true
  try {
    data.value = await getBookById(id)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 关闭
function handleClose() {
  emit('update:visible', false)
}
</script>

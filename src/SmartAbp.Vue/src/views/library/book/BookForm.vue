<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="600px"
    @close="handleClose"
    @update:model-value="(val: boolean) => emit('update:visible', val)"
  >
    <el-form
      ref="formRef"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item
        label="书名"
        prop="title"
        required
      >
        <el-input
          v-model="formData.title"
          placeholder="请输入书名"
        />
      </el-form-item>
      <el-form-item
        label="ISBN"
        prop="isbn"
        required
      >
        <el-input
          v-model="formData.isbn"
          placeholder="请输入ISBN"
        />
      </el-form-item>
      <el-form-item
        label="作者"
        prop="author"
        required
      >
        <el-input
          v-model="formData.author"
          placeholder="请输入作者"
        />
      </el-form-item>
      <el-form-item
        label="出版社"
        prop="publisher"
      >
        <el-input
          v-model="formData.publisher"
          placeholder="请输入出版社"
        />
      </el-form-item>
      <el-form-item
        label="出版日期"
        prop="publishDate"
      >
        <el-date-picker
          v-model="formData.publishDate"
          type="datetime"
          placeholder="选择日期时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="价格"
        prop="price"
        required
      >
        <el-input-number
          v-model="formData.price"
          :controls="false"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="库存数量"
        prop="stock"
        required
      >
        <el-input-number
          v-model="formData.stock"
          :controls="false"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="简介"
        prop="description"
      >
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入简介"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { createBook, getBookById, updateBook } from './book-api'
import type { CreateBookDto } from './book.types'

interface Props {
  visible: boolean
  bookId?: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

// 表单数据
const formData = ref<CreateBookDto>({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    publishDate: undefined,
    price: 0,
    stock: 0,
    description: ''
})

// 验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入书名', trigger: 'blur' }
  ],
  isbn: [
    { required: true, message: '请输入ISBN', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ]
}

// 标题
const title = computed(() => props.bookId ? '编辑' : '新增')

// 监听ID变化，加载数据
watch(() => props.bookId, (id) => {
  if (id && props.visible) {
    loadData(id)
  } else {
    resetForm()
  }
}, { immediate: true })

// 加载数据
async function loadData(id: string) {
  loading.value = true
  try {
    const data = await getBookById(id)
    formData.value = { ...data }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
function resetForm() {
  formData.value = {
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    publishDate: undefined,
    price: 0,
    stock: 0,
    description: ''
  }
  formRef.value?.clearValidate()
}

// 提交
async function handleSubmit() {
  try {
    await formRef.value?.validate()
    
    submitting.value = true
    if (props.bookId) {
      await updateBook(props.bookId, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createBook(formData.value)
      ElMessage.success('创建成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
    }
  } finally {
    submitting.value = false
  }
}

// 关闭
function handleClose() {
  emit('update:visible', false)
}
</script>

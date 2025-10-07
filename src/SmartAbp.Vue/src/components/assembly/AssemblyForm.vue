<template>
  <form
    class="assembly-form"
    @submit.prevent="handleSubmit"
  >
    <div class="form-section">
      <h4>基本信息</h4>
      <div class="form-grid">
        <div class="form-group">
          <label for="name">装配件名称 *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            :disabled="isEditing"
            class="form-control"
          />
          <div
            v-if="errors.name"
            class="error"
          >
            {{ errors.name }}
          </div>
        </div>

        <div class="form-group">
          <label for="displayName">显示名称 *</label>
          <input
            id="displayName"
            v-model="formData.displayName"
            type="text"
            required
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="version">版本 *</label>
          <input
            id="version"
            v-model="formData.version"
            type="text"
            required
            pattern="^\d+\.\d+\.\d+$"
            class="form-control"
          />
          <div class="help-text">
            格式: x.y.z (例如: 1.0.0)
          </div>
        </div>

        <div class="form-group">
          <label for="entry">入口文件 *</label>
          <input
            id="entry"
            v-model="formData.entry"
            type="text"
            required
            class="form-control"
          />
          <div class="help-text">
            相对于装配件根目录的路径
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4>配置信息</h4>
      <div class="form-group">
        <label for="description">描述</label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="3"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="author">作者</label>
        <input
          id="author"
          v-model="formData.author"
          type="text"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="repository">仓库地址</label>
        <input
          id="repository"
          v-model="formData.repository"
          type="url"
          class="form-control"
        />
      </div>
    </div>

    <div class="form-section">
      <h4>依赖配置</h4>
      <div class="form-group">
        <label>依赖项</label>
        <div class="dependencies-input">
          <div
            v-for="(_dep, index) in formData.dependencies"
            :key="index"
            class="dependency-item"
          >
            <input
              v-model="formData.dependencies[index]"
              type="text"
              placeholder="依赖名称"
              class="form-control"
            />
            <button
              type="button"
              class="btn btn-danger btn-sm"
              @click="removeDependency(index)"
            >
              删除
            </button>
          </div>
          <button
            type="button"
            class="btn btn-outline btn-sm"
            @click="addDependency"
          >
            + 添加依赖
          </button>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4>运行时配置</h4>
      <div class="form-grid">
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="formData.enabled"
              type="checkbox"
              class="checkbox"
            />
            <span>启用装配件</span>
          </label>
          <div class="help-text">
            是否在启动时自动加载此装配件
          </div>
        </div>

        <div class="form-group">
          <label for="loadOrder">加载顺序</label>
          <input
            id="loadOrder"
            v-model="formData.loadOrder"
            type="number"
            min="0"
            max="100"
            class="form-control"
          />
          <div class="help-text">
            数值越小越先加载 (0-100)
          </div>
        </div>

        <div class="form-group">
          <label for="timeout">加载超时(秒)</label>
          <input
            id="timeout"
            v-model="formData.timeout"
            type="number"
            min="1"
            max="300"
            class="form-control"
          />
          <div class="help-text">
            加载装配件的最大等待时间
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4>高级配置</h4>
      <div class="form-group">
        <label for="config">自定义配置</label>
        <div class="json-editor">
          <textarea
            id="config"
            v-model="configJson"
            rows="6"
            class="form-control"
            placeholder="{&quot;key&quot;: &quot;value&quot;}"
          />
          <div
            v-if="configError"
            class="error"
          >
            {{ configError }}
          </div>
        </div>
        <div class="help-text">
          JSON格式的自定义配置
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button
        type="button"
        class="btn btn-secondary"
        @click="$emit('cancel')"
      >
        取消
      </button>
      <button
        type="submit"
        :disabled="!isValid"
        class="btn btn-primary"
      >
        {{ isEditing ? '更新' : '创建' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

interface AssemblyConfig {
  name: string
  displayName: string
  version: string
  entry: string
  description?: string
  author?: string
  repository?: string
  dependencies: string[]
  enabled: boolean
  loadOrder: number
  timeout: number
  config?: Record<string, any>
}

interface Props {
  config?: AssemblyConfig
  isEditing?: boolean
}

interface Emits {
  (e: 'save', config: AssemblyConfig): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  config: undefined,
  isEditing: false
})
const emit = defineEmits<Emits>()

// 表单数据
const formData = ref<AssemblyConfig>({
  name: '',
  displayName: '',
  version: '1.0.0',
  entry: '',
  description: '',
  author: '',
  repository: '',
  dependencies: [],
  enabled: true,
  loadOrder: 50,
  timeout: 30,
  config: {}
})

// 错误状态
const errors = ref<Record<string, string>>({})
const configError = ref('')
const configJson = ref('')

// 计算属性
const isValid = computed(() => {
  return !Object.values(errors.value).some(error => error) &&
    formData.value.name.trim() !== '' &&
    formData.value.displayName.trim() !== '' &&
    formData.value.version.trim() !== '' &&
    formData.value.entry.trim() !== '' &&
    !configError.value
})

// 监听配置变化
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    formData.value = { ...newConfig }
    configJson.value = newConfig.config ? JSON.stringify(newConfig.config, null, 2) : '{}'
  }
}, { immediate: true })

// 监听JSON配置变化
watch(configJson, (newJson) => {
  try {
    if (newJson.trim()) {
      formData.value.config = JSON.parse(newJson)
      configError.value = ''
    } else {
      formData.value.config = {}
      configError.value = ''
    }
  } catch (err) {
    configError.value = 'JSON格式错误'
  }
})

// 验证表单
const validateForm = () => {
  errors.value = {}

  // 名称验证
  if (!formData.value.name.trim()) {
    errors.value.name = '名称不能为空'
  } else if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(formData.value.name)) {
    errors.value.name = '名称只能包含字母、数字、下划线和连字符，且以字母开头'
  }

  // 版本验证
  if (!/^\d+\.\d+\.\d+$/.test(formData.value.version)) {
    errors.value.version = '版本格式必须为 x.y.z'
  }

  // 入口文件验证
  if (!formData.value.entry.trim()) {
    errors.value.entry = '入口文件不能为空'
  }

  return Object.keys(errors.value).length === 0
}

// 处理提交
const handleSubmit = () => {
  if (validateForm()) {
    emit('save', { ...formData.value })
  }
}

// 添加依赖
const addDependency = () => {
  formData.value.dependencies.push('')
}

// 删除依赖
const removeDependency = (index: number) => {
  formData.value.dependencies.splice(index, 1)
}

// 初始化
onMounted(() => {
  if (!props.config) {
    formData.value = {
      name: '',
      displayName: '',
      version: '1.0.0',
      entry: '',
      description: '',
      author: '',
      repository: '',
      dependencies: [],
      enabled: true,
      loadOrder: 50,
      timeout: 30,
      config: {}
    }
    configJson.value = '{}'
  }
})
</script>

<style scoped>
.assembly-form {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-section h4 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 1.1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-control:disabled {
  background-color: #e9ecef;
  opacity: 0.6;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox {
  width: auto;
  margin: 0;
}

.help-text {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 4px;
}

.error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 4px;
}

.dependencies-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dependency-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.dependency-item .form-control {
  flex: 1;
}

.json-editor textarea {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 0;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.btn:hover:not(:disabled) {
  opacity: 0.8;
}
</style>

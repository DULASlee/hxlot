<template>
  <div class="assembly-manager">
    <div class="manager-header">
      <h2>装配件管理器</h2>
      <div class="header-actions">
        <button @click="refresh" :disabled="isLoading" class="btn btn-secondary">
          <span class="icon">🔄</span> 刷新
        </button>
        <button @click="exportConfig" class="btn btn-secondary">
          <span class="icon">📥</span> 导出配置
        </button>
        <button @click="showImportDialog = true" class="btn btn-secondary">
          <span class="icon">📤</span> 导入配置
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="statistics">
      <div class="stat-item">
        <div class="stat-value">{{ statistics.total }}</div>
        <div class="stat-label">总装配件</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.loaded }}</div>
        <div class="stat-label">已加载</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.enabled }}</div>
        <div class="stat-label">已启用</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.errors }}</div>
        <div class="stat-label">错误数</div>
      </div>
    </div>

    <!-- 装配件列表 -->
    <div class="assembly-list">
      <div class="list-header">
        <h3>装配件列表</h3>
        <div class="filter-controls">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">全部状态</option>
            <option value="loaded">已加载</option>
            <option value="enabled">已启用</option>
            <option value="disabled">已禁用</option>
            <option value="error">错误</option>
          </select>
          <input 
            v-model="searchQuery" 
            placeholder="搜索装配件..." 
            class="search-input"
          />
        </div>
      </div>

      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-else-if="filteredAssemblies.length === 0" class="empty-state">
        暂无装配件
      </div>
      <div v-else class="assembly-items">
        <AssemblyItem
          v-for="item in filteredAssemblies"
          :key="item.config.name"
          :registry-item="item"
          @load="loadAssembly(item.config.name)"
          @unload="unloadAssembly(item.config.name)"
          @reload="reloadAssembly(item.config.name)"
          @toggle="toggleAssembly(item.config.name)"
          @edit="editAssembly(item.config)"
        />
      </div>
    </div>

    <!-- 导入配置对话框 -->
    <div v-if="showImportDialog" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>导入配置</h3>
          <button @click="showImportDialog = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="importJson" 
            placeholder="粘贴配置JSON..."
            class="import-textarea"
          />
          <div v-if="importError" class="error-message">{{ importError }}</div>
        </div>
        <div class="modal-footer">
          <button @click="showImportDialog = false" class="btn btn-secondary">取消</button>
          <button @click="importConfig" :disabled="!importJson" class="btn btn-primary">
            导入
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑装配件对话框 -->
    <div v-if="showEditDialog && editingAssembly" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>编辑装配件</h3>
          <button @click="showEditDialog = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <AssemblyForm
            :config="editingAssembly"
            @save="saveAssembly"
            @cancel="showEditDialog = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAssemblyRegistry } from '../../core/assembly/assembly-registry'
import AssemblyItem from './AssemblyItem.vue'
import AssemblyForm from './AssemblyForm.vue'

// 使用装配件注册表
const { 
  registryItems, 
  statistics, 
  isLoading, 
  error,
  initialize,
  loadAssembly,
  unloadAssembly,
  reloadAssembly,
  exportRegistry,
  importRegistry
} = useAssemblyRegistry()

// 状态管理
const filterStatus = ref('all')
const searchQuery = ref('')
const showImportDialog = ref(false)
const showEditDialog = ref(false)
const importJson = ref('')
const importError = ref('')
const editingAssembly = ref<any>(null)

// 过滤后的装配件列表
const filteredAssemblies = computed(() => {
  let items = registryItems.value

  // 根据状态过滤
  if (filterStatus.value !== 'all') {
    items = items.filter(item => {
      switch (filterStatus.value) {
        case 'loaded':
          return item.instance !== undefined
        case 'enabled':
          return item.config.enabled
        case 'disabled':
          return !item.config.enabled
        case 'error':
          return item.lastError
        default:
          return true
      }
    })
  }

  // 根据搜索查询过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.config.name.toLowerCase().includes(query) ||
      item.config.displayName.toLowerCase().includes(query) ||
      item.config.description?.toLowerCase().includes(query)
    )
  }

  return items
})

// 初始化
onMounted(async () => {
  await initialize()
})

// 刷新数据
const refresh = async () => {
  await initialize()
}

// 导出配置
const exportConfig = () => {
  const json = exportRegistry()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'assembly-config.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 导入配置
const importConfig = async () => {
  try {
    await importRegistry(importJson.value)
    showImportDialog.value = false
    importJson.value = ''
    importError.value = ''
    await refresh()
  } catch (err) {
    importError.value = err instanceof Error ? err.message : '导入失败'
  }
}

// 切换装配件状态
const toggleAssembly = async (assemblyName: string) => {
  const item = registryItems.value.find(i => i.config.name === assemblyName)
  if (item) {
    // 这里需要更新配置的enabled状态
    // 实际实现中应该调用配置管理器的保存方法
    console.log('Toggle assembly:', assemblyName)
  }
}

// 编辑装配件
const editAssembly = (config: any) => {
  editingAssembly.value = { ...config }
  showEditDialog.value = true
}

// 保存装配件配置
const saveAssembly = async (config: any) => {
  try {
    // 这里应该调用配置管理器的保存方法
    console.log('Save assembly config:', config)
    showEditDialog.value = false
    await refresh()
  } catch (err) {
    console.error('保存装配件配置失败:', err)
  }
}
</script>

<style scoped>
.assembly-manager {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.assembly-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.list-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.filter-select, .search-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  width: 200px;
}

.assembly-items {
  padding: 0;
}

.loading, .empty-state {
  padding: 40px;
  text-align: center;
  color: #6c757d;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.import-textarea {
  width: 100%;
  height: 200px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
  resize: vertical;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
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

.icon {
  font-size: 0.8rem;
}
</style>
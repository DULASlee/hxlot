<!--
数据字典管理器
适用场景: 企业级数据字典管理、枚举值配置、标准化数据
依赖项: Vue 3, SmartAbp低代码引擎, Element Plus
核心功能: 字典管理、枚举配置、数据标准化
-->

<template>
  <div class="data-dictionary-manager">
    <!-- 工具栏 -->
    <div class="manager-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            :type="activeTab === 'dictionaries' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'dictionaries'"
          >
            数据字典
          </el-button>
          <el-button
            :type="activeTab === 'enums' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'enums'"
          >
            枚举管理
          </el-button>
          <el-button
            :type="activeTab === 'standards' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'standards'"
          >
            数据标准
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-button
          size="small"
          type="primary"
          @click="showAddDialog = true"
        >
          添加字典
        </el-button>
        <el-button
          size="small"
          @click="exportDictionaries"
        >
          导出字典
        </el-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="manager-content">
      <!-- 数据字典管理 -->
      <div
        v-if="activeTab === 'dictionaries'"
        class="dictionaries-panel"
      >
        <div class="panel-header">
          <h4>数据字典列表</h4>
        </div>

        <el-table
          :data="dictionaries"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="字典名称"
            width="200"
          />
          <el-table-column
            prop="displayName"
            label="显示名称"
            width="200"
          />
          <el-table-column
            prop="description"
            label="描述"
          />
          <el-table-column
            prop="itemCount"
            label="项目数量"
            width="100"
          />
          <el-table-column
            label="操作"
            width="200"
          >
            <template #default="scope">
              <el-button
                size="small"
                @click="editDictionary(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteDictionary(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 枚举管理 -->
      <div
        v-else-if="activeTab === 'enums'"
        class="enums-panel"
      >
        <div class="panel-header">
          <h4>枚举类型管理</h4>
        </div>

        <div class="enums-content">
          <p>枚举管理功能开发中...</p>
        </div>
      </div>

      <!-- 数据标准 -->
      <div
        v-else-if="activeTab === 'standards'"
        class="standards-panel"
      >
        <div class="panel-header">
          <h4>数据标准管理</h4>
        </div>

        <div class="standards-content">
          <p>数据标准功能开发中...</p>
        </div>
      </div>
    </div>

    <!-- 添加字典对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加数据字典"
      width="600px"
    >
      <el-form
        :model="newDictionary"
        label-width="100px"
      >
        <el-form-item
          label="字典名称"
          required
        >
          <el-input
            v-model="newDictionary.name"
            placeholder="请输入字典名称"
          />
        </el-form-item>
        <el-form-item
          label="显示名称"
          required
        >
          <el-input
            v-model="newDictionary.displayName"
            placeholder="请输入显示名称"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newDictionary.description"
            type="textarea"
            :rows="3"
            placeholder="请输入字典描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="confirmAddDictionary"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const activeTab = ref<'dictionaries' | 'enums' | 'standards'>('dictionaries')
const showAddDialog = ref(false)
const dictionaries = ref([
  {
    id: '1',
    name: 'UserStatus',
    displayName: '用户状态',
    description: '用户账户状态枚举',
    itemCount: 3
  },
  {
    id: '2',
    name: 'Gender',
    displayName: '性别',
    description: '性别类型枚举',
    itemCount: 2
  }
])

const newDictionary = ref({
  name: '',
  displayName: '',
  description: ''
})

// 事件
const emit = defineEmits<{
  'dictionary-selected': [dictionary: any]
  'dictionary-updated': [dictionary: any]
}>()

// 方法
const editDictionary = (dictionary: any) => {
  emit('dictionary-selected', dictionary)
  ElMessage.info(`编辑字典: ${dictionary.displayName}`)
}

const deleteDictionary = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个数据字典吗？', '删除确认', {
      type: 'warning'
    })
    
    const index = dictionaries.value.findIndex(d => d.id === id)
    if (index >= 0) {
      dictionaries.value.splice(index, 1)
      ElMessage.success('字典删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const confirmAddDictionary = () => {
  if (!newDictionary.value.name || !newDictionary.value.displayName) {
    ElMessage.error('请填写必填字段')
    return
  }

  const dictionary = {
    id: Date.now().toString(),
    ...newDictionary.value,
    itemCount: 0
  }

  dictionaries.value.push(dictionary)
  emit('dictionary-updated', dictionary)
  
  // 重置表单
  newDictionary.value = {
    name: '',
    displayName: '',
    description: ''
  }
  
  showAddDialog.value = false
  ElMessage.success('字典添加成功')
}

const exportDictionaries = () => {
  ElMessage.info('导出功能开发中')
}

// 生命周期
onMounted(() => {
  // 初始化组件
})
</script>

<style scoped>
.data-dictionary-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.manager-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.manager-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-header h4 {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.dictionaries-panel,
.enums-panel,
.standards-panel {
  height: 100%;
}

.enums-content,
.standards-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--el-text-color-secondary);
}
</style>
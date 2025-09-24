<template>
  <div class="data-dictionary-manager">
    <el-card>
      <template #header>
        <div class="manager-header">
          <h3>
            <i class="el-icon-collection" />
            数据字典管理器
          </h3>
          <div class="manager-actions">
            <el-button-group size="small">
              <el-button
                type="primary"
                icon="el-icon-plus"
                @click="showAddDictDialog = true"
              >
                新建字典
              </el-button>
              <el-button
                icon="el-icon-upload"
                @click="showImportDialog = true"
              >
                导入字典
              </el-button>
              <el-button
                icon="el-icon-download"
                @click="exportDictionaries"
              >
                导出字典
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 字典分类和搜索 -->
      <div class="dictionary-filters">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-select
              v-model="selectedCategory"
              placeholder="选择字典分类"
              clearable
              @change="filterDictionaries"
            >
              <el-option
                v-for="category in dictionaryCategories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索字典名称或代码"
              prefix-icon="el-icon-search"
              clearable
              @input="filterDictionaries"
            />
          </el-col>
          <el-col :span="8">
            <el-select
              v-model="statusFilter"
              placeholder="字典状态"
              clearable
              @change="filterDictionaries"
            >
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 字典列表 -->
      <div class="dictionaries-list">
        <div
          v-for="dict in filteredDictionaries"
          :key="dict.id"
          class="dictionary-card"
          :class="{ 
            active: selectedDictionary?.id === dict.id,
            disabled: !dict.isEnabled
          }"
          @click="selectDictionary(dict)"
        >
          <div class="dict-header">
            <div class="dict-info">
              <div class="dict-name">
                <span class="name-text">{{ dict.name }}</span>
                <el-tag
                  :type="dict.isEnabled ? 'success' : 'info'"
                  size="mini"
                >
                  {{ dict.isEnabled ? '启用' : '禁用' }}
                </el-tag>
              </div>
              <div class="dict-code">代码: {{ dict.code }}</div>
              <div class="dict-description">{{ dict.description }}</div>
            </div>
            <div class="dict-stats">
              <div class="stat-item">
                <span class="stat-value">{{ dict.items?.length || 0 }}</span>
                <span class="stat-label">字典项</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getUsageCount(dict.code) }}</span>
                <span class="stat-label">使用次数</span>
              </div>
            </div>
          </div>
          
          <!-- 字典项预览 -->
          <div class="dict-items-preview">
            <el-tag
              v-for="item in (dict.items || []).slice(0, 5)"
              :key="item.id"
              size="mini"
              type="primary"
            >
              {{ item.label }}
            </el-tag>
            <span
              v-if="(dict.items?.length || 0) > 5"
              class="more-items"
            >
              +{{ dict.items.length - 5 }}个
            </span>
          </div>

          <!-- 字典操作 -->
          <div class="dict-actions">
            <el-button-group size="mini">
              <el-button
                icon="el-icon-edit"
                @click.stop="editDictionary(dict)"
              >
                编辑
              </el-button>
              <el-button
                icon="el-icon-plus"
                @click.stop="addDictItem(dict)"
              >
                添加项
              </el-button>
              <el-button
                icon="el-icon-document-copy"
                @click.stop="duplicateDictionary(dict)"
              >
                复制
              </el-button>
              <el-button
                icon="el-icon-delete"
                type="danger"
                @click.stop="deleteDictionary(dict)"
              >
                删除
              </el-button>
            </el-button-group>
          </div>
        </div>
      </div>

      <!-- 字典详情编辑面板 -->
      <div v-if="selectedDictionary" class="dictionary-details">
        <el-card>
          <template #header>
            <div class="details-header">
              <h4>
                <i class="el-icon-edit" />
                {{ selectedDictionary.name }} - 字典项管理
              </h4>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-plus"
                @click="addDictItem(selectedDictionary)"
              >
                添加字典项
              </el-button>
            </div>
          </template>

          <el-table
            :data="selectedDictionary.items || []"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column
              prop="code"
              label="代码"
              width="120"
            >
              <template #default="{ row, $index }">
                <el-input
                  v-model="row.code"
                  size="small"
                  @change="validateDictItem(row, $index)"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="label"
              label="显示标签"
              width="150"
            >
              <template #default="{ row }">
                <el-input
                  v-model="row.label"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="value"
              label="实际值"
              width="120"
            >
              <template #default="{ row }">
                <el-input
                  v-model="row.value"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="sortOrder"
              label="排序"
              width="80"
            >
              <template #default="{ row }">
                <el-input-number
                  v-model="row.sortOrder"
                  size="small"
                  :min="0"
                  :max="9999"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="description"
              label="描述"
              min-width="200"
            >
              <template #default="{ row }">
                <el-input
                  v-model="row.description"
                  size="small"
                  placeholder="字典项描述"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="isEnabled"
              label="状态"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                <el-switch
                  v-model="row.isEnabled"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="120"
              align="center"
            >
              <template #default="{ row, $index }">
                <el-button-group size="mini">
                  <el-button
                    icon="el-icon-top"
                    @click="moveDictItem($index, 'up')"
                    :disabled="$index === 0"
                  />
                  <el-button
                    icon="el-icon-bottom"
                    @click="moveDictItem($index, 'down')"
                    :disabled="$index === selectedDictionary.items.length - 1"
                  />
                  <el-button
                    icon="el-icon-delete"
                    type="danger"
                    @click="removeDictItem($index)"
                  />
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-card>

    <!-- 新建字典对话框 -->
    <el-dialog
      v-model="showAddDictDialog"
      title="新建数据字典"
      width="600px"
    >
      <el-form
        ref="dictFormRef"
        :model="dictForm"
        :rules="dictFormRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="字典名称" prop="name">
              <el-input
                v-model="dictForm.name"
                placeholder="例如：用户状态"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字典代码" prop="code">
              <el-input
                v-model="dictForm.code"
                placeholder="例如：USER_STATUS"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="字典分类" prop="category">
          <el-select
            v-model="dictForm.category"
            placeholder="选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in dictionaryCategories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="字典描述">
          <el-input
            v-model="dictForm.description"
            type="textarea"
            :rows="2"
            placeholder="详细描述此字典的用途"
          />
        </el-form-item>

        <el-form-item label="预设字典项">
          <div class="preset-items">
            <el-checkbox-group v-model="dictForm.presetItems">
              <el-checkbox
                v-for="preset in getPresetItemsForCategory(dictForm.category)"
                :key="preset.id"
                :label="preset.id"
              >
                {{ preset.name }} ({{ preset.items.length }}项)
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDictDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveDictionary"
          :loading="savingDict"
        >
          创建字典
        </el-button>
      </template>
    </el-dialog>

    <!-- 导入字典对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入数据字典"
      width="500px"
    >
      <div class="import-options">
        <el-radio-group v-model="importType">
          <el-radio label="excel">从Excel文件导入</el-radio>
          <el-radio label="json">从JSON文件导入</el-radio>
          <el-radio label="database">从数据库导入</el-radio>
        </el-radio-group>

        <div v-if="importType === 'excel'" class="excel-import">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="true"
            accept=".xlsx,.xls"
            @change="handleFileChange"
          >
            <el-button type="primary" icon="el-icon-upload">
              选择Excel文件
            </el-button>
          </el-upload>
          <div class="import-template">
            <el-link
              type="primary"
              @click="downloadTemplate"
            >
              下载导入模板
            </el-link>
          </div>
        </div>

        <div v-if="importType === 'database'" class="database-import">
          <el-form label-width="100px">
            <el-form-item label="数据库类型">
              <el-select v-model="dbConfig.type">
                <el-option label="MySQL" value="mysql" />
                <el-option label="SQL Server" value="sqlserver" />
                <el-option label="PostgreSQL" value="postgresql" />
                <el-option label="Oracle" value="oracle" />
              </el-select>
            </el-form-item>
            <el-form-item label="连接字符串">
              <el-input
                v-model="dbConfig.connectionString"
                type="textarea"
                :rows="2"
                placeholder="数据库连接字符串"
              />
            </el-form-item>
            <el-form-item label="查询SQL">
              <el-input
                v-model="dbConfig.query"
                type="textarea"
                :rows="3"
                placeholder="SELECT code, label, value FROM dict_table"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="executeImport"
          :loading="importing"
        >
          开始导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const selectedCategory = ref('')
const searchKeyword = ref('')
const statusFilter = ref(null)
const selectedDictionary = ref(null)
const importing = ref(false)
const savingDict = ref(false)

// 对话框状态
const showAddDictDialog = ref(false)
const showImportDialog = ref(false)

// 导入配置
const importType = ref('excel')
const dbConfig = ref({
  type: 'mysql',
  connectionString: '',
  query: ''
})

// 字典表单
const dictForm = ref({
  name: '',
  code: '',
  category: 'system',
  description: '',
  presetItems: []
})

// 字典分类
const dictionaryCategories = ref([
  { label: '系统字典', value: 'system' },
  { label: '业务字典', value: 'business' },
  { label: '用户字典', value: 'user' },
  { label: '组织字典', value: 'organization' },
  { label: '权限字典', value: 'permission' },
  { label: '项目字典', value: 'project' },
  { label: '设备字典', value: 'equipment' },
  { label: '质量字典', value: 'quality' }
])

// 数据字典数据
const dictionaries = ref([
  {
    id: 'user-status',
    name: '用户状态',
    code: 'USER_STATUS',
    category: 'user',
    description: '系统用户的状态分类',
    isEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    items: [
      { id: 1, code: 'ACTIVE', label: '启用', value: '1', sortOrder: 1, description: '用户账户正常使用', isEnabled: true },
      { id: 2, code: 'INACTIVE', label: '禁用', value: '0', sortOrder: 2, description: '用户账户被禁用', isEnabled: true },
      { id: 3, code: 'LOCKED', label: '锁定', value: '2', sortOrder: 3, description: '用户账户被锁定', isEnabled: true },
      { id: 4, code: 'PENDING', label: '待激活', value: '3', sortOrder: 4, description: '等待用户激活', isEnabled: true }
    ]
  },
  {
    id: 'project-type',
    name: '项目类型',
    code: 'PROJECT_TYPE',
    category: 'project',
    description: '工程项目的类型分类',
    isEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    items: [
      { id: 1, code: 'RESIDENTIAL', label: '住宅项目', value: 'residential', sortOrder: 1, description: '住宅建筑项目', isEnabled: true },
      { id: 2, code: 'COMMERCIAL', label: '商业项目', value: 'commercial', sortOrder: 2, description: '商业建筑项目', isEnabled: true },
      { id: 3, code: 'INFRASTRUCTURE', label: '基础设施', value: 'infrastructure', sortOrder: 3, description: '基础设施建设项目', isEnabled: true },
      { id: 4, code: 'INDUSTRIAL', label: '工业项目', value: 'industrial', sortOrder: 4, description: '工业建筑项目', isEnabled: true }
    ]
  },
  {
    id: 'equipment-status',
    name: '设备状态',
    code: 'EQUIPMENT_STATUS',
    category: 'equipment',
    description: '设备的运行状态分类',
    isEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    items: [
      { id: 1, code: 'NORMAL', label: '正常', value: 'normal', sortOrder: 1, description: '设备正常运行', isEnabled: true },
      { id: 2, code: 'MAINTENANCE', label: '维护中', value: 'maintenance', sortOrder: 2, description: '设备正在维护', isEnabled: true },
      { id: 3, code: 'FAULT', label: '故障', value: 'fault', sortOrder: 3, description: '设备出现故障', isEnabled: true },
      { id: 4, code: 'RETIRED', label: '报废', value: 'retired', sortOrder: 4, description: '设备已报废', isEnabled: true }
    ]
  },
  {
    id: 'quality-level',
    name: '质量等级',
    code: 'QUALITY_LEVEL',
    category: 'quality',
    description: '产品或工程的质量等级',
    isEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    items: [
      { id: 1, code: 'EXCELLENT', label: '优秀', value: 'A', sortOrder: 1, description: '质量优秀', isEnabled: true },
      { id: 2, code: 'GOOD', label: '良好', value: 'B', sortOrder: 2, description: '质量良好', isEnabled: true },
      { id: 3, code: 'QUALIFIED', label: '合格', value: 'C', sortOrder: 3, description: '质量合格', isEnabled: true },
      { id: 4, code: 'UNQUALIFIED', label: '不合格', value: 'D', sortOrder: 4, description: '质量不合格', isEnabled: true }
    ]
  }
])

// 预设字典项模板
const presetItemTemplates = ref({
  system: [
    {
      id: 'yes-no',
      name: '是否选项',
      items: [
        { code: 'YES', label: '是', value: 'true', sortOrder: 1 },
        { code: 'NO', label: '否', value: 'false', sortOrder: 2 }
      ]
    },
    {
      id: 'enable-disable',
      name: '启用禁用',
      items: [
        { code: 'ENABLED', label: '启用', value: '1', sortOrder: 1 },
        { code: 'DISABLED', label: '禁用', value: '0', sortOrder: 2 }
      ]
    }
  ],
  user: [
    {
      id: 'gender',
      name: '性别',
      items: [
        { code: 'MALE', label: '男', value: '1', sortOrder: 1 },
        { code: 'FEMALE', label: '女', value: '2', sortOrder: 2 },
        { code: 'OTHER', label: '其他', value: '0', sortOrder: 3 }
      ]
    },
    {
      id: 'education-level',
      name: '教育程度',
      items: [
        { code: 'PRIMARY', label: '小学', value: '1', sortOrder: 1 },
        { code: 'MIDDLE', label: '初中', value: '2', sortOrder: 2 },
        { code: 'HIGH', label: '高中', value: '3', sortOrder: 3 },
        { code: 'COLLEGE', label: '大专', value: '4', sortOrder: 4 },
        { code: 'BACHELOR', label: '本科', value: '5', sortOrder: 5 },
        { code: 'MASTER', label: '硕士', value: '6', sortOrder: 6 },
        { code: 'DOCTOR', label: '博士', value: '7', sortOrder: 7 }
      ]
    }
  ],
  project: [
    {
      id: 'project-priority',
      name: '项目优先级',
      items: [
        { code: 'LOW', label: '低', value: '1', sortOrder: 1 },
        { code: 'NORMAL', label: '中', value: '2', sortOrder: 2 },
        { code: 'HIGH', label: '高', value: '3', sortOrder: 3 },
        { code: 'URGENT', label: '紧急', value: '4', sortOrder: 4 }
      ]
    }
  ]
})

// 表单验证规则
const dictFormRules = {
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入字典代码', trigger: 'blur' },
    { pattern: /^[A-Z][A-Z0-9_]*$/, message: '字典代码应为大写字母和下划线', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择字典分类', trigger: 'change' }
  ]
}

// 计算属性
const filteredDictionaries = computed(() => {
  let filtered = dictionaries.value

  if (selectedCategory.value) {
    filtered = filtered.filter(dict => dict.category === selectedCategory.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(dict => 
      dict.name.toLowerCase().includes(keyword) ||
      dict.code.toLowerCase().includes(keyword) ||
      dict.description?.toLowerCase().includes(keyword)
    )
  }

  if (statusFilter.value !== null) {
    filtered = filtered.filter(dict => dict.isEnabled === statusFilter.value)
  }

  return filtered
})

// 方法
const selectDictionary = (dict) => {
  selectedDictionary.value = dict
}

const editDictionary = (dict) => {
  dictForm.value = { ...dict }
  showAddDictDialog.value = true
}

const deleteDictionary = async (dict) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除字典"${dict.name}"吗？这将同时删除所有字典项。`,
      '确认删除',
      { type: 'warning' }
    )
    
    const index = dictionaries.value.findIndex(d => d.id === dict.id)
    if (index > -1) {
      dictionaries.value.splice(index, 1)
      if (selectedDictionary.value?.id === dict.id) {
        selectedDictionary.value = null
      }
      ElMessage.success('字典删除成功')
    }
  } catch {
    // 用户取消
  }
}

const duplicateDictionary = (dict) => {
  const duplicated = {
    ...dict,
    id: `dict-${Date.now()}`,
    name: `${dict.name} (副本)`,
    code: `${dict.code}_COPY`,
    items: dict.items?.map(item => ({ ...item, id: Date.now() + Math.random() }))
  }
  
  dictionaries.value.push(duplicated)
  ElMessage.success('字典复制成功')
}

const addDictItem = (dict) => {
  if (!dict.items) {
    dict.items = []
  }
  
  dict.items.push({
    id: Date.now(),
    code: '',
    label: '',
    value: '',
    sortOrder: dict.items.length + 1,
    description: '',
    isEnabled: true
  })
}

const removeDictItem = (index) => {
  selectedDictionary.value.items.splice(index, 1)
}

const moveDictItem = (index, direction) => {
  const items = selectedDictionary.value.items
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  
  if (targetIndex >= 0 && targetIndex < items.length) {
    const temp = items[index]
    items[index] = items[targetIndex]
    items[targetIndex] = temp
    
    // 更新排序号
    items.forEach((item, idx) => {
      item.sortOrder = idx + 1
    })
  }
}

const validateDictItem = (item, index) => {
  const items = selectedDictionary.value.items
  
  // 检查代码重复
  const duplicateIndex = items.findIndex((existingItem, idx) => 
    idx !== index && existingItem.code === item.code && item.code
  )
  
  if (duplicateIndex > -1) {
    ElMessage.warning(`字典项代码"${item.code}"已存在`)
    item.code = ''
  }
}

const saveDictionary = async () => {
  try {
    savingDict.value = true
    
    // 验证表单
    await dictFormRef.value?.validate()
    
    // 检查代码重复
    const existingDict = dictionaries.value.find(d => 
      d.code === dictForm.value.code && d.id !== dictForm.value.id
    )
    
    if (existingDict) {
      ElMessage.error('字典代码已存在')
      return
    }
    
    const newDict = {
      ...dictForm.value,
      id: dictForm.value.id || `dict-${Date.now()}`,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      items: []
    }
    
    // 应用预设字典项
    if (dictForm.value.presetItems?.length > 0) {
      dictForm.value.presetItems.forEach(presetId => {
        const preset = getPresetById(presetId)
        if (preset) {
          newDict.items.push(...preset.items.map(item => ({
            ...item,
            id: Date.now() + Math.random(),
            isEnabled: true
          })))
        }
      })
    }
    
    if (dictForm.value.id) {
      // 更新现有字典
      const index = dictionaries.value.findIndex(d => d.id === dictForm.value.id)
      if (index > -1) {
        dictionaries.value[index] = { ...dictionaries.value[index], ...newDict }
      }
    } else {
      // 添加新字典
      dictionaries.value.push(newDict)
    }
    
    ElMessage.success('数据字典保存成功')
    showAddDictDialog.value = false
    
    // 重置表单
    dictForm.value = {
      name: '',
      code: '',
      category: 'system',
      description: '',
      presetItems: []
    }
    
  } catch (error) {
    ElMessage.error('保存字典失败：' + error.message)
  } finally {
    savingDict.value = false
  }
}

const filterDictionaries = () => {
  // 触发计算属性重新计算，不需要额外逻辑
}

const getUsageCount = (dictCode) => {
  // 模拟计算字典使用次数
  return Math.floor(Math.random() * 50) + 1
}

const getPresetItemsForCategory = (category) => {
  return presetItemTemplates.value[category] || []
}

const getPresetById = (presetId) => {
  for (const category of Object.values(presetItemTemplates.value)) {
    const preset = category.find(p => p.id === presetId)
    if (preset) return preset
  }
  return null
}

const handleFileChange = (file) => {
  console.log('File selected:', file)
}

const downloadTemplate = () => {
  // 生成Excel模板下载
  const csvContent = 'code,label,value,sortOrder,description\nACTIVE,启用,1,1,用户账户正常使用\nINACTIVE,禁用,0,2,用户账户被禁用'
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'data_dictionary_template.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const executeImport = async () => {
  try {
    importing.value = true
    
    // 模拟导入过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('数据字典导入成功')
    showImportDialog.value = false
    
  } catch (error) {
    ElMessage.error('导入失败：' + error.message)
  } finally {
    importing.value = false
  }
}

const exportDictionaries = () => {
  try {
    const exportData = {
      dictionaries: filteredDictionaries.value,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `data_dictionaries_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('数据字典导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + error.message)
  }
}

// 引用
const dictFormRef = ref()
const uploadRef = ref()

// Emits
const emit = defineEmits<{
  'dictionary-selected': [dict: any]
  'dictionary-updated': [dict: any]
}>()
</script>

<style scoped>
.data-dictionary-manager {
  height: 100%;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.manager-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

/* 过滤器样式 */
.dictionary-filters {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

/* 字典列表样式 */
.dictionaries-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.dictionary-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dictionary-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.dictionary-card.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.dictionary-card.disabled {
  opacity: 0.6;
  background: var(--el-bg-color-page);
}

.dict-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.dict-info {
  flex: 1;
}

.dict-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.name-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dict-code {
  font-size: 12px;
  color: var(--el-color-primary);
  font-family: var(--el-font-family-mono, Consolas, monospace);
  margin-bottom: 4px;
}

.dict-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.dict-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.dict-items-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.more-items {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.dict-actions {
  display: flex;
  justify-content: center;
}

/* 字典详情样式 */
.dictionary-details {
  margin-top: 20px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-header h4 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

/* 导入选项样式 */
.import-options {
  padding: 16px 0;
}

.excel-import,
.database-import {
  margin-top: 16px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.import-template {
  margin-top: 12px;
  text-align: center;
}

.preset-items {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}
</style>

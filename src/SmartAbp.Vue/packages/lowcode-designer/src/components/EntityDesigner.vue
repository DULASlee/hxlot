<template>
  <div class="entity-designer">
    <!-- 实体基本信息 -->
    <el-card
      class="entity-basic-info"
      shadow="never"
    >
      <template #header>
        <div class="card-header">
          <span class="title">实体基本信息</span>
        </div>
      </template>

      <el-form
        :model="entityData"
        label-width="120px"
        :disabled="readonly"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="实体名称"
              required
            >
              <el-input 
                v-model="entityData.name" 
                placeholder="请输入实体名称（PascalCase）"
                @input="handleNameChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="显示名称"
              required
            >
              <el-input 
                v-model="entityData.displayName" 
                placeholder="请输入显示名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="表名">
              <el-input 
                v-model="entityData.tableName" 
                placeholder="自动生成或手动输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="描述">
              <el-input 
                v-model="entityData.description" 
                type="textarea"
                :rows="1"
                placeholder="请输入实体描述"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="启用审计">
              <el-switch v-model="entityData.isAuditEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="软删除">
              <el-switch v-model="entityData.isSoftDelete" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="多租户">
              <el-switch v-model="entityData.isMultiTenant" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 字段设计 -->
    <el-card
      class="entity-fields"
      shadow="never"
    >
      <template #header>
        <div class="card-header">
          <span class="title">字段设计</span>
          <el-button 
            v-if="!readonly"
            type="primary" 
            size="small" 
            icon="el-icon-plus"
            @click="handleAddField"
          >
            添加字段
          </el-button>
        </div>
      </template>

      <el-table 
        :data="entityData.fields" 
        border
        style="width: 100%"
      >
        <el-table-column
          type="index"
          label="#"
          width="50"
        />
        
        <el-table-column
          label="字段名"
          min-width="150"
        >
          <template #default="{ row }">
            <el-input 
              v-model="row.name" 
              placeholder="camelCase"
              :disabled="readonly"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="显示名称"
          min-width="150"
        >
          <template #default="{ row }">
            <el-input 
              v-model="row.displayName" 
              placeholder="中文名称"
              :disabled="readonly"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="类型"
          width="150"
        >
          <template #default="{ row }">
            <el-select 
              v-model="row.type" 
              placeholder="选择类型"
              :disabled="readonly"
              size="small"
            >
              <el-option
                label="字符串"
                value="string"
              />
              <el-option
                label="数字"
                value="number"
              />
              <el-option
                label="布尔"
                value="boolean"
              />
              <el-option
                label="日期"
                value="date"
              />
              <el-option
                label="日期时间"
                value="datetime"
              />
              <el-option
                label="枚举"
                value="enum"
              />
              <el-option
                label="引用"
                value="reference"
              />
              <el-option
                label="数组"
                value="array"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column
          label="必填"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <el-checkbox 
              v-model="row.isRequired" 
              :disabled="readonly"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="唯一"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <el-checkbox 
              v-model="row.isUnique" 
              :disabled="readonly"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="索引"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <el-checkbox 
              v-model="row.isIndexed" 
              :disabled="readonly"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="120"
          align="center"
          fixed="right"
        >
          <template #default="{ row, $index }">
            <el-button 
              v-if="!readonly"
              type="text" 
              size="small" 
              icon="el-icon-setting"
              @click="handleEditField(row)"
            >
              配置
            </el-button>
            <el-button 
              v-if="!readonly"
              type="text" 
              size="small" 
              icon="el-icon-delete"
              @click="handleDeleteField($index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 关系设计 -->
    <el-card
      class="entity-relations"
      shadow="never"
    >
      <template #header>
        <div class="card-header">
          <span class="title">关系设计</span>
          <el-button 
            v-if="!readonly"
            type="primary" 
            size="small" 
            icon="el-icon-plus"
            @click="handleAddRelation"
          >
            添加关系
          </el-button>
        </div>
      </template>

      <el-table 
        :data="entityData.relations" 
        border
        style="width: 100%"
      >
        <el-table-column
          type="index"
          label="#"
          width="50"
        />
        
        <el-table-column
          label="关系名"
          min-width="150"
        >
          <template #default="{ row }">
            <el-input 
              v-model="row.name" 
              placeholder="关系名称"
              :disabled="readonly"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="关系类型"
          width="150"
        >
          <template #default="{ row }">
            <el-select 
              v-model="row.type" 
              placeholder="选择类型"
              :disabled="readonly"
              size="small"
            >
              <el-option
                label="一对一"
                value="oneToOne"
              />
              <el-option
                label="一对多"
                value="oneToMany"
              />
              <el-option
                label="多对一"
                value="manyToOne"
              />
              <el-option
                label="多对多"
                value="manyToMany"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column
          label="目标实体"
          min-width="150"
        >
          <template #default="{ row }">
            <el-input 
              v-model="row.targetEntity" 
              placeholder="目标实体名"
              :disabled="readonly"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="级联删除"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-checkbox 
              v-model="row.cascadeDelete" 
              :disabled="readonly"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="120"
          align="center"
          fixed="right"
        >
          <template #default="{ row, $index }">
            <el-button 
              v-if="!readonly"
              type="text" 
              size="small" 
              icon="el-icon-setting"
              @click="handleEditRelation(row)"
            >
              配置
            </el-button>
            <el-button 
              v-if="!readonly"
              type="text" 
              size="small" 
              icon="el-icon-delete"
              @click="handleDeleteRelation($index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 字段配置对话框 -->
    <el-dialog
      v-model="fieldDialogVisible"
      title="字段配置"
      width="600px"
    >
      <el-form 
        v-if="currentField" 
        :model="currentField" 
        label-width="120px"
      >
        <el-form-item label="默认值">
          <el-input v-model="currentField.defaultValue" />
        </el-form-item>

        <el-form-item
          v-if="currentField.type === 'string'"
          label="最大长度"
        >
          <el-input-number 
            v-model="currentField.maxLength" 
            :min="1"
            :max="10000"
          />
        </el-form-item>

        <el-form-item
          v-if="currentField.type === 'string'"
          label="最小长度"
        >
          <el-input-number 
            v-model="currentField.minLength" 
            :min="0"
            :max="10000"
          />
        </el-form-item>

        <el-form-item
          v-if="currentField.type === 'string'"
          label="正则表达式"
        >
          <el-input 
            v-model="currentField.pattern" 
            placeholder="验证格式"
          />
        </el-form-item>

        <el-form-item
          v-if="currentField.type === 'enum'"
          label="枚举值"
        >
          <el-select 
            v-model="currentField.enumValues" 
            multiple 
            allow-create 
            filterable 
            placeholder="输入枚举值"
          />
        </el-form-item>

        <el-form-item
          v-if="currentField.type === 'reference'"
          label="引用实体"
        >
          <el-input 
            v-model="currentField.referenceEntity" 
            placeholder="实体名称"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input 
            v-model="currentField.description" 
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="fieldDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSaveField"
        >
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 关系配置对话框 -->
    <el-dialog
      v-model="relationDialogVisible"
      title="关系配置"
      width="600px"
    >
      <el-form 
        v-if="currentRelation" 
        :model="currentRelation" 
        label-width="120px"
      >
        <el-form-item label="外键">
          <el-input 
            v-model="currentRelation.foreignKey" 
            placeholder="外键字段名"
          />
        </el-form-item>

        <el-form-item 
          v-if="currentRelation.type === 'manyToMany'" 
          label="反向外键"
        >
          <el-input 
            v-model="currentRelation.inverseForeignKey" 
            placeholder="反向外键字段名"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="relationDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSaveRelation"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { 
  EntityDesignerProps,
  EntityDefinition,
  EntityField,
  EntityRelation
} from '../types/designer'

// Props
const props = withDefaults(defineProps<EntityDesignerProps>(), {
  readonly: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: EntityDefinition]
}>()

// 实体数据
const entityData = reactive<EntityDefinition>({
  id: '',
  name: '',
  displayName: '',
  tableName: '',
  description: '',
  fields: [],
  relations: [],
  isAuditEnabled: true,
  isSoftDelete: true,
  isMultiTenant: false
})

// 对话框状态
const fieldDialogVisible = ref(false)
const relationDialogVisible = ref(false)
const currentField = ref<EntityField | null>(null)
const currentRelation = ref<EntityRelation | null>(null)

// 初始化数据
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(entityData, newValue)
    }
  },
  { immediate: true }
)

// 监听数据变化并发送事件
watch(
  entityData,
  (newValue) => {
    emit('update:modelValue', { ...newValue })
  },
  { deep: true }
)

// 处理实体名称变化
const handleNameChange = () => {
  if (!entityData.tableName) {
    // 自动生成表名（添加 Tbl 前缀）
    entityData.tableName = `Tbl${entityData.name}`
  }
  if (!entityData.id) {
    // 生成唯一ID
    entityData.id = `entity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}

// 添加字段
const handleAddField = () => {
  const newField: EntityField = {
    id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: '',
    displayName: '',
    type: 'string',
    isRequired: false,
    isUnique: false,
    isIndexed: false
  }
  entityData.fields.push(newField)
}

// 编辑字段
const handleEditField = (field: EntityField) => {
  currentField.value = { ...field }
  fieldDialogVisible.value = true
}

// 保存字段配置
const handleSaveField = () => {
  if (!currentField.value) return
  
  const index = entityData.fields.findIndex(f => f.id === currentField.value!.id)
  if (index >= 0) {
    entityData.fields[index] = { ...currentField.value }
  }
  
  fieldDialogVisible.value = false
  currentField.value = null
  ElMessage.success('字段配置已保存')
}

// 删除字段
const handleDeleteField = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该字段吗？', '提示', {
      type: 'warning'
    })
    entityData.fields.splice(index, 1)
    ElMessage.success('字段已删除')
  } catch {
    // 用户取消
  }
}

// 添加关系
const handleAddRelation = () => {
  const newRelation: EntityRelation = {
    id: `relation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: '',
    type: 'oneToMany',
    targetEntity: '',
    cascadeDelete: false
  }
  entityData.relations.push(newRelation)
}

// 编辑关系
const handleEditRelation = (relation: EntityRelation) => {
  currentRelation.value = { ...relation }
  relationDialogVisible.value = true
}

// 保存关系配置
const handleSaveRelation = () => {
  if (!currentRelation.value) return
  
  const index = entityData.relations.findIndex(r => r.id === currentRelation.value!.id)
  if (index >= 0) {
    entityData.relations[index] = { ...currentRelation.value }
  }
  
  relationDialogVisible.value = false
  currentRelation.value = null
  ElMessage.success('关系配置已保存')
}

// 删除关系
const handleDeleteRelation = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该关系吗？', '提示', {
      type: 'warning'
    })
    entityData.relations.splice(index, 1)
    ElMessage.success('关系已删除')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.entity-designer {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .el-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .entity-basic-info {
    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .entity-fields,
  .entity-relations {
    :deep(.el-card__body) {
      padding: 0;
    }

    :deep(.el-table) {
      font-size: 14px;

      .el-input,
      .el-select {
        width: 100%;
      }
    }
  }
}
</style>


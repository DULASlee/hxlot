<template>
  <div class="field-config-table">
    <div class="table-header">
      <el-button type="primary" :icon="Plus" @click="handleAddField">
        添加字段
      </el-button>
      <el-text class="field-count">
        已配置 {{ fields.length }} 个字段
      </el-text>
    </div>

    <el-table
      :data="fields"
      border
      stripe
      :max-height="500"
      class="field-table"
      @row-click="handleRowClick"
    >
      <el-table-column type="index" width="50" label="#" />

      <el-table-column prop="name" label="字段名称" width="150">
        <template #default="{ row, $index }">
          <el-input
            v-model="row.name"
            placeholder="PascalCase"
            @blur="validateFieldName(row, $index)"
            :class="{ 'is-error': row._nameError }"
          />
          <span v-if="row._nameError" class="error-tip">{{ row._nameError }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="displayName" label="显示名称" width="150">
        <template #default="{ row }">
          <el-input v-model="row.displayName" placeholder="例如：用户名" />
        </template>
      </el-table-column>

      <el-table-column prop="type" label="字段类型" width="130">
        <template #default="{ row }">
          <el-select v-model="row.type" @change="handleTypeChange(row)" filterable>
            <el-option label="字符串" value="string" />
            <el-option label="整数" value="int" />
            <el-option label="小数" value="decimal" />
            <el-option label="布尔" value="bool" />
            <el-option label="日期时间" value="DateTime" />
            <el-option label="枚举" value="enum" />
            <el-option label="GUID" value="Guid" />
            <el-option label="长文本" value="text" />
            <el-option label="JSON" value="json" />
            <el-option label="二进制" value="byte[]" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column prop="isRequired" label="必填" width="80">
        <template #default="{ row }">
          <el-checkbox v-model="row.isRequired" />
        </template>
      </el-table-column>

      <el-table-column label="约束" width="150">
        <template #default="{ row }">
          <!-- 字符串长度 -->
          <el-input
            v-if="row.type === 'string'"
            v-model.number="row.maxLength"
            placeholder="最大长度"
            type="number"
            size="small"
          >
            <template #prepend>Max</template>
          </el-input>

          <!-- decimal精度 -->
          <div v-else-if="row.type === 'decimal'" class="decimal-config">
            <el-input
              v-model.number="row.precision"
              placeholder="精度"
              type="number"
              size="small"
              style="width: 70px"
            />
            <span>,</span>
            <el-input
              v-model.number="row.scale"
              placeholder="小数位"
              type="number"
              size="small"
              style="width: 70px"
            />
          </div>

          <!-- 数值范围 -->
          <div v-else-if="row.type === 'int'" class="range-config">
            <el-input
              v-model.number="row.minValue"
              placeholder="最小值"
              type="number"
              size="small"
              style="width: 70px"
            />
            <span>-</span>
            <el-input
              v-model.number="row.maxValue"
              placeholder="最大值"
              type="number"
              size="small"
              style="width: 70px"
            />
          </div>

          <span v-else class="no-constraint">—</span>
        </template>
      </el-table-column>

      <el-table-column prop="uiControl" label="UI控件" width="150">
        <template #default="{ row }">
          <el-select v-model="row.uiControl" size="small" filterable>
            <el-option label="输入框" value="input" />
            <el-option label="数字输入" value="number" />
            <el-option label="开关" value="switch" />
            <el-option label="日期选择" value="date-picker" />
            <el-option label="下拉选择" value="select" />
            <el-option label="文本域" value="textarea" />
            <el-option label="富文本" value="editor" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column prop="defaultValue" label="默认值" width="120">
        <template #default="{ row }">
          <el-input v-model="row.defaultValue" placeholder="可选" size="small" />
        </template>
      </el-table-column>

      <el-table-column prop="comment" label="备注" min-width="150">
        <template #default="{ row }">
          <el-input v-model="row.comment" placeholder="字段说明" size="small" />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ $index }">
          <el-button
            type="primary"
            link
            :icon="ArrowUp"
            :disabled="$index === 0"
            @click.stop="moveField($index, 'up')"
          >
            上移
          </el-button>
          <el-button
            type="primary"
            link
            :icon="ArrowDown"
            :disabled="$index === fields.length - 1"
            @click.stop="moveField($index, 'down')"
          >
            下移
          </el-button>
          <el-button
            type="danger"
            link
            :icon="Delete"
            @click.stop="handleDeleteField($index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 字段详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="字段详细配置"
      :size="500"
      @close="handleDrawerClose"
    >
      <el-form
        v-if="currentField"
        :model="currentField"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="字段名称">
          <el-input v-model="currentField.name" placeholder="PascalCase" />
        </el-form-item>

        <el-form-item label="显示名称">
          <el-input v-model="currentField.displayName" placeholder="例如：用户名" />
        </el-form-item>

        <el-form-item label="字段类型">
          <el-select v-model="currentField.type" style="width: 100%" filterable>
            <el-option label="字符串 (string)" value="string" />
            <el-option label="整数 (int)" value="int" />
            <el-option label="小数 (decimal)" value="decimal" />
            <el-option label="布尔 (bool)" value="bool" />
            <el-option label="日期时间 (DateTime)" value="DateTime" />
            <el-option label="枚举 (enum)" value="enum" />
            <el-option label="GUID (Guid)" value="Guid" />
            <el-option label="长文本 (text)" value="text" />
            <el-option label="JSON (json)" value="json" />
            <el-option label="二进制 (byte[])" value="byte[]" />
          </el-select>
        </el-form-item>

        <el-form-item label="必填">
          <el-switch v-model="currentField.isRequired" />
        </el-form-item>

        <el-form-item label="可空">
          <el-switch v-model="currentField.isNullable" />
        </el-form-item>

        <el-form-item v-if="currentField.type === 'string'" label="最大长度">
          <el-input-number v-model="currentField.maxLength" :min="1" :max="10000" />
        </el-form-item>

        <el-form-item v-if="currentField.type === 'decimal'" label="精度">
          <el-input-number v-model="currentField.precision" :min="1" :max="38" />
        </el-form-item>

        <el-form-item v-if="currentField.type === 'decimal'" label="小数位数">
          <el-input-number v-model="currentField.scale" :min="0" :max="38" />
        </el-form-item>

        <el-form-item label="默认值">
          <el-input v-model="currentField.defaultValue" placeholder="可选" />
        </el-form-item>

        <el-form-item label="正则验证">
          <el-input v-model="currentField.pattern" placeholder="例如：^[A-Za-z0-9]+$" />
        </el-form-item>

        <el-form-item label="UI控件">
          <el-select v-model="currentField.uiControl" style="width: 100%" filterable>
            <el-option label="输入框" value="input" />
            <el-option label="数字输入" value="number" />
            <el-option label="开关" value="switch" />
            <el-option label="日期选择器" value="date-picker" />
            <el-option label="下拉选择" value="select" />
            <el-option label="文本域" value="textarea" />
            <el-option label="富文本编辑器" value="editor" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="currentField.comment" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { SimplifiedFieldConfigDto } from '@smartabp/lowcode-shared'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props & Emits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props {
  modelValue: SimplifiedFieldConfigDto[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: SimplifiedFieldConfigDto[]]
}>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fields = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const drawerVisible = ref(false)
const currentField = ref<SimplifiedFieldConfigDto | null>(null)
const currentFieldIndex = ref(-1)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 添加字段
 */
function handleAddField() {
  const newField: SimplifiedFieldConfigDto = {
    name: '',
    displayName: '',
    type: 'string',
    isRequired: false,
    isNullable: true,
    maxLength: 200,
    uiControl: 'input',
    order: fields.value.length,
    comment: ''
  }

  const updatedFields = [...fields.value, newField]
  emit('update:modelValue', updatedFields)

  // 打开抽屉编辑
  currentFieldIndex.value = updatedFields.length - 1
  currentField.value = { ...newField }
  drawerVisible.value = true
}

/**
 * 删除字段
 */
async function handleDeleteField(index: number) {
  try {
    await ElMessageBox.confirm('确定删除这个字段吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    const updatedFields = fields.value.filter((_, i) => i !== index)
    // 重新排序
    updatedFields.forEach((field, i) => {
      field.order = i
    })
    emit('update:modelValue', updatedFields)

    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

/**
 * 移动字段
 */
function moveField(index: number, direction: 'up' | 'down') {
  const updatedFields = [...fields.value]
  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (targetIndex < 0 || targetIndex >= updatedFields.length) {
    return
  }

  // 交换位置
  ;[updatedFields[index], updatedFields[targetIndex]] = [
    updatedFields[targetIndex],
    updatedFields[index]
  ]

  // 更新order
  updatedFields.forEach((field, i) => {
    field.order = i
  })

  emit('update:modelValue', updatedFields)
}

/**
 * 行点击事件
 */
function handleRowClick(row: SimplifiedFieldConfigDto, _column: any, _event: Event) {
  currentFieldIndex.value = fields.value.findIndex((f) => f === row)
  currentField.value = { ...row }
  drawerVisible.value = true
}

/**
 * 抽屉关闭事件
 */
function handleDrawerClose() {
  if (currentField.value && currentFieldIndex.value >= 0) {
    // 保存修改
    const updatedFields = [...fields.value]
    updatedFields[currentFieldIndex.value] = currentField.value
    emit('update:modelValue', updatedFields)
  }

  currentField.value = null
  currentFieldIndex.value = -1
}

/**
 * 字段类型变更处理
 */
function handleTypeChange(field: SimplifiedFieldConfigDto) {
  // 根据类型自动设置默认值
  if (field.type === 'string') {
    if (!field.maxLength) field.maxLength = 200
    field.uiControl = 'input'
  } else if (field.type === 'int') {
    field.uiControl = 'number'
  } else if (field.type === 'decimal') {
    if (!field.precision) field.precision = 18
    if (!field.scale) field.scale = 2
    field.uiControl = 'number'
  } else if (field.type === 'bool') {
    field.uiControl = 'switch'
  } else if (field.type === 'DateTime') {
    field.uiControl = 'date-picker'
  } else if (field.type === 'text') {
    field.uiControl = 'textarea'
  } else if (field.type === 'enum') {
    field.uiControl = 'select'
  }
}

/**
 * 验证字段名称（PascalCase）
 */
function validateFieldName(field: any, index: number) {
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/
  if (!field.name) {
    field._nameError = '字段名称不能为空'
    return
  }

  if (!pascalCaseRegex.test(field.name)) {
    field._nameError = '必须是PascalCase格式（例如：UserName）'
    return
  }

  // 检查重复
  const isDuplicate = fields.value.some((f, i) => i !== index && f.name === field.name)
  if (isDuplicate) {
    field._nameError = '字段名称重复'
    return
  }

  field._nameError = null
}
</script>

<style scoped lang="scss">
.field-config-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .field-count {
      font-size: 14px;
      color: #606266;
    }
  }

  .field-table {
    :deep(.el-input.is-error) {
      border-color: #f56c6c;
    }

    .error-tip {
      display: block;
      font-size: 12px;
      color: #f56c6c;
      margin-top: 4px;
    }

    .decimal-config,
    .range-config {
      display: flex;
      align-items: center;
      gap: 4px;

      span {
        color: #909399;
      }
    }

    .no-constraint {
      color: #c0c4cc;
    }
  }
}
</style>


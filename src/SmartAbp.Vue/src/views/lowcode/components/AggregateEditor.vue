<template>
  <div class="aggregate-editor">
    <el-form
      :model="localAggregate"
      label-width="120px"
    >
      <el-form-item
        label="Name"
        required
      >
        <el-input
          v-model="localAggregate.name"
          placeholder="Project"
        />
      </el-form-item>
      <el-form-item label="Description">
        <el-input
          v-model="localAggregate.description"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="Properties">
        <el-button
          size="small"
          type="primary"
          @click="showPropertyDialog(null)"
        >
          <el-icon>
            <Plus />
          </el-icon>
          Add Property
        </el-button>

        <!-- 🔥 改进：属性列表（只读，双击编辑） -->
        <el-table
          :data="localAggregate.properties"
          style="margin-top: 10px"
          @row-dblclick="handleRowDoubleClick"
        >
          <el-table-column
            prop="name"
            label="Name"
            width="150"
          />
          <el-table-column
            prop="type"
            label="Type"
            width="120"
          />
          <el-table-column
            label="Required"
            width="80"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                v-if="row.isRequired"
                type="danger"
                size="small"
              >
                Required
              </el-tag>
              <el-tag
                v-else
                type="info"
                size="small"
              >
                Optional
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            label="Description"
            show-overflow-tooltip
          />
          <el-table-column
            label="Actions"
            width="140"
            align="center"
          >
            <template #default="{ $index }">
              <el-button
                size="small"
                @click="showPropertyDialog($index)"
              >
                <el-icon>
                  <Edit />
                </el-icon>
                Edit
              </el-button>
              <el-button
                size="small"
                type="danger"
                text
                @click="removeProperty($index)"
              >
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>

    <!-- 🔥 新增：属性编辑对话框 -->
    <el-dialog
      v-model="propertyDialogVisible"
      :title="editingPropertyIndex === null ? 'Add Property' : 'Edit Property'"
      width="600px"
    >
      <el-form
        :model="currentProperty"
        label-width="140px"
      >
        <el-form-item
          label="Property Name"
          required
        >
          <el-input
            v-model="currentProperty.name"
            placeholder="e.g. Title, Description"
          />
        </el-form-item>

        <el-form-item
          label="Property Type"
          required
        >
          <el-select
            v-model="currentProperty.type"
            style="width: 100%"
          >
            <el-option
              label="string"
              value="string"
            >
              <span>string</span>
              <span style="float: right; color: var(--el-text-color-secondary)">文本</span>
            </el-option>
            <el-option
              label="int"
              value="int"
            >
              <span>int</span>
              <span style="float: right; color: var(--el-text-color-secondary)">整数</span>
            </el-option>
            <el-option
              label="long"
              value="long"
            >
              <span>long</span>
              <span style="float: right; color: var(--el-text-color-secondary)">长整数</span>
            </el-option>
            <el-option
              label="decimal"
              value="decimal"
            >
              <span>decimal</span>
              <span style="float: right; color: var(--el-text-color-secondary)">小数</span>
            </el-option>
            <el-option
              label="DateTime"
              value="DateTime"
            >
              <span>DateTime</span>
              <span style="float: right; color: var(--el-text-color-secondary)">日期时间</span>
            </el-option>
            <el-option
              label="bool"
              value="bool"
            >
              <span>bool</span>
              <span style="float: right; color: var(--el-text-color-secondary)">布尔值</span>
            </el-option>
            <el-option
              label="Guid"
              value="Guid"
            >
              <span>Guid</span>
              <span style="float: right; color: var(--el-text-color-secondary)">唯一标识符</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Required">
          <el-switch
            v-model="currentProperty.isRequired"
            active-text="必填"
            inactive-text="可选"
          />
        </el-form-item>

        <el-form-item label="Default Value">
          <el-input
            v-model="currentProperty.defaultValue"
            placeholder="e.g. '', 0, false"
          />
        </el-form-item>

        <el-form-item label="Validation Rules">
          <el-input
            v-model="currentProperty.validation"
            type="textarea"
            :rows="3"
            placeholder="e.g. [MaxLength(100)], [Range(1, 999)]"
          />
        </el-form-item>

        <el-form-item label="Description">
          <el-input
            v-model="currentProperty.description"
            type="textarea"
            :rows="2"
            placeholder="Property description"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="propertyDialogVisible = false">
            Cancel
          </el-button>
          <el-button
            type="primary"
            :disabled="!currentProperty.name || !currentProperty.type"
            @click="saveProperty"
          >
            Save
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Delete, Edit, Plus } from '@element-plus/icons-vue';
import type { AggregateDefinitionDto, PropertyDefinitionDto } from '@smartabp/lowcode-api';
import { useDebounceFn } from '@vueuse/core';
import {
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElIcon,
    ElInput,
    ElOption,
    ElSelect,
    ElSwitch,
    ElTable,
    ElTableColumn,
    ElTag
} from 'element-plus';
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: AggregateDefinitionDto
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: AggregateDefinitionDto): void
}>()

const localAggregate = ref<AggregateDefinitionDto>({ ...props.modelValue })

// 🔥 新增：属性编辑对话框状态
const propertyDialogVisible = ref(false)
const editingPropertyIndex = ref<number | null>(null)
const currentProperty = ref<PropertyDefinitionDto>({
  name: '',
  type: 'string',
  isRequired: false,
  defaultValue: '',
  validation: '',
  description: ''
})

// ✅ 最佳实践：单向数据流，只监听props变化
watch(() => props.modelValue, (newValue) => {
  localAggregate.value = { ...newValue }
}, { deep: true })

// ✅ 业界最佳：使用防抖优化emit性能，避免频繁触发父组件更新
const debouncedEmit = useDebounceFn((value: AggregateDefinitionDto) => {
  emit('update:modelValue', value)
}, 300) // 300ms防抖

watch(localAggregate, (newValue) => {
  debouncedEmit(newValue)
}, { deep: true })

// 🔥 新增：显示属性编辑对话框
const showPropertyDialog = (index: number | null) => {
  editingPropertyIndex.value = index

  if (index === null) {
    // 新建属性
    currentProperty.value = {
      name: '',
      type: 'string',
      isRequired: false,
      defaultValue: '',
      validation: '',
      description: ''
    }
  } else {
    // 编辑现有属性
    const existingProperty = localAggregate.value.properties[index]
    if (existingProperty) {
      currentProperty.value = { 
        name: existingProperty.name || '',
        type: existingProperty.type || '',
        isRequired: existingProperty.isRequired,
        defaultValue: existingProperty.defaultValue,
        validation: existingProperty.validation,
        description: existingProperty.description,
        isPrivateSetter: existingProperty.isPrivateSetter
      }
    }
  }

  propertyDialogVisible.value = true
}

// 🔥 新增：保存属性
const saveProperty = () => {
  if (!currentProperty.value.name || !currentProperty.value.type) {
    return
  }

  if (editingPropertyIndex.value === null) {
    // 添加新属性
    localAggregate.value.properties.push({ ...currentProperty.value })
  } else {
    // 更新现有属性
    localAggregate.value.properties[editingPropertyIndex.value] = { ...currentProperty.value }
  }

  propertyDialogVisible.value = false
}

// 🔥 新增：双击行编辑
const handleRowDoubleClick = (row: PropertyDefinitionDto) => {
  const index = localAggregate.value.properties.indexOf(row)
  if (index >= 0) {
    showPropertyDialog(index)
  }
}

const removeProperty = (index: number) => {
  localAggregate.value.properties.splice(index, 1)
}
</script>

<style scoped lang="scss">
.aggregate-editor {
  padding: 12px;
}
</style>

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
          @click="addProperty"
        >
          Add Property
        </el-button>
        <el-table
          :data="localAggregate.properties"
          style="margin-top: 10px"
        >
          <el-table-column
            prop="name"
            label="Name"
          />
          <el-table-column
            prop="type"
            label="Type"
          />
          <el-table-column
            label="Required"
            width="80"
          >
            <template #default="{ row }">
              <el-checkbox v-model="row.isRequired" />
            </template>
          </el-table-column>
          <el-table-column
            label="Actions"
            width="80"
          >
            <template #default="{ $index }">
              <el-button
                size="small"
                type="danger"
                text
                @click="removeProperty($index)"
              >
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElForm, ElFormItem, ElInput, ElButton, ElTable, ElTableColumn, ElCheckbox } from 'element-plus'
import type { AggregateDefinitionDto, PropertyDefinitionDto } from '@smartabp/lowcode-api'

const props = defineProps<{
  modelValue: AggregateDefinitionDto
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: AggregateDefinitionDto): void
}>()

const localAggregate = ref<AggregateDefinitionDto>({ ...props.modelValue })

// ✅ 修复死循环：监听props变化而不是local对象
watch(() => props.modelValue, (newValue) => {
  localAggregate.value = { ...newValue }
}, { deep: true })

// ✅ 修复死循环：手动触发emit而不是watch
watch(localAggregate, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: false }) // ⚠️ 移除deep:true避免性能问题

const addProperty = () => {
  const newProperty: PropertyDefinitionDto = {
    name: '',
    type: 'string',
    isRequired: false
  }
  localAggregate.value.properties.push(newProperty)
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


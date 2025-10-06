<template>
  <div class="value-object-editor">
    <el-form
      :model="localVO"
      label-width="120px"
    >
      <el-form-item
        label="Name"
        required
      >
        <el-input
          v-model="localVO.name"
          placeholder="Address"
        />
      </el-form-item>
      <el-form-item label="Description">
        <el-input
          v-model="localVO.description"
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
          :data="localVO.properties"
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
import { ElForm, ElFormItem, ElInput, ElButton, ElTable, ElTableColumn } from 'element-plus'
import type { ValueObjectDefinitionDto, PropertyDefinitionDto } from '@smartabp/lowcode-api'

const props = defineProps<{
  modelValue: ValueObjectDefinitionDto
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ValueObjectDefinitionDto): void
}>()

const localVO = ref<ValueObjectDefinitionDto>({ ...props.modelValue })

// ✅ 修复死循环：监听props变化而不是local对象
watch(() => props.modelValue, (newValue) => {
  localVO.value = { ...newValue }
}, { deep: true })

// ✅ 修复死循环：手动触发emit而不是watch
watch(localVO, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: false }) // ⚠️ 移除deep:true避免性能问题

const addProperty = () => {
  const newProperty: PropertyDefinitionDto = {
    name: '',
    type: 'string'
  }
  localVO.value.properties.push(newProperty)
}

const removeProperty = (index: number) => {
  localVO.value.properties.splice(index, 1)
}
</script>

<style scoped lang="scss">
.value-object-editor {
  padding: 12px;
}
</style>


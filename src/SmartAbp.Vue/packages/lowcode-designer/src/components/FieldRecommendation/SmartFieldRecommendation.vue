<!--
  智能字段推荐组件 v2.0
  
  功能特性：
  - 基于实体名称推荐常用字段
  - 基于行业模板推荐
  - 字段类型智能匹配
  - 一键批量添加
  
  @author SmartAbp架构师团队
  @version 2.0.0
  @date 2025-10-16
-->

<template>
  <div class="smart-field-recommendation">
    <div class="recommendation-header">
      <h4>智能字段推荐</h4>
      <el-button size="small" text @click="handleRefresh">
        <el-icon><Refresh /></el-icon> 刷新推荐
      </el-button>
    </div>
    
    <div v-if="recommendations.length === 0" class="empty-state">
      <el-icon><MagicStick /></el-icon>
      <p>暂无推荐字段</p>
    </div>
    
    <div v-else class="recommendations-list">
      <el-checkbox-group v-model="selectedFields">
        <div v-for="field in recommendations" :key="field.name" class="recommendation-item">
          <el-checkbox :value="field.name">
            <div class="field-info">
              <span class="field-name">{{ field.name }}</span>
              <el-tag size="small" :type="getFieldTypeTag(field.type)">
                {{ field.type }}
              </el-tag>
            </div>
            <div v-if="field.description" class="field-description">
              {{ field.description }}
            </div>
          </el-checkbox>
        </div>
      </el-checkbox-group>
    </div>
    
    <div v-if="recommendations.length > 0" class="recommendation-footer">
      <el-button type="primary" :disabled="selectedFields.length === 0" @click="handleAddSelected">
        添加选中字段 ({{ selectedFields.length }})
      </el-button>
      <el-button @click="handleAddAll">
        添加全部
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, MagicStick } from '@element-plus/icons-vue'

interface FieldRecommendation {
  name: string
  type: string
  description?: string
  required?: boolean
}

interface Props {
  entityName?: string
  industryType?: string
}

const props = withDefaults(defineProps<Props>(), {
  entityName: '',
  industryType: 'general'
})

interface Emits {
  (e: 'add-fields', fields: FieldRecommendation[]): void
}

const emit = defineEmits<Emits>()

const selectedFields = ref<string[]>([])

// 推荐字段库
const fieldDatabase: Record<string, FieldRecommendation[]> = {
  user: [
    { name: 'username', type: 'string', description: '用户名', required: true },
    { name: 'email', type: 'string', description: '电子邮箱', required: true },
    { name: 'phoneNumber', type: 'string', description: '手机号码' },
    { name: 'avatar', type: 'string', description: '头像URL' },
    { name: 'gender', type: 'number', description: '性别（0:未知 1:男 2:女）' }
  ],
  product: [
    { name: 'name', type: 'string', description: '产品名称', required: true },
    { name: 'price', type: 'number', description: '价格', required: true },
    { name: 'stock', type: 'number', description: '库存数量' },
    { name: 'categoryId', type: 'string', description: '分类ID' },
    { name: 'description', type: 'string', description: '产品描述' }
  ],
  order: [
    { name: 'orderNumber', type: 'string', description: '订单号', required: true },
    { name: 'totalAmount', type: 'number', description: '总金额', required: true },
    { name: 'status', type: 'number', description: '订单状态' },
    { name: 'userId', type: 'string', description: '用户ID' },
    { name: 'createdAt', type: 'Date', description: '创建时间' }
  ]
}

const recommendations = computed(() => {
  const entityNameLower = props.entityName.toLowerCase()
  
  // 匹配实体名称
  for (const [key, fields] of Object.entries(fieldDatabase)) {
    if (entityNameLower.includes(key)) {
      return fields
    }
  }
  
  // 返回通用字段
  return [
    { name: 'name', type: 'string', description: '名称', required: true },
    { name: 'description', type: 'string', description: '描述' },
    { name: 'isActive', type: 'boolean', description: '是否启用' }
  ]
})

const getFieldTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    string: 'primary',
    number: 'success',
    boolean: 'warning',
    Date: 'info'
  }
  return tagMap[type] || 'info'
}

const handleRefresh = () => {
  selectedFields.value = []
  ElMessage.success('推荐已刷新')
}

const handleAddSelected = () => {
  const fieldsToAdd = recommendations.value.filter(f =>
    selectedFields.value.includes(f.name)
  )
  emit('add-fields', fieldsToAdd)
  selectedFields.value = []
}

const handleAddAll = () => {
  emit('add-fields', recommendations.value)
  selectedFields.value = []
}

watch(() => props.entityName, () => {
  selectedFields.value = []
})
</script>

<style scoped lang="scss">
.smart-field-recommendation {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  
  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  .el-icon {
    font-size: 48px;
    color: var(--el-text-color-placeholder);
  }
  
  p {
    color: var(--el-text-color-secondary);
  }
}

.recommendations-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.recommendation-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  
  &:last-child {
    border-bottom: none;
  }
}

.field-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.field-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 24px;
}

.recommendation-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color);
  display: flex;
  gap: 8px;
}
</style>


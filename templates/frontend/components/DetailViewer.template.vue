<template>
  <!--
    AI_TEMPLATE_INFO: {"version":"1.0","type":"Vue","handler":"Handlebars"}
    TEMPLATE_DESCRIPTION: 通用实体详情展示组件，用于在抽屉或弹窗中显示只读信息。
    USAGE_GUIDE:
    1. 替换 {{componentName}} 为组件名 (如 'UserDetailViewer')。
    2. 替换 {{entityName}} 为实体显示名 (如 '用户')。
    3. 替换 {{entityDtoName}} 为实体DTO的类型名 (如 'UserDto')。
  -->
  <el-drawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="entityName + '详情'" size="50%">
    <div v-if="entityData">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ entityData.id }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ entityData.name }}</el-descriptions-item>
        <el-descriptions-item label="显示名称">{{ entityData.displayName }}</el-descriptions-item>
        <el-descriptions-item label="启用">
          <el-tag :type="entityData.isEnabled ? 'success' : 'info'">{{ entityData.isEnabled ? '是' : '否' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ entityData.creationTime }}</el-descriptions-item>
        <el-descriptions-item label="最后修改时间">{{ entityData.lastModificationTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ entityData.description }}</el-descriptions-item>
        <!-- Add more fields from your DTO as needed -->
      </el-descriptions>
    </div>
    <div v-else>
      <el-empty description="暂无数据" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

// Placeholder for the actual DTO type
// import type { {{entityDtoName}} } from '@/services/dtos/{{entityDtoName}}';
type {{entityDtoName}} = {
  id: string;
  name: string;
  displayName?: string;
  isEnabled: boolean;
  creationTime: string;
  lastModificationTime?: string;
  description?: string;
  [key: string]: any;
};

defineProps({
  modelValue: { type: Boolean, default: false },
  entityData: { type: Object as PropType<{{entityDtoName}} | null>, default: null },
});

defineEmits(['update:modelValue']);
</script>

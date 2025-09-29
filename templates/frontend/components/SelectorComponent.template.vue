<template>
  <!--
    AI_TEMPLATE_INFO: {"version":"1.0","type":"Vue","handler":"Handlebars"}
    TEMPLATE_DESCRIPTION: 通用实体选择器组件，支持搜索、分页和单/多选。
    USAGE_GUIDE:
    1. 替换 {{componentName}} 为组件名 (如 'UserSelector')。
    2. 替换 {{entityName}} 为实体显示名 (如 '用户')。
    3. 替换 {{apiServiceListFunction}} 为获取列表的API函数 (如 'identityService.getUsers')。
  -->
  <el-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="'选择' + entityName" width="800px">
    <div class="selector-content">
      <el-input v-model="filter" :placeholder="'搜索' + entityName" @keyup.enter="fetchData" class="mb-4" clearable />
      <el-table :data="items" v-loading="loading" @selection-change="handleSelectionChange" @row-click="handleRowClick">
        <el-table-column v-if="multiple" type="selection" width="55" />
        <el-table-column prop="name" label="名称" />
        <!-- Add more columns as needed based on your entity DTO -->
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="maxResultCount"
        @current-change="handlePageChange"
        class="mt-4"
      />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="confirmSelection">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// This is a placeholder for the actual API service.
const apiService = {
  getList: (params: any) => Promise.resolve({ items: [], totalCount: 0 })
};
const {{apiServiceListFunction}} = apiService.getList;

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  initialSelection: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue', 'selection-confirmed']);

const items = ref([]);
const total = ref(0);
const loading = ref(false);
const filter = ref('');
const skipCount = ref(0);
const maxResultCount = ref(10);
const selectedItems = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const result = await {{apiServiceListFunction}}({
      filter: filter.value,
      skipCount: skipCount.value,
      maxResultCount: maxResultCount.value,
    });
    items.value = result.items;
    total.value = result.totalCount;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  skipCount.value = (page - 1) * maxResultCount.value;
  fetchData();
};

const handleSelectionChange = (selection: any[]) => {
  if (props.multiple) {
    selectedItems.value = selection;
  }
};

const handleRowClick = (row: any) => {
  if (!props.multiple) {
    selectedItems.value = [row];
    confirmSelection();
  }
};

const confirmSelection = () => {
  emit('selection-confirmed', selectedItems.value);
  emit('update:modelValue', false);
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fetchData();
    selectedItems.value = [...props.initialSelection];
  }
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.mt-4 {
  margin-top: 1rem;
}
.selector-content {
  min-height: 400px;
}
</style>

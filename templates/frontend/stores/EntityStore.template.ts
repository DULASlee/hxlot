/*
 * AI_TEMPLATE_INFO: {"version":"1.1","type":"TypeScript","handler":"Handlebars"}
 * TEMPLATE_DESCRIPTION: 为实体生成一个标准的Pinia store，用于前端状态管理，包含列表、加载状态和CRUD操作。
 * USAGE_GUIDE:
 * 1. 替换 {{entityName}} 为实体名 (如 'Product')。
 * 2. 替换 {{entityStoreName}} 为Pinia store名称 (如 'useProductStore')。
 * 3. 替换 {{storeId}} 为Pinia store ID (如 'product')。
 * 4. 替换 {{apiService}} 为对应的API服务 (如 'productService')。
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

// API service and DTO types will be injected by template engine
// Example: import {{apiService}} from '@/services/{{apiService}}';
// Example: import type { {{entityName}}Dto, Get{{entityName}}ListDto, {{entityName}}CreateDto, {{entityName}}UpdateDto } from '@/services/dtos/{{entityName}}Dto';

export const {{entityStoreName}} = defineStore('{{storeId}}', () => {
  const pagedList = ref({ items: [], total: 0 });
  const loading = ref(false);

  async function fetchList(params: any /* Get{{entityName}}ListDto */) {
    loading.value = true;
    try {
      const response = await {{apiService}}.getList(params);
      pagedList.value = {
        items: response.items,
        total: response.totalCount,
      };
    } finally {
      loading.value = false;
    }
  }

  async function createItem(data: any /* {{entityName}}CreateDto */) {
    await {{apiService}}.create(data);
  }

  async function updateItem(id: string, data: any /* {{entityName}}UpdateDto */) {
    await {{apiService}}.update(id, data);
  }

  async function deleteItem(id: string) {
    await {{apiService}}.delete(id);
  }

  return {
    pagedList,
    loading,
    fetchList,
    createItem,
    updateItem,
    deleteItem,
  };
});

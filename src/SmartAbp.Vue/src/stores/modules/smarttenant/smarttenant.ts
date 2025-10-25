/*
 * AI_TEMPLATE_INFO: {"version":"1.1","type":"TypeScript","handler":"Handlebars"}
 * TEMPLATE_DESCRIPTION: 为实体生成一个标准的Pinia store，用于前端状态管理，包含列表、加载状态和CRUD操作。
 * USAGE_GUIDE:
 * 1. 替换 SmartTenant 为实体名 (如 'Product')。
 * 2. 替换 useSmartTenantStore 为Pinia store名称 (如 'useProductStore')。
 * 3. 替换 smartTenant 为Pinia store ID (如 'product')。
 * 4. 替换 smartTenantService 为对应的API服务 (如 'productService')。
 */
import { smarttenantApi } from '@/api/SmartTenant/smarttenant';
import type { CreateSmartTenantDto, SmartTenantDto, UpdateSmartTenantDto } from '@/types/smarttenant/smarttenant';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSmartTenantStore = defineStore('smartTenant', () => {
  const pagedList = ref<{ items: SmartTenantDto[]; total: number }>({ items: [], total: 0 });
  const loading = ref(false);

  async function fetchList(params: any) {
    loading.value = true;
    try {
      const response = await smarttenantApi.getList(params);
      pagedList.value = {
        items: response.items || [],
        total: response.totalCount || 0,
      };
    } finally {
      loading.value = false;
    }
  }

  async function createItem(data: CreateSmartTenantDto) {
    await smarttenantApi.create(data);
  }

  async function updateItem(id: string, data: UpdateSmartTenantDto) {
    await smarttenantApi.update(id, data);
  }

  async function deleteItem(id: string) {
    await smarttenantApi.delete(id);
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

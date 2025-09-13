<template>
  <div class="user-list" data-block-id="user-list-root">
    <!-- BLOCK:ListRoot id="user-list-root" -->
    <h2>用户管理列表</h2>
    <el-form :inline="true" :model="query" class="query-bar" data-node-id="user-query-bar">
      <el-form-item label="姓名"><el-input v-model="query.name" placeholder="请输入姓名" /></el-form-item>
      <el-form-item label="邮箱"><el-input v-model="query.email" placeholder="请输入邮箱" /></el-form-item>
      <el-form-item label="电话"><el-input v-model="query.phone" placeholder="请输入电话" /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="items" style="width:100%" :loading="loading" data-node-id="user-table">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="isActive" label="状态" />
    </el-table>
    <div style="margin-top:12px; display:flex; justify-content:flex-end;" data-node-id="user-pager">
      <el-pagination
        v-model:current-page="pageIndex"
        v-model:page-size="pageSize"
        :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="onSearch"
        @current-change="onSearch"
      />
    </div>
    <!-- /BLOCK:ListRoot -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useUserStore } from '@/stores/modules/user'
const store = useUserStore()
const items = store.items
const loading = store.loading
const total = store.total
const pageIndex = store.pageIndex as any
const pageSize = store.pageSize as any
const query = reactive<Record<string, any>>({})

const onSearch = () => store.fetchList({ pageIndex: pageIndex.value, pageSize: pageSize.value, query })
const onReset = () => { Object.keys(query).forEach(k => delete (query as any)[k]); pageIndex.value = 1; onSearch() }

onMounted(() => { onSearch() })
</script>

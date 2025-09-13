<template>
  <div class="user-mgmt" data-block-id="user-mgmt-root">
    <!-- BLOCK:FormRoot id="user-mgmt-root" -->
    <h2>用户管理管理</h2>
    <el-form :model="form" label-width="120px" style="max-width:720px" data-node-id="user-form">
      <el-form-item label="姓名"><el-input v-model="form.name" placeholder="请输入姓名" /></el-form-item>
      <el-form-item label="邮箱"><el-input v-model="form.email" placeholder="请输入邮箱" /></el-form-item>
      <el-form-item label="电话"><el-input v-model="form.phone" placeholder="请输入电话" /></el-form-item>
      <el-form-item label="状态"><el-input v-model="form.isActive" placeholder="请输入状态" /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
    <!-- /BLOCK:FormRoot -->
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useUserStore } from '@/stores/modules/user'
const store = useUserStore()
const form = reactive<Record<string, any>>({})
const onSubmit = () => store.createOrUpdate(form)
const onCancel = () => { Object.keys(form).forEach(k => delete (form as any)[k]) }
</script>

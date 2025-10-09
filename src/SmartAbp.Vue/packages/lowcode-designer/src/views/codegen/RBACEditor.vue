<template>
  <div class="rbac-editor">
    <el-alert
      title="RBAC权限配置"
      type="info"
      description="配置Kubernetes Role-Based Access Control规则"
      :closable="false"
      show-icon
      class="mb-4"
    />

    <el-form
      :model="localAuthorization"
      label-width="120px"
    >
      <el-form-item label="授权类型">
        <el-radio-group v-model="localAuthorization.type">
          <el-radio label="RBAC">
            基于角色
          </el-radio>
          <el-radio label="ABAC">
            基于属性
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-divider>角色定义</el-divider>

      <el-button
        :icon="Plus"
        size="small"
        class="mb-2"
        @click="addRole"
      >
        添加角色
      </el-button>

      <el-card
        v-for="(role, index) in localAuthorization.roles"
        :key="`role-${index}`"
        class="role-card mb-2"
      >
        <template #header>
          <div class="card-header">
            <span>角色 {{ index + 1 }}</span>
            <el-button
              :icon="Delete"
              text
              @click="removeRole(index)"
            />
          </div>
        </template>

        <el-form-item label="角色名称">
          <el-input
            v-model="role.name"
            placeholder="例如: reader"
          />
        </el-form-item>

        <el-form-item label="权限列表">
          <el-select
            v-model="role.permissions"
            multiple
            filterable
            allow-create
            placeholder="格式: apiGroup:resource:verb"
            style="width: 100%"
          >
            <el-option
              v-for="perm in role.permissions"
              :key="perm"
              :label="perm"
              :value="perm"
            />
          </el-select>
          <div class="form-tip">
            示例: "":pods:get 或 apps:deployments:list
          </div>
        </el-form-item>
      </el-card>

      <el-divider>角色绑定</el-divider>

      <el-button
        :icon="Plus"
        size="small"
        class="mb-2"
        @click="addRoleBinding"
      >
        添加角色绑定
      </el-button>

      <el-card
        v-for="(binding, index) in localAuthorization.roleBindings"
        :key="`binding-${index}`"
        class="binding-card mb-2"
      >
        <template #header>
          <div class="card-header">
            <span>角色绑定 {{ index + 1 }}</span>
            <el-button
              :icon="Delete"
              text
              @click="removeRoleBinding(index)"
            />
          </div>
        </template>

        <el-form-item label="绑定名称">
          <el-input
            v-model="binding.name"
            placeholder="例如: reader-binding"
          />
        </el-form-item>

        <el-form-item label="绑定角色">
          <el-select
            v-model="binding.roleName"
            placeholder="选择角色"
          >
            <el-option
              v-for="role in localAuthorization.roles"
              :key="role.name"
              :label="role.name"
              :value="role.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="主体类型">
          <el-select v-model="binding.subjectType">
            <el-option
              label="ServiceAccount"
              value="ServiceAccount"
            />
            <el-option
              label="User"
              value="User"
            />
            <el-option
              label="Group"
              value="Group"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="主体列表">
          <el-select
            v-model="binding.subjects"
            multiple
            filterable
            allow-create
            placeholder="输入主体名称"
            style="width: 100%"
          >
            <el-option
              v-for="subject in binding.subjects"
              :key="subject"
              :label="subject"
              :value="subject"
            />
          </el-select>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { Authorization } from '@smartabp/lowcode-api'

interface Props {
  modelValue: Authorization
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: Authorization]
}>()

const localAuthorization = ref<Authorization>(props.modelValue)

watch(
  localAuthorization,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

const addRole = () => {
  localAuthorization.value.roles.push({
    name: '',
    permissions: [],
    labels: {}
  })
}

const removeRole = (index: number) => {
  localAuthorization.value.roles.splice(index, 1)
}

const addRoleBinding = () => {
  localAuthorization.value.roleBindings.push({
    name: '',
    roleName: '',
    subjects: [],
    subjectType: 'ServiceAccount'
  })
}

const removeRoleBinding = (index: number) => {
  localAuthorization.value.roleBindings.splice(index, 1)
}
</script>

<script lang="ts">
import { ref } from 'vue'
</script>

<style scoped lang="scss">
.rbac-editor {
  padding: 20px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.role-card,
.binding-card {
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>


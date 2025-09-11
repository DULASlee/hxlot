<template>
  <div class="module-wizard">
    <div class="wizard-header">
      <h1>🚀 模块生成向导</h1>
      <p>从模板到上线，一步到位</p>
      <el-steps :active="currentStep" align-center>
        <el-step title="选择模板" description="选择模块类型" />
        <el-step title="连接数据" description="配置数据源" />
        <el-step title="设计页面" description="字段与布局" />
        <el-step title="设置权限" description="角色与操作" />
        <el-step title="预览生成" description="确认与生成" />
      </el-steps>
    </div>

    <div class="wizard-body">
      <div v-show="currentStep === 0" class="step-panel">
        <el-card>
          <h3>模板选择</h3>
          <el-radio-group v-model="form.templatePack">
            <el-radio label="crud-basic">CRUD基础模板</el-radio>
          </el-radio-group>
          <el-divider />
          <el-form :model="form" label-width="120px">
            <el-form-item label="模块名称">
              <el-input v-model="form.moduleName" placeholder="如：User" />
            </el-form-item>
            <el-form-item label="显示名称">
              <el-input v-model="form.displayName" placeholder="如：用户管理" />
            </el-form-item>
            <el-form-item label="实体名称">
              <el-input v-model="form.entityName" placeholder="如：User" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div v-show="currentStep === 1" class="step-panel">
        <el-card>
          <h3>数据源配置</h3>
          <el-form :model="form" label-width="120px">
            <el-form-item label="数据源类型">
              <el-select v-model="form.dataSource.type">
                <el-option label="OpenAPI(推荐)" value="openapi" />
                <el-option label="手动定义" value="manual" />
                <el-option label="模拟数据" value="mock" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.dataSource.type==='openapi'" label="Swagger URL">
              <el-input v-model="form.dataSource.config.url" placeholder="如：/swagger/v1/swagger.json" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div v-show="currentStep === 2" class="step-panel">
        <el-card>
          <h3>页面与字段</h3>
          <el-alert type="info" title="此处为P0占位：默认字段已填充，可后续在P1中提供拖拽/实时预览" show-icon />
          <el-table :data="form.fields" size="small" style="width: 100%">
            <el-table-column prop="name" label="字段名" width="180" />
            <el-table-column prop="label" label="显示名" width="180" />
            <el-table-column prop="type" label="类型" width="140" />
            <el-table-column prop="required" label="必填" width="100">
              <template #default="{ row }">
                <el-tag :type="row.required ? 'success' : 'info'">{{ row.required ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <div v-show="currentStep === 3" class="step-panel">
        <el-card>
          <h3>权限配置</h3>
          <el-form :model="form.permissions" label-width="120px">
            <el-form-item label="启用权限">
              <el-switch v-model="form.permissions.enabled" />
            </el-form-item>
            <el-form-item label="权限前缀">
              <el-input v-model="form.permissions.prefix" placeholder="如：User" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div v-show="currentStep === 4" class="step-panel">
        <el-card>
          <h3>预览与生成</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="模板">{{ form.templatePack }}</el-descriptions-item>
            <el-descriptions-item label="模块名">{{ form.moduleName }}</el-descriptions-item>
            <el-descriptions-item label="显示名">{{ form.displayName }}</el-descriptions-item>
            <el-descriptions-item label="实体名">{{ form.entityName }}</el-descriptions-item>
          </el-descriptions>
          <el-divider />
          <el-button type="primary" :loading="generating" @click="generate">
            一键生成
          </el-button>
          <el-button @click="downloadManifest">下载 Manifest</el-button>
        </el-card>
      </div>
    </div>

    <div class="wizard-footer">
      <el-button :disabled="currentStep===0" @click="prev">上一步</el-button>
      <el-button v-if="currentStep<4" type="primary" @click="next">下一步</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const currentStep = ref(0)
const generating = ref(false)

const form = reactive({
  templatePack: 'crud-basic',
  moduleName: 'User',
  displayName: '用户管理',
  entityName: 'User',
  dataSource: {
    type: 'openapi' as 'openapi' | 'manual' | 'mock',
    config: { url: '/swagger/v1/swagger.json', entity: 'User', operations: {} as any }
  },
  fields: [
    { name: 'name', label: '姓名', type: 'string', required: true },
    { name: 'email', label: '邮箱', type: 'string', required: true },
    { name: 'phone', label: '电话', type: 'string', required: false },
    { name: 'isActive', label: '状态', type: 'boolean', required: true }
  ],
  permissions: {
    enabled: true,
    prefix: 'User',
    operations: { create: 'User.Create', read: 'User.Read', update: 'User.Update', delete: 'User.Delete' }
  }
})

const next = () => {
  if (currentStep.value < 4) currentStep.value += 1
}
const prev = () => {
  if (currentStep.value > 0) currentStep.value -= 1
}

const generate = async () => {
  generating.value = true
  try {
    // P0：先以下载Manifest为主，后续联动 codegen
    await downloadManifest()
    ElMessage.success('Manifest 已生成并下载，请运行 npm run codegen 执行聚合。')
  } catch (e) {
    ElMessage.error('生成失败')
  } finally {
    generating.value = false
  }
}

const downloadManifest = async () => {
  const manifest = buildManifest()
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${form.moduleName}.abp.module.json`
  a.click()
  URL.revokeObjectURL(url)
}

const buildManifest = () => {
  const moduleKebab = form.moduleName
  const basePath = `@/views/${moduleKebab.toLowerCase()}`
  return {
    $schema: 'https://smartabp/schema/module',
    name: form.moduleName, // 要求PascalCase，默认已是User
    displayName: form.displayName,
    description: `${form.displayName} 模块（由向导生成）`,
    version: '1.0.0',
    author: 'SmartAbp',
    abpStyle: true,
    order: 100,
    dependsOn: [],
    routes: [
      {
        name: `${form.moduleName}List`,
        path: `/${form.moduleName}`,
        component: `${basePath}/${form.moduleName}ListView.vue`,
        meta: { title: `${form.displayName}列表`, menuKey: `${form.moduleName.toLowerCase()}-list` }
      },
      {
        name: `${form.moduleName}Management`,
        path: `/${form.moduleName}/management`,
        component: `${basePath}/${form.moduleName}Management.vue`,
        meta: { title: `${form.displayName}管理`, menuKey: `${form.moduleName.toLowerCase()}-management` }
      }
    ],
    stores: [
      {
        symbol: `use${form.entityName}Store`,
        id: `${form.moduleName.toLowerCase()}`,
        modulePath: `@/stores/modules/${form.moduleName.toLowerCase()}`
      }
    ],
    policies: Object.values(form.permissions.operations || {}),
    lifecycle: {},
    features: { enableAuth: true, enableCache: true, enableI18n: true }
  }
}
</script>

<style scoped>
.module-wizard { padding: 16px; }
.wizard-header { margin-bottom: 16px; }
.wizard-body { margin-top: 16px; }
.step-panel { margin-bottom: 16px; }
.wizard-footer { display: flex; gap: 8px; justify-content: flex-end; }
</style>

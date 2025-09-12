<template>
  <div class="module-wizard">
    <div class="wizard-header">
      <h1>🚀 模块生成向导</h1>
      <p>从模板到上线，一步到位</p>
      <el-steps :active="currentStep" align-center>
        <el-step title="选择模板" description="选择模块类型" />
        <el-step title="设计页面" description="字段与布局" />
        <el-step title="角色权限" description="角色与权限配置" />
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
          <h3>页面与字段</h3>
          <el-alert type="info" title="字段默认从后端契约自动导入，您可以随时修改" show-icon />
          <div style="margin:8px 0;">
            <el-button @click="importFieldsFromOpenAPI" :loading="importing">从契约重新导入字段</el-button>
          </div>
          <el-table :data="form.fields" size="small" style="width: 100%">
            <el-table-column prop="name" label="字段名" width="180" />
            <el-table-column prop="label" label="显示名" width="180" />
            <el-table-column prop="type" label="类型" width="140" />
            <el-table-column prop="required" label="必填" width="100">
              <template #default="scope">
                <el-tag :type="scope.row?.required ? 'success' : 'info'">{{ scope.row?.required ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <div v-show="currentStep === 2" class="step-panel">
        <el-card>
          <h3>角色权限配置</h3>
          <el-form :model="form.permissions" label-width="120px">
            <el-form-item label="启用权限">
              <el-switch v-model="form.permissions.enabled" />
            </el-form-item>
            <el-form-item label="权限前缀">
              <el-input v-model="form.permissions.prefix" placeholder="如：User" />
            </el-form-item>
            <el-form-item label="角色选择">
              <el-select v-model="form.permissions.roles" multiple style="width:100%">
                <el-option label="admin" value="admin" />
                <el-option label="admin666" value="admin666" />
                <el-option label="manager" value="manager" />
                <el-option label="user" value="user" />
                <el-option label="guest" value="guest" />
              </el-select>
            </el-form-item>
            <el-form-item label="菜单配置">
              <el-checkbox-group v-model="form.menuConfig.features">
                <el-checkbox label="showInMenu">显示在主菜单</el-checkbox>
                <el-checkbox label="showIcon">显示菜单图标</el-checkbox>
                <el-checkbox label="enableBreadcrumb">启用面包屑</el-checkbox>
                <el-checkbox label="enableQuickAccess">启用快速访问</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="菜单图标">
              <el-input v-model="form.menuConfig.icon" placeholder="如：👥" />
            </el-form-item>
            <el-form-item label="菜单排序">
              <el-input-number v-model="form.menuConfig.order" :min="1" :max="999" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div v-show="currentStep === 3" class="step-panel">
        <el-card>
          <h3>预览与生成</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="模板">{{ form.templatePack }}</el-descriptions-item>
            <el-descriptions-item label="模块名">{{ form.moduleName }}</el-descriptions-item>
            <el-descriptions-item label="显示名">{{ form.displayName }}</el-descriptions-item>
            <el-descriptions-item label="实体名">{{ form.entityName }}</el-descriptions-item>
            <el-descriptions-item label="角色权限">{{ form.permissions.roles.join(', ') }}</el-descriptions-item>
            <el-descriptions-item label="菜单配置">{{ form.menuConfig.features.length }}项功能</el-descriptions-item>
          </el-descriptions>
          <el-divider />
          <el-button type="primary" :loading="generating" @click="generate">
            一键生成
          </el-button>
          <el-button @click="downloadManifest">下载 Manifest</el-button>

          <el-divider />
          <el-descriptions v-if="genReceipt" title="生成回执" :column="1" border>
            <el-descriptions-item label="清单路径">{{ genReceipt.manifest }}</el-descriptions-item>
            <el-descriptions-item label="路由">{{ (genReceipt.routes||[]).join(' , ') }}</el-descriptions-item>
            <el-descriptions-item label="菜单键">{{ (genReceipt.menuKeys||[]).join(' , ') }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </div>

    <div class="wizard-footer">
      <el-button :disabled="currentStep===0" @click="prev">上一步</el-button>
      <el-button v-if="currentStep<3" type="primary" @click="next">下一步</el-button>
      <el-button v-else type="success" :loading="generating" @click="generate">生成模块</el-button>
      <el-button v-if="currentStep===3" @click="oneClickExample" :loading="generating">一键示例（User）</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const currentStep = ref(0)
const generating = ref(false)
const importing = ref(false)
const genReceipt = ref<any>(null)

const form = reactive({
  templatePack: 'crud-basic',
  moduleName: 'User',
  displayName: '用户管理',
  entityName: 'User',
  fields: [
    { name: 'name', label: '姓名', type: 'string', required: true },
    { name: 'email', label: '邮箱', type: 'string', required: true },
    { name: 'phone', label: '电话', type: 'string', required: false },
    { name: 'isActive', label: '状态', type: 'boolean', required: true }
  ],
  permissions: {
    enabled: true,
    prefix: 'User',
    roles: ['admin','admin666'],
    operations: { create: 'User.Create', read: 'User.Read', update: 'User.Update', delete: 'User.Delete' }
  },
  menuConfig: {
    features: ['showInMenu', 'showIcon', 'enableBreadcrumb'],
    icon: '👥',
    order: 100,
    parentMenu: 'system'
  }
})

const next = () => {
  if (currentStep.value < 3) currentStep.value += 1
}
const prev = () => {
  if (currentStep.value > 0) currentStep.value -= 1
}

const importFieldsFromOpenAPI = async () => {
  importing.value = true
  try {
    const u = new URL('/__module-wizard/openapi/fields', window.location.origin)
    u.searchParams.set('url', '/swagger/v1/swagger.json')
    u.searchParams.set('entity', form.entityName)
    const res = await fetch(u.toString())
    const json = await res.json()
    if (json.ok && Array.isArray(json.fields)) {
      form.fields = json.fields
      ElMessage.success('已从契约导入字段')
    } else {
      ElMessage.error(json.message || '导入失败')
    }
  } catch {
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}

const generate = async () => {
  generating.value = true
  try {
    const manifest = buildManifest()

    // 🔥 第一步：生成前端代码
    ElMessage.info('🎨 正在生成前端代码...')
    const frontendRes = await fetch('/__module-wizard/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ manifest, fields: form.fields })
    })
    const frontendJson = await frontendRes.json()

    if (!frontendJson.ok) {
      ElMessage.error('前端代码生成失败: ' + (frontendJson.message || '未知错误'))
      return
    }

    // 🚀 第二步：自动生成后端代码
    ElMessage.info('🏗️ 正在生成后端代码...')
    try {
      const backendRes = await fetch('/__module-wizard/backend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          name: form.entityName,
          module: form.moduleName,
          displayName: form.displayName,
          keyType: 'Guid',
          properties: form.fields.map(field => ({
            name: field.name,
            type: mapFieldType(field.type),
            isRequired: field.required,
            displayName: field.label
          })),
          isAggregateRoot: true,
          isMultiTenant: true,
          isSoftDelete: true,
          hasExtraProperties: true
        })
      })

      if (backendRes.ok) {
        const backendJson = await backendRes.json()
        ElMessage.success(`✅ 全栈代码生成完成！
📁 前端: ${frontendJson.routes?.join(', ')}
🏗️ 后端: ${form.entityName}AppService + DTOs + Repository`)

        genReceipt.value = {
          ...frontendJson,
          backend: {
            entityName: backendJson.name,
            generatedFiles: backendJson.metadata?.files || [],
            sessionId: backendJson.sessionId
          }
        }
      } else {
        ElMessage.warning('⚠️ 前端生成成功，后端生成失败，请检查后端服务状态')
        genReceipt.value = frontendJson
      }
    } catch (backendError) {
      ElMessage.warning('⚠️ 前端生成成功，后端API调用失败，请检查网络连接')
      genReceipt.value = frontendJson
    }

  } catch (e: any) {
    ElMessage.error('代码生成失败: ' + (e?.message || '未知错误'))
    console.error('Generation error:', e)
  } finally {
    generating.value = false
  }
}

// 🔧 字段类型映射辅助函数
const mapFieldType = (frontendType: string) => {
  const typeMap: Record<string, string> = {
    'string': 'string',
    'boolean': 'bool',
    'number': 'int',
    'date': 'DateTime'
  }
  return typeMap[frontendType] || 'string'
}

// 🔑 获取认证Token（需要根据实际认证方式实现）
const getToken = () => {
  // 这里需要根据项目的认证方式获取token
  // 例如从localStorage、cookie或store中获取
  return localStorage.getItem('access_token') || ''
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
    name: form.moduleName,
    displayName: form.displayName,
    description: `${form.displayName} 模块（由向导生成）`,
    version: '1.0.0',
    author: 'SmartAbp',
    abpStyle: true,
    order: form.menuConfig.order,
    dependsOn: [],
    routes: [
      {
        name: `${form.moduleName}List`,
        path: `/${form.moduleName}`,
        component: `${basePath}/${form.moduleName}ListView.vue`,
        meta: {
          title: `${form.displayName}列表`,
          menuKey: `${form.moduleName.toLowerCase()}-list`,
          requiredRoles: form.permissions.roles,
          icon: form.menuConfig.icon,
          showInMenu: form.menuConfig.features.includes('showInMenu')
        }
      },
      {
        name: `${form.moduleName}Management`,
        path: `/${form.moduleName}/management`,
        component: `${basePath}/${form.moduleName}Management.vue`,
        meta: {
          title: `${form.displayName}管理`,
          menuKey: `${form.moduleName.toLowerCase()}-management`,
          requiredRoles: form.permissions.roles,
          icon: form.menuConfig.icon,
          showInMenu: form.menuConfig.features.includes('showInMenu')
        }
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
    features: { enableAuth: true, enableCache: true, enableI18n: true },
    menuConfig: {
      icon: form.menuConfig.icon,
      order: form.menuConfig.order,
      features: form.menuConfig.features,
      parentMenu: form.menuConfig.parentMenu
    }
  }
}

const oneClickExample = async () => {
  generating.value = true
  try {
    const userManifest = {
      $schema: 'https://smartabp/schema/module',
      name: 'User',
      displayName: '用户管理',
      description: '用户管理模块（向导一键示例）',
      version: '1.0.0',
      author: 'SmartAbp',
      abpStyle: true,
      order: 100,
      dependsOn: [],
      routes: [
        {
          name: 'UserList',
          path: '/User',
          component: '@/views/user/UserListView.vue',
          meta: {
            title: '用户列表',
            menuKey: 'user-list',
            icon: '👥',
            showInMenu: true
          }
        },
        {
          name: 'UserManagement',
          path: '/User/management',
          component: '@/views/user/UserManagement.vue',
          meta: {
            title: '用户管理',
            menuKey: 'user-management',
            icon: '👥',
            showInMenu: true
          }
        }
      ],
      stores: [
        { symbol: 'useUserStore', id: 'user', modulePath: '@/stores/modules/user' }
      ],
      policies: ['User.Create', 'User.Read', 'User.Update', 'User.Delete'],
      lifecycle: {},
      features: { enableAuth: true, enableCache: true, enableI18n: true },
      menuConfig: {
        icon: '👥',
        order: 100,
        features: ['showInMenu', 'showIcon', 'enableBreadcrumb'],
        parentMenu: 'system'
      }
    }

    const blob = new Blob([JSON.stringify(userManifest, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // 保存到临时文件不可直接实现（浏览器环境），提示命令复制
    ElMessage.success('已生成User示例清单，正在下载...')
    const a = document.createElement('a')
    a.href = url
    a.download = 'User.abp.module.json'
    a.click()
    URL.revokeObjectURL(url)

    // 提示用户一键命令
    ElMessage.success('在前端目录执行：npm run module:add:codegen -- User.abp.module.json')
  } catch (e) {
    ElMessage.error('一键示例失败')
  } finally {
    generating.value = false
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

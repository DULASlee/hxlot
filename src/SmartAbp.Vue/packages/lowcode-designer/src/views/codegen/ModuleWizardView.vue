<template>
  <div class="module-wizard">
    <div class="wizard-header">
      <h1>🚀 {{ t('wizard.title') }}</h1>
      <p>{{ t('wizard.intro') }}</p>
      <div class="inline-steps" role="navigation">
        <template v-for="(label, idx) in displayedSteps" :key="idx">
          <span :class="{ active: currentStep === idx }" @click="currentStep = idx">{{ label }}</span>
          <span class="sep" v-if="idx < displayedSteps.length - 1">·</span>
        </template>
      </div>
    </div>

    <div class="wizard-body">
      <!-- Step 1-3 are the same as before -->
      <div v-show="currentStep === 0" class="step-panel">
        <el-card>
          <h3>{{ t('wizard.step1.title') }}</h3>
          <el-form ref="step0FormRef" :model="form" :rules="step0Rules" label-width="120px" style="max-width: 700px; margin-top: 20px;">
            <el-form-item :label="t('wizard.form.systemName')" prop="systemName">
              <el-input v-model="form.systemName" :placeholder="t('wizard.form.systemNamePh')" />
            </el-form-item>
            <el-form-item :label="t('wizard.form.moduleName')" prop="name">
              <el-input v-model="form.name" :placeholder="t('wizard.form.moduleNamePh')" />
            </el-form-item>
            <el-form-item :label="t('wizard.form.displayName')" prop="displayName">
              <el-input v-model="form.displayName" :placeholder="t('wizard.form.displayNamePh')" />
            </el-form-item>
            <el-form-item :label="t('wizard.form.description')">
              <el-input v-model="form.description" type="textarea" :rows="3" :placeholder="t('wizard.form.descriptionPh')" />
            </el-form-item>
            <el-divider />
            <h4>{{ t('wizard.form.frontendIntegration') }}</h4>
            <el-form-item :label="t('wizard.form.parentMenu')" prop="frontend.parentId">
              <el-tree-select
                v-model="form.frontend.parentId"
                :data="menuTree"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                check-strictly
                :render-after-expand="false"
                :placeholder="t('wizard.form.parentMenuPh')"
                style="width: 100%;"
              />
            </el-form-item>
            <el-divider />
            <h4>{{ t('wizard.form.archPattern') }}</h4>
            <el-form-item :label="t('wizard.form.archPattern')">
              <el-select v-model="form.architecturePattern" :placeholder="t('wizard.form.archPatternPh')" style="width: 100%;">
                <el-option :label="t('wizard.form.archOptions.crud')" value="Crud" />
                <el-option :label="t('wizard.form.archOptions.ddd')" value="DDD" />
                <el-option :label="t('wizard.form.archOptions.cqrs')" value="CQRS" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <div v-show="currentStep === 1" class="step-panel">
        <el-card>
          <h3>{{ t('wizard.step3.title') }}</h3>
          <el-alert :title="t('wizard.step3.alert')" type="warning" :closable="false" show-icon />
          <div style="margin-top: 20px;">
            <EntityDesigner
              :initial-entities="form.entities"
              :schema="form.databaseInfo.schema"
              :module-name="form.name"
              :system-name="form.systemName"
              :architecture="form.architecturePattern"
              :db-provider="form.databaseInfo.provider"
              :db-conn-name="form.databaseInfo.connectionStringName"
              :active="currentStep === 1"
              @update:entities="onEntitiesUpdate"
              @update:db="onDbInfoUpdate"
            />
          </div>
        </el-card>
      </div>

      <div v-show="currentStep === 2" class="step-panel">
        <el-card>
          <h3>{{ t('wizard.step4.title') }}</h3>
          <el-form :model="form" label-width="120px" style="max-width: 600px; margin-top: 20px;">
            <el-form-item :label="t('wizard.feature.version')">
              <el-input v-model="form.version" />
            </el-form-item>
            <el-form-item :label="t('wizard.feature.dependencies')">
              <el-select v-model="form.dependencies" multiple :placeholder="t('wizard.feature.dependenciesPh')" style="width: 100%;" disabled />
            </el-form-item>
            <el-divider />
            <h4>{{ t('wizard.feature.section') }}</h4>
            <el-form-item :label="t('wizard.feature.enable')">
              <el-switch v-model="form.featureManagement.isEnabled" />
            </el-form-item>
            <el-form-item v-if="form.featureManagement.isEnabled" :label="t('wizard.feature.defaultPolicy')">
              <el-input v-model="form.featureManagement.defaultPolicy" :placeholder="t('wizard.feature.defaultPolicyPh')">
                <template #prepend>
                  <el-tooltip :content="t('wizard.feature.defaultPolicyHelp')" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>

            <el-divider />
            <h4>{{ t('wizard.perms.crudSection') }}</h4>
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
              <el-button size="small" @click="toggleAllCrud(true)">{{ t('wizard.perms.selectAll') }}</el-button>
              <el-button size="small" @click="toggleAllCrud(false)">{{ t('wizard.perms.selectNone') }}</el-button>
            </div>
            <el-table :data="form.entities" border size="small" style="margin-bottom:12px;">
              <el-table-column :label="t('wizard.perms.entityCol')" width="220">
                <template #default="scope">{{ scope.row.displayName || scope.row.name }}</template>
              </el-table-column>
              <el-table-column :label="t('wizard.perms.create')" width="120">
                <template #default="scope">
                  <el-checkbox :model-value="hasCrud(scope.row.name, 'Create')" @change="(v:any)=>onToggleCrud(scope.row.name,'Create',!!v)" />
                </template>
              </el-table-column>
              <el-table-column :label="t('wizard.perms.read')" width="120">
                <template #default="scope">
                  <el-checkbox :model-value="hasCrud(scope.row.name, 'Read')" @change="(v:any)=>onToggleCrud(scope.row.name,'Read',!!v)" />
                </template>
              </el-table-column>
              <el-table-column :label="t('wizard.perms.update')" width="120">
                <template #default="scope">
                  <el-checkbox :model-value="hasCrud(scope.row.name, 'Update')" @change="(v:any)=>onToggleCrud(scope.row.name,'Update',!!v)" />
                </template>
              </el-table-column>
              <el-table-column :label="t('wizard.perms.delete')" width="120">
                <template #default="scope">
                  <el-checkbox :model-value="hasCrud(scope.row.name, 'Delete')" @change="(v:any)=>onToggleCrud(scope.row.name,'Delete',!!v)" />
                </template>
              </el-table-column>
            </el-table>

            <h4>{{ t('wizard.perms.section') }}</h4>
            <el-alert type="info" :closable="false" show-icon :title="t('wizard.perms.hint')" />
            <div style="display:flex; gap:12px; margin-top:12px; align-items:center; flex-wrap:wrap;">
              <el-select v-model="perm.entity" :placeholder="t('wizard.perms.selectEntity')" style="width: 200px;" :disabled="(form.entities || []).length === 0">
                <el-option v-for="e in form.entities" :key="e.name" :label="e.displayName || e.name" :value="e.name" />
              </el-select>
              <el-select v-model="perm.action" :placeholder="t('wizard.perms.selectAction')" style="width: 200px;">
                <el-option v-for="opt in actionOptions" :key="opt" :label="t('wizard.perms.actionLabels.' + opt.toLowerCase())" :value="opt" />
              </el-select>
              <el-input v-model="perm.displayName" :placeholder="t('wizard.perms.displayNamePh')" style="width: 240px;" />
              <el-input :model-value="permissionPreview" disabled style="width: 360px;" />
              <el-button type="primary" @click="addCustomPermission" :disabled="!perm.entity || !perm.action || !perm.displayName">{{ t('wizard.perms.add') }}</el-button>
            </div>
            <el-table :data="form.permissionConfig.customActions" border style="margin-top:12px;">
              <el-table-column prop="entityName" :label="t('wizard.perms.entityCol')" width="200" />
              <el-table-column prop="actionKey" :label="t('wizard.perms.actionCol')" width="180" />
              <el-table-column prop="displayName" :label="t('wizard.perms.displayNameCol')" />
              <el-table-column :label="t('wizard.perms.previewCol')" width="360">
                <template #default="scope">{{ `${form.name}.${scope.row.entityName}.${scope.row.actionKey}` }}</template>
              </el-table-column>
              <el-table-column :label="t('wizard.perms.opsCol')" width="100">
                <template #default="scope">
                  <el-button type="danger" link @click="removeCustomPermission(scope.$index)">{{ t('wizard.perms.remove') }}</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </el-card>
      </div>

      <!-- Step 5: Preview & Generate -->
      <div v-show="currentStep === 3" class="step-panel">
        <el-card>
          <h3>{{ t('wizard.step5.title') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="t('wizard.preview.systemName')">{{ form.systemName }}</el-descriptions-item>
            <el-descriptions-item :label="t('wizard.preview.moduleName')">{{ form.name }}</el-descriptions-item>
            <el-descriptions-item :label="t('wizard.preview.arch')">{{ form.architecturePattern }}</el-descriptions-item>
            <el-descriptions-item :label="t('wizard.preview.entityCount')">{{ form.entities.length }}</el-descriptions-item>
          </el-descriptions>
          <el-divider />
          <el-button type="primary" :loading="generating" @click="generate">
            🚀 {{ t('wizard.preview.generateBtn') }}
          </el-button>

          <div v-if="generationResult" style="margin-top: 20px;">
            <el-divider />
            <h4>{{ t('wizard.preview.report') }}</h4>
            <el-alert type="success" :title="generationResult.generationReport" :closable="false" />
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;"><code>{{ generationResult.generatedFiles.join('\n') }}</code></pre>
          </div>
        </el-card>
      </div>
    </div>

    <div class="wizard-footer">
      <el-button :disabled="currentStep === 0" @click="prev">{{ t('wizard.footer.prev') }}</el-button>
      <el-button v-if="currentStep < 3" type="primary" @click="next">{{ t('wizard.footer.next') }}</el-button>
      <el-button v-else type="success" :loading="generating" @click="generate">{{ t('wizard.footer.submit') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted, defineAsyncComponent, computed } from 'vue';
import { ElMessage, ElMessageBox, ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDivider, ElSwitch, ElDescriptions, ElDescriptionsItem, ElButton, ElAlert } from 'element-plus';
import type { ModuleMetadata, EnhancedEntityModel, CustomPermissionAction } from '@smartabp/lowcode-api';
import { codeGeneratorApi, type MenuItemDto } from '@smartabp/lowcode-api';
import { useI18n } from 'vue-i18n'

// Lazy load the EntityDesigner component for better performance
const EntityDesigner = defineAsyncComponent(() => import('../../components/CodeGenerator/EntityDesigner.vue'))


const currentStep = ref(0)
const displayedSteps = computed(() => [t('wizard.steps')[0], t('wizard.steps')[2], t('wizard.steps')[3], t('wizard.steps')[4]])
const generating = ref(false)
const generationResult = ref<any>(null)
const connectionStrings = ref<string[]>([])
const menuTree = ref<MenuItemDto[]>([])
const loadingInit = ref(false)
const actionOptions = ['Approve','Reject','Publish','Assign']
const perm = reactive<{ entity: string; action: string; displayName: string }>({ entity: '', action: '', displayName: '' })
type CrudAction = 'Create'|'Read'|'Update'|'Delete'

const form = reactive<ModuleMetadata>({
  id: '',
  systemName: 'SmartConstruction',
  name: '',
  displayName: '',
  description: '',
  version: '1.0.0',
  architecturePattern: 'Crud',
  databaseInfo: {
    connectionStringName: 'Default',
    schema: '',
    provider: 'SqlServer',
  },
  featureManagement: {
    isEnabled: true,
    defaultPolicy: '',
  },
  frontend: {
    parentId: null,
    routePrefix: '',
  },
  generateMobilePages: false,
  dependencies: [],
  entities: [],
  menuConfig: [],
  permissionConfig: {},
})
const onEntitiesUpdate = (newEntities: any[]) => {
  form.entities = newEntities as unknown as EnhancedEntityModel[]
}

const onDbInfoUpdate = (db: { connectionStringName?: string; provider?: string; schema?: string }) => {
  if (db.connectionStringName) form.databaseInfo.connectionStringName = db.connectionStringName
  if (db.provider) form.databaseInfo.provider = db.provider as any
  if (db.schema) form.databaseInfo.schema = db.schema
}

const { t } = useI18n()

const pascalCase = (v: string) => /^[A-Z][A-Za-z0-9]*$/.test(v)
// schemaPattern not used after moving DB inputs to step 3

const step0FormRef = ref()
const step1FormRef = ref()

const step0Rules = {
  systemName: [
    { required: true, message: t('wizard.rules.systemNameReq'), trigger: 'blur' },
    { validator: (_: any, val: string, cb: any) => cb(pascalCase(val) ? undefined : new Error(t('wizard.rules.mustPascal'))), trigger: 'blur' }
  ],
  name: [
    { required: true, message: t('wizard.rules.moduleNameReq'), trigger: 'blur' },
    { validator: (_: any, val: string, cb: any) => cb(pascalCase(val) ? undefined : new Error(t('wizard.rules.mustPascal'))), trigger: 'blur' }
  ],
  displayName: [{ required: true, message: t('wizard.rules.displayNameReq'), trigger: 'blur' }],
}

// step 2 merged into step 1 — no rules needed

const validateCurrentStep = async (): Promise<boolean> => {
  if (currentStep.value === 0 && step0FormRef.value) {
    return step0FormRef.value.validate().then(() => true).catch(() => false)
  }
  if (currentStep.value === 1 && step1FormRef.value) {
    return step1FormRef.value.validate().then(() => true).catch(() => false)
  }
  return true
}

const next = async () => {
  const ok = await validateCurrentStep()
  if (!ok) {
    ElMessage.warning(t('wizard.msg.formInvalid'))
    return
  }
  if (currentStep.value < 3) currentStep.value += 1
}
const prev = () => {
  if (currentStep.value > 0) currentStep.value -= 1
}

const generate = async () => {
  generating.value = true
  generationResult.value = null

  if (form.featureManagement.isEnabled && !form.featureManagement.defaultPolicy) {
      form.featureManagement.defaultPolicy = `${form.systemName}.${form.name}`
  }

  try {
    await ElMessageBox.confirm(t('wizard.msg.confirmGenerate'), t('wizard.title'), { type: 'warning' })
    const metadata = form
    ElMessage.info(t('wizard.msg.generating'))
    const resultJson = await codeGeneratorApi.generateModule(metadata as any)
    ElMessage.success(t('wizard.msg.generated', { name: resultJson.moduleName }))
        generationResult.value = resultJson

    // Clean draft after successful generation
    try {
      const key = `lowcode:draft:${form.systemName || 'DefaultSystem'}:${form.name || 'DefaultModule'}`
      localStorage.removeItem(key)
    } catch {}

  } catch (e: any) {
    if (e === 'cancel') {
      ElMessage.info(t('wizard.msg.cancelled'))
    } else {
      ElMessage.error(t('wizard.msg.apiFailed') + (e?.message || ''))
    }
    console.error('Generation error:', e)
  } finally {
    generating.value = false
  }
}

onMounted(async () => {
  try {
    loadingInit.value = true
    const [menus, conns] = await Promise.all([
      codeGeneratorApi.getMenuTree(),
      codeGeneratorApi.getConnectionStrings(),
    ])
    // 规范化父级菜单数据结构，确保包含 id/label/children，优先使用中文标题
    const getTitle = (n: any) => n.title ?? n.displayName ?? n?.meta?.title ?? n.label ?? n.name ?? n.key ?? n.id
    const normalize = (nodes: any[]): any[] => (nodes || []).map(n => ({ id: n.id ?? n.key ?? n.value ?? n.label, label: String(getTitle(n)), children: normalize(n.children || []) }))
    menuTree.value = normalize(menus || [])
    connectionStrings.value = (conns && conns.length > 0) ? conns : ['Default']
    if (!form.databaseInfo.connectionStringName) form.databaseInfo.connectionStringName = connectionStrings.value[0]
  } catch (e) {
    // 默认为空树与 Default 连接串
    menuTree.value = []
    if (connectionStrings.value.length === 0) connectionStrings.value = ['Default']
  } finally {
    loadingInit.value = false
  }
})

watch(() => form.name, (nv: string) => {
  if (!nv) return
  const kebab = nv.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  form.frontend.routePrefix = `/${kebab}`
})

const permissionPreview = computed(() => {
  if (!perm.entity || !perm.action) return ''
  return `${form.name}.${perm.entity}.${perm.action}`
})

const addCustomPermission = () => {
  if (!form.permissionConfig) (form as any).permissionConfig = { customActions: [] as CustomPermissionAction[] }
  if (!form.permissionConfig.customActions) (form.permissionConfig as any).customActions = [] as CustomPermissionAction[]
  ;(form.permissionConfig.customActions as CustomPermissionAction[]).push({ entityName: perm.entity, actionKey: perm.action, displayName: perm.displayName })
  perm.entity = ''; perm.action = ''; perm.displayName = ''
}

// ---- CRUD matrix helpers ----
const ensurePermConfig = () => {
  if (!(form.permissionConfig as any)) (form as any).permissionConfig = {}
  if (!(form.permissionConfig as any).customActions) (form.permissionConfig as any).customActions = []
}
const hasCrud = (entityName: string, action: CrudAction): boolean => {
  const list = (form.permissionConfig?.customActions as any[]) || []
  return list.some(x => x.entityName === entityName && x.actionKey === action)
}
const onToggleCrud = (entityName: string, action: CrudAction, checked: boolean) => {
  ensurePermConfig()
  const list = (form.permissionConfig!.customActions as any[])
  const idx = list.findIndex(x => x.entityName === entityName && x.actionKey === action)
  if (checked) {
    if (idx === -1) list.push({ entityName, actionKey: action, displayName: `${action}` })
  } else {
    if (idx !== -1) list.splice(idx, 1)
  }
}
const toggleAllCrud = (checked: boolean) => {
  (form.entities || []).forEach(e => {
    ;(['Create','Read','Update','Delete'] as CrudAction[]).forEach(a => onToggleCrud(e.name, a, checked))
  })
}

const removeCustomPermission = (index: number) => {
  if (!form.permissionConfig?.customActions) return
  form.permissionConfig.customActions.splice(index, 1)
}
</script>

<style scoped>
.module-wizard { padding: 16px; max-width: 900px; margin: auto; }
.wizard-header { margin-bottom: 16px; text-align: center; }
.wizard-header h1 { font-size: 24px; font-weight: bold; }
.wizard-header p { color: #606266; margin-bottom: 12px; }
.inline-steps { display: inline-flex; gap: 8px; align-items: center; justify-content: center; color: #909399; user-select: none; }
.inline-steps .sep { color: #C0C4CC; }
.inline-steps span { cursor: pointer; }
.inline-steps .active { color: #409eff; font-weight: 600; }
.wizard-body { margin-top: 16px; }
.step-panel { margin-bottom: 16px; }
.wizard-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
</style>


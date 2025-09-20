<template>
  <div class="module-wizard">
    <div class="wizard-header">
      <h1>🚀 {{ t('wizard.title') }}</h1>
      <p>{{ t('wizard.intro') }}</p>

      <!-- Secure Step Navigation -->
      <div
        class="step-navigation"
        role="navigation"
      >
        <div
          v-for="(stepMeta, index) in stepMetadata"
          :key="stepMeta.step"
          class="step-item"
          :class="{
            active: wizardState.currentStep === stepMeta.step,
            completed: wizardState.completedSteps.has(stepMeta.step),
            disabled: !canNavigateToStep(stepMeta.step)
          }"
          @click="navigateToStep(stepMeta.step)"
        >
          <div class="step-indicator">
            <el-icon
              v-if="wizardState.completedSteps.has(stepMeta.step)"
              class="step-icon completed"
            >
              <Check />
            </el-icon>
            <span
              v-else
              class="step-number"
            >{{ index + 1 }}</span>
          </div>
          <div class="step-content">
            <div class="step-title">
              {{ stepMeta.title }}
            </div>
            <div class="step-description">
              {{ stepMeta.description }}
            </div>
            <div class="step-time">
              {{ stepMeta.estimatedTime }}
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <el-progress
          :percentage="wizardStateMachine.getStepProgress()"
          :show-text="false"
          :stroke-width="6"
        />
      </div>
    </div>

    <div class="wizard-body">
      <!-- Step 1-3 are the same as before -->
      <div
        v-show="wizardState.currentStep === WizardStep.BASIC_INFO"
        class="step-panel"
      >
        <el-card>
          <h3>{{ t('wizard.step1.title') }}</h3>
          <el-form
            ref="step0FormRef"
            :model="safeCurrentMetadata"
            :rules="step0Rules"
            label-width="120px"
            style="max-width: 700px; margin-top: 20px;"
          >
            <el-form-item
              :label="t('wizard.form.systemName')"
              prop="systemName"
            >
              <el-input
                v-model="safeCurrentMetadata.systemName"
                :placeholder="t('wizard.form.systemNamePh')"
              />
            </el-form-item>
            <el-form-item
              :label="t('wizard.form.moduleName')"
              prop="name"
            >
              <el-input
                v-model="safeCurrentMetadata.name"
                :placeholder="t('wizard.form.moduleNamePh')"
              />
            </el-form-item>
            <el-form-item
              :label="t('wizard.form.displayName')"
              prop="displayName"
            >
              <el-input
                v-model="safeCurrentMetadata.displayName"
                :placeholder="t('wizard.form.displayNamePh')"
              />
            </el-form-item>
            <el-form-item :label="t('wizard.form.description')">
              <el-input
                v-model="safeCurrentMetadata.description"
                type="textarea"
                :rows="3"
                :placeholder="t('wizard.form.descriptionPh')"
              />
            </el-form-item>
            <el-divider />
            <h4>{{ t('wizard.form.frontendIntegration') }}</h4>
            <el-form-item
              :label="t('wizard.form.parentMenu')"
              prop="frontend.parentId"
            >
              <el-tree-select
                v-model="safeCurrentMetadata.frontend.parentId"
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
              <el-select
                v-model="safeCurrentMetadata.architecturePattern"
                :placeholder="t('wizard.form.archPatternPh')"
                style="width: 100%;"
              >
                <el-option
                  :label="t('wizard.form.archOptions.crud')"
                  value="Crud"
                />
                <el-option
                  :label="t('wizard.form.archOptions.ddd')"
                  value="DDD"
                />
                <el-option
                  :label="t('wizard.form.archOptions.cqrs')"
                  value="CQRS"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <div
        v-show="wizardState.currentStep === WizardStep.ENTITY_DESIGN"
        class="step-panel"
      >
        <el-card>
          <h3>{{ t('wizard.step3.title') }}</h3>
          <el-alert
            :title="t('wizard.step3.alert')"
            type="warning"
            :closable="false"
            show-icon
          />
          <div style="margin-top: 20px;">
            <EntityDesigner
              :initial-entities="safeCurrentMetadata.entities"
              :schema="safeCurrentMetadata.databaseInfo.schema"
              :module-name="safeCurrentMetadata.name"
              :system-name="safeCurrentMetadata.systemName"
              :architecture="safeCurrentMetadata.architecturePattern"
              :db-provider="safeCurrentMetadata.databaseInfo.provider"
              :db-conn-name="safeCurrentMetadata.databaseInfo.connectionStringName"
              :active="wizardState.currentStep === WizardStep.ENTITY_DESIGN"
              @update:entities="onEntitiesUpdate"
              @update:db="onDbInfoUpdate"
            />
          </div>
        </el-card>
      </div>

      <div
        v-show="wizardState.currentStep === WizardStep.FEATURE_CONFIG"
        class="step-panel"
      >
        <el-card>
          <h3>{{ t('wizard.step4.title') }}</h3>
          <el-form
            :model="safeCurrentMetadata"
            label-width="120px"
            style="max-width: 600px; margin-top: 20px;"
          >
            <el-form-item :label="t('wizard.feature.version')">
              <el-input v-model="safeCurrentMetadata.version" />
            </el-form-item>
            <el-form-item :label="t('wizard.feature.dependencies')">
              <el-select
                v-model="safeCurrentMetadata.dependencies"
                multiple
                :placeholder="t('wizard.feature.dependenciesPh')"
                style="width: 100%;"
                disabled
              />
            </el-form-item>
            <el-divider />
            <h4>{{ t('wizard.feature.section') }}</h4>
            <el-form-item :label="t('wizard.feature.enable')">
              <el-switch v-model="safeCurrentMetadata.featureManagement.isEnabled" />
            </el-form-item>
            <el-form-item
              v-if="safeCurrentMetadata.featureManagement.isEnabled"
              :label="t('wizard.feature.defaultPolicy')"
            >
              <el-input
                v-model="safeCurrentMetadata.featureManagement.defaultPolicy"
                :placeholder="t('wizard.feature.defaultPolicyPh')"
              >
                <template #prepend>
                  <el-tooltip
                    :content="t('wizard.feature.defaultPolicyHelp')"
                    placement="top"
                  >
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>

            <el-divider />
            <h4>{{ t('wizard.perms.crudSection') }}</h4>
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
              <el-button
                size="small"
                @click="toggleAllCrud(true)"
              >
                {{ t('wizard.perms.selectAll') }}
              </el-button>
              <el-button
                size="small"
                @click="toggleAllCrud(false)"
              >
                {{ t('wizard.perms.selectNone') }}
              </el-button>
            </div>
            <el-table
              :data="entitiesForTable"
              border
              size="small"
              style="margin-bottom:12px;"
            >
              <el-table-column
                :label="t('wizard.perms.entityCol')"
                width="220"
              >
                <template #default="scope">
                  {{ scope.row.displayName || scope.row.name }}
                </template>
              </el-table-column>
              <el-table-column
                :label="t('wizard.perms.create')"
                width="120"
              >
                <template #default="scope">
                  <el-checkbox
                    :model-value="hasCrud(scope.row.name, 'Create')"
                    @change="(v) => onToggleCrud(scope.row.name, 'Create', !!v)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                :label="t('wizard.perms.read')"
                width="120"
              >
                <template #default="scope">
                  <el-checkbox
                    :model-value="hasCrud(scope.row.name, 'Read')"
                    @change="(v) => onToggleCrud(scope.row.name, 'Read', !!v)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                :label="t('wizard.perms.update')"
                width="120"
              >
                <template #default="scope">
                  <el-checkbox
                    :model-value="hasCrud(scope.row.name, 'Update')"
                    @change="(v) => onToggleCrud(scope.row.name, 'Update', !!v)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                :label="t('wizard.perms.delete')"
                width="120"
              >
                <template #default="scope">
                  <el-checkbox
                    :model-value="hasCrud(scope.row.name, 'Delete')"
                    @change="(v) => onToggleCrud(scope.row.name, 'Delete', !!v)"
                  />
                </template>
              </el-table-column>
            </el-table>

            <h4>{{ t('wizard.perms.section') }}</h4>
            <el-alert
              type="info"
              :closable="false"
              show-icon
              :title="t('wizard.perms.hint')"
            />
            <div style="display:flex; gap:12px; margin-top:12px; align-items:center; flex-wrap:wrap;">
              <el-select
                v-model="perm.entity"
                :placeholder="t('wizard.perms.selectEntity')"
                style="width: 200px;"
                :disabled="safeCurrentMetadata.entities.length === 0"
              >
                <el-option
                  v-for="e in safeCurrentMetadata.entities"
                  :key="e.name"
                  :label="e.displayName || e.name"
                  :value="e.name"
                />
              </el-select>
              <el-select
                v-model="perm.action"
                :placeholder="t('wizard.perms.selectAction')"
                style="width: 200px;"
              >
                <el-option
                  v-for="opt in actionOptions"
                  :key="opt"
                  :label="t('wizard.perms.actionLabels.' + opt.toLowerCase())"
                  :value="opt"
                />
              </el-select>
              <el-input
                v-model="perm.displayName"
                :placeholder="t('wizard.perms.displayNamePh')"
                style="width: 240px;"
              />
              <el-input
                :model-value="permissionPreview"
                disabled
                style="width: 360px;"
              />
              <el-button
                type="primary"
                :disabled="!perm.entity || !perm.action || !perm.displayName"
                @click="addCustomPermission"
              >
                {{ t('wizard.perms.add') }}
              </el-button>
            </div>
            <el-table
              :data="permissionsForTable"
              border
              style="margin-top:12px;"
            >
              <el-table-column
                prop="entityName"
                :label="t('wizard.perms.entityCol')"
                width="200"
              />
              <el-table-column
                prop="actionKey"
                :label="t('wizard.perms.actionCol')"
                width="180"
              />
              <el-table-column
                prop="displayName"
                :label="t('wizard.perms.displayNameCol')"
              />
              <el-table-column
                :label="t('wizard.perms.previewCol')"
                width="360"
              >
                <template #default="scope">
                  {{ `${safeCurrentMetadata.name}.${scope.row.entityName}.${scope.row.actionKey}` }}
                </template>
              </el-table-column>
              <el-table-column
                :label="t('wizard.perms.opsCol')"
                width="100"
              >
                <template #default="scope">
                  <el-button
                    type="danger"
                    link
                    @click="removeCustomPermission(scope.$index)"
                  >
                    {{ t('wizard.perms.remove') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </el-card>
      </div>

      <!-- Step 5: Preview & Generate -->
      <div
        v-show="wizardState.currentStep === WizardStep.PREVIEW"
        class="step-panel"
      >
        <el-card>
          <h3>{{ t('wizard.step5.title') }}</h3>
          <el-descriptions
            :column="2"
            border
          >
            <el-descriptions-item :label="t('wizard.preview.systemName')">
              {{ safeCurrentMetadata.systemName }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('wizard.preview.moduleName')">
              {{ safeCurrentMetadata.name }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('wizard.preview.arch')">
              {{ safeCurrentMetadata.architecturePattern }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('wizard.preview.entityCount')">
              {{ safeCurrentMetadata.entities.length }}
            </el-descriptions-item>
          </el-descriptions>
          <el-divider />
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <el-button
              :loading="isPreviewLoading"
              @click="runValidate"
            >
              {{ t('wizard.preview.validate') }}
            </el-button>
            <el-button
              type="primary"
              :loading="isPreviewLoading"
              @click="runDryRun"
            >
              {{ t('wizard.preview.dryRun') }}
            </el-button>
            <el-button
              type="primary"
              :loading="isGenerating"
              @click="generate"
            >
              🚀 {{ t('wizard.preview.generateBtn') }}
            </el-button>
          </div>

          <div
            v-if="validationReport"
            style="margin-top: 16px;"
          >
            <h4>{{ t('wizard.preview.validationReport') }}</h4>
            <el-alert
              v-if="!validationReport.isValid"
              type="error"
              :title="t('wizard.preview.validationErrors')"
              :closable="false"
            />
            <el-alert
              v-else
              type="success"
              :title="t('wizard.preview.validationPassed')"
              :closable="false"
            />
            <el-table
              :data="validationReport.issues"
              border
              size="small"
              style="margin-top:8px;"
            >
              <el-table-column
                prop="severity"
                :label="t('wizard.preview.col.severity')"
                width="120"
              />
              <el-table-column
                prop="message"
                :label="t('wizard.preview.col.message')"
              />
              <el-table-column
                prop="path"
                :label="t('wizard.preview.col.path')"
                width="280"
              />
            </el-table>
          </div>

          <div
            v-if="generationResult"
            style="margin-top: 20px;"
          >
            <el-divider />
            <h4>{{ t('wizard.preview.report') }}</h4>
            <el-alert
              type="success"
              :title="generationResult.generationReport"
              :closable="false"
            />
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;"><code>{{ generationResult.generatedFiles.join('\n') }}</code></pre>
          </div>

          <div
            v-if="dryRunResult"
            style="margin-top: 20px;"
          >
            <el-divider />
            <h4>{{ t('wizard.preview.dryRunReport') }}</h4>
            <el-descriptions
              :column="3"
              border
            >
              <el-descriptions-item :label="t('wizard.preview.col.module')">
                {{ dryRunResult.moduleName }}
              </el-descriptions-item>
              <el-descriptions-item :label="t('wizard.preview.col.totalFiles')">
                {{ dryRunResult.totalFiles }}
              </el-descriptions-item>
              <el-descriptions-item :label="t('wizard.preview.col.totalLines')">
                {{ dryRunResult.totalLines }}
              </el-descriptions-item>
            </el-descriptions>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;"><code>{{ dryRunResult.files.join('\n') }}</code></pre>
          </div>
        </el-card>
      </div>
    </div>

    <div class="wizard-footer">
      <el-button
        :disabled="!canGoBack"
        @click="previous"
      >
        {{ t('wizard.footer.prev') }}
      </el-button>
      <el-button
        v-if="wizardState.currentStep !== WizardStep.PREVIEW"
        type="primary"
        :disabled="!canProceed"
        @click="next"
      >
        {{ t('wizard.footer.next') }}
      </el-button>
      <el-button
        v-else
        type="success"
        :loading="isGenerating"
        @click="generate"
      >
        {{ t('wizard.footer.submit') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  ElMessage, ElMessageBox, ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption,
  ElDivider, ElSwitch, ElDescriptions, ElDescriptionsItem, ElButton, ElAlert,
  ElProgress, ElIcon
} from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

// Import our new strict typing and management systems
import {
  StrictModuleMetadata,
  WizardStep,
  ArchitecturePattern,
  DatabaseProvider,
  ValidatedEntityName,
  NonEmptyString,
  EntityId,
  StrictPermissionAction,
  DEFAULT_MODULE_METADATA
} from '../../types/strict-types'
import { WizardStateMachine, STEP_METADATA, type StepValidationResult } from '../../core/wizard-state-machine'
import { TransactionalStateManager } from '../../core/transactional-state'
import { ValidationCoordinator } from '../../core/validation-system'
import { codeGeneratorApi, type MenuItemDto } from '../../api/code-generator'

// Properly import EntityDesigner outside of reactive context
import EntityDesigner from '../../components/CodeGenerator/EntityDesigner.vue'


// ============= Error Handling Utilities =============
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

const isErrorWithMessage = (error: unknown): error is { message: string } => {
  return typeof error === 'object' && error !== null && 'message' in error
}

// ============= Type-Safe Computed Properties =============
const safeCurrentMetadata = computed(() => {
  const state = stateManager.getCurrentState()
  return state || {
    id: '',
    systemName: '',
    name: '',
    displayName: '',
    description: '',
    version: '1.0.0',
    architecturePattern: 'Crud' as ArchitecturePattern,
    entities: [],
    permissionConfig: { customActions: [] },
    featureManagement: { isEnabled: false, defaultPolicy: '' },
    databaseInfo: { provider: 'SqlServer' as DatabaseProvider, connectionStringName: '', schema: '' },
    frontend: { parentId: '', routePrefix: '', menuTitle: '' },
    dependencies: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
})

// Computed properties for table data to handle readonly arrays
const entitiesForTable = computed(() => safeCurrentMetadata.value.entities as any[])
const permissionsForTable = computed(() => safeCurrentMetadata.value.permissionConfig.customActions as any[])

// ============= Core State Management =============
const { t } = useI18n()
const wizardStateMachine = new WizardStateMachine()
const stateManager = new TransactionalStateManager()
const validator = new ValidationCoordinator()

// ============= Reactive State =============
const wizardState = ref(wizardStateMachine.getState())
// const currentValidationResult = ref<ValidationResult | null>(null)
const isGenerating = ref(false)
const generationResult = ref<any>(null)
const isPreviewLoading = ref(false)
const validationReport = ref<{ isValid: boolean; issues: Array<{ severity: string; message: string; path?: string }> } | null>(null)
const dryRunResult = ref<{ success: boolean; files: string[]; totalFiles: number; totalLines: number; moduleName: string } | null>(null)
const connectionStrings = ref<string[]>([])
const menuTree = ref<MenuItemDto[]>([])
const isLoading = ref(false)
const hasUnsavedChanges = ref(false)

// ============= Step Metadata =============
const stepMetadata = Object.values(STEP_METADATA)

// ============= Form Refs =============
// const basicInfoFormRef = ref()
// const entityDesignerRef = ref()
// const featureConfigFormRef = ref()

// ============= Computed Properties =============
// const currentMetadata = computed(() => stateManager.getCurrentState())
const canProceed = computed(() => wizardState.value.canProceed)
const canGoBack = computed(() => wizardState.value.canGoBack)
// const currentStepMetadata = computed(() => getStepMetadata(wizardState.value.currentStep))

// ============= Step Navigation Logic =============
const canNavigateToStep = (step: WizardStep): boolean => {
  const allowedSteps = wizardStateMachine.getAllowedTransitions()
  return allowedSteps.includes(step) || wizardState.value.completedSteps.has(step)
}

const navigateToStep = async (step: WizardStep): Promise<void> => {
  if (!canNavigateToStep(step)) {
    ElMessage.warning(t('wizard.navigation.invalidTransition'))
    return
  }

  try {
    await wizardStateMachine.transitionTo(step)
    wizardState.value = wizardStateMachine.getState()
    await validateCurrentStep()
  } catch (error) {
    ElMessage.error(t('wizard.navigation.transitionFailed', { error: getErrorMessage(error) }))
  }
}
// ============= Entity Management =============
const onEntitiesUpdate = async (newEntities: any[]): Promise<void> => {
  try {
    stateManager.beginTransaction('Update entities')

    // Update entities in transactional state
    const currentState = stateManager.getCurrentState()
    if (currentState) {
      stateManager.updateModuleMetadata({
        entities: newEntities.map(entity => ({
          ...entity,
          updatedAt: Date.now()
        }))
      })
    }

    await stateManager.commitTransaction()
    hasUnsavedChanges.value = true

  } catch (error) {
    ElMessage.error(t('wizard.errors.entityUpdateFailed', { error: getErrorMessage(error) }))
  }
}

const onDbInfoUpdate = async (db: { connectionStringName?: string; provider?: string; schema?: string }): Promise<void> => {
  try {
    stateManager.beginTransaction('Update database info')

    const currentState = stateManager.getCurrentState()
    if (currentState) {
      stateManager.updateModuleMetadata({
        databaseInfo: {
          connectionStringName: db.connectionStringName || currentState.databaseInfo.connectionStringName,
          provider: (db.provider as DatabaseProvider) || currentState.databaseInfo.provider,
          schema: db.schema || currentState.databaseInfo.schema
        }
      })
    }

    await stateManager.commitTransaction()
    hasUnsavedChanges.value = true

  } catch (error) {
    ElMessage.error(t('wizard.errors.dbUpdateFailed', { error: getErrorMessage(error) }))
  }
}

// ============= Validation System =============
const validateCurrentStep = async (): Promise<boolean> => {
  try {
    const result = await wizardStateMachine.validateCurrentStep()

    if (!result.isValid) {
      const errorMessages = result.errors.join(', ')
      ElMessage.error(t('wizard.validation.failed', { errors: errorMessages }))

      if (result.warnings.length > 0) {
        const warningMessages = result.warnings.join(', ')
        ElMessage.warning(t('wizard.validation.warnings', { warnings: warningMessages }))
      }
    }

    return result.isValid
  } catch (error) {
    ElMessage.error(t('wizard.validation.error', { error: getErrorMessage(error) }))
    return false
  }
}

// Register step validators
const setupValidators = (): void => {
  // Basic Info Step Validator
  wizardStateMachine.registerValidator(WizardStep.BASIC_INFO, async (): Promise<StepValidationResult> => {
    const currentState = stateManager.getCurrentState()
    if (!currentState) {
      return {
        isValid: false,
        errors: ['No module data available'],
        warnings: []
      }
    }

    // Validate basic info
    const errors: string[] = []
    const warnings: string[] = []

    if (!currentState.systemName) {
      errors.push('System name is required')
    }

    if (!currentState.name) {
      errors.push('Module name is required')
    }

    if (!currentState.displayName) {
      errors.push('Display name is required')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  })

  // Entity Design Step Validator
  wizardStateMachine.registerValidator(WizardStep.ENTITY_DESIGN, async (): Promise<StepValidationResult> => {
    const currentState = stateManager.getCurrentState()
    if (!currentState || currentState.entities.length === 0) {
      return {
        isValid: false,
        errors: ['At least one entity is required'],
        warnings: []
      }
    }

    // Validate entities
    const errors: string[] = []
    const warnings: string[] = []

    for (const entity of currentState.entities) {
      if (!entity.name) {
        errors.push(`Entity missing name`)
      }

      if (entity.properties.length === 0) {
        warnings.push(`Entity '${entity.name}' has no properties`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  })

  // Feature Config Step Validator
  wizardStateMachine.registerValidator(WizardStep.FEATURE_CONFIG, async (): Promise<StepValidationResult> => {
    const currentState = stateManager.getCurrentState()
    if (!currentState) {
      return {
        isValid: false,
        errors: ['No module data available'],
        warnings: []
      }
    }

    // Validate permission configuration
    const errors: string[] = []
    const warnings: string[] = []

    if (currentState.permissionConfig.customActions.length === 0) {
      warnings.push('No permissions configured')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  })
}

// ============= Form Validation Rules =============
const step0Rules = {
  systemName: [
    { required: true, message: t('wizard.validation.systemNameRequired'), trigger: 'blur' },
    { validator: (_: any, val: string, cb: any) => {
      if (!val) return cb()
      // PascalCase validation with security checks
      const pascalPattern = /^[A-Z][a-zA-Z0-9]*$/
      const maxLength = 50
      const dangerousPatterns = [/script/i, /eval/i, /function/i, /<|>|&|'|"|;/]

      if (val.length > maxLength) {
        return cb(new Error(t('wizard.validation.systemNameTooLong', { max: maxLength })))
      }

      if (dangerousPatterns.some(pattern => pattern.test(val))) {
        return cb(new Error(t('wizard.validation.systemNameInvalidChars')))
      }

      if (!pascalPattern.test(val)) {
        return cb(new Error(t('wizard.validation.systemNamePascalCase')))
      }

      cb()
    }, trigger: 'blur' }
  ],
  name: [
    { required: true, message: t('wizard.validation.moduleNameRequired'), trigger: 'blur' },
    { validator: (_: any, val: string, cb: any) => {
      if (!val) return cb()
      const pascalPattern = /^[A-Z][a-zA-Z0-9]*$/
      const maxLength = 50
      const dangerousPatterns = [/script/i, /eval/i, /function/i, /<|>|&|'|"|;/]

      if (val.length > maxLength) {
        return cb(new Error(t('wizard.validation.moduleNameTooLong', { max: maxLength })))
      }

      if (dangerousPatterns.some(pattern => pattern.test(val))) {
        return cb(new Error(t('wizard.validation.moduleNameInvalidChars')))
      }

      if (!pascalPattern.test(val)) {
        return cb(new Error(t('wizard.validation.moduleNamePascalCase')))
      }

      cb()
    }, trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: t('wizard.validation.displayNameRequired'), trigger: 'blur' }
  ]
}

// ============= Lifecycle Management =============
const initializeWizard = async (): Promise<void> => {
  try {
    isLoading.value = true

    // Initialize wizard state machine
    setupValidators()

    // Load menu tree and connection strings in parallel
    const [menus, conns] = await Promise.all([
      codeGeneratorApi.getMenuTree().catch(() => []),
      codeGeneratorApi.getConnectionStrings().catch(() => [])
    ])

    menuTree.value = menus
    connectionStrings.value = conns

    // Preflight schema version
    try {
      const pf = await (codeGeneratorApi as any).preflightSchemaVersion(DEFAULT_MODULE_METADATA)
      if (!pf.ok && pf.level === 'block') {
        ElMessage.error(pf.message || 'Schema version not supported')
        return
      }
      if (pf.level === 'warn' && pf.message) {
        ElMessage.warning(pf.message)
      }
    } catch {}

    // Initialize with default module metadata
    const initialMetadata = {
      id: `module-${Date.now()}` as EntityId,
      systemName: 'MySystem',
      name: 'MyModule',
      displayName: 'My Module' as NonEmptyString,
      ...DEFAULT_MODULE_METADATA
    } as unknown as StrictModuleMetadata

    stateManager.setState(initialMetadata)

    // Set initial wizard state
    wizardState.value = wizardStateMachine.getState()

  } catch (error) {
    ElMessage.error(t('wizard.initialization.failed', { error: getErrorMessage(error) }))
    console.error('Wizard initialization error:', error)
  } finally {
    isLoading.value = false
  }
}

// ============= Auto-save and Change Detection =============
const autoSaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
let idleHandle: number | null = null

const scheduleAutoSave = (): void => {
  if (autoSaveTimer.value) clearTimeout(autoSaveTimer.value)
  autoSaveTimer.value = setTimeout(() => {
    const run = async () => { if (hasUnsavedChanges.value) await saveDraft() }
    const w = window as any
    if (typeof w.requestIdleCallback === 'function') {
      idleHandle = w.requestIdleCallback(run, { timeout: 3000 })
    } else {
      void run()
    }
  }, 5000) // 5s 防抖
}

// Watch for changes and schedule auto-save
watch(
  () => stateManager.getCurrentState(),
  (newState: StrictModuleMetadata | null) => {
    if (newState) {
      hasUnsavedChanges.value = true
      scheduleAutoSave()
    }
  },
  { deep: true }
)

// ============= Before Leave Guard =============
const handleBeforeUnload = (event: BeforeUnloadEvent): string | void => {
  if (hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = t('wizard.navigation.unsavedChanges')
    return event.returnValue
  }
}

onMounted(async () => {
  await initializeWizard()

  // Add before unload listener
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  // Clean up auto-save timer
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  if (idleHandle && typeof (window as any).cancelIdleCallback === 'function') {
    ;(window as any).cancelIdleCallback(idleHandle)
  }

  // Remove before unload listener
  window.removeEventListener('beforeunload', handleBeforeUnload)

  // Clean up state manager listeners
  stateManager.unsubscribe('wizard-view')
})

// ============= Navigation Actions =============
const next = async (): Promise<void> => {
  try {
    isLoading.value = true

    // Validate current step
    const isValid = await validateCurrentStep()
    if (!isValid) {
      return
    }

    // Get next step
    const allSteps = Object.values(WizardStep)
    const currentIndex = allSteps.indexOf(wizardState.value.currentStep)
    const nextStep = allSteps[currentIndex + 1]

    if (nextStep) {
      await navigateToStep(nextStep)
    }

  } catch (error) {
    ElMessage.error(t('wizard.navigation.nextFailed', { error: getErrorMessage(error) }))
  } finally {
    isLoading.value = false
  }
}

const previous = async (): Promise<void> => {
  try {
    const allSteps = Object.values(WizardStep)
    const currentIndex = allSteps.indexOf(wizardState.value.currentStep)
    const prevStep = allSteps[currentIndex - 1]

    if (prevStep) {
      await navigateToStep(prevStep)
    }

  } catch (error) {
    ElMessage.error(t('wizard.navigation.previousFailed', { error: getErrorMessage(error) }))
  }
}

// ============= Code Generation =============
type UnifiedApi = {
  validateModuleUnified: (m: StrictModuleMetadata) => Promise<{ isValid: boolean; issues: Array<{ severity: string; message: string; path?: string }> }>
  dryRunGenerateUnified: (m: StrictModuleMetadata) => Promise<{ success: boolean; files: string[]; totalFiles: number; totalLines: number; moduleName: string }>
  generateModuleUnified: (m: StrictModuleMetadata) => Promise<any>
}

const generate = async (): Promise<void> => {
    try {
      isGenerating.value = true
      generationResult.value = null

      // Get current state
      const currentState = stateManager.getCurrentState()
      if (!currentState) {
        throw new Error('No module data available for generation')
      }

      // Version preflight
      {
        const pf = await (codeGeneratorApi as any).preflightSchemaVersion(currentState as any)
        if (!pf.ok && pf.level === 'block') {
          throw new Error(pf.message || 'Schema version not supported')
        }
        if (pf.level === 'warn' && pf.message) {
          ElMessage.warning(pf.message)
        }
      }

      // Final validation
      const validationResult = await validator.validateComplete(currentState)
      if (!validationResult.isValid) {
        const errors = validationResult.issues
          .filter(issue => issue.severity === 'error')
          .map(issue => issue.message)
        throw new Error(`Validation failed: ${errors.join(', ')}`)
      }

      // Confirm generation
      await ElMessageBox.confirm(
        t('wizard.generation.confirmMessage'),
        t('wizard.generation.confirmTitle'),
        { type: 'warning' }
      )

      ElMessage.info(t('wizard.generation.starting'))

      // Start generation transaction
      stateManager.beginTransaction('Code generation')

      try {
        // Call the unified schema API with validated data
        const unifiedApi = codeGeneratorApi as unknown as UnifiedApi
        const result = await unifiedApi.generateModuleUnified(currentState as any)

        // Commit transaction
        await stateManager.commitTransaction()

        generationResult.value = result
        hasUnsavedChanges.value = false

        ElMessage.success(t('wizard.generation.success', { name: result.moduleName }))

        // Clear any draft data
        clearDraftData()

      } catch (apiError) {
        await stateManager.rollbackTransaction()
        throw new Error(`Generation failed: ${getErrorMessage(apiError)}`)
      }

    } catch (error) {
      if (isErrorWithMessage(error) && error.message === 'cancel') {
        ElMessage.info(t('wizard.generation.cancelled'))
      } else {
        ElMessage.error(t('wizard.generation.failed', { error: getErrorMessage(error) }))
        console.error('Code generation error:', error)
      }
    } finally {
      isGenerating.value = false
    }
}

// ============= Preview (Validate & Dry Run) =============
const runValidate = async (): Promise<void> => {
  try {
    isPreviewLoading.value = true
    validationReport.value = null
    const currentState = stateManager.getCurrentState()
    if (!currentState) throw new Error('No module data available')
    const pf = await (codeGeneratorApi as any).preflightSchemaVersion(currentState as any)
    if (!pf.ok && pf.level === 'block') {
      throw new Error(pf.message || 'Schema version not supported')
    }
    if (pf.level === 'warn' && pf.message) {
      ElMessage.warning(pf.message)
    }
  const previewApi = codeGeneratorApi as unknown as UnifiedApi
  const result = await previewApi.validateModuleUnified(currentState as any)
    validationReport.value = result
    if (!result.isValid) {
      ElMessage.error(t('wizard.preview.validationHasErrors'))
    } else {
      ElMessage.success(t('wizard.preview.validationOk'))
    }
  } catch (err) {
    ElMessage.error(t('wizard.preview.validationFailed', { error: getErrorMessage(err) }))
  } finally {
    isPreviewLoading.value = false
  }
}

const runDryRun = async (): Promise<void> => {
  try {
    isPreviewLoading.value = true
    dryRunResult.value = null
    const currentState = stateManager.getCurrentState()
    if (!currentState) throw new Error('No module data available')
    const pf = await (codeGeneratorApi as any).preflightSchemaVersion(currentState as any)
    if (!pf.ok && pf.level === 'block') {
      throw new Error(pf.message || 'Schema version not supported')
    }
    if (pf.level === 'warn' && pf.message) {
      ElMessage.warning(pf.message)
    }
  const previewApi = codeGeneratorApi as unknown as UnifiedApi
  const result = await previewApi.dryRunGenerateUnified(currentState as any)
    dryRunResult.value = result
    ElMessage.success(t('wizard.preview.dryRunOk'))
  } catch (err) {
    ElMessage.error(t('wizard.preview.dryRunFailed', { error: getErrorMessage(err) }))
  } finally {
    isPreviewLoading.value = false
  }
}

// ============= Draft Management =============
const saveDraft = async (): Promise<void> => {
  const currentState = stateManager.getCurrentState()
  if (!currentState) {
    ElMessage.warning(t('wizard.draft.noDataToSave'))
    return
  }

  try {
    const draftKey = `lowcode:draft:${currentState.systemName}:${currentState.name}`
    const draftData = {
      metadata: currentState,
      timestamp: Date.now(),
      version: '1.0.0'
    }

    localStorage.setItem(draftKey, JSON.stringify(draftData))
    hasUnsavedChanges.value = false
    ElMessage.success(t('wizard.draft.saved'))

  } catch (error) {
    ElMessage.error(t('wizard.draft.saveFailed', { error: getErrorMessage(error) }))
  }
}

const clearDraftData = (): void => {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('lowcode:draft:'))
    keys.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.warn('Failed to clear draft data:', error)
  }
}

// ============= Permission Management (Strict Type-Safe) =============
const perm = ref({ entity: '', action: '', displayName: '' })
// 基础 CRUD 权限由后端生成，向导仅允许配置非基础动作，避免重复
const BASE_CRUD = ['Create', 'Read', 'Update', 'Delete']
const actionOptions = ['Export', 'Import', 'Approve', 'Reject']

const permissionPreview = computed(() => {
  if (!perm.value.entity || !perm.value.action) return ''
  const currentState = stateManager.getCurrentState()
  if (!currentState) return ''
  return `${currentState.name}.${perm.value.entity}.${perm.value.action}`
})

const addCustomPermission = async (): Promise<void> => {
  try {
    stateManager.beginTransaction('Add custom permission')

    const currentState = stateManager.getCurrentState()
    if (!currentState) {
      throw new Error('No module state available')
    }

    // Validate input
    if (!perm.value.entity || !perm.value.action || !perm.value.displayName) {
      throw new Error('All permission fields are required')
    }

    // 禁止基础 CRUD 通过自定义入口重复添加
    if (BASE_CRUD.includes(perm.value.action)) {
      throw new Error('CRUD actions are predefined and should not be added here')
    }

    // Check for duplicates
    const existingPermission = currentState.permissionConfig.customActions.find(p =>
      p.entityName === perm.value.entity && p.actionKey === perm.value.action
    )

    if (existingPermission) {
      throw new Error(`Permission ${perm.value.entity}.${perm.value.action} already exists`)
    }

    // Create new permission with proper types
    const newPermission: StrictPermissionAction = {
      entityName: perm.value.entity as ValidatedEntityName,
      actionKey: perm.value.action,
      displayName: perm.value.displayName
    }

    stateManager.updateModuleMetadata({
      permissionConfig: {
        ...currentState.permissionConfig,
        customActions: [...currentState.permissionConfig.customActions, newPermission]
      }
    })

    await stateManager.commitTransaction()

    // Clear form
    perm.value = { entity: '', action: '', displayName: '' }
    hasUnsavedChanges.value = true

    ElMessage.success(t('wizard.permissions.added'))

  } catch (error) {
    ElMessage.error(t('wizard.permissions.addFailed', { error: getErrorMessage(error) }))
  }
}

// ============= CRUD Permission Matrix Management =============
const hasCrud = (entityName: string, action: string): boolean => {
  const currentState = stateManager.getCurrentState()
  if (!currentState) return false

  return currentState.permissionConfig.customActions.some(p =>
    p.entityName === entityName && p.actionKey === action
  )
}

const onToggleCrud = async (entityName: string, action: string, checked: boolean): Promise<void> => {
  try {
    stateManager.beginTransaction(`Toggle CRUD permission: ${entityName}.${action}`)

    const currentState = stateManager.getCurrentState()
    if (!currentState) {
      throw new Error('No module state available')
    }

    let newCustomActions = [...currentState.permissionConfig.customActions]

    if (checked) {
      // Add permission if not exists
      const exists = newCustomActions.some(p =>
        p.entityName === entityName && p.actionKey === action
      )

      // 避免基础 CRUD 进入 customActions（后端已生成）
      if (!exists && !BASE_CRUD.includes(action)) {
        const newPermission: StrictPermissionAction = {
          entityName: entityName as ValidatedEntityName,
          actionKey: action,
          displayName: `${action} ${entityName}`
        }
        newCustomActions.push(newPermission)
      }
    } else {
      // Remove permission
      newCustomActions = newCustomActions.filter(p =>
        !(p.entityName === entityName && p.actionKey === action)
      )
    }

    stateManager.updateModuleMetadata({
      permissionConfig: {
        ...currentState.permissionConfig,
        customActions: newCustomActions
      }
    })

    await stateManager.commitTransaction()
    hasUnsavedChanges.value = true

  } catch (error) {
    ElMessage.error(t('wizard.permissions.toggleFailed', { error: getErrorMessage(error) }))
  }
}

const toggleAllCrud = async (checked: boolean): Promise<void> => {
  try {
    stateManager.beginTransaction(`Toggle all CRUD permissions: ${checked}`)

    const currentState = stateManager.getCurrentState()
    if (!currentState) {
      throw new Error('No module state available')
    }

    const crudActions = BASE_CRUD
    let newCustomActions = [...currentState.permissionConfig.customActions]

    for (const entity of currentState.entities) {
      for (const action of crudActions) {
        const exists = newCustomActions.some(p =>
          p.entityName === entity.name && p.actionKey === action
        )

        // 这里不向 customActions 注入基础 CRUD，保持与后端常量一致
        if (checked && !exists) {
          // 忽略推入，维持后端生成路径（基础 CRUD 常量由后端提供）
        } else if (!checked && exists) {
          newCustomActions = newCustomActions.filter(p =>
            !(p.entityName === entity.name && p.actionKey === action)
          )
        }
      }
    }

    stateManager.updateModuleMetadata({
      permissionConfig: {
        ...currentState.permissionConfig,
        customActions: newCustomActions
      }
    })

    await stateManager.commitTransaction()
    hasUnsavedChanges.value = true

  } catch (error) {
    ElMessage.error(t('wizard.permissions.toggleAllFailed', { error: getErrorMessage(error) }))
  }
}

const removeCustomPermission = async (index: number): Promise<void> => {
  try {
    stateManager.beginTransaction('Remove custom permission')

    const currentState = stateManager.getCurrentState()
    if (!currentState) {
      throw new Error('No module state available')
    }

    const newCustomActions = [...currentState.permissionConfig.customActions]
    const removedPermission = newCustomActions.splice(index, 1)[0]

    stateManager.updateModuleMetadata({
      permissionConfig: {
        ...currentState.permissionConfig,
        customActions: newCustomActions
      }
    })

    await stateManager.commitTransaction()
    hasUnsavedChanges.value = true

    ElMessage.success(t('wizard.permissions.removed', {
      permission: `${removedPermission.entityName}.${removedPermission.actionKey}`
    }))

  } catch (error) {
    ElMessage.error(t('wizard.permissions.removeFailed', { error: getErrorMessage(error) }))
  }
}

// ============= Auto-initialize CRUD permissions =============
let crudInitialized = false
watch(() => wizardState.value.currentStep, async (newStep: WizardStep) => {
  if (newStep === WizardStep.FEATURE_CONFIG && !crudInitialized) {
    const currentState = stateManager.getCurrentState()
    if (currentState && currentState.permissionConfig.customActions.length === 0) {
      await toggleAllCrud(true)
    }
    crudInitialized = true
  }
})
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


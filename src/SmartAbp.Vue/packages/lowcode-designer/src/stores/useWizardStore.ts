/**
 * 向导状态管理Store
 * 提供模块向导的状态管理、导航控制、表单数据处理等功能
 */

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { WizardStep } from "../types/wizard"
import type { StepMetadata, ModuleMetadata } from "../types/wizard"
import { useDebouncedWatch, ApiCache, RequestDeduplicator } from "../utils/performance-optimizer"
import { AutoSaveManager } from "../utils/error-recovery"
import { ElMessage } from "element-plus"

// 创建全局实例
const globalCache = new ApiCache()
const requestDeduplicator = new RequestDeduplicator()

export interface WizardState {
  currentStep: WizardStep
  completedSteps: Set<WizardStep>
  formData: ModuleMetadata
  validationErrors: Record<string, string[]>
  navigationHistory: WizardStep[]
  isDirty: boolean
  isLoading: boolean
}

export const useWizardStore = defineStore("wizard", () => {
  // State
  const currentStep = ref<WizardStep>(WizardStep.BASIC_INFO)
  const completedSteps = ref<Set<WizardStep>>(new Set())
  const formData = ref<ModuleMetadata>(createInitialMetadata())
  const validationErrors = ref<Record<string, string[]>>({})
  const navigationHistory = ref<WizardStep[]>([])
  const isDirty = ref(false)
  const isLoading = ref(false)

  // Performance optimizations
  const autoSaveManager = new AutoSaveManager()
  const cacheKey = computed(() => `wizard:${formData.value.systemName}:${formData.value.name}`)

  // Getters
  const canProceed = computed(() => {
    try {
      const steps = Object.values(WizardStep)
      const currentStepIndex = steps.indexOf(currentStep.value)
      return currentStepIndex < steps.length - 1
    } catch (error) {
      console.error(`[canProceed] 计算是否可继续失败:`, error)
      return false
    }
  })

  const canGoBack = computed(() => {
    try {
      const steps = Object.values(WizardStep)
      const currentStepIndex = steps.indexOf(currentStep.value)
      return currentStepIndex > 0 && navigationHistory.value.length > 0
    } catch (error) {
      console.error(`[canGoBack] 计算是否可返回失败:`, error)
      return false
    }
  })

  const progressPercentage = computed(() => {
    try {
      const totalSteps = Object.values(WizardStep).length
      const completedCount = completedSteps.value.size
      return Math.round((completedCount / totalSteps) * 100)
    } catch (error) {
      console.error(`[progressPercentage] 计算进度百分比失败:`, error)
      return 0
    }
  })

  const currentStepMetadata = computed(() => {
    try {
      return STEP_METADATA[currentStep.value]
    } catch (error) {
      console.error(`[currentStepMetadata] 获取当前步骤元数据失败:`, error)
      return null
    }
  })

  // Actions
  function navigateToStep(step: WizardStep) {
    try {
      // 验证参数
      if (!step) {
        throw new Error("Step is required")
      }

      if (!Object.values(WizardStep).includes(step)) {
        throw new Error(`Invalid step: ${step}`)
      }

      if (!canNavigateToStep(step)) {
        console.warn(`Cannot navigate to step: ${step}`)
        ElMessage.warning({
          message: `Cannot navigate to step: ${step}`,
          duration: 3000,
        })
        return
      }

      // Record navigation history
      navigationHistory.value.push(currentStep.value)

      // Update current step
      currentStep.value = step as WizardStep

      // Mark as visited but not necessarily completed
      if (!completedSteps.value.has(step)) {
        completedSteps.value.add(step)
      }

      isDirty.value = true

      console.log(`🧭 Navigated to step: ${step}`)

      ElMessage.success({
        message: `Navigated to: ${STEP_METADATA[step]?.title || step}`,
        duration: 2000,
      })
    } catch (error) {
      console.error(`[navigateToStep] 导航到步骤失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to navigate to step: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响用户操作
    }
  }

  function goBack() {
    try {
      if (navigationHistory.value.length === 0) {
        console.warn("No navigation history available")
        return
      }

      const previousStep = navigationHistory.value.pop()!
      currentStep.value = previousStep as WizardStep
      isDirty.value = true

      console.log(`🧭 Went back to step: ${previousStep}`)

      ElMessage.info({
        message: `Went back to: ${STEP_METADATA[previousStep]?.title || previousStep}`,
        duration: 2000,
      })
    } catch (error) {
      console.error(`[goBack] 返回上一步失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to go back: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响用户操作
    }
  }

  function goNext() {
    try {
      const steps = Object.values(WizardStep)
      const currentIndex = steps.indexOf(currentStep.value)

      if (currentIndex < steps.length - 1) {
        navigateToStep(steps[currentIndex + 1])
      } else {
        console.warn("Already at the last step")
        ElMessage.warning({
          message: "Already at the last step",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error(`[goNext] 前往下一步失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to go next: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响用户操作
    }
  }

  function markStepCompleted(step: WizardStep) {
    try {
      // 验证参数
      if (!step) {
        throw new Error("Step is required")
      }

      if (!Object.values(WizardStep).includes(step)) {
        throw new Error(`Invalid step: ${step}`)
      }

      completedSteps.value.add(step)
      isDirty.value = true

      console.log(`✅ Marked step as completed: ${step}`)

      ElMessage.success({
        message: `Completed: ${STEP_METADATA[step]?.title || step}`,
        duration: 2000,
      })
    } catch (error) {
      console.error(`[markStepCompleted] 标记步骤完成失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to mark step as completed: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响用户操作
    }
  }

  function markStepIncomplete(step: WizardStep) {
    try {
      // 验证参数
      if (!step) {
        throw new Error("Step is required")
      }

      if (!Object.values(WizardStep).includes(step)) {
        throw new Error(`Invalid step: ${step}`)
      }

      completedSteps.value.delete(step)
      isDirty.value = true

      console.log(`🔄 Marked step as incomplete: ${step}`)

      ElMessage.info({
        message: `Marked as incomplete: ${STEP_METADATA[step]?.title || step}`,
        duration: 2000,
      })
    } catch (error) {
      console.error(`[markStepIncomplete] 标记步骤未完成失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to mark step as incomplete: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响用户操作
    }
  }

  function updateFormData(updates: Partial<ModuleMetadata>) {
    try {
      // 验证参数
      if (!updates || typeof updates !== "object") {
        throw new Error("Updates must be a valid object")
      }

      formData.value = { ...formData.value, ...updates }
      isDirty.value = true

      // Auto-save on update
      autoSaveManager.saveDraft(cacheKey.value, formData.value)

      console.log(`📝 Updated form data:`, Object.keys(updates))

      ElMessage.success({
        message: "Form data updated successfully",
        duration: 2000,
      })
    } catch (error) {
      console.error(`[updateFormData] 更新表单数据失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to update form data: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响用户操作
    }
  }

  function setValidationErrors(errors: Record<string, string[]>) {
    try {
      // 验证参数
      if (!errors || typeof errors !== "object") {
        throw new Error("Errors must be a valid object")
      }

      // 验证错误格式
      for (const [key, value] of Object.entries(errors)) {
        if (!Array.isArray(value)) {
          throw new Error(`Validation errors for ${key} must be an array`)
        }

        for (const error of value) {
          if (typeof error !== "string") {
            throw new Error(`Validation error messages must be strings`)
          }
        }
      }

      validationErrors.value = errors

      console.log(`❌ Set validation errors:`, Object.keys(errors))

      ElMessage.warning({
        message: "Validation errors found",
        duration: 2000,
      })
    } catch (error) {
      console.error(`[setValidationErrors] 设置验证错误失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to set validation errors: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到空对象
      validationErrors.value = {}
    }
  }

  function clearValidationErrors() {
    try {
      validationErrors.value = {}

      console.log(`✅ Cleared validation errors`)

      ElMessage.success({
        message: "Validation errors cleared",
        duration: 2000,
      })
    } catch (error) {
      console.error(`[clearValidationErrors] 清除验证错误失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to clear validation errors: ${errorMessage}`,
        duration: 3000,
      })

      // 强制清空
      validationErrors.value = {}
    }
  }

  function canNavigateToStep(step: WizardStep): boolean {
    try {
      // 验证参数
      if (!step) {
        console.warn("Step is required for navigation validation")
        return false
      }

      if (!Object.values(WizardStep).includes(step)) {
        console.warn(`Invalid step for navigation validation: ${step}`)
        return false
      }

      const steps = Object.values(WizardStep)
      const currentIndex = steps.indexOf(currentStep.value)
      const targetIndex = steps.indexOf(step)

      // Allow navigation to completed steps or next logical step
      return completedSteps.value.has(step) || targetIndex === currentIndex + 1
    } catch (error) {
      console.error(`[canNavigateToStep] 验证导航到步骤失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to validate step navigation: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到false，拒绝导航
      return false
    }
  }

  function reset() {
    try {
      currentStep.value = WizardStep.BASIC_INFO
      completedSteps.value = new Set()
      formData.value = createInitialMetadata()
      validationErrors.value = {}
      navigationHistory.value = []
      isDirty.value = false
      isLoading.value = false

      // Clear cache and auto-save
      globalCache.delete(cacheKey.value)
      autoSaveManager.deleteDraft(cacheKey.value)

      console.log(`🔄 Reset wizard store`)

      ElMessage.success({
        message: "Wizard reset successfully",
        duration: 2000,
      })
    } catch (error) {
      console.error(`[reset] 重置向导失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to reset wizard: ${errorMessage}`,
        duration: 3000,
      })

      // 强制重置所有状态
      currentStep.value = WizardStep.BASIC_INFO
      completedSteps.value = new Set()
      formData.value = createInitialMetadata()
      validationErrors.value = {}
      navigationHistory.value = []
      isDirty.value = false
      isLoading.value = false

      // 不抛出错误，避免影响用户操作
    }
  }

  // Enhanced transaction support with caching
  async function withTransaction<T>(
    operation: () => Promise<T>,
    cacheable: boolean = false,
  ): Promise<T> {
    try {
      // 验证参数
      if (typeof operation !== "function") {
        throw new Error("Operation must be a function")
      }

      if (typeof cacheable !== "boolean") {
        throw new Error("Cacheable must be a boolean")
      }

      isLoading.value = true

      if (cacheable) {
        const cacheResult = globalCache.get<T>(cacheKey.value)
        if (cacheResult) {
          isLoading.value = false
          return cacheResult
        }
      }

      try {
        const result = await requestDeduplicator.deduplicate(`transaction:${Date.now()}`, operation, {})

        isDirty.value = true

        if (cacheable) {
          globalCache.set(cacheKey.value, result)
        }

        console.log(`✅ Transaction completed successfully`)

        ElMessage.success({
          message: "Operation completed successfully",
          duration: 2000,
        })

        return result
      } catch (operationError) {
        console.error("Transaction operation failed:", operationError)

        const errorMessage =
          operationError instanceof Error ? operationError.message : String(operationError)

        ElMessage.error({
          message: `Operation failed: ${errorMessage}`,
          duration: 4000,
        })

        // 抛出原始错误，让调用方处理
        throw operationError
      }
    } catch (error) {
      console.error(`[withTransaction] 事务执行失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Transaction failed: ${errorMessage}`,
        duration: 3000,
      })

      // 确保加载状态被重置
      isLoading.value = false

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Transaction failed: ${errorMessage}`)
    } finally {
      isLoading.value = false
    }
  }

  // Load draft data
  function loadDraft() {
    try {
      const draft = autoSaveManager.loadDraft(cacheKey.value)
      if (draft) {
        // 验证草稿数据
        if (!draft || typeof draft !== "object") {
          throw new Error("Invalid draft data")
        }

        formData.value = draft
        isDirty.value = true

        console.log(`📄 Loaded draft data`)

        ElMessage.success({
          message: "Draft loaded successfully",
          duration: 2000,
        })

        return true
      }

      console.log(`📄 No draft data found`)
      return false
    } catch (error) {
      console.error(`[loadDraft] 加载草稿失败:`, error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to load draft: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到false，表示加载失败
      return false
    }
  }

  // Debounced auto-save
  useDebouncedWatch(
    formData,
    () => {
      try {
        if (isDirty.value) {
          autoSaveManager.saveDraft(cacheKey.value, formData.value)
          console.log(`💾 Auto-saved draft data`)
        }
      } catch (error) {
        console.error(`[autoSave] 自动保存失败:`, error)

        const errorMessage = error instanceof Error ? error.message : String(error)

        ElMessage.error({
          message: `Auto-save failed: ${errorMessage}`,
          duration: 3000,
        })

        // 不抛出错误，避免影响自动保存流程
      }
    },
    2000,
  ) // 2 second debounce

  return {
    // State
    currentStep,
    completedSteps,
    formData,
    validationErrors,
    navigationHistory,
    isDirty,
    isLoading,

    // Getters
    canProceed,
    canGoBack,
    progressPercentage,
    currentStepMetadata,

    // Actions
    navigateToStep,
    goBack,
    goNext,
    markStepCompleted,
    markStepIncomplete,
    updateFormData,
    setValidationErrors,
    clearValidationErrors,
    canNavigateToStep,
    reset,
    withTransaction,
    loadDraft,
  }
})

// Helper functions
function createInitialMetadata(): ModuleMetadata {
  try {
    return {
      systemName: "",
      name: "",
      displayName: "",
      description: "",
      version: "1.0.0",
      featureManagement: {
        defaultPolicy: "RequireAuthentication",
      },
      entities: [],
      databaseInfo: {
        connectionStringName: "Default",
        provider: "SqlServer",
      },
      permissionConfig: {
        customActions: [],
      },
    }
  } catch (error) {
    console.error(`[createInitialMetadata] 创建初始元数据失败:`, error)

    // 回退到最小化的初始数据
    return {
      systemName: "",
      name: "",
      displayName: "",
      description: "",
      version: "1.0.0",
      featureManagement: { defaultPolicy: "RequireAuthentication" },
      entities: [],
      databaseInfo: { connectionStringName: "Default", provider: "SqlServer" },
      permissionConfig: { customActions: [] },
    }
  }
}

// Step metadata configuration
const STEP_METADATA: Record<WizardStep, StepMetadata> = {
  [WizardStep.BASIC_INFO]: {
    title: "基础信息",
    description: "配置模块的基本信息",
    estimatedTime: "2分钟",
  },
  [WizardStep.ENTITY_DESIGN]: {
    title: "实体设计",
    description: "设计数据实体和关系",
    estimatedTime: "5分钟",
  },
  [WizardStep.FEATURE_CONFIG]: {
    title: "功能配置",
    description: "配置权限和功能设置",
    estimatedTime: "3分钟",
  },
  [WizardStep.PREVIEW]: {
    title: "预览生成",
    description: "预览并生成代码",
    estimatedTime: "1分钟",
  },
}

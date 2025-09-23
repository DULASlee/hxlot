/**
 * 智能工作流编排 - 基于现有LowCode Studio的增量增强
 * 
 * 功能:
 * - 智能步骤跳转和引导
 * - 基于完成度的自动提示
 * - 工作流状态持久化
 * - 最佳实践建议
 * 
 * @version 1.0.0
 * @author SmartAbp Team
 */

import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEntityModelingStore } from '@/stores/lowcode/entityModeling'
import { usePageDesignStore } from '@/stores/lowcode/pageDesign'
import { useCodeGenerationStore } from '@/stores/lowcode/codeGeneration'
import { ElMessage, ElNotification } from 'element-plus'

export interface WorkflowStep {
  id: string
  name: string
  route: string
  icon: string
  description: string
  estimatedTime: number // 分钟
  dependencies: string[] // 依赖的前置步骤
  completionCriteria: () => boolean
  autoAdvanceCondition?: () => boolean
  nextStepSuggestion?: () => string | null
}

export interface WorkflowState {
  currentStepId: string
  completedSteps: string[]
  stepProgress: Record<string, number>
  totalProgress: number
  startTime: number
  estimatedCompletionTime: number
}

export function useSmartWorkflow() {
  const router = useRouter()
  const route = useRoute()
  
  // Stores
  const entityStore = useEntityModelingStore()
  const pageDesignStore = usePageDesignStore()
  const codeGenerationStore = useCodeGenerationStore()

  // 工作流步骤定义
  const workflowSteps = ref<WorkflowStep[]>([
    {
      id: 'modeling',
      name: '数据建模',
      route: '/studio',
      icon: 'el-icon-data-analysis',
      description: '设计实体模型、字段和关系',
      estimatedTime: 15,
      dependencies: [],
      completionCriteria: () => {
        const entities = entityStore.entities
        return entities.length >= 2 && 
               entities.some(e => e.isCompleted) &&
               entities.some(e => e.fields.some(f => f.isPrimaryKey))
      },
      autoAdvanceCondition: () => {
        const entities = entityStore.entities
        return entities.length >= 3 && entities.every(e => e.isCompleted)
      },
      nextStepSuggestion: () => {
        const entities = entityStore.entities
        if (entities.length === 0) return '请先创建至少一个实体'
        if (!entities.some(e => e.isCompleted)) return '请完善实体的字段设计'
        if (entities.length >= 2 && entities.every(e => e.isCompleted)) {
          return '数据模型设计完成，可以开始页面设计了！'
        }
        return null
      }
    },
    {
      id: 'design',
      name: '页面设计',
      route: '/studio/design',
      icon: 'el-icon-brush',
      description: '设计用户界面和页面布局',
      estimatedTime: 20,
      dependencies: ['modeling'],
      completionCriteria: () => {
        const pages = pageDesignStore.pages
        const entities = entityStore.entities
        return pages.length >= entities.length && 
               pages.some(p => p.components.length > 0)
      },
      autoAdvanceCondition: () => {
        const pages = pageDesignStore.pages
        const entities = entityStore.entities
        return entities.length > 0 && pages.length >= entities.length * 2 // 每个实体至少2个页面
      },
      nextStepSuggestion: () => {
        const pages = pageDesignStore.pages
        const entities = entityStore.entities
        if (entities.length === 0) return '请先完成数据建模'
        if (pages.length === 0) return '请使用批量生成功能创建页面'
        if (pages.length >= entities.length) {
          return '页面设计完成，可以开始生成代码了！'
        }
        return `还需要为 ${entities.length - pages.length} 个实体设计页面`
      }
    },
    {
      id: 'generation',
      name: '代码生成',
      route: '/studio/generation',
      icon: 'el-icon-cpu',
      description: '生成完整的前后端代码',
      estimatedTime: 10,
      dependencies: ['modeling', 'design'],
      completionCriteria: () => {
        return codeGenerationStore.generatedFiles.length > 0 &&
               codeGenerationStore.lastGenerationStatus === 'success'
      },
      nextStepSuggestion: () => {
        const entities = entityStore.entities
        const pages = pageDesignStore.pages
        if (entities.length === 0) return '请先完成数据建模'
        if (pages.length === 0) return '请先完成页面设计'
        if (codeGenerationStore.generatedFiles.length === 0) {
          return '点击"一键生成全部代码"开始生成'
        }
        return '代码生成完成！可以下载代码包或部署到测试环境'
      }
    }
  ])

  // 工作流状态
  const workflowState = ref<WorkflowState>({
    currentStepId: 'modeling',
    completedSteps: [],
    stepProgress: {},
    totalProgress: 0,
    startTime: Date.now(),
    estimatedCompletionTime: 0
  })

  // 计算属性
  const currentStep = computed(() => {
    return workflowSteps.value.find(step => step.id === workflowState.value.currentStepId)
  })

  const nextAvailableStep = computed(() => {
    const current = currentStep.value
    if (!current) return null

    const currentIndex = workflowSteps.value.findIndex(s => s.id === current.id)
    const nextStep = workflowSteps.value[currentIndex + 1]
    
    if (!nextStep) return null

    // 检查依赖是否满足
    const dependenciesMet = nextStep.dependencies.every(dep => 
      workflowState.value.completedSteps.includes(dep)
    )

    return dependenciesMet ? nextStep : null
  })

  const isStepCompleted = computed(() => (stepId: string) => {
    const step = workflowSteps.value.find(s => s.id === stepId)
    return step ? step.completionCriteria() : false
  })

  const canAdvanceToStep = computed(() => (stepId: string) => {
    const step = workflowSteps.value.find(s => s.id === stepId)
    if (!step) return false

    return step.dependencies.every(dep => isStepCompleted.value(dep))
  })

  const totalWorkflowProgress = computed(() => {
    const totalSteps = workflowSteps.value.length
    const completedCount = workflowSteps.value.filter(step => 
      isStepCompleted.value(step.id)
    ).length
    
    return Math.round((completedCount / totalSteps) * 100)
  })

  const currentStepProgress = computed(() => {
    const step = currentStep.value
    if (!step) return 0

    // 基于具体步骤计算进度
    switch (step.id) {
      case 'modeling':
        const entities = entityStore.entities
        if (entities.length === 0) return 0
        const completedEntities = entities.filter(e => e.isCompleted).length
        return Math.round((completedEntities / entities.length) * 100)
        
      case 'design':
        const pages = pageDesignStore.pages
        const entitiesCount = entityStore.entities.length
        if (entitiesCount === 0) return 0
        return Math.round((pages.length / (entitiesCount * 2)) * 100) // 每个实体至少2个页面
        
      case 'generation':
        return codeGenerationStore.generationProgress || 0
        
      default:
        return 0
    }
  })

  const nextStepSuggestion = computed(() => {
    const step = currentStep.value
    return step?.nextStepSuggestion?.() || null
  })

  // 监听状态变化，自动更新工作流
  watch(
    [
      () => entityStore.entities.length,
      () => entityStore.entities.filter(e => e.isCompleted).length,
      () => pageDesignStore.pages.length,
      () => codeGenerationStore.generatedFiles.length
    ],
    () => {
      updateWorkflowState()
      checkAutoAdvanceConditions()
    },
    { deep: true }
  )

  // 监听路由变化，同步当前步骤
  watch(
    () => route.path,
    (newPath) => {
      const step = workflowSteps.value.find(s => newPath.startsWith(s.route))
      if (step && step.id !== workflowState.value.currentStepId) {
        setCurrentStep(step.id)
      }
    },
    { immediate: true }
  )

  // 方法
  const setCurrentStep = (stepId: string) => {
    const step = workflowSteps.value.find(s => s.id === stepId)
    if (!step) return

    workflowState.value.currentStepId = stepId
    
    // 检查是否可以访问这个步骤
    if (!canAdvanceToStep.value(stepId)) {
      const missingDeps = step.dependencies.filter(dep => !isStepCompleted.value(dep))
      ElMessage.warning({
        message: `请先完成前置步骤：${missingDeps.map(dep => 
          workflowSteps.value.find(s => s.id === dep)?.name
        ).join('、')}`,
        duration: 3000
      })
      return
    }

    // 导航到对应路由
    if (route.path !== step.route) {
      router.push(step.route)
    }

    saveWorkflowState()
  }

  const advanceToNextStep = () => {
    const next = nextAvailableStep.value
    if (next) {
      showStepAdvanceNotification(next)
      setCurrentStep(next.id)
    }
  }

  const updateWorkflowState = () => {
    // 更新已完成步骤
    const newCompletedSteps = workflowSteps.value
      .filter(step => isStepCompleted.value(step.id))
      .map(step => step.id)
    
    workflowState.value.completedSteps = newCompletedSteps
    workflowState.value.totalProgress = totalWorkflowProgress.value
    
    // 更新各步骤进度
    workflowSteps.value.forEach(step => {
      workflowState.value.stepProgress[step.id] = getStepProgress(step.id)
    })

    saveWorkflowState()
  }

  const getStepProgress = (stepId: string): number => {
    switch (stepId) {
      case 'modeling':
        const entities = entityStore.entities
        if (entities.length === 0) return 0
        const completed = entities.filter(e => e.isCompleted).length
        return Math.round((completed / Math.max(entities.length, 1)) * 100)
        
      case 'design':
        const pages = pageDesignStore.pages
        const entitiesCount = entityStore.entities.length
        if (entitiesCount === 0) return 0
        return Math.round((pages.length / Math.max(entitiesCount * 2, 1)) * 100)
        
      case 'generation':
        return codeGenerationStore.generationProgress || 0
        
      default:
        return isStepCompleted.value(stepId) ? 100 : 0
    }
  }

  const checkAutoAdvanceConditions = () => {
    const step = currentStep.value
    if (!step?.autoAdvanceCondition) return

    if (step.autoAdvanceCondition()) {
      const next = nextAvailableStep.value
      if (next) {
        // 延迟2秒后显示自动跳转提示
        setTimeout(() => {
          showAutoAdvanceNotification(step, next)
        }, 2000)
      }
    }
  }

  const showStepAdvanceNotification = (nextStep: WorkflowStep) => {
    ElNotification({
      title: '🎉 步骤完成',
      message: `准备进入下一步：${nextStep.name}`,
      type: 'success',
      duration: 4000,
      position: 'top-right'
    })
  }

  const showAutoAdvanceNotification = (currentStep: WorkflowStep, nextStep: WorkflowStep) => {
    ElNotification({
      title: '🚀 智能工作流建议',
      message: `${currentStep.name}已基本完成，建议进入${nextStep.name}`,
      type: 'info',
      duration: 0, // 不自动关闭
      position: 'top-right',
      customClass: 'smart-workflow-notification',
      dangerouslyUseHTMLString: true,
      message: `
        <div>
          <p><strong>${currentStep.name}</strong>已基本完成</p>
          <p>建议进入<strong>${nextStep.name}</strong></p>
          <div style="margin-top: 12px;">
            <button onclick="window.smartWorkflowAdvance()" 
                    style="background: #409eff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
              立即跳转
            </button>
            <button onclick="window.smartWorkflowDismiss()" 
                    style="background: #dcdfe6; color: #606266; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-left: 8px;">
              稍后提醒
            </button>
          </div>
        </div>
      `,
      onClose: () => {
        // 清理全局函数
        delete (window as any).smartWorkflowAdvance
        delete (window as any).smartWorkflowDismiss
      }
    })

    // 设置全局函数供通知按钮调用
    ;(window as any).smartWorkflowAdvance = () => {
      setCurrentStep(nextStep.id)
      // 手动关闭通知
      document.querySelector('.smart-workflow-notification .el-notification__closeBtn')?.click()
    }
    
    ;(window as any).smartWorkflowDismiss = () => {
      // 10分钟后再次提醒
      setTimeout(() => {
        if (currentStep.value?.id === currentStep.id && nextAvailableStep.value?.id === nextStep.id) {
          showAutoAdvanceNotification(currentStep, nextStep)
        }
      }, 600000) // 10分钟
      
      // 手动关闭通知
      document.querySelector('.smart-workflow-notification .el-notification__closeBtn')?.click()
    }
  }

  const getStepEstimatedTime = (stepId: string): number => {
    const step = workflowSteps.value.find(s => s.id === stepId)
    return step?.estimatedTime || 0
  }

  const getRemainingTime = (): number => {
    const currentStepIndex = workflowSteps.value.findIndex(s => s.id === workflowState.value.currentStepId)
    const remainingSteps = workflowSteps.value.slice(currentStepIndex)
    
    return remainingSteps.reduce((total, step) => {
      const progress = workflowState.value.stepProgress[step.id] || 0
      const remainingTime = step.estimatedTime * (1 - progress / 100)
      return total + remainingTime
    }, 0)
  }

  const getWorkflowSuggestions = (): string[] => {
    const suggestions: string[] = []
    const entities = entityStore.entities
    const pages = pageDesignStore.pages

    // 基于当前状态生成建议
    if (entities.length === 0) {
      suggestions.push('🚀 使用"智能项目向导"快速开始，选择企业模板一键生成完整项目')
    } else if (entities.length < 3) {
      suggestions.push('💡 建议至少创建3个实体，形成完整的业务模型')
    }

    if (entities.length > 0 && !entities.some(e => e.isCompleted)) {
      suggestions.push('📝 请完善实体字段设计，至少包含主键和必要的业务字段')
    }

    if (entities.length > 0 && entities.every(e => e.isCompleted) && pages.length === 0) {
      suggestions.push('🎨 数据模型完成，建议使用"智能批量生成"创建管理页面')
    }

    if (pages.length > 0 && codeGenerationStore.generatedFiles.length === 0) {
      suggestions.push('⚙️ 页面设计完成，可以开始生成完整的前后端代码')
    }

    return suggestions
  }

  const saveWorkflowState = () => {
    try {
      localStorage.setItem('smartabp-workflow-state', JSON.stringify({
        ...workflowState.value,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('保存工作流状态失败:', error)
    }
  }

  const loadWorkflowState = () => {
    try {
      const saved = localStorage.getItem('smartabp-workflow-state')
      if (saved) {
        const parsed = JSON.parse(saved)
        // 只恢复不超过24小时的状态
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          workflowState.value = {
            ...workflowState.value,
            ...parsed
          }
        }
      }
    } catch (error) {
      console.warn('加载工作流状态失败:', error)
    }
  }

  const resetWorkflow = () => {
    workflowState.value = {
      currentStepId: 'modeling',
      completedSteps: [],
      stepProgress: {},
      totalProgress: 0,
      startTime: Date.now(),
      estimatedCompletionTime: 0
    }
    
    localStorage.removeItem('smartabp-workflow-state')
    setCurrentStep('modeling')
  }

  const showWorkflowGuide = () => {
    const suggestions = getWorkflowSuggestions()
    const suggestion = nextStepSuggestion.value
    
    let message = ''
    if (suggestion) {
      message += `<p><strong>当前建议：</strong>${suggestion}</p>`
    }
    
    if (suggestions.length > 0) {
      message += '<p><strong>操作建议：</strong></p><ul>'
      suggestions.forEach(s => {
        message += `<li>${s}</li>`
      })
      message += '</ul>'
    }

    ElNotification({
      title: '🧭 智能工作流指导',
      dangerouslyUseHTMLString: true,
      message: message || '工作流进展良好，请继续当前步骤',
      type: 'info',
      duration: 8000,
      position: 'top-left'
    })
  }

  const generateProgressReport = () => {
    const report = {
      workflowProgress: workflowState.value.totalProgress,
      currentStep: currentStep.value?.name,
      completedSteps: workflowState.value.completedSteps.map(id => 
        workflowSteps.value.find(s => s.id === id)?.name
      ),
      entityProgress: {
        total: entityStore.entities.length,
        completed: entityStore.entities.filter(e => e.isCompleted).length,
        fields: entityStore.entities.reduce((sum, e) => sum + e.fields.length, 0)
      },
      pageProgress: {
        total: pageDesignStore.pages.length,
        entities: entityStore.entities.length
      },
      generationProgress: {
        files: codeGenerationStore.generatedFiles.length,
        status: codeGenerationStore.lastGenerationStatus
      },
      timeSpent: Math.round((Date.now() - workflowState.value.startTime) / 60000), // 分钟
      estimatedRemaining: getRemainingTime()
    }

    return report
  }

  // 初始化
  const initializeWorkflow = () => {
    loadWorkflowState()
    updateWorkflowState()
    
    // 如果是首次访问，显示欢迎指导
    if (workflowState.value.totalProgress === 0) {
      setTimeout(() => {
        ElNotification({
          title: '🎉 欢迎使用 LowCode Studio',
          message: '点击"智能项目向导"快速开始，或按照左侧导航逐步完成数据建模',
          type: 'success',
          duration: 6000,
          position: 'top-right'
        })
      }, 1000)
    }
  }

  return {
    // 状态
    workflowSteps,
    workflowState,
    currentStep,
    nextAvailableStep,
    totalWorkflowProgress,
    currentStepProgress,
    nextStepSuggestion,

    // 计算属性
    isStepCompleted,
    canAdvanceToStep,

    // 方法
    setCurrentStep,
    advanceToNextStep,
    updateWorkflowState,
    saveWorkflowState,
    loadWorkflowState,
    resetWorkflow,
    showWorkflowGuide,
    generateProgressReport,
    initializeWorkflow,
    getRemainingTime,
    getWorkflowSuggestions
  }
}

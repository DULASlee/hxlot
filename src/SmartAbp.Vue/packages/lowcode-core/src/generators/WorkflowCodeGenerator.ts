/**
 * 🔥 工作流代码生成器 - BPMN to Code
 * 
 * 功能：
 * 1. 生成前端工作流组件
 * 2. 生成后端工作流引擎
 * 3. 生成状态转换逻辑
 * 4. 生成工作流历史记录
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import type { Node, Edge } from '@vue-flow/core'

export interface WorkflowCodeGenerationOptions {
  workflowName: string
  entityType: string
  namespace: string
  generateFrontend: boolean
  generateBackend: boolean
}

export interface GeneratedCode {
  frontend: {
    component: string
    store: string
    types: string
  }
  backend: {
    engine: string
    dto: string
    appService: string
  }
}

/**
 * 工作流代码生成器
 */
export class WorkflowCodeGenerator {
  /**
   * 生成完整的工作流代码
   */
  generate(
    nodes: Node[],
    edges: Edge[],
    options: WorkflowCodeGenerationOptions
  ): GeneratedCode {
    return {
      frontend: {
        component: this.generateFrontendComponent(nodes, edges, options),
        store: this.generateFrontendStore(nodes, edges, options),
        types: this.generateFrontendTypes(nodes, edges, options)
      },
      backend: {
        engine: this.generateBackendEngine(nodes, edges, options),
        dto: this.generateBackendDto(nodes, edges, options),
        appService: this.generateBackendAppService(nodes, edges, options)
      }
    }
  }

  /**
   * 生成前端工作流组件
   */
  private generateFrontendComponent(
    nodes: Node[],
    _edges: Edge[],
    options: WorkflowCodeGenerationOptions
  ): string {
    const stateNames = nodes.filter(n => n.type !== 'start' && n.type !== 'end')
      .map(n => `'${n.data.label || n.id}'`)
      .join(' | ')

    return `<template>
  <div class="workflow-instance">
    <!-- 当前状态显示 -->
    <div class="current-state">
      <el-tag :type="getStateType(currentState)" size="large">
        {{ getStateLabel(currentState) }}
      </el-tag>
      <span class="state-description">{{ getStateDescription(currentState) }}</span>
    </div>
    
    <!-- 可执行动作 -->
    <div class="available-actions" v-if="availableActions.length > 0">
      <h4>可执行操作</h4>
      <el-space>
        <el-button 
          v-for="action in availableActions"
          :key="action.name"
          :type="action.type"
          @click="executeAction(action)"
          :loading="actionLoading"
        >
          {{ action.label }}
        </el-button>
      </el-space>
    </div>
    
    <!-- 工作流历史 -->
    <div class="workflow-history">
      <h4>流程历史</h4>
      <el-timeline>
        <el-timeline-item
          v-for="history in workflowHistory"
          :key="history.id"
          :timestamp="formatDate(history.transitionTime)"
        >
          <div class="history-item">
            <strong>{{ history.action }}</strong>
            <span>{{ history.fromState }} → {{ history.toState }}</span>
            <div class="history-user">操作人: {{ history.userName }}</div>
            <div class="history-comment" v-if="history.comment">
              备注: {{ history.comment }}
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { use${options.workflowName}WorkflowStore } from '../stores/${options.workflowName.toLowerCase()}Workflow'

interface Props {
  entityId: string
}

const props = defineProps<Props>()
const workflowStore = use${options.workflowName}WorkflowStore()

const currentState = ref<${stateNames}>()
const availableActions = ref<any[]>([])
const workflowHistory = ref<any[]>([])
const actionLoading = ref(false)

onMounted(async () => {
  await loadWorkflowData()
})

const loadWorkflowData = async () => {
  try {
    const data = await workflowStore.loadWorkflowInstance(props.entityId)
    currentState.value = data.currentState
    availableActions.value = data.availableActions
    workflowHistory.value = data.history
  } catch (error) {
    ElMessage.error('加载工作流数据失败')
  }
}

const executeAction = async (action: any) => {
  actionLoading.value = true
  try {
    await workflowStore.executeWorkflowAction(props.entityId, action.name)
    ElMessage.success('操作执行成功')
    await loadWorkflowData()
  } catch (error) {
    ElMessage.error('操作执行失败')
  } finally {
    actionLoading.value = false
  }
}

const getStateType = (state: string): string => {
  // 根据状态返回El-tag类型
  const typeMap: Record<string, string> = {${this.generateStateTypeMap(nodes)}
  }
  return typeMap[state] || 'info'
}

const getStateLabel = (state: string): string => {
  return state
}

const getStateDescription = (state: string): string => {
  // 根据状态返回描述
  return ''
}

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.workflow-instance {
  padding: 20px;
}

.current-state {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.state-description {
  margin-left: 12px;
  color: #606266;
}

.available-actions {
  margin-bottom: 20px;
}

.workflow-history {
  margin-top: 24px;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-user {
  font-size: 12px;
  color: #909399;
}

.history-comment {
  font-size: 12px;
  color: #606266;
  font-style: italic;
}
</style>
`
  }

  /**
   * 生成前端Store
   */
  private generateFrontendStore(
    _nodes: Node[],
    _edges: Edge[],
    options: WorkflowCodeGenerationOptions
  ): string {
    return `import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const use${options.workflowName}WorkflowStore = defineStore('${options.workflowName.toLowerCase()}Workflow', () => {
  const currentInstance = ref<any>(null)
  
  const loadWorkflowInstance = async (entityId: string) => {
    const response = await axios.get(\`/api/workflow/${options.workflowName.toLowerCase()}/\${entityId}\`)
    currentInstance.value = response.data
    return response.data
  }
  
  const executeWorkflowAction = async (entityId: string, actionName: string) => {
    await axios.post(\`/api/workflow/${options.workflowName.toLowerCase()}/\${entityId}/execute\`, {
      action: actionName
    })
  }
  
  return {
    currentInstance,
    loadWorkflowInstance,
    executeWorkflowAction
  }
})
`
  }

  /**
   * 生成前端类型定义
   */
  private generateFrontendTypes(
    nodes: Node[],
    _edges: Edge[],
    _options: WorkflowCodeGenerationOptions
  ): string {
    const stateTypes = nodes
      .filter(n => n.type !== 'start' && n.type !== 'end')
      .map(n => `  | '${n.data.label || n.id}'`)
      .join('\n')

    return `export type WorkflowState =
${stateTypes}

export interface WorkflowInstance {
  id: string
  entityId: string
  currentState: WorkflowState
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowAction {
  name: string
  label: string
  type: 'primary' | 'success' | 'warning' | 'danger'
  fromStates: WorkflowState[]
  toState: WorkflowState
}

export interface WorkflowHistory {
  id: string
  entityId: string
  action: string
  fromState: WorkflowState
  toState: WorkflowState
  userId: string
  userName: string
  transitionTime: Date
  comment?: string
}
`
  }

  /**
   * 生成后端工作流引擎
   */
  private generateBackendEngine(
    nodes: Node[],
    edges: Edge[],
    options: WorkflowCodeGenerationOptions
  ): string {
    return `using System;
using System.Threading.Tasks;
using System.Security.Claims;
using Volo.Abp.Domain.Services;
using Volo.Abp;

namespace ${options.namespace}.Workflow
{
    public class ${options.workflowName}WorkflowEngine : DomainService
    {
        public async Task<WorkflowResult> ExecuteAsync(
            ${options.entityType} entity, 
            string action, 
            ClaimsPrincipal user)
        {
            var currentState = entity.WorkflowState;
            var targetState = await GetTargetStateAsync(currentState, action);
            
            if (targetState == null)
            {
                throw new BusinessException("InvalidWorkflowTransition", 
                    $"Cannot execute action '{action}' from state '{currentState}'");
            }
            
            // 执行状态转换前的业务规则
            await ValidateTransitionAsync(entity, currentState, targetState, user);
            
            // 执行状态转换
            entity.WorkflowState = targetState;
            entity.LastTransitionTime = Clock.Now;
            entity.LastTransitionUser = user.FindUserId();
            
            // 记录工作流历史
            await RecordHistoryAsync(entity, action, currentState, targetState, user);
            
            return WorkflowResult.Success(targetState);
        }
        
        private async Task<string> GetTargetStateAsync(string currentState, string action)
        {
            // 根据当前状态和动作确定目标状态
${this.generateStateTransitionLogic(nodes, edges)}
            
            return null;
        }
        
        private async Task ValidateTransitionAsync(
            ${options.entityType} entity,
            string fromState,
            string toState,
            ClaimsPrincipal user)
        {
            // 验证转换是否允许
            // 验证用户权限
            // 验证业务规则
            await Task.CompletedTask;
        }
        
        private async Task RecordHistoryAsync(
            ${options.entityType} entity,
            string action,
            string fromState,
            string toState,
            ClaimsPrincipal user)
        {
            // 记录工作流历史
            await Task.CompletedTask;
        }
    }
    
    public class WorkflowResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string NewState { get; set; }
        
        public static WorkflowResult Success(string newState)
        {
            return new WorkflowResult
            {
                Success = true,
                NewState = newState
            };
        }
        
        public static WorkflowResult Failed(string message)
        {
            return new WorkflowResult
            {
                Success = false,
                Message = message
            };
        }
    }
}
`
  }

  /**
   * 生成后端DTO
   */
  private generateBackendDto(
    _nodes: Node[],
    _edges: Edge[],
    options: WorkflowCodeGenerationOptions
  ): string {
    return `using System;

namespace ${options.namespace}.Workflow.Dtos
{
    public class ExecuteWorkflowActionInput
    {
        public string Action { get; set; }
        public string Comment { get; set; }
    }
    
    public class WorkflowInstanceDto
    {
        public Guid Id { get; set; }
        public Guid EntityId { get; set; }
        public string CurrentState { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
`
  }

  /**
   * 生成后端AppService
   */
  private generateBackendAppService(
    _nodes: Node[],
    _edges: Edge[],
    options: WorkflowCodeGenerationOptions
  ): string {
    return `using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace ${options.namespace}.Workflow
{
    public class ${options.workflowName}WorkflowAppService : ApplicationService
    {
        private readonly ${options.workflowName}WorkflowEngine _workflowEngine;
        
        public ${options.workflowName}WorkflowAppService(
            ${options.workflowName}WorkflowEngine workflowEngine)
        {
            _workflowEngine = workflowEngine;
        }
        
        public async Task<WorkflowResult> ExecuteActionAsync(
            Guid entityId, 
            ExecuteWorkflowActionInput input)
        {
            // 加载实体
            var entity = await GetEntityAsync(entityId);
            
            // 执行工作流
            var result = await _workflowEngine.ExecuteAsync(
                entity,
                input.Action,
                CurrentUser.GetClaimsPrincipal()
            );
            
            // 保存更改
            await SaveChangesAsync();
            
            return result;
        }
        
        private async Task<${options.entityType}> GetEntityAsync(Guid id)
        {
            // 从仓储加载实体
            await Task.CompletedTask;
            return null;
        }
        
        private async Task SaveChangesAsync()
        {
            // 保存更改到数据库
            await Task.CompletedTask;
        }
    }
}
`
  }

  /**
   * 生成状态类型映射
   */
  private generateStateTypeMap(nodes: Node[]): string {
    return nodes
      .filter(n => n.type !== 'start' && n.type !== 'end')
      .map(n => {
        const label = n.data.label || n.id
        const type = n.type === 'task' ? 'primary' : 'warning'
        return `\n    '${label}': '${type}'`
      })
      .join(',')
  }

  /**
   * 生成状态转换逻辑
   */
  private generateStateTransitionLogic(nodes: Node[], edges: Edge[]): string {
    const transitions: string[] = []
    
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      const targetNode = nodes.find(n => n.id === edge.target)
      
      if (sourceNode && targetNode) {
        const fromState = sourceNode.data.label || sourceNode.id
        const toState = targetNode.data.label || targetNode.id
        const actionName = edge.label || `to_${toState}`
        
        transitions.push(`            if (currentState == "${fromState}" && action == "${actionName}")
            {
                return "${toState}";
            }`)
      }
    })
    
    return transitions.join('\n\n')
  }
}


/**
 * 🔥 工作流验证器 - BPMN 2.0规范
 * 
 * 功能：
 * 1. 验证工作流结构完整性
 * 2. 检查BPMN规范合规性
 * 3. 检测死循环和死锁
 * 4. 验证节点连接有效性
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import type { Edge, Node } from '@vue-flow/core'

export interface ValidationError {
  type: 'error' | 'warning' | 'info'
  code: string
  message: string
  nodeId?: string
  edgeId?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
}

/**
 * 工作流验证器
 */
export class WorkflowValidator {
  /**
   * 验证工作流
   */
  validate(nodes: Node[], edges: Edge[]): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []
    const info: ValidationError[] = []

    // 1. 基础结构验证
    this.validateBasicStructure(nodes, edges, errors)

    // 2. BPMN规范验证
    this.validateBPMNRules(nodes, edges, errors, warnings)

    // 3. 连通性验证
    this.validateConnectivity(nodes, edges, warnings)

    // 4. 循环检测
    this.detectCycles(nodes, edges, warnings)

    // 5. 死锁检测
    this.detectDeadlocks(nodes, edges, errors)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info
    }
  }

  /**
   * 基础结构验证
   */
  private validateBasicStructure(
    nodes: Node[],
    _edges: Edge[],
    errors: ValidationError[]
  ): void {
    // 检查是否有节点
    if (nodes.length === 0) {
      errors.push({
        type: 'error',
        code: 'NO_NODES',
        message: '工作流中没有任何节点'
      })
      return
    }

    // 检查是否有开始节点
    const startNodes = nodes.filter(n => n.type === 'start')
    if (startNodes.length === 0) {
      errors.push({
        type: 'error',
        code: 'NO_START_NODE',
        message: '工作流必须有一个开始节点'
      })
    } else if (startNodes.length > 1) {
      errors.push({
        type: 'error',
        code: 'MULTIPLE_START_NODES',
        message: '工作流只能有一个开始节点'
      })
    }

    // 检查是否有结束节点
    const endNodes = nodes.filter(n => n.type === 'end')
    if (endNodes.length === 0) {
      errors.push({
        type: 'error',
        code: 'NO_END_NODE',
        message: '工作流必须至少有一个结束节点'
      })
    }
  }

  /**
   * BPMN规范验证
   */
  private validateBPMNRules(
    nodes: Node[],
    edges: Edge[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    nodes.forEach(node => {
      const incomingEdges = edges.filter(e => e.target === node.id)
      const outgoingEdges = edges.filter(e => e.source === node.id)

      switch (node.type) {
        case 'start':
          // 开始节点不能有入边
          if (incomingEdges.length > 0) {
            errors.push({
              type: 'error',
              code: 'START_NODE_HAS_INCOMING',
              message: '开始节点不能有输入连接',
              nodeId: node.id
            })
          }
          // 开始节点必须有且只有一个出边
          if (outgoingEdges.length === 0) {
            errors.push({
              type: 'error',
              code: 'START_NODE_NO_OUTGOING',
              message: '开始节点必须有输出连接',
              nodeId: node.id
            })
          } else if (outgoingEdges.length > 1) {
            warnings.push({
              type: 'warning',
              code: 'START_NODE_MULTIPLE_OUTGOING',
              message: '开始节点有多个输出连接',
              nodeId: node.id
            })
          }
          break

        case 'end':
          // 结束节点必须有入边
          if (incomingEdges.length === 0) {
            errors.push({
              type: 'error',
              code: 'END_NODE_NO_INCOMING',
              message: '结束节点必须有输入连接',
              nodeId: node.id
            })
          }
          // 结束节点不能有出边
          if (outgoingEdges.length > 0) {
            errors.push({
              type: 'error',
              code: 'END_NODE_HAS_OUTGOING',
              message: '结束节点不能有输出连接',
              nodeId: node.id
            })
          }
          break

        case 'task':
          // 任务节点必须有入边和出边
          if (incomingEdges.length === 0) {
            warnings.push({
              type: 'warning',
              code: 'TASK_NO_INCOMING',
              message: '任务节点没有输入连接',
              nodeId: node.id
            })
          }
          if (outgoingEdges.length === 0) {
            warnings.push({
              type: 'warning',
              code: 'TASK_NO_OUTGOING',
              message: '任务节点没有输出连接',
              nodeId: node.id
            })
          }
          break

        case 'gateway':
          // 网关节点至少有一个入边和两个出边
          if (incomingEdges.length === 0) {
            warnings.push({
              type: 'warning',
              code: 'GATEWAY_NO_INCOMING',
              message: '决策节点没有输入连接',
              nodeId: node.id
            })
          }
          if (outgoingEdges.length < 2) {
            warnings.push({
              type: 'warning',
              code: 'GATEWAY_INSUFFICIENT_OUTGOING',
              message: '决策节点应至少有两个输出连接',
              nodeId: node.id
            })
          }
          break
      }
    })
  }

  /**
   * 连通性验证
   */
  private validateConnectivity(
    nodes: Node[],
    edges: Edge[],
    warnings: ValidationError[]
  ): void {
    // 检查孤立节点
    const connectedNodes = new Set<string>()
    edges.forEach(edge => {
      connectedNodes.add(edge.source)
      connectedNodes.add(edge.target)
    })

    nodes.forEach(node => {
      if (!connectedNodes.has(node.id) && node.type !== 'start') {
        warnings.push({
          type: 'warning',
          code: 'ISOLATED_NODE',
          message: '存在孤立的节点',
          nodeId: node.id
        })
      }
    })
  }

  /**
   * 循环检测（使用DFS）
   */
  private detectCycles(
    nodes: Node[],
    edges: Edge[],
    warnings: ValidationError[]
  ): void {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      const outgoingEdges = edges.filter(e => e.source === nodeId)
      for (const edge of outgoingEdges) {
        const targetId = edge.target

        if (!visited.has(targetId)) {
          if (hasCycle(targetId)) {
            return true
          }
        } else if (recursionStack.has(targetId)) {
          warnings.push({
            type: 'warning',
            code: 'CYCLE_DETECTED',
            message: '检测到循环路径',
            nodeId: targetId
          })
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    const startNodes = nodes.filter(n => n.type === 'start')
    startNodes.forEach(node => {
      if (!visited.has(node.id)) {
        hasCycle(node.id)
      }
    })
  }

  /**
   * 死锁检测
   */
  private detectDeadlocks(
    nodes: Node[],
    edges: Edge[],
    errors: ValidationError[]
  ): void {
    const startNodes = nodes.filter(n => n.type === 'start')
    const endNodes = nodes.filter(n => n.type === 'end')

    if (startNodes.length === 0 || endNodes.length === 0) {
      return
    }

    // 检查从开始节点是否能到达结束节点
    const firstStartNode = startNodes[0]
    if (!firstStartNode) return

    const reachableFromStart = this.getReachableNodes(firstStartNode.id, edges)
    const hasPathToEnd = endNodes.some(endNode => reachableFromStart.has(endNode.id))

    if (!hasPathToEnd) {
      errors.push({
        type: 'error',
        code: 'NO_PATH_TO_END',
        message: '从开始节点无法到达任何结束节点，可能存在死锁'
      })
    }
  }

  /**
   * 获取从指定节点可达的所有节点
   */
  private getReachableNodes(startNodeId: string, edges: Edge[]): Set<string> {
    const reachable = new Set<string>()
    const queue: string[] = [startNodeId]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (reachable.has(currentId)) {
        continue
      }

      reachable.add(currentId)
      const outgoingEdges = edges.filter(e => e.source === currentId)
      outgoingEdges.forEach(edge => {
        if (!reachable.has(edge.target)) {
          queue.push(edge.target)
        }
      })
    }

    return reachable
  }
}


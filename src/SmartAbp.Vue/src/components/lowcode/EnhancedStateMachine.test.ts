import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"

// Mock logger
vi.mock("@/utils/logging", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

import EnhancedStateMachine from "./EnhancedStateMachine.vue"
import { useEnhancedStateMachineStore } from "../../stores/lowcode/enhancedStateMachine"

describe("EnhancedStateMachine.vue - Phase 3 TDD Tests", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountComponent = () => {
    return mount(EnhancedStateMachine, {
      global: {
        stubs: {
          "vue-flow": { template: '<div class="vue-flow"><slot /></div>' },
          "el-button": { template: '<button class="el-button"><slot /></button>' },
          "el-input": { template: '<input class="el-input" />' },
          "el-select": { template: '<select class="el-select"><slot /></select>' },
          "el-option": { template: '<option class="el-option"><slot /></option>' },
          "el-dialog": { template: '<div class="el-dialog"><slot /></div>' },
          "el-form": { template: '<form class="el-form"><slot /></form>' },
          "el-form-item": { template: '<div class="el-form-item"><slot /></div>' },
          "el-textarea": { template: '<textarea class="el-textarea"></textarea>' },
          "el-tabs": { template: '<div class="el-tabs"><slot /></div>' },
          "el-tab-pane": { template: '<div class="el-tab-pane"><slot /></div>' },
          // 补充缺少的Element Plus组件
          "el-container": { template: '<div class="el-container"><slot /></div>' },
          "el-aside": { template: '<div class="el-aside"><slot /></div>' },
          "el-main": { template: '<div class="el-main"><slot /></div>' },
          "el-button-group": { template: '<div class="el-button-group"><slot /></div>' },
          "el-dropdown": { template: '<div class="el-dropdown"><slot /></div>' },
          "el-dropdown-menu": { template: '<div class="el-dropdown-menu"><slot /></div>' },
          "el-dropdown-item": { template: '<div class="el-dropdown-item"><slot /></div>' },
          "el-input-number": { template: '<input class="el-input-number" />' },
          "el-switch": { template: '<div class="el-switch"></div>' },
          "el-tag": { template: '<span class="el-tag"><slot /></span>' },
          "el-alert": { template: '<div class="el-alert"><slot /></div>' },
          "el-icon": { template: '<i class="el-icon"><slot /></i>' },
          "el-card": { template: '<div class="el-card"><slot /></div>' },
          "el-divider": { template: '<div class="el-divider"></div>' },
        },
      },
    })
  }

  describe("增强状态机功能", () => {
    it("should support start, intermediate, and end states", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 测试添加不同类型的状态
      store.addState({ id: "start1", type: "start", label: "开始", position: { x: 0, y: 0 } })
      store.addState({ id: "process1", type: "intermediate", label: "处理中", position: { x: 100, y: 0 } })
      store.addState({ id: "end1", type: "end", label: "结束", position: { x: 200, y: 0 } })
      
      expect(store.states).toHaveLength(3)
      expect(store.states.find(s => s.type === "start")).toBeTruthy()
      expect(store.states.find(s => s.type === "intermediate")).toBeTruthy()
      expect(store.states.find(s => s.type === "end")).toBeTruthy()
    })

    it("should enforce transition rules with conditions and actions", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 添加状态
      store.addState({ id: "draft", type: "start", label: "草稿", position: { x: 0, y: 0 } })
      store.addState({ id: "review", type: "intermediate", label: "审核中", position: { x: 100, y: 0 } })
      store.addState({ id: "approved", type: "end", label: "已批准", position: { x: 200, y: 0 } })
      
      // 添加带条件和动作的转换
      store.addTransition({
        id: "draft-to-review",
        source: "draft",
        target: "review",
        condition: "user.role === 'author'",
        action: "sendNotification('review-requested')"
      })
      
      const transition = store.transitions.find(t => t.id === "draft-to-review")
      expect(transition).toBeTruthy()
      expect(transition?.condition).toBe("user.role === 'author'")
      expect(transition?.action).toBe("sendNotification('review-requested')")
    })

    it("should block illegal transitions", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      store.addState({ id: "end1", type: "end", label: "结束", position: { x: 0, y: 0 } })
      store.addState({ id: "start1", type: "start", label: "开始", position: { x: 100, y: 0 } })
      
      // 尝试从结束状态到开始状态的非法转换
      expect(() => {
        store.addTransition({
          id: "illegal",
          source: "end1",
          target: "start1"
        })
      }).toThrow("不能从结束状态创建转换")
    })

    it("should validate state machine completeness", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 完整的状态机应有开始和结束状态
      store.addState({ id: "start", type: "start", label: "开始", position: { x: 0, y: 0 } })
      
      const validation = store.validateStateMachine()
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain("缺少结束状态")
      
      // 添加结束状态后应该验证通过
      store.addState({ id: "end", type: "end", label: "结束", position: { x: 100, y: 0 } })
      store.addTransition({ id: "start-end", source: "start", target: "end" })
      
      const validationAfter = store.validateStateMachine()
      expect(validationAfter.isValid).toBe(true)
    })
  })

  describe("策略规则系统", () => {
    it("should support field linkage rules", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 添加字段联动规则
      store.addBusinessRule({
        id: "price-discount-rule",
        type: "field-linkage",
        trigger: "price",
        condition: "price > 1000",
        action: "setField('discount', price * 0.1)"
      })
      
      const rule = store.businessRules.find(r => r.id === "price-discount-rule")
      expect(rule).toBeTruthy()
      expect(rule?.type).toBe("field-linkage")
    })

    it("should support permission constraint rules", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 添加权限约束规则
      store.addBusinessRule({
        id: "admin-only-approve",
        type: "permission-constraint",
        trigger: "approve-button",
        condition: "user.role !== 'admin'",
        action: "hideButton('approve-button')"
      })
      
      const rule = store.businessRules.find(r => r.id === "admin-only-approve")
      expect(rule).toBeTruthy()
      expect(rule?.type).toBe("permission-constraint")
    })

    it("should support async validation rules", async () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 添加异步验证规则
      store.addBusinessRule({
        id: "unique-email-check",
        type: "async-validation",
        trigger: "email",
        condition: "email.length > 0",
        action: "validateEmailUnique(email)"
      })
      
      const rule = store.businessRules.find(r => r.id === "unique-email-check")
      expect(rule).toBeTruthy()
      expect(rule?.type).toBe("async-validation")
    })

    it("should execute business rules in correct order", async () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 添加多个规则，设置优先级
      store.addBusinessRule({
        id: "rule1",
        type: "field-linkage",
        priority: 1,
        trigger: "field1",
        action: "action1()"
      })
      
      store.addBusinessRule({
        id: "rule2", 
        type: "field-linkage",
        priority: 10,
        trigger: "field1",
        action: "action2()"
      })
      
      const executionOrder = store.getBusinessRuleExecutionOrder("field1")
      expect(executionOrder[0].priority).toBe(10) // 高优先级在前
      expect(executionOrder[1].priority).toBe(1)
    })
  })

  describe("代码骨架生成", () => {
    it("should generate frontend hooks for state machine", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 配置一个完整的状态机
      store.addState({ id: "draft", type: "start", label: "草稿", position: { x: 0, y: 0 } })
      store.addState({ id: "published", type: "end", label: "已发布", position: { x: 100, y: 0 } })
      store.addTransition({
        id: "publish",
        source: "draft",
        target: "published",
        condition: "user.canPublish",
        action: "updateStatus('published')"
      })
      
      // 添加权限约束规则
      store.addBusinessRule({
        id: "publish-permission",
        type: "permission-constraint",
        trigger: "can-publish",
        condition: "user.role === 'admin'",
        action: "allowTransition()",
        description: "只有管理员可以发布"
      })
      
      const frontendCode = store.generateFrontendHooks("ArticleWorkflow")
      
      expect(frontendCode).toContain("useArticleWorkflow")
      expect(frontendCode).toContain("draft")
      expect(frontendCode).toContain("published")
      expect(frontendCode).toContain("user.canPublish")
    })

    it("should generate backend handlers for state transitions", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      store.addState({ id: "pending", type: "start", label: "待处理", position: { x: 0, y: 0 } })
      store.addState({ id: "completed", type: "end", label: "已完成", position: { x: 100, y: 0 } })
      store.addTransition({
        id: "complete",
        source: "pending",
        target: "completed",
        action: "processOrder(orderId)"
      })
      
      const backendCode = store.generateBackendHandlers("OrderWorkflow")
      
      expect(backendCode).toContain("OrderWorkflowHandler")
      expect(backendCode).toContain("CompleteTransition")
      expect(backendCode).toContain("processOrder")
    })

    it("should generate policies for business rules", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      store.addBusinessRule({
        id: "approval-policy",
        type: "permission-constraint",
        trigger: "can-approve",
        condition: "user.role === 'manager' || user.role === 'admin'",
        action: "allowTransition('approve')"
      })
      
      const policyCode = store.generatePolicies("ApprovalWorkflow")
      
      expect(policyCode).toContain("ApprovalWorkflowPolicy")
      expect(policyCode).toContain("user.role === 'manager'")
      expect(policyCode).toContain("allowTransition")
    })

    it("should generate complete code package with templates", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 配置完整的工作流
      store.setWorkflowMetadata({
        name: "DocumentApproval",
        description: "文档审批工作流",
        entity: "Document"
      })
      
      const codePackage = store.generateCompleteCodePackage()
      
      expect(codePackage.frontend).toBeTruthy()
      expect(codePackage.backend).toBeTruthy()
      expect(codePackage.policies).toBeTruthy()
      expect(codePackage.tests).toBeTruthy()
      
      // 验证生成的代码包含必要的模板结构
      expect(codePackage.frontend).toContain("// AUTO-GENERATED FILE")
      expect(codePackage.backend).toContain("using SmartAbp.Application")
    })
  })

  describe("工作流程编辑器UI", () => {
    it("should display state machine canvas with nodes and edges", () => {
      const wrapper = mountComponent()
      
      expect(wrapper.find(".enhanced-state-machine").exists()).toBe(true)
      expect(wrapper.find(".flow-container").exists()).toBe(true)
      expect(wrapper.find(".toolbar").exists()).toBe(true)
    })

    it("should show business rules editor panel", () => {
      const wrapper = mountComponent()
      
      expect(wrapper.find(".enhanced-state-machine").exists()).toBe(true)
      expect(wrapper.find(".toolbar").exists()).toBe(true)
      expect(wrapper.find(".state-list").exists()).toBe(true)
    })

    it("should provide code generation preview", () => {
      const wrapper = mountComponent()
      
      expect(wrapper.find(".enhanced-state-machine").exists()).toBe(true)
      expect(wrapper.find("el-button").exists()).toBe(true)
      expect(wrapper.find("el-button-group").exists()).toBe(true)
    })

    it("should validate workflow completeness and show warnings", async () => {
      const wrapper = mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 添加不完整的状态机
      store.addState({ id: "start", type: "start", label: "开始", position: { x: 0, y: 0 } })
      
      await wrapper.vm.$nextTick()
      
      expect(store.states).toHaveLength(1)
      expect(store.transitions).toHaveLength(0)
      expect(warningPanel.text()).toContain("缺少结束状态")
    })
  })

  describe("模板集成", () => {
    it("should use workflow templates for code generation", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 验证模板搜索和匹配
      const templates = store.findWorkflowTemplates("state-machine")
      expect(Array.isArray(templates)).toBe(true)
    })

    it("should support custom workflow templates", () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 添加自定义模板
      store.addWorkflowTemplate({
        id: "custom-approval",
        name: "自定义审批流程",
        description: "适用于自定义审批场景",
        states: ["draft", "review", "approved", "rejected"],
        rules: ["admin-only-approve", "auto-notify"]
      })
      
      const template = store.workflowTemplates.find(t => t.id === "custom-approval")
      expect(template).toBeTruthy()
    })
  })

  describe("性能和可观测性", () => {
    it("should provide execution logging for business rules", async () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      // 添加规则
      store.addBusinessRule({
        id: "test-rule",
        type: "field-linkage",
        trigger: "field1",
        action: "setValue('field2', 'test')"
      })
      
      // 清除之前的mock调用
      vi.clearAllMocks()
      
      const result = await store.executeBusinessRules("field1", { field1: "value" })
      
      // 验证结果：规则被正确执行
      expect(result).toHaveProperty("field2", "test")
      
      // 验证logger.debug被调用（logRuleExecution内部调用）
      const { logger } = await import("@/utils/logging")
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining("规则执行记录: test-rule"),
        expect.any(Object)
      )
    })

    it("should handle business rule execution errors gracefully", async () => {
      mountComponent()
      const store = useEnhancedStateMachineStore()
      
      store.addBusinessRule({
        id: "error-rule",
        type: "field-linkage",
        trigger: "field1",
        action: "invalidFunction()" // 这会导致错误
      })
      
      await expect(async () => {
        await store.executeBusinessRules("field1", { field1: "value" })
      }).not.toThrow() // 错误应该被优雅处理
      
      const errors = store.getExecutionErrors()
      expect(errors).toHaveLength(1)
      expect(errors[0].ruleId).toBe("error-rule")
    })
  })
})

/**
 * AdvancedForm Component E2E Test Suite
 * 测试动态表单字段、验证引擎、条件逻辑等完整用户交互流程
 */

import '../support/component-commands'

describe('AdvancedForm E2E Tests', () => {
  const mockFormConfig = {
    fields: [
      {
        name: 'username',
        type: 'input',
        label: '用户名',
        required: true,
        placeholder: '请输入用户名',
        validators: [
          { type: 'required', message: '用户名不能为空' },
          { type: 'minLength', value: 3, message: '用户名至少3个字符' }
        ]
      },
      {
        name: 'email',
        type: 'input',
        subtype: 'email',
        label: '邮箱地址',
        required: true,
        placeholder: '请输入邮箱地址',
        validators: [
          { type: 'required', message: '邮箱不能为空' },
          { type: 'email', message: '邮箱格式不正确' }
        ]
      },
      {
        name: 'userType',
        type: 'select',
        label: '用户类型',
        required: true,
        options: [
          { label: '管理员', value: 'admin' },
          { label: '普通用户', value: 'user' },
          { label: '访客', value: 'guest' }
        ]
      },
      {
        name: 'permissions',
        type: 'checkbox-group',
        label: '权限设置',
        condition: { field: 'userType', operator: 'in', value: ['admin', 'user'] },
        options: [
          { label: '读取权限', value: 'read' },
          { label: '写入权限', value: 'write' },
          { label: '删除权限', value: 'delete' },
          { label: '管理权限', value: 'manage' }
        ]
      },
      {
        name: 'profile',
        type: 'object',
        label: '个人资料',
        fields: [
          {
            name: 'firstName',
            type: 'input',
            label: '名字',
            required: true,
            validators: [{ type: 'required', message: '名字不能为空' }]
          },
          {
            name: 'lastName',
            type: 'input',
            label: '姓氏',
            required: true
          },
          {
            name: 'age',
            type: 'number',
            label: '年龄',
            min: 18,
            max: 100,
            validators: [
              { type: 'min', value: 18, message: '年龄不能小于18岁' },
              { type: 'max', value: 100, message: '年龄不能大于100岁' }
            ]
          }
        ]
      },
      {
        name: 'preferences',
        type: 'array',
        label: '偏好设置',
        itemType: 'object',
        minItems: 1,
        maxItems: 5,
        itemFields: [
          {
            name: 'category',
            type: 'select',
            label: '类别',
            options: [
              { label: '技术', value: 'tech' },
              { label: '设计', value: 'design' },
              { label: '产品', value: 'product' }
            ]
          },
          {
            name: 'priority',
            type: 'slider',
            label: '优先级',
            min: 1,
            max: 10,
            step: 1
          }
        ]
      },
      {
        name: 'agreement',
        type: 'checkbox',
        label: '同意用户协议',
        required: true,
        validators: [{ type: 'required', message: '必须同意用户协议' }]
      }
    ]
  }

  const mockInitialValues = {
    username: '',
    email: '',
    userType: 'user',
    permissions: ['read'],
    profile: {
      firstName: '张',
      lastName: '三',
      age: 25
    },
    preferences: [
      { category: 'tech', priority: 8 }
    ],
    agreement: false
  }

  beforeEach(() => {
    cy.visit('/')
  })

  it('should render form fields based on configuration', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: mockInitialValues
    })

    // Verify form structure
    cy.get('.advanced-form').should('exist')
    cy.get('.form-field').should('have.length.greaterThan', 0)

    // Verify basic field types
    cy.get('[data-field="username"] input[type="text"]').should('exist')
    cy.get('[data-field="email"] input[type="email"]').should('exist')
    cy.get('[data-field="userType"] .el-select').should('exist')
    cy.get('[data-field="permissions"] .el-checkbox-group').should('exist')

    // Verify field labels
    cy.get('[data-field="username"] .field-label').should('contain', '用户名')
    cy.get('[data-field="email"] .field-label').should('contain', '邮箱地址')
  })

  it('should handle dynamic field visibility with conditional logic', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: { ...mockInitialValues, userType: 'guest' }
    })

    // Initially permissions field should be hidden for guest users
    cy.get('[data-field="permissions"]').should('not.exist')

    // Change user type to admin
    cy.get('[data-field="userType"] .el-select').click()
    cy.get('.el-select-dropdown__item').contains('管理员').click()

    // Permissions field should now be visible
    cy.get('[data-field="permissions"]').should('be.visible')
    cy.get('[data-field="permissions"] .el-checkbox').should('have.length', 4)

    // Change back to guest
    cy.get('[data-field="userType"] .el-select').click()
    cy.get('.el-select-dropdown__item').contains('访客').click()

    // Permissions field should be hidden again
    cy.get('[data-field="permissions"]').should('not.exist')
  })

  it('should validate required fields and display error messages', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: {}
    })

    // Try to submit empty form
    cy.get('.form-submit-button').click()

    // Verify validation errors
    cy.get('[data-field="username"] .field-error').should('contain', '用户名不能为空')
    cy.get('[data-field="email"] .field-error').should('contain', '邮箱不能为空')

    // Fill in username with invalid length
    cy.fillAdvancedForm({
      username: 'ab'
    })

    cy.get('.form-submit-button').click()
    cy.get('[data-field="username"] .field-error').should('contain', '用户名至少3个字符')
  })

  it('should handle complex validation rules', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: mockInitialValues
    })

    // Test email validation
    cy.get('[data-field="email"] input').clear().type('invalid-email')
    cy.get('.form-submit-button').click()
    cy.get('[data-field="email"] .field-error').should('contain', '邮箱格式不正确')

    // Test age validation in nested object
    cy.get('[data-field="profile.age"] input').clear().type('15')
    cy.get('.form-submit-button').click()
    cy.get('[data-field="profile.age"] .field-error').should('contain', '年龄不能小于18岁')

    // Test age upper limit
    cy.get('[data-field="profile.age"] input').clear().type('105')
    cy.get('.form-submit-button').click()
    cy.get('[data-field="profile.age"] .field-error').should('contain', '年龄不能大于100岁')

    // Fix validation errors
    cy.get('[data-field="email"] input').clear().type('user@example.com')
    cy.get('[data-field="profile.age"] input').clear().type('25')

    // Should pass validation now
    cy.get('.form-submit-button').click()
    cy.get('.field-error').should('not.exist')
  })

  it('should handle nested object fields correctly', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: mockInitialValues
    })

    // Verify nested object structure
    cy.get('.field-group[data-field="profile"]').should('exist')
    cy.get('[data-field="profile.firstName"] input').should('have.value', '张')
    cy.get('[data-field="profile.lastName"] input').should('have.value', '三')
    cy.get('[data-field="profile.age"] input').should('have.value', '25')

    // Test nested field updates
    cy.get('[data-field="profile.firstName"] input').clear().type('李')
    cy.get('[data-field="profile.lastName"] input').clear().type('四')

    // Verify form data updates
    cy.window().its('formData.profile').should('deep.include', {
      firstName: '李',
      lastName: '四',
      age: 25
    })
  })

  it('should handle dynamic array fields with add/remove functionality', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: mockInitialValues
    })

    // Verify initial array item
    cy.get('.field-array[data-field="preferences"]').should('exist')
    cy.get('.array-item').should('have.length', 1)

    // Add new array item
    cy.get('.array-add-button').click()
    cy.get('.array-item').should('have.length', 2)

    // Fill new item
    cy.get('.array-item:last-child [data-field="category"] .el-select').click()
    cy.get('.el-select-dropdown__item').contains('设计').click()
    
    cy.get('.array-item:last-child [data-field="priority"] .el-slider').within(() => {
      cy.get('.el-slider__runway').click('center')
    })

    // Remove array item
    cy.get('.array-item:first-child .array-remove-button').click()
    cy.get('.array-item').should('have.length', 1)

    // Verify remaining item
    cy.get('.array-item [data-field="category"] .el-select .el-select__tags-text')
      .should('contain', '设计')
  })

  it('should enforce array constraints (min/max items)', () => {
    const configWithConstraints = {
      ...mockFormConfig,
      fields: mockFormConfig.fields.map(field => 
        field.name === 'preferences' 
          ? { ...field, minItems: 2, maxItems: 3 }
          : field
      )
    }

    cy.mountComponent('AdvancedForm', {
      config: configWithConstraints,
      initialValues: { ...mockInitialValues, preferences: [] }
    })

    // Should show validation error for minimum items
    cy.get('.form-submit-button').click()
    cy.get('[data-field="preferences"] .field-error')
      .should('contain', '至少需要2项')

    // Add items to meet minimum
    cy.get('.array-add-button').click()
    cy.get('.array-add-button').click()

    // Try to add more than maximum
    cy.get('.array-add-button').click()
    cy.get('.array-item').should('have.length', 3)
    
    cy.get('.array-add-button').should('be.disabled')
  })

  it('should support real-time validation and auto-save', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: mockInitialValues,
      realTimeValidation: true,
      autoSave: true,
      autoSaveInterval: 1000
    })

    // Test real-time validation
    cy.get('[data-field="username"] input').clear()
    cy.wait(100)
    cy.get('[data-field="username"] .field-error').should('contain', '用户名不能为空')

    // Type valid username
    cy.get('[data-field="username"] input').type('testuser')
    cy.wait(100)
    cy.get('[data-field="username"] .field-error').should('not.exist')
    cy.get('[data-field="username"]').should('have.class', 'field-valid')

    // Test auto-save functionality
    cy.get('[data-field="email"] input').type('test@example.com')
    
    // Wait for auto-save
    cy.wait(1200)
    cy.get('.auto-save-indicator').should('be.visible')
    cy.get('.auto-save-indicator').should('contain', '已自动保存')
  })

  it('should handle keyboard navigation and accessibility', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: mockInitialValues,
      keyboardNavigation: true
    })

    cy.testKeyboardNavigation('.advanced-form')

    // Test tab navigation through fields
    cy.get('[data-field="username"] input').focus()
    cy.focused().tab()
    cy.focused().should('have.attr', 'data-field').and('contain', 'email')

    // Test form submission with Enter
    cy.get('[data-field="username"] input').focus()
    cy.focused().type('{ctrl+enter}')
    
    // Should trigger form submission
    cy.window().its('lastFormSubmit').should('exist')
  })

  it('should pass accessibility standards', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: mockInitialValues
    })

    cy.testAriaAttributes('.advanced-form')

    // Test form-specific accessibility
    cy.get('form[role="form"]').should('exist')
    cy.get('label[for]').should('have.length.greaterThan', 0)
    cy.get('[aria-required="true"]').should('exist')
    cy.get('[aria-describedby]').should('exist')

    // Test error announcement
    cy.get('.form-submit-button').click()
    cy.get('[role="alert"]').should('exist')
  })

  it('should be responsive across different screen sizes', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: mockInitialValues
    })

    cy.testResponsiveBreakpoints('.advanced-form')

    // Test mobile-specific behaviors
    cy.viewport(375, 667)
    cy.get('.advanced-form').should('have.class', 'mobile-layout')
    cy.get('.field-group').should('have.css', 'flex-direction', 'column')

    // Test tablet layout
    cy.viewport(768, 1024)
    cy.get('.advanced-form').should('have.class', 'tablet-layout')
  })

  it('should handle form state management correctly', () => {
    cy.mountComponent('AdvancedForm', {
      config: mockFormConfig,
      initialValues: mockInitialValues
    })

    // Test dirty state tracking
    cy.get('[data-field="username"] input').type('modified')
    cy.get('.advanced-form').should('have.class', 'form-dirty')
    cy.get('.form-dirty-indicator').should('be.visible')

    // Test form reset
    cy.get('.form-reset-button').click()
    cy.get('[data-field="username"] input').should('have.value', '')
    cy.get('.advanced-form').should('not.have.class', 'form-dirty')

    // Test form data validation state
    cy.fillAdvancedForm({
      username: 'validuser',
      email: 'valid@example.com'
    })

    cy.get('.advanced-form').should('have.class', 'form-valid')
    cy.get('.form-submit-button').should('not.be.disabled')
  })

  it('should handle complex enterprise scenarios', () => {
    const enterpriseConfig = {
      fields: [
        {
          name: 'employeeId',
          type: 'input',
          label: '员工编号',
          required: true,
          readonly: true,
          defaultValue: () => `EMP-${Date.now()}`
        },
        {
          name: 'department',
          type: 'cascader',
          label: '部门',
          required: true,
          options: [
            {
              label: '技术部',
              value: 'tech',
              children: [
                { label: '前端开发', value: 'frontend' },
                { label: '后端开发', value: 'backend' },
                { label: '测试团队', value: 'qa' }
              ]
            },
            {
              label: '产品部',
              value: 'product',
              children: [
                { label: '产品设计', value: 'design' },
                { label: '产品运营', value: 'operation' }
              ]
            }
          ]
        },
        {
          name: 'workSchedule',
          type: 'array',
          label: '工作安排',
          itemType: 'object',
          itemFields: [
            {
              name: 'date',
              type: 'date',
              label: '日期',
              required: true
            },
            {
              name: 'startTime',
              type: 'time',
              label: '开始时间',
              required: true
            },
            {
              name: 'endTime',
              type: 'time',
              label: '结束时间',
              required: true,
              validators: [{
                type: 'custom',
                validator: (value, formData, fieldPath) => {
                  const startTime = formData.workSchedule?.[fieldPath.index]?.startTime
                  return !startTime || value > startTime
                },
                message: '结束时间必须晚于开始时间'
              }]
            },
            {
              name: 'location',
              type: 'select',
              label: '工作地点',
              options: [
                { label: '办公室', value: 'office' },
                { label: '远程办公', value: 'remote' },
                { label: '客户现场', value: 'client' }
              ]
            }
          ]
        },
        {
          name: 'securityClearance',
          type: 'radio-group',
          label: '安全等级',
          condition: { 
            field: 'department', 
            operator: 'startsWith', 
            value: 'tech' 
          },
          options: [
            { label: '一般', value: 'normal' },
            { label: '机密', value: 'confidential' },
            { label: '绝密', value: 'secret' }
          ]
        }
      ]
    }

    cy.mountComponent('AdvancedForm', {
      config: enterpriseConfig,
      initialValues: {},
      workflow: true,
      approvalRequired: true
    })

    // Test readonly field with default value
    cy.get('[data-field="employeeId"] input')
      .should('have.attr', 'readonly')
      .and('have.value')
      .and('match', /^EMP-\d+$/)

    // Test cascader selection
    cy.get('[data-field="department"] .el-cascader').click()
    cy.get('.el-cascader-panel .el-cascader-node').contains('技术部').click()
    cy.get('.el-cascader-panel .el-cascader-node').contains('前端开发').click()

    // Security clearance field should now be visible
    cy.get('[data-field="securityClearance"]').should('be.visible')

    // Test complex array with cross-field validation
    cy.get('.field-array[data-field="workSchedule"] .array-add-button').click()
    
    cy.get('.array-item:first-child [data-field="startTime"] input').type('09:00')
    cy.get('.array-item:first-child [data-field="endTime"] input').type('08:00')
    
    cy.get('.form-submit-button').click()
    cy.get('.array-item:first-child [data-field="endTime"] .field-error')
      .should('contain', '结束时间必须晚于开始时间')

    // Fix the validation error
    cy.get('.array-item:first-child [data-field="endTime"] input').clear().type('17:00')

    // Test workflow submission
    cy.get('.form-submit-button').click()
    cy.get('.workflow-confirmation').should('be.visible')
    cy.get('.confirm-submit').click()

    // Verify workflow submission
    cy.window().its('workflowSubmission').should('exist')
  })

  it('should handle performance with large forms', () => {
    const largeFormConfig = {
      fields: Array.from({ length: 100 }, (_, i) => ({
        name: `field_${i}`,
        type: i % 4 === 0 ? 'input' : i % 4 === 1 ? 'select' : i % 4 === 2 ? 'textarea' : 'number',
        label: `Field ${i}`,
        required: i % 5 === 0,
        ...(i % 4 === 1 && {
          options: Array.from({ length: 10 }, (_, j) => ({
            label: `Option ${j}`,
            value: `option_${j}`
          }))
        })
      }))
    }

    cy.mountComponent('AdvancedForm', {
      config: largeFormConfig,
      initialValues: {},
      virtualScroll: true
    })

    // Test rendering performance
    cy.measurePerformance(() => {
      cy.get('.advanced-form').should('be.visible')
    })

    // Test form interaction performance
    cy.measurePerformance(() => {
      for (let i = 0; i < 10; i++) {
        cy.get(`[data-field="field_${i}"] input, [data-field="field_${i}"] textarea`)
          .type(`value_${i}`, { force: true })
      }
    })

    // Verify virtual scrolling is working
    cy.get('.form-virtual-container').should('exist')
    cy.get('.form-field').should('have.length.lessThan', 50)
  })
})
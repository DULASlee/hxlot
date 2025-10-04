/**
 * API Mock响应数据
 * 
 * 用于测试和开发环境的Mock数据
 * 符合后端ABP Framework的DTO结构规范
 */

import type { 
  ModuleMetadata
} from '../../types'
import type { Template } from '../../types/index'

/**
 * Mock: generateModule API响应
 */
export const mockGenerateModuleResponse: any = {
  success: true,
  generatedFiles: [
    {
      path: 'src/SmartAbp.Application/Users/UserAppService.cs',
      content: `using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace SmartAbp.Users
{
    public class UserAppService : ApplicationService, IUserAppService
    {
        public async Task<UserDto> GetAsync(Guid id)
        {
            // Implementation
            return new UserDto();
        }
    }
}`
    },
    {
      path: 'src/SmartAbp.Application.Contracts/Users/UserDto.cs',
      content: `using System;

namespace SmartAbp.Users
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
    }
}`
    },
    {
      path: 'src/SmartAbp.Vue/src/views/users/UserManagement.vue',
      content: `<template>
  <div class="user-management">
    <el-table :data="users">
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const users = ref([])
</script>`
    }
  ],
  metadata: {
    timestamp: new Date().toISOString(),
    totalFiles: 3,
    templateUsed: 'crud-basic',
    generationTime: 1250 // 毫秒
  }
}

/**
 * Mock: getTemplates API响应
 */
export const mockTemplatesResponse: Template[] = [
  {
    id: 'crud-basic',
    name: 'CRUD基础模板',
    description: '标准的增删改查模板，适用于简单的实体管理',
    category: 'basic',
    content: 'template content here',
    language: 'csharp',
    target: 'entity',
    version: '1.0.0',
    author: 'SmartAbp',
    features: ['create', 'read', 'update', 'delete'],
    requiredFields: ['Id', 'Name'],
    optionalFields: ['Description', 'CreationTime'],
    supportedDatabases: ['SqlServer', 'PostgreSQL', 'MySQL', 'SQLite']
  },
  {
    id: 'crud-advanced',
    name: 'CRUD高级模板',
    description: '企业级CRUD模板，包含高级功能如导出、批量操作、审计日志',
    category: 'advanced',
    content: 'advanced template content here',
    language: 'csharp',
    target: 'service',
    version: '2.0.0',
    author: 'SmartAbp',
    features: [
      'create', 'read', 'update', 'delete',
      'export', 'import', 'batch-delete',
      'audit-log', 'soft-delete', 'multi-tenancy'
    ],
    requiredFields: ['Id', 'Name'],
    optionalFields: ['Description', 'CreationTime', 'LastModificationTime', 'IsDeleted'],
    supportedDatabases: ['SqlServer', 'PostgreSQL', 'MySQL']
  },
  {
    id: 'master-detail',
    name: '主从表模板',
    description: '一对多关系的主从表模板，如订单-订单明细',
    category: 'relationship',
    content: 'master detail template content here',
    language: 'vue',
    target: 'vue-component',
    version: '1.5.0',
    author: 'SmartAbp',
    features: ['master-detail', 'cascading-delete', 'aggregate-root'],
    requiredFields: ['MasterId', 'DetailList'],
    optionalFields: ['TotalAmount', 'ItemCount'],
    supportedDatabases: ['SqlServer', 'PostgreSQL']
  },
  {
    id: 'tree-structure',
    name: '树形结构模板',
    description: '组织架构、分类等树形结构模板',
    category: 'hierarchy',
    content: 'tree structure template content here',
    language: 'typescript',
    target: 'controller',
    version: '1.2.0',
    author: 'SmartAbp',
    features: ['tree-structure', 'recursive-query', 'parent-child'],
    requiredFields: ['Id', 'ParentId', 'Name'],
    optionalFields: ['Level', 'Path', 'Children'],
    supportedDatabases: ['SqlServer', 'PostgreSQL', 'MySQL']
  }
]

/**
 * Mock: getUiConfig API响应
 */
export const mockUiConfigResponse = {
  formLayout: 'horizontal' as const,
  labelWidth: '120px',
  fields: [
    {
      name: 'userName',
      label: '用户名',
      componentType: 'input' as const,
      placeholder: '请输入用户名',
      validation: ['required', 'min:3', 'max:50'],
      props: {
        clearable: true,
        maxlength: 50
      }
    },
    {
      name: 'email',
      label: '邮箱',
      componentType: 'input' as const,
      placeholder: '请输入邮箱地址',
      validation: ['required', 'email'],
      props: {
        type: 'email',
        clearable: true
      }
    },
    {
      name: 'phoneNumber',
      label: '手机号',
      componentType: 'input' as const,
      placeholder: '请输入手机号',
      validation: ['phone'],
      props: {
        clearable: true,
        maxlength: 11
      }
    },
    {
      name: 'roleId',
      label: '角色',
      componentType: 'select' as const,
      placeholder: '请选择角色',
      validation: ['required'],
      props: {
        clearable: true,
        options: [
          { label: '管理员', value: 'admin' },
          { label: '普通用户', value: 'user' },
          { label: '访客', value: 'guest' }
        ]
      }
    },
    {
      name: 'isActive',
      label: '激活状态',
      componentType: 'switch' as const,
      validation: [],
      props: {
        activeText: '启用',
        inactiveText: '禁用'
      }
    },
    {
      name: 'birthDate',
      label: '出生日期',
      componentType: 'date-picker' as const,
      placeholder: '请选择日期',
      validation: [],
      props: {
        type: 'date',
        format: 'YYYY-MM-DD'
      }
    }
  ],
  tableColumns: [
    { prop: 'userName', label: '用户名', width: 150, sortable: true },
    { prop: 'email', label: '邮箱', width: 200 },
    { prop: 'phoneNumber', label: '手机号', width: 130 },
    { prop: 'roleName', label: '角色', width: 100 },
    { prop: 'isActive', label: '状态', width: 80, type: 'tag' as const },
    { prop: 'creationTime', label: '创建时间', width: 180, type: 'datetime' as const }
  ],
  actions: {
    create: true,
    update: true,
    delete: true,
    export: true,
    import: false,
    batchDelete: true
  },
  pagination: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100]
  }
}

/**
 * Mock: introspectDatabase API响应
 */
export const mockIntrospectDatabaseResponse = {
  success: true,
  connectionInfo: {
    provider: 'PostgreSQL',
    serverVersion: '15.3',
    databaseName: 'SmartAbp',
    schemaCount: 2,
    tableCount: 25
  },
  tables: [
    {
      name: 'Users',
      schema: 'public',
      comment: '系统用户表',
      rowCount: 1250,
      columns: [
        {
          name: 'Id',
          type: 'uuid',
          isPrimaryKey: true,
          isNullable: false,
          defaultValue: 'gen_random_uuid()',
          comment: '用户ID'
        },
        {
          name: 'UserName',
          type: 'varchar',
          maxLength: 256,
          isNullable: false,
          isUnique: true,
          comment: '用户名'
        },
        {
          name: 'Email',
          type: 'varchar',
          maxLength: 256,
          isNullable: true,
          comment: '邮箱地址'
        },
        {
          name: 'PhoneNumber',
          type: 'varchar',
          maxLength: 20,
          isNullable: true,
          comment: '手机号'
        },
        {
          name: 'IsActive',
          type: 'boolean',
          isNullable: false,
          defaultValue: 'true',
          comment: '是否激活'
        },
        {
          name: 'CreationTime',
          type: 'timestamp',
          isNullable: false,
          defaultValue: 'now()',
          comment: '创建时间'
        }
      ],
      relationships: [
        {
          type: 'OneToMany',
          targetTable: 'UserRoles',
          foreignKey: 'UserId',
          cascadeDelete: true
        },
        {
          type: 'OneToMany',
          targetTable: 'UserClaims',
          foreignKey: 'UserId',
          cascadeDelete: true
        }
      ],
      indexes: [
        { name: 'IX_Users_UserName', columns: ['UserName'], isUnique: true },
        { name: 'IX_Users_Email', columns: ['Email'], isUnique: false }
      ]
    },
    {
      name: 'Roles',
      schema: 'public',
      comment: '系统角色表',
      rowCount: 15,
      columns: [
        { name: 'Id', type: 'uuid', isPrimaryKey: true, isNullable: false, isRequired: true, description: 'ID' },
        { name: 'Name', type: 'varchar', maxLength: 256, isNullable: false, isUnique: true, isRequired: true, description: '角色名称' },
        { name: 'DisplayName', type: 'varchar', maxLength: 256, isNullable: true, isRequired: false, description: '显示名称' },
        { name: 'IsDefault', type: 'boolean', isNullable: false, defaultValue: 'false' }
      ],
      relationships: [
        { type: 'OneToMany', targetTable: 'UserRoles', foreignKey: 'RoleId' }
      ],
      indexes: [
        { name: 'IX_Roles_Name', columns: ['Name'], isUnique: true }
      ]
    }
  ],
  views: [
    {
      name: 'vw_UserRoleSummary',
      schema: 'public',
      definition: 'SELECT u.UserName, r.Name as RoleName FROM Users u JOIN UserRoles ur ON u.Id = ur.UserId JOIN Roles r ON ur.RoleId = r.Id'
    }
  ],
  procedures: [
    {
      name: 'sp_GetActiveUsers',
      schema: 'public',
      parameters: [
        { name: 'startDate', type: 'timestamp', mode: 'IN' },
        { name: 'endDate', type: 'timestamp', mode: 'IN' }
      ]
    }
  ]
}

/**
 * Mock: getGenerationStatus API响应
 */
export const mockGenerationStatusResponse = {
  sessionId: 'session-uuid-12345',
  status: 'InProgress' as const,
  progress: 65,
  currentStep: '正在生成前端Vue组件',
  totalSteps: 10,
  completedSteps: 6,
  estimatedTimeRemaining: 15000,
  startTime: new Date(Date.now() - 30000).toISOString(),
  generatedFiles: [
    { path: 'UserDto.cs', status: 'Completed', size: 1024 },
    { path: 'IUserAppService.cs', status: 'Completed', size: 512 },
    { path: 'UserAppService.cs', status: 'Completed', size: 2048 },
    { path: 'UserController.cs', status: 'Completed', size: 1536 },
    { path: 'UserPermissions.cs', status: 'Completed', size: 768 },
    { path: 'UserManagement.vue', status: 'InProgress', size: 0 },
    { path: 'user-api.ts', status: 'Pending', size: 0 },
    { path: 'user-types.ts', status: 'Pending', size: 0 }
  ],
  errors: [],
  warnings: [
    { message: 'Email字段未设置验证规则，建议添加邮箱格式验证', severity: 'Low' }
  ]
}

/**
 * Mock: validateModule API响应
 */
export const mockValidateModuleResponse = {
  isValid: true,
  errors: [],
  suggestions: [
    {
      type: 'Naming' as const,
      message: '建议为Email字段添加[EmailAddress]验证特性',
      autoFixAvailable: false
    },
    {
      type: 'Performance' as const,
      message: '建议为UserName字段添加索引以提升查询性能',
      autoFixAvailable: true
    },
    {
      type: 'Structure' as const,
      message: '建议添加软删除功能（ISoftDelete接口）',
      autoFixAvailable: true
    }
  ]
}

/**
 * Mock: validateModule API响应（有错误）
 */
export const mockValidateModuleResponseWithErrors = {
  isValid: false,
  errors: [
    {
      field: 'moduleName',
      message: '模块名称不能包含特殊字符',
      severity: 'Error' as const
    },
    {
      field: 'entities[0].name',
      message: '实体名称必须以大写字母开头（PascalCase）',
      severity: 'Error' as const
    },
    {
      field: 'entities[0].properties[2].name',
      message: '属性名称应使用camelCase命名规范',
      severity: 'Warning' as const
    }
  ],
  suggestions: []
}

/**
 * Mock: registerModule API响应
 */
export const mockRegisterModuleResponse: ModuleMetadata = {
  systemName: 'ProductManagement',
  name: 'ProductManagement',
  displayName: '产品管理',
  description: '产品管理模块，支持产品的增删改查和库存管理',
  version: '1.0.0',
  architecturePattern: 'Crud',
  featureManagement: {
    isEnabled: true
  },
  databaseInfo: {
    connectionStringName: 'Default',
    provider: 'SqlServer'
  },
  permissionConfig: {
    customActions: []
  },
  entities: [
    {
      name: 'Product',
      module: 'ProductManagement',
      aggregate: 'Product',
      description: '产品实体',
      isAggregateRoot: true,
      isMultiTenant: false,
      isSoftDelete: true,
      hasExtraProperties: false,
      properties: [
        { name: 'Id', type: 'Guid', isRequired: true, description: '主键ID' },
        { name: 'Name', type: 'string', maxLength: 200, isRequired: true, description: '产品名称' },
        { name: 'Description', type: 'string', maxLength: 1000, isRequired: false, description: '产品描述' },
        { name: 'Price', type: 'decimal', isRequired: true, description: '产品价格' },
        { name: 'Stock', type: 'int', defaultValue: '0', isRequired: false, description: '库存' },
        { name: 'IsActive', type: 'bool', defaultValue: 'true', isRequired: false, description: '是否激活' }
      ]
    }
  ]
}

/**
 * Mock: 测试数据库连接响应（成功）
 * 🔥 修复：添加真实表名列表
 */
export const mockTestConnectionSuccessResponse = {
  success: true,
  message: '数据库连接成功',
  serverVersion: 'SQL Server 2019',
  databaseName: 'SmartAbp',
  schemaCount: 1,
  tableCount: 39,
  // 🔥 关键修复：返回真实的表名列表
  tables: [
    'Users', 'Roles', 'UserRoles', 'Permissions', 'RolePermissions',
    'Organizations', 'OrganizationUnits', 'Tenants', 'TenantConnections',
    'AuditLogs', 'EntityChanges', 'EntityPropertyChanges',
    'Projects', 'ProjectMembers', 'ProjectTasks', 'TaskAssignments',
    'Departments', 'Employees', 'EmployeeAttendance',
    'Products', 'Categories', 'Suppliers', 'Warehouses', 'Inventory',
    'Orders', 'OrderDetails', 'Customers', 'CustomerAddresses',
    'Invoices', 'InvoiceItems', 'Payments', 'PaymentMethods',
    'Settings', 'ConfigItems', 'Notifications', 'NotificationSubscriptions',
    'Files', 'FileStorages', 'BackgroundJobs'
  ]
}

/**
 * Mock: 测试数据库连接响应（失败）
 */
export const mockTestConnectionFailureResponse = {
  success: false,
  message: '数据库连接失败：密码错误',
  errorCode: 'INVALID_CREDENTIALS',
  details: 'password authentication failed for user "postgres"'
}

/**
 * Mock: HTTP错误响应
 */
export const mockError400Response = {
  status: 400,
  data: {
    error: {
      code: 'VALIDATION_ERROR',
      message: '请求参数验证失败',
      validationErrors: [
        { field: 'moduleName', message: 'Module name is required' },
        { field: 'entityName', message: 'Entity name is required' }
      ]
    }
  }
}

export const mockError401Response = {
  status: 401,
  data: {
    error: {
      code: 'UNAUTHORIZED',
      message: '您没有权限访问此资源，请先登录'
    }
  }
}

export const mockError500Response = {
  status: 500,
  data: {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误，请稍后重试',
      details: 'Roslyn compilation failed: Missing reference System.Core'
    }
  }
}

export const mockTimeoutError = {
  code: 'ECONNABORTED',
  message: 'timeout of 10000ms exceeded',
  config: {
    timeout: 10000,
    url: '/api/code-generator/generate'
  }
}

export const mockNetworkError = {
  code: 'ERR_NETWORK',
  message: 'Network Error',
  config: {
    url: '/api/code-generator/generate'
  }
}


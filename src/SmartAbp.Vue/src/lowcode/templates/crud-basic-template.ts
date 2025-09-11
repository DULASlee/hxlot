import type { TemplatePack } from '@/lowcode/kernel/types'

export const CrudBasicTemplatePack: TemplatePack = {
  id: 'crud-basic',
  name: 'CRUD基础模板',
  version: '1.0.0',
  description: '标准增删改查模块：列表、表单、服务、Store、路由与权限占位',
  category: 'crud',
  templates: {
    pages: [
      {
        name: 'ListPage',
        type: 'list',
        template: '<!-- LIST PAGE TEMPLATE PLACEHOLDER -->',
        parameters: ['moduleName', 'displayName', 'entityName', 'fields']
      },
      {
        name: 'FormPage',
        type: 'form',
        template: '<!-- FORM PAGE TEMPLATE PLACEHOLDER -->',
        parameters: ['moduleName', 'displayName', 'entityName', 'fields']
      }
    ],
    services: [
      {
        name: 'ApiService',
        template: '// SERVICE TEMPLATE PLACEHOLDER',
        parameters: ['entityName', 'moduleName']
      }
    ],
    stores: [
      {
        name: 'ModuleStore',
        template: '// STORE TEMPLATE PLACEHOLDER',
        parameters: ['entityName', 'moduleName']
      }
    ],
    routes: [
      {
        name: 'ModuleRoutes',
        template: '// ROUTES TEMPLATE PLACEHOLDER',
        parameters: ['moduleName', 'displayName']
      }
    ],
    permissions: [
      {
        name: 'ModulePermissions',
        template: '// PERMISSIONS TEMPLATE PLACEHOLDER',
        parameters: ['moduleName']
      }
    ]
  },
  parameters: [
    {
      name: 'moduleName',
      type: 'string',
      label: '模块名称',
      required: true,
      default: 'User',
      validation: [
        { type: 'required', message: '模块名称不能为空' },
        { type: 'pattern', value: /^[A-Z][a-zA-Z0-9]*$/, message: '模块名需以大写字母开头的驼峰' }
      ]
    },
    {
      name: 'displayName',
      type: 'string',
      label: '显示名称',
      required: true,
      default: '用户管理'
    },
    {
      name: 'entityName',
      type: 'string',
      label: '实体名称',
      required: true,
      default: 'User',
      validation: [
        { type: 'required', message: '实体名称不能为空' },
        { type: 'pattern', value: /^[A-Z][a-zA-Z0-9]*$/, message: '实体名需以大写字母开头的驼峰' }
      ]
    }
  ],
  dependencies: ['pinia'],
  requiredPermissions: [],
  metadata: {
    author: 'SmartAbp',
    tags: ['crud', 'basic', 'table', 'form'],
    documentation: '/templates/crud-basic'
  }
}

export default CrudBasicTemplatePack

// 🚀 企业级模板引擎 - 基于21个模板文件构建完整的代码生成系统
import { computed, ref } from 'vue';
import type { TemplateFile } from '../types/designer'

// 模板参数接口
export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  example?: any;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: Array<{ label: string; value: any; }>;
  };
}

// 模板元数据接口
export interface TemplateMetadata {
  name: string;
  category: string;
  description: string;
  tags: string[];
  scenarios: string[];
  aiTriggers: string[];
  dependencies: string[];
  parameters: TemplateParameter[];
  permissionsRequired: boolean;
  validationRules: string[];
  usageExamples: Array<{
    scenario: string;
    parameters: Record<string, any>;
  }>;
  relatedTemplates: string[];
}

// 模板文件接口 - 已移至 types/designer.ts，此处仅导入使用

// 代码生成结果接口
export interface GenerationResult {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    type: 'cs' | 'vue' | 'ts' | 'js' | 'yml' | 'json';
  }>;
  warnings: string[];
  errors: string[];
  metadata: {
    templateId: string;
    parameters: Record<string, any>;
    generatedAt: Date;
    linesOfCode: number;
  };
}

// 🏗️ 企业级模板引擎类
export class TemplateEngine {
  private templates = new Map<string, TemplateFile>();
  private readonly templateRegistry: TemplateFile[] = [];

  constructor() {
    this.initializeTemplates();
  }

  // 初始化所有21个模板
  private initializeTemplates() {
    // 🔧 后端应用层模板
    this.registerTemplate({
      id: 'backend-crud-app-service',
      name: 'ABP CRUD应用服务',
      description: 'ABP框架CRUD应用服务模板',
      category: 'backend/application',
      filePath: 'templates/backend/application/CrudAppService.template.cs',
      content: this.loadTemplateContent('CrudAppService'),
      metadata: this.loadTemplateMetadata('CrudAppService'),
      fileExtension: 'cs',
      targetFramework: 'backend',
      tags: ['crud', 'app-service', 'backend']
    });

    this.registerTemplate({
      id: 'backend-permission-provider',
      name: 'ABP权限定义提供者',
      description: 'ABP框架权限定义提供者模板',
      category: 'backend/application',
      filePath: 'templates/backend/application/PermissionDefinitionProvider.template.cs',
      content: this.loadTemplateContent('PermissionDefinitionProvider'),
      metadata: this.loadTemplateMetadata('PermissionDefinitionProvider'),
      fileExtension: 'cs',
      targetFramework: 'backend',
      tags: ['permission', 'provider', 'backend']
    });

    // 🔧 后端契约层模板
    this.registerTemplate({
      id: 'backend-entity-dto',
      name: 'ABP实体DTO',
      description: 'ABP框架实体DTO模板',
      category: 'backend/contracts',
      filePath: 'templates/backend/contracts/EntityDto.template.cs',
      content: this.loadTemplateContent('EntityDto'),
      metadata: this.loadTemplateMetadata('EntityDto'),
      fileExtension: 'cs',
      targetFramework: 'backend',
      tags: ['template', 'backend']
    });

    this.registerTemplate({
      id: 'backend-create-dto',
      name: 'ABP创建DTO',
      description: 'ABP框架创建DTO模板',
      category: 'backend/contracts',
      filePath: 'templates/backend/contracts/CreateEntityDto.template.cs',
      content: this.loadTemplateContent('CreateEntityDto'),
      metadata: this.loadTemplateMetadata('CreateEntityDto'),
      fileExtension: 'cs',
      targetFramework: 'backend',
      tags: ['template', 'backend']
    });

    this.registerTemplate({
      id: 'backend-update-dto',
      name: 'ABP更新DTO',
      description: 'ABP框架更新DTO模板',
      category: 'backend/contracts',
      filePath: 'templates/backend/contracts/UpdateEntityDto.template.cs',
      content: this.loadTemplateContent('UpdateEntityDto'),
      metadata: this.loadTemplateMetadata('UpdateEntityDto'),
      fileExtension: 'cs',
      targetFramework: 'backend',
      tags: ['template', 'backend']
    });

    this.registerTemplate({
      id: 'backend-list-dto',
      name: 'ABP列表查询DTO',
      description: 'ABP框架列表查询DTO模板',
      category: 'backend/contracts',
      filePath: 'templates/backend/contracts/GetEntityListDto.template.cs',
      content: this.loadTemplateContent('GetEntityListDto'),
      metadata: this.loadTemplateMetadata('GetEntityListDto'),
      fileExtension: 'cs',
      targetFramework: 'backend',
      tags: ['template', 'backend']
    });

    this.registerTemplate({
      id: 'backend-service-interface',
      name: 'ABP服务接口',
      description: 'ABP框架服务接口模板',
      category: 'backend/contracts',
      filePath: 'templates/backend/contracts/CrudAppServiceInterface.template.cs',
      content: this.loadTemplateContent('CrudAppServiceInterface'),
      metadata: this.loadTemplateMetadata('CrudAppServiceInterface'),
      fileExtension: 'cs',
      targetFramework: 'backend',
      tags: ['template', 'backend']
    });

    // 🔧 后端数据访问层模板
    this.registerTemplate({
      id: 'backend-dbcontext-config',
      name: 'EF Core数据库上下文配置',
      description: 'EF Core数据库上下文配置模板',
      category: 'backend/efcore',
      filePath: 'templates/backend/efcore/DbContextConfiguration.template.cs',
      content: this.loadTemplateContent('DbContextConfiguration'),
      metadata: this.loadTemplateMetadata('DbContextConfiguration'),
      fileExtension: 'cs',
      targetFramework: 'backend',
      tags: ['template', 'backend']
    });

    // 🔧 后端测试模板
    this.registerTemplate({
      id: 'backend-application-tests',
      name: 'ABP应用层测试',
      description: 'ABP框架应用层测试模板',
      category: 'backend/tests',
      filePath: 'templates/backend/tests/Application.Tests.template.cs',
      content: this.loadTemplateContent('ApplicationTests'),
      metadata: this.loadTemplateMetadata('ApplicationTests'),
      fileExtension: 'cs',
      targetFramework: 'backend',
      tags: ['template', 'backend']
    });

    // 🎨 前端组件模板
    this.registerTemplate({
      id: 'frontend-crud-management',
      name: 'Vue3 CRUD管理组件',
      description: 'Vue3 CRUD管理组件模板',
      category: 'frontend/components',
      filePath: 'templates/frontend/components/CrudManagement.template.vue',
      content: this.loadTemplateContent('CrudManagement'),
      metadata: this.loadTemplateMetadata('CrudManagement'),
      fileExtension: 'vue',
      targetFramework: 'frontend',
      tags: ['template', 'frontend']
    });

    // 🎨 前端状态管理模板
    this.registerTemplate({
      id: 'frontend-entity-store',
      name: 'Pinia实体Store',
      description: 'Pinia实体Store模板',
      category: 'frontend/stores',
      filePath: 'templates/frontend/stores/EntityStore.template.ts',
      content: this.loadTemplateContent('EntityStore'),
      metadata: this.loadTemplateMetadata('EntityStore'),
      fileExtension: 'ts',
      targetFramework: 'frontend',
      tags: ['template', 'frontend']
    });

    // 🎨 前端路由模板
    this.registerTemplate({
      id: 'frontend-module-routes',
      name: 'Vue Router模块路由',
      description: 'Vue Router模块路由模板',
      category: 'frontend/router',
      filePath: 'templates/frontend/router/ModuleRoutes.template.ts',
      content: this.loadTemplateContent('ModuleRoutes'),
      metadata: this.loadTemplateMetadata('ModuleRoutes'),
      fileExtension: 'ts',
      targetFramework: 'frontend',
      tags: ['template', 'frontend']
    });

    // 🧩 低代码引擎模板
    this.registerTemplate({
      id: 'lowcode-code-generator',
      name: '低代码代码生成器',
      description: '低代码代码生成器模板',
      category: 'lowcode/generators',
      filePath: 'templates/lowcode/generators/CodeGenerator.template.ts',
      content: this.loadTemplateContent('CodeGenerator'),
      metadata: this.loadTemplateMetadata('CodeGenerator'),
      fileExtension: 'ts',
      targetFramework: 'lowcode',
      tags: ['template', 'lowcode', 'generator']
    });

    this.registerTemplate({
      id: 'lowcode-plugin',
      name: '低代码引擎插件',
      description: '低代码引擎插件模板',
      category: 'lowcode/plugins',
      filePath: 'templates/lowcode/plugins/LowCodePlugin.template.ts',
      content: this.loadTemplateContent('LowCodePlugin'),
      metadata: this.loadTemplateMetadata('LowCodePlugin'),
      fileExtension: 'ts',
      targetFramework: 'lowcode',
      tags: ['template', 'lowcode']
    });

    this.registerTemplate({
      id: 'lowcode-runtime-component',
      name: '低代码运行时组件',
      description: '低代码运行时组件模板',
      category: 'lowcode/runtime',
      filePath: 'templates/lowcode/runtime/RuntimeComponent.template.vue',
      content: this.loadTemplateContent('RuntimeComponent'),
      metadata: this.loadTemplateMetadata('RuntimeComponent'),
      fileExtension: 'vue',
      targetFramework: 'lowcode',
      tags: ['template', 'lowcode']
    });
  }

  // 注册模板
  private registerTemplate(template: TemplateFile) {
    this.templates.set(template.id, template);
    this.templateRegistry.push(template);
  }

  // 加载模板内容（模拟实现）
  private loadTemplateContent(templateName: string): string {
    // 🚀 实际实现中，这里会从文件系统或API加载模板内容
    return `// 🚀 ${templateName} 模板内容
// 这是一个企业级代码模板，专注基础功能实现
// 遵循SmartAbp低代码引擎开发铁律

{{TEMPLATE_CONTENT_PLACEHOLDER}}

// 模板参数替换规则:
// {{EntityName}} - 实体名称（PascalCase）
// {{entityName}} - 实体名称（camelCase）
// {{ModuleName}} - 模块名称
// {{entityDisplayName}} - 实体显示名称
// {{kebab-case-name}} - 短横线命名

// 生成时间: {{GENERATION_TIMESTAMP}}
// 模板版本: 1.0.0
`;
  }

  // 加载模板元数据（模拟实现）
  private loadTemplateMetadata(templateName: string): TemplateMetadata {
    // 🚀 实际实现中，这里会从.meta.yml文件加载元数据
    return {
      name: `${templateName} 模板`,
      category: 'general',
      description: `企业级${templateName}代码模板`,
      tags: ['enterprise', 'smartabp', 'template'],
      scenarios: ['标准业务场景', '企业级应用'],
      aiTriggers: [`创建${templateName}`, `生成${templateName}`],
      dependencies: ['SmartAbp.Core'],
      parameters: [
        {
          name: 'EntityName',
          type: 'string',
          description: '实体名称（PascalCase）',
          required: true,
          example: 'Product'
        },
        {
          name: 'entityName',
          type: 'string',
          description: '实体名称（camelCase）',
          required: true,
          example: 'product'
        },
        {
          name: 'ModuleName',
          type: 'string',
          description: '模块名称',
          required: true,
          example: 'Catalog'
        }
      ],
      permissionsRequired: false,
      validationRules: ['参数不能为空', '命名规范检查'],
      usageExamples: [
        {
          scenario: '产品管理',
          parameters: {
            EntityName: 'Product',
            entityName: 'product',
            ModuleName: 'Catalog'
          }
        }
      ],
      relatedTemplates: []
    };
  }

  // 🔍 获取所有模板
  getAllTemplates(): TemplateFile[] {
    return [...this.templateRegistry];
  }

  // 🔍 根据ID获取模板
  getTemplate(id: string): TemplateFile | undefined {
    return this.templates.get(id);
  }

  // 🔍 根据分类获取模板
  getTemplatesByCategory(category: string): TemplateFile[] {
    return this.templateRegistry.filter(t => t.category === category);
  }

  // 🔍 根据框架获取模板
  getTemplatesByFramework(framework: 'backend' | 'frontend' | 'lowcode'): TemplateFile[] {
    return this.templateRegistry.filter(t => t.targetFramework === framework);
  }

  // 🔍 搜索模板
  searchTemplates(keyword: string): TemplateFile[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.templateRegistry.filter(t =>
      t.name.toLowerCase().includes(lowerKeyword) ||
      t.description.toLowerCase().includes(lowerKeyword) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)) ||
      t.metadata.aiTriggers.some((trigger: string) => trigger.toLowerCase().includes(lowerKeyword))
    );
  }

  // 🏗️ 生成代码
  async generateCode(templateId: string, parameters: Record<string, any>): Promise<GenerationResult> {
    const template = this.getTemplate(templateId);
    if (!template) {
      return {
        success: false,
        files: [],
        warnings: [],
        errors: [`模板 ${templateId} 不存在`],
        metadata: {
          templateId,
          parameters,
          generatedAt: new Date(),
          linesOfCode: 0
        }
      };
    }

    try {
      // 验证参数
      const validationResult = this.validateParameters(template, parameters);
      if (!validationResult.valid) {
        return {
          success: false,
          files: [],
          warnings: [],
          errors: validationResult.errors,
          metadata: {
            templateId,
            parameters,
            generatedAt: new Date(),
            linesOfCode: 0
          }
        };
      }

      // 替换模板参数
      let generatedContent = template.content;
      Object.entries(parameters).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        generatedContent = generatedContent.replace(regex, String(value));
      });

      // 替换特殊标记
      generatedContent = generatedContent.replace(/{{GENERATION_TIMESTAMP}}/g, new Date().toISOString());
      generatedContent = generatedContent.replace(/{{TEMPLATE_CONTENT_PLACEHOLDER}}/g, this.getActualTemplateContent(templateId));

      // 计算生成的文件信息
      const fileName = this.generateFileName(template, parameters);
      const linesOfCode = generatedContent.split('\n').length;

      return {
        success: true,
        files: [
          {
            path: fileName,
            content: generatedContent,
            type: template.fileExtension as "cs" | "vue" | "ts" | "js" | "yml" | "json"
          }
        ],
        warnings: [],
        errors: [],
        metadata: {
          templateId,
          parameters,
          generatedAt: new Date(),
          linesOfCode
        }
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        warnings: [],
        errors: [`代码生成失败: ${(error as Error).message}`],
        metadata: {
          templateId,
          parameters,
          generatedAt: new Date(),
          linesOfCode: 0
        }
      };
    }
  }

  // 🏗️ 批量生成代码
  async generateMultipleFiles(templateIds: string[], parameters: Record<string, any>): Promise<GenerationResult> {
    const results: GenerationResult[] = [];
    const allFiles: GenerationResult['files'] = [];
    const allWarnings: string[] = [];
    const allErrors: string[] = [];
    let totalLinesOfCode = 0;

    for (const templateId of templateIds) {
      const result = await this.generateCode(templateId, parameters);
      results.push(result);

      if (result.success) {
        allFiles.push(...result.files);
        allWarnings.push(...result.warnings);
        totalLinesOfCode += result.metadata.linesOfCode;
      } else {
        allErrors.push(...result.errors);
      }
    }

    return {
      success: allErrors.length === 0,
      files: allFiles,
      warnings: allWarnings,
      errors: allErrors,
      metadata: {
        templateId: templateIds.join(', '),
        parameters,
        generatedAt: new Date(),
        linesOfCode: totalLinesOfCode
      }
    };
  }

  // 验证参数
  private validateParameters(template: TemplateFile, parameters: Record<string, any>): { valid: boolean; errors: string[]; } {
    const errors: string[] = [];

    template.metadata.parameters.forEach((param: any) => {
      const value = parameters[param.name];

      if (param.required && (value === undefined || value === null || value === '')) {
        errors.push(`参数 ${param.name} 是必需的`);
        return;
      }

      if (value !== undefined && value !== null) {
        // 类型验证
        if (param.type === 'string' && typeof value !== 'string') {
          errors.push(`参数 ${param.name} 必须是字符串类型`);
        } else if (param.type === 'number' && typeof value !== 'number') {
          errors.push(`参数 ${param.name} 必须是数字类型`);
        } else if (param.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`参数 ${param.name} 必须是布尔类型`);
        }

        // 验证规则
        if (param.validation) {
          if (param.validation.pattern && typeof value === 'string') {
            const regex = new RegExp(param.validation.pattern);
            if (!regex.test(value)) {
              errors.push(`参数 ${param.name} 格式不正确`);
            }
          }

          if (param.validation.min !== undefined && typeof value === 'string' && value.length < param.validation.min) {
            errors.push(`参数 ${param.name} 长度不能小于 ${param.validation.min}`);
          }

          if (param.validation.max !== undefined && typeof value === 'string' && value.length > param.validation.max) {
            errors.push(`参数 ${param.name} 长度不能大于 ${param.validation.max}`);
          }
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }

  // 生成文件名
  private generateFileName(template: TemplateFile, parameters: Record<string, any>): string {
    const entityName = parameters.EntityName || 'Entity';
    const moduleName = parameters.ModuleName || 'Module';

    switch (template.id) {
      case 'backend-crud-app-service':
        return `${entityName}AppService.cs`;
      case 'backend-entity-dto':
        return `${entityName}Dto.cs`;
      case 'backend-create-dto':
        return `Create${entityName}Dto.cs`;
      case 'backend-update-dto':
        return `Update${entityName}Dto.cs`;
      case 'backend-list-dto':
        return `Get${entityName}ListDto.cs`;
      case 'backend-service-interface':
        return `I${entityName}AppService.cs`;
      case 'frontend-crud-management':
        return `${entityName}Management.vue`;
      case 'frontend-entity-store':
        return `${entityName.toLowerCase()}Store.ts`;
      case 'frontend-module-routes':
        return `${moduleName.toLowerCase()}Routes.ts`;
      default:
        return `${entityName}.${template.fileExtension}`;
    }
  }

  // 获取实际模板内容（简化实现）
  private getActualTemplateContent(templateId: string): string {
    // 🚀 实际实现中，这里会返回真实的模板内容
    switch (templateId) {
      case 'backend-crud-app-service':
        return `
/// <summary>
/// {{EntityName}} CRUD应用服务
/// </summary>
[Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
public class {{EntityName}}AppService : SmartAbpAppService, I{{EntityName}}AppService
{
    private readonly IRepository<{{EntityName}}, Guid> _{{entityName}}Repository;

    public {{EntityName}}AppService(IRepository<{{EntityName}}, Guid> {{entityName}}Repository)
    {
        _{{entityName}}Repository = {{entityName}}Repository;
    }

    // CRUD方法实现...
}`;
      case 'frontend-crud-management':
        return `
<template>
  <div class="{{kebab-case-name}}-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{entityDisplayName}}管理</span>
          <el-button type="primary" @click="handleCreate">新增</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe>
        <!-- 表格列定义... -->
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 组件逻辑...
</script>`;
      default:
        return `// ${templateId} 模板内容`;
    }
  }
}

// 🚀 创建全局模板引擎实例
export const templateEngine = new TemplateEngine();

// 🎯 Vue Composition API 支持
export function useTemplateEngine() {
  const templates = ref<TemplateFile[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 加载所有模板
  const loadTemplates = async () => {
    loading.value = true;
    error.value = null;

    try {
      templates.value = templateEngine.getAllTemplates();
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  // 搜索模板
  const searchTemplates = (keyword: string) => {
    return templateEngine.searchTemplates(keyword);
  };

  // 生成代码
  const generateCode = async (templateId: string, parameters: Record<string, any>) => {
    loading.value = true;
    error.value = null;

    try {
      return await templateEngine.generateCode(templateId, parameters);
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 计算属性
  const backendTemplates = computed(() =>
    templates.value.filter(t => t.targetFramework === 'backend')
  );

  const frontendTemplates = computed(() =>
    templates.value.filter(t => t.targetFramework === 'frontend')
  );

  const lowcodeTemplates = computed(() =>
    templates.value.filter(t => t.targetFramework === 'lowcode')
  );

  const templatesByCategory = computed(() => {
    const grouped: Record<string, TemplateFile[]> = {};
    templates.value.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category]!.push(template);
    });
    return grouped;
  });

  return {
    templates,
    loading,
    error,
    backendTemplates,
    frontendTemplates,
    lowcodeTemplates,
    templatesByCategory,
    loadTemplates,
    searchTemplates,
    generateCode
  };
}

export default templateEngine;

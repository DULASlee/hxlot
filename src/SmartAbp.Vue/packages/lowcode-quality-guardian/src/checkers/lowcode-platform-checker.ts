/**
 * 低代码平台特定代码质量检查器 v1.0
 * 专门检查SmartAbp低代码平台的代码质量和规范性
 */

import { BaseChecker } from './base-checker.js';
import type { CheckResult } from '../types/index.js';
import { glob } from 'glob';
import * as fs from 'fs-extra';
import path from 'path';

export class LowCodePlatformChecker extends BaseChecker {
  public override readonly name = '低代码平台特定检查器';
  public override readonly description = '检查低代码平台组件、Schema、模板、引擎的代码质量和规范性';
  public override readonly version = '1.0.0';
  public override enabled = true;

  private totalIssuesFound = 0;
  private checkedFiles = 0;

  protected override async doCheck(): Promise<void> {}

  public override async check(): Promise<CheckResult> {
    const startTime = Date.now();
    this.totalIssuesFound = 0;
    this.checkedFiles = 0;

    console.log('  🎨 开始低代码平台特定检查...');

    try {
      // 检查1: 低代码组件规范性（P0）
      console.log('    ▸ 检查低代码组件规范性...');
      await this.checkLowCodeComponents();

      // 检查2: Schema定义质量（P0）
      console.log('    ▸ 检查Schema定义质量...');
      await this.checkSchemaDefinitions();

      // 检查3: 模板引擎使用规范（P1）
      console.log('    ▸ 检查模板引擎使用规范...');
      await this.checkTemplateEngineUsage();

      // 检查4: 代码生成器质量（P1）
      console.log('    ▸ 检查代码生成器质量...');
      await this.checkCodeGeneratorQuality();

      // 检查5: 元数据完整性（P0）
      console.log('    ▸ 检查元数据完整性...');
      await this.checkMetadataIntegrity();

      // 检查6: 低代码引擎性能（P1）
      console.log('    ▸ 检查低代码引擎性能...');
      await this.checkEnginePerformance();

      console.log(`  ✅ 低代码平台检查完成，检查了 ${this.checkedFiles} 个文件，发现 ${this.totalIssuesFound} 个问题`);

      return {
        checker: this.name,
        passed: this.violations.filter(v => v.level === 'P0').length === 0,
        duration: Date.now() - startTime,
        filesChecked: this.checkedFiles,
        violations: this.violations,
        details: {
          totalIssuesFound: this.totalIssuesFound,
          componentIssues: this.violations.filter(v => v.rule?.startsWith('lowcode-platform.component')).length,
          schemaIssues: this.violations.filter(v => v.rule?.startsWith('lowcode-platform.schema')).length,
          templateIssues: this.violations.filter(v => v.rule?.startsWith('lowcode-platform.template')).length,
          generatorIssues: this.violations.filter(v => v.rule?.startsWith('lowcode-platform.generator')).length
        }
      };
    } catch (error) {
      return {
        checker: this.name,
        passed: false,
        duration: Date.now() - startTime,
        filesChecked: this.checkedFiles,
        violations: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 检查低代码组件规范性
   */
  private async checkLowCodeComponents(): Promise<void> {
    const componentFiles = await glob('src/SmartAbp.Vue/packages/lowcode-*/src/components/**/*.{vue,ts}', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of componentFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查组件命名规范
        await this.checkComponentNaming(file, content);
        
        // 检查Props定义完整性
        await this.checkPropsDefinition(file, content);
        
        // 检查事件定义规范
        await this.checkEventDefinition(file, content);
        
        // 检查组件文档注释
        await this.checkComponentDocumentation(file, content);

        // 检查组件注册规范
        await this.checkComponentRegistration(file, content);
      }
    }
  }

  private async checkComponentNaming(file: string, content: string): Promise<void> {
    const fileName = path.basename(file, path.extname(file));
    
    // 检查组件名称是否符合PascalCase
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(fileName) && !fileName.includes('index')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'lowcode-platform.component-naming',
        level: 'P1',
        file: file,
        line: 1,
        message: `低代码组件名称应使用PascalCase命名规范: ${fileName}`,
        snippet: fileName,
        suggestion: '使用如SmartFormBuilder、DataTableDesigner等命名方式'
      });
    }

    // 检查组件是否以Smart前缀开始（推荐规范）
    if (file.includes('/components/') && !fileName.startsWith('Smart') && !fileName.includes('index')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'lowcode-platform.component-prefix',
        level: 'P2',
        file: file,
        line: 1,
        message: '低代码核心组件建议使用Smart前缀以保持命名一致性',
        snippet: fileName,
        suggestion: `重命名为Smart${fileName}`
      });
    }
  }

  private async checkPropsDefinition(file: string, content: string): Promise<void> {
    const lines = content.split('\n');

    lines.forEach((line: string, index: number) => {
      // 检查Props是否有类型定义
      if (line.includes('defineProps') && !line.includes('<') && !content.includes('interface Props')) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'lowcode-platform.component-props-types',
          level: 'P0',
          file: file,
          line: index + 1,
          message: '低代码组件Props缺少TypeScript类型定义',
          snippet: line.trim(),
          suggestion: '使用defineProps<PropsInterface>()或定义Props接口'
        });
      }

      // 检查Props是否有默认值和验证
      if (line.includes('defineProps') && !content.includes('withDefaults')) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'lowcode-platform.component-props-defaults',
          level: 'P1',
          file: file,
          line: index + 1,
          message: '低代码组件Props建议使用withDefaults提供默认值',
          snippet: line.trim(),
          suggestion: '使用withDefaults(defineProps<Props>(), {...})提供默认值'
        });
      }
    });
  }

  private async checkEventDefinition(file: string, content: string): Promise<void> {
    const lines = content.split('\n');

    lines.forEach((line: string, index: number) => {
      // 检查事件定义是否有类型
      if (line.includes('defineEmits') && !line.includes('<') && !line.includes('Emits')) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'lowcode-platform.component-events-types',
          level: 'P0',
          file: file,
          line: index + 1,
          message: '低代码组件Events缺少TypeScript类型定义',
          snippet: line.trim(),
          suggestion: '使用defineEmits<{eventName: [param: Type]}>()定义事件类型'
        });
      }

      // 检查事件命名规范（应该是动词形式）
      if (line.includes('emit(') && !/'(update:|change:|select:|add:|remove:|delete:|create:|save:|cancel:)'/.test(line)) {
        const eventMatch = line.match(/emit\(['"]([^'"]+)['"]/);
        if (eventMatch && eventMatch[1]) {
          const eventName = eventMatch[1];
          if (!eventName.includes(':') && !eventName.match(/^(update|change|select|add|remove|delete|create|save|cancel|submit|reset)/)) {
            this.totalIssuesFound++;
            this.addViolation({
              rule: 'lowcode-platform.component-event-naming',
              level: 'P2',
              file: file,
              line: index + 1,
              message: `低代码组件事件命名建议使用动词前缀: ${eventName}`,
              snippet: line.trim(),
              suggestion: '使用如update:value、change:selection、add:item等命名方式'
            });
          }
        }
      }
    });
  }

  private async checkComponentDocumentation(file: string, content: string): Promise<void> {
    // 检查组件是否有文档注释
    if (!content.includes('/**') && !content.includes('* @description')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'lowcode-platform.component-documentation',
        level: 'P1',
        file: file,
        line: 1,
        message: '低代码组件缺少文档注释',
        snippet: path.basename(file),
        suggestion: '添加组件描述、Props说明、Events说明和使用示例'
      });
    }

    // 检查是否有示例用法
    if (!content.includes('@example') && !content.includes('使用示例')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'lowcode-platform.component-examples',
        level: 'P2',
        file: file,
        line: 1,
        message: '低代码组件建议提供使用示例',
        snippet: path.basename(file),
        suggestion: '在组件注释中添加@example标签和代码示例'
      });
    }
  }

  private async checkComponentRegistration(file: string, content: string): Promise<void> {
    // 检查组件是否在ComponentRegistry中注册
    const componentName = path.basename(file, path.extname(file));
    if (componentName !== 'index' && !content.includes('registerComponent')) {
      // 检查是否在其他文件中注册了
      const registryFiles = await glob('src/SmartAbp.Vue/packages/*/src/**/*.ts', {
        cwd: this.config.projectRoot,
        ignore: ['**/node_modules/**', '**/dist/**']
      });

      let isRegistered = false;
      for (const regFile of registryFiles.slice(0, 20)) { // 限制检查数量
        const regPath = path.join(this.config.projectRoot, regFile);
        if (await fs.pathExists(regPath)) {
          const regContent = await fs.readFile(regPath, 'utf8');
          if (regContent.includes(`name: '${componentName}'`) || regContent.includes(`'${componentName}'`)) {
            isRegistered = true;
            break;
          }
        }
      }

      if (!isRegistered) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'lowcode-platform.component-registration',
          level: 'P0',
          file: file,
          line: 1,
          message: `低代码组件${componentName}未在ComponentRegistry中注册`,
          snippet: componentName,
          suggestion: '在相应的index.ts或registry文件中注册组件'
        });
      }
    }
  }

  /**
   * 检查Schema定义质量
   */
  private async checkSchemaDefinitions(): Promise<void> {
    const schemaFiles = await glob('src/**/*.{schema,metadata}.{ts,json}', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of schemaFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查Schema版本控制
        await this.checkSchemaVersioning(file, content);
        
        // 检查Schema验证规则
        await this.checkSchemaValidation(file, content);
        
        // 检查Schema字段完整性
        await this.checkSchemaCompleteness(file, content);
      }
    }
  }

  private async checkSchemaVersioning(file: string, content: string): Promise<void> {
    if (!content.includes('version') && !content.includes('$schema')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'lowcode-platform.schema-versioning',
        level: 'P1',
        file: file,
        line: 1,
        message: 'Schema定义缺少版本控制信息',
        snippet: path.basename(file),
        suggestion: '添加version字段或$schema引用以支持版本管理'
      });
    }
  }

  private async checkSchemaValidation(file: string, content: string): Promise<void> {
    const lines = content.split('\n');

    lines.forEach((line: string, index: number) => {
      // 检查必填字段是否有required标记
      if (line.includes('type:') && !content.includes('required') && !content.includes('isRequired')) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'lowcode-platform.schema-validation',
          level: 'P1',
          file: file,
          line: index + 1,
          message: 'Schema字段缺少必填验证规则',
          snippet: line.trim(),
          suggestion: '添加required或isRequired字段标记必填项'
        });
      }

      // 检查字符串字段是否有长度限制
      if (line.includes("type: 'string'") && !content.includes('maxLength') && !content.includes('minLength')) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'lowcode-platform.schema-string-limits',
          level: 'P2',
          file: file,
          line: index + 1,
          message: 'Schema字符串字段建议添加长度限制',
          snippet: line.trim(),
          suggestion: '添加maxLength和minLength字段限制字符串长度'
        });
      }
    });
  }

  private async checkSchemaCompleteness(file: string, content: string): Promise<void> {
    const requiredFields = ['name', 'type', 'displayName'];
    
    requiredFields.forEach(field => {
      if (!content.includes(field)) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'lowcode-platform.schema-completeness',
          level: 'P0',
          file: file,
          line: 1,
          message: `Schema定义缺少必要字段: ${field}`,
          snippet: path.basename(file),
          suggestion: `添加${field}字段完善Schema定义`
        });
      }
    });
  }

  /**
   * 检查模板引擎使用规范
   */
  private async checkTemplateEngineUsage(): Promise<void> {
    const templateFiles = await glob('src/**/*.{tpl,template}', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of templateFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查模板语法安全性
        await this.checkTemplateSecurity(file, content);
        
        // 检查模板性能优化
        await this.checkTemplatePerformance(file, content);
      }
    }
  }

  private async checkTemplateSecurity(file: string, content: string): Promise<void> {
    // 检查是否有XSS风险的模板语法
    if (content.includes('{{{') || content.includes('<%=') || content.includes('${')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'lowcode-platform.template-security',
        level: 'P0',
        file: file,
        line: 1,
        message: '模板使用了可能存在XSS风险的语法',
        snippet: content.substring(0, 100),
        suggestion: '使用安全的模板语法，避免直接输出未转义内容'
      });
    }
  }

  private async checkTemplatePerformance(file: string, content: string): Promise<void> {
    // 检查模板中是否有性能问题的循环
    if (content.match(/\{\{#each.*\{\{#each/s)) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'lowcode-platform.template-performance',
        level: 'P1',
        file: file,
        line: 1,
        message: '模板包含嵌套循环，可能影响渲染性能',
        snippet: 'nested loops detected',
        suggestion: '优化模板结构，减少嵌套循环或使用虚拟滚动'
      });
    }
  }

  /**
   * 检查代码生成器质量
   */
  private async checkCodeGeneratorQuality(): Promise<void> {
    const generatorFiles = await glob('src/**/CodeGenerator/**/*.cs', {
      cwd: this.config.projectRoot,
      ignore: ['**/bin/**', '**/obj/**']
    });

    for (const file of generatorFiles.slice(0, 10)) { // 限制检查数量避免超时
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查生成器错误处理
        await this.checkGeneratorErrorHandling(file, content);
        
        // 检查生成器可扩展性
        await this.checkGeneratorExtensibility(file, content);
      }
    }
  }

  private async checkGeneratorErrorHandling(file: string, content: string): Promise<void> {
    if (!content.includes('try') && !content.includes('catch') && content.includes('Generate')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'lowcode-platform.generator-error-handling',
        level: 'P0',
        file: file,
        line: 1,
        message: '代码生成器缺少错误处理机制',
        snippet: 'Generator without try-catch',
        suggestion: '添加try-catch块处理生成过程中的异常'
      });
    }
  }

  private async checkGeneratorExtensibility(file: string, content: string): Promise<void> {
    if (!content.includes('interface') && !content.includes('abstract') && content.includes('class')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'lowcode-platform.generator-extensibility',
        level: 'P1',
        file: file,
        line: 1,
        message: '代码生成器建议使用接口或抽象类提高可扩展性',
        snippet: 'Concrete generator class',
        suggestion: '实现IGenerator接口或继承BaseGenerator抽象类'
      });
    }
  }

  /**
   * 检查元数据完整性
   */
  private async checkMetadataIntegrity(): Promise<void> {
    const metadataFiles = await glob('metadata/**/*.ts', {
      cwd: this.config.projectRoot
    });

    for (const file of metadataFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查元数据导出规范
        if (!content.includes('export') || !content.includes('Metadata')) {
          this.totalIssuesFound++;
          this.addViolation({
            rule: 'lowcode-platform.metadata-export',
            level: 'P0',
            file: file,
            line: 1,
            message: '元数据文件必须正确导出Metadata对象',
            snippet: path.basename(file),
            suggestion: '使用export const XXXMetadata形式导出元数据'
          });
        }
      }
    }
  }

  /**
   * 检查低代码引擎性能
   */
  private async checkEnginePerformance(): Promise<void> {
    const engineFiles = await glob('src/**/lowcode-core/src/**/*.ts', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of engineFiles.slice(0, 15)) { // 限制检查数量
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');

        // 检查大循环操作
        const lines = content.split('\n');
        lines.forEach((line: string, index: number) => {
          if (line.includes('forEach') && line.includes('.map') && line.includes('.filter')) {
            this.totalIssuesFound++;
            this.addViolation({
              rule: 'lowcode-platform.engine-performance',
              level: 'P1',
              file: file,
              line: index + 1,
              message: '低代码引擎存在多重数组操作，可能影响性能',
              snippet: line.trim(),
              suggestion: '合并数组操作或使用更高效的算法'
            });
          }
        });
      }
    }
  }
}

/**
 * SmartAbp特定架构质量检查器 v1.0
 * 专门检查SmartAbp项目的架构设计和模块化质量
 */

import { BaseChecker } from './base-checker.js';
import type { CheckResult } from '../types/index.js';
import { glob } from 'glob';
import * as fs from 'fs-extra';
import path from 'path';

export class SmartAbpArchitectureChecker extends BaseChecker {
  public override readonly name = 'SmartAbp架构质量检查器';
  public override readonly description = '检查SmartAbp特定的架构设计、模块化、分层和依赖管理质量';
  public override readonly version = '1.0.0';
  public override enabled = true;

  private totalIssuesFound = 0;
  private checkedFiles = 0;

  protected override async doCheck(): Promise<void> {}

  public override async check(): Promise<CheckResult> {
    const startTime = Date.now();
    this.totalIssuesFound = 0;
    this.checkedFiles = 0;

    console.log('  🏗️ 开始SmartAbp架构质量检查...');

    try {
      // 检查1: 前后端分离架构质量（P0）
      console.log('    ▸ 检查前后端分离架构质量...');
      await this.checkFrontendBackendSeparation();

      // 检查2: 微服务架构规范（P1）
      console.log('    ▸ 检查微服务架构规范...');
      await this.checkMicroserviceArchitecture();

      // 检查3: 低代码引擎架构设计（P0）
      console.log('    ▸ 检查低代码引擎架构设计...');
      await this.checkLowCodeEngineArchitecture();

      // 检查4: 前端模块化设计（P1）
      console.log('    ▸ 检查前端模块化设计...');
      await this.checkFrontendModularization();

      // 检查5: API设计规范（P1）
      console.log('    ▸ 检查API设计规范...');
      await this.checkApiDesignStandards();

      // 检查6: 数据库设计质量（P1）
      console.log('    ▸ 检查数据库设计质量...');
      await this.checkDatabaseDesign();

      console.log(`  ✅ SmartAbp架构检查完成，检查了 ${this.checkedFiles} 个文件，发现 ${this.totalIssuesFound} 个问题`);

      return {
        checker: this.name,
        passed: this.violations.filter(v => v.level === 'P0').length === 0,
        duration: Date.now() - startTime,
        filesChecked: this.checkedFiles,
        violations: this.violations,
        details: {
          totalIssuesFound: this.totalIssuesFound,
          architectureIssues: this.violations.filter(v => v.rule?.includes('architecture')).length,
          modularityIssues: this.violations.filter(v => v.rule?.includes('modular')).length,
          apiIssues: this.violations.filter(v => v.rule?.includes('api')).length,
          databaseIssues: this.violations.filter(v => v.rule?.includes('database')).length
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
   * 检查前后端分离架构质量
   */
  private async checkFrontendBackendSeparation(): Promise<void> {
    // 检查前端是否直接访问数据库
    const frontendFiles = await glob('src/SmartAbp.Vue/src/**/*.{ts,vue}', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of frontendFiles.slice(0, 50)) { // 限制检查数量
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查前端是否直接引用Entity
        if (content.includes('SmartAbp.Domain') || content.includes('Entity<')) {
          this.totalIssuesFound++;
          this.addViolation({
            rule: 'smartabp-architecture.frontend-domain-separation',
            level: 'P0',
            file: file,
            line: 1,
            message: '前端代码不应直接引用后端Domain实体',
            snippet: 'Domain entity reference detected',
            suggestion: '使用DTO对象进行前后端数据传输'
          });
        }

        // 检查前端是否有SQL查询
        if (content.includes('SELECT ') || content.includes('FROM ') || content.includes('WHERE ')) {
          this.totalIssuesFound++;
          this.addViolation({
            rule: 'smartabp-architecture.frontend-sql-separation',
            level: 'P0',
            file: file,
            line: 1,
            message: '前端代码不应包含SQL查询逻辑',
            snippet: 'SQL query in frontend detected',
            suggestion: '将SQL查询移至后端Repository或AppService'
          });
        }

        // 检查API调用是否规范
        await this.checkApiCallPatterns(file, content);
      }
    }
  }

  private async checkApiCallPatterns(file: string, content: string): Promise<void> {
    const lines = content.split('\n');

    lines.forEach((line: string, index: number) => {
      // 检查是否使用硬编码URL
      if (line.includes('http://') || line.includes('https://')) {
        const urlMatch = line.match(/https?:\/\/[^\s'"]+/);
        if (urlMatch && !urlMatch[0].includes('example.com') && !urlMatch[0].includes('localhost')) {
          this.totalIssuesFound++;
          this.addViolation({
            rule: 'smartabp-architecture.hardcoded-urls',
            level: 'P1',
            file: file,
            line: index + 1,
            message: '不应在代码中硬编码API URL',
            snippet: line.trim(),
            suggestion: '使用环境变量或配置文件管理API地址'
          });
        }
      }

      // 检查API调用是否有错误处理
      if (line.includes('.get(') || line.includes('.post(') || line.includes('.put(') || line.includes('.delete(')) {
        if (!content.includes('catch') && !content.includes('try')) {
          this.totalIssuesFound++;
          this.addViolation({
            rule: 'smartabp-architecture.api-error-handling',
            level: 'P1',
            file: file,
            line: index + 1,
            message: 'API调用缺少错误处理机制',
            snippet: line.trim(),
            suggestion: '添加try-catch或.catch()处理API调用异常'
          });
        }
      }
    });
  }

  /**
   * 检查微服务架构规范
   */
  private async checkMicroserviceArchitecture(): Promise<void> {
    // 检查服务间通信方式
    const serviceFiles = await glob('src/SmartAbp.Application/**/*Service.cs', {
      cwd: this.config.projectRoot,
      ignore: ['**/bin/**', '**/obj/**']
    });

    for (const file of serviceFiles.slice(0, 20)) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查服务是否直接调用其他服务的私有方法
        await this.checkServiceCommunication(file, content);
        
        // 检查是否有分布式事务
        await this.checkDistributedTransactions(file, content);
      }
    }
  }

  private async checkServiceCommunication(file: string, content: string): Promise<void> {
    // 检查是否有跨服务的直接依赖
    const lines = content.split('\n');
    
    lines.forEach((line: string, index: number) => {
      if (line.includes('private readonly') && line.includes('Service') && !line.includes('IRepository')) {
        // 可能的服务间直接依赖
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'smartabp-architecture.service-coupling',
          level: 'P1',
          file: file,
          line: index + 1,
          message: '服务间存在直接依赖，可能违反微服务架构原则',
          snippet: line.trim(),
          suggestion: '考虑使用消息队列或API网关进行服务间通信'
        });
      }
    });
  }

  private async checkDistributedTransactions(file: string, content: string): Promise<void> {
    if (content.includes('TransactionScope') && content.includes('RequiresNew')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'smartabp-architecture.distributed-transactions',
        level: 'P1',
        file: file,
        line: 1,
        message: '检测到分布式事务使用，在微服务架构中应谨慎使用',
        snippet: 'Distributed transaction detected',
        suggestion: '考虑使用Saga模式或最终一致性替代分布式事务'
      });
    }
  }

  /**
   * 检查低代码引擎架构设计
   */
  private async checkLowCodeEngineArchitecture(): Promise<void> {
    // 检查引擎核心架构
    const coreFiles = await glob('src/SmartAbp.Vue/packages/lowcode-core/src/**/*.ts', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of coreFiles.slice(0, 30)) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查引擎是否有清晰的分层
        await this.checkEngineLayers(file, content);
        
        // 检查插件系统设计
        await this.checkPluginArchitecture(file, content);
      }
    }
  }

  private async checkEngineLayers(file: string, content: string): Promise<void> {
    const expectedLayers = ['core', 'api', 'shared', 'designer'];
    const filePath = file.toLowerCase();
    
    // 检查是否在正确的层级
    const currentLayer = expectedLayers.find(layer => filePath.includes(layer));
    
    if (currentLayer) {
      expectedLayers.forEach(layer => {
        if (layer !== currentLayer && content.includes(`@smartabp/lowcode-${layer}`) && 
            !this.isValidDependency(currentLayer, layer)) {
          this.totalIssuesFound++;
          this.addViolation({
            rule: 'smartabp-architecture.engine-layer-violation',
            level: 'P0',
            file: file,
            line: 1,
            message: `低代码引擎层级依赖违规: ${currentLayer} -> ${layer}`,
            snippet: `dependency on lowcode-${layer}`,
            suggestion: '遵循引擎分层架构：designer->core->shared，避免逆向依赖'
          });
        }
      });
    }
  }

  private isValidDependency(from: string, to: string): boolean {
    const layerHierarchy: Record<string, string[]> = {
      'designer': ['core', 'shared'],
      'core': ['shared'],
      'api': ['shared'],
      'shared': []
    };
    
    return layerHierarchy[from]?.includes(to) || false;
  }

  private async checkPluginArchitecture(file: string, content: string): Promise<void> {
    // 检查插件接口设计
    if (content.includes('Plugin') && !content.includes('interface') && !content.includes('abstract')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'smartabp-architecture.plugin-interface',
        level: 'P1',
        file: file,
        line: 1,
        message: '插件系统建议使用接口或抽象类定义插件规范',
        snippet: 'Plugin without interface',
        suggestion: '定义IPlugin接口或BasePlugin抽象类'
      });
    }
  }

  /**
   * 检查前端模块化设计
   */
  private async checkFrontendModularization(): Promise<void> {
    // 检查前端模块结构
    const moduleFiles = await glob('src/SmartAbp.Vue/src/**/*.ts', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of moduleFiles.slice(0, 40)) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查模块导入导出规范
        await this.checkModuleImportExport(file, content);
        
        // 检查模块职责分离
        await this.checkModuleSeparationOfConcerns(file, content);
      }
    }
  }

  private async checkModuleImportExport(file: string, content: string): Promise<void> {
    const lines = content.split('\n');

    lines.forEach((line: string, index: number) => {
      // 检查是否有循环导入
      if (line.includes('import') && line.includes('../')) {
        const importCount = (content.match(/import.*\.\.\//g) || []).length;
        if (importCount > 5) {
          this.totalIssuesFound++;
          this.addViolation({
            rule: 'smartabp-architecture.circular-imports',
            level: 'P1',
            file: file,
            line: index + 1,
            message: '模块存在大量相对路径导入，可能存在循环依赖风险',
            snippet: line.trim(),
            suggestion: '重构模块结构，减少相对路径导入'
          });
        }
      }

      // 检查是否有默认导出规范
      if (line.includes('export default') && !file.includes('index.ts') && !file.endsWith('.vue')) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'smartabp-architecture.default-export',
          level: 'P2',
          file: file,
          line: index + 1,
          message: '建议避免使用默认导出，使用命名导出提高可维护性',
          snippet: line.trim(),
          suggestion: '使用export { ClassName }替代export default'
        });
      }
    });
  }

  private async checkModuleSeparationOfConcerns(file: string, content: string): Promise<void> {
    // 检查文件是否职责过重
    const functionCount = (content.match(/function\s+\w+|const\s+\w+\s*=/g) || []).length;
    const classCount = (content.match(/class\s+\w+/g) || []).length;
    const interfaceCount = (content.match(/interface\s+\w+/g) || []).length;
    
    if (functionCount > 20 || classCount > 5 || interfaceCount > 10) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'smartabp-architecture.single-responsibility',
        level: 'P1',
        file: file,
        line: 1,
        message: `模块职责过重: ${functionCount}个函数, ${classCount}个类, ${interfaceCount}个接口`,
        snippet: `Functions: ${functionCount}, Classes: ${classCount}`,
        suggestion: '将大型模块拆分为更小的、职责单一的模块'
      });
    }
  }

  /**
   * 检查API设计规范
   */
  private async checkApiDesignStandards(): Promise<void> {
    const controllerFiles = await glob('src/SmartAbp.HttpApi/**/*Controller.cs', {
      cwd: this.config.projectRoot,
      ignore: ['**/bin/**', '**/obj/**']
    });

    for (const file of controllerFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查RESTful API设计
        await this.checkRestfulDesign(file, content);
        
        // 检查API版本控制
        await this.checkApiVersioning(file, content);
      }
    }
  }

  private async checkRestfulDesign(file: string, content: string): Promise<void> {
    const lines = content.split('\n');

    lines.forEach((line: string, index: number) => {
      // 检查HTTP动词使用是否正确
      if (line.includes('[HttpGet]') && line.includes('Delete')) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'smartabp-architecture.restful-verbs',
          level: 'P1',
          file: file,
          line: index + 1,
          message: 'RESTful API动词使用不当：Delete操作应使用[HttpDelete]',
          snippet: line.trim(),
          suggestion: '使用正确的HTTP动词：GET(查询)、POST(创建)、PUT(更新)、DELETE(删除)'
        });
      }

      // 检查API路由命名规范
      if (line.includes('[Route(') && line.includes('api/')) {
        const routeMatch = line.match(/\[Route\("([^"]+)"\)/);
        if (routeMatch && routeMatch[1]) {
          const route = routeMatch[1];
          if (!route.match(/^api\/v?\d*\/[a-z-]+$/)) {
            this.totalIssuesFound++;
            this.addViolation({
              rule: 'smartabp-architecture.api-route-naming',
              level: 'P2',
              file: file,
              line: index + 1,
              message: 'API路由命名不符合规范',
              snippet: line.trim(),
              suggestion: '使用小写单词和连字符，如：api/v1/user-profiles'
            });
          }
        }
      }
    });
  }

  private async checkApiVersioning(file: string, content: string): Promise<void> {
    if (!content.includes('ApiVersion') && !content.includes('/v1/') && !content.includes('/v2/')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'smartabp-architecture.api-versioning',
        level: 'P1',
        file: file,
        line: 1,
        message: 'API缺少版本控制机制',
        snippet: path.basename(file),
        suggestion: '添加API版本控制，如[ApiVersion("1.0")]或在路由中包含版本号'
      });
    }
  }

  /**
   * 检查数据库设计质量
   */
  private async checkDatabaseDesign(): Promise<void> {
    const entityFiles = await glob('src/SmartAbp.Domain/**/*.cs', {
      cwd: this.config.projectRoot,
      ignore: ['**/bin/**', '**/obj/**']
    });

    for (const file of entityFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查实体设计规范
        await this.checkEntityDesign(file, content);
        
        // 检查数据库关系设计
        await this.checkDatabaseRelationships(file, content);
      }
    }
  }

  private async checkEntityDesign(file: string, content: string): Promise<void> {
    // 检查实体是否继承正确的基类
    if (content.includes('class ') && content.includes('Entity') && !content.includes(': Entity<') && !content.includes(': AggregateRoot<')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'smartabp-architecture.entity-base-class',
        level: 'P0',
        file: file,
        line: 1,
        message: '实体类应继承Entity<TKey>或AggregateRoot<TKey>基类',
        snippet: 'Entity without base class',
        suggestion: '继承Entity<Guid>或AggregateRoot<Guid>以获得ABP框架特性'
      });
    }

    // 检查实体属性验证
    const lines = content.split('\n');
    lines.forEach((line: string, index: number) => {
      if (line.includes('public string') && !content.includes('[Required]') && !content.includes('[MaxLength]')) {
        this.totalIssuesFound++;
        this.addViolation({
          rule: 'smartabp-architecture.entity-validation',
          level: 'P1',
          file: file,
          line: index + 1,
          message: '实体字符串属性缺少验证特性',
          snippet: line.trim(),
          suggestion: '添加[Required]、[MaxLength]等验证特性'
        });
      }
    });
  }

  private async checkDatabaseRelationships(file: string, content: string): Promise<void> {
    // 检查外键关系设计
    if (content.includes('public virtual') && content.includes('Id') && !content.includes('ForeignKey')) {
      this.totalIssuesFound++;
      this.addViolation({
        rule: 'smartabp-architecture.foreign-key-design',
        level: 'P1',
        file: file,
        line: 1,
        message: '实体关系可能缺少明确的外键定义',
        snippet: 'Virtual navigation property without foreign key',
        suggestion: '使用[ForeignKey]特性明确外键关系'
      });
    }
  }
}

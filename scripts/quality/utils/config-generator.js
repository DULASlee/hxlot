#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - 配置生成器
 * 自动生成质量检查配置文件
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class ConfigGenerator {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.configDir = path.join(this.projectRoot, 'config');
  }

  findProjectRoot() {
    let current = process.cwd();
    while (current !== '/') {
      if (fs.existsSync(path.join(current, 'package.json'))) {
        return current;
      }
      current = path.dirname(current);
    }
    return process.cwd();
  }

  async generate() {
    console.log(chalk.blue.bold('\n⚙️  SmartAbp Quality Guardian - 配置生成器\n'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log('');

    // 确保配置目录存在
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
      console.log(chalk.green(`✅ 创建配置目录: ${this.configDir}`));
    }

    // 生成质量配置
    await this.generateQualityConfig();

    // 生成规则配置
    await this.generateRulesConfig();

    // 生成门禁配置
    await this.generateGateConfig();

    console.log('');
    console.log(chalk.green.bold('✅ 配置文件生成完成！\n'));
  }

  async generateQualityConfig() {
    const configPath = path.join(this.configDir, 'quality-config.json');
    
    const config = {
      version: '1.0.0',
      project: 'SmartAbp',
      description: '企业级代码质量配置',
      
      // 全局设置
      global: {
        autoFix: false,
        failOnError: true,
        failOnWarning: false,
        maxWarnings: 10,
        outputFormat: 'detailed', // detailed | summary | json
        reportPath: 'reports/quality'
      },

      // 扫描路径
      paths: {
        frontend: {
          include: [
            'src/SmartAbp.Vue/src/**/*.{ts,vue,js}',
            'src/SmartAbp.Vue/packages/**/*.{ts,vue,js}'
          ],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/*.d.ts',
            '**/tests/**',
            '**/__tests__/**'
          ]
        },
        backend: {
          include: [
            'src/**/*.cs'
          ],
          exclude: [
            '**/obj/**',
            '**/bin/**',
            '**/Migrations/**',
            '**/*.Designer.cs'
          ]
        }
      },

      // 评分权重（总和100）
      scoring: {
        weights: {
          typeSafety: 25,      // 类型安全
          codeStyle: 15,       // 代码风格
          architecture: 25,    // 架构合规
          performance: 15,     // 性能优化
          security: 10,        // 安全性
          maintainability: 10  // 可维护性
        },
        thresholds: {
          excellent: 95,  // 优秀
          good: 90,       // 良好
          acceptable: 85, // 可接受
          poor: 70        // 需改进
        }
      },

      // 质量门禁级别
      qualityGate: {
        P0: {
          description: '阻断性问题（必须解决）',
          failBuild: true,
          maxViolations: 0
        },
        P1: {
          description: '严重问题（强烈建议解决）',
          failBuild: true,
          maxViolations: 0
        },
        P2: {
          description: '一般问题（建议解决）',
          failBuild: false,
          maxViolations: 10
        }
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(chalk.green(`✅ 生成质量配置: ${configPath}`));
  }

  async generateRulesConfig() {
    const configPath = path.join(this.configDir, 'quality-rules.json');
    
    const rules = {
      version: '1.0.0',
      description: '代码质量检查规则配置',

      // 前端规则
      frontend: {
        typescript: {
          'no-any': { level: 'P0', enabled: true, autoFix: false },
          'no-ts-ignore': { level: 'P0', enabled: true, autoFix: false },
          'strict-null-checks': { level: 'P0', enabled: true, autoFix: false },
          'no-implicit-any': { level: 'P0', enabled: true, autoFix: false },
          'no-unused-vars': { level: 'P1', enabled: true, autoFix: true }
        },
        eslint: {
          'no-console': { level: 'P2', enabled: true, autoFix: false },
          'no-debugger': { level: 'P0', enabled: true, autoFix: true },
          'prefer-const': { level: 'P1', enabled: true, autoFix: true }
        },
        architecture: {
          'no-relative-imports-in-packages': { level: 'P0', enabled: true, autoFix: false },
          'no-main-app-imports-in-packages': { level: 'P0', enabled: true, autoFix: false },
          'no-circular-dependencies': { level: 'P1', enabled: true, autoFix: false }
        }
      },

      // 后端规则
      backend: {
        compilation: {
          'no-compilation-errors': { level: 'P0', enabled: true, autoFix: false },
          'no-compilation-warnings': { level: 'P1', enabled: true, autoFix: false }
        },
        styleCode: {
          'naming-conventions': { level: 'P1', enabled: true, autoFix: true },
          'code-formatting': { level: 'P2', enabled: true, autoFix: true }
        }
      },

      // SmartAbp特定规则
      smartabp: {
        'component-registration-consistency': { level: 'P0', enabled: true, autoFix: false },
        'type-registration-consistency': { level: 'P0', enabled: true, autoFix: false },
        'no-hardcoded-urls': { level: 'P1', enabled: true, autoFix: false },
        'no-hardcoded-credentials': { level: 'P0', enabled: true, autoFix: false },
        'no-empty-implementations': { level: 'P1', enabled: true, autoFix: false },
        'no-mock-code-in-production': { level: 'P0', enabled: true, autoFix: false },
        'no-todo-in-production': { level: 'P2', enabled: true, autoFix: false }
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(rules, null, 2), 'utf8');
    console.log(chalk.green(`✅ 生成规则配置: ${configPath}`));
  }

  async generateGateConfig() {
    const configPath = path.join(this.configDir, 'quality-gate.json');
    
    const gate = {
      version: '1.0.0',
      description: '质量门禁配置',

      // 门禁策略
      strategy: {
        mode: 'strict', // strict | moderate | lenient
        failFast: false, // 遇到P0错误立即停止
        generateReport: true,
        notifyOnFailure: true
      },

      // P0门禁（阻断性）
      P0: {
        maxViolations: 0,
        rules: [
          'typescript.no-any',
          'typescript.no-ts-ignore',
          'architecture.no-relative-imports-in-packages',
          'architecture.no-main-app-imports-in-packages',
          'backend.no-compilation-errors',
          'smartabp.component-registration-consistency',
          'smartabp.type-registration-consistency',
          'smartabp.no-hardcoded-credentials',
          'smartabp.no-mock-code-in-production'
        ]
      },

      // P1门禁（严重）
      P1: {
        maxViolations: 0,
        rules: [
          'typescript.no-unused-vars',
          'architecture.no-circular-dependencies',
          'backend.no-compilation-warnings',
          'smartabp.no-hardcoded-urls',
          'smartabp.no-empty-implementations'
        ]
      },

      // P2门禁（一般）
      P2: {
        maxViolations: 10,
        rules: [
          'eslint.no-console',
          'backend.code-formatting',
          'smartabp.no-todo-in-production'
        ]
      },

      // 评分标准
      scoring: {
        minScore: 90,
        formula: 'weighted', // weighted | average
        breakdown: {
          P0violations: -10,  // 每个P0违规扣10分
          P1violations: -5,   // 每个P1违规扣5分
          P2violations: -1    // 每个P2违规扣1分
        }
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(gate, null, 2), 'utf8');
    console.log(chalk.green(`✅ 生成门禁配置: ${configPath}`));
  }
}

module.exports = ConfigGenerator;

// CLI接口
if (require.main === module) {
  const generator = new ConfigGenerator();
  generator.generate().catch(error => {
    console.error(chalk.red('\n💥 配置生成失败:'), error.message);
    process.exit(1);
  });
}


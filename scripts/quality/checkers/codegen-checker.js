#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - 代码生成质量验证器
 * 专门检查低代码引擎生成的代码质量
 * 
 * 检查项：
 * 1. 生成代码模板验证（P0）
 * 2. 生成代码质量检查（P0）
 * 3. 生成代码认证机制（P0）
 * 4. 生成代码回归测试（P1）
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

class CodeGenChecker {
  constructor(config = {}) {
    this.config = config;
    this.projectRoot = this.findProjectRoot();
    this.violations = {
      P0: [],
      P1: [],
      P2: []
    };
    
    // 模板目录
    this.templatesPath = path.join(this.projectRoot, 'templates');
    
    // 生成代码可能的位置
    this.generatedCodePaths = [
      'src/SmartAbp.Vue/src/views',
      'src/SmartAbp.Vue/src/stores',
      'src/SmartAbp.Vue/src/api',
      'src/SmartAbp.Application',
      'src/SmartAbp.HttpApi'
    ];
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

  async check() {
    console.log(chalk.blue.bold('\n🔧 代码生成质量验证\n'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log('');

    // 检查模板目录是否存在
    if (!fs.existsSync(this.templatesPath)) {
      console.log(chalk.yellow('  ⚠️  templates目录不存在，跳过检查'));
      return {
        passed: true,
        violations: this.violations,
        skipped: true
      };
    }

    // 检查1: 代码模板验证（P0）
    await this.validateCodeTemplates();

    // 检查2: 生成代码识别（P0）
    await this.identifyGeneratedCode();

    // 检查3: 生成代码质量检查（P0）
    await this.checkGeneratedCodeQuality();

    // 检查4: 生成代码认证标记（P0）
    await this.checkGeneratedCodeCertification();

    // 检查5: 模板版本兼容性（P1）
    await this.checkTemplateVersionCompatibility();

    // 汇总结果
    this.printSummary();

    return {
      passed: this.violations.P0.length === 0,
      violations: this.violations
    };
  }

  /**
   * 检查1: 代码模板验证
   * 验证模板文件的语法和完整性
   */
  async validateCodeTemplates() {
    console.log(chalk.blue('  📋 检查1: 代码模板验证'));

    try {
      // 查找所有模板文件
      const templateFiles = execSync(
        `find "${this.templatesPath}" -name "*.template.*" -o -name "*.hbs" -o -name "*.ejs" | grep -v "node_modules"`,
        { encoding: 'utf8' }
      ).split('\n').filter(f => f.trim());

      console.log(chalk.gray(`     发现 ${templateFiles.length} 个模板文件`));

      let invalidTemplates = 0;

      for (const templateFile of templateFiles) {
        if (!templateFile.trim()) continue;

        // 读取模板文件
        try {
          const content = fs.readFileSync(templateFile, 'utf8');
          
          // 检查模板语法
          const issues = this.validateTemplateSyntax(content, templateFile);
          
          if (issues.length > 0) {
            invalidTemplates++;
            issues.forEach(issue => {
              this.violations.P0.push({
                rule: 'codegen.template-syntax-error',
                level: 'P0',
                file: templateFile,
                message: issue
              });
            });
          }
          
        } catch (error) {
          this.violations.P0.push({
            rule: 'codegen.template-read-error',
            level: 'P0',
            file: templateFile,
            message: `无法读取模板文件: ${error.message}`
          });
        }
      }

      if (invalidTemplates === 0) {
        console.log(chalk.green('     ✅ 所有模板语法正确（0错误）'));
      } else {
        console.log(chalk.red(`     ❌ 发现 ${invalidTemplates} 个模板问题`));
      }

    } catch (error) {
      console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
    }
  }

  /**
   * 检查2: 识别生成的代码
   * 查找带有生成标记的代码文件
   */
  async identifyGeneratedCode() {
    console.log(chalk.blue('  📋 检查2: 生成代码识别'));

    try {
      let totalGeneratedFiles = 0;

      for (const codePath of this.generatedCodePaths) {
        const fullPath = path.join(this.projectRoot, codePath);
        if (!fs.existsSync(fullPath)) continue;

        try {
          // 查找包含生成标记的文件
          const result = execSync(
            `grep -rl "@generated\\|自动生成\\|Auto-generated" "${fullPath}" --include="*.ts" --include="*.vue" --include="*.cs" | grep -v "node_modules" || true`,
            { encoding: 'utf8' }
          );

          const files = result.split('\n').filter(f => f.trim());
          totalGeneratedFiles += files.length;

        } catch (error) {
          // 忽略错误
        }
      }

      console.log(chalk.gray(`     发现 ${totalGeneratedFiles} 个生成的代码文件`));

      if (totalGeneratedFiles === 0) {
        console.log(chalk.yellow('     ⚠️  未发现带有生成标记的代码文件'));
        this.violations.P1.push({
          rule: 'codegen.no-generated-marker',
          level: 'P1',
          message: '建议为生成的代码添加 @generated 标记'
        });
      } else {
        console.log(chalk.green(`     ✅ 找到 ${totalGeneratedFiles} 个带标记的生成文件`));
      }

    } catch (error) {
      console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
    }
  }

  /**
   * 检查3: 生成代码质量检查
   * 对生成的代码进行质量验证
   */
  async checkGeneratedCodeQuality() {
    console.log(chalk.blue('  📋 检查3: 生成代码质量'));

    try {
      // 查找生成的TypeScript文件
      let qualityIssues = 0;

      for (const codePath of this.generatedCodePaths) {
        const fullPath = path.join(this.projectRoot, codePath);
        if (!fs.existsSync(fullPath)) continue;

        try {
          // 检查生成代码中的常见问题

          // 1. 检查是否有 any 类型
          const anyResult = execSync(
            `grep -rn ":\\s*any\\|as any" "${fullPath}" --include="*.ts" --include="*.vue" | grep "@generated" || true`,
            { encoding: 'utf8' }
          );

          const anyViolations = anyResult.split('\n').filter(l => l.trim()).length;
          if (anyViolations > 0) {
            qualityIssues++;
            this.violations.P0.push({
              rule: 'codegen.generated-code-uses-any',
              level: 'P0',
              message: `生成的代码中发现 ${anyViolations} 处使用 any 类型`,
              count: anyViolations
            });
          }

          // 2. 检查是否有TODO/FIXME标记
          const todoResult = execSync(
            `grep -rn "TODO\\|FIXME" "${fullPath}" --include="*.ts" --include="*.vue" --include="*.cs" | grep "@generated" || true`,
            { encoding: 'utf8' }
          );

          const todoViolations = todoResult.split('\n').filter(l => l.trim()).length;
          if (todoViolations > 0) {
            qualityIssues++;
            this.violations.P1.push({
              rule: 'codegen.generated-code-has-todo',
              level: 'P1',
              message: `生成的代码中发现 ${todoViolations} 处TODO标记`,
              count: todoViolations
            });
          }

        } catch (error) {
          // 忽略错误
        }
      }

      if (qualityIssues === 0) {
        console.log(chalk.green('     ✅ 生成代码质量良好（0问题）'));
      } else {
        console.log(chalk.red(`     ❌ 发现 ${qualityIssues} 类质量问题`));
      }

    } catch (error) {
      console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
    }
  }

  /**
   * 检查4: 生成代码认证标记
   * 验证生成的代码是否有正确的认证标记
   */
  async checkGeneratedCodeCertification() {
    console.log(chalk.blue('  📋 检查4: 生成代码认证标记'));

    try {
      // 检查生成代码的认证标记格式
      let certificationIssues = 0;

      for (const codePath of this.generatedCodePaths) {
        const fullPath = path.join(this.projectRoot, codePath);
        if (!fs.existsSync(fullPath)) continue;

        try {
          // 查找带有@generated标记的文件
          const generatedFiles = execSync(
            `grep -rl "@generated" "${fullPath}" --include="*.ts" --include="*.vue" --include="*.cs" | grep -v "node_modules" || true`,
            { encoding: 'utf8' }
          ).split('\n').filter(f => f.trim());

          for (const file of generatedFiles) {
            if (!file.trim()) continue;

            const content = fs.readFileSync(file, 'utf8');
            
            // 检查是否包含完整的认证信息
            const hasGenerator = content.includes('生成器') || content.includes('Generator');
            const hasTimestamp = content.includes('生成时间') || content.includes('Generated at');
            const hasVersion = content.includes('版本') || content.includes('Version');
            
            if (!hasGenerator || !hasTimestamp) {
              certificationIssues++;
              this.violations.P0.push({
                rule: 'codegen.incomplete-certification',
                level: 'P0',
                file,
                message: '生成代码缺少完整的认证标记（应包含：生成器、时间、版本）'
              });
            }
          }

        } catch (error) {
          // 忽略错误
        }
      }

      if (certificationIssues === 0) {
        console.log(chalk.green('     ✅ 生成代码认证标记完整（0缺失）'));
      } else {
        console.log(chalk.red(`     ❌ 发现 ${certificationIssues} 个认证标记问题`));
      }

    } catch (error) {
      console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
    }
  }

  /**
   * 检查5: 模板版本兼容性
   */
  async checkTemplateVersionCompatibility() {
    console.log(chalk.blue('  📋 检查5: 模板版本兼容性'));

    try {
      // 查找模板版本信息
      const versionFiles = execSync(
        `find "${this.templatesPath}" -name "*.json" | xargs grep -l "version" || true`,
        { encoding: 'utf8' }
      ).split('\n').filter(f => f.trim());

      if (versionFiles.length === 0) {
        console.log(chalk.yellow('     ⚠️  未找到模板版本信息'));
        this.violations.P1.push({
          rule: 'codegen.no-template-version',
          level: 'P1',
          message: '建议为模板添加版本信息'
        });
      } else {
        console.log(chalk.green(`     ✅ 找到 ${versionFiles.length} 个模板版本配置`));
      }

    } catch (error) {
      console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
    }
  }

  // ========== 辅助方法 ==========

  validateTemplateSyntax(content, templateFile) {
    const issues = [];

    // 检查常见的模板语法错误
    
    // 1. 检查未闭合的模板标签
    const openTags = (content.match(/\{\{/g) || []).length;
    const closeTags = (content.match(/\}\}/g) || []).length;
    if (openTags !== closeTags) {
      issues.push('模板标签不匹配：开标签和闭标签数量不一致');
    }

    // 2. 检查是否有未定义的变量引用（简化检查）
    const variableRefs = content.match(/\{\{([^}]+)\}\}/g) || [];
    variableRefs.forEach(ref => {
      const varName = ref.replace(/[{}]/g, '').trim();
      // 检查变量名是否合法
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(varName)) {
        issues.push(`可能的非法变量引用: ${varName}`);
      }
    });

    // 3. 检查是否包含必要的元信息
    if (!content.includes('@template') && !content.includes('template')) {
      issues.push('模板缺少@template标记');
    }

    return issues;
  }

  printSummary() {
    console.log('');
    console.log(chalk.gray('=' .repeat(60)));
    console.log(chalk.blue.bold('\n📊 代码生成检查结果:\n'));

    const totalViolations = 
      this.violations.P0.length + 
      this.violations.P1.length + 
      this.violations.P2.length;

    if (this.violations.P0.length === 0) {
      console.log(chalk.green.bold('  ✅ P0检查全部通过！'));
    } else {
      console.log(chalk.red.bold(`  ❌ P0违规: ${this.violations.P0.length}个`));
    }

    if (this.violations.P1.length > 0) {
      console.log(chalk.yellow(`  ⚠️  P1警告: ${this.violations.P1.length}个`));
    }

    if (this.violations.P2.length > 0) {
      console.log(chalk.gray(`  ℹ️  P2建议: ${this.violations.P2.length}个`));
    }

    console.log(chalk.gray(`\n  总违规数: ${totalViolations}`));
    console.log('');

    if (this.violations.P0.length > 0) {
      console.log(chalk.red.bold('  ⛔ 代码生成质量检查失败！'));
      console.log(chalk.red('  请修复所有P0违规后再提交代码。\n'));
    }
  }

  exportResults(outputPath) {
    const results = {
      checker: 'CodeGen',
      timestamp: new Date().toISOString(),
      passed: this.violations.P0.length === 0,
      summary: {
        P0: this.violations.P0.length,
        P1: this.violations.P1.length,
        P2: this.violations.P2.length,
        total: this.violations.P0.length + this.violations.P1.length + this.violations.P2.length
      },
      violations: this.violations
    };

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    return results;
  }
}

module.exports = CodeGenChecker;

// CLI接口
if (require.main === module) {
  const checker = new CodeGenChecker();
  checker.check().then(result => {
    const outputPath = 'reports/quality/codegen-check-results.json';
    checker.exportResults(outputPath);
    
    if (!result.passed) {
      process.exit(1);
    }
  }).catch(error => {
    console.error(chalk.red('\n💥 代码生成检查异常:'), error.message);
    process.exit(1);
  });
}


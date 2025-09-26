#!/usr/bin/env node
// 🚨 SmartAbp 紧急架构修复脚本 - 自动修复155个架构问题

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 🛠️ 紧急架构修复器
 */
class EmergencyArchitectureFixer {
  constructor(projectRoot = path.join(__dirname, '../src/SmartAbp.Vue')) {
    this.projectRoot = projectRoot;
    this.fixedCount = 0;
    this.failedFixes = [];
  }

  /**
   * 🚨 第一优先级：修复packages目录路径违规
   */
  async fixPackagesPathViolations() {
    console.log('🚨 修复packages目录路径违规...');

    const packagesDir = path.join(this.projectRoot, 'packages');
    const fixes = [
      // 修复相对路径违规
      {
        pattern: /import\s+.*\s+from\s+['"]\.\.\/stores\/([^'"]+)['"]/g,
        replacement: "import $1 from '@smartabp/lowcode-core'",
        description: '修复Store相对路径引用'
      },
      {
        pattern: /import\s+.*\s+from\s+['"]\.\.\/components\/([^'"]+)['"]/g,
        replacement: "import $1 from './components/$1'",
        description: '修复组件相对路径引用'
      },
      {
        pattern: /import\s+.*\s+from\s+['"]\.\.\/utils\/([^'"]+)['"]/g,
        replacement: "import $1 from '@smartabp/lowcode-tools'",
        description: '修复工具函数相对路径引用'
      },

      // 修复@/路径违规
      {
        pattern: /import\s+.*\s+from\s+['"]@\/stores\/lowcode\/([^'"]+)['"]/g,
        replacement: "import $1 from '@smartabp/lowcode-core'",
        description: '修复Store的@/引用'
      },
      {
        pattern: /import\s+.*\s+from\s+['"]@\/components\/lowcode\/([^'"]+)['"]/g,
        replacement: "import $1 from '@smartabp/lowcode-designer'",
        description: '修复低代码组件的@/引用'
      },
      {
        pattern: /import\s+.*\s+from\s+['"]@\/utils\/([^'"]+)['"]/g,
        replacement: "import $1 from '@smartabp/lowcode-tools'",
        description: '修复工具函数的@/引用'
      },
      {
        pattern: /import\s+.*\s+from\s+['"]@\/components\/ui\/([^'"]+)['"]/g,
        replacement: "import $1 from '@smartabp/lowcode-ui-vue'",
        description: '修复UI组件的@/引用'
      }
    ];

    const files = this.findFilesInDirRecursive(packagesDir, ['.ts', '.vue', '.js']);

    for (const file of files) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        let fileChanged = false;

        fixes.forEach(fix => {
          const originalContent = content;
          content = content.replace(fix.pattern, fix.replacement);

          if (content !== originalContent) {
            console.log(`   ✅ ${fix.description}: ${path.relative(this.projectRoot, file)}`);
            fileChanged = true;
            this.fixedCount++;
          }
        });

        if (fileChanged) {
          fs.writeFileSync(file, content, 'utf8');
        }

      } catch (error) {
        this.failedFixes.push({
          file: path.relative(this.projectRoot, file),
          error: error.message
        });
      }
    }
  }

  /**
   * 🔄 第二优先级：合并重复组件
   */
  async fixComponentDuplication() {
    console.log('🔄 处理组件重复问题...');

    // 识别重复的组件模式
    const duplicatePatterns = [
      {
        original: 'src/components/lowcode',
        duplicate: 'packages/lowcode-designer/src/components',
        action: 'MOVE_TO_PACKAGES'
      },
      {
        original: 'src/stores/lowcode',
        duplicate: 'packages/lowcode-core/src/stores',
        action: 'CONSOLIDATE_STORES'
      }
    ];

    // 由于涉及复杂的代码迁移，这里生成修复建议
    duplicatePatterns.forEach(pattern => {
      console.log(`   📋 建议: ${pattern.action} - ${pattern.original} → ${pattern.duplicate}`);
    });
  }

  /**
   * 🏪 第三优先级：Store架构统一
   */
  async fixStoreArchitecture() {
    console.log('🏪 修复Store架构问题...');

    const storeFiles = [
      ...this.findFilesInDir('src/stores'),
      ...this.findFilesInDir('packages/lowcode-core/src/stores')
    ];

    storeFiles.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');
        let fileChanged = false;

        // 修复Store导入路径
        const storeFixes = [
          {
            pattern: /import\s+.*\s+from\s+['"]@\/utils\/logger['"]/g,
            replacement: "import { logger } from '@smartabp/lowcode-tools'",
            description: 'Store中logger导入修复'
          },
          {
            pattern: /import\s+.*\s+from\s+['"]@\/utils\/logging['"]/g,
            replacement: "import { logger } from '@smartabp/lowcode-tools'",
            description: 'Store中logging导入修复'
          }
        ];

        storeFixes.forEach(fix => {
          const originalContent = content;
          content = content.replace(fix.pattern, fix.replacement);

          if (content !== originalContent) {
            console.log(`   ✅ ${fix.description}: ${path.relative(this.projectRoot, file)}`);
            fileChanged = true;
            this.fixedCount++;
          }
        });

        if (fileChanged) {
          fs.writeFileSync(file, content, 'utf8');
        }

      } catch (error) {
        this.failedFixes.push({
          file: path.relative(this.projectRoot, file),
          error: error.message
        });
      }
    });
  }

  /**
   * 📋 第四优先级：清理注释掉的违规代码
   */
  async cleanupCommentedViolations() {
    console.log('📋 清理注释掉的违规代码...');

    const packagesDir = path.join(this.projectRoot, 'packages');
    const files = this.findFilesInDirRecursive(packagesDir, ['.ts', '.vue', '.js']);

    files.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        const cleanedLines = [];
        let fileChanged = false;

        lines.forEach(line => {
          // 移除注释掉的违规相对路径引用
          if (line.trim().startsWith('//') && line.includes('../') && line.includes('import')) {
            console.log(`   🧹 移除违规注释: ${path.relative(this.projectRoot, file)}`);
            fileChanged = true;
            this.fixedCount++;
            return; // 跳过这一行
          }
          cleanedLines.push(line);
        });

        if (fileChanged) {
          fs.writeFileSync(file, cleanedLines.join('\n'), 'utf8');
        }

      } catch (error) {
        this.failedFixes.push({
          file: path.relative(this.projectRoot, file),
          error: error.message
        });
      }
    });
  }

  /**
   * 🎯 执行完整紧急修复
   */
  async runEmergencyFix() {
    console.log('🚨 开始SmartAbp紧急架构修复...\n');
    console.log(`📁 项目路径: ${this.projectRoot}\n`);

    const startTime = Date.now();

    try {
      // 按优先级顺序执行修复
      await this.fixPackagesPathViolations();     // 最高优先级
      await this.fixStoreArchitecture();          // 第二优先级
      await this.cleanupCommentedViolations();    // 第三优先级
      await this.fixComponentDuplication();       // 第四优先级

      const duration = Date.now() - startTime;

      console.log('\n🎯 === 紧急修复完成 ===');
      console.log(`✅ 修复成功: ${this.fixedCount}处`);
      console.log(`❌ 修复失败: ${this.failedFixes.length}处`);
      console.log(`⏰ 总耗时: ${duration}ms`);

      if (this.failedFixes.length > 0) {
        console.log('\n❌ 修复失败的文件:');
        this.failedFixes.forEach(fail => {
          console.log(`   ${fail.file}: ${fail.error}`);
        });
      }

      // 生成修复报告
      this.generateFixReport();

      return {
        success: this.fixedCount > 0,
        fixedCount: this.fixedCount,
        failedCount: this.failedFixes.length,
        duration
      };

    } catch (error) {
      console.error('🚨 紧急修复过程中发生错误:', error);
      throw error;
    }
  }

  generateFixReport() {
    const report = {
      timestamp: new Date().toISOString(),
      fixedCount: this.fixedCount,
      failedFixes: this.failedFixes,
      recommendations: [
        '🔍 运行 "npm run type-check" 验证类型修复',
        '🔍 运行 "npm run lint --fix" 自动修复代码规范',
        '🔍 重新运行架构检查验证修复效果',
        '📦 检查packages目录导出文件的一致性',
        '🚀 执行Git同步保存修复成果'
      ]
    };

    const reportDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportDir, 'emergency-fix-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log(`\n📄 修复报告已保存: reports/emergency-fix-report.json`);
  }

  // ===== 工具方法 =====

  findFilesInDirRecursive(dir, extensions) {
    const files = [];

    const search = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);

        items.forEach(item => {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
            search(fullPath);
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // 忽略权限错误
      }
    };

    search(dir);
    return files;
  }

  findFilesInDir(dirName) {
    const dirPath = path.join(this.projectRoot, dirName);
    if (!fs.existsSync(dirPath)) return [];

    return this.findFilesInDirRecursive(dirPath, ['.ts', '.js', '.vue']);
  }
}

/**
 * ⚡ 快速修复入口
 */
async function quickEmergencyFix() {
  const fixer = new EmergencyArchitectureFixer();

  console.log('⚡ 执行快速紧急修复...');

  try {
    // 只修复最关键的路径违规
    await fixer.fixPackagesPathViolations();
    await fixer.cleanupCommentedViolations();

    console.log(`\n⚡ 快速修复完成: ${fixer.fixedCount}处`);
    return { success: true, fixedCount: fixer.fixedCount };

  } catch (error) {
    console.error('❌ 快速修复失败:', error);
    return { success: false, error: error.message };
  }
}

// 执行修复
if (require.main === module) {
  const fixer = new EmergencyArchitectureFixer();

  const args = process.argv.slice(2);
  const isQuickFix = args.includes('--quick');

  if (isQuickFix) {
    quickEmergencyFix().catch(error => {
      console.error('❌ 快速修复失败:', error);
      process.exit(1);
    });
  } else {
    fixer.runEmergencyFix().then(result => {
      console.log('\n✅ 紧急架构修复完成!');

      if (result.failedCount > 0) {
        console.log('⚠️  部分修复失败，需要手动处理');
        process.exit(1);
      }
    }).catch(error => {
      console.error('❌ 修复失败:', error);
      process.exit(1);
    });
  }
}

module.exports = { EmergencyArchitectureFixer, quickEmergencyFix };

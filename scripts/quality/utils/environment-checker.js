#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - 环境检测器
 * 检查运行环境是否满足质量检查系统的要求
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

class EnvironmentChecker {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  checkNodeVersion() {
    console.log(chalk.blue('🔍 检查Node.js版本...'));
    try {
      const version = process.version;
      const major = parseInt(version.split('.')[0].substring(1));
      
      if (major >= 20) {
        this.checks.push({ name: 'Node.js', status: 'pass', version });
        console.log(chalk.green(`✅ Node.js ${version}`));
      } else {
        this.errors.push({ 
          name: 'Node.js', 
          message: `需要 >=20.19.0，当前: ${version}` 
        });
        console.log(chalk.red(`❌ Node.js版本过低: ${version}`));
      }
    } catch (error) {
      this.errors.push({ name: 'Node.js', message: '未安装' });
    }
  }

  checkNpmVersion() {
    console.log(chalk.blue('🔍 检查npm版本...'));
    try {
      const version = execSync('npm --version', { encoding: 'utf8' }).trim();
      const major = parseInt(version.split('.')[0]);
      
      if (major >= 10) {
        this.checks.push({ name: 'npm', status: 'pass', version });
        console.log(chalk.green(`✅ npm ${version}`));
      } else {
        this.warnings.push({ 
          name: 'npm', 
          message: `建议升级到 >=10.0.0，当前: ${version}` 
        });
        console.log(chalk.yellow(`⚠️ npm版本较低: ${version}`));
      }
    } catch (error) {
      this.errors.push({ name: 'npm', message: '未安装' });
    }
  }

  checkDotnetVersion() {
    console.log(chalk.blue('🔍 检查.NET SDK版本...'));
    try {
      const output = execSync('dotnet --version', { encoding: 'utf8' }).trim();
      const major = parseInt(output.split('.')[0]);
      
      if (major >= 8) {
        this.checks.push({ name: '.NET SDK', status: 'pass', version: output });
        console.log(chalk.green(`✅ .NET SDK ${output}`));
      } else {
        this.warnings.push({ 
          name: '.NET SDK', 
          message: `建议升级到 >=8.0，当前: ${output}` 
        });
        console.log(chalk.yellow(`⚠️ .NET SDK版本较低: ${output}`));
      }
    } catch (error) {
      this.warnings.push({ 
        name: '.NET SDK', 
        message: '未安装（后端检查将跳过）' 
      });
      console.log(chalk.yellow(`⚠️ .NET SDK未安装`));
    }
  }

  checkGit() {
    console.log(chalk.blue('🔍 检查Git版本...'));
    try {
      const version = execSync('git --version', { encoding: 'utf8' }).trim();
      this.checks.push({ name: 'Git', status: 'pass', version });
      console.log(chalk.green(`✅ ${version}`));
    } catch (error) {
      this.errors.push({ name: 'Git', message: '未安装' });
      console.log(chalk.red(`❌ Git未安装`));
    }
  }

  async runAllChecks() {
    console.log(chalk.blue.bold('\n🔧 SmartAbp Quality Guardian - 环境检查\n'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log('');
    
    this.checkNodeVersion();
    this.checkNpmVersion();
    this.checkDotnetVersion();
    this.checkGit();

    console.log('');
    console.log(chalk.gray('=' .repeat(60)));
    console.log(chalk.blue.bold('\n📊 检查结果汇总:\n'));
    console.log(chalk.green(`✅ 通过: ${this.checks.length}项`));
    console.log(chalk.yellow(`⚠️  警告: ${this.warnings.length}项`));
    console.log(chalk.red(`❌ 错误: ${this.errors.length}项`));

    if (this.errors.length > 0) {
      console.log(chalk.red.bold('\n❌ 环境检查失败！请先解决以下问题:\n'));
      this.errors.forEach(err => {
        console.log(chalk.red(`  • ${err.name}: ${err.message}`));
      });
      console.log('');
      process.exit(1);
    }

    if (this.warnings.length > 0) {
      console.log(chalk.yellow.bold('\n⚠️  警告信息:\n'));
      this.warnings.forEach(warn => {
        console.log(chalk.yellow(`  • ${warn.name}: ${warn.message}`));
      });
    }

    console.log(chalk.green.bold('\n✅ 环境检查通过！可以开始质量检查。\n'));
    return {
      passed: true,
      checks: this.checks,
      warnings: this.warnings,
      errors: this.errors
    };
  }
}

module.exports = EnvironmentChecker;

// CLI接口
if (require.main === module) {
  const checker = new EnvironmentChecker();
  checker.runAllChecks().catch(error => {
    console.error(chalk.red('\n💥 环境检查异常:'), error.message);
    process.exit(1);
  });
}


#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - 文件扫描器
 * 智能文件扫描和分类系统
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class FileScanner {
  constructor(config = {}) {
    this.config = config;
    this.projectRoot = this.findProjectRoot();
    this.scannedFiles = {
      frontend: [],
      backend: [],
      config: [],
      test: [],
      total: 0
    };
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

  async scan() {
    console.log(chalk.blue('🔍 开始扫描项目文件...'));
    console.log('');

    // 扫描前端文件
    await this.scanFrontendFiles();

    // 扫描后端文件
    await this.scanBackendFiles();

    // 扫描配置文件
    await this.scanConfigFiles();

    // 汇总统计
    this.printSummary();

    return this.scannedFiles;
  }

  async scanFrontendFiles() {
    console.log(chalk.blue('  📁 扫描前端文件...'));
    
    const frontendDirs = [
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages'
    ];

    const extensions = ['.ts', '.vue', '.js', '.tsx', '.jsx'];

    for (const dir of frontendDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        const files = this.scanDirectory(fullPath, extensions, [
          'node_modules',
          'dist',
          'coverage',
          '.nuxt',
          '.output'
        ]);
        this.scannedFiles.frontend.push(...files);
      }
    }

    console.log(chalk.green(`     ✅ 前端文件: ${this.scannedFiles.frontend.length}个`));
  }

  async scanBackendFiles() {
    console.log(chalk.blue('  📁 扫描后端文件...'));
    
    const backendDirs = [
      'src/SmartAbp.Application',
      'src/SmartAbp.Application.Contracts',
      'src/SmartAbp.Domain',
      'src/SmartAbp.Domain.Shared',
      'src/SmartAbp.EntityFrameworkCore',
      'src/SmartAbp.HttpApi',
      'src/SmartAbp.HttpApi.Client'
    ];

    const extensions = ['.cs'];

    for (const dir of backendDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        const files = this.scanDirectory(fullPath, extensions, [
          'obj',
          'bin',
          'Migrations',
          '.vs'
        ]);
        this.scannedFiles.backend.push(...files);
      }
    }

    console.log(chalk.green(`     ✅ 后端文件: ${this.scannedFiles.backend.length}个`));
  }

  async scanConfigFiles() {
    console.log(chalk.blue('  📁 扫描配置文件...'));
    
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      '.eslintrc.js',
      'config/quality-config.json',
      'config/quality-rules.json'
    ];

    for (const file of configFiles) {
      const fullPath = path.join(this.projectRoot, file);
      if (fs.existsSync(fullPath)) {
        this.scannedFiles.config.push({
          path: fullPath,
          relativePath: file,
          size: fs.statSync(fullPath).size
        });
      }
    }

    console.log(chalk.green(`     ✅ 配置文件: ${this.scannedFiles.config.length}个`));
  }

  scanDirectory(dir, extensions, excludeDirs = []) {
    const files = [];

    const scan = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;

      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        // 跳过排除目录
        if (entry.isDirectory()) {
          if (!excludeDirs.some(exclude => entry.name.includes(exclude))) {
            scan(fullPath);
          }
          continue;
        }

        // 检查文件扩展名
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          const stats = fs.statSync(fullPath);
          files.push({
            path: fullPath,
            relativePath: path.relative(this.projectRoot, fullPath),
            size: stats.size,
            extension: ext,
            lines: this.countLines(fullPath)
          });
        }
      }
    };

    scan(dir);
    return files;
  }

  countLines(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').length;
    } catch (error) {
      return 0;
    }
  }

  printSummary() {
    console.log('');
    console.log(chalk.gray('=' .repeat(60)));
    console.log(chalk.blue.bold('\n📊 扫描结果汇总:\n'));

    const totalFiles = this.scannedFiles.frontend.length + 
                      this.scannedFiles.backend.length + 
                      this.scannedFiles.config.length;

    const totalLines = [
      ...this.scannedFiles.frontend,
      ...this.scannedFiles.backend
    ].reduce((sum, file) => sum + (file.lines || 0), 0);

    console.log(chalk.white(`  总文件数: ${chalk.bold(totalFiles.toLocaleString())} 个`));
    console.log(chalk.white(`  总代码行: ${chalk.bold(totalLines.toLocaleString())} 行`));
    console.log('');
    console.log(chalk.cyan(`  前端文件: ${this.scannedFiles.frontend.length.toLocaleString()} 个`));
    console.log(chalk.cyan(`  后端文件: ${this.scannedFiles.backend.length.toLocaleString()} 个`));
    console.log(chalk.cyan(`  配置文件: ${this.scannedFiles.config.length.toLocaleString()} 个`));
    console.log('');

    this.scannedFiles.total = totalFiles;
    this.scannedFiles.totalLines = totalLines;
  }

  // 按文件类型分组
  groupByExtension() {
    const groups = {};

    const addToGroup = (file) => {
      const ext = file.extension || path.extname(file.path);
      if (!groups[ext]) {
        groups[ext] = [];
      }
      groups[ext].push(file);
    };

    this.scannedFiles.frontend.forEach(addToGroup);
    this.scannedFiles.backend.forEach(addToGroup);

    return groups;
  }

  // 查找大文件（>500行）
  findLargeFiles(threshold = 500) {
    const allFiles = [
      ...this.scannedFiles.frontend,
      ...this.scannedFiles.backend
    ];

    return allFiles
      .filter(file => file.lines > threshold)
      .sort((a, b) => b.lines - a.lines);
  }

  // 导出结果
  exportResults(outputPath) {
    const results = {
      timestamp: new Date().toISOString(),
      projectRoot: this.projectRoot,
      summary: {
        totalFiles: this.scannedFiles.total,
        totalLines: this.scannedFiles.totalLines,
        frontendFiles: this.scannedFiles.frontend.length,
        backendFiles: this.scannedFiles.backend.length,
        configFiles: this.scannedFiles.config.length
      },
      files: this.scannedFiles,
      groupByExtension: this.groupByExtension(),
      largeFiles: this.findLargeFiles()
    };

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(chalk.green(`✅ 扫描结果已导出: ${outputPath}`));
  }
}

module.exports = FileScanner;

// CLI接口
if (require.main === module) {
  const scanner = new FileScanner();
  scanner.scan().then(() => {
    const outputPath = 'reports/quality/file-scan-results.json';
    scanner.exportResults(outputPath);
  }).catch(error => {
    console.error(chalk.red('\n💥 文件扫描失败:'), error.message);
    process.exit(1);
  });
}


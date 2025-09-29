#!/usr/bin/env node

/**
 * SmartAbp Serena MCP Server
 * 基于现有.serena配置的简化MCP服务实现
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class SmartAbpSerenaMCP {
  constructor() {
    this.projectRoot = process.env.SERENA_PROJECT_ROOT || process.cwd();
    this.configPath = path.join(this.projectRoot, '.serena', 'project.yml');
    this.indexPath = path.join(this.projectRoot, '.serena', 'project_files_index.txt');
    this.memoriesDir = path.join(this.projectRoot, '.serena', 'memories');
    
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configContent = fs.readFileSync(this.configPath, 'utf8');
        this.config = yaml.load(configContent);
        console.log(`[Serena MCP] 配置加载成功: ${this.config.project_name || 'SmartAbp'}`);
      }
    } catch (error) {
      console.error(`[Serena MCP] 配置加载失败: ${error.message}`);
    }
  }

  // 获取项目符号概览
  getSymbolsOverview(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) {
      return { error: `文件不存在: ${filePath}` };
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const symbols = this.extractSymbols(content, filePath);
      return {
        file: filePath,
        language: this.config?.language || 'typescript',
        symbols: symbols
      };
    } catch (error) {
      return { error: `读取文件失败: ${error.message}` };
    }
  }

  // 提取代码符号（简化版）
  extractSymbols(content, filePath) {
    const symbols = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // TypeScript/JavaScript 符号提取
      if (filePath.endsWith('.ts') || filePath.endsWith('.js') || filePath.endsWith('.vue')) {
        // 类定义
        const classMatch = line.match(/export\s+(?:abstract\s+)?class\s+(\w+)/);
        if (classMatch) {
          symbols.push({
            name: classMatch[1],
            type: 'class',
            line: lineNum,
            exported: true
          });
        }

        // 接口定义
        const interfaceMatch = line.match(/export\s+interface\s+(\w+)/);
        if (interfaceMatch) {
          symbols.push({
            name: interfaceMatch[1],
            type: 'interface',
            line: lineNum,
            exported: true
          });
        }

        // 函数定义
        const functionMatch = line.match(/export\s+(?:async\s+)?function\s+(\w+)/);
        if (functionMatch) {
          symbols.push({
            name: functionMatch[1],
            type: 'function',
            line: lineNum,
            exported: true
          });
        }

        // 组件定义（Vue）
        const componentMatch = line.match(/export\s+default\s+defineComponent|<script.*setup>/);
        if (componentMatch && filePath.endsWith('.vue')) {
          const componentName = path.basename(filePath, '.vue');
          symbols.push({
            name: componentName,
            type: 'vue-component',
            line: lineNum,
            exported: true
          });
        }
      }

      // C# 符号提取
      if (filePath.endsWith('.cs')) {
        // 类定义
        const classMatch = line.match(/public\s+(?:abstract\s+)?class\s+(\w+)/);
        if (classMatch) {
          symbols.push({
            name: classMatch[1],
            type: 'class',
            line: lineNum,
            exported: true
          });
        }

        // 接口定义
        const interfaceMatch = line.match(/public\s+interface\s+(\w+)/);
        if (interfaceMatch) {
          symbols.push({
            name: interfaceMatch[1],
            type: 'interface',
            line: lineNum,
            exported: true
          });
        }
      }
    });

    return symbols;
  }

  // 列出目录内容
  listDir(dirPath, recursive = false) {
    const fullPath = path.join(this.projectRoot, dirPath || '');
    if (!fs.existsSync(fullPath)) {
      return { error: `目录不存在: ${dirPath}` };
    }

    try {
      const items = [];
      const entries = fs.readdirSync(fullPath);

      entries.forEach(entry => {
        const entryPath = path.join(fullPath, entry);
        const relativePath = path.relative(this.projectRoot, entryPath);
        const stats = fs.statSync(entryPath);

        const item = {
          name: entry,
          path: relativePath,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime
        };

        items.push(item);

        // 递归处理子目录
        if (recursive && stats.isDirectory() && !this.shouldIgnore(entry)) {
          const subItems = this.listDir(relativePath, true);
          if (subItems.items) {
            items.push(...subItems.items);
          }
        }
      });

      return { items };
    } catch (error) {
      return { error: `读取目录失败: ${error.message}` };
    }
  }

  // 检查是否应该忽略文件/目录
  shouldIgnore(name) {
    const ignoredPatterns = [
      'node_modules', '.git', 'bin', 'obj', 'dist', 'build',
      '.DS_Store', 'Thumbs.db', '*.log', '*.tmp'
    ];
    
    return ignoredPatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(name);
      }
      return name === pattern;
    });
  }

  // 更新项目索引
  updateIndex() {
    console.log('[Serena MCP] 开始更新项目代码索引...');
    
    const indexData = {
      timestamp: new Date().toISOString(),
      project: this.config?.project_name || 'SmartAbp',
      language: this.config?.language || 'typescript',
      files: [],
      symbols: []
    };

    // 扫描主要源代码目录
    const sourceDirs = [
      'src/SmartAbp.Application',
      'src/SmartAbp.Domain', 
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages'
    ];

    sourceDirs.forEach(dir => {
      const dirData = this.listDir(dir, true);
      if (dirData.items) {
        dirData.items.forEach(item => {
          if (item.type === 'file' && this.isSourceFile(item.name)) {
            indexData.files.push(item);
            
            // 提取符号
            const symbols = this.getSymbolsOverview(item.path);
            if (symbols.symbols) {
              indexData.symbols.push(...symbols.symbols.map(symbol => ({
                ...symbol,
                file: item.path
              })));
            }
          }
        });
      }
    });

    // 保存索引
    try {
      const indexContent = JSON.stringify(indexData, null, 2);
      fs.writeFileSync(path.join(this.projectRoot, '.serena', 'project_index.json'), indexContent);
      
      // 更新文本索引（兼容现有格式）
      const textIndex = indexData.files.map(f => f.path).join('\n');
      fs.writeFileSync(this.indexPath, textIndex);
      
      console.log(`[Serena MCP] 索引更新完成: ${indexData.files.length} 个文件, ${indexData.symbols.length} 个符号`);
      
      return {
        success: true,
        filesCount: indexData.files.length,
        symbolsCount: indexData.symbols.length,
        timestamp: indexData.timestamp
      };
    } catch (error) {
      console.error(`[Serena MCP] 索引保存失败: ${error.message}`);
      return { error: error.message };
    }
  }

  // 判断是否为源代码文件
  isSourceFile(filename) {
    const extensions = ['.ts', '.js', '.vue', '.cs', '.json', '.md', '.yml', '.yaml'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  // MCP 服务主入口
  start() {
    console.log('[Serena MCP] SmartAbp项目MCP服务启动');
    console.log(`[Serena MCP] 项目根目录: ${this.projectRoot}`);
    console.log(`[Serena MCP] 配置文件: ${this.configPath}`);
    
    // 立即更新索引
    this.updateIndex();
    
    // 设置定期更新（每10分钟）
    setInterval(() => {
      this.updateIndex();
    }, 10 * 60 * 1000);
    
    console.log('[Serena MCP] 服务运行中...');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const server = new SmartAbpSerenaMCP();
  server.start();
}

module.exports = SmartAbpSerenaMCP;

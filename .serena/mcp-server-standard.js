#!/usr/bin/env node

/**
 * SmartAbp Serena MCP Server - 标准MCP协议实现
 * 基于@modelcontextprotocol/sdk的标准MCP服务器
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  CallToolResult,
  ListToolsResult,
  Tool 
} = require('@modelcontextprotocol/sdk/types.js');

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const DependencyAnalyzer = require('./mcp-dependency-analyzer.js');
const CodeQualityChecker = require('./mcp-code-quality-checker.js');
const SecurityScanner = require('./mcp-security-scanner.js');
const PerformanceAnalyzer = require('./mcp-performance-analyzer.js');

class SmartAbpSerenaMCPServer {
  constructor() {
    this.projectRoot = process.env.SERENA_PROJECT_ROOT || process.cwd();
    this.configPath = path.join(this.projectRoot, '.serena', 'project.yml');
    this.indexPath = path.join(this.projectRoot, '.serena', 'project_files_index.txt');
    this.memoriesDir = path.join(this.projectRoot, '.serena', 'memories');
    
    // 初始化分析工具
    this.dependencyAnalyzer = new DependencyAnalyzer(this.projectRoot);
    this.codeQualityChecker = new CodeQualityChecker(this.projectRoot);
    this.securityScanner = new SecurityScanner(this.projectRoot);
    this.performanceAnalyzer = new PerformanceAnalyzer(this.projectRoot);
    
    this.server = new Server(
      {
        name: 'smartabp-serena',
        version: '1.0.0',
        description: 'SmartAbp项目的Serena代码索引和分析服务'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.loadConfig();
    this.setupHandlers();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configContent = fs.readFileSync(this.configPath, 'utf8');
        this.config = yaml.load(configContent);
        console.error(`[Serena MCP] 配置加载成功: ${this.config.project_name || 'SmartAbp'}`);
      }
    } catch (error) {
      console.error(`[Serena MCP] 配置加载失败: ${error.message}`);
    }
  }

  setupHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'mcp_serena_get_symbols_overview',
            description: '获取指定文件的符号概览（类、接口、函数等）',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: '要分析的文件路径（相对于项目根目录）'
                }
              },
              required: ['filePath']
            }
          },
          ...DependencyAnalyzer.getToolDefinitions(),
          ...CodeQualityChecker.getToolDefinitions(),
          ...SecurityScanner.getToolDefinitions(),
          ...PerformanceAnalyzer.getToolDefinitions(),
          {
            name: 'mcp_serena_list_dir',
            description: '列出指定目录的内容，支持递归扫描',
            inputSchema: {
              type: 'object',
              properties: {
                dirPath: {
                  type: 'string',
                  description: '要列出的目录路径（相对于项目根目录）'
                },
                recursive: {
                  type: 'boolean',
                  description: '是否递归扫描子目录',
                  default: false
                }
              },
              required: ['dirPath']
            }
          },
          {
            name: 'mcp_serena_find_symbol',
            description: '在项目中搜索指定名称的符号',
            inputSchema: {
              type: 'object',
              properties: {
                symbolName: {
                  type: 'string',
                  description: '要搜索的符号名称'
                },
                symbolType: {
                  type: 'string',
                  description: '符号类型过滤（class, interface, function, vue-component）',
                  enum: ['class', 'interface', 'function', 'vue-component']
                }
              },
              required: ['symbolName']
            }
          },
          {
            name: 'mcp_serena_update_index',
            description: '更新项目代码索引库',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false
            }
          }
        ]
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'mcp_serena_get_symbols_overview':
            return this.handleGetSymbolsOverview(args.filePath);
          
          case 'mcp_serena_list_dir':
            return this.handleListDir(args.dirPath, args.recursive);
          
          case 'mcp_serena_find_symbol':
            return this.handleFindSymbol(args.symbolName, args.symbolType);
          
          case 'mcp_serena_update_index':
            return this.handleUpdateIndex();
          
          // 依赖分析工具
          case 'mcp_dependency_analyze_full':
          case 'mcp_dependency_check_violations':
          case 'mcp_dependency_graph':
            return this.handleDependencyAnalysis(name, args);
          
          // 代码质量检查工具
          case 'mcp_code_quality_analyze_full':
          case 'mcp_code_quality_check_specific':
          case 'mcp_code_quality_get_score':
            return this.handleCodeQualityAnalysis(name, args);
          
          // 安全扫描工具
          case 'mcp_security_vulnerability_scanner':
          case 'mcp_security_sensitive_data_detector':
          case 'mcp_security_authentication_analyzer':
          case 'mcp_security_dependency_audit':
          case 'mcp_security_compliance_checker':
            return this.handleSecurityAnalysis(name, args);
          
          // 性能分析工具
          case 'mcp_performance_bundle_analyzer':
          case 'mcp_performance_memory_analyzer':
          case 'mcp_performance_runtime_profiler':
          case 'mcp_performance_load_test_generator':
          case 'mcp_performance_database_optimizer':
          case 'mcp_performance_monitoring_setup':
            return this.handlePerformanceAnalysis(name, args);
          
          default:
            throw new Error(`未知的工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  handleGetSymbolsOverview(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const symbols = this.extractSymbols(content, filePath);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              file: filePath,
              language: this.config?.language || 'typescript',
              symbolCount: symbols.length,
              symbols: symbols
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`读取文件失败: ${error.message}`);
    }
  }

  handleListDir(dirPath, recursive = false) {
    const fullPath = path.join(this.projectRoot, dirPath || '');
    if (!fs.existsSync(fullPath)) {
      throw new Error(`目录不存在: ${dirPath}`);
    }

    try {
      const result = this.listDir(dirPath, recursive);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`读取目录失败: ${error.message}`);
    }
  }

  handleFindSymbol(symbolName, symbolType) {
    try {
      // 从索引中搜索符号
      const indexFile = path.join(this.projectRoot, '.serena', 'project_index.json');
      if (!fs.existsSync(indexFile)) {
        throw new Error('项目索引不存在，请先运行更新索引');
      }

      const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
      let symbols = indexData.symbols || [];

      // 按名称过滤
      symbols = symbols.filter(symbol => 
        symbol.name && symbol.name.toLowerCase().includes(symbolName.toLowerCase())
      );

      // 按类型过滤
      if (symbolType) {
        symbols = symbols.filter(symbol => symbol.type === symbolType);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              searchTerm: symbolName,
              symbolType: symbolType || 'all',
              matchCount: symbols.length,
              matches: symbols
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`搜索符号失败: ${error.message}`);
    }
  }

  handleUpdateIndex() {
    try {
      console.error('[Serena MCP] 开始更新项目代码索引...');
      
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
      const indexContent = JSON.stringify(indexData, null, 2);
      fs.writeFileSync(path.join(this.projectRoot, '.serena', 'project_index.json'), indexContent);
      
      // 更新文本索引（兼容现有格式）
      const textIndex = indexData.files.map(f => f.path).join('\n');
      fs.writeFileSync(this.indexPath, textIndex);
      
      console.error(`[Serena MCP] 索引更新完成: ${indexData.files.length} 个文件, ${indexData.symbols.length} 个符号`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              filesCount: indexData.files.length,
              symbolsCount: indexData.symbols.length,
              timestamp: indexData.timestamp
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`索引更新失败: ${error.message}`);
    }
  }

  // 处理依赖分析工具调用
  async handleDependencyAnalysis(toolName, args) {
    try {
      const result = await this.dependencyAnalyzer.handleToolCall(toolName, args);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`依赖分析失败: ${error.message}`);
    }
  }

  // 处理代码质量分析工具调用
  async handleCodeQualityAnalysis(toolName, args) {
    try {
      const result = await this.codeQualityChecker.handleToolCall(toolName, args);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`代码质量分析失败: ${error.message}`);
    }
  }

  // 处理安全扫描工具调用
  async handleSecurityAnalysis(toolName, args) {
    try {
      const result = await this.securityScanner.handleToolCall(toolName, args);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`安全扫描失败: ${error.message}`);
    }
  }

  // 处理性能分析工具调用
  async handlePerformanceAnalysis(toolName, args) {
    try {
      const result = await this.performanceAnalyzer.handleToolCall(toolName, args);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`性能分析失败: ${error.message}`);
    }
  }

  // 复用之前的工具方法
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

  isSourceFile(filename) {
    const extensions = ['.ts', '.js', '.vue', '.cs', '.json', '.md', '.yml', '.yaml'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  async start() {
    console.error('[Serena MCP] SmartAbp项目MCP服务启动');
    console.error(`[Serena MCP] 项目根目录: ${this.projectRoot}`);
    console.error(`[Serena MCP] 配置文件: ${this.configPath}`);
    
    // 立即更新索引
    this.handleUpdateIndex();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('[Serena MCP] 标准MCP服务运行中...');
  }
}

// 启动服务
const server = new SmartAbpSerenaMCPServer();
server.start().catch(console.error);

#!/usr/bin/env node

/**
 * SmartAbp MCP智能调用器
 * 演示AI大模型如何智能使用MCP工具
 */

const { spawn } = require('child_process');
const path = require('path');

class MCPIntelligentCaller {
  constructor() {
    this.mcpServerPath = path.join(__dirname, 'mcp-server-standard.js');
    this.taskTypeDetector = {
      '架构设计': ['DDD', 'CQRS', '微服务', '设计模式', '领域模型', '聚合根'],
      '代码编写': ['组件', '函数', '类', '接口', 'Vue', 'TypeScript', 'C#'], 
      '性能优化': ['内存', '渲染', 'API', '数据库', '缓存', '优化'],
      '安全防护': ['漏洞', '敏感信息', '认证', '依赖', 'SQL注入', 'XSS'],
      '质量检查': ['复杂度', '重复度', '类型', '测试', 'ESLint', '代码规范'],
      '依赖管理': ['包管理', 'npm', 'NuGet', '版本', '循环依赖'],
      '技术债务': ['重构', '维护', '文档', '测试覆盖', '代码年龄']
    };
  }

  /**
   * 智能分析用户需求并选择合适的MCP工具
   */
  analyzeUserRequest(userQuery) {
    const keywords = this.extractKeywords(userQuery.toLowerCase());
    const recommendedTools = [];
    const analysisReason = [];

    keywords.forEach(keyword => {
      if (this.taskTypeDetector['架构设计'].some(k => keyword.includes(k))) {
        recommendedTools.push(
          'mcp_architecture_ddd_validator', 
          'mcp_dependency_analyze_full'
        );
        analysisReason.push(`检测到架构设计需求: "${keyword}"`);
      }
      
      if (this.taskTypeDetector['性能优化'].some(k => keyword.includes(k))) {
        recommendedTools.push(
          'mcp_performance_memory_analyzer', 
          'mcp_performance_runtime_profiler'
        );
        analysisReason.push(`检测到性能优化需求: "${keyword}"`);
      }
      
      if (this.taskTypeDetector['安全防护'].some(k => keyword.includes(k))) {
        recommendedTools.push(
          'mcp_security_vulnerability_scanner',
          'mcp_security_sensitive_data_detector'
        );
        analysisReason.push(`检测到安全防护需求: "${keyword}"`);
      }
      
      if (this.taskTypeDetector['质量检查'].some(k => keyword.includes(k))) {
        recommendedTools.push(
          'mcp_code_quality_analyze_full',
          'mcp_code_quality_get_score'
        );
        analysisReason.push(`检测到质量检查需求: "${keyword}"`);
      }
      
      if (this.taskTypeDetector['技术债务'].some(k => keyword.includes(k))) {
        recommendedTools.push(
          'mcp_tech_debt_quantifier',
          'mcp_tech_debt_refactoring_advisor'
        );
        analysisReason.push(`检测到技术债务管理需求: "${keyword}"`);
      }
    });

    return {
      recommendedTools: [...new Set(recommendedTools)], // 去重
      analysisReason: analysisReason,
      confidence: this.calculateConfidence(keywords, recommendedTools)
    };
  }

  /**
   * 提取关键词
   */
  extractKeywords(text) {
    // 简化的关键词提取，实际应用中可以使用更复杂的NLP技术
    const words = text.split(/\s+/);
    const stopWords = ['的', '是', '在', '有', '和', '或', '但', '如果', '因为', '所以'];
    return words.filter(word => word.length > 1 && !stopWords.includes(word));
  }

  /**
   * 计算推荐置信度
   */
  calculateConfidence(keywords, recommendedTools) {
    if (recommendedTools.length === 0) return 0;
    
    const relevantKeywords = keywords.filter(keyword => 
      Object.values(this.taskTypeDetector).some(category => 
        category.some(term => keyword.includes(term))
      )
    );
    
    return Math.min(100, (relevantKeywords.length / keywords.length) * 100);
  }

  /**
   * 调用MCP工具
   */
  async callMCPTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
      const mcpProcess = spawn('node', [this.mcpServerPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      let output = '';
      let errorOutput = '';

      mcpProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      mcpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      mcpProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // 解析JSON响应
            const lines = output.trim().split('\n');
            const jsonResponse = lines.find(line => line.startsWith('{'));
            if (jsonResponse) {
              const result = JSON.parse(jsonResponse);
              resolve(result);
            } else {
              resolve({ output: output, error: 'No JSON response found' });
            }
          } catch (parseError) {
            resolve({ output: output, parseError: parseError.message });
          }
        } else {
          reject(new Error(`MCP工具调用失败: ${errorOutput}`));
        }
      });

      // 发送请求
      mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      mcpProcess.stdin.end();
    });
  }

  /**
   * 智能执行编码前分析
   */
  async executePrecodingAnalysis(userRequest) {
    console.log("🔍 执行编码前智能分析...");
    
    const analysis = this.analyzeUserRequest(userRequest);
    console.log(`📊 分析置信度: ${analysis.confidence}%`);
    console.log(`🎯 分析原因: ${analysis.analysisReason.join('; ')}`);
    
    const results = {};
    
    // 1. 检查项目符号（避免重复开发）
    try {
      console.log("🔍 检查现有符号...");
      const symbolSearch = await this.callMCPTool('mcp_serena_find_symbol', {
        symbolName: this.extractEntityName(userRequest) || 'User'
      });
      results.symbolCheck = symbolSearch;
    } catch (error) {
      results.symbolCheck = { error: error.message };
    }

    // 2. 依赖分析（如果涉及架构）
    if (analysis.recommendedTools.includes('mcp_dependency_analyze_full')) {
      try {
        console.log("🔗 执行依赖分析...");
        const dependencyAnalysis = await this.callMCPTool('mcp_dependency_analyze_full', {
          analysisScope: 'project'
        });
        results.dependencyAnalysis = dependencyAnalysis;
      } catch (error) {
        results.dependencyAnalysis = { error: error.message };
      }
    }

    // 3. 代码质量检查（如果涉及质量）
    if (analysis.recommendedTools.includes('mcp_code_quality_get_score')) {
      try {
        console.log("📊 执行代码质量检查...");
        const qualityScore = await this.callMCPTool('mcp_code_quality_get_score', {
          includeAllMetrics: true
        });
        results.qualityScore = qualityScore;
      } catch (error) {
        results.qualityScore = { error: error.message };
      }
    }

    return {
      analysis: analysis,
      results: results,
      recommendations: this.generateRecommendations(analysis, results)
    };
  }

  /**
   * 提取实体名称
   */
  extractEntityName(text) {
    // 简化的实体名称提取
    const entityPatterns = [
      /创建(\w+)组件/,
      /开发(\w+)服务/,
      /实现(\w+)功能/,
      /(\w+)管理/
    ];
    
    for (const pattern of entityPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  /**
   * 生成智能建议
   */
  generateRecommendations(analysis, results) {
    const recommendations = [];
    
    // 基于符号检查的建议
    if (results.symbolCheck && results.symbolCheck.result) {
      const symbolResult = JSON.parse(results.symbolCheck.result.content[0].text);
      if (symbolResult.matchCount > 0) {
        recommendations.push({
          type: 'warning',
          message: `发现${symbolResult.matchCount}个相似组件，建议复用现有实现避免重复开发`,
          matches: symbolResult.matches
        });
      } else {
        recommendations.push({
          type: 'success',
          message: '未发现重复组件，可以安全创建新功能'
        });
      }
    }

    // 基于质量检查的建议
    if (results.qualityScore && results.qualityScore.result) {
      try {
        const qualityResult = JSON.parse(results.qualityScore.result.content[0].text);
        if (qualityResult.overallScore < 95) {
          recommendations.push({
            type: 'warning',
            message: `当前项目质量评分: ${qualityResult.overallScore}/100，建议先优化现有代码质量`
          });
        } else {
          recommendations.push({
            type: 'success',
            message: `项目质量优秀(${qualityResult.overallScore}/100)，可以继续开发新功能`
          });
        }
      } catch (parseError) {
        // 静默处理解析错误
      }
    }

    // 基于依赖分析的建议
    if (results.dependencyAnalysis && results.dependencyAnalysis.result) {
      recommendations.push({
        type: 'info',
        message: '依赖分析完成，请注意遵循现有架构约束'
      });
    }

    return recommendations;
  }

  /**
   * 演示智能工具调用
   */
  async demonstrateIntelligentUsage() {
    console.log("🎉 SmartAbp MCP智能调用器演示");
    console.log("=".repeat(50));

    const testScenarios = [
      {
        name: "场景1: 创建用户管理组件",
        query: "我要创建一个用户管理组件，包含CRUD功能"
      },
      {
        name: "场景2: 性能优化分析", 
        query: "项目运行很慢，需要进行内存优化"
      },
      {
        name: "场景3: 安全漏洞检查",
        query: "检查项目是否存在SQL注入和XSS漏洞"
      },
      {
        name: "场景4: 代码质量评估",
        query: "评估当前代码质量，看是否达到95分标准"
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`\n🎯 ${scenario.name}`);
      console.log(`📝 用户需求: "${scenario.query}"`);
      console.log("-".repeat(40));
      
      try {
        const result = await this.executePrecodingAnalysis(scenario.query);
        
        console.log(`🧠 AI分析结果:`);
        console.log(`   推荐工具: ${result.analysis.recommendedTools.join(', ')}`);
        console.log(`   置信度: ${result.analysis.confidence}%`);
        
        console.log(`💡 智能建议:`);
        result.recommendations.forEach((rec, index) => {
          const icon = rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`   ${icon} ${rec.message}`);
        });
        
      } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
      }
    }
  }
}

// 如果直接运行此脚本，执行演示
if (require.main === module) {
  const caller = new MCPIntelligentCaller();
  caller.demonstrateIntelligentUsage()
    .then(() => {
      console.log("\n🎉 智能调用演示完成！");
      console.log("📖 更多详细说明请查看: .serena/mcp-ai-intelligent-usage-strategy.md");
    })
    .catch(console.error);
}

module.exports = MCPIntelligentCaller;

#!/usr/bin/env node

/**
 * 模板搜索脚本
 * 提供命令行接口搜索和应用模板
 */

const fs = require('fs');
const path = require('path');

// Resolve the repository-level templates directory by walking up from current file
function resolveTemplatesDir(startDir) {
  let currentDir = startDir;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(currentDir, 'templates');
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch (e) {
      // ignore and continue walking up
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }
  // Fallback to cwd/templates
  return path.resolve(process.cwd(), 'templates');
}

class TemplateSearcher {
  constructor() {
    this.templatesDir = resolveTemplatesDir(__dirname);
    this.indexPath = path.join(this.templatesDir, 'index.json');
    this.index = null;
  }

  /**
   * 初始化
   */
  async init() {
    if (!fs.existsSync(this.indexPath)) {
      console.error('❌ 模板索引文件不存在，请先运行: npm run template:index');
      process.exit(1);
    }

    try {
      const content = fs.readFileSync(this.indexPath, 'utf8');
      this.index = JSON.parse(content);
    } catch (error) {
      console.error('❌ 读取模板索引失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 搜索模板
   */
  search(query, options = {}) {
    if (!this.index) {
      throw new Error('模板索引未初始化');
    }

    const results = this.index.templates.filter(template => {
      // 按分类筛选
      if (options.category && !template.category.includes(options.category)) {
        return false;
      }

      // 按类型筛选
      if (options.type && template.type !== options.type) {
        return false;
      }

      // 按标签筛选
      if (options.tags && options.tags.length > 0) {
        const hasTag = options.tags.some(tag =>
          template.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasTag) return false;
      }

      // 文本搜索
      if (query) {
        const searchText = query.toLowerCase();
        return (
          template.name.toLowerCase().includes(searchText) ||
          template.id.toLowerCase().includes(searchText) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchText)) ||
          template.ai_triggers.some(trigger => trigger.toLowerCase().includes(searchText)) ||
          template.scenarios.some(scenario => scenario.toLowerCase().includes(searchText))
        );
      }

      return true;
    });

    return results;
  }

  /**
   * 按AI触发词搜索
   */
  searchByTrigger(trigger) {
    if (!this.index) {
      throw new Error('模板索引未初始化');
    }

    const triggerLower = trigger.toLowerCase();

    return this.index.templates.filter(template =>
      template.ai_triggers.some(t => t.toLowerCase().includes(triggerLower))
    ).sort((a, b) => {
      // 按匹配度排序
      const aScore = this.calculateMatchScore(a, triggerLower);
      const bScore = this.calculateMatchScore(b, triggerLower);
      return bScore - aScore;
    });
  }

  /**
   * 计算匹配分数
   */
  calculateMatchScore(template, trigger) {
    let score = 0;

    // 精确匹配得分更高
    template.ai_triggers.forEach(t => {
      if (t.toLowerCase() === trigger) {
        score += 10;
      } else if (t.toLowerCase().includes(trigger)) {
        score += 5;
      }
    });

    // 标签匹配
    template.tags.forEach(tag => {
      if (tag.toLowerCase().includes(trigger)) {
        score += 3;
      }
    });

    // 名称匹配
    if (template.name.toLowerCase().includes(trigger)) {
      score += 2;
    }

    return score;
  }

  /**
   * 获取推荐模板
   */
  getRecommendations(context = {}) {
    if (!this.index) {
      throw new Error('模板索引未初始化');
    }

    const { entityType, operation, framework } = context;
    let candidates = [...this.index.templates];

    // 按上下文筛选
    if (entityType) {
      candidates = candidates.filter(t =>
        t.scenarios.some(s => s.includes(entityType)) ||
        t.ai_triggers.some(trigger => trigger.includes(entityType))
      );
    }

    if (operation) {
      candidates = candidates.filter(t =>
        t.ai_triggers.some(trigger => trigger.includes(operation)) ||
        t.tags.some(tag => tag.includes(operation))
      );
    }

    if (framework) {
      candidates = candidates.filter(t =>
        t.dependencies.some(dep => dep.toLowerCase().includes(framework.toLowerCase())) ||
        t.category.includes(framework.toLowerCase())
      );
    }

    // 按使用频率和质量排序（这里简化为按依赖数量）
    return candidates.sort((a, b) => {
      return (b.dependencies.length + b.ai_triggers.length) -
             (a.dependencies.length + a.ai_triggers.length);
    }).slice(0, 5);
  }

  /**
   * 显示模板详情
   */
  showTemplate(templateId) {
    if (!this.index) {
      throw new Error('模板索引未初始化');
    }

    const template = this.index.templates.find(t => t.id === templateId);
    if (!template) {
      console.log(`❌ 未找到模板: ${templateId}`);
      return;
    }

    console.log(`\n📋 模板详情: ${template.name}`);
    console.log(`🆔 ID: ${template.id}`);
    console.log(`📁 分类: ${template.category}`);
    console.log(`🏷️  类型: ${template.type}`);
    console.log(`📄 路径: ${template.path}`);

    if (template.tags.length > 0) {
      console.log(`🏷️  标签: ${template.tags.join(', ')}`);
    }

    if (template.ai_triggers.length > 0) {
      console.log(`🎯 AI触发词: ${template.ai_triggers.join(', ')}`);
    }

    if (template.scenarios.length > 0) {
      console.log(`💡 适用场景: ${template.scenarios.join(', ')}`);
    }

    if (template.dependencies.length > 0) {
      console.log(`📦 依赖项: ${template.dependencies.join(', ')}`);
    }

    console.log(`🔐 需要权限: ${template.permissions_required ? '是' : '否'}`);

    if (template.parameters && template.parameters.length > 0) {
      console.log(`\n⚙️  参数:`);
      template.parameters.forEach(param => {
        console.log(`  - ${param.name} (${param.type}): ${param.description}`);
        if (param.example) {
          console.log(`    示例: ${param.example}`);
        }
      });
    }
  }

  /**
   * 列出所有分类
   */
  listCategories() {
    if (!this.index) {
      throw new Error('模板索引未初始化');
    }

    console.log('\n📂 模板分类:');
    Object.entries(this.index.categories).forEach(([main, subs]) => {
      console.log(`\n${main}:`);
      if (typeof subs === 'object') {
        Object.entries(subs).forEach(([sub, desc]) => {
          const count = this.index.templates.filter(t => t.category === `${main}/${sub}`).length;
          console.log(`  - ${sub}: ${desc} (${count} 个模板)`);
        });
      }
    });
  }

  /**
   * 显示统计信息
   */
  showStats() {
    if (!this.index) {
      throw new Error('模板索引未初始化');
    }

    const stats = this.index.statistics || {};

    console.log('\n📊 模板库统计:');
    console.log(`📋 总模板数: ${stats.total_templates || 0}`);
    console.log(`📂 分类数: ${stats.categories_count || 0}`);
    console.log(`🔧 后端模板: ${stats.backend_templates || 0}`);
    console.log(`🎨 前端模板: ${stats.frontend_templates || 0}`);
    console.log(`📅 最后更新: ${this.index.lastUpdated || '未知'}`);
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const searcher = new TemplateSearcher();
  await searcher.init();

  switch (command) {
    case 'search':
      const query = args[1];
      const results = searcher.search(query);

      console.log(`\n🔍 搜索结果 (${results.length} 个):`);
      results.forEach(template => {
        console.log(`\n📋 ${template.name} (${template.id})`);
        console.log(`   📁 ${template.category} | 🏷️ ${template.type}`);
        console.log(`   🎯 ${template.ai_triggers.slice(0, 3).join(', ')}`);
      });
      break;

    case 'trigger':
      const trigger = args[1];
      if (!trigger) {
        console.error('❌ 请提供触发词');
        process.exit(1);
      }

      const triggerResults = searcher.searchByTrigger(trigger);
      console.log(`\n🎯 触发词 "${trigger}" 的匹配结果 (${triggerResults.length} 个):`);
      triggerResults.forEach((template, index) => {
        console.log(`\n${index + 1}. 📋 ${template.name} (${template.id})`);
        console.log(`   📁 ${template.category} | 🏷️ ${template.type}`);
        console.log(`   💡 ${template.scenarios.slice(0, 2).join(', ')}`);
      });
      break;

    case 'show':
      const templateId = args[1];
      if (!templateId) {
        console.error('❌ 请提供模板ID');
        process.exit(1);
      }
      searcher.showTemplate(templateId);
      break;

    case 'categories':
      searcher.listCategories();
      break;

    case 'stats':
      searcher.showStats();
      break;

    case 'recommend':
      const context = {
        entityType: args[1],
        operation: args[2],
        framework: args[3]
      };

      const recommendations = searcher.getRecommendations(context);
      console.log(`\n💡 推荐模板 (${recommendations.length} 个):`);
      recommendations.forEach((template, index) => {
        console.log(`\n${index + 1}. 📋 ${template.name} (${template.id})`);
        console.log(`   📁 ${template.category} | 🏷️ ${template.type}`);
        console.log(`   🎯 ${template.ai_triggers.slice(0, 3).join(', ')}`);
      });
      break;

    default:
      console.log(`
🔍 SmartAbp 模板搜索工具

用法:
  npm run template:search search <关键词>     # 搜索模板
  npm run template:search trigger <触发词>   # 按AI触发词搜索
  npm run template:search show <模板ID>      # 显示模板详情
  npm run template:search categories        # 列出所有分类
  npm run template:search stats            # 显示统计信息
  npm run template:search recommend [类型] [操作] [框架] # 获取推荐

示例:
  npm run template:search search crud
  npm run template:search trigger "管理页面"
  npm run template:search show backend-application-crudappservice-template
  npm run template:search recommend 用户 CRUD vue
      `);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = TemplateSearcher;



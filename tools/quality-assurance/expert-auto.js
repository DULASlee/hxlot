#!/usr/bin/env node

/**
 * 专家模式工作流: 第1阶段 - 分析与计划
 * 严格遵循项目编程规则定义的6步工作法。
 *
 * 用法：
 *   npm run expert:auto -- "专家模式，{功能描述}"
 *
 * 行为:
 *   1. 强制加载与确认项目规则
 *   2. 提示进行Serena/ADR分析
 *   3. 生成结构化的PLAN_ACK.md用于制定详细计划
 *   4. 明确暂停，等待用户审批
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// --- Helper Functions ---
function getInput() {
  const args = process.argv.slice(2);
  if (args.length === 0) return '';
  
  const flagIdx = args.indexOf('--input');
  if (flagIdx !== -1 && args[flagIdx + 1]) {
    return args.slice(flagIdx + 1).join(' ').trim();
  }
  return args.join(' ').trim();
}

function extractFeature(text) {
  return text.replace(/专家模式[，,\s：:]*/g, '').replace(/^，|^,/g, '').trim();
}

function getProjectRoot() {
  return process.cwd();
}

// --- Main Logic ---
function main() {
  console.log(chalk.yellow('🚀 正在启动专家模式 [阶段1: 分析与计划]...'));

  const input = getInput();
  if (!/专家模式/.test(input)) {
    console.error(chalk.red('❌ 错误: 未检测到“专家模式”触发词。'));
    console.log(chalk.cyan('   用法: npm run expert:auto -- "专家模式，{功能描述}"'));
    process.exit(1);
  }

  const feature = extractFeature(input);
  if (!feature) {
    console.error(chalk.red('❌ 错误: 请提供功能描述。'));
    console.log(chalk.cyan('   用法: npm run expert:auto -- "专家模式，创建用户登录功能"'));
    process.exit(1);
  }

  console.log(chalk.green(`✅ 已识别任务: ${feature}`));

  // 步骤 1: 加载项目编程规则
  console.log(chalk.blue('\n--- 步骤 1: 加载项目编程规则 ---'));
  const rules = {
    "项目编程规则": "doc/项目编程规则.md",
    "设计/算法/性能规则": "tools/quality-assurance/ai-enhancement-rules.md",
    "项目开发铁律": "doc/项目开发铁律.md",
    "ADR决策索引": "doc/architecture/adr/index.json"
  };

  console.log('我必须阅读并遵循以下规则文档:');
  Object.entries(rules).forEach(([name, filePath]) => {
    if (fs.existsSync(path.join(getProjectRoot(), filePath))) {
      console.log(chalk.green(`  - ${name} (${filePath})`));
    } else {
      console.log(chalk.red(`  - ${name} (${filePath}) - 未找到!`));
    }
  });

  // 步骤 2: 提示进行Serena/ADR分析
  console.log(chalk.blue('\n--- 步骤 2: 结合Serena与ADR进行增量分析 ---'));
  console.log('我现在将使用Serena分析现有代码，并查阅相关ADR，为制定计划做准备。');
  console.log(chalk.cyan('   mcp_serena_search_for_pattern, mcp_serena_get_symbols_overview, ...'));
  console.log(chalk.cyan('   read_file doc/architecture/adr/...'));

  // 步骤 3: 制定详细工作计划 (更新PLAN_ACK.md)
  console.log(chalk.blue('\n--- 步骤 3: 制定详细工作计划 ---'));
  updatePlanAck(feature);

  // 步骤 4: 等待审批
  console.log(chalk.yellow('\n--- 步骤 4: 等待审批 ---'));
  console.log(chalk.bgYellow.black.bold('🛑 已暂停: 计划已更新至 PLAN_ACK.md，请审查。'));
  console.log('   在我获得您的明确批准（例如，回复“批准”）之前，我不会进行任何代码修改。');
  console.log('\n   审批后，我将开始编程，并使用以下命令完成后续步骤:');
  console.log(chalk.cyan('   npm run expert:finalize -- "feat: {您的提交信息}"'));
}

function updatePlanAck(feature) {
    const repo = getProjectRoot();
    const tplPath = path.join(repo, 'tools', 'quality-assurance', 'PLAN_TEMPLATE.md');
    const ackPath = path.join(repo, 'tools', 'quality-assurance', 'PLAN_ACK.md');

    if (!fs.existsSync(tplPath)) {
        console.error(chalk.red(`❌ 错误: 计划模板 PLAN_TEMPLATE.md 未找到!`));
        return;
    }
    
    const template = fs.readFileSync(tplPath, 'utf8');
    const newContent = template.replace(
        /(- 目标与范围：)/,
        `$1\n  - ${feature}`
    );

    fs.writeFileSync(ackPath, newContent, 'utf8');
    console.log(chalk.green(`✅ 已更新开发计划模板: ${ackPath}`));
    console.log('   请在该文件中填写详细的分析和计划。');
}


// --- Execution ---
try {
  main();
} catch (e) {
  console.error(chalk.red('\n❌ 专家模式启动失败:'), e.message);
  process.exit(1);
}



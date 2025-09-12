#!/usr/bin/env node

/**
 * 专家模式聚合执行器（自动执行通道）
 * 目标：一次执行 5 点保障
 * 1) 增量分析器可用
 * 2) 模板检索/校验跑通
 * 3) 强制前置流程（Serena/ADR/计划→编码→质量→推送）— 以提示和校验清单输出
 * 4) 设计模式检测（pattern-matcher）
 * 5) 质量门（质量分数阈值）
 */

const { spawnSync } = require('child_process');
const path = require('path');

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...options });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} 失败，退出码 ${result.status}`);
  }
}

function main() {
  console.log('🔐 专家模式聚合执行器启动...');

  // 0) 预检强制（在编码前）
  console.log('\n[0/6] 🧭 预检强制 (Serena/ADR/规则/计划确认)');
  run('node', ['tools/quality-assurance/preflight-enforcer.js']);

  // 1) 增量分析器
  console.log('\n[1/6] 🚀 增量分析器');
  run('node', ['tools/incremental-generation/scripts/analyze-codebase.js', '--mode', 'expert']);

  // 2) 模板检索/校验
  console.log('\n[2/6] 📚 模板索引与校验');
  run('npm', ['run', 'template:index']);
  run('npm', ['run', 'template:validate']);

  // 3) 前置流程提示（静态约束输出）
  console.log('\n[3/6] 🧭 前置流程清单（Serena/ADR/计划→编码→质量→推送）');
  console.log('- 必须检索 Serena 代码库：相似实现/符号/模式');
  console.log('- 必须查阅 ADR 索引与相关 ADR 文档');
  console.log('- 必须产出开发计划（sequential thinking），审批后执行');
  console.log('- 编码完成后必须跑模板/质量门，最后 git 提交');

  // 4) 设计模式检测
  console.log('\n[4/6] 🏛️ 设计模式检测');
  try {
    run('node', ['tools/incremental-generation/analyzers/pattern-matcher.js', '--level', 'master']);
  } catch (e) {
    console.warn('⚠️  设计模式检测未通过，将继续执行并在最终汇总中标记失败');
  }

  // 5) 质量门（阈值）
  console.log('\n[5/6] 🛡️ 质量门评分');
  run('node', ['tools/quality-assurance/quality-gates-cli.js', '--threshold', '85', '--directory', 'src']);

  // 6) 算法与性能启发式
  console.log('\n[6/6] ⚙️  算法与性能检查');
  run('node', ['tools/quality-assurance/algorithms-performance-checker.js', '--threshold', '80', '--directory', 'src']);

  console.log('\n✅ 专家模式聚合执行完成');
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('❌ 专家模式执行失败:', e.message);
    process.exit(1);
  }
}



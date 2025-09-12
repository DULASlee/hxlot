#!/usr/bin/env node

/**
 * 预检强制器：在编码前强制AI/开发者先学习并确认遵循规则
 * - 设计模式清单
 * - 算法与性能优化清单
 * - ADR/项目规则清单
 * 通过标准输出告知必须遵循的规则，并在缺少计划/确认时以非零码退出
 */

const fs = require('fs');
const path = require('path');

function exists(p) { try { return fs.existsSync(p); } catch { return false; } }

function main() {
  const repo = process.cwd();
  const adrIndex = path.join(repo, 'doc', 'architecture', 'adr', 'index.json');
  const projectRules = path.join(repo, 'doc', '项目编程规则.md');
  const patternsDoc = path.join(repo, 'tools', 'quality-assurance', 'ai-enhancement-rules.md');
  const planTemplate = path.join(repo, 'tools', 'quality-assurance', 'PLAN_TEMPLATE.md');
  const planAck = path.join(repo, 'tools', 'quality-assurance', 'PLAN_ACK.md');

  console.log('🧭 预检：在编码前必须完成以下学习与确认');

  if (!exists(adrIndex)) {
    console.error('❌ 缺少 ADR 索引: doc/architecture/adr/index.json');
    process.exit(2);
  }
  if (!exists(projectRules)) {
    console.error('❌ 缺少 项目编程规则: doc/项目编程规则.md');
    process.exit(2);
  }
  if (!exists(patternsDoc)) {
    console.error('❌ 缺少 质量增强规则: tools/quality-assurance/ai-enhancement-rules.md');
    process.exit(2);
  }

  console.log('- 必读: 设计模式/算法/性能规则 → tools/quality-assurance/ai-enhancement-rules.md');
  console.log('- 必读: 项目规则 → doc/项目编程规则.md');
  console.log('- 必读: ADR 索引与相关ADR → doc/architecture/adr/index.json');

  if (!exists(planAck)) {
    console.error('❌ 未找到计划确认文件: tools/quality-assurance/PLAN_ACK.md');
    if (exists(planTemplate)) {
      console.log('👉 请复制 PLAN_TEMPLATE.md 为 PLAN_ACK.md 并按要求填写、审批');
    } else {
      console.log('👉 缺少模板，可手动创建 PLAN_ACK.md，包含需求、设计模式选择、算法/性能策略、测试与验收');
    }
    process.exit(3);
  }

  const ack = fs.readFileSync(planAck, 'utf8');
  const requiredSections = ['## 需求概述', '## 相关ADR', '## 设计模式选择', '## 算法与性能策略', '## 模板与复用', '## 测试计划', '## 审批'];
  const missing = requiredSections.filter(s => !ack.includes(s));
  if (missing.length) {
    console.error('❌ 计划确认文件缺少章节: ' + missing.join(', '));
    process.exit(3);
  }

  console.log('✅ 预检通过：已具备规则学习与计划确认');
}

if (require.main === module) {
  main();
}



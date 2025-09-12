#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getArg(after) {
  const idx = process.argv.indexOf(after);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv.slice(idx + 1).join(' ');
  // fallback: all trailing words
  return process.argv.slice(2).join(' ');
}

function upsertApproval(content, note) {
  const section = '## 审批';
  const approvalBlock = [
    section,
    `- 批准: 是`,
    note ? `- 备注: ${note}` : '- 备注: ',
    ''
  ].join('\n');

  if (content.includes(section)) {
    // Replace the approval section up to next heading or end
    const regex = new RegExp(`${section}[\s\S]*?(?=\n## |$)`);
    return content.replace(regex, approvalBlock);
  }
  return content.trimEnd() + `\n\n` + approvalBlock + `\n`;
}

function main() {
  const repo = process.cwd();
  const ackPath = path.join(repo, 'tools', 'quality-assurance', 'PLAN_ACK.md');
  if (!fs.existsSync(ackPath)) {
    console.error('❌ 未找到 PLAN_ACK.md，请先运行: npm run expert:auto');
    process.exit(2);
  }
  const note = getArg('--note');
  const current = fs.readFileSync(ackPath, 'utf8');
  const updated = upsertApproval(current, note);
  fs.writeFileSync(ackPath, updated, 'utf8');
  console.log('✅ 计划已标记为批准:', ackPath);
}

if (require.main === module) {
  main();
}



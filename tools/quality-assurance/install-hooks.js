#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeFile(p, content) {
  fs.writeFileSync(p, content, { encoding: 'utf8' });
  try {
    fs.chmodSync(p, 0o755);
  } catch {}
}

function main() {
  const gitDir = path.resolve(process.cwd(), '.git');
  const hooksDir = path.join(gitDir, 'hooks');
  if (!fs.existsSync(gitDir)) {
    console.error('❌ 未检测到 .git 目录，无法安装钩子');
    process.exit(2);
  }
  ensureDir(hooksDir);

  const prePushPath = path.join(hooksDir, 'pre-push');
  const sh = `#!/bin/sh
echo "🔐 Running expert:verify (pre-push)..."
npm run expert:verify
status=$?
if [ $status -ne 0 ]; then
  echo "❌ expert:verify 未通过，阻止 push"
  exit $status
fi
echo "✅ 质量门通过，允许 push"
exit 0
`;
  writeFile(prePushPath, sh);

  // Optional Windows CMD fallback
  const prePushCmdPath = path.join(hooksDir, 'pre-push.cmd');
  const cmd = [
    '@echo off',
    'echo Running expert:verify (pre-push) ...',
    'npm run expert:verify',
    'if %ERRORLEVEL% NEQ 0 (',
    '  echo expert:verify failed. Blocking push.',
    '  exit /B %ERRORLEVEL%',
    ')',
    'echo OK',
    'exit /B 0',
    ''
  ].join('\r\n');
  writeFile(prePushCmdPath, cmd);

  console.log('✅ Git pre-push 钩子已安装');
}

if (require.main === module) {
  main();
}

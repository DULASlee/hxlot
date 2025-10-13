import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

function runNode(scriptPath) {
  const r = spawnSync(process.execPath, [scriptPath], { stdio: 'inherit' });
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 顺序执行，先配置一致性，再组件注册
runNode(path.join(__dirname, 'check-config-consistency.js'));
runNode(path.join(__dirname, 'check-component-registration.js'));

console.log('✅ 所有质量检查通过');



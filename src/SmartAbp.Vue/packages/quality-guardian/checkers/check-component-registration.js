import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// 透传执行根目录的组件注册检查脚本，保持单一实现
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootScript = path.join(__dirname, '../../../../..', 'scripts/quality/check-component-registration.js');
const result = spawnSync(process.execPath, [rootScript], { stdio: 'inherit' });
process.exit(result.status ?? 1);



import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../../../../..');

function read(p) { return fs.readFileSync(p, 'utf8'); }

const smartabpConfig = JSON.parse(read(path.join(projectRoot, 'smartabp.config.json')));
const tsconfigText = read(path.join(projectRoot, 'src/SmartAbp.Vue/tsconfig.json'));
const viteConfigText = read(path.join(projectRoot, 'src/SmartAbp.Vue/vite.config.ts'));
const eslintText = read(path.join(projectRoot, 'src/SmartAbp.Vue/.eslintrc.cjs'));

let hasError = false;
console.log('🔍 开始检查配置一致性...');

const tsMin = tsconfigText.replace(/\s+/g, '');

for (const [pkg, cfg] of Object.entries(smartabpConfig.packages)) {
  const alias = `@smartabp/${pkg}`;
  const expIndex = cfg.hasSrcDir ? `packages/${pkg}/src/index.ts` : `packages/${pkg}/index.ts`;
  const expWildcard = cfg.hasSrcDir ? `packages/${pkg}/src/*` : `packages/${pkg}/*`;

  // tsconfig.json 严格匹配（去空白比较）
  const keyNeedle = `"${alias}":["${expIndex}"]`;
  const wcNeedle = `"${alias}/*":["${expWildcard}"]`;
  if (!tsMin.includes(keyNeedle)) {
    console.error(`❌ tsconfig.json: 缺少 ${alias} -> ${expIndex}`);
    hasError = true;
  }
  if (!tsMin.includes(wcNeedle)) {
    console.error(`❌ tsconfig.json: 缺少 ${alias}/* -> ${expWildcard}`);
    hasError = true;
  }

  // vite.config.ts 必须包含别名键与对应packages路径
  const aliasKeyOk = viteConfigText.includes(alias);
  const aliasPathOk = viteConfigText.includes(`packages/${pkg}${cfg.hasSrcDir ? '/src' : ''}`);
  if (!(aliasKeyOk && aliasPathOk)) {
    console.error(`❌ vite.config.ts: 缺少 ${alias} 映射到 packages/${pkg}${cfg.hasSrcDir ? '/src' : ''}`);
    hasError = true;
  }
}

// ESLint：必须禁止 @smartabp/*/src/* 与 packages 相对路径
if (!/@smartabp\/\*\/src\/\*/.test(eslintText)) {
  console.error('❌ .eslintrc.cjs: 缺少禁止导入 @smartabp/*/src/* 的规则');
  hasError = true;
}
const pkgGlobRegex = /\*\*\/packages\/\*\*/;
if (!pkgGlobRegex.test(eslintText)) {
  console.error('❌ .eslintrc.cjs: 缺少禁止相对路径引用 packages/** 的规则');
  hasError = true;
}

if (hasError) {
  console.log('🚨 配置一致性检查失败，请修复上述问题');
  process.exit(1);
} else {
  console.log('✅ 所有配置一致性检查通过！');
}

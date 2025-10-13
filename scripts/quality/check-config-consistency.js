const fs = require('fs');
const path = require('path');

function stripJsonComments(jsonText) {
  // 移除 // 与 /* */ 注释
  return jsonText
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '');
}

function readJsonc(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const stripped = stripJsonComments(raw);
  return JSON.parse(stripped);
}

// 读取smartabp.config.json作为基准配置
const configPath = path.join(__dirname, '../../smartabp.config.json');
const baseConfig = readJsonc(configPath);

// 检查tsconfig.json（文本正则方式，避免JSON解析失败）
const tsconfigPath = path.join(__dirname, '../../src/SmartAbp.Vue/tsconfig.json');
const tsconfigRaw = fs.readFileSync(tsconfigPath, 'utf8');
const tsconfigText = stripJsonComments(tsconfigRaw);

// 先尝试使用去注释后的 JSON 解析获取 compilerOptions.paths；失败则回退到正则抽取
let tsPaths = {};
let parsed = false;
try {
  const tsObj = JSON.parse(tsconfigText);
  tsPaths = (tsObj && tsObj.compilerOptions && tsObj.compilerOptions.paths) || {};
  parsed = true;
} catch (e) {
  // ignore
}

// 强制使用正则抽取paths（部分JSON特性导致解析不稳定）
parsed = false;

function normalizePath(p) {
  if (!p) return '';
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

function textHasAliasToPath(aliasKey, value) {
  // 宽松文本匹配：存在别名键与对应路径字符串
  try {
    const keyRe = new RegExp('"' + aliasKey.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '"\\s*:');
    const valRe = new RegExp('"' + value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '"');
    return keyRe.test(tsconfigText) && valRe.test(tsconfigText);
  } catch {
    return false;
  }
}

if (!parsed) {
  // 回退：用正则从文本中抽取 paths
  const pathsMatch = tsconfigText.match(/"paths"\s*:\s*\{([\s\S]*?)\}/);
  if (pathsMatch) {
    const body = pathsMatch[1];
    const entryRe = /"([^\"]+)"\s*:\s*\[([\s\S]*?)\]/g;
    let m;
    while ((m = entryRe.exec(body)) !== null) {
      const key = m[1];
      const arrText = m[2];
      const vals = [];
      const valRe = /"([^\"]+)"/g;
      let vm;
      while ((vm = valRe.exec(arrText)) !== null) vals.push(vm[1]);
      tsPaths[key] = vals;
    }
  }
}

// 检查vite.config.ts
const viteConfigPath = path.join(__dirname, '../../src/SmartAbp.Vue/vite.config.ts');
const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');

// 检查.eslintrc.cjs
const eslintConfigPath = path.join(__dirname, '../../src/SmartAbp.Vue/.eslintrc.cjs');
const eslintConfigContent = fs.readFileSync(eslintConfigPath, 'utf8');

console.log('🔍 开始检查配置一致性...');

let hasError = false;

// 检查每个包的路径配置
Object.entries(baseConfig.packages).forEach(([pkgName, pkgConfig]) => {
  const aliasName = `@smartabp/${pkgName}`;
  const aliasNameWithWildcard = `@smartabp/${pkgName}/*`;

  // 期望与项目当前 tsconfig.json 一致：单文件别名指向 index.ts，通配指向 */*
  const expectedPath = pkgConfig.hasSrcDir
    ? [`packages/${pkgName}/src/index.ts`]
    : [`packages/${pkgName}/index.ts`];

  const expectedPathWithWildcard = pkgConfig.hasSrcDir
    ? [`packages/${pkgName}/src/*`]
    : [`packages/${pkgName}/*`];

  // 严格校验：tsconfig.json paths 必须精确匹配期望值
  const tsAliasArr = tsPaths[aliasName];
  const tsAliasWildcardArr = tsPaths[aliasNameWithWildcard];
  if (!Array.isArray(tsAliasArr) || normalizePath(tsAliasArr[0]) !== normalizePath(expectedPath[0])) {
    console.error(`❌ tsconfig.json: ${aliasName} 配置缺失或不正确（应指向 ${expectedPath[0]}）`);
    hasError = true;
  }
  if (!Array.isArray(tsAliasWildcardArr) || normalizePath(tsAliasWildcardArr[0]) !== normalizePath(expectedPathWithWildcard[0])) {
    console.error(`❌ tsconfig.json: ${aliasNameWithWildcard} 配置缺失或不正确（应指向 ${expectedPathWithWildcard[0]}）`);
    hasError = true;
  }

  // 检查vite.config.ts中的别名配置（宽松匹配：同时出现别名键与packages路径）
  const aliasKeyRegex = new RegExp(`['"]${aliasName}['"]`);
  const pkgPathRegex = new RegExp(`packages\/${pkgName}(?:\/src)?`);
  if (!(aliasKeyRegex.test(viteConfigContent) && pkgPathRegex.test(viteConfigContent))) {
    console.error(`❌ vite.config.ts: ${aliasName} 别名配置缺失或不正确（需包含 packages/${pkgName}${pkgConfig.hasSrcDir ? '/src' : ''}）`);
    hasError = true;
  }

  // 检查eslint配置中的限制规则（泛化规则应存在）
  // 禁止直接从包的src导入："@smartabp/*/src/*"
  // 或存在针对packages相对路径的限制
  const eslintGenericRuleExists = /@smartabp\/*\/src\/*/.test(eslintConfigContent) || /packages\//.test(eslintConfigContent);
  if (!eslintGenericRuleExists) {
    console.error(`❌ .eslintrc.cjs: 缺少禁止从包src直接导入或packages相对路径的限制规则`);
    hasError = true;
  }
});

if (!hasError) {
  console.log('✅ 所有配置一致性检查通过！');
  process.exit(0);
} else {
  console.log('🚨 配置一致性检查失败，请修复上述问题');
  process.exit(1);
}

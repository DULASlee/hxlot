const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../../');
const PACKAGES_DIR = path.join(ROOT, 'src/SmartAbp.Vue/packages');

function walk(dir, filter) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const full = path.join(dir, file);
        // 跳过深层依赖与构建产物，避免路径过长/重复递归
        const normalized = full.replace(/\\/g, '/');
        if (normalized.includes('/node_modules/') || normalized.includes('/dist/')) {
            continue;
        }
        const stat = fs.statSync(full);
        if (stat && stat.isDirectory()) {
            results.push(...walk(full, filter));
        } else {
            if (!filter || filter(full)) results.push(full);
        }
    }
    return results;
}

function readIfExists(file) {
    try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

console.log('🔍 扫描packages目录中的组件与注册项...');

// 1) 收集所有 .vue 组件
const vueFiles = walk(PACKAGES_DIR, f => f.endsWith('.vue') && !f.includes('node_modules') && f.replace(/\\/g, '/').includes('/src/components/'));

// 2) 收集所有可能的包入口（index.ts/tsx/js）
const indexFiles = [
    ...walk(PACKAGES_DIR, f => /[/\\]src[/\\]index\.(ts|tsx|js)$/.test(f) && !f.includes('node_modules')),
    ...walk(PACKAGES_DIR, f => /[/\\]index\.(ts|tsx|js)$/.test(f) && !f.includes('node_modules'))
];

// 3) 从入口中提取 registerComponent({ name: 'X' }) 以及自动扫描目录
const registered = new Set();
const autoScanDirs = new Set();
for (const idx of indexFiles) {
    const content = readIfExists(idx);
    if (!content) continue;
    const re = /registerComponent\(\s*{[\s\S]*?name:\s*['"]([^'\"]+)['"]/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        registered.add(m[1]);
    }
    // 识别自动扫描：glob('./components/**/*.vue')、glob('./views/**/*.vue')、glob('./runtime/**/*.vue')
    const pkgRoot = idx.replace(/[/\\]src[/\\]index\.(ts|tsx|js)$/, '').replace(/[/\\]index\.(ts|tsx|js)$/, '');
    if (/import\.meta\.glob\(\s*['"]\.\/components\/(?::?\*\*\/)?\*\.vue['"]/g.test(content) || content.includes("glob('./components/**/*.vue')")) {
        autoScanDirs.add(path.join(pkgRoot, 'src', 'components'));
    }
    if (/import\.meta\.glob\(\s*['"]\.\/views\/(?::?\*\*\/)?\*\.vue['"]/g.test(content) || content.includes("glob('./views/**/*.vue')")) {
        autoScanDirs.add(path.join(pkgRoot, 'src', 'views'));
    }
    if (/import\.meta\.glob\(\s*['"]\.\/runtime\/(?::?\*\*\/)?\*\.vue['"]/g.test(content) || content.includes("glob('./runtime/**/*.vue')")) {
        autoScanDirs.add(path.join(pkgRoot, 'src', 'runtime'));
    }
}

// 4) 根据文件名推导组件名（与注册名进行近似匹配）
function fileToCandidateNames(filePath) {
    const base = path.basename(filePath, path.extname(filePath));
    const plain = base.replace(/[^a-zA-Z0-9]/g, '');
    // 常见变体：原名、去除后缀"Component"、驼峰/短横线变种
    const variants = new Set([base, plain, base.replace(/Component$/i, ''), plain.replace(/Component$/i, '')]);
    // 再加入首字母大写版本
    const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    [...variants].forEach(v => variants.add(cap(v)));
    return [...variants];
}

const unregistered = [];
for (const vf of vueFiles) {
    const candidates = fileToCandidateNames(vf);
    const matched = candidates.some(c => registered.has(c));
    const inAutoDir = Array.from(autoScanDirs).some(dir => vf.startsWith(dir));
    if (!matched && !inAutoDir) unregistered.push(vf);
}

if (unregistered.length === 0) {
    console.log('✅ 所有组件均已在 ComponentRegistry 中注册');
    process.exit(0);
} else {
    console.error('🚨 发现未注册的组件（根据文件名近似匹配）:');
    unregistered.forEach(f => console.error('  - ' + path.relative(ROOT, f)));
    console.error('\n请在对应包入口(index.ts)中通过 registerComponent({ name: <组件名> }) 进行注册。');
    process.exit(1);
}

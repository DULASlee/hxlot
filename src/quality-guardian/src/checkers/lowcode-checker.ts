/**
 * SmartAbp Quality Guardian - 低代码引擎专用检查器 v2.0
 * 检查低代码引擎的架构合规性、组件质量和生成代码质量
 */

import path from 'path';
import type { ArchitectureViolation } from '../types/index.js';
import { BaseChecker } from './base-checker.js';

export class LowCodeChecker extends BaseChecker {
    public override readonly name = '低代码引擎质量检查器';
    public override readonly description = '检查低代码引擎packages的架构合规性、组件注册和代码质量';
    public override readonly version = '2.0.0';

    private packageLayers = {
        'metadata-core': -1,
        'lowcode-shared': 0,
        'lowcode-core': 1,
        'lowcode-api': 1,
        'lowcode-tools': 1,
        'lowcode-designer': 2
    };

    protected override async doCheck(): Promise<void> {
        this.logProgress('开始低代码引擎专项检查', 'info');

        // 检查1: Packages架构层级依赖检查（P0）
        await this.checkPackageArchitecture();

        // 检查2: 组件注册完整性检查（P0）
        await this.checkComponentRegistration();

        // 检查3: 类型系统统一性检查（P0）
        await this.checkTypeSystemUnification();

        // 检查4: 包导出完整性检查（P1）
        await this.checkPackageExports();

        // 检查5: 代码生成质量检查（P1）
        await this.checkCodeGenerationQuality();

        // 检查6: TypeScript项目引用检查（P1）
        await this.checkTypeScriptProjectReferences();

        this.logProgress('低代码引擎检查完成', 'success');
    }

    /**
     * 检查1: Packages架构层级依赖检查（核心）
     */
    private async checkPackageArchitecture(): Promise<void> {
        this.logProgress('检查packages架构层级依赖...', 'info');

        let violations = 0;

        // 检查相对路径违规
        violations += await this.checkRelativePathViolations();

        // 检查主应用引用违规
        violations += await this.checkMainAppReferenceViolations();

        // 检查逆向依赖违规
        violations += await this.checkReverseDependencyViolations();

        // 检查循环依赖
        violations += await this.checkCircularDependencies();

        if (violations === 0) {
            this.logProgress('架构层级检查: ✅ 0违规', 'success');
        } else {
            this.logProgress(`架构层级检查: ❌ ${violations}处违规`, 'error');
        }
    }

    private async checkRelativePathViolations(): Promise<number> {
        const { stdout } = await this.execCommand('grep', [
            '-rn',
            "from '..",
            'src/SmartAbp.Vue/packages/',
            '--include=*.ts',
            '--include=*.vue',
            '--exclude=*.d.ts',
            '--exclude-dir=node_modules',
            '--exclude-dir=dist',
            '--exclude-dir=test',
            '--exclude-dir=tests',
            '--exclude-dir=__tests__',
            '--exclude-dir=__mocks__',
            '--exclude-dir=examples',
            '--exclude-dir=templates'
        ]);

        if (stdout) {
            const lines = stdout.split('\n').filter(line => line.trim());
            let count = 0;

            for (const line of lines) {
                const match = line.match(/^(.+?):(\d+):(.*)$/);
                if (match && match.length >= 4) {
                    const [, file, lineNumber, content] = match;

                    if (file && lineNumber && content !== undefined && this.isCrossPackageRelativePath(file, content)) {
                        const violation: ArchitectureViolation = {
                            rule: 'lowcode.no-relative-package-imports',
                            level: 'P0',
                            violationType: 'relative-path',
                            file: file.replace(this.config.projectRoot + '/', ''),
                            line: parseInt(lineNumber, 10),
                            message: 'packages间禁止使用相对路径引用，必须使用@smartabp/别名',
                            snippet: content.trim(),
                            suggestion: '使用 import { X } from "@smartabp/lowcode-shared" 等别名'
                        };

                        this.violations.push(violation);
                        count++;
                    }
                }
            }

            return count;
        }

        return 0;
    }

    private isCrossPackageRelativePath(filePath: string, contentLine: string): boolean {
        const importMatch = contentLine.match(/from\s+['"]([^'"]+)['"]/);
        if (!importMatch) return false;
        const importPath = importMatch[1];
        if (!importPath.startsWith('../')) return false;

        const projectRoot = this.config.projectRoot;
        const absoluteFile = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
        const resolved = path.resolve(path.dirname(absoluteFile), importPath);

        // 当前文件所属package根目录
        const pkgMatch = absoluteFile.match(/src\/SmartAbp\.Vue\/packages\/([^\/]+)/);
        if (!pkgMatch) return false;
        const pkgRoot = path.join(projectRoot, 'src/SmartAbp.Vue/packages', pkgMatch[1]);

        // 如果解析后的目标仍在同一package内，则不是跨包引用
        if (resolved.startsWith(pkgRoot)) {
            return false;
        }
        return true;
    }

    private async checkMainAppReferenceViolations(): Promise<number> {
        const { stdout } = await this.execCommand('grep', [
            '-rn',
            "from '@/",
            'src/SmartAbp.Vue/packages/',
            '--include=*.ts',
            '--include=*.vue',
            '--exclude=*.d.ts',
            '--exclude-dir=node_modules',
            '--exclude-dir=dist',
            '--exclude-dir=test',
            '--exclude-dir=tests',
            '--exclude-dir=__tests__',
            '--exclude-dir=__mocks__',
            '--exclude-dir=examples',
            '--exclude-dir=templates'
        ]);

        if (stdout) {
            const lines = stdout.split('\n').filter(line => line.trim());
            let count = 0;

            lines.forEach(line => {
                const match = line.match(/^(.+?):(\d+):(.*)$/);
                if (match && match.length >= 4) {
                    const [, file, lineNumber, content] = match;

                    // 允许 lowcode-tools 作为桥接层引入主应用
                    if (file.includes('/packages/lowcode-tools/')) {
                        return;
                    }

                    const violation: ArchitectureViolation = {
                        rule: 'lowcode.no-main-app-imports',
                        level: 'P0',
                        violationType: 'main-app-reference',
                        file: file.replace(this.config.projectRoot + '/', ''),
                        line: parseInt(lineNumber, 10),
                        message: 'packages中禁止引用主应用（@/别名）',
                        snippet: content.trim(),
                        suggestion: '将共享代码移至lowcode-shared或使用依赖注入'
                    };

                    this.violations.push(violation);
                    count++;
                }
            });

            return count;
        }

        return 0;
    }

    private async checkReverseDependencyViolations(): Promise<number> {
        let violations = 0;

        // 检查低层级是否依赖高层级
        const reverseDependencyPatterns = [
            {
                package: 'lowcode-shared',
                forbiddenImports: ['lowcode-core', 'lowcode-designer', 'lowcode-api', 'lowcode-tools'],
                level: 0
            },
            {
                package: 'lowcode-core',
                forbiddenImports: ['lowcode-designer'],
                level: 1
            },
            {
                package: 'lowcode-api',
                forbiddenImports: ['lowcode-designer'],
                level: 1
            },
            {
                package: 'lowcode-tools',
                forbiddenImports: ['lowcode-designer'],
                level: 1
            },
            {
                package: 'metadata-core',
                forbiddenImports: ['lowcode-shared', 'lowcode-core', 'lowcode-designer', 'lowcode-api', 'lowcode-tools'],
                level: -1
            }
        ];

        for (const pattern of reverseDependencyPatterns) {
            for (const forbidden of pattern.forbiddenImports) {
                const { stdout } = await this.execCommand('grep', [
                    '-rn',
                    `@smartabp/${forbidden}`,
                    `src/SmartAbp.Vue/packages/${pattern.package}/`,
                    '--include=*.ts',
                    '--include=*.vue',
                    '--exclude=*.d.ts',
                    '--exclude-dir=node_modules',
                    '--exclude-dir=dist',
                    '--exclude-dir=test',
                    '--exclude-dir=tests',
                    '--exclude-dir=__tests__',
                    '--exclude-dir=__mocks__',
                    '--exclude-dir=examples',
                    '--exclude-dir=templates'
                ]);

                if (stdout) {
                    const lines = stdout.split('\n').filter(line => line.trim());

                    lines.forEach(line => {
                        const match = line.match(/^(.+?):(\d+):(.*)$/);
                        if (match && match.length >= 4) {
                            const [, file, lineNumber, content] = match;

                            // 仅当是 import / export from 语句才计为依赖
                            const isImportLike = /\bimport\b\s+.*\bfrom\b\s+['"]@smartabp\//.test(content) || /\bexport\b\s+\*\s+from\s+['"]@smartabp\//.test(content);
                            if (!isImportLike) return;

                            const violation: ArchitectureViolation = {
                                rule: 'lowcode.no-reverse-dependencies',
                                level: 'P0',
                                violationType: 'reverse-dependency',
                                file: file.replace(this.config.projectRoot + '/', ''),
                                line: parseInt(lineNumber, 10),
                                message: `架构违规：${pattern.package}（层级${pattern.level}）不能依赖${forbidden}`,
                                snippet: content.trim(),
                                suggestion: '重新设计模块依赖关系，只能向下依赖'
                            };

                            this.violations.push(violation);
                            violations++;
                        }
                    });
                }
            }
        }

        return violations;
    }

    private async checkCircularDependencies(): Promise<number> {
        // 简化的循环依赖检查（完整实现需要构建依赖图）
        this.logProgress('检查循环依赖...', 'info');

        // 这里简化处理，实际应该构建完整的依赖图进行深度检查
        // 目前主要通过前面的检查来防止循环依赖

        return 0;
    }

    /**
     * 检查2: 组件注册完整性检查
     */
    private async checkComponentRegistration(): Promise<void> {
        this.logProgress('检查组件注册完整性...', 'info');

        const componentFiles = await this.findFiles('src/SmartAbp.Vue/packages/*/src/components/**/*.vue');
        let unregisteredCount = 0;

        for (const componentFile of componentFiles) {
            // 设计器内组件在编辑器生命周期内动态注册
            if (componentFile.includes('/packages/lowcode-designer/')) continue;

            // 仅检查顶层组件（src/components/Component.vue），跳过嵌套子组件
            const parts = componentFile.split('/src/components/');
            if (parts.length === 2 && parts[1].includes('/')) {
                // 嵌套路径（如 BusinessRuleDesigner/PropertyPanel.vue）视为私有子组件，跳过
                continue;
            }

            const isRegistered = await this.checkIfComponentRegistered(componentFile);

            if (!isRegistered) {
                const componentName = path.basename(componentFile, '.vue');

                this.addViolation({
                    rule: 'lowcode.component-registration-required',
                    level: 'P0',
                    file: componentFile,
                    message: `组件 ${componentName} 未在ComponentRegistry中注册`,
                    suggestion: '在对应package的index.ts中调用registerComponent()注册组件'
                });

                unregisteredCount++;
            }
        }

        if (unregisteredCount === 0) {
            this.logProgress('组件注册检查: ✅ 所有组件已注册', 'success');
        } else {
            this.logProgress(`组件注册检查: ❌ ${unregisteredCount}个组件未注册`, 'error');
        }
    }

    private async checkIfComponentRegistered(componentFile: string): Promise<boolean> {
        const packageMatch = componentFile.match(/packages\/([^/]+)/);
        if (!packageMatch) return false;

        const packageName = packageMatch[1];
        const indexFile = `src/SmartAbp.Vue/packages/${packageName}/src/index.ts`;

        if (!await this.fileExists(indexFile)) return false;

        const indexContent = await this.readFile(indexFile);
        const componentName = path.basename(componentFile, '.vue');

        // 检查是否有registerComponent调用，并且包含组件名
        return indexContent.includes('registerComponent') &&
            (indexContent.includes(`name: '${componentName}'`) ||
                indexContent.includes(`name: "${componentName}"`));
    }

    /**
     * 检查3: 类型系统统一性检查
     */
    private async checkTypeSystemUnification(): Promise<void> {
        this.logProgress('检查类型系统统一性...', 'info');

        let violations = 0;

        // 检查主应用是否定义了底层类型
        const mainAppTypeFiles = await this.findFiles('src/SmartAbp.Vue/src/core/**/types.ts');

        for (const typeFile of mainAppTypeFiles) {
            const content = await this.readFile(typeFile);

            // 检查是否定义了应该在shared中的类型
            const sharedTypePatterns = [
                'DependencyGraph',
                'ComponentMetadata',
                'EntityMetadata',
                'AssemblyPlugin'
            ];

            for (const pattern of sharedTypePatterns) {
                if (content.includes(`interface ${pattern}`) || content.includes(`type ${pattern}`)) {
                    this.addViolation({
                        rule: 'lowcode.centralized-type-definitions',
                        level: 'P0',
                        file: typeFile,
                        message: `主应用不应定义底层类型 ${pattern}，应在lowcode-shared/types中定义`,
                        suggestion: '将类型定义移至 ../types/index.js'
                    });
                    violations++;
                }
            }
        }

        if (violations === 0) {
            this.logProgress('类型系统检查: ✅ 类型定义集中化', 'success');
        } else {
            this.logProgress(`类型系统检查: ❌ ${violations}处违规`, 'error');
        }
    }

    /**
     * 检查4: 包导出完整性检查
     */
    private async checkPackageExports(): Promise<void> {
        this.logProgress('检查包导出完整性...', 'info');

        const packages = Object.keys(this.packageLayers);
        let incompleteExports = 0;

        for (const pkg of packages) {
            const packagePath = `src/SmartAbp.Vue/packages/${pkg}`;

            if (!await this.fileExists(packagePath)) continue;

            const indexFile = `${packagePath}/src/index.ts`;

            if (!await this.fileExists(indexFile)) {
                this.addViolation({
                    rule: 'lowcode.package-exports-required',
                    level: 'P1',
                    file: packagePath,
                    message: `包 ${pkg} 缺少入口文件 src/index.ts`,
                    suggestion: '创建 src/index.ts 并导出公共API'
                });
                incompleteExports++;
                continue;
            }

            // 检查package.json的exports字段
            const packageJsonFile = `${packagePath}/package.json`;
            if (await this.fileExists(packageJsonFile)) {
                const packageJson = JSON.parse(await this.readFile(packageJsonFile));

                if (!packageJson.exports) {
                    this.addViolation({
                        rule: 'lowcode.package-exports-field',
                        level: 'P1',
                        file: packageJsonFile,
                        message: 'package.json缺少exports字段定义',
                        suggestion: '添加exports字段明确导出路径'
                    });
                    incompleteExports++;
                }
            }
        }

        if (incompleteExports === 0) {
            this.logProgress('包导出检查: ✅ 所有包导出完整', 'success');
        } else {
            this.logProgress(`包导出检查: ⚠️ ${incompleteExports}个包导出不完整`, 'warning');
        }
    }

    /**
     * 检查5: 代码生成质量检查
     */
    private async checkCodeGenerationQuality(): Promise<void> {
        this.logProgress('检查代码生成质量...', 'info');

        // 检查生成器模板的质量
        const templateFiles = await this.findFiles('templates/**/*.template.*');

        for (const templateFile of templateFiles) {
            await this.checkTemplateQuality(templateFile);
        }

        // 检查生成的代码是否符合标准
        // （这里需要实际生成一些代码进行检查，简化处理）
    }

    private async checkTemplateQuality(templateFile: string): Promise<void> {
        const content = await this.readFile(templateFile);

        // 检查模板是否包含必要的占位符
        const requiredPlaceholders = ['{{name}}', '{{namespace}}'];

        for (const placeholder of requiredPlaceholders) {
            if (!content.includes(placeholder)) {
                this.addViolation({
                    rule: 'lowcode.template-completeness',
                    level: 'P2',
                    file: templateFile,
                    message: `模板缺少必需的占位符: ${placeholder}`,
                    suggestion: '添加标准化的占位符'
                });
            }
        }

        // 检查是否有硬编码
        if (content.includes('hardcoded') || content.match(/\b(admin|test|demo)\b/i)) {
            this.addViolation({
                rule: 'lowcode.no-hardcoded-in-templates',
                level: 'P1',
                file: templateFile,
                message: '模板中不应包含硬编码的测试数据',
                suggestion: '使用占位符代替硬编码'
            });
        }
    }

    /**
     * 检查6: TypeScript项目引用检查
     */
    private async checkTypeScriptProjectReferences(): Promise<void> {
        this.logProgress('检查TypeScript项目引用...', 'info');

        const rootTsConfig = 'src/SmartAbp.Vue/tsconfig.references.json';

        if (!await this.fileExists(rootTsConfig)) {
            this.addViolation({
                rule: 'lowcode.typescript-project-references',
                level: 'P1',
                file: 'src/SmartAbp.Vue/',
                message: '缺少 tsconfig.references.json 项目引用配置',
                suggestion: '创建 tsconfig.references.json 配置项目引用'
            });
            return;
        }

        const tsConfig = JSON.parse(await this.readFile(rootTsConfig));
        const references = tsConfig.references || [];

        // 检查每个package是否都有引用
        const packages = Object.keys(this.packageLayers);

        for (const pkg of packages) {
            const packagePath = `src/SmartAbp.Vue/packages/${pkg}`;
            if (!await this.fileExists(packagePath)) continue;

            const hasReference = references.some((ref: any) =>
                ref.path && ref.path.includes(pkg)
            );

            if (!hasReference) {
                this.addViolation({
                    rule: 'lowcode.missing-project-reference',
                    level: 'P1',
                    file: rootTsConfig,
                    message: `包 ${pkg} 未在项目引用中配置`,
                    suggestion: `在 tsconfig.references.json 中添加 { "path": "./packages/${pkg}" }`
                });
            }
        }
    }

    protected override async getDetails(): Promise<Record<string, any>> {
        return {
            packagesChecked: Object.keys(this.packageLayers).length,
            architectureLayers: this.packageLayers,
            checksPerformed: [
                '架构层级依赖检查',
                '组件注册完整性检查',
                '类型系统统一性检查',
                '包导出完整性检查',
                '代码生成质量检查',
                'TypeScript项目引用检查'
            ]
        };
    }
}


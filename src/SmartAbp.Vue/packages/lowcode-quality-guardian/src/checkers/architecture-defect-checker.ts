import * as fs from 'fs-extra';
import path from 'path';
import { BaseChecker } from './base-checker.js';

/**
 * 类依赖信息
 */
interface ClassDependency {
    name: string;
    file: string;
    line: number;
    dependencies: string[];
    dependents: string[];
    methodCount: number;
    propertyCount: number;
}

export class ArchitectureDefectChecker extends BaseChecker {
    public override readonly name = '架构缺陷和优化建议检查器';
    public override readonly description = '检测架构反模式、循环依赖、紧耦合等架构问题，提供优化建议';
    public override readonly version = '1.0.0';
    public override enabled = true;

    // 配置阈值
    private godObjectMethodThreshold = 20;
    private godObjectDependencyThreshold = 10;
    private tightCouplingThreshold = 5;

    private classMap = new Map<string, ClassDependency>();

    protected override async doCheck(): Promise<void> {
        this.logProgress('开始架构缺陷检查...', 'info');

        // 加载配置阈值
        this.loadThresholds();

        // 构建依赖图
        await this.buildDependencyGraph();

        // 检查1: 上帝对象（God Object）
        await this.checkGodObjects();

        // 检查2: 循环依赖（Circular Dependency）
        await this.checkCircularDependencies();

        // 检查3: 紧耦合（Tight Coupling）
        await this.checkTightCoupling();

        // 检查4: 分层架构违规
        await this.checkLayerViolations();

        // 检查5: 贫血模型（Anemic Domain Model）
        await this.checkAnemicDomainModel();

        this.logProgress('架构缺陷检查完成', 'info');
    }

    /**
     * 加载配置阈值
     */
    private loadThresholds(): void {
        if (this.config.checkerConfigs && this.config.checkerConfigs['architecture-defect']) {
            const checkerConfig = this.config.checkerConfigs['architecture-defect'];
            this.godObjectMethodThreshold = checkerConfig.godObjectMethodThreshold || this.godObjectMethodThreshold;
            this.godObjectDependencyThreshold = checkerConfig.godObjectDependencyThreshold || this.godObjectDependencyThreshold;
            this.tightCouplingThreshold = checkerConfig.tightCouplingThreshold || this.tightCouplingThreshold;
        }
    }

    /**
     * 构建依赖关系图
     */
    private async buildDependencyGraph(): Promise<void> {
        const sourceFiles = await this.findFiles([
            '**/*.ts', '**/*.js', '**/*.cs'
        ]);

        for (const file of sourceFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            this.filesChecked++;

            // 解析类定义和依赖
            this.parseClassDependencies(file, content);
        }
    }

    /**
     * 解析类依赖
     */
    private parseClassDependencies(file: string, content: string): void {
        const lines = content.split('\n');
        const classPattern = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/;
        const importPattern = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/;
        const newPattern = /new\s+(\w+)\s*\(/g;

        let currentClass: ClassDependency | null = null;
        const imports: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;

            // 解析import语句
            const importMatch = line.match(importPattern);
            if (importMatch) {
                const namedImports = importMatch[1] || importMatch[2];
                if (namedImports) {
                    imports.push(...namedImports.split(',').map((s: string) => s.trim()));
                }
            }

            // 解析类定义
            const classMatch = line.match(classPattern);
            if (classMatch && classMatch[1]) {
                if (currentClass) {
                    // 保存上一个类
                    this.classMap.set(currentClass.name, currentClass);
                }

                currentClass = {
                    name: classMatch[1],
                    file: file,
                    line: i + 1,
                    dependencies: [...imports],
                    dependents: [],
                    methodCount: 0,
                    propertyCount: 0
                };
            }

            // 统计方法和属性
            if (currentClass) {
                if (/^\s*(public|private|protected)\s+\w+\s*\(/.test(line) ||
                    /^\s*\w+\s*\(/.test(line)) {
                    currentClass.methodCount++;
                }
                if (/^\s*(public|private|protected)\s+\w+:\s*\w+/.test(line) ||
                    /^\s*(public|private|protected)\s+readonly\s+\w+:\s*\w+/.test(line)) {
                    currentClass.propertyCount++;
                }

                // 检测直接new的依赖
                let newMatch;
                while ((newMatch = newPattern.exec(line)) !== null) {
                    if (newMatch[1] && !currentClass.dependencies.includes(newMatch[1])) {
                        currentClass.dependencies.push(newMatch[1]);
                    }
                }
            }
        }

        // 保存最后一个类
        if (currentClass) {
            this.classMap.set(currentClass.name, currentClass);
        }
    }

    /**
     * 检查上帝对象
     * 规则：
     * - 方法数>20或依赖项>10
     * - 表明类承担过多职责
     */
    private async checkGodObjects(): Promise<void> {
        this.classMap.forEach((classInfo) => {
            if (classInfo.methodCount > this.godObjectMethodThreshold ||
                classInfo.dependencies.length > this.godObjectDependencyThreshold) {
                this.addViolation({
                    rule: 'architecture-defect.god-object',
                    level: 'P1',
                    file: classInfo.file,
                    line: classInfo.line,
                    message: `类"${classInfo.name}"可能是上帝对象：方法数=${classInfo.methodCount}，依赖项=${classInfo.dependencies.length}`,
                    suggestion: '按单一职责原则拆分类，将相关功能提取到独立的类中',
                    links: ['https://en.wikipedia.org/wiki/God_object']
                });
            }
        });
    }

    /**
     * 检查循环依赖
     * 使用DFS检测依赖图中的环
     */
    private async checkCircularDependencies(): Promise<void> {
        const visited = new Set<string>();
        const recStack = new Set<string>();
        const cycles: string[][] = [];

        const dfs = (className: string, path: string[]): void => {
            if (recStack.has(className)) {
                // 发现循环
                const cycleStart = path.indexOf(className);
                const cycle = path.slice(cycleStart).concat(className);
                cycles.push(cycle);
                return;
            }

            if (visited.has(className)) {
                return;
            }

            visited.add(className);
            recStack.add(className);
            path.push(className);

            const classInfo = this.classMap.get(className);
            if (classInfo) {
                for (const dep of classInfo.dependencies) {
                    if (this.classMap.has(dep)) {
                        dfs(dep, [...path]);
                    }
                }
            }

            recStack.delete(className);
        };

        // 对所有类进行DFS
        this.classMap.forEach((_value, className) => {
            if (!visited.has(className)) {
                dfs(className, []);
            }
        });

        // 报告循环依赖
        cycles.forEach((cycle) => {
            if (cycle.length > 1 && cycle[0]) {
                const cycleStr = cycle.join(' → ');
                const firstClass = this.classMap.get(cycle[0]);
                if (firstClass) {
                    this.addViolation({
                        rule: 'architecture-defect.circular-dependency',
                        level: 'P0',
                        file: firstClass.file,
                        line: firstClass.line,
                        message: `检测到循环依赖: ${cycleStr}`,
                        suggestion: '引入中间层或使用依赖倒置原则打破循环',
                        links: ['https://en.wikipedia.org/wiki/Circular_dependency']
                    });
                }
            }
        });
    }

    /**
     * 检查紧耦合
     * 规则：
     * - 类直接new了超过N个其他类（不使用依赖注入）
     */
    private async checkTightCoupling(): Promise<void> {
        this.classMap.forEach((classInfo) => {
            // 统计直接new的依赖数量
            let directNewCount = 0;
            classInfo.dependencies.forEach((dep) => {
                // 简单启发式：如果依赖项是类名（PascalCase），认为是直接new
                if (/^[A-Z]/.test(dep)) {
                    directNewCount++;
                }
            });

            if (directNewCount > this.tightCouplingThreshold) {
                this.addViolation({
                    rule: 'architecture-defect.tight-coupling',
                    level: 'P1',
                    file: classInfo.file,
                    line: classInfo.line,
                    message: `类"${classInfo.name}"紧耦合，直接new了${directNewCount}个类`,
                    suggestion: '使用依赖注入和接口抽象，降低耦合度',
                    links: ['https://en.wikipedia.org/wiki/Coupling_(computer_programming)']
                });
            }
        });
    }

    /**
     * 检查分层架构违规
     * 规则：
     * - 低层不能依赖高层
     * - 例如：Domain不能依赖Application，Application不能依赖Presentation
     */
    private async checkLayerViolations(): Promise<void> {
        const layerRanks: Record<string, number> = {
            'Presentation': 3,
            'Application': 2,
            'Domain': 1,
            'Infrastructure': 0
        };

        this.classMap.forEach((classInfo) => {
            const currentLayer = this.getLayerFromPath(classInfo.file);
            const currentRank = layerRanks[currentLayer] ?? -1;

            if (currentRank === -1) return; // 不在已知层级

            classInfo.dependencies.forEach((dep) => {
                const depClass = this.classMap.get(dep);
                if (!depClass) return;

                const depLayer = this.getLayerFromPath(depClass.file);
                const depRank = layerRanks[depLayer] ?? -1;

                if (depRank === -1) return;

                // 检查逆向依赖
                if (currentRank < depRank) {
                    this.addViolation({
                        rule: 'architecture-defect.layer-violation',
                        level: 'P0',
                        file: classInfo.file,
                        line: classInfo.line,
                        message: `分层架构违规: ${currentLayer}层的"${classInfo.name}"依赖了${depLayer}层的"${dep}"`,
                        suggestion: '严格遵守分层架构规范，低层不能依赖高层',
                        links: ['https://en.wikipedia.org/wiki/Multitier_architecture']
                    });
                }
            });
        });
    }

    /**
     * 从文件路径推断层级
     */
    private getLayerFromPath(filePath: string): string {
        if (filePath.includes('Presentation') || filePath.includes('/views/') || filePath.includes('/components/')) {
            return 'Presentation';
        }
        if (filePath.includes('Application') || filePath.includes('/services/')) {
            return 'Application';
        }
        if (filePath.includes('Domain') || filePath.includes('/models/') || filePath.includes('/entities/')) {
            return 'Domain';
        }
        if (filePath.includes('Infrastructure') || filePath.includes('/repositories/')) {
            return 'Infrastructure';
        }
        return 'Unknown';
    }

    /**
     * 检查贫血模型
     * 规则：
     * - 领域对象只有getter/setter，没有业务逻辑方法
     * - 属性数>5，方法数<=2（仅getter/setter）
     */
    private async checkAnemicDomainModel(): Promise<void> {
        this.classMap.forEach((classInfo) => {
            const layer = this.getLayerFromPath(classInfo.file);
            if (layer !== 'Domain') return; // 只检查Domain层

            // 启发式判断：属性多但方法少
            if (classInfo.propertyCount > 5 && classInfo.methodCount <= 2) {
                this.addViolation({
                    rule: 'architecture-defect.anemic-domain',
                    level: 'P1',
                    file: classInfo.file,
                    line: classInfo.line,
                    message: `领域模型"${classInfo.name}"可能是贫血模型：${classInfo.propertyCount}个属性，${classInfo.methodCount}个方法`,
                    suggestion: '将业务逻辑移入领域对象，遵循充血模型（Rich Domain Model）',
                    links: ['https://martinfowler.com/bliki/AnemicDomainModel.html']
                });
            }
        });
    }
}


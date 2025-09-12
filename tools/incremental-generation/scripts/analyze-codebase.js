#!/usr/bin/env node

/**
 * 代码库分析脚本
 * 用于分析现有代码结构、模式和依赖关系
 */

const fs = require('fs');
const path = require('path');

class CodebaseAnalyzer {
    constructor(options = {}) {
        this.rootPath = options.rootPath || process.cwd();
        this.targetFile = options.targetFile;
        this.analysisResults = {
            structure: {},
            patterns: [],
            dependencies: {},
            style: {},
            metrics: {}
        };
    }

    /**
     * 执行完整的代码库分析
     */
    async analyze() {
        console.log('🔍 开始代码库分析...');
        
        try {
            if (this.targetFile) {
                await this.analyzeTargetFile();
            } else {
                await this.analyzeFullCodebase();
            }
            
            this.generateAnalysisReport();
            return this.analysisResults;
        } catch (error) {
            console.error('❌ 分析失败:', error.message);
            throw error;
        }
    }

    /**
     * 分析指定目标文件
     */
    async analyzeTargetFile() {
        console.log(`📄 分析目标文件: ${this.targetFile}`);
        
        const filePath = path.resolve(this.rootPath, this.targetFile);
        if (!fs.existsSync(filePath)) {
            throw new Error(`目标文件不存在: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const fileInfo = path.parse(filePath);
        
        // 分析文件结构
        this.analysisResults.structure = this.analyzeFileStructure(content, fileInfo);
        
        // 识别设计模式
        this.analysisResults.patterns = this.identifyPatterns(content, fileInfo);
        
        // 分析依赖关系
        this.analysisResults.dependencies = this.analyzeDependencies(content, fileInfo);
        
        // 分析代码风格
        this.analysisResults.style = this.analyzeCodeStyle(content, fileInfo);
        
        // 计算代码指标
        this.analysisResults.metrics = this.calculateMetrics(content, fileInfo);
    }

    /**
     * 分析完整代码库
     */
    async analyzeFullCodebase() {
        console.log('📁 分析完整代码库...');
        
        const srcPath = path.join(this.rootPath, 'src');
        if (!fs.existsSync(srcPath)) {
            throw new Error('src目录不存在');
        }

        // 递归分析所有源文件
        this.analyzeDirectory(srcPath);
    }

    /**
     * 分析文件结构
     */
    analyzeFileStructure(content, fileInfo) {
        const structure = {
            fileName: fileInfo.name,
            extension: fileInfo.ext,
            size: content.length,
            lines: content.split('\n').length
        };

        if (fileInfo.ext === '.cs') {
            structure.csharp = this.analyzeCSharpStructure(content);
        } else if (fileInfo.ext === '.ts' || fileInfo.ext === '.vue') {
            structure.typescript = this.analyzeTypeScriptStructure(content);
        }

        return structure;
    }

    /**
     * 分析C#文件结构
     */
    analyzeCSharpStructure(content) {
        const structure = {
            namespaces: [],
            classes: [],
            interfaces: [],
            methods: [],
            properties: []
        };

        // 提取命名空间
        const namespaceRegex = /namespace\s+([^\s{]+)/g;
        let match;
        while ((match = namespaceRegex.exec(content)) !== null) {
            structure.namespaces.push(match[1]);
        }

        // 提取类定义
        const classRegex = /(?:public|internal|private|protected)?\s*(?:abstract|sealed)?\s*class\s+(\w+)/g;
        while ((match = classRegex.exec(content)) !== null) {
            structure.classes.push(match[1]);
        }

        // 提取接口定义
        const interfaceRegex = /(?:public|internal|private|protected)?\s*interface\s+(\w+)/g;
        while ((match = interfaceRegex.exec(content)) !== null) {
            structure.interfaces.push(match[1]);
        }

        // 提取方法定义
        const methodRegex = /(?:public|private|protected|internal)?\s*(?:static|virtual|override|async)?\s*(?:\w+\??)\s+(\w+)\s*\([^)]*\)/g;
        while ((match = methodRegex.exec(content)) !== null) {
            structure.methods.push(match[1]);
        }

        return structure;
    }

    /**
     * 分析TypeScript文件结构
     */
    analyzeTypeScriptStructure(content) {
        const structure = {
            imports: [],
            exports: [],
            interfaces: [],
            classes: [],
            functions: [],
            components: []
        };

        // 提取导入语句
        const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            structure.imports.push(match[1]);
        }

        // 提取导出语句
        const exportRegex = /export\s+(?:default\s+)?(?:class|interface|function|const|let|var)\s+(\w+)/g;
        while ((match = exportRegex.exec(content)) !== null) {
            structure.exports.push(match[1]);
        }

        // 提取接口定义
        const interfaceRegex = /interface\s+(\w+)/g;
        while ((match = interfaceRegex.exec(content)) !== null) {
            structure.interfaces.push(match[1]);
        }

        // 如果是Vue文件，分析组件结构
        if (content.includes('<template>')) {
            structure.components.push(this.analyzeVueComponent(content));
        }

        return structure;
    }

    /**
     * 识别设计模式
     */
    identifyPatterns(content, fileInfo) {
        const patterns = [];

        // ABP应用服务模式
        if (content.includes('ApplicationService') || content.includes('IApplicationService')) {
            patterns.push({
                type: 'ABP Application Service',
                confidence: 0.9,
                indicators: ['ApplicationService', 'IApplicationService', 'Dto']
            });
        }

        // Repository模式
        if (content.includes('Repository') || content.includes('IRepository')) {
            patterns.push({
                type: 'Repository Pattern',
                confidence: 0.85,
                indicators: ['Repository', 'IRepository', 'Entity']
            });
        }

        // CRUD模式
        if (this.hasCrudMethods(content)) {
            patterns.push({
                type: 'CRUD Operations',
                confidence: 0.8,
                indicators: ['Create', 'Read', 'Update', 'Delete', 'Get', 'List']
            });
        }

        // Vue组合式API模式
        if (content.includes('defineComponent') || content.includes('setup(')) {
            patterns.push({
                type: 'Vue Composition API',
                confidence: 0.9,
                indicators: ['defineComponent', 'setup', 'ref', 'reactive']
            });
        }

        // Pinia状态管理模式
        if (content.includes('defineStore') || content.includes('useStore')) {
            patterns.push({
                type: 'Pinia Store Pattern',
                confidence: 0.9,
                indicators: ['defineStore', 'useStore', 'state', 'actions']
            });
        }

        return patterns;
    }

    /**
     * 检查是否包含CRUD方法
     */
    hasCrudMethods(content) {
        const crudKeywords = ['Create', 'Get', 'Update', 'Delete', 'List', 'Find'];
        return crudKeywords.some(keyword => 
            content.includes(`${keyword}Async`) || 
            content.includes(`${keyword}(`) ||
            content.includes(`${keyword}All`)
        );
    }

    /**
     * 分析依赖关系
     */
    analyzeDependencies(content, fileInfo) {
        const dependencies = {
            internal: [],
            external: [],
            framework: []
        };

        if (fileInfo.ext === '.cs') {
            // C# using语句
            const usingRegex = /using\s+([^;]+);/g;
            let match;
            while ((match = usingRegex.exec(content)) !== null) {
                const namespace = match[1].trim();
                if (namespace.startsWith('SmartAbp')) {
                    dependencies.internal.push(namespace);
                } else if (namespace.startsWith('Volo.Abp')) {
                    dependencies.framework.push(namespace);
                } else {
                    dependencies.external.push(namespace);
                }
            }
        } else if (fileInfo.ext === '.ts' || fileInfo.ext === '.vue') {
            // TypeScript/Vue import语句
            const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                const module = match[1];
                if (module.startsWith('./') || module.startsWith('../')) {
                    dependencies.internal.push(module);
                } else if (module.startsWith('@/')) {
                    dependencies.internal.push(module);
                } else {
                    dependencies.external.push(module);
                }
            }
        }

        return dependencies;
    }

    /**
     * 分析代码风格
     */
    analyzeCodeStyle(content, fileInfo) {
        const style = {
            indentation: this.detectIndentation(content),
            naming: this.analyzeNamingConventions(content, fileInfo),
            formatting: this.analyzeFormatting(content)
        };

        return style;
    }

    /**
     * 检测缩进风格
     */
    detectIndentation(content) {
        const lines = content.split('\n');
        let spaceCount = 0;
        let tabCount = 0;

        for (const line of lines) {
            if (line.startsWith('    ')) spaceCount++;
            if (line.startsWith('\t')) tabCount++;
        }

        return {
            type: spaceCount > tabCount ? 'spaces' : 'tabs',
            size: spaceCount > tabCount ? 4 : 1
        };
    }

    /**
     * 分析命名约定
     */
    analyzeNamingConventions(content, fileInfo) {
        const naming = {
            classes: 'PascalCase',
            methods: 'PascalCase',
            variables: 'camelCase',
            constants: 'UPPER_CASE'
        };

        if (fileInfo.ext === '.ts' || fileInfo.ext === '.vue') {
            naming.methods = 'camelCase';
        }

        return naming;
    }

    /**
     * 分析格式化风格
     */
    analyzeFormatting(content) {
        return {
            lineEndings: content.includes('\r\n') ? 'CRLF' : 'LF',
            trailingSpaces: /\s+$/m.test(content),
            emptyLines: (content.match(/\n\s*\n/g) || []).length
        };
    }

    /**
     * 计算代码指标
     */
    calculateMetrics(content, fileInfo) {
        const lines = content.split('\n');
        const codeLines = lines.filter(line => 
            line.trim() && 
            !line.trim().startsWith('//') && 
            !line.trim().startsWith('/*') &&
            !line.trim().startsWith('*')
        );

        return {
            totalLines: lines.length,
            codeLines: codeLines.length,
            commentLines: lines.length - codeLines.length,
            complexity: this.calculateComplexity(content),
            maintainabilityIndex: this.calculateMaintainabilityIndex(content)
        };
    }

    /**
     * 计算圈复杂度
     */
    calculateComplexity(content) {
        const complexityKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'];
        let complexity = 1; // 基础复杂度

        for (const keyword of complexityKeywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = content.match(regex);
            if (matches) {
                complexity += matches.length;
            }
        }

        return complexity;
    }

    /**
     * 计算可维护性指数
     */
    calculateMaintainabilityIndex(content) {
        const lines = content.split('\n').length;
        const complexity = this.calculateComplexity(content);
        
        // 简化的可维护性指数计算
        const maintainabilityIndex = Math.max(0, 
            171 - 5.2 * Math.log(lines) - 0.23 * complexity - 16.2 * Math.log(lines / 10)
        );

        return Math.round(maintainabilityIndex);
    }

    /**
     * 分析Vue组件
     */
    analyzeVueComponent(content) {
        const component = {
            hasTemplate: content.includes('<template>'),
            hasScript: content.includes('<script'),
            hasStyle: content.includes('<style'),
            composition: content.includes('setup('),
            typescript: content.includes('lang="ts"')
        };

        return component;
    }

    /**
     * 递归分析目录
     */
    analyzeDirectory(dirPath) {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                this.analyzeDirectory(filePath);
            } else if (this.isSourceFile(file)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const fileInfo = path.parse(filePath);
                
                // 累积分析结果
                this.accumulateAnalysis(content, fileInfo);
            }
        }
    }

    /**
     * 判断是否为源代码文件
     */
    isSourceFile(fileName) {
        const sourceExtensions = ['.cs', '.ts', '.vue', '.js'];
        return sourceExtensions.some(ext => fileName.endsWith(ext));
    }

    /**
     * 累积分析结果
     */
    accumulateAnalysis(content, fileInfo) {
        // 累积模式识别结果
        const patterns = this.identifyPatterns(content, fileInfo);
        this.analysisResults.patterns.push(...patterns);
        
        // 累积依赖关系
        const deps = this.analyzeDependencies(content, fileInfo);
        Object.keys(deps).forEach(key => {
            if (!this.analysisResults.dependencies[key]) {
                this.analysisResults.dependencies[key] = [];
            }
            this.analysisResults.dependencies[key].push(...deps[key]);
        });
    }

    /**
     * 生成分析报告
     */
    generateAnalysisReport() {
        console.log('\n📊 代码分析报告');
        console.log('================');
        
        if (this.analysisResults.structure.fileName) {
            console.log(`📄 文件: ${this.analysisResults.structure.fileName}`);
            console.log(`📏 大小: ${this.analysisResults.structure.size} 字符`);
            console.log(`📝 行数: ${this.analysisResults.structure.lines} 行`);
        }
        
        if (this.analysisResults.patterns.length > 0) {
            console.log('\n🎯 识别的设计模式:');
            this.analysisResults.patterns.forEach(pattern => {
                console.log(`  - ${pattern.type} (置信度: ${(pattern.confidence * 100).toFixed(0)}%)`);
            });
        }
        
        if (Object.keys(this.analysisResults.dependencies).length > 0) {
            console.log('\n🔗 依赖关系:');
            Object.entries(this.analysisResults.dependencies).forEach(([type, deps]) => {
                if (deps.length > 0) {
                    console.log(`  ${type}: ${deps.length} 个依赖`);
                }
            });
        }
        
        if (this.analysisResults.metrics.complexity) {
            console.log('\n📈 代码指标:');
            console.log(`  圈复杂度: ${this.analysisResults.metrics.complexity}`);
            console.log(`  可维护性指数: ${this.analysisResults.metrics.maintainabilityIndex}`);
        }
        
        console.log('\n✅ 分析完成');
    }
}

// 命令行接口
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};
    
    // 解析命令行参数
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        options[key] = value;
    }
    
    const analyzer = new CodebaseAnalyzer(options);
    analyzer.analyze().catch(console.error);
}

module.exports = CodebaseAnalyzer;
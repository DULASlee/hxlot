#!/usr/bin/env node

/**
 * 增量代码生成脚本
 * 基于现有代码分析结果生成兼容的新代码
 */

const fs = require('fs');
const path = require('path');

class IncrementalGenerator {
    constructor(options = {}) {
        this.rootPath = options.rootPath || process.cwd();
        this.strategy = options.strategy;
        this.baseEntity = options.baseEntity;
        this.feature = options.feature;
        this.templatePath = path.join(__dirname, '../templates');
        this.generationResults = {
            generatedFiles: [],
            modifiedFiles: [],
            errors: []
        };
    }

    /**
     * 执行增量代码生成
     */
    async generate() {
        console.log('🏗️ 开始增量代码生成...');
        
        try {
            // 验证输入参数
            this.validateInputs();
            
            // 加载生成策略
            const strategy = await this.loadStrategy();
            
            // 执行代码生成
            await this.executeGeneration(strategy);
            
            // 验证生成结果
            await this.validateResults();
            
            this.generateReport();
            return this.generationResults;
        } catch (error) {
            console.error('❌ 生成失败:', error.message);
            this.generationResults.errors.push(error.message);
            throw error;
        }
    }

    /**
     * 验证输入参数
     */
    validateInputs() {
        if (!this.strategy) {
            throw new Error('必须指定生成策略 (--strategy)');
        }
        
        if (!this.baseEntity) {
            throw new Error('必须指定基础实体 (--base)');
        }
        
        if (!this.feature) {
            throw new Error('必须指定要添加的功能 (--feature)');
        }
    }

    /**
     * 加载生成策略
     */
    async loadStrategy() {
        const strategyPath = path.join(__dirname, '../rules/strategies.json');
        
        if (!fs.existsSync(strategyPath)) {
            throw new Error('策略配置文件不存在');
        }
        
        const strategies = JSON.parse(fs.readFileSync(strategyPath, 'utf-8'));
        const strategy = strategies[this.strategy];
        
        if (!strategy) {
            throw new Error(`未找到策略: ${this.strategy}`);
        }
        
        console.log(`📋 使用策略: ${strategy.name}`);
        return strategy;
    }

    /**
     * 执行代码生成
     */
    async executeGeneration(strategy) {
        console.log(`⚙️ 执行生成策略: ${strategy.name}`);
        
        for (const step of strategy.steps) {
            console.log(`  🔄 执行步骤: ${step.name}`);
            
            switch (step.type) {
                case 'analyze-existing':
                    await this.analyzeExistingCode(step);
                    break;
                case 'generate-from-template':
                    await this.generateFromTemplate(step);
                    break;
                case 'modify-existing':
                    await this.modifyExistingCode(step);
                    break;
                case 'generate-tests':
                    await this.generateTests(step);
                    break;
                default:
                    console.warn(`⚠️ 未知步骤类型: ${step.type}`);
            }
        }
    }

    /**
     * 分析现有代码
     */
    async analyzeExistingCode(step) {
        const targetPath = this.resolveTargetPath(step.target);
        
        if (!fs.existsSync(targetPath)) {
            throw new Error(`目标文件不存在: ${targetPath}`);
        }
        
        const content = fs.readFileSync(targetPath, 'utf-8');
        const analysis = this.performCodeAnalysis(content, step);
        
        console.log(`    📊 分析结果: 找到 ${analysis.patterns.length} 个模式`);
        return analysis;
    }

    /**
     * 从模板生成代码
     */
    async generateFromTemplate(step) {
        const templatePath = path.join(this.templatePath, step.template);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`模板文件不存在: ${templatePath}`);
        }
        
        const template = fs.readFileSync(templatePath, 'utf-8');
        const generatedCode = this.processTemplate(template, step.parameters);
        
        const outputPath = this.resolveOutputPath(step.output);
        this.ensureDirectoryExists(path.dirname(outputPath));
        
        fs.writeFileSync(outputPath, generatedCode, 'utf-8');
        this.generationResults.generatedFiles.push(outputPath);
        
        console.log(`    ✅ 生成文件: ${outputPath}`);
    }

    /**
     * 修改现有代码
     */
    async modifyExistingCode(step) {
        const targetPath = this.resolveTargetPath(step.target);
        
        if (!fs.existsSync(targetPath)) {
            throw new Error(`目标文件不存在: ${targetPath}`);
        }
        
        let content = fs.readFileSync(targetPath, 'utf-8');
        
        for (const modification of step.modifications) {
            content = this.applyModification(content, modification);
        }
        
        fs.writeFileSync(targetPath, content, 'utf-8');
        this.generationResults.modifiedFiles.push(targetPath);
        
        console.log(`    ✅ 修改文件: ${targetPath}`);
    }

    /**
     * 生成测试代码
     */
    async generateTests(step) {
        const testTemplatePath = path.join(this.templatePath, 'testing', step.testTemplate);
        
        if (!fs.existsSync(testTemplatePath)) {
            console.warn(`⚠️ 测试模板不存在: ${testTemplatePath}`);
            return;
        }
        
        const template = fs.readFileSync(testTemplatePath, 'utf-8');
        const testCode = this.processTemplate(template, step.parameters);
        
        const testOutputPath = this.resolveTestOutputPath(step.output);
        this.ensureDirectoryExists(path.dirname(testOutputPath));
        
        fs.writeFileSync(testOutputPath, testCode, 'utf-8');
        this.generationResults.generatedFiles.push(testOutputPath);
        
        console.log(`    ✅ 生成测试: ${testOutputPath}`);
    }

    /**
     * 执行代码分析
     */
    performCodeAnalysis(content, step) {
        const analysis = {
            patterns: [],
            methods: [],
            properties: [],
            dependencies: []
        };
        
        // 识别方法模式
        const methodRegex = /(?:public|private|protected)\s+(?:async\s+)?(?:\w+\??)\s+(\w+)\s*\([^)]*\)/g;
        let match;
        while ((match = methodRegex.exec(content)) !== null) {
            analysis.methods.push(match[1]);
        }
        
        // 识别属性模式
        const propertyRegex = /(?:public|private|protected)\s+(?:\w+\??)\s+(\w+)\s*{\s*get/g;
        while ((match = propertyRegex.exec(content)) !== null) {
            analysis.properties.push(match[1]);
        }
        
        // 识别CRUD模式
        if (this.hasCrudPattern(content)) {
            analysis.patterns.push('CRUD');
        }
        
        return analysis;
    }

    /**
     * 检查CRUD模式
     */
    hasCrudPattern(content) {
        const crudMethods = ['Create', 'Get', 'Update', 'Delete'];
        return crudMethods.every(method => 
            content.includes(`${method}Async`) || content.includes(`${method}(`)
        );
    }

    /**
     * 处理模板
     */
    processTemplate(template, parameters) {
        let processed = template;
        
        // 替换基础参数
        const baseParams = {
            EntityName: this.baseEntity,
            entityName: this.toCamelCase(this.baseEntity),
            Feature: this.feature,
            feature: this.toCamelCase(this.feature),
            Timestamp: new Date().toISOString()
        };
        
        const allParams = { ...baseParams, ...parameters };
        
        for (const [key, value] of Object.entries(allParams)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, value);
        }
        
        return processed;
    }

    /**
     * 应用代码修改
     */
    applyModification(content, modification) {
        switch (modification.type) {
            case 'insert-method':
                return this.insertMethod(content, modification);
            case 'add-property':
                return this.addProperty(content, modification);
            case 'add-using':
                return this.addUsing(content, modification);
            default:
                console.warn(`⚠️ 未知修改类型: ${modification.type}`);
                return content;
        }
    }

    /**
     * 插入方法
     */
    insertMethod(content, modification) {
        const methodCode = modification.code;
        const insertPoint = this.findInsertionPoint(content, modification.position);
        
        return content.slice(0, insertPoint) + 
               '\n\n' + methodCode + '\n' + 
               content.slice(insertPoint);
    }

    /**
     * 添加属性
     */
    addProperty(content, modification) {
        const propertyCode = modification.code;
        const insertPoint = this.findPropertyInsertionPoint(content);
        
        return content.slice(0, insertPoint) + 
               '\n    ' + propertyCode + '\n' + 
               content.slice(insertPoint);
    }

    /**
     * 添加using语句
     */
    addUsing(content, modification) {
        const usingStatement = `using ${modification.namespace};`;
        
        if (content.includes(usingStatement)) {
            return content; // 已存在
        }
        
        const usingRegex = /using\s+[^;]+;/g;
        const matches = content.match(usingRegex);
        
        if (matches) {
            const lastUsing = matches[matches.length - 1];
            const insertPoint = content.indexOf(lastUsing) + lastUsing.length;
            return content.slice(0, insertPoint) + 
                   '\n' + usingStatement + 
                   content.slice(insertPoint);
        } else {
            return usingStatement + '\n\n' + content;
        }
    }

    /**
     * 查找插入点
     */
    findInsertionPoint(content, position) {
        switch (position) {
            case 'end-of-class':
                const lastBrace = content.lastIndexOf('}');
                return lastBrace > 0 ? lastBrace : content.length;
            case 'after-constructor':
                const constructorEnd = content.indexOf('}\n', content.indexOf('public ' + this.baseEntity + '('));
                return constructorEnd > 0 ? constructorEnd + 2 : this.findInsertionPoint(content, 'end-of-class');
            default:
                return content.length;
        }
    }

    /**
     * 查找属性插入点
     */
    findPropertyInsertionPoint(content) {
        // 在第一个方法之前插入属性
        const methodMatch = content.match(/\n\s*(?:public|private|protected)\s+(?:async\s+)?(?:\w+\??)\s+\w+\s*\(/);
        if (methodMatch) {
            return content.indexOf(methodMatch[0]);
        }
        
        return this.findInsertionPoint(content, 'end-of-class');
    }

    /**
     * 解析目标路径
     */
    resolveTargetPath(target) {
        if (path.isAbsolute(target)) {
            return target;
        }
        
        // 替换占位符
        const resolved = target
            .replace('{EntityName}', this.baseEntity)
            .replace('{entityName}', this.toCamelCase(this.baseEntity));
        
        return path.join(this.rootPath, resolved);
    }

    /**
     * 解析输出路径
     */
    resolveOutputPath(output) {
        const resolved = output
            .replace('{EntityName}', this.baseEntity)
            .replace('{entityName}', this.toCamelCase(this.baseEntity))
            .replace('{Feature}', this.feature)
            .replace('{feature}', this.toCamelCase(this.feature));
        
        return path.join(this.rootPath, resolved);
    }

    /**
     * 解析测试输出路径
     */
    resolveTestOutputPath(output) {
        const resolved = output
            .replace('{EntityName}', this.baseEntity)
            .replace('{Feature}', this.feature);
        
        return path.join(this.rootPath, 'test', resolved);
    }

    /**
     * 确保目录存在
     */
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * 转换为驼峰命名
     */
    toCamelCase(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    /**
     * 验证生成结果
     */
    async validateResults() {
        console.log('🔍 验证生成结果...');
        
        // 检查生成的文件是否存在
        for (const filePath of this.generationResults.generatedFiles) {
            if (!fs.existsSync(filePath)) {
                throw new Error(`生成的文件不存在: ${filePath}`);
            }
        }
        
        // 检查修改的文件是否有效
        for (const filePath of this.generationResults.modifiedFiles) {
            if (!fs.existsSync(filePath)) {
                throw new Error(`修改的文件不存在: ${filePath}`);
            }
            
            // 简单的语法检查
            const content = fs.readFileSync(filePath, 'utf-8');
            if (this.hasSyntaxErrors(content, filePath)) {
                this.generationResults.errors.push(`语法错误: ${filePath}`);
            }
        }
        
        console.log('✅ 验证完成');
    }

    /**
     * 检查语法错误
     */
    hasSyntaxErrors(content, filePath) {
        const ext = path.extname(filePath);
        
        if (ext === '.cs') {
            // 检查C#语法错误
            const openBraces = (content.match(/{/g) || []).length;
            const closeBraces = (content.match(/}/g) || []).length;
            return openBraces !== closeBraces;
        }
        
        return false;
    }

    /**
     * 生成报告
     */
    generateReport() {
        console.log('\n📊 增量生成报告');
        console.log('================');
        
        console.log(`🏗️ 策略: ${this.strategy}`);
        console.log(`📦 基础实体: ${this.baseEntity}`);
        console.log(`⭐ 新增功能: ${this.feature}`);
        
        if (this.generationResults.generatedFiles.length > 0) {
            console.log('\n📄 生成的文件:');
            this.generationResults.generatedFiles.forEach(file => {
                console.log(`  + ${path.relative(this.rootPath, file)}`);
            });
        }
        
        if (this.generationResults.modifiedFiles.length > 0) {
            console.log('\n✏️ 修改的文件:');
            this.generationResults.modifiedFiles.forEach(file => {
                console.log(`  ~ ${path.relative(this.rootPath, file)}`);
            });
        }
        
        if (this.generationResults.errors.length > 0) {
            console.log('\n❌ 错误:');
            this.generationResults.errors.forEach(error => {
                console.log(`  ! ${error}`);
            });
        }
        
        console.log('\n✅ 生成完成');
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
    
    const generator = new IncrementalGenerator(options);
    generator.generate().catch(console.error);
}

module.exports = IncrementalGenerator;
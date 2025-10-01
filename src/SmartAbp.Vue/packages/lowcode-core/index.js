/**
 * 🎯 lowcode-core 包导出文件
 * 🎯 低代码引擎核心功能 - 专注基础实现
 * ❌ 严禁添加AI智能辅助功能
 * ❌ 严禁添加多人协作功能
 * 📦 遵循packages目录架构 - 支持独立发包
 */
// 🚀 零配置代码生成引擎
export { ZeroConfigGenerationEngine, zeroConfigEngine, inferModuleNameFromTable, inferDisplayNameFromTable } from './src/engines/ZeroConfigGenerationEngine';
// 🔍 关系检测引擎
export { SimpleRelationshipDetector, createRelationshipDetector, detectTableRelationships } from './src/analyzers/SimpleRelationshipDetector';
// 🎯 模板选择器
export { RelationshipTemplateSelector, createTemplateSelector, selectTemplateForRelationship } from './src/generators/RelationshipTemplateSelector';
// 🏪 状态管理 (预留，暂时导出空对象)
export const useWorkspaceStore = () => {
    return {
    // TODO: 实现工作区状态管理
    };
};
export const useEntityModelingStore = () => {
    return {
        // 实体列表
        entities: [],
        // 实体管理方法
        addEntity: (entity) => {
            console.log('添加实体:', entity);
        },
        updateEntity: (entity) => {
            console.log('更新实体:', entity);
        },
        removeEntity: (entityId) => {
            console.log('删除实体:', entityId);
        },
        // 字段管理
        addField: (field) => {
            console.log('添加字段:', field);
        },
        removeField: (fieldId) => {
            console.log('删除字段:', fieldId);
        },
        // 关系管理
        relations: [],
        addRelation: (relation) => {
            console.log('添加关系:', relation);
        },
        removeRelation: (relationId) => {
            console.log('删除关系:', relationId);
        },
        // 验证规则
        addValidationRule: (rule) => {
            console.log('添加验证规则:', rule);
        },
        removeValidationRule: (ruleId) => {
            console.log('删除验证规则:', ruleId);
        },
        // 数据持久化
        loadFromLocalStorage: () => { },
        saveToLocalStorage: () => { }
    };
};
export const usePageDesignStore = () => {
    return {
        // 页面列表
        pages: [],
        // 页面管理方法
        addPage: (page) => {
            console.log('添加页面:', page);
        },
        updatePage: (page) => {
            console.log('更新页面:', page);
        },
        removePage: (pageId) => {
            console.log('删除页面:', pageId);
        },
        // 页面组件管理
        addComponent: (component) => {
            console.log('添加组件:', component);
        },
        updateComponent: (component) => {
            console.log('更新组件:', component);
        },
        removeComponent: (componentId) => {
            console.log('删除组件:', componentId);
        },
        // 页面布局
        layouts: [],
        addLayout: (layout) => {
            console.log('添加布局:', layout);
        },
        removeLayout: (layoutId) => {
            console.log('删除布局:', layoutId);
        },
        // 数据持久化
        loadFromLocalStorage: () => { },
        saveToLocalStorage: () => { }
    };
};
export const useCodeGenerationStore = () => {
    return {
        // TODO: 实现代码生成状态管理
        entities: [],
        pages: [],
        loadFromLocalStorage: () => { },
        saveToLocalStorage: () => { },
        addEntity: (entity) => { console.log('添加实体:', entity); },
        updateEntity: (entity) => { console.log('更新实体:', entity); },
        removeEntity: (entityId) => { console.log('删除实体:', entityId); },
        addField: (field) => { console.log('添加字段:', field); },
        removeField: (fieldId) => { console.log('删除字段:', fieldId); },
        addRelation: (relation) => { console.log('添加关系:', relation); },
        removeRelation: (relationId) => { console.log('删除关系:', relationId); },
        addValidationRule: (rule) => { console.log('添加验证规则:', rule); },
        removeValidationRule: (ruleId) => { console.log('删除验证规则:', ruleId); },
        relations: [],
        updatePage: (page) => { console.log('更新页面:', page); },
        generateBatchPages: () => { },
        exportPageDesigns: () => { },
        completedPages: 0,
        totalPages: 0
    };
};
// 🔧 工具函数 (预留)
export const eventBus = {
    emit: (event, data) => {
        console.log('Event:', event, data);
    },
    on: (event, handler) => {
        console.log('Listen:', event, handler);
    }
};
export const logger = {
    info: (message, ...args) => console.log(message, ...args),
    error: (message, ...args) => console.error(message, ...args),
    warn: (message, ...args) => console.warn(message, ...args)
};
// 🧰 组合式函数 
export const useFullscreen = () => {
    return {
        isFullscreen: false,
        toggle: () => { },
        setFullscreenElement: (element) => {
            console.log('设置全屏元素:', element);
        },
        value: false
    };
};
// 📊 类型定义导出
export * from './src/types';
// 🧩 缺失的组件导出 (预留实现)
export const ErrorBoundary = () => null;
export const GlobalLoadingOverlay = () => null;
export const WorkspaceContainer = () => null;

export * from "./code-generator";
export * from "./types";
// ESM-friendly export of codeGeneratorApi and light mocks for templates
import { codeGeneratorApi as api } from "./code-generator";
;
api.getTemplates = api.getTemplates || (async () => [
    { id: "crud", name: "CRUD 管理页面", description: "标准增删改查页面", category: "frontend" },
    { id: "appservice", name: "应用服务", description: "ABP 应用服务模板", category: "backend" },
]);
export const codeGeneratorApi = api;
export const databaseApi = {
    getTemplates: async () => {
        // TODO: 集成真实后端 API
        return [
            { id: "crud", name: "CRUD 管理页面", description: "标准增删改查页面" },
            { id: "appservice", name: "应用服务", description: "ABP 应用服务模板" },
            { id: "form", name: "表单模板", description: "通用表单模板" },
            { id: "report", name: "报表模板", description: "数据报表模板" },
        ];
    },
};

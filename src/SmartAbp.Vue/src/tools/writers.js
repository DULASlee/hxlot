import { promises as fs } from "fs";
import path from "node:path";
import { TemplateRenderer, generateTemplateParams } from "./template-renderer";
/**
 * CodeWriter
 * 当前仅实现 writeRoutes —— 根据 manifests 生成 routes.generated.ts
 */
export class CodeWriter {
    constructor(rootDir) {
        Object.defineProperty(this, "rootDir", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rootDir
        });
        Object.defineProperty(this, "templateRenderer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.templateRenderer = new TemplateRenderer(rootDir);
    }
    async writeRoutes(manifests) {
        const routeLines = [];
        manifests.forEach((m) => {
            m.routes.forEach((r) => {
                routeLines.push(`  { name: '${r.name}', path: '${r.path}', component: () => import('${r.component}'), meta: ${JSON.stringify(r.meta || {})} }`);
            });
        });
        const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

import type { RouteRecordRaw } from 'vue-router'

export const generatedRoutes: RouteRecordRaw[] = [
${routeLines.join(",\n")}
]
`;
        await this.writeFile("src/appshell/router/routes.generated.ts", content);
    }
    /**
     * 根据 manifests 生成 Pinia Store 注册文件
     */
    async writeStores(manifests) {
        const imports = [];
        const registrations = [];
        manifests.forEach((m) => {
            m.stores.forEach((s) => {
                imports.push(`import { ${s.symbol} } from '${s.modulePath}'`);
                registrations.push(`    ${s.symbol}, // ${m.name}`);
            });
        });
        const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

${imports.join("\n")}

export const generatedStores = () => ({
${registrations.join(",\n")}
})
`;
        await this.writeFile("src/appshell/stores/stores.generated.ts", content);
    }
    /**
     * 生成生命周期钩子聚合文件（preInit / init / postInit / beforeMount / mounted）
     */
    async writeLifecycles(manifests) {
        const hooks = ["preInit", "init", "postInit", "beforeMount", "mounted"];
        const sections = [];
        hooks.forEach((hook) => {
            const imports = [];
            const calls = [];
            manifests.forEach((m) => {
                const pathStr = m.lifecycle[hook];
                if (pathStr) {
                    const importName = `${m.name}_${hook}`;
                    imports.push(`import ${importName} from '${pathStr}'`);
                    calls.push(`    await ${importName}?.(_ctx) // ${m.name}`);
                }
            });
            // 生成每个 hook 的函数
            sections.push(`// ${hook} hooks\n${imports.join("\n")}\n\nexport async function run${hook.charAt(0).toUpperCase() + hook.slice(1)}(_ctx: any) {\n  try {\n${calls.join("\n")}\n  } catch (error) {\n    console.error('[Lifecycle] Error in ${hook}:', error)\n    throw error\n  }\n}`);
        });
        const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

${sections.join("\n\n")}
`;
        await this.writeFile("src/appshell/lifecycle.generated.ts", content);
    }
    /**
     * 生成权限策略聚合文件
     */
    async writePolicies(manifests) {
        const policyMap = {};
        manifests.forEach((m) => {
            m.policies.forEach((p) => (policyMap[p] = m.name));
        });
        const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

export const generatedPolicies = ${JSON.stringify(policyMap, null, 2)}
`;
        await this.writeFile("src/appshell/security/policies.generated.ts", content);
    }
    /**
     * 根据 manifests 生成菜单聚合文件
     */
    async writeMenus(manifests) {
        const menuItems = [];
        manifests.forEach((m) => {
            const folderKey = `${m.name.toLowerCase()}-management`;
            const folder = {
                key: folderKey,
                title: m.displayName || m.name,
                icon: m.menuConfig?.icon || "fas fa-cube",
                type: "folder",
                order: m.menuConfig?.order ?? 100,
                visible: true,
                requiredRoles: ["admin", "admin666"],
                children: [],
            };
            m.routes.forEach((r, idx) => {
                if (r.meta?.showInMenu !== false) {
                    folder.children.push({
                        key: r.meta?.menuKey || `${m.name.toLowerCase()}-${idx}`,
                        title: r.meta?.title || r.name,
                        icon: r.meta?.icon || m.menuConfig?.icon || "fas fa-file",
                        type: "page",
                        path: r.path,
                        component: r.component,
                        order: r.meta?.order ?? idx,
                        visible: !(r.meta?.hidden === true),
                        requiredRoles: r.meta?.requiredRoles || ["admin", "admin666"],
                        meta: r.meta || {},
                    });
                }
            });
            menuItems.push(folder);
        });
        const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

export const generatedMenus = ${JSON.stringify(menuItems, null, 2)}
`;
        await this.writeFile("src/appshell/menu/menu.generated.ts", content);
    }
    /**
     * 🔥 核心功能：根据模板生成Vue组件
     * 这是修复模块向导的关键方法
     */
    async writeComponents(manifests) {
        console.log("🏗️ 开始生成Vue组件...");
        const results = [];
        for (const manifest of manifests) {
            console.log(`📦 处理模块: ${manifest.name} (${manifest.displayName})`);
            // 生成模板参数
            const params = generateTemplateParams(manifest.name, manifest.displayName);
            for (const route of manifest.routes) {
                try {
                    console.log(`🎯 生成组件: ${route.component}`);
                    // 转换组件路径为文件系统路径
                    const componentPath = route.component.replace("@/", "src/");
                    const fullComponentPath = path.join(this.rootDir, componentPath);
                    // 使用模板渲染引擎生成组件
                    const { content, templateUsed } = await this.templateRenderer.generateComponent(route.component, params);
                    // 确保目录存在
                    await fs.mkdir(path.dirname(fullComponentPath), { recursive: true });
                    // 写入组件文件
                    await fs.writeFile(fullComponentPath, content, "utf-8");
                    results.push({
                        component: route.component,
                        templateUsed,
                        success: true,
                    });
                    console.log(`✅ 组件生成成功: ${route.component}`);
                }
                catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    console.error(`❌ 组件生成失败: ${route.component} - ${errorMsg}`);
                    results.push({
                        component: route.component,
                        templateUsed: "未知",
                        success: false,
                        error: errorMsg,
                    });
                }
            }
        }
        // 生成报告
        const report = this.templateRenderer.generateReport(results);
        console.log(report);
        // 写入生成报告
        const reportPath = path.join(this.rootDir, "src/appshell/generation-report.md");
        await fs.writeFile(reportPath, report, "utf-8");
        const successful = results.filter((r) => r.success).length;
        const total = results.length;
        if (successful === total) {
            console.log(`🎉 所有组件生成成功！(${successful}/${total})`);
        }
        else {
            console.warn(`⚠️ 部分组件生成失败 (${successful}/${total})，请查看报告: ${reportPath}`);
        }
    }
    /**
     * 🎯 生成单个Store文件（扩展功能）
     */
    async writeStoreFiles(manifests) {
        console.log("🗃️ 开始生成Store文件...");
        for (const manifest of manifests) {
            for (const store of manifest.stores) {
                try {
                    const params = generateTemplateParams(manifest.name, manifest.displayName);
                    // 转换Store路径
                    const storePath = store.modulePath.replace("@/", "src/") + ".ts";
                    const fullStorePath = path.join(this.rootDir, storePath);
                    // 使用Store模板生成
                    const { content } = await this.templateRenderer.generateComponent(store.modulePath, params);
                    await fs.mkdir(path.dirname(fullStorePath), { recursive: true });
                    await fs.writeFile(fullStorePath, content, "utf-8");
                    console.log(`✅ Store文件生成成功: ${store.modulePath}`);
                }
                catch (error) {
                    console.error(`❌ Store文件生成失败: ${store.modulePath} - ${error}`);
                }
            }
        }
    }
    async writeFile(relPath, content) {
        const fullPath = path.join(this.rootDir, relPath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content, "utf-8");
    }
}

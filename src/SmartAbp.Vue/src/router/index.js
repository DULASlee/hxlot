import SmartAbpLayout from "@/components/layout/SmartAbpLayout.vue";
import { i18n } from "@/plugins/i18n";
import { useAuthStore } from "@/stores";
import { logger } from "@/utils/logger";
import LoginView from "@/views/auth/Login.vue";
import { ElMessage } from "element-plus";
import { createRouter, createWebHistory } from "vue-router";
import { autoLoadModuleRoutes, printRouteLoadInfo } from "./auto-load";
import opsMonitoringRoutes from "./modules/ops-monitoring";
// 动态导入页面组件
const DashboardView = () => import("@/views/common/DashboardView.vue");
const LoginTest = () => import("@/views/auth/LoginTest.vue");
const ForbiddenView = () => import("@/views/error/Forbidden.vue");
// 新增页面组件
const ProfileView = () => import("@/views/common/ProfileView.vue");
const SettingsView = () => import("@/views/common/SettingsView.vue");
const ProjectListView = () => import("@/views/project/ProjectListView.vue");
const ProjectAnalysisView = () => import("@/views/project/ProjectAnalysisView.vue");
const routes = [
    // 登录页面
    {
        path: "/login",
        name: "Login",
        component: LoginView,
        meta: {
            title: "登录",
            requiresAuth: false
        },
    },
    {
        path: "/test/login",
        name: "LoginTest",
        component: LoginTest,
        meta: { requiresAuth: false, title: "登录功能测试" },
    },
    // 403 权限不足页面
    {
        path: "/403",
        name: "Forbidden",
        component: ForbiddenView,
        meta: {
            title: "权限不足",
            requiresAuth: false
        },
    },
    // 根路径重定向到工作台
    {
        path: "/",
        redirect: "/dashboard",
        meta: {
            title: "首页",
            requiresAuth: false
        },
    },
    // 工作台页面
    {
        path: "/dashboard",
        component: SmartAbpLayout,
        name: "Dashboard",
        meta: {
            title: "工作台",
            icon: "📊",
            requiresAuth: true,
            requiredRoles: ["user"],
        },
        children: [
            {
                path: "",
                name: "DashboardHome",
                component: DashboardView,
                meta: { title: "工作台" },
            },
        ],
    },
    // 项目管理模块
    {
        path: "/Project",
        component: SmartAbpLayout,
        meta: {
            title: "项目管理",
            icon: "📁",
            requiresAuth: true,
            requiredRoles: ["user"],
        },
        children: [
            {
                path: "",
                name: "ProjectList",
                component: ProjectListView,
                meta: { title: "项目列表", menuKey: "project-list" },
            },
            {
                path: "analysis",
                name: "ProjectAnalysis",
                component: ProjectAnalysisView,
                meta: { title: "项目分析", menuKey: "project-analysis" },
            },
        ],
    },
    // 日志管理模块
    {
        path: "/Log",
        component: SmartAbpLayout,
        meta: {
            title: "日志管理",
            icon: "📋",
            requiresAuth: true,
            requiredRoles: ["user"],
        },
        children: [
            {
                path: "",
                name: "LogList",
                component: () => import("@/views/log/LogManagement.vue"),
                meta: { title: "日志管理", menuKey: "log-management" },
            },
            {
                path: "viewer",
                name: "LogViewer",
                component: () => import("@/views/log/AdvancedLogViewer.vue"),
                meta: { title: "日志查看器", menuKey: "log-viewer" },
            },
            {
                path: "dashboard",
                name: "LogDashboard",
                component: () => import("@/views/log/LogDashboard.vue"),
                meta: { title: "日志仪表板", menuKey: "log-dashboard" },
            },
        ],
    },
    // 系统管理模块
    {
        path: "/Admin",
        component: SmartAbpLayout,
        meta: {
            title: "系统管理",
            icon: "⚙️",
            requiresAuth: true,
            requiredRoles: ["admin"],
        },
        children: [
            {
                path: "",
                name: "AdminDashboard",
                component: DashboardView,
                meta: { title: "系统概览", menuKey: "admin-dashboard" },
            },
            {
                path: "settings",
                name: "AdminSettings",
                component: SettingsView,
                meta: { title: "系统设置", menuKey: "admin-settings" },
            },
            {
                path: "performance",
                name: "AdminPerformance",
                component: () => import("@/views/system/PerformanceMonitorView.vue"),
                meta: {
                    title: "性能监控",
                    menuKey: "admin-performance",
                    requiredRoles: ["admin", "guest"]
                },
            },
        ],
    },
    // 测试页面
    {
        path: "/Test",
        component: SmartAbpLayout,
        meta: {
            title: "测试功能",
            icon: "🧪",
            requiresAuth: true,
            requiredRoles: ["user"],
        },
        children: [
            {
                path: "",
                name: "TestView",
                component: () => import("@/views/test/TestView.vue"),
                meta: { title: "系统测试", menuKey: "test-system" },
            },
            {
                path: "login",
                name: "LoginTestPage",
                component: LoginTest,
                meta: { title: "登录测试", menuKey: "test-login" },
            },
        ],
    },
    // 代码生成入口选择页（嵌套在框架中）
    {
        path: "/codegen-entrance",
        component: SmartAbpLayout,
        meta: {
            title: "代码生成入口",
            requiresAuth: true,
            requiredRoles: ["user"],
        },
        children: [
            {
                path: "",
                name: "CodeGenEntrance",
                component: () => import("@/views/lowcode/CodeGenEntrance.vue"),
                meta: {
                    title: "代码生成入口",
                    icon: "🚀",
                    menuKey: "codegen-entrance"
                },
            },
        ],
    },
    // 极简代码生成（嵌套在框架布局中）
    {
        path: "/CodeGen",
        component: SmartAbpLayout,
        meta: {
            title: "代码生成",
            requiresAuth: true,
            requiredRoles: ["user"],
        },
        children: [
            {
                path: "ultra-simple",
                name: "UltraSimpleStudio",
                component: () => import("@/views/lowcode/UltraSimpleStudio.vue"),
                meta: {
                    title: "极简代码生成",
                    icon: "⚡",
                    menuKey: "ultra-simple-studio"
                },
            },
            // 🏗️ 模块向导 - 专业通道
            {
                path: "wizard",
                name: "ModuleWizard",
                component: () => import("@smartabp/lowcode-designer/views/codegen/LowCodeEngineView.vue"),
                meta: {
                    title: "模块生成向导",
                    icon: "🧙",
                    menuKey: "module-wizard"
                },
            },
        ],
    },
    // LowCode Studio 专业工作台（嵌套在框架布局中）
    {
        path: "/lowcode",
        component: SmartAbpLayout,
        meta: {
            title: "LowCode Studio",
            icon: "🧩",
            requiresAuth: true,
            requiredRoles: ["user"],
        },
        children: [
            {
                path: "",
                name: "LowCodeStudio",
                component: () => import("@/views/lowcode/LowCodeStudioView.vue"),
                meta: { title: "LowCode Studio", menuKey: "lowcode-studio" },
                children: [
                    {
                        path: "welcome",
                        name: "LowCodeStudioWelcome",
                        component: () => import("@/views/lowcode/LowCodeStudioWelcome.vue"),
                        meta: { title: "欢迎页", menuKey: "welcome" }
                    },
                    {
                        path: "industry-template-config",
                        name: "IndustryTemplateConfig",
                        component: () => import("@/views/lowcode/IndustryTemplateConfig.vue"),
                        meta: { title: "行业模板配置", menuKey: "industry-template-config" },
                    },
                    {
                        path: "entity-modeling",
                        name: "EntityModeling",
                        component: () => import("@smartabp/lowcode-designer/views/EntityModelingView.vue"),
                        meta: { title: "数据建模", menuKey: "entity-modeling" },
                    },
                    {
                        path: "design",
                        name: "PageDesign",
                        component: () => import("@smartabp/lowcode-designer/views/DesignView.vue"),
                        meta: { title: "页面设计", menuKey: "page-design" },
                    },
                    {
                        path: "generation",
                        name: "CodeGeneration",
                        component: () => import("@/views/lowcode/GenerationView.vue"),
                        meta: { title: "代码生成", menuKey: "code-generation" },
                    },
                    {
                        path: "ddd-designer",
                        name: "DddDomainDesigner",
                        component: () => import("@/views/lowcode/DddDomainDesignerView.vue"),
                        meta: {
                            title: "DDD领域设计器",
                            menuKey: "ddd-designer",
                            icon: "🏛️",
                            description: "领域驱动设计代码生成器"
                        },
                    },
                    {
                        path: "cqrs-designer",
                        name: "CqrsDesigner",
                        component: () => import("@/views/lowcode/CqrsDesignerView.vue"),
                        meta: {
                            title: "CQRS模式设计器",
                            menuKey: "cqrs-designer",
                            icon: "⚡",
                            description: "CQRS模式代码生成器"
                        },
                    },
                    {
                        path: "workflows",
                        name: "WorkflowsManagement",
                        component: () => import("@/views/lowcode/WorkflowsView.vue"),
                        meta: { title: "工作流", menuKey: "workflows" },
                    },
                    {
                        path: "aspire-designer",
                        name: "AspireDesigner",
                        component: () => import("@smartabp/lowcode-designer/views/codegen/AspireDesignerView.vue"),
                        meta: {
                            title: ".NET Aspire设计器",
                            menuKey: "aspire-designer",
                            icon: "🌐",
                            description: "微服务编排与云原生架构设计"
                        },
                    },
                    {
                        path: "observability-dashboard",
                        name: "ObservabilityDashboard",
                        component: () => import("@smartabp/lowcode-designer/views/codegen/ObservabilityDashboard.vue"),
                        meta: {
                            title: "可观测性仪表板",
                            menuKey: "observability-dashboard",
                            icon: "📊",
                            description: "黄金指标与RED指标实时监控"
                        },
                    },
                    {
                        path: "observability-config",
                        name: "ObservabilityConfig",
                        component: () => import("@smartabp/lowcode-designer/views/codegen/ObservabilityConfigPanel.vue"),
                        meta: {
                            title: "可观测性配置",
                            menuKey: "observability-config",
                            icon: "⚙️",
                            description: "Prometheus、Grafana和告警规则配置"
                        },
                    },
                    {
                        path: "theme",
                        name: "ThemeCustomization",
                        component: () => import("@smartabp/lowcode-designer/views/ThemeCustomizationView.vue"),
                        meta: { title: "主题定制", menuKey: "theme-customization" },
                    },
                    {
                        path: "form-designer",
                        name: "FormDesigner",
                        component: () => import("@smartabp/lowcode-core/src/components/SmartFormBuilder/SmartFormDesigner.vue"),
                        meta: {
                            title: "表单设计器",
                            menuKey: "form-designer",
                            icon: "📝",
                            description: "可视化表单设计器 2.0 - 拖拽式设计，40种字段类型"
                        },
                    },
                    {
                        path: "form-builder-demo",
                        name: "FormBuilderDemo",
                        component: () => import("@/views/lowcode/FormBuilderDemo.vue"),
                        meta: {
                            title: "表单构建器演示",
                            menuKey: "form-builder-demo",
                            icon: "🎯",
                            description: "SmartFormBuilder 2.0 使用示例和API文档"
                        },
                    },
                    {
                        path: "form-linkage-demo",
                        name: "FormLinkageDemo",
                        component: () => import("@/views/lowcode/FormLinkageDemo.vue"),
                        meta: {
                            title: "表单联动演示",
                            menuKey: "form-linkage-demo",
                            icon: "🔗",
                            description: "动态表单与字段联动完整演示"
                        },
                    },
                ],
            },
        ],
    },
    // 个人中心
    {
        path: "/profile",
        component: SmartAbpLayout,
        name: "Profile",
        meta: {
            title: "个人中心",
            icon: "👤",
            requiresAuth: true,
            requiredRoles: ["user"],
        },
        children: [
            {
                path: "",
                name: "ProfileHome",
                component: ProfileView,
                meta: { title: "个人中心" },
            },
        ],
    },
    // 帮助中心
    {
        path: "/help",
        component: SmartAbpLayout,
        name: "Help",
        meta: {
            title: "帮助中心",
            icon: "❓",
            requiresAuth: true,
            requiredRoles: ["user"],
        },
        children: [
            {
                path: "",
                name: "HelpHome",
                component: () => import("@/views/common/HelpView.vue"),
                meta: { title: "帮助中心" },
            },
        ],
    },
    // 业务规则引擎路由
    {
        path: "/business-rules",
        component: SmartAbpLayout,
        meta: {
            title: "业务规则引擎",
            icon: "⚙️",
            requiresAuth: true,
            requiredRoles: ["user", "admin"],
        },
        children: [
            {
                path: "",
                name: "BusinessRulesEngine",
                component: () => import("@smartabp/lowcode-designer/components/BusinessRulesEngine.vue"),
                meta: {
                    title: "业务规则引擎",
                    menuKey: "business-rules-engine",
                    keepAlive: true,
                    description: "动态业务规则配置与执行引擎"
                },
            },
        ],
    },
    // 运维监控模块路由
    ...opsMonitoringRoutes,
    // 🚀 自动加载router/modules目录下的所有路由模块
    // 这使得代码生成后的路由无需手动导入，自动发现并加载
    ...autoLoadModuleRoutes(),
    // 404页面 - 重定向到主框架内的404页面
    {
        path: "/:pathMatch(.*)*",
        redirect: { name: "Dashboard" },
    },
];
// 🐛 开发模式：打印路由加载信息
if (import.meta.env.DEV) {
    console.log('📋 当前路由总数:', routes.length);
    printRouteLoadInfo();
}
const router = createRouter({
    history: createWebHistory(),
    routes,
});
// 路由守卫 - 增强版认证和权限检查
router.beforeEach(async (to, from, next) => {
    logger.debug(`[路由守卫] 从 ${from.path} 跳转到 ${to.path}`);
    // 检查用户是否已登录
    const authStore = useAuthStore();
    const isLoggedIn = authStore.isAuthenticated;
    // 1. 登录状态检查：已登录用户尝试访问登录页，重定向到工作台
    if (to.name === "Login" && isLoggedIn) {
        logger.debug("[路由守卫] 用户已登录，重定向到工作台");
        return next({ name: "Dashboard" });
    }
    // 2. 认证检查：需要认证但未登录，重定向到登录页
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    if (requiresAuth && !isLoggedIn) {
        logger.debug("[路由守卫] 需要认证但未登录，重定向到登录页");
        return next({
            name: "Login",
            query: { redirect: to.fullPath },
        });
    }
    // 3. 角色权限检查（支持角色层级继承）：检查用户是否具有所需角色
    const requiredRoles = to.meta.requiredRoles;
    if (requiredRoles && requiredRoles.length > 0 && isLoggedIn) {
        const userRoles = authStore.userInfo?.roles || [];
        const username = authStore.userInfo?.userName || authStore.userInfo?.username;
        // 🔑 开发阶段特殊处理：超级用户白名单直接放行
        const { isSuperUser } = await import('@/utils/roleHierarchy');
        if (isSuperUser(username)) {
            logger.debug(`[路由守卫] 超级用户 "${username}" 白名单放行（开发阶段） - 拥有所有权限`);
            return next();
        }
        // 🏛️ 使用角色层级系统检查权限（admin > manager > user > guest）
        const { hasRolePermission, getHighestRole } = await import('@/utils/roleHierarchy');
        const hasPermission = hasRolePermission(userRoles, requiredRoles);
        if (!hasPermission) {
            const highestRole = getHighestRole(userRoles);
            logger.warn(`[路由守卫] 用户权限不足 - 用户: ${username}, 需要角色: ${requiredRoles.join(', ')}, 用户最高角色: ${highestRole}, 所有角色: ${userRoles.join(', ')}`);
            ElMessage.warning({
                message: i18n.global.t('permission.noAccess') || '您的权限不足，无法访问此页面',
                duration: 3000,
                showClose: true
            });
            // 权限不足时重定向到403页面，避免重定向循环
            return next({ name: 'Forbidden' });
        }
        logger.debug(`[路由守卫] 角色权限检查通过 - 用户: ${username}, 用户角色: ${userRoles.join(', ')}, 需要角色: ${requiredRoles.join(', ')}`);
    }
    // 4. 根路径处理：根据登录状态重定向
    if (to.path === "/") {
        if (isLoggedIn) {
            logger.debug("[路由守卫] 根路径重定向到工作台");
            return next({ name: "Dashboard" });
        }
        else {
            logger.debug("[路由守卫] 根路径重定向到登录页");
            return next({ name: "Login" });
        }
    }
    logger.debug("[路由守卫] 允许访问");
    next();
});
// 路由守卫 - 记录路由切换性能
router.afterEach(async (to) => {
    const startTime = performance.now();
    // 动态导入性能监控（避免循环依赖）
    const { performanceMonitor } = await import("@/utils/performance/monitor");
    // 等待下一帧后记录，此时组件应该已经渲染完成
    requestAnimationFrame(() => {
        const duration = performance.now() - startTime;
        performanceMonitor.recordRoutePerformance(to.path, duration);
    });
});
// 多标签页状态同步
window.addEventListener("storage", (event) => {
    if (event.key === "token" && !event.newValue) {
        router.push({ name: "Login" });
    }
});
export default router;

// 🚨 API错误处理类
export class APIError extends Error {
    constructor(status, message, data) {
        super(message);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: status
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: data
        });
        this.name = 'APIError';
        // 使用参数避免未使用警告
        void status;
        void data;
    }
}
// 🚀 企业级API客户端实现 - 基于29个后端代码生成器
class CodeGeneratorAPI {
    constructor() {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: import.meta.env.VITE_API_BASE_URL || 'https://localhost:44379'
        });
        // 与后端HttpApi控制器保持一致
        Object.defineProperty(this, "apiPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '/api/code-generator'
        });
    }
    // private hubConnection: any = null // 暂未使用，避免未使用变量警告
    async request(method, endpoint, data) {
        const url = `${this.baseUrl}${this.apiPath}${endpoint}`;
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`,
            },
            credentials: 'include',
        };
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new APIError(response.status, errorData.message || `HTTP ${response.status}`, errorData);
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        }
        catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            console.error(`API request failed: ${method} ${url}`, error);
            throw new APIError(0, `Network error: ${error.message}`, { originalError: error });
        }
    }
    getAuthToken() {
        return localStorage.getItem('access_token') || '';
    }
    async post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }
    async get(endpoint) {
        return this.request('GET', endpoint);
    }
    // 🎯 低代码引擎核心功能 - 专注基础实现
    // ❌ 严禁添加AI智能辅助功能
    // ❌ 严禁添加多人协作功能
    // 📋 获取可用模板列表
    async getTemplates() {
        return this.get('/templates');
    }
    // 🏗️ 模块代码生成 - 对接后端CodeGenerationAppService
    async generateModule(metadata) {
        return this.post('/generate-module', {
            moduleMetadata: metadata,
            options: {
                generateBackend: true,
                generateFrontend: true,
                generateTests: true,
                architecturePattern: metadata.architecturePattern || 'Crud',
                outputPath: './generated'
            }
        });
    }
    // 🔍 数据库结构分析 - 对接DatabaseIntrospectionService
    async introspectDatabase(req) {
        // 后端控制器端点为 introspect-db
        return this.post('/introspect-db', {
            connectionStringName: req.connectionStringName,
            provider: req.provider,
            schema: req.schema
        });
    }
    // 📊 生成统计信息
    async getStatistics() {
        return this.get('/statistics');
    }
    // 👁️ 模块预览 - 不生成实际文件
    async previewModule(metadata) {
        return this.post('/preview-module', metadata);
    }
    // 🧭 模块元数据注册（幂等）
    async registerModule(metadata) {
        // 复用 MetadataController 的 register-module 端点
        const url = `${this.baseUrl}/api/metadata/register-module`;
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`,
            },
            credentials: 'include',
            body: JSON.stringify(metadata)
        });
        if (!resp.ok) {
            const text = await resp.text();
            throw new APIError(resp.status, text);
        }
        return await resp.json();
    }
    // ✅ 模块元数据验证
    async validateModule(metadata) {
        return this.post('/validate-module', metadata);
    }
    // 🎨 UI配置生成 - 对接DefaultUIConfigGenerator
    async getUiConfig(module, entity) {
        return this.get(`/ui-config/${module}/${entity}`);
    }
    // 📋 获取可用模板列表
    async getAvailableTemplates() {
        return this.get('/templates');
    }
    // 🔧 生成任务状态查询
    async getGenerationStatus(sessionId) {
        return this.get(`/generation-status/${sessionId}`);
    }
    // 📝 生成历史记录
    async getGenerationHistory(page = 1, pageSize = 20) {
        return this.get(`/generation-history?page=${page}&pageSize=${pageSize}`);
    }
    // 🗑️ 删除生成历史记录
    async deleteGenerationHistory(sessionId) {
        return this.request('DELETE', `/generation-history/${sessionId}`);
    }
    // 📦 导出生成的代码为ZIP
    async exportGeneratedCode(sessionId) {
        const response = await fetch(`${this.baseUrl}${this.apiPath}/export-code/${sessionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw new APIError(response.status, `Export failed: ${response.statusText}`);
        }
        return await response.blob();
    }
    // 🔄 重新生成模块
    async regenerateModule(sessionId) {
        return this.post('/regenerate-module', { originalSessionId: sessionId });
    }
    // 🛠️ 获取支持的架构模式
    async getSupportedArchitectures() {
        return this.get('/supported-architectures');
    }
    // 🧪 测试数据库连接
    async testDatabaseConnection(connectionConfig) {
        return this.post('/test-connection', connectionConfig);
    }
}
export const codeGeneratorApi = new CodeGeneratorAPI();

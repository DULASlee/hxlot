using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.Contracts.CodeGeneration.Dtos;

namespace SmartAbp.Application.CodeGeneration.Generators.MES
{
    /// <summary>
    /// MES数字大屏代码生成器
    /// </summary>
    public class MesDashboardGenerator
    {
        private readonly ILogger<MesDashboardGenerator> _logger;

        public MesDashboardGenerator(ILogger<MesDashboardGenerator> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 生成MES数字大屏项目
        /// </summary>
        public async Task<CodeGenerationResultDto> GenerateAsync(MESGeneratorConfigDto config, string outputDirectory)
        {
            var startTime = DateTime.Now;
            var generatedFiles = new List<string>();

            try
            {
                _logger.LogInformation("开始生成MES数字大屏项目: {SystemName}", config.SystemName);

                // 创建输出目录
                Directory.CreateDirectory(outputDirectory);

                // 生成项目结构
                await GenerateProjectStructureAsync(outputDirectory);
                generatedFiles.Add("项目结构");

                // 生成配置文件
                var configPath = await GenerateConfigFileAsync(config, outputDirectory);
                generatedFiles.Add(configPath);

                // 生成主页面
                var indexPath = await GenerateIndexPageAsync(config, outputDirectory);
                generatedFiles.Add(indexPath);

                // 生成大屏组件
                var dashboardPaths = await GenerateDashboardComponentsAsync(config, outputDirectory);
                generatedFiles.AddRange(dashboardPaths);

                // 生成数据服务
                var apiPath = await GenerateApiServiceAsync(config, outputDirectory);
                generatedFiles.Add(apiPath);

                // 生成README
                var readmePath = await GenerateReadmeAsync(config, outputDirectory);
                generatedFiles.Add(readmePath);

                var duration = (DateTime.Now - startTime).TotalSeconds;

                _logger.LogInformation("MES数字大屏项目生成成功，耗时 {Duration}秒", duration);

                return new CodeGenerationResultDto
                {
                    Success = true,
                    GeneratedFiles = generatedFiles.ToArray(),
                    OutputDirectory = outputDirectory,
                    Duration = duration
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "生成MES数字大屏项目失败");
                var duration = (DateTime.Now - startTime).TotalSeconds;

                return new CodeGenerationResultDto
                {
                    Success = false,
                    ErrorMessage = ex.Message,
                    Duration = duration
                };
            }
        }

        private async Task GenerateProjectStructureAsync(string outputDirectory)
        {
            var directories = new[]
            {
                "src",
                "src/components",
                "src/components/dashboards",
                "src/services",
                "src/utils",
                "src/assets",
                "src/assets/images",
                "public"
            };

            foreach (var dir in directories)
            {
                Directory.CreateDirectory(Path.Combine(outputDirectory, dir));
            }

            await Task.CompletedTask;
        }

        private async Task<string> GenerateConfigFileAsync(MESGeneratorConfigDto config, string outputDirectory)
        {
            var configPath = Path.Combine(outputDirectory, "src", "config.js");
            var content = $@"
// MES数字大屏配置文件
export default {{
  systemName: '{config.SystemName}',
  description: '{config.Description}',
  companyName: '{config.CompanyName}',
  updateInterval: {config.UpdateInterval},
  dataSource: {{
    type: '{config.SourceType}',
    wsUrl: '{config.WsUrl}',
    apiUrl: '{config.ApiUrl}'
  }},
  features: {{
    enableAlerts: {config.EnableAlerts.ToString().ToLower()},
    enableExport: {config.EnableExport.ToString().ToLower()}
  }}
}}
";

            await File.WriteAllTextAsync(configPath, content);
            return "src/config.js";
        }

        private async Task<string> GenerateIndexPageAsync(MESGeneratorConfigDto config, string outputDirectory)
        {
            var indexPath = Path.Combine(outputDirectory, "src", "index.html");
            var content = $@"
<!DOCTYPE html>
<html lang=""zh-CN"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{config.SystemName} - MES数字大屏</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            background: #0e1726;
            font-family: 'Microsoft YaHei', sans-serif;
            overflow: hidden;
        }}
        .screen-container {{
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }}
        .header {{
            height: 80px;
            background: linear-gradient(90deg, #1a2332 0%, #0e1726 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 40px;
            border-bottom: 2px solid #00d4ff;
        }}
        .header-title {{
            font-size: 32px;
            color: #00d4ff;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }}
        .header-company {{
            font-size: 18px;
            color: #fff;
        }}
        .dashboard-content {{
            flex: 1;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 20px;
            padding: 20px;
        }}
    </style>
</head>
<body>
    <div class=""screen-container"">
        <div class=""header"">
            <div class=""header-title"">{config.SystemName}</div>
            <div class=""header-company"">{config.CompanyName}</div>
        </div>
        <div class=""dashboard-content"" id=""dashboardContainer"">
            <!-- 大屏组件将动态加载到这里 -->
        </div>
    </div>
    <script src=""./main.js""></script>
</body>
</html>
";

            await File.WriteAllTextAsync(indexPath, content);
            return "src/index.html";
        }

        private async Task<List<string>> GenerateDashboardComponentsAsync(MESGeneratorConfigDto config, string outputDirectory)
        {
            var generatedFiles = new List<string>();

            foreach (var dashboard in config.SelectedDashboards)
            {
                var componentPath = await GenerateDashboardComponentAsync(dashboard, outputDirectory);
                generatedFiles.Add(componentPath);
            }

            return generatedFiles;
        }

        private async Task<string> GenerateDashboardComponentAsync(string dashboardType, string outputDirectory)
        {
            var componentPath = Path.Combine(outputDirectory, "src", "components", "dashboards", $"{dashboardType}Dashboard.js");
            var content = $@"
// {dashboardType} 大屏组件
class {dashboardType}Dashboard {{
    constructor(container) {{
        this.container = container;
        this.data = null;
        this.chart = null;
    }}

    render() {{
        const html = `
            <div class=""dashboard-card"">
                <div class=""card-header"">{dashboardType}监控</div>
                <div class=""card-body"" id=""{dashboardType.ToLower()}-chart""></div>
            </div>
        `;
        this.container.innerHTML = html;
        this.initChart();
    }}

    initChart() {{
        // 初始化图表（使用ECharts或其他图表库）
        console.log('{dashboardType} dashboard initialized');
    }}

    updateData(data) {{
        this.data = data;
        // 更新图表数据
    }}
}}

export default {dashboardType}Dashboard;
";

            await File.WriteAllTextAsync(componentPath, content);
            return $"src/components/dashboards/{dashboardType}Dashboard.js";
        }

        private async Task<string> GenerateApiServiceAsync(MESGeneratorConfigDto config, string outputDirectory)
        {
            var apiPath = Path.Combine(outputDirectory, "src", "services", "api.js");
            var content = $@"
// API服务
class ApiService {{
    constructor(config) {{
        this.config = config;
        this.ws = null;
    }}

    // 初始化WebSocket连接
    initWebSocket() {{
        if (this.config.dataSource.type === 'realtime') {{
            this.ws = new WebSocket(this.config.dataSource.wsUrl);
            
            this.ws.onopen = () => {{
                console.log('WebSocket连接已建立');
            }};

            this.ws.onmessage = (event) => {{
                const data = JSON.parse(event.data);
                this.handleRealtimeData(data);
            }};

            this.ws.onerror = (error) => {{
                console.error('WebSocket错误:', error);
            }};
        }}
    }}

    // 获取生产线数据
    async getProductionLineData() {{
        try {{
            const response = await fetch(`${{this.config.dataSource.apiUrl}}/api/production-lines`);
            return await response.json();
        }} catch (error) {{
            console.error('获取生产线数据失败:', error);
            return null;
        }}
    }}

    // 获取设备状态
    async getEquipmentStatus() {{
        try {{
            const response = await fetch(`${{this.config.dataSource.apiUrl}}/api/equipment/status`);
            return await response.json();
        }} catch (error) {{
            console.error('获取设备状态失败:', error);
            return null;
        }}
    }}

    // 处理实时数据
    handleRealtimeData(data) {{
        // 触发数据更新事件
        window.dispatchEvent(new CustomEvent('mes-data-update', {{ detail: data }}));
    }}

    // 断开连接
    disconnect() {{
        if (this.ws) {{
            this.ws.close();
        }}
    }}
}}

export default ApiService;
";

            await File.WriteAllTextAsync(apiPath, content);
            return "src/services/api.js";
        }

        private async Task<string> GenerateReadmeAsync(MESGeneratorConfigDto config, string outputDirectory)
        {
            var readmePath = Path.Combine(outputDirectory, "README.md");
            var content = $@"
# {config.SystemName} - MES数字大屏

{config.Description}

## 项目信息

- **公司**: {config.CompanyName}
- **生成时间**: {DateTime.Now:yyyy-MM-dd HH:mm:ss}
- **数据源类型**: {config.SourceType}
- **更新频率**: {config.UpdateInterval}ms

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- ECharts 图表库
- WebSocket (可选)

## 功能特性

{(config.EnableAlerts ? "- ✅ 实时告警功能\n" : "")}
{(config.EnableExport ? "- ✅ 数据导出功能\n" : "")}

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据源

编辑 `src/config.js` 文件，配置您的数据源地址。

### 3. 启动项目

```bash
npm run dev
```

### 4. 构建生产版本

```bash
npm run build
```

## 目录结构

```
{config.SystemName}/
├── src/
│   ├── components/       # 组件目录
│   │   └── dashboards/   # 大屏组件
│   ├── services/         # API服务
│   ├── utils/            # 工具函数
│   ├── assets/           # 静态资源
│   ├── config.js         # 配置文件
│   └── index.html        # 主页面
├── public/               # 公共资源
└── README.md             # 项目说明

```

## 配置说明

### 数据源配置

- **realtime**: 使用WebSocket实时数据推送
- **polling**: 使用HTTP轮询获取数据
- **mock**: 使用模拟数据（用于开发测试）

### 大屏类型

已选择的大屏类型：
{string.Join("\n", Array.ConvertAll(config.SelectedDashboards, d => $"- {d}"))}

## 开发指南

### 添加新的大屏组件

1. 在 `src/components/dashboards/` 创建新组件文件
2. 实现组件的 `render()` 和 `updateData()` 方法
3. 在主页面中注册并加载组件

### 自定义样式

修改 `src/index.html` 中的CSS样式以自定义界面外观。

## 部署

1. 执行 `npm run build` 构建生产版本
2. 将 `dist/` 目录部署到Web服务器
3. 确保WebSocket/API地址配置正确

## 技术支持

如有问题，请联系技术支持团队。

---

由 SmartAbp 低代码平台自动生成 © {DateTime.Now.Year}
";

            await File.WriteAllTextAsync(readmePath, content);
            return "README.md";
        }
    }
}


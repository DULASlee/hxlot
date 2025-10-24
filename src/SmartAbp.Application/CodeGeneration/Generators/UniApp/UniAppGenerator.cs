using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.Contracts.CodeGeneration.Dtos;

namespace SmartAbp.Application.CodeGeneration.Generators.UniApp
{
    /// <summary>
    /// UniApp移动应用代码生成器
    /// </summary>
    public class UniAppGenerator
    {
        private readonly ILogger<UniAppGenerator> _logger;

        public UniAppGenerator(ILogger<UniAppGenerator> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 生成UniApp移动应用项目
        /// </summary>
        public async Task<CodeGenerationResultDto> GenerateAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var startTime = DateTime.Now;
            var generatedFiles = new List<string>();

            try
            {
                _logger.LogInformation("开始生成UniApp项目: {AppName}", config.AppName);

                // 创建输出目录
                Directory.CreateDirectory(outputDirectory);

                // 生成项目结构
                await GenerateProjectStructureAsync(outputDirectory);
                generatedFiles.Add("项目结构");

                // 生成配置文件
                var manifestPath = await GenerateManifestJsonAsync(config, outputDirectory);
                generatedFiles.Add(manifestPath);

                var pagesPath = await GeneratePagesJsonAsync(config, outputDirectory);
                generatedFiles.Add(pagesPath);

                var packagePath = await GeneratePackageJsonAsync(config, outputDirectory);
                generatedFiles.Add(packagePath);

                // 生成主页面
                var appVuePath = await GenerateAppVueAsync(config, outputDirectory);
                generatedFiles.Add(appVuePath);

                var mainJsPath = await GenerateMainJsAsync(config, outputDirectory);
                generatedFiles.Add(mainJsPath);

                // 生成功能模块页面
                var pagePaths = await GenerateModulePagesAsync(config, outputDirectory);
                generatedFiles.AddRange(pagePaths);

                // 生成API服务
                var apiPath = await GenerateApiServiceAsync(config, outputDirectory);
                generatedFiles.Add(apiPath);

                // 生成工具函数
                var utilsPath = await GenerateUtilsAsync(config, outputDirectory);
                generatedFiles.Add(utilsPath);

                // 生成README
                var readmePath = await GenerateReadmeAsync(config, outputDirectory);
                generatedFiles.Add(readmePath);

                var duration = (DateTime.Now - startTime).TotalSeconds;

                _logger.LogInformation("UniApp项目生成成功，耗时 {Duration}秒", duration);

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
                _logger.LogError(ex, "生成UniApp项目失败");
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
                "pages",
                "pages/index",
                "pages/my",
                "static",
                "static/images",
                "common",
                "components",
                "api",
                "utils",
                "store"
            };

            foreach (var dir in directories)
            {
                Directory.CreateDirectory(Path.Combine(outputDirectory, dir));
            }

            await Task.CompletedTask;
        }

        private async Task<string> GenerateManifestJsonAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var manifestPath = Path.Combine(outputDirectory, "manifest.json");
            var content = $@"
{{
  ""name"": ""{config.AppName}"",
  ""appid"": ""{config.AppId}"",
  ""description"": ""{config.Description}"",
  ""versionName"": ""{config.Version}"",
  ""versionCode"": ""100"",
  ""transformPx"": false,
  ""app-plus"": {{
    ""usingComponents"": true,
    ""nvueStyleCompiler"": ""uni-app"",
    ""compilerVersion"": 3,
    ""splashscreen"": {{
      ""alwaysShowBeforeRender"": true,
      ""waiting"": true,
      ""autoclose"": true,
      ""delay"": 0
    }},
    ""modules"": {{}},
    ""distribute"": {{
      ""android"": {{
        ""permissions"": [
          ""<uses-permission android:name=\""android.permission.INTERNET\""/>"",
          ""<uses-permission android:name=\""android.permission.WRITE_EXTERNAL_STORAGE\""/>""
        ]
      }},
      ""ios"": {{}},
      ""sdkConfigs"": {{}}
    }}
  }},
  ""quickapp"": {{}},
  ""mp-weixin"": {{
    ""appid"": ""{config.AppId}"",
    ""setting"": {{
      ""urlCheck"": false
    }},
    ""usingComponents"": true
  }},
  ""mp-alipay"": {{
    ""usingComponents"": true
  }},
  ""h5"": {{
    ""router"": {{
      ""mode"": ""hash"",
      ""base"": ""./""
    }},
    ""devServer"": {{
      ""port"": 8080,
      ""disableHostCheck"": true,
      ""proxy"": {{
        ""/api"": {{
          ""target"": ""{config.ApiBaseUrl}"",
          ""changeOrigin"": true,
          ""secure"": false
        }}
      }}
    }}
  }}
}}
";

            await File.WriteAllTextAsync(manifestPath, content);
            return "manifest.json";
        }

        private async Task<string> GeneratePagesJsonAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var pagesJson = new StringBuilder();
            pagesJson.AppendLine("{");
            pagesJson.AppendLine("  \"pages\": [");
            pagesJson.AppendLine("    {");
            pagesJson.AppendLine("      \"path\": \"pages/index/index\",");
            pagesJson.AppendLine("      \"style\": {");
            pagesJson.AppendLine($"        \"navigationBarTitleText\": \"{config.AppName}\"");
            pagesJson.AppendLine("      }");
            pagesJson.AppendLine("    },");

            // 添加功能模块页面
            for (int i = 0; i < config.SelectedModules.Length; i++)
            {
                var module = config.SelectedModules[i];
                pagesJson.AppendLine("    {");
                pagesJson.AppendLine($"      \"path\": \"pages/{module}/list\",");
                pagesJson.AppendLine("      \"style\": {");
                pagesJson.AppendLine($"        \"navigationBarTitleText\": \"{module}\"");
                pagesJson.AppendLine("      }");
                pagesJson.AppendLine(i < config.SelectedModules.Length - 1 ? "    }," : "    }");
            }

            pagesJson.AppendLine("  ],");
            pagesJson.AppendLine("  \"globalStyle\": {");
            pagesJson.AppendLine("    \"navigationBarTextStyle\": \"black\",");
            pagesJson.AppendLine($"    \"navigationBarTitleText\": \"{config.AppName}\",");
            pagesJson.AppendLine($"    \"navigationBarBackgroundColor\": \"{config.PrimaryColor}\",");
            pagesJson.AppendLine("    \"backgroundColor\": \"#F8F8F8\"");
            pagesJson.AppendLine("  },");
            pagesJson.AppendLine("  \"tabBar\": {");
            pagesJson.AppendLine($"    \"color\": \"#7A7E83\",");
            pagesJson.AppendLine($"    \"selectedColor\": \"{config.PrimaryColor}\",");
            pagesJson.AppendLine($"    \"borderStyle\": \"black\",");
            pagesJson.AppendLine($"    \"backgroundColor\": \"#ffffff\",");
            pagesJson.AppendLine("    \"list\": [");
            pagesJson.AppendLine("      {");
            pagesJson.AppendLine("        \"pagePath\": \"pages/index/index\",");
            pagesJson.AppendLine("        \"iconPath\": \"static/images/home.png\",");
            pagesJson.AppendLine("        \"selectedIconPath\": \"static/images/home-active.png\",");
            pagesJson.AppendLine("        \"text\": \"首页\"");
            pagesJson.AppendLine("      },");
            pagesJson.AppendLine("      {");
            pagesJson.AppendLine("        \"pagePath\": \"pages/my/my\",");
            pagesJson.AppendLine("        \"iconPath\": \"static/images/my.png\",");
            pagesJson.AppendLine("        \"selectedIconPath\": \"static/images/my-active.png\",");
            pagesJson.AppendLine("        \"text\": \"我的\"");
            pagesJson.AppendLine("      }");
            pagesJson.AppendLine("    ]");
            pagesJson.AppendLine("  }");
            pagesJson.AppendLine("}");

            var pagesPath = Path.Combine(outputDirectory, "pages.json");
            await File.WriteAllTextAsync(pagesPath, pagesJson.ToString());
            return "pages.json";
        }

        private async Task<string> GeneratePackageJsonAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var packagePath = Path.Combine(outputDirectory, "package.json");
            var content = $@"
{{
  ""name"": ""{config.AppName.ToLower().Replace(" ", "-")}"",
  ""version"": ""{config.Version}"",
  ""description"": ""{config.Description}"",
  ""main"": ""main.js"",
  ""scripts"": {{
    ""dev:h5"": ""uni -p h5"",
    ""dev:mp-weixin"": ""uni -p mp-weixin"",
    ""build:h5"": ""uni build -p h5"",
    ""build:mp-weixin"": ""uni build -p mp-weixin"",
    ""build:app-plus"": ""uni build -p app-plus""
  }},
  ""dependencies"": {{
    ""@dcloudio/uni-app"": ""latest"",
    ""@dcloudio/uni-h5"": ""latest"",
    ""@dcloudio/uni-mp-weixin"": ""latest"",
    ""@dcloudio/uni-app-plus"": ""latest"",
    ""vue"": ""^3.2.0"",
    ""vuex"": ""^4.0.0""
  }},
  ""devDependencies"": {{
    ""@dcloudio/uni-cli-shared"": ""latest"",
    ""@dcloudio/vite-plugin-uni"": ""latest"",
    ""vite"": ""latest""
  }},
  ""browserslist"": [
    ""Android >= 4.4"",
    ""iOS >= 9""
  ]
}}
";

            await File.WriteAllTextAsync(packagePath, content);
            return "package.json";
        }

        private async Task<string> GenerateAppVueAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var appVuePath = Path.Combine(outputDirectory, "App.vue");
            var content = $@"
<script>
export default {{
  onLaunch: function() {{
    console.log('App Launch')
    // 初始化应用
  }},
  onShow: function() {{
    console.log('App Show')
  }},
  onHide: function() {{
    console.log('App Hide')
  }}
}}
</script>

<style>
@import ""@/common/style.css"";

/* 全局样式 */
page {{
  background-color: #f8f8f8;
}}
</style>
";

            await File.WriteAllTextAsync(appVuePath, content);
            return "App.vue";
        }

        private async Task<string> GenerateMainJsAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var mainJsPath = Path.Combine(outputDirectory, "main.js");
            var content = $@"
import App from './App'
import {{ createSSRApp }} from 'vue'

export function createApp() {{
  const app = createSSRApp(App)
  
  // 全局配置
  app.config.globalProperties.$apiBaseUrl = '{config.ApiBaseUrl}'
  
  return {{
    app
  }}
}}
";

            await File.WriteAllTextAsync(mainJsPath, content);
            return "main.js";
        }

        private async Task<List<string>> GenerateModulePagesAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var generatedFiles = new List<string>();

            foreach (var module in config.SelectedModules)
            {
                // 生成列表页
                var listPagePath = await GenerateModuleListPageAsync(module, config, outputDirectory);
                generatedFiles.Add(listPagePath);

                // 生成详情页
                var detailPagePath = await GenerateModuleDetailPageAsync(module, config, outputDirectory);
                generatedFiles.Add(detailPagePath);
            }

            return generatedFiles;
        }

        private async Task<string> GenerateModuleListPageAsync(string moduleName, UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var pagePath = Path.Combine(outputDirectory, "pages", moduleName, "list.vue");
            Directory.CreateDirectory(Path.GetDirectoryName(pagePath));

            var content = $@"
<template>
  <view class=""container"">
    <view class=""search-bar"">
      <input placeholder=""搜索{moduleName}"" v-model=""searchKeyword"" @confirm=""handleSearch"" />
    </view>
    
    <scroll-view class=""list-container"" scroll-y @scrolltolower=""loadMore"">
      <view class=""list-item"" v-for=""item in dataList"" :key=""item.id"" @click=""handleItemClick(item)"">
        <text class=""item-title"">{{{{ item.name }}}}</text>
        <text class=""item-desc"">{{{{ item.description }}}}</text>
      </view>
      
      <view class=""loading"" v-if=""loading"">加载中...</view>
      <view class=""no-more"" v-if=""!hasMore"">没有更多数据</view>
    </scroll-view>
    
    <view class=""add-btn"" @click=""handleAdd"">
      <text>+</text>
    </view>
  </view>
</template>

<script setup>
import {{ ref, onMounted }} from 'vue'
import {{ get{moduleName}List }} from '@/api/{moduleName.ToLower()}'

const searchKeyword = ref('')
const dataList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)

onMounted(() => {{
  loadData()
}})

const loadData = async () => {{
  if (loading.value) return
  
  loading.value = true
  try {{
    const result = await get{moduleName}List({{
      keyword: searchKeyword.value,
      page: currentPage.value,
      pageSize: 20
    }})
    
    if (currentPage.value === 1) {{
      dataList.value = result.items
    }} else {{
      dataList.value = [...dataList.value, ...result.items]
    }}
    
    hasMore.value = result.items.length >= 20
  }} catch (error) {{
    uni.showToast({{
      title: '加载失败',
      icon: 'none'
    }})
  }} finally {{
    loading.value = false
  }}
}}

const handleSearch = () => {{
  currentPage.value = 1
  loadData()
}}

const loadMore = () => {{
  if (!hasMore.value || loading.value) return
  currentPage.value++
  loadData()
}}

const handleItemClick = (item) => {{
  uni.navigateTo({{
    url: `/pages/{moduleName}/detail?id=${{item.id}}`
  }})
}}

const handleAdd = () => {{
  uni.navigateTo({{
    url: `/pages/{moduleName}/edit`
  }})
}}
</script>

<style scoped>
.container {{
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
}}

.search-bar {{
  background-color: #fff;
  padding: 20rpx;
}}

.search-bar input {{
  background-color: #f5f5f5;
  border-radius: 50rpx;
  padding: 15rpx 30rpx;
}}

.list-container {{
  flex: 1;
}}

.list-item {{
  background-color: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 10rpx;
}}

.item-title {{
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}}

.item-desc {{
  font-size: 28rpx;
  color: #666;
}}

.add-btn {{
  position: fixed;
  right: 40rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: {config.PrimaryColor};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 50rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}}

.loading, .no-more {{
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 28rpx;
}}
</style>
";

            await File.WriteAllTextAsync(pagePath, content);
            return $"pages/{moduleName}/list.vue";
        }

        private async Task<string> GenerateModuleDetailPageAsync(string moduleName, UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var pagePath = Path.Combine(outputDirectory, "pages", moduleName, "detail.vue");
            
            var content = $@"
<template>
  <view class=""container"">
    <view class=""detail-card"">
      <text class=""title"">{{{{ data.name }}}}</text>
      <text class=""description"">{{{{ data.description }}}}</text>
      <!-- 更多详情字段 -->
    </view>
    
    <view class=""action-buttons"">
      <button type=""primary"" @click=""handleEdit"">编辑</button>
      <button type=""warn"" @click=""handleDelete"">删除</button>
    </view>
  </view>
</template>

<script setup>
import {{ ref, onLoad }} from 'vue'
import {{ get{moduleName}Detail, delete{moduleName} }} from '@/api/{moduleName.ToLower()}'

const data = ref({{}})

onLoad((options) => {{
  loadDetail(options.id)
}})

const loadDetail = async (id) => {{
  try {{
    data.value = await get{moduleName}Detail(id)
  }} catch (error) {{
    uni.showToast({{
      title: '加载失败',
      icon: 'none'
    }})
  }}
}}

const handleEdit = () => {{
  uni.navigateTo({{
    url: `/pages/{moduleName}/edit?id=${{data.value.id}}`
  }})
}}

const handleDelete = async () => {{
  const res = await uni.showModal({{
    title: '确认删除',
    content: '确定要删除这条记录吗？'
  }})
  
  if (res.confirm) {{
    try {{
      await delete{moduleName}(data.value.id)
      uni.showToast({{
        title: '删除成功'
      }})
      setTimeout(() => {{
        uni.navigateBack()
      }}, 1000)
    }} catch (error) {{
      uni.showToast({{
        title: '删除失败',
        icon: 'none'
      }})
    }}
  }}
}}
</script>

<style scoped>
.container {{
  padding: 20rpx;
}}

.detail-card {{
  background-color: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}}

.title {{
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}}

.description {{
  font-size: 28rpx;
  color: #666;
  display: block;
}}

.action-buttons {{
  display: flex;
  gap: 20rpx;
}}

.action-buttons button {{
  flex: 1;
}}
</style>
";

            await File.WriteAllTextAsync(pagePath, content);
            return $"pages/{moduleName}/detail.vue";
        }

        private async Task<string> GenerateApiServiceAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var apiPath = Path.Combine(outputDirectory, "api", "request.js");
            var content = $@"
// API请求封装
const BASE_URL = '{config.ApiBaseUrl}'

// 请求拦截器
const request = (options) => {{
  return new Promise((resolve, reject) => {{
    uni.request({{
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {{}},
      header: {{
        'Content-Type': 'application/json',
        'Authorization': uni.getStorageSync('token') || '',
        ...options.header
      }},
      success: (res) => {{
        if (res.statusCode === 200) {{
          resolve(res.data)
        }} else {{
          uni.showToast({{
            title: res.data.message || '请求失败',
            icon: 'none'
          }})
          reject(res.data)
        }}
      }},
      fail: (err) => {{
        uni.showToast({{
          title: '网络错误',
          icon: 'none'
        }})
        reject(err)
      }}
    }})
  }})
}}

// GET请求
export const get = (url, data) => {{
  return request({{
    url,
    method: 'GET',
    data
  }})
}}

// POST请求
export const post = (url, data) => {{
  return request({{
    url,
    method: 'POST',
    data
  }})
}}

// PUT请求
export const put = (url, data) => {{
  return request({{
    url,
    method: 'PUT',
    data
  }})
}}

// DELETE请求
export const del = (url, data) => {{
  return request({{
    url,
    method: 'DELETE',
    data
  }})
}}

export default request
";

            await File.WriteAllTextAsync(apiPath, content);
            return "api/request.js";
        }

        private async Task<string> GenerateUtilsAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var utilsPath = Path.Combine(outputDirectory, "utils", "common.js");
            var content = @"
// 通用工具函数

// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

// 防抖函数
export const debounce = (fn, delay = 300) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流函数
export const throttle = (fn, delay = 300) => {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime > delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

// 深拷贝
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

// 本地存储封装
export const storage = {
  set(key, value) {
    uni.setStorageSync(key, value)
  },
  get(key) {
    return uni.getStorageSync(key)
  },
  remove(key) {
    uni.removeStorageSync(key)
  },
  clear() {
    uni.clearStorageSync()
  }
}
";

            await File.WriteAllTextAsync(utilsPath, content);
            return "utils/common.js";
        }

        private async Task<string> GenerateReadmeAsync(UniAppGeneratorConfigDto config, string outputDirectory)
        {
            var readmePath = Path.Combine(outputDirectory, "README.md");
            var content = $@"
# {config.AppName} - UniApp移动应用

{config.Description}

## 项目信息

- **应用ID**: {config.AppId}
- **版本**: {config.Version}
- **生成时间**: {DateTime.Now:yyyy-MM-dd HH:mm:ss}
- **API地址**: {config.ApiBaseUrl}

## 技术栈

- UniApp (Vue 3)
- uView UI 3.0
- Vuex 4.0
- ES6+

## 功能特性

{(config.DarkMode ? "- ✅ 暗黑模式支持\n" : "")}
{(config.OfflineMode ? "- ✅ 离线模式支持\n" : "")}
{(config.PushNotification ? "- ✅ 推送通知功能\n" : "")}

## 支持平台

{string.Join("\n", Array.ConvertAll(config.Targets, t => $"- {t}"))}

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置API地址

编辑 `api/request.js` 文件，配置您的API服务器地址。

### 3. 运行开发环境

```bash
# H5端
npm run dev:h5

# 微信小程序端
npm run dev:mp-weixin

# APP端
在HBuilderX中打开项目，点击运行
```

### 4. 构建生产版本

```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# APP
npm run build:app-plus
```

## 目录结构

```
{config.AppName}/
├── pages/              # 页面目录
│   ├── index/          # 首页
│   ├── my/             # 我的
│   └── ...             # 功能模块页面
├── components/         # 公共组件
├── api/                # API接口
├── utils/              # 工具函数
├── static/             # 静态资源
├── store/              # 状态管理
├── App.vue             # 应用入口
├── main.js             # 主入口文件
├── manifest.json       # 应用配置
├── pages.json          # 页面路由配置
└── package.json        # 依赖配置
```

## 功能模块

{string.Join("\n", Array.ConvertAll(config.SelectedModules, m => $"- {m}"))}

## 开发指南

### 添加新页面

1. 在 `pages/` 目录下创建页面文件夹
2. 在 `pages.json` 中注册页面路由
3. 实现页面功能

### API调用

使用 `api/request.js` 中的封装方法进行API调用：

```javascript
import {{ get, post }} from '@/api/request'

// GET请求
const data = await get('/api/users')

// POST请求
const result = await post('/api/users', {{ name: '张三' }})
```

### 状态管理

使用Vuex进行全局状态管理（如需要）。

## 部署

### H5部署

1. 执行 `npm run build:h5`
2. 将 `unpackage/dist/build/h5/` 目录部署到Web服务器

### 小程序发布

1. 使用微信开发者工具打开项目
2. 点击上传，填写版本信息
3. 在小程序后台提交审核

### APP打包

1. 在HBuilderX中配置应用信息
2. 点击发行 -> 原生App云打包
3. 选择平台和证书进行打包

## 注意事项

- 确保API服务器地址配置正确
- 小程序需要配置合法域名
- APP打包需要申请应用证书

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


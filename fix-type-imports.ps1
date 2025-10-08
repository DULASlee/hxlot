# 批量修复TypeScript类型导入错误
# 将 import { Type } from 'module' 转换为 import type { Type } from 'module'

$files = @(
    "src/SmartAbp.Vue/src/utils/api.ts",
    "src/SmartAbp.Vue/src/router/index.ts",
    "src/SmartAbp.Vue/src/stores/userStore.ts",
    "src/SmartAbp.Vue/src/views/project/ProjectListView.vue",
    "src/SmartAbp.Vue/src/views/system/performance/CoreWebVitalsPanel.vue"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Green
        
        $content = Get-Content $file -Raw
        
        # 修复 axios 类型导入
        $content = $content -replace "import axios, \{ AxiosInstance, AxiosRequestConfig, AxiosResponse \} from ['`"]axios['`"]", 
                                      "import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'"
        
        # 修复 vue-router 类型导入
        $content = $content -replace "import \{ createRouter, createWebHistory, RouteRecordRaw \} from ['`"]vue-router['`"]",
                                      "import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'"
        
        # 修复单独的 RouteRecordRaw 导入
        $content = $content -replace "import \{ RouteRecordRaw \} from ['`"]vue-router['`"]",
                                      "import type { RouteRecordRaw } from 'vue-router'"
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "  ✅ Fixed" -ForegroundColor Cyan
    } else {
        Write-Host "  ⚠️  Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Type import fixes completed!" -ForegroundColor Green


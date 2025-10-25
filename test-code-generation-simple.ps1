#!/usr/bin/env pwsh
# 简化的代码生成端到端测试

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔥 SM_SmartTenants 代码生成测试" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# 步骤1: 获取表结构
Write-Host "📋 步骤1: 获取SM_SmartTenants表结构..." -ForegroundColor Yellow
$introspectBody = '{"connectionStringName":"Default","provider":"SqlServer"}'
try {
    $introspectResponse = Invoke-WebRequest -Uri "http://localhost:9002/api/code-generator/introspect-db" `
        -Method POST -Body $introspectBody -ContentType "application/json" -TimeoutSec 30 -UseBasicParsing
    $introspectResult = $introspectResponse.Content | ConvertFrom-Json
    $smartTenants = $introspectResult.tables | Where-Object { $_.name -eq "SM_SmartTenants" }

    if ($smartTenants) {
        Write-Host "✅ 表结构获取成功，列数: $($smartTenants.columns.Count)" -ForegroundColor Green
    } else {
        Write-Host "❌ 未找到SM_SmartTenants表" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 获取表结构失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 步骤2: 构建生成请求
Write-Host "`n📋 步骤2: 构建代码生成请求..." -ForegroundColor Yellow
$properties = @($smartTenants.columns | ForEach-Object {
    @{
        id = [Guid]::NewGuid().ToString()
        name = $_.name
        displayName = $_.name
        type = $_.dataType
        isRequired = -not $_.isNullable
        isKey = $_.isPrimaryKey
        defaultValue = $_.defaultValue
        description = $_.comment
        maxLength = $_.maxLength
        columnName = $_.name
        columnType = $_.dataType
        searchable = $true
        sortable = $true
        filterable = $true
        listVisible = $true
        detailVisible = $true
        formVisible = $true
        isReadonly = $false
        isUnique = $false
        isIndexed = $false
        isAuditField = $false
        isSoftDeleteField = $false
        isTenantField = $false
        disabled = $false
    }
})

$propertiesJson = $properties | ConvertTo-Json -Depth 20 -Compress

$generateBodyTemplate = @"
{
    "id": "$([Guid]::NewGuid().ToString())",
    "systemName": "TenantManagement",
    "name": "SmartTenant",
    "displayName": "智能租户管理",
    "description": "智能租户管理模块（自动化测试）",
    "version": "1.0.0",
    "architecturePattern": "DDD",
    "namespace": "TenantManagement.SmartTenant",
    "author": "SmartAbp Test",
    "databaseInfo": {
        "connectionStringName": "Default",
        "schema": "dbo",
        "provider": "SqlServer"
    },
    "featureManagement": {
        "enableAdvancedQuery": true,
        "enableBatchOperations": true,
        "enableImportExport": true,
        "enableVersioning": false,
        "isEnabled": true,
        "DefaultPolicy": ""
    },
    "frontend": {
        "parentId": "system",
        "routePrefix": "/tenant-management/smart-tenant"
    },
    "generateMobilePages": false,
    "dependencies": [],
    "entities": [
        {
            "id": "$([Guid]::NewGuid().ToString())",
            "name": "SmartTenant",
            "displayName": "智能租户",
            "description": "智能租户实体",
            "module": "SmartTenant",
            "namespace": "TenantManagement.SmartTenant",
            "tableName": "SM_SmartTenants",
            "schema": "dbo",
            "isAggregateRoot": true,
            "isAudited": true,
            "isSoftDelete": true,
            "isMultiTenant": false,
            "baseClass": "AuditedAggregateRoot",
            "interfaces": [],
            "properties": __PROPERTIES_PLACEHOLDER__,
            "relationships": [],
            "indexes": [],
            "constraints": [],
            "businessRules": [],
            "permissions": [],
            "codeGeneration": {
                "generateEntity": true,
                "generateRepository": true,
                "generateService": true,
                "generateController": true,
                "generateDto": true,
                "generateTests": false,
                "customTemplates": {},
                "options": {
                    "useAutoMapper": true,
                    "generateValidation": true,
                    "generateSwaggerDoc": true,
                    "generatePermissions": true,
                    "generateAuditLog": true
                }
            },
            "uiConfig": {
                "listConfig": {
                    "defaultPageSize": 10,
                    "sortableColumns": [],
                    "filterableColumns": [],
                    "searchableColumns": [],
                    "displayColumns": [],
                    "actions": []
                },
                "formConfig": {
                    "layout": "vertical",
                    "columnCount": 1,
                    "fieldGroups": [],
                    "validationStrategy": "immediate"
                },
                "detailConfig": {
                    "layout": "vertical",
                    "sections": [],
                    "actions": []
                }
            },
            "createdAt": "$((Get-Date).ToUniversalTime().ToString("o"))",
            "updatedAt": "$((Get-Date).ToUniversalTime().ToString("o"))",
            "version": "1.0.0",
            "tags": []
        }
    ],
    "menuConfig": [
        {
            "id": "$([Guid]::NewGuid().ToString())",
            "name": "智能租户管理",
            "path": "/tenant-management/smart-tenant",
            "icon": "database",
            "parentId": "system",
            "sort": 100,
            "permissions": [],
            "Title": "智能租户管理",
            "ComponentPath": "/tenant-management/smart-tenant",
            "RequiredPermission": ""
        }
    ],
    "permissionConfig": {
        "permissionGroups": [],
        "defaultPermissions": [],
        "Groups": []
    }
}
"@

$generateBody = $generateBodyTemplate.Replace('__PROPERTIES_PLACEHOLDER__', $propertiesJson)


Write-Host "✅ 请求构建完成，实体属性数: $($properties.Count)" -ForegroundColor Green

# 步骤3: 调用生成API
Write-Host "`n📋 步骤3: 调用代码生成API（预计30秒）..." -ForegroundColor Yellow
try {
    $generateResponse = Invoke-WebRequest -Uri "http://localhost:9002/api/code-generator/generate-module" `
        -Method POST -Body $generateBody -ContentType "application/json; charset=utf-8" -TimeoutSec 60 -UseBasicParsing

    if ($generateResponse.StatusCode -eq 200) {
        $generateResult = $generateResponse.Content | ConvertFrom-Json

        if ($generateResult.success) {
            Write-Host "✅ 代码生成成功！" -ForegroundColor Green
            Write-Host "   生成文件数量: $($generateResult.files.Count)" -ForegroundColor Cyan

            # 统计文件类型
            $backendFiles = $generateResult.files | Where-Object { $_.path -like "*SmartAbp.*" -and $_.path -notlike "*SmartAbp.Vue*" }
            $frontendFiles = $generateResult.files | Where-Object { $_.path -like "*SmartAbp.Vue*" }

            Write-Host "   后端文件: $($backendFiles.Count) 个" -ForegroundColor Cyan
            Write-Host "   前端文件: $($frontendFiles.Count) 个" -ForegroundColor Cyan

            # 显示关键文件
            Write-Host "`n📂 关键生成文件:" -ForegroundColor Yellow
            $keyFiles = $generateResult.files | Where-Object {
                $_.path -like "*Controller.cs" -or
                $_.path -like "*AppService.cs" -or
                $_.path -like "*Dto.cs" -or
                $_.path -like "*.vue" -or
                $_.path -like "*Store.ts" -or
                $_.path -like "*-api.ts"
            } | Select-Object -First 10

            foreach ($file in $keyFiles) {
                Write-Host "   📄 $($file.path)" -ForegroundColor Gray
            }

            Write-Host "`n🎉 测试完成！代码生成功能正常！" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "❌ 代码生成失败: $($generateResult.message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ API返回错误状态码: $($generateResponse.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 代码生成失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   详情: $($errorDetail.error.message)" -ForegroundColor Red
        if ($errorDetail.error.details) {
            Write-Host "   详细信息: $($errorDetail.error.details)" -ForegroundColor Red
        }
    }
    exit 1
}


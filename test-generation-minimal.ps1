
$generateBody = @"
{
    "id": "c1b2a3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
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
            "id": "d1e2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6",
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
            "version": "1.0.0",
            "properties": [
                {
                    "id": "e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6",
                    "name": "Name",
                    "displayName": "Name",
                    "type": "string",
                    "isRequired": true,
                    "isKey": false,
                    "defaultValue": "",
                    "description": "",
                    "maxLength": 128,
                    "columnName": "Name",
                    "columnType": "nvarchar",
                    "Pattern": "",
                    "HelpText": "",
                    "GroupName": "Basic Information",
                    "Description": "Tenant Name",
                    "DefaultValue": ""
                }
            ],
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
                "options": {
                    "useAutoMapper": true,
                    "generateValidation": true,
                    "generateSwaggerDoc": true,
                    "generatePermissions": true,
                    "generateAuditLog": true
                }
            },
            "uiConfig": {
                "listConfig": {},
                "formConfig": {
                    "layout": "vertical",
                    "validationStrategy": "onBlur"
                },
                "detailConfig": {
                    "layout": "vertical"
                }
            }
        }
    ],
    "menuConfig": [
        {
            "id": "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
            "name": "智能租户管理",
            "path": "/tenant-management/smart-tenant",
            "icon": "database",
            "parentId": "system",
            "sort": 100,
            "Title": "智能租户管理",
            "ComponentPath": "/tenant-management/smart-tenant",
            "RequiredPermission": ""
        }
    ],
    "permissionConfig": {
        "Groups": [
            {
                "Name": "TenantManagement",
                "DisplayName": "Tenant Management"
            }
        ]
    }
}
"@

try {
    $generateResponse = Invoke-WebRequest -Uri "http://localhost:9002/api/code-generator/generate-module" `
        -Method POST -Body $generateBody -ContentType "application/json; charset=utf-8" -TimeoutSec 60 -UseBasicParsing

    if ($generateResponse.StatusCode -eq 200) {
        $generateResult = $generateResponse.Content | ConvertFrom-Json

        if ($generateResult.success) {
            Write-Host "✅ 代码生成成功！" -ForegroundColor Green
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

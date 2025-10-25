#!/usr/bin/env pwsh
# 测试后端introspect-db API是否存在

$body = @{
    connectionStringName = "Default"
    provider = "SqlServer"
} | ConvertTo-Json -Depth 10

Write-Host "🔍 测试后端API: POST http://localhost:9002/api/code-generator/introspect-db" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9002/api/code-generator/introspect-db" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "✅ 后端API正常！返回表数量: $($response.tables.Count)" -ForegroundColor Green
    Write-Host "📊 表列表: $($response.tables.name -join ', ')" -ForegroundColor Yellow
} catch {
    Write-Host "❌ 后端API失败！" -ForegroundColor Red
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "状态码: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}


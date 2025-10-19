# TypeScript错误批量修复脚本
# 修复73个编译错误的一站式解决方案

$ErrorActionPreference = "Stop"

Write-Host "🔧 开始修复TypeScript编译错误..." -ForegroundColor Cyan

# 修复1: EnhancedVueComponentGenerator.ts - flat属性访问
Write-Host "  修复EnhancedVueComponentGenerator.ts..." -ForegroundColor Yellow
$file1 = "src\SmartAbp.Vue\packages\lowcode-core\src\generators\EnhancedVueComponentGenerator.ts"
$content1 = Get-Content $file1 -Raw
$content1 = $content1 -replace 'entity\.fields\.filter\(f => f\.searchable\)', 'entity.fields?.filter(f => f.uiConfig?.searchable) ?? []'
$content1 = $content1 -replace 'entity\.fields\.filter\(f => f\.listVisible\)', 'entity.fields?.filter(f => f.uiConfig?.listVisible) ?? []'
$content1 = $content1 -replace 'field\.type\)', 'field.type ?? '''')'
$content1 = $content1 -replace 'field\.name\)', 'field.name ?? '''')'
$content1 = $content1 -replace '(?<!field\.)type\?', 'type ?? ''''?'
$content1 | Set-Content $file1 -NoNewline

# 修复2: EnhancedEntityGenerator.ts - columns/关系类型
Write-Host "  修复EnhancedEntityGenerator.ts..." -ForegroundColor Yellow
$file2 = "src\SmartAbp.Vue\packages\lowcode-core\src\generators\EnhancedEntityGenerator.ts"
$content2 = Get-Content $file2 -Raw

# 修复columns → 正确使用
$content2 = $content2 -replace 'index\.columns\.map', 'index.columns?.map'
$content2 = $content2 -replace 'index\.columns\.join', 'index.columns?.join'

# 修复关系类型字符串比较 → 数字比较
$content2 = $content2 -replace "case 'OneToMany':", 'case 1: // OneToMany'
$content2 = $content2 -replace "case 'OneToOne':", 'case 0: // OneToOne'
$content2 = $content2 -replace "case 'ManyToMany':", 'case 3: // ManyToMany'
$content2 = $content2 -replace "case 'ManyToOne':", 'case 2: // ManyToOne'

# 修复关系属性名
$content2 = $content2 -replace 'rel\.sourceNavigationProperty', 'rel.navigationProperty'
$content2 = $content2 -replace 'rel\.targetNavigationProperty', 'rel.navigationProperty'
$content2 = $content2 -replace 'rel\.targetProperty', 'rel.foreignKey'
$content2 = $content2 -replace 'rel\.sourceProperty', 'rel.foreignKey'

# 修复空值检查
$content2 = $content2 -replace 'field\.type\.includes', '(field.type ?? '''').includes'
$content2 = $content2 -replace 'entity\.name\)', '(entity.name ?? '''')'
$content2 = $content2 -replace 'entity\.fields\.filter', '(entity.fields ?? []).filter'
$content2 = $content2 -replace 'entity\.fields\.map', '(entity.fields ?? []).map'

$content2 | Set-Content $file2 -NoNewline

# 修复3: EnhancedAppServiceGenerator.ts - 空值检查
Write-Host "  修复EnhancedAppServiceGenerator.ts..." -ForegroundColor Yellow
$file3 = "src\SmartAbp.Vue\packages\lowcode-core\src\generators\EnhancedAppServiceGenerator.ts"
$content3 = Get-Content $file3 -Raw
$content3 = $content3 -replace 'entity\.fields\)', '(entity.fields ?? [])'
$content3 = $content3 -replace 'entity\.name\)', '(entity.name ?? '''')'
$content3 = $content3 -replace 'field\.type\)', '(field.type ?? '''')'
$content3 = $content3 -replace 'field\.type\[', '(field.type ?? '''')['
$content3 = $content3 -replace 'typeof field\.order === ''string''', 'typeof field.order !== ''number'''
$content3 | Set-Content $file3 -NoNewline

# 修复4: AspireGenerator.ts - 空值检查
Write-Host "  修复AspireGenerator.ts..." -ForegroundColor Yellow
$file4 = "src\SmartAbp.Vue\packages\lowcode-core\src\generators\AspireGenerator.ts"
$content4 = Get-Content $file4 -Raw
$content4 = $content4 -replace "solutionName\|\|'SmartAbp'", "(solutionName ?? 'SmartAbp')"
$content4 = $content4 -replace "e\.name\|\|'Unknown'", "(e.name ?? 'Unknown')"
$content4 = $content4 -replace 'as string', ''
$content4 | Set-Content $file4 -NoNewline

# 修复5: EnhancedApiClientGenerator.ts - 空值检查
Write-Host "  修复EnhancedApiClientGenerator.ts..." -ForegroundColor Yellow
$file5 = "src\SmartAbp.Vue\packages\lowcode-core\src\generators\EnhancedApiClientGenerator.ts"
$content5 = Get-Content $file5 -Raw
$content5 = $content5 -replace 'entityName\)', '(entityName ?? '''')'
$content5 | Set-Content $file5 -NoNewline

# 修复6: EnhancedPiniaStoreGenerator.ts - 空值检查
Write-Host "  修复EnhancedPiniaStoreGenerator.ts..." -ForegroundColor Yellow
$file6 = "src\SmartAbp.Vue\packages\lowcode-core\src\generators\EnhancedPiniaStoreGenerator.ts"
$content6 = Get-Content $file6 -Raw
$content6 = $content6 -replace 'entityName\)', '(entityName ?? '''')'
$content6 | Set-Content $file6 -NoNewline

# 修复7: lowcode-designer ImportMeta.glob
Write-Host "  修复lowcode-designer/src/index.ts..." -ForegroundColor Yellow
$file7 = "src\SmartAbp.Vue\packages\lowcode-designer\src\index.ts"
if (Test-Path $file7) {
    $content7 = Get-Content $file7 -Raw
    # 添加ImportMeta类型扩展
    $importMetaFix = @"
// 扩展ImportMeta类型以支持glob
declare interface ImportMeta {
    glob: (pattern: string) => Record<string, () => Promise<any>>;
}

"@
    if ($content7 -notmatch 'declare interface ImportMeta') {
        $content7 = $importMetaFix + $content7
    }
    $content7 | Set-Content $file7 -NoNewline
}

Write-Host "✅ 所有修复完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📊 验证TypeScript编译..." -ForegroundColor Cyan


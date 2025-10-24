# 将 .cursor/rules 下的规则文件转换为 Qoder 格式并复制到 .qoder/rules

$sourceDir = Join-Path $PSScriptRoot "..\\.cursor\\rules"
$targetDir = Join-Path $PSScriptRoot "..\\.qoder\\rules"

# 确保目标目录存在
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Write-Host "🚀 开始转换规则文件..." -ForegroundColor Cyan
Write-Host "源目录: $sourceDir" -ForegroundColor Gray
Write-Host "目标目录: $targetDir" -ForegroundColor Gray
Write-Host ""

# 获取所有 .mdc 文件
$mdcFiles = Get-ChildItem -Path $sourceDir -Filter "*.mdc" -File

$totalCount = $mdcFiles.Count
$currentCount = 0

foreach ($file in $mdcFiles) {
    $currentCount++
    $sourcePath = $file.FullName
    $fileName = $file.BaseName
    $targetPath = Join-Path $targetDir "$fileName.md"

    Write-Host "[$currentCount/$totalCount] 转换: $($file.Name)" -ForegroundColor Yellow

    # 读取文件内容
    $content = Get-Content -Path $sourcePath -Raw -Encoding UTF8

    # 转换 YAML front matter
    # 使用更简单的处理方式
    if ($content -match '(?s)^---\s*([\r\n].*?[\r\n])---\s*([\r\n].*)$') {
        $bodyContent = $matches[2]

        # 构建新的 YAML front matter（Qoder格式）
        $newYaml = @"
---
trigger: always_on
alwaysApply: true
---
"@

        # 组合新内容
        $newContent = $newYaml + $bodyContent

        # 将 .mdc 链接改为 .md 链接（链接URL）
        $newContent = $newContent -replace '\.mdc\)', '.md)'

        # 将链接文本中的 .mdc 也改为 .md
        $newContent = $newContent -replace '\*\*([^\]]+)\.mdc\*\*', '**$1.md**'
        $newContent = $newContent -replace '\[([^\]]+)\.mdc\]', '[$1.md]'

        # 修正文档索引表中的扩展名
        $newContent = $newContent -replace '(\d+_[^\|]+)\.mdc', '$1.md'

        # 写入目标文件
        [System.IO.File]::WriteAllText($targetPath, $newContent, [System.Text.Encoding]::UTF8)

        Write-Host "  ✅ 成功: $fileName.md" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠️  跳过: 未找到 YAML front matter" -ForegroundColor DarkYellow
    }
}

Write-Host ""
Write-Host "✨ 转换完成！共处理 $totalCount 个文件" -ForegroundColor Green
Write-Host "📁 目标目录: $targetDir" -ForegroundColor Cyan

param(
  [string]$Root = "tools/ai-guardian"
)

$ErrorActionPreference = "Stop"

function Ensure-Dir($p) {
  if (!(Test-Path $p)) { New-Item -ItemType Directory -Path $p | Out-Null }
}

$dst = Join-Path $Root "_deprecated"
Ensure-Dir $dst

# 保留名单（不移动）
$keep = @(
  'mcp-script-executor.js',
  'logs',
  'README.md',
  'QUICKSTART.md',
  'MCP-ACTIVATION-GUIDE.md',
  'session-state.json',
  'extension',
  '_deprecated'
)

Write-Host "📦 归档起始: $Root -> $dst"

# 获取所有子项（文件和目录）
$allItems = Get-ChildItem -Path $Root -ErrorAction SilentlyContinue | Where-Object { $_.Name -notin $keep }

foreach ($item in $allItems) {
  try {
    $destPath = Join-Path $dst $item.Name
    Move-Item -LiteralPath $item.FullName -Destination $destPath -Force
    Write-Host "  ✔ 已归档: $($item.Name)"
  } catch {
    Write-Warning "  ⚠ 无法归档: $($item.Name) - $($_.Exception.Message)"
  }
}

Write-Host "✅ 归档完成"


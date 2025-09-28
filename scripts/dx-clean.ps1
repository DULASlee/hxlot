# 开发体验清理脚本
Write-Host " 清理开发环境缓存..." -ForegroundColor Green

# 清理IDE缓存
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue @(
    ".cursor-cache",
    ".vscode-server", 
    ".idea",
    ".vs"
)

# 清理构建产物
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue @(
    "dist",
    "build",
    "coverage",
    "**/bin",
    "**/obj"
)

# 清理生成文件
if (Test-Path ".generated") {
    Remove-Item -Recurse -Force "/../.generated/*" -Exclude ".gitkeep"
}

Write-Host " 开发环境清理完成！" -ForegroundColor Green

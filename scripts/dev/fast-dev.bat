@echo off
setlocal

echo 🚀 SmartAbp 快速开发启动工具
echo ================================

:: 设置Node.js性能优化
set NODE_OPTIONS=--max-old-space-size=8192 --enable-source-maps

:: 跳转到项目目录
cd /d "D:\BAOBAB\Baobab.SmartAbp\src\SmartAbp.Vue"

echo 1️⃣ 检查当前目录: %CD%
echo 2️⃣ 清理缓存...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "tsconfig.tsbuildinfo" del "tsconfig.tsbuildinfo"

echo 3️⃣ 启动开发服务器...
echo 💡 优化配置：8GB内存分配，缓存清理，源码映射优化
echo.

npm run dev

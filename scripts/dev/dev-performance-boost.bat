@echo off
echo 🚀 SmartAbp 开发性能提升工具
echo =====================================

echo 1️⃣ 清理Vite缓存...
rmdir /s /q "src\SmartAbp.Vue\node_modules\.vite" 2>nul

echo 2️⃣ 清理TypeScript缓存...
del "src\SmartAbp.Vue\tsconfig.tsbuildinfo" 2>nul

echo 3️⃣ 清理依赖缓存...
rmdir /s /q "src\SmartAbp.Vue\node_modules\.cache" 2>nul

echo 4️⃣ 清理构建产物...
rmdir /s /q "src\SmartAbp.Vue\dist" 2>nul

echo 5️⃣ 优化Node.js内存...
set NODE_OPTIONS=--max-old-space-size=8192

echo ✅ 性能优化完成！现在可以启动开发服务器：
echo cd src\SmartAbp.Vue
echo npm run dev
echo.
echo 💡 提示：如果仍然缓慢，考虑增加 NODE_OPTIONS 到 16384
pause

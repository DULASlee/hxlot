@echo off
echo 正在更新类型声明文件...

rem 重新生成组件和自动导入类型
npm run build-only -- --watch false

echo 类型更新完成
pause 
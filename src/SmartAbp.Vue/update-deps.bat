@echo off
echo 正在安装缺失的依赖包...

npm install --save-dev @vitejs/plugin-vue-jsx unplugin-icons unplugin-vue-components unplugin-auto-import @pinia/testing cypress @types/cypress @types/jest
npm install --save @element-plus/icons-vue

echo 安装完成!
pause 
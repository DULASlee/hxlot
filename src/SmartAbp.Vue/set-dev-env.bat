@echo off 
:: SmartAbp 开发环境优化配置 
set NODE_OPTIONS=--max-old-space-size=8192 --enable-source-maps 
set VITE_DEV_MODE=true 
set VITE_CACHE_DIR=node_modules/.vite 

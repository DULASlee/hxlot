@echo off
REM AI Guardian MCP服务器测试脚本

echo ========================================
echo   AI Guardian MCP 服务器测试
echo ========================================
echo.

echo 测试1: 初始化
echo {"jsonrpc":"2.0","id":1,"method":"initialize","params":{}} | node mcp-ai-guardian-server.js
echo.

echo 测试2: 列出工具
echo {"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}} | node mcp-ai-guardian-server.js
echo.

echo 测试3: 查看状态
echo {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"ai_guardian_status","arguments":{}}} | node mcp-ai-guardian-server.js
echo.

echo ========================================
echo   测试完成！
echo ========================================
pause


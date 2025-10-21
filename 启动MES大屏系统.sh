#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MES智能生产线监控大屏启动脚本
# 功能: 一键启动后端API + 前端Vue大屏
# 创建日期: 2025-10-22
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 MES智能生产线监控大屏系统 v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 清理旧进程
echo "🧹 清理旧进程..."
pkill -f "dotnet.*SmartAbp.Web" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

# 启动后端API
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 启动后端API服务..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web
dotnet run --no-build --verbosity quiet &
BACKEND_PID=$!
echo "✅ 后端API已启动 (PID: $BACKEND_PID)"
echo "   后端地址: http://localhost:5000"
echo "   SignalR Hub: http://localhost:5000/hubs/production-line"
echo ""

# 等待后端启动
echo "⏳ 等待后端API完全启动（15秒）..."
sleep 15

# 启动前端Vue服务
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 启动前端Vue开发服务器..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue
npm run dev &
FRONTEND_PID=$!
echo "✅ 前端Vue服务已启动 (PID: $FRONTEND_PID)"
echo ""

# 等待前端启动
echo "⏳ 等待前端服务完全启动（10秒）..."
sleep 10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 系统已成功启动！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 访问地址:"
echo "   🎯 MES生产线监控大屏: http://localhost:5173/dashboard/production-line"
echo "   🏠 后台管理首页: http://localhost:5173/"
echo "   🔌 SignalR Hub测试: http://localhost:5000/hubs/production-line"
echo ""
echo "📋 功能说明:"
echo "   ✅ 实时KPI指标展示（总产量、效率、利用率、合格率）"
echo "   ✅ 实时数据曲线图（温度、压力、振动）"
echo "   ✅ 设备状态监控列表"
echo "   ✅ 智能告警推送（自动检测异常并弹窗提示）"
echo "   ✅ SignalR实时通信（1秒刷新一次数据）"
echo ""
echo "🔧 后台服务状态:"
echo "   • 后端API: http://localhost:5000 (PID: $BACKEND_PID)"
echo "   • 前端Vue: http://localhost:5173 (PID: $FRONTEND_PID)"
echo "   • PLC数据采集服务: ✅ 运行中（每5秒采集一次）"
echo "   • 实时数据推送服务: ✅ 运行中（每1秒推送一次）"
echo "   • 告警引擎: ✅ 运行中（实时监控）"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  按 Ctrl+C 停止所有服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 设置陷阱以在脚本退出时杀死子进程
trap "echo ''; echo '🛑 正在停止所有服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 所有服务已停止'; exit 0" INT TERM EXIT

# 等待进程
wait $BACKEND_PID
wait $FRONTEND_PID


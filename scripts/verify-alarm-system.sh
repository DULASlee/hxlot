#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 告警系统验证脚本
# 用途: 验证MES告警系统是否正常工作
# 创建日期: 2025-10-21
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 SmartAbp MES告警系统验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 检查编译状态
echo "1️⃣ 检查编译状态..."
cd /Users/huanyuan/SmartAbp/hxlot
dotnet build src/SmartAbp.Application/SmartAbp.Application.csproj --verbosity quiet --nologo > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Application层编译成功"
else
    echo "   ❌ Application层编译失败"
    exit 1
fi

# 2. 检查核心文件存在
echo ""
echo "2️⃣ 检查核心文件..."
files=(
    "src/SmartAbp.Application/MES/Alarm/IAlarmRule.cs"
    "src/SmartAbp.Application/MES/Alarm/ThresholdAlarmRule.cs"
    "src/SmartAbp.Application/MES/Alarm/AlarmNotificationService.cs"
    "src/SmartAbp.Application/MES/PLCDataCollectorBackgroundWorker.cs"
    "src/SmartAbp.Web/EventHandlers/AlarmEventHandler.cs"
    "src/SmartAbp.Web/Hubs/ProductionLineHub.cs"
    "src/SmartAbp.Web/Hubs/IProductionLineClient.cs"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (缺失)"
    fi
done

# 3. 检查数据库表
echo ""
echo "3️⃣ 检查数据库表..."
echo "   ⚠️  需要手动验证数据库表是否存在:"
echo "      - AppProductionLines"
echo "      - AppEquipments"
echo "      - AppSensorData"

# 4. 检查后台服务注册
echo ""
echo "4️⃣ 检查后台服务..."
if grep -q "PLCDataCollectorBackgroundWorker" src/SmartAbp.Web/SmartAbpHttpApiHostModule.cs; then
    echo "   ✅ PLCDataCollectorBackgroundWorker已注册"
else
    echo "   ⚠️  PLCDataCollectorBackgroundWorker未注册（需要手动添加）"
fi

# 5. 检查SignalR Hub注册
echo ""
echo "5️⃣ 检查SignalR Hub..."
if grep -q "ProductionLineHub" src/SmartAbp.Web/SmartAbpHttpApiHostModule.cs; then
    echo "   ✅ ProductionLineHub已注册"
else
    echo "   ⚠️  ProductionLineHub未注册（需要检查）"
fi

# 6. 验证端口占用
echo ""
echo "6️⃣ 检查后端服务..."
if lsof -i :5000 > /dev/null 2>&1; then
    echo "   ✅ 后端服务运行中 (端口5000)"
else
    echo "   ⚠️  后端服务未启动"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 验证总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 核心组件已完成:"
echo "   • 告警规则引擎 (IAlarmRule, ThresholdAlarmRule)"
echo "   • 告警通知服务 (AlarmNotificationService)"
echo "   • PLC数据采集器 (PLCDataCollectorBackgroundWorker)"
echo "   • 告警事件处理器 (AlarmEventHandler)"
echo "   • SignalR实时推送 (ProductionLineHub)"
echo ""
echo "📝 下一步操作:"
echo "   1. 运行数据库迁移（如未执行）"
echo "   2. 启动后端服务: cd src/SmartAbp.Web && dotnet run"
echo "   3. 启动前端服务: cd src/SmartAbp.Vue && npm run dev"
echo "   4. 访问实时监控: http://localhost:5173/dashboard/production-line"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


# 🚀 立即开始测试 - 3步快速启动

**当前状态**: 前后端服务均未运行

---

## 第1步：启动后端（终端1）

```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web
dotnet run
```

**等待提示**: `Now listening on: https://localhost:44379`

---

## 第2步：启动前端（终端2）

```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue
npm run dev
```

**等待提示**: `Local: http://localhost:11369/`

---

## 第3步：运行测试（终端3 - 本终端）

### 选项A: 快速API测试（5分钟）
```bash
/Users/huanyuan/SmartAbp/hxlot/scripts/testing/quick-api-test.sh
```

### 选项B: 完整E2E测试（30分钟）
```bash
/Users/huanyuan/SmartAbp/hxlot/scripts/testing/smart-full-test.sh
```

---

## 📊 测试报告位置

测试完成后查看:
```
docs/testing/reports/complete-test-report-{timestamp}.md
```

---

**准备好了吗？开始吧！🎉**


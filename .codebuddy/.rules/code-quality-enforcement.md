# 🛡️ SmartAbp代码质量强制执行

## 构建与规范序列（每次修改后必须通过）
```bash
npm run build
npm run type-check
npm run lint --fix
npm run dev
```

## 重复代码禁止
- 发现相同/相似实现必须抽取到共享模块（如 utils/）

## TypeScript 严格模式（tsconfig 建议）
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## 文件大小与复杂度
- Vue组件 < 300 行；TS文件 < 500 行；工具函数文件 < 200 行
- 圈复杂度 < 10；命名语义清晰，禁止 getData(id: any): any

## 安全与错误处理
- 输入验证、错误捕获与日志记录；禁止未验证输入直传服务

## 覆盖率与性能
- 单测覆盖率 >90%，集成测试>85%，关键路径E2E 100%
- 渲染 <16ms；API <200ms；首屏 <2s；包 <5MB

## 提交前自动检查（建议 pre-commit）
1) tsc --noEmit
2) eslint --fix
3) npm test
4) npm run build
5) npm run perf

## 质量门禁
- 构建成功、类型检查通过、Lint 0 错误、覆盖率>85%、重复代码<5%、复杂度<10、性能分数>90

---
质量标准不可妥协。
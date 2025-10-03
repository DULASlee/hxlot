/**
 * 代码质量分析器单元测试
 */

import { describe, it, expect } from 'vitest'
import { CodeQualityAnalyzer } from '../CodeQualityAnalyzer'

describe('CodeQualityAnalyzer', () => {
  let analyzer: CodeQualityAnalyzer

  beforeEach(() => {
    analyzer = new CodeQualityAnalyzer()
  })

  describe('analyze', () => {
    it('应该返回完整的质量报告', async () => {
      const code = `
        function testFunction() {
          const value = 100
          return value
        }
      `

      const report = await analyzer.analyze(code)

      expect(report).toBeDefined()
      expect(report.score).toBeGreaterThanOrEqual(0)
      expect(report.score).toBeLessThanOrEqual(100)
      expect(report.complexity).toBeDefined()
      expect(report.duplication).toBeDefined()
      expect(report.style).toBeDefined()
      expect(report.security).toBeDefined()
      expect(report.performance).toBeDefined()
    })

    it('简单代码应该获得高分', async () => {
      const code = `
        function add(a: number, b: number): number {
          return a + b
        }
      `

      const report = await analyzer.analyze(code)

      expect(report.score).toBeGreaterThan(90)
    })

    it('复杂代码应该获得较低分数', async () => {
      const code = `
        function complex(data: any) {
          if (data.a) {
            if (data.b) {
              if (data.c) {
                for (let i = 0; i < 10; i++) {
                  while (data.x) {
                    // 高复杂度代码
                  }
                }
              }
            }
          }
          return data
        }
      `

      const report = await analyzer.analyze(code)

      expect(report.score).toBeLessThan(90)
      expect(report.complexity.cyclomaticComplexity).toBeGreaterThan(5)
    })
  })

  describe('复杂度分析', () => {
    it('应该正确计算函数数量', async () => {
      const code = `
        function func1() {}
        const func2 = () => {}
        function func3() {}
      `

      const report = await analyzer.analyze(code)

      expect(report.complexity.functions).toBe(3)
    })

    it('应该正确计算类数量', async () => {
      const code = `
        class Class1 {}
        class Class2 {}
      `

      const report = await analyzer.analyze(code)

      expect(report.complexity.classes).toBe(2)
    })

    it('应该正确计算代码行数', async () => {
      const code = `
        function test() {
          const a = 1
          const b = 2
          return a + b
        }
      `

      const report = await analyzer.analyze(code)

      expect(report.complexity.linesOfCode).toBeGreaterThan(0)
    })
  })

  describe('重复代码检测', () => {
    it('应该检测到重复行', async () => {
      const code = `
        const value = 100
        console.log('test')
        const value = 100
        console.log('test')
      `

      const report = await analyzer.analyze(code)

      expect(report.duplication.duplicatedLines).toBeGreaterThan(0)
    })

    it('唯一代码应该没有重复', async () => {
      const code = `
        const a = 1
        const b = 2
        const c = 3
      `

      const report = await analyzer.analyze(code)

      expect(report.duplication.duplicatedLines).toBe(0)
    })
  })

  describe('代码风格检查', () => {
    it('应该检测超长行', async () => {
      const longLine = 'a'.repeat(150)
      const code = `const ${longLine} = 1`

      const report = await analyzer.analyze(code)

      expect(report.style.warnings.length).toBeGreaterThan(0)
      expect(report.style.warnings.some(w => w.rule === 'max-line-length')).toBe(true)
    })

    it('应该检测any类型使用', async () => {
      const code = `function test(param: any): any { return param }`

      const report = await analyzer.analyze(code, 'typescript')

      expect(report.style.warnings.some(w => w.rule === 'no-any')).toBe(true)
    })
  })

  describe('安全性检查', () => {
    it('应该检测SQL注入风险', async () => {
      const code = `
        const query = "SELECT * FROM users WHERE id = " + userId
        ExecuteSql(query)
      `

      const report = await analyzer.analyze(code)

      expect(report.security.vulnerabilities.length).toBeGreaterThan(0)
      expect(report.security.vulnerabilities.some(v => v.type === 'SQL Injection')).toBe(true)
    })

    it('应该检测XSS风险', async () => {
      const code = `element.innerHTML = userInput`

      const report = await analyzer.analyze(code)

      expect(report.security.vulnerabilities.some(v => v.type === 'XSS')).toBe(true)
    })

    it('应该检测硬编码密码', async () => {
      const code = `const password = "secret123"`

      const report = await analyzer.analyze(code)

      expect(report.security.vulnerabilities.some(v => v.type === 'Hardcoded Credentials')).toBe(true)
      expect(report.security.riskLevel).toBe('critical')
    })
  })

  describe('性能分析', () => {
    it('应该检测N+1查询问题', async () => {
      const code = `
        for (const item of items) {
          await service.GetAsync(item.id)
        }
      `

      const report = await analyzer.analyze(code)

      expect(report.performance.bottlenecks.length).toBeGreaterThan(0)
      expect(report.performance.bottlenecks.some(b => b.type === 'N+1 Query Problem')).toBe(true)
    })

    it('应该检测顺序异步操作', async () => {
      const code = `
        await call1()
        await call2()
        await call3()
        await call4()
        await call5()
        await call6()
        await call7()
        await call8()
        await call9()
        await call10()
        await call11()
      `

      const report = await analyzer.analyze(code)

      expect(report.performance.bottlenecks.some(b => b.type === 'Sequential Async Operations')).toBe(true)
    })
  })

  describe('评分计算', () => {
    it('无问题的代码应该获得满分', async () => {
      const code = `
        function cleanCode(value: number): number {
          return value * 2
        }
      `

      const report = await analyzer.analyze(code)

      expect(report.score).toBeGreaterThan(95)
    })

    it('有多个问题的代码应该被扣分', async () => {
      const code = `
        function badCode(data: any) {
          const password = "hardcoded"
          if (data.a) {
            if (data.b) {
              if (data.c) {
                element.innerHTML = data.value
              }
            }
          }
        }
      `

      const report = await analyzer.analyze(code)

      expect(report.score).toBeLessThan(70)
    })
  })
})

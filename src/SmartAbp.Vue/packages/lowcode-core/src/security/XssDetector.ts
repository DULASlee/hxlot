/**
 * 🔥 XSS跨站脚本检测器
 * 
 * 功能：
 * 1. 检测XSS漏洞
 * 2. 分析DOM操作安全性
 * 3. 检测不安全的HTML渲染
 * 4. 检测缺失的输出编码
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'
import { SecurityIssue, VulnerabilityType, SeverityLevel, IssueLocation, SecurityIssueUtils } from './SecurityIssue'

const logger = getGlobalLogger()

/**
 * XSS检测模式
 */
interface XssPattern {
  name: string
  pattern: RegExp
  severity: SeverityLevel
  description: string
  confidence: number
  category: 'dom' | 'reflected' | 'stored'
}

/**
 * XSS跨站脚本检测器
 */
export class XssDetector {
  private readonly patterns: XssPattern[]

  constructor() {
    this.patterns = this.initializePatterns()
  }

  /**
   * 初始化检测模式
   */
  private initializePatterns(): XssPattern[] {
    return [
      // DOM-based XSS patterns
      {
        name: 'innerHTML with User Input',
        pattern: /\.innerHTML\s*=\s*[^;]*(?:req\.|request\.|params\.|query\.|body\.|\$\{.*?\})/gi,
        severity: SeverityLevel.CRITICAL,
        description: '使用innerHTML直接插入用户输入，极易导致DOM型XSS',
        confidence: 0.95,
        category: 'dom'
      },
      {
        name: 'outerHTML with User Input',
        pattern: /\.outerHTML\s*=\s*[^;]*(?:req\.|request\.|params\.|query\.|body\.|\$\{.*?\})/gi,
        severity: SeverityLevel.CRITICAL,
        description: '使用outerHTML直接插入用户输入，极易导致DOM型XSS',
        confidence: 0.95,
        category: 'dom'
      },
      {
        name: 'document.write with User Input',
        pattern: /document\.write(?:ln)?\s*\([^)]*(?:req\.|request\.|params\.|query\.|body\.|\$\{.*?\})[^)]*\)/gi,
        severity: SeverityLevel.HIGH,
        description: '使用document.write()直接输出用户输入，容易导致XSS',
        confidence: 0.9,
        category: 'dom'
      },
      {
        name: 'eval with User Input',
        pattern: /eval\s*\([^)]*(?:req\.|request\.|params\.|query\.|body\.|\$\{.*?\})[^)]*\)/gi,
        severity: SeverityLevel.CRITICAL,
        description: '使用eval()执行用户输入，极度危险，可导致代码注入',
        confidence: 0.98,
        category: 'dom'
      },
      {
        name: 'setTimeout/setInterval with String',
        pattern: /set(?:Timeout|Interval)\s*\(\s*['"][^'"]*\$\{[^}]*\}[^'"]*['"]/gi,
        severity: SeverityLevel.HIGH,
        description: '使用字符串参数的setTimeout/setInterval可能导致代码注入',
        confidence: 0.85,
        category: 'dom'
      },

      // Reflected XSS patterns
      {
        name: 'Unescaped Template Variable',
        pattern: /v-html\s*=\s*["'][^"']*\{\{[^}]*\}\}[^"']*["']|dangerouslySetInnerHTML\s*=\s*\{\{.*?\}\}/gi,
        severity: SeverityLevel.HIGH,
        description: 'Vue的v-html或React的dangerouslySetInnerHTML未转义用户输入',
        confidence: 0.8,
        category: 'reflected'
      },
      {
        name: 'Direct User Input in Response',
        pattern: /res\.(?:send|write|end)\s*\([^)]*(?:req\.|request\.)[^)]*\)(?!\s*\/\/\s*sanitized)/gi,
        severity: SeverityLevel.HIGH,
        description: '直接将用户输入输出到响应中，未进行HTML转义',
        confidence: 0.85,
        category: 'reflected'
      },
      {
        name: 'Template String in Response',
        pattern: /res\.(?:send|write|end)\s*\(\s*`[^`]*\$\{[^}]*\}[^`]*`\s*\)/gi,
        severity: SeverityLevel.MEDIUM,
        description: '使用模板字符串直接输出到响应，可能缺少HTML转义',
        confidence: 0.7,
        category: 'reflected'
      },

      // Stored XSS patterns
      {
        name: 'Database Data without Escaping',
        pattern: /\.(?:innerHTML|outerHTML)\s*=\s*(?:data|result|row|record)\./gi,
        severity: SeverityLevel.HIGH,
        description: '直接将数据库数据设置为HTML，可能导致存储型XSS',
        confidence: 0.75,
        category: 'stored'
      },
      {
        name: 'No Sanitization Before Save',
        pattern: /\.(?:save|insert|create|update)\s*\([^)]*(?:req\.|request\.)[^)]*\)(?!\s*\/\/\s*sanitized)/gi,
        severity: SeverityLevel.MEDIUM,
        description: '用户输入未经清理直接存入数据库，可能导致存储型XSS',
        confidence: 0.6,
        category: 'stored'
      },

      // General patterns
      {
        name: 'Missing Content-Type Header',
        pattern: /res\.(?:send|write|end)(?!\s*.*setHeader\s*\(\s*['"]Content-Type['"])/gi,
        severity: SeverityLevel.LOW,
        description: '响应未设置Content-Type头，可能被浏览器错误解释',
        confidence: 0.5,
        category: 'reflected'
      },
      {
        name: 'Unsafe URL Manipulation',
        pattern: /(?:location|window\.location)\.(?:href|replace|assign)\s*=\s*[^;]*(?:req\.|params\.|\$\{.*?\})/gi,
        severity: SeverityLevel.HIGH,
        description: '使用用户输入直接操作URL，可能导致开放重定向或XSS',
        confidence: 0.8,
        category: 'dom'
      }
    ]
  }

  /**
   * 检测代码中的XSS漏洞
   */
  detect(code: string, filePath: string): SecurityIssue[] {
    logger.info('🔍 开始XSS漏洞检测', { filePath })

    const issues: SecurityIssue[] = []
    const lines = code.split('\n')

    for (const pattern of this.patterns) {
      const matches = code.matchAll(pattern.pattern)

      for (const match of matches) {
        if (!match.index) continue

        const location = this.calculateLocation(code, match.index, match[0], filePath, lines)

        const issue: SecurityIssue = {
          id: SecurityIssueUtils.generateIssueId(),
          type: VulnerabilityType.XSS,
          severity: pattern.severity,
          title: `XSS漏洞: ${pattern.name} (${pattern.category.toUpperCase()})`,
          description: pattern.description,
          location,
          remediation: this.generateRemediation(pattern.name, pattern.category),
          discoveredAt: new Date(),
          owaspCategory: 'A7:2017-Cross-Site Scripting (XSS)',
          cweId: 79, // CWE-79: Cross-site Scripting
          confidence: pattern.confidence
        }

        issues.push(issue)
      }
    }

    logger.info(`✅ XSS检测完成，发现${issues.length}个问题`, { filePath })
    return issues
  }

  /**
   * 计算问题位置
   */
  private calculateLocation(
    code: string,
    matchIndex: number,
    matchText: string,
    filePath: string,
    lines: string[]
  ): IssueLocation {
    let currentPos = 0
    let startLine = 1
    let endLine = 1

    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1
      
      if (currentPos + lineLength > matchIndex) {
        startLine = i + 1
        break
      }
      
      currentPos += lineLength
    }

    const matchLines = matchText.split('\n').length
    endLine = startLine + matchLines - 1

    const contextStart = Math.max(0, startLine - 4)
    const contextEnd = Math.min(lines.length, endLine + 3)
    const codeSnippet = lines.slice(contextStart, contextEnd).join('\n')

    return {
      filePath,
      startLine,
      endLine,
      codeSnippet
    }
  }

  /**
   * 生成修复建议
   */
  private generateRemediation(
    patternName: string,
    category: string
  ): SecurityIssue['remediation'] {
    const baseRemediation = {
      description: '对所有用户输入进行适当的输出编码，使用安全的DOM操作方法',
      steps: [
        '1. 对所有用户输入进行HTML实体编码',
        '2. 使用textContent而不是innerHTML来插入纯文本',
        '3. 使用内容安全策略（CSP）来限制脚本执行',
        '4. 对输入进行严格的验证和清理',
        '5. 使用框架提供的安全API（如Vue的双花括号，React的JSX）'
      ],
      references: [
        'https://owasp.org/www-community/attacks/xss/',
        'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
        'https://cwe.mitre.org/data/definitions/79.html'
      ]
    }

    let exampleCode = ''

    if (patternName.includes('innerHTML')) {
      exampleCode = `
// ❌ 错误做法
element.innerHTML = userInput;

// ✅ 正确做法 - 使用textContent
element.textContent = userInput;

// ✅ 正确做法 - 使用DOMPurify清理
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);

// ✅ Vue中的正确做法 - 使用双花括号
<div>{{ userInput }}</div>  <!-- 自动转义 -->
<div v-text="userInput"></div>  <!-- 自动转义 -->
      `.trim()
    } else if (patternName.includes('eval')) {
      exampleCode = `
// ❌ 错误做法 - 永远不要使用eval
eval(userInput);

// ✅ 正确做法 - 使用JSON.parse（如果是JSON数据）
const data = JSON.parse(userInput);

// ✅ 正确做法 - 重新设计，避免需要执行用户输入
      `.trim()
    } else if (patternName.includes('Response')) {
      exampleCode = `
// ❌ 错误做法
res.send(\`<div>Hello \${req.query.name}</div>\`);

// ✅ 正确做法 - HTML实体编码
import escapeHtml from 'escape-html';
res.send(\`<div>Hello \${escapeHtml(req.query.name)}</div>\`);

// ✅ 更好的做法 - 使用模板引擎（自动转义）
res.render('hello', { name: req.query.name });
      `.trim()
    } else if (patternName.includes('Template Variable')) {
      exampleCode = `
// ❌ 错误做法 - Vue
<div v-html="userInput"></div>

// ✅ 正确做法 - Vue（自动转义）
<div>{{ userInput }}</div>
<div v-text="userInput"></div>

// ❌ 错误做法 - React
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ 正确做法 - React（自动转义）
<div>{userInput}</div>
      `.trim()
    } else if (patternName.includes('URL')) {
      exampleCode = `
// ❌ 错误做法
window.location.href = req.query.redirect;

// ✅ 正确做法 - URL白名单验证
const allowedDomains = ['example.com', 'trusted.com'];
const redirectUrl = new URL(req.query.redirect);
if (allowedDomains.includes(redirectUrl.hostname)) {
  window.location.href = req.query.redirect;
} else {
  console.error('Untrusted redirect URL');
}
      `.trim()
    }

    return {
      ...baseRemediation,
      exampleCode
    }
  }

  /**
   * 检测Vue特定的XSS问题
   */
  detectVueXss(code: string, filePath: string): SecurityIssue[] {
    const issues: SecurityIssue[] = []
    const lines = code.split('\n')

    // 检测v-html指令
    const vHtmlPattern = /<[^>]*v-html\s*=\s*["']([^"']+)["'][^>]*>/gi
    const vHtmlMatches = code.matchAll(vHtmlPattern)

    for (const match of vHtmlMatches) {
      if (!match.index) continue

      const location = this.calculateLocation(code, match.index, match[0], filePath, lines)

      issues.push({
        id: SecurityIssueUtils.generateIssueId(),
        type: VulnerabilityType.XSS,
        severity: SeverityLevel.HIGH,
        title: 'Vue v-html指令XSS风险',
        description: 'v-html指令不会对内容进行转义，如果绑定用户输入会导致XSS',
        location,
        remediation: {
          description: '避免使用v-html，或者使用DOMPurify清理HTML',
          steps: [
            '1. 优先使用v-text或双花括号{{}}来插入文本',
            '2. 如果必须插入HTML，使用DOMPurify库清理',
            '3. 永远不要将用户输入直接绑定到v-html'
          ],
          references: [
            'https://vuejs.org/v2/guide/syntax.html#Raw-HTML',
            'https://github.com/cure53/DOMPurify'
          ],
          exampleCode: `
// ❌ 危险
<div v-html="userInput"></div>

// ✅ 安全 - 使用v-text
<div v-text="userInput"></div>

// ✅ 安全 - 使用双花括号
<div>{{ userInput }}</div>

// ✅ 如果必须使用HTML - 使用DOMPurify
import DOMPurify from 'dompurify'
<div v-html="DOMPurify.sanitize(userInput)"></div>
          `.trim()
        },
        discoveredAt: new Date(),
        owaspCategory: 'A7:2017-Cross-Site Scripting (XSS)',
        cweId: 79,
        confidence: 0.9
      })
    }

    return issues
  }
}

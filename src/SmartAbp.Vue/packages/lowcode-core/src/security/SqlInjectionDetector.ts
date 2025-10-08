/**
 * 🔥 SQL注入检测器
 * 
 * 功能：
 * 1. 检测SQL注入漏洞
 * 2. 分析SQL查询构造
 * 3. 检测不安全的字符串拼接
 * 4. 检测参数化查询缺失
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'
import type { IssueLocation, SecurityIssue } from './SecurityIssue'
import { SecurityIssueUtils, SeverityLevel, VulnerabilityType } from './SecurityIssue'

const logger = getGlobalLogger()

/**
 * SQL注入模式
 */
interface SqlInjectionPattern {
  /** 模式名称 */
  name: string
  /** 正则表达式 */
  pattern: RegExp
  /** 严重程度 */
  severity: SeverityLevel
  /** 描述 */
  description: string
  /** 可信度 */
  confidence: number
}

/**
 * SQL注入检测器
 */
export class SqlInjectionDetector {
  private readonly patterns: SqlInjectionPattern[]

  constructor() {
    this.patterns = this.initializePatterns()
  }

  /**
   * 初始化检测模式
   */
  private initializePatterns(): SqlInjectionPattern[] {
    return [
      {
        name: 'String Concatenation in SQL Query',
        pattern: /(?:query|sql|execute|executeQuery|executeUpdate)\s*\([^)]*\+[^)]*\)/gi,
        severity: SeverityLevel.HIGH,
        description: '使用字符串拼接构造SQL查询，容易导致SQL注入',
        confidence: 0.8
      },
      {
        name: 'Template String in SQL Query',
        pattern: /(?:query|sql|execute|executeQuery|executeUpdate)\s*\(\s*`[^`]*\$\{[^}]*\}[^`]*`\s*\)/gi,
        severity: SeverityLevel.HIGH,
        description: '使用模板字符串构造SQL查询，容易导致SQL注入',
        confidence: 0.85
      },
      {
        name: 'Direct User Input in SQL',
        pattern: /(?:query|sql|execute|executeQuery|executeUpdate)\s*\([^)]*(?:req\.(?:query|body|params)|request\.(?:getParameter|getQueryString))[^)]*\)/gi,
        severity: SeverityLevel.CRITICAL,
        description: '直接将用户输入用于SQL查询，极易导致SQL注入',
        confidence: 0.95
      },
      {
        name: 'SQL Keywords in String',
        pattern: /['"](?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|UNION|OR|AND)\s+.*?['"]\s*\+/gi,
        severity: SeverityLevel.MEDIUM,
        description: 'SQL关键字在字符串拼接中，可能存在SQL注入风险',
        confidence: 0.6
      },
      {
        name: 'Missing Parameterized Query',
        pattern: /(?:WHERE|SET|VALUES)\s+[^=]*=\s*['"][^'"]*\+[^'"]*['"]/gi,
        severity: SeverityLevel.HIGH,
        description: 'WHERE/SET/VALUES子句使用字符串拼接，应使用参数化查询',
        confidence: 0.75
      },
      {
        name: 'Dynamic Table/Column Name',
        pattern: /(?:FROM|JOIN|INTO)\s+[^)]*\$\{[^}]*\}[^)]*|(?:FROM|JOIN|INTO)\s+[^)]*\+[^)]*/gi,
        severity: SeverityLevel.MEDIUM,
        description: '动态表名或列名可能导致SQL注入',
        confidence: 0.7
      },
      {
        name: 'No Input Validation Before SQL',
        pattern: /(?:query|sql|execute)\([^)]*(?:req\.|request\.)[^)]*\)(?!\s*(?:\/\/|\/\*))/gi,
        severity: SeverityLevel.HIGH,
        description: '用户输入未经验证直接用于SQL查询',
        confidence: 0.7
      }
    ]
  }

  /**
   * 检测代码中的SQL注入漏洞
   */
  detect(code: string, filePath: string): SecurityIssue[] {
    logger.info('🔍 开始SQL注入漏洞检测', { filePath })

    const issues: SecurityIssue[] = []
    const lines = code.split('\n')

    for (const pattern of this.patterns) {
      const matches = code.matchAll(pattern.pattern)

      for (const match of matches) {
        if (!match.index) continue

        // 计算行号
        const location = this.calculateLocation(code, match.index, match[0], filePath, lines)

        // 创建安全问题
        const issue: SecurityIssue = {
          id: SecurityIssueUtils.generateIssueId(),
          type: VulnerabilityType.SQL_INJECTION,
          severity: pattern.severity,
          title: `SQL注入漏洞: ${pattern.name}`,
          description: pattern.description,
          location,
          remediation: this.generateRemediation(pattern.name),
          discoveredAt: new Date(),
          owaspCategory: 'A1:2017-Injection',
          cweId: 89, // CWE-89: SQL Injection
          confidence: pattern.confidence
        }

        issues.push(issue)
      }
    }

    logger.info(`✅ SQL注入检测完成，发现${issues.length}个问题`, { filePath })
    return issues
  }

  /**
   * 计算问题位置
   */
  private calculateLocation(
    _code: string,
    matchIndex: number,
    matchText: string,
    filePath: string,
    lines: string[]
  ): IssueLocation {
    let currentPos = 0
    let startLine = 1
    let endLine = 1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue
      const lineLength = line.length + 1 // +1 for newline

      if (currentPos + lineLength > matchIndex) {
        startLine = i + 1
        break
      }

      currentPos += lineLength
    }

    // 计算结束行
    const matchLines = matchText.split('\n').length
    endLine = startLine + matchLines - 1

    // 提取代码片段（前后3行）
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
  private generateRemediation(patternName: string): SecurityIssue['remediation'] {
    const baseRemediation = {
      description: '使用参数化查询（Prepared Statements）或ORM框架来防止SQL注入',
      steps: [
        '1. 使用参数化查询或ORM框架（如TypeORM、Sequelize）',
        '2. 永远不要直接拼接用户输入到SQL语句中',
        '3. 对所有用户输入进行严格的验证和清理',
        '4. 使用白名单验证动态表名或列名',
        '5. 实施最小权限原则，限制数据库用户权限'
      ],
      references: [
        'https://owasp.org/www-community/attacks/SQL_Injection',
        'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
        'https://cwe.mitre.org/data/definitions/89.html'
      ]
    }

    // 根据不同模式提供具体示例代码
    let exampleCode = ''

    if (patternName.includes('String Concatenation') || patternName.includes('Template String')) {
      exampleCode = `
// ❌ 错误做法 - 字符串拼接
const query = "SELECT * FROM users WHERE id = " + userId;
db.query(query);

// ✅ 正确做法 - 参数化查询
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId]);

// ✅ 正确做法 - TypeORM
const user = await userRepository.findOne({ where: { id: userId } });
      `.trim()
    } else if (patternName.includes('Direct User Input')) {
      exampleCode = `
// ❌ 错误做法 - 直接使用用户输入
const userId = req.query.id;
const query = \`SELECT * FROM users WHERE id = \${userId}\`;
db.query(query);

// ✅ 正确做法 - 参数化查询 + 输入验证
const userId = parseInt(req.query.id, 10);
if (isNaN(userId) || userId <= 0) {
  throw new Error('Invalid user ID');
}
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId]);
      `.trim()
    } else if (patternName.includes('Dynamic Table/Column Name')) {
      exampleCode = `
// ❌ 错误做法 - 动态表名
const tableName = req.query.table;
const query = \`SELECT * FROM \${tableName}\`;
db.query(query);

// ✅ 正确做法 - 白名单验证
const allowedTables = ['users', 'products', 'orders'];
const tableName = req.query.table;
if (!allowedTables.includes(tableName)) {
  throw new Error('Invalid table name');
}
const query = \`SELECT * FROM \${tableName}\`; // 仅在白名单验证后使用
db.query(query);
      `.trim()
    }

    return {
      ...baseRemediation,
      exampleCode
    }
  }

  /**
   * 检测SQL注入的高级分析
   */
  detectAdvanced(code: string, filePath: string): SecurityIssue[] {
    const issues: SecurityIssue[] = []

    // 1. 检测ORM的原始查询
    const ormRawQueryPattern = /\.(?:query|rawQuery|raw|execute)\s*\([^)]*\+[^)]*\)/gi
    const ormMatches = code.matchAll(ormRawQueryPattern)

    for (const match of ormMatches) {
      if (!match.index) continue

      const lines = code.split('\n')
      const location = this.calculateLocation(code, match.index, match[0], filePath, lines)

      issues.push({
        id: SecurityIssueUtils.generateIssueId(),
        type: VulnerabilityType.SQL_INJECTION,
        severity: SeverityLevel.HIGH,
        title: 'ORM原始查询SQL注入',
        description: 'ORM框架的原始查询（raw query）使用字符串拼接，可能导致SQL注入',
        location,
        remediation: {
          description: '即使使用ORM框架，原始查询也应使用参数化',
          steps: [
            '1. 使用ORM提供的参数化原始查询功能',
            '2. 或者使用ORM的查询构建器',
            '3. 避免在原始查询中使用字符串拼接'
          ],
          references: [
            'https://typeorm.io/#/select-query-builder',
            'https://sequelize.org/master/manual/raw-queries.html'
          ],
          exampleCode: `
// ❌ 错误做法
const result = await connection.query("SELECT * FROM users WHERE name = '" + userName + "'");

// ✅ 正确做法 - TypeORM
const result = await connection.query("SELECT * FROM users WHERE name = $1", [userName]);

// ✅ 更好的做法 - 使用QueryBuilder
const result = await connection
  .createQueryBuilder()
  .select("user")
  .from(User, "user")
  .where("user.name = :name", { name: userName })
  .getMany();
          `.trim()
        },
        discoveredAt: new Date(),
        owaspCategory: 'A1:2017-Injection',
        cweId: 89,
        confidence: 0.85
      })
    }

    // 2. 检测存储过程调用
    const storedProcPattern = /(?:CALL|EXEC|EXECUTE)\s+[^(]*\([^)]*\+[^)]*\)/gi
    const spMatches = code.matchAll(storedProcPattern)

    for (const match of spMatches) {
      if (!match.index) continue

      const lines = code.split('\n')
      const location = this.calculateLocation(code, match.index, match[0], filePath, lines)

      issues.push({
        id: SecurityIssueUtils.generateIssueId(),
        type: VulnerabilityType.SQL_INJECTION,
        severity: SeverityLevel.MEDIUM,
        title: '存储过程调用SQL注入',
        description: '存储过程调用使用字符串拼接参数，可能导致SQL注入',
        location,
        remediation: {
          description: '存储过程调用也应使用参数化',
          steps: [
            '1. 使用参数化的存储过程调用',
            '2. 在存储过程内部也要避免动态SQL拼接',
            '3. 使用sp_executesql而不是EXEC来执行动态SQL'
          ],
          references: [
            'https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql'
          ]
        },
        discoveredAt: new Date(),
        owaspCategory: 'A1:2017-Injection',
        cweId: 89,
        confidence: 0.75
      })
    }

    return issues
  }
}

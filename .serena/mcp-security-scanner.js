#!/usr/bin/env node

/**
 * SmartAbp 静态安全扫描MCP工具集
 * 企业级安全漏洞检测和防护 - 5个专业安全工具
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityScanner {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.securityRules = this.initializeSecurityRules();
    this.vulnerabilityDatabase = this.loadVulnerabilityDatabase();
  }

  // 初始化安全规则
  initializeSecurityRules() {
    return {
      sqlInjection: [
        /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\+/gi,
        /INSERT\s+INTO\s+.*\s+VALUES\s*\([^)]*\+/gi,
        /UPDATE\s+.*\s+SET\s+.*=.*\+/gi,
        /DELETE\s+FROM\s+.*\s+WHERE\s+.*\+/gi,
        /exec\s*\(\s*[^)]*\+/gi
      ],
      xss: [
        /innerHTML\s*=\s*[^;]*\+/gi,
        /document\.write\s*\([^)]*\+/gi,
        /\.html\s*\([^)]*\+/gi,
        /dangerouslySetInnerHTML/gi,
        /v-html\s*=\s*[^>]*\+/gi
      ],
      csrf: [
        /fetch\s*\([^)]*method:\s*['"`]POST['"`]/gi,
        /axios\.post\s*\(/gi,
        /\$\.ajax\s*\([^)]*type:\s*['"`]POST['"`]/gi
      ],
      pathTraversal: [
        /\.\.\//g,
        /\.\.\\\\?/g,
        /path\.join\s*\([^)]*\.\./gi,
        /fs\.readFile\s*\([^)]*\.\./gi
      ],
      commandInjection: [
        /exec\s*\([^)]*\+/gi,
        /spawn\s*\([^)]*\+/gi,
        /system\s*\([^)]*\+/gi,
        /shell_exec\s*\([^)]*\+/gi
      ]
    };
  }

  // 加载漏洞数据库
  loadVulnerabilityDatabase() {
    return {
      sensitivePatterns: [
        { pattern: /password\s*[:=]\s*['"`][^'"`]+['"`]/gi, type: 'hardcoded-password', severity: 'critical' },
        { pattern: /api[_-]?key\s*[:=]\s*['"`][^'"`]+['"`]/gi, type: 'api-key', severity: 'high' },
        { pattern: /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi, type: 'secret', severity: 'high' },
        { pattern: /token\s*[:=]\s*['"`][^'"`]+['"`]/gi, type: 'token', severity: 'medium' },
        { pattern: /connectionstring\s*[:=]\s*['"`][^'"`]+['"`]/gi, type: 'connection-string', severity: 'critical' },
        { pattern: /[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}/g, type: 'credit-card', severity: 'critical' },
        { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, type: 'email', severity: 'low' },
        { pattern: /\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b/g, type: 'ssn', severity: 'critical' }
      ],
      authPatterns: [
        { pattern: /jwt\.sign\s*\([^)]*expiresIn/gi, type: 'jwt-expiration', check: 'expires_in_check' },
        { pattern: /session\s*\[\s*['"`][^'"`]+['"`]\s*\]/gi, type: 'session-management', check: 'session_security' },
        { pattern: /bcrypt\.compare\s*\(/gi, type: 'password-hashing', check: 'bcrypt_usage' },
        { pattern: /crypto\.randomBytes\s*\(/gi, type: 'random-generation', check: 'crypto_random' }
      ],
      complianceChecks: [
        { pattern: /gdpr|GDPR/g, type: 'gdpr-reference', requirement: 'data-protection' },
        { pattern: /personal.?data|personalData/gi, type: 'personal-data', requirement: 'privacy-protection' },
        { pattern: /audit.?log|auditLog/gi, type: 'audit-logging', requirement: 'audit-trail' },
        { pattern: /encrypt|decrypt/gi, type: 'encryption', requirement: 'data-encryption' }
      ]
    };
  }

  // 1. 全面安全漏洞扫描
  async scanVulnerabilities() {
    console.error('[安全扫描器] 开始全面安全漏洞扫描...');
    
    const scan = {
      timestamp: new Date().toISOString(),
      summary: {
        filesScanned: 0,
        vulnerabilitiesFound: 0,
        criticalIssues: 0,
        highRiskIssues: 0,
        mediumRiskIssues: 0,
        lowRiskIssues: 0
      },
      vulnerabilities: {
        sqlInjection: [],
        xss: [],
        csrf: [],
        pathTraversal: [],
        commandInjection: []
      },
      recommendations: []
    };

    const sourceFiles = this.getSourceFiles();
    
    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      scan.summary.filesScanned++;

      // SQL注入检测
      scan.vulnerabilities.sqlInjection.push(...this.detectSqlInjection(content, file));
      
      // XSS检测
      scan.vulnerabilities.xss.push(...this.detectXss(content, file));
      
      // CSRF检测
      scan.vulnerabilities.csrf.push(...this.detectCsrf(content, file));
      
      // 路径遍历检测
      scan.vulnerabilities.pathTraversal.push(...this.detectPathTraversal(content, file));
      
      // 命令注入检测
      scan.vulnerabilities.commandInjection.push(...this.detectCommandInjection(content, file));
    }

    // 统计漏洞数量
    Object.values(scan.vulnerabilities).forEach(vulns => {
      scan.summary.vulnerabilitiesFound += vulns.length;
      vulns.forEach(vuln => {
        switch (vuln.severity) {
          case 'critical': scan.summary.criticalIssues++; break;
          case 'high': scan.summary.highRiskIssues++; break;
          case 'medium': scan.summary.mediumRiskIssues++; break;
          case 'low': scan.summary.lowRiskIssues++; break;
        }
      });
    });

    // 生成修复建议
    scan.recommendations = this.generateVulnerabilityRecommendations(scan);

    console.error(`[安全扫描器] 扫描完成: ${scan.summary.filesScanned}个文件, 发现${scan.summary.vulnerabilitiesFound}个漏洞`);
    
    return scan;
  }

  // 2. 敏感信息泄露检测
  async detectSensitiveData() {
    console.error('[安全扫描器] 开始敏感信息泄露检测...');
    
    const detection = {
      timestamp: new Date().toISOString(),
      summary: {
        filesScanned: 0,
        sensitiveDataFound: 0,
        criticalLeaks: 0,
        potentialLeaks: 0
      },
      findings: {
        hardcodedSecrets: [],
        personalData: [],
        financialData: [],
        apiCredentials: []
      },
      recommendations: []
    };

    const sourceFiles = this.getSourceFiles();
    
    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      detection.summary.filesScanned++;

      // 检测各种敏感信息
      this.vulnerabilityDatabase.sensitivePatterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern.pattern)];
        
        matches.forEach(match => {
          const finding = {
            type: pattern.type,
            severity: pattern.severity,
            file: file,
            line: this.getLineNumber(content, match.index),
            match: match[0],
            context: this.getContext(content, match.index),
            recommendation: this.getSensitiveDataRecommendation(pattern.type)
          };

          // 分类存储
          switch (pattern.type) {
            case 'hardcoded-password':
            case 'secret':
            case 'api-key':
            case 'token':
            case 'connection-string':
              detection.findings.hardcodedSecrets.push(finding);
              break;
            case 'credit-card':
            case 'ssn':
              detection.findings.financialData.push(finding);
              break;
            case 'email':
              detection.findings.personalData.push(finding);
              break;
          }

          detection.summary.sensitiveDataFound++;
          if (pattern.severity === 'critical') {
            detection.summary.criticalLeaks++;
          } else {
            detection.summary.potentialLeaks++;
          }
        });
      });
    }

    detection.recommendations = this.generateSensitiveDataRecommendations(detection);

    console.error(`[安全扫描器] 检测完成: 发现${detection.summary.sensitiveDataFound}个敏感信息泄露`);
    
    return detection;
  }

  // 3. 身份认证安全分析
  async analyzeAuthentication() {
    console.error('[安全扫描器] 开始身份认证安全分析...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      summary: {
        authMechanisms: 0,
        securityIssues: 0,
        bestPractices: 0,
        improvements: 0
      },
      findings: {
        jwtSecurity: [],
        sessionManagement: [],
        passwordSecurity: [],
        authorizationChecks: []
      },
      recommendations: []
    };

    const sourceFiles = this.getSourceFiles();
    
    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // JWT安全检查
      analysis.findings.jwtSecurity.push(...this.analyzeJwtSecurity(content, file));
      
      // 会话管理检查
      analysis.findings.sessionManagement.push(...this.analyzeSessionManagement(content, file));
      
      // 密码安全检查
      analysis.findings.passwordSecurity.push(...this.analyzePasswordSecurity(content, file));
      
      // 授权检查
      analysis.findings.authorizationChecks.push(...this.analyzeAuthorization(content, file));
    }

    // 统计分析结果
    Object.values(analysis.findings).forEach(findings => {
      findings.forEach(finding => {
        if (finding.isSecure) {
          analysis.summary.bestPractices++;
        } else {
          analysis.summary.securityIssues++;
        }
      });
    });

    analysis.recommendations = this.generateAuthRecommendations(analysis);

    console.error(`[安全扫描器] 认证分析完成: 发现${analysis.summary.securityIssues}个安全问题`);
    
    return analysis;
  }

  // 4. 第三方依赖安全审计
  async auditDependencies() {
    console.error('[安全扫描器] 开始第三方依赖安全审计...');
    
    const audit = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDependencies: 0,
        vulnerableDependencies: 0,
        outdatedDependencies: 0,
        highRiskDependencies: 0
      },
      findings: {
        npmVulnerabilities: [],
        nugetVulnerabilities: [],
        outdatedPackages: [],
        licenseIssues: []
      },
      recommendations: []
    };

    // 检查package.json
    await this.auditNpmDependencies(audit);
    
    // 检查.csproj文件
    await this.auditNugetDependencies(audit);
    
    // 检查许可证合规性
    await this.checkLicenseCompliance(audit);

    audit.recommendations = this.generateDependencyRecommendations(audit);

    console.error(`[安全扫描器] 依赖审计完成: ${audit.summary.vulnerableDependencies}个漏洞依赖`);
    
    return audit;
  }

  // 5. 安全合规性检查
  async checkCompliance() {
    console.error('[安全扫描器] 开始安全合规性检查...');
    
    const compliance = {
      timestamp: new Date().toISOString(),
      standards: {
        gdpr: { score: 0, checks: [], violations: [] },
        owasp: { score: 0, checks: [], violations: [] },
        enterprise: { score: 0, checks: [], violations: [] }
      },
      summary: {
        overallScore: 0,
        passedChecks: 0,
        failedChecks: 0,
        totalChecks: 0
      },
      recommendations: []
    };

    const sourceFiles = this.getSourceFiles();
    
    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // GDPR合规检查
      compliance.standards.gdpr.checks.push(...this.checkGdprCompliance(content, file));
      
      // OWASP Top 10检查
      compliance.standards.owasp.checks.push(...this.checkOwaspCompliance(content, file));
      
      // 企业安全策略检查
      compliance.standards.enterprise.checks.push(...this.checkEnterpriseCompliance(content, file));
    }

    // 计算合规分数
    Object.keys(compliance.standards).forEach(standard => {
      const checks = compliance.standards[standard].checks;
      const passed = checks.filter(c => c.passed).length;
      const total = checks.length;
      
      compliance.standards[standard].score = total > 0 ? Math.round((passed / total) * 100) : 0;
      compliance.summary.passedChecks += passed;
      compliance.summary.totalChecks += total;
      compliance.summary.failedChecks += (total - passed);
    });

    compliance.summary.overallScore = compliance.summary.totalChecks > 0 
      ? Math.round((compliance.summary.passedChecks / compliance.summary.totalChecks) * 100) 
      : 0;

    compliance.recommendations = this.generateComplianceRecommendations(compliance);

    console.error(`[安全扫描器] 合规检查完成: 总体评分${compliance.summary.overallScore}分`);
    
    return compliance;
  }

  // 检测SQL注入
  detectSqlInjection(content, fileName) {
    const vulnerabilities = [];
    
    this.securityRules.sqlInjection.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      
      matches.forEach(match => {
        vulnerabilities.push({
          type: 'sql-injection',
          severity: 'critical',
          file: fileName,
          line: this.getLineNumber(content, match.index),
          code: match[0],
          message: '潜在的SQL注入漏洞',
          recommendation: '使用参数化查询或ORM框架',
          cwe: 'CWE-89',
          owasp: 'A03:2021 – Injection'
        });
      });
    });

    return vulnerabilities;
  }

  // 检测XSS
  detectXss(content, fileName) {
    const vulnerabilities = [];
    
    this.securityRules.xss.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      
      matches.forEach(match => {
        vulnerabilities.push({
          type: 'xss',
          severity: 'high',
          file: fileName,
          line: this.getLineNumber(content, match.index),
          code: match[0],
          message: '潜在的跨站脚本攻击(XSS)漏洞',
          recommendation: '对用户输入进行适当的转义和验证',
          cwe: 'CWE-79',
          owasp: 'A03:2021 – Injection'
        });
      });
    });

    return vulnerabilities;
  }

  // 检测CSRF
  detectCsrf(content, fileName) {
    const vulnerabilities = [];
    
    // 检查POST请求是否有CSRF保护
    const postRequests = [...content.matchAll(/fetch\s*\([^)]*method:\s*['"`]POST['"`]/gi)];
    const csrfTokens = [...content.matchAll(/csrf[_-]?token|_token|authenticity_token/gi)];
    
    if (postRequests.length > 0 && csrfTokens.length === 0) {
      vulnerabilities.push({
        type: 'csrf',
        severity: 'medium',
        file: fileName,
        line: this.getLineNumber(content, postRequests[0].index),
        code: postRequests[0][0],
        message: 'POST请求缺少CSRF保护',
        recommendation: '添加CSRF令牌验证',
        cwe: 'CWE-352',
        owasp: 'A01:2021 – Broken Access Control'
      });
    }

    return vulnerabilities;
  }

  // 检测路径遍历
  detectPathTraversal(content, fileName) {
    const vulnerabilities = [];
    
    this.securityRules.pathTraversal.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      
      matches.forEach(match => {
        vulnerabilities.push({
          type: 'path-traversal',
          severity: 'high',
          file: fileName,
          line: this.getLineNumber(content, match.index),
          code: match[0],
          message: '潜在的路径遍历漏洞',
          recommendation: '验证和清理文件路径输入',
          cwe: 'CWE-22',
          owasp: 'A01:2021 – Broken Access Control'
        });
      });
    });

    return vulnerabilities;
  }

  // 检测命令注入
  detectCommandInjection(content, fileName) {
    const vulnerabilities = [];
    
    this.securityRules.commandInjection.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      
      matches.forEach(match => {
        vulnerabilities.push({
          type: 'command-injection',
          severity: 'critical',
          file: fileName,
          line: this.getLineNumber(content, match.index),
          code: match[0],
          message: '潜在的命令注入漏洞',
          recommendation: '避免动态构建系统命令，使用安全的API',
          cwe: 'CWE-78',
          owasp: 'A03:2021 – Injection'
        });
      });
    });

    return vulnerabilities;
  }

  // JWT安全分析
  analyzeJwtSecurity(content, fileName) {
    const findings = [];
    
    // 检查JWT过期时间
    const jwtSignMatches = [...content.matchAll(/jwt\.sign\s*\([^)]*expiresIn[^)]*\)/gi)];
    
    jwtSignMatches.forEach(match => {
      const hasShortExpiry = /expiresIn:\s*['"`][0-9]+[mh]['"`]/.test(match[0]);
      
      findings.push({
        type: 'jwt-expiration',
        isSecure: hasShortExpiry,
        file: fileName,
        line: this.getLineNumber(content, match.index),
        code: match[0],
        message: hasShortExpiry ? 'JWT过期时间设置合理' : 'JWT过期时间可能过长',
        recommendation: hasShortExpiry ? '继续保持' : '建议设置较短的过期时间(如1h)'
      });
    });

    return findings;
  }

  // 会话管理分析
  analyzeSessionManagement(content, fileName) {
    const findings = [];
    
    // 检查会话配置
    const sessionMatches = [...content.matchAll(/session\s*\.\s*cookie/gi)];
    
    sessionMatches.forEach(match => {
      const hasSecureFlag = /secure:\s*true/i.test(content.substring(match.index, match.index + 200));
      const hasHttpOnlyFlag = /httpOnly:\s*true/i.test(content.substring(match.index, match.index + 200));
      
      findings.push({
        type: 'session-security',
        isSecure: hasSecureFlag && hasHttpOnlyFlag,
        file: fileName,
        line: this.getLineNumber(content, match.index),
        message: `会话Cookie安全配置: secure=${hasSecureFlag}, httpOnly=${hasHttpOnlyFlag}`,
        recommendation: hasSecureFlag && hasHttpOnlyFlag ? '配置安全' : '建议启用secure和httpOnly标志'
      });
    });

    return findings;
  }

  // 密码安全分析
  analyzePasswordSecurity(content, fileName) {
    const findings = [];
    
    // 检查密码哈希
    const bcryptMatches = [...content.matchAll(/bcrypt\.(hash|compare)/gi)];
    const md5Matches = [...content.matchAll(/md5\s*\(/gi)];
    const sha1Matches = [...content.matchAll(/sha1\s*\(/gi)];
    
    bcryptMatches.forEach(match => {
      findings.push({
        type: 'password-hashing',
        isSecure: true,
        file: fileName,
        line: this.getLineNumber(content, match.index),
        message: '使用安全的bcrypt哈希算法',
        recommendation: '继续使用bcrypt或更强的算法'
      });
    });

    md5Matches.forEach(match => {
      findings.push({
        type: 'password-hashing',
        isSecure: false,
        file: fileName,
        line: this.getLineNumber(content, match.index),
        message: '使用不安全的MD5哈希算法',
        recommendation: '改用bcrypt、scrypt或Argon2算法'
      });
    });

    return findings;
  }

  // 授权分析
  analyzeAuthorization(content, fileName) {
    const findings = [];
    
    // 检查权限验证
    const authChecks = [...content.matchAll(/(authorize|permission|role|can|ability)\s*\(/gi)];
    const routeHandlers = [...content.matchAll(/(app\.(get|post|put|delete)|router\.(get|post|put|delete))/gi)];
    
    if (routeHandlers.length > 0 && authChecks.length === 0) {
      findings.push({
        type: 'authorization-missing',
        isSecure: false,
        file: fileName,
        line: this.getLineNumber(content, routeHandlers[0].index),
        message: '路由缺少授权检查',
        recommendation: '为敏感操作添加适当的权限验证'
      });
    }

    return findings;
  }

  // NPM依赖审计
  async auditNpmDependencies(audit) {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      audit.summary.totalDependencies += Object.keys(dependencies).length;
      
      // 简化的漏洞检查（实际应该调用npm audit API）
      const knownVulnerablePackages = ['lodash', 'moment', 'request'];
      
      Object.keys(dependencies).forEach(pkg => {
        if (knownVulnerablePackages.includes(pkg)) {
          audit.findings.npmVulnerabilities.push({
            package: pkg,
            version: dependencies[pkg],
            severity: 'medium',
            description: '已知存在安全漏洞的包',
            recommendation: '升级到最新版本或使用替代包'
          });
          audit.summary.vulnerableDependencies++;
        }
      });
    }
  }

  // NuGet依赖审计
  async auditNugetDependencies(audit) {
    const csprojFiles = this.findFiles('.csproj');
    
    csprojFiles.forEach(csprojFile => {
      const content = fs.readFileSync(path.join(this.projectRoot, csprojFile), 'utf8');
      const packageMatches = [...content.matchAll(/<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"/gi)];
      
      packageMatches.forEach(match => {
        audit.summary.totalDependencies++;
        
        const packageName = match[1];
        const version = match[2];
        
        // 简化的版本检查
        if (version.includes('1.0') || version.includes('2.0')) {
          audit.findings.outdatedPackages.push({
            package: packageName,
            version: version,
            file: csprojFile,
            recommendation: '考虑升级到最新版本'
          });
          audit.summary.outdatedDependencies++;
        }
      });
    });
  }

  // 许可证合规检查
  async checkLicenseCompliance(audit) {
    // 简化的许可证检查
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.license) {
        audit.findings.licenseIssues.push({
          type: 'missing-license',
          file: 'package.json',
          message: '缺少许可证声明',
          recommendation: '添加适当的许可证声明'
        });
      }
    }
  }

  // GDPR合规检查
  checkGdprCompliance(content, fileName) {
    const checks = [];
    
    // 检查个人数据处理
    const personalDataMatches = [...content.matchAll(/personal.?data|user.?data|private.?info/gi)];
    
    personalDataMatches.forEach(match => {
      const hasConsentCheck = /consent|permission|agree/.test(content.substring(match.index - 100, match.index + 100));
      
      checks.push({
        type: 'gdpr-personal-data',
        passed: hasConsentCheck,
        file: fileName,
        line: this.getLineNumber(content, match.index),
        message: hasConsentCheck ? '个人数据处理有用户同意' : '个人数据处理缺少用户同意',
        requirement: 'GDPR Article 6 - Lawfulness of processing'
      });
    });

    return checks;
  }

  // OWASP合规检查
  checkOwaspCompliance(content, fileName) {
    const checks = [];
    
    // 检查输入验证
    const inputValidationMatches = [...content.matchAll(/(validate|sanitize|escape)/gi)];
    const userInputMatches = [...content.matchAll(/(req\.body|req\.query|req\.params|input|form)/gi)];
    
    if (userInputMatches.length > 0) {
      checks.push({
        type: 'owasp-input-validation',
        passed: inputValidationMatches.length > 0,
        file: fileName,
        line: this.getLineNumber(content, userInputMatches[0].index),
        message: inputValidationMatches.length > 0 ? '发现输入验证' : '缺少输入验证',
        requirement: 'OWASP Top 10 - A03:2021 Injection'
      });
    }

    return checks;
  }

  // 企业安全策略检查
  checkEnterpriseCompliance(content, fileName) {
    const checks = [];
    
    // 检查日志记录
    const loggingMatches = [...content.matchAll(/(logger|log\.|console\.log)/gi)];
    
    checks.push({
      type: 'enterprise-logging',
      passed: loggingMatches.length > 0,
      file: fileName,
      line: loggingMatches.length > 0 ? this.getLineNumber(content, loggingMatches[0].index) : 1,
      message: loggingMatches.length > 0 ? '发现日志记录' : '缺少日志记录',
      requirement: '企业审计要求'
    });

    return checks;
  }

  // 工具函数
  getSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.js', '.vue', '.jsx', '.tsx', '.cs'];
    
    const scanDir = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativeFilePath = path.join(relativePath, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build', 'coverage', '.generated'].includes(entry)) {
            scanDir(fullPath, relativeFilePath);
          }
        } else if (extensions.some(ext => entry.endsWith(ext))) {
          files.push(relativeFilePath);
        }
      }
    };

    const sourceDirs = [
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages',
      'src/SmartAbp.Application',
      'src/SmartAbp.Domain'
    ];

    sourceDirs.forEach(sourceDir => {
      const fullSourceDir = path.join(this.projectRoot, sourceDir);
      scanDir(fullSourceDir, sourceDir);
    });

    return files;
  }

  findFiles(extension) {
    const files = [];
    
    const scanDir = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativeFilePath = path.join(relativePath, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
            scanDir(fullPath, relativeFilePath);
          }
        } else if (entry.endsWith(extension)) {
          files.push(relativeFilePath);
        }
      }
    };

    scanDir(this.projectRoot);
    return files;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  getContext(content, index, contextSize = 50) {
    const start = Math.max(0, index - contextSize);
    const end = Math.min(content.length, index + contextSize);
    return content.substring(start, end);
  }

  getSensitiveDataRecommendation(type) {
    const recommendations = {
      'hardcoded-password': '使用环境变量或安全的密钥管理系统',
      'api-key': '将API密钥存储在环境变量或密钥管理服务中',
      'secret': '使用专门的密钥管理系统存储机密信息',
      'token': '避免在代码中硬编码令牌',
      'connection-string': '使用配置文件或环境变量存储连接字符串',
      'credit-card': '确保信用卡号码已加密存储',
      'ssn': '社会安全号码需要特殊保护',
      'email': '考虑个人信息保护要求'
    };
    
    return recommendations[type] || '请审查此敏感信息的处理方式';
  }

  // 生成建议
  generateVulnerabilityRecommendations(scan) {
    const recommendations = [];
    
    if (scan.summary.criticalIssues > 0) {
      recommendations.push({
        priority: 'critical',
        title: '立即修复严重安全漏洞',
        description: `发现${scan.summary.criticalIssues}个严重安全漏洞，需要立即处理`,
        actions: ['审查SQL注入和命令注入漏洞', '实施输入验证和参数化查询', '进行安全测试']
      });
    }

    if (scan.summary.highRiskIssues > 0) {
      recommendations.push({
        priority: 'high',
        title: '修复高风险安全问题',
        description: `发现${scan.summary.highRiskIssues}个高风险问题`,
        actions: ['修复XSS和路径遍历漏洞', '加强输入验证', '实施安全编码规范']
      });
    }

    return recommendations;
  }

  generateSensitiveDataRecommendations(detection) {
    const recommendations = [];
    
    if (detection.summary.criticalLeaks > 0) {
      recommendations.push({
        priority: 'critical',
        title: '紧急处理敏感信息泄露',
        description: `发现${detection.summary.criticalLeaks}个严重的敏感信息泄露`,
        actions: ['立即移除硬编码的密码和密钥', '实施密钥管理系统', '审查所有配置文件']
      });
    }

    return recommendations;
  }

  generateAuthRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.summary.securityIssues > 0) {
      recommendations.push({
        priority: 'high',
        title: '加强身份认证安全',
        description: `发现${analysis.summary.securityIssues}个认证安全问题`,
        actions: ['实施强密码策略', '启用多因素认证', '配置安全的会话管理']
      });
    }

    return recommendations;
  }

  generateDependencyRecommendations(audit) {
    const recommendations = [];
    
    if (audit.summary.vulnerableDependencies > 0) {
      recommendations.push({
        priority: 'high',
        title: '更新有漏洞的依赖包',
        description: `发现${audit.summary.vulnerableDependencies}个有安全漏洞的依赖`,
        actions: ['运行npm audit fix', '升级到安全版本', '考虑替代方案']
      });
    }

    return recommendations;
  }

  generateComplianceRecommendations(compliance) {
    const recommendations = [];
    
    if (compliance.summary.overallScore < 80) {
      recommendations.push({
        priority: 'medium',
        title: '提升安全合规性',
        description: `当前合规评分${compliance.summary.overallScore}分，需要改进`,
        actions: ['完善数据保护措施', '加强审计日志', '实施安全开发流程']
      });
    }

    return recommendations;
  }

  // 获取工具定义
  static getToolDefinitions() {
    return [
      {
        name: 'mcp_security_vulnerability_scanner',
        description: '全面安全漏洞扫描：SQL注入、XSS、CSRF、路径遍历、命令注入检测',
        inputSchema: {
          type: 'object',
          properties: {
            scanType: {
              type: 'string',
              description: '扫描类型',
              enum: ['full', 'sql-injection', 'xss', 'csrf', 'path-traversal', 'command-injection'],
              default: 'full'
            }
          }
        }
      },
      {
        name: 'mcp_security_sensitive_data_detector',
        description: '敏感信息泄露检测：API密钥、密码、个人信息、财务数据扫描',
        inputSchema: {
          type: 'object',
          properties: {
            dataType: {
              type: 'string',
              description: '敏感数据类型',
              enum: ['all', 'secrets', 'personal', 'financial', 'credentials'],
              default: 'all'
            }
          }
        }
      },
      {
        name: 'mcp_security_authentication_analyzer',
        description: '身份认证安全分析：JWT、会话管理、密码安全、权限检查',
        inputSchema: {
          type: 'object',
          properties: {
            analysisType: {
              type: 'string',
              description: '分析类型',
              enum: ['all', 'jwt', 'session', 'password', 'authorization'],
              default: 'all'
            }
          }
        }
      },
      {
        name: 'mcp_security_dependency_audit',
        description: '第三方依赖安全审计：NPM/NuGet包漏洞扫描、版本检查、许可证合规',
        inputSchema: {
          type: 'object',
          properties: {
            packageManager: {
              type: 'string',
              description: '包管理器类型',
              enum: ['all', 'npm', 'nuget'],
              default: 'all'
            }
          }
        }
      },
      {
        name: 'mcp_security_compliance_checker',
        description: '安全合规性检查：GDPR、OWASP Top 10、企业安全策略验证',
        inputSchema: {
          type: 'object',
          properties: {
            standard: {
              type: 'string',
              description: '合规标准',
              enum: ['all', 'gdpr', 'owasp', 'enterprise'],
              default: 'all'
            }
          }
        }
      }
    ];
  }

  // 处理工具调用
  async handleToolCall(toolName, args) {
    switch (toolName) {
      case 'mcp_security_vulnerability_scanner':
        return await this.scanVulnerabilities();
      
      case 'mcp_security_sensitive_data_detector':
        return await this.detectSensitiveData();
      
      case 'mcp_security_authentication_analyzer':
        return await this.analyzeAuthentication();
      
      case 'mcp_security_dependency_audit':
        return await this.auditDependencies();
      
      case 'mcp_security_compliance_checker':
        return await this.checkCompliance();
      
      default:
        throw new Error(`未知的安全工具: ${toolName}`);
    }
  }
}

module.exports = SecurityScanner;

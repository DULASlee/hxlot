#!/usr/bin/env node
/**
 * Performance Analysis Script
 * Advanced UI Component Library - Phase 3 Week 4
 * Bundle analysis, performance audits, and optimization recommendations
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class AdvancedPerformanceAnalyzer {
  constructor() {
    this.outputDir = path.join(__dirname, "dist", "analysis")
    this.ensureOutputDir()
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  // Main analysis entry point
  async runFullAnalysis() {
    console.log(chalk.blue.bold("\n🚀 Starting Advanced Performance Analysis...\n"))

    try {
      const startTime = Date.now()

      // Step 1: Bundle Analysis
      console.log(chalk.yellow("📦 Step 1: Bundle Analysis"))
      const bundleReport = await this.analyzeBundles()

      // Step 2: Build Performance
      console.log(chalk.yellow("🏗️  Step 2: Build Performance Analysis"))
      const buildReport = await this.analyzeBuildPerformance()

      // Step 3: Runtime Performance
      console.log(chalk.yellow("⚡ Step 3: Runtime Performance Analysis"))
      const runtimeReport = await this.analyzeRuntimePerformance()

      // Step 4: Lighthouse Audit
      console.log(chalk.yellow("🔍 Step 4: Lighthouse Performance Audit"))
      const lighthouseReport = await this.runLighthouseAudit()

      // Step 5: Code Splitting Analysis
      console.log(chalk.yellow("✂️  Step 5: Code Splitting Analysis"))
      const codeSplittingReport = await this.analyzeCodeSplitting()

      // Step 6: Tree Shaking Analysis
      console.log(chalk.yellow("🌳 Step 6: Tree Shaking Analysis"))
      const treeShakingReport = await this.analyzeTreeShaking()

      // Generate comprehensive report
      const comprehensiveReport = {
        timestamp: new Date().toISOString(),
        analysisDuration: Date.now() - startTime,
        bundle: bundleReport,
        build: buildReport,
        runtime: runtimeReport,
        lighthouse: lighthouseReport,
        codeSplitting: codeSplittingReport,
        treeShaking: treeShakingReport,
        recommendations: this.generateRecommendations({
          bundleReport,
          buildReport,
          runtimeReport,
          lighthouseReport,
          codeSplittingReport,
          treeShakingReport,
        }),
      }

      // Save comprehensive report
      await this.saveReport(comprehensiveReport)

      // Display summary
      this.displaySummary(comprehensiveReport)

      console.log(chalk.green.bold("\n✅ Performance Analysis Complete!"))
      console.log(chalk.cyan(`📊 Reports saved to: ${this.outputDir}`))
    } catch (error) {
      console.error(chalk.red.bold("\n❌ Performance Analysis Failed:"), error.message)
      process.exit(1)
    }
  }

  // Bundle analysis with webpack-bundle-analyzer
  async analyzeBundles() {
    console.log("  • Building with bundle analysis...")

    try {
      // Clean previous builds
      execSync("rm -rf dist", { stdio: "pipe" })

      // Build with analysis
      const buildOutput = execSync("ANALYZE_BUNDLE=true npm run build", {
        encoding: "utf8",
        env: { ...process.env, NODE_ENV: "production" },
      })

      // Parse bundle stats
      const statsPath = path.join(this.outputDir, "bundle-stats.json")
      if (fs.existsSync(statsPath)) {
        const stats = JSON.parse(fs.readFileSync(statsPath, "utf8"))

        return {
          totalSize: this.calculateTotalSize(stats.assets),
          chunks: this.analyzeChunks(stats.chunks),
          modules: this.analyzeModules(stats.modules),
          assets: this.analyzeAssets(stats.assets),
          duplicates: this.findDuplicateModules(stats.modules),
          largestModules: this.findLargestModules(stats.modules, 10),
        }
      }

      return { error: "Bundle stats not found" }
    } catch (error) {
      return { error: error.message }
    }
  }

  calculateTotalSize(assets) {
    return {
      raw: assets.reduce((total, asset) => total + asset.size, 0),
      gzipped: assets.reduce((total, asset) => total + (asset.gzipSize || 0), 0),
      formatted: this.formatBytes(assets.reduce((total, asset) => total + asset.size, 0)),
    }
  }

  analyzeChunks(chunks) {
    return chunks
      .map((chunk) => ({
        id: chunk.id,
        names: chunk.names,
        size: chunk.size,
        modules: chunk.modules.length,
        initial: chunk.initial,
        entry: chunk.entry,
      }))
      .sort((a, b) => b.size - a.size)
  }

  analyzeModules(modules) {
    const modulesBySize = modules.filter((m) => m.size > 0).sort((a, b) => b.size - a.size)

    return {
      total: modules.length,
      largest: modulesBySize.slice(0, 20).map((m) => ({
        name: m.name,
        size: m.size,
        formatted: this.formatBytes(m.size),
      })),
      byType: this.groupModulesByType(modules),
    }
  }

  analyzeAssets(assets) {
    return assets
      .sort((a, b) => b.size - a.size)
      .map((asset) => ({
        name: asset.name,
        size: asset.size,
        formatted: this.formatBytes(asset.size),
        type: this.getAssetType(asset.name),
      }))
  }

  // Build performance analysis
  async analyzeBuildPerformance() {
    console.log("  • Analyzing build performance...")

    const buildTimes = []
    const iterations = 3

    for (let i = 0; i < iterations; i++) {
      console.log(`    - Build iteration ${i + 1}/${iterations}`)

      // Clean build
      execSync("rm -rf dist", { stdio: "pipe" })

      const startTime = Date.now()
      execSync("npm run build", {
        stdio: "pipe",
        env: { ...process.env, NODE_ENV: "production" },
      })
      const endTime = Date.now()

      buildTimes.push(endTime - startTime)
    }

    return {
      iterations,
      times: buildTimes,
      average: buildTimes.reduce((sum, time) => sum + time, 0) / buildTimes.length,
      min: Math.min(...buildTimes),
      max: Math.max(...buildTimes),
      formatted: {
        average: this.formatDuration(
          buildTimes.reduce((sum, time) => sum + time, 0) / buildTimes.length,
        ),
        min: this.formatDuration(Math.min(...buildTimes)),
        max: this.formatDuration(Math.max(...buildTimes)),
      },
    }
  }

  // Runtime performance analysis
  async analyzeRuntimePerformance() {
    console.log("  • Analyzing runtime performance...")

    try {
      // Start development server
      const serverProcess = execSync("npm run serve &", { stdio: "pipe" })

      // Wait for server to start
      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Run performance tests using Puppeteer
      const puppeteer = require("puppeteer")
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()

      // Navigate to application
      await page.goto("http://localhost:8080")

      // Collect performance metrics
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          if (window.performance && window.performance.getEntriesByType) {
            const navigation = window.performance.getEntriesByType("navigation")[0]
            const paint = window.performance.getEntriesByType("paint")

            resolve({
              domContentLoaded:
                navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              firstPaint: paint.find((p) => p.name === "first-paint")?.startTime || 0,
              firstContentfulPaint:
                paint.find((p) => p.name === "first-contentful-paint")?.startTime || 0,
              domInteractive: navigation.domInteractive - navigation.navigationStart,
              domComplete: navigation.domComplete - navigation.navigationStart,
            })
          }
          resolve({})
        })
      })

      await browser.close()

      // Kill server process
      execSync('pkill -f "serve"', { stdio: "pipe" })

      return {
        metrics,
        formatted: Object.entries(metrics).reduce((acc, [key, value]) => {
          acc[key] = this.formatDuration(value)
          return acc
        }, {}),
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Lighthouse audit
  async runLighthouseAudit() {
    console.log("  • Running Lighthouse audit...")

    try {
      // Start server for Lighthouse
      execSync("npm run serve &", { stdio: "pipe" })
      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Run Lighthouse
      const lighthouseOutput = execSync(
        'lighthouse http://localhost:8080 --output=json --chrome-flags="--headless" --quiet',
        { encoding: "utf8" },
      )

      const lighthouseReport = JSON.parse(lighthouseOutput)

      // Kill server
      execSync('pkill -f "serve"', { stdio: "pipe" })

      return {
        performance: lighthouseReport.categories.performance.score * 100,
        accessibility: lighthouseReport.categories.accessibility.score * 100,
        bestPractices: lighthouseReport.categories["best-practices"].score * 100,
        seo: lighthouseReport.categories.seo.score * 100,
        audits: {
          firstContentfulPaint: lighthouseReport.audits["first-contentful-paint"],
          largestContentfulPaint: lighthouseReport.audits["largest-contentful-paint"],
          firstInputDelay: lighthouseReport.audits["max-potential-fid"],
          cumulativeLayoutShift: lighthouseReport.audits["cumulative-layout-shift"],
          speedIndex: lighthouseReport.audits["speed-index"],
        },
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Code splitting analysis
  async analyzeCodeSplitting() {
    console.log("  • Analyzing code splitting effectiveness...")

    try {
      const statsPath = path.join(this.outputDir, "bundle-stats.json")
      if (!fs.existsSync(statsPath)) {
        return { error: "Bundle stats required for code splitting analysis" }
      }

      const stats = JSON.parse(fs.readFileSync(statsPath, "utf8"))

      const analysis = {
        totalChunks: stats.chunks.length,
        entryChunks: stats.chunks.filter((c) => c.entry).length,
        asyncChunks: stats.chunks.filter((c) => !c.entry && !c.initial).length,
        initialChunks: stats.chunks.filter((c) => c.initial).length,
        chunkSizes: stats.chunks
          .map((c) => ({
            name: c.names[0] || c.id,
            size: c.size,
            formatted: this.formatBytes(c.size),
            modules: c.modules.length,
          }))
          .sort((a, b) => b.size - a.size),
        splittingEffectiveness: this.calculateSplittingEffectiveness(stats.chunks),
      }

      return analysis
    } catch (error) {
      return { error: error.message }
    }
  }

  // Tree shaking analysis
  async analyzeTreeShaking() {
    console.log("  • Analyzing tree shaking effectiveness...")

    try {
      // Build with and without tree shaking
      console.log("    - Building without tree shaking...")
      execSync("rm -rf dist", { stdio: "pipe" })
      const withoutTreeShaking = execSync("npm run build:no-tree-shaking", {
        encoding: "utf8",
        stdio: "pipe",
        env: { ...process.env, NODE_ENV: "production" },
      })

      const sizeWithout = this.getBuildSize()

      console.log("    - Building with tree shaking...")
      execSync("rm -rf dist", { stdio: "pipe" })
      const withTreeShaking = execSync("npm run build", {
        encoding: "utf8",
        stdio: "pipe",
        env: { ...process.env, NODE_ENV: "production" },
      })

      const sizeWith = this.getBuildSize()

      const savings = sizeWithout - sizeWith
      const savingsPercentage = (savings / sizeWithout) * 100

      return {
        sizeWithoutTreeShaking: sizeWithout,
        sizeWithTreeShaking: sizeWith,
        savings: savings,
        savingsPercentage: savingsPercentage,
        formatted: {
          sizeWithout: this.formatBytes(sizeWithout),
          sizeWith: this.formatBytes(sizeWith),
          savings: this.formatBytes(savings),
          savingsPercentage: `${savingsPercentage.toFixed(2)}%`,
        },
        effectiveness:
          savingsPercentage > 20
            ? "Excellent"
            : savingsPercentage > 10
              ? "Good"
              : savingsPercentage > 5
                ? "Fair"
                : "Poor",
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Generate optimization recommendations
  generateRecommendations(reports) {
    const recommendations = []

    // Bundle size recommendations
    if (reports.bundleReport.totalSize?.raw > 2000000) {
      // 2MB
      recommendations.push({
        type: "Bundle Size",
        priority: "High",
        issue: "Large bundle size detected",
        recommendation:
          "Consider implementing dynamic imports and lazy loading for non-critical components",
        impact: "Reduce initial load time by up to 50%",
      })
    }

    // Code splitting recommendations
    if (reports.codeSplittingReport.asyncChunks < 3) {
      recommendations.push({
        type: "Code Splitting",
        priority: "Medium",
        issue: "Limited use of code splitting",
        recommendation: "Implement route-based and component-based code splitting",
        impact: "Improve initial load performance and enable better caching",
      })
    }

    // Tree shaking recommendations
    if (reports.treeShakingReport.savingsPercentage < 10) {
      recommendations.push({
        type: "Tree Shaking",
        priority: "Medium",
        issue: "Low tree shaking effectiveness",
        recommendation: "Review imports and ensure ESM compatibility",
        impact: "Reduce bundle size by removing unused code",
      })
    }

    // Performance recommendations based on Lighthouse
    if (reports.lighthouseReport.performance < 90) {
      recommendations.push({
        type: "Runtime Performance",
        priority: "High",
        issue: "Low Lighthouse performance score",
        recommendation:
          "Optimize images, implement service workers, and reduce JavaScript execution time",
        impact: "Improve user experience and SEO rankings",
      })
    }

    return recommendations
  }

  // Utility methods
  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  getBuildSize() {
    const distPath = path.join(__dirname, "dist")
    let totalSize = 0

    const calculateSize = (dir) => {
      const files = fs.readdirSync(dir)
      for (const file of files) {
        const filePath = path.join(dir, file)
        const stats = fs.statSync(filePath)
        if (stats.isDirectory()) {
          calculateSize(filePath)
        } else {
          totalSize += stats.size
        }
      }
    }

    calculateSize(distPath)
    return totalSize
  }

  async saveReport(report) {
    const reportPath = path.join(this.outputDir, "performance-report.json")
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report)
    const htmlPath = path.join(this.outputDir, "performance-report.html")
    fs.writeFileSync(htmlPath, htmlReport)
  }

  displaySummary(report) {
    console.log(chalk.blue.bold("\n📊 Performance Analysis Summary"))
    console.log(chalk.gray("─".repeat(50)))

    if (report.bundle.totalSize) {
      console.log(`Bundle Size: ${chalk.yellow(report.bundle.totalSize.formatted)}`)
    }

    if (report.build.average) {
      console.log(`Build Time: ${chalk.yellow(report.build.formatted.average)}`)
    }

    if (report.lighthouse.performance) {
      const color =
        report.lighthouse.performance >= 90
          ? "green"
          : report.lighthouse.performance >= 70
            ? "yellow"
            : "red"
      console.log(
        `Lighthouse Score: ${chalk[color](report.lighthouse.performance.toFixed(0) + "/100")}`,
      )
    }

    if (report.recommendations.length > 0) {
      console.log(`\n${chalk.yellow.bold("🔍 Recommendations:")}`)
      report.recommendations.forEach((rec, index) => {
        const priority =
          rec.priority === "High"
            ? chalk.red(rec.priority)
            : rec.priority === "Medium"
              ? chalk.yellow(rec.priority)
              : chalk.green(rec.priority)
        console.log(`  ${index + 1}. [${priority}] ${rec.recommendation}`)
      })
    }
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced UI Components - Performance Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: #ecf0f1; border-radius: 5px; min-width: 150px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #e74c3c; }
        .metric-label { font-size: 14px; color: #7f8c8d; text-transform: uppercase; }
        .section { margin: 30px 0; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 20px; }
        .recommendation { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #f39c12; }
        .high-priority { border-left-color: #e74c3c; }
        .medium-priority { border-left-color: #f39c12; }
        .low-priority { border-left-color: #27ae60; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Advanced UI Components - Performance Analysis Report</h1>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Analysis Duration:</strong> ${this.formatDuration(report.analysisDuration)}</p>
        
        <div class="section">
            <h2>📊 Key Metrics</h2>
            ${
              report.bundle.totalSize
                ? `
            <div class="metric">
                <div class="metric-value">${report.bundle.totalSize.formatted}</div>
                <div class="metric-label">Bundle Size</div>
            </div>
            `
                : ""
            }
            ${
              report.build.formatted
                ? `
            <div class="metric">
                <div class="metric-value">${report.build.formatted.average}</div>
                <div class="metric-label">Avg Build Time</div>
            </div>
            `
                : ""
            }
            ${
              report.lighthouse.performance
                ? `
            <div class="metric">
                <div class="metric-value">${report.lighthouse.performance.toFixed(0)}/100</div>
                <div class="metric-label">Lighthouse Score</div>
            </div>
            `
                : ""
            }
        </div>
        
        ${
          report.recommendations.length > 0
            ? `
        <div class="section recommendations">
            <h2>🔍 Optimization Recommendations</h2>
            ${report.recommendations
              .map(
                (rec) => `
                <div class="recommendation ${rec.priority.toLowerCase()}-priority">
                    <strong>[${rec.priority}] ${rec.type}</strong><br>
                    <strong>Issue:</strong> ${rec.issue}<br>
                    <strong>Recommendation:</strong> ${rec.recommendation}<br>
                    <strong>Expected Impact:</strong> ${rec.impact}
                </div>
            `,
              )
              .join("")}
        </div>
        `
            : ""
        }
        
        <div class="section">
            <h2>📋 Detailed Analysis</h2>
            <pre style="background: #2c3e50; color: white; padding: 20px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(report, null, 2)}
            </pre>
        </div>
    </div>
</body>
</html>
    `
  }

  // Additional utility methods for detailed analysis
  groupModulesByType(modules) {
    const types = {}
    modules.forEach((module) => {
      const ext = path.extname(module.name) || "other"
      if (!types[ext]) types[ext] = { count: 0, size: 0 }
      types[ext].count++
      types[ext].size += module.size
    })
    return types
  }

  getAssetType(filename) {
    const ext = path.extname(filename).toLowerCase()
    if ([".js", ".ts"].includes(ext)) return "javascript"
    if ([".css", ".scss", ".less"].includes(ext)) return "stylesheet"
    if ([".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"].includes(ext)) return "image"
    if ([".woff", ".woff2", ".ttf", ".eot"].includes(ext)) return "font"
    return "other"
  }

  findDuplicateModules(modules) {
    const moduleNames = {}
    modules.forEach((module) => {
      const name = module.name.replace(/\?.*$/, "") // Remove query parameters
      if (!moduleNames[name]) moduleNames[name] = []
      moduleNames[name].push(module)
    })

    return Object.entries(moduleNames)
      .filter(([name, instances]) => instances.length > 1)
      .map(([name, instances]) => ({
        name,
        count: instances.length,
        totalSize: instances.reduce((sum, inst) => sum + inst.size, 0),
      }))
  }

  findLargestModules(modules, count = 10) {
    return modules
      .filter((m) => m.size > 0)
      .sort((a, b) => b.size - a.size)
      .slice(0, count)
      .map((m) => ({
        name: m.name,
        size: m.size,
        formatted: this.formatBytes(m.size),
      }))
  }

  calculateSplittingEffectiveness(chunks) {
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    const largestChunk = Math.max(...chunks.map((c) => c.size))
    const effectiveness = 1 - largestChunk / totalSize
    return {
      score: effectiveness,
      rating:
        effectiveness > 0.7
          ? "Excellent"
          : effectiveness > 0.5
            ? "Good"
            : effectiveness > 0.3
              ? "Fair"
              : "Poor",
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new AdvancedPerformanceAnalyzer()

  const command = process.argv[2]

  switch (command) {
    case "full":
      analyzer.runFullAnalysis()
      break
    case "bundle":
      analyzer.analyzeBundles().then(console.log)
      break
    case "build":
      analyzer.analyzeBuildPerformance().then(console.log)
      break
    case "lighthouse":
      analyzer.runLighthouseAudit().then(console.log)
      break
    default:
      console.log(chalk.blue.bold("Advanced Performance Analyzer"))
      console.log("Usage:")
      console.log("  node performance-analysis.js full      - Run complete analysis")
      console.log("  node performance-analysis.js bundle    - Bundle analysis only")
      console.log("  node performance-analysis.js build     - Build performance only")
      console.log("  node performance-analysis.js lighthouse - Lighthouse audit only")
  }
}

export default AdvancedPerformanceAnalyzer

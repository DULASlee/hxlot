import { promises as fs } from "fs"
import path from "node:path"
import chalk from "chalk"
import { ManifestSchema, type Manifest } from "./schema"
import { DependencyResolver, ConflictDetector } from "./resolvers"
import { CodeWriter } from "./writers"

// CLI 默认根目录：smartabp.vue 项目根
const ROOT_DIR = path.resolve(__dirname, "../..")
// 业务模块目录
const MODULES_DIR = path.join(ROOT_DIR, "modules")

/**
 * 读取 modules 目录下所有 abp.module.json
 */
async function loadManifests(): Promise<Manifest[]> {
  const manifests: Manifest[] = []
  try {
    await fs.mkdir(MODULES_DIR, { recursive: true }) // 确保目录存在
    const modules = await fs.readdir(MODULES_DIR)
    for (const dir of modules) {
      const manifestPath = path.join(MODULES_DIR, dir, "abp.module.json")
      try {
        const json = await fs.readFile(manifestPath, "utf-8")
        const parsed = ManifestSchema.parse(JSON.parse(json))
        manifests.push(parsed)
      } catch (_) {
        // ignore modules without manifest
        continue
      }
    }
    return manifests
  } catch (err) {
    console.error(chalk.red("读取模块清单失败:"), err)
    return []
  }
}

/**
 * 生成代码入口
 */
async function generate() {
  console.log(chalk.blue("🚀 开始根据 Manifest 生成代码..."))
  const manifests = await loadManifests()
  if (manifests.length === 0) {
    console.log(chalk.yellow("未发现任何模块清单，跳过生成。"))
    return
  }

  // 1. 依赖排序
  const resolver = new DependencyResolver(manifests)
  const sortedManifests = resolver.topoSort()

  // 2. 冲突检测
  const detector = new ConflictDetector()
  detector.detect(sortedManifests)

  // 3. 写入代码（路由/Stores/生命周期/策略）
  const writer = new CodeWriter(ROOT_DIR)
  await Promise.all([
    writer.writeRoutes(sortedManifests),
    writer.writeStores(sortedManifests),
    writer.writeLifecycles(sortedManifests),
    writer.writePolicies(sortedManifests),
    writer.writeMenus(sortedManifests),
  ])

  console.log(chalk.green(`✅ 代码生成完成，处理模块数量: ${sortedManifests.length}`))
}

// ---------------- CLI ------------------
// 支持命令：generate(默认) / check
const cmd = process.argv[2] ?? "generate"

switch (cmd) {
  case "generate":
    generate().catch((err) => {
      console.error(chalk.red("生成失败:"), err)
      process.exit(1)
    })
    break
  case "check":
    loadManifests()
      .then((manifests) => {
        const detector = new ConflictDetector()
        detector.detect(manifests)
        console.log(chalk.green("✓ 没有检测到冲突"))
      })
      .catch((err) => {
        console.error(chalk.red("检查失败:"), err)
        process.exit(1)
      })
    break
  default:
    console.log("用法: node cli.js [generate|check]")
    break
}

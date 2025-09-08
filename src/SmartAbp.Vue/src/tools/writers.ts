import { promises as fs } from 'fs'
import path from 'node:path'
import type { Manifest } from './schema'

/**
 * CodeWriter
 * 当前仅实现 writeRoutes —— 根据 manifests 生成 routes.generated.ts
 */
export class CodeWriter {
  constructor(private readonly rootDir: string) {}

  async writeRoutes(manifests: Manifest[]): Promise<void> {
    const routeLines: string[] = []

    manifests.forEach((m) => {
      m.routes.forEach((r) => {
        routeLines.push(`  { name: '${r.name}', path: '${r.path}', component: () => import('${r.component}'), meta: ${JSON.stringify(r.meta || {})} }`)
      })
    })

    const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

import type { RouteRecordRaw } from 'vue-router'

export const generatedRoutes: RouteRecordRaw[] = [
${routeLines.join(',\n')}
]
`

    await this.writeFile('src/appshell/router/routes.generated.ts', content)
  }

  private async writeFile(relPath: string, content: string) {
    const fullPath = path.join(this.rootDir, relPath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, content, 'utf-8')
  }
}

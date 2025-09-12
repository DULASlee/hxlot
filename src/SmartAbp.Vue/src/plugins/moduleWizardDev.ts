import type { Plugin } from "vite"
import path from "node:path"
import { promises as fs } from "node:fs"
import { spawn } from "node:child_process"
import axios from "axios"
import { ManifestSchema } from "../tools/schema"

function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = ""
    req.on("data", (chunk: any) => (data += chunk))
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"))
      } catch (e) {
        reject(e)
      }
    })
    req.on("error", reject)
  })
}

async function runCodegen(rootDir: string) {
  await new Promise<void>((resolve, reject) => {
    const cmd = process.platform === "win32" ? "npm.cmd" : "npm"
    const p = spawn(cmd, ["run", "codegen"], { cwd: rootDir, stdio: "inherit" })
    p.on("close", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`codegen 失败 (exit ${code})`))
    })
  })
}

function deriveFieldsFromSchema(
  schema: any,
): Array<{ name: string; label: string; type: string; required: boolean }> {
  if (!schema || typeof schema !== "object") return []
  const requiredSet = new Set<string>(schema.required || [])
  const props = schema.properties || {}
  return Object.keys(props).map((key) => {
    const prop = props[key]
    const type = (prop && (prop.type || (prop.format ? "string" : "string"))) || "string"
    return { name: key, label: key, type, required: requiredSet.has(key) }
  })
}

async function resolveEntitySchema(swagger: any, entity: string) {
  const comp = swagger?.components?.schemas || {}
  const candidates = [entity, `${entity}Dto`, `${entity}Output`, `${entity}View`]
  for (const name of candidates) {
    if (comp[name]) return comp[name]
  }
  return null
}

async function writeScaffold(
  rootDir: string,
  manifest: any,
  fields: Array<{ name: string; label: string; type: string; required: boolean }>,
) {
  const moduleName: string = manifest.name
  const moduleLower = moduleName.toLowerCase()
  const viewsDir = path.join(rootDir, "src", "views", moduleLower)
  const storesDir = path.join(rootDir, "src", "stores", "modules")
  await fs.mkdir(viewsDir, { recursive: true })
  await fs.mkdir(storesDir, { recursive: true })

  const searchInputs = fields
    .slice(0, 3)
    .map(
      (f) =>
        `      <el-form-item label="${f.label}"><el-input v-model="query.${f.name}" placeholder="请输入${f.label}" /></el-form-item>`,
    )
    .join("\n")
  const tableCols = fields
    .slice(0, 6)
    .map((f) => `      <el-table-column prop="${f.name}" label="${f.label}" />`)
    .join("\n")
  const formItems = fields
    .slice(0, 6)
    .map(
      (f) =>
        `      <el-form-item label="${f.label}"><el-input v-model="form.${f.name}" placeholder="请输入${f.label}" /></el-form-item>`,
    )
    .join("\n")

  const listView = `<template>
  <div class="${moduleLower}-list" data-block-id="${moduleLower}-list-root">
    <!-- BLOCK:ListRoot id="${moduleLower}-list-root" -->
    <h2>${manifest.displayName || moduleName}列表</h2>
    <el-form :inline="true" :model="query" class="query-bar" data-node-id="${moduleLower}-query-bar">
${searchInputs}
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="items" style="width:100%" :loading="loading" data-node-id="${moduleLower}-table">
${tableCols}
    </el-table>
    <div style="margin-top:12px; display:flex; justify-content:flex-end;" data-node-id="${moduleLower}-pager">
      <el-pagination
        v-model:current-page="pageIndex"
        v-model:page-size="pageSize"
        :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="onSearch"
        @current-change="onSearch"
      />
    </div>
    <!-- /BLOCK:ListRoot -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { use${moduleName}Store } from '@/stores/modules/${moduleLower}'
const store = use${moduleName}Store()
const items = store.items
const loading = store.loading
const total = store.total
const pageIndex = store.pageIndex
const pageSize = store.pageSize
const query = reactive<Record<string, any>>({})

const onSearch = () => store.fetchList({ pageIndex: pageIndex.value, pageSize: pageSize.value, query })
const onReset = () => { Object.keys(query).forEach(k => delete (query as any)[k]); pageIndex.value = 1; onSearch() }

onMounted(() => { onSearch() })
</script>
`

  const managementView = `<template>
  <div class="${moduleLower}-mgmt" data-block-id="${moduleLower}-mgmt-root">
    <!-- BLOCK:FormRoot id="${moduleLower}-mgmt-root" -->
    <h2>${manifest.displayName || moduleName}管理</h2>
    <el-form :model="form" label-width="120px" style="max-width:720px" data-node-id="${moduleLower}-form">
${formItems}
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
    <!-- /BLOCK:FormRoot -->
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { use${moduleName}Store } from '@/stores/modules/${moduleLower}'
const store = use${moduleName}Store()
const form = reactive<Record<string, any>>({})
const onSubmit = () => store.createOrUpdate(form)
const onCancel = () => { Object.keys(form).forEach(k => delete (form as any)[k]) }
</script>
`

  const storeTs = `import { defineStore } from 'pinia'
import { ref } from 'vue'

export const use${moduleName}Store = defineStore('${moduleLower}', () => {
  const items = ref<any[]>([])
  const loading = ref(false)
  const total = ref(0)
  const pageIndex = ref(1)
  const pageSize = ref(10)

  async function fetchList(params?: { pageIndex?: number; pageSize?: number; query?: Record<string, any> }) {
    loading.value = true
    try {
      const pi = params?.pageIndex ?? pageIndex.value
      const ps = params?.pageSize ?? pageSize.value
      pageIndex.value = pi
      pageSize.value = ps
      // P0占位：使用静态数据，P1接入OpenAPI客户端
      const start = (pi - 1) * ps
      const data = Array.from({ length: ps }, (_, i) => ({ id: start + i + 1 }))
      items.value = data
      total.value = 100
    } finally {
      loading.value = false
    }
  }

  async function createOrUpdate(payload: any) {
    // P0占位：直接模拟成功
    return Promise.resolve({ ok: true, data: payload })
  }

  async function remove(id: string | number) {
    // P0占位：直接模拟成功
    return Promise.resolve({ ok: true, id })
  }

  return { items, loading, total, pageIndex, pageSize, fetchList, createOrUpdate, remove }
})
`

  await fs.writeFile(path.join(viewsDir, `${moduleName}ListView.vue`), listView, "utf-8")
  await fs.writeFile(path.join(viewsDir, `${moduleName}Management.vue`), managementView, "utf-8")
  await fs.writeFile(path.join(storesDir, `${moduleLower}.ts`), storeTs, "utf-8")
}

export function moduleWizardDevPlugin(): Plugin {
  return {
    name: "module-wizard-dev",
    apply: "serve",
    configureServer(server) {
      const rootDir = server.config.root

      server.middlewares.use("/__module-wizard/openapi/fields", async (req, res) => {
        const urlObj = new URL(req.url || "", "http://localhost")
        const swaggerUrl = urlObj.searchParams.get("url") || ""
        const entity = urlObj.searchParams.get("entity") || ""
        try {
          const { data } = await axios.get(swaggerUrl)
          const schema = await resolveEntitySchema(data, entity)
          const fields = deriveFieldsFromSchema(schema)
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ ok: true, fields }))
        } catch (e: any) {
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, message: e?.message || "解析失败" }))
        }
      })

      server.middlewares.use("/__module-wizard/add", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405
          return res.end("Method Not Allowed")
        }
        try {
          const body = await readJsonBody(req)
          const manifest = ManifestSchema.parse(body?.manifest || body)
          const modulesDir = path.join(rootDir, "modules", manifest.name)
          await fs.mkdir(modulesDir, { recursive: true })
          const manifestPath = path.join(modulesDir, "abp.module.json")
          await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8")

          // 生成基础页面与Store占位
          const fields = Array.isArray(body?.fields) ? body.fields : []
          await writeScaffold(rootDir, manifest, fields)

          // 触发代码聚合
          await runCodegen(rootDir)

          const routes = Array.isArray(manifest.routes)
            ? manifest.routes.map((r: any) => r.path)
            : []
          const menuKeys = Array.isArray(manifest.routes)
            ? manifest.routes.map((r: any) => r.meta?.menuKey).filter(Boolean)
            : []

          res.setHeader("Content-Type", "application/json")
          res.end(
            JSON.stringify({
              ok: true,
              manifest: `modules/${manifest.name}/abp.module.json`,
              routes,
              menuKeys,
            }),
          )
        } catch (e: any) {
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, message: e?.message || "生成失败" }))
        }
      })
    },
  }
}

export default moduleWizardDevPlugin

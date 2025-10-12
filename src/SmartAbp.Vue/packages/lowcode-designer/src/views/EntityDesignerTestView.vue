<template>
  <div class="entity-designer-test-view">
    <el-card
      class="header-card"
      shadow="never"
    >
      <template #header>
        <div class="card-header">
          <h2>EntityDesigner 组件测试</h2>
          <el-button-group>
            <el-button
              type="primary"
              icon="el-icon-refresh"
              @click="handleReset"
            >
              重置
            </el-button>
            <el-button
              type="success"
              icon="el-icon-view"
              @click="handlePreview"
            >
              预览数据
            </el-button>
            <el-button
              type="warning"
              icon="el-icon-download"
              @click="handleExport"
            >
              导出JSON
            </el-button>
          </el-button-group>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template #title>
          测试说明
        </template>
        <ul style="margin: 0; padding-left: 20px;">
          <li>使用EntityDesigner设计实体结构</li>
          <li>添加字段和关系</li>
          <li>配置验证规则</li>
          <li>实时预览生成的数据结构</li>
        </ul>
      </el-alert>
    </el-card>

    <!-- EntityDesigner 组件 -->
    <el-card
      class="designer-card"
      shadow="never"
    >
      <ld-entity-designer
        v-model="entityData"
        :readonly="false"
      />
    </el-card>

    <!-- 数据预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="实体数据预览"
      width="70%"
      :fullscreen="isFullscreen"
    >
      <template #header>
        <div class="dialog-header">
          <span>实体数据预览 - {{ entityData?.displayName || '未命名' }}</span>
          <el-button
            text
            :icon="isFullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'"
            @click="isFullscreen = !isFullscreen"
          />
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="JSON格式"
          name="json"
        >
          <pre class="json-preview"><code>{{ formattedEntityData }}</code></pre>
        </el-tab-pane>

        <el-tab-pane
          label="实体信息"
          name="info"
        >
          <el-descriptions
            :column="2"
            border
          >
            <el-descriptions-item label="实体名称">
              {{ entityData?.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="显示名称">
              {{ entityData?.displayName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="表名">
              {{ entityData?.tableName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="描述">
              {{ entityData?.description || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="启用审计">
              <el-tag :type="entityData?.isAuditEnabled ? 'success' : 'info'">
                {{ entityData?.isAuditEnabled ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="软删除">
              <el-tag :type="entityData?.isSoftDelete ? 'success' : 'info'">
                {{ entityData?.isSoftDelete ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="多租户">
              <el-tag :type="entityData?.isMultiTenant ? 'success' : 'info'">
                {{ entityData?.isMultiTenant ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="字段数量">
              {{ entityData?.fields?.length || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="关系数量">
              {{ entityData?.relations?.length || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane
          label="字段列表"
          name="fields"
        >
          <el-table
            :data="entityData?.fields"
            border
          >
            <el-table-column
              prop="name"
              label="字段名"
            />
            <el-table-column
              prop="displayName"
              label="显示名称"
            />
            <el-table-column
              prop="type"
              label="类型"
            />
            <el-table-column
              label="必填"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.isRequired ? 'danger' : 'info'"
                  size="small"
                >
                  {{ row.isRequired ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="唯一"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.isUnique ? 'warning' : 'info'"
                  size="small"
                >
                  {{ row.isUnique ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="索引"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.isIndexed ? 'success' : 'info'"
                  size="small"
                >
                  {{ row.isIndexed ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="验证规则"
              align="center"
            >
              <template #default="{ row }">
                {{ row.validationRules?.length || 0 }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane
          label="关系列表"
          name="relations"
        >
          <el-table
            :data="entityData?.relations"
            border
          >
            <el-table-column
              prop="name"
              label="关系名"
            />
            <el-table-column
              prop="type"
              label="类型"
            />
            <el-table-column
              prop="targetEntity"
              label="目标实体"
            />
            <el-table-column
              label="级联删除"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.cascadeDelete ? 'danger' : 'info'"
                  size="small"
                >
                  {{ row.cascadeDelete ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="previewDialogVisible = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="handleCopyJson"
        >
          复制JSON
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
// @ts-expect-error: 组件通过ComponentRegistry全局注册，运行时可用
import { LdEntityDesigner } from './components'
// @ts-expect-error: 类型定义在运行时通过类型扩展可用
import type { EntityDefinition } from '@smartabp/lowcode-designer/types'

// 状态
const entityData = ref<EntityDefinition>({
  id: '',
  name: '',
  displayName: '',
  fields: [],
  relations: [],
  isAuditEnabled: true,
  isSoftDelete: true,
  isMultiTenant: false
})

const previewDialogVisible = ref(false)
const isFullscreen = ref(false)
const activeTab = ref('json')

// 格式化的实体数据
const formattedEntityData = computed(() => {
  return JSON.stringify(entityData.value, null, 2)
})

// 重置
const handleReset = () => {
  entityData.value = {
    id: '',
    name: '',
    displayName: '',
    fields: [],
    relations: [],
    isAuditEnabled: true,
    isSoftDelete: true,
    isMultiTenant: false
  }
  ElMessage.success('已重置')
}

// 预览
const handlePreview = () => {
  if (!entityData.value.name) {
    ElMessage.warning('请先设置实体名称')
    return
  }
  previewDialogVisible.value = true
}

// 导出JSON
const handleExport = () => {
  if (!entityData.value.name) {
    ElMessage.warning('请先设置实体名称')
    return
  }

  const dataStr = JSON.stringify(entityData.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${entityData.value.name}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 复制JSON
const handleCopyJson = async () => {
  try {
    await navigator.clipboard.writeText(formattedEntityData.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.entity-designer-test-view {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .header-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .designer-card {
    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .json-preview {
    margin: 0;
    padding: 16px;
    background: #282c34;
    color: #abb2bf;
    border-radius: 4px;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
    line-height: 1.6;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}
</style>


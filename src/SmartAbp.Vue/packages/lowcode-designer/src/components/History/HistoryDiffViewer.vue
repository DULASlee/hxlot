<!--
  代码生成历史版本对比组件
  @description 可视化展示两个历史版本之间的差异
  @version 1.0.0
  @author AI首席架构师
  @since Phase 3 - Task 3.2.2
-->

<template>
  <div class="history-diff-viewer">
    <!-- 头部：版本选择器 -->
    <div class="diff-header">
      <div class="version-selector">
        <div class="version-item left">
          <el-icon><DocumentRemove /></el-icon>
          <span class="label">{{ t('history.leftVersion') }}</span>
          <el-select
            v-model="leftVersionId"
            :placeholder="t('history.selectVersion')"
            filterable
            @change="handleLeftVersionChange"
          >
            <el-option
              v-for="history in availableHistories"
              :key="history.id"
              :label="formatVersionLabel(history)"
              :value="history.id"
              :disabled="history.id === rightVersionId"
            >
              <div class="version-option">
                <span class="version-name">{{ history.entityName }}</span>
                <span class="version-date">{{ formatDate(history.generatedAt) }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <el-button 
          type="primary" 
          :icon="RefreshLeft" 
          circle 
          size="small"
          @click="swapVersions"
          :disabled="!leftVersionId || !rightVersionId"
        />

        <div class="version-item right">
          <el-icon><DocumentAdd /></el-icon>
          <span class="label">{{ t('history.rightVersion') }}</span>
          <el-select
            v-model="rightVersionId"
            :placeholder="t('history.selectVersion')"
            filterable
            @change="handleRightVersionChange"
          >
            <el-option
              v-for="history in availableHistories"
              :key="history.id"
              :label="formatVersionLabel(history)"
              :value="history.id"
              :disabled="history.id === leftVersionId"
            >
              <div class="version-option">
                <span class="version-name">{{ history.entityName }}</span>
                <span class="version-date">{{ formatDate(history.generatedAt) }}</span>
              </div>
            </el-option>
          </el-select>
        </div>
      </div>

      <div class="diff-actions">
        <el-button 
          type="primary" 
          :icon="View" 
          @click="handleCompare"
          :loading="loading"
          :disabled="!leftVersionId || !rightVersionId || leftVersionId === rightVersionId"
        >
          {{ t('history.compare') }}
        </el-button>
        <el-button 
          type="success" 
          :icon="RefreshLeft" 
          @click="handleRevert"
          :disabled="!comparisonResult || loading"
        >
          {{ t('history.revertToLeft') }}
        </el-button>
        <el-button 
          :icon="Download" 
          @click="handleExportDiff"
          :disabled="!comparisonResult"
        >
          {{ t('history.exportDiff') }}
        </el-button>
      </div>
    </div>

    <!-- 对比结果统计 -->
    <div v-if="comparisonResult" class="diff-statistics">
      <el-card shadow="never">
        <div class="statistics-content">
          <div class="stat-item added">
            <el-icon><Plus /></el-icon>
            <span class="count">{{ addedCount }}</span>
            <span class="label">{{ t('history.added') }}</span>
          </div>
          <div class="stat-item modified">
            <el-icon><Edit /></el-icon>
            <span class="count">{{ modifiedCount }}</span>
            <span class="label">{{ t('history.modified') }}</span>
          </div>
          <div class="stat-item deleted">
            <el-icon><Minus /></el-icon>
            <span class="count">{{ deletedCount }}</span>
            <span class="label">{{ t('history.deleted') }}</span>
          </div>
          <div class="stat-item total">
            <el-icon><Files /></el-icon>
            <span class="count">{{ totalChanges }}</span>
            <span class="label">{{ t('history.totalChanges') }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 变更详情视图 -->
    <div v-if="comparisonResult" class="diff-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 文件变更列表 -->
        <el-tab-pane :label="t('history.fileChanges')" name="files">
          <div class="file-changes-list">
            <el-tree
              :data="fileChangesTree"
              :props="treeProps"
              node-key="path"
              default-expand-all
              :expand-on-click-node="false"
            >
              <template #default="{ node, data }">
                <div class="tree-node-content">
                  <el-icon v-if="data.type === 'added'" class="change-icon added">
                    <Plus />
                  </el-icon>
                  <el-icon v-else-if="data.type === 'modified'" class="change-icon modified">
                    <Edit />
                  </el-icon>
                  <el-icon v-else-if="data.type === 'deleted'" class="change-icon deleted">
                    <Minus />
                  </el-icon>
                  <el-icon v-else class="change-icon">
                    <Folder />
                  </el-icon>
                  <span class="node-label">{{ node.label }}</span>
                  <el-button
                    v-if="data.type && data.type !== 'folder'"
                    text
                    type="primary"
                    size="small"
                    @click="viewFileDiff(data)"
                  >
                    {{ t('history.viewDetails') }}
                  </el-button>
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>

        <!-- 代码差异视图 -->
        <el-tab-pane :label="t('history.codeDiff')" name="code">
          <div class="code-diff-viewer">
            <div v-if="selectedFileDiff" class="diff-container">
              <div class="diff-header-info">
                <span class="file-path">{{ selectedFileDiff.path }}</span>
                <el-tag :type="getChangeTypeTag(selectedFileDiff.type)">
                  {{ t(`history.changeType.${selectedFileDiff.type}`) }}
                </el-tag>
              </div>
              <div class="diff-content-view">
                <pre class="diff-code">{{ selectedFileDiff.diff }}</pre>
              </div>
            </div>
            <el-empty 
              v-else 
              :description="t('history.selectFileToView')"
            />
          </div>
        </el-tab-pane>

        <!-- 变更日志 -->
        <el-tab-pane :label="t('history.changelog')" name="changelog">
          <div class="changelog-view">
            <el-card v-for="change in comparisonResult.fileChanges" :key="change.filePath" class="change-card">
              <template #header>
                <div class="change-header">
                  <el-icon v-if="change.changeType === 'created'" class="change-icon added">
                    <Plus />
                  </el-icon>
                  <el-icon v-else-if="change.changeType === 'modified'" class="change-icon modified">
                    <Edit />
                  </el-icon>
                  <el-icon v-else-if="change.changeType === 'deleted'" class="change-icon deleted">
                    <Minus />
                  </el-icon>
                  <span class="change-path">{{ change.filePath }}</span>
                  <el-tag :type="getChangeTypeTag(change.changeType)">
                    {{ t(`history.changeType.${change.changeType}`) }}
                  </el-tag>
                </div>
              </template>
              <div class="change-summary">
                <div v-if="change.leftContent" class="change-stat added">
                  <el-icon><Plus /></el-icon>
                  <span>{{ t('history.linesAdded') }}</span>
                </div>
                <div v-if="change.rightContent" class="change-stat deleted">
                  <el-icon><Minus /></el-icon>
                  <span>{{ t('history.linesDeleted') }}</span>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 元数据变更 -->
        <el-tab-pane :label="t('history.metadataChanges')" name="metadata">
          <div class="metadata-diff">
            <el-descriptions :column="2" border>
              <el-descriptions-item :label="t('history.leftVersion')">
                <div class="version-info">
                  <p><strong>{{ t('history.name') }}:</strong> {{ leftVersion?.entityName }}</p>
                  <p><strong>{{ t('history.generatedAt') }}:</strong> {{ formatDate(leftVersion?.generatedAt) }}</p>
                  <p><strong>{{ t('history.generatedBy') }}:</strong> {{ leftVersion?.generatedBy }}</p>
                </div>
              </el-descriptions-item>
              <el-descriptions-item :label="t('history.rightVersion')">
                <div class="version-info">
                  <p><strong>{{ t('history.name') }}:</strong> {{ rightVersion?.entityName }}</p>
                  <p><strong>{{ t('history.generatedAt') }}:</strong> {{ formatDate(rightVersion?.generatedAt) }}</p>
                  <p><strong>{{ t('history.generatedBy') }}:</strong> {{ rightVersion?.generatedBy }}</p>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-else
      :description="t('history.selectVersionsToCompare')"
      :image-size="200"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DocumentRemove,
  DocumentAdd,
  RefreshLeft,
  View,
  Download,
  Plus,
  Edit,
  Minus,
  Files,
  Folder
} from '@element-plus/icons-vue'
import { useGenerationHistoryStore } from '../../stores/generation-history'
import type { GenerationHistory, HistoryComparisonResult } from '@smartabp/lowcode-shared'

const { t } = useI18n()
const historyStore = useGenerationHistoryStore()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props {
  entityId?: string
  moduleName?: string
  preSelectedLeft?: string
  preSelectedRight?: string
}

const props = withDefaults(defineProps<Props>(), {
  entityId: '',
  moduleName: '',
  preSelectedLeft: '',
  preSelectedRight: ''
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const leftVersionId = ref<string>(props.preSelectedLeft)
const rightVersionId = ref<string>(props.preSelectedRight)
const activeTab = ref('files')
const selectedFileDiff = ref<any>(null)

const loading = computed(() => historyStore.loading)
const comparisonResult = computed(() => historyStore.comparisonResult)
const availableHistories = computed(() => historyStore.histories)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Computed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const leftVersion = computed(() => 
  availableHistories.value.find(h => h.id === leftVersionId.value)
)

const rightVersion = computed(() => 
  availableHistories.value.find(h => h.id === rightVersionId.value)
)

const fileChangesTree = computed(() => {
  if (!comparisonResult.value) return []
  return buildFileTree(comparisonResult.value.fileChanges)
})

const addedCount = computed(() => {
  if (!comparisonResult.value) return 0
  return comparisonResult.value.fileChanges.filter(f => f.changeType === 'created').length
})

const modifiedCount = computed(() => {
  if (!comparisonResult.value) return 0
  return comparisonResult.value.fileChanges.filter(f => f.changeType === 'modified').length
})

const deletedCount = computed(() => {
  if (!comparisonResult.value) return 0
  return comparisonResult.value.fileChanges.filter(f => f.changeType === 'deleted').length
})

const totalChanges = computed(() => {
  return addedCount.value + modifiedCount.value + deletedCount.value
})

const treeProps = {
  children: 'children',
  label: 'name'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 格式化版本标签
 */
function formatVersionLabel(history: GenerationHistory): string {
  return `${history.entityName} (${formatDate(history.generatedAt)})`
}

/**
 * 格式化日期
 */
function formatDate(date: string | Date | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取变更类型标签
 */
function getChangeTypeTag(type: string): 'success' | 'warning' | 'danger' {
  switch (type) {
    case 'added':
      return 'success'
    case 'modified':
      return 'warning'
    case 'deleted':
      return 'danger'
    default:
      return 'info' as any
  }
}

/**
 * 构建文件变更树
 */
function buildFileTree(changes: any[]): any[] {
  const tree: any[] = []
  const pathMap = new Map<string, any>()

  changes.forEach(change => {
    const parts = change.filePath.split('/')
    let currentPath = ''
    let parentNode: any = null

    parts.forEach((part: string, index: number) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      
      if (!pathMap.has(currentPath)) {
        const node: any = {
          name: part,
          path: currentPath,
          children: []
        }

        if (index === parts.length - 1) {
          // 叶子节点（文件）
          node.type = change.changeType
          node.leftContent = change.leftContent
          node.rightContent = change.rightContent
          node.diff = change.diff
        } else {
          // 目录节点
          node.type = 'folder'
        }

        if (parentNode) {
          parentNode.children.push(node)
        } else {
          tree.push(node)
        }

        pathMap.set(currentPath, node)
      }

      parentNode = pathMap.get(currentPath)
    })
  })

  return tree
}

/**
 * 交换左右版本
 */
function swapVersions(): void {
  const temp = leftVersionId.value
  leftVersionId.value = rightVersionId.value
  rightVersionId.value = temp
  
  if (leftVersionId.value && rightVersionId.value) {
    handleCompare()
  }
}

/**
 * 处理左版本变更
 */
function handleLeftVersionChange(): void {
  if (rightVersionId.value && leftVersionId.value !== rightVersionId.value) {
    handleCompare()
  }
}

/**
 * 处理右版本变更
 */
function handleRightVersionChange(): void {
  if (leftVersionId.value && leftVersionId.value !== rightVersionId.value) {
    handleCompare()
  }
}

/**
 * 执行对比
 */
async function handleCompare(): Promise<void> {
  if (!leftVersionId.value || !rightVersionId.value) {
    ElMessage.warning(t('history.selectTwoVersions'))
    return
  }

  if (leftVersionId.value === rightVersionId.value) {
    ElMessage.warning(t('history.cannotCompareSameVersion'))
    return
  }

  await historyStore.compareHistories(leftVersionId.value, rightVersionId.value)
}

/**
 * 查看文件差异
 */
function viewFileDiff(fileNode: any): void {
  selectedFileDiff.value = fileNode
  activeTab.value = 'code'
}

/**
 * 处理回滚
 */
async function handleRevert(): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('history.revertConfirmMessage', { name: leftVersion.value?.entityName }),
      t('history.revertConfirm'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    const result = await historyStore.revertToHistory(leftVersionId.value, {
      createBackup: true,
      force: false,
      recompile: true
    })

    if (result?.success) {
      ElMessage.success(t('history.revertSuccess'))
    }
  } catch (err: any) {
    if (err !== 'cancel') {
      console.error('Revert failed:', err)
    }
  }
}

/**
 * 导出差异报告
 */
function handleExportDiff(): void {
  if (!comparisonResult.value) return

  const diffReport = generateDiffReport(comparisonResult.value)
  const blob = new Blob([diffReport], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `diff-report-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success(t('history.exportSuccess'))
}

/**
 * 生成差异报告
 */
function generateDiffReport(result: HistoryComparisonResult): string {
  let report = `# ${t('history.diffReport')}\n\n`
  report += `## ${t('history.summary')}\n\n`
  report += `- ${t('history.leftVersion')}: ${leftVersion.value?.entityName}\n`
  report += `- ${t('history.rightVersion')}: ${rightVersion.value?.entityName}\n`
  report += `- ${t('history.added')}: ${addedCount.value}\n`
  report += `- ${t('history.modified')}: ${modifiedCount.value}\n`
  report += `- ${t('history.deleted')}: ${deletedCount.value}\n`
  report += `- ${t('history.totalChanges')}: ${totalChanges.value}\n\n`
  
  report += `## ${t('history.changeDetails')}\n\n`
  result.fileChanges.forEach(change => {
    report += `### ${change.filePath}\n\n`
    report += `**${t('history.changeType')}**: ${t(`history.changeType.${change.changeType}`)}\n\n`
    if (change.leftContent) {
      report += `- ${t('history.linesAdded')}\n`
    }
    if (change.rightContent) {
      report += `- ${t('history.linesDeleted')}\n`
    }
    if (change.diff) {
      report += `\n\`\`\`diff\n${change.diff}\n\`\`\`\n\n`
    }
  })

  return report
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lifecycle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 加载历史记录
watch(() => props.entityId, async (newEntityId) => {
  if (newEntityId) {
    await historyStore.loadHistoriesByEntity(newEntityId)
  }
}, { immediate: true })

watch(() => props.moduleName, async (newModuleName) => {
  if (newModuleName) {
    await historyStore.loadHistoriesByModule(newModuleName)
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.history-diff-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .diff-header {
    .version-selector {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;

      .version-item {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;

        .label {
          font-weight: 500;
          white-space: nowrap;
        }

        .el-select {
          flex: 1;
        }

        .version-option {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .version-name {
            font-weight: 500;
          }

          .version-date {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }

    .diff-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  }

  .diff-statistics {
    .statistics-content {
      display: flex;
      gap: 24px;
      justify-content: space-around;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .el-icon {
          font-size: 24px;
        }

        .count {
          font-size: 28px;
          font-weight: 600;
        }

        .label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }

        &.added {
          .el-icon,
          .count {
            color: var(--el-color-success);
          }
        }

        &.modified {
          .el-icon,
          .count {
            color: var(--el-color-warning);
          }
        }

        &.deleted {
          .el-icon,
          .count {
            color: var(--el-color-danger);
          }
        }

        &.total {
          .el-icon,
          .count {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .diff-content {
    flex: 1;
    overflow: hidden;

    :deep(.el-tabs__content) {
      height: calc(100% - 55px);
      overflow: auto;
    }

    .file-changes-list {
      .tree-node-content {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;

        .change-icon {
          &.added {
            color: var(--el-color-success);
          }

          &.modified {
            color: var(--el-color-warning);
          }

          &.deleted {
            color: var(--el-color-danger);
          }
        }

        .node-label {
          flex: 1;
        }
      }
    }

    .code-diff-viewer {
      height: 100%;

      .diff-container {
        height: 100%;
        display: flex;
        flex-direction: column;

        .diff-header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: var(--el-fill-color-light);
          border-radius: 4px;
          margin-bottom: 16px;

          .file-path {
            font-family: monospace;
            font-weight: 500;
          }
        }

        .diff-content-view {
          flex: 1;
          overflow: auto;
          background-color: var(--el-fill-color-blank);
          border-radius: 4px;
          padding: 16px;

          .diff-code {
            margin: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        }
      }
    }

    .changelog-view {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .change-card {
        .change-header {
          display: flex;
          align-items: center;
          gap: 8px;

          .change-icon {
            &.added {
              color: var(--el-color-success);
            }

            &.modified {
              color: var(--el-color-warning);
            }

            &.deleted {
              color: var(--el-color-danger);
            }
          }

          .change-path {
            flex: 1;
            font-family: monospace;
          }
        }

        .change-summary {
          display: flex;
          gap: 24px;

          .change-stat {
            display: flex;
            align-items: center;
            gap: 4px;

            &.added {
              color: var(--el-color-success);
            }

            &.deleted {
              color: var(--el-color-danger);
            }
          }
        }
      }
    }

    .metadata-diff {
      .version-info {
        p {
          margin: 4px 0;

          strong {
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>


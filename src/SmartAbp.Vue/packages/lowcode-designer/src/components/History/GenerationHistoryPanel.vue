<template>
    <div class="generation-history-panel">
        <!-- 顶部工具栏 -->
        <div class="panel-header">
            <div class="header-left">
                <h3>{{ t('history.title') }}</h3>
                <el-tag type="info">
                    {{ t('history.total', { count: totalCount }) }}
                </el-tag>
            </div>

            <div class="header-actions">
                <el-button type="primary" :icon="Refresh" size="default" :loading="loading" @click="handleRefresh">
                    {{ t('common.refresh') }}
                </el-button>
                <el-button type="warning" :icon="Delete" size="default" :disabled="selectedHistories.length === 0"
                    @click="handleBatchDelete">
                    {{ t('history.deleteSelected') }}
                </el-button>
                <el-button type="info" :icon="Download" size="default" :disabled="selectedHistories.length === 0"
                    @click="handleExport">
                    {{ t('history.export') }}
                </el-button>
                <el-button type="default" :icon="Setting" size="default" @click="settingsVisible = true">
                    {{ t('common.settings') }}
                </el-button>
            </div>
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
            <el-input v-model="filterForm.keyword" :placeholder="t('history.searchPlaceholder')" :prefix-icon="Search"
                size="default" clearable style="width: 250px" @input="handleFilterChange" />

            <el-select v-model="filterForm.generationType" :placeholder="t('history.allTypes')" size="default" clearable
                style="width: 150px" @change="handleFilterChange">
                <el-option v-for="type in generationTypes" :key="type.value" :label="t(type.label)" :value="type.value" />
            </el-select>

            <el-select v-model="filterForm.status" :placeholder="t('history.allStatuses')" size="default" clearable
                style="width: 130px" @change="handleFilterChange">
                <el-option v-for="status in statuses" :key="status.value" :label="t(status.label)" :value="status.value" />
            </el-select>

            <el-date-picker v-model="dateRange" type="daterange" size="default" :start-placeholder="t('history.startDate')"
                :end-placeholder="t('history.endDate')" style="width: 250px" @change="handleDateRangeChange" />

            <el-input-number v-model="filterForm.minQualityScore" :placeholder="t('history.minQuality')" size="default"
                :min="0" :max="100" :step="5" controls-position="right" style="width: 150px" @change="handleFilterChange" />

            <el-button type="default" :icon="RefreshLeft" size="default" @click="handleResetFilter">
                {{ t('common.reset') }}
            </el-button>
        </div>

        <!-- 历史记录列表 -->
        <div class="history-table">
            <el-table v-loading="loading" :data="histories" @selection-change="handleSelectionChange" border stripe
                height="calc(100vh - 350px)">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="entityName" :label="t('history.entityName')" min-width="150" fixed="left" />
                <el-table-column :label="t('history.generationType')" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getTypeTagColor(row.generationType)" size="small">
                            {{ getTypeLabel(row.generationType) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column :label="t('history.status')" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusTagColor(row.status)" size="small">
                            {{ t(`history.status.${row.status}`) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="moduleName" :label="t('history.moduleName')" min-width="120" />
                <el-table-column :label="t('history.filesCount')" width="100">
                    <template #default="{ row }">
                        {{ row.generatedFiles.length }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('history.quality')" width="100">
                    <template #default="{ row }">
                        <el-progress v-if="row.qualityMetrics" :percentage="row.qualityMetrics.overallScore" :width="50"
                            type="circle" :stroke-width="4" :show-text="false" />
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column :label="t('history.duration')" width="100">
                    <template #default="{ row }">
                        {{ row.duration }}ms
                    </template>
                </el-table-column>
                <el-table-column :label="t('history.generatedBy')" width="120">
                    <template #default="{ row }">
                        {{ row.generatedBy }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('history.generatedAt')" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.generatedAt) }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('history.actions')" width="250" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" :icon="View" @click="handleViewDetails(row)">
                            {{ t('common.view') }}
                        </el-button>
                        <el-button v-if="!row.isReverted" type="warning" size="small" :icon="RefreshLeft"
                            @click="handleRevert(row)">
                            {{ t('history.revert') }}
                        </el-button>
                        <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
                            {{ t('common.delete') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[20, 50, 100, 200]"
                :total="totalCount" layout="total, sizes, prev, pager, next, jumper" @size-change="handlePageSizeChange"
                @current-change="handleCurrentPageChange" />
        </div>

        <!-- 详情抽屉 -->
        <el-drawer v-model="detailsVisible" :title="t('history.details')" size="70%">
            <div v-if="currentHistory" class="history-details">
                <!-- 基本信息 -->
                <el-descriptions :column="2" border>
                    <el-descriptions-item :label="t('history.entityName')">
                        {{ currentHistory.entityName }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('history.generationType')">
                        <el-tag :type="getTypeTagColor(currentHistory.generationType)">
                            {{ getTypeLabel(currentHistory.generationType) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('history.status')">
                        <el-tag :type="getStatusTagColor(currentHistory.status)">
                            {{ t(`history.status.${currentHistory.status}`) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('history.moduleName')">
                        {{ currentHistory.moduleName || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('history.duration')">
                        {{ currentHistory.duration }}ms
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('history.generatedBy')">
                        {{ currentHistory.generatedBy }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('history.generatedAt')" :span="2">
                        {{ formatDate(currentHistory.generatedAt) }}
                    </el-descriptions-item>
                </el-descriptions>

                <!-- 质量指标 -->
                <div v-if="currentHistory.qualityMetrics" class="quality-section">
                    <h4>{{ t('history.qualityMetrics') }}</h4>
                    <el-descriptions :column="3" border>
                        <el-descriptions-item :label="t('history.overallScore')">
                            <el-progress :percentage="currentHistory.qualityMetrics.overallScore" :width="60" type="circle" />
                        </el-descriptions-item>
                        <el-descriptions-item :label="t('history.typescriptErrors')">
                            {{ currentHistory.qualityMetrics.typescriptErrors }}
                        </el-descriptions-item>
                        <el-descriptions-item :label="t('history.eslintErrors')">
                            {{ currentHistory.qualityMetrics.eslintErrors }}
                        </el-descriptions-item>
                        <el-descriptions-item :label="t('history.complexityScore')">
                            {{ currentHistory.qualityMetrics.complexityScore }}
                        </el-descriptions-item>
                        <el-descriptions-item :label="t('history.duplicationRate')">
                            {{ currentHistory.qualityMetrics.duplicationRate }}%
                        </el-descriptions-item>
                        <el-descriptions-item :label="t('history.testCoverage')">
                            {{ currentHistory.qualityMetrics.testCoverage }}%
                        </el-descriptions-item>
                    </el-descriptions>
                </div>

                <!-- 生成的文件列表 -->
                <div class="files-section">
                    <h4>{{ t('history.generatedFiles') }} ({{ currentHistory.generatedFiles.length }})</h4>
                    <el-table :data="currentHistory.generatedFiles" border>
                        <el-table-column prop="filePath" :label="t('history.filePath')" min-width="300" />
                        <el-table-column :label="t('history.fileType')" width="100">
                            <template #default="{ row }">
                                <el-tag size="small">{{ row.fileType }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column :label="t('history.size')" width="100">
                            <template #default="{ row }">
                                {{ formatSize(row.size) }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="t('history.lineCount')" width="100">
                            <template #default="{ row }">
                                {{ row.lineCount }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="t('history.actions')" width="150">
                            <template #default="{ row }">
                                <el-button type="primary" size="small" :icon="View" @click="handleViewFile(row)">
                                    {{ t('common.view') }}
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 代码变更 -->
                <div v-if="currentHistory.codeChanges && currentHistory.codeChanges.length > 0" class="changes-section">
                    <h4>{{ t('history.codeChanges') }} ({{ currentHistory.codeChanges.length }})</h4>
                    <el-timeline>
                        <el-timeline-item v-for="change in currentHistory.codeChanges" :key="change.id"
                            :timestamp="change.summary || change.filePath" placement="top">
                            <el-tag :type="getChangeTypeColor(change.changeType)" size="small">
                                {{ t(`history.changeType.${change.changeType}`) }}
                            </el-tag>
                            <span style="margin-left: 8px">{{ change.filePath }}</span>
                            <div v-if="change.summary" style="margin-top: 4px; color: var(--el-text-color-secondary)">
                                {{ change.summary }}
                            </div>
                            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-regular)">
                                +{{ change.linesAdded }} -{{ change.linesDeleted }}
                            </div>
                        </el-timeline-item>
                    </el-timeline>
                </div>

                <!-- 错误和警告 -->
                <div v-if="currentHistory.errorMessage || (currentHistory.warnings && currentHistory.warnings.length > 0)"
                    class="issues-section">
                    <h4>{{ t('history.issues') }}</h4>
                    <el-alert v-if="currentHistory.errorMessage" :title="t('history.error')" type="error" :closable="false"
                        show-icon>
                        <template #default>
                            <pre>{{ currentHistory.errorMessage }}</pre>
                        </template>
                    </el-alert>
                    <el-alert v-if="currentHistory.warnings && currentHistory.warnings.length > 0" :title="t('history.warnings')"
                        type="warning" :closable="false" show-icon style="margin-top: 12px">
                        <template #default>
                            <ul>
                                <li v-for="(warning, index) in currentHistory.warnings" :key="index">
                                    {{ warning }}
                                </li>
                            </ul>
                        </template>
                    </el-alert>
                </div>
            </div>
        </el-drawer>

        <!-- 设置对话框 -->
        <el-dialog v-model="settingsVisible" :title="t('history.settings')" width="600px">
            <el-form :model="settingsForm" label-width="150px">
                <el-form-item :label="t('history.autoCleanup')">
                    <el-switch v-model="settingsForm.autoCleanup" />
                </el-form-item>
                <el-form-item :label="t('history.cleanupDays')">
                    <el-input-number v-model="settingsForm.cleanupDays" :min="7" :max="180" :step="7"
                        controls-position="right" />
                </el-form-item>
                <el-form-item :label="t('history.maxRecords')">
                    <el-input-number v-model="settingsForm.maxRecords" :min="100" :max="10000" :step="100"
                        controls-position="right" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="settingsVisible = false">
                    {{ t('common.cancel') }}
                </el-button>
                <el-button type="primary" @click="handleSaveSettings">
                    {{ t('common.save') }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    Delete,
    Download,
    Refresh,
    RefreshLeft,
    Search,
    Setting,
    View
} from '@element-plus/icons-vue'
import { generationHistoryApi } from '@smartabp/lowcode-api'
import { GenerationStatus, GenerationType, type GeneratedFileRecord, type GenerationHistory } from '@smartabp/lowcode-shared'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGenerationHistoryStore } from '../../stores/generation-history'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Composables
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const { t } = useI18n()
const historyStore = useGenerationHistoryStore()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const selectedHistories = ref<GenerationHistory[]>([])
const detailsVisible = ref(false)
const settingsVisible = ref(false)

const dateRange = ref<[Date, Date] | null>(null)

const filterForm = ref({
    keyword: '',
    generationType: undefined as GenerationType | undefined,
    status: undefined as GenerationStatus | undefined,
    minQualityScore: undefined as number | undefined
})

const settingsForm = ref({
    autoCleanup: true,
    cleanupDays: 30,
    maxRecords: 1000
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Computed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const histories = computed(() => historyStore.histories)
const currentHistory = computed(() => historyStore.currentHistory)
const loading = computed(() => historyStore.loading)
const totalCount = computed(() => historyStore.totalCount)
const currentPage = computed({
    get: () => historyStore.currentPage,
    set: (val) => {
        historyStore.currentPage = val
    }
})
const pageSize = computed({
    get: () => historyStore.pageSize,
    set: (val) => {
        historyStore.pageSize = val
    }
})

const generationTypes = [
    { value: GenerationType.Entity, label: 'history.type.Entity' },
    { value: GenerationType.AppService, label: 'history.type.AppService' },
    { value: GenerationType.Controller, label: 'history.type.Controller' },
    { value: GenerationType.DTO, label: 'history.type.DTO' },
    { value: GenerationType.VueComponent, label: 'history.type.VueComponent' },
    { value: GenerationType.PiniaStore, label: 'history.type.PiniaStore' },
    { value: GenerationType.RouterConfig, label: 'history.type.RouterConfig' },
    { value: GenerationType.ApiClient, label: 'history.type.ApiClient' },
    { value: GenerationType.FullModule, label: 'history.type.FullModule' }
]

const statuses = [
    { value: GenerationStatus.Success, label: 'history.status.Success' },
    { value: GenerationStatus.Failed, label: 'history.status.Failed' },
    { value: GenerationStatus.Warning, label: 'history.status.Warning' },
    { value: GenerationStatus.Running, label: 'history.status.Running' },
    { value: GenerationStatus.Reverted, label: 'history.status.Reverted' }
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function loadHistories() {
    const filter = {
        keyword: filterForm.value.keyword || undefined,
        generationType: filterForm.value.generationType,
        status: filterForm.value.status,
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1],
        minQualityScore: filterForm.value.minQualityScore,
        page: currentPage.value,
        pageSize: pageSize.value
    }

    await historyStore.loadHistories(filter)
}

function handleRefresh() {
    loadHistories()
}

function handleFilterChange() {
    currentPage.value = 1
    loadHistories()
}

function handleDateRangeChange() {
    currentPage.value = 1
    loadHistories()
}

function handleResetFilter() {
    filterForm.value = {
        keyword: '',
        generationType: undefined,
        status: undefined,
        minQualityScore: undefined
    }
    dateRange.value = null
    currentPage.value = 1
    loadHistories()
}

function handleSelectionChange(selection: GenerationHistory[]) {
    selectedHistories.value = selection
}

function handlePageSizeChange() {
    currentPage.value = 1
    loadHistories()
}

function handleCurrentPageChange() {
    loadHistories()
}

async function handleViewDetails(history: GenerationHistory) {
    await historyStore.loadHistory(history.id)
    detailsVisible.value = true
}

async function handleRevert(history: GenerationHistory) {
    try {
        await ElMessageBox.confirm(
            t('history.revertConfirm', { name: history.entityName }),
            t('common.warning'),
            {
                confirmButtonText: t('common.confirm'),
                cancelButtonText: t('common.cancel'),
                type: 'warning'
            }
        )

        const result = await historyStore.revertToHistory(history.id, {
            createBackup: true,
            recompile: true,
            reason: '用户手动回滚'
        })

        if (result) {
            await loadHistories()
        }
    } catch {
        // User cancelled
    }
}

async function handleDelete(history: GenerationHistory) {
    try {
        await ElMessageBox.confirm(
            t('history.deleteConfirm', { name: history.entityName }),
            t('common.warning'),
            {
                confirmButtonText: t('common.confirm'),
                cancelButtonText: t('common.cancel'),
                type: 'warning'
            }
        )

        const success = await historyStore.deleteHistory(history.id)
        if (success) {
            await loadHistories()
        }
    } catch {
        // User cancelled
    }
}

async function handleBatchDelete() {
    try {
        await ElMessageBox.confirm(
            t('history.batchDeleteConfirm', { count: selectedHistories.value.length }),
            t('common.warning'),
            {
                confirmButtonText: t('common.confirm'),
                cancelButtonText: t('common.cancel'),
                type: 'warning'
            }
        )

        const ids = selectedHistories.value.map(h => h.id)
        const success = await historyStore.batchDelete(ids)
        if (success) {
            selectedHistories.value = []
            await loadHistories()
        }
    } catch {
        // User cancelled
    }
}

async function handleExport() {
    const ids = selectedHistories.value.map(h => h.id)
    await historyStore.exportHistories(ids)
}

function handleViewFile(file: GeneratedFileRecord) {
    // TODO: 集成代码预览面板
    ElMessage.info(t('history.viewFileNotImplemented'))
}

function handleSaveSettings() {
    // TODO: 保存设置到后端或localStorage
    ElMessage.success(t('history.settingsSaved'))
    settingsVisible.value = false
}

function getTypeLabel(type: GenerationType): string {
    const labels: Record<GenerationType, string> = {
        [GenerationType.Entity]: t('history.type.Entity'),
        [GenerationType.AppService]: t('history.type.AppService'),
        [GenerationType.Controller]: t('history.type.Controller'),
        [GenerationType.DTO]: t('history.type.DTO'),
        [GenerationType.VueComponent]: t('history.type.VueComponent'),
        [GenerationType.PiniaStore]: t('history.type.PiniaStore'),
        [GenerationType.RouterConfig]: t('history.type.RouterConfig'),
        [GenerationType.ApiClient]: t('history.type.ApiClient'),
        [GenerationType.FullModule]: t('history.type.FullModule')
    }
    return labels[type] || type
}

function getTypeTagColor(type: GenerationType): string {
    const colors: Record<GenerationType, string> = {
        [GenerationType.Entity]: 'primary',
        [GenerationType.AppService]: 'success',
        [GenerationType.Controller]: 'warning',
        [GenerationType.DTO]: 'info',
        [GenerationType.VueComponent]: 'primary',
        [GenerationType.PiniaStore]: 'success',
        [GenerationType.RouterConfig]: 'warning',
        [GenerationType.ApiClient]: 'info',
        [GenerationType.FullModule]: 'danger'
    }
    return colors[type] || 'info'
}

function getStatusTagColor(status: GenerationStatus): string {
    const colors: Record<GenerationStatus, string> = {
        [GenerationStatus.Success]: 'success',
        [GenerationStatus.Failed]: 'danger',
        [GenerationStatus.Warning]: 'warning',
        [GenerationStatus.Running]: 'info',
        [GenerationStatus.Reverted]: 'info'
    }
    return colors[status] || 'info'
}

function getChangeTypeColor(changeType: string): string {
    const colors: Record<string, string> = {
        'create': 'success',
        'update': 'warning',
        'delete': 'danger'
    }
    return colors[changeType] || 'info'
}

function formatDate(date: Date): string {
    return new Date(date).toLocaleString()
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lifecycle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
    loadHistories()
})
</script>

<style scoped lang="scss">
.generation-history-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 24px;
    background: var(--el-bg-color);
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
        }
    }

    .header-actions {
        display: flex;
        gap: 8px;
    }
}

.filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.history-table {
    flex: 1;
    margin-bottom: 16px;
}

.pagination {
    display: flex;
    justify-content: flex-end;
}

.history-details {
    h4 {
        margin: 24px 0 12px;
        font-size: 16px;
        font-weight: 600;
    }

    .quality-section,
    .files-section,
    .changes-section,
    .issues-section {
        margin-top: 24px;
    }

    .issues-section {
        pre {
            margin: 0;
            padding: 8px;
            background: var(--el-fill-color-light);
            border-radius: 4px;
            font-size: 13px;
            line-height: 1.6;
        }

        ul {
            margin: 0;
            padding-left: 20px;

            li {
                margin: 4px 0;
            }
        }
    }
}
</style>


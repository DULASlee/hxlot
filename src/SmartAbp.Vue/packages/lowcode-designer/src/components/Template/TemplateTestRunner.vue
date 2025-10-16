<template>
    <div class="template-test-runner">
        <!-- 顶部工具栏 -->
        <div class="runner-header">
            <div class="header-left">
                <h3>{{ t('template.testRunner') }}</h3>
                <el-tag v-if="selectedTemplate" type="primary">
                    {{ selectedTemplate.name }}
                </el-tag>
            </div>

            <div class="header-actions">
                <el-button type="primary" :icon="Plus" size="default" @click="handleAddTestCase">
                    {{ t('template.addTestCase') }}
                </el-button>
                <el-button type="success" :icon="VideoPlay" size="default" :loading="running"
                    :disabled="testCases.length === 0" @click="handleRunAll">
                    {{ t('template.runAllTests') }}
                </el-button>
                <el-button type="warning" :icon="Delete" size="default" :disabled="selectedTestCases.length === 0"
                    @click="handleBatchDelete">
                    {{ t('template.deleteSelected') }}
                </el-button>
                <el-button type="info" :icon="Download" size="default" :disabled="testResults.length === 0"
                    @click="handleExportReport">
                    {{ t('template.exportReport') }}
                </el-button>
            </div>
        </div>

        <!-- 测试用例列表 -->
        <div class="test-cases-section">
            <el-table v-loading="loading" :data="testCases" @selection-change="handleSelectionChange" border stripe>
                <el-table-column type="selection" width="55" />
                <el-table-column prop="name" :label="t('template.testCaseName')" min-width="200">
                    <template #default="{ row }">
                        <div class="test-case-name">
                            <el-icon v-if="getTestResult(row.id)?.status === 'passed'" class="status-icon passed">
                                <SuccessFilled />
                            </el-icon>
                            <el-icon v-else-if="getTestResult(row.id)?.status === 'failed'" class="status-icon failed">
                                <CircleCloseFilled />
                            </el-icon>
                            <el-icon v-else-if="getTestResult(row.id)?.status === 'running'"
                                class="status-icon running">
                                <Loading />
                            </el-icon>
                            <span>{{ row.name }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="description" :label="t('template.description')" min-width="250" />
                <el-table-column :label="t('template.status')" width="120">
                    <template #default="{ row }">
                        <el-tag v-if="getTestResult(row.id)?.status === 'passed'" type="success" size="small">
                            {{ t('template.passed') }}
                        </el-tag>
                        <el-tag v-else-if="getTestResult(row.id)?.status === 'failed'" type="danger" size="small">
                            {{ t('template.failed') }}
                        </el-tag>
                        <el-tag v-else-if="getTestResult(row.id)?.status === 'running'" type="warning" size="small">
                            {{ t('template.running') }}
                        </el-tag>
                        <el-tag v-else type="info" size="small">
                            {{ t('template.pending') }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column :label="t('template.duration')" width="120">
                    <template #default="{ row }">
                        {{ getTestResult(row.id)?.duration ? `${getTestResult(row.id)?.duration}ms` : '-' }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('template.actions')" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" :icon="VideoPlay"
                            :loading="getTestResult(row.id)?.status === 'running'" @click="handleRunTest(row)">
                            {{ t('template.run') }}
                        </el-button>
                        <el-button type="default" size="small" :icon="Edit" @click="handleEditTest(row)">
                            {{ t('common.edit') }}
                        </el-button>
                        <el-button type="danger" size="small" :icon="Delete" @click="handleDeleteTest(row)">
                            {{ t('common.delete') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 测试结果统计 -->
        <div v-if="testResults.length > 0" class="test-statistics">
            <el-card shadow="hover">
                <template #header>
                    <div class="statistics-header">
                        <span>{{ t('template.testStatistics') }}</span>
                        <el-tag :type="getStatisticsType()" size="large">
                            {{ t('template.passRate') }}: {{ passRate }}%
                        </el-tag>
                    </div>
                </template>

                <div class="statistics-content">
                    <div class="stat-item">
                        <div class="stat-label">{{ t('template.totalTests') }}</div>
                        <div class="stat-value">{{ totalTests }}</div>
                    </div>
                    <div class="stat-item success">
                        <div class="stat-label">{{ t('template.passedTests') }}</div>
                        <div class="stat-value">{{ passedTests }}</div>
                    </div>
                    <div class="stat-item danger">
                        <div class="stat-label">{{ t('template.failedTests') }}</div>
                        <div class="stat-value">{{ failedTests }}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">{{ t('template.averageDuration') }}</div>
                        <div class="stat-value">{{ averageDuration }}ms</div>
                    </div>
                </div>

                <div class="statistics-chart">
                    <el-progress :percentage="passRate" :color="getProgressColor()" :stroke-width="20"
                        :show-text="true" />
                </div>
            </el-card>
        </div>

        <!-- 测试详情抽屉 -->
        <el-drawer v-model="detailDrawerVisible" :title="t('template.testDetails')" size="50%">
            <div v-if="selectedTestResult" class="test-detail">
                <el-descriptions :column="2" border>
                    <el-descriptions-item :label="t('template.testCaseName')">
                        {{ selectedTestResult.testCaseName }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('template.status')">
                        <el-tag :type="selectedTestResult.status === 'passed' ? 'success' : 'danger'">
                            {{ selectedTestResult.status }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('template.duration')">
                        {{ selectedTestResult.duration }}ms
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('template.executedAt')">
                        {{ formatDate(selectedTestResult.executedAt) }}
                    </el-descriptions-item>
                </el-descriptions>

                <div v-if="selectedTestResult.status === 'failed'" class="error-section">
                    <h4>{{ t('template.errorMessage') }}</h4>
                    <el-alert :title="selectedTestResult.errorMessage" type="error" :closable="false" show-icon />
                </div>

                <div class="input-section">
                    <h4>{{ t('template.inputData') }}</h4>
                    <pre><code>{{ JSON.stringify(selectedTestResult.inputData, null, 2) }}</code></pre>
                </div>

                <div class="output-section">
                    <h4>{{ t('template.actualOutput') }}</h4>
                    <pre><code>{{ selectedTestResult.actualOutput }}</code></pre>
                </div>

                <div class="expected-section">
                    <h4>{{ t('template.expectedOutput') }}</h4>
                    <pre><code>{{ selectedTestResult.expectedOutput }}</code></pre>
                </div>
            </div>
        </el-drawer>

        <!-- 添加/编辑测试用例对话框 -->
        <el-dialog v-model="testCaseDialogVisible"
            :title="isEditMode ? t('template.editTestCase') : t('template.addTestCase')" width="800px"
            :close-on-click-modal="false">
            <el-form ref="testCaseFormRef" :model="testCaseForm" :rules="testCaseRules" label-width="120px">
                <el-form-item :label="t('template.testCaseName')" prop="name">
                    <el-input v-model="testCaseForm.name" :placeholder="t('template.enterTestCaseName')" />
                </el-form-item>

                <el-form-item :label="t('template.description')" prop="description">
                    <el-input v-model="testCaseForm.description" type="textarea" :rows="3"
                        :placeholder="t('template.enterDescription')" />
                </el-form-item>

                <el-form-item :label="t('template.inputData')" prop="inputData">
                    <el-input v-model="testCaseForm.inputData" type="textarea" :rows="6"
                        :placeholder="t('template.enterInputData')" />
                </el-form-item>

                <el-form-item :label="t('template.expectedOutput')" prop="expectedOutput">
                    <el-input v-model="testCaseForm.expectedOutput" type="textarea" :rows="6"
                        :placeholder="t('template.enterExpectedOutput')" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="testCaseDialogVisible = false">
                    {{ t('common.cancel') }}
                </el-button>
                <el-button type="primary" :loading="saving" @click="handleSaveTestCase">
                    {{ t('common.save') }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    CircleCloseFilled,
    Delete,
    Download,
    Edit,
    Loading,
    Plus,
    SuccessFilled,
    VideoPlay
} from '@element-plus/icons-vue'
import type { Template, TemplateTestCase } from '@smartabp/lowcode-shared'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTemplateStore } from '../../stores/template'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props & Emits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props {
    templateId?: string
}

const props = defineProps<Props>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Composables
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const { t } = useI18n()
const templateStore = useTemplateStore()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TestResult {
    id: string
    testCaseId: string
    testCaseName: string
    status: 'passed' | 'failed' | 'running' | 'pending'
    duration: number
    inputData: Record<string, unknown>
    expectedOutput: string
    actualOutput: string
    errorMessage?: string
    executedAt: Date
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const selectedTemplate = ref<Template | null>(null)
const testCases = ref<TemplateTestCase[]>([])
const selectedTestCases = ref<TemplateTestCase[]>([])
const testResults = ref<TestResult[]>([])
const selectedTestResult = ref<TestResult | null>(null)

const loading = ref(false)
const running = ref(false)
const saving = ref(false)

const testCaseDialogVisible = ref(false)
const detailDrawerVisible = ref(false)
const isEditMode = ref(false)

const testCaseFormRef = ref<FormInstance>()
const testCaseForm = ref({
    id: '',
    name: '',
    description: '',
    inputData: '{}',
    expectedOutput: ''
})

const testCaseRules: FormRules = {
    name: [{ required: true, message: t('template.pleaseEnterTestCaseName'), trigger: 'blur' }],
    inputData: [
        { required: true, message: t('template.pleaseEnterInputData'), trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                try {
                    JSON.parse(value)
                    callback()
                } catch {
                    callback(new Error(t('template.invalidJSON')))
                }
            },
            trigger: 'blur'
        }
    ],
    expectedOutput: [{ required: true, message: t('template.pleaseEnterExpectedOutput'), trigger: 'blur' }]
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Computed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const totalTests = computed(() => testResults.value.length)
const passedTests = computed(() => testResults.value.filter(r => r.status === 'passed').length)
const failedTests = computed(() => testResults.value.filter(r => r.status === 'failed').length)
const passRate = computed(() => {
    if (totalTests.value === 0) return 0
    return Math.round((passedTests.value / totalTests.value) * 100)
})
const averageDuration = computed(() => {
    if (testResults.value.length === 0) return 0
    const total = testResults.value.reduce((sum, r) => sum + r.duration, 0)
    return Math.round(total / testResults.value.length)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function loadTemplate() {
    if (!props.templateId) return

    loading.value = true
    try {
        const template = await templateStore.loadTemplate(props.templateId)
        if (template) {
            selectedTemplate.value = template
        }
        await loadTestCases()
    } finally {
        loading.value = false
    }
}

async function loadTestCases() {
    if (!props.templateId) return

    loading.value = true
    try {
        // TODO: 实现加载测试用例API
        // testCases.value = await templateApi.getTestCases(props.templateId)
        testCases.value = []
    } finally {
        loading.value = false
    }
}

function getTestResult(testCaseId: string): TestResult | undefined {
    return testResults.value.find(r => r.testCaseId === testCaseId)
}

function handleSelectionChange(selection: TemplateTestCase[]) {
    selectedTestCases.value = selection
}

function handleAddTestCase() {
    isEditMode.value = false
    testCaseForm.value = {
        id: '',
        name: '',
        description: '',
        inputData: '{}',
        expectedOutput: ''
    }
    testCaseDialogVisible.value = true
}

function handleEditTest(testCase: TemplateTestCase) {
    isEditMode.value = true
    testCaseForm.value = {
        id: testCase.id,
        name: testCase.name,
        description: testCase.description || '',
        inputData: JSON.stringify(testCase.inputData, null, 2),
        expectedOutput: testCase.expectedOutput || ''
    }
    testCaseDialogVisible.value = true
}

async function handleSaveTestCase() {
    if (!testCaseFormRef.value) return

    await testCaseFormRef.value.validate(async valid => {
        if (!valid) return

        saving.value = true
        try {
            const inputData = JSON.parse(testCaseForm.value.inputData)
            const testCaseData = {
                name: testCaseForm.value.name,
                description: testCaseForm.value.description || undefined,
                inputData,
                expectedOutput: testCaseForm.value.expectedOutput || undefined,
                status: 'pending' as const
            }

      if (isEditMode.value && testCaseForm.value.id) {
        // TODO: 实现更新测试用例API
        // await templateApi.updateTestCase(testCaseForm.value.id, testCaseData)
        const index = testCases.value.findIndex(tc => tc.id === testCaseForm.value.id)
        if (index !== -1) {
          const existing = testCases.value[index]
          if (existing) {
            testCases.value[index] = {
              id: existing.id,
              templateId: existing.templateId,
              name: testCaseData.name,
              description: testCaseData.description,
              inputData: testCaseData.inputData,
              expectedOutput: testCaseData.expectedOutput,
              actualOutput: existing.actualOutput,
              status: testCaseData.status,
              errorMessage: existing.errorMessage,
              createdAt: existing.createdAt,
              updatedAt: new Date()
            }
          }
        }
        ElMessage.success(t('template.testCaseUpdated'))
            } else {
                // TODO: 实现创建测试用例API
                // const newTestCase = await templateApi.createTestCase(props.templateId!, testCaseData)
                if (!props.templateId) {
                    ElMessage.error(t('template.pleaseSelectTemplate'))
                    return
                }
                const newTestCase: TemplateTestCase = {
                    id: Date.now().toString(),
                    templateId: props.templateId,
                    name: testCaseData.name,
                    description: testCaseData.description,
                    inputData: testCaseData.inputData,
                    expectedOutput: testCaseData.expectedOutput,
                    status: testCaseData.status,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                testCases.value.push(newTestCase)
                ElMessage.success(t('template.testCaseAdded'))
            }

            testCaseDialogVisible.value = false
        } catch (error) {
            ElMessage.error(t('template.testCaseSaveFailed'))
            console.error('Save test case failed:', error)
        } finally {
            saving.value = false
        }
    })
}

async function handleRunTest(testCase: TemplateTestCase) {
    if (!selectedTemplate.value) return

    const startTime = Date.now()

    // 创建测试结果占位符
    const result: TestResult = {
        id: Date.now().toString(),
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        status: 'running',
        duration: 0,
        inputData: testCase.inputData,
        expectedOutput: testCase.expectedOutput || '',
        actualOutput: '',
        executedAt: new Date()
    }

    // 添加或更新测试结果
    const existingIndex = testResults.value.findIndex(r => r.testCaseId === testCase.id)
    if (existingIndex !== -1) {
        testResults.value[existingIndex] = result
    } else {
        testResults.value.push(result)
    }

    try {
        // 调用模板编译API
        const compileResult = await templateStore.compileTemplate(
            selectedTemplate.value.id,
            testCase.inputData,
            { strict: true }
        )

        const duration = Date.now() - startTime

        if (compileResult?.success) {
            const actualOutput = compileResult.output || ''
            const expectedOutput = testCase.expectedOutput || ''
            const passed = actualOutput.trim() === expectedOutput.trim()

            result.status = passed ? 'passed' : 'failed'
            result.duration = duration
            result.actualOutput = actualOutput
            if (!passed) {
                result.errorMessage = t('template.outputMismatch')
            }
        } else {
            result.status = 'failed'
            result.duration = duration
            const error = compileResult?.error
            result.errorMessage = typeof error === 'string'
                ? error
                : error?.message || t('template.compilationFailed')
        }
    } catch (error) {
        result.status = 'failed'
        result.duration = Date.now() - startTime
        result.errorMessage = error instanceof Error ? error.message : t('template.testExecutionFailed')
    }

    // 更新测试结果
    if (existingIndex !== -1) {
        testResults.value[existingIndex] = result
    }

    // 显示结果通知
    if (result.status === 'passed') {
        ElMessage.success(`${testCase.name}: ${t('template.passed')}`)
    } else {
        ElMessage.error(`${testCase.name}: ${t('template.failed')}`)
        selectedTestResult.value = result
        detailDrawerVisible.value = true
    }
}

async function handleRunAll() {
    running.value = true
    try {
        for (const testCase of testCases.value) {
            await handleRunTest(testCase)
        }
        ElMessage.success(t('template.allTestsCompleted'))
    } finally {
        running.value = false
    }
}

async function handleDeleteTest(testCase: TemplateTestCase) {
    try {
        await ElMessageBox.confirm(
            t('template.deleteTestCaseConfirm'),
            t('common.warning'),
            {
                confirmButtonText: t('common.confirm'),
                cancelButtonText: t('common.cancel'),
                type: 'warning'
            }
        )

        // TODO: 实现删除测试用例API
        // await templateApi.deleteTestCase(testCase.id)
        const index = testCases.value.findIndex(tc => tc.id === testCase.id)
        if (index !== -1) {
            testCases.value.splice(index, 1)
        }

        // 删除对应的测试结果
        const resultIndex = testResults.value.findIndex(r => r.testCaseId === testCase.id)
        if (resultIndex !== -1) {
            testResults.value.splice(resultIndex, 1)
        }

        ElMessage.success(t('template.testCaseDeleted'))
    } catch {
        // User cancelled
    }
}

async function handleBatchDelete() {
    try {
        await ElMessageBox.confirm(
            t('template.batchDeleteConfirm', { count: selectedTestCases.value.length }),
            t('common.warning'),
            {
                confirmButtonText: t('common.confirm'),
                cancelButtonText: t('common.cancel'),
                type: 'warning'
            }
        )

        for (const testCase of selectedTestCases.value) {
            const index = testCases.value.findIndex(tc => tc.id === testCase.id)
            if (index !== -1) {
                testCases.value.splice(index, 1)
            }

            const resultIndex = testResults.value.findIndex(r => r.testCaseId === testCase.id)
            if (resultIndex !== -1) {
                testResults.value.splice(resultIndex, 1)
            }
        }

        selectedTestCases.value = []
        ElMessage.success(t('template.testCasesDeleted'))
    } catch {
        // User cancelled
    }
}

function handleExportReport() {
    const report = {
        template: selectedTemplate.value?.name,
        executedAt: new Date().toISOString(),
        statistics: {
            total: totalTests.value,
            passed: passedTests.value,
            failed: failedTests.value,
            passRate: passRate.value,
            averageDuration: averageDuration.value
        },
        results: testResults.value.map(r => ({
            testCaseName: r.testCaseName,
            status: r.status,
            duration: r.duration,
            errorMessage: r.errorMessage
        }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success(t('template.reportExported'))
}

function getStatisticsType(): 'success' | 'warning' | 'danger' {
    if (passRate.value >= 90) return 'success'
    if (passRate.value >= 70) return 'warning'
    return 'danger'
}

function getProgressColor(): string {
    if (passRate.value >= 90) return '#67c23a'
    if (passRate.value >= 70) return '#e6a23c'
    return '#f56c6c'
}

function formatDate(date: Date): string {
    return new Date(date).toLocaleString()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lifecycle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
    loadTemplate()
})
</script>

<style scoped lang="scss">
.template-test-runner {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 24px;
    background: var(--el-bg-color);
}

.runner-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

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

.test-cases-section {
    flex: 1;
    margin-bottom: 24px;
    overflow: auto;
}

.test-case-name {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-icon {
        font-size: 18px;

        &.passed {
            color: var(--el-color-success);
        }

        &.failed {
            color: var(--el-color-danger);
        }

        &.running {
            color: var(--el-color-warning);
            animation: rotate 1s linear infinite;
        }
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.test-statistics {
    .statistics-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
            font-weight: 600;
        }
    }

    .statistics-content {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;

        .stat-item {
            padding: 16px;
            text-align: center;
            background: var(--el-fill-color-light);
            border-radius: 4px;

            &.success {
                background: var(--el-color-success-light-9);
                color: var(--el-color-success);
            }

            &.danger {
                background: var(--el-color-danger-light-9);
                color: var(--el-color-danger);
            }

            .stat-label {
                font-size: 14px;
                color: var(--el-text-color-secondary);
                margin-bottom: 8px;
            }

            .stat-value {
                font-size: 24px;
                font-weight: 600;
            }
        }
    }

    .statistics-chart {
        margin-top: 16px;
    }
}

.test-detail {
    h4 {
        margin: 24px 0 12px;
        font-size: 16px;
        font-weight: 600;
    }

    .error-section {
        margin: 24px 0;
    }

    .input-section,
    .output-section,
    .expected-section {
        margin-bottom: 24px;

        pre {
            margin: 0;
            padding: 16px;
            background: var(--el-fill-color-light);
            border-radius: 4px;
            overflow-x: auto;

            code {
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 13px;
                line-height: 1.6;
            }
        }
    }
}
</style>

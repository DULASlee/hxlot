<template>
  <div class="template-market">
    <!-- 顶部搜索栏 -->
    <div class="market-header">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('template.searchPlaceholder')"
          :prefix-icon="Search"
          size="large"
          clearable
          @input="handleSearch"
        />
      </div>

      <div class="header-actions">
        <el-select
          v-model="selectedCategory"
          :placeholder="t('template.allCategories')"
          size="default"
          clearable
          style="width: 200px"
          @change="handleCategoryChange"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>

        <el-select
          v-model="sortBy"
          size="default"
          style="width: 150px"
          @change="handleSortChange"
        >
          <el-option :label="t('template.sortByCreated')" value="createdAt" />
          <el-option :label="t('template.sortByUpdated')" value="updatedAt" />
          <el-option :label="t('template.sortByRating')" value="rating" />
          <el-option :label="t('template.sortByDownloads')" value="downloadCount" />
        </el-select>

        <el-radio-group v-model="sortOrder" size="default" @change="handleSortChange">
          <el-radio-button label="desc">
            <el-icon><SortDown /></el-icon>
          </el-radio-button>
          <el-radio-button label="asc">
            <el-icon><SortUp /></el-icon>
          </el-radio-button>
        </el-radio-group>

        <el-button
          type="primary"
          :icon="Plus"
          size="default"
          @click="handleCreateTemplate"
        >
          {{ t('template.createTemplate') }}
        </el-button>
      </div>
    </div>

    <!-- 标签筛选 -->
    <div v-if="allTags.length > 0" class="tag-filters">
      <el-tag
        v-for="tag in allTags"
        :key="tag"
        :type="selectedTags.includes(tag) ? 'primary' : 'info'"
        :effect="selectedTags.includes(tag) ? 'dark' : 'plain'"
        size="default"
        style="margin-right: 8px; margin-bottom: 8px; cursor: pointer"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </el-tag>
    </div>

    <!-- 模板列表 -->
    <div v-loading="loading" class="template-grid">
      <el-empty
        v-if="!loading && filteredTemplates.length === 0"
        :description="t('template.noTemplatesFound')"
      />

      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        @click="handleViewTemplate(template)"
      >
        <!-- 模板头部 -->
        <div class="card-header">
          <div class="template-icon">
            <el-icon size="32"><Document /></el-icon>
          </div>
          <div class="template-badges">
            <el-tag v-if="template.isBuiltIn" type="success" size="small">
              {{ t('template.builtIn') }}
            </el-tag>
            <el-tag v-if="template.isPublic" type="primary" size="small">
              {{ t('template.public') }}
            </el-tag>
          </div>
        </div>

        <!-- 模板信息 -->
        <div class="card-body">
          <h3 class="template-name">{{ template.name }}</h3>
          <p class="template-description">{{ template.description || t('template.noDescription') }}</p>

          <!-- 元数据 -->
          <div class="template-meta">
            <div class="meta-item">
              <el-icon><Star /></el-icon>
              <span>{{ template.rating?.toFixed(1) || '0.0' }}</span>
              <span class="meta-count">({{ template.reviewCount || 0 }})</span>
            </div>
            <div class="meta-item">
              <el-icon><Download /></el-icon>
              <span>{{ formatNumber(template.usageCount || 0) }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Clock /></el-icon>
              <span>{{ formatDate(template.updatedAt) }}</span>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="template.tags && template.tags.length > 0" class="template-tags">
            <el-tag
              v-for="tag in template.tags.slice(0, 3)"
              :key="tag"
              type="info"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
            <el-tag v-if="template.tags.length > 3" type="info" size="small" effect="plain">
              +{{ template.tags.length - 3 }}
            </el-tag>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-footer">
          <el-button
            type="primary"
            size="small"
            :icon="View"
            @click.stop="handlePreviewTemplate(template)"
          >
            {{ t('template.preview') }}
          </el-button>
          <el-button
            type="success"
            size="small"
            :icon="Download"
            @click.stop="handleInstallTemplate(template)"
          >
            {{ t('template.install') }}
          </el-button>
          <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, template)">
            <el-button size="small" :icon="More" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit" :icon="Edit">
                  {{ t('template.edit') }}
                </el-dropdown-item>
                <el-dropdown-item command="duplicate" :icon="CopyDocument">
                  {{ t('template.duplicate') }}
                </el-dropdown-item>
                <el-dropdown-item command="export" :icon="Upload">
                  {{ t('template.export') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="!template.isPublic"
                  command="publish"
                  :icon="Share"
                >
                  {{ t('template.publish') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="template.isPublic"
                  command="unpublish"
                  :icon="Hide"
                >
                  {{ t('template.unpublish') }}
                </el-dropdown-item>
                <el-dropdown-item
                  command="delete"
                  :icon="Delete"
                  divided
                  style="color: var(--el-color-danger)"
                >
                  {{ t('template.delete') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="filteredTemplates.length > 0" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handleCurrentPageChange"
      />
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="previewTemplate?.name"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="previewTemplate" class="template-preview">
        <div class="preview-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="t('template.type')">
              {{ previewTemplate.type }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('template.engine')">
              {{ previewTemplate.engine }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('template.version')">
              {{ previewTemplate.version }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('template.rating')">
              <el-rate
                v-model="previewTemplate.rating"
                disabled
                show-score
                text-color="#ff9900"
              />
            </el-descriptions-item>
            <el-descriptions-item :label="t('template.downloads')">
              {{ formatNumber(previewTemplate.usageCount || 0) }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('template.updated')">
              {{ formatDate(previewTemplate.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="preview-content">
          <h4>{{ t('template.content') }}</h4>
          <pre><code>{{ previewTemplate.content }}</code></pre>
        </div>

        <div v-if="previewTemplate.variables && previewTemplate.variables.length > 0" class="preview-variables">
          <h4>{{ t('template.variables') }}</h4>
          <el-table :data="previewTemplate.variables" border>
            <el-table-column prop="name" :label="t('template.variableName')" />
            <el-table-column prop="type" :label="t('template.variableType')" />
            <el-table-column prop="description" :label="t('template.description')" />
            <el-table-column prop="defaultValue" :label="t('template.defaultValue')" />
            <el-table-column prop="isRequired" :label="t('template.required')">
              <template #default="{ row }">
                <el-tag :type="row.isRequired ? 'danger' : 'info'" size="small">
                  {{ row.isRequired ? t('common.yes') : t('common.no') }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="previewDialogVisible = false">
          {{ t('common.close') }}
        </el-button>
        <el-button
          type="success"
          :icon="Download"
          @click="handleInstallTemplate(previewTemplate!)"
        >
          {{ t('template.install') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 评分对话框 -->
    <el-dialog
      v-model="ratingDialogVisible"
      :title="t('template.rateTemplate')"
      width="500px"
    >
      <el-form :model="ratingForm" label-width="80px">
        <el-form-item :label="t('template.rating')">
          <el-rate v-model="ratingForm.rating" show-text />
        </el-form-item>
        <el-form-item :label="t('template.review')">
          <el-input
            v-model="ratingForm.review"
            type="textarea"
            :rows="4"
            :placeholder="t('template.reviewPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ratingDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="rating"
          @click="handleSubmitRating"
        >
          {{ t('common.submit') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  View,
  Download,
  Edit,
  Delete,
  CopyDocument,
  Upload,
  Share,
  Hide,
  More,
  Document,
  Star,
  Clock,
  SortUp,
  SortDown
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import type { Template, TemplateCategory, TemplateMarketFilter } from '@smartabp/lowcode-shared'
import { useTemplateStore } from '../../stores/template'
import { templateApi } from '@smartabp/lowcode-api'
import { useRouter } from 'vue-router'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Composables
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const { t } = useI18n()
const router = useRouter()
const templateStore = useTemplateStore()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedTags = ref<string[]>([])
const sortBy = ref<'createdAt' | 'updatedAt' | 'rating' | 'usageCount'>('updatedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

const currentPage = ref(1)
const pageSize = ref(12)

const previewDialogVisible = ref(false)
const previewTemplate = ref<Template | null>(null)

const ratingDialogVisible = ref(false)
const ratingForm = ref({
  templateId: '',
  rating: 5,
  review: ''
})

const loading = ref(false)
const rating = ref(false)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Computed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const categories = computed(() => templateStore.categories)

const allTags = computed(() => {
  const tags = new Set<string>()
  templateStore.templates.forEach(t => {
    if (t.tags) {
      t.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags)
})

const filteredTemplates = computed(() => {
  let templates = [...templateStore.templates]

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    templates = templates.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      (t.description && t.description.toLowerCase().includes(keyword))
    )
  }

  // 分类过滤
  if (selectedCategory.value) {
    templates = templates.filter(t => t.categoryId === selectedCategory.value)
  }

  // 标签过滤
  if (selectedTags.value.length > 0) {
    templates = templates.filter(t =>
      t.tags && selectedTags.value.every(tag => t.tags!.includes(tag))
    )
  }

  // 排序
  templates.sort((a, b) => {
    let aValue: number | Date
    let bValue: number | Date

    if (sortBy.value === 'rating') {
      aValue = a.rating || 0
      bValue = b.rating || 0
    } else if (sortBy.value === 'usageCount') {
      aValue = a.usageCount || 0
      bValue = b.usageCount || 0
    } else if (sortBy.value === 'createdAt') {
      aValue = a.createdAt
      bValue = b.createdAt
    } else {
      aValue = a.updatedAt
      bValue = b.updatedAt
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return templates
})

const totalCount = computed(() => filteredTemplates.value.length)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function loadTemplates() {
  loading.value = true
  try {
    const filter: TemplateMarketFilter = {
      keyword: searchKeyword.value || undefined,
      categoryId: selectedCategory.value || undefined,
      tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    }
    await templateStore.loadTemplates(filter)
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  await templateStore.loadCategories()
}

function handleSearch() {
  currentPage.value = 1
  loadTemplates()
}

function handleCategoryChange() {
  currentPage.value = 1
  loadTemplates()
}

function handleSortChange() {
  currentPage.value = 1
  loadTemplates()
}

function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  currentPage.value = 1
  loadTemplates()
}

function handlePageSizeChange() {
  currentPage.value = 1
  loadTemplates()
}

function handleCurrentPageChange() {
  loadTemplates()
}

function handleCreateTemplate() {
  router.push({ name: 'TemplateEditor', params: { id: 'new' } })
}

function handleViewTemplate(template: Template) {
  router.push({ name: 'TemplateEditor', params: { id: template.id } })
}

function handlePreviewTemplate(template: Template) {
  previewTemplate.value = template
  previewDialogVisible.value = true
}

async function handleInstallTemplate(template: Template) {
  try {
    ElMessage.info(t('template.installingTemplate'))
    // TODO: 实现模板安装逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(t('template.installSuccess'))
  } catch (error) {
    ElMessage.error(t('template.installFailed'))
    console.error('Install template failed:', error)
  }
}

async function handleCommand(command: string, template: Template) {
  switch (command) {
    case 'edit':
      router.push({ name: 'TemplateEditor', params: { id: template.id } })
      break
    case 'duplicate':
      await handleDuplicateTemplate(template)
      break
    case 'export':
      await handleExportTemplate(template)
      break
    case 'publish':
      await handlePublishTemplate(template)
      break
    case 'unpublish':
      await handleUnpublishTemplate(template)
      break
    case 'delete':
      await handleDeleteTemplate(template)
      break
  }
}

async function handleDuplicateTemplate(template: Template) {
  try {
    const newName = await ElMessageBox.prompt(
      t('template.enterNewName'),
      t('template.duplicateTemplate'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        inputValue: `${template.name} (Copy)`
      }
    )
    if (newName.value) {
      await templateStore.duplicateTemplate(template.id, newName.value)
      await loadTemplates()
    }
  } catch {
    // User cancelled
  }
}

async function handleExportTemplate(template: Template) {
  try {
    const data = await templateApi.export(template.id, true, true)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name}.template.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success(t('template.exportSuccess'))
  } catch (error) {
    ElMessage.error(t('template.exportFailed'))
    console.error('Export template failed:', error)
  }
}

async function handlePublishTemplate(template: Template) {
  try {
    await ElMessageBox.confirm(
      t('template.publishConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    await templateStore.publishTemplate(template.id)
    await loadTemplates()
  } catch {
    // User cancelled
  }
}

async function handleUnpublishTemplate(template: Template) {
  try {
    await ElMessageBox.confirm(
      t('template.unpublishConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    await templateStore.unpublishTemplate(template.id)
    await loadTemplates()
  } catch {
    // User cancelled
  }
}

async function handleDeleteTemplate(template: Template) {
  try {
    await ElMessageBox.confirm(
      t('template.deleteConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'error'
      }
    )
    await templateStore.deleteTemplate(template.id)
    await loadTemplates()
  } catch {
    // User cancelled
  }
}

async function handleSubmitRating() {
  rating.value = true
  try {
    await templateStore.rateTemplate(
      ratingForm.value.templateId,
      ratingForm.value.rating,
      ratingForm.value.review
    )
    ratingDialogVisible.value = false
    await loadTemplates()
  } finally {
    rating.value = false
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lifecycle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadTemplates()
  ])
})
</script>

<style scoped lang="scss">
.template-market {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  background: var(--el-bg-color);
}

.market-header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;

  .search-bar {
    flex: 1;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

.tag-filters {
  margin-bottom: 16px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.template-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  .template-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: var(--el-color-primary-light-9);
    border-radius: 8px;
    color: var(--el-color-primary);
  }

  .template-badges {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.card-body {
  flex: 1;
  margin-bottom: 16px;

  .template-name {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .template-description {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .template-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--el-text-color-secondary);

      .meta-count {
        color: var(--el-text-color-placeholder);
      }
    }
  }

  .template-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.pagination {
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

.template-preview {
  .preview-info {
    margin-bottom: 24px;
  }

  .preview-content,
  .preview-variables {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 600;
    }

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


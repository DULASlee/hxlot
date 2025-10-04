<template>
  <div class="template-marketplace">
    <!-- 头部区域 -->
    <el-card class="header-card">
      <div class="marketplace-header">
        <div class="header-left">
          <el-icon class="store-icon" size="32"><Shop /></el-icon>
          <div class="title-area">
            <h2>🏪 模板市场</h2>
            <p class="subtitle">发现优秀的微服务架构模板，一键部署到您的环境</p>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="showPublishDialog = true">
            <el-icon><Upload /></el-icon>
            发布模板
          </el-button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板名称、描述或标签..."
          size="large"
          clearable
          @input="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 快捷分类 -->
      <div class="quick-categories">
        <el-space wrap>
          <el-tag
            v-for="cat in categories"
            :key="cat.name"
            :type="selectedCategory === cat.name ? 'primary' : 'info'"
            :effect="selectedCategory === cat.name ? 'dark' : 'plain'"
            size="large"
            style="cursor: pointer"
            @click="selectCategory(cat.name)"
          >
            {{ cat.icon }} {{ cat.name }} ({{ cat.count }})
          </el-tag>
        </el-space>
      </div>
    </el-card>

    <!-- 主内容区 -->
    <div class="marketplace-content">
      <!-- 左侧筛选器 -->
      <el-card class="filter-panel">
        <div class="filter-section">
          <h3>📂 分类</h3>
          <el-checkbox-group v-model="selectedCategories" @change="onFilterChange">
            <el-checkbox
              v-for="cat in categories"
              :key="cat.name"
              :label="cat.name"
              style="display: block; margin: 10px 0"
            >
              {{ cat.icon }} {{ cat.name }} ({{ cat.count }})
            </el-checkbox>
          </el-checkbox-group>
        </div>

        <el-divider />

        <div class="filter-section">
          <h3>🏷️ 类型</h3>
          <el-radio-group v-model="selectedType" @change="onFilterChange">
            <el-radio label="" style="display: block; margin: 10px 0">全部</el-radio>
            <el-radio label="Full Stack" style="display: block; margin: 10px 0">全栈应用</el-radio>
            <el-radio label="Backend" style="display: block; margin: 10px 0">后端服务</el-radio>
            <el-radio label="Frontend" style="display: block; margin: 10px 0">前端应用</el-radio>
            <el-radio label="Infrastructure" style="display: block; margin: 10px 0">基础设施</el-radio>
            <el-radio label="Pipeline" style="display: block; margin: 10px 0">CI/CD流水线</el-radio>
          </el-radio-group>
        </div>

        <el-divider />

        <div class="filter-section">
          <h3>⭐ 评分</h3>
          <el-radio-group v-model="minRating" @change="onFilterChange">
            <el-radio :label="0" style="display: block; margin: 10px 0">全部</el-radio>
            <el-radio :label="4" style="display: block; margin: 10px 0">
              ⭐⭐⭐⭐ 以上
            </el-radio>
            <el-radio :label="4.5" style="display: block; margin: 10px 0">
              ⭐⭐⭐⭐⭐ 精选
            </el-radio>
          </el-radio-group>
        </div>

        <el-divider />

        <div class="filter-section">
          <h3>🔖 热门标签</h3>
          <el-space wrap>
            <el-tag
              v-for="tag in popularTags"
              :key="tag"
              :type="selectedTags.includes(tag) ? 'primary' : ''"
              style="cursor: pointer"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </el-tag>
          </el-space>
        </div>
      </el-card>

      <!-- 右侧模板列表 -->
      <div class="template-list-area">
        <!-- 排序和视图切换 -->
        <el-card class="toolbar-card">
          <div class="list-toolbar">
            <div class="toolbar-left">
              <span class="result-count">找到 {{ totalTemplates }} 个模板</span>
            </div>
            <div class="toolbar-right">
              <el-select v-model="sortBy" size="small" style="width: 150px" @change="onSortChange">
                <el-option label="下载量" value="downloads" />
                <el-option label="评分" value="rating" />
                <el-option label="最新发布" value="created" />
                <el-option label="最近更新" value="updated" />
              </el-select>
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button label="grid">
                  <el-icon><Grid /></el-icon>
                </el-radio-button>
                <el-radio-button label="list">
                  <el-icon><List /></el-icon>
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </el-card>

        <!-- 推荐模板 -->
        <el-card v-if="featuredTemplates.length > 0 && !searchKeyword" class="featured-section">
          <h3>⭐ 推荐模板</h3>
          <el-carousel :interval="5000" height="200px">
            <el-carousel-item v-for="template in featuredTemplates" :key="template.id">
              <div class="featured-card" @click="viewTemplateDetail(template)">
                <div class="featured-content">
                  <h2>{{ template.displayName }}</h2>
                  <p>{{ template.description }}</p>
                  <div class="featured-meta">
                    <el-tag>{{ template.category }}</el-tag>
                    <span>⭐ {{ template.rating.toFixed(1) }}</span>
                    <span>📥 {{ template.downloads }}次下载</span>
                  </div>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-card>

        <!-- 模板网格视图 -->
        <div v-if="viewMode === 'grid'" class="template-grid">
          <el-card
            v-for="template in templates"
            :key="template.id"
            class="template-card"
            shadow="hover"
            @click="viewTemplateDetail(template)"
          >
            <div class="card-header">
              <div class="template-icon">📦</div>
              <el-tag v-if="template.isFeatured" type="warning" size="small">推荐</el-tag>
            </div>
            <h3 class="template-name">{{ template.displayName }}</h3>
            <p class="template-desc">{{ template.description }}</p>
            <div class="template-tags">
              <el-tag v-for="tag in template.tags.slice(0, 3)" :key="tag" size="small">
                {{ tag }}
              </el-tag>
            </div>
            <div class="template-meta">
              <span class="meta-item">
                <el-icon><Star /></el-icon>
                {{ template.rating.toFixed(1) }}
              </span>
              <span class="meta-item">
                <el-icon><Download /></el-icon>
                {{ template.downloads }}
              </span>
              <span class="meta-item">
                {{ template.author }}
              </span>
            </div>
            <div class="card-actions">
              <el-button type="primary" size="small" @click.stop="quickDeploy(template)">
                <el-icon><Promotion /></el-icon>
                快速部署
              </el-button>
              <el-button size="small" @click.stop="viewTemplateDetail(template)">
                查看详情
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 模板列表视图 -->
        <div v-else class="template-list">
          <el-card
            v-for="template in templates"
            :key="template.id"
            class="template-list-item"
            shadow="hover"
          >
            <div class="list-item-content">
              <div class="item-left">
                <div class="template-icon-large">📦</div>
                <div class="item-info">
                  <h3>{{ template.displayName }}</h3>
                  <p>{{ template.description }}</p>
                  <div class="item-tags">
                    <el-tag
                      v-for="tag in template.tags"
                      :key="tag"
                      size="small"
                      style="margin-right: 5px"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <div class="item-right">
                <div class="item-stats">
                  <div class="stat">
                    <el-icon><Star /></el-icon>
                    <span>{{ template.rating.toFixed(1) }}</span>
                  </div>
                  <div class="stat">
                    <el-icon><Download /></el-icon>
                    <span>{{ template.downloads }}</span>
                  </div>
                  <div class="stat">{{ template.author }}</div>
                </div>
                <div class="item-actions">
                  <el-button type="primary" @click="quickDeploy(template)">
                    <el-icon><Promotion /></el-icon>
                    快速部署
                  </el-button>
                  <el-button @click="viewTemplateDetail(template)">查看详情</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 分页 -->
        <div class="pagination-area">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalTemplates"
            :page-sizes="[12, 24, 48, 96]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="onPageChange"
            @size-change="onPageSizeChange"
          />
        </div>
      </div>
    </div>

    <!-- 模板详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      :title="currentTemplate?.displayName"
      size="60%"
      direction="rtl"
    >
      <div v-if="currentTemplate" class="template-detail">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板名称">
            {{ currentTemplate.displayName }}
          </el-descriptions-item>
          <el-descriptions-item label="版本">
            <el-tag>{{ currentTemplate.version }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ currentTemplate.category }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ currentTemplate.type }}
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ currentTemplate.author }}
          </el-descriptions-item>
          <el-descriptions-item label="评分">
            <el-rate v-model="currentTemplate.rating" disabled show-score />
            <span>({{ currentTemplate.ratingCount }}人评分)</span>
          </el-descriptions-item>
          <el-descriptions-item label="下载次数">
            <el-icon><Download /></el-icon>
            {{ currentTemplate.downloads }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(currentTemplate.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 描述 -->
        <el-card style="margin-top: 20px">
          <h3>📝 模板描述</h3>
          <p>{{ currentTemplate.description }}</p>
        </el-card>

        <!-- 标签 -->
        <el-card style="margin-top: 20px">
          <h3>🏷️ 标签</h3>
          <el-space wrap>
            <el-tag v-for="tag in currentTemplate.tags" :key="tag" type="info">
              {{ tag }}
            </el-tag>
          </el-space>
        </el-card>

        <!-- 版本历史 -->
        <el-card style="margin-top: 20px">
          <h3>📜 版本历史</h3>
          <el-timeline>
            <el-timeline-item
              v-for="version in templateVersions"
              :key="version.version"
              :timestamp="formatDate(version.createdAt)"
            >
              <h4>版本 {{ version.version }}</h4>
              <p>{{ version.changeLog }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 评论区 -->
        <el-card style="margin-top: 20px">
          <h3>💬 用户评论 ({{ templateComments.length }})</h3>
          
          <!-- 添加评论 -->
          <el-form :model="commentForm" style="margin-top: 20px">
            <el-form-item label="评分">
              <el-rate v-model="commentForm.rating" />
            </el-form-item>
            <el-form-item label="评论">
              <el-input
                v-model="commentForm.content"
                type="textarea"
                :rows="3"
                placeholder="分享您的使用体验..."
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitComment">提交评论</el-button>
            </el-form-item>
          </el-form>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div v-for="comment in templateComments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <strong>{{ comment.author }}</strong>
                <el-rate v-model="comment.rating" disabled size="small" />
              </div>
              <p class="comment-content">{{ comment.content }}</p>
              <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 相关模板 -->
        <el-card style="margin-top: 20px">
          <h3>🔗 相关模板</h3>
          <el-row :gutter="20">
            <el-col v-for="related in relatedTemplates" :key="related.id" :span="12">
              <div class="related-item" @click="viewTemplateDetail(related)">
                <h4>{{ related.displayName }}</h4>
                <p>{{ related.description }}</p>
                <div class="related-meta">
                  <span>⭐ {{ related.rating.toFixed(1) }}</span>
                  <span>📥 {{ related.downloads }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button type="primary" size="large" @click="deployTemplate(currentTemplate)">
            <el-icon><Promotion /></el-icon>
            立即部署
          </el-button>
          <el-button size="large" @click="downloadTemplate(currentTemplate)">
            <el-icon><Download /></el-icon>
            下载模板
          </el-button>
          <el-button size="large" @click="rateTemplate(currentTemplate)">
            <el-icon><Star /></el-icon>
            评分
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 发布模板对话框 -->
    <el-dialog v-model="showPublishDialog" title="发布新模板" width="800px">
      <el-form :model="publishForm" label-width="100px">
        <el-form-item label="模板名称" required>
          <el-input v-model="publishForm.name" placeholder="例如: aspnet-microservice" />
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="publishForm.displayName" placeholder="例如: ASP.NET Core微服务" />
        </el-form-item>
        <el-form-item label="描述" required>
          <el-input
            v-model="publishForm.description"
            type="textarea"
            :rows="3"
            placeholder="描述您的模板..."
          />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="publishForm.category" placeholder="选择分类">
            <el-option
              v-for="cat in categories"
              :key="cat.name"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="publishForm.type" placeholder="选择类型">
            <el-option label="全栈应用" value="Full Stack" />
            <el-option label="后端服务" value="Backend" />
            <el-option label="前端应用" value="Frontend" />
            <el-option label="基础设施" value="Infrastructure" />
            <el-option label="CI/CD流水线" value="Pipeline" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="publishForm.tags"
            multiple
            filterable
            allow-create
            placeholder="添加标签"
          >
            <el-option
              v-for="tag in popularTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模板内容" required>
          <el-input
            v-model="publishForm.content"
            type="textarea"
            :rows="10"
            placeholder="粘贴您的模板YAML内容..."
          />
        </el-form-item>
        <el-form-item label="公开模板">
          <el-switch v-model="publishForm.isPublic" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPublishDialog = false">取消</el-button>
        <el-button type="primary" @click="publishTemplate">发布</el-button>
      </template>
    </el-dialog>

    <!-- 快速部署对话框 -->
    <el-dialog v-model="showDeployDialog" title="快速部署" width="600px">
      <el-form :model="deployForm" label-width="100px">
        <el-form-item label="环境">
          <el-select v-model="deployForm.environment" placeholder="选择部署环境">
            <el-option label="开发环境" value="development" />
            <el-option label="测试环境" value="staging" />
            <el-option label="生产环境" value="production" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置">
          <el-input
            v-model="deployForm.configJson"
            type="textarea"
            :rows="8"
            placeholder='{"key": "value"}'
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDeployDialog = false">取消</el-button>
        <el-button type="primary" :loading="deploying" @click="confirmDeploy">
          <el-icon v-if="!deploying"><Promotion /></el-icon>
          {{ deploying ? '部署中...' : '开始部署' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Shop,
  Upload,
  Search,
  Star,
  Download,
  Promotion,
  Grid,
  List
} from '@element-plus/icons-vue'

// 接口定义
interface Template {
  id: string
  name: string
  displayName: string
  description: string
  category: string
  type: string
  author: string
  version: string
  tags: string[]
  content: string
  isPublic: boolean
  isFeatured: boolean
  downloads: number
  rating: number
  ratingCount: number
  createdAt: Date
  updatedAt: Date
  status: string
}

interface Category {
  name: string
  count: number
  icon: string
}

interface TemplateVersion {
  version: string
  content: string
  changeLog: string
  createdAt: Date
}

interface TemplateComment {
  id: string
  author: string
  content: string
  rating: number
  createdAt: Date
}

// State
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedCategories = ref<string[]>([])
const selectedType = ref('')
const selectedTags = ref<string[]>([])
const minRating = ref(0)
const sortBy = ref('downloads')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const pageSize = ref(12)

const templates = ref<Template[]>([])
const totalTemplates = ref(0)
const categories = ref<Category[]>([])
const featuredTemplates = ref<Template[]>([])
const popularTags = ref<string[]>([
  'Microservices',
  'Docker',
  'Kubernetes',
  'ASP.NET Core',
  'Prometheus',
  'Grafana',
  'CI/CD',
  'GitHub Actions',
  'Monitoring',
  'Security'
])

// 详情抽屉
const detailDrawerVisible = ref(false)
const currentTemplate = ref<Template | null>(null)
const templateVersions = ref<TemplateVersion[]>([])
const templateComments = ref<TemplateComment[]>([])
const relatedTemplates = ref<Template[]>([])

// 评论表单
const commentForm = reactive({
  rating: 5,
  content: ''
})

// 发布模板
const showPublishDialog = ref(false)
const publishForm = reactive({
  name: '',
  displayName: '',
  description: '',
  category: '',
  type: '',
  tags: [] as string[],
  content: '',
  isPublic: true
})

// 部署
const showDeployDialog = ref(false)
const deploying = ref(false)
const deployForm = reactive({
  environment: 'development',
  configJson: '{}'
})
const templateToDeploy = ref<Template | null>(null)

// 初始化
onMounted(async () => {
  await loadCategories()
  await loadFeaturedTemplates()
  await searchTemplates()
})

// 加载分类
const loadCategories = async () => {
  try {
    // 模拟API调用
    categories.value = [
      { name: 'Microservices', count: 45, icon: '🔷' },
      { name: 'Database', count: 28, icon: '🗄️' },
      { name: 'Monitoring', count: 32, icon: '📊' },
      { name: 'Security', count: 21, icon: '🔒' },
      { name: 'CI/CD', count: 38, icon: '🔄' },
      { name: 'Networking', count: 19, icon: '🌐' }
    ]
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载推荐模板
const loadFeaturedTemplates = async () => {
  try {
    // 模拟API调用
    featuredTemplates.value = [
      {
        id: 'template-001',
        name: 'aspnet-microservice',
        displayName: 'ASP.NET Core微服务',
        description: '包含API Gateway、认证服务、业务服务的完整微服务架构模板',
        category: 'Microservices',
        type: 'Full Stack',
        author: 'SmartAbp Team',
        version: '1.2.0',
        tags: ['ASP.NET Core', 'Microservices', 'Docker', 'Kubernetes'],
        content: '',
        isPublic: true,
        isFeatured: true,
        downloads: 1250,
        rating: 4.8,
        ratingCount: 87,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published'
      }
    ]
  } catch (error) {
    console.error('加载推荐模板失败:', error)
  }
}

// 搜索模板
const searchTemplates = async () => {
  try {
    // 模拟API调用
    templates.value = [
      {
        id: 'template-001',
        name: 'aspnet-microservice',
        displayName: 'ASP.NET Core微服务',
        description: '包含API Gateway、认证服务、业务服务的完整微服务架构模板',
        category: 'Microservices',
        type: 'Full Stack',
        author: 'SmartAbp Team',
        version: '1.2.0',
        tags: ['ASP.NET Core', 'Microservices', 'Docker', 'Kubernetes'],
        content: '',
        isPublic: true,
        isFeatured: true,
        downloads: 1250,
        rating: 4.8,
        ratingCount: 87,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published'
      },
      {
        id: 'template-002',
        name: 'prometheus-grafana-stack',
        displayName: 'Prometheus + Grafana监控栈',
        description: '完整的监控解决方案，包含Prometheus、Grafana、Alertmanager',
        category: 'Monitoring',
        type: 'Infrastructure',
        author: 'Community',
        version: '2.0.1',
        tags: ['Prometheus', 'Grafana', 'Monitoring', 'Alerting'],
        content: '',
        isPublic: true,
        isFeatured: true,
        downloads: 980,
        rating: 4.6,
        ratingCount: 65,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published'
      },
      {
        id: 'template-003',
        name: 'github-actions-cicd',
        displayName: 'GitHub Actions CI/CD流水线',
        description: '自动化构建、测试、部署流水线模板',
        category: 'CI/CD',
        type: 'Pipeline',
        author: 'DevOps Team',
        version: '1.5.0',
        tags: ['GitHub Actions', 'CI/CD', 'Docker', 'Kubernetes'],
        content: '',
        isPublic: true,
        isFeatured: false,
        downloads: 750,
        rating: 4.5,
        ratingCount: 42,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published'
      }
    ]
    totalTemplates.value = templates.value.length
  } catch (error) {
    console.error('搜索模板失败:', error)
    ElMessage.error('搜索模板失败')
  }
}

// 事件处理
const onSearch = () => {
  searchTemplates()
}

const selectCategory = (category: string) => {
  if (selectedCategory.value === category) {
    selectedCategory.value = ''
  } else {
    selectedCategory.value = category
  }
  searchTemplates()
}

const onFilterChange = () => {
  searchTemplates()
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index >= 0) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  searchTemplates()
}

const onSortChange = () => {
  searchTemplates()
}

const onPageChange = () => {
  searchTemplates()
}

const onPageSizeChange = () => {
  searchTemplates()
}

// 查看模板详情
const viewTemplateDetail = async (template: Template) => {
  currentTemplate.value = template
  detailDrawerVisible.value = true

  // 加载版本历史
  templateVersions.value = [
    {
      version: '1.2.0',
      content: '',
      changeLog: '优化性能，修复已知问题',
      createdAt: new Date()
    },
    {
      version: '1.1.0',
      content: '',
      changeLog: '新增健康检查功能',
      createdAt: new Date()
    }
  ]

  // 加载评论
  templateComments.value = [
    {
      id: '1',
      author: '张三',
      content: '非常好用的模板，部署很顺利！',
      rating: 5,
      createdAt: new Date()
    }
  ]

  // 加载相关模板
  relatedTemplates.value = templates.value.filter(t => t.id !== template.id).slice(0, 4)
}

// 快速部署
const quickDeploy = (template: Template) => {
  templateToDeploy.value = template
  showDeployDialog.value = true
}

// 部署模板
const deployTemplate = (template: Template) => {
  quickDeploy(template)
}

// 确认部署
const confirmDeploy = async () => {
  deploying.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('部署成功！')
    showDeployDialog.value = false
  } catch (error) {
    ElMessage.error('部署失败')
  } finally {
    deploying.value = false
  }
}

// 下载模板
const downloadTemplate = (template: Template) => {
  ElMessage.success(`正在下载 ${template.displayName}`)
}

// 评分模板
const rateTemplate = async (template: Template) => {
  try {
    const { value } = await ElMessageBox.prompt('请为模板评分 (1-5星)', '评分', {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      inputPattern: /^[1-5]$/,
      inputErrorMessage: '请输入1-5之间的数字'
    })
    ElMessage.success(`已评分: ${value}星`)
  } catch {
    // 用户取消
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentForm.content) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    templateComments.value.unshift({
      id: Date.now().toString(),
      author: '当前用户',
      content: commentForm.content,
      rating: commentForm.rating,
      createdAt: new Date()
    })

    commentForm.content = ''
    commentForm.rating = 5

    ElMessage.success('评论已发布')
  } catch (error) {
    ElMessage.error('发布评论失败')
  }
}

// 发布模板
const publishTemplate = async () => {
  try {
    // 验证
    if (!publishForm.name || !publishForm.displayName || !publishForm.description) {
      ElMessage.warning('请填写必填字段')
      return
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('模板发布成功！')
    showPublishDialog.value = false

    // 重置表单
    Object.assign(publishForm, {
      name: '',
      displayName: '',
      description: '',
      category: '',
      type: '',
      tags: [],
      content: '',
      isPublic: true
    })

    // 刷新列表
    await searchTemplates()
  } catch (error) {
    ElMessage.error('发布模板失败')
  }
}

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.template-marketplace {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .header-card {
    margin-bottom: 20px;

    .marketplace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 15px;

        .store-icon {
          color: #409EFF;
        }

        .title-area {
          h2 {
            margin: 0;
            font-size: 24px;
          }

          .subtitle {
            margin: 5px 0 0 0;
            color: #909399;
            font-size: 14px;
          }
        }
      }
    }

    .search-bar {
      margin: 20px 0;
    }

    .quick-categories {
      margin-top: 15px;
    }
  }

  .marketplace-content {
    display: flex;
    gap: 20px;

    .filter-panel {
      width: 280px;
      flex-shrink: 0;
      height: fit-content;
      position: sticky;
      top: 20px;

      .filter-section {
        margin: 15px 0;

        h3 {
          margin-bottom: 15px;
          font-size: 16px;
        }
      }
    }

    .template-list-area {
      flex: 1;

      .toolbar-card {
        margin-bottom: 20px;

        .list-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .result-count {
            color: #606266;
            font-size: 14px;
          }

          .toolbar-right {
            display: flex;
            gap: 10px;
            align-items: center;
          }
        }
      }

      .featured-section {
        margin-bottom: 20px;

        h3 {
          margin-bottom: 15px;
        }

        .featured-card {
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          padding: 30px;
          color: white;
          cursor: pointer;
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.02);
          }

          h2 {
            margin: 0 0 15px 0;
          }

          p {
            margin: 0 0 20px 0;
            opacity: 0.9;
          }

          .featured-meta {
            display: flex;
            gap: 20px;
            font-size: 14px;
          }
        }
      }

      .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;

        .template-card {
          cursor: pointer;
          transition: transform 0.3s;

          &:hover {
            transform: translateY(-5px);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;

            .template-icon {
              font-size: 32px;
            }
          }

          .template-name {
            margin: 10px 0;
            font-size: 18px;
          }

          .template-desc {
            color: #606266;
            font-size: 14px;
            margin: 10px 0;
            min-height: 60px;
          }

          .template-tags {
            margin: 15px 0;
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
          }

          .template-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-top: 1px solid #ebeef5;
            color: #909399;
            font-size: 14px;

            .meta-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
          }

          .card-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
          }
        }
      }

      .template-list {
        .template-list-item {
          margin-bottom: 15px;

          .list-item-content {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .item-left {
              display: flex;
              gap: 20px;
              flex: 1;

              .template-icon-large {
                font-size: 48px;
              }

              .item-info {
                flex: 1;

                h3 {
                  margin: 0 0 10px 0;
                }

                p {
                  color: #606266;
                  margin: 0 0 10px 0;
                }

                .item-tags {
                  display: flex;
                  gap: 5px;
                  flex-wrap: wrap;
                }
              }
            }

            .item-right {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 15px;

              .item-stats {
                display: flex;
                gap: 20px;
                color: #909399;
                font-size: 14px;

                .stat {
                  display: flex;
                  align-items: center;
                  gap: 5px;
                }
              }

              .item-actions {
                display: flex;
                gap: 10px;
              }
            }
          }
        }
      }

      .pagination-area {
        margin-top: 30px;
        display: flex;
        justify-content: center;
      }
    }
  }

  .template-detail {
    .comments-list {
      margin-top: 20px;

      .comment-item {
        padding: 15px;
        border-bottom: 1px solid #ebeef5;

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .comment-content {
          color: #606266;
          margin: 10px 0;
        }

        .comment-time {
          color: #909399;
          font-size: 12px;
        }
      }
    }

    .related-item {
      padding: 15px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      margin-bottom: 15px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409EFF;
        background: #ecf5ff;
      }

      h4 {
        margin: 0 0 10px 0;
      }

      p {
        color: #606266;
        margin: 0 0 10px 0;
        font-size: 14px;
      }

      .related-meta {
        display: flex;
        gap: 15px;
        color: #909399;
        font-size: 12px;
      }
    }

    .detail-actions {
      position: sticky;
      bottom: 0;
      background: white;
      padding: 20px 0;
      display: flex;
      gap: 10px;
      justify-content: center;
      border-top: 1px solid #ebeef5;
      margin-top: 30px;
    }
  }
}
</style>


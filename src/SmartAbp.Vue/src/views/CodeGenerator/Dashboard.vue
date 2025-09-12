<template>
  <div class="code-generator-dashboard">
    <!-- Loading Overlay -->
    <div v-if="isInitialLoading" class="loading-overlay">
      <div class="loading-spinner">
        <el-icon class="rotating"><Loading /></el-icon>
        <p>Initializing Code Generator...</p>
      </div>
    </div>

    <el-container v-else>
      <!-- Enhanced Header with Animation -->
      <el-header class="dashboard-header fade-in">
        <div class="header-content">
          <div class="title-section">
            <h1 class="gradient-text">🚀 SmartAbp Enterprise Code Generator</h1>
            <p class="subtitle">Generate world-class enterprise applications with cutting-edge patterns</p>
          </div>
          <div class="status-indicator">
            <el-badge :value="statistics?.totalGenerations || 0" class="status-badge">
              <el-button type="success" size="large" circle>
                <el-icon><Document /></el-icon>
              </el-button>
            </el-badge>
            <span class="status-text">Generated</span>
          </div>
        </div>
        <!-- Progress Bar for Active Generations -->
        <div v-if="hasActiveGenerations" class="progress-container">
          <el-progress
            :percentage="activeGenerationSessions[0]?.progressPercentage || 0"
            :status="activeGenerationSessions[0]?.progressPercentage === 100 ? 'success' : 'active'"
            :stroke-width="4"
            striped
            striped-flow
            :format="formatProgress"
          />
          <div class="progress-info">
            <span>{{ activeGenerationSessions[0]?.currentStep }}</span>
            <span class="progress-time">{{ formatProgressTime(activeGenerationSessions[0]?.elapsedTime?.totalMilliseconds || 0) }}</span>
          </div>
        </div>
      </el-header>

      <el-main>
        <el-row :gutter="20">
          <!-- Real-time Progress Tracking -->
          <el-col :span="24" v-if="hasActiveGenerations">
            <el-card class="progress-card">
              <div slot="header">
                <i class="el-icon-loading"></i> Active Generations
                <el-tag :type="isConnectedToProgress ? 'success' : 'danger'" size="mini" style="margin-left: 10px;">
                  {{ isConnectedToProgress ? 'Connected' : 'Disconnected' }}
                </el-tag>
              </div>

              <div v-for="session in activeGenerationSessions" :key="session.sessionId" class="progress-session">
                <div class="session-header">
                  <h4>{{ session.generationType }} Generation</h4>
                  <el-tag :type="session.status === 'Error' ? 'danger' : 'primary'" size="small">
                    {{ session.status }}
                  </el-tag>
                </div>

                <el-progress
                  :percentage="session.progressPercentage"
                  :status="session.status === 'Error' ? 'exception' : (session.progressPercentage === 100 ? 'success' : 'active')"
                  :stroke-width="8"
                  striped
                  striped-flow
                />

                <div class="session-details">
                  <p><strong>Step:</strong> {{ session.currentStep }}</p>
                  <p><strong>Files:</strong> {{ session.filesGenerated }}/{{ session.totalFiles || '?' }}</p>
                  <p><strong>Time:</strong> {{ formatProgressTime(session.elapsedTime?.totalMilliseconds || 0) }}</p>
                  <p v-if="session.message"><strong>Status:</strong> {{ session.message }}</p>
                  <p v-if="session.errorMessage" class="error-message">
                    <strong>Error:</strong> {{ session.errorMessage }}
                  </p>
                </div>
              </div>
            </el-card>
          </el-col>
          <!-- Statistics Card -->
          <el-col :span="24" :md="8">
            <el-card class="stats-card">
              <div slot="header">
                <i class="el-icon-data-line"></i> Generation Statistics
              </div>
              <div v-if="statistics">
                <div class="stat-item">
                  <span class="label">Total Generations:</span>
                  <span class="value">{{ statistics.totalGenerations }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Success Rate:</span>
                  <span class="value success">{{ successRate }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">Avg Generation Time:</span>
                  <span class="value">{{ formatTimeSpan(statistics.averageGenerationTime) }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Total Lines Generated:</span>
                  <span class="value">{{ statistics.totalLinesGenerated.toLocaleString() }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Memory Usage:</span>
                  <span class="value">{{ formatBytes(statistics.memoryUsage) }}</span>
                </div>
              </div>
              <el-button @click="loadStatistics" type="primary" size="small" style="margin-top: 10px;">
                <i class="el-icon-refresh"></i> Refresh
              </el-button>
            </el-card>
          </el-col>

          <!-- Quick Actions -->
          <el-col :span="24" :md="16">
            <el-card class="actions-card">
              <div slot="header">
                <i class="el-icon-magic-stick"></i> Quick Actions
              </div>
              <el-row :gutter="16">
                <el-col :span="12" :md="8" v-for="generator in generators" :key="generator.type">
                  <el-button
                    @click="openGenerator(generator.type)"
                    :type="generator.color"
                    class="generator-button"
                    :loading="isGenerating === generator.type">
                    <i :class="generator.icon"></i>
                    {{ generator.name }}
                  </el-button>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>

        <!-- Generator Forms -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card v-if="activeGenerator">
              <div slot="header">
                <span>{{ getGeneratorTitle(activeGenerator) }}</span>
                <el-button @click="closeGenerator" style="float: right; padding: 3px 0" type="text">
                  <i class="el-icon-close"></i>
                </el-button>
              </div>

              <!-- Entity Designer -->
              <div v-if="activeGenerator === 'entity'">
                <EntityDesigner @entityGenerated="onEntityGenerated" />
              </div>

              <!-- Enterprise Solution Generator Form -->
              <div v-if="activeGenerator === 'enterprise'">
                <el-form :model="enterpriseForm" label-width="200px">
                  <el-form-item label="Solution Name">
                    <el-input v-model="enterpriseForm.solutionName" placeholder="e.g., ECommerceSolution"></el-input>
                  </el-form-item>

                  <el-form-item label="Components to Generate">
                    <el-checkbox-group v-model="enterpriseComponents">
                      <el-checkbox label="includeDdd">Domain-Driven Design (DDD)</el-checkbox>
                      <el-checkbox label="includeCqrs">CQRS with MediatR</el-checkbox>
                      <el-checkbox label="includeApplicationServices">Application Services</el-checkbox>
                      <el-checkbox label="includeInfrastructure">Infrastructure Layer</el-checkbox>
                      <el-checkbox label="includeAspire">Aspire Microservices</el-checkbox>
                      <el-checkbox label="includeCaching">Distributed Caching</el-checkbox>
                      <el-checkbox label="includeMessaging">Message Queue</el-checkbox>
                      <el-checkbox label="includeTests">Unit Tests</el-checkbox>
                      <el-checkbox label="includeTelemetry">Telemetry & Monitoring</el-checkbox>
                      <el-checkbox label="includeQuality">Code Quality</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>

                  <el-form-item>
                    <el-button @click="generateEnterpriseSolution" type="primary" :loading="isGenerating === 'enterprise'">
                      <i class="el-icon-magic-stick"></i> Generate Enterprise Solution
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Generation Results with Code Preview -->
        <el-row v-if="generationResult" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card>
              <div slot="header">
                <i class="el-icon-document"></i> Generation Result
                <el-tag :type="generationResult.success ? 'success' : 'danger'" style="margin-left: 10px;">
                  {{ generationResult.success ? 'Success' : 'Failed' }}
                </el-tag>
              </div>

              <div v-if="generationResult.success">
                <div class="result-summary">
                  <p><strong>Generated at:</strong> {{ formatDate(generationResult.generatedAt) }}</p>
                  <p><strong>Generation time:</strong> {{ formatTimeSpan(generationResult.generationTime) }}</p>
                  <p><strong>Files generated:</strong> {{ generationResult.fileCount }}</p>
                  <p><strong>Lines of code:</strong> {{ generationResult.linesOfCode }}</p>
                </div>

                <!-- Code Preview Component -->
                <div class="code-preview-section">
                  <CodePreview
                    v-if="generationResult.data"
                    :code="getGeneratedCode()"
                    :files="getGeneratedFiles()"
                    :language="getCodeLanguage()"
                    :fileName="getGeneratedFileName()"
                    :show-statistics="true"
                  />
                </div>

                <el-button @click="downloadResult" type="success" style="margin-top: 10px;">
                  <i class="el-icon-download"></i> Download Generated Code
                </el-button>
              </div>

              <div v-else>
                <el-alert
                  :title="generationResult.error"
                  type="error"
                  :description="generationResult.details"
                  show-icon>
                </el-alert>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
// @ts-nocheck // Legacy view pending refactor to Composition API; excluded from P0/P2 quality path
import { codeGeneratorApi } from '@smartabp/lowcode-api'
import CodePreview from '@smartabp/lowcode-designer/components/CodeGenerator/CodePreview.vue'
import EntityDesigner from '@smartabp/lowcode-designer/components/CodeGenerator/EntityDesigner.vue'

export default {
  name: 'CodeGeneratorDashboard',
  components: {
    CodePreview,
    EntityDesigner
  },
  data() {
    return {
      statistics: null,
      activeGenerator: null,
      isGenerating: false,
      generationResult: null,

      generators: [
        { type: 'entity', name: 'Entity', icon: 'el-icon-document-add', color: 'primary' },
        { type: 'ddd', name: 'DDD Domain', icon: 'el-icon-collection', color: 'success' },
        { type: 'cqrs', name: 'CQRS', icon: 'el-icon-share', color: 'warning' },
        { type: 'application', name: 'App Services', icon: 'el-icon-service', color: 'info' },
        { type: 'infrastructure', name: 'Infrastructure', icon: 'el-icon-cpu', color: 'danger' },
        { type: 'aspire', name: 'Aspire µServices', icon: 'el-icon-cloudy', color: 'primary' },
        { type: 'caching', name: 'Caching', icon: 'el-icon-lightning', color: 'success' },
        { type: 'messaging', name: 'Messaging', icon: 'el-icon-message', color: 'warning' },
        { type: 'tests', name: 'Unit Tests', icon: 'el-icon-check', color: 'info' },
        { type: 'telemetry', name: 'Telemetry', icon: 'el-icon-view', color: 'danger' },
        { type: 'quality', name: 'Code Quality', icon: 'el-icon-medal', color: 'primary' },
        { type: 'enterprise', name: 'Full Solution', icon: 'el-icon-star-on', color: 'success' }
      ],


      // Add new form data
      dddForm: {
        moduleName: '',
        namespace: ''
      },

      entityForm: {
        name: '',
        module: '',
        aggregate: '',
        description: '',
        isAggregateRoot: true,
        isMultiTenant: true,
        isSoftDelete: true,
        hasExtraProperties: true,
        properties: []
      },

      enterpriseForm: {
        solutionName: ''
      },

      enterpriseComponents: [
        'includeDdd',
        'includeCqrs',
        'includeApplicationServices',
        'includeInfrastructure',
        'includeAspire',
        'includeCaching',
        'includeMessaging',
        'includeTests',
        'includeTelemetry',
        'includeQuality'
    }
  },

  computed: {
    successRate() {
      if (!this.statistics || this.statistics.totalGenerations === 0) return 0
      return Math.round((this.statistics.successfulGenerations / this.statistics.totalGenerations) * 100)
    }
  },

  async mounted() {
    await this.loadStatistics()
  },

  methods: {
    async loadStatistics() {
      try {
        this.statistics = await codeGeneratorApi.getStatistics()
      } catch (error) {
        this.$message.error('Failed to load statistics: ' + error.message)
      }
    },

    openGenerator(type) {
      this.activeGenerator = type
      this.generationResult = null
    },

    closeGenerator() {
      this.activeGenerator = null
      this.generationResult = null
    },

    getGeneratorTitle(type) {
      const generator = this.generators.find(g => g.type === type)
      return generator ? `Generate ${generator.name}` : 'Code Generator'
    },

    addProperty() {
      this.entityForm.properties.push({
        name: '',
        type: 'string',
        isRequired: false,
        maxLength: null,
        description: ''
      })
    },

    removeProperty(index) {
      this.entityForm.properties.splice(index, 1)
    },


    onEntityGenerated(result) {
      this.generationResult = {
        success: true,
        generatedAt: result.metadata.generatedAt,
        generationTime: result.generationTime,
        fileCount: 1,
        linesOfCode: result.metadata.linesOfCode,
        data: result,
        sessionId: result.sessionId
      }

      this.$message.success('Entity generated successfully!')
      this.loadStatistics()
    },

    async generateDdd() {
      this.isGenerating = 'ddd'
      try {
        const result = await codeGeneratorApi.generateDdd({
          moduleName: this.dddForm.moduleName,
          namespace: this.dddForm.namespace,
          description: `DDD Domain for ${this.dddForm.moduleName}`,
          aggregates: [],
          valueObjects: [],
          domainEvents: [],
          specifications: [],
          domainServices: [],
          repositories: [],
          useMultiTenancy: true,
          useSoftDelete: true,
          useAuditing: true,
          useExtraProperties: true,
          defaultKeyType: 'Guid'
        })

        this.generationResult = {
          success: true,
          generatedAt: result.generatedAt,
          generationTime: result.generationTime,
          fileCount: Object.keys(result.files || {}).length,
          linesOfCode: result.totalLinesOfCode || 0,
          data: result
        }

        this.$message.success('DDD domain generated successfully!')
        await this.loadStatistics()
      } catch (error) {
        this.generationResult = {
          success: false,
          error: 'Generation Failed',
          details: error.message
        }
        this.$message.error('Failed to generate DDD domain: ' + error.message)
      } finally {
        this.isGenerating = false
      }
    },

    async generateEnterpriseSolution() {
      this.isGenerating = 'enterprise'
      try {
        const enterpriseRequest = {
          solutionName: this.enterpriseForm.solutionName,
          ...Object.fromEntries(this.enterpriseComponents.map(c => [c, true])),
          // Add minimal definitions for each component
          dddDefinition: { moduleName: this.enterpriseForm.solutionName, namespace: `${this.enterpriseForm.solutionName}.Domain` },
          cqrsDefinition: { moduleName: this.enterpriseForm.solutionName, namespace: `${this.enterpriseForm.solutionName}.Application` },
          applicationServiceDefinition: { serviceName: `${this.enterpriseForm.solutionName}AppService`, namespace: `${this.enterpriseForm.solutionName}.Application` },
          infrastructureDefinition: { moduleName: this.enterpriseForm.solutionName, namespace: `${this.enterpriseForm.solutionName}.Infrastructure` },
          aspireDefinition: { solutionName: this.enterpriseForm.solutionName, rootNamespace: this.enterpriseForm.solutionName },
          cachingDefinition: { moduleName: this.enterpriseForm.solutionName, namespace: `${this.enterpriseForm.solutionName}.Caching` },
          messagingDefinition: { moduleName: this.enterpriseForm.solutionName, namespace: `${this.enterpriseForm.solutionName}.Messaging` },
          testDefinition: { moduleName: this.enterpriseForm.solutionName, namespace: `${this.enterpriseForm.solutionName}.Tests` },
          telemetryDefinition: { moduleName: this.enterpriseForm.solutionName, namespace: `${this.enterpriseForm.solutionName}.Telemetry` },
          qualityDefinition: { moduleName: this.enterpriseForm.solutionName, namespace: `${this.enterpriseForm.solutionName}.Quality` }
        }

        const result = await codeGeneratorApi.generateEnterpriseSolution(enterpriseRequest)
        this.generationResult = {
          success: result.isSuccess,
          generatedAt: result.generatedAt,
          generationTime: { totalMilliseconds: 0 }, // Enterprise generation doesn't return this
          fileCount: Object.values(result.components).reduce((sum, component) => sum + (component.files ? Object.keys(component.files).length : 0), 0),
          linesOfCode: Object.values(result.components).reduce((sum, component) => sum + (component.totalLinesOfCode || 0), 0),
          data: result
        }
        this.$message.success('Enterprise solution generated successfully!')
        await this.loadStatistics()
      } catch (error) {
        this.generationResult = {
          success: false,
          error: 'Generation Failed',
          details: error.message
        }
        this.$message.error('Failed to generate enterprise solution: ' + error.message)
      } finally {
        this.isGenerating = false
      }
    },

    downloadResult() {
      if (!this.generationResult?.data) return

      const dataStr = JSON.stringify(this.generationResult.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-code-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString()
    },

    formatTimeSpan(timeSpan) {
      if (!timeSpan) return 'N/A'
      if (timeSpan.totalMilliseconds !== undefined) {
        return `${timeSpan.totalMilliseconds.toFixed(2)}ms`
      }
      return timeSpan.toString()
    },

    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // Progress tracking methods
    getProgressForSession(sessionId) {
      return getSessionProgress(sessionId)
    },

    formatProgressTime(milliseconds) {
      return formatElapsedTime(milliseconds)
    },

    formatProgress(percentage) {
      return `${percentage}%`
    },

    // Code preview methods
    getGeneratedCode() {
      if (!this.generationResult?.data) return ''

      // For single code generation
      if (this.generationResult.data.code) {
        return this.generationResult.data.code
      }

      // For multiple files, return the first file or main file
      const files = this.getGeneratedFiles()
      if (Object.keys(files).length > 0) {
        const mainFile = Object.keys(files).find(key =>
          key.toLowerCase().includes('aggregate') ||
          key.toLowerCase().includes('entity') ||
          key.toLowerCase().includes('command') ||
          key.toLowerCase().includes('service')
        )
        return files[mainFile || Object.keys(files)[0]] || ''
      }

      return ''
    },

    getGeneratedFiles() {
      if (!this.generationResult?.data?.files) return {}
      return this.generationResult.data.files
    },

    getCodeLanguage() {
      const fileName = this.getGeneratedFileName()
      const extension = fileName.split('.').pop()?.toLowerCase()

      const languageMap = {
        'cs': 'csharp',
        'ts': 'typescript',
        'js': 'javascript',
        'vue': 'vue',
        'json': 'json',
        'xml': 'xml',
        'sql': 'sql'
      }

      return languageMap[extension] || 'csharp'
    },

    getGeneratedFileName() {
      const files = this.getGeneratedFiles()
      if (Object.keys(files).length > 0) {
        return Object.keys(files)[0]
      }

      const generationType = this.activeGenerator || 'entity'
      return `Generated${generationType.charAt(0).toUpperCase() + generationType.slice(1)}.cs`
    }
  }
</script>

<style scoped>
.code-generator-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.dashboard-header {
  background: rgb(255 255 255 / 90%);
  text-align: center;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.dashboard-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: bold;
}

.dashboard-header p {
  margin: 10px 0 0;
  color: #7f8c8d;
  font-size: 1.2rem;
}

.stats-card, .actions-card {
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #ecf0f1;
}

.stat-item .label {
  color: #7f8c8d;
  font-weight: 500;
}

.stat-item .value {
  font-weight: bold;
  color: #2c3e50;
}

.stat-item .value.success {
  color: #27ae60;
}

.generator-button {
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.generator-button i {
  font-size: 20px;
  margin-bottom: 5px;
}

.property-item {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
}

.el-card {
  border-radius: 10px;
}

.el-card /deep/ .el-card__header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
}

.result-summary {
  margin-bottom: 20px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.result-summary p {
  margin: 8px 0;
  font-size: 14px;
}

.result-summary strong {
  color: #303133;
}

.code-preview-section {
  margin: 20px 0;
}

/* Progress tracking styles */
.progress-card {
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
}

.progress-session {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.session-header h4 {
  margin: 0;
  color: #303133;
}

.session-details {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.session-details p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.error-message {
  color: #f56c6c !important;
  font-weight: 500;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.progress-time {
  font-weight: 500;
}
</style>

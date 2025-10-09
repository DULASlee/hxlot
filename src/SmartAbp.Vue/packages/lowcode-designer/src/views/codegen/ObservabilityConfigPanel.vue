<template>
  <div class="observability-config-panel">
    <el-card>
      <template #header>
        <span>可观测性配置</span>
      </template>

      <el-tabs v-model="activeTab">
        <!-- Prometheus配置 -->
        <el-tab-pane
          label="Prometheus"
          name="prometheus"
        >
          <el-form
            :model="config.prometheus"
            label-width="140px"
          >
            <el-form-item label="抓取间隔">
              <el-input
                v-model="config.prometheus.scrapeInterval"
                placeholder="15s"
              />
            </el-form-item>

            <el-form-item label="评估间隔">
              <el-input
                v-model="config.prometheus.evaluationInterval"
                placeholder="15s"
              />
            </el-form-item>

            <el-form-item label="启用ServiceMonitor">
              <el-switch v-model="config.prometheus.enableServiceMonitor" />
            </el-form-item>

            <el-divider>抓取配置</el-divider>

            <el-form-item
              v-for="(scrape, index) in config.prometheus.scrapeConfigs"
              :key="index"
              :label="`Job ${index + 1}`"
            >
              <el-input
                v-model="scrape.jobName"
                placeholder="服务名称"
                style="margin-bottom: 8px"
              />
              <el-input
                v-model="scrape.metricsPath"
                placeholder="/metrics"
              />
            </el-form-item>

            <el-form-item>
              <el-button @click="addScrapeConfig">
                添加抓取配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Grafana配置 -->
        <el-tab-pane
          label="Grafana"
          name="grafana"
        >
          <el-form
            :model="config.grafana"
            label-width="140px"
          >
            <el-form-item label="仪表板标题">
              <el-input
                v-model="config.grafana.title"
                placeholder="服务监控"
              />
            </el-form-item>

            <el-form-item label="描述">
              <el-input
                v-model="config.grafana.description"
                type="textarea"
                :rows="3"
                placeholder="仪表板描述"
              />
            </el-form-item>

            <el-form-item label="刷新间隔(秒)">
              <el-input-number
                v-model="config.grafana.refreshInterval"
                :min="5"
                :max="300"
              />
            </el-form-item>

            <el-form-item label="标签">
              <el-select
                v-model="config.grafana.tags"
                multiple
                filterable
                allow-create
                placeholder="添加标签"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 告警规则 -->
        <el-tab-pane
          label="告警规则"
          name="alerts"
        >
          <el-form label-width="140px">
            <div
              v-for="(alert, index) in config.prometheus.alertRules"
              :key="index"
              class="alert-rule-item"
            >
              <el-form-item label="告警名称">
                <el-input
                  v-model="alert.name"
                  placeholder="HighErrorRate"
                />
              </el-form-item>

              <el-form-item label="PromQL表达式">
                <el-input
                  v-model="alert.expression"
                  type="textarea"
                  :rows="2"
                  placeholder="rate(http_requests_total{status='500'}[5m]) > 0.05"
                />
              </el-form-item>

              <el-form-item label="持续时间">
                <el-input
                  v-model="alert.duration"
                  placeholder="5m"
                />
              </el-form-item>

              <el-form-item label="严重程度">
                <el-select v-model="alert.severity">
                  <el-option
                    label="Info"
                    value="info"
                  />
                  <el-option
                    label="Warning"
                    value="warning"
                  />
                  <el-option
                    label="Critical"
                    value="critical"
                  />
                </el-select>
              </el-form-item>

              <el-button
                type="danger"
                size="small"
                @click="removeAlertRule(index)"
              >
                删除规则
              </el-button>
              <el-divider v-if="index < config.prometheus.alertRules.length - 1" />
            </div>

            <el-form-item>
              <el-button @click="addAlertRule">
                添加告警规则
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="action-buttons">
        <el-button
          type="primary"
          @click="handleSave"
        >
          保存配置
        </el-button>
        <el-button @click="handlePreview">
          预览配置
        </el-button>
        <el-button
          type="success"
          @click="handleGenerate"
        >
          生成配置文件
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { PrometheusConfig, GrafanaDashboard, ScrapeConfig, AlertRule } from '@smartabp/lowcode-api'

interface ObservabilityConfig {
  prometheus: PrometheusConfig
  grafana: GrafanaDashboard
}

const activeTab = ref('prometheus')

const config = reactive<ObservabilityConfig>({
  prometheus: {
    scrapeInterval: '15s',
    evaluationInterval: '15s',
    scrapeConfigs: [],
    alertRules: [],
    enableServiceMonitor: true
  },
  grafana: {
    title: '',
    description: '',
    panels: [],
    tags: [],
    refreshInterval: 30
  }
})

const addScrapeConfig = () => {
  const newScrape: ScrapeConfig = {
    jobName: '',
    staticTargets: [],
    metricsPath: '/metrics',
    labels: {}
  }
  config.prometheus.scrapeConfigs.push(newScrape)
}

const addAlertRule = () => {
  const newAlert: AlertRule = {
    name: '',
    expression: '',
    duration: '5m',
    severity: 'warning',
    labels: {},
    annotations: {}
  }
  config.prometheus.alertRules.push(newAlert)
}

const removeAlertRule = (index: number) => {
  config.prometheus.alertRules.splice(index, 1)
}

const handleSave = () => {
  ElMessage.success('配置已保存')
}

const handlePreview = () => {
  console.log('预览配置:', config)
  ElMessage.info('配置预览已输出到控制台')
}

const handleGenerate = () => {
  ElMessage.success('配置文件生成成功')
}
</script>

<style scoped lang="scss">
.observability-config-panel {
  padding: 20px;

  .alert-rule-item {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .action-buttons {
    margin-top: 24px;
    text-align: right;
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>


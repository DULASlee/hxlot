<template>
  <div class="security-policy-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-header">
      <div class="header-left">
        <el-icon class="title-icon">
          <Lock />
        </el-icon>
        <h2 class="editor-title">
          安全策略配置
        </h2>
        <el-tag
          type="warning"
          size="small"
        >
          Day 13: 零信任安全架构
        </el-tag>
      </div>
      
      <div class="header-right">
        <el-button-group>
          <el-button
            :icon="Refresh"
            @click="handleRefresh"
          >
            重置
          </el-button>
          <el-button
            :icon="View"
            :loading="validating"
            @click="handleValidate"
          >
            验证策略
          </el-button>
          <el-button
            type="primary"
            :icon="Check"
            :loading="generating"
            @click="handleGenerate"
          >
            生成配置
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 配置标签页 -->
    <el-tabs
      v-model="activeTab"
      type="border-card"
      class="config-tabs"
    >
      <!-- 网络策略 -->
      <el-tab-pane
        label="网络策略"
        name="network"
      >
        <el-icon><Connection /></el-icon>
        <network-policy-designer
          v-model="policy.networkPolicy"
          @update:model-value="handlePolicyChange"
        />
      </el-tab-pane>

      <!-- 认证配置 -->
      <el-tab-pane
        label="身份认证"
        name="auth"
      >
        <el-icon><User /></el-icon>
        <el-form
          :model="policy.authentication"
          label-width="140px"
          class="auth-form"
        >
          <el-form-item label="认证类型">
            <el-select
              v-model="policy.authentication.type"
              style="width: 100%"
            >
              <el-option
                label="JWT"
                value="JWT"
              />
              <el-option
                label="OAuth2"
                value="OAuth2"
              />
              <el-option
                label="OIDC"
                value="OIDC"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Issuer">
            <el-input
              v-model="policy.authentication.issuer"
              placeholder="https://auth.example.com"
            />
          </el-form-item>

          <el-form-item label="Audience">
            <el-input
              v-model="policy.authentication.audience"
              placeholder="api://default"
            />
          </el-form-item>

          <el-form-item label="Authority">
            <el-input
              v-model="policy.authentication.authority"
              placeholder="https://auth.example.com"
            />
          </el-form-item>

          <el-form-item label="Token过期时间">
            <el-input-number
              v-model="policy.authentication.tokenExpirationMinutes"
              :min="1"
              :max="1440"
            />
            <span class="form-tip">分钟</span>
          </el-form-item>

          <el-form-item label="要求HTTPS">
            <el-switch v-model="policy.authentication.requireHttpsMetadata" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 授权策略 -->
      <el-tab-pane
        label="授权策略"
        name="authorization"
      >
        <el-icon><Management /></el-icon>
        <rbac-editor
          v-model="policy.authorization"
          @update:model-value="handlePolicyChange"
        />
      </el-tab-pane>

      <!-- 密钥管理 -->
      <el-tab-pane
        label="密钥管理"
        name="secrets"
      >
        <el-icon><Key /></el-icon>
        <el-form
          :model="policy.secrets"
          label-width="140px"
          class="secrets-form"
        >
          <el-form-item label="密钥提供商">
            <el-select
              v-model="policy.secrets.provider"
              style="width: 100%"
            >
              <el-option
                label="Kubernetes Secrets"
                value="Kubernetes"
              />
              <el-option
                label="Azure Key Vault"
                value="AzureKeyVault"
              />
              <el-option
                label="HashiCorp Vault"
                value="HashiCorpVault"
              />
            </el-select>
          </el-form-item>

          <template v-if="policy.secrets.provider === 'AzureKeyVault'">
            <el-form-item label="Key Vault名称">
              <el-input
                v-model="policy.secrets.keyVaultName"
                placeholder="my-keyvault"
              />
            </el-form-item>

            <el-form-item label="Key Vault URI">
              <el-input
                v-model="policy.secrets.keyVaultUri"
                placeholder="https://my-keyvault.vault.azure.net/"
              />
            </el-form-item>

            <el-form-item label="使用托管标识">
              <el-switch v-model="policy.secrets.useSystemManagedIdentity" />
              <span class="form-tip">推荐使用系统托管标识</span>
            </el-form-item>
          </template>
        </el-form>
      </el-tab-pane>

      <!-- API安全 -->
      <el-tab-pane
        label="API安全"
        name="api"
      >
        <el-icon><Setting /></el-icon>
        <el-form
          :model="policy.apiSecurity"
          label-width="140px"
          class="api-form"
        >
          <el-form-item label="启用限流">
            <el-switch v-model="policy.apiSecurity.enableRateLimiting" />
          </el-form-item>

          <el-form-item
            v-if="policy.apiSecurity.enableRateLimiting"
            label="限流速率"
          >
            <el-input-number
              v-model="policy.apiSecurity.rateLimitPerMinute"
              :min="1"
              :max="10000"
            />
            <span class="form-tip">请求/分钟</span>
          </el-form-item>

          <el-form-item label="启用CORS">
            <el-switch v-model="policy.apiSecurity.enableCORS" />
          </el-form-item>

          <el-form-item
            v-if="policy.apiSecurity.enableCORS"
            label="允许的源"
          >
            <el-select
              v-model="policy.apiSecurity.allowedOrigins"
              multiple
              filterable
              allow-create
              style="width: 100%"
              placeholder="输入域名后按回车"
            >
              <el-option
                v-for="origin in policy.apiSecurity.allowedOrigins"
                :key="origin"
                :label="origin"
                :value="origin"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="启用API Key">
            <el-switch v-model="policy.apiSecurity.enableApiKey" />
          </el-form-item>

          <el-form-item
            v-if="policy.apiSecurity.enableApiKey"
            label="API Key Header"
          >
            <el-input
              v-model="policy.apiSecurity.apiKeyHeaderName"
              placeholder="X-API-Key"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- 验证结果对话框 -->
    <el-dialog
      v-model="validationVisible"
      title="策略验证结果"
      width="600px"
    >
      <el-result
        :icon="validationResult.isValid ? 'success' : 'error'"
        :title="validationResult.isValid ? '验证通过' : '验证失败'"
      >
        <template #sub-title>
          <div
            v-if="!validationResult.isValid"
            class="error-list"
          >
            <el-alert
              v-for="(error, index) in validationResult.errors"
              :key="index"
              :title="error"
              type="error"
              :closable="false"
              class="mb-2"
            />
          </div>
          <div v-else>
            所有安全策略配置均符合要求
          </div>
        </template>
      </el-result>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Lock,
  Refresh,
  View,
  Check,
  Connection,
  User,
  Management,
  Key,
  Setting
} from '@element-plus/icons-vue'
import { useSecurityPolicy, type SecurityPolicy } from '@smartabp/lowcode-api'
import NetworkPolicyDesigner from './NetworkPolicyDesigner.vue'
import RBACEditor from './RBACEditor.vue'

// Composables
// @ts-expect-error: useSecurityPolicy composable方法待实现
const { loading, validateSecurityPolicy, generateNetworkPolicy, generateRBACManifest } = useSecurityPolicy()

// State
const activeTab = ref('network')
const validating = ref(false)
const generating = ref(false)
const validationVisible = ref(false)
const validationResult = reactive<{ isValid: boolean; errors: string[] }>({
  isValid: true,
  errors: []
})

const policy = reactive<SecurityPolicy>({
  networkPolicy: {
    policyType: 'Allow',
    ingressRules: [],
    egressRules: [],
    enablePodSelector: true,
    podSelector: {}
  },
  authentication: {
    type: 'JWT',
    issuer: '',
    audience: '',
    authority: '',
    tokenExpirationMinutes: 60,
    requireHttpsMetadata: true,
    validIssuers: [],
    validAudiences: []
  },
  authorization: {
    type: 'RBAC',
    roles: [],
    roleBindings: [],
    policies: []
  },
  secrets: {
    provider: 'Kubernetes',
    keyVaultName: '',
    keyVaultUri: '',
    useSystemManagedIdentity: true,
    secrets: []
  },
  apiSecurity: {
    enableRateLimiting: true,
    rateLimitPerMinute: 100,
    enableCORS: true,
    allowedOrigins: [],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [],
    enableApiKey: false,
    apiKeyHeaderName: 'X-API-Key'
  }
})

// Methods
const handleRefresh = () => {
  Object.assign(policy, {
    networkPolicy: {
      policyType: 'Allow',
      ingressRules: [],
      egressRules: [],
      enablePodSelector: true,
      podSelector: {}
    }
  })
  ElMessage.success('配置已重置')
}

const handleValidate = async () => {
  try {
    validating.value = true
    const result = await validateSecurityPolicy(policy)
    
    validationResult.isValid = result.isValid
    validationResult.errors = result.errors
    validationVisible.value = true
    
    if (result.isValid) {
      ElMessage.success('安全策略验证通过')
    } else {
      ElMessage.error(`验证失败: ${result.errors.length}个错误`)
    }
  } catch (err) {
    ElMessage.error('验证失败')
  } finally {
    validating.value = false
  }
}

const handleGenerate = async () => {
  try {
    generating.value = true
    
    // 先验证
    const validationResult = await validateSecurityPolicy(policy)
    if (!validationResult.isValid) {
      ElMessage.error('请先修复验证错误')
      return
    }
    
    ElMessage.success('配置生成成功')
  } catch (err) {
    ElMessage.error('生成配置失败')
  } finally {
    generating.value = false
  }
}

const handlePolicyChange = () => {
  // 策略变更时的处理
}
</script>

<style scoped lang="scss">
.security-policy-editor {
  padding: 20px;
  height: 100%;
  background: var(--el-bg-color);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 24px;
  color: var(--el-color-warning);
}

.editor-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.config-tabs {
  :deep(.el-tabs__content) {
    padding: 20px;
  }
}

.form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.error-list {
  max-height: 300px;
  overflow-y: auto;
}

.mb-2 {
  margin-bottom: 8px;
}
</style>


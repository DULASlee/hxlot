<template>
  <div class="cicd-pipeline-editor">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span class="title">🔄 GitOps工作流配置</span>
          <el-button-group>
            <el-button
              :type="activeTab === 'cicd' ? 'primary' : ''"
              @click="activeTab = 'cicd'"
            >
              CI/CD配置
            </el-button>
            <el-button
              :type="activeTab === 'gitops' ? 'primary' : ''"
              @click="activeTab = 'gitops'"
            >
              GitOps配置
            </el-button>
          </el-button-group>
        </div>
      </template>

      <!-- CI/CD配置面板 -->
      <div
        v-if="activeTab === 'cicd'"
        class="config-panel"
      >
        <el-form
          :model="cicdConfig"
          label-width="140px"
        >
          <el-form-item label="CI/CD平台">
            <el-select
              v-model="cicdPlatform"
              @change="onPlatformChange"
            >
              <el-option
                label="GitHub Actions"
                value="github"
              />
              <el-option
                label="GitLab CI"
                value="gitlab"
              />
              <el-option
                label="Azure DevOps"
                value="azure"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="服务名称">
            <el-input
              v-model="cicdConfig.serviceName"
              placeholder="请输入服务名称"
            />
          </el-form-item>

          <el-form-item label="触发分支">
            <el-select
              v-model="cicdConfig.triggerBranches"
              multiple
              placeholder="选择触发分支"
            >
              <el-option
                label="main"
                value="main"
              />
              <el-option
                label="master"
                value="master"
              />
              <el-option
                label="develop"
                value="develop"
              />
              <el-option
                label="release/*"
                value="release/*"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="容器镜像仓库">
            <el-select v-model="cicdConfig.containerRegistry">
              <el-option
                label="GitHub Container Registry"
                value="ghcr.io"
              />
              <el-option
                label="Docker Hub"
                value="docker.io"
              />
              <el-option
                label="Azure Container Registry"
                value="xxx.azurecr.io"
              />
              <el-option
                label="阿里云容器镜像服务"
                value="registry.cn-hangzhou.aliyuncs.com"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Dockerfile路径">
            <el-input
              v-model="cicdConfig.dockerfilePath"
              placeholder="Dockerfile"
            />
          </el-form-item>

          <el-form-item label="启用测试">
            <el-switch v-model="cicdConfig.enableTests" />
          </el-form-item>

          <el-form-item label="启用代码扫描">
            <el-switch v-model="cicdConfig.enableCodeScan" />
          </el-form-item>

          <el-form-item label="自动部署">
            <el-switch v-model="cicdConfig.enableAutoDeploy" />
          </el-form-item>

          <el-form-item
            v-if="cicdConfig.enableAutoDeploy"
            label="部署环境"
          >
            <el-select v-model="cicdConfig.deployEnvironment">
              <el-option
                label="Development"
                value="development"
              />
              <el-option
                label="Staging"
                value="staging"
              />
              <el-option
                label="Production"
                value="production"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="generateCICDPipeline"
            >
              生成Pipeline配置
            </el-button>
            <el-button @click="previewPipeline">
              预览配置
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Pipeline预览 -->
        <el-card
          v-if="generatedPipeline"
          class="pipeline-preview"
        >
          <template #header>
            <div class="card-header">
              <span>生成的Pipeline配置</span>
              <div>
                <el-tag
                  type="info"
                  style="margin-right: 10px"
                >
                  {{ generatedPipeline.platform }}
                </el-tag>
                <el-button
                  size="small"
                  @click="copyPipeline"
                >
                  复制配置
                </el-button>
                <el-button
                  size="small"
                  @click="downloadPipeline"
                >
                  下载文件
                </el-button>
              </div>
            </div>
          </template>
          <div class="file-path">
            <el-icon><Document /></el-icon>
            <span>{{ generatedPipeline.filePath }}</span>
          </div>
          <pre><code>{{ generatedPipeline.workflowContent }}</code></pre>
        </el-card>
      </div>

      <!-- GitOps配置面板 -->
      <div
        v-if="activeTab === 'gitops'"
        class="config-panel"
      >
        <el-form
          :model="gitopsConfig"
          label-width="140px"
        >
          <el-form-item label="GitOps平台">
            <el-select
              v-model="gitopsPlatform"
              @change="onGitOpsPlatformChange"
            >
              <el-option
                label="ArgoCD"
                value="argocd"
              />
              <el-option
                label="Flux CD"
                value="flux"
              />
            </el-select>
          </el-form-item>

          <!-- ArgoCD配置 -->
          <template v-if="gitopsPlatform === 'argocd'">
            <el-form-item label="应用名称">
              <el-input v-model="gitopsConfig.argocd.applicationName" />
            </el-form-item>
            <el-form-item label="项目名称">
              <el-input v-model="gitopsConfig.argocd.projectName" />
            </el-form-item>
            <el-form-item label="Git仓库URL">
              <el-input
                v-model="gitopsConfig.argocd.gitRepoUrl"
                placeholder="https://github.com/org/repo.git"
              />
            </el-form-item>
            <el-form-item label="目标分支/标签">
              <el-input
                v-model="gitopsConfig.argocd.targetRevision"
                placeholder="HEAD"
              />
            </el-form-item>
            <el-form-item label="Manifest路径">
              <el-input
                v-model="gitopsConfig.argocd.manifestPath"
                placeholder="k8s/"
              />
            </el-form-item>
            <el-form-item label="目标命名空间">
              <el-input
                v-model="gitopsConfig.argocd.targetNamespace"
                placeholder="default"
              />
            </el-form-item>
            <el-form-item label="同步策略">
              <el-radio-group v-model="gitopsConfig.argocd.syncPolicy">
                <el-radio label="Automated">
                  自动同步
                </el-radio>
                <el-radio label="Manual">
                  手动同步
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </template>

          <!-- Flux CD配置 -->
          <template v-if="gitopsPlatform === 'flux'">
            <el-form-item label="应用名称">
              <el-input v-model="gitopsConfig.flux.applicationName" />
            </el-form-item>
            <el-form-item label="仓库名称">
              <el-input v-model="gitopsConfig.flux.repositoryName" />
            </el-form-item>
            <el-form-item label="Git仓库URL">
              <el-input
                v-model="gitopsConfig.flux.gitRepoUrl"
                placeholder="https://github.com/org/repo.git"
              />
            </el-form-item>
            <el-form-item label="目标分支">
              <el-input
                v-model="gitopsConfig.flux.targetBranch"
                placeholder="main"
              />
            </el-form-item>
            <el-form-item label="Manifest路径">
              <el-input
                v-model="gitopsConfig.flux.manifestPath"
                placeholder="./k8s"
              />
            </el-form-item>
            <el-form-item label="同步间隔">
              <el-select v-model="gitopsConfig.flux.syncInterval">
                <el-option
                  label="1分钟"
                  value="1m"
                />
                <el-option
                  label="5分钟"
                  value="5m"
                />
                <el-option
                  label="10分钟"
                  value="10m"
                />
                <el-option
                  label="30分钟"
                  value="30m"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="使用Helm">
              <el-switch v-model="gitopsConfig.flux.useHelm" />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button
              type="primary"
              @click="generateGitOpsConfig"
            >
              生成GitOps配置
            </el-button>
          </el-form-item>
        </el-form>

        <!-- GitOps配置预览 -->
        <el-card
          v-if="generatedGitOpsConfig"
          class="gitops-preview"
        >
          <template #header>
            <div class="card-header">
              <span>生成的GitOps配置</span>
              <el-tag type="success">
                {{ gitopsPlatform === 'argocd' ? 'ArgoCD' : 'Flux CD' }}
              </el-tag>
            </div>
          </template>

          <!-- ArgoCD配置文件 -->
          <template v-if="gitopsPlatform === 'argocd'">
            <div class="config-section">
              <div class="section-header">
                <el-icon><Document /></el-icon>
                <span>application.yaml</span>
                <el-button
                  size="small"
                  @click="copyConfig('argocd-app')"
                >
                  复制
                </el-button>
              </div>
              <pre><code>{{ generatedGitOpsConfig.argocd.applicationYaml }}</code></pre>
            </div>

            <div class="config-section">
              <div class="section-header">
                <el-icon><Document /></el-icon>
                <span>project.yaml</span>
                <el-button
                  size="small"
                  @click="copyConfig('argocd-project')"
                >
                  复制
                </el-button>
              </div>
              <pre><code>{{ generatedGitOpsConfig.argocd.projectYaml }}</code></pre>
            </div>
          </template>

          <!-- Flux CD配置文件 -->
          <template v-if="gitopsPlatform === 'flux'">
            <div class="config-section">
              <div class="section-header">
                <el-icon><Document /></el-icon>
                <span>gitrepository.yaml</span>
                <el-button
                  size="small"
                  @click="copyConfig('flux-repo')"
                >
                  复制
                </el-button>
              </div>
              <pre><code>{{ generatedGitOpsConfig.flux.gitRepositoryYaml }}</code></pre>
            </div>

            <div class="config-section">
              <div class="section-header">
                <el-icon><Document /></el-icon>
                <span>kustomization.yaml</span>
                <el-button
                  size="small"
                  @click="copyConfig('flux-kustomization')"
                >
                  复制
                </el-button>
              </div>
              <pre><code>{{ generatedGitOpsConfig.flux.kustomizationYaml }}</code></pre>
            </div>

            <div
              v-if="gitopsConfig.flux.useHelm"
              class="config-section"
            >
              <div class="section-header">
                <el-icon><Document /></el-icon>
                <span>helmrelease.yaml</span>
                <el-button
                  size="small"
                  @click="copyConfig('flux-helm')"
                >
                  复制
                </el-button>
              </div>
              <pre><code>{{ generatedGitOpsConfig.flux.helmReleaseYaml }}</code></pre>
            </div>
          </template>
        </el-card>
      </div>
    </el-card>

    <!-- 快速开始指南 -->
    <el-card class="guide-card">
      <template #header>
        <span>📚 快速开始指南</span>
      </template>
      <el-steps
        :active="currentStep"
        finish-status="success"
      >
        <el-step
          title="选择平台"
          description="选择CI/CD和GitOps平台"
        />
        <el-step
          title="配置参数"
          description="填写服务名称、仓库等信息"
        />
        <el-step
          title="生成配置"
          description="生成Pipeline和GitOps配置"
        />
        <el-step
          title="部署应用"
          description="提交配置到Git仓库"
        />
      </el-steps>

      <div class="guide-content">
        <el-alert
          v-if="cicdPlatform === 'github'"
          title="GitHub Actions 使用步骤"
          type="info"
          :closable="false"
        >
          <p>1. 将生成的配置文件保存到 <code>.github/workflows/</code> 目录</p>
          <p>2. 配置Secrets: REGISTRY_USERNAME 和 REGISTRY_PASSWORD</p>
          <p>3. 推送代码到仓库，自动触发工作流</p>
        </el-alert>

        <el-alert
          v-if="gitopsPlatform === 'argocd'"
          title="ArgoCD 使用步骤"
          type="success"
          :closable="false"
          style="margin-top: 10px"
        >
          <p>1. 安装ArgoCD: <code>kubectl create namespace argocd && kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml</code></p>
          <p>2. 应用生成的配置: <code>kubectl apply -f application.yaml</code></p>
          <p>3. 访问ArgoCD UI查看部署状态</p>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

// 活动标签
const activeTab = ref('cicd')
const cicdPlatform = ref('github')
const gitopsPlatform = ref('argocd')
const currentStep = ref(0)

// CI/CD配置
const cicdConfig = reactive({
  serviceName: 'my-service',
  triggerBranches: ['main', 'develop'],
  containerRegistry: 'ghcr.io',
  dockerfilePath: 'Dockerfile',
  enableTests: true,
  enableCodeScan: true,
  enableAutoDeploy: false,
  deployEnvironment: 'production'
})

// GitOps配置
const gitopsConfig = reactive({
  argocd: {
    applicationName: 'my-app',
    projectName: 'default',
    gitRepoUrl: '',
    targetRevision: 'HEAD',
    manifestPath: 'k8s/',
    targetNamespace: 'default',
    syncPolicy: 'Automated'
  },
  flux: {
    applicationName: 'my-app',
    repositoryName: 'main-repo',
    gitRepoUrl: '',
    targetBranch: 'main',
    manifestPath: './k8s',
    syncInterval: '1m',
    useHelm: false
  }
})

// 生成的配置
const generatedPipeline = ref<any>(null)
const generatedGitOpsConfig = ref<any>(null)

// 平台切换
const onPlatformChange = () => {
  generatedPipeline.value = null
  currentStep.value = 1
}

const onGitOpsPlatformChange = () => {
  generatedGitOpsConfig.value = null
  currentStep.value = 1
}

// 生成CI/CD Pipeline
const generateCICDPipeline = () => {
  currentStep.value = 2

  // TODO: 调用后端API生成真实配置
  // 这里使用模拟数据
  const mockPipelines: Record<string, any> = {
    github: {
      platform: 'GitHub Actions',
      filePath: `.github/workflows/${cicdConfig.serviceName}-cicd.yml`,
      workflowContent: `name: ${cicdConfig.serviceName} CI/CD

on:
  push:
    branches:
${cicdConfig.triggerBranches.map(b => `      - ${b}`).join('\n')}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      
      - name: Build
        run: dotnet build --configuration Release

  docker:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Build and push Docker image
        run: |
          docker build -t ${cicdConfig.containerRegistry}/${cicdConfig.serviceName}:\${{ github.sha }} .
          docker push ${cicdConfig.containerRegistry}/${cicdConfig.serviceName}:\${{ github.sha }}`
    },
    gitlab: {
      platform: 'GitLab CI',
      filePath: '.gitlab-ci.yml',
      workflowContent: `stages:
  - build
  - docker

build:
  stage: build
  image: mcr.microsoft.com/dotnet/sdk:8.0
  script:
    - dotnet build --configuration Release

docker:
  stage: docker
  image: docker:latest
  script:
    - docker build -t ${cicdConfig.containerRegistry}/${cicdConfig.serviceName}:$CI_COMMIT_SHA .
    - docker push ${cicdConfig.containerRegistry}/${cicdConfig.serviceName}:$CI_COMMIT_SHA`
    },
    azure: {
      platform: 'Azure DevOps',
      filePath: 'azure-pipelines.yml',
      workflowContent: `trigger:
${cicdConfig.triggerBranches.map(b => `  - ${b}`).join('\n')}

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: Build
  jobs:
  - job: BuildJob
    steps:
    - task: DotNetCoreCLI@2
      inputs:
        command: 'build'
        arguments: '--configuration Release'`
    }
  }

  generatedPipeline.value = mockPipelines[cicdPlatform.value]
  currentStep.value = 3
  ElMessage.success('Pipeline配置生成成功')
}

// 生成GitOps配置
const generateGitOpsConfig = () => {
  currentStep.value = 2

  // TODO: 调用后端API生成真实配置
  if (gitopsPlatform.value === 'argocd') {
    generatedGitOpsConfig.value = {
      argocd: {
        applicationYaml: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ${gitopsConfig.argocd.applicationName}
  namespace: argocd
spec:
  project: ${gitopsConfig.argocd.projectName}
  source:
    repoURL: ${gitopsConfig.argocd.gitRepoUrl}
    targetRevision: ${gitopsConfig.argocd.targetRevision}
    path: ${gitopsConfig.argocd.manifestPath}
  destination:
    server: https://kubernetes.default.svc
    namespace: ${gitopsConfig.argocd.targetNamespace}
  syncPolicy:
${gitopsConfig.argocd.syncPolicy === 'Automated' ? `    automated:
      prune: true
      selfHeal: true` : '    # Manual sync'}`,
        projectYaml: `apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: ${gitopsConfig.argocd.projectName}
  namespace: argocd
spec:
  description: Auto-generated project
  sourceRepos:
    - '*'
  destinations:
    - namespace: '*'
      server: '*'`
      }
    }
  } else {
    generatedGitOpsConfig.value = {
      flux: {
        gitRepositoryYaml: `apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: ${gitopsConfig.flux.repositoryName}
  namespace: flux-system
spec:
  interval: ${gitopsConfig.flux.syncInterval}
  url: ${gitopsConfig.flux.gitRepoUrl}
  ref:
    branch: ${gitopsConfig.flux.targetBranch}`,
        kustomizationYaml: `apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: ${gitopsConfig.flux.applicationName}
  namespace: flux-system
spec:
  interval: ${gitopsConfig.flux.syncInterval}
  sourceRef:
    kind: GitRepository
    name: ${gitopsConfig.flux.repositoryName}
  path: ${gitopsConfig.flux.manifestPath}
  prune: true`,
        helmReleaseYaml: gitopsConfig.flux.useHelm ? `apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: ${gitopsConfig.flux.applicationName}
  namespace: flux-system
spec:
  interval: ${gitopsConfig.flux.syncInterval}
  chart:
    spec:
      chart: ./chart
      sourceRef:
        kind: GitRepository
        name: ${gitopsConfig.flux.repositoryName}` : ''
      }
    }
  }

  currentStep.value = 3
  ElMessage.success('GitOps配置生成成功')
}

// 预览Pipeline
const previewPipeline = () => {
  if (!generatedPipeline.value) {
    generateCICDPipeline()
  }
}

// 复制配置
const copyPipeline = () => {
  navigator.clipboard.writeText(generatedPipeline.value.workflowContent)
  ElMessage.success('配置已复制到剪贴板')
}

const copyConfig = (type: string) => {
  let content = ''
  if (type === 'argocd-app') {
    content = generatedGitOpsConfig.value.argocd.applicationYaml
  } else if (type === 'argocd-project') {
    content = generatedGitOpsConfig.value.argocd.projectYaml
  } else if (type === 'flux-repo') {
    content = generatedGitOpsConfig.value.flux.gitRepositoryYaml
  } else if (type === 'flux-kustomization') {
    content = generatedGitOpsConfig.value.flux.kustomizationYaml
  } else if (type === 'flux-helm') {
    content = generatedGitOpsConfig.value.flux.helmReleaseYaml
  }

  navigator.clipboard.writeText(content)
  ElMessage.success('配置已复制到剪贴板')
}

// 下载文件
const downloadPipeline = () => {
  const blob = new Blob([generatedPipeline.value.workflowContent], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = generatedPipeline.value.filePath.split('/').pop()
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('文件已下载')
}
</script>

<style scoped lang="scss">
.cicd-pipeline-editor {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  .config-panel {
    .pipeline-preview,
    .gitops-preview {
      margin-top: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .file-path {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        padding: 8px;
        background: #f5f7fa;
        border-radius: 4px;
        font-family: monospace;
        font-size: 13px;
        color: #606266;
      }

      .config-section {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          padding: 8px;
          background: #f5f7fa;
          border-radius: 4px;

          span {
            flex: 1;
            font-family: monospace;
            font-size: 13px;
            font-weight: 600;
          }
        }
      }

      pre {
        background: #f5f7fa;
        padding: 15px;
        border-radius: 4px;
        overflow-x: auto;
        max-height: 500px;

        code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
        }
      }
    }
  }

  .guide-card {
    .guide-content {
      margin-top: 20px;

      p {
        margin: 8px 0;
        line-height: 1.6;

        code {
          padding: 2px 6px;
          background: #f5f7fa;
          border-radius: 3px;
          font-family: monospace;
          font-size: 13px;
          color: #e6a23c;
        }
      }
    }
  }
}
</style>


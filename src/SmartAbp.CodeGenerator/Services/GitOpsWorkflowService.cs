using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// GitOps工作流服务 - Day 32-33
    /// 提供CI/CD Pipeline配置生成、GitOps最佳实践、多平台集成
    /// </summary>
    public class GitOpsWorkflowService : ApplicationService
    {
        private readonly ILogger<GitOpsWorkflowService> _logger;

        public GitOpsWorkflowService(ILogger<GitOpsWorkflowService> logger)
        {
            _logger = logger;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // GitHub Actions Pipeline生成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成GitHub Actions工作流
        /// </summary>
        public Task<GeneratedCICDPipelineDto> GenerateGitHubActionsWorkflowAsync(
            string serviceName,
            GitOpsPipelineConfigDto config)
        {
            _logger.LogInformation("🚀 生成GitHub Actions工作流: {ServiceName}", serviceName);

            var workflow = GenerateGitHubActionsYaml(serviceName, config);

            var result = new GeneratedCICDPipelineDto
            {
                Platform = "GitHub Actions",
                ServiceName = serviceName,
                WorkflowContent = workflow,
                FilePath = $".github/workflows/{serviceName}-cicd.yml"
            };

            _logger.LogInformation("✅ GitHub Actions工作流生成完成");
            return Task.FromResult(result);
        }

        /// <summary>
        /// 生成GitLab CI/CD Pipeline
        /// </summary>
        public Task<GeneratedCICDPipelineDto> GenerateGitLabPipelineAsync(
            string serviceName,
            GitOpsPipelineConfigDto config)
        {
            _logger.LogInformation("🚀 生成GitLab CI/CD Pipeline: {ServiceName}", serviceName);

            var pipeline = GenerateGitLabCIYaml(serviceName, config);

            var result = new GeneratedCICDPipelineDto
            {
                Platform = "GitLab CI",
                ServiceName = serviceName,
                WorkflowContent = pipeline,
                FilePath = ".gitlab-ci.yml"
            };

            _logger.LogInformation("✅ GitLab CI/CD Pipeline生成完成");
            return Task.FromResult(result);
        }

        /// <summary>
        /// 生成Azure DevOps Pipeline
        /// </summary>
        public Task<GeneratedCICDPipelineDto> GenerateAzureDevOpsPipelineAsync(
            string serviceName,
            GitOpsPipelineConfigDto config)
        {
            _logger.LogInformation("🚀 生成Azure DevOps Pipeline: {ServiceName}", serviceName);

            var pipeline = GenerateAzurePipelineYaml(serviceName, config);

            var result = new GeneratedCICDPipelineDto
            {
                Platform = "Azure DevOps",
                ServiceName = serviceName,
                WorkflowContent = pipeline,
                FilePath = "azure-pipelines.yml"
            };

            _logger.LogInformation("✅ Azure DevOps Pipeline生成完成");
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ArgoCD配置生成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成ArgoCD Application配置
        /// </summary>
        public Task<GeneratedArgoCDConfigDto> GenerateArgoCDApplicationAsync(
            string applicationName,
            ArgoCDConfigDto config)
        {
            _logger.LogInformation("🚀 生成ArgoCD Application: {ApplicationName}", applicationName);

            var appYaml = GenerateArgoCDApplicationYaml(applicationName, config);
            var projectYaml = GenerateArgoCDProjectYaml(config.ProjectName);

            var result = new GeneratedArgoCDConfigDto
            {
                ApplicationName = applicationName,
                ApplicationYaml = appYaml,
                ProjectYaml = projectYaml,
                SyncPolicy = config.SyncPolicy
            };

            _logger.LogInformation("✅ ArgoCD Application配置生成完成");
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Flux CD配置生成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成Flux CD配置
        /// </summary>
        public Task<GeneratedFluxCDConfigDto> GenerateFluxCDConfigAsync(
            string applicationName,
            FluxCDConfigDto config)
        {
            _logger.LogInformation("🚀 生成Flux CD配置: {ApplicationName}", applicationName);

            var gitRepoYaml = GenerateFluxGitRepositoryYaml(config);
            var kustomizationYaml = GenerateFluxKustomizationYaml(applicationName, config);
            var helmReleaseYaml = config.UseHelm 
                ? GenerateFluxHelmReleaseYaml(applicationName, config) 
                : string.Empty;

            var result = new GeneratedFluxCDConfigDto
            {
                ApplicationName = applicationName,
                GitRepositoryYaml = gitRepoYaml,
                KustomizationYaml = kustomizationYaml,
                HelmReleaseYaml = helmReleaseYaml
            };

            _logger.LogInformation("✅ Flux CD配置生成完成");
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Helper Methods - GitHub Actions
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GenerateGitHubActionsYaml(string serviceName, GitOpsPipelineConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine($"name: {serviceName} CI/CD");
            yaml.AppendLine();
            yaml.AppendLine("on:");
            yaml.AppendLine("  push:");
            yaml.AppendLine("    branches:");
            foreach (var branch in config.TriggerBranches)
            {
                yaml.AppendLine($"      - {branch}");
            }
            yaml.AppendLine("  pull_request:");
            yaml.AppendLine("    branches:");
            yaml.AppendLine("      - main");
            yaml.AppendLine();

            yaml.AppendLine("jobs:");
            
            // Build Job
            yaml.AppendLine("  build:");
            yaml.AppendLine("    runs-on: ubuntu-latest");
            yaml.AppendLine("    steps:");
            yaml.AppendLine("      - name: Checkout code");
            yaml.AppendLine("        uses: actions/checkout@v3");
            yaml.AppendLine();
            yaml.AppendLine("      - name: Setup .NET");
            yaml.AppendLine("        uses: actions/setup-dotnet@v3");
            yaml.AppendLine("        with:");
            yaml.AppendLine("          dotnet-version: '8.0.x'");
            yaml.AppendLine();
            yaml.AppendLine("      - name: Restore dependencies");
            yaml.AppendLine("        run: dotnet restore");
            yaml.AppendLine();
            yaml.AppendLine("      - name: Build");
            yaml.AppendLine("        run: dotnet build --no-restore --configuration Release");
            yaml.AppendLine();

            if (config.EnableTests)
            {
                yaml.AppendLine("      - name: Test");
                yaml.AppendLine("        run: dotnet test --no-build --configuration Release --verbosity normal");
                yaml.AppendLine();
            }

            // Docker Build Job
            yaml.AppendLine("  docker:");
            yaml.AppendLine("    needs: build");
            yaml.AppendLine("    runs-on: ubuntu-latest");
            yaml.AppendLine("    steps:");
            yaml.AppendLine("      - name: Checkout code");
            yaml.AppendLine("        uses: actions/checkout@v3");
            yaml.AppendLine();
            yaml.AppendLine("      - name: Set up Docker Buildx");
            yaml.AppendLine("        uses: docker/setup-buildx-action@v2");
            yaml.AppendLine();
            yaml.AppendLine("      - name: Login to Container Registry");
            yaml.AppendLine("        uses: docker/login-action@v2");
            yaml.AppendLine("        with:");
            yaml.AppendLine($"          registry: {config.ContainerRegistry}");
            yaml.AppendLine("          username: ${{{{ secrets.REGISTRY_USERNAME }}}}");
            yaml.AppendLine("          password: ${{{{ secrets.REGISTRY_PASSWORD }}}}");
            yaml.AppendLine();
            yaml.AppendLine("      - name: Build and push Docker image");
            yaml.AppendLine("        uses: docker/build-push-action@v4");
            yaml.AppendLine("        with:");
            yaml.AppendLine("          context: .");
            yaml.AppendLine($"          file: {config.DockerfilePath}");
            yaml.AppendLine("          push: true");
            yaml.AppendLine($"          tags: {config.ContainerRegistry}/{serviceName}:${{{{ github.sha }}}},{config.ContainerRegistry}/{serviceName}:latest");
            yaml.AppendLine();

            // Deploy Job
            if (config.EnableAutoDeploy)
            {
                yaml.AppendLine("  deploy:");
                yaml.AppendLine("    needs: docker");
                yaml.AppendLine("    runs-on: ubuntu-latest");
                yaml.AppendLine("    steps:");
                yaml.AppendLine("      - name: Checkout code");
                yaml.AppendLine("        uses: actions/checkout@v3");
                yaml.AppendLine();
                yaml.AppendLine("      - name: Update K8s manifests");
                yaml.AppendLine("        run: |");
                yaml.AppendLine($"          sed -i 's|image:.*|image: {config.ContainerRegistry}/{serviceName}:${{{{ github.sha }}}}|' k8s/deployment.yaml");
                yaml.AppendLine("          git config user.name 'GitHub Actions'");
                yaml.AppendLine("          git config user.email 'actions@github.com'");
                yaml.AppendLine("          git add k8s/");
                yaml.AppendLine("          git commit -m 'Update image tag to ${{ github.sha }}'");
                yaml.AppendLine("          git push");
            }

            return yaml.ToString();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Helper Methods - GitLab CI
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GenerateGitLabCIYaml(string serviceName, GitOpsPipelineConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("stages:");
            yaml.AppendLine("  - build");
            yaml.AppendLine("  - test");
            yaml.AppendLine("  - docker");
            yaml.AppendLine("  - deploy");
            yaml.AppendLine();

            yaml.AppendLine("variables:");
            yaml.AppendLine($"  SERVICE_NAME: {serviceName}");
            yaml.AppendLine($"  REGISTRY: {config.ContainerRegistry}");
            yaml.AppendLine();

            // Build Stage
            yaml.AppendLine("build:");
            yaml.AppendLine("  stage: build");
            yaml.AppendLine("  image: mcr.microsoft.com/dotnet/sdk:8.0");
            yaml.AppendLine("  script:");
            yaml.AppendLine("    - dotnet restore");
            yaml.AppendLine("    - dotnet build --no-restore --configuration Release");
            yaml.AppendLine("  artifacts:");
            yaml.AppendLine("    paths:");
            yaml.AppendLine("      - bin/");
            yaml.AppendLine();

            // Test Stage
            if (config.EnableTests)
            {
                yaml.AppendLine("test:");
                yaml.AppendLine("  stage: test");
                yaml.AppendLine("  image: mcr.microsoft.com/dotnet/sdk:8.0");
                yaml.AppendLine("  script:");
                yaml.AppendLine("    - dotnet test --configuration Release");
                yaml.AppendLine();
            }

            // Docker Stage
            yaml.AppendLine("docker:");
            yaml.AppendLine("  stage: docker");
            yaml.AppendLine("  image: docker:latest");
            yaml.AppendLine("  services:");
            yaml.AppendLine("    - docker:dind");
            yaml.AppendLine("  script:");
            yaml.AppendLine("    - docker login -u $REGISTRY_USERNAME -p $REGISTRY_PASSWORD $REGISTRY");
            yaml.AppendLine($"    - docker build -t $REGISTRY/{serviceName}:$CI_COMMIT_SHA -f {config.DockerfilePath} .");
            yaml.AppendLine($"    - docker tag $REGISTRY/{serviceName}:$CI_COMMIT_SHA $REGISTRY/{serviceName}:latest");
            yaml.AppendLine($"    - docker push $REGISTRY/{serviceName}:$CI_COMMIT_SHA");
            yaml.AppendLine($"    - docker push $REGISTRY/{serviceName}:latest");
            yaml.AppendLine();

            // Deploy Stage
            if (config.EnableAutoDeploy)
            {
                yaml.AppendLine("deploy:");
                yaml.AppendLine("  stage: deploy");
                yaml.AppendLine("  image: alpine/k8s:latest");
                yaml.AppendLine("  script:");
                yaml.AppendLine("    - kubectl set image deployment/$SERVICE_NAME");
                yaml.AppendLine($"        $SERVICE_NAME=$REGISTRY/{serviceName}:$CI_COMMIT_SHA");
                yaml.AppendLine("        -n production");
                yaml.AppendLine("  only:");
                yaml.AppendLine("    - main");
            }

            return yaml.ToString();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Helper Methods - Azure DevOps
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GenerateAzurePipelineYaml(string serviceName, GitOpsPipelineConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("trigger:");
            foreach (var branch in config.TriggerBranches)
            {
                yaml.AppendLine($"  - {branch}");
            }
            yaml.AppendLine();

            yaml.AppendLine("pool:");
            yaml.AppendLine("  vmImage: 'ubuntu-latest'");
            yaml.AppendLine();

            yaml.AppendLine("variables:");
            yaml.AppendLine($"  serviceName: '{serviceName}'");
            yaml.AppendLine($"  containerRegistry: '{config.ContainerRegistry}'");
            yaml.AppendLine();

            yaml.AppendLine("stages:");
            
            // Build Stage
            yaml.AppendLine("- stage: Build");
            yaml.AppendLine("  jobs:");
            yaml.AppendLine("  - job: BuildJob");
            yaml.AppendLine("    steps:");
            yaml.AppendLine("    - task: UseDotNet@2");
            yaml.AppendLine("      inputs:");
            yaml.AppendLine("        version: '8.0.x'");
            yaml.AppendLine();
            yaml.AppendLine("    - task: DotNetCoreCLI@2");
            yaml.AppendLine("      displayName: 'Restore'");
            yaml.AppendLine("      inputs:");
            yaml.AppendLine("        command: 'restore'");
            yaml.AppendLine();
            yaml.AppendLine("    - task: DotNetCoreCLI@2");
            yaml.AppendLine("      displayName: 'Build'");
            yaml.AppendLine("      inputs:");
            yaml.AppendLine("        command: 'build'");
            yaml.AppendLine("        arguments: '--configuration Release'");
            yaml.AppendLine();

            if (config.EnableTests)
            {
                yaml.AppendLine("    - task: DotNetCoreCLI@2");
                yaml.AppendLine("      displayName: 'Test'");
                yaml.AppendLine("      inputs:");
                yaml.AppendLine("        command: 'test'");
                yaml.AppendLine("        arguments: '--configuration Release'");
                yaml.AppendLine();
            }

            // Docker Stage
            yaml.AppendLine("- stage: Docker");
            yaml.AppendLine("  dependsOn: Build");
            yaml.AppendLine("  jobs:");
            yaml.AppendLine("  - job: DockerBuild");
            yaml.AppendLine("    steps:");
            yaml.AppendLine("    - task: Docker@2");
            yaml.AppendLine("      displayName: 'Build and Push'");
            yaml.AppendLine("      inputs:");
            yaml.AppendLine("        command: 'buildAndPush'");
            yaml.AppendLine($"        repository: '{serviceName}'");
            yaml.AppendLine("        containerRegistry: '$(containerRegistry)'");
            yaml.AppendLine($"        dockerfile: '{config.DockerfilePath}'");
            yaml.AppendLine("        tags: |");
            yaml.AppendLine("          $(Build.SourceVersion)");
            yaml.AppendLine("          latest");

            return yaml.ToString();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Helper Methods - ArgoCD
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GenerateArgoCDApplicationYaml(string applicationName, ArgoCDConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: argoproj.io/v1alpha1");
            yaml.AppendLine("kind: Application");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {applicationName}");
            yaml.AppendLine($"  namespace: {config.ArgoNamespace}");
            yaml.AppendLine("spec:");
            yaml.AppendLine($"  project: {config.ProjectName}");
            yaml.AppendLine("  source:");
            yaml.AppendLine($"    repoURL: {config.GitRepoUrl}");
            yaml.AppendLine($"    targetRevision: {config.TargetRevision}");
            yaml.AppendLine($"    path: {config.ManifestPath}");
            yaml.AppendLine("  destination:");
            yaml.AppendLine($"    server: {config.K8sClusterUrl}");
            yaml.AppendLine($"    namespace: {config.TargetNamespace}");
            yaml.AppendLine("  syncPolicy:");

            if (config.SyncPolicy == "Automated")
            {
                yaml.AppendLine("    automated:");
                yaml.AppendLine("      prune: true");
                yaml.AppendLine("      selfHeal: true");
                yaml.AppendLine("      allowEmpty: false");
            }

            yaml.AppendLine("    syncOptions:");
            yaml.AppendLine("      - CreateNamespace=true");
            yaml.AppendLine("      - PruneLast=true");

            return yaml.ToString();
        }

        private string GenerateArgoCDProjectYaml(string projectName)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: argoproj.io/v1alpha1");
            yaml.AppendLine("kind: AppProject");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {projectName}");
            yaml.AppendLine("  namespace: argocd");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  description: Auto-generated project");
            yaml.AppendLine("  sourceRepos:");
            yaml.AppendLine("    - '*'");
            yaml.AppendLine("  destinations:");
            yaml.AppendLine("    - namespace: '*'");
            yaml.AppendLine("      server: '*'");
            yaml.AppendLine("  clusterResourceWhitelist:");
            yaml.AppendLine("    - group: '*'");
            yaml.AppendLine("      kind: '*'");

            return yaml.ToString();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Helper Methods - Flux CD
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GenerateFluxGitRepositoryYaml(FluxCDConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: source.toolkit.fluxcd.io/v1");
            yaml.AppendLine("kind: GitRepository");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {config.RepositoryName}");
            yaml.AppendLine($"  namespace: {config.FluxNamespace}");
            yaml.AppendLine("spec:");
            yaml.AppendLine($"  interval: {config.SyncInterval}");
            yaml.AppendLine($"  url: {config.GitRepoUrl}");
            yaml.AppendLine("  ref:");
            yaml.AppendLine($"    branch: {config.TargetBranch}");

            if (!string.IsNullOrEmpty(config.SecretRef))
            {
                yaml.AppendLine("  secretRef:");
                yaml.AppendLine($"    name: {config.SecretRef}");
            }

            return yaml.ToString();
        }

        private string GenerateFluxKustomizationYaml(string applicationName, FluxCDConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: kustomize.toolkit.fluxcd.io/v1");
            yaml.AppendLine("kind: Kustomization");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {applicationName}");
            yaml.AppendLine($"  namespace: {config.FluxNamespace}");
            yaml.AppendLine("spec:");
            yaml.AppendLine($"  interval: {config.SyncInterval}");
            yaml.AppendLine("  sourceRef:");
            yaml.AppendLine("    kind: GitRepository");
            yaml.AppendLine($"    name: {config.RepositoryName}");
            yaml.AppendLine($"  path: {config.ManifestPath}");
            yaml.AppendLine("  prune: true");
            yaml.AppendLine($"  targetNamespace: {config.TargetNamespace}");

            return yaml.ToString();
        }

        private string GenerateFluxHelmReleaseYaml(string applicationName, FluxCDConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: helm.toolkit.fluxcd.io/v2beta1");
            yaml.AppendLine("kind: HelmRelease");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {applicationName}");
            yaml.AppendLine($"  namespace: {config.FluxNamespace}");
            yaml.AppendLine("spec:");
            yaml.AppendLine($"  interval: {config.SyncInterval}");
            yaml.AppendLine("  chart:");
            yaml.AppendLine("    spec:");
            yaml.AppendLine("      chart: ./chart");
            yaml.AppendLine("      sourceRef:");
            yaml.AppendLine("        kind: GitRepository");
            yaml.AppendLine($"        name: {config.RepositoryName}");
            yaml.AppendLine("  values:");
            yaml.AppendLine($"    replicaCount: 3");
            yaml.AppendLine("    image:");
            yaml.AppendLine($"      repository: {config.ContainerRegistry}/{applicationName}");
            yaml.AppendLine("      tag: latest");

            return yaml.ToString();
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DTOs for GitOps Workflow Service
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public class GitOpsPipelineConfigDto
    {
        public List<string> TriggerBranches { get; set; } = new() { "main", "develop" };
        public bool EnableTests { get; set; } = true;
        public bool EnableCodeScan { get; set; } = true;
        public string ContainerRegistry { get; set; } = "ghcr.io";
        public string DockerfilePath { get; set; } = "Dockerfile";
        public bool EnableAutoDeploy { get; set; } = false;
        public string DeployEnvironment { get; set; } = "production";
    }

    public class GeneratedCICDPipelineDto
    {
        public string Platform { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string WorkflowContent { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
    }

    public class ArgoCDConfigDto
    {
        public string ProjectName { get; set; } = "default";
        public string ArgoNamespace { get; set; } = "argocd";
        public string GitRepoUrl { get; set; } = string.Empty;
        public string TargetRevision { get; set; } = "HEAD";
        public string ManifestPath { get; set; } = "k8s/";
        public string K8sClusterUrl { get; set; } = "https://kubernetes.default.svc";
        public string TargetNamespace { get; set; } = "default";
        public string SyncPolicy { get; set; } = "Automated"; // Automated or Manual
    }

    public class GeneratedArgoCDConfigDto
    {
        public string ApplicationName { get; set; } = string.Empty;
        public string ApplicationYaml { get; set; } = string.Empty;
        public string ProjectYaml { get; set; } = string.Empty;
        public string SyncPolicy { get; set; } = string.Empty;
    }

    public class FluxCDConfigDto
    {
        public string RepositoryName { get; set; } = "main-repo";
        public string FluxNamespace { get; set; } = "flux-system";
        public string GitRepoUrl { get; set; } = string.Empty;
        public string TargetBranch { get; set; } = "main";
        public string ManifestPath { get; set; } = "./k8s";
        public string TargetNamespace { get; set; } = "default";
        public string SyncInterval { get; set; } = "1m";
        public string SecretRef { get; set; } = string.Empty;
        public bool UseHelm { get; set; } = false;
        public string ContainerRegistry { get; set; } = "ghcr.io";
    }

    public class GeneratedFluxCDConfigDto
    {
        public string ApplicationName { get; set; } = string.Empty;
        public string GitRepositoryYaml { get; set; } = string.Empty;
        public string KustomizationYaml { get; set; } = string.Empty;
        public string HelmReleaseYaml { get; set; } = string.Empty;
    }
}


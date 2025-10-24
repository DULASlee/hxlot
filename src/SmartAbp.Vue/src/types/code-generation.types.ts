/**
 * 代码生成相关类型定义（与后端DTO完全一致）
 */

export interface CodeGenerationTaskDto {
    id: string
    taskName: string
    generatorType: CodeGeneratorType
    configurationJson: string
    status: TaskStatus
    resultJson?: string
    errorMessage?: string
    startTime?: string
    completedTime?: string
    outputDirectory: string
    creationTime: string
    creatorId?: string
    lastModificationTime?: string
    lastModifierId?: string
}

export enum CodeGeneratorType {
    MESDashboard = 1,
    UniAppMobile = 2,
    WebAdmin = 3,
    MicroserviceAPI = 4
}

export enum TaskStatus {
    Pending = 0,
    Running = 1,
    Succeeded = 2,
    Failed = 3,
    Cancelled = 4
}

export interface MESGeneratorConfigDto {
    systemName: string
    description: string
    companyName: string
    updateInterval: number
    selectedDashboards: string[]
    sourceType: string
    wsUrl?: string
    apiUrl?: string
    enableAlerts: boolean
    enableExport: boolean
}

export interface UniAppGeneratorConfigDto {
    appName: string
    appId: string
    version: string
    description: string
    apiBaseUrl: string
    selectedModules: string[]
    targets: string[]
    primaryColor: string
    darkMode: boolean
    offlineMode: boolean
    pushNotification: boolean
}

export interface CodeGenerationResultDto {
    success: boolean
    generatedFiles: string[]
    outputDirectory: string
    downloadUrl?: string
    errorMessage?: string
    duration: number
}


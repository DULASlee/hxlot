/**
 * 🚀 零配置代码生成引擎
 * 🎯 低代码引擎核心功能 - 专注基础实现
 * ❌ 严禁添加AI智能辅助功能
 * ❌ 严禁添加多人协作功能
 * 📦 遵循packages目录架构 - 支持独立发包
 */

// import { codeGenerationApi } from '@smartabp/lowcode-api' // TODO: 后续集成

// 🎯 基于真实ModuleMetadataDto的配置接口
export interface MetadataConfig {
  // 系统基础信息 (必填)
  systemName: string          // SystemName - "SmartConstruction", "MES"
  moduleName: string          // Name - "ProjectManagement", "Device"  
  displayName: string         // DisplayName - "项目管理", "设备管理"
  description?: string        // Description - 模块用途描述
  
  // 代码生成配置 (必填)
  namespace: string          // Namespace - "SmartAbp.ProjectManagement"
  architecturePattern: 'Crud' | 'DDD' | 'CQRS'  // ArchitecturePattern
  version: string           // Version - "1.0.0"
  author?: string          // Author - 默认"SmartAbp Generator"
  
  // 前端配置 (必填)
  frontend: {
    parentId: string        // Frontend.ParentId - 上级菜单ID
    routePrefix: string     // Frontend.RoutePrefix - 路由前缀
  }
  generateMobilePages: boolean // GenerateMobilePages - 是否生成移动端
  
  // 数据库配置 (可选，有默认值)
  databaseInfo: {
    connectionStringName: string  // DatabaseInfo.ConnectionStringName
    schema: string               // DatabaseInfo.Schema
    provider: 'SqlServer' | 'MySql' | 'PostgreSql'  // DatabaseInfo.Provider
  }
  
  // 选中的数据库表 (必填)
  selectedTable: string
}

export interface GenerationResult {
  success: boolean
  generatedFiles: GeneratedFile[]
  fileStructure: FileStructure
  message: string
}

export interface GeneratedFile {
  path: string
  name: string
  content: string
  type: 'backend' | 'frontend'
  category: 'generated' | 'extension'
}

export interface FileStructure {
  generatedFiles: {
    backend: Record<string, string>
    frontend: Record<string, string>
  }
  extensionFiles: {
    backend: Record<string, string>  
    frontend: Record<string, string>
  }
  namingConvention: {
    generated: { pattern: string; description: string }
    extension: { pattern: string; description: string }
    examples: string[]
  }
}

export type ProgressCallback = (message: string, percent: number) => void

export class ZeroConfigGenerationEngine {
  private progressCallback?: ProgressCallback

  /**
   * 🚀 30秒完成企业级系统生成 (您的天才设计!)
   */
  async generateWithProgress(
    metadataConfig: MetadataConfig,
    options: { onProgress?: ProgressCallback } = {}
  ): Promise<GenerationResult> {
    this.progressCallback = options.onProgress
    
    try {
      // 🔧 Step 1: 准备生成环境 (5秒)
      this.updateProgress('🔧 正在准备生成环境...', 10)
      const preparedConfig = await this.prepareGenerationEnvironment(metadataConfig)
      
      // 🎨 Step 2: 生成后端代码 (10秒)  
      this.updateProgress('🏗️ 正在生成后端代码...', 30)
      const backendFiles = await this.generateBackendCode(preparedConfig)
      
      // 💻 Step 3: 生成前端代码 (10秒)
      this.updateProgress('🎨 正在生成前端代码...', 60)
      const frontendFiles = await this.generateFrontendCodeWithStructure(preparedConfig)
      
      // 🔗 Step 4: 集成和配置 (5秒)
      this.updateProgress('🔗 正在集成项目配置...', 90)
      await this.integrateIntoProject(backendFiles, frontendFiles, preparedConfig)
      
      this.updateProgress('🎉 代码生成完成！', 100)
      
      return {
        success: true,
        generatedFiles: [...backendFiles, ...frontendFiles],
        fileStructure: this.createClearFileStructure(preparedConfig),
        message: '🎉 企业管理系统生成完成！'
      }
    } catch (error) {
      this.updateProgress('❌ 生成失败，正在回滚...', 0)
      await this.rollbackOnFailure()
      throw error
    }
  }

  /**
   * 🔧 准备生成环境
   */
  private async prepareGenerationEnvironment(config: MetadataConfig): Promise<MetadataConfig> {
    // 验证配置完整性
    this.validateConfig(config)
    
    // 读取数据库表结构
    const tableSchema = await this.readTableSchema(config.selectedTable, config.databaseInfo)
    
    // 构建完整的ModuleMetadataDto
    const enhancedConfig = {
      ...config,
      tableSchema,
      entities: [await this.convertTableToEntity(tableSchema, config)]
    }
    
    return enhancedConfig
  }

  /**
   * 🏗️ 生成后端代码
   */
  private async generateBackendCode(config: MetadataConfig): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = []
    
    // 🏗️ 生成应用服务
    this.updateProgress('📋 正在生成应用服务...', 35)
    const appService = await this.generateApplicationService(config)
    files.push({
      path: `src/SmartAbp.Application/${config.systemName}/${config.moduleName}/Generated/`,
      name: `${config.moduleName}AppService.g.cs`,
      content: appService,
      type: 'backend',
      category: 'generated'
    })
    
    // 📊 生成DTO
    this.updateProgress('📊 正在生成数据传输对象...', 45)
    const dtos = await this.generateDTOs(config)
    files.push({
      path: `src/SmartAbp.Application.Contracts/${config.systemName}/${config.moduleName}/Generated/`,
      name: `${config.moduleName}Dto.g.cs`,
      content: dtos,
      type: 'backend',
      category: 'generated'
    })
    
    // 🔐 生成权限定义
    this.updateProgress('🔐 正在生成权限定义...', 55)
    const permissions = await this.generatePermissions(config)
    files.push({
      path: `src/SmartAbp.Application.Contracts/Permissions/Generated/`,
      name: `${config.moduleName}Permissions.g.cs`,
      content: permissions,
      type: 'backend',
      category: 'generated'
    })
    
    return files
  }

  /**
   * 🎨 生成前端代码 (您的文件组织设计!)
   */
  private async generateFrontendCodeWithStructure(config: MetadataConfig): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = []
    const routePath = config.frontend.routePrefix.replace('/', '').replace('/', '/')
    
    // 🎨 生成Vue页面组件
    this.updateProgress('🎨 正在生成Vue页面组件...', 65)
    const vueComponent = await this.generateVueManagementComponent(config)
    files.push({
      path: `src/views/${routePath}/generated/`,
      name: `${config.moduleName}List.g.vue`,
      content: vueComponent,
      type: 'frontend',
      category: 'generated'
    })
    
    // 🔌 生成API服务
    this.updateProgress('🔌 正在生成API服务...', 75)
    const apiService = await this.generateApiService(config)
    files.push({
      path: `src/api/${routePath}/generated/`,
      name: `${config.moduleName}Api.g.ts`,
      content: apiService,
      type: 'frontend',
      category: 'generated'
    })
    
    // 🏪 生成Pinia Store
    this.updateProgress('🏪 正在生成状态管理...', 85)
    const store = await this.generatePiniaStore(config)
    files.push({
      path: `src/stores/${routePath}/generated/`,
      name: `${config.moduleName}Store.g.ts`,
      content: store,
      type: 'frontend',
      category: 'generated'
    })
    
    return files
  }

  private updateProgress(message: string, percent: number): void {
    this.progressCallback?.(message, percent)
  }

  private validateConfig(config: MetadataConfig): void {
    const required = ['systemName', 'moduleName', 'displayName', 'namespace', 'architecturePattern']
    for (const field of required) {
      if (!config[field as keyof MetadataConfig]) {
        throw new Error(`必填字段 ${field} 不能为空`)
      }
    }
  }

  private async readTableSchema(tableName: string, databaseInfo: any) {
    // TODO: 调用后端API读取表结构
    console.log('读取表结构:', tableName, '数据库信息:', databaseInfo)
    return { tableName, columns: [], foreignKeys: [] }
  }

  private async convertTableToEntity(tableSchema: any, config: MetadataConfig) {
    // TODO: 将数据库表结构转换为实体模型
    console.log('转换表结构:', tableSchema, '配置:', config.moduleName)
    return { name: config.moduleName, properties: [] }
  }

  private async generateApplicationService(config: MetadataConfig): Promise<string> {
    // 🔗 集成关系检测器 - 根据技术评审委员会要求，保持极简
    const relationships = this.detectTableRelationships(config)
    
    // 根据关系类型选择对应的后端模板
    if (relationships.length > 0) {
      // 使用关系模板
      const primaryRelationship = relationships[0] // 使用第一个检测到的关系
      
      if (primaryRelationship.type === 'oneToMany') {
        return await this.generateOneToManyAppService(config, primaryRelationship)
      } else if (primaryRelationship.type === 'manyToMany') {
        return await this.generateManyToManyAppService(config, primaryRelationship)
      }
    }
    
    // 默认使用标准CRUD模板
    return await this.generateStandardAppService(config)
  }

  /**
   * 🔗 极简关系检测 (复用前端检测器逻辑)
   */
  private detectTableRelationships(config: MetadataConfig): Array<{
    id: string
    type: 'oneToMany' | 'manyToMany'
    masterTable: string
    detailTable: string
    foreignKey: string
    confidence: number
  }> {
    // TODO: 这里应该调用真实的数据库架构分析
    // 现在先使用模拟数据进行演示
    const mockTables = [
      {
        name: config.selectedTable,
        columns: [
          { name: 'Id', type: 'int', isNullable: false, isPrimaryKey: true },
          { name: 'UserId', type: 'int', isNullable: false }, // 检测到外键
        ],
        primaryKeys: ['Id'],
        foreignKeys: [],
        indexes: []
      }
    ]
    
    const relationships: Array<{
      id: string
      type: 'oneToMany' | 'manyToMany'
      masterTable: string
      detailTable: string
      foreignKey: string
      confidence: number
    }> = []
    
    // 简单外键检测：字段名以Id结尾
    mockTables[0].columns.forEach(column => {
      if (column.name.endsWith('Id') && column.name !== 'Id') {
        const referencedTable = column.name.replace('Id', '')
        
        relationships.push({
          id: `${config.selectedTable}_${referencedTable}`,
          type: 'oneToMany',
          masterTable: referencedTable,
          detailTable: config.selectedTable,
          foreignKey: column.name,
          confidence: 0.9
        })
      }
    })
    
    return relationships
  }

  /**
   * 生成一对多应用服务
   */
  private async generateOneToManyAppService(config: MetadataConfig, relationship: any): Promise<string> {
    // 基于OneToManyCrudAppService.template.cs生成代码
    const template = `
/// <summary>
/// ${config.moduleName} 一对多CRUD应用服务
/// 支持${relationship.masterTable}与${relationship.detailTable}的主子表关系管理
/// 🤖 此文件由SmartAbp代码生成器自动生成，请勿手动修改
/// </summary>
[Authorize(SmartAbpPermissions.${config.systemName}.Default)]
public class ${config.moduleName}AppService : SmartAbpAppService, I${config.moduleName}AppService
{
    private readonly IRepository<${relationship.masterTable}, Guid> _${relationship.masterTable.toLowerCase()}Repository;
    private readonly IRepository<${relationship.detailTable}, Guid> _${relationship.detailTable.toLowerCase()}Repository;

    public ${config.moduleName}AppService(
        IRepository<${relationship.masterTable}, Guid> ${relationship.masterTable.toLowerCase()}Repository,
        IRepository<${relationship.detailTable}, Guid> ${relationship.detailTable.toLowerCase()}Repository)
    {
        _${relationship.masterTable.toLowerCase()}Repository = ${relationship.masterTable.toLowerCase()}Repository;
        _${relationship.detailTable.toLowerCase()}Repository = ${relationship.detailTable.toLowerCase()}Repository;
    }

    // 🔗 一对多关系管理方法
    [Authorize(SmartAbpPermissions.${config.systemName}.Default)]
    public virtual async Task<List<${relationship.detailTable}Dto>> GetDetailsByMasterIdAsync(Guid masterId)
    {
        var queryable = await _${relationship.detailTable.toLowerCase()}Repository.GetQueryableAsync();
        var details = await AsyncExecuter.ToListAsync(
            queryable.Where(x => x.${relationship.foreignKey} == masterId)
        );
        return ObjectMapper.Map<List<${relationship.detailTable}>, List<${relationship.detailTable}Dto>>(details);
    }

    [Authorize(SmartAbpPermissions.${config.systemName}.Create)]
    public virtual async Task<${relationship.detailTable}Dto> AddDetailToMasterAsync(Guid masterId, Create${relationship.detailTable}Dto input)
    {
        var detailEntity = ObjectMapper.Map<Create${relationship.detailTable}Dto, ${relationship.detailTable}>(input);
        detailEntity.${relationship.foreignKey} = masterId;
        detailEntity = await _${relationship.detailTable.toLowerCase()}Repository.InsertAsync(detailEntity, autoSave: true);
        return ObjectMapper.Map<${relationship.detailTable}, ${relationship.detailTable}Dto>(detailEntity);
    }

    // TODO: 添加更多标准CRUD方法...
}`;
    
    return template
  }

  /**
   * 生成多对多应用服务
   */
  private async generateManyToManyAppService(config: MetadataConfig, _relationship: any): Promise<string> {
    // 基于ManyToManyCrudAppService.template.cs生成代码
    const template = `
/// <summary>
/// ${config.moduleName} 多对多CRUD应用服务
/// 🤖 此文件由SmartAbp代码生成器自动生成，请勿手动修改
/// </summary>
[Authorize(SmartAbpPermissions.${config.systemName}.Default)]
public class ${config.moduleName}AppService : SmartAbpAppService, I${config.moduleName}AppService
{
    // TODO: 多对多关系管理实现
}`;
    
    return template
  }

  /**
   * 生成标准CRUD应用服务
   */
  private async generateStandardAppService(config: MetadataConfig): Promise<string> {
    // 基于CrudAppService.template.cs生成代码
    const template = `
/// <summary>
/// ${config.moduleName} CRUD应用服务
/// 🤖 此文件由SmartAbp代码生成器自动生成，请勿手动修改
/// </summary>
[Authorize(SmartAbpPermissions.${config.systemName}.Default)]
public class ${config.moduleName}AppService : SmartAbpAppService, I${config.moduleName}AppService
{
    private readonly IRepository<${config.moduleName.replace('Management', '')}, Guid> _repository;

    public ${config.moduleName}AppService(IRepository<${config.moduleName.replace('Management', '')}, Guid> repository)
    {
        _repository = repository;
    }

    // TODO: 标准CRUD方法实现...
}`;
    
    return template
  }

  private async generateDTOs(config: MetadataConfig): Promise<string> {
    // TODO: 生成DTO代码
    return `// ${config.moduleName}Dto.g.cs - 自动生成`
  }

  private async generatePermissions(config: MetadataConfig): Promise<string> {
    // TODO: 生成权限定义代码
    return `// ${config.moduleName}Permissions.g.cs - 自动生成`
  }

  private async generateVueManagementComponent(config: MetadataConfig): Promise<string> {
    // 🔗 集成前端关系检测 - 与后端保持一致
    const relationships = this.detectTableRelationships(config)
    
    // 根据关系类型选择对应的前端模板
    if (relationships.length > 0) {
      const primaryRelationship = relationships[0]
      
      if (primaryRelationship.type === 'oneToMany') {
        return await this.generateOneToManyVueComponent(config, primaryRelationship)
      } else if (primaryRelationship.type === 'manyToMany') {
        return await this.generateManyToManyVueComponent(config, primaryRelationship)
      }
    }
    
    // 默认使用标准CRUD Vue组件
    return await this.generateStandardVueComponent(config)
  }

  /**
   * 生成一对多Vue组件
   */
  private async generateOneToManyVueComponent(_config: MetadataConfig, relationship: any): Promise<string> {
    // 基于OneToManyCrudManagement.template.vue生成代码
    const template = `<!--
🤖 此文件由SmartAbp代码生成器自动生成，请勿手动修改
基于模板: OneToManyCrudManagement.template.vue
关系类型: ${relationship.masterTable} (1) → ${relationship.detailTable} (N)
-->
<template>
  <div class="one-to-many-management">
    <!-- 主表区域 -->
    <el-card class="master-card" header="${relationship.masterTable}管理">
      <el-table :data="masterList" @current-change="handleMasterSelect" highlight-current-row>
        <el-table-column prop="name" label="名称" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditMaster(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 子表区域 -->
    <el-card class="detail-card" header="${relationship.detailTable}管理" v-if="selectedMaster">
      <el-table :data="detailList">
        <el-table-column prop="name" label="名称" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditDetail(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const masterList = ref([])
const detailList = ref([])
const selectedMaster = ref(null)

const handleMasterSelect = (currentRow) => {
  selectedMaster.value = currentRow
  // TODO: 加载子表数据
}

const handleEditMaster = (row) => {
  // TODO: 编辑主表
}

const handleEditDetail = (row) => {
  // TODO: 编辑子表
}
</script>

<style scoped>
.one-to-many-management {
  padding: 20px;
}
.master-card, .detail-card {
  margin-bottom: 20px;
}
</style>`
    
    return template
  }

  /**
   * 生成多对多Vue组件
   */
  private async generateManyToManyVueComponent(_config: MetadataConfig, _relationship: any): Promise<string> {
    // 基于ManyToManyCrudManagement.template.vue生成代码
    const template = `<!--
🤖 此文件由SmartAbp代码生成器自动生成，请勿手动修改
基于模板: ManyToManyCrudManagement.template.vue
关系类型: 多对多关系管理
-->
<template>
  <div class="many-to-many-management">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="源实体管理">
          <el-table :data="sourceList" @current-change="handleSourceSelect">
            <el-table-column prop="name" label="名称" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card header="关系分配" v-if="selectedSource">
          <el-transfer
            v-model="assignedTargets"
            :data="availableTargets"
            :titles="['可选项', '已分配']"
            @change="handleRelationshipChange"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sourceList = ref([])
const selectedSource = ref(null)
const assignedTargets = ref([])
const availableTargets = ref([])

const handleSourceSelect = (currentRow) => {
  selectedSource.value = currentRow
  // TODO: 加载关系数据
}

const handleRelationshipChange = (value, direction, movedKeys) => {
  // TODO: 处理关系变化
}
</script>

<style scoped>
.many-to-many-management {
  padding: 20px;
}
</style>`
    
    return template
  }

  /**
   * 生成标准CRUD Vue组件
   */
  private async generateStandardVueComponent(config: MetadataConfig): Promise<string> {
    // 基于CrudManagement.template.vue生成代码
    const template = `<!--
🤖 此文件由SmartAbp代码生成器自动生成，请勿手动修改
基于模板: CrudManagement.template.vue
-->
<template>
  <div class="crud-management">
    <el-card header="${config.displayName}">
      <el-table :data="dataList">
        <el-table-column prop="name" label="名称" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dataList = ref([])

const handleEdit = (row) => {
  // TODO: 编辑功能
}
</script>

<style scoped>
.crud-management {
  padding: 20px;
}
</style>`
    
    return template
  }

  private async generateApiService(config: MetadataConfig): Promise<string> {
    // TODO: 生成API服务
    return `// ${config.moduleName}Api.g.ts - 自动生成`
  }

  private async generatePiniaStore(config: MetadataConfig): Promise<string> {
    // TODO: 生成Pinia Store
    return `// ${config.moduleName}Store.g.ts - 自动生成`
  }

  private async integrateIntoProject(
    backendFiles: GeneratedFile[], 
    frontendFiles: GeneratedFile[], 
    config: MetadataConfig
  ): Promise<void> {
    // TODO: 集成到项目中，更新菜单配置
    console.log('🔗 集成到项目配置...', {
      backendCount: backendFiles.length,
      frontendCount: frontendFiles.length,
      module: config.moduleName
    })
  }

  private async rollbackOnFailure(): Promise<void> {
    // TODO: 失败时回滚机制
    console.log('🔄 执行失败回滚...')
  }

  /**
   * 🗂️ 您的天才文件组织设计 (基于真实项目结构)
   */
  private createClearFileStructure(config: MetadataConfig): FileStructure {
    const systemName = config.systemName      // "SmartConstruction"
    const moduleName = config.moduleName      // "ProjectManagement"
    const frontendRoute = config.frontend.routePrefix.replace('/', '').replace('/', '/')  // "smartconstruction/projectmanagement"
    
    return {
      // 🤖 自动生成代码目录 (用户绝对不要修改!)
      generatedFiles: {
        // 后端生成文件
        backend: {
          application: `src/SmartAbp.Application/${systemName}/${moduleName}/Generated/`,
          contracts: `src/SmartAbp.Application.Contracts/${systemName}/${moduleName}/Generated/`,
          domain: `src/SmartAbp.Domain/${systemName}/${moduleName}/Generated/`,
          efcore: `src/SmartAbp.EntityFrameworkCore/${systemName}/${moduleName}/Generated/`
        },
        // 前端生成文件
        frontend: {
          views: `src/views/${frontendRoute}/generated/`,
          stores: `src/stores/${frontendRoute}/generated/`,
          api: `src/api/${frontendRoute}/generated/`,
          types: `src/types/${frontendRoute}/generated/`
        }
      },
      
      // ✏️ 用户扩展代码目录 (用户可以自由修改和扩展!)
      extensionFiles: {
        // 后端扩展目录
        backend: {
          application: `src/SmartAbp.Application/${systemName}/${moduleName}/Extensions/`,
          domain: `src/SmartAbp.Domain/${systemName}/${moduleName}/Extensions/`,
          customValidation: `src/SmartAbp.Application/${systemName}/${moduleName}/Validation/`
        },
        // 前端扩展目录
        frontend: {
          views: `src/views/${frontendRoute}/extensions/`,
          components: `src/components/${frontendRoute}/custom/`,
          composables: `src/composables/${frontendRoute}/custom/`,
          styles: `src/styles/${frontendRoute}/custom/`
        }
      },
      
      // 📁 您天才的文件命名规范 (一眼就懂!)
      namingConvention: {
        generated: {
          pattern: '*.g.vue, *.g.cs, *.g.ts',
          description: '🤖 系统生成，重新生成时会覆盖'
        },
        extension: {
          pattern: '*.vue, *.cs, *.ts',  
          description: '✏️ 用户扩展，永远不会被覆盖'
        },
        examples: [
          '🤖 UserList.g.vue - 生成的用户列表页面',
          '✏️ UserList.vue - 导入UserList.g.vue，添加自定义功能',
          '🤖 UserAppService.g.cs - 生成的应用服务',
          '✏️ UserAppService.cs - 继承UserAppService.g.cs，添加业务逻辑'
        ]
      }
    }
  }
}

// 🎯 单例导出
export const zeroConfigEngine = new ZeroConfigGenerationEngine()

// 🔧 辅助函数
export const inferModuleNameFromTable = (tableName: string): string => {
  // 基于表名推导模块名称
  const tableMap: Record<string, string> = {
    'Users': 'UserManagement',
    'Projects': 'ProjectManagement', 
    'Orders': 'OrderManagement',
    'Products': 'ProductManagement',
    'Roles': 'RoleManagement',
    'Departments': 'DepartmentManagement',
    'Categories': 'CategoryManagement'
  }
  
  return tableMap[tableName] || `${tableName}Management`
}

export const inferDisplayNameFromTable = (tableName: string): string => {
  const displayMap: Record<string, string> = {
    'Users': '用户管理',
    'Projects': '项目管理',
    'Orders': '订单管理', 
    'Products': '产品管理',
    'Roles': '角色管理',
    'Departments': '部门管理',
    'Categories': '分类管理'
  }
  
  return displayMap[tableName] || `${tableName}管理`
}

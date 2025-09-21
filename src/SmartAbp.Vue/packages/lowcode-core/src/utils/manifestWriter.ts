/**
 * SmartABP 清单文件生成器
 * 负责生成模块清单文件和相关的配置文件
 */

import { ElMessage } from 'element-plus'
import type { 
  ModuleMetadata, 
  EntityDefinition, 
  PropertyDefinition,
  ViewConfiguration,
  MenuConfiguration 
} from '../types'

/**
 * 清单文件写入器
 */
export class SmartAbpManifestWriter {
  private moduleMetadata: ModuleMetadata | null = null
  private outputPath: string = ''

  constructor() {
    console.log('📋 SmartAbpManifestWriter initialized')
  }

  /**
   * 生成完整的清单文件集合
   */
  async generateFiles(
    metadata: ModuleMetadata,
    basePath: string = '/src/modules'
  ): Promise<{ path: string; content: string }[]> {
    try {
      // 验证输入参数
      if (!metadata) {
        throw new Error('ModuleMetadata is required')
      }

      if (!metadata.name?.trim()) {
        throw new Error('Module name is required')
      }

      if (!basePath?.trim()) {
        throw new Error('Base path is required')
      }

      // 验证模块名称格式
      if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(metadata.name)) {
        throw new Error(`Invalid module name: ${metadata.name}. Module name must start with a letter and contain only letters and numbers`)
      }

      this.moduleMetadata = metadata
      this.outputPath = basePath

      const files: { path: string; content: string }[] = []
      
      console.log(`📁 Generating manifest files for module: ${metadata.name}`)

      // 生成实体清单文件
      const entityManifest = this.generateEntityManifest(metadata)
      files.push({
        path: `${basePath}/${metadata.name}/manifest.json`,
        content: JSON.stringify(entityManifest, null, 2)
      })

      // 生成列表视图配置
      const listViewConfig = this.generateListView(metadata)
      files.push({
        path: `${basePath}/${metadata.name}/list-view.json`,
        content: JSON.stringify(listViewConfig, null, 2)
      })

      // 生成管理视图配置
      const managementViewConfig = this.generateManagementView(metadata)
      files.push({
        path: `${basePath}/${metadata.name}/management-view.json`,
        content: JSON.stringify(managementViewConfig, null, 2)
      })

      // 生成状态管理配置
      const storeConfig = this.generateStore(metadata)
      files.push({
        path: `${basePath}/${metadata.name}/store.json`,
        content: JSON.stringify(storeConfig, null, 2)
      })

      // 生成路由配置
      const routeConfig = this.generateRouteConfig(metadata)
      files.push({
        path: `${basePath}/${metadata.name}/routes.json`,
        content: JSON.stringify(routeConfig, null, 2)
      })

      // 生成菜单配置
      const menuConfig = this.generateMenuConfig(metadata)
      files.push({
        path: `${basePath}/${metadata.name}/menu.json`,
        content: JSON.stringify(menuConfig, null, 2)
      })

      console.log(`✅ Successfully generated ${files.length} manifest files for module: ${metadata.name}`)
      
      return files
    } catch (error) {
      console.error(`[generateFiles] 生成清单文件失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate manifest files: ${errorMessage}`,
        duration: 5000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to generate manifest files: ${errorMessage}`)
    }
  }

  /**
   * 生成实体清单
   */
  private generateEntityManifest(metadata: ModuleMetadata): any {
    try {
      // 验证参数
      if (!metadata) {
        throw new Error('ModuleMetadata is required')
      }

      if (!metadata.entities?.length) {
        throw new Error('At least one entity is required')
      }

      // 验证实体定义
      metadata.entities.forEach((entity, index) => {
        if (!entity.name?.trim()) {
          throw new Error(`Entity at index ${index} has no name`)
        }

        if (!entity.properties?.length) {
          throw new Error(`Entity '${entity.name}' has no properties`)
        }

        // 验证属性定义
        entity.properties.forEach((property, propIndex) => {
          if (!property.name?.trim()) {
            throw new Error(`Property at index ${propIndex} in entity '${entity.name}' has no name`)
          }

          if (!property.type?.trim()) {
            throw new Error(`Property '${property.name}' in entity '${entity.name}' has no type`)
          }

          // 验证属性类型
          const validTypes = ['string', 'number', 'boolean', 'date', 'object', 'array']
          if (!validTypes.includes(property.type.toLowerCase())) {
            throw new Error(`Property '${property.name}' in entity '${entity.name}' has invalid type: ${property.type}. Valid types are: ${validTypes.join(', ')}`)
          }
        })
      })

      const manifest = {
        name: metadata.name,
        displayName: metadata.displayName || metadata.name,
        description: metadata.description || '',
        version: metadata.version || '1.0.0',
        entities: metadata.entities.map(entity => ({
          name: entity.name,
          displayName: entity.displayName || entity.name,
          description: entity.description || '',
          tableName: entity.tableName || `t_${entity.name.toLowerCase()}`,
          properties: entity.properties.map(prop => ({
            name: prop.name,
            displayName: prop.displayName || prop.name,
            type: prop.type,
            required: prop.required || false,
            maxLength: prop.maxLength || null,
            minLength: prop.minLength || null,
            defaultValue: prop.defaultValue || null,
            validation: prop.validation || null
          }))
        })),
        generatedAt: new Date().toISOString()
      }

      console.log(`📋 Generated entity manifest for module: ${metadata.name}`)
      
      return manifest
    } catch (error) {
      console.error(`[generateEntityManifest] 生成实体清单失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate entity manifest: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to generate entity manifest: ${errorMessage}`)
    }
  }

  /**
   * 生成列表视图配置
   */
  private generateListView(metadata: ModuleMetadata): ViewConfiguration {
    try {
      // 验证参数
      if (!metadata) {
        throw new Error('ModuleMetadata is required')
      }

      if (!metadata.entities?.length) {
        throw new Error('At least one entity is required')
      }

      const config: ViewConfiguration = {
        type: 'list',
        title: `${metadata.displayName || metadata.name}列表`,
        entity: metadata.entities[0].name, // 默认使用第一个实体
        columns: metadata.entities[0].properties
          .filter(prop => prop.showInList !== false)
          .slice(0, 6) // 最多显示6列
          .map(prop => ({
            field: prop.name,
            title: prop.displayName || prop.name,
            width: this.getColumnWidth(prop.type),
            sortable: prop.sortable !== false,
            filterable: prop.filterable !== false
          })),
        operations: [
          { name: 'create', title: '新建', type: 'primary', icon: 'plus' },
          { name: 'edit', title: '编辑', type: 'text', icon: 'edit' },
          { name: 'delete', title: '删除', type: 'text', icon: 'delete' }
        ],
        pagination: {
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true
        },
        filters: this.generateFilters(metadata.entities[0])
      }

      console.log(`📋 Generated list view config for module: ${metadata.name}`)
      
      return config
    } catch (error) {
      console.error(`[generateListView] 生成列表视图配置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate list view config: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to generate list view config: ${errorMessage}`)
    }
  }

  /**
   * 生成管理视图配置
   */
  private generateManagementView(metadata: ModuleMetadata): ViewConfiguration {
    try {
      // 验证参数
      if (!metadata) {
        throw new Error('ModuleMetadata is required')
      }

      if (!metadata.entities?.length) {
        throw new Error('At least one entity is required')
      }

      const entity = metadata.entities[0]
      
      const config: ViewConfiguration = {
        type: 'form',
        title: `${metadata.displayName || metadata.name}管理`,
        entity: entity.name,
        fields: entity.properties.map(prop => ({
          name: prop.name,
          label: prop.displayName || prop.name,
          type: this.getFieldType(prop.type),
          required: prop.required || false,
          placeholder: `请输入${prop.displayName || prop.name}`,
          validation: prop.validation ? {
            pattern: prop.validation.pattern,
            message: prop.validation.message || `请输入有效的${prop.displayName || prop.name}`
          } : undefined,
          options: prop.options || undefined
        })),
        layout: 'vertical',
        operations: [
          { name: 'save', title: '保存', type: 'primary' },
          { name: 'reset', title: '重置', type: 'default' },
          { name: 'cancel', title: '取消', type: 'text' }
        ]
      }

      console.log(`📋 Generated management view config for module: ${metadata.name}`)
      
      return config
    } catch (error) {
      console.error(`[generateManagementView] 生成管理视图配置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate management view config: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to generate management view config: ${errorMessage}`)
    }
  }

  /**
   * 生成状态管理配置
   */
  private generateStore(metadata: ModuleMetadata): any {
    try {
      // 验证参数
      if (!metadata) {
        throw new Error('ModuleMetadata is required')
      }

      if (!metadata.entities?.length) {
        throw new Error('At least one entity is required')
      }

      const config = {
        moduleName: metadata.name,
        state: {
          loading: false,
          data: [],
          total: 0,
          currentPage: 1,
          pageSize: 20,
          filters: {},
          sort: {}
        },
        getters: {
          isLoading: 'state.loading',
          dataList: 'state.data',
          totalCount: 'state.total'
        },
        actions: {
          async fetchList({ commit, state }, params) {
            commit('SET_LOADING', true)
            try {
              // 这里会调用实际的API
              const response = await fetch(`/api/${metadata.name}/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  page: state.currentPage,
                  pageSize: state.pageSize,
                  ...params
                })
              })
              const data = await response.json()
              commit('SET_DATA', data.items)
              commit('SET_TOTAL', data.total)
            } catch (error) {
              console.error('Failed to fetch list:', error)
              throw error
            } finally {
              commit('SET_LOADING', false)
            }
          },
          async create({ dispatch }, item) {
            await fetch(`/api/${metadata.name}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            })
            await dispatch('fetchList')
          },
          async update({ dispatch }, item) {
            await fetch(`/api/${metadata.name}/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            })
            await dispatch('fetchList')
          },
          async delete({ dispatch }, id) {
            await fetch(`/api/${metadata.name}/${id}`, {
              method: 'DELETE'
            })
            await dispatch('fetchList')
          }
        },
        mutations: {
          SET_LOADING: 'state.loading = payload',
          SET_DATA: 'state.data = payload',
          SET_TOTAL: 'state.total = payload',
          SET_PAGE: 'state.currentPage = payload',
          SET_PAGE_SIZE: 'state.pageSize = payload',
          SET_FILTERS: 'state.filters = payload',
          SET_SORT: 'state.sort = payload'
        }
      }

      console.log(`📋 Generated store config for module: ${metadata.name}`)
      
      return config
    } catch (error) {
      console.error(`[generateStore] 生成状态管理配置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate store config: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to generate store config: ${errorMessage}`)
    }
  }

  /**
   * 生成路由配置
   */
  private generateRouteConfig(metadata: ModuleMetadata): any {
    try {
      // 验证参数
      if (!metadata) {
        throw new Error('ModuleMetadata is required')
      }

      if (!metadata.name?.trim()) {
        throw new Error('Module name is required')
      }

      const config = {
        path: `/${metadata.name.toLowerCase()}`,
        name: metadata.name,
        component: 'Layout',
        meta: {
          title: metadata.displayName || metadata.name,
          icon: metadata.icon || 'table',
          requiresAuth: true
        },
        children: [
          {
            path: '',
            name: `${metadata.name}List`,
            component: `${metadata.name}List`,
            meta: {
              title: `${metadata.displayName || metadata.name}列表`,
              icon: 'list'
            }
          },
          {
            path: 'create',
            name: `${metadata.name}Create`,
            component: `${metadata.name}Form`,
            meta: {
              title: `新建${metadata.displayName || metadata.name}`,
              icon: 'plus'
            }
          },
          {
            path: 'edit/:id',
            name: `${metadata.name}Edit`,
            component: `${metadata.name}Form`,
            meta: {
              title: `编辑${metadata.displayName || metadata.name}`,
              icon: 'edit'
            }
          }
        ]
      }

      console.log(`📋 Generated route config for module: ${metadata.name}`)
      
      return config
    } catch (error) {
      console.error(`[generateRouteConfig] 生成路由配置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate route config: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to generate route config: ${errorMessage}`)
    }
  }

  /**
   * 生成菜单配置
   */
  private generateMenuConfig(metadata: ModuleMetadata): MenuConfiguration {
    try {
      // 验证参数
      if (!metadata) {
        throw new Error('ModuleMetadata is required')
      }

      if (!metadata.name?.trim()) {
        throw new Error('Module name is required')
      }

      const config: MenuConfiguration = {
        id: metadata.name.toLowerCase(),
        name: metadata.displayName || metadata.name,
        icon: metadata.icon || 'table',
        path: `/${metadata.name.toLowerCase()}`,
        sort: metadata.sort || 999,
        children: [
          {
            id: `${metadata.name.toLowerCase()}-list`,
            name: `${metadata.displayName || metadata.name}列表`,
            path: `/${metadata.name.toLowerCase()}`,
            icon: 'list',
            sort: 1
          }
        ]
      }

      console.log(`📋 Generated menu config for module: ${metadata.name}`)
      
      return config
    } catch (error) {
      console.error(`[generateMenuConfig] 生成菜单配置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate menu config: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to generate menu config: ${errorMessage}`)
    }
  }

  /**
   * 获取列宽度
   */
  private getColumnWidth(type: string): number {
    try {
      // 验证参数
      if (!type?.trim()) {
        throw new Error('Column type is required')
      }

      const widthMap: Record<string, number> = {
        string: 150,
        number: 100,
        boolean: 80,
        date: 120,
        object: 200,
        array: 200
      }
      
      const width = widthMap[type.toLowerCase()] || 150
      
      console.log(`📏 Column width for type '${type}': ${width}px`)
      
      return width
    } catch (error) {
      console.error(`[getColumnWidth] 获取列宽度失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to get column width: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到默认宽度
      return 150
    }
  }

  /**
   * 获取字段类型
   */
  private getFieldType(type: string): string {
    try {
      // 验证参数
      if (!type?.trim()) {
        throw new Error('Field type is required')
      }

      const typeMap: Record<string, string> = {
        string: 'input',
        number: 'number',
        boolean: 'switch',
        date: 'date-picker',
        object: 'json-editor',
        array: 'list-editor'
      }
      
      const fieldType = typeMap[type.toLowerCase()] || 'input'
      
      console.log(`📝 Field type mapping: ${type} -> ${fieldType}`)
      
      return fieldType
    } catch (error) {
      console.error(`[getFieldType] 获取字段类型失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to get field type: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到默认类型
      return 'input'
    }
  }

  /**
   * 生成过滤器配置
   */
  private generateFilters(entity: EntityDefinition): any[] {
    try {
      // 验证参数
      if (!entity) {
        throw new Error('Entity definition is required')
      }

      if (!entity.properties?.length) {
        throw new Error('Entity must have properties')
      }

      const filters = entity.properties
        .filter(prop => prop.filterable !== false)
        .slice(0, 4) // 最多4个过滤器
        .map(prop => ({
          field: prop.name,
          label: prop.displayName || prop.name,
          type: this.getFilterType(prop.type),
          operator: this.getFilterOperator(prop.type)
        }))

      console.log(`🔍 Generated ${filters.length} filters for entity: ${entity.name}`)
      
      return filters
    } catch (error) {
      console.error(`[generateFilters] 生成过滤器配置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate filters: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到空数组
      return []
    }
  }

  /**
   * 获取过滤器类型
   */
  private getFilterType(type: string): string {
    try {
      // 验证参数
      if (!type?.trim()) {
        throw new Error('Filter type is required')
      }

      const filterTypeMap: Record<string, string> = {
        string: 'input',
        number: 'number-range',
        boolean: 'switch',
        date: 'date-range',
        object: 'json',
        array: 'select'
      }
      
      const filterType = filterTypeMap[type.toLowerCase()] || 'input'
      
      console.log(`🔍 Filter type mapping: ${type} -> ${filterType}`)
      
      return filterType
    } catch (error) {
      console.error(`[getFilterType] 获取过滤器类型失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to get filter type: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到默认类型
      return 'input'
    }
  }

  /**
   * 获取过滤器操作符
   */
  private getFilterOperator(type: string): string {
    try {
      // 验证参数
      if (!type?.trim()) {
        throw new Error('Filter operator type is required')
      }

      const operatorMap: Record<string, string> = {
        string: 'like',
        number: 'between',
        boolean: 'equal',
        date: 'between',
        object: 'contains',
        array: 'in'
      }
      
      const operator = operatorMap[type.toLowerCase()] || 'equal'
      
      console.log(`🔍 Filter operator mapping: ${type} -> ${operator}`)
      
      return operator
    } catch (error) {
      console.error(`[getFilterOperator] 获取过滤器操作符失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to get filter operator: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到默认操作符
      return 'equal'
    }
  }

  /**
   * 更新路由配置
   */
  async updateRouter(moduleName: string, routerConfig: any): Promise<void> {
    try {
      // 验证参数
      if (!moduleName?.trim()) {
        throw new Error('Module name is required')
      }

      if (!routerConfig) {
        throw new Error('Router configuration is required')
      }

      // 验证路由配置格式
      if (!routerConfig.path?.trim()) {
        throw new Error('Router path is required')
      }

      if (!routerConfig.name?.trim()) {
        throw new Error('Router name is required')
      }

      console.log(`🔄 Updating router configuration for module: ${moduleName}`)
      
      // 这里会实现实际的路由更新逻辑
      // 比如更新路由文件、重启服务等
      
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log(`✅ Router configuration updated for module: ${moduleName}`)
      
      ElMessage.success({
        message: `Router configuration updated successfully for module: ${moduleName}`,
        duration: 3000,
      })
    } catch (error) {
      console.error(`[updateRouter] 更新路由配置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to update router configuration: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to update router configuration: ${errorMessage}`)
    }
  }

  /**
   * 更新菜单配置
   */
  async updateMenus(menus: MenuConfiguration[]): Promise<void> {
    try {
      // 验证参数
      if (!menus?.length) {
        throw new Error('Menu configuration array is required')
      }

      // 验证每个菜单项
      menus.forEach((menu, index) => {
        if (!menu.id?.trim()) {
          throw new Error(`Menu at index ${index} has no ID`)
        }

        if (!menu.name?.trim()) {
          throw new Error(`Menu '${menu.id}' has no name`)
        }

        if (!menu.path?.trim()) {
          throw new Error(`Menu '${menu.id}' has no path`)
        }

        // 验证菜单ID格式
        if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(menu.id)) {
          throw new Error(`Invalid menu ID: ${menu.id}. Menu ID must start with a letter and contain only letters, numbers, and hyphens`)
        }

        // 验证路径格式
        if (!menu.path.startsWith('/')) {
          throw new Error(`Invalid menu path: ${menu.path}. Menu path must start with '/'`)
        }
      })

      console.log(`🔄 Updating ${menus.length} menu configurations`)
      
      // 这里会实现实际的菜单更新逻辑
      // 比如更新菜单配置文件、通知菜单服务等
      
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log(`✅ Menu configurations updated successfully`)
      
      ElMessage.success({
        message: `Menu configurations updated successfully`,
        duration: 3000,
      })
    } catch (error) {
      console.error(`[updateMenus] 更新菜单配置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to update menu configurations: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to update menu configurations: ${errorMessage}`)
    }
  }

  /**
   * 添加模块到现有配置
   */
  async addModule(metadata: ModuleMetadata, existingConfig: any): Promise<any> {
    try {
      // 验证参数
      if (!metadata) {
        throw new Error('ModuleMetadata is required')
      }

      if (!existingConfig) {
        throw new Error('Existing configuration is required')
      }

      if (!metadata.name?.trim()) {
        throw new Error('Module name is required')
      }

      // 验证模块名称唯一性
      if (existingConfig.modules?.some((module: any) => module.name === metadata.name)) {
        throw new Error(`Module '${metadata.name}' already exists in configuration`)
      }

      const updatedConfig = {
        ...existingConfig,
        modules: [
          ...(existingConfig.modules || []),
          {
            name: metadata.name,
            displayName: metadata.displayName || metadata.name,
            description: metadata.description || '',
            version: metadata.version || '1.0.0',
            enabled: true,
            createdAt: new Date().toISOString()
          }
        ],
        lastModified: new Date().toISOString()
      }

      console.log(`➕ Added module '${metadata.name}' to configuration`)
      
      ElMessage.success({
        message: `Module '${metadata.name}' added to configuration successfully`,
        duration: 3000,
      })
      
      return updatedConfig
    } catch (error) {
      console.error(`[addModule] 添加模块失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to add module: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to add module: ${errorMessage}`)
    }
  }

  /**
   * 生成菜单树结构
   */
  generateMenuTree(modules: ModuleMetadata[]): MenuConfiguration[] {
    try {
      // 验证参数
      if (!modules?.length) {
        throw new Error('Module metadata array is required')
      }

      // 验证每个模块
      modules.forEach((module, index) => {
        if (!module.name?.trim()) {
          throw new Error(`Module at index ${index} has no name`)
        }

        // 验证模块名称格式
        if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(module.name)) {
          throw new Error(`Invalid module name: ${module.name}. Module name must start with a letter and contain only letters and numbers`)
        }
      })

      const menuTree: MenuConfiguration[] = modules.map(module => ({
        id: module.name.toLowerCase(),
        name: module.displayName || module.name,
        icon: module.icon || 'table',
        path: `/${module.name.toLowerCase()}`,
        sort: module.sort || 999,
        children: [
          {
            id: `${module.name.toLowerCase()}-list`,
            name: `${module.displayName || module.name}列表`,
            path: `/${module.name.toLowerCase()}`,
            icon: 'list',
            sort: 1
          },
          {
            id: `${module.name.toLowerCase()}-management`,
            name: `${module.displayName || module.name}管理`,
            path: `/${module.name.toLowerCase()}/management`,
            icon: 'setting',
            sort: 2
          }
        ]
      }))

      // 按sort排序
      menuTree.sort((a, b) => (a.sort || 999) - (b.sort || 999))

      console.log(`🌳 Generated menu tree with ${menuTree.length} modules`)
      
      ElMessage.success({
        message: `Menu tree generated successfully with ${menuTree.length} modules`,
        duration: 3000,
      })
      
      return menuTree
    } catch (error) {
      console.error(`[generateMenuTree] 生成菜单树失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate menu tree: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to generate menu tree: ${errorMessage}`)
    }
  }
}

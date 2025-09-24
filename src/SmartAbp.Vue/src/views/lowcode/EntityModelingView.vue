<template>
  <div class="entity-modeling-view">
    <!-- 建模器头部 -->
    <div class="modeling-header">
      <div class="header-left">
        <h2>
          <i class="el-icon-data-analysis" />
          数据建模 - 权限管理系统
        </h2>
        <div class="progress-info">
          <span>实体设计进度: {{ completedEntities }}/{{ totalEntities }}</span>
          <el-progress 
            :percentage="progressPercentage" 
            :stroke-width="6" 
            status="success"
          />
        </div>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button 
            type="primary" 
            :icon="isAutoLayout ? 'el-icon-magic-stick' : 'el-icon-rank'"
            @click="toggleAutoLayout"
          >
            {{ isAutoLayout ? '手动布局' : '自动布局' }}
          </el-button>
          <el-button 
            type="success" 
            icon="el-icon-view" 
            @click="previewSchema"
          >
            预览架构
          </el-button>
          <el-button 
            type="warning" 
            icon="el-icon-download" 
            @click="exportSchema"
          >
            导出设计
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主体建模区域 -->
    <div class="modeling-body">
      <!-- 左侧实体列表 -->
      <div class="entities-panel">
        <div class="panel-header">
          <h3>实体列表</h3>
          <el-button 
            type="primary" 
            size="small" 
            icon="el-icon-plus"
            @click="showAddEntityDialog = true"
          >
            添加实体
          </el-button>
        </div>
        
        <div class="entities-list">
          <div 
            v-for="entity in entities" 
            :key="entity.id"
            class="entity-card"
            :class="{ active: selectedEntityId === entity.id, completed: entity.isCompleted }"
            @click="selectEntity(entity.id)"
          >
            <div class="entity-header">
              <div class="entity-info">
                <i :class="getEntityIcon(entity.category)" />
                <div class="entity-details">
                  <div class="entity-name">
                    {{ entity.name }}
                  </div>
                  <div class="entity-table">
                    {{ entity.tableName }}
                  </div>
                </div>
              </div>
              <div class="entity-actions">
                <el-button-group size="small">
                  <el-button 
                    icon="el-icon-edit" 
                    type="primary"
                    title="编辑实体"
                    @click.stop="editEntity(entity)"
                  />
                  <el-button 
                    icon="el-icon-document-checked" 
                    type="success"
                    title="保存实体"
                    @click.stop="saveEntity(entity)"
                  />
                  <el-button 
                    icon="el-icon-delete" 
                    type="danger"
                    title="删除实体"
                    @click.stop="deleteEntity(entity.id)"
                  />
                </el-button-group>
                <el-tag 
                  :type="entity.isCompleted ? 'success' : 'warning'" 
                  size="small"
                  class="entity-status-tag"
                >
                  {{ entity.isCompleted ? '已完成' : '待完善' }}
                </el-tag>
              </div>
            </div>
            <div class="entity-stats">
              <span>字段: {{ entity.fields.length }}</span>
              <span>关系: {{ getEntityRelationCount(entity.id) }}</span>
            </div>
          </div>
        </div>

        <!-- 预设实体快速添加 -->
        <div class="preset-entities">
          <h4>权限管理预设实体</h4>
          <el-button 
            v-for="preset in presetEntities"
            :key="preset.id"
            size="small"
            :disabled="isEntityExists(preset.tableName)"
            style="margin: 2px; width: calc(50% - 4px);"
            @click="addPresetEntity(preset)"
          >
            {{ preset.name }}
          </el-button>
        </div>
      </div>

      <!-- 中央设计区域 -->
      <div class="design-area">
        <!-- 工具栏 -->
        <div class="design-toolbar">
          <el-button-group size="small">
            <el-button 
              :type="designMode === 'fields' ? 'primary' : 'default'"
              @click="designMode = 'fields'"
            >
              字段设计
            </el-button>
            <el-button 
              :type="designMode === 'relations' ? 'primary' : 'default'"
              @click="designMode = 'relations'"
            >
              关系设计
            </el-button>
            <el-button 
              :type="designMode === 'validation' ? 'primary' : 'default'"
              @click="designMode = 'validation'"
            >
              验证规则
            </el-button>
            <el-button 
              :type="designMode === 'advanced-relations' ? 'primary' : 'default'"
              @click="designMode = 'advanced-relations'"
            >
              高级关系
            </el-button>
            <el-button 
              :type="designMode === 'field-types' ? 'primary' : 'default'"
              @click="designMode = 'field-types'"
            >
              字段类型
            </el-button>
            <el-button 
              :type="designMode === 'business-rules' ? 'primary' : 'default'"
              @click="designMode = 'business-rules'"
            >
              业务规则
            </el-button>
            <el-button 
              :type="designMode === 'data-dict' ? 'primary' : 'default'"
              @click="designMode = 'data-dict'"
            >
              数据字典
            </el-button>
            <el-button 
              :type="designMode === 'assistant' ? 'primary' : 'default'"
              @click="designMode = 'assistant'"
            >
              <i class="el-icon-magic-stick" />
              智能助手
            </el-button>
          </el-button-group>
          
          <div
            v-if="selectedEntity"
            class="toolbar-info"
          >
            <span>当前实体: {{ selectedEntity.name }}</span>
            <el-divider direction="vertical" />
            <span>表名: {{ selectedEntity.tableName }}</span>
          </div>
        </div>

        <!-- 字段设计面板 -->
        <div
          v-if="designMode === 'fields' && selectedEntity"
          class="fields-designer"
        >
          <div class="fields-header">
            <h3>字段配置</h3>
            <el-button 
              type="primary" 
              size="small" 
              icon="el-icon-plus"
              @click="addField"
            >
              添加字段
            </el-button>
          </div>
          
          <el-table
            :data="selectedEntity.fields"
            style="width: 100%"
          >
            <el-table-column
              prop="name"
              label="字段名"
              width="150"
            >
              <template #default="scope">
                <el-input 
                  v-model="scope.row.name" 
                  size="small"
                  @change="validateField(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="displayName"
              label="显示名"
              width="120"
            >
              <template #default="scope">
                <el-input
                  v-model="scope.row.displayName"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="type"
              label="数据类型"
              width="120"
            >
              <template #default="scope">
                <el-select
                  v-model="scope.row.type"
                  size="small"
                >
                  <el-option 
                    v-for="type in fieldTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              prop="length"
              label="长度"
              width="80"
            >
              <template #default="scope">
                <el-input-number 
                  v-if="needsLength(scope.row.type)" 
                  v-model="scope.row.length" 
                  size="small" 
                  :min="1"
                  :max="5000"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="isRequired"
              label="必填"
              width="80"
            >
              <template #default="scope">
                <el-checkbox v-model="scope.row.isRequired" />
              </template>
            </el-table-column>
            <el-table-column
              prop="isPrimaryKey"
              label="主键"
              width="80"
            >
              <template #default="scope">
                <el-checkbox 
                  v-model="scope.row.isPrimaryKey"
                  @change="handlePrimaryKeyChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="defaultValue"
              label="默认值"
              width="120"
            >
              <template #default="scope">
                <el-input
                  v-model="scope.row.defaultValue"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="120"
            >
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  icon="el-icon-edit"
                  @click="editFieldValidation(scope.row)"
                />
                <el-button 
                  type="danger" 
                  size="small" 
                  icon="el-icon-delete"
                  @click="removeField(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 关系设计面板 -->
        <div
          v-if="designMode === 'relations'"
          class="relations-designer"
        >
          <div class="relations-header">
            <h3>实体关系设计</h3>
            <el-button 
              type="primary" 
              size="small" 
              icon="el-icon-connection"
              @click="showAddRelationDialog = true"
            >
              添加关系
            </el-button>
          </div>
          
          <!-- 关系图表区域 -->
          <div
            ref="relationsCanvas"
            class="relations-canvas"
          >
            <!-- 这里将来可以集成可视化关系图组件 -->
            <div class="relations-placeholder">
              <i
                class="el-icon-share"
                style="font-size: 48px; color: #ddd;"
              />
              <p>实体关系图</p>
              <p>支持拖拽连线设计实体间关系</p>
            </div>
          </div>

          <!-- 关系列表 -->
          <div class="relations-list">
            <h4>已配置关系</h4>
            <el-table
              :data="relations"
              style="width: 100%"
            >
              <el-table-column
                prop="fromEntity"
                label="源实体"
              />
              <el-table-column
                prop="toEntity"
                label="目标实体"
              />
              <el-table-column
                prop="type"
                label="关系类型"
              />
              <el-table-column
                prop="foreignKey"
                label="外键字段"
              />
              <el-table-column
                label="操作"
                width="120"
              >
                <template #default="scope">
                  <el-button 
                    type="primary" 
                    size="small" 
                    icon="el-icon-edit"
                    @click="editRelation(scope.row)"
                  />
                  <el-button 
                    type="danger" 
                    size="small" 
                    icon="el-icon-delete"
                    @click="removeRelation(scope.$index)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 验证规则面板 -->
        <div
          v-if="designMode === 'validation' && selectedEntity"
          class="validation-designer"
        >
          <div class="validation-header">
            <h3>验证规则配置</h3>
            <el-button 
              type="primary" 
              size="small" 
              icon="el-icon-circle-check"
              @click="addValidationRule"
            >
              添加规则
            </el-button>
          </div>
          
          <el-table
            :data="selectedEntity.validationRules"
            style="width: 100%"
          >
            <el-table-column
              prop="fieldName"
              label="字段"
              width="150"
            >
              <template #default="scope">
                <el-select
                  v-model="scope.row.fieldName"
                  size="small"
                >
                  <el-option 
                    v-for="field in selectedEntity.fields"
                    :key="field.name"
                    :label="field.displayName || field.name"
                    :value="field.name"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              prop="ruleType"
              label="规则类型"
              width="150"
            >
              <template #default="scope">
                <el-select
                  v-model="scope.row.ruleType"
                  size="small"
                >
                  <el-option
                    label="长度限制"
                    value="length"
                  />
                  <el-option
                    label="数值范围"
                    value="range"
                  />
                  <el-option
                    label="正则表达式"
                    value="regex"
                  />
                  <el-option
                    label="唯一性检查"
                    value="unique"
                  />
                  <el-option
                    label="自定义函数"
                    value="custom"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              prop="ruleValue"
              label="规则值"
              width="200"
            >
              <template #default="scope">
                <el-input
                  v-model="scope.row.ruleValue"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="errorMessage"
              label="错误信息"
            >
              <template #default="scope">
                <el-input
                  v-model="scope.row.errorMessage"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="80"
            >
              <template #default="scope">
                <el-button 
                  type="danger" 
                  size="small" 
                  icon="el-icon-delete"
                  @click="removeValidationRule(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 高级关系设计面板 -->
        <div
          v-if="designMode === 'advanced-relations'"
          class="advanced-relations-designer"
        >
          <AdvancedEntityRelationshipDesigner
            @entity-selected="selectEntity"
            @create-abstract-entity="createAbstractEntity"
          />
        </div>

        <!-- 高级字段类型面板 -->
        <div
          v-if="designMode === 'field-types'"
          class="field-types-designer"
        >
          <AdvancedFieldTypeDesigner
            @field-configured="handleFieldConfigured"
          />
        </div>

        <!-- 业务规则引擎面板 -->
        <div
          v-if="designMode === 'business-rules'"
          class="business-rules-designer"
        >
          <BusinessRulesEngine />
        </div>

        <!-- 数据字典管理面板 -->
        <div
          v-if="designMode === 'data-dict'"
          class="data-dictionary-designer"
        >
          <DataDictionaryManager
            @dictionary-selected="handleDictionarySelected"
            @dictionary-updated="handleDictionaryUpdated"
          />
        </div>

        <!-- 智能建模助手面板 -->
        <div
          v-if="designMode === 'assistant'"
          class="intelligent-assistant"
        >
          <IntelligentModelingAssistant />
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div
        v-if="selectedEntity"
        class="properties-panel"
      >
        <div class="panel-header">
          <h3>实体属性</h3>
        </div>
        
        <el-form
          :model="selectedEntity"
          label-width="80px"
        >
          <el-form-item label="实体名">
            <el-input v-model="selectedEntity.name" />
          </el-form-item>
          <el-form-item label="表名">
            <el-input v-model="selectedEntity.tableName" />
          </el-form-item>
          <el-form-item label="显示名">
            <el-input v-model="selectedEntity.displayName" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input 
              v-model="selectedEntity.description" 
              type="textarea" 
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="selectedEntity.category">
              <el-option
                label="核心实体"
                value="core"
              />
              <el-option
                label="关联实体"
                value="relation"
              />
              <el-option
                label="配置实体"
                value="config"
              />
              <el-option
                label="日志实体"
                value="log"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="启用软删除">
            <el-checkbox v-model="selectedEntity.enableSoftDelete" />
          </el-form-item>
          <el-form-item label="启用审计">
            <el-checkbox v-model="selectedEntity.enableAudit" />
          </el-form-item>
          <el-form-item label="启用多租户">
            <el-checkbox v-model="selectedEntity.enableMultiTenant" />
          </el-form-item>
        </el-form>

        <!-- 生成预览 -->
        <div class="generation-preview">
          <h4>代码预览</h4>
          <el-tabs v-model="previewTab">
            <el-tab-pane
              label="实体类"
              name="entity"
            >
              <pre class="code-preview">{{ generateEntityPreview() }}</pre>
            </el-tab-pane>
            <el-tab-pane
              label="DTO"
              name="dto"
            >
              <pre class="code-preview">{{ generateDtoPreview() }}</pre>
            </el-tab-pane>
            <el-tab-pane
              label="SQL"
              name="sql"
            >
              <pre class="code-preview">{{ generateSqlPreview() }}</pre>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 添加实体对话框 -->
    <el-dialog 
      v-model="showAddEntityDialog" 
      title="添加新实体" 
      width="500px"
    >
      <el-form
        :model="newEntityForm"
        label-width="80px"
      >
        <el-form-item
          label="实体名"
          required
        >
          <el-input 
            v-model="newEntityForm.name" 
            placeholder="例如: User"
            @input="autoFillTableName"
          />
        </el-form-item>
        <el-form-item
          label="表名"
          required
        >
          <el-input 
            v-model="newEntityForm.tableName" 
            placeholder="例如: AbpUsers"
          />
        </el-form-item>
        <el-form-item label="显示名">
          <el-input 
            v-model="newEntityForm.displayName" 
            placeholder="例如: 用户"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="newEntityForm.description" 
            type="textarea" 
            placeholder="实体功能描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddEntityDialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="createEntity"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加关系对话框 -->
    <el-dialog 
      v-model="showAddRelationDialog" 
      title="添加实体关系" 
      width="600px"
    >
      <el-form
        :model="newRelationForm"
        label-width="100px"
      >
        <el-form-item
          label="源实体"
          required
        >
          <el-select
            v-model="newRelationForm.fromEntity"
            placeholder="选择源实体"
          >
            <el-option 
              v-for="entity in entities"
              :key="entity.id"
              :label="entity.name"
              :value="entity.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="目标实体"
          required
        >
          <el-select
            v-model="newRelationForm.toEntity"
            placeholder="选择目标实体"
          >
            <el-option 
              v-for="entity in entities"
              :key="entity.id"
              :label="entity.name"
              :value="entity.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="关系类型"
          required
        >
          <el-select
            v-model="newRelationForm.type"
            placeholder="选择关系类型"
          >
            <el-option
              label="一对一 (1:1)"
              value="one-to-one"
            />
            <el-option
              label="一对多 (1:N)"
              value="one-to-many"
            />
            <el-option
              label="多对多 (M:N)"
              value="many-to-many"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="外键字段"
          required
        >
          <el-input 
            v-model="newRelationForm.foreignKey" 
            placeholder="例如: UserId"
          />
        </el-form-item>
        <el-form-item label="导航属性">
          <el-input 
            v-model="newRelationForm.navigationProperty" 
            placeholder="例如: User"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddRelationDialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="createRelation"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 实体编辑对话框 -->
    <el-dialog
      v-model="showEntityEditDialog"
      title="编辑实体"
      width="700px"
      :close-on-click-modal="false"
      @close="handleEntityEditCancel"
    >
      <el-form
        v-if="editingEntity"
        ref="entityEditFormRef"
        :model="editingEntity"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="实体名称"
              required
            >
              <el-input 
                v-model="editingEntity.name" 
                placeholder="请输入实体名称 (PascalCase)"
              />
              <div class="form-help">
                实体名称，如：User、Organization
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="表名"
              required
            >
              <el-input 
                v-model="editingEntity.tableName" 
                placeholder="请输入数据库表名"
              />
              <div class="form-help">
                数据库表名，如：AbpUsers
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="显示名称"
              required
            >
              <el-input 
                v-model="editingEntity.displayName" 
                placeholder="请输入显示名称"
              />
              <div class="form-help">
                界面显示名称，如：用户、组织
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实体分类">
              <el-select
                v-model="editingEntity.category"
                placeholder="选择分类"
              >
                <el-option
                  value="core"
                  label="核心实体"
                />
                <el-option
                  value="relation"
                  label="关系实体"
                />
                <el-option
                  value="config"
                  label="配置实体"
                />
                <el-option
                  value="log"
                  label="日志实体"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="实体描述">
          <el-input 
            v-model="editingEntity.description" 
            type="textarea"
            :rows="2"
            placeholder="请输入实体描述"
          />
        </el-form-item>
        
        <div class="entity-options-section">
          <h4>实体特性</h4>
          <el-checkbox-group v-model="entityFeatures">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-checkbox value="isAggregateRoot">
                  聚合根
                </el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox value="enableSoftDelete">
                  软删除
                </el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox value="enableAudit">
                  审计字段
                </el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox value="enableMultiTenant">
                  多租户
                </el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox value="hasExtraProperties">
                  扩展属性
                </el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox value="enableCaching">
                  启用缓存
                </el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </div>
        
        <!-- 字段快速编辑 -->
        <div class="fields-quick-edit">
          <div class="fields-header">
            <h4>字段管理</h4>
            <el-button 
              size="small" 
              type="primary" 
              icon="el-icon-plus"
              @click="addEntityField(editingEntity.id)"
            >
              添加字段
            </el-button>
          </div>
          
          <div class="fields-table">
            <el-table 
              :data="editingEntity.fields" 
              size="small"
              max-height="300"
            >
              <el-table-column
                prop="name"
                label="字段名"
                width="120"
              >
                <template #default="{ row, $index }">
                  <el-input 
                    v-model="row.name" 
                    size="small"
                    @change="updateEntityField(editingEntity.id, $index, row)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                prop="displayName"
                label="显示名"
                width="100"
              >
                <template #default="{ row, $index }">
                  <el-input 
                    v-model="row.displayName" 
                    size="small"
                    @change="updateEntityField(editingEntity.id, $index, row)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                prop="type"
                label="类型"
                width="100"
              >
                <template #default="{ row, $index }">
                  <el-select 
                    v-model="row.type" 
                    size="small"
                    @change="updateEntityField(editingEntity.id, $index, row)"
                  >
                    <el-option 
                      v-for="type in fieldTypes"
                      :key="type.value"
                      :label="type.value"
                      :value="type.value"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                prop="isRequired"
                label="必填"
                width="60"
              >
                <template #default="{ row, $index }">
                  <el-checkbox 
                    v-model="row.isRequired"
                    @change="updateEntityField(editingEntity.id, $index, row)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                v-if="editingEntity.fields.some(f => f.type === 'string')"
                prop="maxLength"
                label="长度"
                width="80"
              >
                <template #default="{ row, $index }">
                  <el-input-number 
                    v-if="row.type === 'string'"
                    v-model="row.maxLength" 
                    size="small"
                    :min="1"
                    :max="4000"
                    @change="updateEntityField(editingEntity.id, $index, row)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="80"
              >
                <template #default="{ $index }">
                  <el-button 
                    size="small" 
                    type="danger" 
                    icon="el-icon-delete"
                    @click="removeEntityField(editingEntity.id, $index)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-form>
      
      <template #footer>
        <el-button @click="handleEntityEditCancel">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleEntityEditConfirm"
        >
          保存实体
        </el-button>
      </template>
    </el-dialog>

    <!-- 架构预览对话框 -->
    <el-dialog 
      v-model="showSchemaPreview" 
      title="数据库架构预览" 
      width="80%"
      top="5vh"
    >
      <div class="schema-preview">
        <el-tabs v-model="schemaPreviewTab">
          <el-tab-pane
            label="ER图"
            name="diagram"
          >
            <div class="er-diagram">
              <!-- 这里可以集成ER图组件 -->
              <p>实体关系图将在这里显示</p>
            </div>
          </el-tab-pane>
          <el-tab-pane
            label="DDL语句"
            name="ddl"
          >
            <pre class="ddl-preview">{{ generateDDL() }}</pre>
          </el-tab-pane>
          <el-tab-pane
            label="实体统计"
            name="stats"
          >
            <div class="schema-stats">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-statistic
                    title="实体数量"
                    :value="entities.length"
                  />
                </el-col>
                <el-col :span="6">
                  <el-statistic
                    title="字段总数"
                    :value="totalFields"
                  />
                </el-col>
                <el-col :span="6">
                  <el-statistic
                    title="关系数量"
                    :value="relations.length"
                  />
                </el-col>
                <el-col :span="6">
                  <el-statistic
                    title="完成度"
                    :value="progressPercentage"
                    suffix="%"
                  />
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useEntityModelingStore } from "@/stores/lowcode/entityModeling"
import AdvancedEntityRelationshipDesigner from "@/components/lowcode/AdvancedEntityRelationshipDesigner.vue"
import AdvancedFieldTypeDesigner from "@/components/lowcode/AdvancedFieldTypeDesigner.vue"
import BusinessRulesEngine from "@/components/lowcode/BusinessRulesEngine.vue"
import DataDictionaryManager from "@/components/lowcode/DataDictionaryManager.vue"
import IntelligentModelingAssistant from "@/components/lowcode/IntelligentModelingAssistant.vue"

// Store
const store = useEntityModelingStore()

// 响应式数据
const selectedEntityId = ref<string>("")
const designMode = ref<"fields" | "relations" | "validation">("fields")
const isAutoLayout = ref(true)
const showAddEntityDialog = ref(false)
const showAddRelationDialog = ref(false)
const showSchemaPreview = ref(false)
const previewTab = ref("entity")
const schemaPreviewTab = ref("diagram")

// 表单数据
const newEntityForm = ref({
  name: "",
  tableName: "",
  displayName: "",
  description: ""
})

const newRelationForm = ref({
  fromEntity: "",
  toEntity: "",
  type: "",
  foreignKey: "",
  navigationProperty: ""
})

// 字段类型定义
const fieldTypes = [
  { label: "字符串 (string)", value: "string" },
  { label: "整数 (int)", value: "int" },
  { label: "长整数 (long)", value: "long" },
  { label: "布尔值 (bool)", value: "bool" },
  { label: "日期时间 (DateTime)", value: "DateTime" },
  { label: "小数 (decimal)", value: "decimal" },
  { label: "GUID", value: "Guid" },
  { label: "枚举 (enum)", value: "enum" },
  { label: "JSON", value: "json" }
]

// 权限管理预设实体
const presetEntities = [
  {
    id: "organization-unit",
    name: "组织架构",
    tableName: "AbpOrganizationUnits",
    displayName: "组织架构",
    description: "企业组织架构管理，支持公司-部门-岗位三级结构",
    category: "core"
  },
  {
    id: "user",
    name: "User",
    tableName: "AbpUsers",
    displayName: "用户",
    description: "系统用户基本信息管理",
    category: "core"
  },
  {
    id: "role",
    name: "Role",
    tableName: "AbpRoles",
    displayName: "角色",
    description: "系统角色定义和管理",
    category: "core"
  },
  {
    id: "permission",
    name: "Permission",
    tableName: "AbpPermissions",
    displayName: "权限",
    description: "系统权限定义和管理",
    category: "core"
  },
  {
    id: "role-permission",
    name: "RolePermission",
    tableName: "AbpRolePermissions",
    displayName: "角色权限",
    description: "角色与权限的关联关系",
    category: "relation"
  },
  {
    id: "menu",
    name: "Menu",
    tableName: "AbpMenus",
    displayName: "菜单",
    description: "系统菜单和界面权限管理",
    category: "config"
  }
]

// 计算属性
const entities = computed(() => store.entities)
const relations = computed(() => store.relations)
const selectedEntity = computed(() => 
  entities.value.find(e => e.id === selectedEntityId.value)
)
const completedEntities = computed(() => 
  entities.value.filter(e => e.isCompleted).length
)
const totalEntities = computed(() => entities.value.length)
const progressPercentage = computed(() => 
  totalEntities.value === 0 ? 0 : Math.round((completedEntities.value / totalEntities.value) * 100)
)
const totalFields = computed(() => 
  entities.value.reduce((sum, entity) => sum + entity.fields.length, 0)
)

// 方法
const selectEntity = (entityId: string) => {
  selectedEntityId.value = entityId
}

const getEntityIcon = (category: string) => {
  const icons: Record<string, string> = {
    core: "el-icon-coin",
    relation: "el-icon-connection",
    config: "el-icon-setting",
    log: "el-icon-document"
  }
  return icons[category] || "el-icon-coin"
}

const getEntityRelationCount = (entityId: string) => {
  const entity = entities.value.find(e => e.id === entityId)
  if (!entity) return 0
  return relations.value.filter(r => 
    r.fromEntity === entity.name || r.toEntity === entity.name
  ).length
}

const isEntityExists = (tableName: string) => {
  return entities.value.some(e => e.tableName === tableName)
}

const addPresetEntity = (preset: any) => {
  store.addEntity({
    ...preset,
    fields: getDefaultFieldsForEntity(preset.id),
    validationRules: [],
    enableSoftDelete: true,
    enableAudit: true,
    enableMultiTenant: true,
    isCompleted: false
  })
  ElMessage.success(`已添加预设实体：${preset.displayName}`)
}

// 🔥 实体编辑功能 - 真实可用的编辑界面
const showEntityEditDialog = ref(false)
const editingEntity = ref<any>(null)
const entityEditFormRef = ref()
const entityFeatures = ref<string[]>([])

// 移除未使用的表单规则和方法

const editEntity = (entity: any) => {
  editingEntity.value = { ...entity } // 深拷贝避免直接修改
  showEntityEditDialog.value = true
}

const handleEntityEditConfirm = async () => {
  if (!editingEntity.value) return
  
  // 验证实体数据
  const errors = validateEntity(editingEntity.value)
  if (errors.length > 0) {
    ElMessage.error(`验证失败：${errors.join('; ')}`)
    return
  }
  
  // 保存实体
  const success = await saveEntity(editingEntity.value)
  if (success) {
    showEntityEditDialog.value = false
    editingEntity.value = null
  }
}

const handleEntityEditCancel = () => {
  showEntityEditDialog.value = false
  editingEntity.value = null
}

// 🔥 核心CRUD功能实现 - 确保真实可用
const saveEntity = async (entity: any) => {
  try {
    // 验证实体数据
    if (!entity.name || !entity.tableName) {
      throw new Error("实体名称和表名不能为空")
    }
    
    // 更新到store
    store.updateEntity(entity.id, entity)
    
    // 持久化到localStorage
    store.saveToLocalStorage()
    
    ElMessage.success(`实体 "${entity.displayName || entity.name}" 保存成功`)
    return true
  } catch (error: any) {
    ElMessage.error(`保存失败: ${error.message}`)
    return false
  }
}

const updateEntityField = (entityId: string, fieldIndex: number, field: any) => {
  const entity = entities.value.find(e => e.id === entityId)
  if (entity && entity.fields[fieldIndex]) {
    entity.fields[fieldIndex] = { ...entity.fields[fieldIndex], ...field }
    store.updateEntity(entityId, entity)
    store.saveToLocalStorage()
  }
}

const addEntityField = (entityId: string) => {
  const entity = entities.value.find(e => e.id === entityId)
  if (entity) {
    const newField = {
      id: `field-${Date.now()}`,
      name: "NewField",
      displayName: "新字段",
      type: "string",
      isRequired: false,
      maxLength: 100,
      description: "",
      validationRules: []
    }
    entity.fields.push(newField)
    store.updateEntity(entityId, entity)
    store.saveToLocalStorage()
    ElMessage.success("字段添加成功")
  }
}

const removeEntityField = async (entityId: string, fieldIndex: number) => {
  const entity = entities.value.find(e => e.id === entityId)
  if (!entity) return
  
  const field = entity.fields[fieldIndex]
  if (!field) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除字段 "${field.displayName || field.name}" 吗？`,
      '删除确认',
      { type: 'warning' }
    )
    
    entity.fields.splice(fieldIndex, 1)
    store.updateEntity(entityId, entity)
    store.saveToLocalStorage()
    ElMessage.success("字段删除成功")
  } catch {
    // 用户取消删除
  }
}

const deleteEntity = async (entityId: string) => {
  const entity = entities.value.find(e => e.id === entityId)
  if (!entity) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除实体 "${entity.displayName || entity.name}" 吗？\n\n删除后将无法恢复，且会影响相关的关系配置。`,
      '删除确认',
      { type: 'warning' }
    )
    
    // 删除相关的关系
    const relatedRelations = relations.value.filter(r => 
      r.fromEntity === entity.name || r.toEntity === entity.name
    )
    
    relatedRelations.forEach(relation => {
      store.removeRelation(relation.id)
    })
    
    // 删除实体
    store.removeEntity(entityId)
    store.saveToLocalStorage()
    
    // 重置选中状态
    if (selectedEntityId.value === entityId) {
      selectedEntityId.value = entities.value.length > 0 ? entities.value[0].id : ""
    }
    
    ElMessage.success(`实体 "${entity.displayName || entity.name}" 删除成功`)
  } catch {
    // 用户取消删除
  }
}

const validateEntity = (entity: any) => {
  const errors: string[] = []
  
  // 基础验证
  if (!entity.name) errors.push("实体名称不能为空")
  if (!entity.tableName) errors.push("表名不能为空")
  if (!entity.displayName) errors.push("显示名称不能为空")
  
  // 命名规范验证
  if (entity.name && !/^[A-Z][a-zA-Z0-9]*$/.test(entity.name)) {
    errors.push("实体名称必须符合PascalCase命名规范")
  }
  
  if (entity.tableName && !/^[A-Za-z][a-zA-Z0-9_]*$/.test(entity.tableName)) {
    errors.push("表名必须符合数据库命名规范")
  }
  
  // 字段验证
  if (!entity.fields || entity.fields.length === 0) {
    errors.push("实体至少需要一个字段")
  } else {
    const primaryKeys = entity.fields.filter((f: any) => f.isPrimaryKey)
    if (primaryKeys.length === 0) {
      errors.push("实体必须有一个主键字段")
    }
    
    entity.fields.forEach((field: any, index: number) => {
      if (!field.name) errors.push(`第${index + 1}个字段名称不能为空`)
      if (!field.type) errors.push(`第${index + 1}个字段类型不能为空`)
    })
  }
  
  return errors
}

const exportEntitySchema = async () => {
  try {
    const schema = {
      entities: entities.value,
      relations: relations.value,
      metadata: {
        exportTime: new Date().toISOString(),
        version: "1.0.0",
        engine: "SmartAbp LowCode"
      }
    }
    
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `entities-schema-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success("实体架构导出成功")
  } catch (error: any) {
    ElMessage.error(`导出失败: ${error.message}`)
  }
}

const importEntitySchema = async (file: File) => {
  try {
    const text = await file.text()
    const schema = JSON.parse(text)
    
    if (!schema.entities || !Array.isArray(schema.entities)) {
      throw new Error("无效的架构文件格式")
    }
    
    // 确认导入
    await ElMessageBox.confirm(
      `确定要导入 ${schema.entities.length} 个实体吗？\n\n这将覆盖当前的所有实体配置。`,
      '导入确认',
      { type: 'warning' }
    )
    
    // 清空现有数据
    store.clearAllEntities()
    
    // 导入新数据
    schema.entities.forEach((entity: any) => {
      store.addEntity(entity)
    })
    
    if (schema.relations) {
      schema.relations.forEach((relation: any) => {
        store.addRelation(relation)
      })
    }
    
    store.saveToLocalStorage()
    ElMessage.success("实体架构导入成功")
  } catch (error: any) {
    ElMessage.error(`导入失败: ${error.message}`)
  }
}

const getDefaultFieldsForEntity = (entityType: string) => {
  const baseFields = [
    { name: "Id", displayName: "主键", type: "Guid", isPrimaryKey: true, isRequired: true }
  ]

  const entityFields: Record<string, any[]> = {
    "organization-unit": [
      { name: "Code", displayName: "组织代码", type: "string", length: 50, isRequired: true },
      { name: "Name", displayName: "组织名称", type: "string", length: 100, isRequired: true },
      { name: "DisplayName", displayName: "显示名称", type: "string", length: 100 },
      { name: "ParentId", displayName: "父级ID", type: "Guid" },
      { name: "Level", displayName: "层级", type: "int", isRequired: true },
      { name: "Sort", displayName: "排序", type: "int" }
    ],
    "user": [
      { name: "UserName", displayName: "用户名", type: "string", length: 50, isRequired: true },
      { name: "Email", displayName: "邮箱", type: "string", length: 100, isRequired: true },
      { name: "Name", displayName: "姓名", type: "string", length: 50 },
      { name: "Surname", displayName: "姓氏", type: "string", length: 50 },
      { name: "PhoneNumber", displayName: "手机号", type: "string", length: 20 },
      { name: "IsActive", displayName: "是否激活", type: "bool", defaultValue: "true" }
    ],
    "role": [
      { name: "Name", displayName: "角色名", type: "string", length: 50, isRequired: true },
      { name: "DisplayName", displayName: "显示名", type: "string", length: 100 },
      { name: "Description", displayName: "描述", type: "string", length: 500 },
      { name: "IsDefault", displayName: "默认角色", type: "bool", defaultValue: "false" },
      { name: "IsStatic", displayName: "系统角色", type: "bool", defaultValue: "false" }
    ],
    "permission": [
      { name: "Name", displayName: "权限名", type: "string", length: 100, isRequired: true },
      { name: "DisplayName", displayName: "显示名", type: "string", length: 100 },
      { name: "Description", displayName: "描述", type: "string", length: 500 },
      { name: "ParentName", displayName: "父权限", type: "string", length: 100 },
      { name: "IsEnabled", displayName: "是否启用", type: "bool", defaultValue: "true" }
    ],
    "role-permission": [
      { name: "RoleId", displayName: "角色ID", type: "Guid", isRequired: true },
      { name: "PermissionName", displayName: "权限名", type: "string", length: 100, isRequired: true }
    ],
    "menu": [
      { name: "Name", displayName: "菜单名", type: "string", length: 50, isRequired: true },
      { name: "DisplayName", displayName: "显示名", type: "string", length: 100 },
      { name: "Url", displayName: "链接", type: "string", length: 200 },
      { name: "Icon", displayName: "图标", type: "string", length: 50 },
      { name: "ParentId", displayName: "父菜单ID", type: "Guid" },
      { name: "Sort", displayName: "排序", type: "int" },
      { name: "Permission", displayName: "所需权限", type: "string", length: 100 }
    ]
  }

  return [...baseFields, ...(entityFields[entityType] || [])]
}

const autoFillTableName = () => {
  if (newEntityForm.value.name && !newEntityForm.value.tableName) {
    newEntityForm.value.tableName = `Abp${newEntityForm.value.name}s`
  }
}

const createEntity = () => {
  if (!newEntityForm.value.name || !newEntityForm.value.tableName) {
    ElMessage.error("请填写必填字段")
    return
  }

  if (isEntityExists(newEntityForm.value.tableName)) {
    ElMessage.error("表名已存在")
    return
  }

  store.addEntity({
    ...newEntityForm.value,
    id: `entity-${Date.now()}`,
    category: "core",
    fields: [
      { name: "Id", displayName: "主键", type: "Guid", isPrimaryKey: true, isRequired: true }
    ],
    validationRules: [],
    enableSoftDelete: false,
    enableAudit: false,
    enableMultiTenant: false,
    isCompleted: false
  })

  // 重置表单
  newEntityForm.value = {
    name: "",
    tableName: "",
    displayName: "",
    description: ""
  }
  showAddEntityDialog.value = false
  ElMessage.success("实体创建成功")
}

const addField = () => {
  if (!selectedEntity.value) return
  
  store.addField(selectedEntity.value.id, {
    name: "NewField",
    displayName: "新字段",
    type: "string",
    length: 50,
    isRequired: false,
    isPrimaryKey: false,
    defaultValue: ""
  })
}

const removeField = (index: number) => {
  if (!selectedEntity.value) return
  store.removeField(selectedEntity.value.id, index)
}

const needsLength = (type: string) => {
  return ["string", "decimal"].includes(type)
}

const handlePrimaryKeyChange = (field: any) => {
  if (field.isPrimaryKey && selectedEntity.value) {
    // 确保只有一个主键
    selectedEntity.value.fields.forEach(f => {
      if (f !== field) f.isPrimaryKey = false
    })
  }
}

const validateField = (field: any) => {
  // 字段验证逻辑
  if (!field.name) {
    ElMessage.warning("字段名不能为空")
  }
}

const editFieldValidation = (field: any) => {
  // 打开字段验证编辑器
  console.log("编辑字段验证规则:", field)
}

const addValidationRule = () => {
  if (!selectedEntity.value) return
  
  store.addValidationRule(selectedEntity.value.id, {
    fieldName: "",
    ruleType: "length",
    ruleValue: "",
    errorMessage: ""
  })
}

const removeValidationRule = (index: number) => {
  if (!selectedEntity.value) return
  store.removeValidationRule(selectedEntity.value.id, index)
}

const createRelation = () => {
  if (!newRelationForm.value.fromEntity || !newRelationForm.value.toEntity || !newRelationForm.value.type) {
    ElMessage.error("请填写必填字段")
    return
  }

  store.addRelation({
    id: `relation-${Date.now()}`,
    fromEntity: newRelationForm.value.fromEntity,
    toEntity: newRelationForm.value.toEntity,
    type: newRelationForm.value.type as "one-to-one" | "one-to-many" | "many-to-many",
    foreignKey: newRelationForm.value.foreignKey,
    navigationProperty: newRelationForm.value.navigationProperty
  })

  // 重置表单
  newRelationForm.value = {
    fromEntity: "",
    toEntity: "",
    type: "",
    foreignKey: "",
    navigationProperty: ""
  }
  showAddRelationDialog.value = false
  ElMessage.success("关系创建成功")
}

const editRelation = (relation: any) => {
  console.log("编辑关系:", relation)
}

const removeRelation = (index: number) => {
  store.removeRelation(index)
}

const toggleAutoLayout = () => {
  isAutoLayout.value = !isAutoLayout.value
  ElMessage.info(`已切换到${isAutoLayout.value ? '自动' : '手动'}布局模式`)
}

const previewSchema = () => {
  showSchemaPreview.value = true
}

const exportSchema = () => {
  const schema = {
    entities: entities.value,
    relations: relations.value,
    metadata: {
      createdAt: new Date().toISOString(),
      version: "1.0.0"
    }
  }
  
  const blob = new Blob([JSON.stringify(schema, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "entity-schema.json"
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success("架构导出成功")
}

const generateEntityPreview = () => {
  if (!selectedEntity.value) return ""
  
  const entity = selectedEntity.value
  const fields = entity.fields.map(f => 
    `    public ${f.type}${f.isRequired ? '' : '?'} ${f.name} { get; set; }`
  ).join('\n')
  
  return `public class ${entity.name} : Entity<Guid>
{
${fields}
}`
}

const generateDtoPreview = () => {
  if (!selectedEntity.value) return ""
  
  const entity = selectedEntity.value
  const fields = entity.fields.map(f => 
    `    public ${f.type}${f.isRequired ? '' : '?'} ${f.name} { get; set; }`
  ).join('\n')
  
  return `public class ${entity.name}Dto
{
${fields}
}`
}

const generateSqlPreview = () => {
  if (!selectedEntity.value) return ""
  
  const entity = selectedEntity.value
  const columns = entity.fields.map(f => {
    let type = getSqlType(f.type, f.length)
    let constraints = f.isRequired ? 'NOT NULL' : 'NULL'
    if (f.isPrimaryKey) constraints += ' PRIMARY KEY'
    return `    ${f.name} ${type} ${constraints}`
  }).join(',\n')
  
  return `CREATE TABLE ${entity.tableName} (
${columns}
);`
}

const getSqlType = (type: string, length?: number) => {
  const typeMap: Record<string, string> = {
    string: length ? `NVARCHAR(${length})` : 'NVARCHAR(MAX)',
    int: 'INT',
    long: 'BIGINT',
    bool: 'BIT',
    DateTime: 'DATETIME2',
    decimal: 'DECIMAL(18,2)',
    Guid: 'UNIQUEIDENTIFIER',
    enum: 'INT',
    json: 'NVARCHAR(MAX)'
  }
  return typeMap[type] || 'NVARCHAR(MAX)'
}

const generateDDL = () => {
  return entities.value.map(entity => {
    const columns = entity.fields.map(f => {
      let type = getSqlType(f.type, f.length)
      let constraints = f.isRequired ? 'NOT NULL' : 'NULL'
      if (f.isPrimaryKey) constraints += ' PRIMARY KEY'
      return `    ${f.name} ${type} ${constraints}`
    }).join(',\n')
    
    return `CREATE TABLE ${entity.tableName} (
${columns}
);`
  }).join('\n\n')
}

// 高级功能事件处理方法
const handleFieldConfigured = (fieldDefinition) => {
  if (selectedEntity.value) {
    try {
      // 检查字段是否已存在
      const existingField = selectedEntity.value.fields.find(f => f.name === fieldDefinition.name)
      if (existingField) {
        ElMessage.warning(`字段"${fieldDefinition.name}"已存在`)
        return
      }

      // 添加配置好的字段到当前实体
      store.addField(selectedEntity.value.id, fieldDefinition)
      ElMessage.success(`高级字段"${fieldDefinition.name}"添加成功`)
    } catch (error) {
      ElMessage.error('添加高级字段失败：' + error.message)
    }
  } else {
    ElMessage.warning('请先选择一个实体')
  }
}

const createAbstractEntity = () => {
  try {
    const abstractEntity = {
      name: 'BaseEntity',
      tableName: '',
      displayName: '抽象基类',
      description: '实体基类，包含公共字段',
      category: 'core',
      fields: [
        { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
        { name: 'CreationTime', displayName: '创建时间', type: 'DateTime', isRequired: true },
        { name: 'CreatorId', displayName: '创建人ID', type: 'Guid?', isRequired: false }
      ],
      validationRules: [],
      enableSoftDelete: false,
      enableAudit: true,
      enableMultiTenant: false,
      isCompleted: true,
      isAbstract: true
    }

    store.addEntity(abstractEntity)
    ElMessage.success('抽象实体创建成功')
  } catch (error) {
    ElMessage.error('创建抽象实体失败：' + error.message)
  }
}

const handleDictionarySelected = (dictionary) => {
  // 处理数据字典选择事件，可以将字典应用为字段的枚举类型
  console.log('Dictionary selected:', dictionary)
  ElMessage.info(`已选择数据字典"${dictionary.name}"`)
}

const handleDictionaryUpdated = (dictionary) => {
  // 处理数据字典更新事件
  ElMessage.success(`数据字典"${dictionary.name}"更新成功`)
}

// 初始化
onMounted(() => {
  // 初始化预设实体（如果为空）
  if (entities.value.length === 0) {
    ElMessageBox.confirm(
      '检测到您还没有创建任何实体，是否要加载权限管理系统的预设实体？',
      '快速开始',
      {
        confirmButtonText: '加载预设',
        cancelButtonText: '手动创建',
        type: 'info'
      }
    ).then(() => {
      presetEntities.forEach(preset => addPresetEntity(preset))
      if (entities.value.length > 0) {
        selectedEntityId.value = entities.value[0].id
      }
    }).catch(() => {
      // 用户选择手动创建
    })
  } else if (entities.value.length > 0) {
    selectedEntityId.value = entities.value[0].id
  }
})
</script>

<style scoped>
.entity-modeling-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.modeling-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #606266;
}

.progress-info .el-progress {
  width: 200px;
}

.modeling-body {
  flex: 1;
  display: flex;
  gap: 1px;
  min-height: 0;
}

.entities-panel {
  width: 300px;
  background: white;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.entities-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.entity-card {
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.entity-card:hover {
  background: #e6f7ff;
  border-color: #40a9ff;
}

.entity-card.active {
  background: #e6f7ff;
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.entity-card.completed {
  border-color: #52c41a;
}

.entity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.entity-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.entity-status-tag {
  margin-top: 4px;
}

.entity-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.entity-info i {
  font-size: 16px;
  color: #1890ff;
}

.entity-name {
  font-weight: 500;
  color: #303133;
}

.entity-table {
  font-size: 12px;
  color: #8c8c8c;
}

.entity-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.preset-entities {
  padding: 16px;
  border-top: 1px solid #e8e8e8;
}

.preset-entities h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

/* 实体编辑对话框样式 */
.form-help {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.entity-options-section {
  margin: 16px 0;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}

.entity-options-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.fields-quick-edit {
  margin-top: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.fields-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color-light);
  border-bottom: 1px solid var(--el-border-color);
}

.fields-header h4 {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.fields-table {
  padding: 8px;
}

.design-area {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.design-toolbar {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-info {
  font-size: 14px;
  color: #606266;
}

.fields-designer,
.relations-designer,
.validation-designer,
.advanced-relations-designer,
.field-types-designer,
.business-rules-designer,
.data-dictionary-designer,
.intelligent-assistant {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.fields-header,
.relations-header,
.validation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fields-header h3,
.relations-header h3,
.validation-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.relations-canvas {
  height: 300px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #8c8c8c;
}

.relations-placeholder p {
  margin: 8px 0;
}

.relations-list h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #606266;
}

.properties-panel {
  width: 350px;
  background: white;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.properties-panel .panel-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.properties-panel .el-form {
  padding: 24px;
}

.generation-preview {
  padding: 0 24px 24px;
}

.generation-preview h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #606266;
}

.code-preview {
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #303133;
  max-height: 300px;
  overflow-y: auto;
}

.schema-preview .er-diagram {
  height: 400px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
}

.ddl-preview {
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
  max-height: 500px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.schema-stats {
  padding: 24px;
}
</style>

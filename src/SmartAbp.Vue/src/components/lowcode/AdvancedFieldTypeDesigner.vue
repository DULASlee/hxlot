<template>
  <div class="advanced-field-designer">
    <el-card>
      <template #header>
        <div class="designer-header">
          <h3>
            <i class="el-icon-edit" />
            高级字段类型设计器
          </h3>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="showAddFieldTypeDialog = true"
          >
            自定义字段类型
          </el-button>
        </div>
      </template>

      <!-- 字段类型分类 -->
      <div class="field-types-catalog">
        <el-tabs v-model="activeTypeCategory" type="border-card">
          <el-tab-pane label="基础类型" name="basic">
            <div class="type-grid">
              <div
                v-for="type in basicFieldTypes"
                :key="type.name"
                class="field-type-card"
                :class="{ selected: selectedFieldType?.name === type.name }"
                @click="selectFieldType(type)"
              >
                <div class="type-icon">
                  <i :class="type.icon" />
                </div>
                <div class="type-info">
                  <div class="type-name">{{ type.displayName }}</div>
                  <div class="type-description">{{ type.description }}</div>
                  <div class="type-example">{{ type.example }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="业务类型" name="business">
            <div class="type-grid">
              <div
                v-for="type in businessFieldTypes"
                :key="type.name"
                class="field-type-card"
                :class="{ selected: selectedFieldType?.name === type.name }"
                @click="selectFieldType(type)"
              >
                <div class="type-icon">
                  <i :class="type.icon" />
                </div>
                <div class="type-info">
                  <div class="type-name">{{ type.displayName }}</div>
                  <div class="type-description">{{ type.description }}</div>
                  <div class="type-features">
                    <el-tag
                      v-for="feature in type.features"
                      :key="feature"
                      size="mini"
                      type="success"
                    >
                      {{ feature }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="枚举字典" name="enum">
            <div class="enum-manager">
              <div class="enum-toolbar">
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-plus"
                  @click="showAddEnumDialog = true"
                >
                  新建枚举
                </el-button>
                <el-button
                  size="small"
                  icon="el-icon-document-copy"
                  @click="importEnumsFromDict"
                >
                  从字典导入
                </el-button>
              </div>

              <div class="enum-list">
                <div
                  v-for="enumType in customEnums"
                  :key="enumType.id"
                  class="enum-card"
                >
                  <div class="enum-header">
                    <div class="enum-info">
                      <h4>{{ enumType.name }}</h4>
                      <p>{{ enumType.description }}</p>
                    </div>
                    <div class="enum-actions">
                      <el-button
                        size="mini"
                        icon="el-icon-edit"
                        @click="editEnum(enumType)"
                      />
                      <el-button
                        size="mini"
                        type="danger"
                        icon="el-icon-delete"
                        @click="deleteEnum(enumType)"
                      />
                    </div>
                  </div>
                  <div class="enum-values">
                    <el-tag
                      v-for="value in enumType.values"
                      :key="value.key"
                      size="small"
                      class="enum-value-tag"
                    >
                      {{ value.label }} ({{ value.key }})
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="复杂类型" name="complex">
            <div class="complex-types">
              <div class="complex-type-builder">
                <h4>复杂类型构建器</h4>
                <p>创建包含多个属性的复杂值对象类型</p>
                
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  @click="showComplexTypeDialog = true"
                >
                  创建复杂类型
                </el-button>
              </div>

              <div class="complex-types-list">
                <div
                  v-for="complexType in complexTypes"
                  :key="complexType.id"
                  class="complex-type-card"
                >
                  <div class="complex-type-header">
                    <h4>{{ complexType.name }}</h4>
                    <div class="complex-type-actions">
                      <el-button
                        size="mini"
                        icon="el-icon-edit"
                        @click="editComplexType(complexType)"
                      />
                      <el-button
                        size="mini"
                        type="danger"
                        icon="el-icon-delete"
                        @click="deleteComplexType(complexType)"
                      />
                    </div>
                  </div>
                  <div class="complex-type-properties">
                    <div
                      v-for="prop in complexType.properties"
                      :key="prop.name"
                      class="property-item"
                    >
                      <span class="property-name">{{ prop.name }}</span>
                      <span class="property-type">{{ prop.type }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 字段类型详细配置 -->
      <div v-if="selectedFieldType" class="field-type-config">
        <el-card>
          <template #header>
            <h4>
              <i :class="selectedFieldType.icon" />
              {{ selectedFieldType.displayName }} - 详细配置
            </h4>
          </template>

          <el-form
            ref="fieldConfigFormRef"
            :model="fieldConfig"
            label-width="120px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="字段名称">
                  <el-input
                    v-model="fieldConfig.name"
                    placeholder="字段名称 (PascalCase)"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="显示名称">
                  <el-input
                    v-model="fieldConfig.displayName"
                    placeholder="用户界面显示的名称"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 动态配置项 -->
            <div v-if="selectedFieldType.configOptions">
              <div
                v-for="option in selectedFieldType.configOptions"
                :key="option.name"
              >
                <el-form-item :label="option.label">
                  <!-- 字符串配置 -->
                  <el-input
                    v-if="option.type === 'string'"
                    v-model="fieldConfig[option.name]"
                    :placeholder="option.placeholder"
                  />
                  
                  <!-- 数字配置 -->
                  <el-input-number
                    v-else-if="option.type === 'number'"
                    v-model="fieldConfig[option.name]"
                    :min="option.min"
                    :max="option.max"
                    :step="option.step"
                  />
                  
                  <!-- 布尔配置 -->
                  <el-checkbox
                    v-else-if="option.type === 'boolean'"
                    v-model="fieldConfig[option.name]"
                  >
                    {{ option.description }}
                  </el-checkbox>
                  
                  <!-- 选择配置 -->
                  <el-select
                    v-else-if="option.type === 'select'"
                    v-model="fieldConfig[option.name]"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="choice in option.choices"
                      :key="choice.value"
                      :label="choice.label"
                      :value="choice.value"
                    />
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- 验证规则配置 -->
            <el-form-item label="验证规则">
              <div class="validation-rules">
                <div
                  v-for="(rule, index) in fieldConfig.validationRules"
                  :key="index"
                  class="rule-item"
                >
                  <el-select
                    v-model="rule.type"
                    placeholder="规则类型"
                    style="width: 120px"
                  >
                    <el-option label="必填" value="required" />
                    <el-option label="长度" value="length" />
                    <el-option label="范围" value="range" />
                    <el-option label="正则" value="regex" />
                    <el-option label="唯一" value="unique" />
                    <el-option label="自定义" value="custom" />
                  </el-select>
                  <el-input
                    v-model="rule.value"
                    placeholder="规则值"
                    style="width: 150px"
                  />
                  <el-input
                    v-model="rule.message"
                    placeholder="错误消息"
                    style="width: 200px"
                  />
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    @click="removeValidationRule(index)"
                  />
                </div>
                <el-button
                  size="small"
                  type="dashed"
                  icon="el-icon-plus"
                  @click="addValidationRule"
                >
                  添加验证规则
                </el-button>
              </div>
            </el-form-item>

            <!-- 默认值配置 -->
            <el-form-item label="默认值">
              <div class="default-value-config">
                <el-radio-group v-model="fieldConfig.defaultValueType">
                  <el-radio label="none">无默认值</el-radio>
                  <el-radio label="static">静态值</el-radio>
                  <el-radio label="function">函数生成</el-radio>
                  <el-radio label="expression">表达式</el-radio>
                </el-radio-group>
                
                <div v-if="fieldConfig.defaultValueType !== 'none'" class="default-value-input">
                  <el-input
                    v-if="fieldConfig.defaultValueType === 'static'"
                    v-model="fieldConfig.defaultValue"
                    placeholder="输入默认值"
                  />
                  <el-select
                    v-else-if="fieldConfig.defaultValueType === 'function'"
                    v-model="fieldConfig.defaultValue"
                    placeholder="选择默认值函数"
                  >
                    <el-option label="当前时间" value="DateTime.Now" />
                    <el-option label="GUID" value="Guid.NewGuid()" />
                    <el-option label="当前用户ID" value="CurrentUser.Id" />
                    <el-option label="随机数" value="Random.Next()" />
                  </el-select>
                  <el-input
                    v-else-if="fieldConfig.defaultValueType === 'expression'"
                    v-model="fieldConfig.defaultValue"
                    placeholder="输入表达式 (如: entity.CreationTime + TimeSpan.FromDays(30))"
                  />
                </div>
              </div>
            </el-form-item>

            <!-- 业务属性 -->
            <el-form-item label="业务属性">
              <el-checkbox-group v-model="fieldConfig.businessAttributes">
                <el-row>
                  <el-col :span="8">
                    <el-checkbox label="isAuditField">审计字段</el-checkbox>
                  </el-col>
                  <el-col :span="8">
                    <el-checkbox label="isVersionField">版本字段</el-checkbox>
                  </el-col>
                  <el-col :span="8">
                    <el-checkbox label="isSensitive">敏感信息</el-checkbox>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    <el-checkbox label="isSearchable">可搜索</el-checkbox>
                  </el-col>
                  <el-col :span="8">
                    <el-checkbox label="isFilterable">可筛选</el-checkbox>
                  </el-col>
                  <el-col :span="8">
                    <el-checkbox label="isSortable">可排序</el-checkbox>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    <el-checkbox label="isExportable">可导出</el-checkbox>
                  </el-col>
                  <el-col :span="8">
                    <el-checkbox label="isImportable">可导入</el-checkbox>
                  </el-col>
                  <el-col :span="8">
                    <el-checkbox label="isReadOnly">只读</el-checkbox>
                  </el-col>
                </el-row>
              </el-checkbox-group>
            </el-form-item>

            <!-- UI展示配置 -->
            <el-form-item label="UI展示">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="控件类型">
                    <el-select
                      v-model="fieldConfig.uiControl"
                      placeholder="选择UI控件"
                    >
                      <el-option label="文本框" value="input" />
                      <el-option label="文本域" value="textarea" />
                      <el-option label="数字输入" value="number" />
                      <el-option label="下拉选择" value="select" />
                      <el-option label="单选按钮" value="radio" />
                      <el-option label="复选框" value="checkbox" />
                      <el-option label="日期选择" value="date" />
                      <el-option label="时间选择" value="time" />
                      <el-option label="文件上传" value="upload" />
                      <el-option label="富文本" value="editor" />
                      <el-option label="代码编辑器" value="code" />
                      <el-option label="颜色选择器" value="color" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="显示宽度">
                    <el-select v-model="fieldConfig.displayWidth">
                      <el-option label="自适应" value="auto" />
                      <el-option label="窄 (25%)" value="narrow" />
                      <el-option label="中等 (50%)" value="medium" />
                      <el-option label="宽 (75%)" value="wide" />
                      <el-option label="全宽 (100%)" value="full" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="列表显示">
                    <el-checkbox v-model="fieldConfig.showInList">
                      在列表中显示
                    </el-checkbox>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form-item>

            <el-form-item label="字段描述">
              <el-input
                v-model="fieldConfig.description"
                type="textarea"
                :rows="2"
                placeholder="详细描述此字段的用途和业务含义"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="applyFieldConfig"
                :loading="applying"
              >
                应用配置
              </el-button>
              <el-button @click="resetFieldConfig">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>

    <!-- 自定义字段类型对话框 -->
    <el-dialog
      v-model="showAddFieldTypeDialog"
      title="创建自定义字段类型"
      width="600px"
    >
      <el-form
        ref="customTypeFormRef"
        :model="customTypeForm"
        label-width="120px"
      >
        <el-form-item label="类型名称" required>
          <el-input
            v-model="customTypeForm.name"
            placeholder="例如：PhoneNumber"
          />
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input
            v-model="customTypeForm.displayName"
            placeholder="例如：手机号码"
          />
        </el-form-item>
        <el-form-item label="基础类型">
          <el-select v-model="customTypeForm.baseType">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="日期时间" value="datetime" />
            <el-option label="布尔值" value="boolean" />
          </el-select>
        </el-form-item>
        <el-form-item label="验证模式">
          <el-input
            v-model="customTypeForm.validationPattern"
            placeholder="正则表达式验证模式"
          />
        </el-form-item>
        <el-form-item label="格式化函数">
          <el-input
            v-model="customTypeForm.formatFunction"
            placeholder="JavaScript格式化函数"
          />
        </el-form-item>
        <el-form-item label="类型描述">
          <el-input
            v-model="customTypeForm.description"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddFieldTypeDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveCustomFieldType"
        >
          保存类型
        </el-button>
      </template>
    </el-dialog>

    <!-- 枚举类型对话框 -->
    <el-dialog
      v-model="showAddEnumDialog"
      title="创建枚举类型"
      width="700px"
    >
      <el-form
        ref="enumFormRef"
        :model="enumForm"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="枚举名称" required>
              <el-input
                v-model="enumForm.name"
                placeholder="例如：UserStatus"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示名称" required>
              <el-input
                v-model="enumForm.displayName"
                placeholder="例如：用户状态"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="枚举描述">
          <el-input
            v-model="enumForm.description"
            placeholder="描述此枚举的用途"
          />
        </el-form-item>

        <el-form-item label="枚举值">
          <div class="enum-values-editor">
            <div
              v-for="(value, index) in enumForm.values"
              :key="index"
              class="enum-value-row"
            >
              <el-input
                v-model="value.key"
                placeholder="键值 (如: Active)"
                style="width: 150px"
              />
              <el-input
                v-model="value.label"
                placeholder="显示标签 (如: 启用)"
                style="width: 150px"
              />
              <el-input-number
                v-model="value.sort"
                placeholder="排序"
                :min="0"
                style="width: 100px"
              />
              <el-input
                v-model="value.description"
                placeholder="描述"
                style="width: 200px"
              />
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="removeEnumValue(index)"
              />
            </div>
            <el-button
              size="small"
              type="dashed"
              icon="el-icon-plus"
              @click="addEnumValue"
            >
              添加枚举值
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddEnumDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveEnum"
        >
          保存枚举
        </el-button>
      </template>
    </el-dialog>

    <!-- 复杂类型对话框 -->
    <el-dialog
      v-model="showComplexTypeDialog"
      title="创建复杂类型 (值对象)"
      width="800px"
    >
      <el-form
        ref="complexTypeFormRef"
        :model="complexTypeForm"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型名称" required>
              <el-input
                v-model="complexTypeForm.name"
                placeholder="例如：Address"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示名称" required>
              <el-input
                v-model="complexTypeForm.displayName"
                placeholder="例如：地址信息"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="类型描述">
          <el-input
            v-model="complexTypeForm.description"
            placeholder="描述此复杂类型的用途"
          />
        </el-form-item>

        <el-form-item label="属性定义">
          <div class="complex-properties-editor">
            <div
              v-for="(prop, index) in complexTypeForm.properties"
              :key="index"
              class="property-row"
            >
              <el-input
                v-model="prop.name"
                placeholder="属性名"
                style="width: 120px"
              />
              <el-input
                v-model="prop.displayName"
                placeholder="显示名"
                style="width: 120px"
              />
              <el-select
                v-model="prop.type"
                placeholder="类型"
                style="width: 100px"
              >
                <el-option label="string" value="string" />
                <el-option label="int" value="int" />
                <el-option label="decimal" value="decimal" />
                <el-option label="bool" value="bool" />
                <el-option label="DateTime" value="DateTime" />
              </el-select>
              <el-checkbox v-model="prop.isRequired">必填</el-checkbox>
              <el-input
                v-model="prop.description"
                placeholder="描述"
                style="width: 150px"
              />
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="removeComplexProperty(index)"
              />
            </div>
            <el-button
              size="small"
              type="dashed"
              icon="el-icon-plus"
              @click="addComplexProperty"
            >
              添加属性
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showComplexTypeDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveComplexType"
        >
          保存复杂类型
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueFlow, Background, Controls, MiniMap } from '@vue-flow/core'
import EntityNode from './EntityNode.vue'
import RelationshipEdge from './RelationshipEdge.vue'
import { useEntityModelingStore } from '@/stores/lowcode/entityModeling'
import { ElMessage } from 'element-plus'

// Store
const entityStore = useEntityModelingStore()

// 响应式数据
const activeTypeCategory = ref('basic')
const selectedFieldType = ref(null)
const applying = ref(false)

// 对话框状态
const showAddFieldTypeDialog = ref(false)
const showAddEnumDialog = ref(false)
const showComplexTypeDialog = ref(false)

// 字段配置
const fieldConfig = ref({
  name: '',
  displayName: '',
  validationRules: [],
  defaultValueType: 'none',
  defaultValue: '',
  businessAttributes: [],
  uiControl: 'input',
  displayWidth: 'medium',
  showInList: true,
  description: ''
})

// 自定义类型表单
const customTypeForm = ref({
  name: '',
  displayName: '',
  baseType: 'string',
  validationPattern: '',
  formatFunction: '',
  description: ''
})

// 枚举表单
const enumForm = ref({
  name: '',
  displayName: '',
  description: '',
  values: [
    { key: '', label: '', sort: 0, description: '' }
  ]
})

// 复杂类型表单
const complexTypeForm = ref({
  name: '',
  displayName: '',
  description: '',
  properties: [
    { name: '', displayName: '', type: 'string', isRequired: false, description: '' }
  ]
})

// 自定义枚举
const customEnums = ref([
  {
    id: 'user-status',
    name: 'UserStatus',
    displayName: '用户状态',
    description: '用户账户状态枚举',
    values: [
      { key: 'Active', label: '启用', sort: 1, description: '用户账户正常使用' },
      { key: 'Inactive', label: '禁用', sort: 2, description: '用户账户被禁用' },
      { key: 'Locked', label: '锁定', sort: 3, description: '用户账户被锁定' },
      { key: 'Pending', label: '待激活', sort: 4, description: '等待用户激活' }
    ]
  },
  {
    id: 'project-status',
    name: 'ProjectStatus',
    displayName: '项目状态',
    description: '工程项目状态枚举',
    values: [
      { key: 'Planning', label: '筹备中', sort: 1, description: '项目筹备阶段' },
      { key: 'Construction', label: '施工中', sort: 2, description: '正在施工' },
      { key: 'Suspended', label: '暂停', sort: 3, description: '项目暂停' },
      { key: 'Completed', label: '完工', sort: 4, description: '项目完工' },
      { key: 'Acceptance', label: '验收', sort: 5, description: '项目验收' }
    ]
  }
])

// 复杂类型
const complexTypes = ref([
  {
    id: 'address',
    name: 'Address',
    displayName: '地址信息',
    description: '完整的地址信息值对象',
    properties: [
      { name: 'Street', displayName: '街道地址', type: 'string', isRequired: true, description: '详细街道地址' },
      { name: 'City', displayName: '城市', type: 'string', isRequired: true, description: '所在城市' },
      { name: 'Province', displayName: '省份', type: 'string', isRequired: true, description: '所在省份' },
      { name: 'PostalCode', displayName: '邮政编码', type: 'string', isRequired: false, description: '邮政编码' },
      { name: 'Country', displayName: '国家', type: 'string', isRequired: true, description: '所在国家' }
    ]
  },
  {
    id: 'contact-info',
    name: 'ContactInfo',
    displayName: '联系信息',
    description: '完整的联系信息值对象',
    properties: [
      { name: 'Phone', displayName: '电话', type: 'string', isRequired: false, description: '固定电话' },
      { name: 'Mobile', displayName: '手机', type: 'string', isRequired: true, description: '手机号码' },
      { name: 'Email', displayName: '邮箱', type: 'string', isRequired: false, description: '电子邮箱' },
      { name: 'QQ', displayName: 'QQ号', type: 'string', isRequired: false, description: 'QQ号码' },
      { name: 'WeChat', displayName: '微信号', type: 'string', isRequired: false, description: '微信号码' }
    ]
  }
])

// 基础字段类型
const basicFieldTypes = ref([
  {
    name: 'string',
    displayName: '字符串',
    icon: 'el-icon-document',
    description: '文本字符串类型',
    example: '例如：用户名、产品名称',
    configOptions: [
      { name: 'maxLength', label: '最大长度', type: 'number', min: 1, max: 5000, placeholder: '最大字符数' },
      { name: 'minLength', label: '最小长度', type: 'number', min: 0, max: 1000, placeholder: '最小字符数' }
    ]
  },
  {
    name: 'int',
    displayName: '整数',
    icon: 'el-icon-rank',
    description: '32位整数类型',
    example: '例如：数量、年龄、排序',
    configOptions: [
      { name: 'minValue', label: '最小值', type: 'number', placeholder: '最小值' },
      { name: 'maxValue', label: '最大值', type: 'number', placeholder: '最大值' }
    ]
  },
  {
    name: 'decimal',
    displayName: '小数',
    icon: 'el-icon-money',
    description: '高精度小数类型',
    example: '例如：价格、金额、重量',
    configOptions: [
      { name: 'precision', label: '总位数', type: 'number', min: 1, max: 38, placeholder: '总精度位数' },
      { name: 'scale', label: '小数位数', type: 'number', min: 0, max: 38, placeholder: '小数位数' }
    ]
  },
  {
    name: 'DateTime',
    displayName: '日期时间',
    icon: 'el-icon-time',
    description: '日期和时间类型',
    example: '例如：创建时间、生日',
    configOptions: [
      { 
        name: 'dateFormat', 
        label: '日期格式', 
        type: 'select',
        choices: [
          { label: 'yyyy-MM-dd', value: 'yyyy-MM-dd' },
          { label: 'yyyy-MM-dd HH:mm:ss', value: 'yyyy-MM-dd HH:mm:ss' },
          { label: 'yyyy/MM/dd', value: 'yyyy/MM/dd' }
        ]
      }
    ]
  },
  {
    name: 'bool',
    displayName: '布尔值',
    icon: 'el-icon-switch-button',
    description: '真/假布尔类型',
    example: '例如：是否启用、是否可见',
    configOptions: [
      { name: 'trueLabel', label: '真值标签', type: 'string', placeholder: '例如：是、启用' },
      { name: 'falseLabel', label: '假值标签', type: 'string', placeholder: '例如：否、禁用' }
    ]
  },
  {
    name: 'Guid',
    displayName: '全局唯一标识符',
    icon: 'el-icon-key',
    description: 'GUID主键类型',
    example: '例如：实体ID、关联ID',
    configOptions: []
  }
])

// 业务字段类型
const businessFieldTypes = ref([
  {
    name: 'PhoneNumber',
    displayName: '手机号码',
    icon: 'el-icon-phone',
    description: '中国手机号码类型',
    example: '13800138000',
    features: ['格式验证', '自动格式化'],
    configOptions: [
      { 
        name: 'region', 
        label: '地区', 
        type: 'select',
        choices: [
          { label: '中国大陆', value: 'CN' },
          { label: '香港', value: 'HK' },
          { label: '台湾', value: 'TW' }
        ]
      }
    ]
  },
  {
    name: 'Email',
    displayName: '电子邮箱',
    icon: 'el-icon-message',
    description: '邮箱地址类型',
    example: 'user@example.com',
    features: ['格式验证', '域名验证'],
    configOptions: [
      { name: 'allowedDomains', label: '允许的域名', type: 'string', placeholder: '例如：@company.com,@example.com' }
    ]
  },
  {
    name: 'IdCard',
    displayName: '身份证号',
    icon: 'el-icon-postcard',
    description: '中国身份证号码',
    example: '110101199001011234',
    features: ['格式验证', '校验位验证', '年龄计算'],
    configOptions: []
  },
  {
    name: 'Money',
    displayName: '货币金额',
    icon: 'el-icon-coin',
    description: '货币金额类型',
    example: '￥1,234.56',
    features: ['精度控制', '格式化显示', '货币符号'],
    configOptions: [
      { 
        name: 'currency', 
        label: '货币类型', 
        type: 'select',
        choices: [
          { label: '人民币 (CNY)', value: 'CNY' },
          { label: '美元 (USD)', value: 'USD' },
          { label: '欧元 (EUR)', value: 'EUR' }
        ]
      }
    ]
  },
  {
    name: 'Percentage',
    displayName: '百分比',
    icon: 'el-icon-pie-chart',
    description: '百分比数值类型',
    example: '85.5%',
    features: ['范围验证', '百分比显示'],
    configOptions: [
      { name: 'minValue', label: '最小值', type: 'number', min: 0, max: 100 },
      { name: 'maxValue', label: '最大值', type: 'number', min: 0, max: 100 }
    ]
  },
  {
    name: 'Color',
    displayName: '颜色值',
    icon: 'el-icon-brush',
    description: '颜色代码类型',
    example: '#FF5733',
    features: ['颜色选择器', '格式验证'],
    configOptions: [
      { 
        name: 'format', 
        label: '颜色格式', 
        type: 'select',
        choices: [
          { label: 'HEX (#FFFFFF)', value: 'hex' },
          { label: 'RGB (255,255,255)', value: 'rgb' },
          { label: 'HSL (360,100%,100%)', value: 'hsl' }
        ]
      }
    ]
  }
])

// 计算属性
const entities = computed(() => entityStore.entities)

// 方法
const selectFieldType = (type) => {
  selectedFieldType.value = type
  
  // 重置字段配置
  fieldConfig.value = {
    name: '',
    displayName: '',
    validationRules: [],
    defaultValueType: 'none',
    defaultValue: '',
    businessAttributes: [],
    uiControl: getDefaultUIControl(type.name),
    displayWidth: 'medium',
    showInList: true,
    description: ''
  }
}

const getDefaultUIControl = (typeName) => {
  const controlMap = {
    'string': 'input',
    'int': 'number',
    'decimal': 'number',
    'DateTime': 'date',
    'bool': 'checkbox',
    'PhoneNumber': 'input',
    'Email': 'input',
    'Money': 'number',
    'Color': 'color'
  }
  return controlMap[typeName] || 'input'
}

const addValidationRule = () => {
  fieldConfig.value.validationRules.push({
    type: 'required',
    value: '',
    message: ''
  })
}

const removeValidationRule = (index) => {
  fieldConfig.value.validationRules.splice(index, 1)
}

const applyFieldConfig = () => {
  if (!selectedFieldType.value || !fieldConfig.value.name) {
    ElMessage.warning('请选择字段类型并填写字段名称')
    return
  }

  applying.value = true

  try {
    // 构建完整的字段定义
    const fieldDefinition = {
      name: fieldConfig.value.name,
      displayName: fieldConfig.value.displayName,
      type: selectedFieldType.value.name,
      isRequired: fieldConfig.value.validationRules.some(rule => rule.type === 'required'),
      isPrimaryKey: false,
      defaultValue: fieldConfig.value.defaultValueType === 'none' ? '' : fieldConfig.value.defaultValue,
      description: fieldConfig.value.description,
      // 扩展属性
      businessAttributes: fieldConfig.value.businessAttributes,
      uiControl: fieldConfig.value.uiControl,
      displayWidth: fieldConfig.value.displayWidth,
      showInList: fieldConfig.value.showInList,
      validationRules: fieldConfig.value.validationRules,
      // 字段类型特定配置
      ...fieldConfig.value
    }

    // 发送字段应用事件
    emit('field-configured', fieldDefinition)

    ElMessage.success('字段配置已应用')

  } catch (error) {
    ElMessage.error('应用字段配置失败：' + error.message)
  } finally {
    applying.value = false
  }
}

const resetFieldConfig = () => {
  fieldConfig.value = {
    name: '',
    displayName: '',
    validationRules: [],
    defaultValueType: 'none',
    defaultValue: '',
    businessAttributes: [],
    uiControl: 'input',
    displayWidth: 'medium',
    showInList: true,
    description: ''
  }
}

const saveCustomFieldType = () => {
  // 保存自定义字段类型
  const newType = {
    ...customTypeForm.value,
    id: `custom-${Date.now()}`,
    icon: 'el-icon-document',
    category: 'custom'
  }

  businessFieldTypes.value.push(newType)
  showAddFieldTypeDialog.value = false

  ElMessage.success('自定义字段类型创建成功')
}

const addEnumValue = () => {
  enumForm.value.values.push({
    key: '',
    label: '',
    sort: enumForm.value.values.length + 1,
    description: ''
  })
}

const removeEnumValue = (index) => {
  enumForm.value.values.splice(index, 1)
}

const saveEnum = () => {
  const newEnum = {
    ...enumForm.value,
    id: `enum-${Date.now()}`
  }

  customEnums.value.push(newEnum)
  showAddEnumDialog.value = false

  ElMessage.success('枚举类型创建成功')
}

const editEnum = (enumType) => {
  enumForm.value = { ...enumType }
  showAddEnumDialog.value = true
}

const deleteEnum = (enumType) => {
  const index = customEnums.value.findIndex(e => e.id === enumType.id)
  if (index > -1) {
    customEnums.value.splice(index, 1)
    ElMessage.success('枚举类型删除成功')
  }
}

const addComplexProperty = () => {
  complexTypeForm.value.properties.push({
    name: '',
    displayName: '',
    type: 'string',
    isRequired: false,
    description: ''
  })
}

const removeComplexProperty = (index) => {
  complexTypeForm.value.properties.splice(index, 1)
}

const saveComplexType = () => {
  const newComplexType = {
    ...complexTypeForm.value,
    id: `complex-${Date.now()}`
  }

  complexTypes.value.push(newComplexType)
  showComplexTypeDialog.value = false

  ElMessage.success('复杂类型创建成功')
}

const editComplexType = (complexType) => {
  complexTypeForm.value = { ...complexType }
  showComplexTypeDialog.value = true
}

const deleteComplexType = (complexType) => {
  const index = complexTypes.value.findIndex(t => t.id === complexType.id)
  if (index > -1) {
    complexTypes.value.splice(index, 1)
    ElMessage.success('复杂类型删除成功')
  }
}

const importEnumsFromDict = () => {
  ElMessage.info('从数据字典导入功能开发中...')
}

// Emits
const emit = defineEmits<{
  'field-configured': [field: any]
}>()
</script>

<style scoped>
.advanced-field-designer {
  height: 100%;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.designer-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

/* 字段类型分类样式 */
.field-types-catalog {
  margin-bottom: 20px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.field-type-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 12px;
}

.field-type-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.field-type-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-icon i {
  font-size: 18px;
  color: var(--el-color-primary);
}

.type-info {
  flex: 1;
}

.type-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.type-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.type-example {
  font-size: 11px;
  color: var(--el-color-primary);
  font-style: italic;
}

.type-features {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

/* 枚举管理样式 */
.enum-manager {
  padding: 16px 0;
}

.enum-toolbar {
  margin-bottom: 16px;
}

.enum-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enum-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
}

.enum-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.enum-info h4 {
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
}

.enum-info p {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.enum-values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.enum-value-tag {
  margin: 0;
}

/* 复杂类型样式 */
.complex-types {
  padding: 16px 0;
}

.complex-type-builder {
  text-align: center;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  margin-bottom: 20px;
}

.complex-type-builder h4 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.complex-type-builder p {
  margin: 0 0 16px 0;
  color: var(--el-text-color-secondary);
}

.complex-types-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.complex-type-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
}

.complex-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.complex-type-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.complex-type-properties {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background: var(--el-bg-color-page);
  border-radius: 4px;
  font-size: 13px;
}

.property-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.property-type {
  color: var(--el-color-primary);
}

/* 字段配置样式 */
.field-type-config {
  margin-top: 20px;
}

.validation-rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.default-value-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.default-value-input {
  margin-top: 8px;
}

/* 表单编辑器样式 */
.enum-values-editor,
.complex-properties-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.enum-value-row,
.property-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>

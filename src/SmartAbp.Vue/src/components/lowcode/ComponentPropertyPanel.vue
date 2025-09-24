<template>
  <div class="component-property-panel">
    <el-card>
      <template #header>
        <div class="panel-header">
          <h3>
            <i class="el-icon-setting" />
            属性配置
          </h3>
          <div v-if="selectedComponent" class="component-info">
            <el-tag size="small" type="primary">
              {{ selectedComponent.name }}
            </el-tag>
          </div>
        </div>
      </template>

      <!-- 未选中组件时的提示 -->
      <div v-if="!selectedComponent" class="no-selection">
        <div class="no-selection-content">
          <i class="el-icon-info" />
          <h4>未选中组件</h4>
          <p>请在画布中选择一个组件来配置其属性</p>
        </div>
      </div>

      <!-- 组件属性配置 -->
      <div v-else class="property-configuration">
        <!-- 基础属性 -->
        <div class="property-section">
          <div class="section-header">
            <h4>
              <i class="el-icon-document" />
              基础属性
            </h4>
          </div>
          
          <el-form
            :model="componentProps"
            label-width="80px"
            size="small"
          >
            <el-form-item label="组件名称">
              <el-input
                v-model="componentProps.name"
                placeholder="组件显示名称"
                @change="updateComponentProperty('name', componentProps.name)"
              />
            </el-form-item>
            
            <el-form-item label="组件ID">
              <el-input
                v-model="componentProps.id"
                placeholder="唯一标识符"
                :disabled="true"
              />
            </el-form-item>
            
            <el-form-item label="CSS类名">
              <el-input
                v-model="componentProps.className"
                placeholder="自定义CSS类名"
                @change="updateComponentProperty('className', componentProps.className)"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 布局属性 -->
        <div class="property-section">
          <div class="section-header">
            <h4>
              <i class="el-icon-rank" />
              布局属性
            </h4>
          </div>
          
          <el-form label-width="60px" size="small">
            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="X坐标">
                  <el-input-number
                    v-model="layoutProps.x"
                    :min="0"
                    :step="1"
                    size="small"
                    @change="updateLayout"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Y坐标">
                  <el-input-number
                    v-model="layoutProps.y"
                    :min="0"
                    :step="1"
                    size="small"
                    @change="updateLayout"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="宽度">
                  <el-input
                    v-model="layoutProps.width"
                    placeholder="auto"
                    size="small"
                    @change="updateLayout"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="高度">
                  <el-input
                    v-model="layoutProps.height"
                    placeholder="auto"
                    size="small"
                    @change="updateLayout"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="定位">
              <el-select
                v-model="layoutProps.position"
                size="small"
                @change="updateLayout"
              >
                <el-option label="静态" value="static" />
                <el-option label="相对" value="relative" />
                <el-option label="绝对" value="absolute" />
                <el-option label="固定" value="fixed" />
              </el-select>
            </el-form-item>

            <el-form-item label="层级">
              <el-input-number
                v-model="layoutProps.zIndex"
                :min="0"
                :max="9999"
                size="small"
                @change="updateLayout"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 组件特定属性 -->
        <div class="property-section">
          <div class="section-header">
            <h4>
              <i class="el-icon-setting" />
              组件属性
            </h4>
          </div>
          
          <el-form label-width="80px" size="small">
            <div
              v-for="(propConfig, propKey) in componentPropConfigs"
              :key="propKey"
              class="property-item"
            >
              <el-form-item :label="propConfig.label || propKey">
                <!-- 字符串属性 -->
                <el-input
                  v-if="propConfig.type === 'string'"
                  v-model="componentProps[propKey]"
                  :placeholder="propConfig.placeholder"
                  @change="updateComponentProperty(propKey, componentProps[propKey])"
                />
                
                <!-- 数字属性 -->
                <el-input-number
                  v-else-if="propConfig.type === 'number'"
                  v-model="componentProps[propKey]"
                  :min="propConfig.min"
                  :max="propConfig.max"
                  :step="propConfig.step"
                  @change="updateComponentProperty(propKey, componentProps[propKey])"
                />
                
                <!-- 布尔属性 -->
                <el-checkbox
                  v-else-if="propConfig.type === 'boolean'"
                  v-model="componentProps[propKey]"
                  @change="updateComponentProperty(propKey, componentProps[propKey])"
                >
                  {{ propConfig.description }}
                </el-checkbox>
                
                <!-- 选择属性 -->
                <el-select
                  v-else-if="propConfig.type === 'select'"
                  v-model="componentProps[propKey]"
                  @change="updateComponentProperty(propKey, componentProps[propKey])"
                >
                  <el-option
                    v-for="option in propConfig.options"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
                
                <!-- 颜色属性 -->
                <el-color-picker
                  v-else-if="propConfig.type === 'color'"
                  v-model="componentProps[propKey]"
                  @change="updateComponentProperty(propKey, componentProps[propKey])"
                />
                
                <!-- 图标属性 -->
                <el-select
                  v-else-if="propConfig.type === 'icon'"
                  v-model="componentProps[propKey]"
                  filterable
                  @change="updateComponentProperty(propKey, componentProps[propKey])"
                >
                  <el-option
                    v-for="icon in availableIcons"
                    :key="icon.value"
                    :label="icon.label"
                    :value="icon.value"
                  >
                    <i :class="icon.value" /> {{ icon.label }}
                  </el-option>
                </el-select>
                
                <!-- 数组属性 -->
                <div v-else-if="propConfig.type === 'array'" class="array-editor">
                  <div
                    v-for="(item, index) in componentProps[propKey]"
                    :key="index"
                    class="array-item"
                  >
                    <el-input
                      v-model="item.label"
                      placeholder="显示标签"
                      size="mini"
                    />
                    <el-input
                      v-model="item.value"
                      placeholder="值"
                      size="mini"
                    />
                    <el-button
                      size="mini"
                      type="danger"
                      icon="el-icon-delete"
                      @click="removeArrayItem(propKey, index)"
                    />
                  </div>
                  <el-button
                    size="mini"
                    type="dashed"
                    icon="el-icon-plus"
                    @click="addArrayItem(propKey)"
                  >
                    添加项
                  </el-button>
                </div>
                
                <!-- 对象属性 -->
                <div v-else-if="propConfig.type === 'object'" class="object-editor">
                  <el-input
                    v-model="componentProps[propKey]"
                    type="textarea"
                    :rows="3"
                    placeholder="JSON格式配置"
                    @change="updateComponentProperty(propKey, componentProps[propKey])"
                  />
                </div>
              </el-form-item>
            </div>
          </el-form>
        </div>

        <!-- 样式属性 -->
        <div class="property-section">
          <div class="section-header">
            <h4>
              <i class="el-icon-brush" />
              样式属性
            </h4>
          </div>
          
          <el-form label-width="80px" size="small">
            <!-- 字体样式 -->
            <el-collapse v-model="activeStyleSections">
              <el-collapse-item title="字体样式" name="font">
                <el-row :gutter="12">
                  <el-col :span="12">
                    <el-form-item label="字体大小">
                      <el-select
                        v-model="styleProps.fontSize"
                        @change="updateStyleProperty('fontSize', styleProps.fontSize)"
                      >
                        <el-option label="12px" value="12px" />
                        <el-option label="14px" value="14px" />
                        <el-option label="16px" value="16px" />
                        <el-option label="18px" value="18px" />
                        <el-option label="20px" value="20px" />
                        <el-option label="24px" value="24px" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="字体粗细">
                      <el-select
                        v-model="styleProps.fontWeight"
                        @change="updateStyleProperty('fontWeight', styleProps.fontWeight)"
                      >
                        <el-option label="正常" value="normal" />
                        <el-option label="粗体" value="bold" />
                        <el-option label="细体" value="lighter" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-form-item label="文字颜色">
                  <el-color-picker
                    v-model="styleProps.color"
                    @change="updateStyleProperty('color', styleProps.color)"
                  />
                </el-form-item>
                
                <el-form-item label="文字对齐">
                  <el-radio-group
                    v-model="styleProps.textAlign"
                    @change="updateStyleProperty('textAlign', styleProps.textAlign)"
                  >
                    <el-radio-button label="left">左对齐</el-radio-button>
                    <el-radio-button label="center">居中</el-radio-button>
                    <el-radio-button label="right">右对齐</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-collapse-item>

              <el-collapse-item title="背景样式" name="background">
                <el-form-item label="背景颜色">
                  <el-color-picker
                    v-model="styleProps.backgroundColor"
                    @change="updateStyleProperty('backgroundColor', styleProps.backgroundColor)"
                  />
                </el-form-item>
                
                <el-form-item label="背景图片">
                  <el-input
                    v-model="styleProps.backgroundImage"
                    placeholder="图片URL或base64"
                    @change="updateStyleProperty('backgroundImage', styleProps.backgroundImage)"
                  />
                </el-form-item>
              </el-collapse-item>

              <el-collapse-item title="边框样式" name="border">
                <el-row :gutter="12">
                  <el-col :span="12">
                    <el-form-item label="边框宽度">
                      <el-input-number
                        v-model="styleProps.borderWidth"
                        :min="0"
                        :max="20"
                        @change="updateBorderStyle"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="边框样式">
                      <el-select
                        v-model="styleProps.borderStyle"
                        @change="updateBorderStyle"
                      >
                        <el-option label="实线" value="solid" />
                        <el-option label="虚线" value="dashed" />
                        <el-option label="点线" value="dotted" />
                        <el-option label="双线" value="double" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-form-item label="边框颜色">
                  <el-color-picker
                    v-model="styleProps.borderColor"
                    @change="updateBorderStyle"
                  />
                </el-form-item>
                
                <el-form-item label="圆角半径">
                  <el-input-number
                    v-model="styleProps.borderRadius"
                    :min="0"
                    :max="50"
                    @change="updateStyleProperty('borderRadius', styleProps.borderRadius + 'px')"
                  />
                </el-form-item>
              </el-collapse-item>

              <el-collapse-item title="间距样式" name="spacing">
                <div class="spacing-editor">
                  <div class="spacing-visual">
                    <div class="margin-area">
                      <div class="margin-label">margin</div>
                      <div class="margin-inputs">
                        <el-input-number
                          v-model="spacingProps.marginTop"
                          size="mini"
                          :min="0"
                          @change="updateSpacing"
                        />
                        <div class="margin-sides">
                          <el-input-number
                            v-model="spacingProps.marginLeft"
                            size="mini"
                            :min="0"
                            @change="updateSpacing"
                          />
                          <div class="padding-area">
                            <div class="padding-label">padding</div>
                            <div class="padding-inputs">
                              <el-input-number
                                v-model="spacingProps.paddingTop"
                                size="mini"
                                :min="0"
                                @change="updateSpacing"
                              />
                              <div class="padding-sides">
                                <el-input-number
                                  v-model="spacingProps.paddingLeft"
                                  size="mini"
                                  :min="0"
                                  @change="updateSpacing"
                                />
                                <div class="content-area">
                                  内容
                                </div>
                                <el-input-number
                                  v-model="spacingProps.paddingRight"
                                  size="mini"
                                  :min="0"
                                  @change="updateSpacing"
                                />
                              </div>
                              <el-input-number
                                v-model="spacingProps.paddingBottom"
                                size="mini"
                                :min="0"
                                @change="updateSpacing"
                              />
                            </div>
                          </div>
                          <el-input-number
                            v-model="spacingProps.marginRight"
                            size="mini"
                            :min="0"
                            @change="updateSpacing"
                          />
                        </div>
                        <el-input-number
                          v-model="spacingProps.marginBottom"
                          size="mini"
                          :min="0"
                          @change="updateSpacing"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>

              <el-collapse-item title="阴影效果" name="shadow">
                <el-form-item label="阴影类型">
                  <el-select
                    v-model="styleProps.shadowType"
                    @change="updateShadowStyle"
                  >
                    <el-option label="无阴影" value="none" />
                    <el-option label="轻微阴影" value="light" />
                    <el-option label="中等阴影" value="medium" />
                    <el-option label="深度阴影" value="heavy" />
                    <el-option label="自定义" value="custom" />
                  </el-select>
                </el-form-item>
                
                <div v-if="styleProps.shadowType === 'custom'" class="custom-shadow">
                  <el-row :gutter="8">
                    <el-col :span="6">
                      <el-form-item label="X偏移">
                        <el-input-number
                          v-model="styleProps.shadowX"
                          size="mini"
                          @change="updateShadowStyle"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="Y偏移">
                        <el-input-number
                          v-model="styleProps.shadowY"
                          size="mini"
                          @change="updateShadowStyle"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="模糊">
                        <el-input-number
                          v-model="styleProps.shadowBlur"
                          :min="0"
                          size="mini"
                          @change="updateShadowStyle"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="扩散">
                        <el-input-number
                          v-model="styleProps.shadowSpread"
                          size="mini"
                          @change="updateShadowStyle"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="阴影颜色">
                    <el-color-picker
                      v-model="styleProps.shadowColor"
                      @change="updateShadowStyle"
                    />
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </div>

        <!-- 事件配置 -->
        <div class="property-section">
          <div class="section-header">
            <h4>
              <i class="el-icon-lightning" />
              事件配置
            </h4>
          </div>
          
          <div class="events-editor">
            <div
              v-for="(event, index) in componentEvents"
              :key="index"
              class="event-item"
            >
              <el-select
                v-model="event.type"
                placeholder="事件类型"
                size="small"
                style="width: 100px"
              >
                <el-option label="点击" value="click" />
                <el-option label="双击" value="dblclick" />
                <el-option label="鼠标进入" value="mouseenter" />
                <el-option label="鼠标离开" value="mouseleave" />
                <el-option label="焦点获得" value="focus" />
                <el-option label="焦点失去" value="blur" />
                <el-option label="值改变" value="change" />
                <el-option label="输入" value="input" />
              </el-select>
              
              <el-select
                v-model="event.action"
                placeholder="执行动作"
                size="small"
                style="width: 120px"
              >
                <el-option label="显示消息" value="showMessage" />
                <el-option label="跳转页面" value="navigateTo" />
                <el-option label="调用API" value="callAPI" />
                <el-option label="更新数据" value="updateData" />
                <el-option label="自定义函数" value="customFunction" />
              </el-select>
              
              <el-input
                v-model="event.params"
                placeholder="参数"
                size="small"
                style="width: 120px"
              />
              
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="removeEvent(index)"
              />
            </div>
            
            <el-button
              size="small"
              type="dashed"
              icon="el-icon-plus"
              @click="addEvent"
            >
              添加事件
            </el-button>
          </div>
        </div>

        <!-- 数据绑定 -->
        <div class="property-section">
          <div class="section-header">
            <h4>
              <i class="el-icon-connection" />
              数据绑定
            </h4>
          </div>
          
          <el-form label-width="80px" size="small">
            <el-form-item label="数据源">
              <el-select
                v-model="dataBinding.source"
                placeholder="选择数据源"
                @change="updateDataBinding"
              >
                <el-option
                  v-for="entity in availableEntities"
                  :key="entity.id"
                  :label="entity.displayName"
                  :value="entity.name"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item v-if="dataBinding.source" label="绑定字段">
              <el-select
                v-model="dataBinding.field"
                placeholder="选择字段"
                @change="updateDataBinding"
              >
                <el-option
                  v-for="field in getEntityFields(dataBinding.source)"
                  :key="field.name"
                  :label="field.displayName"
                  :value="field.name"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="绑定类型">
              <el-radio-group
                v-model="dataBinding.type"
                @change="updateDataBinding"
              >
                <el-radio label="display">显示</el-radio>
                <el-radio label="edit">编辑</el-radio>
                <el-radio label="filter">筛选</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>

        <!-- 响应式配置 -->
        <div class="property-section">
          <div class="section-header">
            <h4>
              <i class="el-icon-mobile" />
              响应式配置
            </h4>
          </div>
          
          <el-form label-width="80px" size="small">
            <el-form-item label="桌面端">
              <el-checkbox-group v-model="responsiveProps.desktop">
                <el-checkbox label="visible">显示</el-checkbox>
                <el-checkbox label="fullWidth">全宽</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="平板端">
              <el-checkbox-group v-model="responsiveProps.tablet">
                <el-checkbox label="visible">显示</el-checkbox>
                <el-checkbox label="fullWidth">全宽</el-checkbox>
                <el-checkbox label="stackVertical">垂直堆叠</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="手机端">
              <el-checkbox-group v-model="responsiveProps.mobile">
                <el-checkbox label="visible">显示</el-checkbox>
                <el-checkbox label="fullWidth">全宽</el-checkbox>
                <el-checkbox label="stackVertical">垂直堆叠</el-checkbox>
                <el-checkbox label="hiddenOnMobile">移动端隐藏</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props
interface Props {
  selectedComponent?: any
  availableEntities?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedComponent: null,
  availableEntities: () => []
})

// 响应式数据
const activeStyleSections = ref(['font'])

// 组件属性
const componentProps = ref({})
const layoutProps = ref({
  x: 0,
  y: 0,
  width: 'auto',
  height: 'auto',
  position: 'absolute',
  zIndex: 1
})

// 样式属性
const styleProps = ref({
  fontSize: '14px',
  fontWeight: 'normal',
  color: '#303133',
  textAlign: 'left',
  backgroundColor: 'transparent',
  backgroundImage: '',
  borderWidth: 0,
  borderStyle: 'solid',
  borderColor: '#dcdfe6',
  borderRadius: 0,
  shadowType: 'none',
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 0,
  shadowSpread: 0,
  shadowColor: 'rgba(0, 0, 0, 0.1)'
})

// 间距属性
const spacingProps = ref({
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0
})

// 事件配置
const componentEvents = ref([])

// 数据绑定
const dataBinding = ref({
  source: '',
  field: '',
  type: 'display'
})

// 响应式配置
const responsiveProps = ref({
  desktop: ['visible'],
  tablet: ['visible'],
  mobile: ['visible']
})

// 可用图标
const availableIcons = ref([
  { label: '编辑', value: 'el-icon-edit' },
  { label: '删除', value: 'el-icon-delete' },
  { label: '搜索', value: 'el-icon-search' },
  { label: '用户', value: 'el-icon-user' },
  { label: '设置', value: 'el-icon-setting' },
  { label: '文档', value: 'el-icon-document' },
  { label: '位置', value: 'el-icon-location' },
  { label: '时间', value: 'el-icon-time' },
  { label: '警告', value: 'el-icon-warning' },
  { label: '成功', value: 'el-icon-check' }
])

// 计算属性
const componentPropConfigs = computed(() => {
  if (!props.selectedComponent) return {}
  
  // 根据组件类型返回属性配置
  const configs = getComponentPropConfigs(props.selectedComponent.type)
  return configs
})

// 监听选中组件变化
watch(
  () => props.selectedComponent,
  (newComponent) => {
    if (newComponent) {
      loadComponentProperties(newComponent)
    } else {
      resetProperties()
    }
  },
  { immediate: true }
)

// 方法
const loadComponentProperties = (component) => {
  // 加载组件属性
  componentProps.value = { ...component.props, name: component.name, id: component.id }
  
  // 加载布局属性
  layoutProps.value = {
    x: parseInt(component.style.left) || 0,
    y: parseInt(component.style.top) || 0,
    width: component.style.width || 'auto',
    height: component.style.height || 'auto',
    position: component.style.position || 'absolute',
    zIndex: parseInt(component.style.zIndex) || 1
  }
  
  // 加载样式属性
  loadStyleProperties(component)
  
  // 加载事件配置
  componentEvents.value = component.events || []
  
  // 加载数据绑定
  dataBinding.value = component.dataBinding || { source: '', field: '', type: 'display' }
  
  // 加载响应式配置
  responsiveProps.value = component.responsive || {
    desktop: ['visible'],
    tablet: ['visible'],
    mobile: ['visible']
  }
}

const loadStyleProperties = (component) => {
  const style = component.computedStyle || {}
  
  styleProps.value = {
    fontSize: style.fontSize || '14px',
    fontWeight: style.fontWeight || 'normal',
    color: style.color || '#303133',
    textAlign: style.textAlign || 'left',
    backgroundColor: style.backgroundColor || 'transparent',
    backgroundImage: style.backgroundImage || '',
    borderWidth: parseInt(style.borderWidth) || 0,
    borderStyle: style.borderStyle || 'solid',
    borderColor: style.borderColor || '#dcdfe6',
    borderRadius: parseInt(style.borderRadius) || 0,
    shadowType: getShadowType(style.boxShadow),
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowSpread: 0,
    shadowColor: 'rgba(0, 0, 0, 0.1)'
  }
  
  // 加载间距属性
  spacingProps.value = {
    marginTop: parseInt(style.marginTop) || 0,
    marginRight: parseInt(style.marginRight) || 0,
    marginBottom: parseInt(style.marginBottom) || 0,
    marginLeft: parseInt(style.marginLeft) || 0,
    paddingTop: parseInt(style.paddingTop) || 0,
    paddingRight: parseInt(style.paddingRight) || 0,
    paddingBottom: parseInt(style.paddingBottom) || 0,
    paddingLeft: parseInt(style.paddingLeft) || 0
  }
}

const resetProperties = () => {
  componentProps.value = {}
  layoutProps.value = { x: 0, y: 0, width: 'auto', height: 'auto', position: 'absolute', zIndex: 1 }
  styleProps.value = {
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#303133',
    textAlign: 'left',
    backgroundColor: 'transparent',
    backgroundImage: '',
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: '#dcdfe6',
    borderRadius: 0,
    shadowType: 'none'
  }
  spacingProps.value = {
    marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
    paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0
  }
  componentEvents.value = []
  dataBinding.value = { source: '', field: '', type: 'display' }
  responsiveProps.value = {
    desktop: ['visible'],
    tablet: ['visible'],
    mobile: ['visible']
  }
}

const updateComponentProperty = (key, value) => {
  if (props.selectedComponent) {
    props.selectedComponent.props[key] = value
    emit('property-changed', {
      componentId: props.selectedComponent.id,
      property: key,
      value: value
    })
  }
}

const updateLayout = () => {
  if (props.selectedComponent) {
    props.selectedComponent.style = {
      ...props.selectedComponent.style,
      left: `${layoutProps.value.x}px`,
      top: `${layoutProps.value.y}px`,
      width: layoutProps.value.width,
      height: layoutProps.value.height,
      position: layoutProps.value.position,
      zIndex: layoutProps.value.zIndex
    }
    
    emit('layout-changed', {
      componentId: props.selectedComponent.id,
      layout: layoutProps.value
    })
  }
}

const updateStyleProperty = (property, value) => {
  if (props.selectedComponent) {
    if (!props.selectedComponent.computedStyle) {
      props.selectedComponent.computedStyle = {}
    }
    
    props.selectedComponent.computedStyle[property] = value
    
    emit('style-changed', {
      componentId: props.selectedComponent.id,
      property: property,
      value: value
    })
  }
}

const updateBorderStyle = () => {
  const border = `${styleProps.value.borderWidth}px ${styleProps.value.borderStyle} ${styleProps.value.borderColor}`
  updateStyleProperty('border', border)
}

const updateSpacing = () => {
  const margin = `${spacingProps.value.marginTop}px ${spacingProps.value.marginRight}px ${spacingProps.value.marginBottom}px ${spacingProps.value.marginLeft}px`
  const padding = `${spacingProps.value.paddingTop}px ${spacingProps.value.paddingRight}px ${spacingProps.value.paddingBottom}px ${spacingProps.value.paddingLeft}px`
  
  updateStyleProperty('margin', margin)
  updateStyleProperty('padding', padding)
}

const updateShadowStyle = () => {
  let boxShadow = 'none'
  
  switch (styleProps.value.shadowType) {
    case 'light':
      boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
      break
    case 'medium':
      boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
      break
    case 'heavy':
      boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)'
      break
    case 'custom':
      boxShadow = `${styleProps.value.shadowX}px ${styleProps.value.shadowY}px ${styleProps.value.shadowBlur}px ${styleProps.value.shadowSpread}px ${styleProps.value.shadowColor}`
      break
  }
  
  updateStyleProperty('boxShadow', boxShadow)
}

const getShadowType = (boxShadow) => {
  if (!boxShadow || boxShadow === 'none') return 'none'
  
  const predefinedShadows = {
    '0 2px 4px rgba(0, 0, 0, 0.1)': 'light',
    '0 4px 8px rgba(0, 0, 0, 0.15)': 'medium',
    '0 8px 16px rgba(0, 0, 0, 0.2)': 'heavy'
  }
  
  return predefinedShadows[boxShadow] || 'custom'
}

const addEvent = () => {
  componentEvents.value.push({
    type: 'click',
    action: 'showMessage',
    params: ''
  })
}

const removeEvent = (index) => {
  componentEvents.value.splice(index, 1)
}

const updateDataBinding = () => {
  if (props.selectedComponent) {
    props.selectedComponent.dataBinding = { ...dataBinding.value }
    
    emit('data-binding-changed', {
      componentId: props.selectedComponent.id,
      dataBinding: dataBinding.value
    })
  }
}

const getEntityFields = (entityName) => {
  const entity = props.availableEntities?.find(e => e.name === entityName)
  return entity?.fields || []
}

const getComponentPropConfigs = (componentType) => {
  // 根据组件类型返回属性配置
  const configMap = {
    'el-button': {
      text: { type: 'string', label: '按钮文字', placeholder: '按钮' },
      type: { type: 'select', label: '按钮类型', options: ['primary', 'success', 'warning', 'danger', 'info', 'text'] },
      size: { type: 'select', label: '按钮大小', options: ['large', 'default', 'small'] },
      disabled: { type: 'boolean', label: '禁用状态' },
      loading: { type: 'boolean', label: '加载状态' },
      icon: { type: 'icon', label: '图标' }
    },
    'el-input': {
      placeholder: { type: 'string', label: '占位文本', placeholder: '请输入内容' },
      type: { type: 'select', label: '输入类型', options: ['text', 'password', 'email', 'number'] },
      clearable: { type: 'boolean', label: '可清空' },
      disabled: { type: 'boolean', label: '禁用状态' },
      readonly: { type: 'boolean', label: '只读状态' },
      maxlength: { type: 'number', label: '最大长度' }
    },
    'el-select': {
      placeholder: { type: 'string', label: '占位文本', placeholder: '请选择' },
      multiple: { type: 'boolean', label: '多选模式' },
      clearable: { type: 'boolean', label: '可清空' },
      filterable: { type: 'boolean', label: '可筛选' },
      options: { type: 'array', label: '选项数据' }
    },
    'el-table': {
      stripe: { type: 'boolean', label: '斑马纹' },
      border: { type: 'boolean', label: '边框' },
      showHeader: { type: 'boolean', label: '显示表头' },
      highlightCurrentRow: { type: 'boolean', label: '高亮当前行' },
      size: { type: 'select', label: '表格大小', options: ['large', 'default', 'small'] }
    }
  }
  
  return configMap[componentType] || {}
}

const addArrayItem = (propKey) => {
  if (!componentProps.value[propKey]) {
    componentProps.value[propKey] = []
  }
  
  componentProps.value[propKey].push({
    label: `选项${componentProps.value[propKey].length + 1}`,
    value: `option${componentProps.value[propKey].length + 1}`
  })
  
  updateComponentProperty(propKey, componentProps.value[propKey])
}

const removeArrayItem = (propKey, index) => {
  componentProps.value[propKey].splice(index, 1)
  updateComponentProperty(propKey, componentProps.value[propKey])
}

// Emits
const emit = defineEmits<{
  'property-changed': [data: any]
  'layout-changed': [data: any]
  'style-changed': [data: any]
  'data-binding-changed': [data: any]
}>()
</script>

<style scoped>
.component-property-panel {
  width: 320px;
  height: 100%;
  border-left: 1px solid var(--el-border-color-lighter);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.component-info {
  display: flex;
  align-items: center;
}

/* 无选中状态样式 */
.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.no-selection-content {
  text-align: center;
  color: var(--el-text-color-secondary);
}

.no-selection-content i {
  font-size: 48px;
  color: var(--el-border-color);
  margin-bottom: 16px;
}

.no-selection-content h4 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.no-selection-content p {
  margin: 0;
  font-size: 14px;
}

/* 属性配置样式 */
.property-configuration {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.property-section {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 16px;
}

.property-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-header {
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.property-item {
  margin-bottom: 8px;
}

/* 数组编辑器样式 */
.array-editor {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 8px;
}

.array-item {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  align-items: center;
}

.array-item:last-child {
  margin-bottom: 0;
}

/* 对象编辑器样式 */
.object-editor {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
}

/* 间距编辑器样式 */
.spacing-editor {
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}

.spacing-visual {
  display: flex;
  justify-content: center;
}

.margin-area {
  border: 2px dashed var(--el-color-warning);
  padding: 8px;
  position: relative;
  background: var(--el-color-warning-light-9);
}

.margin-label {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 10px;
  color: var(--el-color-warning);
  font-weight: bold;
}

.margin-inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.margin-sides {
  display: flex;
  align-items: center;
  gap: 4px;
}

.padding-area {
  border: 2px dashed var(--el-color-success);
  padding: 8px;
  position: relative;
  background: var(--el-color-success-light-9);
}

.padding-label {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 10px;
  color: var(--el-color-success);
  font-weight: bold;
}

.padding-inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.padding-sides {
  display: flex;
  align-items: center;
  gap: 4px;
}

.content-area {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
}

/* 事件编辑器样式 */
.events-editor {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 8px;
}

.event-item {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  align-items: center;
}

.event-item:last-child {
  margin-bottom: 0;
}

/* 自定义阴影样式 */
.custom-shadow {
  margin-top: 8px;
  padding: 8px;
  background: var(--el-bg-color-page);
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .component-property-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .component-property-panel {
    width: 100%;
    height: 400px;
    border-left: none;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>

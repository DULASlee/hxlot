<template>
  <div class="form-linkage-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>🔗 SmartFormBuilder 联动演示</h2>
          <el-tag type="success">
            企业级动态表单
          </el-tag>
        </div>
      </template>

      <el-tabs
        v-model="activeTab"
        type="border-card"
      >
        <!-- Tab 1: 条件显示/隐藏 -->
        <el-tab-pane
          label="📋 条件显示/隐藏"
          name="conditional"
        >
          <div class="demo-section">
            <h3>场景：根据用户类型显示不同字段</h3>
            <p>当选择"企业用户"时，显示公司名称和税号；选择"个人用户"时，显示身份证号</p>
            
            <el-divider />
            
            <SmartFormBuilder
              ref="conditionalFormRef"
              v-model="conditionalData"
              :rules="conditionalRules"
              :linkage-rules="conditionalLinkageRules"
              @submit="handleConditionalSubmit"
            />
            
            <el-divider />
            
            <el-card class="result-card">
              <template #header>
                表单数据
              </template>
              <pre>{{ JSON.stringify(conditionalData, null, 2) }}</pre>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- Tab 2: 级联选择 -->
        <el-tab-pane
          label="🌏 级联选择"
          name="cascade"
        >
          <div class="demo-section">
            <h3>场景：省市区三级联动</h3>
            <p>选择省份后自动加载城市，选择城市后自动加载区县</p>
            
            <el-divider />
            
            <SmartFormBuilder
              ref="cascadeFormRef"
              v-model="cascadeData"
              :rules="cascadeRules"
              :cascade-configs="cascadeConfigs"
              @submit="handleCascadeSubmit"
            />
            
            <el-divider />
            
            <el-card class="result-card">
              <template #header>
                表单数据
              </template>
              <pre>{{ JSON.stringify(cascadeData, null, 2) }}</pre>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- Tab 3: 动态字段 -->
        <el-tab-pane
          label="⚡ 动态字段"
          name="dynamic"
        >
          <div class="demo-section">
            <h3>场景：根据产品类型动态添加字段</h3>
            <p>选择"软件产品"时添加许可证字段，选择"硬件产品"时添加序列号字段</p>
            
            <el-divider />
            
            <SmartFormBuilder
              ref="dynamicFormRef"
              v-model="dynamicData"
              :rules="dynamicRules"
              :dynamic-field-configs="dynamicFieldConfigs"
              @submit="handleDynamicSubmit"
            />
            
            <el-divider />
            
            <el-card class="result-card">
              <template #header>
                表单数据
              </template>
              <pre>{{ JSON.stringify(dynamicData, null, 2) }}</pre>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- Tab 4: 计算字段 -->
        <el-tab-pane
          label="🧮 计算字段"
          name="calculated"
        >
          <div class="demo-section">
            <h3>场景：订单总价自动计算</h3>
            <p>输入数量和单价后，自动计算总价 = 数量 × 单价</p>
            
            <el-divider />
            
            <SmartFormBuilder
              ref="calculatedFormRef"
              v-model="calculatedData"
              :rules="calculatedRules"
              :calculated-field-configs="calculatedFieldConfigs"
              @submit="handleCalculatedSubmit"
            />
            
            <el-divider />
            
            <el-card class="result-card">
              <template #header>
                表单数据
              </template>
              <pre>{{ JSON.stringify(calculatedData, null, 2) }}</pre>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- Tab 5: Builder API -->
        <el-tab-pane
          label="🔧 Builder API"
          name="builder"
        >
          <div class="demo-section">
            <h3>使用LinkageRuleBuilder快速构建联动规则</h3>
            
            <el-divider />
            
            <el-card>
              <template #header>
                示例代码
              </template>
              <pre class="code-block">{{ builderExample }}</pre>
            </el-card>
            
            <el-divider />
            
            <h3>实时测试</h3>
            <SmartFormBuilder
              ref="builderFormRef"
              v-model="builderData"
              :rules="builderRules"
              :linkage-rules="builderLinkageRules"
            />
            
            <el-divider />
            
            <el-card class="result-card">
              <template #header>
                表单数据
              </template>
              <pre>{{ JSON.stringify(builderData, null, 2) }}</pre>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- Tab 6: 模板库 -->
        <el-tab-pane
          label="📚 模板库"
          name="templates"
        >
          <div class="demo-section">
            <h3>LINKAGE_TEMPLATES 预定义模板</h3>
            <p>开箱即用的常用联动模板</p>
            
            <el-divider />
            
            <el-space wrap>
              <el-tag
                type="info"
                size="large"
              >
                条件显示模板
              </el-tag>
              <el-tag
                type="success"
                size="large"
              >
                省市区三级联动
              </el-tag>
              <el-tag
                type="warning"
                size="large"
              >
                价格计算模板
              </el-tag>
              <el-tag
                type="danger"
                size="large"
              >
                表单类型切换
              </el-tag>
            </el-space>
            
            <el-divider />
            
            <el-card>
              <template #header>
                模板示例代码
              </template>
              <pre class="code-block">{{ templatesExample }}</pre>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SmartFormBuilder, LinkageRuleBuilder, LINKAGE_TEMPLATES, type LinkageRule, type CascadeConfig, type DynamicFieldConfig, type CalculatedFieldConfig } from '@smartabp/lowcode-core'
import { ElMessage } from 'element-plus'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 响应式数据
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const activeTab = ref('conditional')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tab 1: 条件显示/隐藏
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const conditionalFormRef = ref()
const conditionalData = ref({})

const conditionalRules = [
  {
    type: 'select',
    field: 'userType',
    title: '用户类型',
    value: '',
    options: [
      { label: '企业用户', value: 'company' },
      { label: '个人用户', value: 'personal' }
    ],
    props: {
      placeholder: '请选择用户类型'
    }
  },
  {
    type: 'input',
    field: 'companyName',
    title: '公司名称',
    value: '',
    props: {
      placeholder: '请输入公司名称'
    }
  },
  {
    type: 'input',
    field: 'taxNumber',
    title: '税号',
    value: '',
    props: {
      placeholder: '请输入税号'
    }
  },
  {
    type: 'input',
    field: 'idNumber',
    title: '身份证号',
    value: '',
    props: {
      placeholder: '请输入身份证号'
    }
  }
]

const conditionalLinkageRules: LinkageRule[] = [
  {
    id: 'show_company_fields',
    name: '显示企业字段',
    conditions: [
      {
        type: 'equals',
        sourceField: 'userType',
        value: 'company'
      }
    ],
    actions: [
      { type: 'show', targetField: 'companyName' },
      { type: 'show', targetField: 'taxNumber' },
      { type: 'hide', targetField: 'idNumber' }
    ],
    enabled: true,
    priority: 100
  },
  {
    id: 'show_personal_fields',
    name: '显示个人字段',
    conditions: [
      {
        type: 'equals',
        sourceField: 'userType',
        value: 'personal'
      }
    ],
    actions: [
      { type: 'hide', targetField: 'companyName' },
      { type: 'hide', targetField: 'taxNumber' },
      { type: 'show', targetField: 'idNumber' }
    ],
    enabled: true,
    priority: 100
  }
]

const handleConditionalSubmit = (data: any) => {
  ElMessage.success('提交成功！')
  console.log('Conditional Form Data:', data)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tab 2: 级联选择
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const cascadeFormRef = ref()
const cascadeData = ref({})

const cascadeRules = [
  {
    type: 'select',
    field: 'province',
    title: '省份',
    value: '',
    options: [
      { label: '广东省', value: 'guangdong' },
      { label: '浙江省', value: 'zhejiang' },
      { label: '江苏省', value: 'jiangsu' }
    ],
    props: {
      placeholder: '请选择省份'
    }
  },
  {
    type: 'select',
    field: 'city',
    title: '城市',
    value: '',
    options: [],
    props: {
      placeholder: '请先选择省份'
    }
  },
  {
    type: 'select',
    field: 'district',
    title: '区县',
    value: '',
    options: [],
    props: {
      placeholder: '请先选择城市'
    }
  }
]

const cascadeConfigs: CascadeConfig[] = [
  {
    id: 'province_city',
    parentField: 'province',
    childField: 'city',
    options: [
      {
        value: 'guangdong',
        label: '广东省',
        children: [
          { value: 'guangzhou', label: '广州市' },
          { value: 'shenzhen', label: '深圳市' },
          { value: 'dongguan', label: '东莞市' }
        ]
      },
      {
        value: 'zhejiang',
        label: '浙江省',
        children: [
          { value: 'hangzhou', label: '杭州市' },
          { value: 'ningbo', label: '宁波市' }
        ]
      },
      {
        value: 'jiangsu',
        label: '江苏省',
        children: [
          { value: 'nanjing', label: '南京市' },
          { value: 'suzhou', label: '苏州市' }
        ]
      }
    ]
  },
  {
    id: 'city_district',
    parentField: 'city',
    childField: 'district',
    options: [
      {
        value: 'guangzhou',
        label: '广州市',
        children: [
          { value: 'tianhe', label: '天河区' },
          { value: 'haizhu', label: '海珠区' }
        ]
      },
      {
        value: 'shenzhen',
        label: '深圳市',
        children: [
          { value: 'nanshan', label: '南山区' },
          { value: 'futian', label: '福田区' }
        ]
      }
    ]
  }
]

const handleCascadeSubmit = (data: any) => {
  ElMessage.success('提交成功！')
  console.log('Cascade Form Data:', data)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tab 3: 动态字段
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const dynamicFormRef = ref()
const dynamicData = ref({})

const dynamicRules = [
  {
    type: 'select',
    field: 'productType',
    title: '产品类型',
    value: '',
    options: [
      { label: '软件产品', value: 'software' },
      { label: '硬件产品', value: 'hardware' }
    ],
    props: {
      placeholder: '请选择产品类型'
    }
  },
  {
    type: 'input',
    field: 'productName',
    title: '产品名称',
    value: '',
    props: {
      placeholder: '请输入产品名称'
    }
  }
]

const dynamicFieldConfigs: DynamicFieldConfig[] = [
  {
    triggerField: 'productType',
    triggerValue: 'software',
    fieldsToAdd: [
      {
        type: 'input',
        field: 'licenseKey',
        title: '许可证密钥',
        value: '',
        props: {
          placeholder: '请输入许可证密钥'
        }
      }
    ],
    fieldsToRemove: ['serialNumber']
  },
  {
    triggerField: 'productType',
    triggerValue: 'hardware',
    fieldsToAdd: [
      {
        type: 'input',
        field: 'serialNumber',
        title: '序列号',
        value: '',
        props: {
          placeholder: '请输入序列号'
        }
      }
    ],
    fieldsToRemove: ['licenseKey']
  }
]

const handleDynamicSubmit = (data: any) => {
  ElMessage.success('提交成功！')
  console.log('Dynamic Form Data:', data)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tab 4: 计算字段
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const calculatedFormRef = ref()
const calculatedData = ref({})

const calculatedRules = [
  {
    type: 'inputNumber',
    field: 'quantity',
    title: '数量',
    value: 0,
    props: {
      min: 0,
      precision: 0
    }
  },
  {
    type: 'inputNumber',
    field: 'unitPrice',
    title: '单价（元）',
    value: 0,
    props: {
      min: 0,
      precision: 2
    }
  },
  {
    type: 'inputNumber',
    field: 'totalPrice',
    title: '总价（元）',
    value: 0,
    props: {
      min: 0,
      precision: 2,
      disabled: true
    }
  }
]

const calculatedFieldConfigs: CalculatedFieldConfig[] = [
  {
    targetField: 'totalPrice',
    dependFields: ['quantity', 'unitPrice'],
    calculate: (values) => {
      const quantity = Number(values.quantity) || 0
      const unitPrice = Number(values.unitPrice) || 0
      return Number((quantity * unitPrice).toFixed(2))
    },
    realtime: true
  }
]

const handleCalculatedSubmit = (data: any) => {
  ElMessage.success('提交成功！')
  console.log('Calculated Form Data:', data)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tab 5: Builder API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const builderFormRef = ref()
const builderData = ref({})

const builderRules = [
  {
    type: 'switch',
    field: 'isVip',
    title: '是否VIP用户',
    value: false
  },
  {
    type: 'input',
    field: 'vipCode',
    title: 'VIP码',
    value: '',
    props: {
      placeholder: '请输入VIP码'
    }
  }
]

// 使用LinkageRuleBuilder构建规则
const builderLinkageRules = [
  new LinkageRuleBuilder()
    .setName('VIP字段显示')
    .whenEquals('isVip', true)
    .thenShow('vipCode')
    .build(),
  new LinkageRuleBuilder()
    .setName('VIP字段隐藏')
    .whenEquals('isVip', false)
    .thenHide('vipCode')
    .build()
]

const builderExample = `// 使用LinkageRuleBuilder快速构建联动规则
import { LinkageRuleBuilder } from '@smartabp/lowcode-core'

const rule = new LinkageRuleBuilder()
  .setName('VIP字段显示')
  .whenEquals('isVip', true)
  .thenShow('vipCode')
  .build()

// 支持链式调用
const complexRule = new LinkageRuleBuilder()
  .whenEquals('userType', 'company')
  .whenNotEmpty('companyName')
  .thenShow('taxNumber', 'businessLicense')
  .thenEnable('submitBtn')
  .build()`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tab 6: 模板库
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const templatesExample = `// 1. 条件显示模板
import { LINKAGE_TEMPLATES } from '@smartabp/lowcode-core'

const rule = LINKAGE_TEMPLATES.conditionalDisplay(
  'userType',
  'company',
  ['companyName', 'taxNumber']
)

// 2. 省市区三级联动模板
const cascades = LINKAGE_TEMPLATES.provinceCityDistrict()
// cascades.provinces, cascades.cities

// 3. 价格计算模板
const calcConfig = LINKAGE_TEMPLATES.priceCalculation()

// 4. 表单类型切换模板
const switchRule = LINKAGE_TEMPLATES.formTypeSwitch(
  'formType',
  'advanced',
  ['advancedField1', 'advancedField2'],
  ['basicField1', 'basicField2']
)`
</script>

<style scoped>
.form-linkage-demo {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
}

.demo-section {
  padding: 20px;
}

.demo-section h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #409eff;
}

.demo-section p {
  margin: 0 0 20px 0;
  color: #666;
}

.result-card {
  margin-top: 20px;
}

.result-card pre {
  margin: 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}

.code-block {
  margin: 0;
  padding: 15px;
  background: #282c34;
  color: #abb2bf;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}
</style>


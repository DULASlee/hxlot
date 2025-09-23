<template>
  <div class="module-wizard-view">
    <div class="wizard-header">
      <h1>模块生成向导</h1>
    </div>
    <div class="wizard-steps">
      <div
        v-for="step in stepsOrder"
        :key="step"
        class="step-item"
        :class="{
          active: currentStep === step,
          completed: stepsOrder.indexOf(currentStep) > stepsOrder.indexOf(step),
        }"
      >
        {{ stepMetadata[step].title }}
      </div>
    </div>
    <div class="wizard-body">
      <div v-show="currentStep === 'BASIC_INFO'">
        <h2>{{ stepMetadata["BASIC_INFO"].title }}</h2>
        <el-form :model="formData" label-width="120px">
          <el-form-item label="System Name">
            <el-input v-model="formData.systemName" />
          </el-form-item>
          <el-form-item label="Module Name">
            <el-input v-model="formData.name" />
          </el-form-item>
          <el-form-item label="Display Name">
            <el-input v-model="formData.displayName" />
          </el-form-item>
        </el-form>
      </div>
      <div v-show="currentStep === 'ENTITY_DESIGN'">
        <h2>{{ stepMetadata["ENTITY_DESIGN"].title }}</h2>
        <EntityDesigner
          :initial-entities="formData.entities"
          @update:entities="onEntitiesUpdate"
        />
      </div>
      <div v-show="currentStep === 'PREVIEW'">
        <h2>{{ stepMetadata["PREVIEW"].title }}</h2>
        <el-button type="success" @click="generateModule">Generate</el-button>
      </div>
    </div>
    <div class="wizard-footer">
      <el-button @click="handleBack" :disabled="currentStep === 'BASIC_INFO'">
        Back
      </el-button>
      <el-button
        type="primary"
        @click="handleNext"
        :disabled="currentStep === 'PREVIEW'"
      >
        Next
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton } from "element-plus"
import EntityDesigner from "@smartabp/lowcode-designer/components/CodeGenerator/EntityDesigner.vue"
import { codeGeneratorApi } from "@smartabp/lowcode-api"
import { getErrorMessage } from "@/utils/error-handling"
import type {
  EntityDefinition,
  ModuleMetadata,
} from "@smartabp/lowcode-api/types"

defineOptions({ name: "ModuleWizardView" })

type WizardStep = "BASIC_INFO" | "ENTITY_DESIGN" | "PREVIEW"

interface StepMetadata {
  title: string
  description: string
}

const stepsOrder: WizardStep[] = ["BASIC_INFO", "ENTITY_DESIGN", "PREVIEW"]
const stepMetadata: Record<WizardStep, StepMetadata> = {
  BASIC_INFO: { title: "Basic Info", description: "..." },
  ENTITY_DESIGN: { title: "Entity Design", description: "..." },
  PREVIEW: { title: "Preview & Generate", description: "..." },
}

const currentStep = ref<WizardStep>("BASIC_INFO")
const formData = ref<Partial<ModuleMetadata>>(createInitialMetadata())

function createInitialMetadata(): Partial<ModuleMetadata> {
  return {
    name: "",
    systemName: "",
    displayName: "",
    version: "1.0.0",
    entities: [],
    databaseInfo: {
      connectionStringName: "Default",
      provider: "SqlServer",
    },
    featureManagement: { defaultPolicy: "RequireAuthentication" },
    permissionConfig: { customActions: [] },
  }
}

const onEntitiesUpdate = (newEntities: EntityDefinition[]) => {
  formData.value.entities = newEntities
}

const handleNext = () => {
  const currentIndex = stepsOrder.indexOf(currentStep.value)
  if (currentIndex < stepsOrder.length - 1) {
    currentStep.value = stepsOrder[currentIndex + 1]
  }
}

const handleBack = () => {
  const currentIndex = stepsOrder.indexOf(currentStep.value)
  if (currentIndex > 0) {
    currentStep.value = stepsOrder[currentIndex - 1]
  }
}

const generateModule = async () => {
  try {
    const result = await codeGeneratorApi.generateModule({
      metadata: formData.value as ModuleMetadata,
      options: { framework: "vue", language: "typescript", architecture: "ddd" },
      target: { outputDir: "generated", baseNamespace: "SmartAbp" },
    })
    ElMessage.success(`Module ${result.moduleName} generated!`)
  } catch (err) {
    ElMessage.error(`Generation failed: ${getErrorMessage(err)}`)
  }
}
</script>

<style scoped>
.module-wizard-view {
  padding: 24px;
}
.wizard-steps {
  display: flex;
  margin-bottom: 24px;
}
.step-item {
  padding: 8px 16px;
  border-bottom: 2px solid transparent;
}
.step-item.active {
  border-bottom-color: #409eff;
  color: #409eff;
}
.step-item.completed {
  color: #67c23a;
}
.wizard-footer {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
}
</style>

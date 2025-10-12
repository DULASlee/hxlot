<template>
  <div class="template-configuration">
    <el-card v-if="template">
      <template #header>
        <div class="card-header">
          <span>Configure Template: {{ template.name }}</span>
          <el-button
            type="text"
            @click="$emit('back')"
          >
            Back to Marketplace
          </el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        :disabled="generationPending"
      >
        <!-- Dynamic Placeholders -->
        <el-form-item
          v-for="placeholder in template.placeholders"
          :key="placeholder.name"
          :label="placeholder.name"
          :prop="placeholder.name"
        >
          <el-input
            v-model="formData[placeholder.name]"
            :placeholder="placeholder.description"
          />
        </el-form-item>

        <!-- Output Path -->
        <el-form-item
          label="Output Path"
          prop="outputPath"
          required
        >
          <el-input
            v-model="formData.outputPath"
            placeholder="e.g., src/SmartAbp.Vue/src/views/my-feature"
          >
            <template #prepend>
              /project-root/
            </template>
          </el-input>
        </el-form-item>

        <!-- Action Buttons -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="generationPending"
            @click="generateCode"
          >
            Generate Code
          </el-button>
          <el-button @click="resetForm">
            Reset
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-empty
      v-else
      description="No template selected. Please go back to the marketplace."
    />
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElButton, ElCard, ElEmpty, ElForm, ElFormItem, ElInput } from 'element-plus';
import { reactive, ref, watch } from 'vue';

// --- Interfaces & Props ---
interface Placeholder {
  name: string;
  description: string;
  defaultValue?: string;
  required?: boolean;
}

interface Template {
  id: string;
  name: string;
  placeholders: Placeholder[];
}

const props = defineProps<{
  template: Template | null;
  generationPending: boolean;
}>();

const emit = defineEmits(['generate', 'back']);

// --- Form State ---
const formRef = ref<FormInstance>();
const formData = ref<Record<string, string>>({});
const formRules = reactive<FormRules>({});

// --- Logic ---
const initializeForm = (tpl: Template | null) => {
  if (!tpl) {
    formData.value = {};
    Object.keys(formRules).forEach(key => delete formRules[key]);
    return;
  }

  const newFormData: Record<string, string> = { outputPath: '' };
  const newFormRules: FormRules = {
    outputPath: [{ required: true, message: 'Output path is required', trigger: 'blur' }],
  };

  tpl.placeholders.forEach(p => {
    newFormData[p.name] = p.defaultValue || '';
    if (p.required) {
      newFormRules[p.name] = [{ required: true, message: `${p.name} is required`, trigger: 'blur' }];
    }
  });

  formData.value = newFormData;
  Object.assign(formRules, newFormRules);
};

watch(() => props.template, (newTemplate) => {
  initializeForm(newTemplate);
}, { immediate: true });

const generateCode = async () => {
  if (!formRef.value || !props.template) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      const { outputPath, ...placeholders } = formData.value;
      emit('generate', {
        templateId: props.template!.id,
        outputPath: outputPath,
        placeholders: placeholders,
      });
    } else {
      // Form validation failed
    }
  });
};

const resetForm = () => {
  if (props.generationPending) return; // Do not reset while generating
  initializeForm(props.template);
};
</script>

<style scoped>
.template-configuration {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
}
</style>

<template>
  <div class="template-marketplace">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Templates Marketplace</span>
        </div>
      </template>

      <!-- 简化：移除搜索功能，直接显示模板 -->
      <div class="simple-header">
        <span class="template-count">共 {{ templates.length }} 个模板</span>
      </div>

      <!-- Templates Grid -->
      <el-row
        :gutter="20"
        class="templates-grid"
      >
        <el-col
          v-for="template in templates"
          :key="template.id"
          :span="8"
        >
          <el-card
            class="template-card"
            shadow="hover"
            @click="selectTemplate(template)"
          >
            <div class="template-card-header">
              <span class="template-name">{{ template.name }}</span>
              <el-tag size="small">
                {{ template.version }}
              </el-tag>
            </div>
            <p class="template-description">
              {{ template.description }}
            </p>
            <div class="template-card-footer">
              <el-tag
                v-for="tag in template.tags"
                :key="tag"
                type="info"
                size="small"
                class="template-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty
        v-if="filteredTemplates.length === 0"
        description="No templates found"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElCard, ElRow, ElCol, ElTag, ElEmpty } from 'element-plus';

// Define the structure of a template based on index.json
interface Template {
  id: string;
  version: string;
  name: string;
  description: string;
  tags: string[];
  author: string;
  type: string;
  templatePath: string;
  // Placeholders and relatedTemplates are also available if needed
}

const templates = ref<Template[]>([]);

// --- 简化：移除搜索和过滤功能 ---
// 创业项目模板数量有限，直接展示所有模板更简洁高效
const filteredTemplates = computed(() => templates.value);

// --- 简化的数据获取 ---
onMounted(async () => {
  try {
    const response = await fetch('/templates.json');
    if (!response.ok) {
      throw new Error('Failed to fetch templates index.');
    }
    templates.value = await response.json();
  } catch (error) {
    console.error("Error loading templates:", error);
    // 提供fallback数据
    templates.value = [
      { id: '1', version: '1.0.0', name: 'CRUD模板', description: '标准增删改查模板', tags: ['basic'], author: 'SmartAbp', type: 'frontend', templatePath: '/templates/frontend/crud' },
      { id: '2', version: '1.0.0', name: '表单模板', description: '通用表单模板', tags: ['form'], author: 'SmartAbp', type: 'frontend', templatePath: '/templates/frontend/form' }
    ];
  }
});

const selectTemplate = (template: Template) => {
  console.log("Selected template:", template);
  // Here we would typically emit an event or use a router to navigate
  // to the template configuration view, passing the selected template's data.
  // For now, we just log it to the console.
};
</script>

<style scoped>
.template-marketplace {
  padding: 20px;
}
.card-header {
  font-size: 1.2em;
  font-weight: bold;
}
.filter-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}
.search-input {
  max-width: 300px;
}
.templates-grid {
  margin-top: 20px;
}
.template-card {
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.template-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.template-name {
  font-weight: bold;
}
.template-description {
  font-size: 0.9em;
  color: #606266;
  min-height: 50px; /* Ensure consistent card height */
}
.template-card-footer {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.template-tag {
  text-transform: capitalize;
}
</style>

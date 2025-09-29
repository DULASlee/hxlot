<template>
  <div class="template-marketplace">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Templates Marketplace</span>
        </div>
      </template>

      <!-- Search and Filter -->
      <div class="filter-controls">
        <el-input
          v-model="searchQuery"
          placeholder="Search templates..."
          clearable
          class="search-input"
        />
        <el-radio-group
          v-model="selectedTag"
          @change="filterTemplates"
        >
          <el-radio-button label="all">
            All
          </el-radio-button>
          <el-radio-button
            v-for="tag in availableTags"
            :key="tag"
            :label="tag"
          >
            {{ tag }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Templates Grid -->
      <el-row
        :gutter="20"
        class="templates-grid"
      >
        <el-col
          v-for="template in filteredTemplates"
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
import { ElCard, ElInput, ElRadioGroup, ElRadioButton, ElRow, ElCol, ElTag, ElEmpty } from 'element-plus';

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
const searchQuery = ref('');
const selectedTag = ref('all');

// --- Data Fetching ---
onMounted(async () => {
  try {
    const response = await fetch('/templates.json');
    if (!response.ok) {
      throw new Error('Failed to fetch templates index.');
    }
    templates.value = await response.json();
  } catch (error) {
    console.error("Error loading templates:", error);
  }
});

// --- Computed Properties ---
const availableTags = computed(() => {
  const allTags = new Set<string>();
  templates.value.forEach(t => t.tags.forEach(tag => allTags.add(tag)));
  return Array.from(allTags);
});

const filteredTemplates = computed(() => {
  return templates.value.filter(template => {
    const searchMatch = template.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        template.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const tagMatch = selectedTag.value === 'all' || template.tags.includes(selectedTag.value);
    return searchMatch && tagMatch;
  });
});

// --- Methods ---
const filterTemplates = () => {
  // This method is implicitly handled by the computed property `filteredTemplates`.
  // It can be used for more complex filtering logic if needed in the future.
};

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
